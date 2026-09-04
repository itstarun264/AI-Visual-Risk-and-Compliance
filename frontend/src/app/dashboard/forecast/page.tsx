"use client";

import { useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, BrainCircuit, CheckCircle2, CircleDollarSign, Download, Info, Landmark, Maximize2, PiggyBank, Sparkles, Target, TrendingUp, WalletCards, X } from "lucide-react";
import { forecastDataset, forecastInsights, modelPerformance } from "@/lib/forecast-demo-data";

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const compactMoney = (value: number) => value >= 100000 ? `₹${(value / 100000).toFixed(1)}L` : `₹${Math.round(value / 1000)}k`;

const kpis = [
  { label: "Projected income", value: money(92734), change: "+3.0%", hint: "vs Aug 2026", icon: Landmark, color: "text-blue-500", fill: "bg-blue-500/10" },
  { label: "Projected expense", value: money(70462), change: "+8.1%", hint: "vs Aug 2026", icon: WalletCards, color: "text-rose-500", fill: "bg-rose-500/10" },
  { label: "Projected savings", value: money(22272), change: "₹6,272", hint: "above goal", icon: PiggyBank, color: "text-emerald-500", fill: "bg-emerald-500/10" },
  { label: "Savings rate", value: "24.0%", change: "Healthy", hint: "Feb 2027", icon: TrendingUp, color: "text-violet-500", fill: "bg-violet-500/10" },
  { label: "Goal probability", value: "97%", change: "+18 pts", hint: "six-month trend", icon: Target, color: "text-amber-500", fill: "bg-amber-500/10" },
];

