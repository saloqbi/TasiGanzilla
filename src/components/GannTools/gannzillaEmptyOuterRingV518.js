const BUILD = 518;
const STATE_KEY = '__gannzillaEmptyOuterRingV518';
const GRID_STROKE = '#b5b5b5';
const OUTER_STROKE = '#7a7a7a';
const CELL_FILL = '#ffffff';
const TWO_PI = Math.PI * 2;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function findWheel() {
  const canvas = document.querySelector('canvas[data-gannzilla-final-wheel-authority-v506="true"]');
  return canvas instanceof HTMLCanvasElement && !canvas.closest('aside') ? canvas : null;
}

function wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees) {
  const start = ((startDegrees - 90) * Math.PI) / 180;
  const end = ((endDegrees - 90) * Math.PI) / 180;
  const anticlockwise = endDegrees < startDegrees;
  ctx.beginPath();
  ctx.arc(cx, cy, outer, start, end, anticlockwise);
  ctx.arc(cx, cy, inner, end, start, !anticlockwise);
  ctx.closePath();
}

function ringWidthFromCanvas(canvas, appliedZoom) {
  const widths = String(canvas.dataset.gannzillaRingWidths || '')
    .split(',')
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);
  if (widths.length) return widths[widths.length - 1];
  return numberParam('gannzillaRingWidth', 60, 4, 300) * appliedZoom;
}

function lockCanvasPresentation(canvas, cssSize) {
  const exact = `${cssSize}px`;
  canvas.style.setProperty('width', exact, 'important');
  canvas.style.setProperty('height', exact, 'important');
  canvas.style.setProperty('min-width', exact, 'important');
  canvas.style.setProperty('min-height', exact, 'important');
  canvas.style.setProperty('max-width', 'none', 'important');
  canvas.style.setProperty('max-height', 'none', 'important');
  canvas.style.setProperty('transform', 'none', 'important');
  canvas.style.setProperty('transform-origin', '0 0', 'important');
  canvas.style.setProperty('zoom', '1', 'important');
  canvas.style.setProperty('image-rendering', 'auto', 'important');
}

let applyCount = 0;
let lastApply = null;
let frame = 0;

function applyEmptyOuterRing(source = 'apply', force = false) {
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement) || !boolParam('emptyOuterRing', true)) return false;

  const currentCssSize = Number(canvas.dataset.gannzillaCanvasCssSize || 0);
  const currentPixelSize = Number(canvas.dataset.gannzillaCanvasPixelSize || 0);
  const storedExpandedCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 || 0);
  const alreadyExpanded = canvas.dataset.gannzillaEmptyOuterRingV518 === 'true'
    && currentCssSize > 0
    && storedExpandedCssSize > 0
    && Math.abs(currentCssSize - storedExpandedCssSize) < 0.5;

  // Never expand an already-expanded canvas again. This keeps redraws idempotent
  // and prevents nested copies of the complete wheel.
  if (alreadyExpanded) return true;

  if (!(currentCssSize > 0) || !(currentPixelSize > 0) || canvas.width < 1 || canvas.height < 1) return false;

  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr) || Number(window.devicePixelRatio) || 1);
  const appliedZoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);
  const divisions = Math.round(numberParam('divisions', 36, 3, 360));
  const clockwise = boolParam('clockwise', true);
  const ringWidth = ringWidthFromCanvas(canvas, appliedZoom);
  const emptyRingCount = Math.round(numberParam('emptyOuterRingCount', 1, 1, 4));
  const extension = ringWidth * emptyRingCount;
  const expandedCssSize = Math.ceil(currentCssSize + extension * 2);
  const expandedPixelSize = Math.round(expandedCssSize * dpr);
  const offsetPixels = Math.round(extension * dpr);

  const snapshot = document.createElement('canvas');
  snapshot.width = canvas.width;
  snapshot.height = canvas.height;
  const snapshotContext = snapshot.getContext('2d', { alpha: false });
  if (!snapshotContext) return false;
  snapshotContext.drawImage(canvas, 0, 0);

  canvas.width = expandedPixelSize;
  canvas.height = expandedPixelSize;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = CELL_FILL;
  ctx.fillRect(0, 0, expandedPixelSize, expandedPixelSize);
  ctx.drawImage(snapshot, offsetPixels, offsetPixels);

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const sector = 360 / divisions;
  const direction = clockwise ? 1 : -1;
  const northOffset = direction * sector / 2;
  const margin = 90 * appliedZoom;
  const originalOuterRadius = Math.max(1, (currentCssSize - margin * 2) / 2);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.setLineDash([]);
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'round';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  for (let emptyIndex = 0; emptyIndex < emptyRingCount; emptyIndex += 1) {
    const inner = originalOuterRadius + ringWidth * emptyIndex;
    const outer = inner + ringWidth;
    for (let index = 0; index < divisions; index += 1) {
      const startDegrees = northOffset + direction * index * sector;
      const endDegrees = northOffset + direction * (index + 1) * sector;
      wedge(ctx, cx, cy, inner, outer, startDegrees, endDegrees);
      ctx.fillStyle = CELL_FILL;
      ctx.fill();
      ctx.strokeStyle = GRID_STROKE;
      ctx.lineWidth = 0.55;
      ctx.stroke();
    }
  }

  const newOuterRadius = originalOuterRadius + extension;
  ctx.beginPath();
  ctx.arc(cx, cy, newOuterRadius, 0, TWO_PI);
  ctx.strokeStyle = OUTER_STROKE;
  ctx.lineWidth = 0.9;
  ctx.stroke();

  lockCanvasPresentation(canvas, expandedCssSize);
  canvas.dataset.gannzillaCanvasCssSize = String(expandedCssSize);
  canvas.dataset.gannzillaCanvasPixelSize = String(expandedPixelSize);
  canvas.dataset.gannzillaEmptyOuterRingV518 = 'true';
  canvas.dataset.gannzillaEmptyOuterRingCountV518 = String(emptyRingCount);
  canvas.dataset.gannzillaEmptyOuterRingBlankV518 = 'true';
  canvas.dataset.gannzillaEmptyOuterRingWidthV518 = String(ringWidth);
  canvas.dataset.gannzillaEmptyOuterRingBaseCssSizeV518 = String(currentCssSize);
  canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 = String(expandedCssSize);
  canvas.dataset.gannzillaEmptyOuterRingDivisionsV518 = String(divisions);
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    divisions,
    emptyRingCount,
    ringWidth,
    baseCssSize: currentCssSize,
    expandedCssSize,
    expandedPixelSize,
    blank: true,
    numbersChanged: false,
    forced: force,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:empty-outer-ring-v518', { detail: lastApply }));
  return true;
}

