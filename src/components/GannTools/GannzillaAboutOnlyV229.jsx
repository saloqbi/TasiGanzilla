import React from 'react';
import { createPortal } from 'react-dom';
import logoPart0 from './gannzillaBrandImageV247Part0';
import logoPart1 from './gannzillaBrandImageV247Part1';
import logoPart2 from './gannzillaBrandImageV247Part2';

const BUILD = 374;
const LOGO_SRC = `data:image/webp;base64,${logoPart0}${logoPart1}${logoPart2}`;

export default function GannzillaAboutOnlyV229({ toolbarHeight = 24 }) {
  const [open, setOpen] = React.useState(false);
  const [logoLoaded, setLogoLoaded] = React.useState(false);
  const [logoFailed, setLogoFailed] = React.useState(false);
  const iconSize = Math.max(22, toolbarHeight);

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.GANNZILLA_ABOUT_ONLY_V374 = true;
    window.__auditGannzillaAboutOnlyV374 = () => ({
      ok: true,
      build: BUILD,
      iconMounted: Boolean(document.querySelector('[data-gannzilla-about-control="true"]')),
      dialogFunctional: true,
      dialogOpen: open,
      bodyPortal: true,
      approvedKawkabatTasiLogoMounted: true,
      oldGannzillaLogoRemoved: true,
      largeLogoWidthPx: 580,
      responsiveDialog: true,
      toolbarHeightPx: toolbarHeight,
      iconSizePx: iconSize,
    });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      delete window.GANNZILLA_ABOUT_ONLY_V374;
      delete window.__auditGannzillaAboutOnlyV374;
    };
  }, [iconSize, open, toolbarHeight]);

  const close = () => setOpen(false);

  const dialog = open && typeof document !== 'undefined'
    ? createPortal(
      <div
        data-gannzilla-kawkabat-tasi-about="true"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2147483647,
          display: 'grid',
          placeItems: 'center',
          padding: 12,
          background: 'rgba(0,0,0,.72)',
          boxSizing: 'border-box',
          direction: 'rtl',
          pointerEvents: 'auto',
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="kawkabat-tasi-about-title"
          lang="ar"
          dir="rtl"
          style={{
            width: 'min(660px, calc(100vw - 24px))',
            maxHeight: 'calc(100vh - 24px)',
            overflow: 'auto',
            background: 'linear-gradient(180deg,#080808 0%,#010101 100%)',
            border: '2px solid #d79a18',
            boxShadow: '0 0 34px rgba(235,164,18,.42)',
            color: '#f4c75c',
            fontFamily: 'Tahoma, Arial, sans-serif',
            boxSizing: 'border-box',
            userSelect: 'text',
          }}
        >
          <header
            style={{
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              background: '#050505',
              borderBottom: '1px solid #9d690e',
              boxSizing: 'border-box',
              color: '#ffd86a',
              fontSize: 17,
              fontWeight: 800,
              position: 'sticky',
              top: 0,
              zIndex: 2,
            }}
          >
            <span id="kawkabat-tasi-about-title">حول البرنامج</span>
            <button
              type="button"
              aria-label="إغلاق"
              onClick={close}
              style={{
                width: 30,
                height: 30,
                border: 0,
                background: 'transparent',
                color: '#ffd86a',
                fontSize: 24,
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </header>

          <div style={{ padding: '16px 20px 14px', textAlign: 'center' }}>
            {!logoLoaded && !logoFailed && (
              <div style={{ padding: '48px 0', fontSize: 18, fontWeight: 800 }}>جاري تحميل الشعار...</div>
            )}

            {logoFailed && (
              <div style={{ padding: '48px 0', color: '#ff8f8f', fontSize: 18, fontWeight: 800 }}>تعذر تحميل الشعار</div>
            )}

            <img
              src={LOGO_SRC}
              alt="شعار كوكبة تاسي GOLD"
              onLoad={() => {
                setLogoLoaded(true);
                setLogoFailed(false);
              }}
              onError={() => {
                setLogoLoaded(false);
                setLogoFailed(true);
              }}
              style={{
                display: logoLoaded ? 'block' : 'none',
                width: 'min(580px, 100%)',
                maxHeight: '62vh',
                height: 'auto',
                objectFit: 'contain',
                margin: '0 auto 22px',
                borderRadius: 14,
                boxShadow: '0 0 28px rgba(244,184,32,.38)',
                background: '#020202',
              }}
            />

            <div style={{ color: '#ffd86a', fontSize: 'clamp(25px, 4vw, 34px)', lineHeight: 1.35, fontWeight: 900, marginBottom: 16 }}>
              كوكبة الأرقام السحرية
            </div>
            <div style={{ fontSize: 18, lineHeight: 1.75, fontWeight: 800 }}>الإصدار: 1</div>
            <div style={{ fontSize: 18, lineHeight: 1.75, fontWeight: 800 }}>المؤلف: محمود سمان</div>
            <a
              href="mailto:m.a.m.1392@gmail.com"
              style={{ color: '#ffd86a', fontSize: 18, lineHeight: 1.75, fontWeight: 900, textDecoration: 'none' }}
            >
              m.a.m.1392@gmail.com
            </a>
            <div style={{ marginTop: 20, fontSize: 16, lineHeight: 1.7, fontWeight: 800 }}>© 2026 كوكبة تاسي</div>
            <div style={{ fontSize: 16, lineHeight: 1.7, fontWeight: 800 }}>جميع الحقوق محفوظة</div>

            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-start' }}>
              <button
                type="button"
                autoFocus
                onClick={close}
                style={{
                  minWidth: 70,
                  height: 32,
                  padding: '0 12px',
                  border: '1px solid #d79a18',
                  background: 'linear-gradient(#251a05,#080808)',
                  color: '#ffd86a',
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
      </div>,
      document.body,
    )
    : null;

  return (
    <>
      <button
        type="button"
        data-gannzilla-about-control="true"
        aria-label="حول البرنامج"
        title="حول البرنامج"
        onClick={() => setOpen(true)}
        style={{
          width: iconSize,
          height: iconSize,
          minWidth: iconSize,
          minHeight: iconSize,
          padding: 0,
          margin: 0,
          display: 'grid',
          placeItems: 'center',
          border: 0,
          borderLeft: '1px solid #c9c9c9',
          background: 'transparent',
          color: '#2469b2',
          fontFamily: 'Segoe UI Symbol, Arial Unicode MS, Arial, sans-serif',
          fontSize: 17,
          fontWeight: 900,
          lineHeight: 1,
          cursor: 'pointer',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 2147483647,
        }}
      >
        ⓘ
      </button>
      {dialog}
    </>
  );
}
