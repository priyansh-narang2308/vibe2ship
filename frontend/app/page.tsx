import Link from "next/link";
import { 
  ArrowRight, ShieldCheck, Zap, HeartHandshake, Eye, Award, CheckCircle, Sparkles, Building2, Flame
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-center bg-background relative overflow-hidden bg-grid-dots">
      
      {/* Background radial soft light blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/10 blur-[120px] pointer-events-none" />

      {/* 1. Hero Block */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 text-center animate-fadeIn z-10">
        <div className="mx-auto max-w-4xl">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-100 bg-white/80 backdrop-blur-md px-4.5 py-2 text-xs font-bold text-indigo-700 shadow-2xs mb-8 select-none hover-lift">
            <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
            <span>Autonomous GovTech Multi-Agent Engine</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-7xl font-black tracking-tight text-slate-800 leading-tight">
            The AI Civic Operating <br className="hidden sm:inline" />
            System for <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Smart Cities</span>
          </h1>
          
          <p className="mt-8 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            CivicPulse turns a citizen's 30-second report into resolved public infrastructure automatically using 7 collaborating AI agents built on Google Gemini. No paperwork. No follow-up. Just action.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4.5 max-w-md mx-auto sm:max-w-none">
            <Link
              href="/report"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-7 py-4.5 text-sm font-bold shadow-md shadow-indigo-100 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 active:translate-y-0 active:scale-98 transition-all duration-150 cursor-pointer"
              id="hero-report-btn"
            >
              File a Grievance <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 px-7 py-4.5 text-sm font-bold shadow-2xs hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-98 transition-all duration-150 cursor-pointer"
              id="hero-admin-btn"
            >
              Government Portal
            </Link>
          </div>

        </div>
      </section>

      {/* 2. Key Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200/50 bg-white/70 backdrop-blur-md relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100/40 px-3 py-1 text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-3">
              <Building2 className="h-3.5 w-3.5" /> Core Capabilities
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Complete Accountability Lifecycle
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-semibold tracking-wide uppercase">
              Powered by Google Gemini 1.5 Pro, Flash, & Cloud Firestore
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="rounded-3xl border border-slate-200/60 bg-white p-7.5 hover-lift transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/60 shadow-2xs">
                  <Eye className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Multimodal Audit</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Gemini Vision analyzes uploaded images instantly, determines pothole dimensions, audits reports for authenticity, and detects duplicates visually.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-100 bg-linear-to-br from-white to-indigo-50/20 p-7.5 hover-lift transition-all shadow-2xs relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-100/10 rounded-bl-full pointer-events-none" />
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
                  <Zap className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  7-Agent Orchestration <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Parallel context, GIS directories, predictive risk calculations, planning specs, and automated email/SMS executions managed autonomously.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/60 bg-white p-7.5 hover-lift transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/60 shadow-2xs">
                  <ShieldCheck className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Escalation Engine</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Background SLA checkers monitor ward officer response. Unresolved cases are auto-escalated to Commissioners, and auto-draft RTI filings occur at 30 days.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Mission / Impact Quote */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/20 relative z-10">
        <div className="mx-auto max-w-4xl text-center space-y-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs mb-2">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <blockquote className="font-heading text-xl sm:text-2xl font-bold text-slate-800 max-w-2xl mx-auto italic leading-normal">
            &ldquo;A pothole reported. A pothole fixed. No paperwork. No follow-up. Just smart communities.&rdquo;
          </blockquote>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            CivicPulse Community Mission Statement
          </p>
        </div>
      </section>

    </div>
  );
}
