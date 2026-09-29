import React, { createContext, useContext, useState, useCallback } from 'react';
import { en, type Translations } from './en';
import { hi } from './hi';

type Language = 'en' | 'hi';

interface I18nContextType {
  t: Translations;
  lang: Language;
  setLang: (lang: Language) => void;
}

const translations: Record<Language, Translations> = { en, hi };

const I18nContext = createContext<I18nContextType>({
  t: en,
  lang: 'en',
  setLang: () => {},
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('nonetpay-lang');
    return (saved === 'hi' ? 'hi' : 'en') as Language;
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('nonetpay-lang', newLang);
    document.documentElement.lang = newLang;
  }, []);

  return (
    <I18nContext.Provider value={{ t: translations[lang], lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
