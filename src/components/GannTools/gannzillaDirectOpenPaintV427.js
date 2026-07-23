const BUILD = 427;
const STATE_KEY = '__gannzillaDirectOpenPaintV427';
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const BUTTON_MARKER = 'data-gannzilla-direct-open-paint-v427';

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
  const dataUrl = canvas.toDataURL('image/png');
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex < 0) return null;

  const binary = window.atob(dataUrl.slice(commaIndex + 1));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: 'image/png' });
}

function copyWheelSilently() {
  const canvas = findMainWheelCanvas();
  if (!(canvas instanceof HTMLCanvasElement)) return null;
  if (!navigator.clipboard?.write || typeof window.ClipboardItem !== 'function') return null;

  try {
    const blob = canvasToPngBlob(canvas);
    if (!(blob instanceof Blob)) return null;
    return navigator.clipboard.write([
      new window.ClipboardItem({ 'image/png': blob }),
    ]);
  } catch (_) {
    return null;
  }
}

function openPaintDirectly() {
  const anchor = document.createElement('a');
  anchor.href = 'ms-paint:';
  anchor.tabIndex = -1;
  anchor.setAttribute('aria-hidden', 'true');
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('directOpenPaint', true) || window[STATE_KEY]) return;

  let launchCount = 0;
  let clipboardAttemptCount = 0;
  let clipboardSuccessCount = 0;
  let clipboardFailureCount = 0;

  const onOpenPaint = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();

    const clipboardPromise = copyWheelSilently();
    if (clipboardPromise) {
      clipboardAttemptCount += 1;
      Promise.resolve(clipboardPromise).then(
        () => { clipboardSuccessCount += 1; },
        () => { clipboardFailureCount += 1; },
      );
    }

    openPaintDirectly();
    launchCount += 1;
  };

  const bind = () => {
    const button = findCopyButton();
    if (!(button instanceof HTMLButtonElement)) return false;
    if (button.getAttribute(BUTTON_MARKER) === 'true') return true;

    button.removeAttribute('data-gannzilla-copy-wheel-to-paint-v426');
    button.setAttribute(BUTTON_MARKER, 'true');
    button.title = 'فتح Microsoft Paint';
    button.setAttribute('aria-label', 'فتح Microsoft Paint');
    button.addEventListener('click', onOpenPaint, true);
    return true;
  };

  [0, 20, 60, 140, 320, 700, 1400, 2600].forEach((delay) => window.setTimeout(bind, delay));
  const observer = new MutationObserver(bind);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.GANNZILLA_DIRECT_OPEN_PAINT_V427 = true;
  window.__auditGannzillaDirectOpenPaintV427 = () => ({
    ok: Boolean(findCopyButton()?.getAttribute(BUTTON_MARKER) === 'true'),
    build: BUILD,
    enabled: boolParam('directOpenPaint', true),
    paintProtocol: 'ms-paint:',
    directPaintLaunch: true,
    siteMessagesShown: false,
    downloadFallbackEnabled: false,
    previousV426BindingLoaded: window.GANNZILLA_COPY_WHEEL_TO_PAINT_V426 === true,
    silentClipboardAttemptEnabled: true,
    launchCount,
    clipboardAttemptCount,
    clipboardSuccessCount,
    clipboardFailureCount,
  });

  window[STATE_KEY] = { observer };
}

install();
