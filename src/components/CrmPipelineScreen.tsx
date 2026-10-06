import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Plus, Users, TrendingUp, DollarSign, CheckCircle2, 
  ArrowRight, Filter, ChevronRight, X, Phone, Building2, UserPlus, Target
} from 'lucide-react';
import { ViewState, Lead, PipelineStage } from '../types';
import { getLeads, addLead, updateLeadStage, convertLeadToCustomer, getPipelineMetrics } from '../services/crm';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

interface CrmPipelineScreenProps {
  onNavigate: (view: ViewState) => void;
  onSelectCustomer?: (customer: any) => void;
}

const STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'LEAD', label: 'Lead', color: 'border-slate-500 text-slate-400' },
  { key: 'QUALIFIED', label: 'Qualified', color: 'border-indigo-500 text-indigo-400' },
  { key: 'VISIT_SCHEDULED', label: 'Visit Scheduled', color: 'border-cyan-500 text-cyan-400' },
  { key: 'PROPOSAL', label: 'Proposal', color: 'border-amber-500 text-amber-400' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: 'border-purple-500 text-purple-400' },
  { key: 'ORDER', label: 'Order Intent', color: 'border-emerald-500 text-emerald-400' },
  { key: 'WON', label: 'Won / Customer', color: 'border-green-400 text-green-300' }
];

