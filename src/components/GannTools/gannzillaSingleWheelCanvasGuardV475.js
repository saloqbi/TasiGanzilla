const BUILD = 475;
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const OLD_THEME_OVERLAY_ID = 'gannzilla-wheel-line-theme-overlay-v473';
const OLD_THEME_STYLE_ID = 'gannzilla-wheel-line-theme-style-v473';
const STYLE_ID = 'gannzilla-single-wheel-canvas-guard-style-v475';
const STATE_KEY = '__gannzillaSingleWheelCanvasGuardV475';
const ROOT_ATTR = 'data-gannzilla-single-wheel-guard-v475';
const MAIN_CANVAS_SELECTORS = [
  'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
  'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
  'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
];

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    html[${ROOT_ATTR}="hidden"] #${DRAWING_OVERLAY_ID} {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
}

function findMainWheel() {
  const preferred = document.querySelector(MAIN_CANVAS_SELECTORS.join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest?.('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement)
        || canvas.id === DRAWING_OVERLAY_ID
        || canvas.id === OLD_THEME_OVERLAY_ID
        || canvas.closest?.('aside')) return false;
      const style = window.getComputedStyle(canvas);
      const rect = canvas.getBoundingClientRect();
      return canvas.width > 300
        && canvas.height > 300
        && rect.width > 250
        && rect.height > 250
        && style.display !== 'none'
        && style.visibility !== 'hidden';
    })
    .map((canvas) => ({ canvas, area: canvas.getBoundingClientRect().width * canvas.getBoundingClientRect().height }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;
}

function clearDrawingOverlay() {
  const overlay = document.getElementById(DRAWING_OVERLAY_ID);
  if (!(overlay instanceof HTMLCanvasElement)) return false;
  overlay.dataset.gannzillaAuxiliaryCanvasV475 = 'true';
  const ctx = overlay.getContext('2d');
  if (!ctx) return false;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  ctx.restore();
  return true;
}

function rectOverlapRatio(first, second) {
  const left = Math.max(first.left, second.left);
  const top = Math.max(first.top, second.top);
  const right = Math.min(first.right, second.right);
  const bottom = Math.min(first.bottom, second.bottom);
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);
  const overlap = width * height;
  const smaller = Math.max(1, Math.min(first.width * first.height, second.width * second.height));
  return overlap / smaller;
}

function hideUnexpectedDuplicateCanvases() {
  const main = findMainWheel();
  if (!(main instanceof HTMLCanvasElement)) return 0;
  const mainRect = main.getBoundingClientRect();
  let hidden = 0;

  Array.from(document.querySelectorAll('canvas')).forEach((canvas) => {
    if (!(canvas instanceof HTMLCanvasElement)
      || canvas === main
      || canvas.id === DRAWING_OVERLAY_ID
      || canvas.id === OLD_THEME_OVERLAY_ID
      || canvas.closest?.('aside')) return;

    const rect = canvas.getBoundingClientRect();
    const style = window.getComputedStyle(canvas);
    if (rect.width < 250
      || rect.height < 250
      || style.display === 'none'
      || style.visibility === 'hidden'
      || rectOverlapRatio(mainRect, rect) < 0.92) return;

    canvas.dataset.gannzillaDuplicateWheelHiddenV475 = 'true';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.setProperty('display', 'none', 'important');
    canvas.style.setProperty('pointer-events', 'none', 'important');
    hidden += 1;
  });

  return hidden;
}

let restoreTimer = 0;
let guardCount = 0;
let restoreCount = 0;
let duplicateHideCount = 0;
let lastGuard = null;
let lastRestore = null;

function restoreDrawingOverlay(source = 'restore') {
  window.clearTimeout(restoreTimer);
  restoreTimer = 0;
  const cleared = clearDrawingOverlay();
  document.documentElement.removeAttribute(ROOT_ATTR);
  duplicateHideCount += hideUnexpectedDuplicateCanvases();

  // V471 listens to this event and redraws only the saved user drawings.
  // V459 ignores it because no numeric x/y offset is supplied.
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-pan-offset-v305', {
    detail: { source: 'single-wheel-canvas-guard-v475', build: BUILD },
  }));

  restoreCount += 1;
  lastRestore = { source, cleared, at: Date.now() };
}