function schedule(source = 'schedule', force = false) {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => applyEmptyOuterRing(source, force));
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('emptyOuterRing', 'true');
    url.searchParams.set('emptyOuterRingCount', '1');
    url.searchParams.set('emptyOuterRingNumbers', 'false');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime rendering remains authoritative.
  }
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || !wheelMode()
    || window[STATE_KEY]) return;

  persistFlags();
  const onWheelDraw = () => schedule('final-wheel-v506', true);
  window.addEventListener('gannzilla:final-wheel-authority-v506', onWheelDraw, false);
  window.addEventListener('gannzilla:native-dpr-zoom-v504', () => schedule('native-zoom'), false);
  window.addEventListener('resize', () => schedule('resize'), false);

  [30, 100, 260, 700, 1600, 3400, 6800].forEach((delay) =>
    setTimeout(() => schedule(`boot-${delay}`), delay));

  window.GANNZILLA_EMPTY_OUTER_RING_V518 = true;
  window.__auditGannzillaEmptyOuterRingV518 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaEmptyOuterRingV518 === 'true'
        && canvas.dataset.gannzillaEmptyOuterRingBlankV518 === 'true'
        && Number(canvas.dataset.gannzillaEmptyOuterRingCountV518) >= 1,
      build: BUILD,
      blank: canvas?.dataset?.gannzillaEmptyOuterRingBlankV518 === 'true',
      emptyRingCount: Number(canvas?.dataset?.gannzillaEmptyOuterRingCountV518 || 0),
      divisions: Number(canvas?.dataset?.gannzillaEmptyOuterRingDivisionsV518 || 0),
      ringWidth: Number(canvas?.dataset?.gannzillaEmptyOuterRingWidthV518 || 0),
      baseCssSize: Number(canvas?.dataset?.gannzillaEmptyOuterRingBaseCssSizeV518 || 0),
      expandedCssSize: Number(canvas?.dataset?.gannzillaEmptyOuterRingExpandedCssSizeV518 || 0),
      applyCount,
      lastApply,
      existingNumbersChanged: false,
      idempotentExpansion: true,
    };
  };

  window[STATE_KEY] = { schedule, applyEmptyOuterRing, onWheelDraw };
}

install();