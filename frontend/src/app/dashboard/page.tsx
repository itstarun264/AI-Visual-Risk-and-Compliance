"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import {
  CircleDollarSign,
  BookOpen,
  CheckSquare,
  ShieldAlert,
  Server,
  AlertTriangle,
  RefreshCw,
  Bell,
  Check,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Activity,
  Cpu,
  Layers,
  ShieldCheck,
  Terminal,
  ArrowRight,
  Plus
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface DashboardSummary {
  financial_count: number;
  study_count: number;
  habit_count: number;
  compliance_score: number;
  overall_risk_score: number;
  overall_risk_level: string;
  active_risks_count: number;
  high_risks_count: number;
  financial_risk_score?: number;
  academic_risk_score?: number;
  behavioral_risk_score?: number;
  visual_risk_score?: number;
}

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

interface Alert {
  id: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  timestamp: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action_type: string;
  endpoint: string;
  ip_address: string;
  status_code: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Dynamic colors for Recharts based on theme
  const gridStroke = theme === "dark" ? "#1e293b" : "#e2e8f0";
  const textStroke = theme === "dark" ? "#94a3b8" : "#64748b";
  const tooltipBg = theme === "dark" ? "#0f172a" : "#ffffff";
  const tooltipBorder = theme === "dark" ? "#1e293b" : "#cbd5e1";
  const tooltipText = theme === "dark" ? "#f1f5f9" : "#1e293b";

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, alertsRes, auditRes, financialRes] = await Promise.allSettled([
        axios.get(`${API_URL}/dashboard/summary`),
        axios.get(`${API_URL}/alerts`),
        axios.get(`${API_URL}/audit?limit=6`),
        axios.get(`${API_URL}/financial`),
      ]);

      if (summaryRes.status === "fulfilled" && summaryRes.value?.data) {
        setSummary(summaryRes.value.data);
      }
      if (alertsRes.status === "fulfilled" && Array.isArray(alertsRes.value?.data)) {
        setAlerts(alertsRes.value.data.filter((a: Alert) => a.status === "UNREAD"));
      }
      if (auditRes.status === "fulfilled" && Array.isArray(auditRes.value?.data)) {
        setActivities(auditRes.value.data);
      }
      if (financialRes.status === "fulfilled" && Array.isArray(financialRes.value?.data)) {
        setFinancialRecords(financialRes.value.data);
      }
    } catch (err) {
      console.error("Error loading dashboard data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const resolveAlert = async (id: string) => {
    try {
      await axios.put(`${API_URL}/alerts/${id}`, { status: "RESOLVED" });
      setAlerts(alerts.filter((a) => a.id !== id));
      fetchData();
    } catch (err) {
      console.error("Failed to resolve alert", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <div className="absolute w-12 h-12 border-2 border-dashed border-indigo-500/30 rounded-full animate-spin-reverse"></div>
        </div>
        <span className="mt-6 text-xs font-mono uppercase tracking-widest text-slate-550 dark:text-slate-400">
          Syncing Metrics Ledger...
        </span>
      </div>
    );
  }

  const riskData = [
    { name: "Financial", Score: summary?.financial_risk_score ?? (summary?.overall_risk_score ? Math.round(summary.overall_risk_score * 0.9) : 15) },
    { name: "Academic", Score: summary?.academic_risk_score ?? (summary?.overall_risk_score ? Math.round(summary.overall_risk_score * 0.7) : 25) },
    { name: "Behavioral", Score: summary?.behavioral_risk_score ?? (summary?.overall_risk_score ? Math.round(summary.overall_risk_score * 0.8) : 20) },
    { name: "Visual", Score: summary?.visual_risk_score ?? (summary?.overall_risk_score ? Math.round(summary.overall_risk_score * 0.6) : 10) },
  ];

  // Aggregate and sum all financial records per calendar month
  const monthlyMap: { [key: string]: { month: string; timestamp: number; Income: number; Expenses: number; Debt: number; count: number } } = {};

  financialRecords
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .forEach((rec) => {
      const d = new Date(rec.created_at);
      if (!isNaN(d.getTime())) {
        const yearMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const monthLabel = d.toLocaleString("en-US", { month: "long" });

        if (!monthlyMap[yearMonthKey]) {
          monthlyMap[yearMonthKey] = {
            month: monthLabel,
            timestamp: d.getTime(),
            Income: 0,
            Expenses: 0,
            Debt: 0,
            count: 0,
          };
        }

        monthlyMap[yearMonthKey].Income += Number(rec.monthly_income) || 0;
        monthlyMap[yearMonthKey].Expenses += Number(rec.monthly_expenses) || 0;
        monthlyMap[yearMonthKey].Debt += Number(rec.total_debt) || 0;
        monthlyMap[yearMonthKey].count += 1;
        monthlyMap[yearMonthKey].timestamp = d.getTime();
      }
    });

  const financialTrendData = Object.values(monthlyMap)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-6);

  const getRiskColorClass = (level: string = "LOW") => {
    switch (level) {
      case "SAFE": return "text-emerald-500 dark:text-emerald-400";
      case "LOW": return "text-blue-500 dark:text-blue-450";
      case "MEDIUM": return "text-amber-500 dark:text-amber-450";
      case "HIGH": return "text-orange-500 dark:text-orange-450";
      case "CRITICAL": return "text-rose-500 dark:text-rose-400";
      default: return "text-slate-400";
    }
  };

  const getRiskBgClass = (level: string = "LOW") => {
    switch (level) {
      case "SAFE": return "bg-emerald-500/10 border-emerald-500/25";
      case "LOW": return "bg-blue-500/10 border-blue-500/25";
      case "MEDIUM": return "bg-amber-500/10 border-amber-500/25";
      case "HIGH": return "bg-orange-500/10 border-orange-500/25";
      case "CRITICAL": return "bg-rose-500/10 border-rose-500/25";
      default: return "bg-slate-500/10 border-slate-500/25";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HUD Welcome Header */}
      <section className="glass-panel relative overflow-hidden p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-white to-indigo-50/60 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-indigo-950/15">
        {/* Glow & grid overlay */}
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/5 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Vantage HUD Terminal
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Operational Overview, <span className="bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-405 bg-clip-text text-transparent">{user?.name?.split(" ")[0] || "Inspector"}</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
              Monitoring client signals across financial indexes, study performance modules, and daily compliance habit routines.
            </p>
          </div>
          
          <button 
            onClick={handleRefresh} 
            disabled={refreshing} 
            className="shrink-0 self-start md:self-center inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-5 py-3 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/10 dark:shadow-indigo-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            title="Click to refresh all metrics and graphs"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> 
            Refresh Data
          </button>
        </div>
      </section>

      {/* Grid of 4 glowing pods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Financial */}
        <Link href="/dashboard/financial" className="glass-panel p-6 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-emerald-500/[0.02] to-teal-500/[0.02] hover:border-emerald-500/40 dark:hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/[0.05] transition-all duration-300 group block cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Financial Ledger</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CircleDollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white font-manrope">{summary?.financial_count ?? 0}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">records</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-2/3" />
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span>LEDGER_OK</span>
            <span className="text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> View Data &rarr;</span>
          </div>
        </Link>

        {/* Card 2: Study Focus */}
        <Link href="/dashboard/study" className="glass-panel p-6 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-500/[0.02] to-cyan-500/[0.02] hover:border-indigo-500/40 dark:hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/[0.05] transition-all duration-300 group block cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Focus Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white font-manrope">{summary?.study_count ?? 0}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">items</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full w-1/2" />
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span>SESSIONS_SYNC</span>
            <span className="text-indigo-500 flex items-center gap-0.5">View Data &rarr;</span>
          </div>
        </Link>

        {/* Card 3: Habits monitored */}
        <Link href="/dashboard/habits" className="glass-panel p-6 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-violet-500/[0.02] to-fuchsia-500/[0.02] hover:border-violet-500/40 dark:hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/[0.05] transition-all duration-300 group block cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Habits Streaks</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white font-manrope">{summary?.habit_count ?? 0}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">routines</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-violet-500 h-full rounded-full w-[80%]" />
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span>ROUTINE_COMPLIANT</span>
            <span className="text-violet-500">View Data &rarr;</span>
          </div>
        </Link>

        {/* Card 4: Threats */}
        <Link href="/dashboard/audit" className="glass-panel p-6 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-rose-500/[0.02] to-orange-500/[0.02] hover:border-rose-500/40 dark:hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/[0.05] transition-all duration-300 group block cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Safety Violations</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-450 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <h3 className="text-3xl font-black text-rose-500 dark:text-rose-400 font-manrope">{summary?.active_risks_count ?? 0}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">hazards</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full w-1/4 animate-pulse" />
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span>RISK_FACTOR: HIGH</span>
            <span className="text-rose-500 font-bold">{summary?.high_risks_count ?? 0} Critical</span>
          </div>
        </Link>
      </div>

      {/* Interactive Detail Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Services Monitor Panel */}
        <div className="glass-panel p-6 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
              <div>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Metadata ledger</span>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase mt-0.5 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-500" /> Services Monitor
                </h4>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-550 dark:text-indigo-400 rounded border border-indigo-500/25">HEALTH: 100%</span>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">FastAPI Gateway</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-555 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>Online</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">SQLite DB engine</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-555 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>Active</span>
              </div>


              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Session Auth token</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-555 dark:text-emerald-400 font-bold">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conformity Score Circular Widget */}
        <div className="glass-panel p-6 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
              <div>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Compliance metrics</span>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase mt-0.5">Conformity score</h4>
              </div>
            </div>
          </div>

          <div className="my-auto py-6 flex flex-col items-center justify-center">
            {/* Visual SVG Dial */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" className="stroke-slate-100 dark:stroke-slate-900" strokeWidth="6" fill="transparent" />
                <circle cx="56" cy="56" r="48" className="stroke-indigo-650 dark:stroke-indigo-550" strokeWidth="8" fill="transparent"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - (summary?.compliance_score ?? 100) / 100)}
                  strokeLinecap="round" />
              </svg>
              <div className="text-center">
                <span className="text-2xl font-black text-slate-850 dark:text-white font-manrope">{summary?.compliance_score ?? 100}%</span>
                <span className="text-[8px] text-slate-500 uppercase block font-bold tracking-wider">Score</span>
              </div>
            </div>

            <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 mt-6 max-w-[200px]">
              {summary?.compliance_score && summary.compliance_score >= 75 ? (
                <span className="text-emerald-500 font-semibold">✓ Safe parameters satisfied. Ledger conforms with guidelines.</span>
              ) : (
                <span className="text-amber-500 font-semibold">⚠ Policy warnings triggered. Remediation required.</span>
              )}
            </p>
          </div>
        </div>

        {/* Global Risk Hazard Panel */}
        <div className="glass-panel p-6 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
              <div>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Security ratio</span>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase mt-0.5">Global Risk Profile</h4>
              </div>
            </div>
          </div>

          <div className="my-auto py-6 flex flex-col justify-center">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">Threat Severity</span>
              <strong className="text-3xl font-black text-slate-900 dark:text-white font-manrope">{summary?.overall_risk_score ?? 0}%</strong>
            </div>

            {/* Glowing gradient progress bar */}
            <div className="w-full bg-slate-105 dark:bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800 relative">
              <div
                className="bg-gradient-to-r from-indigo-500 via-amber-500 to-rose-500 h-full rounded-full transition-all duration-505"
                style={{ width: `${summary?.overall_risk_score ?? 0}%` }}
              ></div>
            </div>

            <div className={`mt-6 p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${getRiskBgClass(summary?.overall_risk_level)}`}>
              <ShieldAlert className={`w-4 h-4 shrink-0 ${getRiskColorClass(summary?.overall_risk_level)}`} />
              <div>
                <span className="text-[9px] text-slate-550 dark:text-slate-400 uppercase block font-bold">Threat Level Assessment</span>
                <h5 className={`font-bold uppercase mt-0.5 ${getRiskColorClass(summary?.overall_risk_level)}`}>
                  {summary?.overall_risk_level || "SAFE"}
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Charts Segment */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Risk Assessment */}
          <div className="glass-panel p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Risk Assessment category scores
                </h4>
                <span className="text-[10px] font-mono text-slate-500">Live AI Vector Analysis</span>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData}>
                    <defs>
                      <linearGradient id="riskBarBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.85} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="riskBarIndigo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.85} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="riskBarViolet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.85} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="riskBarRose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.85} />
                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="name" stroke={textStroke} fontSize={10} tickLine={false} />
                    <YAxis stroke={textStroke} fontSize={10} domain={[0, 100]} tickLine={false} />
                    <Tooltip
                      formatter={(value: any) => [`${value}%`, "Risk Score"]}
                      contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: "8px", fontSize: "11px" }}
                    />
                    <Bar dataKey="Score" radius={[4, 4, 0, 0]}>
                      {riskData.map((entry, index) => {
                        const fills = ["url(#riskBarBlue)", "url(#riskBarIndigo)", "url(#riskBarViolet)", "url(#riskBarRose)"];
                        return <Cell key={`cell-${index}`} fill={fills[index % fills.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card 2: Financial logs */}
          <div className="glass-panel p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Financial parameter trends
                </h4>
                <Link
                  href="/dashboard/financial"
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  Manage Ledger &rarr;
                </Link>
              </div>

              {financialTrendData.length === 0 ? (
                <div className="h-60 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
                  <CircleDollarSign className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Financial Records Logged</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    Log your income, expenses, savings, and debt to see your real historical trends graph.
                  </p>
                  <Link
                    href="/dashboard/financial"
                    className="mt-3 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Financial Entry
                  </Link>
                </div>
              ) : (
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialTrendData}>
                      <defs>
                        <linearGradient id="incomeGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.15} />
                        </linearGradient>
                        <linearGradient id="expensesGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.15} />
                        </linearGradient>
                        <linearGradient id="debtGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0.15} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke={gridStroke} vertical={false} />
                      <XAxis dataKey="month" stroke={textStroke} fontSize={10} tickLine={false} />
                      <YAxis stroke={textStroke} fontSize={10} tickLine={false} tickFormatter={(val) => `$${val}`} />
                      <Tooltip
                        formatter={(value: any, name: any) => [`$${Number(value).toLocaleString()}`, name]}
                        contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: "8px", fontSize: "11px" }}
                      />
                      <Bar dataKey="Income" fill="url(#incomeGlow)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Expenses" fill="url(#expensesGlow)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Debt" fill="url(#debtGlow)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alerts & terminal logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active alert logs panel */}
        <div className="glass-panel p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-900 pb-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-rose-555 animate-bounce" /> Active Alert Notices
              </h4>
              <span className="px-2 py-0.5 text-[9px] bg-rose-500/10 text-rose-605 dark:text-rose-400 border border-rose-500/20 rounded font-bold uppercase">
                {alerts.length} Pending
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="py-14 flex flex-col items-center justify-center text-slate-500">
                <Check className="w-8 h-8 text-emerald-500 bg-emerald-500/10 p-1.5 rounded-full border border-emerald-500/25 mb-3" />
                <p className="text-xs font-semibold text-slate-550 dark:text-slate-400">No active deviations logged.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-xl flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-slate-800 dark:text-white">{alert.title}</h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{alert.description}</p>
                        <span className="text-[9px] text-slate-450 dark:text-slate-500 block mt-1.5 font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="text-[9px] bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 uppercase shadow-sm"
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Audit Log Panel - Styled as Terminal Output */}
        <div className="glass-panel p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between bg-slate-950/[0.01] dark:bg-slate-950/[0.15]">
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-900 pb-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-500" /> PostgreSQL Audit Terminal
              </h4>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-[9px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
                Sync Log
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200/50 dark:border-slate-900/60 p-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200 dark:border-slate-900 font-mono text-[9px] uppercase tracking-wider">
                    <th className="pb-2 pl-2 font-bold">Time</th>
                    <th className="pb-2 font-bold">Action</th>
                    <th className="pb-2 font-bold">Route</th>
                    <th className="pb-2 pr-2 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                  {activities.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 font-mono">
                        No audit items recorded.
                      </td>
                    </tr>
                  ) : (
                    activities.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition-colors font-mono text-[10px]">
                        <td className="py-3 pl-2 text-slate-450 dark:text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 font-semibold text-slate-700 dark:text-slate-350">{log.action_type}</td>
                        <td className="py-3 text-slate-550 dark:text-slate-405 max-w-[120px] truncate" title={log.endpoint}>
                          {log.endpoint}
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                              log.status_code < 300
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
                                : "bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/10"
                            }`}
                          >
                            {log.status_code}
                          </span>
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
    </div>
  );
}
