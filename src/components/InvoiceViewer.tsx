import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';
import { X, Printer, Download, Check, FileText } from 'lucide-react';
import { ViewState } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface InvoiceViewerProps {
  invoiceData: {
    id: string;
    date: string;
    subtotal: number;
    tax: number;
    total: number;
    cashReceived: number;
    bankReceived: number;
    txRef: string;
    hasProof: boolean;
  } | null;
  customerName: string;
  onNavigate: (view: ViewState) => void;
  orderItems: { name: string; qty: number; price: number }[];
}

export default function InvoiceViewer({
  invoiceData,
  customerName,
  onNavigate,
  orderItems
}: InvoiceViewerProps) {
  const { t } = useLanguage();
  const { activeCurrency, format, convert } = useCurrency();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isPrinted, setIsPrinted] = useState(false);

  // Defaults fallback
  const idStr = invoiceData?.id || 'SINV-2026-04122';
  const dateStr = invoiceData?.date || '10 Jun 2026';
  const subtotal = invoiceData?.subtotal || 717.50;
  const tax = invoiceData?.tax || 107.63;
  const total = invoiceData?.total || 825.13;

  const items = orderItems.length > 0 ? orderItems : [
    { name: 'Industrial Lubricant 5L', qty: 2, price: 145.00 },
    { name: 'Heavy Duty Filter', qty: 5, price: 85.50 }
  ];

  const handleDownload = () => {
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2000);
  };

  const handlePrint = () => {
    setIsPrinted(true);
    setTimeout(() => setIsPrinted(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24 text-left font-sans relative z-10 transition-all duration-300">
      {/* Top action PDF bar */}
      <div className="bg-slate-950/70 border border-white/10 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('today_route')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-indigo-400 border border-white/10 text-slate-300 font-bold cursor-pointer text-xs transition-colors"
            title="Close PDF Document"
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <h3 className="font-extrabold text-sm text-white font-mono">{idStr}.pdf</h3>
            <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-widest">{t("Bitvera PDF Server Ready")}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="p-2 px-3 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold"
          >
            {isDownloaded ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-indigo-400" />}
            {isDownloaded ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={handlePrint}
            className="p-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-555 hover:to-indigo-555 text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold border border-white/10"
          >
            {isPrinted ? <Check className="w-4 h-4 text-emerald-400" /> : <Printer className="w-3.5 h-3.5 text-emerald-300" />}
            {isPrinted ? 'Queued' : 'Print'}
          </button>
        </div>
      </div>

      {/* The Paper A4 Invoice Mock card */}
      <div className="bg-white border text-slate-900 border-slate-300 rounded-2xl shadow-2xl overflow-hidden p-6 md:p-10 font-sans max-w-2xl mx-auto space-y-6 leading-relaxed relative">
        
        {/* Header Block with custom logo */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-250 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 rounded-xl text-white font-black text-2xl flex items-center justify-center shadow-lg border border-white/20">
              B
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 font-sans">{t("Bitvera ERP IT Solution")}</h2>
              <p className="text-xs font-bold text-slate-500 mt-0.5">حلول بيتفيرا لتقنية المعلومات</p>
            </div>
          </div>

          <div className="text-[11px] font-medium space-y-1 text-slate-650 font-mono">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">📍</span>
              <span>{t("Riyadh, Saudi Arabia | الرياض، المملكة")}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <span className="text-slate-400">📞</span>
              <span>{t("Hotline: +966 58 060 8336 | الخط الساخن")}</span>
            </div>
          </div>
        </div>

        {/* Invoice Title Container */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-3">
          <div>
            <h1 className="text-sm font-black uppercase text-slate-800 tracking-wide">{t("Simplified Tax Invoice")}</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">فاتورة ضريبية مبسطة</p>
          </div>
          <div className="font-mono text-xs text-slate-600 flex gap-4">
            <div>
              <div className="text-[10px] font-bold text-slate-450 uppercase">{t("Invoice No. / رقم الفاتورة")}</div>
              <div className="font-bold text-slate-900 mt-0.5">{idStr}</div>
            </div>
            <div className="border-l border-slate-250 pl-4">
              <div className="text-[10px] font-bold text-slate-450 uppercase">{t("Date / التاريخ")}</div>
              <div className="font-semibold text-slate-900 mt-0.5">{dateStr}</div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="border-b border-slate-200 pb-4">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t("Billed To / فاتورة إلى")}</div>
          <div className="flex justify-between items-baseline mt-1.5">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {customerName ? customerName : 'Walk-in Customer'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {customerName ? 'Registered Member / عميل معتمد' : 'Walk-in Customer / عميل نقدي'}
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">{t("Cash Sale / مبيعات نقدية")}</span>
          </div>
        </div>

        {/* Table of items */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-300 text-[10px] uppercase font-bold text-slate-500 tracking-wider text-left bg-slate-50">
                <th className="py-2.5 px-2">{t("Description / الوصف")}</th>
                <th className="py-2.5 px-2 text-center">{t("Qty / الكمية")}</th>
                <th className="py-2.5 px-2 text-right">Unit Price / السعر ({activeCurrency.code})</th>
                <th className="py-2.5 px-2 text-right">VAT (15%) / الضريبة</th>
                <th className="py-2.5 px-2 text-right">Total ({activeCurrency.code}) / الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const itemVat = item.qty * item.price * 0.15;
                const itemTotal = item.qty * item.price * 1.15;

                return (
                  <tr key={idx} className="border-b border-slate-150 py-3 text-slate-700 font-medium">
                    <td className="py-3 px-2">
                      <div className="font-extrabold text-slate-800">{item.name}</div>
                      <div className="text-[9px] text-slate-400 italic font-normal">{t("Standard Warehouse Unit")}</div>
                    </td>
                    <td className="py-3 px-2 text-center font-bold font-mono text-slate-900">{item.qty}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold">{convert(item.price).toFixed(activeCurrency.decimals)}</td>
                    <td className="py-3 px-2 text-right font-mono text-slate-400">{convert(itemVat).toFixed(activeCurrency.decimals)}</td>
                    <td className="py-3 px-2 text-right font-mono font-extrabold text-slate-900">{convert(itemTotal).toFixed(activeCurrency.decimals)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Totals and QR Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
          {/* QR Simplified Code Compliance */}
          <div className="flex gap-3 items-center">
            {/* Simple simulated vector QR */}
            <div className="w-20 h-20 bg-slate-50 p-2 border border-slate-305 rounded flex flex-wrap content-between gap-1 shrink-0 select-none shadow-xs">
              <div className="w-4 h-4 bg-slate-800 rounded-sm"></div>
              <div className="w-4 h-4 bg-slate-800 rounded-sm"></div>
              <div className="w-4 h-4 bg-slate-800 rounded-sm"></div>
              <div className="w-2 h-2 bg-slate-800 rounded-sm"></div>
              <div className="w-3 h-3 bg-slate-900 rounded-sm"></div>
              <div className="w-2 h-2 bg-slate-800 rounded-sm"></div>
              <div className="w-4 h-4 bg-slate-800 rounded-sm"></div>
              <div className="w-4 h-4 bg-slate-800 rounded-sm"></div>
              <div className="w-4 h-4 bg-slate-800 rounded-sm"></div>
            </div>
            <div className="text-[9px] leading-relaxed text-slate-500 font-bold">
              <p className="text-emerald-600">● ZATCA Compliant Simplified Invoice</p>
              <p className="mt-1">بيتفيرا لنظم المعلومات - فاتورة معتمدة إلكترونياً من هيئة الزكاة والضريبة والجمارك رقم {idStr.replace('SINV-', '')}</p>
            </div>
          </div>

          {/* Subtotal table calculation */}
          <div className="space-y-1.5 font-semibold text-xs text-slate-600 font-mono text-right">
            <div className="flex justify-between">
              <span className="text-slate-400">{t("Subtotal / الإجمالي الخاضع:")}</span>
              <span className="text-slate-950">{format(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">VAT (15%) / ضريبة القيمة مضافة:</span>
              <span className="text-slate-950">{format(tax)}</span>
            </div>
            <hr className="border-slate-200 my-1" />
            <div className="flex justify-between items-baseline text-sm font-extrabold text-slate-900">
              <span>{t("TOTAL AMOUNT / إجمالي الفاتورة:")}</span>
              <span className="text-base text-emerald-600">{format(total)}</span>
            </div>
          </div>
        </div>

        {/* Signature stamp */}
        <div className="pt-6 border-t border-slate-200 text-center">
          <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">{t("Thank you for choosing Bitvera ERP • شكراً لاختياركم بيتفيرا")}</p>
        </div>
      </div>
      
      {/* Return back button */}
      <div className="text-center pt-2">
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-555 hover:to-indigo-555 text-white rounded-xl text-xs font-mono font-bold active:scale-95 shadow-md transition-all cursor-pointer border border-white/10"
        >
          Return to Dashboard Console
        </button>
      </div>
    </div>
  );
}
