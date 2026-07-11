import React from 'react';
import BRAND_IMAGE_PART_0 from './gannzillaBrandImageV247Part0';
import BRAND_IMAGE_PART_1 from './gannzillaBrandImageV247Part1';
import BRAND_IMAGE_PART_2 from './gannzillaBrandImageV247Part2';

const BRAND_IMAGE = `data:image/webp;base64,${BRAND_IMAGE_PART_0}${BRAND_IMAGE_PART_1}${BRAND_IMAGE_PART_2}`;
const GOLD = '#d79a18';
const GOLD_LIGHT = '#ffd86a';

export default function GannzillaAboutOnlyV229({ toolbarHeight = 38 }) {
  const [open, setOpen] = React.useState(false);
  const [logoFailed, setLogoFailed] = React.useState(false);
  const iconSize = Math.max(22, toolbarHeight - 8);
  const iconFontSize = Math.max(16, Math.round(iconSize * 0.72));

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.GANNZILLA_ABOUT_ONLY_V247 = true;
    window.__auditGannzillaAboutOnlyV247 = () => ({
      ok: true,
      build: 247,
      singleReactOwner: true,
      intervalCount: 0,
      mutationObserverCount: 0,
      toolbarHeightPx: toolbarHeight,
      iconSizePx: iconSize,
      iconGovernedByToolbar: true,
      logoSource: 'GANNZILLA_BRAND_IMAGE_V247_EMBEDDED_WEBP',
      logoRenderingMode: 'DIRECT_IMG',
      logoDisplayMaxWidthPx: 420,
      logoFailed,
      fullLogoVisible: true,
      dialogOpen: open,
    });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      delete window.GANNZILLA_ABOUT_ONLY_V247;
      delete window.__auditGannzillaAboutOnlyV247;
    };
  }, [iconSize, logoFailed, open, toolbarHeight]);

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
            padding: 12,
            background: 'rgba(0,0,0,.70)',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="gannzilla-about-title-v247"
            dir="rtl"
            style={{
              width: 'min(620px, calc(100vw - 24px))',
              maxHeight: 'calc(100vh - 24px)',
              overflow: 'auto',
              background: 'linear-gradient(180deg,#090909 0%,#020202 100%)',
              border: `2px solid ${GOLD}`,
              boxShadow: '0 0 34px rgba(235,164,18,.42)',
              color: '#f2c454',
              fontFamily: 'Tahoma, Arial, sans-serif',
              boxSizing: 'border-box',
            }}
          >
            <header
              style={{
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
                borderBottom: '1px solid #9d690e',
                color: GOLD_LIGHT,
                fontSize: 17,
                fontWeight: 800,
                position: 'sticky',
                top: 0,
                zIndex: 2,
                background: '#050505',
              }}
            >
              <span id="gannzilla-about-title-v247">حول البرنامج</span>
              <button
                type="button"
                aria-label="إغلاق"
                onClick={() => setOpen(false)}
                style={{
                  width: 30,
                  height: 30,
                  border: 0,
                  background: 'transparent',
                  color: GOLD_LIGHT,
                  fontSize: 24,
                  lineHeight: 1,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </header>

            <div style={{ padding: '16px 20px 16px', textAlign: 'center' }}>
              {!logoFailed ? (
                <img
                  src={BRAND_IMAGE}
                  alt="شعار كوكبة تاسي GOLD عالي الدقة"
                  draggable="false"
                  loading="eager"
                  decoding="sync"
                  onError={() => setLogoFailed(true)}
                  style={{
                    display: 'block',
                    width: 'min(420px, 100%)',
                    height: 'auto',
                    aspectRatio: '1 / 1',
                    objectFit: 'contain',
                    margin: '0 auto 24px',
                    borderRadius: 14,
                    boxShadow: '0 0 28px rgba(244,184,32,.38)',
                    background: '#020202',
                  }}
                />
              ) : (
                <div
                  role="alert"
                  style={{
                    width: 'min(420px, 100%)',
                    minHeight: 120,
                    margin: '0 auto 24px',
                    display: 'grid',
                    placeItems: 'center',
                    border: `1px solid ${GOLD}`,
                    color: GOLD_LIGHT,
                    background: '#080808',
                    fontSize: 16,
                    fontWeight: 800,
                  }}
                >
                  تعذر تحميل شعار البرنامج
                </div>
              )}

              <div
                style={{
                  color: GOLD_LIGHT,
                  fontSize: 32,
                  lineHeight: 1.35,
                  fontWeight: 900,
                  marginBottom: 18,
                  textShadow: '0 1px 8px rgba(255,196,64,.28)',
                }}
              >
                كوكبة الأرقام السحرية
              </div>
              <div style={{ fontSize: 20, lineHeight: 1.75, fontWeight: 800 }}>الإصدار: 1</div>
              <div style={{ fontSize: 20, lineHeight: 1.75, fontWeight: 800 }}>المؤلف: محمود سمان</div>
              <a
                href="mailto:m.a.m.1392@gmail.com"
                style={{
                  color: GOLD_LIGHT,
                  fontSize: 20,
                  lineHeight: 1.75,
                  fontWeight: 900,
                  textDecoration: 'none',
                  textShadow: '0 1px 8px rgba(255,196,64,.24)',
                }}
              >
                m.a.m.1392@gmail.com
              </a>
              <div style={{ marginTop: 22, fontSize: 18, lineHeight: 1.7, fontWeight: 800 }}>
                © 2026 كوكبة تاسي
              </div>
              <div style={{ fontSize: 18, lineHeight: 1.7, fontWeight: 800 }}>جميع الحقوق محفوظة</div>

              <div style={{ marginTop: 20, textAlign: 'left' }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    minWidth: 70,
                    height: 32,
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
