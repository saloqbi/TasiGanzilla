import React, { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();
const LANGUAGE_KEY = 'tasi-gannzilla-language-v1';

function getRequestedLanguage() {
  try {
    const queryLanguage = new URLSearchParams(window.location.search).get('lang');
    if (queryLanguage === 'en') return 'en';
    if (queryLanguage === 'ar') return 'ar';
    return localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(getRequestedLanguage);

  const setLang = (nextLang) => {
    const safeLang = nextLang === 'en' ? 'en' : 'ar';
    setLangState(safeLang);
    try {
      localStorage.setItem(LANGUAGE_KEY, safeLang);
    } catch {
      // Ignore storage failures.
    }
  };

  useEffect(() => {
    const requestedLanguage = getRequestedLanguage();
    if (requestedLanguage !== lang) setLangState(requestedLanguage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body?.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    window.dispatchEvent(new CustomEvent('gannzilla:language-change', { detail: { lang } }));
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
