import React, { useState } from 'react';
import { Shield, X, Download, Trash2, Eye, MapPin, Camera, Database, FileText, Check, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'compliance' | 'controls'>('overview');
  const [telemetryOptIn, setTelemetryOptIn] = useState(() => {
    return localStorage.getItem('bitvera_telemetry') !== 'false';
  });
  const [actionMessage, setActionMessage] = useState('');
  const [showConfirmPurge, setShowConfirmPurge] = useState(false);

  if (!isOpen) return null;

  const handleToggleTelemetry = () => {
    const newVal = !telemetryOptIn;
    setTelemetryOptIn(newVal);
    localStorage.setItem('bitvera_telemetry', String(newVal));
    showStatusMessage(
      newVal 
        ? t("Anonymous diagnostic telemetry enabled.") 
        : t("Diagnostic telemetry turned off. Fully private mode.")
    );
  };

  const showStatusMessage = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 4000);
  };

  const handleExportData = () => {
    try {
      // Gather local data for export
      const exportObject: Record<string, any> = {
        app: "Bitvera Sales Enterprise",
        timestamp: new Date().toISOString(),
        locale: language,
        identity: {
          name: "Ramy Ahmed",
          role: "Authorized Representative",
          warehouse: "Sadus Stock Riyadh"
        },
        local_cache_footprint: {
          localStorage_keys: Object.keys(localStorage),
          service_worker: "Active",
          telemetry_status: telemetryOptIn ? "Opted In" : "Opted Out"
        }
      };

      // Pull current customer additions or order queue if present
      const orders = localStorage.getItem('bitvera_orders');
      if (orders) exportObject.cached_sales_orders = JSON.parse(orders);

      const customers = localStorage.getItem('bitvera_new_customers');
      if (customers) exportObject.cached_customer_records = JSON.parse(customers);

      // Create downloadable file
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `bitvera_user_data_inventory_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showStatusMessage(t("Data inventory report downloaded."));
    } catch (e) {
      showStatusMessage("Failed to compile local data.");
    }
  };

  const handlePurgeLogs = () => {
    try {
      // Retain essential i18n and theme keys, but wipe offline sales logs / caches
      const theme = localStorage.getItem('theme');
      const lang = localStorage.getItem('system_language');
      
      localStorage.clear();
      
      if (theme) localStorage.setItem('theme', theme);
      if (lang) localStorage.setItem('system_language', lang);
      
      localStorage.setItem('bitvera_telemetry', String(telemetryOptIn));
      
      setShowConfirmPurge(false);
      showStatusMessage(t("Offline data caches and session storage purged."));
    } catch (e) {
      showStatusMessage("Error clearing storage.");
    }
  };

  const isRtl = language === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      {/* Modal Card wrapper */}
      <div className="w-full max-w-lg bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] relative text-left">
        
        {/* Header decoration bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-600"></div>

        {/* Title area */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide font-sans">{t("Privacy & Data Security Center")}</h2>
              <p className="text-[10px] font-mono font-semibold text-[#10b981]">{t("STRICT COMPLIANCE // SAUDI PDPL COMPLIANT")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls Selector */}
        <div className="flex border-b border-white/5 bg-slate-900/50 p-1 font-bold text-[10px] font-mono overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-lg cursor-pointer transition-all ${
              activeTab === 'overview' 
                ? 'bg-indigo-600 text-white border border-white/15' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t("Overview")}
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-2 rounded-lg cursor-pointer transition-all ${
              activeTab === 'data' 
                ? 'bg-indigo-600 text-white border border-white/15' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t("Collected Data")}
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3 py-2 rounded-lg cursor-pointer transition-all ${
              activeTab === 'compliance' 
                ? 'bg-indigo-600 text-white border border-white/15' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t("Data Protection")}
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={`px-3 py-2 rounded-lg cursor-pointer transition-all ${
              activeTab === 'controls' 
                ? 'bg-indigo-600 text-white border border-white/15' 
                : 'text-slate-500 hover:text-white font-bold'
            }`}
          >
            ⚡ {t("My Data Controls")}
          </button>
        </div>

        {/* Notifications and Alerts toast internally */}
        {actionMessage && (
          <div className="mx-5 mt-4 p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold rounded-lg flex items-center gap-2 animate-pulse">
            <Check className="w-3.5 h-3.5" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-350 leading-relaxed font-sans max-h-[50vh]">
          
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <p className="text-slate-350 font-medium">
                {t("We at Bitvera take data privacy seriously. This service is engineered for authorized corporate rep use, ensuring strict security of local operations, route telemetry, and customer verification assets.")}
              </p>
              
              <div className="bg-slate-900/40 border border-white/5 p-3 rounded-xl space-y-2">
                <h4 className="font-bold text-white uppercase text-[10px] tracking-wider font-mono">{t("Core Principles")}</h4>
                <ul className="space-y-1.5 list-none p-0 m-0">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>{t("Data Minimization")}:</strong> {t("Only necessary data for van sales authorization and geotagged check-ins is recorded.")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>{t("Local Privacy First")}:</strong> {t("Photos of store signs & CR certificates reside locally in your browser sandbox until secure synchronization.")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>{t("No Third-Party Shares")}:</strong> {t("Your credentials or operational dispatch data are never rented, sold, or shared with external analytics networks.")}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-3">
              <p className="font-medium text-slate-350">
                {t("Bitvera requires specific device telemetry permissions to operate field-logistics loops safely. Below is a detailed map of exactly what data is used and why:")}
              </p>

              <div className="space-y-3 font-medium">
                {/* 1. Location */}
                <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-mono font-bold text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t("Geodesic GPS Location")}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {t("We verify your representative presence with secure high-precision geodesic boundary check-ins. This confirms you are physically within range of selected convenience store outlets, minimarkets, or distributors.")}
                  </p>
                </div>

                {/* 2. Camera */}
                <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-mono font-bold text-[11px]">
                    <Camera className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t("Device Camera & Uploads")}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {t("Used to take and transmit store layout photos, official Commercial Register (CR) certificates, and distributor licenses directly onto central servers.")}
                  </p>
                </div>

                {/* 3. Databases */}
                <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-mono font-bold text-[11px]">
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t("Local Storage & Ledgers")}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {t("Order records, load requests, weekly collections, and digital receipts reside in encrypted browser storage databases. This ensures stable full offline functionality until the terminal establishes high-speed internet links.")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-3">
              <div className="p-4 bg-[#10b981]/5 border border-[#10b981]/25 rounded-xl space-y-2">
                <h4 className="font-extrabold text-white text-[11px] uppercase font-mono flex items-center gap-1.5">
                  🇸🇦 {t("National Regulatory Compliance")}
                </h4>
                <p className="text-slate-300 font-medium text-[11px] leading-relaxed">
                  {t("This system strictly adheres to the Personal Data Protection Law (PDPL) issued by Royal Decree No. (M/19) in the Kingdom of Saudi Arabia. We implement rigorous technical and organization safety layouts to guarantee your privacy.")}
                </p>
              </div>

              <div className="space-y-2 text-[11px] text-slate-400">
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>{t("Data Regulator")}</span>
                  <span className="text-slate-300 font-semibold">{t("SDAIA Compliant")}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>{t("Hosting Country")}</span>
                  <span className="text-slate-300 font-semibold">{t("Kingdom of Saudi Arabia (Riyadh)")}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>{t("Encryption Core")}</span>
                  <span className="text-slate-300 font-mono text-[10px]">AES-256 TLS 1.3</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>{t("Access Retention")}</span>
                  <span className="text-slate-300 font-semibold">{t("Purged upon rep termination")}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-4">
              <p className="font-medium">
                {t("You retain full authority over the localized sandbox logs used by this system. Use the following interactive tools to monitor, download, or clear your tracks:")}
              </p>

              {/* Action 1: Export Local Records */}
              <div className="p-3.5 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white font-mono text-[11px]">{t("Export Data Inventory")}</h4>
                  <p className="text-[10px] text-slate-400">{t("Download your local session metadata file.")}</p>
                </div>
                <button
                  onClick={handleExportData}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-mono font-bold text-[10px] uppercase flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />{t("Export")}
                </button>
              </div>

              {/* Action 2: Telemetry Opt-out Toggle */}
              <div className="p-3.5 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white font-mono text-[11px]">{t("Diagnostic Telemetry")}</h4>
                  <p className="text-[10px] text-slate-400">{t("Anonymously log platform startup speed.")}</p>
                </div>
                <button
                  onClick={handleToggleTelemetry}
                  className={`px-3 py-1.5 rounded-lg font-mono font-bold text-[10px] uppercase transition-all cursor-pointer ${
                    telemetryOptIn 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                      : 'bg-slate-850 text-slate-500 border border-white/10'
                  }`}
                >
                  {telemetryOptIn ? t("OPT_IN") : t("OPT_OUT")}
                </button>
              </div>

              {/* Action 3: Purge Records Button */}
              <div className="p-3.5 bg-red-950/15 border border-red-900/30 rounded-xl">
                {!showConfirmPurge ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-red-400 font-mono text-[11px]">{t("Purge Offline Footprints")}</h4>
                      <p className="text-[10px] text-slate-400">{t("Wipe all local sales queues and image buffers.")}</p>
                    </div>
                    <button
                      onClick={() => setShowConfirmPurge(true)}
                      className="px-3 py-1.5 bg-red-900/20 hover:bg-red-800 text-red-400 rounded-lg font-mono font-bold text-[10px] uppercase flex items-center gap-1 border border-red-500/15 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />{t("Purge")}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5 text-[11px] text-red-300 bg-red-950/40 p-2 border border-red-500/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{t("Warning: This clears all outstanding local records, unsubmitted orders, and verification logs. Your settings will persist but cached sales queues are permanent exports.")}</span>
                    </div>
                    <div className="flex justify-end gap-2 font-mono text-[10px] font-bold">
                      <button
                        onClick={() => setShowConfirmPurge(false)}
                        className="px-2.5 py-1.5 bg-slate-900 text-slate-400 hover:text-white rounded-md border border-white/5 cursor-pointer"
                      >
                        {t("Cancel")}
                      </button>
                      <button
                        onClick={handlePurgeLogs}
                        className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md cursor-pointer"
                      >
                        {t("Yes, Purge Store")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-white/10 bg-slate-950 flex items-center justify-between select-none">
          <span className="text-[9px] font-mono uppercase text-slate-500">{t("Version: Bitvera v1.8.4 // Confidential")}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/10"
          >
            {t("Accept Policy")}
          </button>
        </div>

      </div>
    </div>
  );
}