export default function ForecastPage() {
  const [horizon, setHorizon] = useState<"3M" | "6M">("6M");
  const [goalAmount, setGoalAmount] = useState(18000);
  const [goalSaved, setGoalSaved] = useState(false);

  const chartData = useMemo(() => horizon === "6M" ? forecastDataset : forecastDataset.filter((row, index) => row.recordType === "Actual" ? index >= 15 : index <= 20), [horizon]);
  const forecastRows = forecastDataset.filter((row) => row.recordType === "Forecast");
  const lastForecast = forecastRows.at(-1)!;
  const goalProbability = Math.min(99, Math.round((lastForecast.savings / Math.max(goalAmount, 1)) * 80));
  const willReachGoal = lastForecast.savings >= goalAmount;

  return <div className="mx-auto max-w-[1500px] space-y-5 pb-10">
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-brand"><Sparkles className="h-3.5 w-3.5" /> Predictive intelligence</div>
        <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">Financial & personal forecasting</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">A complete sample dataset showing financial, productivity, habit, and goal predictions from March 2025 to February 2027.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-xl border border-line bg-surface p-1">{(["3M", "6M"] as const).map((item) => <button key={item} onClick={() => setHorizon(item)} className={`rounded-lg px-3 py-2 text-xs font-black transition ${horizon === item ? "bg-brand text-white shadow" : "text-muted hover:text-ink"}`}>{item}</button>)}</div>
        <a href="/data/predictive-analytics-demo-dataset.xlsx" download className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-brand/20 transition hover:brightness-110"><Download className="h-4 w-4" /> Download dataset</a>
      </div>
    </section>

    <section className="rounded-2xl border border-line bg-surface/80 px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 font-bold text-ink"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sample dataset ready · 18 actual months + 6 forecast months</div><div className="flex items-center gap-2 text-muted"><Info className="h-4 w-4 text-brand" /> Forecast figures are illustrative demo data, not financial advice.</div></div>
    </section>

    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">{kpis.map((item) => <article key={item.label} className="glass-panel p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3"><div className={`rounded-xl p-2.5 ${item.fill} ${item.color}`}><item.icon className="h-5 w-5" /></div><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ${item.label === "Projected expense" ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-600"}`}><ArrowUpRight className="h-3 w-3" />{item.change}</span></div>
      <p className="mt-4 text-xs font-bold text-muted">{item.label}</p><p className="mt-1 text-2xl font-black tracking-tight text-ink">{item.value}</p><p className="mt-1 text-[11px] text-muted">{item.hint}</p>
    </article>)}</section>

    <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <ForecastChart title="Expense forecast" subtitle="Actual spending compared with three forecasting models" data={chartData} mode="expense" />
      <ForecastChart title="Savings forecast" subtitle="Expected monthly savings under each model" data={chartData} mode="savings" />
    </section>

    <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <article className="glass-panel overflow-hidden xl:col-span-5"><PanelTitle icon={CircleDollarSign} title="Forecast summary" subtitle="February 2027 outcome by model" /><div className="overflow-x-auto px-5 pb-5"><table className="w-full min-w-[520px] text-left text-xs"><thead><tr className="border-b border-line text-muted"><Th>Metric</Th><Th>ARIMA</Th><Th>Prophet</Th><Th>Linear</Th><Th>Ensemble</Th></tr></thead><tbody className="text-ink"><SummaryRow metric="Expenses" values={[72887, 68800, 69700, 70462]} /><SummaryRow metric="Savings" values={[19847, 23934, 23034, 22272]} /><tr className="border-b border-line/70"><Td strong>Study hours</Td><Td>—</Td><Td>—</Td><Td>15.5</Td><Td accent>15.5 hrs</Td></tr><tr><Td strong>Goal progress</Td><Td>—</Td><Td>—</Td><Td>97%</Td><Td accent>97%</Td></tr></tbody></table></div></article>
      <article className="glass-panel overflow-hidden xl:col-span-3"><PanelTitle icon={BrainCircuit} title="Model performance" subtitle="Back-test accuracy" /><div className="px-5 pb-5">{modelPerformance.map((model) => <div key={model.model} className="grid grid-cols-[1fr_auto] gap-3 border-b border-line/70 py-3 last:border-0"><div><p className="text-sm font-black text-ink">{model.model}</p><p className="mt-1 text-[11px] text-muted">MAE {money(model.mae)} · RMSE {money(model.rmse)}</p></div><div className="text-right"><p className="text-sm font-black text-brand">{model.mape}%</p><p className="text-[10px] text-muted">MAPE · #{model.rank}</p></div></div>)}</div></article>
      <article className="glass-panel overflow-hidden xl:col-span-4"><PanelTitle icon={Sparkles} title="Top insights" subtitle="Recommendations from the complete dataset" /><div className="space-y-3 px-5 pb-5">{forecastInsights.map((insight) => <div key={insight.title} className={`rounded-xl border p-3 ${insight.tone === "warning" ? "border-amber-500/20 bg-amber-500/5" : insight.tone === "positive" ? "border-emerald-500/20 bg-emerald-500/5" : "border-brand/20 bg-brand/5"}`}><p className="text-xs font-black text-ink">{insight.title}</p><p className="mt-1 text-[11px] leading-relaxed text-muted">{insight.detail}</p></div>)}</div></article>
    </section>

    <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <article className="glass-panel overflow-hidden xl:col-span-8"><PanelTitle icon={TrendingUp} title="Productivity & habit forecast" subtitle="Weekly study hours, focus, and routine consistency" /><div className="h-[300px] px-1 pb-5 sm:px-4"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}><CartesianGrid stroke="var(--line)" vertical={false} strokeDasharray="4 4" /><XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={20} /><YAxis tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} /><Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, fontSize: 12 }} /><Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} /><Line dataKey="focusScore" name="Focus score %" stroke="#8b5cf6" strokeWidth={2.5} dot={false} /><Line dataKey="habitCompletion" name="Habit completion %" stroke="#10b981" strokeWidth={2.5} dot={false} /><Line dataKey="goalProgress" name="Goal progress %" stroke="#2563eb" strokeWidth={2.5} dot={false} strokeDasharray="6 4" /></ComposedChart></ResponsiveContainer></div></article>
      <article className="glass-panel p-5 xl:col-span-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500"><Target className="h-5 w-5" /></div><div><h2 className="font-black text-ink">Goal forecast</h2><p className="text-xs text-muted">Will the monthly savings target be met?</p></div></div><label className="mt-5 block text-xs font-bold text-muted">Monthly savings goal<div className="mt-2 flex rounded-xl border border-line bg-canvas/60 p-1 focus-within:border-brand"><span className="px-3 py-2 text-sm font-black text-muted">₹</span><input type="number" min="1000" step="500" value={goalAmount} onChange={(event) => { setGoalAmount(Number(event.target.value)); setGoalSaved(false); }} className="min-w-0 flex-1 bg-transparent px-1 text-sm font-black text-ink outline-none" /><button onClick={() => setGoalSaved(true)} className="rounded-lg bg-brand px-4 text-xs font-black text-white">Set goal</button></div></label><div className={`mt-4 rounded-2xl border p-4 ${willReachGoal ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"}`}><div className="flex items-center justify-between"><span className="text-xs font-bold text-muted">Likelihood</span><span className={`text-2xl font-black ${willReachGoal ? "text-emerald-500" : "text-rose-500"}`}>{goalProbability}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-line"><div className={`h-full rounded-full ${willReachGoal ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${goalProbability}%` }} /></div><p className="mt-3 text-sm font-black text-ink">{willReachGoal ? "On track to achieve" : "Not on track yet"}</p><p className="mt-1 text-xs leading-relaxed text-muted">February savings are forecast at {money(lastForecast.savings)}. {willReachGoal ? `That is ${money(lastForecast.savings - goalAmount)} above your goal.` : `Reduce expenses by ${money(goalAmount - lastForecast.savings)} to close the gap.`}</p></div>{goalSaved && <p className="mt-3 text-xs font-bold text-emerald-600">Goal updated and recalculated.</p>}</article>
    </section>

    <section className="glass-panel overflow-hidden"><PanelTitle icon={CircleDollarSign} title="Dataset preview" subtitle="The same records used by every card, chart, and recommendation above" /><div className="overflow-x-auto px-5 pb-5"><table className="w-full min-w-[900px] text-left text-xs"><thead><tr className="border-b border-line text-muted"><Th>Month</Th><Th>Type</Th><Th>Income</Th><Th>Expenses</Th><Th>Savings</Th><Th>Study</Th><Th>Focus</Th><Th>Habit</Th><Th>Goal</Th></tr></thead><tbody>{[...forecastDataset.slice(15, 18), ...forecastRows].map((row) => <tr key={row.month} className={`border-b border-line/60 last:border-0 ${row.recordType === "Forecast" ? "bg-brand/[0.035]" : ""}`}><Td strong>{row.month}</Td><Td><span className={`rounded-full px-2 py-1 text-[10px] font-black ${row.recordType === "Actual" ? "bg-slate-500/10 text-muted" : "bg-brand/10 text-brand"}`}>{row.recordType}</span></Td><Td>{money(row.income)}</Td><Td>{money(row.actualExpense ?? row.ensembleExpense ?? 0)}</Td><Td accent>{money(row.savings)}</Td><Td>{row.studyHours}h</Td><Td>{row.focusScore}%</Td><Td>{row.habitCompletion}%</Td><Td>{row.goalProgress}%</Td></tr>)}</tbody></table></div></section>
    <p className="px-1 text-xs text-muted">Dataset period: Mar 2025–Feb 2027 · Forecast horizon: Sep 2026–Feb 2027 · Selected forecast: three-model ensemble.</p>
  </div>;
}

