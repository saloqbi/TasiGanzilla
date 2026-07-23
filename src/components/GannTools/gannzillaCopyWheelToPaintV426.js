const BUILD = 426;
const STATE_KEY = '__gannzillaCopyWheelToPaintV426';
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const BUTTON_MARKER = 'data-gannzilla-copy-wheel-to-paint-v426';

function params() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  const value = String(query.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function findMainWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest?.('aside')) return false;
      const rect = canvas.getBoundingClientRect?.();
      return Boolean(canvas.width > 300 && canvas.height > 300 && rect && rect.width > 250 && rect.height > 250);
    })
    .map((canvas) => ({ canvas, area: canvas.width * canvas.height }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;
}

function findCopyButton() {
  const panel = document.getElementById(PANEL_ID);
  if (!(panel instanceof HTMLElement)) return null;

  const alreadyMarked = panel.querySelector(`[${BUTTON_MARKER}="true"]`);
  if (alreadyMarked instanceof HTMLButtonElement) return alreadyMarked;

  const enlarged = panel.querySelector('[data-gannzilla-copy-icon-enlarged-v425="true"]');
  if (enlarged instanceof HTMLButtonElement) return enlarged;

  const buttons = panel.querySelectorAll('.gz421-preset-bar button');
  return buttons[3] instanceof HTMLButtonElement ? buttons[3] : buttons[buttons.length - 1] || null;
}

function canvasToPngBlob(canvas) {
  const dataUrl = canvas.toDataURL('image/png');
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex < 0) throw new Error('INVALID_CANVAS_DATA_URL');

  const binary = window.atob(dataUrl.slice(commaIndex + 1));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: 'image/png' });
}

function launchPaintProtocol() {
  const anchor = document.createElement('a');
  anchor.href = 'ms-paint:';
  anchor.tabIndex = -1;
  anchor.setAttribute('aria-hidden', 'true');
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function downloadFallback(blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  anchor.href = url;
  anchor.download = `gannzilla-paint-${stamp}.png`;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function showToast(message, error = false) {
  document.getElementById('gannzilla-paint-toast-v426')?.remove();
  const toast = document.createElement('div');
  toast.id = 'gannzilla-paint-toast-v426';
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    left: '50%',
    bottom: '22px',
    transform: 'translateX(-50%)',
    zIndex: '2147483647',
    maxWidth: 'min(680px, calc(100vw - 30px))',
    padding: '10px 16px',
    border: `1px solid ${error ? '#a51f1f' : '#276c35'}`,
    borderRadius: '5px',
    background: error ? '#fff0f0' : '#effff2',
    color: error ? '#7b1111' : '#174f22',
    font: '700 14px Tahoma, Segoe UI, Arial, sans-serif',
    boxShadow: '0 3px 14px rgba(0,0,0,.24)',
    direction: 'rtl',
    textAlign: 'center',
  });
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 6500);
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('copyWheelToPaint', true) || window[STATE_KEY]) return;

  let copyCount = 0;
  let clipboardSuccessCount = 0;
  let paintLaunchCount = 0;
  let downloadFallbackCount = 0;
  let lastError = null;

  const onCopyToPaint = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();

    const button = event.currentTarget;
    const canvas = findMainWheelCanvas();
    if (!(canvas instanceof HTMLCanvasElement)) {
      lastError = 'WHEEL_CANVAS_NOT_FOUND';
      showToast('لم يتم العثور على صورة العجلة لنسخها إلى الرسام.', true);
      return;
    }

    copyCount += 1;
    if (button instanceof HTMLButtonElement) button.disabled = true;

    try {
      const blob = canvasToPngBlob(canvas);
      let clipboardPromise = null;

      if (navigator.clipboard?.write && typeof window.ClipboardItem === 'function') {
        clipboardPromise = navigator.clipboard.write([
          new window.ClipboardItem({ 'image/png': blob }),
        ]);
      }

      // Windows 11 Paint registers the ms-paint: protocol. Launch it during
      // the original click task so the browser treats it as a user request.
      launchPaintProtocol();
      paintLaunchCount += 1;

      if (clipboardPromise) {
        try {
          await clipboardPromise;
          clipboardSuccessCount += 1;
          lastError = null;
          showToast('تم نسخ صورة العجلة وفتح الرسام. داخل الرسام اضغط Ctrl + V لإظهار الصورة.');
        } catch (clipboardError) {
          lastError = String(clipboardError?.message || clipboardError || 'CLIPBOARD_WRITE_FAILED');
          downloadFallback(blob);
          downloadFallbackCount += 1;
          showToast('فُتح الرسام، وتعذر النسخ المباشر؛ تم تنزيل الصورة PNG كبديل.', true);
        }
      } else {
        lastError = 'CLIPBOARD_IMAGE_API_UNAVAILABLE';
        downloadFallback(blob);
        downloadFallbackCount += 1;
        showToast('فُتح الرسام، وتم تنزيل الصورة PNG لأن المتصفح لا يدعم نسخ الصور مباشرة.', true);
      }
    } catch (error) {
      lastError = String(error?.message || error || 'COPY_TO_PAINT_FAILED');
      showToast('تعذر تجهيز صورة العجلة للرسام.', true);
    } finally {
      if (button instanceof HTMLButtonElement) {
        window.setTimeout(() => { button.disabled = false; }, 450);
      }
    }
  };

  const bind = () => {
    const button = findCopyButton();
    if (!(button instanceof HTMLButtonElement)) return false;
    if (button.getAttribute(BUTTON_MARKER) === 'true') return true;

    button.setAttribute(BUTTON_MARKER, 'true');
    button.title = 'نسخ صورة العجلة وفتح Microsoft Paint';
    button.setAttribute('aria-label', 'نسخ صورة العجلة وفتح Microsoft Paint');
    button.addEventListener('click', onCopyToPaint, true);
    return true;
  };

  [0, 20, 60, 140, 320, 700, 1400, 2600].forEach((delay) => window.setTimeout(bind, delay));
  const observer = new MutationObserver(bind);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.GANNZILLA_COPY_WHEEL_TO_PAINT_V426 = true;
  window.__auditGannzillaCopyWheelToPaintV426 = () => ({
    ok: Boolean(findCopyButton()?.getAttribute(BUTTON_MARKER) === 'true'),
    build: BUILD,
    enabled: boolParam('copyWheelToPaint', true),
    paintProtocol: 'ms-paint:',
    copiesImagePngToClipboard: true,
    opensMicrosoftPaint: true,
    requiresPasteInPaint: true,
    copyCount,
    clipboardSuccessCount,
    paintLaunchCount,
    downloadFallbackCount,
    lastError,
  });

  window[STATE_KEY] = { observer };
}

install();
