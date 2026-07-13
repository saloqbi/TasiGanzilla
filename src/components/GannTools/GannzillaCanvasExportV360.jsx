import React from 'react';

const BUILD = 363;

function visibleIntersectionArea(rect) {
  const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  const width = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0));
  const height = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
  return width * height;
}

function isUsableCanvas(canvas) {
  if (!canvas) return false;
  const rect = canvas.getBoundingClientRect();
  const style = window.getComputedStyle(canvas);
  return canvas.width > 0
    && canvas.height > 0
    && rect.width > 120
    && rect.height > 120
    && visibleIntersectionArea(rect) > 0
    && style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(style.opacity || 1) > 0;
}

function isCanonicalUpdatedWheelCanvas(canvas) {
  if (!isUsableCanvas(canvas)) return false;

  const inlineStyleMatch = canvas.style.display === 'block'
    && canvas.style.maxWidth === 'none'
    && canvas.style.maxHeight === 'none';
  if (!inlineStyleMatch) return false;

  let ancestor = canvas.parentElement;
  for (let depth = 0; ancestor && depth < 6; depth += 1, ancestor = ancestor.parentElement) {
    const style = window.getComputedStyle(ancestor);
    const scrollable = style.overflow === 'auto'
      || style.overflowX === 'auto'
      || style.overflowY === 'auto';
    if (scrollable && ['absolute', 'fixed', 'relative'].includes(style.position)) return true;
  }
  return false;
}

function findCurrentWheelCanvas() {
  const all = Array.from(document.querySelectorAll('canvas'));
  const canonical = all.find(isCanonicalUpdatedWheelCanvas);
  if (canonical) {
    canonical.dataset.gannzillaExportAuthority = 'CURRENT_UPDATED_WHEEL_V363';
    return canonical;
  }

  const fallback = all
    .filter(isUsableCanvas)
    .map((canvas) => ({
      canvas,
      area: visibleIntersectionArea(canvas.getBoundingClientRect()),
    }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;

  if (fallback) fallback.dataset.gannzillaExportAuthority = 'VISIBLE_FALLBACK_V363';
  return fallback;
}

function buildExportCanvas(source) {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('EXPORT_CONTEXT_UNAVAILABLE');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, 0, 0);
  return canvas;
}

function makeFilename() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `gann-circle-v363-current-${timestamp}.png`;
}

function downloadImmediately(canvas, filename) {
  const dataUrl = canvas.toDataURL('image/png', 1);
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.position = 'fixed';
  anchor.style.left = '-10000px';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  return dataUrl;
}

async function copyDataUrlToClipboard(dataUrl) {
  if (!navigator.clipboard?.write || typeof window.ClipboardItem !== 'function') return false;
  try {
    const blob = await (await fetch(dataUrl)).blob();
    await navigator.clipboard.write([
      new window.ClipboardItem({ 'image/png': blob }),
    ]);
    return true;
  } catch (_) {
    return false;
  }
}

export default function GannzillaCanvasExportV360({ toolbarHeight = 24 }) {
  const [notice, setNotice] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const noticeTimerRef = React.useRef(0);

  React.useEffect(() => {
    window.GANNZILLA_CANVAS_EXPORT_V363 = true;
    window.__auditGannzillaCanvasExportV363 = () => {
      const selected = findCurrentWheelCanvas();
      return {
        ok: Boolean(selected),
        build: BUILD,
        exportAuthority: selected?.dataset?.gannzillaExportAuthority || null,
        synchronousDownloadActivation: true,
        asyncDelayBeforeDownload: false,
        currentWheelPreferred: true,
        clipboardCopyAfterDownload: true,
      };
    };
    return () => {
      window.clearTimeout(noticeTimerRef.current);
      delete window.GANNZILLA_CANVAS_EXPORT_V363;
      delete window.__auditGannzillaCanvasExportV363;
    };
  }, []);

  const showNotice = React.useCallback((message) => {
    window.clearTimeout(noticeTimerRef.current);
    setNotice(message);
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 4200);
  }, []);

  const exportWheel = React.useCallback(async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (busy) return;

    const source = findCurrentWheelCanvas();
    if (!source) {
      showNotice('تعذر العثور على العجلة الحالية');
      return;
    }

    setBusy(true);
    try {
      const exportCanvas = buildExportCanvas(source);
      const filename = makeFilename();

      // Important: the download click occurs synchronously inside the user's click.
      const dataUrl = downloadImmediately(exportCanvas, filename);
      showNotice(`بدأ تنزيل العجلة الحالية: ${filename}`);

      const copied = await copyDataUrlToClipboard(dataUrl);
      if (copied) showNotice(`تم تنزيل ونسخ العجلة الحالية: ${filename}`);
    } catch (_) {
      showNotice('تعذر تنزيل صورة العجلة الحالية');
    } finally {
      setBusy(false);
    }
  }, [busy, showNotice]);

  return (
    <>
      <button
        type="button"
        data-gannzilla-canvas-export-v363="true"
        aria-label="تنزيل ونسخ صورة العجلة الحالية"
        title="تنزيل ونسخ العجلة الحالية PNG"
        onClick={exportWheel}
        disabled={busy}
        style={{
          width: toolbarHeight,
          height: toolbarHeight,
          minWidth: toolbarHeight,
          minHeight: toolbarHeight,
          maxWidth: toolbarHeight,
          maxHeight: toolbarHeight,
          flex: `0 0 ${toolbarHeight}px`,
          margin: 0,
          padding: 0,
          border: 0,
          borderRight: '1px solid #c7c7c7',
          borderRadius: 0,
          background: busy ? '#dceaf5' : 'transparent',
          color: '#2469b2',
          display: 'grid',
          placeItems: 'center',
          cursor: busy ? 'wait' : 'pointer',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 2147483647,
          touchAction: 'manipulation',
          opacity: busy ? 0.7 : 1,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v11" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M7.5 10.5 12 15l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M5 19h14" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {notice ? (
        <div
          role="status"
          style={{
            position: 'fixed',
            top: toolbarHeight + 8,
            right: 8,
            zIndex: 2147483647,
            maxWidth: 'min(560px, calc(100vw - 16px))',
            padding: '8px 12px',
            border: '1px solid #9fb5c7',
            borderRadius: 4,
            background: '#f4fbff',
            color: '#163a54',
            boxShadow: '0 3px 12px rgba(0,0,0,0.18)',
            fontFamily: 'Tahoma, Arial, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            direction: 'rtl',
          }}
        >
          {notice}
        </div>
      ) : null}
    </>
  );
}
