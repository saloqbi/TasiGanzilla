import React, { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();
const LANGUAGE_KEY = 'tasi-gannzilla-language-v1';

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem(LANGUAGE_KEY) || 'ar';
    } catch {
      return 'ar';
    }
  });

  const setLang = (nextLang) => {
    const safeLang = nextLang === 'en' ? 'en' : 'ar';
    setLangState(safeLang);
    try {
      localStorage.setItem(LANGUAGE_KEY, safeLang);
    } catch {
      // ignore storage failures
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    window.dispatchEvent(new CustomEvent('gannzilla:language-change', { detail: { lang } }));
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
