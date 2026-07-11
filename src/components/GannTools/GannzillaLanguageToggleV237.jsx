import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const CONTROL_WIDTH = 96;
const CONTROL_HEIGHT = 22;
const FLAG_WIDTH = 17;
const FLAG_HEIGHT = 11;

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

/**
 * Build 241: native Gannzilla language selector copied from the original
 * flag + select control pattern used by GannzillaLanguageSwitch.
 */
export default function GannzillaLanguageToggleV237() {
  const { lang, setLang } = useLanguage();
  const isArabic = lang === 'ar';

  React.useEffect(() => {
    window.GANNZILLA_LANGUAGE_TOGGLE_V241 = true;
    window.__auditGannzillaLanguageToggleV241 = () => ({
      ok: true,
      build: 241,
      copiedFrom: 'GannzillaLanguageSwitch',
      nativeSelect: true,
      language: lang,
      supportedLanguages: ['ar', 'en'],
      controlWidthPx: CONTROL_WIDTH,
      controlHeightPx: CONTROL_HEIGHT,
      flagWidthPx: FLAG_WIDTH,
      flagHeightPx: FLAG_HEIGHT,
      textColor: '#111111',
      fontSizePx: 12,
      intervalCount: 0,
      mutationObserverCount: 0,
    });

    return () => {
      delete window.GANNZILLA_LANGUAGE_TOGGLE_V241;
      delete window.__auditGannzillaLanguageToggleV241;
    };
  }, [lang]);

  return (
    <div
      data-gannzilla-language-control="true"
      style={{
        position: 'relative',
        width: CONTROL_WIDTH,
        height: CONTROL_HEIGHT,
        flex: `0 0 ${CONTROL_WIDTH}px`,
        direction: 'ltr',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 3,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          width: FLAG_WIDTH,
          height: FLAG_HEIGHT,
          display: 'grid',
          placeItems: 'center',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <LanguageFlag language={lang} />
      </span>

      <select
        value={lang}
        onChange={(event) => setLang(event.target.value)}
        aria-label={isArabic ? 'اختيار اللغة' : 'Choose language'}
        title={isArabic ? 'اختيار اللغة' : 'Choose language'}
        style={{
          width: CONTROL_WIDTH,
          height: CONTROL_HEIGHT,
          margin: 0,
          padding: '0 20px 0 23px',
          border: '1px solid #7f7f7f',
          borderRadius: 0,
          background: 'linear-gradient(180deg,#ffffff 0%,#f2f2f2 55%,#e3e3e3 100%)',
          color: '#111111',
          fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1,
          boxSizing: 'border-box',
          cursor: 'pointer',
          direction: 'ltr',
          textAlign: 'left',
          WebkitAppearance: 'menulist',
          appearance: 'auto',
        }}
      >
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  );
}
