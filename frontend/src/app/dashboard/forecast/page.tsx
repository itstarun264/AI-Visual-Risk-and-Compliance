"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import axios from "axios";
import { createPortal } from "react-dom";
import { CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertCircle, ArrowRight, BookOpen, BrainCircuit, CheckCircle2, CircleDollarSign, Database, Maximize2, PiggyBank, Sparkles, Target, TrendingUp, Upload, WalletCards, X } from "lucide-react";
import { DataSourceSwitch } from "@/components/DataSourceSwitch";
import { useDataSource } from "@/context/DataSourceContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
const compactMoney = (value: number) => value >= 100000 ? `₹${(value / 100000).toFixed(1)}L` : value >= 1000 ? `₹${Math.round(value / 1000)}k` : `₹${Math.round(value)}`;

interface ForecastSummary {
  source: "live" | "dataset";
  confidence: string;
  data_points: number;
  dataset?: { id: string; name: string; original_filename: string; row_count: number };
  financial: { has_data: boolean; current_expenses: number; next_week_expenses: number; next_month_expenses: number; projected_savings: number; expense_change_percent: number; trend: string; series: { label: string; actual: number | null; projected: number | null }[] };
  productivity: { has_data: boolean; weekly_study_hours: number; next_week_hours: number; focus_score: number; completion_probability: number; trend: string };
  habits: { name: string; category: string; likelihood: number; streak: number; status: string; recommendation: string }[];
  goals: { id: string; title: string; goal_type: string; timeframe: string; target: number; forecast: number; probability: number; unit: string; status: string }[];
  recommendations: { area: string; message: string }[];
}

