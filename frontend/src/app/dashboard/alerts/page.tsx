"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type Alert = {
  id: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  timestamp: string;
};

const severityStyle: Record<string, { panel: string; badge: string; icon: typeof Bell }> = {
  CRITICAL: { panel: "border-rose-500/30 bg-rose-500/5", badge: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: ShieldAlert },
  HIGH: { panel: "border-orange-500/30 bg-orange-500/5", badge: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: AlertTriangle },
  WARNING: { panel: "border-amber-500/30 bg-amber-500/5", badge: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: AlertTriangle },
  INFO: { panel: "border-brand/30 bg-brand/5", badge: "bg-brand/10 text-brand border-brand/20", icon: Bell },
};

export default function AlertsPage() {
  const { loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const response = await axios.get<Alert[]>(`${API_URL}/alerts`);
      setAlerts(response.data.filter((alert) => alert.status !== "RESOLVED"));
      setError(null);
    } catch (requestError) {
      console.error("Unable to load alerts", requestError);
      setError("Active alerts could not be loaded. Check the backend connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) loadAlerts();
  }, [authLoading, loadAlerts]);

  const resolveAlert = async (alertId: string) => {
    setResolvingId(alertId);
    try {
      await axios.put(`${API_URL}/alerts/${alertId}`, { status: "RESOLVED" });
      setAlerts((current) => current.filter((alert) => alert.id !== alertId));
    } catch (requestError) {
      console.error("Unable to resolve alert", requestError);
      setError("The alert could not be resolved. Please try again.");
    } finally {
      setResolvingId(null);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-[55vh] flex flex-col items-center justify-center text-muted"><Loader2 className="w-8 h-8 animate-spin text-brand" /><p className="mt-4 text-sm font-semibold">Loading active alerts…</p></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <section className="glass-panel p-6 sm:p-8 bg-gradient-to-br from-rose-500/10 via-surface to-transparent overflow-hidden relative">
        <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-rose-500/15 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-widest mb-3"><Bell className="w-4 h-4" /> Alert center</div>
            <h1 className="text-3xl sm:text-4xl font-black text-ink">Active alerts</h1>
            <p className="text-muted mt-2 max-w-xl">Only unresolved notifications are shown here. Audit logs and system activity remain in the separate Audit Trail.</p>
          </div>
          <button onClick={() => loadAlerts(true)} disabled={refreshing} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-canvas text-sm font-bold text-ink hover:border-brand/40 disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </section>

      {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-500">{error}</div>}

      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-bold text-ink">Needs attention</p>
        <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-black text-rose-500">{alerts.length} active</span>
      </div>

      {alerts.length === 0 ? (
        <section className="glass-panel py-16 px-6 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="w-7 h-7 text-emerald-500" /></div>
          <h2 className="text-xl font-black text-ink mt-4">You are all caught up</h2>
          <p className="text-sm text-muted mt-2">There are no unresolved alerts right now.</p>
        </section>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const style = severityStyle[alert.severity] || severityStyle.INFO;
            const Icon = style.icon;
            return (
              <motion.article key={alert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`rounded-2xl border p-5 ${style.panel}`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${style.badge}`}><Icon className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-black text-ink">{alert.title}</h2>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black tracking-wider ${style.badge}`}>{alert.severity}</span>
                    </div>
                    <p className="text-sm text-muted mt-2 leading-relaxed">{alert.description}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted mt-3"><Clock3 className="w-3.5 h-3.5" /> {new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                  <button onClick={() => resolveAlert(alert.id)} disabled={resolvingId === alert.id} className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold hover:bg-emerald-500/20 disabled:opacity-60">
                    {resolvingId === alert.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Resolve
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
