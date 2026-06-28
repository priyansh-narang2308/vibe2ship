"use client";

import { useState } from "react";
import {
  Compass,
  CheckCircle2,
  Navigation,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { GPSLocation } from "../lib/api";

interface LocationPickerProps {
  location: GPSLocation;
  onLocationChange: (loc: GPSLocation) => void;
}

const DEMO_LOCATION_PRESETS = [
  {
    name: "Koramangala, Bangalore",
    lat: 12.972,
    lng: 77.642,
  },
  {
    name: "Singasandra, Bangalore",
    lat: 12.925,
    lng: 77.595,
  },
  {
    name: "Shivajinagar, Pune",
    lat: 18.528,
    lng: 73.842,
  },
];

export default function LocationPicker({
  location,
  onLocationChange,
}: LocationPickerProps) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    setGpsSuccess(false);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detected = {
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        };
        onLocationChange(detected);
        setGpsLoading(false);
        setGpsSuccess(true);
      },
      (error) => {
        setGpsLoading(false);
        setErrorMsg(
          "Failed to retrieve GPS. Choose a demo preset or type manually.",
        );
        console.error("GPS error:", error);
      },
      { enableHighAccuracy: true, timeout: 6000 },
    );
  };

  const selectPreset = (lat: number, lng: number) => {
    onLocationChange({ latitude: lat, longitude: lng });
    setGpsSuccess(false);
    setErrorMsg(null);
  };

  const handleManualChange = (
    field: "latitude" | "longitude",
    value: string,
  ) => {
    const numVal = parseFloat(value);
    if (!isNaN(numVal)) {
      onLocationChange({
        ...location,
        [field]: numVal,
      });
      setGpsSuccess(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
          <span className="flex h-5.5 w-5.5 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-xs font-black">
            2
          </span>
          Pin Geographic Location
        </label>
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={gpsLoading}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98] ${
            gpsSuccess
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-glow-success"
              : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100/70 border border-indigo-100/60"
          }`}
          id="detect-gps-btn"
        >
          {gpsLoading ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              Locating coordinates...
            </>
          ) : gpsSuccess ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 animate-pulse" />{" "}
              Telemetry Verified
            </>
          ) : (
            <>
              <Compass className="h-4 w-4 text-indigo-600 animate-pulse" />{" "}
              Detect GPS coordinates
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Manual Input Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 select-none">
            Latitude Grid
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 font-bold text-xs select-none">
              Lat
            </span>
            <input
              type="number"
              step="any"
              value={location.latitude || ""}
              onChange={(e) => handleManualChange("latitude", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-3.5 text-xs font-bold text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-hidden focus:ring-4 focus:ring-indigo-100/40"
              placeholder="e.g. 12.9716"
              required
              id="manual-lat-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 select-none">
            Longitude Grid
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 font-bold text-xs select-none">
              Lng
            </span>
            <input
              type="number"
              step="any"
              value={location.longitude || ""}
              onChange={(e) => handleManualChange("longitude", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-3.5 text-xs font-bold text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-hidden focus:ring-4 focus:ring-indigo-100/40"
              placeholder="e.g. 77.5946"
              required
              id="manual-lng-input"
            />
          </div>
        </div>
      </div>

      {/* Location Presets */}
      <div className="space-y-2.5 pt-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block select-none">
          Or select an active district zone
        </span>
        <div className="flex flex-wrap gap-2.5">
          {DEMO_LOCATION_PRESETS.map((preset, idx) => {
            const isSelected =
              location.latitude === preset.lat &&
              location.longitude === preset.lng;
            return (
              <button
                key={idx}
                onClick={() => selectPreset(preset.lat, preset.lng)}
                className={`flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs hover:translate-y-[-1px] ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-extrabold shadow-glow"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/20 hover:text-indigo-600"
                }`}
                type="button"
                id={`preset-loc-${idx}`}
              >
                <MapPin
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    isSelected
                      ? "text-indigo-600 animate-bounce scale-110"
                      : "text-slate-400 group-hover:text-indigo-500"
                  }`}
                />
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
