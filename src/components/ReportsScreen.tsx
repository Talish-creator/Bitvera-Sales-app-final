import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';
import { Calendar, Filter, FileText, ShoppingCart, Archive, Wallet, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { ViewState } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface ReportsScreenProps {
  onNavigate: (view: ViewState) => void;
}

export default function ReportsScreen({ onNavigate }: ReportsScreenProps) {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const [selectedReportCategory, setSelectedReportCategory] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-24 text-left font-sans relative z-10 transition-all duration-300">
      {/* Title */}
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.35)] backdrop-blur-md flex items-center justify-between">
        <div>
          <span className="text-[9px] uppercase tracking-widest text-[#10b981] font-mono block mb-1">{t("Central Analytical Engine")}</span>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">{t("Reports Matrix")}</h1>
          <p className="text-[10px] font-bold text-slate-500 font-mono mt-0.5">// Analytical Core & Systems Overview</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center animate-pulse">
          <span className="text-xs font-mono font-bold text-emerald-400">{t("LIVE")}</span>
        </div>
      </div>

      {/* Action Header Filters */}
      <div className="flex gap-2.5">
        <button
          onClick={() => alert('Filter date range: Today, Yesterday, This Week, or Custom dates')}
          className="flex-1 py-3 px-3 bg-slate-950/60 border border-white/10 hover:border-indigo-500/40 rounded-xl text-[10px] font-mono font-bold text-slate-350 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
        >
          <Calendar className="w-4 h-4 text-indigo-400" />{t("SYSTEM RANGE")}</button>

        <button
          onClick={() => alert('Filter statuses: Approved, Completed, Pending, or Draft')}
          className="flex-1 py-3 px-3 bg-slate-950/60 border border-white/10 hover:border-indigo-500/40 rounded-xl text-[10px] font-mono font-bold text-slate-350 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
        >
          <Filter className="w-4 h-4 text-indigo-400" />{t("LEDGER FILTER")}</button>
      </div>

      {/* Reports Categories Grid / List */}
      <div className="space-y-5">
        
        {/* Category 1: Sales Reports */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">{t("Sales Invoicing")}</h3>
                <span className="text-[9px] font-mono font-bold text-slate-500 mt-0.5 block uppercase tracking-wider">// Sales Transaction Register</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('invoice_viewer')}
              className="p-1.5 bg-slate-900 border border-white/10 text-indigo-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              title="Open Mock Tax Invoice document viewer"
            >
              <ArrowUpRight className="w-4.5 h-4.5" />
            </button>
          </div>

          <p className="text-xs text-slate-450 leading-relaxed font-sans">{t("Comprehensive accounting history, transaction ledger documents, and sales logs in real-time.")}</p>

          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 space-y-2.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-450 font-normal">{t("Paid Invoices Node:")}</span>
              <span className="font-extrabold text-emerald-400 font-mono">245</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-450 font-normal">{t("Returns Processed:")}</span>
              <span className="font-extrabold text-rose-450 font-mono">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-450 font-normal">{t("Credit Notes Issued:")}</span>
              <span className="font-extrabold text-indigo-450 font-mono">08</span>
            </div>
          </div>
          
          <button
            onClick={() => onNavigate('invoice_viewer')}
            className="w-full text-center py-2.5 bg-indigo-550/10 hover:bg-indigo-550/15 border border-indigo-500/20 text-[10px] font-mono font-bold text-indigo-300 rounded-xl cursor-pointer transition-colors uppercase tracking-wider"
          >
            Review Simulation Tax Invoice (SINV-26-04122)
          </button>
        </div>

        {/* Category 2: Order Reports */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">{t("Order Pipeline")}</h3>
                <span className="text-[9px] font-mono font-bold text-slate-500 mt-0.5 block uppercase tracking-wider">// Booking & Order Analysis</span>
              </div>
            </div>
            <button
              onClick={() => alert('Order pipelines reports loaded.')}
              className="p-1.5 bg-slate-900 border border-white/10 text-emerald-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4.5 h-4.5" />
            </button>
          </div>

          <p className="text-xs text-slate-450 leading-relaxed font-sans">{t("Booking volume metrics, average order sizing, and fulfillment pipeline status levels.")}</p>

          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-455 font-sans font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block animate-pulse"></span>{t("Completed Deliveries:")}</span>
              <span className="font-extrabold text-white font-mono">1,024</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-455 font-sans font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-650 rounded-full inline-block"></span>{t("Drafted Hold queues:")}</span>
              <span className="font-extrabold text-slate-400 font-mono">56</span>
            </div>
            
            {/* Visual Progress bar (mirrors Image 8) */}
            <div className="w-full bg-slate-900 border border-white/10 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-gradient-to-r from-emerald-500 to-indigo-600 h-full rounded-full" style={{ width: '95%' }}></div>
            </div>
          </div>
        </div>

        {/* Category 3: Stock Reports */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center">
                <Archive className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">{t("Stock Visibility")}</h3>
                <span className="text-[9px] font-mono font-bold text-slate-500 mt-0.5 block uppercase tracking-wider">// Live Inventory Levels</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('van_stock')}
              className="p-1.5 bg-slate-900 border border-white/10 text-amber-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4.5 h-4.5" />
            </button>
          </div>

          <p className="text-xs text-slate-455 leading-relaxed font-sans">{t("Real-time telemetry of regional warehouse inventories, depot capacities, and active van metrics.")}</p>

          {/* Mini Cards Side-by-Side (mirrors Image 8) */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3.5 bg-slate-900/60 border border-white/10 rounded-xl text-left shadow-sm">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#10b981] block mb-1">{t("IN TRANSIT")}</span>
              <span className="text-sm font-extrabold text-white font-mono">1,450 units</span>
            </div>
            <div className="p-3.5 bg-slate-900/60 border border-white/10 rounded-xl text-left shadow-sm">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-400 block mb-1">{t("MAIN WAREHOUSE")}</span>
              <span className="text-sm font-extrabold text-white font-mono">8,200 units</span>
            </div>
          </div>
        </div>

        {/* Category 4: Collections */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">{t("Cash Pools")}</h3>
                <span className="text-[9px] font-mono font-bold text-slate-500 mt-0.5 block uppercase tracking-wider">// Financial Liquidity</span>
              </div>
            </div>
            <button
              onClick={() => alert('Collections report overview executed.')}
              className="p-1.5 bg-slate-900 border border-white/10 text-rose-450 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4.5 h-4.5" />
            </button>
          </div>

          <p className="text-xs text-slate-455 leading-relaxed font-sans">{t("Track collected invoices, liquid handovers, and outstanding receivables globally.")}</p>

          <div className="space-y-3 font-mono text-xs">
            {/* Highlight blocks (mirrors Image 8) */}
            <div className="p-3.5 bg-slate-900/60 border-l-4 border-l-emerald-500 border-white/10 rounded-r-xl flex justify-between items-center">
              <div className="text-left font-sans text-xs">
                <h4 className="font-bold text-white">{t("Paid Invoices")}</h4>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">{t("Aggregate Collected")}</p>
              </div>
              <span className="text-sm font-black text-emerald-400 font-mono">{format(142500)}</span>
            </div>

            <div className="p-3.5 bg-slate-900/60 border-l-4 border-l-rose-500 border-white/10 rounded-r-xl flex justify-between items-center">
              <div className="text-left font-sans text-xs">
                <h4 className="font-bold text-white">{t("Outstanding")}</h4>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">{t("Total Receivables")}</p>
              </div>
              <span className="text-sm font-black text-rose-400 font-mono">{format(18240)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
