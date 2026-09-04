"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion } from "framer-motion";
import {
  Plus, Trash2, TrendingUp, CircleDollarSign, LineChart as LineChartIcon, Activity
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const financialSchema = zod.object({
  monthly_income: zod.number().gt(0, "Income must be greater than zero"),
  monthly_expenses: zod.number().min(0, "Expenses cannot be negative"),
  savings_goal: zod.number().min(0, "Savings goal cannot be negative"),
  total_debt: zod.number().min(0, "Total debt cannot be negative"),
});

type FinancialForm = zod.infer<typeof financialSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function FinancialPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FinancialForm>({
    resolver: zodResolver(financialSchema),
  });

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${API_URL}/financial`);
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to load records", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const onSubmit = async (data: FinancialForm) => {
    setSaving(true);
    try {
      await axios.post(`${API_URL}/financial`, data);
      reset();
      fetchRecords();
    } catch (err) {
      console.error("Failed to create record", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this financial record?")) {
      try {
        await axios.delete(`${API_URL}/financial/${id}`);
        fetchRecords();
      } catch (err) {
        console.error("Failed to delete record", err);
      }
    }
  };

  if (loading) return <div className="p-8 text-brand animate-pulse">Syncing Ledger...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      
      {/* Header Section */}
      <div className="relative glass-panel p-8 md:p-12 overflow-hidden bg-gradient-to-br from-emerald-500/10 to-transparent border-none ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none -z-10 transform translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-4">
              <LineChartIcon className="w-4 h-4" /> Financial Matrix
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tight mb-2">Wealth Diagnostics</h1>
            <p className="text-muted text-lg max-w-xl">
              Track cash flow, detect runaway expenses, and run AI-based risk scoring on your enterprise ledger.
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
            <Plus className="w-5 h-5 text-brand" /> Log Entry
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
            {[
              { label: "Monthly Income ($)", id: "monthly_income" as const },
              { label: "Monthly Expenses ($)", id: "monthly_expenses" as const },
              { label: "Savings Goal ($)", id: "savings_goal" as const },
              { label: "Total Debt ($)", id: "total_debt" as const },
            ].map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">{field.label}</label>
                <div className="relative group/input">
                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-11 pl-4 pr-4 bg-canvas/50 border border-line rounded-xl text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all group-hover/input:border-brand/50"
                    {...register(field.id, { valueAsNumber: true })}
                  />
                </div>
                {errors[field.id] && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors[field.id]?.message}</p>}
              </div>
            ))}
            
            <Button type="submit" disabled={saving} variant="glow" className="w-full mt-4">
              {saving ? "Syncing..." : "Commit Record"}
            </Button>
          </form>
        </motion.div>

        {/* Ledger Display */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-ink flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand" /> Ledger Stream
            </h3>
            <span className="text-xs font-bold text-muted bg-canvas px-3 py-1 rounded-full border border-line">{records.length} Records</span>
          </div>

          <div className="space-y-4">
            {records.length === 0 ? (
              <div className="glass-panel p-12 text-center text-muted border-dashed border-2 flex flex-col items-center">
                <CircleDollarSign className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-semibold text-lg">No Financial Data Logged</p>
                <p className="text-sm mt-1">Initialize your ledger using the terminal.</p>
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
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black text-ink">IN: ${parseFloat(rec.monthly_income).toLocaleString()}</span>
                        <span className="text-muted text-xs">/</span>
                        <span className="text-sm font-black text-rose-500">OUT: ${parseFloat(rec.monthly_expenses).toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-muted font-mono uppercase">
                        Debt: ${parseFloat(rec.total_debt).toLocaleString()} | {new Date(rec.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                      rec.compliance_status === "COMPLIANT" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    }`}>
                      {rec.compliance_status}
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
