"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion } from "framer-motion";
import {
  Plus, Trash2, BookOpen, Brain, Zap, Target
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const studySchema = zod.object({
  subject: zod.string().min(2, "Subject name must be at least 2 characters").max(180, "Subject name is too long"),
  study_hours: zod.number().min(0.1, "Log at least 0.1 hours").max(24, "Maximum 24 hours per session"),
  focus_rating: zod.number().min(1).max(5),
  tools: zod.string().max(255).optional().or(zod.literal("")),
});

type StudyForm = zod.infer<typeof studySchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function StudyPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StudyForm>({
    resolver: zodResolver(studySchema),
  });

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${API_URL}/study`);
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to load study sessions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const onSubmit = async (data: StudyForm) => {
    setSaving(true);
    try {
      await axios.post(`${API_URL}/study`, data);
      reset();
      fetchRecords();
    } catch (err) {
      console.error("Failed to save session", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this study record?")) {
      try {
        await axios.delete(`${API_URL}/study/${id}`);
        fetchRecords();
      } catch (err) {
        console.error("Failed to delete record", err);
      }
    }
  };

  if (loading) return <div className="p-8 text-brand animate-pulse">Syncing Academic Ledger...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="relative glass-panel p-8 md:p-12 overflow-hidden bg-gradient-to-br from-indigo-500/10 to-transparent border-none ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none -z-10 transform translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-4">
              <Brain className="w-4 h-4" /> Cognitive Matrix
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tight mb-2">Academic Deep Dive</h1>
            <p className="text-muted text-lg max-w-xl">
              Log study hours, track intense focus sessions, and monitor cognitive engagement levels.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Terminal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 glass-panel p-6 sm:p-8 h-fit relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent pointer-events-none" />
          <h3 className="text-xl font-bold text-ink mb-6 relative z-10 flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand" /> Log Session
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Subject</label>
              <input
                type="text"
                placeholder="AI & Machine Learning"
                className="w-full h-11 pl-4 pr-4 bg-canvas/50 border border-line rounded-xl text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-brand/50"
                {...register("subject")}
              />
              {errors.subject && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.subject.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Hours</label>
              <input
                type="number"
                step="0.1"
                placeholder="2.5"
                className="w-full h-11 pl-4 pr-4 bg-canvas/50 border border-line rounded-xl text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-brand/50"
                {...register("study_hours", { valueAsNumber: true })}
              />
              {errors.study_hours && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.study_hours.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Focus Rating</label>
              <select 
                className="w-full h-11 pl-4 pr-4 bg-canvas/50 border border-line rounded-xl text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-brand/50"
                {...register("focus_rating", { valueAsNumber: true })}
              >
                <option value="5">5 — Hyper Focus</option>
                <option value="4">4 — Deep Work</option>
                <option value="3">3 — Moderate</option>
                <option value="2">2 — Distracted</option>
                <option value="1">1 — Minimal</option>
              </select>
              {errors.focus_rating && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.focus_rating.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Tools (Optional)</label>
              <input
                type="text"
                placeholder="PyTorch, Jupyter"
                className="w-full h-11 pl-4 pr-4 bg-canvas/50 border border-line rounded-xl text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-brand/50"
                {...register("tools")}
              />
            </div>
            
            <Button type="submit" disabled={saving} variant="glow" className="w-full mt-4">
              {saving ? "Syncing..." : "Commit Session"}
            </Button>
          </form>
        </motion.div>

        {/* Ledger Display */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-ink flex items-center gap-2">
              <Target className="w-5 h-5 text-brand" /> Logged Sessions
            </h3>
            <span className="text-xs font-bold text-muted bg-canvas px-3 py-1 rounded-full border border-line">{records.length} Records</span>
          </div>

          <div className="space-y-4">
            {records.length === 0 ? (
              <div className="glass-panel p-12 text-center text-muted border-dashed border-2 flex flex-col items-center">
                <BookOpen className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-semibold text-lg">No Academic Data Logged</p>
                <p className="text-sm mt-1">Initialize your cognitive ledger using the terminal.</p>
              </div>
            ) : (
              records.map((rec, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={rec.id} 
                  className="glass-panel p-5 group flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden hover:bg-canvas/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black text-ink">{rec.subject}</span>
                        <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-md">{rec.study_hours} hrs</span>
                      </div>
                      <div className="text-[10px] text-muted font-mono uppercase">
                        Focus Rating: {rec.focus_rating}/5 | Score: {Math.round(rec.focus_score)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                      rec.learning_risk_marker === "SAFE" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
                    }`}>
                      {rec.learning_risk_marker}
                    </span>
                    <button 
                      onClick={() => handleDelete(rec.id)}
                      className="p-1.5 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
