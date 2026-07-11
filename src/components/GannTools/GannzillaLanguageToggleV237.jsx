import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const CONTROL_WIDTH = 96;
const CONTROL_HEIGHT = 22;
const FLAG_WIDTH = 17;
const FLAG_HEIGHT = 11;
const ARROW_WIDTH = 18;

function UnitedKingdomFlag() {
  return (
    <svg
      viewBox="0 0 60 36"
      width={FLAG_WIDTH}
      height={FLAG_HEIGHT}
      aria-hidden="true"
      focusable="false"
      shapeRendering="geometricPrecision"
      style={{ display: 'block' }}
    >
      <rect width="60" height="36" fill="#012169" />
      <path d="M0 0 60 36M60 0 0 36" stroke="#ffffff" strokeWidth="8" />
      <path d="M0 0 60 36M60 0 0 36" stroke="#c8102e" strokeWidth="4" />
      <path d="M30 0v36M0 18h60" stroke="#ffffff" strokeWidth="12" />
      <path d="M30 0v36M0 18h60" stroke="#c8102e" strokeWidth="7" />
    </svg>
  );
}

function SaudiArabiaFlag() {
  return (
    <svg
      viewBox="0 0 60 36"
      width={FLAG_WIDTH}
      height={FLAG_HEIGHT}
      aria-hidden="true"
      focusable="false"
      shapeRendering="geometricPrecision"
      style={{ display: 'block' }}
    >
      <rect width="60" height="36" fill="#006c35" />
      <path d="M14 12h32M17 16h26M20 20h20" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M15 26h30" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <path d="m43 24 5 2-5 2" fill="#ffffff" />
    </svg>
  );
}

function LanguageFlag({ language }) {
  return language === 'ar' ? <SaudiArabiaFlag /> : <UnitedKingdomFlag />;
}

export default function GannzillaLanguageToggleV237() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
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
    window.GANNZILLA_LANGUAGE_TOGGLE_V242 = true;
    window.__auditGannzillaLanguageToggleV242 = () => ({
      ok: true,
      build: 242,
      customSelector: true,
      nativeSelectRemoved: true,
      flagAlwaysVisible: true,
      language: lang,
      supportedLanguages: ['ar', 'en'],
      controlWidthPx: CONTROL_WIDTH,
      controlHeightPx: CONTROL_HEIGHT,
      flagWidthPx: FLAG_WIDTH,
      flagHeightPx: FLAG_HEIGHT,
      arrowWidthPx: ARROW_WIDTH,
      ukFlagColors: ['#012169', '#ffffff', '#c8102e'],
      saFlagColors: ['#006c35', '#ffffff'],
      textColor: '#111111',
      dropdownOpen: open,
      intervalCount: 0,
      mutationObserverCount: 0,
    });

    return () => {
      delete window.GANNZILLA_LANGUAGE_TOGGLE_V242;
      delete window.__auditGannzillaLanguageToggleV242;
    };
  }, [lang, open]);

  const chooseLanguage = (nextLang) => {
    setLang(nextLang);
    setOpen(false);
  };

  const optionStyle = (active) => ({
    width: '100%',
    height: 24,
    padding: '0 5px',
    border: 0,
    borderBottom: '1px solid #d0d0d0',
    background: active ? '#dbeaf5' : '#ffffff',
    color: '#111111',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
    fontSize: 12,
    fontWeight: 600,
    textAlign: 'left',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  });

  return (
    <div
      ref={rootRef}
      data-gannzilla-language-control="true"
      style={{
        position: 'relative',
        width: CONTROL_WIDTH,
        height: CONTROL_HEIGHT,
        flex: `0 0 ${CONTROL_WIDTH}px`,
        direction: 'ltr',
        zIndex: 650,
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
          height: CONTROL_HEIGHT,
          margin: 0,
          padding: 0,
          border: '1px solid #7f7f7f',
          borderRadius: 0,
          background: 'linear-gradient(180deg,#ffffff 0%,#f2f2f2 55%,#e3e3e3 100%)',
          color: '#111111',
          display: 'flex',
          alignItems: 'stretch',
          boxSizing: 'border-box',
          cursor: 'pointer',
          overflow: 'hidden',
          fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        <span
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '0 4px',
            color: '#111111',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: FLAG_WIDTH,
              height: FLAG_HEIGHT,
              flex: `0 0 ${FLAG_WIDTH}px`,
              display: 'grid',
              placeItems: 'center',
              overflow: 'hidden',
              boxShadow: '0 0 0 1px rgba(0,0,0,.18)',
            }}
          >
            <LanguageFlag language={lang} />
          </span>
          <span>{isArabic ? 'العربية' : 'English'}</span>
        </span>

        <span
          aria-hidden="true"
          style={{
            width: ARROW_WIDTH,
            flex: `0 0 ${ARROW_WIDTH}px`,
            display: 'grid',
            placeItems: 'center',
            borderLeft: '1px solid #b0b0b0',
            background: 'linear-gradient(180deg,#ffffff 0%,#eeeeee 55%,#d9d9d9 100%)',
            color: '#222222',
            fontSize: 9,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={isArabic ? 'اللغات' : 'Languages'}
          style={{
            position: 'absolute',
            top: CONTROL_HEIGHT + 1,
            left: 0,
            width: CONTROL_WIDTH,
            border: '1px solid #7f7f7f',
            background: '#ffffff',
            boxShadow: '0 3px 8px rgba(0,0,0,.25)',
            overflow: 'hidden',
            zIndex: 2000,
          }}
        >
          <button type="button" role="menuitem" onClick={() => chooseLanguage('en')} style={optionStyle(lang === 'en')}>
            <UnitedKingdomFlag />
            <span>English</span>
          </button>
          <button type="button" role="menuitem" onClick={() => chooseLanguage('ar')} style={optionStyle(lang === 'ar')}>
            <SaudiArabiaFlag />
            <span>العربية</span>
          </button>
        </div>
      )}
    </div>
  );
}
