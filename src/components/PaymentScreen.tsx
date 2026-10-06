import { useLanguage } from '../context/LanguageContext';
import React, { useState, useEffect } from 'react';
import { Camera, Check, ArrowLeft, RefreshCw, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { ViewState } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { isPaymentSplitBalanced, convertToSAR, roundTo } from '../services/finance';
import { promptDeviceImageCapture, CapturedDocument } from '../services/camera';
import { saveAttachmentPersistent } from '../services/storage';
import { logAuditEvent } from '../services/audit';

interface PaymentScreenProps {
  totalAmount: number;
  taxAmount: number;
  subtotalAmount: number;
  onNavigate: (view: ViewState) => void;
  onSubmitInvoice: (invoiceData: any) => void;
}

export default function PaymentScreen({
  totalAmount,
  taxAmount,
  subtotalAmount,
  onNavigate,
  onSubmitInvoice
}: PaymentScreenProps) {
  const { t } = useLanguage();
  const { activeCurrency, format } = useCurrency();
  const [includePayment, setIncludePayment] = useState(true);
  const [cashPayment, setCashPayment] = useState(0);
  const [bankPayment, setBankPayment] = useState(0);
  const [transactionRef, setTransactionRef] = useState('');
  const [proofDocument, setProofDocument] = useState<CapturedDocument | null>(null);
  const [validationError, setValidationError] = useState('');

  // Set default split allocation on amount load
  useEffect(() => {
    if (totalAmount > 0) {
      const convertedTotal = roundTo(totalAmount * activeCurrency.rate, activeCurrency.decimals);
      const cash = roundTo(convertedTotal * 0.5, activeCurrency.decimals);
      const bank = roundTo(convertedTotal - cash, activeCurrency.decimals);
      setCashPayment(cash);
      setBankPayment(bank);
      setTransactionRef(`TXN-${Date.now().toString().slice(-6)}`);
    }
  }, [totalAmount, activeCurrency]);

  const convertedTotal = roundTo(totalAmount * activeCurrency.rate, activeCurrency.decimals);
  const splitCheck = isPaymentSplitBalanced(convertedTotal, cashPayment, bankPayment, 0, activeCurrency.decimals);
  const isBalanced = splitCheck.balanced;
  const remainingBalance = splitCheck.difference;

  const handleSplitEvenly = () => {
    const half = roundTo(convertedTotal / 2, activeCurrency.decimals);
    setCashPayment(half);
    setBankPayment(roundTo(convertedTotal - half, activeCurrency.decimals));
  };

  const handleCaptureReceipt = async () => {
    const doc = await promptDeviceImageCapture(true);
    if (doc) {
      setProofDocument(doc);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (includePayment && !isBalanced) {
      setValidationError(`Payment allocations must match total order amount. Remaining difference: ${activeCurrency.symbol} ${remainingBalance.toFixed(activeCurrency.decimals)}`);
      return;
    }

    if (includePayment && bankPayment > 0 && !transactionRef.trim()) {
      setValidationError('Bank transfer requires a valid Transaction Reference number.');
      return;
    }

    // Map input amounts back to SAR for unified ledger registry
    const cashInSAR = convertToSAR(cashPayment, activeCurrency.rate, 2);
    const bankInSAR = convertToSAR(bankPayment, activeCurrency.rate, 2);

    const invoiceId = `SINV-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Persist proof attachment if captured
    if (proofDocument) {
      saveAttachmentPersistent({
        id: proofDocument.id,
        entityType: 'payment_proof',
        entityId: invoiceId,
        fileName: proofDocument.name,
        fileSize: proofDocument.sizeBytes,
        mimeType: proofDocument.mimeType,
        dataUrl: proofDocument.dataUrl,
        createdAt: proofDocument.capturedAt
      });
    }

    const invoiceDetails = {
      id: invoiceId,
      date: formattedDate,
      subtotal: subtotalAmount,
      tax: taxAmount,
      total: totalAmount,
      cashReceived: cashInSAR,
      bankReceived: bankInSAR,
      txRef: transactionRef.trim(),
      hasProof: !!proofDocument,
      proofDataUrl: proofDocument?.dataUrl,
      currencyCode: activeCurrency.code
    };

    await logAuditEvent('PAYMENT_CREATED', {
      invoiceId,
      total: totalAmount,
      cashReceived: cashInSAR,
      bankReceived: bankInSAR,
      txRef: transactionRef,
      hasProof: !!proofDocument
    });

    onSubmitInvoice(invoiceDetails);
    onNavigate('invoice_viewer');
  };

  return (
    <div className="space-y-6 pb-24 text-left font-sans relative z-10 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 bg-slate-900/40 border border-white/10 rounded-2xl p-4 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
        <button
          onClick={() => onNavigate('create_order')}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-white/15 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-indigo-400" />
        </button>
        <div>
          <span className="text-[9px] uppercase tracking-widest text-[#10b981] font-mono block">{t("Billing Console")}</span>
          <h1 className="text-lg font-bold text-white">{t("Generate Sales Invoice")}</h1>
        </div>
      </div>

      {validationError && (
        <div className="bg-rose-500/10 text-rose-400 border border-rose-500/25 font-mono text-xs p-3.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Card 1: Invoice Total display */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 block">{t("Invoice Net Sum")}</span>
              <h2 className="text-3xl font-extrabold text-emerald-400 font-mono mt-1.5 drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                {format(totalAmount)}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 block">{t("Tax Standard")}</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md mt-1.5 inline-block uppercase tracking-wider">
                15% VAT INCL.
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center justify-between">
            <div className="text-xs space-y-0.5">
              <h4 className="font-bold text-slate-200">Include Payment (POS - Cash Sale)</h4>
              <p className="text-slate-500 text-[10px]">{t("Record payment details immediately upon delivery")}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includePayment}
                onChange={(e) => setIncludePayment(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Card 2: Split Payment Allocation */}
        {includePayment && (
          <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
            <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">// Split Payment Allocation</h3>
              <button
                type="button"
                onClick={handleSplitEvenly}
                className="text-[9px] font-mono font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-widest cursor-pointer flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20"
              >
                <RefreshCw className="w-3 h-3" />{t("Split 50:50")}
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1">{t("Cash payment drawer allocation")}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-mono text-xs">{activeCurrency.code}</span>
                  <input
                    type="number"
                    step={activeCurrency.decimals === 3 ? "0.001" : "0.01"}
                    value={cashPayment || ''}
                    onChange={(e) => setCashPayment(parseFloat(e.target.value) || 0)}
                    className="w-full pl-14 pr-3 py-2.5 text-sm bg-slate-900 border border-white/10 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono font-bold text-white shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1">{t("Bank transfer route allocation")}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-mono text-xs">{activeCurrency.code}</span>
                  <input
                    type="number"
                    step={activeCurrency.decimals === 3 ? "0.001" : "0.01"}
                    value={bankPayment || ''}
                    onChange={(e) => setBankPayment(parseFloat(e.target.value) || 0)}
                    className="w-full pl-14 pr-3 py-2.5 text-sm bg-slate-900 border border-white/10 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono font-bold text-white shadow-inner"
                  />
                </div>
              </div>

              {/* Nested Bank Details Block */}
              {bankPayment > 0 && (
                <div className="bg-slate-900/60 border border-indigo-500/20 rounded-xl p-3.5 space-y-2">
                  <h4 className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                    🏛️ Core Transfer Reference Key
                  </h4>
                  <input
                    type="text"
                    placeholder={t("Transaction ID / Reference number...")}
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-white/10 rounded-lg text-emerald-400 font-mono shadow-inner"
                    required
                  />
                </div>
              )}
            </div>

            {/* Calculations remaining check */}
            <div className="border-t border-white/10 pt-3.5 flex justify-between items-center text-xs">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">{t("Unbalanced Difference")}</span>
              <span
                className={`font-mono font-bold ${
                  isBalanced
                    ? 'text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20'
                    : 'text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1 animate-pulse'
                }`}
              >
                {!isBalanced && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                {activeCurrency.symbol} {Math.abs(remainingBalance).toFixed(activeCurrency.decimals)}
              </span>
            </div>
          </div>
        )}

        {/* Card 3: Attach Proof */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-3 shadow-lg">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">// Payment Attachment Proof</h3>
            <p className="text-slate-500 text-[10px] mt-1">{t("Capture physically printed payment receipts or electronic transaction confirmation.")}</p>
          </div>

          {proofDocument ? (
            <div className="relative border border-emerald-500/40 rounded-xl overflow-hidden bg-slate-900 p-3 text-center">
              <img
                src={proofDocument.dataUrl}
                alt="Receipt Proof"
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="mt-2 flex items-center justify-between text-xs font-mono text-emerald-400">
                <span className="truncate">{proofDocument.name} ({(proofDocument.sizeBytes / 1024).toFixed(1)} KB)</span>
                <button
                  type="button"
                  onClick={() => setProofDocument(null)}
                  className="text-rose-400 hover:text-rose-300 ml-2 font-bold cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCaptureReceipt}
              className="w-full py-6 border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-900/45 hover:bg-slate-900 text-slate-400"
            >
              <Camera className="w-6 h-6 text-slate-500" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-300">{t("Capture Payment Receipt (Camera / Upload)")}</span>
            </button>
          )}
        </div>

        {/* Action Button level */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('create_order')}
            className="flex-1 py-3 text-center border border-white/10 text-slate-300 bg-slate-900/40 hover:bg-slate-800 font-mono font-bold rounded-xl text-xs uppercase tracking-widest cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-mono font-bold rounded-xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-98 shadow-[0_4px_25px_rgba(99,102,241,0.25)] border border-white/10"
          >
            <Check className="w-4 h-4" />{t("Generate & Confirm Invoice")}
          </button>
        </div>
      </form>
    </div>
  );
}
