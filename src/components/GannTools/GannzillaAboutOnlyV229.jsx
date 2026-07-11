import React from 'react';
import BRAND_IMAGE from './gannzillaBrandImageV159';

const GOLD = '#d79a18';
const GOLD_LIGHT = '#ffd86a';

export default function GannzillaAboutOnlyV229({ toolbarHeight = 38 }) {
  const [open, setOpen] = React.useState(false);
  const iconSize = Math.max(22, toolbarHeight - 8);
  const iconFontSize = Math.max(16, Math.round(iconSize * 0.72));

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.GANNZILLA_ABOUT_ONLY_V231 = true;
    window.__auditGannzillaAboutOnlyV231 = () => ({
      ok: true,
      build: 231,
      singleReactOwner: true,
      intervalCount: 0,
      mutationObserverCount: 0,
      toolbarHeightPx: toolbarHeight,
      iconSizePx: iconSize,
      iconGovernedByToolbar: true,
      logoWidthPx: 440,
      logoScale: 2,
      dialogOpen: open,
    });
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      delete window.GANNZILLA_ABOUT_ONLY_V231;
      delete window.__auditGannzillaAboutOnlyV231;
    };
  }, [iconSize, open, toolbarHeight]);

  return (
    <>
      <button
        type="button"
        aria-label="حول البرنامج"
        title="حول البرنامج"
        onClick={() => setOpen(true)}
        style={{
          position: 'static',
          flex: '0 0 auto',
          width: iconSize,
          height: iconSize,
          minWidth: iconSize,
          minHeight: iconSize,
          padding: 0,
          display: 'grid',
          placeItems: 'center',
          boxSizing: 'border-box',
          border: '1px solid #527da8',
          borderRadius: 3,
          background: 'linear-gradient(180deg, #63a6e8 0%, #1765b3 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.42), 0 1px 2px rgba(0,0,0,.24)',
          color: '#fff',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: iconFontSize,
          lineHeight: 1,
          fontWeight: 900,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        i
      </button>

      {open && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'grid',
            placeItems: 'center',
            padding: 10,
            background: 'rgba(0,0,0,.58)',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="gannzilla-about-title-v231"
            dir="rtl"
            style={{
              width: 'min(500px, calc(100vw - 20px))',
              maxHeight: 'calc(100vh - 20px)',
              overflow: 'auto',
              background: 'linear-gradient(180deg,#090909 0%,#020202 100%)',
              border: `1px solid ${GOLD}`,
              boxShadow: '0 0 28px rgba(235,164,18,.35)',
              color: '#f2c454',
              fontFamily: 'Tahoma, Arial, sans-serif',
            }}
          >
            <header
              style={{
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 10px',
                borderBottom: '1px solid #9d690e',
                color: GOLD_LIGHT,
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              <span id="gannzilla-about-title-v231">حول البرنامج</span>
              <button
                type="button"
                aria-label="إغلاق"
                onClick={() => setOpen(false)}
                style={{
                  width: 24,
                  height: 24,
                  border: 0,
                  background: 'transparent',
                  color: GOLD_LIGHT,
                  fontSize: 20,
                  lineHeight: 1,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </header>

            <div style={{ padding: '16px 18px 14px', textAlign: 'center' }}>
              <img
                src={BRAND_IMAGE}
                alt="شعار كوكبة تاسي GOLD"
                draggable="false"
                style={{
                  display: 'block',
                  width: '440px',
                  maxWidth: '100%',
                  height: 'auto',
                  aspectRatio: '1 / 1',
                  objectFit: 'contain',
                  margin: '0 auto 18px',
                  borderRadius: 14,
                  boxShadow: '0 0 24px rgba(244,184,32,.34)',
                }}
              />

              <div style={{ color: GOLD_LIGHT, fontSize: 22, fontWeight: 900, marginBottom: 16 }}>
                كوكبة الأرقام السحرية
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.75 }}>الإصدار: 1</div>
              <div style={{ fontSize: 13, lineHeight: 1.75 }}>المؤلف: محمود سمان</div>
              <a
                href="mailto:m.a.m.1392@gmail.com"
                style={{ color: GOLD_LIGHT, fontSize: 13, lineHeight: 1.75, textDecoration: 'none' }}
              >
                m.a.m.1392@gmail.com
              </a>
              <div style={{ marginTop: 18, fontSize: 12, lineHeight: 1.7 }}>© 2026 كوكبة تاسي</div>
              <div style={{ fontSize: 12, lineHeight: 1.7 }}>جميع الحقوق محفوظة</div>

              <div style={{ marginTop: 16, textAlign: 'left' }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    minWidth: 64,
                    height: 30,
                    border: `1px solid ${GOLD}`,
                    background: 'linear-gradient(#251a05,#080808)',
                    color: GOLD_LIGHT,
                    fontFamily: 'Tahoma, Arial, sans-serif',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
