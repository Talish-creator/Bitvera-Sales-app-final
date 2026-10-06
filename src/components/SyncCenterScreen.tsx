import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, 
  Wifi, WifiOff, Server, Database, Clock, ArrowRight 
} from 'lucide-react';
import { ViewState } from '../types';
import { getQueueStatus, syncPendingQueue, QueuedTransaction } from '../services/offlineQueue';
import { useLanguage } from '../context/LanguageContext';

interface SyncCenterScreenProps {
  onNavigate: (view: ViewState) => void;
}

export default function SyncCenterScreen({ onNavigate }: SyncCenterScreenProps) {
  const { t } = useLanguage();
  const [queueStatus, setQueueStatus] = useState(() => getQueueStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [erpHealth, setErpHealth] = useState<{
    status: 'CONNECTED' | 'OFFLINE' | 'DEGRADED';
    pingMs: number;
    lastChecked: string;
  }>({
    status: navigator.onLine ? 'CONNECTED' : 'OFFLINE',
    pingMs: navigator.onLine ? 42 : 0,
    lastChecked: new Date().toLocaleTimeString()
  });

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncMessage(t("Connecting to Bitvera ERP backend..."));
    try {
      const syncedCount = await syncPendingQueue();
      setQueueStatus(getQueueStatus());
      setSyncMessage(`${t("Sync completed successfully.")} ${syncedCount} ${t("transactions pushed.")}`);
    } catch (err: any) {
      setSyncMessage(t("Sync failed or terminal is currently offline."));
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(''), 4000);
    }
  };

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
              {t("Synchronization & ERP Gateway")}
            </h1>
            <p className="text-xs text-slate-400">{t("Offline Transaction Buffer & Backend Health Telemetry")}</p>
          </div>
        </div>

        <button
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold font-mono uppercase tracking-wide rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? t("Syncing...") : t("Synchronize All")}
        </button>
      </div>

      {syncMessage && (
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs font-mono font-bold text-indigo-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {syncMessage}
        </div>
      )}

      {/* Gateway Diagnostics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Connection State */}
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">{t("ERP Gateway")}</span>
            <span className={`w-2.5 h-2.5 rounded-full ${navigator.onLine ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
          </div>
          <div className="flex items-center gap-2">
            {navigator.onLine ? <Wifi className="w-5 h-5 text-emerald-400" /> : <WifiOff className="w-5 h-5 text-rose-400" />}
            <span className="text-base font-bold text-white font-mono">
              {navigator.onLine ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 block">
            Latency: {erpHealth.pingMs}ms • Riyadh Cloud
          </span>
        </div>

        {/* Pending Queue Count */}
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 shadow-xl space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Pending Offline Buffer")}</span>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <span className="text-base font-bold text-white font-mono">
              {queueStatus.pendingCount} {t("records")}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 block">
            IndexedDB Durable Store
          </span>
        </div>

        {/* Last Sync Stamp */}
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 shadow-xl space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Last Successful Sync")}</span>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#10b981]" />
            <span className="text-sm font-bold text-white font-mono">
              {queueStatus.lastSync ? new Date(queueStatus.lastSync).toLocaleTimeString() : 'Ready to sync'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 block">
            Auto-sync on network restore
          </span>
        </div>

      </div>

      {/* Pending Transactions Ledger */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            {t("Queued Offline Transaction Ledger")}
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {queueStatus.items.length} {t("transactions tracked")}
          </span>
        </div>

        {queueStatus.items.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2 opacity-60" />
            {t("All transactions are fully synchronized with the enterprise server.")}
          </div>
        ) : (
          <div className="space-y-3">
            {queueStatus.items.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/70 border border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-3 font-mono text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{item.action}</span>
                    <span className="text-[10px] text-slate-400">#{item.id}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Created: {new Date(item.createdAt).toLocaleString()} • Retries: {item.retryCount}
                  </span>
                  {item.lastError && (
                    <span className="text-[10px] text-rose-400 block mt-0.5">{item.lastError}</span>
                  )}
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.status === 'SYNCED' ? 'bg-emerald-500/10 text-emerald-400' :
                  item.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
