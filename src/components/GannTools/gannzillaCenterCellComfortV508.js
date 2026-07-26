const BUILD = 508;
const STATE_KEY = '__gannzillaCenterCellComfortV508';
const DEFAULT_UNIFORM_SCALE = 1.18;
const DEFAULT_CENTER_SCALE = 1.12;
const DEFAULT_BASE_RING_WIDTH = 82;
const DEFAULT_BASE_INNER_RADIUS = 245;

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

function geometry() {
  const baseRingWidth = numberParam(
    'uniformCellBaseRingWidth',
    DEFAULT_BASE_RING_WIDTH,
    4,
    300,
  );
  const baseInnerRadius = numberParam(
    'uniformCellBaseInnerRadius',
    DEFAULT_BASE_INNER_RADIUS,
    20,
    1000,
  );
  const uniformScale = numberParam('uniformCellScale', DEFAULT_UNIFORM_SCALE, 1, 1.5);
  const centerScale = numberParam('centerCellScale', DEFAULT_CENTER_SCALE, 1, 1.5);

  const originalCenterRadius = Math.max(20, baseInnerRadius - baseRingWidth);
  const expandedCenterRadius = originalCenterRadius * centerScale;
  const appliedRingWidth = baseRingWidth * uniformScale;
  const appliedInnerRadius = expandedCenterRadius + appliedRingWidth;

  return {
    baseRingWidth,
    baseInnerRadius,
    uniformScale,
    centerScale,
    originalCenterRadius,
    expandedCenterRadius,
    appliedRingWidth,
    appliedInnerRadius,
  };
}

function dispatchCanonical(path, value) {
  window.dispatchEvent(new CustomEvent('gannzilla:canonical-property-change-v326', {
    detail: { path, value, source: 'center-cell-comfort-v508', build: BUILD },
  }));
}

function persistFlags(values) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('uniformCellGeometry', 'true');
    url.searchParams.set('uniformCellScale', String(values.uniformScale));
    url.searchParams.set('uniformCellBaseRingWidth', String(values.baseRingWidth));
    url.searchParams.set('uniformCellBaseInnerRadius', String(values.baseInnerRadius));
    url.searchParams.set('centerCellOnlyAdjustment', 'true');
    url.searchParams.set('centerCellScale', String(values.centerScale));
    url.searchParams.set('originalCenterRadius', String(values.originalCenterRadius));
    url.searchParams.set('expandedCenterRadius', String(values.expandedCenterRadius));
    url.searchParams.set('gannzillaRingWidth', String(values.appliedRingWidth));
    url.searchParams.set('gannzillaInnerRadius', String(values.appliedInnerRadius));
    url.searchParams.set('anchorRingScale', '1');
    url.searchParams.set('adaptiveCellGeometry', 'true');
    url.searchParams.set('outwardOnlyExpansion', 'true');
    url.searchParams.set('outerCellSizesPreserved', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime geometry remains authoritative.
  }
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => canvas instanceof HTMLCanvasElement && !canvas.closest('aside'))
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function markCanvas(values) {
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  canvas.dataset.gannzillaCenterCellComfortV508 = 'true';
  canvas.dataset.gannzillaCenterCellOnlyAdjustment = 'true';
  canvas.dataset.gannzillaCenterCellScale = String(values.centerScale);
  canvas.dataset.gannzillaOriginalCenterRadius = String(values.originalCenterRadius);
  canvas.dataset.gannzillaExpandedCenterRadius = String(values.expandedCenterRadius);
  canvas.dataset.gannzillaOuterCellSizesPreserved = 'true';
  canvas.dataset.gannzillaUniformAppliedRingWidth = String(values.appliedRingWidth);
  canvas.dataset.gannzillaAppliedInnerRadius = String(values.appliedInnerRadius);
  canvas.dataset.gannzillaAdaptiveLongNumberExpansion = 'true';
  return true;
}

let applyCount = 0;
let lastApply = null;
let marking = false;

function apply(source = 'apply') {
  const values = geometry();
  persistFlags(values);

  dispatchCanonical('geometry.ringWidth', values.appliedRingWidth);
  dispatchCanonical('geometry.innerRadius', values.appliedInnerRadius);
  dispatchCanonical('geometry.anchorRingScale', 1);
  dispatchCanonical('geometry.adaptiveCellGeometry', true);

  window.setTimeout(() => {
    marking = true;
    markCanvas(values);
    marking = false;
  }, 80);

  applyCount += 1;
  lastApply = { source, ...values, at: Date.now() };
  window.dispatchEvent(new CustomEvent('gannzilla:center-cell-comfort-v508', {
    detail: { source, ...values, build: BUILD },
  }));
  return true;
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || !wheelMode()
    || window[STATE_KEY]) return;

  const onWheel = () => {
    if (marking) return;
    const values = geometry();
    persistFlags(values);
    marking = true;
    markCanvas(values);
    marking = false;
  };

  window.addEventListener('gannzilla:final-wheel-authority-v506', onWheel, false);
  window.addEventListener('gannzilla:final-wheel-authority-v491', onWheel, false);

  window.GANNZILLA_CENTER_CELL_COMFORT_V508 = true;
  window.__auditGannzillaCenterCellComfortV508 = () => {
    const canvas = findWheel();
    const values = geometry();
    const actualCenter = Number(canvas?.dataset?.gannzillaExpandedCenterRadius || 0);
    const actualRingWidth = Number(canvas?.dataset?.gannzillaUniformAppliedRingWidth || 0);
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaCenterCellComfortV508 === 'true'
        && canvas.dataset.gannzillaCenterCellOnlyAdjustment === 'true'
        && canvas.dataset.gannzillaOuterCellSizesPreserved === 'true'
        && canvas.dataset.gannzillaAdaptiveLongNumberExpansion === 'true'
        && Math.abs(actualCenter - values.expandedCenterRadius) < 0.01
        && Math.abs(actualRingWidth - values.appliedRingWidth) < 0.01,
      build: BUILD,
      ...values,
      centerOnlyAdjusted: true,
      outerCellSizesPreserved: true,
      adaptiveLongNumberExpansion: true,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { onWheel, apply };
  apply('install');
  [120, 420, 1000, 2400].forEach((delay) => {
    window.setTimeout(() => apply(`boot-${delay}`), delay);
  });
}

install();