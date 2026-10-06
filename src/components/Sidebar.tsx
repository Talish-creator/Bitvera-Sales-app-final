import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, Home, User, RefreshCw, Settings, Info, LogOut, 
  LayoutDashboard, Truck, Compass, Users, TrendingUp, 
  CheckSquare, DollarSign, TableProperties, Calendar, 
  CheckCircle2, AreaChart, FileText, Shield, ShieldCheck 
} from 'lucide-react';
import { syncPendingQueue, getQueueStatus } from '../services/offlineQueue';
import { ViewState } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  isDark: boolean;
}

export default function Sidebar({ isOpen, onClose, onNavigate, onLogout, isDark }: SidebarProps) {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  if (!isOpen) return null;

  const navigateTo = (view: ViewState) => {
    onNavigate(view);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div 
        className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50 w-72 ${
          isDark ? 'bg-slate-900 border-r border-white/10' : 'bg-white border-r border-slate-200'
        } shadow-2xl flex flex-col animate-[slideIn_0.3s_ease-out]`}
        style={{
          animationName: isRtl ? 'slideInRight' : 'slideInLeft'
        }}
      >
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1e40af] to-[#06b6d4] flex items-center justify-center text-white font-bold text-lg shadow-lg">
              B
            </div>
            <div>
              <h2 className={`font-bold tracking-tight text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Bitvera Sales</h2>
              <p className={`text-[10px] font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Enterprise Platform v2.0</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5 text-xs">
          
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 px-3 py-1 block">
            {t("Field Sales & Route")}
          </span>
          <SidebarItem 
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label={t("Dashboard")} 
            onClick={() => navigateTo('dashboard')} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<Truck className="w-4 h-4 text-emerald-400" />} 
            label={t("Visit Plan & Route")} 
            onClick={() => navigateTo('today_route')} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<Compass className="w-4 h-4 text-cyan-400" />} 
            label={t("Route Optimizer (TSP)")} 
            onClick={() => navigateTo('route_optimization')} 
            isDark={isDark}
          />

          <div className={`my-2 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`} />

          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 px-3 py-1 block">
            {t("Commercial CRM")}
          </span>
          <SidebarItem 
            icon={<Users className="w-4 h-4 text-indigo-400" />} 
            label={t("Customer 360")} 
            onClick={() => navigateTo('customer_360')} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<TrendingUp className="w-4 h-4 text-purple-400" />} 
            label={t("CRM Sales Pipeline")} 
            onClick={() => navigateTo('crm_pipeline')} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<CheckSquare className="w-4 h-4 text-amber-400" />} 
            label={t("Tasks & Reminders")} 
            onClick={() => navigateTo('tasks')} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<DollarSign className="w-4 h-4 text-emerald-400" />} 
            label={t("Receivables & Aging")} 
            onClick={() => navigateTo('receivables')} 
            isDark={isDark}
          />

          <div className={`my-2 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`} />

          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 px-3 py-1 block">
            {t("Van Operations")}
          </span>
          <SidebarItem 
            icon={<TableProperties className="w-4 h-4" />} 
            label={t("Van Stock")} 
            onClick={() => navigateTo('van_stock')} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<Calendar className="w-4 h-4" />} 
            label={t("Loading Requests")} 
            onClick={() => navigateTo('loading_requests')} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<CheckCircle2 className="w-4 h-4" />} 
            label={t("Daily Reconciliation")} 
            onClick={() => navigateTo('daily_closing')} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<AreaChart className="w-4 h-4 text-emerald-400" />} 
            label={t("Analytics & Reports")} 
            onClick={() => navigateTo('reports')} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<DollarSign className="w-4 h-4 text-amber-400" />} 
            label={t("Field Expenses")} 
            onClick={() => navigateTo('expenses')} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<FileText className="w-4 h-4 text-indigo-400" />} 
            label={t("Document Vault")} 
            onClick={() => navigateTo('document_center')} 
            isDark={isDark}
          />

          <div className={`my-2 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`} />

          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 px-3 py-1 block">
            {t("Governance & System")}
          </span>
          <SidebarItem 
            icon={<RefreshCw className="w-4 h-4 text-cyan-400" />} 
            label={t("Sync Gateway")} 
            onClick={() => navigateTo('sync_center')} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<Shield className="w-4 h-4 text-purple-400" />} 
            label={t("User RBAC Admin")} 
            onClick={() => navigateTo('admin_users')} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />} 
            label={t("Audit Center")} 
            onClick={() => navigateTo('audit_center')} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<Settings className="w-4 h-4" />} 
            label={t("Settings")} 
            onClick={() => navigateTo('settings')} 
            isDark={isDark}
          />
        </div>

        <div className={`p-3 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {t("Log Out Terminal")}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

function SidebarItem({ icon, label, onClick, isDark }: { icon: React.ReactNode, label: string, onClick: () => void, isDark: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
        isDark 
          ? 'hover:bg-white/5 text-slate-300 hover:text-white' 
          : 'hover:bg-slate-50 text-slate-700 hover:text-indigo-600'
      }`}
    >
      <div className={`p-1 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100 text-slate-500'}`}>
        {icon}
      </div>
      <span className="font-medium text-xs truncate">{label}</span>
    </button>
  );
}
