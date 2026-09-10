"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import axios from "axios";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Database,
  Maximize2,
  Sparkles,
  Target,
  Upload,
  WalletCards,
  X,
} from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataSourceSwitch } from "@/components/DataSourceSwitch";
import { useDataSource } from "@/context/DataSourceContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
const compactMoney = (value: number) => value >= 100000 ? `₹${(value / 100000).toFixed(1)}L` : value >= 1000 ? `₹${Math.round(value / 1000)}k` : `₹${Math.round(value)}`;

interface ModelInfo {
  selected: string;
  trained: boolean;
  validation: { mae?: number | null; rmse?: number | null; mape?: number | null; accuracy?: number | null; precision?: number | null; recall?: number | null };
  evaluated_models?: { name: string; mae?: number | null; rmse?: number | null; mape?: number | null; accuracy?: number | null }[];
  note: string;
}

interface ProjectionPoint { label: string; actual: number | null; projected: number | null }

interface ForecastSummary {
  source: "live" | "dataset";
  confidence: string;
  data_points: number;
  dataset?: { id: string; name: string; original_filename: string; row_count: number };
  financial: {
    has_data: boolean;
    current_expenses: number;
    next_week_expenses: number;
    next_month_expenses: number;
    projected_savings: number;
    expense_change_percent: number;
    trend: string;
    series: ProjectionPoint[];
    model?: ModelInfo;
  };
  productivity: {
    has_data: boolean;
    weekly_study_hours: number;
    next_week_hours: number;
    focus_score: number;
    completion_probability: number;
    trend: string;
    series?: ProjectionPoint[];
    model?: ModelInfo;
  };
  habits: { name: string; category: string; likelihood: number; streak: number; status: string; recommendation: string; model?: ModelInfo }[];
  goals: { id: string; title: string; goal_type: string; timeframe: string; target: number; forecast: number; probability: number; unit: string; status: string }[];
  recommendations: { area: string; message: string }[];
  model_summary?: { financial: string; productivity: string; habits: string; selection_method: string };
}

