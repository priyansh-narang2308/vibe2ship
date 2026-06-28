/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Brain,
  Search,
  ShieldAlert,
  Zap,
  Clipboard,
  Mail,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  getWebSocketUrl,
  simulateWebSocketStream,
  AgentLog,
  ReportPayload,
} from "../lib/api";

interface AgentStatusPanelProps {
  reportId: string;
  reportPayload: ReportPayload;
  onPipelineComplete: (result: any) => void;
}

const AGENT_ICONS: Record<string, any> = {
  Orchestrator: Activity,
  MemoryAgent: Brain,
  ResearchAgent: Search,
  VerificationAgent: ShieldAlert,
  PredictionAgent: Zap,
  PlannerAgent: Clipboard,
  ExecutionAgent: Mail,
};

const AGENT_COLORS: Record<string, string> = {
  Orchestrator: "text-slate-300 bg-slate-800/80 border-slate-700",
  MemoryAgent: "text-purple-400 bg-purple-950/50 border-purple-800/50",
  ResearchAgent: "text-sky-400 bg-sky-950/50 border-sky-800/50",
  VerificationAgent: "text-emerald-400 bg-emerald-950/50 border-emerald-800/50",
  PredictionAgent: "text-amber-400 bg-amber-950/50 border-amber-800/50",
  PlannerAgent: "text-indigo-400 bg-indigo-950/50 border-indigo-800/50",
  ExecutionAgent: "text-blue-400 bg-blue-950/50 border-blue-800/50",
};

export default function AgentStatusPanel({
  reportId,
  reportPayload,
  onPipelineComplete,
}: AgentStatusPanelProps) {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [mode, setMode] = useState<
    "connecting" | "live" | "simulated" | "complete" | "failed"
  >("connecting");
  const logEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    let active = true;
    let fallbackCleanup: (() => void) | null = null;
    let connectionTimeout: any = null;

    const appendLog = (newLog: AgentLog) => {
      if (active) {
        setLogs((prev) => {
          const isDup = prev.some(
            (l) =>
              l.message === newLog.message &&
              l.agent === newLog.agent &&
              l.event === newLog.event,
          );
          if (isDup) return prev;
          return [...prev, newLog];
        });
      }
    };

    const startLocalSimulation = () => {
      if (!active) return;
      setMode("simulated");
      console.log("Triggering client-side multi-agent simulation...");
      fallbackCleanup = simulateWebSocketStream(
        reportId,
        (log) => appendLog(log),
        (result) => {
          if (active) {
            setMode("complete");
            onPipelineComplete(result);
          }
        },
      );
    };

    const wsUrl = getWebSocketUrl(reportId);
    console.log(`Connecting to agent WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    connectionTimeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN && active) {
        console.warn("WebSocket timed out. Falling back to local simulator.");
        ws.close();
        startLocalSimulation();
      }
    }, 3000);

    ws.onopen = () => {
      clearTimeout(connectionTimeout);
      if (active) {
        setMode("live");
        ws.send(
          JSON.stringify({
            action: "start",
            ...reportPayload,
          }),
        );
      }
    };

    ws.onmessage = (event) => {
      if (!active) return;
      try {
        const data = JSON.parse(event.data) as AgentLog;

        if (data.event === "agent_log" || data.event === "status") {
          appendLog(data);
        } else if (data.event === "pipeline_complete") {
          setMode("complete");
          onPipelineComplete(data.result);
          ws.close();
        } else if (data.event === "pipeline_failed") {
          setMode("failed");
          ws.close();
        }
      } catch (err) {
        console.error("Failed to parse socket message", err);
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
    };

    ws.onclose = () => {
      clearTimeout(connectionTimeout);
      if (active && mode === "connecting") {
        startLocalSimulation();
      }
    };

    return () => {
      active = false;
      clearTimeout(connectionTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (fallbackCleanup) {
        fallbackCleanup();
      }
    };
  }, [reportId, reportPayload]);

  return (
    <div className="flex flex-col h-[420px] rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden shadow-2xl relative">
      {/* Background terminal overlay glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 blur-[50px] pointer-events-none" />

      {/* Header Panel */}
      <div className="flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-6 py-4 border-b border-slate-900/60 z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            {mode === "complete" ? (
              <span className="h-full w-full rounded-full bg-emerald-500 shadow-glow-success" />
            ) : mode === "failed" ? (
              <span className="h-full w-full rounded-full bg-rose-500 shadow-glow-error" />
            ) : (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500" />
              </>
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 select-none">
            {mode === "connecting" && "Establishing agent connection..."}
            {mode === "live" && (
              <>
                Autonomous Agent Stream{" "}
                <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse" />
              </>
            )}
            {mode === "simulated" && "Autonomous Agent Stream (Simulated)"}
            {mode === "complete" && "Agent Cycle Completed"}
            {mode === "failed" && "Agent Cycle Aborted"}
          </span>
        </div>

        {mode !== "complete" && mode !== "failed" && (
          <Loader2 className="h-4.5 w-4.5 animate-spin text-slate-500" />
        )}
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 font-mono text-xs z-10">
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
            <Loader2 className="h-6 w-6 animate-spin text-slate-700" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-600">
              Awaiting node response...
            </span>
          </div>
        )}

        {logs.map((log, idx) => {
          const AgentIcon = log.agent
            ? AGENT_ICONS[log.agent] || Activity
            : Activity;
          const agentColor = log.agent
            ? AGENT_COLORS[log.agent] || "text-slate-400"
            : "text-slate-400";

          return (
            <div
              key={idx}
              className="flex items-start gap-4 border-l border-slate-800 pl-5 py-0.5 relative transition-all duration-300 animate-fadeIn"
            >
              {/* Outer status bullet */}
              <span
                className={`absolute left-[-4.5px] top-2 h-2 w-2 rounded-full bg-slate-950 border ${
                  log.status === "SUCCESS"
                    ? "border-emerald-500 bg-emerald-500 shadow-glow-success"
                    : log.status === "WARNING"
                      ? "border-amber-500 bg-amber-500"
                      : log.status === "ERROR"
                        ? "border-rose-500 bg-rose-500 shadow-glow-error"
                        : "border-slate-700"
                }`}
              />

              {/* Agent Specific Icon */}
              {log.agent && (
                <div
                  className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-transform duration-200 hover:scale-105 ${agentColor}`}
                >
                  <AgentIcon className="h-4.5 w-4.5" />
                </div>
              )}

              {/* Message Content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-[9px] font-semibold text-slate-500">
                  <span className="font-extrabold uppercase tracking-widest text-slate-400">
                    {log.agent || "System Monitor"}
                  </span>
                  <span className="text-slate-600">
                    {log.timestamp
                      ? new Date(log.timestamp).toLocaleTimeString()
                      : ""}
                  </span>
                </div>

                <p
                  className={`text-[11px] leading-relaxed font-semibold ${
                    log.status === "SUCCESS"
                      ? "text-emerald-400"
                      : log.status === "WARNING"
                        ? "text-amber-300"
                        : log.status === "ERROR"
                          ? "text-rose-400"
                          : "text-slate-300"
                  }`}
                >
                  {log.message}
                </p>
              </div>

              {/* Status Icons */}
              <div className="shrink-0 mt-1">
                {log.status === "SUCCESS" && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                )}
                {log.status === "WARNING" && (
                  <AlertTriangle className="h-4 w-4 text-amber-300" />
                )}
                {log.status === "ERROR" && (
                  <XCircle className="h-4 w-4 text-rose-400" />
                )}
              </div>
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
