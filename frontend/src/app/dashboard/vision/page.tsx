"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  UploadCloud,
  X,
  Bot,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Flame,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

interface Detection {
  id: string;
  image_path: string;
  model_name: string;
  class_name: string;
  confidence: number;
  risk_level: string;
  bounding_box: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function VisionPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadData, setUploadData] = useState<{ image_path: string; url: string } | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid JPG or PNG image");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Image must be smaller than 10MB");
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDetections([]);
    setUploadData(null);
  };

  const triggerUpload = async () => {
    if (!imageFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", imageFile);
    try {
      const res = await axios.post(`${API_URL}/vision/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUploadData(res.data);
      showToast("Evidence ready for analysis");
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.detail || "Upload failed. Verify backend connectivity.");
    } finally {
      setLoading(false);
    }
  };

  // Auto upload when file is set
  useEffect(() => {
    if (imageFile && !uploadData) {
      triggerUpload();
    }
  }, [imageFile]);

  const handleAnalyze = async () => {
    if (!uploadData) return;
    setAnalyzing(true);
    try {
      const res = await axios.post(`${API_URL}/vision/analyze`, {
        image_path: uploadData.image_path
      });
      setDetections(res.data);
      showToast(`Analysis complete: ${res.data.length} risks identified.`);
    } catch (err: any) {
      console.error(err);
      showToast("AI inference error. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setUploadData(null);
    setDetections([]);
  };

  // Drag and Drop helpers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => {
    setDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const getRiskCardStyle = (level: string) => {
    switch (level) {
      case "CRITICAL": return "border-l-4 border-l-rose-500 bg-rose-950/10 border-rose-500/25";
      case "HIGH": return "border-l-4 border-l-orange-500 bg-orange-950/10 border-orange-500/25";
      case "MEDIUM": return "border-l-4 border-l-yellow-500 bg-yellow-950/10 border-yellow-500/25";
      default: return "border-l-4 border-l-cyan-500 bg-cyan-950/10 border-cyan-500/25";
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "CRITICAL": return "bg-rose-950/60 text-rose-400 border border-rose-500/30";
      case "HIGH": return "bg-orange-950/60 text-orange-400 border border-orange-500/30";
      case "MEDIUM": return "bg-yellow-950/60 text-yellow-400 border border-yellow-500/30";
      default: return "bg-cyan-950/60 text-cyan-400 border border-cyan-500/30";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Visual Risk Detection</h2>
        <p className="text-sm text-slate-400 mt-1">
          Upload plant floor snapshots, cctv feeds, or worker imagery to detect PPE and safety compliance markers.
        </p>
      </div>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#071225] border border-cyan-500/30 shadow-lg shadow-cyan-500/10 rounded-lg text-slate-200 text-sm animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          {toastMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image Upload & Bounding Box View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Visual Intake</span>
              {previewUrl && (
                <button
                  onClick={removeImage}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Remove image
                </button>
              )}
            </div>

            {/* Drag & Drop Upload Container */}
            {!previewUrl ? (
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  dragging
                    ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                    : "border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/20"
                }`}
              >
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-white">Upload Inspection Image</h3>
                <p className="text-xs text-slate-500 mt-1 text-center">
                  Drag & drop an image file here, or browse from device
                </p>
                <small className="text-[10px] text-slate-600 mt-2 font-mono">
                  Formats: JPG, PNG · Max: 10MB
                </small>
              </div>
            ) : (
              /* Preview and Absolute Coordinates Overlap Container */
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bbox-container flex items-center justify-center bg-slate-950/50">
                <img
                  src={previewUrl}
                  alt="Inference target preview"
                  className="max-h-[500px] object-contain w-full"
                />

                {/* BBox overlays */}
                {detections.map((det, index) => {
                  const isDanger = det.risk_level === "CRITICAL" || det.risk_level === "HIGH";
                  const isWarning = det.risk_level === "MEDIUM";
                  return (
                    <div
                      key={index}
                      className={`bbox ${isDanger ? "danger" : isWarning ? "warning" : ""}`}
                      style={{
                        left: `${det.bounding_box.left}%`,
                        top: `${det.bounding_box.top}%`,
                        width: `${det.bounding_box.width}%`,
                        height: `${det.bounding_box.height}%`
                      }}
                    >
                      <span>
                        {det.class_name} · {Math.round(det.confidence * 100)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis Engine */}
        <div className="lg:col-span-1 space-y-6">
          {/* Analysis Trigger panel */}
          <div className="glass-panel p-6 border border-slate-800">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Bot className="w-4.5 h-4.5 text-cyan-400" /> AI Visual Analysis
            </h4>

            {!uploadData ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-500 text-center">
                <Bot className="w-10 h-10 text-slate-700 mb-3" />
                <h5 className="text-xs font-bold text-slate-400">Awaiting Evidence</h5>
                <p className="text-[11px] text-slate-600 mt-1 max-w-[200px]">
                  Provide a visual snapshot to start automated threat detection
                </p>
              </div>
            ) : analyzing ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
                <h5 className="text-xs font-bold text-cyan-400">AI Analysis Active</h5>
                <p className="text-[11px] text-slate-500 mt-1">
                  Parsing class coordinates & compliance guidelines
                </p>
              </div>
            ) : detections.length > 0 ? (
              /* Detections Results Breakdown */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-bold text-slate-400">Detected Signals</span>
                  <span className="text-xs font-bold text-cyan-400">{detections.length} objects</span>
                </div>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {detections.map((det, index) => (
                    <div
                      key={index}
                      className="bg-slate-950/60 border border-slate-900 p-2.5 rounded-lg flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">{det.class_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Confidence: {Math.round(det.confidence * 100)}%</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getRiskBadge(det.risk_level)}`}>
                        {det.risk_level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Ready state */
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <Bot className="w-8 h-8 text-slate-400 mb-3 bg-slate-900 p-2 rounded border border-slate-800" />
                <h5 className="text-xs font-bold text-white">Image Uploaded Successfully</h5>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[220px]">
                  Click below to verify PPE safety and flag visual risk signals.
                </p>
                <button
                  onClick={handleAnalyze}
                  className="mt-6 px-4 py-2 bg-white hover:bg-slate-200 text-slate-950 font-bold rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer w-full"
                >
                  Analyze Image <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Detections and recommendation alerts card */}
          {detections.length > 0 && (
            <div className="glass-panel p-6 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-500" /> Compliance Violations
              </h4>
              <div className="space-y-3">
                {detections
                  .filter((d) => d.risk_level !== "SAFE")
                  .map((d, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 ${getRiskCardStyle(d.risk_level)}`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-white font-bold uppercase">{d.class_name}</strong>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${getRiskBadge(d.risk_level)}`}>
                          {d.risk_level}
                        </span>
                      </div>
                      <p className="text-slate-300">
                        Visual coordinates indicate a conformance violation. Ensure mitigation protocols.
                      </p>
                      <div className="bg-slate-950/50 p-2 rounded border border-slate-900/50 flex items-start gap-2 text-[10px] text-slate-400 mt-1">
                        <Lightbulb className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>
                          <b>Recommended action:</b> Inspect area parameters and reinforce PPE requirements.
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
