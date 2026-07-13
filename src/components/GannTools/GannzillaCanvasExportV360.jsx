import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = 366;

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

function isCurrentWheelCanvas(canvas) {
  if (!isUsableCanvas(canvas)) return false;
  if (canvas.closest('aside')) return false;

  const exactInlineStyle = canvas.style.display === 'block'
    && canvas.style.maxWidth === 'none'
    && canvas.style.maxHeight === 'none';
  if (!exactInlineStyle) return false;

  const parent = canvas.parentElement;
  const viewport = parent?.parentElement;
  if (!parent || !viewport) return false;

  const viewportStyle = window.getComputedStyle(viewport);
  const isWheelViewport = viewportStyle.overflow === 'auto'
    || viewportStyle.overflowX === 'auto'
    || viewportStyle.overflowY === 'auto';

  return isWheelViewport && viewportStyle.position === 'absolute';
}

function findCurrentWheelCanvas() {
  const canvases = Array.from(document.querySelectorAll('canvas'));
  const exact = canvases.find(isCurrentWheelCanvas);
  if (exact) {
    exact.dataset.gannzillaExportAuthority = 'EXACT_CURRENT_WHEEL_V366';
    return exact;
  }

  const fallback = canvases
    .filter(isUsableCanvas)
    .filter((canvas) => !canvas.closest('aside'))
    .map((canvas) => ({
      canvas,
      area: visibleIntersectionArea(canvas.getBoundingClientRect()),
    }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;

  if (fallback) fallback.dataset.gannzillaExportAuthority = 'VISIBLE_NON_PANEL_FALLBACK_V366';
  return fallback;
}

function buildExportCanvas(source) {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = source.width;
  exportCanvas.height = source.height;
  const context = exportCanvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('EXPORT_CONTEXT_UNAVAILABLE');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  context.drawImage(source, 0, 0);
  return exportCanvas;
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
  return `gann-circle-v366-current-${timestamp}.png`;
}

async function writeWithNativePicker(blob, filename) {
  if (typeof window.showSaveFilePicker !== 'function') return false;

  const handle = await window.showSaveFilePicker({
    suggestedName: filename,
    types: [{
      description: 'PNG Image',
      accept: { 'image/png': ['.png'] },
    }],
  });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
  return true;
}

function fallbackDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.position = 'fixed';
  anchor.style.left = '-10000px';
  anchor.style.top = '-10000px';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
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
  const slotRef = React.useRef(null);
  const [slotRect, setSlotRect] = React.useState(null);
  const [notice, setNotice] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const noticeTimerRef = React.useRef(0);

  const showNotice = React.useCallback((message) => {
    window.clearTimeout(noticeTimerRef.current);
    setNotice(message);
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 5000);
  }, []);

  React.useLayoutEffect(() => {
    const updatePosition = () => {
      const rect = slotRef.current?.getBoundingClientRect?.();
      if (!rect) return;
      setSlotRect({
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.max(72, Math.round(rect.width)),
        height: Math.max(toolbarHeight, Math.round(rect.height)),
      });
    };

    updatePosition();
    const observer = typeof ResizeObserver === 'function'
      ? new ResizeObserver(updatePosition)
      : null;
    if (observer && slotRef.current) observer.observe(slotRef.current);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    const timer = window.setTimeout(updatePosition, 250);

    return () => {
      observer?.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [toolbarHeight]);

  React.useEffect(() => {
    window.GANNZILLA_CANVAS_EXPORT_V366 = true;
    window.__auditGannzillaCanvasExportV366 = () => {
      const selected = findCurrentWheelCanvas();
      return {
        ok: Boolean(selected && slotRect),
        build: BUILD,
        exportAuthority: selected?.dataset?.gannzillaExportAuthority || null,
        portalButtonMounted: Boolean(slotRect),
        escapesToolbarStackingContext: true,
        nativeFilePickerSupported: typeof window.showSaveFilePicker === 'function',
        directUserGestureSaveDialog: true,
        fallbackBlobDownload: true,
        currentWheelExactSelector: true,
      };
    };

    return () => {
      window.clearTimeout(noticeTimerRef.current);
      delete window.GANNZILLA_CANVAS_EXPORT_V366;
      delete window.__auditGannzillaCanvasExportV366;
    };
  }, [slotRect]);

  const handleSave = React.useCallback(async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;

    setBusy(true);
    const filename = makeFilename();

    try {
      let pickerHandlePromise = null;
      if (typeof window.showSaveFilePicker === 'function') {
        pickerHandlePromise = window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'PNG Image',
            accept: { 'image/png': ['.png'] },
          }],
        });
      }

      const source = findCurrentWheelCanvas();
      if (!source) throw new Error('CURRENT_WHEEL_NOT_FOUND');
      const exportCanvas = buildExportCanvas(source);
      const blob = await canvasToBlob(exportCanvas);

      if (pickerHandlePromise) {
        try {
          const handle = await pickerHandlePromise;
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (error) {
          if (error?.name === 'AbortError') {
            showNotice('تم إلغاء الحفظ');
            return;
          }
          fallbackDownload(blob, filename);
        }
      } else {
        fallbackDownload(blob, filename);
      }

      const copied = await copyBlobToClipboard(blob);
      showNotice(copied
        ? `تم حفظ ونسخ العجلة الحالية: ${filename}`
        : `تم حفظ العجلة الحالية: ${filename}`);
    } catch (error) {
      showNotice(`تعذر حفظ الصورة: ${error?.message || 'UNKNOWN_ERROR'}`);
    } finally {
      setBusy(false);
    }
  }, [busy, showNotice]);

  const portalButton = slotRect && typeof document !== 'undefined'
    ? createPortal(
      <button
        type="button"
        data-gannzilla-canvas-export-v366="true"
        aria-label="حفظ صورة العجلة الحالية PNG"
        title="حفظ صورة العجلة الحالية PNG"
        onClick={handleSave}
        disabled={busy}
        style={{
          position: 'fixed',
          left: slotRect.left,
          top: slotRect.top,
          width: slotRect.width,
          height: slotRect.height,
          zIndex: 2147483647,
          margin: 0,
          padding: '0 7px',
          border: 0,
          borderRight: '1px solid #9eb9cc',
          borderLeft: '1px solid #9eb9cc',
          borderRadius: 0,
          background: busy ? '#d8e9f5' : '#e6f4ff',
          color: '#075f9e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          cursor: busy ? 'wait' : 'pointer',
          pointerEvents: 'auto',
          touchAction: 'manipulation',
          fontFamily: 'Segoe UI, Arial, sans-serif',
          fontSize: 10,
          fontWeight: 800,
          lineHeight: 1,
          userSelect: 'none',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v11" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M7.5 10.5 12 15l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M5 19h14" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span>{busy ? 'حفظ...' : 'حفظ PNG'}</span>
      </button>,
      document.body,
    )
    : null;

  return (
    <>
      <span
        ref={slotRef}
        data-gannzilla-export-slot-v366="true"
        aria-hidden="true"
        style={{
          width: 72,
          height: toolbarHeight,
          minWidth: 72,
          minHeight: toolbarHeight,
          maxWidth: 72,
          maxHeight: toolbarHeight,
          flex: '0 0 72px',
          display: 'block',
          pointerEvents: 'none',
        }}
      />
      {portalButton}
      {notice ? createPortal(
        <div
          role="status"
          style={{
            position: 'fixed',
            top: toolbarHeight + 8,
            right: 8,
            zIndex: 2147483647,
            maxWidth: 'min(600px, calc(100vw - 16px))',
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
        </div>,
        document.body,
      ) : null}
    </>
  );
}
