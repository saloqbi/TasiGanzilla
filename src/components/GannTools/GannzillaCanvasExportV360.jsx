import React from 'react';

const BUILD = 360;

function findPrimaryCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ canvas, rect }) => canvas.width > 0 && canvas.height > 0 && rect.width > 120 && rect.height > 120)
    .sort((a, b) => (b.canvas.width * b.canvas.height) - (a.canvas.width * a.canvas.height))[0]?.canvas || null;
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

function downloadBlob(blob) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const filename = `gann-circle-${timestamp}.png`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  return filename;
}

async function copyPngToClipboard(blobPromise) {
  if (!navigator.clipboard?.write || typeof window.ClipboardItem !== 'function') return false;
  try {
    await navigator.clipboard.write([
      new window.ClipboardItem({ 'image/png': blobPromise }),
    ]);
    return true;
  } catch (_) {
    return false;
  }
}

export default function GannzillaCanvasExportV360({ toolbarHeight = 24 }) {
  const [notice, setNotice] = React.useState('');
  const noticeTimerRef = React.useRef(0);

  React.useEffect(() => {
    window.GANNZILLA_CANVAS_EXPORT_V360 = true;
    window.__auditGannzillaCanvasExportV360 = () => ({
      ok: true,
      build: BUILD,
      primaryCanvasAvailable: Boolean(findPrimaryCanvas()),
      pngDownloadEnabled: true,
      clipboardImageCopySupported: Boolean(navigator.clipboard?.write && typeof window.ClipboardItem === 'function'),
      paintWorkflow: 'DOWNLOAD_PNG_OR_OPEN_PAINT_AND_CTRL_V',
      wheelOnlyExport: true,
      whiteBackground: true,
      sourceResolutionPreserved: true,
    });
    return () => {
      window.clearTimeout(noticeTimerRef.current);
      delete window.GANNZILLA_CANVAS_EXPORT_V360;
      delete window.__auditGannzillaCanvasExportV360;
    };
  }, []);

  const showNotice = React.useCallback((message) => {
    window.clearTimeout(noticeTimerRef.current);
    setNotice(message);
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 3200);
  }, []);

  const exportWheel = React.useCallback(async () => {
    const source = findPrimaryCanvas();
    if (!source) {
      showNotice('تعذر العثور على رسم العجلة');
      return;
    }

    try {
      const exportCanvas = buildExportCanvas(source);
      const blobPromise = canvasToBlob(exportCanvas);
      const clipboardPromise = copyPngToClipboard(blobPromise);
      const blob = await blobPromise;
      const filename = downloadBlob(blob);
      const copied = await clipboardPromise;
      showNotice(copied
        ? `تم نسخ الصورة وتنزيلها: ${filename} — افتح الرسام واضغط Ctrl+V`
        : `تم تنزيل الصورة: ${filename} — افتحها ببرنامج الرسام`);
    } catch (_) {
      showNotice('تعذر إنشاء صورة PNG');
    }
  }, [showNotice]);

  return (
    <>
      <button
        type="button"
        data-gannzilla-canvas-export-v360="true"
        aria-label="نسخ وتنزيل صورة العجلة"
        title="نسخ وتنزيل صورة العجلة PNG"
        onClick={exportWheel}
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
          background: 'transparent',
          color: '#2469b2',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 7V4h11v11h-3" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <rect x="4" y="8" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M6.5 17l3-3 2.2 2.2 1.8-1.8 2.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="8" cy="11.5" r="1" fill="currentColor" />
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
            maxWidth: 'min(520px, calc(100vw - 16px))',
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