export default function CrmPipelineScreen({ onNavigate, onSelectCustomer }: CrmPipelineScreenProps) {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const [leads, setLeads] = useState<Lead[]>(() => getLeads());
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Form states for adding new Lead
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    source: 'Referral',
    territory: 'Riyadh North',
    assignedRep: 'representative',
    potentialValue: 25000,
    probability: 40,
    stage: 'LEAD' as PipelineStage,
    notes: '',
    nextAction: ''
  });

  const metrics = useMemo(() => getPipelineMetrics(), [leads]);

  const handleStageChange = (leadId: string, newStage: PipelineStage) => {
    updateLeadStage(leadId, newStage);
    setLeads(getLeads());
    setStatusMessage(t("Pipeline stage updated."));
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleConvertLead = (leadId: string) => {
    const res = convertLeadToCustomer(leadId);
    if (res.success && res.customer) {
      setLeads(getLeads());
      if (onSelectCustomer) onSelectCustomer(res.customer);
      setStatusMessage(`${t("Lead successfully converted to Customer")} #${res.customer.id}!`);
      setTimeout(() => setStatusMessage(''), 4000);
    } else {
      alert(res.error || t("Failed to convert lead."));
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.phone) {
      alert(t("Company name and Phone are required."));
      return;
    }

    addLead({
      name: formData.name || formData.company,
      company: formData.company,
      phone: formData.phone,
      email: formData.email,
      source: formData.source,
      territory: formData.territory,
      assignedRep: formData.assignedRep,
      potentialValue: Number(formData.potentialValue) || 10000,
      probability: Number(formData.probability) || 50,
      stage: formData.stage,
      status: 'OPEN',
      notes: formData.notes,
      nextAction: formData.nextAction || 'Schedule introductory meeting'
    });

    setLeads(getLeads());
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
      source: 'Referral',
      territory: 'Riyadh North',
      assignedRep: 'representative',
      potentialValue: 25000,
      probability: 40,
      stage: 'LEAD',
      notes: '',
      nextAction: ''
    });
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
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              {t("CRM Sales Pipeline")}
            </h1>
            <p className="text-xs text-slate-400">{t("Opportunity Stage Tracking & Lead Qualification")}</p>
          </div>
        </div>

        {/* View Switcher & Add Lead Button */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-0.5 flex text-xs font-mono">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer font-bold ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer font-bold ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold font-mono uppercase tracking-wide rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t("New Lead")}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {statusMessage}
        </div>
      )}

      {/* Pipeline Summary KPIs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 border border-white/10 p-3.5 rounded-2xl shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Total Pipeline Value")}</span>
          <span className="text-base font-mono font-bold text-white mt-1 block">{format(metrics.totalPipelineValue)}</span>
        </div>
        <div className="bg-slate-950/60 border border-white/10 p-3.5 rounded-2xl shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Weighted Value")}</span>
          <span className="text-base font-mono font-bold text-[#10b981] mt-1 block">{format(metrics.weightedPipelineValue)}</span>
        </div>
        <div className="bg-slate-950/60 border border-white/10 p-3.5 rounded-2xl shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Active Leads")}</span>
          <span className="text-base font-mono font-bold text-indigo-400 mt-1 block">{metrics.totalLeads}</span>
        </div>
        <div className="bg-slate-950/60 border border-white/10 p-3.5 rounded-2xl shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Win Rate")}</span>
          <span className="text-base font-mono font-bold text-emerald-400 mt-1 block">{metrics.winRatePercent}%</span>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter(l => l.stage === stage.key);
            const stageValue = stageLeads.reduce((sum, l) => sum + l.potentialValue, 0);

            return (
              <div
                key={stage.key}
                className="w-72 shrink-0 bg-slate-950/60 border border-white/10 rounded-2xl p-3 flex flex-col space-y-3 shadow-lg"
              >
                {/* Column Header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-2 px-1">
                  <div>
                    <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${stage.color}`}>
                      {stage.label}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">{format(stageValue)}</span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white/10 text-white px-2 py-0.5 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards in this Stage */}
                <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="p-6 text-center text-[11px] text-slate-600 font-mono italic">
                      {t("No leads in stage")}
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-indigo-500/40 rounded-xl p-3 space-y-2 shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 leading-snug">
                            {lead.company}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-emerald-400">
                            {lead.probability}%
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
                          <p>{lead.name} • {lead.phone}</p>
                          <p className="text-white font-bold">{format(lead.potentialValue)}</p>
                        </div>

                        {lead.nextAction && (
                          <div className="bg-slate-950/60 p-1.5 rounded-lg border border-white/5 text-[10px] text-slate-300">
                            <strong>{t("Next")}:</strong> {lead.nextAction}
                          </div>
                        )}

                        {/* Stage Controls & Actions */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                          {lead.stage !== 'WON' ? (
                            <select
                              value={lead.stage}
                              onChange={(e) => handleStageChange(lead.id, e.target.value as PipelineStage)}
                              className="bg-slate-950 text-[10px] font-mono text-slate-300 rounded px-1.5 py-1 border border-white/10 cursor-pointer"
                            >
                              {STAGES.map(s => (
                                <option key={s.key} value={s.key}>{s.label}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Won
                            </span>
                          )}

                          {lead.status === 'OPEN' && (
                            <button
                              onClick={() => handleConvertLead(lead.id)}
                              className="text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 cursor-pointer"
                              title={t("Convert to Active Customer")}
                            >
                              <UserPlus className="w-3 h-3" /> Convert
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs text-slate-300 divide-y divide-white/10">
            <thead className="bg-slate-900/60 font-mono text-[10px] uppercase text-slate-400">
              <tr>
                <th className="p-3">{t("Company / Lead")}</th>
                <th className="p-3">{t("Stage")}</th>
                <th className="p-3">{t("Value")}</th>
                <th className="p-3">{t("Prob")}</th>
                <th className="p-3">{t("Territory")}</th>
                <th className="p-3 text-right">{t("Action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <strong className="text-white block">{l.company}</strong>
                    <span className="text-[10px] font-mono text-slate-500">{l.name} • {l.phone}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                      {l.stage}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-white">{format(l.potentialValue)}</td>
                  <td className="p-3 font-mono text-emerald-400">{l.probability}%</td>
                  <td className="p-3 font-mono text-[10px] text-slate-400">{l.territory}</td>
                  <td className="p-3 text-right">
                    {l.status === 'OPEN' ? (
                      <button
                        onClick={() => handleConvertLead(l.id)}
                        className="px-2.5 py-1 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg cursor-pointer"
                      >
                        Convert to Customer
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">Converted</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                {t("Create New Commercial Lead")}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Company Name")} *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Contact Person")}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Phone Number")} *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Email")}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Potential Value (SAR)")}</label>
                  <input
                    type="number"
                    value={formData.potentialValue}
                    onChange={(e) => setFormData({ ...formData, potentialValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Probability (%)")}</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Immediate Next Action")}</label>
                <input
                  type="text"
                  value={formData.nextAction}
                  onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                  placeholder="e.g. Schedule visit or deliver sample cartons"
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
                  {t("Save Lead")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
