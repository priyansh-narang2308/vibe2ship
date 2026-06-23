"use client";

import { useState } from "react";
import { MapPin, Info, Navigation, ShieldCheck, X } from "lucide-react";
import { GPSLocation } from "@/lib/api";

interface IssuePin {
  id: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  lat: number;
  lng: number;
  ward: string;
  description: string;
}

interface IssueMapProps {
  center: GPSLocation;
  issues?: IssuePin[];
}

const SEVERITY_INFO = {
  LOW: {
    color: "text-emerald-500",
    bg: "bg-emerald-500",
    border: "border-emerald-200",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    glow: "shadow-emerald-500/25"
  },
  MEDIUM: {
    color: "text-amber-500",
    bg: "bg-amber-500",
    border: "border-amber-200",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    glow: "shadow-amber-500/25"
  },
  HIGH: {
    color: "text-orange-500",
    bg: "bg-orange-500",
    border: "border-orange-200",
    badge: "bg-orange-50 text-orange-700 border-orange-100",
    glow: "shadow-orange-500/25"
  },
  CRITICAL: {
    color: "text-rose-500",
    bg: "bg-rose-500",
    border: "border-rose-200",
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    glow: "shadow-rose-500/25"
  }
};

const DEFAULT_DEMO_PINS: IssuePin[] = [
  {
    id: "rep-101",
    type: "POTHOLE",
    severity: "HIGH",
    lat: 12.973,
    lng: 77.644,
    ward: "Koramangala 5th Block",
    description: "45cm wide pothole in middle of intersection."
  },
  {
    id: "rep-102",
    type: "WATER_LEAK",
    severity: "CRITICAL",
    lat: 12.971,
    lng: 77.640,
    ward: "Koramangala 5th Block",
    description: "Water main rupture causing street flooding."
  },
  {
    id: "rep-103",
    type: "BROKEN_STREETLIGHT",
    severity: "LOW",
    lat: 12.969,
    lng: 77.643,
    ward: "Koramangala 5th Block",
    description: "Three sequential streetlights are completely out."
  },
  {
    id: "rep-104",
    type: "WASTE",
    severity: "MEDIUM",
    lat: 12.974,
    lng: 77.641,
    ward: "Koramangala 5th Block",
    description: "Unauthorized commercial waste dumping."
  }
];

