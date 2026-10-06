import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Fingerprint, AlertCircle, Smile } from 'lucide-react';
import { verifyBiometrics, authenticate, getCurrentSession } from '../services/auth';

interface BiometricLockScreenProps {
  onUnlock: () => void;
  onLogout: () => void;
}

export default function BiometricLockScreen({ onUnlock, onLogout }: BiometricLockScreenProps) {
  const { t } = useLanguage();
  const [scanning, setScanning] = useState(false);
  const [scanType, setScanType] = useState<'fingerprint' | 'face'>('fingerprint');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [fallbackPassword, setFallbackPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  useEffect(() => {
    // Automatically trigger biometric verification on screen mount
    handleBiometricRequest();
  }, []);

  const handleBiometricRequest = async () => {
    setErrorMsg('');
    setScanning(true);

    try {
      const result = await verifyBiometrics();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onUnlock();
        }, 600);
      } else {
        // Biometric failed or rejected: REMAIN LOCKED!
        setErrorMsg(result.error || t("Biometric verification failed. Please authenticate using password."));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || t("Biometric hardware unavailable."));
    } finally {
      setScanning(false);
    }
  };

  const handleVerifyPasswordFallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fallbackPassword) return;

    setIsVerifyingPassword(true);
    setErrorMsg('');

    try {
      const session = getCurrentSession();
      const username = session?.username || 'ramy';
      const role = session?.role || 'Salesman';

      const authResult = await authenticate(username, fallbackPassword, role);
      if (authResult.success) {
        setSuccess(true);
        setTimeout(() => {
          onUnlock();
        }, 400);
      } else {
        setErrorMsg(authResult.error || t("Invalid authentication key."));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || t("Authentication failed."));
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-fadeIn font-sans">
      
      {/* Laser line effect only visible on scanning */}
      {scanning && (
        <div className="absolute top-0 left-0 w-full h-[3px] bg-cyan-400 opacity-50 blur-[1px] animate-laser pointer-events-none"></div>
      )}

      {/* Cyber Grid Background lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.1)_95%,rgba(99,102,241,0.05)_95%)] bg-[size:100%_32px] pointer-events-none"></div>
      
      <div className="w-full max-w-sm bg-slate-950 border border-white/10 rounded-3xl p-6 shadow-[0_30px_100px_rgba(0,0,0,0.95)] backdrop-blur-xl relative overflow-hidden text-center space-y-6">
        
        {/* Top-Right Pill showing secure state */}
        <div className="flex justify-between items-center bg-slate-900 border border-white/5 py-1.5 px-3 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest text-[#10b981] select-none">
          <span className="flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {t("Operator Locked")}
          </span>
          <span className="text-slate-400">BITVERA SAFE CORE</span>
        </div>

        {/* Biometric Scanning Hub Visual representation */}
        <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
          
          {/* Animated concentric rings */}
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/10 animate-[spin_20s_infinite_linear]"></div>
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-emerald-500/15 animate-[spin_10s_infinite_reverse_linear]"></div>
          <div className="absolute inset-6 rounded-full border border-indigo-500/30"></div>
          
          {/* Neon Scanner Portal Aura */}
          <div className={`absolute inset-8 rounded-full border-2 transition-all duration-300 ${
            success 
              ? 'border-emerald-400 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
              : scanning 
                ? 'border-indigo-400 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                : 'border-white/10'
          }`}></div>

          {/* Active Radiating Biometric Ripples */}
          {scanning && (
            <div className="absolute inset-8 rounded-full pointer-events-none">
              <div className="absolute inset-0 rounded-full bg-indigo-500/10 border border-indigo-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] [animation-delay:0.6s]" />
            </div>
          )}

          {/* Scanner graphic core */}
          <button
            onClick={handleBiometricRequest}
            disabled={scanning || success}
            className={`absolute z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              success 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : scanning
                  ? 'bg-indigo-600/30 text-indigo-400 scale-105 shadow-[inner_0_0_15px_rgba(99,102,241,0.5)]'
                  : 'bg-slate-900 hover:bg-slate-850 hover:scale-102 border border-white/10 text-slate-400 hover:text-indigo-400 shadow-inner'
            }`}
          >
            {scanType === 'fingerprint' ? (
              <Fingerprint className={`w-10 h-10 ${scanning ? 'animate-pulse text-indigo-400' : ''}`} />
            ) : (
              <Smile className={`w-10 h-10 ${scanning ? 'animate-pulse text-indigo-400' : ''}`} />
            )}
          </button>
        </div>

        {/* Text descriptions and feedback */}
        <div className="space-y-1.5 select-none relative z-10">
          <h2 className="text-base font-bold text-white tracking-wide">
            {success 
              ? t("Biometric Signature Verified") 
              : scanning 
                ? t("Scanning Biometric Enclave...") 
                : t("Secure Terminal Lockout")}
          </h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[280px] mx-auto">
            {success 
              ? t("Identity cryptographic handshake successfully verified. Opening workspace.")
              : scanning 
                ? t("Authenticating local fingerprint or facial layout on this device safe enclave.")
                : t("Terminal requires fingerprint scan or Face ID to unlock the Bitvera operator cabin.")}
          </p>
        </div>

        {/* Scan Type selector */}
        {!scanning && !success && (
          <div className="flex justify-center gap-4 bg-slate-900/60 p-1.5 rounded-xl border border-white/5 font-mono text-[9px] font-bold text-slate-400 w-fit mx-auto select-none">
            <button
              onClick={() => setScanType('fingerprint')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${scanType === 'fingerprint' ? 'bg-indigo-600 text-white' : ''}`}
            >
              FINGERPRINT
            </button>
            <button
              onClick={() => setScanType('face')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${scanType === 'face' ? 'bg-indigo-600 text-white' : ''}`}
            >
              FACE ID
            </button>
          </div>
        )}

        {/* Error Notification Toast */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2 text-left font-sans text-[11px] text-red-400 leading-relaxed font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dynamic Interactive Input blocks */}
        {showPasswordInput ? (
          <form onSubmit={handleVerifyPasswordFallback} className="space-y-2 text-left">
            <label className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
              {t("Secure Auth Key Override")}
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={fallbackPassword}
                onChange={(e) => setFallbackPassword(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 pl-3 pr-10 text-xs font-mono text-white focus:border-indigo-500"
                required
                disabled={isVerifyingPassword}
              />
              <button
                type="submit"
                disabled={isVerifyingPassword}
                className="absolute right-1 top-1 bottom-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold font-mono uppercase transition-all cursor-pointer"
              >
                {isVerifyingPassword ? '...' : t("Verify")}
              </button>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono pt-1">
              <button
                type="button"
                onClick={() => setShowPasswordInput(false)}
                className="text-slate-400 hover:text-white"
              >
                ← {t("Back to Biometrics")}
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="text-red-400 hover:underline"
              >
                {t("Log Out")}
              </button>
            </div>
          </form>
        ) : (
          !success && (
            <div className="flex justify-between items-center text-xs font-bold font-mono max-w-[280px] mx-auto pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowPasswordInput(true)}
                className="text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider cursor-pointer"
              >
                {t("Use Password")}
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="text-slate-500 hover:text-red-400 transition-colors uppercase tracking-wider cursor-pointer"
              >
                {t("Log Out Operator")}
              </button>
            </div>
          )
        )}

      </div>
    </div>
  );
}
