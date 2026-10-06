import { useLanguage } from '../context/LanguageContext';
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Camera, UserPlus, Check, Sparkles, AlertCircle, RefreshCw, X, Image as ImageIcon } from 'lucide-react';
import { Customer, ViewState } from '../types';
import { getCurrentDeviceLocation } from '../services/location';
import { promptDeviceImageCapture, CapturedDocument } from '../services/camera';
import { addCustomerPersistent, checkCustomerDuplicate, saveAttachmentPersistent } from '../services/storage';
import { logAuditEvent } from '../services/audit';

interface CustomerFormScreenProps {
  onAddCustomer: (customer: Customer) => void;
  onNavigate: (view: ViewState) => void;
}

export default function CustomerFormScreen({ onAddCustomer, onNavigate }: CustomerFormScreenProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lat, setLat] = useState(24.8150028);
  const [lng, setLng] = useState(46.7938998);
  const [buildingNumber, setBuildingNumber] = useState('');

  const [type, setType] = useState('Individual');
  const [group, setGroup] = useState('03-Home Delivery');
  const [subGroup, setSubGroup] = useState('30-House');

  const [idType, setIdType] = useState('Iqama');
  const [idNumber, setIdNumber] = useState('');

  // Real attachments
  const [idDocument, setIdDocument] = useState<CapturedDocument | null>(null);
  const [sitePhoto, setSitePhoto] = useState<CapturedDocument | null>(null);

  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real GPS coordinate acquisition
  const handleGetRealLocation = async () => {
    setIsLocating(true);
    setErrorMsg('');

    const res = await getCurrentDeviceLocation(12000);
    setIsLocating(false);

    if (res.success && res.coords) {
      setLat(res.coords.latitude);
      setLng(res.coords.longitude);
      setNotification(`Acquired device GPS lock (±${res.coords.accuracy}m accuracy).`);
      setTimeout(() => setNotification(''), 4000);
    } else {
      setErrorMsg(res.error || 'Failed to acquire device location.');
    }
  };

  // Real Camera capture for ID Card
  const handleCaptureIdCard = async () => {
    const doc = await promptDeviceImageCapture(true);
    if (doc) {
      setIdDocument(doc);
    }
  };

  // Real Camera capture for Store / Site Photo
  const handleCaptureSitePhoto = async () => {
    const doc = await promptDeviceImageCapture(true);
    if (doc) {
      setSitePhoto(doc);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !phone.trim()) {
      setErrorMsg(t("Please provide both customer name and primary contact phone."));
      return;
    }

    if (!buildingNumber.trim()) {
      setErrorMsg(t("Please provide assigned building code or number."));
      return;
    }

    // Generate unique sequential customer ID
    const customerId = `CUS-${Date.now().toString().slice(-5)}`;

    const newCust: Customer = {
      id: customerId,
      name: name.trim(),
      phone: phone.trim(),
      lat,
      lng,
      buildingNumber: buildingNumber.trim(),
      type,
      group,
      subGroup,
      idType,
      idNumber: idNumber.trim(),
      status: 'ACTIVE ACCOUNT'
    };

    // Server/storage duplicate detection
    const dupCheck = checkCustomerDuplicate(newCust);
    if (dupCheck.isDuplicate) {
      setErrorMsg(dupCheck.reason || t("Customer already exists."));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = addCustomerPersistent(newCust);
      if (!result.success) {
        setErrorMsg(result.error || t("Failed to save customer."));
        setIsSubmitting(false);
        return;
      }

      // Persist real captured attachments if provided
      if (idDocument) {
        saveAttachmentPersistent({
          id: idDocument.id,
          entityType: 'customer_id',
          entityId: customerId,
          fileName: idDocument.name,
          fileSize: idDocument.sizeBytes,
          mimeType: idDocument.mimeType,
          dataUrl: idDocument.dataUrl,
          createdAt: idDocument.capturedAt
        });
      }

      if (sitePhoto) {
        saveAttachmentPersistent({
          id: sitePhoto.id,
          entityType: 'customer_site',
          entityId: customerId,
          fileName: sitePhoto.name,
          fileSize: sitePhoto.sizeBytes,
          mimeType: sitePhoto.mimeType,
          dataUrl: sitePhoto.dataUrl,
          createdAt: sitePhoto.capturedAt
        });
      }

      await logAuditEvent('CUSTOMER_CREATED', {
        customerId,
        customerName: newCust.name,
        phone: newCust.phone,
        hasIdDoc: !!idDocument,
        hasSitePhoto: !!sitePhoto
      });

      onAddCustomer(newCust);
      setNotification(t("Successfully registered and persisted customer in system."));
      
      setTimeout(() => {
        onNavigate('today_route');
      }, 900);
    } catch (err: any) {
      setErrorMsg(err?.message || t("Error registering customer node."));
      setIsSubmitting(false);
    }
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
        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-xs p-3.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 text-rose-400 border border-rose-500/25 font-mono text-xs p-3.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
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
                placeholder={t("e.g. Al Madina Supermarket")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900/70 border border-white/10 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">{t("Secure Primary Phone")}</label>
              <input
                type="tel"
                placeholder="05XXXXXXXX"
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
              onClick={handleGetRealLocation}
              disabled={isLocating}
              className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/35 hover:bg-indigo-600/20 text-indigo-300 rounded-lg text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <MapPin className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              {isLocating ? t("Acquiring GPS...") : t("Resolve Location")}
            </button>
          </div>

          <div className="space-y-4">
            {/* Coordinate readout */}
            <div className="bg-slate-900/40 border border-white/10 rounded-xl p-3 flex gap-3 items-center">
              <MapPin className="w-6 h-6 text-emerald-400 shrink-0 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <div className="text-xs text-slate-300 font-mono leading-relaxed">
                <div>{t("Lat:")} <span className="text-emerald-400 font-bold">{lat.toFixed(7)}</span></div>
                <div>{t("Long:")} <span className="text-emerald-400 font-bold">{lng.toFixed(7)}</span></div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">{t("Assigned Building Code")}</label>
              <input
                type="text"
                placeholder="2563"
                value={buildingNumber}
                onChange={(e) => setBuildingNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900/70 border border-white/10 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white font-mono"
                required
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
                placeholder={t("e.g. 1010488920")}
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900/70 border border-white/10 rounded-lg text-emerald-400 font-mono font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Card 5: Real Document Attachments */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 border-b border-white/10 pb-2.5">
            {t("Digital Bio Assets")}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {/* ID Capture Slot */}
            <div className="space-y-1.5">
              {idDocument ? (
                <div className="relative border border-emerald-500/40 rounded-xl overflow-hidden bg-slate-900 p-2 text-center group">
                  <img
                    src={idDocument.dataUrl}
                    alt="ID Document"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <div className="mt-1 flex items-center justify-between px-1 text-[9px] font-mono text-emerald-400">
                    <span className="truncate">{idDocument.name}</span>
                    <button
                      type="button"
                      onClick={() => setIdDocument(null)}
                      className="text-rose-400 hover:text-rose-300 ml-1 cursor-pointer"
                      title="Remove attachment"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCaptureIdCard}
                  className="w-full py-5 border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900 text-slate-400"
                >
                  <Camera className="w-5 h-5 text-slate-500" />
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-300">{t("Scan ID Card")}</span>
                </button>
              )}
            </div>

            {/* Site Photo Slot */}
            <div className="space-y-1.5">
              {sitePhoto ? (
                <div className="relative border border-emerald-500/40 rounded-xl overflow-hidden bg-slate-900 p-2 text-center group">
                  <img
                    src={sitePhoto.dataUrl}
                    alt="Site Photo"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <div className="mt-1 flex items-center justify-between px-1 text-[9px] font-mono text-emerald-400">
                    <span className="truncate">{sitePhoto.name}</span>
                    <button
                      type="button"
                      onClick={() => setSitePhoto(null)}
                      className="text-rose-400 hover:text-rose-300 ml-1 cursor-pointer"
                      title="Remove attachment"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCaptureSitePhoto}
                  className="w-full py-5 border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900 text-slate-400"
                >
                  <Camera className="w-5 h-5 text-slate-500" />
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-300">{t("Site Photo")}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white py-3.5 rounded-2xl text-sm font-bold shadow-[0_8px_30px_rgba(16,185,129,0.2)] hover:shadow-[0_8px_40px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-4 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>{t("Persisting Customer Node...")}</span>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              <span>{t("Initialize Customer Node")}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
