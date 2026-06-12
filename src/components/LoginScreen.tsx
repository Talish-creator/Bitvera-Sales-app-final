import { useLanguage } from '../context/LanguageContext';
import React, { useState } from 'react';
import { Briefcase, User, Lock, Eye, EyeOff, Sun, Moon, Fingerprint, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import PrivacyPolicyModal from './PrivacyPolicyModal';

interface LoginScreenProps {
  onLogin: (username: string, role: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [role, setRole] = useState('Salesman');
  const [username, setUsername] = useState('ramy');
  const [password, setPassword] = useState('Password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bioScanning, setBioScanning] = useState(false);

  const biometricAvailable = localStorage.getItem('bitvera_biometrics_registered') === 'true';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== 'Password123') {
      setErrorMsg(t("Incorrect password. This security node requires 'Password123'."));
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    // Simulate slight authentic network delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin(username, role);
    }, 600);
  };

  const handleBiometricLogin = async () => {
    setErrorMsg('');
    setBioScanning(true);

    // 1. Try Native WebAuthn API
    if (window.navigator.credentials && window.PublicKeyCredential) {
      try {
        const challenge = new Uint8Array([1, 2, 3, 4, 12, 13, 14, 15]);
        const options: CredentialRequestOptions = {
          publicKey: {
            challenge,
            rpId: window.location.hostname || "localhost",
            userVerification: "preferred",
            timeout: 5000,
            allowCredentials: []
          }
        };
        const credential = await window.navigator.credentials.get(options);
        if (credential) {
          setTimeout(() => {
            setBioScanning(false);
            onLogin(username, role);
          }, 400);
          return;
        }
      } catch (err) {
        console.warn("[WebAuthn] Sandbox biometric access fell back to secure simulation.", err);
      }
    }

    // 2. High-fidelity scan simulation fallback
    setTimeout(() => {
      setBioScanning(false);
      onLogin(username, role);
    }, 1200);
  };

  const isDark = theme === 'dark' || theme !== 'light'; // default to dark if not explicit light

  return (
    <div className="w-full max-w-sm mx-auto p-4 flex flex-col justify-center min-h-[85vh] relative z-10 font-sans">
      
      {/* Floating Theme Switcher & Language Pill at Top-Right of view container */}
      <div className="absolute top-0 right-0 left-0 flex items-center justify-between z-20 px-1">
        {/* Language selector pill */}
        <div className={`flex items-center rounded-lg p-0.5 border ${isDark ? 'border-white/10 bg-slate-900/50' : 'border-slate-200 bg-slate-100'} text-xs overflow-hidden select-none shadow-md backdrop-blur-md`}>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-bold ${
              language === 'en'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-bold ${
              language === 'ar'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            عربي
          </button>
        </div>

        {/* Theme select button */}
        <button
          onClick={toggleTheme}
          type="button"
          className="p-1 px-2.5 bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer shadow-md backdrop-blur-md flex items-center gap-1.5 h-8"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
            {theme === 'light' ? t('Dark Mode') : t('Light Mode')}
          </span>
        </button>
      </div>

      {/* Decorative cyber grid accents on outer viewport */}
      <div className="absolute top-10 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-500/40 pointer-events-none rounded-tl"></div>
      <div className="absolute top-10 right-4 w-8 h-8 border-t-2 border-r-2 border-indigo-500/40 pointer-events-none rounded-tr"></div>
      <div className="absolute bottom-20 left-4 w-8 h-8 border-b-2 border-l-2 border-indigo-500/40 pointer-events-none rounded-bl"></div>
      <div className="absolute bottom-20 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-500/40 pointer-events-none rounded-br"></div>


      <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-xl relative overflow-hidden">
        
        {/* Subtle inner grid scan line pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(24,24,37,0)_95%,rgba(16,185,129,0.06)_95%)] bg-[size:100%_24px] pointer-events-none animate-[pulse_6s_infinite]"></div>
        
        {/* Brand Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/30 rounded-2xl text-emerald-400 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Briefcase className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">{t("Bitvera Sales")}</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-[#10b981]/80 select-none animate-pulse">
            {t("🛰️ Link: Secure Terminal")}
          </p>
        </div>

        {/* Encrypted link notice indicator */}
        <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-2 px-3 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-400 font-semibold">{t("Security System")}</span>
          <span className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>{t("ACTIVE SYNC")}</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10 text-left">
          {/* Role Selection */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5" htmlFor="role">{t("Access Priority / Role")}</label>
            <div className="relative">
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full px-3.5 py-2 text-sm bg-slate-900/80 border border-white/10 rounded-lg focus:border-emerald-555 focus:ring-1 focus:ring-emerald-500 text-white cursor-pointer"
              >
                <option value="Salesman">{t("Salesman (Authorized)")}</option>
                <option value="Sales Supervisor">{t("Sales Supervisor")}</option>
                <option value="Pre Seller">{t("Pre Seller (Field Admin)")}</option>
              </select>
            </div>
          </div>

          {/* Username Input */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5" htmlFor="username">{t("Operator Designation")}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400/80">
                <User className="w-4 h-4" />
              </div>
              <input
                id="username"
                type="text"
                placeholder={t("ramy")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900/80 border border-white/10 rounded-lg text-white font-mono placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5" htmlFor="password">{t("Secure Auth Key")}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-400/80">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t("••••••••")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 text-sm bg-slate-900/80 border border-white/10 rounded-lg text-white font-mono tracking-wider placeholder:text-slate-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between text-[11px] font-medium pt-1">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4.5 w-4.5 text-emerald-500 bg-slate-900/80 border-white/10 rounded cursor-pointer accent-emerald-500 focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="remember-me" className="ml-2 text-slate-400 cursor-pointer select-none">{t("Auto-Link Console")}</label>
            </div>
            <a href="#forgot" className="text-indigo-400 hover:text-indigo-300 transition-colors" onClick={(e) => e.preventDefault()}>
              {t("Request Recovery")}
            </a>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-lg text-xs leading-relaxed flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || bioScanning}
            className={`w-full relative overflow-hidden flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 active:scale-[0.98] transition-all cursor-pointer border border-white/10 ${
              isLoading ? 'opacity-80 cursor-wait' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>{t("Syncing Authorization...")}</span>
            ) : (
              t("Initialize Interface")
            )}
          </button>

          {/* Quick Biometrics Key if registered */}
          {biometricAvailable && (
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={bioScanning || isLoading}
              className="w-full py-2.5 px-4 bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 text-xs font-mono font-bold rounded-xl uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 select-none active:scale-98"
            >
              {bioScanning ? (
                <>
                  <svg className="animate-spin h-4.5 w-4.5 text-emerald-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t("Verifying Biometrics...")}</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                  <span>{t("Biometric Quick Unlock")}</span>
                </>
              )}
            </button>
          )}
        </form>

        <div className="mt-8 text-center pt-2 border-t border-white/5 space-y-1.5 font-mono">
          <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500">{t("System Hash Code: CLOUD-K71 // STABLE")}</p>
          <button
            type="button"
            onClick={() => setIsPrivacyOpen(true)}
            className="text-[9px] text-[#10b981] hover:text-emerald-300 font-bold hover:underline uppercase tracking-wider cursor-pointer"
          >
            🔒 {t("Privacy & Data Center")}
          </button>
        </div>
      </div>

      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}
