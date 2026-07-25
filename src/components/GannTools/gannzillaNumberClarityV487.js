const BUILD = 487;
const STATE_KEY = '__gannzillaNumberClarityV487';
const ORIGINAL_KEY = '__gannzillaOriginalCanvasFillTextV487';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const THEME_OVERLAY_ID = 'gannzilla-wheel-line-theme-overlay-v473';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function isMainWheelCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement)
    || canvas.closest?.('aside')
    || canvas.id === DRAWING_OVERLAY_ID
    || canvas.id === THEME_OVERLAY_ID) return false;

  if (canvas.dataset.gannzillaCanonicalWheelGeometryV486 === 'true'
    || canvas.dataset.gannzillaUnlimitedRingLayersV480 === 'true'
    || canvas.dataset.gannzillaUnifiedWheelToolsV453 === 'true'
    || canvas.dataset.gannzillaNativeWheelScrollbarsHiddenV417 === 'true'
    || canvas.dataset.gannzillaKeyboardMouseControlV459 === 'true') return true;

  const rect = canvas.getBoundingClientRect();
  return canvas.width > 300 && canvas.height > 300 && rect.width > 250 && rect.height > 250;
}

function numericText(value) {
  return /^[-+]?\d+(?:\.\d+)?$/.test(String(value ?? '').trim());
}

function enlargedFont(font, scale, weight) {
  const source = String(font || '');
  const match = source.match(/(?:^|\s)(\d+(?:\.\d+)?)px\s+(.+)$/i);
  if (!match) return `${weight} ${Math.round(13 * scale * 10) / 10}px Tahoma, Arial, sans-serif`;
  const currentSize = Number(match[1]);
  const family = match[2] || 'Tahoma, Arial, sans-serif';
  const nextSize = Math.round(clamp(currentSize * scale, 7, 28) * 10) / 10;
  return `${weight} ${nextSize}px ${family}`;
}

function persistSettings(scale, weight) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaNumberScale', String(scale));
    url.searchParams.set('gannzillaNumberWeight', String(weight));
    url.searchParams.set('uniformWheelNumberTypography', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) { /* Runtime settings remain active. */ }
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || typeof CanvasRenderingContext2D === 'undefined'
    || !wheelMode()
    || window[STATE_KEY]) return;

  const scale = numberParam('gannzillaNumberScale', 1.25, 1, 1.65);
  const weight = Math.round(numberParam('gannzillaNumberWeight', 800, 600, 900));
  const widthAllowance = numberParam('gannzillaNumberWidthAllowance', 1.14, 1, 1.35);
  const original = window[ORIGINAL_KEY] || CanvasRenderingContext2D.prototype.fillText;
  window[ORIGINAL_KEY] = original;

  let numericDrawCount = 0;
  let lastDraw = null;

  CanvasRenderingContext2D.prototype.fillText = function patchedGannzillaFillText(text, x, y, maxWidth) {
    const canvas = this.canvas;
    if (!isMainWheelCanvas(canvas) || !numericText(text)) {
      return maxWidth === undefined
        ? original.call(this, text, x, y)
        : original.call(this, text, x, y, maxWidth);
    }

    const previousFont = this.font;
    this.font = enlargedFont(previousFont, scale, weight);
    const expandedWidth = Number.isFinite(Number(maxWidth)) ? Number(maxWidth) * widthAllowance : undefined;
    const result = expandedWidth === undefined
      ? original.call(this, text, x, y)
      : original.call(this, text, x, y, expandedWidth);
    this.font = previousFont;

    canvas.dataset.gannzillaNumberClarityV487 = 'true';
    canvas.dataset.gannzillaNumberScale = String(scale);
    canvas.dataset.gannzillaNumberWeight = String(weight);
    numericDrawCount += 1;
    lastDraw = { text: String(text), scale, weight, at: Date.now() };
    return result;
  };

  persistSettings(scale, weight);

  const redraw = (source) => {
    window.__gannzillaCanonicalWheelGeometryV486?.schedule?.(`number-clarity-v${BUILD}-${source}`);
    window.__gannzillaAllToolsRuntimeV482?.sched?.(`number-clarity-v${BUILD}-${source}`);
  };
  [0, 40, 140, 360, 800, 1600, 3200].forEach((delay) => {
    window.setTimeout(() => redraw(`boot-${delay}`), delay);
  });

  window.GANNZILLA_NUMBER_CLARITY_V487 = true;
  window.__auditGannzillaNumberClarityV487 = () => {
    const canvas = Array.from(document.querySelectorAll('canvas')).find(isMainWheelCanvas) || null;
    return {
      ok: window.GANNZILLA_NUMBER_CLARITY_V487 === true
        && canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaNumberClarityV487 === 'true',
      build: BUILD,
      wheelGeometryPreserved: canvas?.dataset?.gannzillaCanonicalWheelGeometryV486 === 'true',
      uniformNumberTypography: true,
      numberScale: scale,
      numberWeight: weight,
      widthAllowance,
      numericDrawCount,
      lastDraw,
    };
  };

  window[STATE_KEY] = { scale, weight, widthAllowance, redraw };
}

install();
