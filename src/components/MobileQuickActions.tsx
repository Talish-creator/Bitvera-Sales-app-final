import React, { useState } from 'react';
import { 
  Zap, Plus, ShoppingCart, UserPlus, DollarSign, 
  Bot, Compass, Search, X, CheckCircle2 
} from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MobileQuickActionsProps {
  onNavigate: (view: ViewState) => void;
  onOpenAiAssistant: () => void;
  onOpenCommandPalette: () => void;
}

export default function MobileQuickActions({
  onNavigate,
  onOpenAiAssistant,
  onOpenCommandPalette
}: MobileQuickActionsProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-40">
      
      {/* Backdrop overlay when speed dial is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Speed Dial Menu Items */}
      {isOpen && (
        <div className="relative z-40 mb-3 flex flex-col items-end gap-2.5 animate-[slideIn_0.2s_ease-out]">
          
          <button
            onClick={() => { setIsOpen(false); onOpenAiAssistant(); }}
            className="flex items-center gap-2.5 bg-slate-900 border border-indigo-500/40 text-indigo-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-mono font-bold shadow-xl cursor-pointer transition-all active:scale-95 group"
          >
            <span>{t("AI Sales Assistant")}</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => { setIsOpen(false); onNavigate('route_optimization'); }}
            className="flex items-center gap-2.5 bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-mono font-bold shadow-xl cursor-pointer transition-all active:scale-95 group"
          >
            <span>{t("Route Optimizer")}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => { setIsOpen(false); onNavigate('receivables'); }}
            className="flex items-center gap-2.5 bg-slate-900 border border-amber-500/40 text-amber-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-mono font-bold shadow-xl cursor-pointer transition-all active:scale-95 group"
          >
            <span>{t("Collect Payment")}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <DollarSign className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => { setIsOpen(false); onNavigate('create_order'); }}
            className="flex items-center gap-2.5 bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-mono font-bold shadow-xl cursor-pointer transition-all active:scale-95 group"
          >
            <span>{t("New Order")}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => { setIsOpen(false); onNavigate('add_customer'); }}
            className="flex items-center gap-2.5 bg-slate-900 border border-indigo-500/40 text-indigo-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-mono font-bold shadow-xl cursor-pointer transition-all active:scale-95 group"
          >
            <span>{t("New Customer")}</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <UserPlus className="w-4 h-4" />
            </div>
          </button>

        </div>
      )}

      {/* Main Floating Speed-Dial Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-40 flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-600 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-full shadow-[0_8px_30px_rgba(99,102,241,0.5)] active:scale-95 transition-all cursor-pointer border border-white/20"
        title={t("Quick Field Actions")}
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.5]" />
        ) : (
          <Zap className="w-6 h-6 stroke-[2.5] animate-pulse" />
        )}
      </button>

    </div>
  );
}