function ForecastChart({ title, subtitle, data, mode }: { title: string; subtitle: string; data: typeof forecastDataset; mode: "expense" | "savings" }) {
  const [expanded, setExpanded] = useState(false);
  const savingsData = data.map((row) => ({ ...row, actualSavings: row.recordType === "Actual" ? row.savings : null, arimaSavings: row.arimaExpense ? row.income - row.arimaExpense : null, prophetSavings: row.prophetExpense ? row.income - row.prophetExpense : null, linearSavings: row.linearExpense ? row.income - row.linearExpense : null }));
  const series = mode === "expense" ? [{ key: "actualExpense", name: "Actual", color: "#2563eb", dash: undefined }, { key: "arimaExpense", name: "ARIMA", color: "#0ea5e9", dash: "6 4" }, { key: "prophetExpense", name: "Prophet", color: "#10b981", dash: "3 3" }, { key: "linearExpense", name: "Linear", color: "#8b5cf6", dash: "8 4" }] : [{ key: "actualSavings", name: "Actual", color: "#2563eb", dash: undefined }, { key: "arimaSavings", name: "ARIMA", color: "#0ea5e9", dash: "6 4" }, { key: "prophetSavings", name: "Prophet", color: "#10b981", dash: "3 3" }, { key: "linearSavings", name: "Linear", color: "#8b5cf6", dash: "8 4" }];
  const chart = (heightClass: string) => <div className={`${heightClass} px-1 pb-5 sm:px-4`}><ResponsiveContainer width="100%" height="100%"><ComposedChart data={savingsData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}><CartesianGrid stroke="var(--line)" vertical={false} strokeDasharray="4 4" /><XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={24} /><YAxis tick={{ fill: "var(--muted)", fontSize: 10 }} tickFormatter={compactMoney} axisLine={false} tickLine={false} width={54} /><Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, fontSize: 12 }} formatter={(value) => [money(Number(value)), ""]} /><Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />{series.map((item) => <Line key={item.key} type="monotone" dataKey={item.key} name={item.name} stroke={item.color} strokeWidth={2.5} strokeDasharray={item.dash} dot={false} connectNulls />)}{mode === "savings" && <Area type="monotone" dataKey="actualSavings" stroke="none" fill="#2563eb" fillOpacity={0.06} legendType="none" />}</ComposedChart></ResponsiveContainer></div>;

  return <>
    <article className="glass-panel overflow-hidden">
      <PanelTitle icon={mode === "expense" ? WalletCards : PiggyBank} title={title} subtitle={subtitle} action={<button type="button" onClick={() => setExpanded(true)} aria-label={`Expand ${title}`} className="ml-auto inline-flex items-center gap-2 rounded-xl border border-line bg-canvas/60 px-3 py-2 text-xs font-black text-muted transition hover:border-brand/40 hover:text-brand"><Maximize2 className="h-4 w-4" /><span className="hidden sm:inline">Expand</span></button>} />
      {chart("h-[330px]")}
    </article>
    {expanded && createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-md sm:p-8" role="dialog" aria-modal="true" aria-label={`${title} expanded view`} onClick={() => setExpanded(false)}>
      <div className="w-full max-w-[1500px] overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <PanelTitle icon={mode === "expense" ? WalletCards : PiggyBank} title={title} subtitle={`${subtitle} · expanded view`} action={<button type="button" onClick={() => setExpanded(false)} aria-label={`Close expanded ${title}`} className="ml-auto inline-flex items-center gap-2 rounded-xl border border-line bg-canvas/60 px-3 py-2 text-xs font-black text-muted transition hover:border-rose-500/40 hover:text-rose-500"><X className="h-4 w-4" /><span className="hidden sm:inline">Close</span></button>} />
        {chart("h-[72vh]")}
      </div>
    </div>, document.body)}
  </>;
}

function PanelTitle({ icon: Icon, title, subtitle, action }: { icon: typeof Sparkles; title: string; subtitle: string; action?: ReactNode }) { return <div className="flex items-start gap-3 p-5"><div className="rounded-xl bg-brand/10 p-2.5 text-brand"><Icon className="h-5 w-5" /></div><div><h2 className="font-black text-ink">{title}</h2><p className="mt-0.5 text-xs text-muted">{subtitle}</p></div>{action}</div>; }
function SummaryRow({ metric, values }: { metric: string; values: number[] }) { return <tr className="border-b border-line/70"><Td strong>{metric}</Td>{values.map((value, index) => <Td key={value} accent={index === values.length - 1}>{money(value)}</Td>)}</tr>; }
function Th({ children }: { children: ReactNode }) { return <th className="whitespace-nowrap px-2 py-3 font-black first:pl-0 last:pr-0">{children}</th>; }
function Td({ children, strong, accent }: { children: ReactNode; strong?: boolean; accent?: boolean }) { return <td className={`whitespace-nowrap px-2 py-3 first:pl-0 last:pr-0 ${strong ? "font-black text-ink" : ""} ${accent ? "font-black text-brand" : ""}`}>{children}</td>; }
