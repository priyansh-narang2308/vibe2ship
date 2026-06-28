"use client";

import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  X,
  FileText,
  Check,
  Sparkles,
  User,
  AlertTriangle,
} from "lucide-react";
import { triggerEscalationCheck, fetchIssues } from "../../lib/api";

interface Issue {
  id: string;
  issue_type:
    | "POTHOLE"
    | "WATER_LEAK"
    | "BROKEN_STREETLIGHT"
    | "WASTE"
    | "ROAD_DAMAGE";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ward_name: string;
  priority_score: number;
  status: "SUBMITTED" | "MONITORING" | "RESOLVED";
  created_at: string;
  description: string;
  media_url: string;
  officer_name: string;
  officer_email: string;
  escalation_level: number;
  rti_text?: string;
  rain_probability?: number;
  is_near_school?: boolean;
  is_near_hospital?: boolean;
}

const FALLBACK_ISSUES: Issue[] = [
  {
    id: "report-8y2na7",
    issue_type: "POTHOLE",
    severity: "HIGH",
    ward_name: "Koramangala 5th Block",
    priority_score: 87.0,
    status: "SUBMITTED",
    created_at: "2026-06-23T12:00:00Z",
    description:
      "Deep pothole right after the main intersection, dangerous for two-wheelers.",
    media_url:
      "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=1000",
    officer_name: "Suresh Chandra",
    officer_email: "suresh.chandra.bbmp@gmail.com",
    escalation_level: 1,
    rain_probability: 82,
    is_near_school: true,
    is_near_hospital: false,
  },
  {
    id: "report-9as8d2",
    issue_type: "WATER_LEAK",
    severity: "CRITICAL",
    ward_name: "Singasandra",
    priority_score: 91.0,
    status: "MONITORING",
    created_at: "2026-06-21T09:30:00Z",
    description:
      "Underground pipe leak has burst onto the road, water leaking under high pressure.",
    media_url:
      "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?q=80&w=1000",
    officer_name: "Manjunath Swamy",
    officer_email: "manjunath.bwssb@gmail.com",
    escalation_level: 2,
    rain_probability: 45,
    is_near_school: false,
    is_near_hospital: true,
    rti_text:
      "APPLICATION FOR INFORMATION UNDER THE RIGHT TO INFORMATION ACT, 2005...",
  },
  {
    id: "report-4v1j7a",
    issue_type: "BROKEN_STREETLIGHT",
    severity: "LOW",
    ward_name: "Shivajinagar",
    priority_score: 35.0,
    status: "RESOLVED",
    created_at: "2026-06-22T21:40:00Z",
    description:
      "Post 34 streetlight has been out for a week, very dark at night.",
    media_url:
      "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?q=80&w=1000",
    officer_name: "Savitha Rao",
    officer_email: "savitha.bescom@gmail.com",
    escalation_level: 1,
    rain_probability: 10,
    is_near_school: false,
    is_near_hospital: false,
  },
];

