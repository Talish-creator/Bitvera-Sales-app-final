import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, 
  Wifi, WifiOff, Server, Database, Clock, Eye, 
  RotateCcw, Sliders, History, AlertCircle, FileText, 
  Play, Check, X, ShieldAlert, Cpu
} from 'lucide-react';
import { ViewState } from '../types';
import { 
  fetchErpConfig, getSyncQueue, getSyncHistory, 
  getSyncConflicts, retryQueueItem, cancelQueueItem, 
  resolveConflict, runErpDiagnostics, ClientErpConfig, 
  SyncQueueItem, SyncHistoryEntry, SyncConflict, 
  DEFAULT_CLIENT_ERP_CONFIG 
} from '../services/erpnextIntegration';
import SyncModal from './SyncModal';
import { useLanguage } from '../context/LanguageContext';

interface SyncCenterScreenProps {
  onNavigate: (view: ViewState) => void;
}

export default function SyncCenterScreen({ onNavigate }: SyncCenterScreenProps) {
  const { t } = useLanguage();
  const [config, setConfig] = useState<ClientErpConfig>(DEFAULT_CLIENT_ERP_CONFIG);
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'CONFLICTS' | 'HISTORY' | 'DIAGNOSTICS'>('QUEUE');

  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [history, setHistory] = useState<SyncHistoryEntry[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState<any>(null);
  const [runningDiag, setRunningDiag] = useState(false);

  const [actionNotification, setActionNotification] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const cfg = await fetchErpConfig();
    setConfig(cfg);
    setQueue(getSyncQueue());
    setHistory(getSyncHistory());
    setConflicts(getSyncConflicts());
  };

  const handleRetryItem = async (id: string) => {
    setActionNotification(t("Retrying queue item..."));
    const success = await retryQueueItem(id);
    setQueue(getSyncQueue());
    setActionNotification(success ? t("Item synchronized successfully!") : t("Retry failed. Check error message."));
    setTimeout(() => setActionNotification(''), 3000);
  };

  const handleCancelItem = (id: string) => {
    cancelQueueItem(id);
    setQueue(getSyncQueue());
  };

  const handleResolveConflict = async (conflictId: string, resolution: 'use_bitvera' | 'use_erp') => {
    await resolveConflict(conflictId, resolution);
    setConflicts(getSyncConflicts());
    setActionNotification(t("Conflict resolved successfully."));
    setTimeout(() => setActionNotification(''), 3000);
  };

  const handleRunDiagnostics = async () => {
    setRunningDiag(true);
    try {
      const diag = await runErpDiagnostics();
      setDiagnosticsData(diag);
      setActiveTab('DIAGNOSTICS');
    } finally {
      setRunningDiag(false);
    }
  };

  const pendingCount = queue.filter(q => q.status === 'PENDING').length;
  const failedCount = queue.filter(q => q.status === 'FAILED').length;

  return (
    <div className="space-y-6 pb-24 text-left font-sans relative z-10 transition-all duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-slate-350 hover:text-white rounded-xl transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-400" />
              {t("ERPNext Synchronization Command Center")}
            </h1>
            <p className="text-xs text-slate-400">
              {t("User-Governed Synchronization • Dry Runs • Queue Management • Conflict Resolver")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('erp_settings')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-xl text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            {t("Configure ERP")}
          </button>

          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold font-mono uppercase tracking-wide rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5" />
            {t("Sync Now...")}
          </button>
        </div>
      </div>

      {actionNotification && (
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs font-mono font-bold text-indigo-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {actionNotification}
        </div>
      )}

      {/* Gateway Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Connection Status Card */}
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">{t("ERP Gateway")}</span>
            <span className={`w-2.5 h-2.5 rounded-full ${config.connectionStatus === 'CONNECTED' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
          </div>
          <div className="flex items-center gap-2">
            {config.connectionStatus === 'CONNECTED' ? <Wifi className="w-5 h-5 text-emerald-400" /> : <WifiOff className="w-5 h-5 text-amber-400" />}
            <span className="text-base font-bold text-white font-mono">
              {config.connectionStatus === 'CONNECTED' ? t("CONNECTED") : t("STANDALONE")}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 block truncate">
            {config.url ? config.url : t("ERPNext Disconnected")}
          </span>
        </div>

        {/* Pending Sync Records */}
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 shadow-xl space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Pending Records")}</span>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <span className="text-base font-bold text-white font-mono">
              {pendingCount} {t("records")}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 block">
            {t("Queued locally in memory/disk")}
          </span>
        </div>

        {/* Failed Sync Records */}
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 shadow-xl space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Failed / Errors")}</span>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${failedCount > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
            <span className={`text-base font-bold font-mono ${failedCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {failedCount} {t("errors")}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 block">
            {t("Can be inspected and retried")}
          </span>
        </div>

        {/* Sync Mode Card */}
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 shadow-xl space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Sync Schedule Mode")}</span>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span className="text-base font-bold text-white font-mono uppercase">
              {config.syncSettings.autoSyncMode === 'manual' ? t("MANUAL") : config.syncSettings.autoSyncMode}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 block">
            {config.lastSuccessAt 
              ? `${t("Last:")} ${new Date(config.lastSuccessAt).toLocaleTimeString()}`
              : t("No prior sync recorded")}
          </span>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-mono font-bold">
        <button
          onClick={() => setActiveTab('QUEUE')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'QUEUE'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          {t("Sync Queue")} ({queue.length})
        </button>

        <button
          onClick={() => setActiveTab('CONFLICTS')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'CONFLICTS'
              ? 'bg-amber-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          {t("Conflicts")} ({conflicts.filter(c => c.status === 'pending').length})
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'HISTORY'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          {t("Sync History")} ({history.length})
        </button>

        <button
          onClick={() => {
            if (!diagnosticsData) handleRunDiagnostics();
            else setActiveTab('DIAGNOSTICS');
          }}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'DIAGNOSTICS'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          {t("Diagnostics")}
        </button>
      </div>

      {/* TAB 1: SYNC QUEUE */}
      {activeTab === 'QUEUE' && (
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-350">
              {t("Pending & Processed Queue Items")}
            </h2>
            <button
              onClick={() => setQueue(getSyncQueue())}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {queue.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-slate-500">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/60" />
              <p className="text-xs font-medium">{t("All local transactions are clear. No pending queue items.")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {queue.map(item => (
                <div 
                  key={item.id}
                  className="p-3 bg-slate-900/60 border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        item.status === 'SYNCED' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.status === 'FAILED' ? 'bg-rose-500/20 text-rose-400' :
                        item.status === 'CANCELLED' ? 'bg-slate-800 text-slate-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                      <strong className="text-white">{item.entityName}</strong>
                      <span className="text-[10px] font-mono text-slate-400">({item.entityType})</span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-3">
                      <span>Direction: {item.direction}</span>
                      <span>Retries: {item.retryCount}</span>
                      <span>Created: {new Date(item.createdAt).toLocaleTimeString()}</span>
                    </div>

                    {item.lastError && (
                      <p className="text-[10px] text-rose-400 font-mono">
                        Error: {item.lastError}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {item.status === 'FAILED' && (
                      <button
                        onClick={() => handleRetryItem(item.id)}
                        className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all"
                      >
                        <RotateCcw className="w-3 h-3" />
                        {t("Retry")}
                      </button>
                    )}

                    {item.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelItem(item.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-mono"
                      >
                        {t("Cancel")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONFLICTS RESOLVER */}
      {activeTab === 'CONFLICTS' && (
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              {t("Synchronization Conflict Resolution")}
            </h2>
            <span className="text-[11px] text-slate-400">
              {t("Resolve field value differences manually.")}
            </span>
          </div>

          {conflicts.filter(c => c.status === 'pending').length === 0 ? (
            <div className="text-center py-10 space-y-2 text-slate-500">
              <Check className="w-8 h-8 mx-auto text-emerald-500/60" />
              <p className="text-xs font-medium">{t("No unresolved conflicts detected.")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conflicts.filter(c => c.status === 'pending').map(c => (
                <div key={c.id} className="p-4 bg-slate-900 border border-amber-500/20 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white text-sm">{c.entityName}</span>
                      <span className="text-slate-400 ml-2 font-mono text-[10px]">({c.entityType} • Field: {c.field})</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      DISCREPANCY
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase block">Bitvera Field Value:</span>
                      <strong className="text-indigo-400">{String(c.bitveraValue)}</strong>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase block">ERPNext Master Value:</span>
                      <strong className="text-emerald-400">{String(c.erpValue)}</strong>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleResolveConflict(c.id, 'use_bitvera')}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
                    >
                      {t("Use Bitvera Value")}
                    </button>
                    <button
                      onClick={() => handleResolveConflict(c.id, 'use_erp')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                    >
                      {t("Use ERPNext Value")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SYNC HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-350">
              {t("Audit Log of Completed Sync Runs")}
            </h2>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-slate-500">
              <History className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-medium">{t("No historical synchronization sessions recorded.")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(h => (
                <div key={h.syncId} className="p-3.5 bg-slate-900/60 border border-white/5 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-400">{h.syncId}</span>
                      <span className="text-slate-400 text-[10px]">• {new Date(h.completedAt).toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{h.user}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                    <span className="text-emerald-400">{h.created} created</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-indigo-400">{h.updated} updated</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{h.skipped} skipped</span>
                    {h.failed > 0 && (
                      <>
                        <span className="text-slate-500">•</span>
                        <span className="text-rose-400 font-bold">{h.failed} failed</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DIAGNOSTICS */}
      {activeTab === 'DIAGNOSTICS' && (
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              {t("Live ERPNext Health & Latency Telemetry")}
            </h2>
            <button
              onClick={handleRunDiagnostics}
              disabled={runningDiag}
              className="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${runningDiag ? 'animate-spin' : ''}`} />
              {t("Run Diagnostics")}
            </button>
          </div>

          {diagnosticsData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-900 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase">Network Connection</span>
                <strong className={diagnosticsData.connection === 'ONLINE' ? 'text-emerald-400' : 'text-rose-400'}>
                  {diagnosticsData.connection}
                </strong>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase">Round-Trip Latency</span>
                <strong className="text-cyan-400">{diagnosticsData.latencyMs} ms</strong>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase">Token Auth Status</span>
                <strong className={diagnosticsData.authStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}>
                  {diagnosticsData.authStatus}
                </strong>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase">ERPNext Version</span>
                <strong className="text-white">{diagnosticsData.version}</strong>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              {t("Click 'Run Diagnostics' to test live ping, auth, and doctype permissions.")}
            </div>
          )}
        </div>
      )}

      {/* Sync Selection Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncComplete={() => loadAll()}
      />

    </div>
  );
}