export default function ForecastPage() {
  const { source, activeDatasetId, activeDataset } = useDataSource();
  const [summary, setSummary] = useState<ForecastSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const statusText = useMemo(() => {
    if (!summary) return "";
    return source === "dataset" ? `${activeDataset?.name ?? "Imported dataset"} · ${summary.data_points} rows` : `${summary.data_points} user records`;
  }, [summary, source, activeDataset]);

  return <div className="mx-auto max-w-[1540px] space-y-5 pb-10">
    <header>
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-brand"><Sparkles className="h-3.5 w-3.5" /> Predictive analytics</div>
      <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">Forecasting & Predictive Analytics</h1>
      <p className="mt-2 text-sm text-muted">Simple, model-validated projections for financial, study, habit, and goal outcomes.</p>
    </header>

    <DataSourceSwitch />

    {loading && <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-line bg-surface"><div className="text-center"><div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-brand/20 border-t-brand" /><p className="mt-4 text-sm font-bold text-muted">Training and comparing models…</p></div></div>}
    {error && !loading && <div className="flex gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 text-sm font-bold text-rose-500"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
    {!loading && !error && summary && summary.data_points === 0 && <EmptyForecast />}

    {!loading && !error && summary && summary.data_points > 0 && <>
      <section className="overflow-hidden rounded-[26px] border border-line bg-surface shadow-xl shadow-slate-950/5">
        <div className="flex flex-col gap-3 border-b border-line bg-canvas/45 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div>
            <nav className="flex items-center gap-1 text-[11px] font-bold text-muted">
              <Link href="/dashboard/profile" className="rounded-lg px-3 py-2 hover:bg-surface hover:text-ink">Profile & Data</Link>
              <span className="rounded-lg border border-line bg-surface px-3 py-2 text-ink shadow-sm">Forecasting</span>
              <Link href="/dashboard" className="rounded-lg px-3 py-2 hover:bg-surface hover:text-ink">Dashboard</Link>
            </nav>
          </div>
          <p className="flex items-center gap-2 text-[10px] font-bold text-muted"><Database className="h-3.5 w-3.5 text-brand" />{statusText}</p>
        </div>

        <div className="divide-y divide-line">
          <ForecastSection>
            <ColumnHeading title="Financial Forecasting" model={summary.financial.model} />
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
              <ProjectionCard title="Expense projection" subtitle="Recorded history with one next-month projection" data={summary.financial.series} valueFormatter={money} yFormatter={compactMoney} actualColor="#2563eb" projectedColor="#8b5cf6" />
              <div className="grid grid-cols-2 gap-3 self-stretch">
                <Metric label="Current expenses" value={money(summary.financial.current_expenses)} hint="Latest recorded month" />
                <Metric label="Next week" value={money(summary.financial.next_week_expenses)} hint="From the single forecast" />
                <Metric label="Next month" value={money(summary.financial.next_month_expenses)} hint={`${signed(summary.financial.expense_change_percent)}% projected`} />
                <Metric label="Projected savings" value={money(summary.financial.projected_savings)} hint={summary.financial.trend} />
              </div>
            </div>
          </ForecastSection>

          <ForecastSection>
            <ColumnHeading title="Study & Productivity" model={summary.productivity.model} />
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
              <ProjectionCard title="Weekly study hours" subtitle="Recorded weekly history with one next-week projection" data={summary.productivity.series ?? []} valueFormatter={(value) => `${value.toFixed(1)}h`} yFormatter={(value) => `${value}h`} actualColor="#10b981" projectedColor="#8b5cf6" />
              <div className="grid grid-cols-2 gap-3 self-stretch">
                <Metric label="This week" value={`${summary.productivity.weekly_study_hours}h`} hint="Recorded total" />
                <Metric label="Next week" value={`${summary.productivity.next_week_hours}h`} hint={summary.productivity.trend} />
                <Metric label="Focus score" value={`${summary.productivity.focus_score}%`} hint="Recent average" />
                <Metric label="Completion" value={`${summary.productivity.completion_probability}%`} hint="Predicted likelihood" />
              </div>
            </div>
          </ForecastSection>

          <ForecastSection>
            <ColumnHeading title="Habit Predictions" model={summary.habits[0]?.model} />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {summary.habits.length ? summary.habits.slice(0, 5).map((habit) => <HabitCard key={habit.name} habit={habit} />) : <NoSectionData text="Add dated habit activity to predict continuation." />}
            </div>
          </ForecastSection>
        </div>
      </section>

      <section className={`grid grid-cols-1 gap-5 ${source === "user" ? "xl:grid-cols-2" : ""}`}>
        {source === "user" && <article className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
          <PanelTitle icon={Target} title="Goal outlook" subtitle="Will your saved goals stay on track?" />
          <div className="mt-4 space-y-3">{summary.goals.length ? summary.goals.map((goal) => <div key={goal.id} className="rounded-2xl border border-line bg-canvas/35 p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black text-ink">{goal.title}</p><p className="mt-1 text-[11px] text-muted">Forecast {goal.forecast} {goal.unit} · target {goal.target}</p></div><span className={`text-lg font-black ${goal.probability >= 85 ? "text-emerald-500" : goal.probability >= 60 ? "text-amber-500" : "text-rose-500"}`}>{goal.probability}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-line"><div className={`h-full rounded-full ${goal.probability >= 85 ? "bg-emerald-500" : goal.probability >= 60 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${goal.probability}%` }} /></div><p className="mt-2 text-[10px] font-bold text-muted">{goal.status}</p></div>) : <NoSectionData text="Set a financial, study, or habit goal to see its projected outcome." />}</div>
        </article>}

        <article className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
          <PanelTitle icon={Sparkles} title="Recommended actions" subtitle="Clear next steps calculated from the selected records" />
          <div className="mt-4 space-y-3">{summary.recommendations.map((item, index) => <div key={`${item.area}-${index}`} className="flex gap-3 rounded-2xl border border-brand/15 bg-brand/[0.035] p-4"><div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand"><ArrowRight className="h-3.5 w-3.5" /></div><div><p className="text-xs font-black text-brand">{item.area}</p><p className="mt-1 text-xs leading-relaxed text-muted">{item.message}</p></div></div>)}</div>
        </article>
      </section>

      <section className="rounded-2xl border border-line bg-surface px-4 py-3 text-[10px] font-bold text-ink"><BrainCircuit className="mr-1.5 inline h-3.5 w-3.5 text-brand" />Forecasts use the selected user records or imported dataset. No dummy data is used.</section>
    </>}
  </div>;
}

function ForecastSection({ children }: { children: ReactNode }) { return <article className="min-w-0 p-5 lg:p-7">{children}</article>; }

function ColumnHeading({ title, model }: { title: string; model?: ModelInfo }) {
  const quality = modelQuality(model);
  return <div className="mb-5 flex min-h-11 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><h2 className="text-lg font-black text-ink">{title}</h2><div className="flex flex-wrap items-center gap-2">{quality.label && <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[9px] font-black text-emerald-500">{quality.label}</span>}<span className={`max-w-[180px] truncate rounded-lg border px-2.5 py-1.5 text-[9px] font-black ${model?.trained ? "border-violet-500/20 bg-violet-500/10 text-violet-500" : "border-line bg-canvas text-muted"}`} title={model?.selected}>{model?.selected ?? "Awaiting model"}</span></div></div>;
}

function ProjectionCard({ title, subtitle, data, valueFormatter, yFormatter, actualColor, projectedColor }: { title: string; subtitle: string; data: ProjectionPoint[]; valueFormatter: (value: number) => string; yFormatter: (value: number) => string; actualColor: string; projectedColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const chart = (height: string) => data.length ? <div className={height}><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 14, right: 12, left: -8, bottom: 0 }}><CartesianGrid stroke="var(--line)" vertical={false} strokeDasharray="4 4" /><XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" /><YAxis tick={{ fill: "var(--muted)", fontSize: 9 }} tickFormatter={yFormatter} axisLine={false} tickLine={false} width={58} /><Tooltip contentStyle={{ background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 12, fontSize: 11 }} formatter={(value) => [valueFormatter(Number(value)), ""]} /><Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} /><Line type="monotone" dataKey="actual" name="Actual" stroke={actualColor} strokeWidth={2.5} dot={{ r: 2.5, fill: actualColor }} connectNulls /><Line type="monotone" dataKey="projected" name="Projected" stroke={projectedColor} strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 2.5, fill: projectedColor }} connectNulls /></LineChart></ResponsiveContainer></div> : <div className={`${height} flex items-center justify-center text-center text-xs text-muted`}>Not enough records to draw this projection.</div>;
  return <><div className="rounded-2xl border border-line bg-canvas/35 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-black text-ink">{title}</h3><p className="mt-0.5 text-[10px] text-muted">{subtitle}</p></div><button type="button" onClick={() => setExpanded(true)} disabled={!data.length} className="rounded-lg border border-line bg-surface p-2 text-muted hover:text-brand disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Expand ${title}`}><Maximize2 className="h-3.5 w-3.5" /></button></div>{chart("mt-3 h-[230px]")}</div>{expanded && createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md" onClick={() => setExpanded(false)}><div className="w-full max-w-[1450px] rounded-3xl border border-line bg-canvas p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><h2 className="text-xl font-black text-ink">{title}</h2><p className="mt-1 text-xs text-muted">{subtitle}</p></div><button type="button" onClick={() => setExpanded(false)} className="rounded-xl border border-line p-2 text-muted hover:text-rose-500"><X className="h-4 w-4" /></button></div>{chart("mt-4 h-[72vh]")}</div></div>, document.body)}</>;
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) { return <div className="rounded-xl border border-line bg-canvas/30 p-3"><p className="text-[10px] font-bold text-muted">{label}</p><p className="mt-1 text-lg font-black tracking-tight text-ink sm:text-xl">{value}</p><p className="mt-1 text-[9px] font-semibold text-muted">{hint}</p></div>; }

function HabitCard({ habit }: { habit: ForecastSummary["habits"][number] }) {
  const color = habit.likelihood >= 70 ? "bg-emerald-500" : habit.likelihood >= 45 ? "bg-violet-500" : "bg-rose-500";
  const text = habit.likelihood >= 70 ? "text-emerald-500" : habit.likelihood >= 45 ? "text-violet-500" : "text-rose-500";
  return <div className="rounded-2xl border border-line bg-canvas/30 p-4"><div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><CheckCircle2 className={`h-4 w-4 shrink-0 ${text}`} /><p className="truncate text-xs font-black text-ink">{habit.name}</p></div><span className={`text-sm font-black ${text}`}>{habit.likelihood}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line"><div className={`h-full rounded-full ${color}`} style={{ width: `${habit.likelihood}%` }} /></div><p className="mt-2 text-[10px] leading-relaxed text-muted">{habit.status} · {habit.recommendation}</p></div>;
}

function modelQuality(model?: ModelInfo) {
  if (!model) return { label: null };
  const accuracy = model.validation.accuracy;
  if (accuracy != null) return { label: accuracy >= 90 ? `${accuracy}% accuracy` : null };
  const mape = model.validation.mape;
  if (mape != null) {
    const forecastAccuracy = Math.max(0, 100 - mape);
    return { label: forecastAccuracy >= 90 ? `${forecastAccuracy.toFixed(1)}% forecast accuracy` : null };
  }
  return { label: null };
}

function signed(value: number) { return `${value >= 0 ? "+" : ""}${value}`; }
function PanelTitle({ icon: Icon, title, subtitle }: { icon: typeof Sparkles; title: string; subtitle: string }) { return <div className="flex items-center gap-3"><div className="rounded-xl bg-brand/10 p-2.5 text-brand"><Icon className="h-5 w-5" /></div><div><h2 className="font-black text-ink">{title}</h2><p className="mt-0.5 text-xs text-muted">{subtitle}</p></div></div>; }
function NoSectionData({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-line p-7 text-center text-xs text-muted">{text}</div>; }
function EmptyForecast() { return <section className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-line bg-surface p-8 text-center"><div className="rounded-2xl bg-brand/10 p-4 text-brand"><BrainCircuit className="h-9 w-9" /></div><h2 className="mt-5 text-2xl font-black text-ink">No records available for forecasting</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">Add finance, study, habit, and goal records under My Data, or import an Excel or CSV dataset. No dummy predictions are displayed.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/dashboard/financial" className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-black text-white"><WalletCards className="h-4 w-4" /> Enter records</Link><Link href="/dashboard/data-import" className="inline-flex items-center gap-2 rounded-xl border border-line bg-canvas px-4 py-2.5 text-xs font-black text-ink"><Upload className="h-4 w-4" /> Import dataset</Link></div></section>; }
