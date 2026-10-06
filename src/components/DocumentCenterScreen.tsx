import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, FileText, Download, Trash2, Plus, 
  Search, Eye, ShieldCheck, Filter, Upload 
} from 'lucide-react';
import { ViewState, DocumentItem } from '../types';
import { getDocuments, addDocument, deleteDocument } from '../services/documents';
import { useLanguage } from '../context/LanguageContext';

interface DocumentCenterScreenProps {
  onNavigate: (view: ViewState) => void;
}

export default function DocumentCenterScreen({ onNavigate }: DocumentCenterScreenProps) {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<DocumentItem[]>(() => getDocuments());
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      if (filterType !== 'ALL' && doc.entityType !== filterType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return doc.title.toLowerCase().includes(q) || doc.fileName.toLowerCase().includes(q) || doc.entityId.toLowerCase().includes(q);
      }
      return true;
    });
  }, [documents, filterType, search]);

  const handleDownload = (doc: DocumentItem) => {
    const a = document.createElement('a');
    a.href = doc.dataUrl;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            {t("Centralized Document Vault")}
          </h1>
          <p className="text-xs text-slate-400">{t("Secure Commercial Attachments, Invoices & CR Records")}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 justify-between items-center shadow-lg">
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar text-xs font-mono">
          {['ALL', 'Customer', 'Invoice', 'Expense', 'Payment'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                filterType === type
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search documents...")}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-950/60 border border-white/10 hover:border-indigo-500/30 rounded-2xl p-4 shadow-lg flex items-start justify-between gap-3 group transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 leading-snug">
                    {doc.title}
                  </h4>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                    {doc.entityType}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400">{doc.fileName}</p>
                <span className="text-[9px] font-mono text-slate-500 block">
                  {doc.entityType} #{doc.entityId} • {Math.round(doc.fileSize / 1024)} KB • {doc.uploadedAt.split('T')[0]}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleDownload(doc)}
                className="p-2 bg-slate-900 border border-white/10 hover:border-emerald-500 text-slate-400 hover:text-emerald-400 rounded-xl cursor-pointer transition-colors"
                title={t("Download File")}
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  deleteDocument(doc.id);
                  setDocuments(getDocuments());
                }}
                className="p-2 bg-slate-900 border border-white/10 hover:border-rose-500 text-slate-400 hover:text-rose-400 rounded-xl cursor-pointer transition-colors"
                title={t("Delete Document")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
