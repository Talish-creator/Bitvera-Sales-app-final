import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';
import { Search, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Product } from '../types';

interface InventoryScreenProps {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => void;
}

export default function InventoryScreen({ products, onUpdateStock }: InventoryScreenProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'critical' | 'normal'>('all');
  const [syncing, setSyncing] = useState(false);

  // Sync animation
  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 900);
  };

  // Searching & filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'all') return true;
    if (filterMode === 'low') return p.status === 'LOW STOCK';
    if (filterMode === 'critical') return p.status === 'CRITICAL' || p.stock === 0;
    if (filterMode === 'normal') return p.status === 'IN STOCK';
    return true;
  });

  // Calculate stats
  const totalQuantity = products.reduce((acc, cur) => acc + cur.stock, 0);
  const lowStockCount = products.filter((p) => p.status === 'LOW STOCK' || p.status === 'CRITICAL' || p.stock === 0).length;

  return (
    <div className="space-y-6 pb-24 text-left font-sans relative z-10 transition-all duration-300">
      
      {/* Header and Sync indicator */}
      <div className="flex justify-between items-start bg-slate-900/40 border border-white/10 rounded-2xl p-4 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{t("Van Inventory Stock")}</h1>
          <p className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5 mt-1.5 uppercase tracking-wider">
            <span className={`w-2 h-2 rounded-full bg-emerald-500 ${syncing ? 'animate-ping' : ''}`}></span>
            {syncing ? 'UPDATING DB LINK...' : 'Synced with Bitvera Cloud ERP'}
          </p>
        </div>
        <button
          onClick={handleSync}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 hover:text-emerald-400 border border-white/15 text-slate-300 rounded-xl transition-all cursor-pointer shadow-md"
          title="Manual sync with Central Warehouse ERP"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Cyber Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-450/70">
          <Search className="w-4 h-4 text-emerald-400" />
        </div>
        <input
          type="text"
          placeholder={t("Query Product Name or SKU code...")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-xs bg-slate-950/70 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-white placeholder:text-slate-600 shadow-inner"
        />
      </div>

      {/* Stats Summary Tiles */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setFilterMode('all');
            setQuery('');
          }}
          className={`p-4 bg-slate-950/40 border rounded-2xl text-left transition-all duration-300 cursor-pointer ${
            filterMode === 'all' 
              ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)] bg-slate-900/40' 
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 block">{t("Total Loadout")}</span>
          <span className="text-2xl font-extrabold text-[#10b981] font-mono leading-none mt-2 block">
            {totalQuantity.toLocaleString()}
          </span>
        </button>

        <button
          onClick={() => setFilterMode('low')}
          className={`p-4 bg-slate-950/40 border rounded-2xl text-left transition-all duration-300 cursor-pointer ${
            filterMode === 'low' 
              ? 'border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.25)] bg-slate-900/40' 
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 block">{t("Low Limit Items")}</span>
          <span className="text-2xl font-extrabold text-rose-500 font-mono leading-none mt-2 block flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block animate-pulse"></span>
            {lowStockCount}
          </span>
        </button>
      </div>

      {/* Quick Category Tab Filters */}
      <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
        {(['all', 'normal', 'low', 'critical'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilterMode(mode)}
            className={`px-3.5 py-1.5 border text-[9px] font-mono font-bold uppercase tracking-widest rounded-lg cursor-pointer transition-all shrink-0 ${
              filterMode === mode
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                : 'text-slate-400 border-white/10 bg-slate-950/20 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            {mode === 'all' ? 'All Units' : mode === 'normal' ? 'Good Stock' : mode === 'low' ? 'Low Stock' : 'Critical Depleted'}
          </button>
        ))}
      </div>

      {/* Immersive Roster of Items */}
      <div className="space-y-3">
        {filteredProducts.map((p) => {
          const isCritical = p.status === 'CRITICAL' || p.stock === 0;
          const isLow = p.status === 'LOW STOCK';

          return (
            <div
              key={p.id}
              className={`bg-slate-950/30 border rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:bg-slate-900/40 transition-all duration-300 ${
                isCritical
                  ? 'border-l-4 border-l-rose-500 border-white/15'
                  : isLow
                  ? 'border-l-4 border-l-amber-500 border-white/15'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Simulated product thumbnail box */}
                <div className="w-12 h-12 bg-slate-900/80 border border-white/10 rounded-xl flex items-center justify-center font-bold text-slate-400 shrink-0 select-none shadow-inner">
                  <Layers className="w-5 h-5 text-indigo-400" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white tracking-tight">{p.name}</h3>
                  <p className="text-[10px] font-mono text-slate-500 font-semibold uppercase tracking-wider">SKU: {p.sku}</p>
                </div>
              </div>

              {/* Roster stock indicators */}
              <div className="text-right space-y-1.5">
                <span className="text-base font-bold text-white font-mono leading-none block">
                  {p.stock}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest uppercase border ${
                    p.status === 'IN STOCK'
                      ? 'bg-emerald-500/10 text-emerald-405 border-emerald-500/20 text-emerald-400'
                      : p.status === 'LOW STOCK'
                      ? 'bg-amber-500/10 text-amber-405 border-amber-500/25 text-amber-400'
                      : 'bg-rose-500/10 text-rose-405 border-rose-500/20 text-rose-400'
                  }`}
                >
                  {p.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
