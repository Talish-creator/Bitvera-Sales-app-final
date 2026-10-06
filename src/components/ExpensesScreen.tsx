import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Plus, DollarSign, Fuel, Utensils, Car, Wrench, 
  CheckCircle2, Clock, X, Paperclip, ChevronRight, FileText 
} from 'lucide-react';
import { ViewState, Expense } from '../types';
import { getExpenses, addExpense } from '../services/expenses';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

interface ExpensesScreenProps {
  onNavigate: (view: ViewState) => void;
}

export default function ExpensesScreen({ onNavigate }: ExpensesScreenProps) {
  const { t } = useLanguage();
  const { format, activeCurrency } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>(() => getExpenses());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [category, setCategory] = useState<Expense['category']>('Fuel');
  const [amount, setAmount] = useState('120.00');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const totalExpenses = useMemo(() => {
    return Math.round(expenses.reduce((sum, e) => sum + e.amount, 0) * 100) / 100;
  }, [expenses]);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    addExpense({
      salesperson: 'representative',
      amount: numAmount,
      currency: activeCurrency.code,
      date,
      category,
      notes: notes.trim()
    });

    setExpenses(getExpenses());
    setIsAddModalOpen(false);
    setNotes('');
  };

  const getCategoryIcon = (cat: Expense['category']) => {
    switch (cat) {
      case 'Fuel': return <Fuel className="w-4 h-4 text-amber-400" />;
      case 'Meals': return <Utensils className="w-4 h-4 text-emerald-400" />;
      case 'Travel': return <Car className="w-4 h-4 text-indigo-400" />;
      default: return <Wrench className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-24 text-left font-sans relative z-10 transition-all duration-300">
      
      {/* Header */}
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
              <DollarSign className="w-5 h-5 text-indigo-400" />
              {t("Field Expense Tracker")}
            </h1>
            <p className="text-xs text-slate-400">{t("Log Van Fuel, Per Diem & Route Disbursements")}</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold font-mono uppercase tracking-wide rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t("Log Expense")}
        </button>
      </div>

      {/* Summary HUD Card */}
      <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-5 shadow-xl flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Total Field Disbursements")}</span>
          <span className="text-2xl font-mono font-bold text-white mt-1 block">{format(totalExpenses)}</span>
        </div>
        <div className="text-right font-mono text-xs text-slate-400">
          <span>{expenses.length} records submitted</span>
        </div>
      </div>

      {/* Expenses Ledger */}
      <div className="space-y-3">
        {expenses.map((exp) => (
          <div
            key={exp.id}
            className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 shadow-md flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                {getCategoryIcon(exp.category)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">{exp.category}</h4>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    exp.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {exp.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{exp.notes || 'No description provided'}</p>
                <span className="text-[10px] font-mono text-slate-500 block mt-1">{exp.date} • {exp.salesperson}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-mono font-bold text-white block">
                {format(exp.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                {t("Log New Field Expense")}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Expense Category")}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                >
                  <option value="Fuel">Fuel / Gas Station</option>
                  <option value="Meals">Operator Meals & Per Diem</option>
                  <option value="Travel">Highway Toll / Parking</option>
                  <option value="Maintenance">Van Vehicle Maintenance</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Amount (SAR)")} *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Expense Date")}</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Purpose & Station Notes")}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 50L Diesel refuel at Sasco Exit 8"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  {t("Submit Expense")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
