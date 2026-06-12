import { useLanguage } from '../context/LanguageContext';
import React, { useState } from 'react';
import { Plus, Check, FileText, ArrowLeft, Send } from 'lucide-react';
import { LoadingRequest } from '../types';

interface LoadingRequestsScreenProps {
  requests: LoadingRequest[];
  onAddRequest: (req: LoadingRequest) => void;
}

export default function LoadingRequestsScreen({ requests, onAddRequest }: LoadingRequestsScreenProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'Requested' | 'Approved' | 'Loaded'>('Requested');
  const [showModal, setShowModal] = useState(false);

  // New request inputs
  const [warehouse, setWarehouse] = useState('Sadus Stock Riyadh - AMIC');
  const [itemsCount, setItemsCount] = useState(12);

  const filteredRequests = requests.filter((r) => r.status === activeTab);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newReq: LoadingRequest = {
      id: `PR-2026-00${Math.floor(400 + Math.random() * 100)}`,
      warehouse,
      date: '10 Jun 2026',
      items: itemsCount,
      status: 'Requested'
    };

    onAddRequest(newReq);
    setShowModal(false);
    setActiveTab('Requested'); // return to corresponding tab
  };

  return (
    <div className="space-y-6 pb-24 text-left relative font-sans">
      {/* Title */}
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <span className="text-[9px] uppercase tracking-widest text-[#10b981] font-mono block mb-1">{t("Stock Procurement Logistics")}</span>
        <h1 className="text-xl font-bold tracking-tight text-white font-sans">{t("Loading Requests")}</h1>
        <p className="text-[10px] font-bold text-slate-500 font-mono mt-0.5 leading-relaxed">
          // Dispatch, manage, and track inventory replenishment payloads before system checkout.
        </p>
      </div>

      {/* Action triggers */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-555 hover:to-indigo-555 text-white py-4 rounded-xl text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_20px_rgba(99,102,241,0.25)] border border-white/15 cursor-pointer select-none active:scale-99"
      >
        <Plus className="w-4 h-4 text-indigo-300" />{t("Dispatch procurement load")}</button>

      {/* Segmented Filter bar */}
      <div className="grid grid-cols-3 bg-slate-950/80 p-1 rounded-xl border border-white/10 shadow-inner">
        {(['Requested', 'Approved', 'Loaded'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 text-xs font-mono font-bold text-center rounded-lg cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Requests Lists */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/40 border border-white/10 rounded-2xl">
            <FileText className="w-10 h-10 text-slate-700 mx-auto mb-2" />
            <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">No loads under {activeTab} status index.</p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isLoaded = req.status === 'Loaded';
            const isApproved = req.status === 'Approved';
            
            return (
              <div
                key={req.id}
                className={`border-l-4 rounded-2xl p-4 shadow-lg flex items-center justify-between transition-all bg-slate-950/45 ${
                  isLoaded
                    ? 'border-l-emerald-500 border-white/10'
                    : isApproved
                    ? 'border-l-indigo-500 border-white/10'
                    : 'border-l-amber-500 border-white/10'
                }`}
              >
                <div className="flex gap-3.5 items-center">
                  {/* Visual Icon folder/file box */}
                  <div className="w-11 h-11 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0 select-none">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-white font-mono">{req.id}</h4>
                    <p className="text-[11px] font-bold text-slate-400">{req.warehouse}</p>
                    
                    <div className="flex gap-4 text-[10px] font-bold text-slate-500 font-mono mt-1">
                      <span>Date: {req.date}</span>
                      <span className="text-emerald-450">{req.items} Units payload</span>
                    </div>
                  </div>
                </div>

                {/* Tag Status badge */}
                <span className={`inline-flex items-center px-2.5 py-1 rounded text-[9px] font-mono font-bold uppercase tracking-widest shadow-sm shrink-0 ${
                  isLoaded
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : isApproved
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  ● {req.status}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Overlay for New Request Creation */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#070715]/95 border border-white/15 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-left space-y-4 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">// Dispatch Load</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">{t("Target Depot Node")}</label>
                <select
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white cursor-pointer font-mono"
                >
                  <option value="Sadus Stock Riyadh - AMIC">{t("Sadus Stock Riyadh - AMIC")}</option>
                  <option value="North Warehouse - DMM">{t("North Warehouse - DMM")}</option>
                  <option value="Jeddah Central Hub">{t("Jeddah Central Hub")}</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">{t("Procurement Item Payload counts")}</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={itemsCount}
                  onChange={(e) => setItemsCount(parseInt(e.target.value) || 12)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl font-extrabold text-emerald-400 font-mono shadow-inner focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                   className="flex-1 py-3 text-center border border-white/10 text-slate-300 bg-slate-900/40 hover:bg-slate-800 font-mono font-bold rounded-xl text-xs uppercase cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-xl font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-white/10 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />{t("Dispatch")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