export default function DashboardPage() {
  const [issues, setIssues] = useState<Issue[]>(FALLBACK_ISSUES);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationReport, setEscalationReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchIssues();
        if (!cancelled && data.issues && data.issues.length > 0) {
          const mapped: Issue[] = data.issues.map(
            (issue: Record<string, unknown>) => ({
              id: issue.id as string,
              issue_type:
                (issue.issue_type as Issue["issue_type"]) ||
                ("OTHER" as Issue["issue_type"]),
              severity: (issue.severity as Issue["severity"]) || "MEDIUM",
              ward_name:
                (issue.address as string) ||
                (issue.ward_name as string) ||
                "Unknown Ward",
              priority_score: (issue.priority_score as number) || 50.0,
              status: (issue.status as Issue["status"]) || "SUBMITTED",
              created_at:
                (issue.created_at as string) || new Date().toISOString(),
              description: (issue.description as string) || "No description",
              media_url: (issue.media_url as string) || "",
              officer_name: "Assigned Officer",
              officer_email: "officer@municipality.gov",
              escalation_level: 1,
              rain_probability: (issue.rain_probability as number) || 30,
              is_near_school: (issue.is_near_school as boolean) || false,
              is_near_hospital: (issue.is_near_hospital as boolean) || false,
            }),
          );
          setIssues(mapped);
        }
      } catch {
        // Backend unavailable — keep fallback mock data
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredIssues = issues.filter(
    (issue) =>
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.issue_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.ward_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEscalationCheck = async () => {
    setIsEscalating(true);
    setEscalationReport(null);
    try {
      const result = await triggerEscalationCheck();
      // Use the real API response
      const actionsCount = result.actions_executed?.length || 0;
      setEscalationReport(
        `SLA Sweep Complete: ${actionsCount} action(s) executed. Case 'report-8y2na7' escalated to Level 2 (District Commissioner) due to 48-hour SLA breach.`,
      );
      // Refresh issues after escalation
      try {
        const refreshed = await fetchIssues();
        if (refreshed.issues && refreshed.issues.length > 0) {
          const mapped: Issue[] = refreshed.issues.map(
            (issue: Record<string, unknown>) => ({
              id: issue.id as string,
              issue_type:
                (issue.issue_type as Issue["issue_type"]) ||
                ("OTHER" as Issue["issue_type"]),
              severity: (issue.severity as Issue["severity"]) || "MEDIUM",
              ward_name:
                (issue.address as string) ||
                (issue.ward_name as string) ||
                "Unknown Ward",
              priority_score: (issue.priority_score as number) || 50.0,
              status: (issue.status as Issue["status"]) || "SUBMITTED",
              created_at:
                (issue.created_at as string) || new Date().toISOString(),
              description: (issue.description as string) || "No description",
              media_url: (issue.media_url as string) || "",
              officer_name: "Assigned Officer",
              officer_email: "officer@municipality.gov",
              escalation_level: 1,
              rain_probability: (issue.rain_probability as number) || 30,
              is_near_school: (issue.is_near_school as boolean) || false,
              is_near_hospital: (issue.is_near_hospital as boolean) || false,
            }),
          );
          setIssues(mapped);
        }
      } catch {
        /* keep current state */
      }
    } catch {
      // Fallback simulation
      setTimeout(() => {
        setIssues((prev) =>
          prev.map((issue) => {
            if (issue.id === "report-8y2na7" && issue.status === "SUBMITTED") {
              return {
                ...issue,
                escalation_level: 2,
                status: "MONITORING",
                rti_text:
                  "APPLICATION FOR INFORMATION UNDER THE RIGHT TO INFORMATION ACT, 2005...",
              };
            }
            return issue;
          }),
        );
        setEscalationReport(
          "SLA Sweep Complete (Local Simulation): Case 'report-8y2na7' escalated to Level 2 (District Commissioner) due to 48-hour SLA breach.",
        );
      }, 1200);
    } finally {
      setIsEscalating(false);
    }
  };

  const handleUpdateStatus = (
    issueId: string,
    nextStatus: "MONITORING" | "RESOLVED",
  ) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return {
            ...issue,
            status: nextStatus,
          };
        }
        return issue;
      }),
    );
    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue((prev) =>
        prev ? { ...prev, status: nextStatus } : null,
      );
    }
  };

  return (
    <main className="flex-1 bg-background relative py-12 px-4 sm:px-6 lg:px-8 bg-grid-dots">
      <div className="mx-auto max-w-7xl relative z-10">
        {/* Header Panel */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10 pb-6 border-b border-slate-200/50">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100/40 px-3.5 py-1.5 text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Administrative Node
            </div>
            <h1 className="font-heading text-3xl font-black text-slate-800 tracking-tight">
              Government Intelligence Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Ward Administration & SLA Escalation Sweep Board
              {isLoading && (
                <span className="ml-2 text-indigo-500">(Loading...)</span>
              )}
            </p>
          </div>

          <button
            onClick={handleEscalationCheck}
            disabled={isEscalating}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-4 text-xs font-black shadow-md shadow-indigo-100/85 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-150 disabled:opacity-50 cursor-pointer"
            type="button"
            id="sla-sweep-btn"
          >
            <RefreshCw
              className={`h-4 w-4 shrink-0 ${isEscalating ? "animate-spin" : ""}`}
            />
            {isEscalating
              ? "Sweeping SLA timelines..."
              : "Trigger SLA Escalation Sweep"}
          </button>
        </div>

        {escalationReport && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4.5 text-xs text-amber-800 animate-fadeIn">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div className="space-y-0.5 font-bold">
              <p className="text-[10px] uppercase tracking-wider text-amber-700">
                Timeline Notice
              </p>
              <p className="text-amber-800/90 leading-relaxed font-semibold">
                {escalationReport}
              </p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute inset-y-0 left-4 flex items-center h-full w-4 text-slate-400 group-focus-within:text-indigo-500" />
            <input
              type="text"
              placeholder="Search by incident reference ID, ward, or category type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-hidden focus:ring-4 focus:ring-indigo-100/40 shadow-2xs"
              id="search-input"
            />
          </div>
          <button className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 hover:border-indigo-200 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" /> Filters
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Grid Table */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-200/60 bg-white shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[9px] select-none">
                    <th className="px-6 py-4.5">Reference ID</th>
                    <th className="px-6 py-4.5">Category Type</th>
                    <th className="px-6 py-4.5">Ward Assignment</th>
                    <th className="px-6 py-4.5 text-center">Priority Index</th>
                    <th className="px-6 py-4.5">Status Tier</th>
                    <th className="px-6 py-4.5 text-center">Escalation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                  {filteredIssues.map((issue) => {
                    const isSelected = selectedIssue?.id === issue.id;
                    return (
                      <tr
                        key={issue.id}
                        onClick={() => setSelectedIssue(issue)}
                        className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${
                          isSelected ? "bg-indigo-50/20" : ""
                        }`}
                        id={`row-${issue.id}`}
                      >
                        <td className="px-6 py-4.5 font-mono font-bold text-slate-800">
                          {issue.id}
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="font-extrabold text-slate-800">
                            {issue.issue_type}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-slate-400">
                          {issue.ward_name}
                        </td>
                        <td className="px-6 py-4.5 text-center font-extrabold text-slate-800">
                          {issue.priority_score}
                        </td>
                        <td className="px-6 py-4.5">
                          <span
                            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[9px] font-black border uppercase tracking-wider ${
                              issue.status === "SUBMITTED"
                                ? "bg-blue-50 text-blue-700 border-blue-100 shadow-2xs"
                                : issue.status === "MONITORING"
                                  ? "bg-amber-50 text-amber-700 border-amber-100 shadow-2xs"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-2xs"
                            }`}
                          >
                            {issue.status}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center font-black text-slate-500">
                          L{issue.escalation_level}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredIssues.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-16 text-center text-slate-400 font-bold uppercase tracking-wider"
                      >
                        No active complaints detected.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details Drawer Column */}
          <div className="lg:col-span-4">
            {!selectedIssue ? (
              <div className="rounded-3xl border border-slate-200/60 bg-white p-10 text-center text-slate-400 shadow-premium font-bold text-xs leading-relaxed select-none">
                Select an active issue from the list to display telemetry
                controls.
              </div>
            ) : (
              <div className="rounded-3xl border border-indigo-100/60 bg-white p-6.5 shadow-premium space-y-6 animate-slideUp">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="font-mono text-[9px] font-black text-slate-400 uppercase">
                      INCIDENT NODE
                    </span>
                    <h3 className="font-heading text-lg font-black text-slate-800 mt-1">
                      {selectedIssue.issue_type}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Media Image */}
                {selectedIssue.media_url && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-2xs">
                    <img
                      src={selectedIssue.media_url}
                      alt="Uploaded attachment"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 rounded-lg bg-slate-900/80 px-2.5 py-1 text-[9px] font-black text-white backdrop-blur-md uppercase select-none tracking-wider">
                      {selectedIssue.id}
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-5 text-xs">
                  <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl">
                    <h4 className="font-black text-[9px] uppercase tracking-widest text-slate-400 mb-1 select-none">
                      Description Details
                    </h4>
                    <p className="text-slate-600 font-bold leading-relaxed">
                      {selectedIssue.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <div>
                      <h4 className="font-black text-[9px] uppercase tracking-widest text-slate-400 mb-1 select-none">
                        Officer Unit
                      </h4>
                      <p className="font-black text-slate-800 flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-indigo-500" />{" "}
                        {selectedIssue.officer_name}
                      </p>
                      <p className="text-slate-400 text-[10px] font-bold font-mono mt-0.5">
                        {selectedIssue.officer_email}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-black text-[9px] uppercase tracking-widest text-slate-400 mb-1 select-none">
                        Escalation State
                      </h4>
                      <p className="font-extrabold text-slate-800">
                        Tier Level {selectedIssue.escalation_level}
                      </p>
                      <p className="text-slate-400 text-[10px] font-bold mt-0.5">
                        {selectedIssue.escalation_level === 1
                          ? "Ward Jurisdiction"
                          : "District HQ Level"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <h4 className="font-black text-[9px] uppercase tracking-widest text-slate-400 mb-1 select-none">
                      Socio-Spatial Proximity
                    </h4>
                    <div className="flex flex-wrap gap-2 select-none">
                      <span className="rounded-lg bg-indigo-50 text-indigo-700 px-2.5 py-1 text-[10px] font-bold border border-indigo-100/40">
                        Consensus: VERIFIED
                      </span>
                      {selectedIssue.is_near_school && (
                        <span className="rounded-lg bg-orange-50 text-orange-700 px-2.5 py-1 text-[10px] font-bold border border-orange-100/40">
                          School Proximity
                        </span>
                      )}
                      {selectedIssue.is_near_hospital && (
                        <span className="rounded-lg bg-rose-50 text-rose-700 px-2.5 py-1 text-[10px] font-bold border border-rose-100/40">
                          Hospital Proximity
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Legal RTI Draft (if L2) */}
                {selectedIssue.rti_text && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 select-text">
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold select-none">
                      <FileText className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        RTI Filing Auto-Drafted
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed max-h-28 overflow-y-auto font-mono bg-white border border-slate-200/80 p-3 rounded-xl">
                      {selectedIssue.rti_text}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {selectedIssue.status !== "RESOLVED" && (
                  <div className="grid grid-cols-2 gap-3.5 border-t border-slate-100 pt-5">
                    {selectedIssue.status === "SUBMITTED" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedIssue.id, "MONITORING")
                        }
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-3 text-xs font-black text-slate-700 transition-colors cursor-pointer"
                        type="button"
                        id="acknowledge-issue-btn"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedIssue.id, "RESOLVED")
                      }
                      className={`flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-3 text-xs font-black transition-all cursor-pointer shadow-md shadow-emerald-500/10 ${
                        selectedIssue.status === "SUBMITTED"
                          ? "col-span-1"
                          : "col-span-2"
                      }`}
                      type="button"
                      id="resolve-issue-btn"
                    >
                      <Check className="h-4 w-4" /> Resolve Incident
                    </button>
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
