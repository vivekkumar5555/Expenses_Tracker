import { createContext, useContext, useState, useEffect } from 'react';

const LanguageCurrencyContext = createContext();

export const useLanguageCurrency = () => {
  const context = useContext(LanguageCurrencyContext);
  if (!context) {
    throw new Error('useLanguageCurrency must be used within LanguageCurrencyProvider');
  }
  return context;
};

// Available languages
export const languages = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文' },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語' },
};

// Available currencies
export const currencies = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', position: 'before' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', position: 'before' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', position: 'before' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', position: 'before' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', position: 'before' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', position: 'before' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', position: 'before' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', position: 'before' },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', position: 'before' },
};

export const LanguageCurrencyProvider = ({ children }) => {
  // Initialize from localStorage or defaults
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('app_language');
    return saved && languages[saved] ? saved : 'en';
  });

  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('app_currency');
    return saved && currencies[saved] ? saved : 'USD';
  });

  // Save to localStorage whenever language or currency changes
  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('app_currency', currency);
  }, [currency]);

  // Format currency amount
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0.00';
    }

    const currencyInfo = currencies[currency];
    const formattedAmount = parseFloat(amount).toFixed(2);
    
    if (currencyInfo.position === 'before') {
      return `${currencyInfo.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount} ${currencyInfo.symbol}`;
    }
  };

  // Format currency without symbol (for calculations)
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0.00';
    }
    return parseFloat(amount).toFixed(2);
  };

  const value = {
    language,
    setLanguage,
    currency,
    setCurrency,
    formatCurrency,
    formatAmount,
    languages,
    currencies,
    currentLanguage: languages[language],
    currentCurrency: currencies[currency],
  };

  return (
    <LanguageCurrencyContext.Provider value={value}>
      {children}
    </LanguageCurrencyContext.Provider>
  );
};

