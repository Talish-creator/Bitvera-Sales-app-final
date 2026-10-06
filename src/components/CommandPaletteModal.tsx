import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Users, Package, ShoppingCart, Calendar, MapPin, ArrowRight, Command } from 'lucide-react';
import { ViewState } from '../types';
import { getCustomers, getProducts, getOrders } from '../services/storage';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewState) => void;
  onSelectCustomer?: (customer: any) => void;
}

export default function CommandPaletteModal({
  isOpen,
  onClose,
  onNavigate,
  onSelectCustomer
}: CommandPaletteModalProps) {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const [query, setQuery] = useState('');

  // Close on Escape, Open on Ctrl+K / Cmd+K handled globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const customers = useMemo(() => getCustomers(), [isOpen]);
  const products = useMemo(() => getProducts(), [isOpen]);
  const orders = useMemo(() => getOrders(), [isOpen]);

  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return {
        navigation: [
          { label: t("Dashboard"), view: 'dashboard' as ViewState, icon: 'dashboard' },
          { label: t("Visit Plan & Route"), view: 'today_route' as ViewState, icon: 'route' },
          { label: t("Route Optimizer"), view: 'route_optimization' as ViewState, icon: 'route' },
          { label: t("Customer 360"), view: 'customer_360' as ViewState, icon: 'customer' },
          { label: t("CRM Pipeline"), view: 'crm_pipeline' as ViewState, icon: 'crm' },
          { label: t("Tasks & Reminders"), view: 'tasks' as ViewState, icon: 'tasks' },
          { label: t("Receivables Aging"), view: 'receivables' as ViewState, icon: 'money' },
          { label: t("Van Stock Inventory"), view: 'van_stock' as ViewState, icon: 'stock' },
          { label: t("Field Expenses"), view: 'expenses' as ViewState, icon: 'money' },
          { label: t("Document Vault"), view: 'document_center' as ViewState, icon: 'doc' },
          { label: t("Sync Center"), view: 'sync_center' as ViewState, icon: 'sync' }
        ],
        customers: customers.slice(0, 3),
        products: products.slice(0, 3),
        orders: orders.slice(0, 3)
      };
    }

    const q = query.toLowerCase();

    return {
      navigation: [
        { label: t("Dashboard"), view: 'dashboard' as ViewState, icon: 'dashboard' },
        { label: t("Route & Visits"), view: 'today_route' as ViewState, icon: 'route' },
        { label: t("Customer 360"), view: 'customer_360' as ViewState, icon: 'customer' },
        { label: t("CRM Pipeline"), view: 'crm_pipeline' as ViewState, icon: 'crm' },
        { label: t("Tasks"), view: 'tasks' as ViewState, icon: 'tasks' },
        { label: t("Receivables"), view: 'receivables' as ViewState, icon: 'money' },
        { label: t("Van Stock"), view: 'van_stock' as ViewState, icon: 'stock' },
        { label: t("Field Expenses"), view: 'expenses' as ViewState, icon: 'money' }
      ].filter(n => n.label.toLowerCase().includes(q)),
      customers: customers.filter(c => 
        c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.phone.includes(q)
      ).slice(0, 5),
      products: products.filter(p => 
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      ).slice(0, 5),
      orders: orders.filter(o => 
        o.id.toLowerCase().includes(q) || (o.customerName && o.customerName.toLowerCase().includes(q))
      ).slice(0, 5)
    };
  }, [query, customers, products, orders, t]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-start justify-center pt-16 px-4 animate-fadeIn">
      <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[80vh] transition-all">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-slate-950/40">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Type a command, customer, product, or order ID...")}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-hidden font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
            <Command className="w-3 h-3" /> ESC
          </span>
        </div>

        {/* Results Scroll Area */}
        <div className="overflow-y-auto p-3 space-y-4 text-left divide-y divide-white/5 font-sans">
          
          {/* Navigation Actions */}
          {filteredResults.navigation.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-3 block">
                {t("Quick Actions & Views")}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {filteredResults.navigation.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onNavigate(item.view);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {filteredResults.customers.length > 0 && (
            <div className="space-y-1 pt-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#10b981] px-3 block">
                {t("Customers")} ({filteredResults.customers.length})
              </span>
              {filteredResults.customers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    if (onSelectCustomer) onSelectCustomer(c);
                    onNavigate('customer_360');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">{c.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">{c.id} • {c.phone}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {c.territory || 'Riyadh'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Products */}
          {filteredResults.products.length > 0 && (
            <div className="space-y-1 pt-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 px-3 block">
                {t("Products & Inventory")} ({filteredResults.products.length})
              </span>
              {filteredResults.products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onNavigate('van_stock');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-300">{p.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">{p.sku} • {format(p.price)}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    p.stock < 10 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {p.stock} units
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Orders */}
          {filteredResults.orders.length > 0 && (
            <div className="space-y-1 pt-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 px-3 block">
                {t("Orders & Invoices")} ({filteredResults.orders.length})
              </span>
              {filteredResults.orders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => {
                    onNavigate('reports');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300">Order #{o.id}</h4>
                      <p className="text-[10px] font-mono text-slate-400">{o.customerName || 'Walk-in'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-white">
                    {format(o.total)}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
