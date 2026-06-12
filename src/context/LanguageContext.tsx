import React, { createContext, useContext, useState, useEffect } from 'react';
import translationsData from '../translations.json';

export type LanguageType = 'en' | 'ar';

export interface LanguageContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, string> = translationsData as Record<string, string>;

// Map Arabic strings to English so we can reverse translate!
const reverseTranslations: Record<string, string> = Object.fromEntries(
  Object.entries(translations).map(([en, ar]) => [ar, en])
);

const defaultContext: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>(() => {
    const saved = localStorage.getItem('system_language');
    if (saved === 'en' || saved === 'ar') {
      return saved;
    }
    return 'en';
  });

  const setLanguage = (newLang: LanguageType) => {
    setLanguageState(newLang);
    localStorage.setItem('system_language', newLang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const t = (key: string): string => {
    if (language === 'en') return key;
    return translations[key] || key;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.body.classList.toggle('lang-ar', language === 'ar');
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
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
