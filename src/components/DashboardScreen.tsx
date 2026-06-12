import { useLanguage } from '../context/LanguageContext';
import { Truck, Calendar, Map, CheckCircle2, TrendingUp, ChevronRight, Plus } from 'lucide-react';
import { ViewState, Order } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface DashboardScreenProps {
  userName: string;
  onNavigate: (view: ViewState) => void;
  orders: Order[];
}

export default function DashboardScreen({ userName, onNavigate, orders }: DashboardScreenProps) {
  const { t } = useLanguage();
  const { activeCurrency, format } = useCurrency();
  return (
    <div className="space-y-6 pb-24 font-sans relative z-10 transition-all duration-300">
      
      {/* Immersive Welcome Operator HUD Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/40 via-indigo-950/20 to-slate-950/60 border border-white/10 rounded-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
        
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20 rounded-md">
              📡 {t("Operator Online")}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-3">{t("Welcome, ")}{userName}</h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">{t("Terminal synced with Riyadh HQ. Monitoring sales dispatch.")}</p>
          </div>
          
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-500 uppercase block">{t("Active Sector")}</span>
            <span className="text-xs font-semibold text-indigo-300">{t("Riyadh-North v3")}</span>
          </div>
        </div>

        {/* Mini Diagnostic Grid Details bar */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/5 text-center">
          <div>
            <span className="text-[9px] text-slate-500 uppercase block">{t("Van Status")}</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">{t("LOADED")}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase block">{t("Active Jobs")}</span>
            <span className="text-xs font-bold text-white font-mono">{t("3 VISITS")}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase block">{t("ERP Sync")}</span>
            <span className="text-xs font-bold text-indigo-400 font-mono">{t("100% SECURE")}</span>
          </div>
        </div>
      </div>

      {/* Cyber Quick Actions Selector Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('van_stock')}
          className="relative overflow-hidden flex flex-col items-start p-4 bg-slate-900/40 border border-white/10 rounded-xl hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] cursor-pointer text-left transition-all duration-300 group"
        >
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-600/20 group-hover:text-indigo-300 transition-all border border-indigo-500/20">
            <Truck className="w-5 h-5" />
          </div>
          <span className="font-bold text-white mt-3 text-sm">{t("Van Stock")}</span>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5">{t("Inventory dispatch list")}</span>
        </button>

        <button
          onClick={() => onNavigate('loading_requests')}
          className="relative overflow-hidden flex flex-col items-start p-4 bg-slate-900/40 border border-white/10 rounded-xl hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] cursor-pointer text-left transition-all duration-300 group"
        >
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-600/20 group-hover:text-indigo-300 transition-all border border-indigo-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="font-bold text-white mt-3 text-sm">{t("Loading Requests")}</span>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5">{t("Preloaded stock requests")}</span>
        </button>

        <button
          onClick={() => onNavigate('today_route')}
          className="relative overflow-hidden flex flex-col items-start p-4 bg-slate-900/40 border border-white/10 rounded-xl hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] cursor-pointer text-left transition-all duration-300 group"
        >
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-600/20 group-hover:text-indigo-300 transition-all border border-indigo-500/20">
            <Map className="w-5 h-5" />
          </div>
          <span className="font-bold text-white mt-3 text-sm">{t("Visit Plan")}</span>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5">{t("Assigned route GPS maps")}</span>
        </button>

        <button
          onClick={() => onNavigate('daily_closing')}
          className="relative overflow-hidden flex flex-col items-start p-4 bg-slate-900/40 border border-white/10 rounded-xl hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] cursor-pointer text-left transition-all duration-300 group"
        >
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-600/20 group-hover:text-indigo-300 transition-all border border-indigo-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-white mt-3 text-sm">{t("Closing")}</span>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5">{t("Run daily reconciliation")}</span>
        </button>
      </div>

      {/* Futuristic Telemetry Metrics Panel */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-6 shadow-[0_12px_45px_rgba(0,0,0,0.5)]">
        <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />{t("Performance & Stock Telemetry")}</span>
          <span className="text-[10px] font-mono text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded uppercase">{t("Live Diagnostics")}</span>
        </h2>

        {/* Charts Side-by-Side: Donut vs Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Sales by Item */}
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 flex flex-col justify-center">
            <span className="text-xs font-mono uppercase tracking-widest text-[#10b981]/80 mb-3 block">{t("Sales by Item")}</span>
            <div className="flex items-center gap-6">
              
              {/* Futuristic Vector Donut Graphic */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="44" stroke="rgba(255,255,255,0.06)" strokeWidth="12" fill="none" />
                  <circle
                    cx="56"
                    cy="56"
                    r="44"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={2 * Math.PI * 44 * (1 - 0.864)}
                    fill="none"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-mono font-bold text-emerald-400 leading-none">86.4%</span>
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">{t("Disp.")}</span>
                </div>
              </div>

              {/* Legends Details */}
              <div className="space-y-2 font-mono">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm block shadow-[0_0_6px_rgba(16,185,129,0.4)]"></span>
                  <span className="text-slate-300">{t("Lubricants (A)")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm block"></span>
                  <span className="text-slate-500">{t("Other Filters")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales by Day Bar Chart */}
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 block">{t("Weekly Disp.")} ({activeCurrency.code})</span>
            <div className="h-28 flex items-end justify-between px-2 pt-2 border-b border-white/10">
              
              {/* Day Bars (Mon to Fri) - Wed peak highlight */}
              <div className="flex flex-col items-center flex-1 group">
                <div className="relative w-6 h-[35%] bg-indigo-500/20 hover:bg-emerald-500/60 rounded-t transition-all duration-300" title="85K">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white text-[9px] py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">85K</div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-1.5">{t("Mon")}</span>
              </div>
              
              <div className="flex flex-col items-center flex-1 group">
                <div className="relative w-6 h-[55%] bg-indigo-500/25 hover:bg-emerald-500/60 rounded-t transition-all duration-300" title="140K">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white text-[9px] py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">140K</div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-1.5">{t("Tue")}</span>
              </div>
              
              <div className="flex flex-col items-center flex-1 group">
                <div className="relative w-6 h-[90%] bg-gradient-to-t from-emerald-500/50 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 rounded-t-lg transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[9px] font-bold py-0.5 px-1.5 rounded-md whitespace-nowrap shadow-md">226K</div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 mt-1.5">{t("Wed")}</span>
              </div>
              
              <div className="flex flex-col items-center flex-1 group">
                <div className="relative w-6 h-[52%] bg-indigo-500/25 hover:bg-emerald-500/60 rounded-t transition-all duration-300" title="130K">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white text-[9px] py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">130K</div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-1.5">{t("Thu")}</span>
              </div>
              
              <div className="flex flex-col items-center flex-1 group">
                <div className="relative w-6 h-[28%] bg-indigo-500/20 hover:bg-emerald-500/60 rounded-t transition-all duration-300" title="68K">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white text-[9px] py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">68K</div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-1.5">{t("Fri")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Monthly Sales Curve Graph */}
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block">{t("Monthly Sales Trend")}</span>
            <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-semibold">{t("FY 2026")}</span>
          </div>

          <div className="relative h-28 w-full">
            <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
              <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
              
              {/* Gradient glow under curve */}
              <path
                d="M 20,80 C 100,90 150,75 220,105 C 300,105 350,5 420,5 L 420,120 L 20,120 Z"
                fill="url(#indigoGrad)"
                opacity="0.12"
              />
              {/* Main Line */}
              <path
                d="M 20,80 C 100,90 150,75 220,105 C 300,105 350,5 420,5 C 450,5 480,70 500,60"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]"
              />
              <circle cx="420" cy="5" r="5.5" fill="#10b981" stroke="white" strokeWidth="2.5" className="shadow-lg" />

              <defs>
                <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute top-[5px] left-[78%] -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-mono font-bold py-0.5 px-2 rounded-md shadow-lg border border-emerald-300">
              Peak (May)
            </div>
            
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2 px-1">
              <span>{t("Feb")}</span>
              <span>{t("Mar")}</span>
              <span>{t("Apr")}</span>
              <span className="text-emerald-400 font-bold">{t("May")}</span>
              <span>{t("Jun")}</span>
            </div>
          </div>
        </div>

        {/* 4. Stock Balance Capacity Bar */}
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">{t("Van Payload Stock")}</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">65% Capacity</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: '65%' }}></div>
          </div>
        </div>
      </div>

      {/* Recent Orders Matrix List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">{t("Recent Orders Ledger")}</h2>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => onNavigate('reports')}
              className="bg-slate-900/40 hover:bg-slate-900/70 border border-white/10 hover:border-emerald-500/30 rounded-xl p-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.3)] cursor-pointer transition-all duration-300 flex flex-col justify-between gap-3 group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-[#10b981] group-hover:text-emerald-300 text-sm font-mono tracking-wide">{order.id}</h4>
                  <p className="text-xs font-medium text-slate-300 mt-0.5">
                    {order.customerName ? order.customerName : 'Walk-in Customer'} • <span className="font-mono text-[11px] text-slate-500">{order.customerId}</span>
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">{t("TO DELIVER & BILL")}</span>
              </div>
              <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                <span className="text-xs font-mono text-slate-400">{t("Total Transaction")}</span>
                <span className="text-sm font-bold text-white font-mono">{format(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Glowing FAB Dial button */}
      <div className="fixed bottom-24 right-5 z-40">
        <button
          onClick={() => onNavigate('add_customer')}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-600 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-full shadow-[0_8px_30px_rgba(99,102,241,0.5)] active:scale-95 transition-all cursor-pointer group border border-white/20"
          title={t("Add New Customer")}
        >
          <Plus className="w-7 h-7 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
