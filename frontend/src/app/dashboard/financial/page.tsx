"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import {
  Plus,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  CircleDollarSign
} from "lucide-react";

const financialSchema = zod.object({
  monthly_income: zod.number().gt(0, "Income must be greater than zero"),
  monthly_expenses: zod.number().min(0, "Expenses cannot be negative"),
  savings_goal: zod.number().min(0, "Savings goal cannot be negative"),
  total_debt: zod.number().min(0, "Total debt cannot be negative"),
});

type FinancialForm = zod.infer<typeof financialSchema>;

interface FinancialRecord {
  id: string;
  monthly_income: number;
  monthly_expenses: number;
  savings_goal: number;
  total_debt: number;
  expense_ratio: number;
  savings_ratio: number;
  debt_ratio: number;
  risk_category: string;
  compliance_status: string;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function FinancialPage() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
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
  } = useForm<FinancialForm>({
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

  const [savedSuccess, setSavedSuccess] = useState(false);

  const onSubmit = async (data: FinancialForm) => {
    setSaving(true);
    try {
      await axios.post(`${API_URL}/financial`, data);
      reset();
      fetchRecords();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to create record", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this financial record?")) {
      try {
        await axios.delete(`${API_URL}/financial/${id}`);
        fetchRecords();
      } catch (err) {
        console.error("Failed to delete record", err);
      }
    }
  };

  const getRiskBadge = (category: string) => {
    switch (category) {
      case "LOW":
        return "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20";
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

  const getComplianceBadge = (status: string) => {
    return status === "COMPLIANT"
      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
      : "bg-rose-950/40 text-rose-400 border border-rose-500/20";
  };

  // Search & Pagination filtering
  const filteredRecords = records.filter(
    (r) =>
      r.risk_category.toLowerCase().includes(search.toLowerCase()) ||
      r.compliance_status.toLowerCase().includes(search.toLowerCase()) ||
      new Date(r.created_at).toLocaleDateString().includes(search)
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Retrieving Financial Ledger...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Financial Data Collection Module</h2>
        <p className="text-sm text-slate-400 mt-1">
          Collect monthly financial metrics, savings goals, debt, and compute automated risk category markers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form panel */}
        <div className="glass-panel p-6 border border-slate-800 lg:col-span-1 h-fit">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" /> Log Financial Entry
          </h4>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {savedSuccess && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg font-medium animate-fade-in flex items-center gap-2">
                <span>✓ Entry saved! Main dashboard graph is updated.</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Monthly Income ($)
              </label>
              <input
                type="number"
                placeholder="8000"
                step="0.01"
                className="form-input w-full"
                {...register("monthly_income", { valueAsNumber: true })}
              />
              {errors.monthly_income && (
                <p className="mt-1 text-[11px] text-red-400">{errors.monthly_income.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Monthly Expenses ($)
              </label>
              <input
                type="number"
                placeholder="4000"
                step="0.01"
                className="form-input w-full"
                {...register("monthly_expenses", { valueAsNumber: true })}
              />
              {errors.monthly_expenses && (
                <p className="mt-1 text-[11px] text-red-400">{errors.monthly_expenses.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Savings Goal ($)
              </label>
              <input
                type="number"
                placeholder="1000"
                step="0.01"
                className="form-input w-full"
                {...register("savings_goal", { valueAsNumber: true })}
              />
              {errors.savings_goal && (
                <p className="mt-1 text-[11px] text-red-400">{errors.savings_goal.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Total Debt ($)
              </label>
              <input
                type="number"
                placeholder="15000"
                step="0.01"
                className="form-input w-full"
                {...register("total_debt", { valueAsNumber: true })}
              />
              {errors.total_debt && (
                <p className="mt-1 text-[11px] text-red-400">{errors.total_debt.message}</p>
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
                <CircleDollarSign className="w-3.5 h-3.5" />
              )}
              Save Financial Record
            </button>
          </form>
        </div>

        {/* Ledger panel */}
        <div className="glass-panel p-6 border border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Recorded Financial History
            </h4>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5">
                <Search className="w-3.5 h-3.5 text-slate-500" />
              </span>
              <input
                type="text"
                placeholder="Search category/compliance..."
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
                  <th className="p-3 font-semibold uppercase">Income</th>
                  <th className="p-3 font-semibold uppercase">Expenses</th>
                  <th className="p-3 font-semibold uppercase">Debt</th>
                  <th className="p-3 font-semibold uppercase">Ratios</th>
                  <th className="p-3 font-semibold uppercase text-center">Category</th>
                  <th className="p-3 font-semibold uppercase text-center">Compliance</th>
                  <th className="p-3 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No financial records found. Log your current parameters to start.
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-850/20">
                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        {new Date(rec.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-bold text-white">${parseFloat(rec.monthly_income as any).toLocaleString()}</td>
                      <td className="p-3 font-medium text-slate-300">${parseFloat(rec.monthly_expenses as any).toLocaleString()}</td>
                      <td className="p-3 font-medium text-rose-300">${parseFloat(rec.total_debt as any).toLocaleString()}</td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        <div>Exp: {Math.round(rec.expense_ratio * 100)}%</div>
                        <div className="mt-0.5">Debt: {parseFloat(rec.debt_ratio as any).toFixed(2)}x</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getRiskBadge(rec.risk_category)}`}>
                          {rec.risk_category}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getComplianceBadge(rec.compliance_status)}`}>
                          {rec.compliance_status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded border border-transparent hover:border-rose-900/30 transition-all cursor-pointer"
                          title="Delete entry"
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
