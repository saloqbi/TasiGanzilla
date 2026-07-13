import React from 'react';

const BUILD = 368;
const TOOLBAR_SELECTOR = '.gannzilla-chart-toolbar-v328';

function visibleIntersectionArea(rect) {
  const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  const width = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0));
  const height = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
  return width * height;
}

function isCurrentWheelCanvas(canvas) {
  if (!canvas || canvas.closest('aside')) return false;
  const rect = canvas.getBoundingClientRect();
  const style = window.getComputedStyle(canvas);
  if (canvas.width <= 0 || canvas.height <= 0 || rect.width <= 120 || rect.height <= 120) return false;
  if (visibleIntersectionArea(rect) <= 0 || style.display === 'none' || style.visibility === 'hidden') return false;

  const exactInlineStyle = canvas.style.display === 'block'
    && canvas.style.maxWidth === 'none'
    && canvas.style.maxHeight === 'none';
  if (!exactInlineStyle) return false;

  const viewport = canvas.parentElement?.parentElement;
  if (!viewport) return false;
  const viewportStyle = window.getComputedStyle(viewport);
  const scrollable = viewportStyle.overflow === 'auto'
    || viewportStyle.overflowX === 'auto'
    || viewportStyle.overflowY === 'auto';
  return scrollable && viewportStyle.position === 'absolute';
}

function findCurrentWheelCanvas() {
  const canvases = Array.from(document.querySelectorAll('canvas'));
  const exact = canvases.find(isCurrentWheelCanvas);
  if (exact) return exact;

  return canvases
    .filter((canvas) => !canvas.closest('aside'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ canvas, rect }) => canvas.width > 0 && canvas.height > 0 && rect.width > 120 && rect.height > 120)
    .sort((a, b) => visibleIntersectionArea(b.rect) - visibleIntersectionArea(a.rect))[0]?.canvas || null;
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

function makeFilename() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `gann-circle-v368-current-${timestamp}.png`;
}

function downloadDataUrl(dataUrl, filename) {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.position = 'fixed';
  anchor.style.left = '-10000px';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

async function copyDataUrl(dataUrl) {
  if (!navigator.clipboard?.write || typeof window.ClipboardItem !== 'function') return false;
  try {
    const blob = await (await fetch(dataUrl)).blob();
    await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch (_) {
    return false;
  }
}

export default function GannzillaChartImageExportV368() {
  React.useEffect(() => {
    let disposed = false;
    let detach = () => {};
    let timer = 0;

    const attach = () => {
      if (disposed) return;
      const toolbar = document.querySelector(TOOLBAR_SELECTOR);
      const button = toolbar?.querySelector('button:last-of-type');
      if (!button) {
        timer = window.setTimeout(attach, 80);
        return;
      }

      const originalTitle = button.getAttribute('title') || '';
      const originalAria = button.getAttribute('aria-label') || '';
      button.dataset.gannzillaChartImageExportV368 = 'true';
      button.setAttribute('title', 'نسخ وتنزيل صورة العجلة الحالية PNG');
      button.setAttribute('aria-label', 'نسخ وتنزيل صورة العجلة الحالية PNG');

      const onClickCapture = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();

        try {
          const source = findCurrentWheelCanvas();
          if (!source) throw new Error('CURRENT_WHEEL_NOT_FOUND');
          const exportCanvas = buildExportCanvas(source);
          const dataUrl = exportCanvas.toDataURL('image/png', 1);
          const filename = makeFilename();

          downloadDataUrl(dataUrl, filename);
          button.textContent = '✓';
          button.style.color = '#159537';
          button.title = `تم تنزيل الصورة: ${filename}`;
          window.__gannzillaLastChartImageExportV368 = { ok: true, filename, at: Date.now() };

          const copied = await copyDataUrl(dataUrl);
          window.__gannzillaLastChartImageExportV368.copied = copied;

          window.setTimeout(() => {
            if (!disposed) {
              button.textContent = '💾';
              button.style.color = '#333';
              button.title = 'نسخ وتنزيل صورة العجلة الحالية PNG';
            }
          }, 1400);
        } catch (error) {
          button.textContent = '!';
          button.style.color = '#cf2525';
          button.title = `تعذر تنزيل الصورة: ${error?.message || 'UNKNOWN_ERROR'}`;
          window.__gannzillaLastChartImageExportV368 = {
            ok: false,
            reason: error?.message || 'UNKNOWN_ERROR',
            at: Date.now(),
          };
          window.setTimeout(() => {
            if (!disposed) {
              button.textContent = '💾';
              button.style.color = '#333';
              button.title = 'نسخ وتنزيل صورة العجلة الحالية PNG';
            }
          }, 1800);
        }
      };

      button.addEventListener('click', onClickCapture, true);
      detach = () => {
        button.removeEventListener('click', onClickCapture, true);
        delete button.dataset.gannzillaChartImageExportV368;
        button.setAttribute('title', originalTitle);
        button.setAttribute('aria-label', originalAria);
      };

      window.GANNZILLA_CHART_IMAGE_EXPORT_V368 = true;
      window.__auditGannzillaChartImageExportV368 = () => ({
        ok: button.dataset.gannzillaChartImageExportV368 === 'true',
        build: BUILD,
        exactExistingToolbarButtonWired: true,
        buttonTitle: button.getAttribute('title'),
        currentWheelAvailable: Boolean(findCurrentWheelCanvas()),
        lastExport: window.__gannzillaLastChartImageExportV368 || null,
      });
    };

    attach();

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      detach();
      delete window.GANNZILLA_CHART_IMAGE_EXPORT_V368;
      delete window.__auditGannzillaChartImageExportV368;
      delete window.__gannzillaLastChartImageExportV368;
    };
  }, []);

  return null;
}
