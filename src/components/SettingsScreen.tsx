import { useLanguage, LanguageType } from '../context/LanguageContext';
import React, { useState } from 'react';
import { ArrowLeft, User, Shield, Key, Sliders, Globe, Star, ShoppingBag, Landmark, Utensils, Tag, LogOut, CheckCircle2, ChevronDown, Sun, Moon, Smartphone, Download, Info, Fingerprint, Lock, Server, RefreshCw } from 'lucide-react';
import { ViewState } from '../types';
import { useCurrency, SUPPORTED_CURRENCIES } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { isBiometricsRegistered, registerBiometrics, removeBiometrics, changePassword } from '../services/auth';
import PrivacyPolicyModal from './PrivacyPolicyModal';

interface SettingsScreenProps {
  onLogout: () => void;
  onNavigate: (view: ViewState) => void;
  onLock?: () => void;
}

export default function SettingsScreen({ onLogout, onNavigate, onLock }: SettingsScreenProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { activeCurrency, setActiveCurrencyCode } = useCurrency();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveNotification, setSaveNotification] = useState('');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Biometrics States & Event
  const [bioEnabled, setBioEnabled] = useState(() => isBiometricsRegistered());
  const [registeringBio, setRegisteringBio] = useState(false);

  const handleToggleBiometrics = async () => {
    if (bioEnabled) {
      removeBiometrics();
      setBioEnabled(false);
      setSaveNotification(t("Biometric Quick Unlock disabled."));
      setTimeout(() => setSaveNotification(''), 3000);
    } else {
      setRegisteringBio(true);
      const res = await registerBiometrics();
      setRegisteringBio(false);
      if (res.success) {
        setBioEnabled(true);
        setSaveNotification(t("Biometrics successfully linked to this device."));
      } else {
        setSaveNotification(res.error || t("Biometric registration unavailable or cancelled."));
      }
      setTimeout(() => setSaveNotification(''), 4000);
    }
  };

  // PWA/App Installer States & Detection
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isInstalled, setIsInstalled] = React.useState(() => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  });
  const [activeInstructionTab, setActiveInstructionTab] = React.useState<'ios' | 'android'>('android');

  React.useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert(t("Please fill in password details."));
      return;
    }
    if (newPassword !== confirmPassword) {
      alert(t("New password and Confirmation password do not match."));
      return;
    }

    const res = await changePassword(oldPassword, newPassword, confirmPassword);
    if (!res.success) {
      alert(res.error || t("Password change failed."));
      return;
    }

    setSaveNotification(t("Password updated successfully. Session updated."));
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setSaveNotification('');
    }, 3000);
  };

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
        <h1 className="text-xl font-bold text-white tracking-tight font-sans">{t("Settings & System Core")}</h1>
      </div>

      {saveNotification && (
        <div className="p-3 bg-emerald-500/10 text-emerald-450 font-mono font-bold text-xs rounded-xl border border-emerald-500/30 animate-pulse">
          {saveNotification}
        </div>
      )}

      {/* Card 1: User Profile Header */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg transition-all backdrop-blur-md">
        {/* Face Image Portrait mock avatar */}
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 relative">
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150&h=150"
            alt="Ramy Ahmed"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/40 to-transparent"></div>
        </div>
        
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white leading-tight font-sans">{t("Ramy Ahmed")}</h2>
          <p className="text-xs font-mono font-bold text-slate-450">{t("ramy.ajial@gmail.com")}</p>
          
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest animate-pulse">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block"></span>{t("ACTIVE FIELD AGENT")}</span>
          </div>
        </div>
      </div>

      {/* Card: ERPNext Integration & Synchronization */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-3 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            {t("ERPNext Integration & Sync Gateway")}
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {t("Enterprise Tier")}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {t("Configure REST API endpoint, server-side secrets, company and warehouse defaults, and controlled synchronization directions.")}
        </p>
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onNavigate('erp_settings')}
            className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            <Sliders className="w-4 h-4" />
            {t("Configure ERPNext Integration")}
          </button>
          <button
            onClick={() => onNavigate('sync_center')}
            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 rounded-xl text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            {t("Sync Center")}
          </button>
        </div>
      </div>

      {/* Card 2: My Warehouses */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#10b981] flex items-center gap-2 border-b border-white/15 pb-2.5">
          <Landmark className="w-4 h-4 text-[#10b981]" />{t("My Warehouses")}</h3>

        <div className="space-y-3 font-medium">
          {/* Active node */}
          <div className="p-3.5 bg-slate-900/60 border border-emerald-500/20 rounded-xl flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className="text-sm">📍</div>
              <div>
                <h4 className="text-xs font-extrabold text-white">{t("Sadus Stock Riyadh")}</h4>
                <p className="text-[9px] font-mono font-bold text-indigo-400 mt-0.5">{t("AMIC - Main Node")}</p>
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
          </div>

          {/* Action button Request node */}
          <button
            onClick={() => alert('Warehouse requests logged for admin supervisor review.')}
            className="w-full p-3 bg-slate-900 border border-dashed border-white/10 rounded-xl hover:bg-slate-800 text-[10px] font-mono font-bold text-slate-400 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none"
          >
            <span>+</span>{t("REQUEST NODE ACCESS")}</button>
        </div>
      </div>

      {/* Card 3: Customer Groups as customized Tag Pills */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#10b981] flex items-center gap-2 border-b border-white/15 pb-2.5">
          <User className="w-4 h-4 text-[#10b981]" />{t("Customer Groups")}</h3>

        <div className="flex flex-wrap gap-2 pt-1 font-bold">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-white/10 text-white rounded-lg text-xs font-medium">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{t("Key Account")}</span>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-white/10 text-white rounded-lg text-xs font-medium">
            <Landmark className="w-3.5 h-3.5 text-indigo-400" />{t("Minimarket KR")}</span>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-white/10 text-white rounded-lg text-xs font-medium">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />{t("Discounted Stores")}</span>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-white/10 text-white rounded-lg text-xs font-medium">
            <Utensils className="w-3.5 h-3.5 text-amber-500" />{t("HORECA")}</span>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-white/10 text-white rounded-lg text-xs font-medium">
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />{t("Retail General")}</span>
        </div>
      </div>

      {/* Card: GDPR & Saudi PDPL Data Privacy Center */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#10b981] flex items-center gap-2 border-b border-white/15 pb-2.5">
          <Shield className="w-4 h-4 text-[#10b981]" />{t("Privacy & Data Security")}</h3>

        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          {t("Your terminal coordinates, photo uploads of business assets, and sales data are secured using AES-256 local database encryption and are fully compliant with Saudi Personal Data Protection Law (PDPL).")}
        </p>

        <button
          type="button"
          onClick={() => setIsPrivacyOpen(true)}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-500 text-white text-xs font-mono font-bold rounded-xl uppercase tracking-widest shadow-md transition-all cursor-pointer border border-white/10 flex items-center justify-center gap-1.5 active:scale-98"
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          {t("Open Policy & Data Controls")}
        </button>
      </div>

      {/* Card: WebAuthn Biometric Security Enclave */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#10b981] flex items-center gap-2 border-b border-white/15 pb-2.5">
          <Fingerprint className="w-4 h-4 text-[#10b981]" />{t("Biometric Access Layer")}</h3>

        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          {t("Configure device fingerprint scanner or facial recognition keys to instantly unlock your sales safe terminal session without entering the master operator password.")}
        </p>

        {/* Biometrics Status indicator */}
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono select-none ${
          bioEnabled 
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
            : 'bg-slate-900 border border-white/5 text-slate-400'
        }`}>
          <div className="flex items-center gap-2 font-mono">
            <span className={`w-2 h-2 rounded-full ${bioEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
            <span className="font-bold text-[10px] tracking-wider uppercase">{t("WebAuthn Status")}</span>
          </div>
          <span className="font-extrabold uppercase text-[10px]">
            {bioEnabled ? t("Registered & Active") : t("Unlinked")}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleToggleBiometrics}
            disabled={registeringBio}
            className={`w-full py-3 text-xs font-mono font-bold rounded-xl uppercase tracking-widest shadow-md transition-all cursor-pointer border flex items-center justify-center gap-1.5 active:scale-98 ${
              bioEnabled
                ? 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/15 text-rose-400'
                : 'bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 border border-white/10 text-white'
            }`}
          >
            {registeringBio ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t("Requesting Device Key...")}
              </>
            ) : bioEnabled ? (
              <>
                <Fingerprint className="w-4 h-4 text-rose-500" />
                {t("Remove Biometric Registration")}
              </>
            ) : (
              <>
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                {t("Register Biometrics (Touch/Face)")}
              </>
            )}
          </button>

          {bioEnabled && onLock && (
            <button
              type="button"
              onClick={onLock}
              className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-mono font-bold rounded-xl uppercase tracking-widest shadow-md transition-all cursor-pointer border border-white/15 flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Lock className="w-4 h-4 text-indigo-300" />
              {t("Lock Safe Terminal Now")}
            </button>
          )}
        </div>
      </div>

      {/* Card 4: PWA App Offline Installation Panel */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#10b981] flex items-center gap-2 border-b border-white/15 pb-2.5">
          <Smartphone className="w-4 h-4 text-[#10b981]" />{t("Install Mobile App")}</h3>

        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          {t("Access Bitvera Sales directly from your phone's home screen for seamless full-screen operation and enhanced offline capabilities.")}
        </p>

        {/* Real-time Web App Status Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono select-none ${
          isInstalled 
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
            : 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400'
        }`}>
          <div className="flex items-center gap-2 font-mono">
            <span className={`w-2 h-2 rounded-full ${isInstalled ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`}></span>
            <span className="font-bold text-[10px] tracking-wider uppercase">{t("Live App Status")}</span>
          </div>
          <span className="font-extrabold uppercase">
            {isInstalled ? t("Running Stable Standalone") : t("Ready to Install")}
          </span>
        </div>

        {/* Render actual install trigger button or steps guide */}
        {isInstalled ? (
          <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5 text-[11px] text-slate-400 text-center leading-relaxed">
            ✓ Bitvera is fully configured and optimized to work offline in this mode.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Guide tabs selection */}
            <div className="grid grid-cols-2 bg-slate-900 p-0.5 rounded-lg border border-white/10 font-bold">
              <button
                type="button"
                onClick={() => setActiveInstructionTab('android')}
                className={`py-1.5 text-[10px] font-mono rounded-md cursor-pointer transition-all ${
                  activeInstructionTab === 'android'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                // ANDROID / CHROME
              </button>
              <button
                type="button"
                onClick={() => setActiveInstructionTab('ios')}
                className={`py-1.5 text-[10px] font-mono rounded-md cursor-pointer transition-all ${
                  activeInstructionTab === 'ios'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                // APPLE IOS (IPHONE)
              </button>
            </div>

            {/* Instruction content block */}
            {activeInstructionTab === 'android' ? (
              <div className="space-y-3">
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 space-y-1 text-xs">
                  <h4 className="font-bold text-white font-mono text-[11px]">{t("How to Install on Android / Chrome")}</h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {deferredPrompt
                      ? t("Tap the button below to install Bitvera Sales directly as a Progressive Web App.")
                      : t("In Google Chrome, tap the menu (⋮) and select \"Install app\" or \"Add to Home screen\". For native Android development, build the release APK via Android Studio in the /android directory.")}
                  </p>
                </div>

                {deferredPrompt && (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all bg-gradient-to-r from-emerald-500 to-indigo-600 text-white border border-white/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:from-emerald-400 hover:to-indigo-500 active:scale-98 select-none"
                  >
                    <Download className="w-4 h-4 animate-bounce" />
                    {t("Install PWA App")}
                  </button>
                )}
              </div>
            ) : (
              /* Apple instructions */
              <div className="space-y-3">
                <div className="bg-slate-900/60 p-4 border border-white/5 rounded-xl space-y-3 text-xs leading-relaxed">
                  <h4 className="font-bold font-mono text-[11px] text-white flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                    {t("How to Install on iOS")}
                  </h4>
                  <ol className="space-y-2 text-[11px] text-slate-300 font-medium list-none p-0 m-0">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 font-mono font-bold">01.</span>
                      <span>{t("1. Tap the Share icon in Safari (square with arrow).")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 font-mono font-bold">02.</span>
                      <span>{t("2. Scroll down and tap \"Add to Home Screen\".")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 font-mono font-bold">03.</span>
                      <span>{t("3. Tap \"Add\" in the top right to complete.")}</span>
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card 5: System Utilities */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-5 shadow-lg backdrop-blur-md">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#10b981] flex items-center gap-2 border-b border-white/15 pb-2.5">
          <Sliders className="w-4 h-4 text-[#10b981]" />{t("System Utilities")}</h3>

        {/* System Language selection dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">{t("System Language")}</label>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value as LanguageType);
                setSaveNotification(t("Language updated."));
                setTimeout(() => setSaveNotification(''), 3000);
              }}
              className="w-full pl-3 pr-10 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs font-mono font-bold text-white appearance-none cursor-pointer focus:border-indigo-500"
            >
              <option value="en">English (US)</option>
              <option value="ar">العربية (KSA)</option>
              <option value="de">Deutsch (DE)</option>
              <option value="es">Español (ES)</option>
              <option value="zh">中文 (ZH)</option>
              <option value="fr">Français (FR)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* System Currency selection dropdown (KSA/GCC match) */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">{t("System Currency")}</label>
          <div className="relative">
            <select
              value={activeCurrency.code}
              onChange={(e) => {
                const newCode = e.target.value;
                setActiveCurrencyCode(newCode);
                const selected = SUPPORTED_CURRENCIES.find(c => c.code === newCode);
                if (selected) {
                  setSaveNotification(`Currency switched to ${selected.name} (${selected.symbol}). System recalculated prices.`);
                  setTimeout(() => setSaveNotification(''), 4000);
                }
              }}
              className="w-full pl-3 pr-10 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs font-mono font-bold text-white appearance-none cursor-pointer focus:border-indigo-500"
            >
              {SUPPORTED_CURRENCIES.map((cur) => (
                <option key={cur.code} value={cur.code}>
                  {cur.country} - {cur.name} ({cur.code} | {cur.symbol})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* System Theme Selection */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">{t("System Theme")}</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setTheme('light');
                setSaveNotification('Theme changed to Light Mode.');
                setTimeout(() => setSaveNotification(''), 3000);
              }}
              className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <Sun className="w-4 h-4" />{t("Light Mode")}</button>
            <button
              type="button"
              onClick={() => {
                setTheme('dark');
                setSaveNotification('Theme changed to Dark Mode.');
                setTimeout(() => setSaveNotification(''), 3000);
              }}
              className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <Moon className="w-4 h-4" />{t("Dark Mode")}</button>
          </div>
        </div>

        {/* Change Password Block Subpart */}
        <div className="border-t border-white/15 pt-4">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">// Reset Credentials</h4>
          
          <form onSubmit={handleUpdatePassword} className="space-y-3 font-semibold">
            <div>
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">{t("Old Password")}</label>
              <input
                type="password"
                placeholder={t("••••••••")}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:border-indigo-500 placeholder-slate-650"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">{t("New Password")}</label>
              <input
                type="password"
                placeholder={t("••••••••")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:border-indigo-500 placeholder-slate-650"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">{t("Confirm New Password")}</label>
              <input
                type="password"
                placeholder={t("••••••••")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:border-indigo-500 placeholder-slate-650"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-500 text-white text-xs font-mono font-bold rounded-xl uppercase tracking-widest shadow-md transition-all cursor-pointer border border-white/10"
            >{t("Update Password")}</button>
          </form>
        </div>
      </div>

      {/* Card 5: Sign Out button */}
      <button
        onClick={onLogout}
        className="w-full p-4 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/15 text-rose-400 hover:text-white text-xs font-mono font-bold uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 select-none active:scale-99"
      >
        <LogOut className="w-4.5 h-4.5" />{t("Terminate session login")}</button>

      {/* Interactive Privacy Policy Center Modal */}
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}
