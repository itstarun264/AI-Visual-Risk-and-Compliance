"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2, Database, FileSpreadsheet, Table2, Trash2, UploadCloud } from "lucide-react";
import { useDataSource, type DatasetInfo } from "@/context/DataSourceContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface DatasetPreview extends DatasetInfo { rows: Record<string, unknown>[] }

export default function DataImportPage() {
  const { datasets, activeDatasetId, activateDataset, refreshDatasets } = useDataSource();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<DatasetPreview | null>(null);

  const loadPreview = async (id: string) => {
    const response = await axios.get<DatasetPreview>(`${API_URL}/datasets/${id}/preview?limit=10`);
    setPreview(response.data);
  };

  useEffect(() => {
    const id = activeDatasetId ?? datasets[0]?.id;
    if (id) void loadPreview(id).catch(() => setPreview(null));
    else setPreview(null);
  }, [activeDatasetId, datasets]);

  const upload = async () => {
    if (!file) {
      setError("Choose a CSV, XLSX, or XLS file first.");
      return;
    }
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const form = new FormData();
      form.append("file", file);
      if (name.trim()) form.append("name", name.trim());
      const response = await axios.post<DatasetInfo>(`${API_URL}/datasets/import`, form);
      await refreshDatasets();
      activateDataset(response.data.id);
      await loadPreview(response.data.id);
      setSuccess(`${response.data.name} imported with ${response.data.row_count} records. Dashboard and Forecasting now use this dataset.`);
      setFile(null);
      setName("");
      const input = document.getElementById("dataset-file") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (caught: unknown) {
      const message = axios.isAxiosError(caught) ? caught.response?.data?.detail : null;
      setError(typeof message === "string" ? message : "The dataset could not be imported.");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (dataset: DatasetInfo) => {
    if (!confirm(`Remove imported dataset “${dataset.name}”? Your manually entered records will not be affected.`)) return;
    await axios.delete(`${API_URL}/datasets/${dataset.id}`);
    const remaining = await refreshDatasets();
    if (remaining[0]) {
      activateDataset(remaining[0].id);
      await loadPreview(remaining[0].id);
    } else {
      setPreview(null);
    }
  };

  const previewColumns = preview?.columns.slice(0, 14) ?? [];

  return <div className="mx-auto max-w-[1400px] space-y-6 pb-10">
    <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-brand"><Database className="h-3.5 w-3.5" /> Data source</div><h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">Import a dataset</h1><p className="mt-2 max-w-2xl text-sm text-muted">Upload external records for analysis without mixing them with data entered in the application.</p></div>
    </section>

    <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <article className="glass-panel p-6 xl:col-span-5">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-brand/10 p-2.5 text-brand"><UploadCloud className="h-5 w-5" /></div><div><h2 className="font-black text-ink">Upload records</h2><p className="text-xs text-muted">CSV, XLSX, or XLS · maximum 10 MB</p></div></div>
        <label className="mt-6 block text-xs font-bold text-muted">Dataset name <span className="font-normal">(optional)</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Example: 2026 daily activity" className="mt-2 h-11 w-full rounded-xl border border-line bg-canvas/60 px-4 text-sm text-ink outline-none transition focus:border-brand" /></label>
        <label htmlFor="dataset-file" className="mt-4 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-canvas/40 p-6 text-center transition hover:border-brand/50 hover:bg-brand/[0.03]"><FileSpreadsheet className="h-10 w-10 text-brand" /><p className="mt-3 text-sm font-black text-ink">{file?.name ?? "Choose an Excel or CSV file"}</p><p className="mt-1 text-xs text-muted">The “Everyday Activity” sheet is selected automatically when present.</p><input id="dataset-file" type="file" accept=".csv,.xlsx,.xls" className="sr-only" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setError(""); }} /></label>
        <button type="button" disabled={uploading || !file} onClick={upload} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-black text-white shadow-lg shadow-brand/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"><UploadCloud className="h-4 w-4" />{uploading ? "Importing…" : "Import and analyze"}</button>
        {error && <div className="mt-4 flex gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs font-bold text-rose-500"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
        {success && <div className="mt-4 flex gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs font-bold text-emerald-600"><CheckCircle2 className="h-4 w-4 shrink-0" />{success}</div>}
        <div className="mt-5 rounded-xl border border-line bg-canvas/40 p-4"><p className="text-xs font-black text-ink">Recommended columns</p><p className="mt-2 text-[11px] leading-relaxed text-muted">date, income_inr, total_expenses_inr, study_hours, focus_score, habit_completion_rate, goal progress, compliance_score, and risk scores. Extra columns are preserved.</p></div>
      </article>

      <article className="glass-panel overflow-hidden xl:col-span-7">
        <div className="flex items-center justify-between gap-3 border-b border-line p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-500"><Database className="h-5 w-5" /></div><div><h2 className="font-black text-ink">Imported datasets</h2><p className="text-xs text-muted">Choose which file drives Dashboard and Forecasting.</p></div></div><span className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-black text-muted">{datasets.length}</span></div>
        <div className="divide-y divide-line">{datasets.length ? datasets.map((dataset) => <div key={dataset.id} className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${activeDatasetId === dataset.id ? "bg-brand/[0.04]" : ""}`}><button type="button" onClick={() => { activateDataset(dataset.id); void loadPreview(dataset.id); }} className="min-w-0 text-left"><div className="flex items-center gap-2"><p className="truncate text-sm font-black text-ink">{dataset.name}</p>{activeDatasetId === dataset.id && <span className="rounded-full bg-brand/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-brand">Active</span>}</div><p className="mt-1 text-xs text-muted">{dataset.original_filename} · {dataset.row_count} rows · {dataset.column_count} columns</p><p className="mt-1 text-[10px] text-muted">Imported {new Date(dataset.imported_at).toLocaleString()}</p></button><div className="flex items-center gap-2"><button type="button" onClick={() => { activateDataset(dataset.id); void loadPreview(dataset.id); }} className="rounded-xl border border-brand/20 bg-brand/10 px-3 py-2 text-xs font-black text-brand">Use dataset</button><button type="button" onClick={() => void remove(dataset)} aria-label={`Remove ${dataset.name}`} className="rounded-xl border border-line p-2 text-muted transition hover:border-rose-500/30 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button></div></div>) : <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center"><Database className="h-10 w-10 text-muted/40" /><p className="mt-3 font-black text-ink">No imported datasets</p><p className="mt-1 max-w-sm text-xs text-muted">Upload a file to enable the Imported Dataset option in Dashboard and Forecasting.</p></div>}</div>
      </article>
    </section>

    {preview && <section className="glass-panel overflow-hidden"><div className="flex items-center gap-3 border-b border-line p-5"><div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500"><Table2 className="h-5 w-5" /></div><div><h2 className="font-black text-ink">Preview: {preview.name}</h2><p className="text-xs text-muted">First {preview.rows.length} rows · showing {previewColumns.length} of {preview.column_count} columns</p></div></div><div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead><tr className="border-b border-line bg-canvas/50">{previewColumns.map((column) => <th key={column} className="whitespace-nowrap px-4 py-3 font-black text-muted">{column}</th>)}</tr></thead><tbody>{preview.rows.map((row, index) => <tr key={index} className="border-b border-line/60 last:border-0">{previewColumns.map((column) => <td key={column} className="max-w-56 truncate whitespace-nowrap px-4 py-3 text-ink">{row[column] === null || row[column] === undefined ? "—" : String(row[column])}</td>)}</tr>)}</tbody></table></div></section>}
  </div>;
}
