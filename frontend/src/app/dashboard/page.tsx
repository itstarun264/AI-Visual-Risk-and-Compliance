"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { motion, type Variants } from "framer-motion";
import {
  Activity, Sparkles, ShieldCheck,
  Terminal, ShieldAlert, ArrowUpRight,
  TrendingUp, CircleDollarSign, BookOpen, CheckSquare, Target
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import { DataSourceSwitch } from "@/components/DataSourceSwitch";
import { useDataSource } from "@/context/DataSourceContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface DashboardSummary {
  financial_count: number;
  study_count: number;
  habit_count: number;
  compliance_score: number;
  overall_risk_score: number;
  financial_risk_score: number;
  academic_risk_score: number;
  behavioral_risk_score: number;
  alert_count?: number;
}

interface AlertItem { status: string }
interface ActivityItem { action_type: string; timestamp: string; endpoint: string; status_code: number }
interface FinancialRecordItem { created_at: string; monthly_income: string | number; monthly_expenses: string | number }
interface UnexpectedExpenseItem { expense_date: string; amount: string | number }
interface DatasetSeriesItem { month: string; income: number; expenses: number }
interface DatasetDashboardResponse { summary: DashboardSummary; monthly_series: DatasetSeriesItem[] }

export default function DashboardPage() {
  const { user } = useAuth();
  const { source, activeDatasetId, activeDataset } = useDataSource();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecordItem[]>([]);
  const [unexpectedExpenses, setUnexpectedExpenses] = useState<UnexpectedExpenseItem[]>([]);
  const [datasetSeries, setDatasetSeries] = useState<DatasetSeriesItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setSummary(null);
      try {
        if (source === "dataset") {
          setAlerts([]);
          setActivities([]);
          setFinancialRecords([]);
          setUnexpectedExpenses([]);
          setDatasetSeries([]);
          if (!activeDatasetId) return;
          const response = await axios.get<DatasetDashboardResponse>(`${API_URL}/datasets/${activeDatasetId}/dashboard-analysis`);
          if (cancelled) return;
          setSummary(response.data.summary);
          setDatasetSeries(response.data.monthly_series ?? []);
          return;
        }
        setDatasetSeries([]);
        const [summaryRes, alertsRes, auditRes, finRes, unexpectedRes] = await Promise.allSettled([
          axios.get(`${API_URL}/dashboard/summary`),
          axios.get(`${API_URL}/alerts`),
          axios.get(`${API_URL}/audit?limit=5`),
          axios.get(`${API_URL}/financial`),
          axios.get(`${API_URL}/financial/unexpected`),
        ]);

        if (cancelled) return;
        if (summaryRes.status === "fulfilled") setSummary(summaryRes.value.data);
        if (alertsRes.status === "fulfilled") setAlerts((alertsRes.value.data as AlertItem[]).filter((alert) => alert.status === "UNREAD"));
        if (auditRes.status === "fulfilled") setActivities(auditRes.value.data);
        if (finRes.status === "fulfilled") setFinancialRecords(finRes.value.data);
        if (unexpectedRes.status === "fulfilled") setUnexpectedExpenses(unexpectedRes.value.data);
      } catch (err) {
        if (!cancelled) console.error("Error loading dashboard data", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
    return () => {
      cancelled = true;
    };
  }, [user, source, activeDatasetId]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Generate Area chart data (Grouped by Month)
  const groupedData = financialRecords.reduce<Record<string, { Income: number; Expenses: number; sortKey: number }>>((acc, r) => {
    const date = new Date(r.created_at);
    // Group by Month and Year
    const monthYear = date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    if (!acc[monthYear]) {
      // Use sortKey initialized to a date in that month for proper chronological sorting later
      acc[monthYear] = { Income: 0, Expenses: 0, sortKey: new Date(date.getFullYear(), date.getMonth(), 1).getTime() };
    }
    acc[monthYear].Income += Number(r.monthly_income);
    acc[monthYear].Expenses += Number(r.monthly_expenses);
    return acc;
  }, {});
  unexpectedExpenses.forEach((expense) => {
    const date = new Date(`${expense.expense_date}T00:00:00`);
    const monthYear = date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
    if (!groupedData[monthYear]) groupedData[monthYear] = { Income: 0, Expenses: 0, sortKey: new Date(date.getFullYear(), date.getMonth(), 1).getTime() };
    groupedData[monthYear].Expenses += Number(expense.amount);
  });

  const userChartData = Object.entries(groupedData)
    .map(([name, data]) => ({ name, Income: data.Income, Expenses: data.Expenses, sortKey: data.sortKey }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(-12); // Show up to 12 months
  const chartData = source === "dataset" ? datasetSeries.map((item) => ({ name: item.month, Income: item.income, Expenses: item.expenses })) : userChartData;
  const hasDashboardData = Boolean(summary && (summary.financial_count || summary.study_count || summary.habit_count));

  // Generate Radar Chart Data
  const radarData = [
    { subject: 'Financial Health', A: summary?.financial_count ? Math.max(0, 100 - (summary?.financial_risk_score ?? 0)) : 0, fullMark: 100 },
    { subject: 'Study Focus', A: summary?.study_count ? Math.max(0, 100 - (summary?.academic_risk_score ?? 0)) : 0, fullMark: 100 },
    { subject: 'Habit Consistency', A: summary?.habit_count ? Math.max(0, 100 - (summary?.behavioral_risk_score ?? 0)) : 0, fullMark: 100 },
    { subject: 'Compliance', A: hasDashboardData ? summary?.compliance_score ?? 0 : 0, fullMark: 100 },
    { subject: 'Risk Control', A: hasDashboardData ? Math.max(0, 100 - (summary?.overall_risk_score ?? 0)) : 0, fullMark: 100 },
  ];

  // Generate Pie Chart Data
  const pieData = [
    { name: 'Compliant', value: summary?.compliance_score ?? 0 },
    { name: 'Risk Exposed', value: hasDashboardData ? Math.max(0, 100 - (summary?.compliance_score ?? 0)) : 0 }
  ];
  const PIE_COLORS = ['#0ea5e9', '#f43f5e'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-brand rounded-full animate-ping opacity-20" />
          </div>
        </div>
        <p className="text-sm font-semibold text-brand tracking-widest uppercase font-mono">Initializing Telemetry...</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      <DataSourceSwitch />
      {/* 1. Hero Welcome Section */}
      <motion.section variants={itemVariants} className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-12 shadow-2xl bg-gradient-to-br from-brand/10 via-purple-500/10 to-transparent border-t border-brand/30">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/20 blur-[120px] rounded-full pointer-events-none -z-10 transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none -z-10 transform -translate-x-1/3 translate-y-1/3" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              <Sparkles className="w-4 h-4 animate-pulse" /> {source === "dataset" ? "Imported dataset analysis" : "My recorded data"}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-cyan-400 drop-shadow-md">{user?.name?.split(" ")[0] || "Operator"}</span>
            </h1>
            <p className="text-muted font-medium text-lg max-w-xl">
              {source === "dataset" ? `Reports are calculated from ${activeDataset?.name ?? "the selected dataset"}.` : "Dashboard results are calculated only from records you enter in the application."}
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-canvas/30 backdrop-blur-md p-4 rounded-2xl border border-line">
            <div className="text-right">
              <p className="text-[10px] font-bold text-brand uppercase tracking-widest">Conformity Index</p>
              <p className="text-4xl font-black text-ink tracking-tighter">{hasDashboardData ? `${summary?.compliance_score ?? 0}%` : "—"}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 shadow-[0_0_20px_rgba(14,165,233,0.2)] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-brand" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. Interactive KPI Nodes */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Financial Ledger", val: summary?.financial_count ?? 0, icon: CircleDollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", route: source === "dataset" ? "/dashboard/data-import" : "/dashboard/financial" },
          { title: "Study Blocks", val: summary?.study_count ?? 0, icon: BookOpen, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", route: source === "dataset" ? "/dashboard/data-import" : "/dashboard/study" },
          { title: "Habit Streaks", val: summary?.habit_count ?? 0, icon: CheckSquare, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", route: source === "dataset" ? "/dashboard/data-import" : "/dashboard/habits" },
          { title: "Active Alerts", val: source === "dataset" ? summary?.alert_count ?? 0 : alerts.length, icon: ShieldAlert, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", route: source === "dataset" ? "/dashboard/data-import" : "/dashboard/alerts" },
        ].map((node, i) => (
          <Link href={node.route} key={i}>
            <motion.div variants={itemVariants} className={`glass-panel p-6 cursor-pointer group h-full flex flex-col justify-between overflow-hidden relative border ${node.border} hover:bg-canvas/50`}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${node.bg} blur-[40px] rounded-full transform translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-150 group-hover:blur-[60px]`} />
              
              <div className="relative z-10 flex items-start justify-between mb-8">
                <span className="text-[11px] font-bold text-muted uppercase tracking-widest">{node.title}</span>
                <div className={`w-10 h-10 rounded-xl ${node.bg} ${node.color} border ${node.border} flex items-center justify-center shadow-lg`}>
                  <node.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10 flex items-end justify-between">
                <h3 className="text-5xl font-black text-ink tracking-tighter">{node.val}</h3>
                <ArrowUpRight className={`w-6 h-6 ${node.color} opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300`} />
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* 3. Deep Data Visualizer - Row 2 */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Chart */}
        <div className="glass-panel p-6 relative overflow-hidden flex flex-col h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-2 relative z-10">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" /> Behavioral Radar
            </h3>
          </div>
          <div className="flex-1 w-full relative z-10 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Operator Stats" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 md:p-8 relative overflow-hidden group h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-ink">Financial Flux Matrix</h3>
              <p className="text-sm text-muted">Income and expenses from the active data source.</p>
            </div>
            <Link href={source === "dataset" ? "/dashboard/data-import" : "/dashboard/financial"} className="px-4 py-2 bg-brand/10 border border-brand/30 text-brand text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.2)] hover:bg-brand hover:text-white transition-all flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Expand
            </Link>
          </div>
          <div className="h-64 w-full relative z-10">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: '#fff' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '10px' }} />
                  <Bar dataKey="Income" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-line rounded-2xl">
                <Activity className="w-8 h-8 text-muted mb-3" />
                <p className="text-sm font-semibold text-muted">No financial records in this source.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 4. Additional Stats - Row 3 */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Compliance Donut */}
        <div className="glass-panel p-6 relative overflow-hidden flex flex-col h-[350px]">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
          <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-2 relative z-10">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Compliance Status
          </h3>
          <div className="flex-1 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Event Stream */}
        <div className="lg:col-span-2 glass-panel p-6 relative overflow-hidden flex flex-col h-[350px]">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <Terminal className="w-5 h-5 text-brand" /> {source === "dataset" ? "Dataset status" : "Recent activity"}
            </h3>
            {source === "user" && <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Connection Stable
            </span>}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar relative z-10">
            {activities.length > 0 ? activities.map((act, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="p-3 bg-canvas/40 backdrop-blur-md rounded-xl border border-line/50 hover:border-brand/30 transition-all hover:bg-canvas/80"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-ink uppercase tracking-wider">{act.action_type}</span>
                  <span className="text-[10px] text-muted font-mono">{new Date(act.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-brand font-mono truncate max-w-[200px]">{act.endpoint}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${act.status_code < 300 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                    {act.status_code}
                  </span>
                </div>
              </motion.div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <p className="text-xs text-muted font-semibold text-center mt-10">{source === "dataset" ? "Imported files are analyzed separately and do not create user activity records." : "No recent activity logged."}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
