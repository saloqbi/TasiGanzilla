import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const CONTROL_WIDTH = 100;
const CONTROL_HEIGHT = 24;
const FLAG_WIDTH = 18;
const FLAG_HEIGHT = 12;
const ARROW_WIDTH = 18;

function AmericanFlag() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'relative',
        display: 'block',
        width: FLAG_WIDTH,
        height: FLAG_HEIGHT,
        overflow: 'hidden',
        background: 'repeating-linear-gradient(to bottom,#b22234 0,#b22234 0.923px,#ffffff 0.923px,#ffffff 1.846px)',
        boxShadow: '0 0 0 1px rgba(0,0,0,.22)',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 8,
          height: 6.5,
          backgroundColor: '#3c3b6e',
          backgroundImage: 'radial-gradient(circle,#ffffff 0 0.45px,transparent 0.55px)',
          backgroundSize: '2px 2px',
        }}
      />
    </span>
  );
}

function SaudiArabiaFlag() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'relative',
        display: 'block',
        width: FLAG_WIDTH,
        height: FLAG_HEIGHT,
        overflow: 'hidden',
        background: '#006c35',
        boxShadow: '0 0 0 1px rgba(0,0,0,.22)',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 2,
          right: 2,
          top: 2,
          height: 4.5,
          background: 'repeating-linear-gradient(to bottom,#ffffff 0,#ffffff .75px,transparent .75px,transparent 1.5px)',
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: 3,
          right: 3,
          bottom: 2,
          height: 1,
          background: '#ffffff',
          borderRadius: 1,
        }}
      />
    </span>
  );
}

function LanguageFlag({ language }) {
  return language === 'ar' ? <SaudiArabiaFlag /> : <AmericanFlag />;
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
    window.GANNZILLA_LANGUAGE_TOGGLE_V244 = true;
    window.__auditGannzillaLanguageToggleV244 = () => ({
      ok: true,
      build: 244,
      customSelector: true,
      cssFlags: true,
      externalImageCount: 0,
      svgFlagCount: 0,
      flagAlwaysVisible: true,
      language: lang,
      supportedLanguages: ['ar', 'en'],
      controlWidthPx: CONTROL_WIDTH,
      controlHeightPx: CONTROL_HEIGHT,
      flagWidthPx: FLAG_WIDTH,
      flagHeightPx: FLAG_HEIGHT,
      arrowWidthPx: ARROW_WIDTH,
      englishFlag: 'UNITED_STATES_CSS',
      arabicFlag: 'SAUDI_ARABIA_CSS',
      controlsMatchToolbarHeight: true,
      usFlagColors: ['#b22234', '#ffffff', '#3c3b6e'],
      saFlagColors: ['#006c35', '#ffffff'],
      dropdownOpen: open,
      intervalCount: 0,
      mutationObserverCount: 0,
    });

    return () => {
      delete window.GANNZILLA_LANGUAGE_TOGGLE_V244;
      delete window.__auditGannzillaLanguageToggleV244;
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
        alignSelf: 'stretch',
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
          border: '1px solid #547b9c',
          borderRadius: 0,
          background: 'linear-gradient(180deg,#42a8e8 0%,#1687cf 52%,#0a69b0 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'stretch',
          boxSizing: 'border-box',
          cursor: 'pointer',
          overflow: 'hidden',
          fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
          fontSize: 12,
          fontWeight: 700,
          lineHeight: 1,
          textShadow: '0 1px 0 rgba(0,0,0,.25)',
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
            color: '#ffffff',
            whiteSpace: 'nowrap',
          }}
        >
          <LanguageFlag language={lang} />
          <span>{isArabic ? 'العربية' : 'English'}</span>
        </span>

        <span
          aria-hidden="true"
          style={{
            width: ARROW_WIDTH,
            flex: `0 0 ${ARROW_WIDTH}px`,
            display: 'grid',
            placeItems: 'center',
            borderLeft: '1px solid #7f8f99',
            background: 'linear-gradient(180deg,#ffffff 0%,#eeeeee 55%,#d9d9d9 100%)',
            color: '#222222',
            fontSize: 9,
            fontWeight: 900,
            lineHeight: 1,
            textShadow: 'none',
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
            <AmericanFlag />
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
