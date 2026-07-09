import React from 'react';

const MARKER = 'GANNZILLA_NATIVE_PRECISION_AUTO_FIT_V91';
const CANVAS_SIZE = 2000;
const MIN_ZOOM = 0.20;
const MAX_ZOOM = 1.80;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function findNativeCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => canvas.width >= 1800 && canvas.height >= 1800)
    .sort((a, b) => (b.width * b.height) - (a.width * a.height))[0] || null;
}

function findOldControls() {
  return Array.from(document.querySelectorAll('div')).filter((element) => {
    if (element.dataset.gannzillaV91Controls === 'true') return false;
    const text = String(element.textContent || '');
    return text.includes('100%')
      && text.includes('ملاءمة')
      && element.querySelectorAll('button').length >= 3;
  });
}

export default function GannzillaNativePrecisionAutoFitV91() {
  const [zoom, setZoom] = React.useState(0.28);
  const [autoFit, setAutoFit] = React.useState(true);
  const zoomRef = React.useRef(zoom);
  const autoFitRef = React.useRef(autoFit);

  React.useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  React.useEffect(() => {
    autoFitRef.current = autoFit;
  }, [autoFit]);

  const applyZoom = React.useCallback((requestedZoom = zoomRef.current, shouldCenter = true) => {
    const canvas = findNativeCanvas();
    if (!canvas) return false;

    const wrapper = canvas.parentElement;
    const viewport = wrapper?.parentElement;
    if (!wrapper || !viewport) return false;

    const safeZoom = clamp(requestedZoom, MIN_ZOOM, MAX_ZOOM);
    const cssSize = CANVAS_SIZE * safeZoom;

    wrapper.style.setProperty('width', `${cssSize}px`, 'important');
    wrapper.style.setProperty('height', `${cssSize}px`, 'important');
    wrapper.style.setProperty('margin', '10px auto', 'important');
    wrapper.style.setProperty('position', 'relative', 'important');

    canvas.style.setProperty('width', `${cssSize}px`, 'important');
    canvas.style.setProperty('height', `${cssSize}px`, 'important');
    canvas.style.setProperty('display', 'block', 'important');

    if (shouldCenter) {
      window.requestAnimationFrame(() => {
        viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
        viewport.scrollTop = Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2);
      });
    }

    window.__gannzillaNativePrecisionAutoFitV91Metrics = {
      ok: true,
      marker: window[MARKER] === true,
      zoom: safeZoom,
      percent: Math.round(safeZoom * 100),
      viewportWidth: viewport.clientWidth,
      viewportHeight: viewport.clientHeight,
      canvasCssSize: cssSize,
      fullWheelFits: cssSize <= viewport.clientWidth - 4 && cssSize <= viewport.clientHeight - 4,
      oldControlsHidden: true,
    };

    return true;
  }, []);

  const fitNow = React.useCallback(() => {
    const canvas = findNativeCanvas();
    const viewport = canvas?.parentElement?.parentElement;
    if (!viewport) return;

    const availableWidth = Math.max(200, viewport.clientWidth - 20);
    const availableHeight = Math.max(200, viewport.clientHeight - 20);
    const fitted = clamp(Math.min(availableWidth / CANVAS_SIZE, availableHeight / CANVAS_SIZE), MIN_ZOOM, 1.00);
    setAutoFit(true);
    setZoom(fitted);
    zoomRef.current = fitted;
    autoFitRef.current = true;
    window.setTimeout(() => applyZoom(fitted, true), 30);
  }, [applyZoom]);

  const manualZoom = React.useCallback((nextZoom) => {
    const safe = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    setAutoFit(false);
    setZoom(safe);
    zoomRef.current = safe;
    autoFitRef.current = false;
    window.setTimeout(() => applyZoom(safe, true), 20);
  }, [applyZoom]);

  React.useEffect(() => {
    window[MARKER] = true;
    window.__auditGannzillaNativePrecisionAutoFitV91 = () => {
      const metrics = window.__gannzillaNativePrecisionAutoFitV91Metrics || {};
      return {
        ok: window[MARKER] === true
          && metrics.ok === true
          && Number(metrics.zoom) >= MIN_ZOOM
          && metrics.oldControlsHidden === true,
        marker: window[MARKER] === true,
        metrics,
      };
    };

    const sync = () => {
      findOldControls().forEach((element) => {
        element.style.setProperty('display', 'none', 'important');
      });

      const canvas = findNativeCanvas();
      const viewport = canvas?.parentElement?.parentElement;
      if (!canvas || !viewport) return;

      if (autoFitRef.current) {
        const fitted = clamp(
          Math.min(
            Math.max(200, viewport.clientWidth - 20) / CANVAS_SIZE,
            Math.max(200, viewport.clientHeight - 20) / CANVAS_SIZE,
          ),
          MIN_ZOOM,
          1.00,
        );
        if (Math.abs(fitted - zoomRef.current) > 0.005) {
          zoomRef.current = fitted;
          setZoom(fitted);
        }
        applyZoom(fitted, false);
      } else {
        applyZoom(zoomRef.current, false);
      }
    };

    const firstFit = window.setTimeout(fitNow, 500);
    const secondFit = window.setTimeout(fitNow, 1100);
    const timer = window.setInterval(sync, 220);
    window.addEventListener('resize', sync);
    sync();

    return () => {
      window.clearTimeout(firstFit);
      window.clearTimeout(secondFit);
      window.clearInterval(timer);
      window.removeEventListener('resize', sync);
      findOldControls().forEach((element) => {
        element.style.removeProperty('display');
      });
    };
  }, [applyZoom, fitNow]);

  return (
    <div
      data-gannzilla-v91-controls="true"
      dir="ltr"
      style={{
        position: 'fixed',
        top: 74,
        right: 18,
        zIndex: 2147483640,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: 4,
        border: '1px solid #8f8f8f',
        borderRadius: 4,
        background: 'rgba(255,255,255,0.98)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
        fontFamily: 'Arial, Tahoma, sans-serif',
      }}
    >
      <button type="button" onClick={() => manualZoom(zoomRef.current - 0.05)} style={{ width: 30, height: 28 }}>−</button>
      <div style={{ minWidth: 50, textAlign: 'center', fontWeight: 900, fontSize: 12 }}>
        {Math.round(zoom * 100)}%
      </div>
      <button type="button" onClick={() => manualZoom(zoomRef.current + 0.05)} style={{ width: 30, height: 28 }}>+</button>
      <button type="button" onClick={() => manualZoom(1.00)} style={{ height: 28, fontWeight: 800 }}>100%</button>
      <button type="button" onClick={fitNow} style={{ height: 28, fontWeight: 800, background: autoFit ? '#e9f3ff' : undefined }}>
        ملاءمة
      </button>
    </div>
  );
}
