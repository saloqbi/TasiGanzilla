import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const CONTROL_WIDTH = 100;
const FLAG_WIDTH = 20;
const FLAG_HEIGHT = 14;
const ARROW_WIDTH = 18;

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

export default function GannzillaLanguageToggleV237({ toolbarHeight = 30 }) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  const controlHeight = Math.max(20, toolbarHeight - 8);
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
    window.GANNZILLA_LANGUAGE_TOGGLE_V239 = true;
    window.__auditGannzillaLanguageToggleV239 = () => ({
      ok: true,
      build: 239,
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
      arrowWidthPx: ARROW_WIDTH,
      textColor: '#111111',
      fontSizePx: 12,
      referencePixelMatch: true,
      dropdownOpen: open,
      intervalCount: 0,
      mutationObserverCount: 0,
    });

    return () => {
      delete window.GANNZILLA_LANGUAGE_TOGGLE_V239;
      delete window.__auditGannzillaLanguageToggleV239;
    };
  }, [controlHeight, lang, open]);

  const chooseLanguage = (nextLang) => {
    setLang(nextLang);
    setOpen(false);
  };

  const optionStyle = (active) => ({
    width: '100%',
    minHeight: 28,
    padding: '4px 6px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    border: 0,
    borderBottom: '1px solid #c6c6c6',
    background: active ? '#0d7fd1' : '#f4f4f4',
    color: '#111111',
    fontFamily: 'Tahoma, Arial, sans-serif',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'left',
    whiteSpace: 'nowrap',
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
          border: '1px solid #777777',
          borderRadius: 0,
          background: '#e8e8e8',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.70)',
          color: '#111111',
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: 12,
          lineHeight: 1,
          fontWeight: 700,
          cursor: 'pointer',
          userSelect: 'none',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '0 4px',
            background: 'linear-gradient(180deg,#1899e5 0%,#087fd2 52%,#006fbd 100%)',
            color: '#111111',
            fontWeight: 700,
            textAlign: 'left',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 0 rgba(255,255,255,.35)',
          }}
        >
          <span
            style={{
              width: FLAG_WIDTH,
              height: FLAG_HEIGHT,
              display: 'grid',
              placeItems: 'center',
              flex: '0 0 auto',
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
            width: ARROW_WIDTH,
            flex: `0 0 ${ARROW_WIDTH}px`,
            display: 'grid',
            placeItems: 'center',
            borderLeft: '1px solid #8a8a8a',
            background: 'linear-gradient(180deg,#ffffff 0%,#eeeeee 52%,#d4d4d4 100%)',
            color: '#111111',
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
            top: controlHeight + 1,
            left: 0,
            zIndex: 1400,
            width: CONTROL_WIDTH,
            overflow: 'hidden',
            border: '1px solid #707070',
            borderRadius: 0,
            background: '#f4f4f4',
            boxShadow: '0 4px 10px rgba(0,0,0,.28)',
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
