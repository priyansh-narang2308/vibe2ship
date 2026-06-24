import Link from "next/link";
import { ArrowRight, Camera, MapPin, Brain, FileText, Mail, ChevronRight, ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col bg-background relative">

      {/* 1. Hero */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="mx-auto max-w-5xl">

          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-5">
              Built for Indian cities
            </p>

            <h1 className="font-heading text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[0.95]">
              Report a pothole.
              <br />
              Watch it get fixed.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-500 max-w-xl leading-relaxed">
              Seven AI agents handle the rest. Upload a photo, drop a pin, and CivicPulse routes your report through verification, risk analysis, and automated escalation without you lifting a finger.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/report"
                className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-7 py-3.5 text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                File a Report <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 px-7 py-3.5 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Government Portal <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Pipeline */}
          <div className="mt-20 sm:mt-28">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">
              How a report gets resolved
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-0 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {[
                { icon: Camera, label: "Photo", sub: "Upload evidence" },
                { icon: MapPin, label: "Location", sub: "GPS + manual" },
                { icon: Brain, label: "Analyze", sub: "7 agents" },
                { icon: FileText, label: "Route", sub: "Auto-escalate" },
                { icon: Mail, label: "Notify", sub: "Email + SMS" },
              ].map((step, i) => (
                <div key={step.label} className="flex-1 flex items-center">
                  <div className="flex-1 px-5 py-4 hover:bg-slate-50 transition-colors group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
                        <step.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{step.label}</p>
                        <p className="text-[11px] text-slate-400">{step.sub}</p>
                      </div>
                    </div>
                  </div>
                  {i < 4 && (
                    <ChevronRight className="h-4 w-4 text-slate-200 flex-shrink-0 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 2. Stats strip */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
            {[
              { value: "30s", label: "Average report time" },
              { value: "7", label: "AI agents per report" },
              { value: "0", label: "Manual forms required" },
              { value: "24h", label: "Initial response SLA" },
            ].map((stat) => (
              <div key={stat.label} className="px-6 py-8 text-center">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Features — asymmetric layout */}
      <section className="px-4 sm:px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-5xl space-y-16">

          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-4">What we built</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              The infrastructure layer<br />civic complaints never had.
            </h2>
          </div>

          {/* Feature 1 — full width */}
          <div className="border border-slate-200 rounded-2xl p-8 sm:p-10 bg-white">
            <div className="flex items-start gap-5 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Seven agents, one pipeline</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xl">
                  A Memory Agent checks for duplicates. Research Agent maps your complaint to the exact government department using GIS. Verification Agent audits your photo for authenticity. Prediction Agent calculates risk scores using weather and traffic data. Planner Agent generates repair specifications. Execution Agent sends emails and SMS to the right officers. Escalation Agent monitors response SLAs and auto-escalates if nobody acts.
                </p>
              </div>
            </div>
            <div className="ml-[60px] flex flex-wrap gap-2">
              {["Memory", "Research", "Verification", "Prediction", "Planner", "Execution", "Escalation"].map((agent) => (
                <span key={agent} className="text-[11px] font-bold text-slate-500 bg-slate-100 rounded-md px-2.5 py-1">
                  {agent}
                </span>
              ))}
            </div>
          </div>

          {/* Feature 2 + 3 — side by side */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-2xl p-7 bg-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 mb-4">
                <Camera className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Multimodal verification</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Gemini Vision analyzes uploaded images to determine damage severity, measure pothole dimensions, detect duplicates, and flag fabricated reports before they enter the system.
              </p>
            </div>
            <div className="border border-slate-200 rounded-2xl p-7 bg-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 mb-4">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">SLA enforcement</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Background checkers monitor ward officer response times. Unresolved cases auto-escalate to municipal commissioners. At 30 days, an RTI filing is auto-drafted and ready to submit.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Built with */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-100 bg-slate-50/40">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Stack</p>
              <p className="text-sm text-slate-600">
                Google Gemini 1.5 Pro &amp; Flash&nbsp;&middot;&nbsp;Cloud Firestore&nbsp;&middot;&nbsp;FastAPI&nbsp;&middot;&nbsp;Next.js&nbsp;&middot;&nbsp;WebSockets
              </p>
            </div>
            <Link
              href="/report"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
            >
              Try it now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Closing */}
      <section className="px-4 sm:px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Stop chasing paperwork.<br />Start fixing things.
          </h2>
          <p className="mt-5 text-base text-slate-500 max-w-lg mx-auto">
            Every civic complaint deserves a system that works as hard as the people who file them.
          </p>
          <div className="mt-10">
            <Link
              href="/report"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              File Your First Report <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
