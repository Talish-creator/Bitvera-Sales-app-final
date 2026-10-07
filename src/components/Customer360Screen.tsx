import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Users, Phone, Mail, MapPin, Building2, CreditCard, 
  TrendingUp, Calendar, Clock, ShoppingCart, CheckCircle2, AlertTriangle, 
  FileText, ShieldCheck, Plus, DollarSign, ChevronRight, Search, RefreshCw 
} from 'lucide-react';
import { ViewState, Customer } from '../types';
import { getCustomers } from '../services/storage';
import { getCustomer360Data } from '../services/customer360';
import { syncSingleRecord } from '../services/erpnextIntegration';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

interface Customer360ScreenProps {
  onNavigate: (view: ViewState) => void;
  onSelectCustomerForOrder?: (id: string, name: string) => void;
  initialCustomerId?: string;
}

export default function Customer360Screen({
  onNavigate,
  onSelectCustomerForOrder,
  initialCustomerId
}: Customer360ScreenProps) {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const customers = useMemo(() => getCustomers(), []);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(() => {
    if (initialCustomerId) return initialCustomerId;
    return customers[0]?.id || 'TC-1100';
  });

  const [searchFilter, setSearchFilter] = useState('');
  const [syncingCustomer, setSyncingCustomer] = useState(false);
  const [syncNotice, setSyncNotice] = useState('');

  const summary = useMemo(() => {
    return getCustomer360Data(selectedCustomerId);
  }, [selectedCustomerId, syncingCustomer]);

  const handleSyncCustomerToErp = async () => {
    setSyncingCustomer(true);
    setSyncNotice(t("Communicating with ERPNext Gateway..."));
    try {
      const res = await syncSingleRecord('Customer', selectedCustomerId);
      if (res.success) {
        setSyncNotice(`${t("Customer synchronized successfully! ERP ID:")} ${res.erpnext_id}`);
      } else {
        setSyncNotice(`${t("ERPNext Sync Failed:")} ${res.error}`);
      }
    } catch (err: any) {
      setSyncNotice(`Error: ${err.message}`);
    } finally {
      setSyncingCustomer(false);
      setTimeout(() => setSyncNotice(''), 4500);
    }
  };

  if (!summary) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>{t("Customer not found.")}</p>
        <button onClick={() => onNavigate('dashboard')} className="mt-4 text-emerald-400 font-bold">
          {t("Return to Dashboard")}
        </button>
      </div>
    );
  }

  const { customer, lifetimeValue, averageOrderValue, totalOrdersCount, outstandingBalance, creditLimit, creditUtilizationPercent, healthScore, preferredProducts, timeline } = summary;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Healthy': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Needs Attention': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'At Risk': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      default: return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    }
  };

  return (
    <div className="space-y-6 pb-24 text-left font-sans relative z-10 transition-all duration-300">
      
      {/* Top Header & Customer Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-slate-350 hover:text-white rounded-xl transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              {t("Customer 360 Workspace")}
            </h1>
            <p className="text-xs text-slate-400">{t("Unified Commercial Profile & Interaction History")}</p>
          </div>
        </div>

        {/* Customer Quick Selector Dropdown */}
        <div className="relative">
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full sm:w-64 bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-medium focus:border-indigo-500 cursor-pointer appearance-none"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Hero Profile Card */}
      <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">{customer.name}</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {customer.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
              <span>ID: <strong className="text-white">{customer.id}</strong></span>
              <span>CR: <strong className="text-white">{customer.idNumber}</strong></span>
              <span>Territory: <strong className="text-indigo-400">{customer.territory || 'Riyadh North'}</strong></span>
              <span>Rep: <strong className="text-emerald-400">{customer.assignedRep || 'Ahmed Al-Harbi'}</strong></span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (onSelectCustomerForOrder) onSelectCustomerForOrder(customer.id, customer.name);
                onNavigate('create_order');
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold font-mono uppercase tracking-wide rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              {t("Create Order")}
            </button>
            <button
              onClick={() => onNavigate('receivables')}
              className="px-3 py-2 bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs font-bold font-mono uppercase rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              {t("Collect Payment")}
            </button>
            <button
              onClick={handleSyncCustomerToErp}
              disabled={syncingCustomer}
              className="px-3 py-2 bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs font-bold font-mono uppercase rounded-xl flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-400 ${syncingCustomer ? 'animate-spin' : ''}`} />
              {(customer as any).erpnext_id ? t("Re-Sync ERP") : t("Sync to ERPNext")}
            </button>
          </div>
        </div>

        {syncNotice && (
          <div className="mt-3 p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs font-mono font-bold text-indigo-300 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* ERP Integration Metadata Pill */}
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{t("ERPNext Sync:")}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              (customer as any).erpnext_id
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border border-white/10'
            }`}>
              {(customer as any).erpnext_id ? `SYNCED • ${(customer as any).erpnext_id}` : 'NOT SYNCED'}
            </span>
          </div>
          {(customer as any).last_synced_at && (
            <span className="text-slate-500 text-[10px]">
              {t("Last Synced:")} {new Date((customer as any).last_synced_at).toLocaleString()}
            </span>
          )}
        </div>

        {/* Contact Badges Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-white/5 text-xs text-slate-300">
          <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-mono">{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
            <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate">{customer.email || 'purchasing@almadina.sa'}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Building {customer.buildingNumber || '101'}, Riyadh</span>
          </div>
        </div>
      </div>

      {/* KPI Tiles & Health Score Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Health Score Explainer Card */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 space-y-3 shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              {t("Customer Health Score")}
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getTierColor(healthScore.tier)}`}>
              {healthScore.tier}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-18 h-18 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="36" cy="36" r="28" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
                <circle
                  cx="36"
                  cy="36"
                  r="28"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - healthScore.score / 100)}
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-lg font-mono font-bold text-white">{healthScore.score}</span>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-slate-300 font-medium leading-tight">{healthScore.explanation}</p>
            </div>
          </div>

          {/* Factor Breakdown */}
          <div className="space-y-1.5 pt-2 border-t border-white/5 font-mono text-[11px]">
            {healthScore.factors.map((f, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-400">
                <span>{f.label}:</span>
                <span className="font-bold text-white">{f.score}/100</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Metrics Card */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 space-y-3 shadow-lg">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            {t("Commercial Lifetime Spend")}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/50 p-2.5 rounded-xl border border-white/5">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">{t("Lifetime Value (LTV)")}</span>
              <span className="text-sm font-mono font-bold text-[#10b981] mt-0.5 block">{format(lifetimeValue)}</span>
            </div>
            <div className="bg-slate-900/50 p-2.5 rounded-xl border border-white/5">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">{t("Average Basket (AOV)")}</span>
              <span className="text-sm font-mono font-bold text-white mt-0.5 block">{format(averageOrderValue)}</span>
            </div>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
            <span className="text-xs text-slate-300">{t("Total Completed Orders")}</span>
            <span className="text-xs font-mono font-bold text-indigo-400">{totalOrdersCount} orders</span>
          </div>
        </div>

        {/* Credit Ceiling & Receivables Card */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 space-y-3 shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              {t("Credit Limit & Aging")}
            </span>
            <span className="text-xs font-mono font-bold text-white">{creditUtilizationPercent}% Used</span>
          </div>

          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                creditUtilizationPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, creditUtilizationPercent)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
            <div>
              <span className="text-[9px] text-slate-400 uppercase block">{t("Outstanding")}</span>
              <span className="font-bold text-amber-400">{format(outstandingBalance)}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-400 uppercase block">{t("Approved Ceiling")}</span>
              <span className="font-bold text-slate-300">{format(creditLimit)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Preferred Products & Interaction Timeline Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Preferred SKUs Column */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 space-y-3 shadow-lg">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white border-b border-white/10 pb-2">
            {t("Frequently Ordered SKUs")}
          </h3>
          <div className="space-y-2">
            {preferredProducts.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">{t("No products ordered yet.")}</p>
            ) : (
              preferredProducts.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-slate-900/40 border border-white/5 text-xs">
                  <span className="text-slate-200 font-medium">{p.name}</span>
                  <span className="font-mono font-bold text-emerald-400">{p.qty} units</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Omnichannel Interactive Timeline (2 columns wide) */}
        <div className="md:col-span-2 bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white border-b border-white/10 pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            {t("Omnichannel Customer Interaction Timeline")}
          </h3>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-white/10">
            {timeline.map((event, idx) => (
              <div key={idx} className="relative flex items-start gap-4 group">
                <div className="relative z-10 w-7 h-7 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center shrink-0">
                  {event.type === 'ORDER' ? <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" /> :
                   event.type === 'PAYMENT' ? <DollarSign className="w-3.5 h-3.5 text-indigo-400" /> :
                   event.type === 'VISIT' ? <MapPin className="w-3.5 h-3.5 text-amber-400" /> :
                   <FileText className="w-3.5 h-3.5 text-slate-400" />}
                </div>

                <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white">{event.title}</h4>
                    <span className="text-[10px] font-mono text-slate-500">
                      {event.date.includes('T') ? event.date.split('T')[0] : event.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
