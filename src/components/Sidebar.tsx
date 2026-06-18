import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, Home, User, RefreshCw, Settings, Info, LogOut, LayoutDashboard, Truck } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: any) => void;
  onLogout: () => void;
  isDark: boolean;
}

export default function Sidebar({ isOpen, onClose, onNavigate, onLogout, isDark }: SidebarProps) {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  if (!isOpen) return null;

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
        <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1e40af] to-[#06b6d4] flex items-center justify-center text-white font-bold text-lg shadow-lg">
              B
            </div>
            <div>
              <h2 className={`font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Bitvera Sales</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Operator Mode</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label={t("Dashboard")} 
            onClick={() => { onNavigate('dashboard'); onClose(); }} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<Truck className="w-5 h-5" />} 
            label={t("Today's Route")} 
            onClick={() => { onNavigate('today_route'); onClose(); }} 
            isDark={isDark}
          />
          
          <div className={`my-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`} />
          
          <SidebarItem 
            icon={<User className="w-5 h-5" />} 
            label={t("Profile & Account")} 
            onClick={() => { /* Placeholder */ onClose(); }} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<RefreshCw className="w-5 h-5" />} 
            label={t("Sync Data")} 
            onClick={() => { /* Placeholder */ onClose(); }} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<Settings className="w-5 h-5" />} 
            label={t("Settings")} 
            onClick={() => { onNavigate('settings'); onClose(); }} 
            isDark={isDark}
          />
          <SidebarItem 
            icon={<Info className="w-5 h-5" />} 
            label={t("About Bitvera")} 
            onClick={() => { /* Placeholder */ onClose(); }} 
            isDark={isDark}
          />
        </div>

        <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {t("Log Out")}
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
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
        isDark 
          ? 'hover:bg-white/5 text-slate-300 hover:text-white' 
          : 'hover:bg-slate-50 text-slate-700 hover:text-indigo-600'
      }`}
    >
      <div className={`p-1.5 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100 text-slate-500'}`}>
        {icon}
      </div>
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}