export default function IssueMap({ center, issues = DEFAULT_DEMO_PINS }: IssueMapProps) {
  const [selectedIssue, setSelectedIssue] = useState<IssuePin | null>(null);

  const getCoordinatesOffset = (lat: number, lng: number) => {
    const latScale = 1800;
    const lngScale = 1800;
    
    const dLat = lat - center.latitude;
    const dLng = lng - center.longitude;

    const x = 50 + dLng * lngScale;
    const y = 50 - dLat * latScale;

    return {
      x: Math.max(12, Math.min(88, x)),
      y: Math.max(12, Math.min(88, y))
    };
  };

  return (
    <div className="relative h-[420px] w-full rounded-3xl border border-indigo-100 bg-linear-to-b from-slate-50 to-indigo-50/20 overflow-hidden shadow-2xs">
      
      {/* 1. SVG Minimalist Grid Map Background */}
      <svg className="absolute inset-0 h-full w-full bg-slate-50" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="oklch(0.91 0.01 240 / 50%)" strokeWidth="1" />
            <circle cx="0" cy="0" r="1.5" fill="oklch(0.52 0.22 265 / 15%)" />
          </pattern>
        </defs>
        
        {/* Draw Grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Minimalist Vector Streets */}
        <path d="M -50,150 L 700,280" stroke="white" strokeWidth="22" fill="none" opacity="0.9" />
        <path d="M -50,150 L 700,280" stroke="oklch(0.52 0.22 265 / 10%)" strokeWidth="1" fill="none" strokeDasharray="6,4" />

        <path d="M 120,-50 L 320,500" stroke="white" strokeWidth="26" fill="none" opacity="0.9" />
        <path d="M 120,-50 L 320,500" stroke="oklch(0.52 0.22 265 / 10%)" strokeWidth="1" fill="none" strokeDasharray="6,4" />

        <path d="M 480,-50 L 380,500" stroke="white" strokeWidth="18" fill="none" opacity="0.9" />
        
        {/* Bounded Radial Scan (Radar animation) */}
        <circle cx="50%" cy="50%" r="100" fill="oklch(0.52 0.22 265 / 2%)" stroke="oklch(0.52 0.22 265 / 15%)" strokeWidth="1.5" />
        <circle cx="50%" cy="50%" r="60" fill="none" stroke="oklch(0.52 0.22 265 / 10%)" strokeWidth="1" strokeDasharray="5,5" />
        <circle cx="50%" cy="50%" r="140" fill="none" stroke="oklch(0.52 0.22 265 / 5%)" strokeWidth="1" />
      </svg>

      {/* 2. User Center Pin (Detected Location) */}
      <div 
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 select-none pointer-events-none"
        style={{ left: "50%", top: "50%" }}
      >
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
          <div className="h-5 w-5 rounded-full bg-indigo-600 border-3 border-white flex items-center justify-center shadow-lg animate-pulse">
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
          <span className="absolute -inset-1 animate-ping rounded-full border border-indigo-400/40 opacity-70" style={{ animationDuration: '2.5s' }} />
        </div>
        <div className="mt-1 rounded-md bg-slate-900 px-2 py-0.5 text-[8px] font-black tracking-widest text-white shadow-md">
          YOU
        </div>
      </div>

      {/* 3. Render Issue Pins */}
      {issues.map((issue) => {
        const offset = getCoordinatesOffset(issue.lat, issue.lng);
        const styleInfo = SEVERITY_INFO[issue.severity];
        const isSelected = selectedIssue?.id === issue.id;
        
        return (
          <button
            key={issue.id}
            onClick={() => setSelectedIssue(issue)}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-20 cursor-pointer active:scale-90 transition-all duration-200"
            style={{ left: `${offset.x}%`, top: `${offset.y}%` }}
            type="button"
            id={`map-pin-${issue.id}`}
          >
            <div className={`relative flex h-9 w-9 items-center justify-center rounded-full border-3 bg-white shadow-md transition-all duration-300 ${
              isSelected ? "scale-125 border-indigo-500 shadow-glow" : "border-slate-100 hover:scale-115"
            }`}>
              <MapPin className={`h-4.5 w-4.5 transition-transform duration-200 ${styleInfo.color} ${isSelected ? "animate-bounce" : ""}`} />
              <span className={`absolute -inset-0.5 rounded-full border-2 border-transparent animate-ping ${isSelected ? "border-indigo-400/30" : ""}`} />
            </div>
            
            <div className="absolute bottom-10 scale-0 group-hover:scale-100 rounded-xl bg-slate-900 px-2.5 py-1 text-[9px] font-bold text-white shadow-md pointer-events-none transition-all duration-200 origin-bottom select-none whitespace-nowrap z-50">
              {issue.type} ({issue.severity})
            </div>
          </button>
        );
      })}

      {/* 4. Overlay Info Panel (Details Drawer) */}
      {selectedIssue ? (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 rounded-3xl border border-indigo-100/60 bg-white/90 backdrop-blur-md p-5 shadow-premium z-30 animate-slideUp">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 tracking-tight">{selectedIssue.type}</span>
                <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[8px] font-extrabold border ${
                  SEVERITY_INFO[selectedIssue.severity].badge
                }`}>
                  {selectedIssue.severity}
                </span>
              </div>
              <p className="text-[9px] font-semibold text-slate-400 mt-0.5 tracking-wider uppercase">{selectedIssue.ward}</p>
            </div>
            
            <button
              onClick={() => setSelectedIssue(null)}
              className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          
          <p className="mt-3 text-xs leading-relaxed text-slate-500 font-semibold">
            {selectedIssue.description}
          </p>
          
          <div className="mt-4 flex items-center gap-1.5 rounded-xl bg-indigo-50/50 border border-indigo-100/50 px-3 py-2.5 text-[9px] font-bold text-indigo-700 shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-indigo-500 animate-pulse" />
            <span>Community verification consensus: VERIFIED</span>
          </div>
        </div>
      ) : (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3.5 py-2 text-[9px] font-extrabold text-white backdrop-blur-md shadow-md select-none pointer-events-none tracking-wider uppercase">
          <Navigation className="h-3 w-3 text-indigo-400 animate-pulse" />
          <span>Active clusters within 500 meters</span>
        </div>
      )}

    </div>
  );
}
