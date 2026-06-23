"use client";

import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Video, Sparkles } from "lucide-react";

interface MediaPickerProps {
  onMediaSelect: (url: string, fileType: "image" | "video") => void;
  onClear: () => void;
}

const DEMO_MEDIA_PRESETS = [
  {
    name: "Koramangala Pothole (Image)",
    url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=1000",
    type: "image" as const,
  },
  {
    name: "Road Water Leak (Image)",
    url: "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?q=80&w=1000",
    type: "image" as const,
  },
  {
    name: "Broken Streetlight (Image)",
    url: "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?q=80&w=1000",
    type: "image" as const,
  },
];

export default function MediaPicker({
  onMediaSelect,
  onClear,
}: MediaPickerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (isImage || isVideo) {
      const type = isImage ? "image" : "video";
      setMediaType(type);

      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      onMediaSelect(localUrl, type);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handlePresetSelect = (url: string, type: "image" | "video") => {
    setPreviewUrl(url);
    setMediaType(type);
    onMediaSelect(url, type);
  };

  const clearSelection = () => {
    setPreviewUrl(null);
    setMediaType(null);
    onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
          <span className="flex h-5.5 w-5.5 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-xs font-black">1</span>
          Upload Grid / Evidence
        </label>
        {previewUrl && (
          <button
            onClick={clearSelection}
            className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer select-none bg-rose-50 hover:bg-rose-100/50 px-2.5 py-1.5 rounded-lg border border-rose-100"
          >
            <X className="h-3.5 w-3.5" /> Clear Selection
          </button>
        )}
      </div>

      {!previewUrl ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? "border-indigo-500 bg-indigo-50/40 shadow-glow"
              : "border-slate-200/80 bg-linear-to-br from-white to-slate-50/20 hover:border-indigo-300 hover:shadow-2xs"
          }`}
          id="media-dropzone"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleChange}
          />

          <div className="mb-4 rounded-2xl bg-indigo-50 text-indigo-600 p-3.5 border border-indigo-100/50 animate-pulseGlow">
            <UploadCloud className="h-6 w-6 text-indigo-600" />
          </div>

          <p className="text-sm font-bold text-slate-800">
            Drag and drop photo/video, or click to browse
          </p>
          <p className="mt-1.5 text-xs text-slate-400 font-medium">
            Supports JPEG, PNG, WebP, MP4 (max 20MB)
          </p>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50/50 p-2.5 shadow-xs">
          {mediaType === "image" ? (
            <img
              src={previewUrl}
              alt="Media evidence preview"
              className="h-56 w-full rounded-2xl object-cover shadow-2xs border border-white"
            />
          ) : (
            <video
              src={previewUrl}
              controls
              className="h-56 w-full rounded-2xl object-cover shadow-2xs border border-white"
            />
          )}

          <div className="absolute top-5 left-5 flex items-center gap-1.5 rounded-xl bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md">
            {mediaType === "image" ? (
              <>
                <ImageIcon className="h-3.5 w-3.5 text-indigo-400" /> Image Attachment Loaded
              </>
            ) : (
              <>
                <Video className="h-3.5 w-3.5 text-indigo-400" /> Video Attachment Loaded
              </>
            )}
          </div>
        </div>
      )}

      {/* Demo Presets Bar */}
      {!previewUrl && (
        <div className="space-y-2.5 pt-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 select-none">
            <Sparkles className="h-3 w-3 text-amber-500" /> Or select a demo evidence image
          </span>
          <div className="flex flex-wrap gap-2.5">
            {DEMO_MEDIA_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetSelect(preset.url, preset.type)}
                className="group flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-600 transition-all duration-200 cursor-pointer shadow-2xs hover:translate-y-[-1px]"
                type="button"
                id={`preset-media-${idx}`}
              >
                <div className="h-4.5 w-4.5 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                  <img src={preset.url} alt="" className="h-full w-full object-cover" />
                </div>
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
