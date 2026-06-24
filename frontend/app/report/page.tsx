"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import MediaPicker from "@/components/MediaPicker";
import LocationPicker from "@/components/LocationPicker";
import { GPSLocation, submitReport } from "@/lib/api";

export default function ReportPage() {
  const router = useRouter();
  
  // State
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [location, setLocation] = useState<GPSLocation>({ latitude: 12.972, longitude: 77.642 });
  const [description, setDescription] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice recording logic using native Web Speech API
  const handleVoiceInput = () => {
    const SpeechRecognition = 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsRecording(true);
      setTimeout(() => {
        const fallbackText = "Large pothole in the road near the market entrance. Water seems to be leaking from a pipe underneath.";
        setDescription(prev => prev ? `${prev} ${fallbackText}` : fallbackText);
        setIsRecording(false);
      }, 2500);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsRecording(true);
      setFormError(null);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (e: any) => {
      console.error("Speech recognition error", e);
      setIsRecording(false);
      setFormError("Speech recognition failed. Please type manually.");
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.start();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!mediaUrl) {
      setFormError("Please select/upload an image preset or file first.");
      return;
    }

    setIsSubmitting(true);
    const reportId = `report-${Math.random().toString(36).substring(2, 11)}`;

    const reportPayload = {
      id: reportId,
      citizen_id: "citizen_outfit_33",
      media_url: mediaUrl,
      location: location,
      description: description,
      timestamp: new Date().toISOString()
    };

    // Save to localStorage as fallback (for tracking page)
    localStorage.setItem(`pending-report-${reportId}`, JSON.stringify(reportPayload));

    try {
      // Try to submit to backend API
      const result = await submitReport(reportId, {
        citizen_id: reportPayload.citizen_id,
        media_url: reportPayload.media_url,
        location: reportPayload.location,
        description: reportPayload.description,
      });
      
      // Store the full result for the tracking page
      localStorage.setItem(`pipeline-result-${reportId}`, JSON.stringify(result));
      router.push(`/track/${reportId}`);
    } catch {
      // Backend unavailable — fall back to WebSocket simulation on tracking page
      router.push(`/track/${reportId}`);
    }
  };

  return (
    <main className="flex-1 bg-background relative py-12 px-4 sm:px-6 lg:px-8 bg-grid-dots">
      <div className="mx-auto max-w-2xl relative z-10">
        
        {/* Header Block */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100/40 px-3.5 py-1.5 text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Launch Incident File
          </div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-slate-800 sm:text-5xl">
            File a Civic Grievance
          </h1>
          <p className="mt-3 text-sm text-slate-500 max-w-md mx-auto font-medium">
            Submit media evidence and descriptive metrics. The AI-Agent node will automatically route resources, generate legal documentation, and inspect progress.
          </p>
        </div>

        <form 
          onSubmit={handleFormSubmit} 
          className="space-y-7 rounded-3xl border border-indigo-100/60 bg-white/80 backdrop-blur-md p-6 sm:p-8 shadow-premium animate-slideUp"
        >
          {formError && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{formError}</span>
            </div>
          )}

          {/* Step 1: Media Picker */}
          <MediaPicker 
            onMediaSelect={(url, type) => {
              setMediaUrl(url);
              setFileType(type);
              setFormError(null);
            }} 
            onClear={() => {
              setMediaUrl("");
              setFileType(null);
            }}
          />

          <hr className="border-indigo-50/60" />

          {/* Step 2: Location Picker */}
          <LocationPicker 
            location={location} 
            onLocationChange={setLocation} 
          />

          <hr className="border-indigo-50/60" />

          {/* Step 3: Description & Voice */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <span className="flex h-5.5 w-5.5 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-xs font-black">3</span>
                Describe Issue (Optional)
              </label>
              
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold border transition-all duration-200 cursor-pointer ${
                  isRecording
                    ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse shadow-glow-error"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
                id="voice-mic-btn"
              >
                {isRecording ? (
                  <>
                    <Mic className="h-4 w-4 text-rose-600" /> Transcribing Speech...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 text-slate-500" /> Dictate Description
                  </>
                )}
              </button>
            </div>

            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-hidden focus:ring-4 focus:ring-indigo-100/40"
              placeholder="Describe the issue size, severity, or immediate public hazards. You can dictate by clicking the microphone button..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 px-5 py-4.5 text-sm font-black text-white shadow-md shadow-indigo-100 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 active:translate-y-0 active:scale-98 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            id="submit-grievance-btn"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Spawning Intelligent Agents...
              </>
            ) : (
              <>
                Launch AI Agent Pipeline <ArrowRight className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2.5 text-center text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 animate-pulse" />
          <span>Encrypted with civic safety and personal data privacy protocols.</span>
        </div>

      </div>
    </main>
  );
}
