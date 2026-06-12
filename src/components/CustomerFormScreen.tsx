import { useLanguage } from '../context/LanguageContext';
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Camera, UserPlus, Check, Sparkles } from 'lucide-react';
import { Customer, ViewState } from '../types';

interface CustomerFormScreenProps {
  onAddCustomer: (customer: Customer) => void;
  onNavigate: (view: ViewState) => void;
}

export default function CustomerFormScreen({ onAddCustomer, onNavigate }: CustomerFormScreenProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('test Customers');
  const [phone, setPhone] = useState('0500000000');
  const [lat, setLat] = useState(24.8150028);
  const [lng, setLng] = useState(46.7938998);
  const [buildingNumber, setBuildingNumber] = useState('2563');

  const [type, setType] = useState('Individual');
  const [group, setGroup] = useState('03-Home Delivery');
  const [subGroup, setSubGroup] = useState('30-House');

  const [idType, setIdType] = useState('Iqama');
  const [idNumber, setIdNumber] = useState('2828605058');

  // Attachment states
  const [idCaptured, setIdCaptured] = useState(false);
  const [siteCaptured, setSiteCaptured] = useState(false);

  const [notification, setNotification] = useState('');

  const handleGetLocation = () => {
    // Simulate real GPS polling delay
    setLat(24.8150028 + (Math.random() - 0.5) * 0.0001);
    setLng(46.7938998 + (Math.random() - 0.5) * 0.0001);
    setNotification('Successfully resolved coordinates from device GPS.');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Please provide customer name and primary phone number.');
      return;
    }

    const newCust: Customer = {
      id: `CUS-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      phone,
      lat,
      lng,
      buildingNumber,
      type,
      group,
      subGroup,
      idType,
      idNumber,
      status: 'ACTIVE ACCOUNT'
    };

    onAddCustomer(newCust);
    setNotification('Successfully registered new customer in ERP system.');
    setTimeout(() => {
      onNavigate('today_route');
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-24 font-sans relative z-10 transition-all duration-300">
      
      {/* Header section */}
      <div className="flex items-center gap-3 bg-slate-900/40 border border-white/10 rounded-2xl p-4 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
        <button
          onClick={() => onNavigate('today_route')}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-white/15 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-indigo-400" />
        </button>
        <div>
          <span className="text-[9px] uppercase tracking-widest text-[#10b981] font-mono block">{t("Operator Task")}</span>
          <h1 className="text-lg font-bold text-white">{t("Register Customer Matrix")}</h1>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-xs p-3.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-5 text-left">
        {/* Card 1: Basic Information */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 border-b border-white/10 pb-2.5">
            {t("Core Identity")}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">{t("Client Corporate Name")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900/70 border border-white/10 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">{t("Secure Primary Phone")}</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900/70 border border-white/10 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Card 2: Location */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">
              {t("Coordinate Locator")}
            </h2>
            <button
              type="button"
              onClick={handleGetLocation}
              className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/35 hover:bg-indigo-600/20 text-indigo-300 rounded-lg text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />{t("Resolve Location")}</button>
          </div>

          <div className="space-y-4">
            {/* Coordinate readout */}
            <div className="bg-slate-900/40 border border-white/10 rounded-xl p-3 flex gap-3 items-center">
              <MapPin className="w-6 h-6 text-emerald-400 shrink-0 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <div className="text-xs text-slate-300 font-mono leading-relaxed">
                <div>{t("Lat:")}<span className="text-emerald-400 font-bold">{lat.toFixed(7)}</span></div>
                <div>{t("Long:")}<span className="text-emerald-400 font-bold">{lng.toFixed(7)}</span></div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">{t("Assigned Building Code")}</label>
              <input
                type="text"
                value={buildingNumber}
                onChange={(e) => setBuildingNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900/70 border border-white/10 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Classification */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 border-b border-white/10 pb-2.5">
            {t("Categorization")}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">{t("Client Sector Category")}</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900/70 border border-white/10 rounded-lg text-white cursor-pointer"
              >
                <option value="Individual">{t("Individual")}</option>
                <option value="Corporate">{t("Corporate")}</option>
                <option value="Wholesale">{t("Wholesale")}</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">{t("Industry Group Assignment")}</label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900/70 border border-white/10 rounded-lg text-white cursor-pointer"
              >
                <option value="03-Home Delivery">03-Home Delivery</option>
                <option value="04-Minimarket KR">04-Minimarket KR</option>
                <option value="05-Key Account">05-Key Account</option>
                <option value="06-Discounted Stores">06-Discounted Stores</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">{t("Regional Sub-Group")}</label>
              <select
                value={subGroup}
                onChange={(e) => setSubGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900/70 border border-white/10 rounded-lg text-white cursor-pointer"
              >
                <option value="30-House">30-House</option>
                <option value="31-Apartment block">31-Apartment block</option>
                <option value="32-Retail shop">32-Retail shop</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 4: Identification */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 border-b border-white/10 pb-2.5">
            {t("Security Verification")}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">{t("Identity Credentials License type")}</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900/70 border border-white/10 rounded-lg text-white cursor-pointer"
              >
                <option value="Iqama">{t("Iqama")}</option>
                <option value="National ID">{t("National ID")}</option>
                <option value="CR Number">{t("CR Number")}</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">{t("License / Register Key ID")}</label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900/70 border border-white/10 rounded-lg text-emerald-400 font-mono font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Card 5: Attachments logs */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 border-b border-white/10 pb-2.5">
            {t("Digital Bio Assets")}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIdCaptured(true)}
              className={`py-5 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                idCaptured
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-900/40 hover:bg-slate-900 border-white/10 hover:border-white/20 text-slate-400'
              }`}
            >
              {idCaptured ? (
                <>
                  <Check className="w-5 h-5 stroke-[3] text-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold uppercase">{t("ID Linked")}</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 text-slate-500" />
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-300">{t("Scan ID Card")}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSiteCaptured(true)}
              className={`py-5 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                siteCaptured
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-900/40 hover:bg-slate-900 border-white/10 hover:border-white/20 text-slate-400'
              }`}
            >
              {siteCaptured ? (
                <>
                  <Check className="w-5 h-5 stroke-[3] text-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold uppercase">{t("GPS Tagged")}</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 text-slate-500" />
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-300">{t("Site Photo")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-555 hover:to-emerald-555 text-white py-3.5 rounded-2xl text-sm font-bold shadow-[0_8px_30px_rgba(16,185,129,0.2)] hover:shadow-[0_8px_40px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-4"
        >
          <UserPlus className="w-5 h-5" />{t("Initialize Customer Node")}</button>
      </form>
    </div>
  );
}
