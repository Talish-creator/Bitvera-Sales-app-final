import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw, PenTool, ShieldCheck } from 'lucide-react';
import { saveDigitalSignature } from '../services/signatures';
import { useLanguage } from '../context/LanguageContext';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'Order' | 'VisitReport' | 'Payment' | 'ClosingReport';
  entityId: string;
  defaultSignerName?: string;
  onSignatureSaved: (sigId: string, dataUrl: string) => void;
}

export default function DigitalSignatureModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  defaultSignerName = '',
  onSignatureSaved
}: DigitalSignatureModalProps) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState(defaultSignerName || 'Customer Authorized Agent');
  const [signerTitle, setSignerTitle] = useState('Purchasing Officer');

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#10b981'; // Emerald stroke
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      alert(t("Please draw a signature before submitting."));
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    const record = saveDigitalSignature({
      signerName: signerName.trim() || 'Authorized Signer',
      signerTitle: signerTitle.trim() || 'Representative',
      relatedEntity: entityType,
      entityId,
      signatureDataUrl: dataUrl
    });

    onSignatureSaved(record.id, dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-left font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">{t("Capture Digital Signature")}</h3>
              <p className="text-[10px] text-slate-400 font-mono">{entityType} #{entityId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Signer inputs */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Signer Full Name")}</label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:border-indigo-500 font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Signer Title / Role")}</label>
            <input
              type="text"
              value={signerTitle}
              onChange={(e) => setSignerTitle(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:border-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Canvas pad */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>{t("Sign in the box below with finger or stylus")}:</span>
            <button
              onClick={handleClear}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> {t("Clear")}
            </button>
          </div>

          <div className="border border-white/15 bg-slate-950 rounded-xl overflow-hidden touch-none relative h-44 shadow-inner">
            <canvas
              ref={canvasRef}
              width={400}
              height={176}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-600 font-mono text-xs select-none">
                ✍️ {t("Draw signature here")}
              </div>
            )}
          </div>
        </div>

        {/* Legal notice */}
        <p className="text-[9px] font-mono text-slate-500 text-center">
          Stamped with device telemetry & ISO timestamp under Saudi Electronic Transactions Act.
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer"
          >
            {t("Cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={!hasDrawn}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 disabled:opacity-40 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            {t("Confirm Signature")}
          </button>
        </div>

      </div>
    </div>
  );
}
