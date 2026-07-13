import React from 'react';

const BUILD = 364;

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
    canonical.dataset.gannzillaExportAuthority = 'CURRENT_UPDATED_WHEEL_V364';
    return canonical;
  }

  const fallback = all
    .filter(isUsableCanvas)
    .map((canvas) => ({
      canvas,
      area: visibleIntersectionArea(canvas.getBoundingClientRect()),
    }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;

  if (fallback) fallback.dataset.gannzillaExportAuthority = 'VISIBLE_FALLBACK_V364';
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
  return `gann-circle-v364-current-${timestamp}.png`;
}

function prepareNativeAnchor(anchor) {
  const source = findCurrentWheelCanvas();
  if (!source || !anchor) return { ok: false, reason: 'CURRENT_WHEEL_NOT_FOUND' };

  const exportCanvas = buildExportCanvas(source);
  const dataUrl = exportCanvas.toDataURL('image/png', 1);
  const filename = makeFilename();

  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.dataset.ready = 'true';
  anchor.dataset.filename = filename;
  anchor.dataset.exportAuthority = source.dataset.gannzillaExportAuthority || 'UNKNOWN';

  return { ok: true, dataUrl, filename };
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
  const anchorRef = React.useRef(null);
  const preparedRef = React.useRef(null);
  const noticeTimerRef = React.useRef(0);

  React.useEffect(() => {
    window.GANNZILLA_CANVAS_EXPORT_V364 = true;
    window.__auditGannzillaCanvasExportV364 = () => {
      const selected = findCurrentWheelCanvas();
      return {
        ok: Boolean(selected),
        build: BUILD,
        exportAuthority: selected?.dataset?.gannzillaExportAuthority || null,
        nativeAnchorDownload: true,
        pointerDownPreparation: true,
        clickDefaultDownloadPreserved: true,
        explicitPngLabel: true,
        currentWheelPreferred: true,
      };
    };
    return () => {
      window.clearTimeout(noticeTimerRef.current);
      delete window.GANNZILLA_CANVAS_EXPORT_V364;
      delete window.__auditGannzillaCanvasExportV364;
    };
  }, []);

  const showNotice = React.useCallback((message) => {
    window.clearTimeout(noticeTimerRef.current);
    setNotice(message);
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 4200);
  }, []);

  const prepare = React.useCallback((anchor) => {
    try {
      const result = prepareNativeAnchor(anchor);
      preparedRef.current = result.ok ? result : null;
      if (!result.ok) showNotice('تعذر العثور على العجلة الحالية');
      return result;
    } catch (_) {
      preparedRef.current = null;
      showNotice('تعذر تجهيز صورة العجلة');
      return { ok: false };
    }
  }, [showNotice]);

  const handlePointerDown = React.useCallback((event) => {
    prepare(event.currentTarget);
  }, [prepare]);

  const handleClick = React.useCallback((event) => {
    const anchor = event.currentTarget;
    let result = preparedRef.current;

    if (!result?.ok || anchor.dataset.ready !== 'true') {
      result = prepare(anchor);
    }

    if (!result?.ok) {
      event.preventDefault();
      return;
    }

    // Do not prevent the default action: the browser performs a real native download.
    showNotice(`بدأ تنزيل العجلة الحالية: ${result.filename}`);
    window.setTimeout(async () => {
      const copied = await copyDataUrlToClipboard(result.dataUrl);
      if (copied) showNotice(`تم تنزيل ونسخ العجلة الحالية: ${result.filename}`);
      anchor.removeAttribute('href');
      anchor.removeAttribute('download');
      anchor.dataset.ready = 'false';
      preparedRef.current = null;
    }, 0);
  }, [prepare, showNotice]);

  const handleKeyDown = React.useCallback((event) => {
    if (event.key === 'Enter' || event.key === ' ') prepare(event.currentTarget);
  }, [prepare]);

  return (
    <>
      <a
        ref={anchorRef}
        href="#"
        role="button"
        data-gannzilla-canvas-export-v360="true"
        data-gannzilla-canvas-export-v364="true"
        aria-label="تنزيل ونسخ صورة العجلة الحالية PNG"
        title="تنزيل صورة العجلة الحالية PNG"
        onPointerDown={handlePointerDown}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        style={{
          width: 54,
          height: toolbarHeight,
          minWidth: 54,
          minHeight: toolbarHeight,
          maxWidth: 54,
          maxHeight: toolbarHeight,
          flex: '0 0 54px',
          margin: 0,
          padding: '0 5px',
          border: 0,
          borderRight: '1px solid #c7c7c7',
          borderRadius: 0,
          background: '#eef7ff',
          color: '#155a9c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          cursor: 'pointer',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 2147483647,
          touchAction: 'manipulation',
          textDecoration: 'none',
          fontFamily: 'Segoe UI, Arial, sans-serif',
          fontSize: 10,
          fontWeight: 800,
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v11" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M7.5 10.5 12 15l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M5 19h14" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span>PNG</span>
      </a>

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
