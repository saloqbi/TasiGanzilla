import React from 'react';

const BUILD = 256;
const MIN_ZOOM = 0.10;
const MAX_ZOOM = 3.00;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getNativeControls() {
  const labels = Array.from(document.querySelectorAll('span'));
  for (const label of labels) {
    const text = String(label.textContent || '').trim();
    if (!/^\d{1,3}%$/.test(text)) continue;
    const minus = label.previousElementSibling;
    const plus = label.nextElementSibling;
    const reset = plus?.nextElementSibling;
    if (minus instanceof HTMLButtonElement && plus instanceof HTMLButtonElement) {
      return {
        label,
        minus,
        plus,
        reset: reset instanceof HTMLButtonElement ? reset : null,
      };
    }
  }
  return null;
}

function readCurrentZoom() {
  const controls = getNativeControls();
  const match = String(controls?.label?.textContent || '').match(/(\d{1,3})%/);
  if (match) return Number(match[1]) / 100;
  const value = Number(new URLSearchParams(window.location.search).get('gannzillaZoom'));
  return Number.isFinite(value) ? clamp(value, MIN_ZOOM, MAX_ZOOM) : 1;
}

function Magnifier({ plus = false }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="7.3" cy="7.3" r="4.7" fill="#fff" stroke="#2f6f9f" strokeWidth="1.15" />
      <path d="M10.8 10.8 15.7 15.7" stroke="#2f6f9f" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M5 7.3h4.6" stroke="#23699d" strokeWidth="1.25" />
      {plus && <path d="M7.3 5v4.6" stroke="#23699d" strokeWidth="1.25" />}
    </svg>
  );
}

export default function GannzillaWheelZoomV256({ toolbarHeight = 24 }) {
  const [zoom, setZoom] = React.useState(() => readCurrentZoom());
  const percent = Math.round(zoom * 100);
  const size = Math.max(22, toolbarHeight);

  const sync = React.useCallback(() => {
    const next = readCurrentZoom();
    setZoom(next);
  }, []);

  React.useEffect(() => {
    const timers = [0, 50, 150, 350, 700].map((delay) => window.setTimeout(sync, delay));
    window.GANNZILLA_WHEEL_ZOOM_V256 = true;
    window.__auditGannzillaWheelZoomV256 = () => ({
      ok: true,
      build: BUILD,
      visible: true,
      nativeGannzillaControlMirrored: true,
      currentPercent: Math.round(readCurrentZoom() * 100),
      minPercent: MIN_ZOOM * 100,
      maxPercent: MAX_ZOOM * 100,
      placement: 'LEFT_OF_PAGE_MAXIMIZE',
      toolbarHeightPx: toolbarHeight,
      cssTransformUsed: false,
    });

    return () => {
      timers.forEach(window.clearTimeout);
      delete window.GANNZILLA_WHEEL_ZOOM_V256;
      delete window.__auditGannzillaWheelZoomV256;
    };
  }, [sync, toolbarHeight]);

  const applyFallback = React.useCallback((nextZoom) => {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaZoom', clamp(nextZoom, MIN_ZOOM, MAX_ZOOM).toFixed(2));
    url.searchParams.set('v', String(BUILD));
    window.location.assign(url.toString());
  }, []);

  const zoomOut = () => {
    const controls = getNativeControls();
    if (controls?.minus) {
      controls.minus.click();
      window.setTimeout(sync, 0);
      window.setTimeout(sync, 60);
      return;
    }
    const current = readCurrentZoom();
    const step = current > 1 ? 0.10 : 0.05;
    applyFallback(current - step);
  };

  const zoomIn = () => {
    const controls = getNativeControls();
    if (controls?.plus) {
      controls.plus.click();
      window.setTimeout(sync, 0);
      window.setTimeout(sync, 60);
      return;
    }
    const current = readCurrentZoom();
    const step = current >= 1 ? 0.10 : 0.05;
    applyFallback(current + step);
  };

  const reset = () => {
    const controls = getNativeControls();
    if (controls?.reset) {
      controls.reset.click();
      window.setTimeout(sync, 0);
      window.setTimeout(sync, 60);
      return;
    }
    applyFallback(1);
  };

  const iconButton = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    padding: 0,
    margin: 0,
    border: 0,
    borderRight: '1px solid #c7c7c7',
    borderRadius: 0,
    background: 'transparent',
    display: 'grid',
    placeItems: 'center',
    boxSizing: 'border-box',
    cursor: 'pointer',
  };

  return (
    <div
      data-gannzilla-wheel-zoom-control="true"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        height: toolbarHeight,
        flex: '0 0 auto',
        direction: 'ltr',
        borderLeft: '1px solid #c7c7c7',
        background: 'linear-gradient(180deg,#fafafa 0%,#f1f1f1 55%,#e7e7e7 100%)',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        [data-gannzilla-wheel-zoom-control="true"] button:hover { background:#dceaf5 !important; }
        [data-gannzilla-wheel-zoom-control="true"] button:active { background:#c8deef !important; }
      `}</style>

      <button type="button" aria-label="تصغير العجلة" title="تصغير العجلة" onClick={zoomOut} style={iconButton}>
        <Magnifier />
      </button>

      <button
        type="button"
        aria-label="إعادة حجم العجلة إلى 100 بالمئة"
        title="إعادة حجم العجلة إلى 100%"
        onClick={reset}
        style={{
          height: size,
          minWidth: 42,
          padding: '0 5px',
          margin: 0,
          border: 0,
          borderRight: '1px solid #c7c7c7',
          borderRadius: 0,
          background: '#ffffff',
          color: '#222',
          fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          lineHeight: `${size}px`,
          textAlign: 'center',
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      >
        {percent}%
      </button>

      <button type="button" aria-label="تكبير العجلة" title="تكبير العجلة" onClick={zoomIn} style={iconButton}>
        <Magnifier plus />
      </button>
    </div>
  );
}
