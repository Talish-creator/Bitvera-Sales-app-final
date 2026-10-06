import React, { useMemo } from 'react';
import { 
  ArrowLeft, DollarSign, AlertCircle, Clock, CheckCircle2, 
  CreditCard, ChevronRight, ShieldAlert, Users, TrendingUp 
} from 'lucide-react';
import { ViewState } from '../types';
import { getReceivablesAnalysis } from '../services/receivables';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

interface ReceivablesScreenProps {
  onNavigate: (view: ViewState) => void;
  onSelectCustomerForOrder?: (id: string, name: string) => void;
}

export default function ReceivablesScreen({
  onNavigate,
  onSelectCustomerForOrder
}: ReceivablesScreenProps) {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const data = useMemo(() => getReceivablesAnalysis(), []);

  return (
    <div className="space-y-6 pb-24 text-left font-sans relative z-10 transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-slate-350 hover:text-white rounded-xl transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            {t("Accounts Receivable & Aging Ledger")}
          </h1>
          <p className="text-xs text-slate-400">{t("Aging Analysis, Credit Utilization & Collection Targets")}</p>
        </div>
      </div>

      {/* Top Level Receivables KPI Banner */}
      <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-5 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Total Outstanding Receivables")}</span>
          <span className="text-xl font-mono font-bold text-amber-400 mt-1 block">
            {format(data.totalOutstandingSAR)}
          </span>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Approved Credit Ceilings")}</span>
          <span className="text-xl font-mono font-bold text-slate-200 mt-1 block">
            {format(data.totalCreditLimitSAR)}
          </span>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Portfolio Utilization")}</span>
          <span className="text-xl font-mono font-bold text-indigo-400 mt-1 block">
            {data.overallUtilizationPercent}%
          </span>
        </div>
      </div>

      {/* Aging Brackets Breakdown */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white border-b border-white/10 pb-2.5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          {t("Accounts Receivable Aging Buckets")}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {data.buckets.map((b, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                b.minDays >= 61
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : b.minDays >= 31
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-900/40 border-white/5'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">{b.label}</span>
                <span className="text-sm font-mono font-bold text-white mt-1 block">
                  {format(b.totalAmount)}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-2 block">
                {b.count} invoices
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Receivables Ledger Table */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl overflow-hidden shadow-lg space-y-1">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            {t("Customer Credit Balances")}
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {data.customerSummaries.length} {t("accounts evaluated")}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 divide-y divide-white/10">
            <thead className="bg-slate-900/60 font-mono text-[10px] uppercase text-slate-400">
              <tr>
                <th className="p-3.5">{t("Customer Account")}</th>
                <th className="p-3.5">{t("Credit Limit")}</th>
                <th className="p-3.5">{t("Outstanding")}</th>
                <th className="p-3.5">{t("Utilization")}</th>
                <th className="p-3.5">{t("Status")}</th>
                <th className="p-3.5 text-right">{t("Action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.customerSummaries.map((c) => (
                <tr key={c.customer.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5">
                    <strong className="text-white block">{c.customer.name}</strong>
                    <span className="text-[10px] font-mono text-slate-500">{c.customer.id} • {c.customer.phone}</span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">{format(c.creditLimit)}</td>
                  <td className="p-3.5 font-mono font-bold text-amber-400">{format(c.outstandingBalance)}</td>
                  <td className="p-3.5 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className={`h-full rounded-full ${c.creditUtilizationPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, c.creditUtilizationPercent)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">{c.creditUtilizationPercent}%</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-[10px]">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      c.status === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      c.status === 'OVERDUE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      c.status === 'ATTENTION' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (onSelectCustomerForOrder) onSelectCustomerForOrder(c.customer.id, c.customer.name);
                        onNavigate('customer_360');
                      }}
                      className="px-2.5 py-1 text-[10px] font-mono font-bold bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 rounded-lg cursor-pointer transition-all"
                    >
                      360 View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
