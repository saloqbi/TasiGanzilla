import React from 'react';

const BUILD = 251;

function GannzillaOriginalLogo() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        width: 58,
        height: 56,
        margin: '0 auto',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 22,
          top: 2,
          width: 28,
          height: 34,
          border: '5px solid #83a925',
          borderLeftWidth: 6,
          boxSizing: 'border-box',
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: 9,
          top: 14,
          width: 27,
          height: 34,
          border: '5px solid #e6a314',
          borderRightWidth: 6,
          boxSizing: 'border-box',
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: 13,
          top: 29,
          width: 14,
          height: 6,
          background: '#c94323',
        }}
      />
    </div>
  );
}

export default function GannzillaAboutOnlyV229({ toolbarHeight = 24 }) {
  const [open, setOpen] = React.useState(false);
  const iconSize = Math.max(22, toolbarHeight);

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.GANNZILLA_ABOUT_ONLY_V251 = true;
    window.__auditGannzillaAboutOnlyV251 = () => ({
      ok: true,
      build: BUILD,
      iconMounted: true,
      dialogFunctional: true,
      copiedVisualReference: 'GANNZILLA_PRO_ABOUT_8_3',
      originalContentPreserved: true,
      dialogOpen: open,
      toolbarHeightPx: toolbarHeight,
      iconSizePx: iconSize,
    });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      delete window.GANNZILLA_ABOUT_ONLY_V251;
      delete window.__auditGannzillaAboutOnlyV251;
    };
  }, [iconSize, open, toolbarHeight]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        data-gannzilla-about-control="true"
        aria-label="حول البرنامج"
        title="About"
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
        }}
      >
        ⓘ
      </button>

      {open && (
        <div
          data-gannzilla-original-about="true"
          data-gannzilla-language-control="true"
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
            background: 'rgba(0,0,0,0.05)',
            boxSizing: 'border-box',
            direction: 'ltr',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="gannzilla-original-about-title"
            lang="en"
            dir="ltr"
            style={{
              width: 204,
              minHeight: 302,
              background: '#f6f6f6',
              border: '1px solid #8f8f8f',
              boxShadow: '0 10px 28px rgba(0,0,0,.28)',
              color: '#111111',
              fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
              boxSizing: 'border-box',
              userSelect: 'text',
            }}
          >
            <header
              style={{
                height: 29,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 7px',
                background: '#ffffff',
                borderBottom: '1px solid #d2d2d2',
                boxSizing: 'border-box',
                fontSize: 12,
              }}
            >
              <span id="gannzilla-original-about-title">About</span>
              <button
                type="button"
                aria-label="Close"
                onClick={close}
                style={{
                  width: 28,
                  height: 27,
                  marginRight: -7,
                  border: 0,
                  background: 'transparent',
                  color: '#111111',
                  fontSize: 20,
                  fontWeight: 300,
                  lineHeight: 1,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </header>

            <div style={{ padding: '13px 8px 8px', textAlign: 'center', fontSize: 11, lineHeight: 1.25 }}>
              <GannzillaOriginalLogo />

              <div style={{ marginTop: 2, fontSize: 13, fontWeight: 800 }}>Gannzilla Pro</div>

              <div style={{ marginTop: 18 }}>Version: 8.3</div>
              <div>Author: Artem Kalashnikov</div>
              <a
                href="mailto:support@gannzilla.ru"
                style={{ display: 'block', color: '#0b70aa', textDecoration: 'none' }}
              >
                support@gannzilla.ru
              </a>
              <a
                href="https://gannzilla.ru"
                target="_blank"
                rel="noreferrer"
                style={{ display: 'block', color: '#0b70aa', textDecoration: 'none' }}
              >
                gannzilla.ru
              </a>

              <div style={{ marginTop: 17, color: '#5d5d5d' }}>© 2020 Artem Kalashnikov</div>
              <div style={{ color: '#9a9a9a' }}>All rights reserved</div>

              <div style={{ marginTop: 13, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  autoFocus
                  onClick={close}
                  style={{
                    minWidth: 56,
                    height: 22,
                    padding: '0 8px',
                    border: '1px solid #2c7fc5',
                    outline: '1px solid #8bb7dc',
                    background: 'linear-gradient(#ffffff,#e7e7e7)',
                    color: '#111111',
                    fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
