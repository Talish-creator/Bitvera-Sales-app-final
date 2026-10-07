import React, { useState, useEffect } from 'react';
import { 
  X, Server, Wifi, WifiOff, RefreshCw, 
  Database, AlertTriangle, Clock, ArrowRight, 
  Sliders, Play, CheckCircle2 
} from 'lucide-react';
import { 
  fetchErpConfig, getSyncQueue, ClientErpConfig, 
  DEFAULT_CLIENT_ERP_CONFIG 
} from '../services/erpnextIntegration';
import { useLanguage } from '../context/LanguageContext';
import { ViewState } from '../types';

interface ErpStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewState) => void;
  onOpenSyncModal: () => void;
}

export default function ErpStatusModal({ 
  isOpen, 
  onClose, 
  onNavigate, 
  onOpenSyncModal 
}: ErpStatusModalProps) {
  const { t } = useLanguage();
  const [config, setConfig] = useState<ClientErpConfig>(DEFAULT_CLIENT_ERP_CONFIG);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchErpConfig().then(cfg => setConfig(cfg));
      const q = getSyncQueue();
      setPendingCount(q.filter(item => item.status === 'PENDING').length);
      setFailedCount(q.filter(item => item.status === 'FAILED').length);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl space-y-4 p-5 text-xs text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">{t("ERPNext Gateway Status")}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        <div className={`p-3 rounded-xl border flex items-center gap-3 ${
          config.connectionStatus === 'CONNECTED'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            : 'bg-slate-800/60 border-white/10 text-slate-300'
        }`}>
          {config.connectionStatus === 'CONNECTED' ? (
            <Wifi className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <WifiOff className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <div className="flex-1">
            <span className="font-bold block text-white">
              {config.connectionStatus === 'CONNECTED' ? t("CONNECTED (AUTHENTICATED)") : t("DISCONNECTED (STANDALONE)")}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {config.url || t("Standalone mode active")}
            </span>
          </div>
        </div>

        {/* Telemetry Breakdown */}
        <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 space-y-2 font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400">{t("Last Sync:")}</span>
            <span className="text-white">
              {config.lastSuccessAt ? new Date(config.lastSuccessAt).toLocaleTimeString() : t("None")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{t("Pending Records:")}</span>
            <span className="text-indigo-400 font-bold">{pendingCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{t("Failed Records:")}</span>
            <span className={failedCount > 0 ? "text-rose-400 font-bold" : "text-slate-400"}>{failedCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{t("Sync Mode:")}</span>
            <span className="text-cyan-400 uppercase">{config.syncSettings.autoSyncMode}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <button
            onClick={() => {
              onClose();
              onOpenSyncModal();
            }}
            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-xl font-bold font-mono uppercase text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5" />
            {t("Sync Now...")}
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigate('sync_center');
            }}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            {t("Open Sync Center")}
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigate('erp_settings');
            }}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            {t("Configure ERPNext")}
          </button>
        </div>

      </div>
    </div>
  );
}
