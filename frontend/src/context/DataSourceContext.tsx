"use client";

import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export type DataSourceMode = "user" | "dataset";

export interface DatasetInfo {
  id: string;
  name: string;
  original_filename: string;
  file_type: string;
  sheet_name?: string | null;
  row_count: number;
  column_count: number;
  columns: string[];
  imported_at: string;
}

interface DataSourceContextValue {
  source: DataSourceMode;
  datasets: DatasetInfo[];
  activeDatasetId: string | null;
  activeDataset: DatasetInfo | null;
  loadingDatasets: boolean;
  setSource: (source: DataSourceMode) => void;
  setActiveDatasetId: (id: string | null) => void;
  activateDataset: (id: string) => void;
  refreshDatasets: () => Promise<DatasetInfo[]>;
}

const DataSourceContext = createContext<DataSourceContextValue | undefined>(undefined);

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [source, setSourceState] = useState<DataSourceMode>("user");
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [activeDatasetId, setActiveDatasetIdState] = useState<string | null>(null);
  const [loadingDatasets, setLoadingDatasets] = useState(false);

  useEffect(() => {
    const savedSource = localStorage.getItem("analytics-source");
    const savedDataset = localStorage.getItem("analytics-dataset-id");
    if (savedSource === "dataset") setSourceState("dataset");
    if (savedDataset) setActiveDatasetIdState(savedDataset);
  }, []);

  const refreshDatasets = useCallback(async () => {
    if (!user) {
      setDatasets([]);
      return [];
    }
    setLoadingDatasets(true);
    try {
      const response = await axios.get<DatasetInfo[]>(`${API_URL}/datasets`);
      setDatasets(response.data);
      setActiveDatasetIdState((current) => {
        if (current && response.data.some((dataset) => dataset.id === current)) return current;
        return response.data[0]?.id ?? null;
      });
      if (!response.data.length) {
        setSourceState("user");
        localStorage.setItem("analytics-source", "user");
        localStorage.removeItem("analytics-dataset-id");
      }
      return response.data;
    } catch {
      setDatasets([]);
      setSourceState("user");
      return [];
    } finally {
      setLoadingDatasets(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshDatasets();
  }, [refreshDatasets]);

  const setSource = (mode: DataSourceMode) => {
    const next = mode === "dataset" && !datasets.length ? "user" : mode;
    setSourceState(next);
    localStorage.setItem("analytics-source", next);
  };

  const setActiveDatasetId = (id: string | null) => {
    setActiveDatasetIdState(id);
    if (id) localStorage.setItem("analytics-dataset-id", id);
    else localStorage.removeItem("analytics-dataset-id");
  };

  const activateDataset = (id: string) => {
    setActiveDatasetId(id);
    setSourceState("dataset");
    localStorage.setItem("analytics-source", "dataset");
  };

  const activeDataset = useMemo(() => datasets.find((dataset) => dataset.id === activeDatasetId) ?? null, [datasets, activeDatasetId]);

  return <DataSourceContext.Provider value={{ source, datasets, activeDatasetId, activeDataset, loadingDatasets, setSource, setActiveDatasetId, activateDataset, refreshDatasets }}>{children}</DataSourceContext.Provider>;
}

export function useDataSource() {
  const context = useContext(DataSourceContext);
  if (!context) throw new Error("useDataSource must be used within DataSourceProvider");
  return context;
}
