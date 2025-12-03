import { useLanguageCurrency } from '../contexts/LanguageCurrencyContext';
import enTranslations from '../locales/en.json';
import hiTranslations from '../locales/hi.json';

const translations = {
  en: enTranslations,
  hi: hiTranslations,
};

export const useTranslation = () => {
  const { language } = useLanguageCurrency();

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language] || translations.en;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to English if translation not found
        value = translations.en;
        for (const fallbackKey of keys) {
          value = value?.[fallbackKey];
        }
        break;
      }
    }

    // Replace parameters in translation string
    if (typeof value === 'string' && params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return value || key;
  };

  return { t, language };
};

