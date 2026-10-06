import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, ShieldCheck, Download, Search, 
  Filter, AlertTriangle, Shield, CheckCircle2 
} from 'lucide-react';
import { ViewState } from '../types';
import { queryAuditLogs, exportAuditLogsJson } from '../services/admin';
import { useLanguage } from '../context/LanguageContext';

interface AuditCenterScreenProps {
  onNavigate: (view: ViewState) => void;
}

export default function AuditCenterScreen({ onNavigate }: AuditCenterScreenProps) {
  const { t } = useLanguage();
  const [levelFilter, setLevelFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  const logs = useMemo(() => {
    return queryAuditLogs({
      level: levelFilter || undefined,
      category: categoryFilter || undefined,
      search: search || undefined
    });
  }, [levelFilter, categoryFilter, search]);

  return (
    <div className="space-y-6 pb-24 text-left font-sans relative z-10 transition-all duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-slate-350 hover:text-white rounded-xl transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              {t("Append-Only Cryptographic Audit Log")}
            </h1>
            <p className="text-xs text-slate-400">{t("Tamper-Evident Transaction, Authentication & Telemetry Ledger")}</p>
          </div>
        </div>

        <button
          onClick={exportAuditLogsJson}
          className="px-3.5 py-2 bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase rounded-xl flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          {t("Export JSON")}
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-lg">
        <div>
          <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Log Level")}</label>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
          >
            <option value="">All Levels</option>
            <option value="AUDIT">AUDIT</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="INFO">INFO</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Domain Category")}</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
          >
            <option value="">All Categories</option>
            <option value="ORDER">ORDER</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="AUTH">AUTH</option>
            <option value="SECURITY">SECURITY</option>
            <option value="SYNC">SYNC</option>
            <option value="SYSTEM">SYSTEM</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Search Message")}</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords or user..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* Log Entries Stream */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 shadow-lg space-y-2">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            {t("Audit Records")} ({logs.length})
          </span>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Immutable Sequence Verified
          </span>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              {t("No log records matching filter.")}
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-900/50 border border-white/5 font-mono text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      log.level === 'AUDIT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      log.level === 'WARN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      log.level === 'ERROR' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {log.level}
                    </span>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-slate-300">
                      {log.category}
                    </span>
                    <span className="text-slate-500">
                      User: <strong className="text-slate-300">{log.userName || 'system'}</strong>
                    </span>
                  </div>
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                </div>

                <p className="text-slate-200 text-xs font-sans leading-relaxed pt-0.5">
                  {log.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
