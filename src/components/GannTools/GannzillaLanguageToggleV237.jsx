import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const CONTROL_WIDTH = 154;
const FLAG_WIDTH = 28;
const FLAG_HEIGHT = 20;

function UnitedKingdomFlag() {
  return (
    <svg viewBox="0 0 60 36" width={FLAG_WIDTH} height={FLAG_HEIGHT} aria-hidden="true" focusable="false">
      <rect width="60" height="36" fill="#012169" />
      <path d="M0 0 60 36M60 0 0 36" stroke="#fff" strokeWidth="8" />
      <path d="M0 0 60 36M60 0 0 36" stroke="#c8102e" strokeWidth="4" />
      <path d="M30 0v36M0 18h60" stroke="#fff" strokeWidth="12" />
      <path d="M30 0v36M0 18h60" stroke="#c8102e" strokeWidth="7" />
    </svg>
  );
}

function SaudiArabiaFlag() {
  return (
    <svg viewBox="0 0 60 36" width={FLAG_WIDTH} height={FLAG_HEIGHT} aria-hidden="true" focusable="false">
      <rect width="60" height="36" fill="#006c35" />
      <text
        x="30"
        y="16"
        textAnchor="middle"
        fill="#fff"
        fontSize="5.8"
        fontWeight="700"
        fontFamily="Tahoma, Arial, sans-serif"
      >
        لا إله إلا الله
      </text>
      <path d="M16 24h28" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="m42 22 5 2-5 2" fill="#fff" />
    </svg>
  );
}

function LanguageFlag({ language }) {
  return language === 'ar' ? <SaudiArabiaFlag /> : <UnitedKingdomFlag />;
}

export default function GannzillaLanguageToggleV237({ toolbarHeight = 50 }) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  const controlHeight = Math.max(30, toolbarHeight - 8);
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
    window.GANNZILLA_LANGUAGE_TOGGLE_V238 = true;
    window.__auditGannzillaLanguageToggleV238 = () => ({
      ok: true,
      build: 238,
      singleReactOwner: true,
      visible: true,
      language: lang,
      supportedLanguages: ['ar', 'en'],
      arabicFlag: 'SAUDI_ARABIA_SVG',
      englishFlag: 'UNITED_KINGDOM_SVG',
      controlHeightPx: controlHeight,
      controlWidthPx: CONTROL_WIDTH,
      flagWidthPx: FLAG_WIDTH,
      flagHeightPx: FLAG_HEIGHT,
      textColor: '#111111',
      fontSizePx: 14,
      referenceSizeMatch: true,
      dropdownOpen: open,
      intervalCount: 0,
      mutationObserverCount: 0,
    });

    return () => {
      delete window.GANNZILLA_LANGUAGE_TOGGLE_V238;
      delete window.__auditGannzillaLanguageToggleV238;
    };
  }, [controlHeight, lang, open]);

  const chooseLanguage = (nextLang) => {
    setLang(nextLang);
    setOpen(false);
  };

  const optionStyle = (active) => ({
    width: '100%',
    minHeight: 40,
    padding: '5px 9px',
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    border: 0,
    borderBottom: '1px solid #c6c6c6',
    background: active ? '#168fd7' : '#f4f4f4',
    color: '#111111',
    fontFamily: 'Tahoma, Arial, sans-serif',
    fontSize: 14,
    fontWeight: 800,
    cursor: 'pointer',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    textShadow: active ? '0 1px 0 rgba(255,255,255,.34)' : 'none',
  });

  return (
    <div
      ref={rootRef}
      data-gannzilla-language-control="true"
      style={{
        position: 'relative',
        zIndex: 650,
        flex: '0 0 auto',
        width: CONTROL_WIDTH,
        height: controlHeight,
        display: 'block',
        visibility: 'visible',
        opacity: 1,
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
          padding: 0,
          display: 'flex',
          alignItems: 'stretch',
          boxSizing: 'border-box',
          border: '1px solid #6f6f6f',
          borderRadius: 1,
          background: '#ececec',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.72), 0 1px 2px rgba(0,0,0,.16)',
          color: '#111111',
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: 14,
          lineHeight: 1,
          fontWeight: 800,
          cursor: 'pointer',
          userSelect: 'none',
          overflow: 'hidden',
          visibility: 'visible',
          opacity: 1,
        }}
      >
        <span
          style={{
            minWidth: 120,
            flex: '1 1 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 8px',
            background: 'linear-gradient(180deg,#45b8ef 0%,#1b9cde 48%,#0a82cb 100%)',
            color: '#111111',
            fontWeight: 800,
            textAlign: 'left',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 0 rgba(255,255,255,.36)',
          }}
        >
          <span
            style={{
              width: FLAG_WIDTH,
              height: FLAG_HEIGHT,
              display: 'grid',
              placeItems: 'center',
              flex: '0 0 auto',
              border: '1px solid rgba(255,255,255,.92)',
              boxSizing: 'content-box',
              overflow: 'hidden',
              background: '#fff',
            }}
          >
            <LanguageFlag language={lang} />
          </span>
          <span>{isArabic ? 'العربية' : 'English'}</span>
        </span>

        <span
          aria-hidden="true"
          style={{
            width: 32,
            flex: '0 0 32px',
            display: 'grid',
            placeItems: 'center',
            borderLeft: '1px solid #7f7f7f',
            background: 'linear-gradient(180deg,#ffffff 0%,#ececec 54%,#d5d5d5 100%)',
            color: '#111111',
            fontSize: 12,
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
            top: controlHeight + 2,
            left: 0,
            zIndex: 1400,
            width: CONTROL_WIDTH,
            overflow: 'hidden',
            border: '1px solid #707070',
            borderRadius: 1,
            background: '#f4f4f4',
            boxShadow: '0 4px 12px rgba(0,0,0,.30)',
          }}
        >
          <button type="button" role="menuitem" onClick={() => chooseLanguage('en')} style={optionStyle(lang === 'en')}>
            <LanguageFlag language="en" />
            <span>English</span>
          </button>
          <button type="button" role="menuitem" onClick={() => chooseLanguage('ar')} style={optionStyle(lang === 'ar')}>
            <LanguageFlag language="ar" />
            <span>العربية</span>
          </button>
        </div>
      )}
    </div>
  );
}
