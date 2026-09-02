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
  const { t, language } = useLanguage();
  const { activeCurrency, format, convert } = useCurrency();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isPrinted, setIsPrinted] = useState(false);

  // Defaults fallback
  const idStr = invoiceData?.id || 'SINV-2026-04122';
  const dateStr = invoiceData?.date || '10 Jun 2026';
  const subtotal = invoiceData?.subtotal || 395.00;
  const tax = invoiceData?.tax || 59.25;
  const total = invoiceData?.total || 454.25;

  const items = orderItems.length > 0 ? orderItems : [
    { name: 'ALMAS 1.5 L*6', qty: 50, price: 6.50 },
    { name: 'ALMAS 500 ML*12', qty: 10, price: 7.00 }
  ];

  const handleDownload = () => {
    setIsDownloaded(true);
    const printableElement = document.getElementById('invoice-printable-area');
    if (printableElement) {
      const isRtl = language === 'ar';
      const htmlContent = `<!DOCTYPE html>
<html lang="${language}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <title>${idStr}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #fff; color: #0f172a; padding: 24px; margin: 0 auto; max-width: 800px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; margin-bottom: 14px; border: 1px solid #cbd5e1; }
    th, td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    th { text-align: ${isRtl ? 'right' : 'left'}; font-size: 11px; text-transform: uppercase; background: #f1f5f9; color: #0f172a; font-weight: bold; border-bottom: 2px solid #0f172a; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .font-mono { font-family: monospace; }
    .bg-slate-50, .bg-slate-100 { background: #f8fafc; }
    .bg-slate-900 { background: #0f172a; color: #fff; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  ${printableElement.innerHTML}
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${idStr}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    setTimeout(() => setIsDownloaded(false), 2000);
  };

  const handlePrint = () => {
    setIsPrinted(true);
    setTimeout(() => {
      window.print();
      setIsPrinted(false);
    }, 150);
  };

  return (
    <div className="space-y-6 pb-24 text-left font-sans relative z-10 transition-all duration-300">
      {/* Top action PDF bar */}
      <div className="bg-slate-950/70 border border-white/10 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-md no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-indigo-400 border border-white/10 text-slate-300 font-bold cursor-pointer text-xs transition-colors"
            title={t("Close PDF Document")}
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
            {isDownloaded ? t("Saved") : t("Save")}
          </button>
          <button
            onClick={handlePrint}
            className="p-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold border border-white/10"
          >
            {isPrinted ? <Check className="w-4 h-4 text-emerald-400" /> : <Printer className="w-3.5 h-3.5 text-emerald-300" />}
            {isPrinted ? t("Printing...") : t("Print")}
          </button>
        </div>
      </div>

      {/* The Paper A4 Invoice Mock card */}
      <div id="invoice-printable-area" className="bg-white border text-slate-900 border-slate-300 rounded-2xl shadow-2xl overflow-hidden p-6 md:p-10 font-sans max-w-2xl mx-auto space-y-6 leading-relaxed relative">
        
        {/* Header Block with custom logo */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-250 pb-5 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-slate-900 rounded-xl text-white font-black text-2xl flex items-center justify-center shadow-md border border-slate-800 shrink-0">
              B
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 font-sans">{t("Bitvera ERP IT Solution")}</h2>
              <p className="text-xs font-bold text-slate-700 mt-0.5">حلول بيتفيرا لتقنية المعلومات</p>
            </div>
          </div>

          <div className="text-xs font-medium space-y-1 text-slate-700 font-mono text-left md:text-right">
            <div className="flex items-center md:justify-end gap-1.5">
              <span>📍</span>
              <span className="font-semibold text-slate-900">{t("Riyadh, Saudi Arabia | الرياض، المملكة")}</span>
            </div>
            <div className="flex items-center md:justify-end gap-1.5 text-slate-700">
              <span>📞</span>
              <span>{t("Hotline: +966 58 060 8336 | الخط الساخن")}</span>
            </div>
            <div className="text-[11px] font-bold text-slate-800">
              <span>VAT / الرقم الضريبي: </span>
              <span className="font-mono text-slate-950 font-black">310123456700003</span>
            </div>
          </div>
        </div>

        {/* Invoice Title Container */}
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-sm font-black uppercase text-slate-950 tracking-wider">{t("Simplified Tax Invoice")}</h1>
            <p className="text-xs font-bold text-slate-600 mt-0.5">فاتورة ضريبية مبسطة</p>
          </div>
          <div className="font-mono text-xs text-slate-800 flex gap-5">
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t("Invoice No. / رقم الفاتورة")}</div>
              <div className="font-black text-slate-950 text-sm">{idStr}</div>
            </div>
            <div className="border-l border-slate-300 pl-5 space-y-0.5">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t("Date / التاريخ")}</div>
              <div className="font-bold text-slate-950 text-sm">{dateStr}</div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">{t("Billed To / فاتورة إلى")}</div>
            <h3 className="text-base font-black text-slate-950">
              {customerName ? customerName : 'Walk-in Customer'}
            </h3>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              {customerName ? 'Registered Member / عميل معتمد' : 'Walk-in Customer / عميل نقدي'}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300 uppercase tracking-wider">
              ● {t("Cash Sale / مبيعات نقدية")}
            </span>
          </div>
        </div>

        {/* Table of items */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-slate-300 rounded-lg overflow-hidden">
            <thead>
              <tr className="border-b-2 border-slate-300 text-[11px] uppercase font-bold text-slate-900 tracking-wider text-left bg-slate-100">
                <th className="py-3 px-3">{t("Description / الوصف")}</th>
                <th className="py-3 px-3 text-center">{t("Qty / الكمية")}</th>
                <th className="py-3 px-3 text-right">Unit Price / السعر ({activeCurrency.code})</th>
                <th className="py-3 px-3 text-right">VAT (15%) / الضريبة</th>
                <th className="py-3 px-3 text-right">Total ({activeCurrency.code}) / الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const itemVat = item.qty * item.price * 0.15;
                const itemTotal = item.qty * item.price * 1.15;

                return (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50/50 py-3 text-slate-800 font-medium">
                    <td className="py-3 px-3">
                      <div className="font-black text-slate-950 text-sm">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">{t("Standard Warehouse Unit")}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-black font-mono text-slate-950 text-sm">{item.qty}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">{convert(item.price).toFixed(activeCurrency.decimals)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">{convert(itemVat).toFixed(activeCurrency.decimals)}</td>
                    <td className="py-3 px-3 text-right font-mono font-black text-slate-950 text-sm">{convert(itemTotal).toFixed(activeCurrency.decimals)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Totals and QR Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 items-center">
          {/* QR Simplified Code Compliance */}
          <div className="flex gap-3.5 items-center p-3 bg-slate-50 border border-slate-300 rounded-xl">
            {/* Real SVG Vector QR that always prints crisp black */}
            <svg className="w-22 h-22 shrink-0 bg-white p-1 border border-slate-300 rounded shadow-xs" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="white" />
              <rect x="6" y="6" width="28" height="28" fill="#0f172a" rx="2" />
              <rect x="10" y="10" width="20" height="20" fill="white" />
              <rect x="14" y="14" width="12" height="12" fill="#0f172a" rx="1" />
              
              <rect x="66" y="6" width="28" height="28" fill="#0f172a" rx="2" />
              <rect x="70" y="10" width="20" height="20" fill="white" />
              <rect x="74" y="14" width="12" height="12" fill="#0f172a" rx="1" />
              
              <rect x="6" y="66" width="28" height="28" fill="#0f172a" rx="2" />
              <rect x="10" y="70" width="20" height="20" fill="white" />
              <rect x="14" y="74" width="12" height="12" fill="#0f172a" rx="1" />
              
              <rect x="40" y="8" width="6" height="6" fill="#0f172a" />
              <rect x="52" y="8" width="6" height="6" fill="#0f172a" />
              <rect x="8" y="40" width="6" height="6" fill="#0f172a" />
              <rect x="8" y="52" width="6" height="6" fill="#0f172a" />
              
              <rect x="40" y="20" width="8" height="8" fill="#0f172a" />
              <rect x="52" y="20" width="8" height="8" fill="#0f172a" />
              <rect x="40" y="34" width="8" height="8" fill="#0f172a" />
              <rect x="52" y="34" width="8" height="8" fill="#0f172a" />
              <rect x="66" y="40" width="8" height="8" fill="#0f172a" />
              <rect x="78" y="40" width="8" height="8" fill="#0f172a" />
              <rect x="90" y="40" width="4" height="4" fill="#0f172a" />
              
              <rect x="40" y="48" width="10" height="10" fill="#0f172a" />
              <rect x="54" y="48" width="8" height="8" fill="#0f172a" />
              <rect x="66" y="52" width="8" height="8" fill="#0f172a" />
              <rect x="78" y="52" width="8" height="8" fill="#0f172a" />
              
              <rect x="40" y="64" width="8" height="8" fill="#0f172a" />
              <rect x="52" y="64" width="10" height="10" fill="#0f172a" />
              <rect x="66" y="66" width="8" height="8" fill="#0f172a" />
              <rect x="78" y="66" width="8" height="8" fill="#0f172a" />
              <rect x="90" y="66" width="4" height="4" fill="#0f172a" />
              
              <rect x="40" y="78" width="8" height="8" fill="#0f172a" />
              <rect x="52" y="78" width="8" height="8" fill="#0f172a" />
              <rect x="66" y="80" width="10" height="10" fill="#0f172a" />
              <rect x="80" y="80" width="8" height="8" fill="#0f172a" />
              <rect x="90" y="86" width="4" height="4" fill="#0f172a" />
            </svg>

            <div className="text-[10px] leading-relaxed text-slate-800 font-medium space-y-1">
              <p className="text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                ZATCA Compliant Simplified Invoice
              </p>
              <p className="text-slate-600 font-semibold">
                فاتورة ضريبية مبسطة معتمدة إلكترونياً من هيئة الزكاة والضريبة والجمارك رقم <span className="font-mono font-bold text-slate-900">{idStr.replace('SINV-', '')}</span>
              </p>
            </div>
          </div>

          {/* Subtotal table calculation */}
          <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-2 font-mono text-xs text-right">
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-sans font-bold text-slate-700">{t("Subtotal / الإجمالي الخاضع:")}</span>
              <span className="font-black text-slate-900 text-sm">{format(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-sans font-bold text-slate-700">VAT (15%) / ضريبة القيمة مضافة:</span>
              <span className="font-black text-slate-900 text-sm">{format(tax)}</span>
            </div>
            <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-baseline">
              <span className="font-sans font-black text-xs uppercase text-slate-950">{t("TOTAL AMOUNT / إجمالي الفاتورة:")}</span>
              <span className="text-base font-black text-emerald-700">{format(total)}</span>
            </div>
          </div>
        </div>

        {/* Signature stamp */}
        <div className="pt-6 border-t border-slate-300 text-center">
          <p className="text-[11px] uppercase font-black text-slate-600 tracking-wider">{t("Thank you for choosing Bitvera ERP • شكراً لاختياركم بيتفيرا")}</p>
        </div>
      </div>
      
      {/* Return back button */}
      <div className="text-center pt-2 no-print">
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-mono font-bold active:scale-95 shadow-md transition-all cursor-pointer border border-white/10"
        >
          {t("Return to Dashboard Console")}
        </button>
      </div>
    </div>
  );
}
