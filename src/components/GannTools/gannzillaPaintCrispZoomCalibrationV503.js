const BUILD = 503;
const STATE_KEY = '__gannzillaPaintCrispZoomCalibrationV503';

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

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v503="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
    'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
      const rect = canvas.getBoundingClientRect();
      return canvas.width > 300 && canvas.height > 300 && rect.width > 250 && rect.height > 250;
    })
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

let frame = 0;
let applyCount = 0;
let lastApply = null;

function apply(source = 'apply') {
  frame = 0;
  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  const renderScale = Number(canvas.dataset.gannzillaEffectiveRenderScale)
    || clamp(Number(window.devicePixelRatio) || 1, 1, 2);
  const logicalWidth = Number(canvas.dataset.gannzillaLogicalWidth)
    || canvas.width / renderScale;
  const logicalHeight = Number(canvas.dataset.gannzillaLogicalHeight)
    || canvas.height / renderScale;
  const requestedZoom = numberParam('gannzillaZoom', 0.80, 0.10, 3.00);
  const calibration = numberParam('gannzillaReferenceZoomCalibration', 1.35, 1.00, 1.60);
  const targetWidth = Math.max(1, Math.round(logicalWidth * requestedZoom * calibration));
  const targetHeight = Math.max(1, Math.round(logicalHeight * requestedZoom * calibration));

  const currentWidth = Number.parseFloat(canvas.style.width) || 0;
  const currentHeight = Number.parseFloat(canvas.style.height) || 0;
  if (Math.abs(currentWidth - targetWidth) > 0.5) {
    canvas.style.setProperty('width', `${targetWidth}px`, 'important');
  }
  if (Math.abs(currentHeight - targetHeight) > 0.5) {
    canvas.style.setProperty('height', `${targetHeight}px`, 'important');
  }
  canvas.style.setProperty('image-rendering', 'auto', 'important');
  canvas.style.setProperty('backface-visibility', 'hidden', 'important');

  canvas.dataset.gannzillaPaintCrispZoomCalibrationV503 = 'true';
  canvas.dataset.gannzillaRequestedZoom = String(requestedZoom);
  canvas.dataset.gannzillaVisualCalibration = String(calibration);
  canvas.dataset.gannzillaEffectiveVisualZoom = String(requestedZoom * calibration);
  canvas.dataset.gannzillaDisplayLogicalWidth = String(logicalWidth);
  canvas.dataset.gannzillaDisplayRenderScale = String(renderScale);
  canvas.dataset.gannzillaDisplayTargetWidth = String(targetWidth);

  applyCount += 1;
  lastApply = {
    source,
    requestedZoom,
    calibration,
    effectiveVisualZoom: requestedZoom * calibration,
    logicalWidth,
    logicalHeight,
    renderScale,
    targetWidth,
    targetHeight,
    canvasPixelWidth: canvas.width,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule', delays = [0, 80, 240, 600]) {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => apply(source));
  delays.filter(Boolean).forEach((delay) => {
    window.setTimeout(() => apply(`${source}-${delay}`), delay);
  });
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaZoom', url.searchParams.get('gannzillaZoom') || '0.80');
    url.searchParams.set(
      'gannzillaReferenceZoomCalibration',
      url.searchParams.get('gannzillaReferenceZoomCalibration') || '1.35',
    );
    url.searchParams.set('paintCrispMode', 'true');
    url.searchParams.set('paintRenderScale', url.searchParams.get('paintRenderScale') || '3');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime display remains authoritative.
  }
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || !wheelMode()
    || window[STATE_KEY]) return;

  persistFlags();

  const observer = new MutationObserver((records) => {
    const canvas = findWheel();
    if (!canvas) return;
    const changed = records.some((record) =>
      record.target === canvas
      || record.target?.contains?.(canvas)
      || canvas.contains?.(record.target));
    if (changed) schedule('mutation', [0, 120, 360]);
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['width', 'height', 'style'],
  });

  window.addEventListener('resize', () => schedule('resize'), true);
  window.addEventListener('gannzilla:final-wheel-authority-v491', () => schedule('final-wheel'), true);
  window.addEventListener('gannzilla:final-wheel-authority-v503', () => schedule('paint-wheel'), true);
  window.addEventListener('gannzilla:wheel-pan-offset-v305', () => schedule('pan'), true);
  document.addEventListener('input', () => schedule('input'), true);
  document.addEventListener('change', () => schedule('change'), true);

  [0, 60, 180, 500, 1200, 2600, 5200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, [0, 120, 360]), delay);
  });

  window.GANNZILLA_PAINT_CRISP_ZOOM_CALIBRATION_V503 = true;
  window.__auditGannzillaPaintCrispZoomCalibrationV503 = () => {
    const canvas = findWheel();
    const requestedZoom = numberParam('gannzillaZoom', 0.80, 0.10, 3.00);
    const calibration = numberParam('gannzillaReferenceZoomCalibration', 1.35, 1.00, 1.60);
    const renderScale = Number(canvas?.dataset?.gannzillaEffectiveRenderScale || 0);
    const logicalWidth = Number(canvas?.dataset?.gannzillaLogicalWidth || 0);
    const expectedTargetWidth = Math.max(1, Math.round(logicalWidth * requestedZoom * calibration));
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaPaintCrispZoomCalibrationV503 === 'true'
        && canvas.dataset.gannzillaPaintCrispMode === 'true'
        && renderScale > 1
        && Math.abs(Number(canvas.dataset.gannzillaEffectiveVisualZoom) - requestedZoom * calibration) < 0.001
        && Number(canvas.dataset.gannzillaDisplayTargetWidth) === expectedTargetWidth
        && Math.abs((Number.parseFloat(canvas.style.width) || 0) - expectedTargetWidth) < 0.6,
      build: BUILD,
      requestedZoom,
      calibration,
      effectiveVisualZoom: requestedZoom * calibration,
      renderScale,
      logicalWidth,
      canvasPixelWidth: canvas?.width || 0,
      expectedTargetWidth,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { observer, schedule, apply };
  schedule('install');
}

install();