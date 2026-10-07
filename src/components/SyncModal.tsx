import React, { useState, useEffect } from 'react';
import { 
  X, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, 
  Database, Users, Package, ShoppingCart, DollarSign, 
  MapPin, Clock, Eye, AlertCircle, FileText
} from 'lucide-react';
import { 
  fetchErpConfig, previewSync, executeUserSync, 
  ClientErpConfig, SyncHistoryEntry, getEntitySourceOfTruth 
} from '../services/erpnextIntegration';
import { useLanguage } from '../context/LanguageContext';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: (report: SyncHistoryEntry) => void;
}

export default function SyncModal({ isOpen, onClose, onSyncComplete }: SyncModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<'SELECT' | 'PREVIEW' | 'SYNCING' | 'REPORT'>('SELECT');
  const [config, setConfig] = useState<ClientErpConfig | null>(null);

  // Selected modules for sync
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'customers', 'orders', 'payments'
  ]);

  // Preview data
  const [previewData, setPreviewData] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Sync execution state
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' });
  const [finalReport, setFinalReport] = useState<SyncHistoryEntry | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('SELECT');
      fetchErpConfig().then(cfg => {
        setConfig(cfg);
        // Pre-select modules that are enabled in user settings
        const enabled = Object.entries(cfg.syncSettings.modules)
          .filter(([_, m]) => m.enabled)
          .map(([k]) => k);
        if (enabled.length > 0) setSelectedModules(enabled);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleModule = (mod: string) => {
    if (selectedModules.includes(mod)) {
      setSelectedModules(selectedModules.filter(m => m !== mod));
    } else {
      setSelectedModules([...selectedModules, mod]);
    }
  };

  const handleGeneratePreview = async () => {
    setLoadingPreview(true);
    try {
      const prev = await previewSync(selectedModules);
      setPreviewData(prev);
      setStep('PREVIEW');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleStartSync = async () => {
    setStep('SYNCING');
    setProgress({ current: 0, total: 10, message: t("Initializing synchronization...") });
    
    try {
      const report = await executeUserSync(selectedModules, (current, total, message) => {
        setProgress({ current, total, message });
      });
      setFinalReport(report);
      setStep('REPORT');
      if (onSyncComplete) onSyncComplete(report);
    } catch (err: any) {
      console.error('Sync failed:', err);
      setStep('REPORT');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                {t("ERPNext Controlled Synchronization")}
                {config?.connectionStatus === 'CONNECTED' ? (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ● {t("CONNECTED")}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    ○ {t("DISCONNECTED (STANDALONE)")}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400">
                {step === 'SELECT' && t("Select exactly what data to synchronize. You remain in control.")}
                {step === 'PREVIEW' && t("Review the synchronization dry run before committing changes.")}
                {step === 'SYNCING' && t("Synchronizing selected records with ERPNext...")}
                {step === 'REPORT' && t("Synchronization run completed.")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* STEP 1: SELECT MODULES */}
          {step === 'SELECT' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-2.5 text-indigo-200">
                <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  {t("Bitvera never dumps the entire database. Check the categories you wish to synchronize.")}
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                  {t("Synchronizable Entities & Source of Truth")}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <ModuleCheckbox
                    label={t("Customers")}
                    desc={getEntitySourceOfTruth('customers').description}
                    checked={selectedModules.includes('customers')}
                    onChange={() => toggleModule('customers')}
                    icon={<Users className="w-4 h-4 text-indigo-400" />}
                    badge={getEntitySourceOfTruth('customers').source}
                  />

                  <ModuleCheckbox
                    label={t("Sales Orders")}
                    desc={getEntitySourceOfTruth('orders').description}
                    checked={selectedModules.includes('orders')}
                    onChange={() => toggleModule('orders')}
                    icon={<ShoppingCart className="w-4 h-4 text-emerald-400" />}
                    badge={getEntitySourceOfTruth('orders').source}
                  />

                  <ModuleCheckbox
                    label={t("Products / Price List")}
                    desc={getEntitySourceOfTruth('products').description}
                    checked={selectedModules.includes('products')}
                    onChange={() => toggleModule('products')}
                    icon={<Package className="w-4 h-4 text-amber-400" />}
                    badge={getEntitySourceOfTruth('products').source}
                  />

                  <ModuleCheckbox
                    label={t("Payments & Balances")}
                    desc={getEntitySourceOfTruth('payments').description}
                    checked={selectedModules.includes('payments')}
                    onChange={() => toggleModule('payments')}
                    icon={<DollarSign className="w-4 h-4 text-cyan-400" />}
                    badge={getEntitySourceOfTruth('payments').source}
                  />

                  <ModuleCheckbox
                    label={t("Field Visits & Route")}
                    desc={getEntitySourceOfTruth('visits').description}
                    checked={selectedModules.includes('visits')}
                    onChange={() => toggleModule('visits')}
                    icon={<MapPin className="w-4 h-4 text-purple-400" />}
                    badge={getEntitySourceOfTruth('visits').source}
                  />

                  <ModuleCheckbox
                    label={t("Van Stock & Inventory")}
                    desc={getEntitySourceOfTruth('inventory').description}
                    checked={selectedModules.includes('inventory')}
                    onChange={() => toggleModule('inventory')}
                    icon={<Database className="w-4 h-4 text-rose-400" />}
                    badge={getEntitySourceOfTruth('inventory').source}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW DRY RUN */}
          {step === 'PREVIEW' && previewData && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-emerald-300">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">{t("Dry Run Analysis Complete")}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  Est. Duration: ~{previewData.estimatedSeconds}s
                </span>
              </div>

              <div className="bg-slate-950/60 border border-white/10 rounded-xl divide-y divide-white/5 font-mono text-[11px]">
                {selectedModules.includes('customers') && (
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-350">{t("Customers")}</span>
                    <span className="text-white">
                      <strong className="text-emerald-400">{previewData.customers.toCreate}</strong> to create •{' '}
                      <strong className="text-indigo-400">{previewData.customers.toUpdate}</strong> to update
                    </span>
                  </div>
                )}

                {selectedModules.includes('orders') && (
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-350">{t("Sales Orders")}</span>
                    <span className="text-white">
                      <strong className="text-emerald-400">{previewData.orders.toSubmit}</strong> to push •{' '}
                      <strong className="text-slate-400">{previewData.orders.alreadySynced}</strong> already synced
                    </span>
                  </div>
                )}

                {(selectedModules.includes('products') || selectedModules.includes('inventory')) && (
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-350">{t("Products & Rates")}</span>
                    <span className="text-white">
                      <strong className="text-cyan-400">{previewData.products.toUpdate}</strong> to verify with ERP
                    </span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-slate-300 block">{t("Safety Guarantees:")}</span>
                <p>• {t("Duplicate protection active using stable Bitvera external IDs.")}</p>
                <p>• {t("Orders already pushed are idempotent and will not create duplicate ERP documents.")}</p>
                <p>• {t("Local records will remain safe even if network drops during sync.")}</p>
              </div>
            </div>
          )}

          {/* STEP 3: SYNCING IN PROGRESS */}
          {step === 'SYNCING' && (
            <div className="py-8 space-y-4 text-center">
              <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
              <div>
                <h3 className="font-bold text-sm text-white">{t("Processing Synchronization...")}</h3>
                <p className="text-xs text-slate-400 mt-1">{progress.message || t("Communicating with ERPNext Gateway")}</p>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10 max-w-xs mx-auto">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${progress.total ? Math.min(100, Math.round((progress.current / progress.total) * 100)) : 40}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP 4: FINAL REPORT */}
          {step === 'REPORT' && finalReport && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">{t("Synchronization Completed")}</h3>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <span className="text-base font-bold text-emerald-400">{finalReport.created}</span>
                    <span className="text-[9px] text-slate-400 block uppercase">{t("Created")}</span>
                  </div>
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <span className="text-base font-bold text-indigo-400">{finalReport.updated}</span>
                    <span className="text-[9px] text-slate-400 block uppercase">{t("Updated")}</span>
                  </div>
                  <div className="p-2 bg-slate-800 border border-white/10 rounded-lg">
                    <span className="text-base font-bold text-slate-350">{finalReport.skipped}</span>
                    <span className="text-[9px] text-slate-400 block uppercase">{t("Skipped")}</span>
                  </div>
                  <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                    <span className="text-base font-bold text-rose-400">{finalReport.failed}</span>
                    <span className="text-[9px] text-slate-400 block uppercase">{t("Failed")}</span>
                  </div>
                </div>
              </div>

              {/* Detail Items Log */}
              {finalReport.details.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    {t("Detailed Log of Processed Records")}
                  </span>
                  {finalReport.details.map((it, idx) => (
                    <div 
                      key={idx}
                      className="p-2 bg-slate-950/40 border border-white/5 rounded-lg flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          it.status === 'CREATED' ? 'bg-emerald-400' :
                          it.status === 'UPDATED' ? 'bg-indigo-400' :
                          it.status === 'FAILED' ? 'bg-rose-400' : 'bg-slate-500'
                        }`} />
                        <span className="text-white font-medium">{it.name}</span>
                        <span className="text-[9px] font-mono text-slate-400">({it.entityType})</span>
                      </div>
                      <div className="text-[10px] font-mono">
                        {it.erpId && <span className="text-emerald-400">{it.erpId}</span>}
                        {it.error && <span className="text-rose-400">{it.error}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
          {step === 'SELECT' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {t("Cancel")}
              </button>

              <button
                onClick={handleGeneratePreview}
                disabled={selectedModules.length === 0 || loadingPreview}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wide flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                {loadingPreview ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                {t("Preview Sync (Dry Run)")}
              </button>
            </>
          )}

          {step === 'PREVIEW' && (
            <>
              <button
                onClick={() => setStep('SELECT')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {t("Back to Selection")}
              </button>

              <button
                onClick={handleStartSync}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wide flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t("Confirm & Start Sync")}
              </button>
            </>
          )}

          {step === 'REPORT' && (
            <button
              onClick={onClose}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wide transition-all cursor-pointer shadow-lg"
            >
              {t("Done & Close")}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

function ModuleCheckbox({
  label,
  desc,
  checked,
  onChange,
  icon,
  badge
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
  icon: React.ReactNode;
  badge: string;
}) {
  return (
    <div 
      onClick={onChange}
      className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
        checked 
          ? 'bg-indigo-600/10 border-indigo-500/40 text-white' 
          : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/15'
      }`}
    >
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange}
        className="mt-0.5 rounded border-white/20 text-indigo-600 focus:ring-0 cursor-pointer"
      />
      <div className="space-y-1 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-xs text-white">
            {icon}
            {label}
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-350">
            {badge}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
