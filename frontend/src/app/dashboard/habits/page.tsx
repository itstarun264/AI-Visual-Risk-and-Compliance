"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion } from "framer-motion";
import {
  Plus, Trash2, CheckCircle, AlertTriangle, RefreshCw, Flame, CheckSquare, Square, Target
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const habitSchema = zod.object({
  habit_name: zod.string().min(2, "Habit name must be at least 2 characters").max(255),
  category: zod.string().min(2, "Select a valid category"),
  completed_today: zod.boolean(),
  is_risk_associated: zod.boolean(),
});

type HabitForm = zod.infer<typeof habitSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function HabitsPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<HabitForm>({
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
    if (confirm("Delete this habit?")) {
      try {
        await axios.delete(`${API_URL}/habits/${id}`);
        fetchHabits();
      } catch (err) {
        console.error("Failed to delete habit", err);
      }
    }
  };

  if (loading) return <div className="p-8 text-brand animate-pulse">Syncing Habits...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="relative glass-panel p-8 md:p-12 overflow-hidden bg-gradient-to-br from-violet-500/10 to-transparent border-none ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/20 blur-[120px] rounded-full pointer-events-none -z-10 transform translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 text-xs font-bold uppercase tracking-widest mb-4">
              <CheckCircle className="w-4 h-4" /> Routine Tracking
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tight mb-2">Behavioral Sync</h1>
            <p className="text-muted text-lg max-w-xl">
              Monitor daily habits, enforce policy adherence, and flag risk-associated behaviors automatically.
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
            <Plus className="w-5 h-5 text-brand" /> New Habit
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Habit Name</label>
              <input
                type="text"
                placeholder="Morning Audit"
                className="w-full h-11 pl-4 pr-4 bg-canvas/50 border border-line rounded-xl text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-brand/50"
                {...register("habit_name")}
              />
              {errors.habit_name && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.habit_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Category</label>
              <select 
                className="w-full h-11 pl-4 pr-4 bg-canvas/50 border border-line rounded-xl text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-brand/50"
                {...register("category")}
              >
                <option value="">Select Category</option>
                <option value="Health & Safety">Health & Safety</option>
                <option value="Productivity">Productivity</option>
                <option value="Security">Security</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.category.message}</p>}
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-ink p-3 rounded-xl border border-line hover:border-brand/30 transition-all">
                <input
                  type="checkbox"
                  className="rounded border-slate-800 text-brand focus:ring-brand w-5 h-5"
                  {...register("completed_today")}
                />
                Completed Today
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-ink p-3 rounded-xl border border-line hover:border-rose-500/30 transition-all">
                <input
                  type="checkbox"
                  className="rounded border-slate-800 text-rose-500 focus:ring-rose-500 w-5 h-5"
                  {...register("is_risk_associated")}
                />
                Risk Associated Behavior
              </label>
            </div>
            
            <Button type="submit" disabled={saving} variant="glow" className="w-full mt-4">
              {saving ? "Syncing..." : "Add Habit"}
            </Button>
          </form>
        </motion.div>

        {/* Habits Display */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-ink flex items-center gap-2">
              <Target className="w-5 h-5 text-brand" /> Active Routines
            </h3>
            <span className="text-xs font-bold text-muted bg-canvas px-3 py-1 rounded-full border border-line">{habits.length} Habits</span>
          </div>

          <div className="space-y-4">
            {habits.length === 0 ? (
              <div className="glass-panel p-12 text-center text-muted border-dashed border-2 flex flex-col items-center">
                <CheckSquare className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-semibold text-lg">No Habits Tracked</p>
                <p className="text-sm mt-1">Start tracking your routines.</p>
              </div>
            ) : (
              habits.map((rec, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={rec.id} 
                  className={`glass-panel p-5 group flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden transition-all ${
                    rec.completed_today ? 'border-brand/30 shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'hover:bg-canvas/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleCompletion(rec.id, rec.completed_today, rec.is_risk_associated)}
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all hover:scale-105 active:scale-95 bg-canvas"
                      style={{ borderColor: rec.completed_today ? 'var(--brand)' : 'var(--line)' }}
                    >
                      {rec.completed_today ? <CheckSquare className="w-6 h-6 text-brand" /> : <Square className="w-6 h-6 text-muted" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-black ${rec.completed_today ? 'text-ink' : 'text-muted'}`}>{rec.habit_name}</span>
                        {rec.is_risk_associated && (
                          <span className="flex items-center gap-1 bg-rose-500/10 text-rose-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/20 uppercase tracking-widest">
                            <AlertTriangle className="w-3 h-3" /> Risk
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted font-mono uppercase flex items-center gap-2">
                        {rec.category} 
                        <span className="w-1 h-1 rounded-full bg-muted" />
                        {rec.last_completed ? new Date(rec.last_completed).toLocaleDateString() : "Never"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                    {rec.streak > 0 && (
                      <span className="inline-flex items-center gap-1 font-bold text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 text-xs">
                        <Flame className="w-4 h-4 fill-orange-500" />
                        {rec.streak} Day{rec.streak > 1 ? 's' : ''}
                      </span>
                    )}
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
