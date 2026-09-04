"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { History, RefreshCw, AlertCircle, Eye, EyeOff, Terminal } from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  action_type: string;
  endpoint: string;
  ip_address: string | null;
  activity_metadata: Record<string, any> | null;
  status_code: number;
  user_agent: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/audit?limit=100`);
      setLogs(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load audit logs", err);
      setError("Unable to sync activity history. Check backend connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const toggleMetadata = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  if (loading) {
    return <div className="p-8 text-brand animate-pulse font-mono tracking-widest">Initializing Telemetry...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="relative glass-panel p-8 md:p-12 overflow-hidden bg-gradient-to-br from-cyan-500/10 to-transparent border-none ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none -z-10 transform translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 text-xs font-bold uppercase tracking-widest mb-4">
              <Terminal className="w-4 h-4" /> Live Telemetry
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tight mb-2">Audit Logs</h1>
            <p className="text-muted text-lg max-w-xl">
              Real-time monitoring of all system events, automated alerts, and API traffic.
            </p>
          </div>
          
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="px-6 py-3 bg-canvas border border-brand/20 hover:border-brand/50 rounded-xl text-sm font-bold text-ink flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Sync Now
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <span className="text-sm font-bold text-rose-500">{error}</span>
        </div>
      )}

      {/* Cyberdeck Log Display */}
      <div className="glass-panel p-4 md:p-8 space-y-4">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-muted border-dashed border-2 rounded-2xl flex flex-col items-center">
            <History className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-semibold text-lg">No Activity Logged</p>
            <p className="text-sm mt-1">Awaiting incoming telemetry streams.</p>
          </div>
        ) : (
          logs.map((log, i) => {
            const isExpanded = expandedLogId === log.id;
            const isSuccess = log.status_code < 300;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={log.id} 
                className={`rounded-2xl border transition-all ${
                  isExpanded ? 'bg-canvas/80 border-brand/40 shadow-lg shadow-brand/5' : 'bg-canvas/30 border-line hover:border-brand/20'
                }`}
              >
                <div 
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => toggleMetadata(log.id)}
                >
                  <div className="flex flex-wrap items-center gap-4 flex-1">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${
                      isSuccess ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                    }`}>
                      {log.status_code}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-ink text-xs font-bold uppercase tracking-wider">
                      {log.action_type}
                    </span>
                    <span className="font-mono text-sm text-brand truncate max-w-full lg:max-w-[300px]">
                      {log.endpoint}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 lg:justify-end text-[11px] font-mono text-muted uppercase tracking-wider w-full lg:w-auto">
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="hidden sm:inline">{log.ip_address || "127.0.0.1"}</span>
                    {log.activity_metadata && Object.keys(log.activity_metadata).length > 0 && (
                      <span className="text-brand font-bold flex items-center gap-1 bg-brand/10 px-2 py-1 rounded-md">
                        {isExpanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        Payload
                      </span>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && log.activity_metadata && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 border-t border-line/50 bg-[#0f172a] rounded-b-2xl">
                        <pre className="text-xs font-mono text-cyan-400 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.activity_metadata, null, 2)}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
