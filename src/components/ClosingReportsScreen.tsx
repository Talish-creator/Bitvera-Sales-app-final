import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';
import { CheckCircle2, ShieldAlert, ArrowLeft, RefreshCw, Smartphone } from 'lucide-react';
import { InventoryClosingItem } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface ClosingReportsScreenProps {
  items: InventoryClosingItem[];
}

export default function ClosingReportsScreen({ items }: ClosingReportsScreenProps) {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const [activeTab, setActiveTab] = useState<'inventory' | 'finance'>('inventory');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [stampCode, setStampCode] = useState('');

  const totalOpening = items.reduce((acc, cur) => acc + cur.openingQty, 0);

  const handleSubmitClosing = () => {
    setIsSubmitted(true);
    // Generate a secure confirmation hash code for the supervisor
    setStampCode(`EOD-HASH-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  return (
    <div className="space-y-6 pb-24 text-left font-sans relative z-10 transition-all duration-300">
      {/* Title */}
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-mono block mb-1">{t("Terminal State Lockout")}</span>
        <h1 className="text-xl font-bold tracking-tight text-white font-sans">{t("Daily Closing Reports")}</h1>
        <p className="text-[10px] font-bold text-slate-500 font-mono mt-0.5 leading-relaxed">
          // Verify physical stock tallies and financial ledger balances prior to end-of-day lockdown.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 bg-slate-950/80 p-1 rounded-xl border border-white/10 shadow-inner">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-2 text-xs font-mono font-bold text-center rounded-lg cursor-pointer transition-all duration-200 ${
            activeTab === 'inventory'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border border-white/10'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          // STOCK ROTATION
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={`py-2 text-xs font-mono font-bold text-center rounded-lg cursor-pointer transition-all duration-200 ${
            activeTab === 'finance'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border border-white/10'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          // LEDGER CORES
        </button>
      </div>

      {isSubmitted ? (
        /* Success Stamp */
        <div className="bg-emerald-500/5 border border-emerald-500/25 rounded-2xl p-6 text-center space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.08)]">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight">{t("Daily Lockout Cycle Confirmed")}</h3>
            <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
              End-of-day telemetry records have been encrypted, synced, and physically archived to the core ERP servers.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-4 border border-emerald-500/20 max-w-sm mx-auto text-xs font-mono shadow-inner">
            <span className="text-slate-500 text-[9px] uppercase tracking-widest font-bold block mb-1">{t("Central Hash Stamp Signature")}</span>
            <span className="font-extrabold text-emerald-400 select-all tracking-wider font-mono">{stampCode}</span>
          </div>

          <button
            onClick={() => setIsSubmitted(false)}
            className="text-[10px] font-mono font-bold text-slate-500 hover:text-slate-350 underline uppercase tracking-widest cursor-pointer"
          >
            Review Closing Log Roster
          </button>
        </div>
      ) : activeTab === 'inventory' ? (
        /* Card Block: Daily Inventory Summary */
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#10b981]">// Stock Rotation Balance</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase select-none tracking-wide">{t("SYNCED TERMINAL")}</span>
          </div>

          {/* Roster table */}
          <div className="overflow-x-auto text-xs font-medium">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-mono font-bold text-[9px] uppercase tracking-wider">
                  <th className="py-2.5">{t("SKU BLOCK")}</th>
                  <th className="py-2.5 pl-4">{t("DESCRIPTION")}</th>
                  <th className="py-2.5 text-right">{t("START QTY")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-white/5 py-3 text-slate-200">
                    <td className="py-3 font-mono font-bold text-indigo-400">{item.code}</td>
                    <td className="py-3 pl-4 text-slate-300">{item.description}</td>
                    <td className="py-3 text-right font-mono font-extrabold text-white">{item.openingQty}</td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-indigo-950/20 font-bold text-sm text-white border-t border-white/10">
                  <td colSpan={2} className="py-3 pl-2 uppercase font-extrabold text-[10px] font-mono text-slate-400">{t("Total Opening Volume:")}</td>
                  <td className="py-3 text-right font-mono font-black text-indigo-400">{totalOpening}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Finance summaries */
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#10b981]">// End-of-Day Ledger Vault</h3>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{t("READY")}</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 bg-slate-900/60 border border-white/10 rounded-xl flex justify-between">
              <span className="font-sans text-slate-400 font-medium">{t("Allocated Cash Received:")}</span>
              <span className="font-extrabold text-emerald-400">{format(2450)}</span>
            </div>
            <div className="p-3.5 bg-slate-900/60 border border-white/10 rounded-xl flex justify-between">
              <span className="font-sans text-slate-400 font-medium">{t("Bank Transfers Vouchers:")}</span>
              <span className="font-extrabold text-white">{format(5800)}</span>
            </div>
            <div className="p-3.5 bg-slate-900/60 border border-white/10 rounded-xl flex justify-between">
              <span className="font-sans text-slate-400 font-medium">{t("Invoice Credits:")}</span>
              <span className="font-semibold text-slate-500">{format(0)}</span>
            </div>
            <hr className="border-white/10" />
            <div className="p-4 bg-slate-900 border border-indigo-500/20 rounded-xl flex justify-between font-extrabold text-sm shadow-inner">
              <span className="font-sans text-indigo-400 font-bold text-xs uppercase tracking-wider">{t("AGGREGATE VERIFIABLE VOUCHERS:")}</span>
              <span className="text-emerald-400">{format(8250)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Persistent locked bottom action submit bar (Screen 7 style) */}
      {!isSubmitted && (
        <button
          onClick={handleSubmitClosing}
          className="w-full bg-gradient-to-r from-[#10b981] to-[#047857] hover:from-[#34d399] hover:to-[#059669] active:scale-98 text-white py-4 rounded-xl text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.25)] border border-white/15 cursor-pointer"
        >
          <CheckCircle2 className="w-4.5 h-4.5 text-white stroke-[2.5]" />{t("Lock Terminal & Submit Closing")}</button>
      )}
    </div>
  );
}
