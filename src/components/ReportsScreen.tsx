import { useLanguage } from '../context/LanguageContext';
import { useState, useMemo } from 'react';
import { Calendar, Filter, FileText, ShoppingCart, Archive, Wallet, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { ViewState } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { getOrders, getProducts } from '../services/storage';

interface ReportsScreenProps {
  onNavigate: (view: ViewState) => void;
}

export default function ReportsScreen({ onNavigate }: ReportsScreenProps) {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week'>('all');
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'Cash' | 'Bank Transfer'>('all');

  const allOrders = useMemo(() => getOrders(), []);
  const allProducts = useMemo(() => getProducts(), []);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return allOrders.filter(order => {
      // Date filter
      if (dateRange === 'today') {
        const orderDate = (order.date || '').split('T')[0];
        if (orderDate !== todayStr && !order.date?.includes(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }))) {
          // Check if created today
          return false;
        }
      } else if (dateRange === 'week') {
        const orderTime = new Date(order.date || Date.now()).getTime();
        const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
        if (!isNaN(orderTime) && orderTime < oneWeekAgo) {
          return false;
        }
      }

      // Ledger filter
      if (ledgerFilter !== 'all') {
        if (order.paymentMethod && order.paymentMethod !== ledgerFilter) {
          return false;
        }
      }

      return true;
    });
  }, [allOrders, dateRange, ledgerFilter]);

  // Aggregate metrics
  const totalCollections = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const paidInvoicesCount = filteredOrders.length;
  const totalStockUnits = allProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalOpeningUnits = allProducts.reduce((sum, p) => sum + (p.stock || 0), 0) + filteredOrders.reduce((s, o) => s + (o.items?.reduce((is, i) => is + i.qty, 0) || 0), 0);

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
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-indigo-400" /> {t("Time Range")}
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="w-full py-2 px-2.5 bg-slate-950/80 border border-white/10 hover:border-indigo-500/40 rounded-xl text-xs font-mono font-bold text-slate-200 cursor-pointer focus:outline-none focus:border-indigo-500 transition-all"
          >
            <option value="all">{t("All Records")}</option>
            <option value="today">{t("Today Only")}</option>
            <option value="week">{t("Past 7 Days")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-indigo-400" /> {t("Ledger Type")}
          </label>
          <select
            value={ledgerFilter}
            onChange={(e) => setLedgerFilter(e.target.value as any)}
            className="w-full py-2 px-2.5 bg-slate-950/80 border border-white/10 hover:border-indigo-500/40 rounded-xl text-xs font-mono font-bold text-slate-200 cursor-pointer focus:outline-none focus:border-indigo-500 transition-all"
          >
            <option value="all">{t("All Payments")}</option>
            <option value="Cash">{t("Cash Only")}</option>
            <option value="Bank Transfer">{t("Bank Transfer")}</option>
          </select>
        </div>
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
              <span className="font-extrabold text-emerald-400 font-mono">{paidInvoicesCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-450 font-normal">{t("Returns Processed:")}</span>
              <span className="font-extrabold text-slate-400 font-mono">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-450 font-normal">{t("Credit Notes Issued:")}</span>
              <span className="font-extrabold text-slate-400 font-mono">0</span>
            </div>
          </div>
          
          <button
            onClick={() => onNavigate('invoice_viewer')}
            className="w-full text-center py-2.5 bg-indigo-550/10 hover:bg-indigo-550/15 border border-indigo-500/20 text-[10px] font-mono font-bold text-indigo-300 rounded-xl cursor-pointer transition-colors uppercase tracking-wider"
          >
            {filteredOrders.length > 0 ? `${t("Review Latest Invoice")} (${filteredOrders[0].id})` : t("Review Tax Invoice Viewer")}
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
              onClick={() => onNavigate('dashboard')}
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
              <span className="font-extrabold text-white font-mono">{paidInvoicesCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-455 font-sans font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-650 rounded-full inline-block"></span>{t("Drafted Hold queues:")}</span>
              <span className="font-extrabold text-slate-400 font-mono">0</span>
            </div>
            
            {/* Visual Progress bar */}
            <div className="w-full bg-slate-900 border border-white/10 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-gradient-to-r from-emerald-500 to-indigo-600 h-full rounded-full" style={{ width: paidInvoicesCount > 0 ? '100%' : '15%' }}></div>
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

          {/* Mini Cards Side-by-Side */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3.5 bg-slate-900/60 border border-white/10 rounded-xl text-left shadow-sm">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#10b981] block mb-1">{t("IN VAN STOCK")}</span>
              <span className="text-sm font-extrabold text-white font-mono">{totalStockUnits} units</span>
            </div>
            <div className="p-3.5 bg-slate-900/60 border border-white/10 rounded-xl text-left shadow-sm">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-400 block mb-1">{t("STARTING STOCK")}</span>
              <span className="text-sm font-extrabold text-white font-mono">{totalOpeningUnits} units</span>
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
              onClick={() => onNavigate('daily_closing')}
              className="p-1.5 bg-slate-900 border border-white/10 text-rose-450 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4.5 h-4.5" />
            </button>
          </div>

          <p className="text-xs text-slate-455 leading-relaxed font-sans">{t("Track collected invoices, liquid handovers, and outstanding receivables globally.")}</p>

          <div className="space-y-3 font-mono text-xs">
            {/* Highlight blocks */}
            <div className="p-3.5 bg-slate-900/60 border-l-4 border-l-emerald-500 border-white/10 rounded-r-xl flex justify-between items-center">
              <div className="text-left font-sans text-xs">
                <h4 className="font-bold text-white">{t("Collected Revenue")}</h4>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">{t("Aggregate Collected")}</p>
              </div>
              <span className="text-sm font-black text-emerald-400 font-mono">{format(totalCollections)}</span>
            </div>

            <div className="p-3.5 bg-slate-900/60 border-l-4 border-l-slate-700 border-white/10 rounded-r-xl flex justify-between items-center">
              <div className="text-left font-sans text-xs">
                <h4 className="font-bold text-white">{t("Outstanding")}</h4>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">{t("Total Receivables")}</p>
              </div>
              <span className="text-sm font-black text-slate-400 font-mono">{format(0)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
