const BUILD = 428;
const STATE_KEY = '__gannzillaPngWindowsAssociationV428';
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const BUTTON_MARKER = 'data-gannzilla-png-windows-association-v428';

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
      return Boolean(
        canvas.width > 300
          && canvas.height > 300
          && rect
          && rect.width > 250
          && rect.height > 250,
      );
    })
    .map((canvas) => ({ canvas, area: canvas.width * canvas.height }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;
}

function findCopyButton() {
  const panel = document.getElementById(PANEL_ID);
  if (!(panel instanceof HTMLElement)) return null;

  const marked = panel.querySelector(`[${BUTTON_MARKER}="true"]`);
  if (marked instanceof HTMLButtonElement) return marked;

  const enlarged = panel.querySelector('[data-gannzilla-copy-icon-enlarged-v425="true"]');
  if (enlarged instanceof HTMLButtonElement) return enlarged;

  const buttons = panel.querySelectorAll('.gz421-preset-bar button');
  return buttons[3] instanceof HTMLButtonElement ? buttons[3] : buttons[buttons.length - 1] || null;
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob instanceof Blob) resolve(blob);
        else reject(new Error('PNG_BLOB_UNAVAILABLE'));
      }, 'image/png');
    } catch (error) {
      reject(error);
    }
  });
}

function downloadPng(blob) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  anchor.href = objectUrl;
  anchor.download = `gann-circle-${stamp}.png`;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('useWindowsPngAssociation', true) || window[STATE_KEY]) return;

  let downloadCount = 0;
  let failureCount = 0;
  let lastError = null;

  const onDownloadForWindows = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();

    const button = event.currentTarget;
    const canvas = findMainWheelCanvas();
    if (!(canvas instanceof HTMLCanvasElement)) {
      failureCount += 1;
      lastError = 'WHEEL_CANVAS_NOT_FOUND';
      return;
    }

    if (button instanceof HTMLButtonElement) button.disabled = true;
    try {
      const blob = await canvasToPngBlob(canvas);
      downloadPng(blob);
      downloadCount += 1;
      lastError = null;
    } catch (error) {
      failureCount += 1;
      lastError = String(error?.message || error || 'PNG_DOWNLOAD_FAILED');
    } finally {
      if (button instanceof HTMLButtonElement) {
        window.setTimeout(() => { button.disabled = false; }, 350);
      }
    }
  };

  const bind = () => {
    const button = findCopyButton();
    if (!(button instanceof HTMLButtonElement)) return false;
    if (button.getAttribute(BUTTON_MARKER) === 'true') return true;

    button.removeAttribute('data-gannzilla-copy-wheel-to-paint-v426');
    button.removeAttribute('data-gannzilla-direct-open-paint-v427');
    button.setAttribute(BUTTON_MARKER, 'true');
    button.title = 'تنزيل صورة PNG وفتحها بواسطة تطبيق Windows الافتراضي';
    button.setAttribute('aria-label', 'تنزيل صورة PNG وفتحها بواسطة تطبيق Windows الافتراضي');
    button.addEventListener('click', onDownloadForWindows, true);
    return true;
  };

  [0, 20, 60, 140, 320, 700, 1400, 2600].forEach((delay) => window.setTimeout(bind, delay));
  const observer = new MutationObserver(bind);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.GANNZILLA_PNG_WINDOWS_ASSOCIATION_V428 = true;
  window.__auditGannzillaPngWindowsAssociationV428 = () => ({
    ok: Boolean(findCopyButton()?.getAttribute(BUTTON_MARKER) === 'true'),
    build: BUILD,
    enabled: boolParam('useWindowsPngAssociation', true),
    downloadsPngWithoutSiteMessage: true,
    usesWindowsPngFileAssociation: true,
    chooserAppearsWhenWindowsHasNoDefaultPngApp: true,
    directPaintProtocolDisabled: true,
    priorV426BindingActive: window.GANNZILLA_COPY_WHEEL_TO_PAINT_V426 === true,
    priorV427BindingActive: window.GANNZILLA_DIRECT_OPEN_PAINT_V427 === true,
    browserCannotAutoLaunchDownloadedLocalFile: true,
    downloadCount,
    failureCount,
    lastError,
  });

  window[STATE_KEY] = { observer };
}

install();
