"use client";

import { useState } from "react";
import IssueMap from "@/components/IssueMap";
import { GPSLocation } from "../../lib/api";
import { Navigation, SlidersHorizontal, Eye } from "lucide-react";

export default function MapPage() {
  const [center, setCenter] = useState<GPSLocation>({
    latitude: 12.972,
    longitude: 77.642,
  });

  return (
    <main className="flex-1 flex flex-col bg-slate-50/50">
      {/* Map Control Bar */}
      <div className="bg-white border-b border-slate-200/60 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div>
            <h1 className="font-heading text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
              <Navigation className="h-4 w-4 text-indigo-600 animate-pulse" />{" "}
              Live Proximity Issues Map
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Cross-agency community verification layers in real-time
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />{" "}
              Filter Categories
            </button>
            <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1.5 font-semibold border border-indigo-100/50">
              <Eye className="h-3.5 w-3.5" /> Showing: 4 Incidents
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Viewer */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col">
        <div className="flex-1 rounded-3xl overflow-hidden border border-slate-200 shadow-xs flex flex-col">
          <div className="flex-1 relative flex flex-col">
            {/* Height 100% of container */}
            <IssueMap center={center} />
          </div>
        </div>
      </div>
    </main>
  );
}
