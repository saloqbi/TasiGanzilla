import React from 'react';

const BUILD = 365;

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
    canonical.dataset.gannzillaExportAuthority = 'CURRENT_UPDATED_WHEEL_V365';
    return canonical;
  }

  const fallback = all
    .filter(isUsableCanvas)
    .map((canvas) => ({
      canvas,
      area: visibleIntersectionArea(canvas.getBoundingClientRect()),
    }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;

  if (fallback) fallback.dataset.gannzillaExportAuthority = 'VISIBLE_FALLBACK_V365';
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

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('PNG_BLOB_UNAVAILABLE'));
    }, 'image/png', 1);
  });
}

function makeFilename() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `gann-circle-v365-current-${timestamp}.png`;
}

async function copyBlobToClipboard(blob) {
  if (!navigator.clipboard?.write || typeof window.ClipboardItem !== 'function') return false;
  try {
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
  const [prepared, setPrepared] = React.useState(null);
  const preparedRef = React.useRef(null);
  const preparingRef = React.useRef(false);
  const noticeTimerRef = React.useRef(0);
  const refreshTimerRef = React.useRef(0);

  const showNotice = React.useCallback((message) => {
    window.clearTimeout(noticeTimerRef.current);
    setNotice(message);
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 4200);
  }, []);

  const prepareDownload = React.useCallback(async (silent = false) => {
    if (preparingRef.current) return preparedRef.current;
    preparingRef.current = true;

    try {
      const source = findCurrentWheelCanvas();
      if (!source) {
        if (!silent) showNotice('تعذر العثور على العجلة الحالية');
        return null;
      }

      const exportCanvas = buildExportCanvas(source);
      const blob = await canvasToBlob(exportCanvas);
      const next = {
        blob,
        url: URL.createObjectURL(blob),
        filename: makeFilename(),
        authority: source.dataset.gannzillaExportAuthority || 'UNKNOWN',
        preparedAt: Date.now(),
      };

      const previous = preparedRef.current;
      preparedRef.current = next;
      setPrepared(next);
      if (previous?.url) window.setTimeout(() => URL.revokeObjectURL(previous.url), 1500);
      return next;
    } catch (_) {
      if (!silent) showNotice('تعذر تجهيز صورة PNG للعجلة الحالية');
      return null;
    } finally {
      preparingRef.current = false;
    }
  }, [showNotice]);

  React.useEffect(() => {
    window.GANNZILLA_CANVAS_EXPORT_V365 = true;
    window.__auditGannzillaCanvasExportV365 = () => ({
      ok: Boolean(preparedRef.current?.url),
      build: BUILD,
      downloadReady: Boolean(preparedRef.current?.url),
      exportAuthority: preparedRef.current?.authority || null,
      nativeBlobAnchor: true,
      hrefPreparedBeforeClick: true,
      filename: preparedRef.current?.filename || null,
      currentWheelPreferred: true,
    });

    const schedule = (delay) => window.setTimeout(() => prepareDownload(true), delay);
    const timers = [schedule(0), schedule(350), schedule(1200)];

    const refreshAfterChange = () => {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = window.setTimeout(() => prepareDownload(true), 180);
    };

    window.addEventListener('resize', refreshAfterChange);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', refreshAfterChange);
    window.addEventListener('gannzilla:canonical-property-change-v326', refreshAfterChange);
    document.addEventListener('change', refreshAfterChange, true);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(refreshTimerRef.current);
      window.clearTimeout(noticeTimerRef.current);
      window.removeEventListener('resize', refreshAfterChange);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', refreshAfterChange);
      window.removeEventListener('gannzilla:canonical-property-change-v326', refreshAfterChange);
      document.removeEventListener('change', refreshAfterChange, true);
      if (preparedRef.current?.url) URL.revokeObjectURL(preparedRef.current.url);
      delete window.GANNZILLA_CANVAS_EXPORT_V365;
      delete window.__auditGannzillaCanvasExportV365;
    };
  }, [prepareDownload]);

  const handlePointerEnter = React.useCallback(() => {
    const current = preparedRef.current;
    if (!current || Date.now() - current.preparedAt > 3000) prepareDownload(true);
  }, [prepareDownload]);

  const handleClick = React.useCallback((event) => {
    const current = preparedRef.current;
    if (!current?.url) {
      event.preventDefault();
      showNotice('جاري تجهيز الصورة، اضغط زر PNG مرة أخرى بعد لحظة');
      prepareDownload(false);
      return;
    }

    showNotice(`بدأ تنزيل العجلة الحالية: ${current.filename}`);
    window.setTimeout(async () => {
      const copied = await copyBlobToClipboard(current.blob);
      if (copied) showNotice(`تم تنزيل ونسخ العجلة الحالية: ${current.filename}`);
      prepareDownload(true);
    }, 0);
  }, [prepareDownload, showNotice]);

  return (
    <>
      <a
        href={prepared?.url || undefined}
        download={prepared?.filename || undefined}
        role="button"
        data-gannzilla-canvas-export-v360="true"
        data-gannzilla-canvas-export-v365="true"
        aria-label="تنزيل ونسخ صورة العجلة الحالية PNG"
        title={prepared ? 'تنزيل صورة العجلة الحالية PNG' : 'جاري تجهيز صورة PNG'}
        onPointerEnter={handlePointerEnter}
        onFocus={handlePointerEnter}
        onClick={handleClick}
        style={{
          width: 62,
          height: toolbarHeight,
          minWidth: 62,
          minHeight: toolbarHeight,
          maxWidth: 62,
          maxHeight: toolbarHeight,
          flex: '0 0 62px',
          margin: 0,
          padding: '0 5px',
          border: 0,
          borderRight: '1px solid #c7c7c7',
          borderRadius: 0,
          background: prepared ? '#e6f4ff' : '#fff4d6',
          color: prepared ? '#0b5f9e' : '#7a5a00',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          cursor: prepared ? 'pointer' : 'wait',
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
        <span>{prepared ? 'PNG' : 'تجهيز'}</span>
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
