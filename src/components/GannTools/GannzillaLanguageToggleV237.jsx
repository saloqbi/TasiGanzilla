import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const CONTROL_WIDTH = 100;
const CONTROL_HEIGHT = 24;

/**
 * Build 240: copied from the original Gannzilla toolbar language control
 * in GannzillaExactToolbarV97.
 */
export default function GannzillaLanguageToggleV237() {
  const { lang, setLang } = useLanguage();
  const isArabic = lang === 'ar';

  const toggleLanguage = () => {
    setLang(isArabic ? 'en' : 'ar');
  };

  React.useEffect(() => {
    window.GANNZILLA_LANGUAGE_TOGGLE_V240 = true;
    window.__auditGannzillaLanguageToggleV240 = () => ({
      ok: true,
      build: 240,
      copiedFrom: 'GannzillaExactToolbarV97',
      language: lang,
      supportedLanguages: ['ar', 'en'],
      controlWidthPx: CONTROL_WIDTH,
      controlHeightPx: CONTROL_HEIGHT,
      fontSizePx: 13,
      fontWeight: 700,
      textColor: '#111111',
      directToggle: true,
      originalMarkup: isArabic ? '🇸🇦 العربية ▾' : '🇬🇧 English ▾',
      intervalCount: 0,
      mutationObserverCount: 0,
    });

    return () => {
      delete window.GANNZILLA_LANGUAGE_TOGGLE_V240;
      delete window.__auditGannzillaLanguageToggleV240;
    };
  }, [isArabic, lang]);

  return (
    <button
      type="button"
      data-gannzilla-language-control="true"
      onClick={toggleLanguage}
      title={isArabic ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'}
      aria-label={isArabic ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'}
      style={{
        height: CONTROL_HEIGHT,
        minWidth: CONTROL_WIDTH,
        padding: '0 7px',
        border: 0,
        borderRadius: 0,
        background: 'transparent',
        color: '#111111',
        fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
        fontWeight: 700,
        fontSize: 13,
        lineHeight: 1,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        boxSizing: 'border-box',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1 }}>
        {isArabic ? '🇸🇦' : '🇬🇧'}
      </span>
      <span>{isArabic ? 'العربية' : 'English'}</span>
      <span aria-hidden="true" style={{ fontSize: 10, lineHeight: 1 }}>▾</span>
    </button>
  );
}
