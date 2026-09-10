"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion } from "framer-motion";
import {
  Plus, Trash2, TrendingUp, IndianRupee, LineChart as LineChartIcon, Activity, ReceiptIndianRupee
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const financialSchema = zod.object({
  monthly_income: zod.number().gt(0, "Income must be greater than zero"),
  monthly_expenses: zod.number().min(0, "Expenses cannot be negative"),
  savings_goal: zod.number().min(0, "Savings goal cannot be negative"),
  total_debt: zod.number().min(0, "Total debt cannot be negative"),
});

type FinancialForm = zod.infer<typeof financialSchema>;

const suddenExpenseSchema = zod.object({
  amount: zod.number().gt(0, "Amount must be greater than zero"),
  category: zod.string().min(2, "Select a category"),
  note: zod.string().max(255, "Note is too long").optional(),
  expense_date: zod.string().min(1, "Expense date is required"),
});

type SuddenExpenseForm = zod.infer<typeof suddenExpenseSchema>;
interface SuddenExpense extends SuddenExpenseForm { id: string; created_at: string }
interface FinancialRecord {
  id: string;
  monthly_income: number | string;
  monthly_expenses: number | string;
  total_debt: number | string;
  compliance_status: string;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const inr = (value: number | string) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value) || 0);

export default function FinancialPage() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [suddenExpenses, setSuddenExpenses] = useState<SuddenExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSudden, setSavingSudden] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FinancialForm>({
    resolver: zodResolver(financialSchema),
  });
  const { register: registerSudden, handleSubmit: handleSuddenSubmit, reset: resetSudden, formState: { errors: suddenErrors } } = useForm<SuddenExpenseForm>({
    resolver: zodResolver(suddenExpenseSchema),
    defaultValues: { category: "Other", note: "", expense_date: new Date().toISOString().slice(0, 10) },
  });

  const fetchRecords = async () => {
    try {
      const [recordsResponse, suddenResponse] = await Promise.all([
        axios.get(`${API_URL}/financial`),
        axios.get(`${API_URL}/financial/unexpected`),
      ]);
      setRecords(recordsResponse.data);
      setSuddenExpenses(suddenResponse.data);
    } catch (err) {
      console.error("Failed to load records", err);
    } finally {
      setLoading(false);
    }
  };

  const onSuddenSubmit = async (data: SuddenExpenseForm) => {
    setSavingSudden(true);
    try {
      await axios.post(`${API_URL}/financial/unexpected`, { ...data, note: data.note || null });
      resetSudden({ category: "Other", note: "", expense_date: new Date().toISOString().slice(0, 10), amount: undefined });
      await fetchRecords();
    } catch (err) {
      console.error("Failed to create sudden expense", err);
    } finally {
      setSavingSudden(false);
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

  const handleSuddenDelete = async (id: string) => {
    if (confirm("Delete this sudden expense?")) {
      try {
        await axios.delete(`${API_URL}/financial/unexpected/${id}`);
        await fetchRecords();
      } catch (err) {
        console.error("Failed to delete sudden expense", err);
      }
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

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        
        {/* Input Terminal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel relative h-fit overflow-hidden p-6 sm:p-8 xl:col-span-1"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent pointer-events-none" />
          <h3 className="text-xl font-bold text-ink mb-6 relative z-10 flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand" /> Log Entry
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
            {[
              { label: "Monthly Income (₹)", id: "monthly_income" as const },
              { label: "Monthly Expenses (₹)", id: "monthly_expenses" as const },
              { label: "Savings Goal (₹)", id: "savings_goal" as const },
              { label: "Total Debt (₹)", id: "total_debt" as const },
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
        <div className="space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-ink flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand" /> Ledger Stream
            </h3>
            <span className="text-xs font-bold text-muted bg-canvas px-3 py-1 rounded-full border border-line">{records.length} Records</span>
          </div>

          <div className="space-y-4">
            {records.length === 0 ? (
              <div className="glass-panel p-12 text-center text-muted border-dashed border-2 flex flex-col items-center">
                <IndianRupee className="w-12 h-12 mb-4 opacity-50" />
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
                        <span className="text-sm font-black text-ink">IN: {inr(rec.monthly_income)}</span>
                        <span className="text-muted text-xs">/</span>
                        <span className="text-sm font-black text-rose-500">BASE OUT: {inr(rec.monthly_expenses)}</span>
                      </div>
                      <div className="text-[10px] text-muted font-mono uppercase">
                        Debt: {inr(rec.total_debt)} | {new Date(rec.created_at).toLocaleString()}
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

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel relative overflow-hidden p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                  <ReceiptIndianRupee className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Unexpected spending</p>
                  <h3 className="text-2xl font-black text-ink">Add a Sudden Expense</h3>
                </div>
              </div>
              <p className="text-sm leading-6 text-muted">
                Record any unplanned cost during the month. It will automatically update that month&apos;s total expenses, financial risk, and forecast.
              </p>
            </div>
            <span className="w-fit shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-500">
              Included in monthly forecast
            </span>
          </div>

          <form onSubmit={handleSuddenSubmit(onSuddenSubmit)} className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="min-w-0 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">Amount (₹)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 2500"
                className="h-12 w-full rounded-xl border border-line bg-canvas/50 px-4 text-sm text-ink outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                {...registerSudden("amount", { valueAsNumber: true })}
              />
              {suddenErrors.amount && <p className="text-xs font-semibold text-red-500">{suddenErrors.amount.message}</p>}
            </div>

            <div className="min-w-0 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">Category</label>
              <select
                className="h-12 w-full rounded-xl border border-line bg-canvas/50 px-4 text-sm text-ink outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                {...registerSudden("category")}
              >
                <option>Medical</option>
                <option>Repair</option>
                <option>Travel</option>
                <option>Family</option>
                <option>Education</option>
                <option>Emergency</option>
                <option>Other</option>
              </select>
              {suddenErrors.category && <p className="text-xs font-semibold text-red-500">{suddenErrors.category.message}</p>}
            </div>

            <div className="min-w-0 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">Expense date</label>
              <input
                type="date"
                className="h-12 w-full rounded-xl border border-line bg-canvas/50 px-4 text-sm text-ink outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                {...registerSudden("expense_date")}
              />
              {suddenErrors.expense_date && <p className="text-xs font-semibold text-red-500">{suddenErrors.expense_date.message}</p>}
            </div>

            <div className="min-w-0 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">Note (optional)</label>
              <input
                type="text"
                placeholder="Hospital bill, urgent repair..."
                className="h-12 w-full rounded-xl border border-line bg-canvas/50 px-4 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                {...registerSudden("note")}
              />
              {suddenErrors.note && <p className="text-xs font-semibold text-red-500">{suddenErrors.note.message}</p>}
            </div>

            <div className="md:col-span-2 xl:col-span-4">
              <Button type="submit" disabled={savingSudden} variant="glow" className="h-12 w-full sm:w-auto sm:min-w-60">
                <Plus className="mr-2 h-4 w-4" />
                {savingSudden ? "Saving expense..." : "Add Sudden Expense"}
              </Button>
            </div>
          </form>
        </div>
      </motion.section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold text-ink">
              <Activity className="h-5 w-5 text-amber-500" /> Sudden Expense History
            </h3>
            <p className="mt-1 text-sm text-muted">Review one-time costs already included in your financial results.</p>
          </div>
          <span className="w-fit rounded-full border border-line bg-canvas px-3 py-1 text-xs font-bold text-muted">
            {suddenExpenses.length} {suddenExpenses.length === 1 ? "Record" : "Records"}
          </span>
        </div>

        {suddenExpenses.length === 0 ? (
          <div className="glass-panel flex min-h-48 flex-col items-center justify-center border-2 border-dashed p-10 text-center text-muted">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <ReceiptIndianRupee className="h-7 w-7" />
            </span>
            <p className="text-lg font-bold text-ink">No sudden expenses recorded</p>
            <p className="mt-1 max-w-md text-sm">New expenses will appear here with their amount, category, date, and note.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {suddenExpenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="glass-panel flex min-w-0 items-center justify-between gap-4 p-5 transition-colors hover:bg-canvas/50"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-black text-rose-500">{inr(expense.amount)}</p>
                    <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-black uppercase text-amber-600">
                      {expense.category}
                    </span>
                  </div>
                  <p className="mt-1 break-words text-xs text-muted">
                    {new Date(`${expense.expense_date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    {expense.note ? ` · ${expense.note}` : ""}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-emerald-600">Included in the month&apos;s total expenses</p>
                </div>
                <button
                  onClick={() => handleSuddenDelete(expense.id)}
                  className="shrink-0 rounded-lg p-2 text-muted transition hover:bg-rose-500/10 hover:text-rose-500"
                  aria-label="Delete sudden expense"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
