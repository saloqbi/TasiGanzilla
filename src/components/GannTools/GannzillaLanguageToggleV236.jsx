import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const CONTROL_WIDTH = 112;

export default function GannzillaLanguageToggleV236({ toolbarHeight = 38 }) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  const controlHeight = Math.max(22, toolbarHeight - 8);
  const isArabic = lang === 'ar';

  React.useEffect(() => {
    if (!open) return undefined;

    const closeOnOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutside);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  React.useEffect(() => {
    window.GANNZILLA_LANGUAGE_TOGGLE_V236 = true;
    window.__auditGannzillaLanguageToggleV236 = () => ({
      ok: true,
      build: 236,
      singleReactOwner: true,
      language: lang,
      supportedLanguages: ['ar', 'en'],
      arabicFlag: 'SAUDI_ARABIA',
      englishFlag: 'UNITED_KINGDOM',
      controlHeightPx: controlHeight,
      controlWidthPx: CONTROL_WIDTH,
      dropdownOpen: open,
      intervalCount: 0,
      mutationObserverCount: 0,
    });

    return () => {
      delete window.GANNZILLA_LANGUAGE_TOGGLE_V236;
      delete window.__auditGannzillaLanguageToggleV236;
    };
  }, [controlHeight, lang, open]);

  const chooseLanguage = (nextLang) => {
    setLang(nextLang);
    setOpen(false);
  };

  const optionStyle = (active) => ({
    width: '100%',
    minHeight: 32,
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    border: 0,
    background: active ? '#176fc0' : '#f6f6f6',
    color: active ? '#ffffff' : '#202020',
    fontFamily: 'Tahoma, Arial, sans-serif',
    fontSize: 13,
    fontWeight: active ? 800 : 700,
    cursor: 'pointer',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  });

  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative',
        flex: '0 0 auto',
        width: CONTROL_WIDTH,
        height: controlHeight,
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={isArabic ? 'اختيار اللغة' : 'Choose language'}
        title={isArabic ? 'اختيار اللغة' : 'Choose language'}
        onClick={() => setOpen((value) => !value)}
        style={{
          width: CONTROL_WIDTH,
          height: controlHeight,
          minWidth: CONTROL_WIDTH,
          padding: '0 6px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxSizing: 'border-box',
          border: '1px solid #4f7398',
          borderRadius: 2,
          background: 'linear-gradient(180deg, #3295e5 0%, #1470bd 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.28), 0 1px 2px rgba(0,0,0,.18)',
          color: '#ffffff',
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: 13,
          lineHeight: 1,
          fontWeight: 800,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 22,
            height: 18,
            display: 'grid',
            placeItems: 'center',
            flex: '0 0 auto',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,.72)',
            borderRadius: 1,
            background: '#ffffff',
            fontSize: 17,
            lineHeight: 1,
          }}
        >
          {isArabic ? '🇸🇦' : '🇬🇧'}
        </span>
        <span style={{ flex: '1 1 auto', textAlign: 'left', whiteSpace: 'nowrap' }}>
          {isArabic ? 'العربية' : 'English'}
        </span>
        <span aria-hidden="true" style={{ fontSize: 10, lineHeight: 1 }}>▼</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={isArabic ? 'اللغات' : 'Languages'}
          style={{
            position: 'absolute',
            top: controlHeight + 3,
            left: 0,
            zIndex: 1200,
            width: CONTROL_WIDTH,
            overflow: 'hidden',
            border: '1px solid #6c6c6c',
            borderRadius: 2,
            background: '#f6f6f6',
            boxShadow: '0 4px 12px rgba(0,0,0,.28)',
          }}
        >
          <button type="button" role="menuitem" onClick={() => chooseLanguage('en')} style={optionStyle(lang === 'en')}>
            <span aria-hidden="true" style={{ fontSize: 17 }}>🇬🇧</span>
            <span>English</span>
          </button>
          <button type="button" role="menuitem" onClick={() => chooseLanguage('ar')} style={optionStyle(lang === 'ar')}>
            <span aria-hidden="true" style={{ fontSize: 17 }}>🇸🇦</span>
            <span>العربية</span>
          </button>
        </div>
      )}
    </div>
  );
}