export default function ForecastPage() {
  const { source, activeDatasetId, activeDataset } = useDataSource();
  const [summary, setSummary] = useState<ForecastSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [goalAmount, setGoalAmount] = useState(18000);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const url = source === "dataset" && activeDatasetId ? `${API_URL}/datasets/${activeDatasetId}/forecast-summary` : `${API_URL}/forecast/summary`;
        const response = await axios.get<ForecastSummary>(url);
        setSummary(response.data);
      } catch (caught: unknown) {
        const message = axios.isAxiosError(caught) ? caught.response?.data?.detail : null;
        setError(typeof message === "string" ? message : "Forecast data could not be loaded.");
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [source, activeDatasetId]);

  const projectedSavings = summary?.financial.projected_savings ?? 0;
  const goalProbability = Math.max(0, Math.min(99, Math.round(projectedSavings / Math.max(goalAmount, 1) * 100)));
  const willReachGoal = projectedSavings >= goalAmount;
  const kpis = useMemo(() => summary ? [
    { label: "Current expenses", value: money(summary.financial.current_expenses), hint: "Latest recorded period", icon: WalletCards, color: "text-slate-500", fill: "bg-slate-500/10" },
    { label: "Next week expenses", value: money(summary.financial.next_week_expenses), hint: "Trend-based estimate", icon: TrendingUp, color: "text-amber-500", fill: "bg-amber-500/10" },
    { label: "Next month expenses", value: money(summary.financial.next_month_expenses), hint: `${summary.financial.expense_change_percent >= 0 ? "+" : ""}${summary.financial.expense_change_percent}% change`, icon: CircleDollarSign, color: "text-rose-500", fill: "bg-rose-500/10" },
    { label: "Projected savings", value: money(summary.financial.projected_savings), hint: summary.financial.trend, icon: PiggyBank, color: "text-emerald-500", fill: "bg-emerald-500/10" },
    { label: "Forecast confidence", value: summary.confidence, hint: `${summary.data_points} source records`, icon: BrainCircuit, color: "text-violet-500", fill: "bg-violet-500/10" },
  ] : [], [summary]);

  return <div className="mx-auto max-w-[1500px] space-y-6 pb-10">
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-brand"><Sparkles className="h-3.5 w-3.5" /> Predictive analytics</div><h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">Forecasting from your selected data</h1><p className="mt-2 max-w-2xl text-sm text-muted">Predictions are recalculated from user-entered records or the imported dataset you select below.</p></div></section>

    <DataSourceSwitch />

    {loading && <div className="glass-panel flex min-h-72 items-center justify-center"><div className="text-center"><div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-brand/20 border-t-brand" /><p className="mt-4 text-sm font-bold text-muted">Calculating forecasts…</p></div></div>}
    {error && !loading && <div className="flex gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 text-sm font-bold text-rose-500"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}

    {!loading && !error && summary && summary.data_points === 0 && <EmptyForecast />}

    {!loading && !error && summary && summary.data_points > 0 && <>
      <section className="rounded-2xl border border-line bg-surface/80 px-4 py-3 shadow-sm"><div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 font-bold text-ink"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {source === "dataset" ? `${activeDataset?.name ?? "Imported dataset"} · ${summary.data_points} rows analyzed` : `${summary.data_points} user-entered records analyzed`}</div><div className="flex items-center gap-2 text-muted"><Database className="h-4 w-4 text-brand" /> {source === "dataset" ? "Imported data remains separate from My Data." : "No sample records are included."}</div></div></section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">{kpis.map((item) => <article key={item.label} className="glass-panel p-4 transition hover:-translate-y-0.5 hover:shadow-lg"><div className={`w-fit rounded-xl p-2.5 ${item.fill} ${item.color}`}><item.icon className="h-5 w-5" /></div><p className="mt-4 text-xs font-bold text-muted">{item.label}</p><p className="mt-1 text-2xl font-black tracking-tight text-ink">{item.value}</p><p className="mt-1 text-[11px] text-muted">{item.hint}</p></article>)}</section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <article className="glass-panel overflow-hidden xl:col-span-8"><PanelTitle icon={TrendingUp} title="Expense forecast" subtitle="Recorded spending with the next-period projection" /><ForecastChart data={summary.financial.series} /></article>
        <article className="glass-panel p-5 xl:col-span-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500"><Target className="h-5 w-5" /></div><div><h2 className="font-black text-ink">Savings goal check</h2><p className="text-xs text-muted">Does the current trend support your target?</p></div></div><label className="mt-5 block text-xs font-bold text-muted">Monthly savings target<div className="mt-2 flex rounded-xl border border-line bg-canvas/60 p-1 focus-within:border-brand"><span className="px-3 py-2 text-sm font-black text-muted">₹</span><input type="number" min="1" step="500" value={goalAmount} onChange={(event) => setGoalAmount(Number(event.target.value))} className="min-w-0 flex-1 bg-transparent px-1 text-sm font-black text-ink outline-none" /></div></label><div className={`mt-4 rounded-2xl border p-4 ${willReachGoal ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"}`}><div className="flex items-center justify-between"><span className="text-xs font-bold text-muted">Likelihood</span><span className={`text-2xl font-black ${willReachGoal ? "text-emerald-500" : "text-rose-500"}`}>{goalProbability}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-line"><div className={`h-full rounded-full ${willReachGoal ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${goalProbability}%` }} /></div><p className="mt-3 text-sm font-black text-ink">{willReachGoal ? "Likely to achieve" : "Not likely on the current trend"}</p><p className="mt-1 text-xs leading-relaxed text-muted">Projected savings are {money(projectedSavings)}. {willReachGoal ? `The forecast is ${money(projectedSavings - goalAmount)} above the target.` : `The current gap is ${money(goalAmount - projectedSavings)}.`}</p></div></article>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <article className="glass-panel overflow-hidden"><PanelTitle icon={BookOpen} title="Study & productivity" subtitle="Prediction from recorded study activity" /><div className="grid grid-cols-2 gap-3 px-5 pb-5"><Metric label="This week" value={`${summary.productivity.weekly_study_hours}h`} /><Metric label="Next week" value={`${summary.productivity.next_week_hours}h`} /><Metric label="Focus score" value={`${summary.productivity.focus_score}%`} /><Metric label="Completion" value={`${summary.productivity.completion_probability}%`} /></div><p className="border-t border-line px-5 py-4 text-xs font-bold text-muted">Trend: <span className="text-ink">{summary.productivity.trend}</span></p></article>
        <article className="glass-panel overflow-hidden"><PanelTitle icon={CheckCircle2} title="Habit predictions" subtitle="Likelihood of continuing each routine" /><div className="max-h-80 space-y-3 overflow-y-auto px-5 pb-5">{summary.habits.length ? summary.habits.map((habit) => <div key={habit.name} className="rounded-xl border border-line bg-canvas/35 p-3"><div className="flex items-center justify-between gap-3"><p className="text-xs font-black text-ink">{habit.name}</p><span className={`text-sm font-black ${habit.likelihood >= 70 ? "text-emerald-500" : habit.likelihood >= 45 ? "text-amber-500" : "text-rose-500"}`}>{habit.likelihood}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand" style={{ width: `${habit.likelihood}%` }} /></div><p className="mt-2 text-[11px] text-muted">{habit.status}</p></div>) : <NoSectionData text="No habit fields were found in this source." />}</div></article>
        <article className="glass-panel overflow-hidden"><PanelTitle icon={Target} title="Goal forecasts" subtitle="Expected progress from the selected source" /><div className="max-h-80 space-y-3 overflow-y-auto px-5 pb-5">{summary.goals.length ? summary.goals.map((goal) => <div key={goal.id} className="rounded-xl border border-line bg-canvas/35 p-3"><div className="flex items-start justify-between gap-3"><p className="text-xs font-black text-ink">{goal.title}</p><span className={`text-sm font-black ${goal.probability >= 85 ? "text-emerald-500" : goal.probability >= 60 ? "text-amber-500" : "text-rose-500"}`}>{goal.probability}%</span></div><p className="mt-2 text-[11px] text-muted">{goal.status} · forecast {goal.forecast} {goal.unit}</p></div>) : <NoSectionData text="Add a goal or import goal-progress columns to see goal forecasts." />}</div></article>
      </section>

      <section className="glass-panel overflow-hidden"><PanelTitle icon={Sparkles} title="Recommendations" subtitle="Actions calculated from the active records" /><div className="grid grid-cols-1 gap-3 px-5 pb-5 md:grid-cols-2">{summary.recommendations.map((item, index) => <div key={`${item.area}-${index}`} className="rounded-xl border border-brand/15 bg-brand/[0.035] p-4"><p className="text-xs font-black text-brand">{item.area}</p><p className="mt-1 text-xs leading-relaxed text-muted">{item.message}</p></div>)}</div></section>
    </>}
  </div>;
}

function EmptyForecast() {
  return <section className="glass-panel flex min-h-[420px] flex-col items-center justify-center p-8 text-center"><div className="rounded-2xl bg-brand/10 p-4 text-brand"><BrainCircuit className="h-9 w-9" /></div><h2 className="mt-5 text-2xl font-black text-ink">No records available for forecasting</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">Add finance, study, habit, and goal records under My Data, or import an existing Excel or CSV dataset. Forecasts will appear only after real records are available.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/dashboard/financial" className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-black text-white">Enter records <ArrowRight className="h-4 w-4" /></Link><Link href="/dashboard/data-import" className="inline-flex items-center gap-2 rounded-xl border border-line bg-canvas px-4 py-2.5 text-xs font-black text-ink"><Upload className="h-4 w-4" /> Import dataset</Link></div></section>;
}

function ForecastChart({ data }: { data: ForecastSummary["financial"]["series"] }) {
  const [expanded, setExpanded] = useState(false);
  const chart = (height: string) => data.length ? <div className={`${height} px-2 pb-5 sm:px-5`}><ResponsiveContainer width="100%" height="100%"><ComposedChart data={data} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}><CartesianGrid stroke="var(--line)" vertical={false} strokeDasharray="4 4" /><XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "var(--muted)", fontSize: 10 }} tickFormatter={compactMoney} axisLine={false} tickLine={false} width={58} /><Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, fontSize: 12 }} formatter={(value) => [money(Number(value)), ""]} /><Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} /><Line type="monotone" dataKey="actual" name="Recorded expenses" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} connectNulls /><Line type="monotone" dataKey="projected" name="Forecast" stroke="#f43f5e" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 4 }} connectNulls /></ComposedChart></ResponsiveContainer></div> : <div className={`${height} flex items-center justify-center text-sm text-muted`}>No financial columns found in this source.</div>;
  return <>{<div className="relative">{chart("h-[340px]")}<button type="button" onClick={() => setExpanded(true)} className="absolute right-5 top-0 inline-flex items-center gap-2 rounded-xl border border-line bg-canvas/80 px-3 py-2 text-xs font-black text-muted hover:text-brand"><Maximize2 className="h-4 w-4" /> Expand</button></div>}{expanded && createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md" onClick={() => setExpanded(false)}><div className="w-full max-w-[1500px] overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl" onClick={(event) => event.stopPropagation()}><PanelTitle icon={TrendingUp} title="Expense forecast" subtitle="Expanded view" action={<button type="button" onClick={() => setExpanded(false)} className="ml-auto rounded-xl border border-line p-2 text-muted hover:text-rose-500"><X className="h-4 w-4" /></button>} />{chart("h-[72vh]")}</div></div>, document.body)}</>;
}

function PanelTitle({ icon: Icon, title, subtitle, action }: { icon: typeof Sparkles; title: string; subtitle: string; action?: ReactNode }) { return <div className="flex items-start gap-3 p-5"><div className="rounded-xl bg-brand/10 p-2.5 text-brand"><Icon className="h-5 w-5" /></div><div><h2 className="font-black text-ink">{title}</h2><p className="mt-0.5 text-xs text-muted">{subtitle}</p></div>{action}</div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-line bg-canvas/40 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p><p className="mt-1 text-xl font-black text-ink">{value}</p></div>; }
function NoSectionData({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-line p-5 text-center text-xs text-muted">{text}</div>; }
