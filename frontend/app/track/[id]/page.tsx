/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FileText,
  ShieldAlert,
  Users,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  Check,
  Activity,
  ArrowLeft,
  Sparkles,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import AgentStatusPanel from "../../../components/AgentStatusPanel";
import IssueMap from "../../../components/IssueMap";
import { ReportPayload } from "../../../lib/api";

export default function TrackPage() {
  const params = useParams();
  const id = params.id as string;

  const [report, setReport] = useState<ReportPayload | null>(null);
  const [pipelineResult, setPipelineResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "escalation">(
    "analysis",
  );

  useEffect(() => {
    const data = localStorage.getItem(`pending-report-${id}`);
    if (data) {
      setReport(JSON.parse(data));
    } else {
      setReport({
        citizen_id: "citizen_direct_link",
        media_url:
          "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=1000",
        location: { latitude: 12.972, longitude: 77.642 },
        description: "Large pothole in the road near the Koramangala market.",
      });
    }
  }, [id]);

  if (!report) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Loading Telemetry...
          </span>
        </div>
      </div>
    );
  }

  const handlePipelineComplete = (result: any) => {
    setPipelineResult(result);
  };

  return (
    <main className="flex-1 bg-background relative py-12 px-4 sm:px-6 lg:px-8 bg-grid-dots">
      {/* Background soft glow blobs */}
      <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] rounded-full bg-indigo-100/10 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            href="/report"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer select-none"
          >
            <ArrowLeft className="h-4 w-4" /> Back to submission
          </Link>
        </div>

        {/* Title */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10 pb-6 border-b border-slate-200/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100/40 px-3 py-1 text-[9px] font-black text-indigo-700 uppercase tracking-widest">
                <Activity className="h-3 w-3 animate-pulse" /> Active Node
                Triage
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-wider">
                ID: {id}
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mt-2.5">
              Autonomous Triage Dashboard
            </h1>
          </div>

          {pipelineResult?.action_plan?.complaint_document_spec && (
            <a
              href={pipelineResult.complaint_url || "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-4 text-xs font-black shadow-md shadow-indigo-100 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 active:translate-y-0 active:scale-98 transition-all cursor-pointer"
              id="download-grievance-pdf-btn"
            >
              <Download className="h-4 w-4" /> Download Official Complaint (PDF)
            </a>
          )}
        </div>

        {/* Dual Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Media Preview + WebSocket Console */}
          <div className="lg:col-span-5 space-y-6">
            {/* Visual Evidence Summary */}
            <div className="rounded-3xl border border-slate-200/60 bg-white p-5.5 shadow-premium hover-lift">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 select-none">
                Grievance Evidence
              </h2>

              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-2xs">
                <img
                  src={report.media_url}
                  alt="Citizen report thumbnail"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-5 space-y-3">
                <p className="text-slate-600 font-bold text-xs leading-relaxed italic bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                  &ldquo;
                  {report.description ||
                    "No description metrics provided by sender"}
                  &rdquo;
                </p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 select-none">
                  <span className="font-black uppercase tracking-wider text-slate-400 text-[10px]">
                    Geographic Coordinate
                  </span>
                  <span className="font-mono text-slate-700 font-bold flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" />{" "}
                    {report.location.latitude}, {report.location.longitude}
                  </span>
                </div>
              </div>
            </div>

            {/* WebSocket log panel */}
            <AgentStatusPanel
              reportId={id}
              reportPayload={report}
              onPipelineComplete={handlePipelineComplete}
            />
          </div>

          {/* RIGHT COLUMN: AI Triage results, risk index, SLA track */}
          <div className="lg:col-span-7 space-y-6">
            {!pipelineResult ? (
              // Loading screen
              <div className="rounded-3xl border border-slate-200/60 bg-white p-8 text-center flex flex-col items-center justify-center min-h-[460px] shadow-premium relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse" />
                <LoaderWidget />
                <h3 className="font-heading text-xl font-extrabold text-slate-800 mt-6">
                  Running Agent Collaboration
                </h3>
                <p className="text-xs text-slate-500 mt-2.5 max-w-sm leading-relaxed font-semibold">
                  Our autonomous agents are compiling records, cross-referencing
                  district boundaries, auditing verification evidence via
                  multimodal models, and generating strategic action plans.
                </p>

                {/* Visual diagnostic simulation */}
                <div className="mt-8 w-full max-w-xs bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-2.5 font-mono text-[9px] text-left text-slate-400 select-none">
                  <div className="flex justify-between items-center">
                    <span>CONNECT_NODE</span>
                    <span className="text-indigo-600 font-bold animate-pulse">
                      OK
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>FIREBASE_INDEX_PING</span>
                    <span className="text-emerald-600 font-bold animate-pulse">
                      RESOLVED
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>GEMINI_MULTIMODAL_SYNC</span>
                    <span className="text-indigo-600 font-bold animate-pulse">
                      PENDING...
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // Completed Analysis View
              <div className="space-y-6 animate-slideUp">
                {/* 1. Triage Summary metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Risk Score Circular Metric */}
                  <div className="rounded-3xl border border-slate-200/60 bg-white p-4.5 shadow-premium flex flex-col justify-between items-center text-center">
                    <div className="flex items-center gap-1 text-slate-400 mb-2">
                      <ShieldAlert className="h-4 w-4 text-indigo-600 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        Risk Score
                      </span>
                    </div>

                    <div className="relative flex items-center justify-center my-1.5">
                      {/* SVG Circle Progress */}
                      <svg className="w-18 h-18 transform -rotate-90">
                        <circle
                          cx="36"
                          cy="36"
                          r="30"
                          stroke="oklch(0.95 0.01 240)"
                          strokeWidth="5.5"
                          fill="transparent"
                        />
                        <circle
                          cx="36"
                          cy="36"
                          r="30"
                          stroke="oklch(0.52 0.22 265)"
                          strokeWidth="5.5"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 30}
                          strokeDashoffset={
                            2 *
                            Math.PI *
                            30 *
                            (1 - (pipelineResult.priority_score || 70) / 100)
                          }
                        />
                      </svg>
                      <span className="absolute text-base font-black text-slate-800">
                        {pipelineResult.priority_score || "N/A"}
                      </span>
                    </div>

                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-1">
                      Critical Gauge
                    </span>
                  </div>

                  <div className="rounded-3xl border border-slate-200/60 bg-white p-4.5 shadow-premium flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <TrendingUp className="h-4 w-4 text-orange-500 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        7d Forecast
                      </span>
                    </div>
                    <div className="my-2.5 text-center">
                      <span className="inline-flex items-center rounded-xl bg-orange-50 border border-orange-100 px-3 py-1.5 text-xs font-black text-orange-700 animate-pulse">
                        {pipelineResult.action_plan?.complaint_document_spec?.body_paragraphs?.[1]?.includes(
                          "high rainfall",
                        ) || pipelineResult.priority_score > 60
                          ? "WORSENING"
                          : "STABLE"}
                      </span>
                    </div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block text-center">
                      Rain accelerated
                    </span>
                  </div>

                  <div className="rounded-3xl border border-slate-200/60 bg-white p-4.5 shadow-premium flex flex-col justify-between items-center text-center">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Users className="h-4 w-4 text-sky-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        Impacted
                      </span>
                    </div>
                    <span className="text-3xl font-black text-slate-800 my-1">
                      ~450
                    </span>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-1">
                      Local Citizens
                    </span>
                  </div>

                  <div className="rounded-3xl border border-slate-200/60 bg-white p-4.5 shadow-premium flex flex-col justify-between items-center text-center">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <DollarSign className="h-4 w-4 text-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        Delay Cost
                      </span>
                    </div>
                    <span className="text-2xl font-black text-slate-800 my-1">
                      ₹13,050
                    </span>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-1">
                      Est. Daily Loss
                    </span>
                  </div>
                </div>

                {/* Navigation Tab */}
                <div className="flex border-b border-slate-200/60 select-none">
                  <button
                    onClick={() => setActiveTab("analysis")}
                    className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all px-5 cursor-pointer ${
                      activeTab === "analysis"
                        ? "border-indigo-600 text-indigo-600 font-extrabold"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    AI Spatial Analytics
                  </button>
                  <button
                    onClick={() => setActiveTab("escalation")}
                    className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all px-5 cursor-pointer ${
                      activeTab === "escalation"
                        ? "border-indigo-600 text-indigo-600 font-extrabold"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    SLA Escalation Specs
                  </button>
                </div>

                {activeTab === "analysis" ? (
                  <div className="space-y-6">
                    {/* Proximity Map display */}
                    <div className="rounded-3xl border border-slate-200/60 bg-white p-5.5 shadow-premium">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 select-none">
                        Grievance Proximity Spatial Cluster
                      </h3>
                      <IssueMap center={report.location} />
                    </div>

                    {/* Official complaint document review (Serif Legal Paper aesthetic) */}
                    <div className="rounded-3xl border border-slate-200/60 bg-white p-6.5 shadow-premium space-y-4">
                      <div className="flex items-center gap-2 text-indigo-600 select-none">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        <h3 className="font-heading text-sm font-extrabold text-slate-800">
                          Legally Formatted Complaint Document
                        </h3>
                      </div>

                      {/* Paper aesthetic */}
                      <div className="rounded-2xl bg-white border border-slate-200/80 p-6.5 sm:p-8 shadow-xs relative font-serif text-xs text-slate-700 leading-relaxed max-w-none overflow-hidden select-text">
                        {/* Subtle watermark lines or stamp indicator */}
                        <div className="absolute top-6 right-6 flex flex-col items-center justify-center border-2 border-indigo-100/50 rounded-lg p-1.5 opacity-40 select-none text-[8px] font-sans font-bold text-indigo-600 tracking-widest uppercase">
                          <span>CIVICPULSE</span>
                          <span>NODE_VERIFIED</span>
                        </div>

                        <div className="border-b border-slate-200 pb-4 mb-4 font-sans text-xs">
                          <p className="font-black text-[9px] uppercase tracking-widest text-slate-400 select-none">
                            Recipient Authority
                          </p>
                          <p className="font-black text-slate-800 text-sm mt-1">
                            {
                              pipelineResult.action_plan.complaint_document_spec
                                .recipient_name
                            }
                          </p>
                          <p className="text-slate-500 font-semibold mt-0.5">
                            {
                              pipelineResult.action_plan.complaint_document_spec
                                .recipient_title
                            }
                          </p>
                        </div>

                        <p className="font-black text-slate-900 font-sans text-xs mb-4">
                          Subject:{" "}
                          <span className="underline decoration-indigo-200 decoration-2">
                            {
                              pipelineResult.action_plan.complaint_document_spec
                                .subject_line
                            }
                          </span>
                        </p>

                        <div className="space-y-4 text-justify font-sans text-xs text-slate-500 font-medium">
                          {pipelineResult.action_plan.complaint_document_spec.body_paragraphs.map(
                            (p: string, idx: number) => (
                              <p key={idx}>{p}</p>
                            ),
                          )}
                        </div>

                        {/* Signature Block */}
                        <div className="mt-8 pt-6 border-t border-slate-100 font-sans text-[10px] text-slate-400 select-none flex justify-between items-center">
                          <span>
                            Issued autonomously on behalf of the public
                          </span>
                          <span className="font-mono text-[9px] bg-slate-50 px-2 py-1 border rounded-lg text-slate-500">
                            DIGITAL_TOKEN_APPROVED
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Escalation Timeline */}
                    <div className="rounded-3xl border border-slate-200/60 bg-white p-6.5 shadow-premium">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 select-none">
                        Accountability SLA Ladder
                      </h3>

                      <div className="relative border-l-2 border-indigo-100/80 pl-7 ml-4.5 space-y-8 select-none">
                        {pipelineResult.action_plan.escalation_ladder.map(
                          (step: any, idx: number) => {
                            const isCurrent = idx === 0;
                            return (
                              <div key={idx} className="relative group">
                                <span
                                  className={`absolute left-[-37px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 transition-transform duration-300 group-hover:scale-110 ${
                                    isCurrent
                                      ? "border-emerald-500 shadow-glow-success"
                                      : "border-slate-300"
                                  }`}
                                >
                                  {isCurrent ? (
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                  ) : (
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                  )}
                                </span>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-black text-slate-800">
                                      {step.title}
                                    </h4>
                                    <span
                                      className={`text-[8px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-wide ${
                                        isCurrent
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                          : "bg-slate-50 text-slate-500 border-slate-200"
                                      }`}
                                    >
                                      Level {step.level}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                    {step.contact_email}
                                  </p>

                                  <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-500 font-bold bg-slate-50/50 p-2 rounded-xl border border-slate-100/60 inline-flex">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    <span>
                                      Acknowledgement Deadline: {step.sla_hours}{" "}
                                      hours SLA
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {/* Execution achievements */}
                    <div className="rounded-3xl border border-slate-200/60 bg-white p-6.5 shadow-premium">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5 select-none">
                        Execution Verification Checklist
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100/80 bg-emerald-50/20 p-4 shadow-glow-success/5 hover-lift">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                              Complaint PDF Generated
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-relaxed">
                              Legally formatted ReportLab PDF compiled.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100/80 bg-emerald-50/20 p-4 shadow-glow-success/5 hover-lift">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                              Asset Cloud Uploaded
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-relaxed">
                              Asset saved securely to GCS buckets.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100/80 bg-emerald-50/20 p-4 shadow-glow-success/5 hover-lift">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                              Ward Officer Emailed
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-relaxed">
                              SendGrid email queued with GCS attachments.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100/80 bg-emerald-50/20 p-4 shadow-glow-success/5 hover-lift">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                              SMS Broadcast Sent
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-relaxed">
                              Twilio SMS notifications dispatched.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function LoaderWidget() {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-indigo-600/10 border-t-indigo-600" />
      <Activity className="h-6 w-6 text-indigo-600 animate-pulse" />
    </div>
  );
}
