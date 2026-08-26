"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { History, RefreshCw, Server, AlertCircle, Eye, EyeOff } from "lucide-react";

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
  
  // Keep track of which log's metadata is expanded/inspected
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
    
    // Live Polling every 3 seconds (real-time audit refresh requirement)
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Connecting to PostgreSQL Logs...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" /> PostgreSQL User Activity History
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Live audit logs logged in database <b>user_activity_history</b> table. (Updates automatically every 3s)
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Logs
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-sm text-red-200">{error}</span>
        </div>
      )}

      <div className="glass-panel p-6 border border-slate-800 space-y-4">
        <div className="overflow-x-auto border border-slate-900 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <th className="p-3.5 font-semibold uppercase">Timestamp</th>
                <th className="p-3.5 font-semibold uppercase">Action Type</th>
                <th className="p-3.5 font-semibold uppercase">Endpoint</th>
                <th className="p-3.5 font-semibold uppercase">IP Address</th>
                <th className="p-3.5 font-semibold uppercase">Response</th>
                <th className="p-3.5 font-semibold uppercase">User Agent</th>
                <th className="p-3.5 text-center">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No activity records found. Try registering, logging in, or saving records.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-850/15">
                        <td className="p-3.5 font-mono text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-bold text-slate-200">
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-850">
                            {log.action_type}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[10px] text-cyan-400">{log.endpoint}</td>
                        <td className="p-3.5 font-mono text-[10px] text-slate-400">{log.ip_address || "127.0.0.1"}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                              log.status_code < 300
                                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-950/40 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {log.status_code}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 max-w-[200px] truncate" title={log.user_agent || "—"}>
                          {log.user_agent || "—"}
                        </td>
                        <td className="p-3.5 text-center">
                          {log.activity_metadata && Object.keys(log.activity_metadata).length > 0 ? (
                            <button
                              onClick={() => toggleMetadata(log.id)}
                              className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer font-bold"
                            >
                              {isExpanded ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" /> Close
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5" /> Inspect
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Metadata JSON code block */}
                      {isExpanded && log.activity_metadata && (
                        <tr className="bg-slate-950/40">
                          <td colSpan={7} className="p-4 border-t border-slate-900">
                            <div className="text-left font-mono text-[10px] text-cyan-400/90 bg-slate-950 p-4 rounded-lg border border-slate-900 overflow-x-auto shadow-inner">
                              <pre>{JSON.stringify(log.activity_metadata, null, 2)}</pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