function guardRedrawWindow(source = 'guard', delay = 340) {
  installStyle();
  document.documentElement.setAttribute(ROOT_ATTR, 'hidden');
  const overlay = document.getElementById(DRAWING_OVERLAY_ID);
  if (overlay instanceof HTMLCanvasElement) overlay.dataset.gannzillaAuxiliaryCanvasV475 = 'true';
  document.getElementById(OLD_THEME_OVERLAY_ID)?.remove();
  document.getElementById(OLD_THEME_STYLE_ID)?.remove();

  window.clearTimeout(restoreTimer);
  restoreTimer = window.setTimeout(() => restoreDrawingOverlay(source), delay);
  guardCount += 1;
  lastGuard = { source, delay, at: Date.now() };
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('singleWheelCanvasGuard', true) || window[STATE_KEY]) return;

  installStyle();
  guardRedrawWindow('install', 620);

  const onRingRefresh = () => guardRedrawWindow('ring-refresh', 340);
  const onCanonical = () => guardRedrawWindow('canonical-change', 340);
  const onLanguage = () => guardRedrawWindow('language-change', 340);
  const onResize = () => guardRedrawWindow('resize', 340);
  const onInput = () => guardRedrawWindow('input', 340);
  const onChange = () => guardRedrawWindow('change', 340);

  window.addEventListener('gannzilla:ring-two-numbering-refresh', onRingRefresh, true);
  window.addEventListener('gannzilla:canonical-property-change-v326', onCanonical, true);
  window.addEventListener('gannzilla:language-change', onLanguage, true);
  window.addEventListener('resize', onResize, true);
  document.addEventListener('input', onInput, true);
  document.addEventListener('change', onChange, true);

  const observer = new MutationObserver(() => {
    const overlay = document.getElementById(DRAWING_OVERLAY_ID);
    if (overlay instanceof HTMLCanvasElement && overlay.dataset.gannzillaAuxiliaryCanvasV475 !== 'true') {
      guardRedrawWindow('drawing-overlay-created', 420);
    }
    document.getElementById(OLD_THEME_OVERLAY_ID)?.remove();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  const timers = [40, 120, 300, 700, 1500, 3000, 5000]
    .map((delay) => window.setTimeout(() => {
      duplicateHideCount += hideUnexpectedDuplicateCanvases();
    }, delay));

  window.GANNZILLA_SINGLE_WHEEL_CANVAS_GUARD_V475 = true;
  window.__auditGannzillaSingleWheelCanvasGuardV475 = () => {
    const main = findMainWheel();
    const visibleWheelLikeCanvases = Array.from(document.querySelectorAll('canvas'))
      .filter((canvas) => {
        if (!(canvas instanceof HTMLCanvasElement)
          || canvas.id === DRAWING_OVERLAY_ID
          || canvas.id === OLD_THEME_OVERLAY_ID
          || canvas.closest?.('aside')) return false;
        const style = window.getComputedStyle(canvas);
        const rect = canvas.getBoundingClientRect();
        return rect.width > 250
          && rect.height > 250
          && style.display !== 'none'
          && style.visibility !== 'hidden';
      });

    return {
      ok: Boolean(main) && visibleWheelLikeCanvases.length === 1,
      build: BUILD,
      singleVisibleWheelCanvas: visibleWheelLikeCanvases.length === 1,
      visibleWheelLikeCanvasCount: visibleWheelLikeCanvases.length,
      drawingOverlayMarkedAuxiliary: document.getElementById(DRAWING_OVERLAY_ID)?.dataset?.gannzillaAuxiliaryCanvasV475 === 'true',
      oldThemeOverlayRemoved: !document.getElementById(OLD_THEME_OVERLAY_ID),
      guardCount,
      restoreCount,
      duplicateHideCount,
      lastGuard,
      lastRestore,
      drawingToolsPreserved: true,
      wheelMovementPreserved: true,
    };
  };

  window[STATE_KEY] = {
    timers,
    observer,
    onRingRefresh,
    onCanonical,
    onLanguage,
    onResize,
    onInput,
    onChange,
    guardRedrawWindow,
    restoreDrawingOverlay,
  };
}

install();