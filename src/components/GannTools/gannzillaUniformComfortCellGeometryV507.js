const BUILD = 507;
const STATE_KEY = '__gannzillaUniformComfortCellGeometryV507';
const DEFAULT_UNIFORM_SCALE = 1.18;
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
    numberParam('gannzillaRingWidth', DEFAULT_BASE_RING_WIDTH, 4, 300),
    4,
    300,
  );
  const baseInnerRadius = numberParam(
    'uniformCellBaseInnerRadius',
    numberParam('gannzillaInnerRadius', DEFAULT_BASE_INNER_RADIUS, 20, 1000),
    20,
    1000,
  );
  const uniformScale = numberParam('uniformCellScale', DEFAULT_UNIFORM_SCALE, 1, 1.5);
  const fixedCenterRadius = Math.max(20, baseInnerRadius - baseRingWidth);
  const appliedRingWidth = baseRingWidth * uniformScale;
  const appliedInnerRadius = fixedCenterRadius + appliedRingWidth;

  return {
    baseRingWidth,
    baseInnerRadius,
    uniformScale,
    fixedCenterRadius,
    appliedRingWidth,
    appliedInnerRadius,
  };
}

function dispatchCanonical(path, value) {
  window.dispatchEvent(new CustomEvent('gannzilla:canonical-property-change-v326', {
    detail: { path, value, source: 'uniform-comfort-cell-geometry-v507', build: BUILD },
  }));
}

function persistFlags(values) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('uniformCellGeometry', 'true');
    url.searchParams.set('uniformCellScale', String(values.uniformScale));
    url.searchParams.set('uniformCellBaseRingWidth', String(values.baseRingWidth));
    url.searchParams.set('uniformCellBaseInnerRadius', String(values.baseInnerRadius));
    url.searchParams.set('gannzillaRingWidth', String(values.appliedRingWidth));
    url.searchParams.set('gannzillaInnerRadius', String(values.appliedInnerRadius));
    url.searchParams.set('anchorRingScale', '1');
    url.searchParams.set('adaptiveCellGeometry', 'true');
    url.searchParams.set('outwardOnlyExpansion', 'true');
    url.searchParams.set('fixedCenterRadius', String(values.fixedCenterRadius));
    url.searchParams.set('cellComfortMargin', 'uniform-18-percent-plus-adaptive');
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

  canvas.dataset.gannzillaUniformComfortCellGeometryV507 = 'true';
  canvas.dataset.gannzillaUniformCellScale = String(values.uniformScale);
  canvas.dataset.gannzillaUniformBaseRingWidth = String(values.baseRingWidth);
  canvas.dataset.gannzillaUniformAppliedRingWidth = String(values.appliedRingWidth);
  canvas.dataset.gannzillaUniformBaseInnerRadius = String(values.baseInnerRadius);
  canvas.dataset.gannzillaUniformAppliedInnerRadius = String(values.appliedInnerRadius);
  canvas.dataset.gannzillaFixedCenterRadius = String(values.fixedCenterRadius);
  canvas.dataset.gannzillaUniformOutwardExpansion = 'true';
  canvas.dataset.gannzillaAdaptiveLongNumberExpansion = 'true';
  canvas.dataset.gannzillaCellComfortRule = 'all-rings-uniform-18-percent-long-values-adaptive';
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
  window.dispatchEvent(new CustomEvent('gannzilla:uniform-comfort-cell-geometry-v507', {
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

  window.GANNZILLA_UNIFORM_COMFORT_CELL_GEOMETRY_V507 = true;
  window.__auditGannzillaUniformComfortCellGeometryV507 = () => {
    const canvas = findWheel();
    const values = geometry();
    const actualRingWidth = Number(canvas?.dataset?.gannzillaUniformAppliedRingWidth || 0);
    const actualCenter = Number(canvas?.dataset?.gannzillaFixedCenterRadius || 0);
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaUniformComfortCellGeometryV507 === 'true'
        && canvas.dataset.gannzillaUniformOutwardExpansion === 'true'
        && canvas.dataset.gannzillaAdaptiveLongNumberExpansion === 'true'
        && Math.abs(actualRingWidth - values.appliedRingWidth) < 0.01
        && Math.abs(actualCenter - values.fixedCenterRadius) < 0.01,
      build: BUILD,
      ...values,
      outwardOnlyExpansion: true,
      allRingCellsUniformlyExpanded: true,
      longNumberAdaptiveExpansion: true,
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