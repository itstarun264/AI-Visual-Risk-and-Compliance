"use client";

import Link from "next/link";
import { Database, Upload, UserRound } from "lucide-react";
import { useDataSource } from "@/context/DataSourceContext";

export function DataSourceSwitch() {
  const { source, datasets, activeDatasetId, activeDataset, setSource, setActiveDatasetId, loadingDatasets } = useDataSource();

  return <div className="rounded-2xl border border-line bg-surface/90 p-2 shadow-sm">
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="inline-flex rounded-xl bg-canvas/70 p-1">
        <button type="button" onClick={() => setSource("user")} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black transition ${source === "user" ? "bg-brand text-white shadow" : "text-muted hover:text-ink"}`}><UserRound className="h-4 w-4" /> My data</button>
        <button type="button" onClick={() => setSource("dataset")} disabled={!datasets.length} title={!datasets.length ? "Import a dataset first" : undefined} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${source === "dataset" ? "bg-brand text-white shadow" : "text-muted hover:text-ink"}`}><Database className="h-4 w-4" /> Imported dataset</button>
      </div>
      {source === "dataset" && datasets.length > 0 && <select value={activeDatasetId ?? ""} onChange={(event) => setActiveDatasetId(event.target.value)} className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-canvas/60 px-3 text-xs font-bold text-ink outline-none focus:border-brand">
        {datasets.map((dataset) => <option key={dataset.id} value={dataset.id}>{dataset.name} · {dataset.row_count} rows</option>)}
      </select>}
      <Link href="/dashboard/data-import" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-brand/25 bg-brand/10 px-4 text-xs font-black text-brand transition hover:bg-brand hover:text-white"><Upload className="h-4 w-4" /> {datasets.length ? "Manage imports" : "Import data"}</Link>
    </div>
    <p className="px-2 pb-1 pt-2 text-[11px] text-muted">{loadingDatasets ? "Loading data sources…" : source === "dataset" && activeDataset ? `Reports use ${activeDataset.original_filename}. Your manually entered records are unchanged.` : "Reports use only records you entered in Finance, Study, Habits, and Goals."}</p>
  </div>;
}
