"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import {
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Flame,
  Search,
  CheckSquare,
  Square
} from "lucide-react";

const habitSchema = zod.object({
  habit_name: zod.string().min(2, "Habit name must be at least 2 characters").max(255),
  category: zod.string().min(2, "Select a valid category"),
  completed_today: zod.boolean(),
  is_risk_associated: zod.boolean(),
});

type HabitForm = zod.infer<typeof habitSchema>;

interface HabitRecord {
  id: string;
  habit_name: string;
  category: string;
  completed_today: boolean;
  is_risk_associated: boolean;
  streak: number;
  last_completed: string | null;
  compliance_status: string;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HabitForm>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      completed_today: false,
      is_risk_associated: false,
    }
  });

  const fetchHabits = async () => {
    try {
      const res = await axios.get(`${API_URL}/habits`);
      setHabits(res.data);
    } catch (err) {
      console.error("Failed to load habits", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const onSubmit = async (data: HabitForm) => {
    setSaving(true);
    try {
      await axios.post(`${API_URL}/habits`, data);
      reset();
      fetchHabits();
    } catch (err) {
      console.error("Failed to save habit", err);
    } finally {
      setSaving(false);
    }
  };

  const toggleCompletion = async (id: string, currentCompleted: boolean, isRisk: boolean) => {
    try {
      // Toggle value
      await axios.put(`${API_URL}/habits/${id}`, {
        completed_today: !currentCompleted,
        is_risk_associated: isRisk
      });
      fetchHabits();
    } catch (err) {
      console.error("Failed to toggle completion status", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      try {
        await axios.delete(`${API_URL}/habits/${id}`);
        fetchHabits();
      } catch (err) {
        console.error("Failed to delete habit", err);
      }
    }
  };

  const getComplianceStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return "bg-emerald-950/40 text-emerald-400 border border-emerald-500/25";
      case "PARTIALLY_COMPLIANT":
        return "bg-amber-950/40 text-amber-400 border border-amber-500/25";
      case "NON_COMPLIANT":
        return "bg-rose-950/40 text-rose-400 border border-rose-500/25";
      default:
        return "bg-slate-900 text-slate-400 border border-slate-800";
    }
  };

  const filteredHabits = habits.filter(
    (h) =>
      h.habit_name.toLowerCase().includes(search.toLowerCase()) ||
      h.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Retrieving Habit Log...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Habit & Routine Compliance</h2>
        <p className="text-sm text-slate-400 mt-1">
          Track daily user habits, policy adherence, and flag potentially risk-associated behaviors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel */}
        <div className="glass-panel p-6 border border-slate-800 lg:col-span-1 h-fit">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" /> Log Daily Habit
          </h4>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Habit Name
              </label>
              <input
                type="text"
                placeholder="Code audit / PPE verification"
                className="form-input w-full"
                {...register("habit_name")}
              />
              {errors.habit_name && (
                <p className="mt-1 text-[11px] text-red-400">{errors.habit_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Category
              </label>
              <select className="form-input w-full bg-slate-950" {...register("category")}>
                <option value="">Select category</option>
                <option value="Health & Safety">Health & Safety</option>
                <option value="Financial Compliance">Financial Compliance</option>
                <option value="Study">Study</option>
                <option value="Productivity">Productivity</option>
                <option value="Security">Security</option>
                <option value="Work Compliance">Work Compliance</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-[11px] text-red-400">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950 w-4 h-4"
                  {...register("completed_today")}
                />
                Completed Today
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  className="rounded border-slate-800 bg-slate-900 text-red-500 focus:ring-red-500 focus:ring-offset-slate-950 w-4 h-4"
                  {...register("is_risk_associated")}
                />
                Flag as Risk-Associated
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 mt-4 bg-white hover:bg-slate-200 text-slate-950 font-bold rounded text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckSquare className="w-3.5 h-3.5" />
              )}
              Add Habit
            </button>
          </form>
        </div>

        {/* Ledger Panel */}
        <div className="glass-panel p-6 border border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Tracked Routine Habits
            </h4>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5">
                <Search className="w-3.5 h-3.5 text-slate-500" />
              </span>
              <input
                type="text"
                placeholder="Search habits..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input w-full pl-8 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-900 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <th className="p-3 font-semibold uppercase text-center">Complete</th>
                  <th className="p-3 font-semibold uppercase">Habit</th>
                  <th className="p-3 font-semibold uppercase">Category</th>
                  <th className="p-3 font-semibold uppercase text-center">Risk Flag</th>
                  <th className="p-3 font-semibold uppercase text-center">Streak</th>
                  <th className="p-3 font-semibold uppercase">Last Completed</th>
                  <th className="p-3 font-semibold uppercase text-center">Compliance</th>
                  <th className="p-3 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredHabits.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No habits tracked. Add a habit to begin compliance analysis.
                    </td>
                  </tr>
                ) : (
                  filteredHabits.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-850/20">
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleCompletion(rec.id, rec.completed_today, rec.is_risk_associated)}
                          className="text-slate-400 hover:text-cyan-400 transition-all cursor-pointer inline-flex items-center justify-center"
                          title={rec.completed_today ? "Mark incomplete" : "Mark complete"}
                        >
                          {rec.completed_today ? (
                            <CheckSquare className="w-5 h-5 text-cyan-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-600" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 font-bold text-white">{rec.habit_name}</td>
                      <td className="p-3 font-medium text-slate-300">{rec.category}</td>
                      <td className="p-3 text-center">
                        {rec.is_risk_associated ? (
                          <span className="inline-flex items-center justify-center p-1 bg-red-950/40 border border-red-500/20 text-red-400 rounded-full" title="Risk-Associated Behavior">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {rec.streak > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-orange-400 bg-orange-950/30 px-2 py-0.5 rounded-full border border-orange-500/20">
                            <Flame className="w-3.5 h-3.5 fill-orange-400" />
                            {rec.streak}
                          </span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        {rec.last_completed ? new Date(rec.last_completed).toLocaleDateString() : "Never"}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getComplianceStatusBadge(rec.compliance_status)}`}>
                          {rec.compliance_status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded border border-transparent hover:border-rose-900/30 transition-all cursor-pointer"
                          title="Delete habit"
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
        </div>
      </div>
    </div>
  );
}
