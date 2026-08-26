"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Plus, Trash2, Search, RefreshCw, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

const studySchema = zod.object({
  subject: zod.string().min(2, "Subject name must be at least 2 characters").max(180, "Subject name is too long"),
  study_hours: zod.number().min(0.1, "Log at least 0.1 hours").max(24, "Maximum 24 hours per session"),
  focus_rating: zod.number().min(1).max(5),
  tools: zod.string().max(255).optional().or(zod.literal("")),
});

type StudyForm = zod.infer<typeof studySchema>;

interface StudyRecord {
  id: string;
  subject: string;
  study_hours: number;
  focus_rating: number;
  tools: string;
  focus_score: number;
  learning_risk_score: number;
  learning_risk_marker: string;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function StudyPage() {
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudyForm>({
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
    if (confirm("Are you sure you want to delete this study record?")) {
      try {
        await axios.delete(`${API_URL}/study/${id}`);
        fetchRecords();
      } catch (err) {
        console.error("Failed to delete record", err);
      }
    }
  };

  const getMarkerBadge = (marker: string) => {
    switch (marker) {
      case "SAFE":
        return "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20";
      case "LOW":
        return "bg-cyan-950/40 text-cyan-400 border border-cyan-500/20";
      case "MEDIUM":
        return "bg-yellow-950/40 text-yellow-400 border border-yellow-500/20";
      case "HIGH":
        return "bg-orange-950/40 text-orange-400 border border-orange-500/20";
      case "CRITICAL":
        return "bg-rose-950/40 text-rose-400 border border-rose-500/20";
      default:
        return "bg-slate-900 text-slate-400 border border-slate-800";
    }
  };

  // Search & Pagination filtering
  const filteredRecords = records.filter(
    (r) =>
      r.subject.toLowerCase().includes(search.toLowerCase()) ||
      r.learning_risk_marker.toLowerCase().includes(search.toLowerCase()) ||
      (r.tools && r.tools.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Retrieving Academic Ledger...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Study & Academic Data Collection</h2>
        <p className="text-sm text-slate-400 mt-1">
          Record study hours, course details, focus scores, tools used, and compute learning progress markers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form panel */}
        <div className="glass-panel p-6 border border-slate-800 lg:col-span-1 h-fit">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" /> Log Study Session
          </h4>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Subject / Course Name
              </label>
              <input
                type="text"
                placeholder="AI & Machine Learning"
                className="form-input w-full"
                {...register("subject")}
              />
              {errors.subject && (
                <p className="mt-1 text-[11px] text-red-400">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Study Hours (decimal)
              </label>
              <input
                type="number"
                placeholder="3.5"
                step="0.1"
                className="form-input w-full"
                {...register("study_hours", { valueAsNumber: true })}
              />
              {errors.study_hours && (
                <p className="mt-1 text-[11px] text-red-400">{errors.study_hours.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Focus Rating (quality)
              </label>
              <select className="form-input w-full bg-slate-950" {...register("focus_rating", { valueAsNumber: true })}>
                <option value="5">5 — Excellent Focus</option>
                <option value="4">4 — Good Focus</option>
                <option value="3">3 — Moderate</option>
                <option value="2">2 — Weak</option>
                <option value="1">1 — Very Poor</option>
              </select>
              {errors.focus_rating && (
                <p className="mt-1 text-[11px] text-red-400">{errors.focus_rating.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Tools / Software Used
              </label>
              <input
                type="text"
                placeholder="OpenCV, PyTorch, Jupyter"
                className="form-input w-full"
                {...register("tools")}
              />
              {errors.tools && (
                <p className="mt-1 text-[11px] text-red-400">{errors.tools.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 mt-2 bg-white hover:bg-slate-200 text-slate-950 font-bold rounded text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <BookOpen className="w-3.5 h-3.5" />
              )}
              Save Study Session
            </button>
          </form>
        </div>

        {/* Ledger panel */}
        <div className="glass-panel p-6 border border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Recorded Study Sessions
            </h4>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5">
                <Search className="w-3.5 h-3.5 text-slate-500" />
              </span>
              <input
                type="text"
                placeholder="Search subject or tools..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="form-input w-full pl-8 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-900 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <th className="p-3 font-semibold uppercase">Date</th>
                  <th className="p-3 font-semibold uppercase">Subject</th>
                  <th className="p-3 font-semibold uppercase text-center">Hours</th>
                  <th className="p-3 font-semibold uppercase text-center">Focus</th>
                  <th className="p-3 font-semibold uppercase">Tools</th>
                  <th className="p-3 font-semibold uppercase text-center">Risk Marker</th>
                  <th className="p-3 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No study sessions logged. Enter your focus routines to begin tracking.
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-850/20">
                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        {new Date(rec.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-bold text-white">{rec.subject}</td>
                      <td className="p-3 font-medium text-slate-300 text-center">{parseFloat(rec.study_hours as any)} hrs</td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-cyan-400">{rec.focus_rating}/5</span>
                        <div className="text-[9px] text-slate-500">Score: {Math.round(rec.focus_score)}%</div>
                      </td>
                      <td className="p-3 font-medium text-slate-300">{rec.tools || "—"}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getMarkerBadge(rec.learning_risk_marker)}`}>
                          {rec.learning_risk_marker}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded border border-transparent hover:border-rose-900/30 transition-all cursor-pointer"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-slate-400 mt-4 px-2">
              <span>
                Page <b>{page}</b> of {totalPages} ({filteredRecords.length} records)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-1.5 rounded border border-slate-800 hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="p-1.5 rounded border border-slate-800 hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
