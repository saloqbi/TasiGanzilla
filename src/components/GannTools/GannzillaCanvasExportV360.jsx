import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = 367;

function visibleArea(rect) {
  const width = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
  const height = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
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
    && visibleArea(rect) > 0
    && style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(style.opacity || 1) > 0;
}

function isExactCurrentWheel(canvas) {
  if (!isUsableCanvas(canvas) || canvas.closest('aside')) return false;
  if (!(canvas.style.display === 'block' && canvas.style.maxWidth === 'none' && canvas.style.maxHeight === 'none')) return false;

  const viewport = canvas.parentElement?.parentElement;
  if (!viewport) return false;
  const style = window.getComputedStyle(viewport);
  const scrollable = style.overflow === 'auto' || style.overflowX === 'auto' || style.overflowY === 'auto';
  return scrollable && style.position === 'absolute';
}

function findCurrentWheelCanvas() {
  const canvases = Array.from(document.querySelectorAll('canvas'));
  const exact = canvases.find(isExactCurrentWheel);
  if (exact) {
    exact.dataset.gannzillaExportAuthority = 'EXACT_CURRENT_WHEEL_V367';
    return exact;
  }

  const fallback = canvases
    .filter(isUsableCanvas)
    .filter((canvas) => !canvas.closest('aside'))
    .map((canvas) => ({ canvas, area: visibleArea(canvas.getBoundingClientRect()) }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;

  if (fallback) fallback.dataset.gannzillaExportAuthority = 'VISIBLE_NON_PANEL_FALLBACK_V367';
  return fallback;
}

function makeFilename() {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `gann-circle-v367-current-${stamp}.png`;
}

function canvasToBlob(source) {
  return new Promise((resolve, reject) => {
    const output = document.createElement('canvas');
    output.width = source.width;
    output.height = source.height;
    const context = output.getContext('2d', { alpha: false });
    if (!context) {
      reject(new Error('EXPORT_CONTEXT_UNAVAILABLE'));
      return;
    }
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, output.width, output.height);
    context.drawImage(source, 0, 0);
    output.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('PNG_BLOB_UNAVAILABLE'));
    }, 'image/png', 1);
  });
}

function fallbackDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.position = 'fixed';
  anchor.style.left = '-10000px';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

async function copyBlob(blob) {
  if (!navigator.clipboard?.write || typeof window.ClipboardItem !== 'function') return false;
  try {
    await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch (_) {
    return false;
  }
}

export default function GannzillaCanvasExportV360({ toolbarHeight = 24 }) {
  const slotRef = React.useRef(null);
  const busyRef = React.useRef(false);
  const [slotRect, setSlotRect] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState('');
  const noticeTimerRef = React.useRef(0);

  const showNotice = React.useCallback((message) => {
    window.clearTimeout(noticeTimerRef.current);
    setNotice(message);
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 5000);
  }, []);

  React.useLayoutEffect(() => {
    const update = () => {
      const rect = slotRef.current?.getBoundingClientRect?.();
      if (!rect) return;
      setSlotRect({
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.max(82, Math.round(rect.width)),
        height: Math.max(toolbarHeight, Math.round(rect.height)),
      });
    };

    update();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null;
    if (observer && slotRef.current) observer.observe(slotRef.current);
    const timer = window.setTimeout(update, 250);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    return () => {
      observer?.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [toolbarHeight]);

  const saveCurrentWheel = React.useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);

    const filename = makeFilename();
    let pickerPromise = null;

    try {
      if (typeof window.showSaveFilePicker === 'function') {
        pickerPromise = window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }],
        });
      }

      const source = findCurrentWheelCanvas();
      if (!source) throw new Error('CURRENT_WHEEL_NOT_FOUND');
      const blob = await canvasToBlob(source);

      if (pickerPromise) {
        try {
          const handle = await pickerPromise;
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

      const copied = await copyBlob(blob);
      showNotice(copied
        ? `تم حفظ ونسخ العجلة الحالية: ${filename}`
        : `تم حفظ العجلة الحالية: ${filename}`);
    } catch (error) {
      showNotice(`تعذر حفظ الصورة: ${error?.message || 'UNKNOWN_ERROR'}`);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [showNotice]);

  React.useEffect(() => {
    if (!slotRect) return undefined;

    const captureClick = (event) => {
      const x = event.clientX;
      const y = event.clientY;
      const inside = x >= slotRect.left
        && x <= slotRect.left + slotRect.width
        && y >= slotRect.top
        && y <= slotRect.top + slotRect.height;

      const explicitTarget = event.target?.closest?.('[data-gannzilla-export-button-v367="true"]');
      if (!inside && !explicitTarget) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      saveCurrentWheel();
    };

    const shortcut = (event) => {
      if (event.ctrlKey && event.shiftKey && String(event.key).toLowerCase() === 's') {
        event.preventDefault();
        saveCurrentWheel();
      }
    };

    document.addEventListener('click', captureClick, true);
    window.addEventListener('keydown', shortcut, true);

    window.GANNZILLA_CANVAS_EXPORT_V367 = true;
    window.__auditGannzillaCanvasExportV367 = () => ({
      ok: Boolean(findCurrentWheelCanvas() && slotRect),
      build: BUILD,
      capturePhaseClickAuthority: true,
      overlayProofCoordinateHitTest: true,
      directUserGestureSaveDialog: true,
      keyboardFallback: 'CTRL_SHIFT_S',
      exportAuthority: findCurrentWheelCanvas()?.dataset?.gannzillaExportAuthority || null,
    });

    return () => {
      document.removeEventListener('click', captureClick, true);
      window.removeEventListener('keydown', shortcut, true);
      delete window.GANNZILLA_CANVAS_EXPORT_V367;
      delete window.__auditGannzillaCanvasExportV367;
    };
  }, [slotRect, saveCurrentWheel]);

  const button = slotRect && typeof document !== 'undefined'
    ? createPortal(
      <button
        type="button"
        data-gannzilla-export-button-v367="true"
        aria-label="حفظ صورة العجلة الحالية PNG"
        title="حفظ صورة العجلة الحالية PNG"
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
          borderLeft: '1px solid #9eb9cc',
          borderRight: '1px solid #9eb9cc',
          borderRadius: 0,
          background: busy ? '#d8e9f5' : '#dff2ff',
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
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95)',
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
        data-gannzilla-canvas-export-v360="true"
        data-gannzilla-export-slot-v367="true"
        aria-hidden="true"
        style={{
          width: 82,
          height: toolbarHeight,
          minWidth: 82,
          minHeight: toolbarHeight,
          maxWidth: 82,
          maxHeight: toolbarHeight,
          flex: '0 0 82px',
          display: 'block',
          pointerEvents: 'none',
        }}
      />
      {button}
      {notice && typeof document !== 'undefined' ? createPortal(
        <div
          role="status"
          style={{
            position: 'fixed',
            top: toolbarHeight + 8,
            right: 8,
            zIndex: 2147483647,
            maxWidth: 'min(620px, calc(100vw - 16px))',
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
