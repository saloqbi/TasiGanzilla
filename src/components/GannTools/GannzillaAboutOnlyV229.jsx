import React from 'react';
import BRAND_IMAGE from './gannzillaBrandImageV159';

const GOLD = '#d79a18';
const GOLD_LIGHT = '#ffd86a';

export default function GannzillaAboutOnlyV229() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.GANNZILLA_ABOUT_ONLY_V230 = true;
    window.__auditGannzillaAboutOnlyV230 = () => ({
      ok: true,
      build: 230,
      singleReactOwner: true,
      intervalCount: 0,
      mutationObserverCount: 0,
      iconSizePx: 32,
      dialogOpen: open,
    });
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      delete window.GANNZILLA_ABOUT_ONLY_V230;
      delete window.__auditGannzillaAboutOnlyV230;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="حول البرنامج"
        title="حول البرنامج"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          top: 6,
          right: 6,
          zIndex: 120,
          width: 32,
          height: 32,
          minWidth: 32,
          minHeight: 32,
          padding: 0,
          display: 'grid',
          placeItems: 'center',
          border: '1px solid #527da8',
          borderRadius: 4,
          background: 'linear-gradient(180deg, #63a6e8 0%, #1765b3 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.42), 0 1px 3px rgba(0,0,0,.28)',
          color: '#fff',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 23,
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
            aria-labelledby="gannzilla-about-title-v230"
            dir="rtl"
            style={{
              width: 'min(280px, calc(100vw - 20px))',
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
              <span id="gannzilla-about-title-v230">حول البرنامج</span>
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

            <div style={{ padding: '16px 14px 12px', textAlign: 'center' }}>
              <img
                src={BRAND_IMAGE}
                alt="شعار كوكبة تاسي GOLD"
                draggable="false"
                style={{
                  display: 'block',
                  width: '220px',
                  maxWidth: '100%',
                  height: '220px',
                  objectFit: 'contain',
                  margin: '0 auto 15px',
                  borderRadius: 10,
                  boxShadow: '0 0 18px rgba(244,184,32,.30)',
                }}
              />

              <div style={{ color: GOLD_LIGHT, fontSize: 19, fontWeight: 900, marginBottom: 16 }}>
                كوكبة الأرقام السحرية
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.75 }}>الإصدار: 1</div>
              <div style={{ fontSize: 12, lineHeight: 1.75 }}>المؤلف: محمود سمان</div>
              <a
                href="mailto:m.a.m.1392@gmail.com"
                style={{ color: GOLD_LIGHT, fontSize: 12, lineHeight: 1.75, textDecoration: 'none' }}
              >
                m.a.m.1392@gmail.com
              </a>
              <div style={{ marginTop: 18, fontSize: 11, lineHeight: 1.7 }}>© 2026 كوكبة تاسي</div>
              <div style={{ fontSize: 11, lineHeight: 1.7 }}>جميع الحقوق محفوظة</div>

              <div style={{ marginTop: 16, textAlign: 'left' }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    minWidth: 54,
                    height: 26,
                    border: `1px solid ${GOLD}`,
                    background: 'linear-gradient(#251a05,#080808)',
                    color: GOLD_LIGHT,
                    fontFamily: 'Tahoma, Arial, sans-serif',
                    fontSize: 12,
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
