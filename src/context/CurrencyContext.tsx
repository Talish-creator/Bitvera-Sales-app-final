import React, { createContext, useContext, useState } from 'react';

export interface CurrencyConfig {
  country: string;
  name: string;
  code: string;
  symbol: string;
  rate: number; // multiplier from SAR (SAR value * rate = Target value)
  decimals: number;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  {
    country: "Saudi Arabia",
    name: "Saudi Riyal",
    code: "SAR",
    symbol: "﷼",
    rate: 1.0,
    decimals: 2
  },
  {
    country: "Bahrain",
    name: "Bahraini Dinar",
    code: "BHD",
    symbol: "BD / د.ب.",
    rate: 0.1003,
    decimals: 3
  },
  {
    country: "Kuwait",
    name: "Kuwaiti Dinar",
    code: "KWD",
    symbol: "KD / د.ك.",
    rate: 0.0818,
    decimals: 3
  },
  {
    country: "Oman",
    name: "Omani Rial",
    code: "OMR",
    symbol: "RO / ر.ع.",
    rate: 0.1027,
    decimals: 3
  },
  {
    country: "Qatar",
    name: "Qatari Riyal",
    code: "QAR",
    symbol: "QR / ر.ق.",
    rate: 0.9709,
    decimals: 2
  },
  {
    country: "United Arab Emirates",
    name: "UAE Dirham",
    code: "AED",
    symbol: "AED / د.إ",
    rate: 0.9804,
    decimals: 2
  }
];

export interface CurrencyContextType {
  activeCurrency: CurrencyConfig;
  setActiveCurrencyCode: (code: string) => void;
  convert: (amountInSAR: number) => number;
  format: (amountInSAR: number) => string;
  formatRaw: (amountInCurrency: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCurrency, setActiveCurrency] = useState<CurrencyConfig>(() => {
    const saved = localStorage.getItem('system_currency_code');
    if (saved) {
      const match = SUPPORTED_CURRENCIES.find(c => c.code === saved);
      if (match) return match;
    }
    return SUPPORTED_CURRENCIES[0]; // Default to SAR
  });

  const setActiveCurrencyCode = (code: string) => {
    const match = SUPPORTED_CURRENCIES.find(c => c.code === code);
    if (match) {
      setActiveCurrency(match);
      localStorage.setItem('system_currency_code', code);
    }
  };

  const convert = (amountInSAR: number): number => {
    return amountInSAR * activeCurrency.rate;
  };

  const formatRaw = (amountInCurrency: number): string => {
    const formattedVal = amountInCurrency.toLocaleString(undefined, {
      minimumFractionDigits: activeCurrency.decimals,
      maximumFractionDigits: activeCurrency.decimals
    });
    return `${activeCurrency.symbol} ${formattedVal}`;
  };

  const format = (amountInSAR: number): string => {
    const converted = convert(amountInSAR);
    return formatRaw(converted);
  };

  return (
    <CurrencyContext.Provider value={{ activeCurrency, setActiveCurrencyCode, convert, format, formatRaw }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
