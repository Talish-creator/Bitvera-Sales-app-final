import React, { createContext, useContext, useState, useEffect } from 'react';
import arabicTranslations from '../translations.json';

export type LanguageType = 'en' | 'ar' | 'de' | 'es' | 'zh' | 'fr';

export interface LanguageOption {
  code: LanguageType;
  label: string;
  nativeLabel: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English (US)', nativeLabel: 'English', dir: 'ltr' },
  { code: 'ar', label: 'Arabic (KSA)', nativeLabel: 'العربية', dir: 'rtl' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', dir: 'ltr' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', dir: 'ltr' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', dir: 'ltr' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', dir: 'ltr' },
];

export interface LanguageContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  toggleLanguage: () => void;
  isRtl: boolean;
  t: (key: string) => string;
}

// Translations for European & Asian languages for primary UI elements
const multiLangDictionary: Record<LanguageType, Record<string, string>> = {
  en: {},
  ar: arabicTranslations as Record<string, string>,
  de: {
    "Bitvera Sales": "Bitvera Vertrieb",
    "Dashboard": "Übersicht",
    "Sales": "Verkauf",
    "Inventory": "Inventar",
    "CRM": "Kunden",
    "Reports": "Berichte",
    "Settings": "Einstellungen",
    "Van Stock": "Lieferwagen-Bestand",
    "Loading Requests": "Ladeanforderungen",
    "Visit Plan": "Besuchsplan",
    "Closing": "Tagesabschluss",
    "Today's Route": "Heutige Route",
    "Today's Route Schedule": "Heutiger Tourenplan",
    "Create Order": "Auftrag Erstellen",
    "Generate Sales Invoice": "Rechnung Erstellen",
    "Daily Closing Reports": "Tagesabschlussberichte",
    "Register Customer Matrix": "Kunden Registrieren",
    "All Units": "Alle Einheiten",
    "Pending": "Ausstehend",
    "Completed": "Abgeschlossen",
    "IN STOCK": "AUF LAGER",
    "LOW STOCK": "GERINGER BESTAND",
    "CRITICAL": "KRITISCH",
    "OUT OF STOCK": "NICHT VORRÄTIG",
    "Log Out": "Abmelden",
    "Dark Mode": "Dunkelmodus",
    "Light Mode": "Hellmodus",
    "Save": "Speichern",
    "Print": "Drucken",
    "Subtotal": "Zwischensumme",
    "Tax": "MwSt.",
    "Grand Total": "Gesamtsumme",
    "Cancel": "Abbrechen",
    "Confirm": "Bestätigen"
  },
  es: {
    "Bitvera Sales": "Ventas Bitvera",
    "Dashboard": "Panel",
    "Sales": "Ventas",
    "Inventory": "Inventario",
    "CRM": "Clientes",
    "Reports": "Informes",
    "Settings": "Ajustes",
    "Van Stock": "Stock en Furgoneta",
    "Loading Requests": "Solicitudes de Carga",
    "Visit Plan": "Plan de Visitas",
    "Closing": "Cierre Diario",
    "Today's Route": "Ruta de Hoy",
    "Today's Route Schedule": "Horario de Ruta de Hoy",
    "Create Order": "Crear Pedido",
    "Generate Sales Invoice": "Generar Factura",
    "Daily Closing Reports": "Informes de Cierre Diario",
    "Register Customer Matrix": "Registrar Cliente",
    "All Units": "Todas las Unidades",
    "Pending": "Pendiente",
    "Completed": "Completado",
    "IN STOCK": "EN STOCK",
    "LOW STOCK": "STOCK BAJO",
    "CRITICAL": "CRÍTICO",
    "OUT OF STOCK": "AGOTADO",
    "Log Out": "Cerrar Sesión",
    "Dark Mode": "Modo Oscuro",
    "Light Mode": "Modo Claro",
    "Save": "Guardar",
    "Print": "Imprimir",
    "Subtotal": "Subtotal",
    "Tax": "IVA",
    "Grand Total": "Total General",
    "Cancel": "Cancelar",
    "Confirm": "Confirmar"
  },
  zh: {
    "Bitvera Sales": "Bitvera 销售系统",
    "Dashboard": "仪表板",
    "Sales": "销售",
    "Inventory": "库存",
    "CRM": "客户关系",
    "Reports": "报表",
    "Settings": "设置",
    "Van Stock": "车销库存",
    "Loading Requests": "装货申请",
    "Visit Plan": "拜访计划",
    "Closing": "日结报表",
    "Today's Route": "今日路线",
    "Today's Route Schedule": "今日拜访路线",
    "Create Order": "创建订单",
    "Generate Sales Invoice": "生成销售发票",
    "Daily Closing Reports": "每日结账报告",
    "Register Customer Matrix": "登记新客户",
    "All Units": "全部项目",
    "Pending": "待处理",
    "Completed": "已完成",
    "IN STOCK": "有现货",
    "LOW STOCK": "库存低",
    "CRITICAL": "紧缺",
    "OUT OF STOCK": "缺货",
    "Log Out": "退出登录",
    "Dark Mode": "深色模式",
    "Light Mode": "浅色模式",
    "Save": "保存",
    "Print": "打印",
    "Subtotal": "小计",
    "Tax": "税额",
    "Grand Total": "总计",
    "Cancel": "取消",
    "Confirm": "确认"
  },
  fr: {
    "Bitvera Sales": "Ventes Bitvera",
    "Dashboard": "Tableau de Bord",
    "Sales": "Ventes",
    "Inventory": "Inventaire",
    "CRM": "Clients",
    "Reports": "Rapports",
    "Settings": "Paramètres",
    "Van Stock": "Stock Camionnette",
    "Loading Requests": "Demandes de Chargement",
    "Visit Plan": "Plan de Visite",
    "Closing": "Clôture Journalière",
    "Today's Route": "Itinéraire du Jour",
    "Today's Route Schedule": "Planning des Visites du Jour",
    "Create Order": "Créer une Commande",
    "Generate Sales Invoice": "Générer la Facture",
    "Daily Closing Reports": "Rapports de Clôture Quotidienne",
    "Register Customer Matrix": "Enregistrer un Client",
    "All Units": "Toutes les Unités",
    "Pending": "En Attente",
    "Completed": "Terminé",
    "IN STOCK": "EN STOCK",
    "LOW STOCK": "STOCK FAIBLE",
    "CRITICAL": "CRITIQUE",
    "OUT OF STOCK": "ÉPUISÉ",
    "Log Out": "Déconnexion",
    "Dark Mode": "Mode Sombre",
    "Light Mode": "Mode Clair",
    "Save": "Enregistrer",
    "Print": "Imprimer",
    "Subtotal": "Sous-total",
    "Tax": "TVA",
    "Grand Total": "Total Général",
    "Cancel": "Annuler",
    "Confirm": "Confirmer"
  }
};

const defaultContext: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  isRtl: false,
  t: (key: string) => key,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>(() => {
    const saved = localStorage.getItem('system_language') as LanguageType;
    if (saved && ['en', 'ar', 'de', 'es', 'zh', 'fr'].includes(saved)) {
      return saved;
    }
    return 'en';
  });

  const isRtl = language === 'ar';

  const setLanguage = (newLang: LanguageType) => {
    setLanguageState(newLang);
    localStorage.setItem('system_language', newLang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const t = (key: string): string => {
    if (language === 'en') return key;
    const langDict = multiLangDictionary[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback: check Arabic dictionary if key exists
    if (arabicTranslations[key as keyof typeof arabicTranslations]) {
      if (language === 'ar') return arabicTranslations[key as keyof typeof arabicTranslations];
    }
    return key;
  };

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;

    // Use classList toggle to never wipe out theme classes set by ThemeContext!
    document.body.classList.toggle('lang-ar', isRtl);
  }, [language, isRtl]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isRtl, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
