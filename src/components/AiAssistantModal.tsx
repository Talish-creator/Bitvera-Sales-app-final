import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, ShieldCheck, Lightbulb, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ViewState } from '../types';
import { querySalesAssistant, AiResponse } from '../services/aiAssistant';
import { useLanguage } from '../context/LanguageContext';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewState) => void;
}

const SAMPLE_QUERIES = [
  "How much did I sell this month?",
  "Which customers haven't ordered recently?",
  "Which products are low in stock?",
  "Who owes the most?",
  "What should I prioritize today?"
];

export default function AiAssistantModal({ isOpen, onClose, onNavigate }: AiAssistantModalProps) {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [conversation, setConversation] = useState<{ query: string; response: AiResponse }[]>([
    {
      query: "What should I prioritize today?",
      response: querySalesAssistant("What should I prioritize today?")
    }
  ]);

  if (!isOpen) return null;

  const handleSend = (queryText: string) => {
    const text = queryText.trim();
    if (!text) return;

    const res = querySalesAssistant(text);
    setConversation(prev => [
      ...prev,
      { query: text, response: res }
    ]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-2xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[85vh] transition-all">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-emerald-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-md flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">{t("Bitvera AI Sales Assistant")}</h3>
                <span className="text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Grounded Telemetry
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{t("Live accounting and inventory queries verified against local ledger.")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-left font-sans">
          {conversation.map((item, idx) => (
            <div key={idx} className="space-y-3">
              {/* User message chip */}
              <div className="flex justify-end">
                <div className="bg-indigo-600/30 border border-indigo-500/40 text-white text-xs font-medium py-2 px-3.5 rounded-2xl rounded-tr-none max-w-[80%] shadow-md">
                  {item.query}
                </div>
              </div>

              {/* AI Structured Response */}
              <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-4 shadow-xl">
                
                {/* 1. Verified Factual Data Block */}
                <div className="border border-emerald-500/25 bg-emerald-950/15 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t("VERIFIED FACTUAL DATA")}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{item.response.factualData.title}</span>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {item.response.factualData.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                        <span className="text-[9px] font-mono text-slate-400 uppercase block">{m.label}</span>
                        <span className="text-xs font-mono font-bold text-white mt-0.5 block">{m.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Details bullet points */}
                  <div className="space-y-1 text-xs text-slate-300 font-sans">
                    {item.response.factualData.details.map((d, dIdx) => (
                      <p key={dIdx} className="leading-relaxed">{d}</p>
                    ))}
                  </div>
                </div>

                {/* 2. AI Strategic Recommendations */}
                <div className="border border-indigo-500/25 bg-indigo-950/15 rounded-xl p-3.5 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    {t("AI-GENERATED RECOMMENDATION")}
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                    {item.response.recommendations.map((rec, rIdx) => (
                      <li key={rIdx} className="leading-relaxed">{rec}</li>
                    ))}
                  </ul>
                </div>

                {/* Optional Suggested Action Button */}
                {item.response.suggestedAction && (
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => {
                        if (item.response.suggestedAction) {
                          onNavigate(item.response.suggestedAction.view);
                          onClose();
                        }
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wide flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      <span>{item.response.suggestedAction.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>

        {/* Query Suggestion Pills */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
          {SAMPLE_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-white/10 bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(inputText); }}
            placeholder={t("Ask a question about sales, low stock, route, or customers...")}
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
          <button
            onClick={() => handleSend(inputText)}
            disabled={!inputText.trim()}
            className="p-2.5 bg-gradient-to-tr from-indigo-600 to-emerald-600 disabled:opacity-40 text-white rounded-xl cursor-pointer hover:shadow-lg transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
