const BUILD = 496;
const STATE_KEY = '__gannzillaReference80ZoomCalibrationV496';

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

  const dpr = clamp(Number(window.devicePixelRatio) || 1, 1, 2);
  const logicalWidth = canvas.width / dpr;
  const logicalHeight = canvas.height / dpr;
  const requestedZoom = numberParam('gannzillaZoom', 0.80, 0.10, 3.00);
  const calibration = numberParam('gannzillaReferenceZoomCalibration', 1.35, 1.00, 1.60);
  const targetWidth = logicalWidth * requestedZoom * calibration;
  const targetHeight = logicalHeight * requestedZoom * calibration;

  const currentWidth = Number.parseFloat(canvas.style.width) || 0;
  const currentHeight = Number.parseFloat(canvas.style.height) || 0;
  if (Math.abs(currentWidth - targetWidth) > 0.5) {
    canvas.style.setProperty('width', `${targetWidth}px`, 'important');
  }
  if (Math.abs(currentHeight - targetHeight) > 0.5) {
    canvas.style.setProperty('height', `${targetHeight}px`, 'important');
  }

  canvas.dataset.gannzillaReference80ZoomCalibrationV496 = 'true';
  canvas.dataset.gannzillaRequestedZoom = String(requestedZoom);
  canvas.dataset.gannzillaVisualCalibration = String(calibration);
  canvas.dataset.gannzillaEffectiveVisualZoom = String(requestedZoom * calibration);

  applyCount += 1;
  lastApply = {
    source,
    requestedZoom,
    calibration,
    effectiveVisualZoom: requestedZoom * calibration,
    targetWidth,
    targetHeight,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule', delays = [0, 60, 180, 420]) {
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
    url.searchParams.set('gannzillaReferenceZoomCalibration', url.searchParams.get('gannzillaReferenceZoomCalibration') || '1.35');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) { /* runtime remains active */ }
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode() || window[STATE_KEY]) return;
  persistFlags();

  const observer = new MutationObserver((records) => {
    const canvas = findWheel();
    if (!canvas) return;
    const changed = records.some((record) => record.target === canvas || record.target?.contains?.(canvas) || canvas.contains?.(record.target));
    if (changed) schedule('mutation', [0, 80, 240]);
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['width', 'height', 'style'],
  });

  window.addEventListener('resize', () => schedule('resize'), true);
  window.addEventListener('gannzilla:final-wheel-authority-v491', () => schedule('final-wheel'), true);
  window.addEventListener('gannzilla:wheel-pan-offset-v305', () => schedule('pan'), true);
  document.addEventListener('input', () => schedule('input'), true);
  document.addEventListener('change', () => schedule('change'), true);

  [0, 40, 120, 300, 700, 1400, 2800, 5200, 8000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, [0, 80, 240]), delay);
  });

  window.GANNZILLA_REFERENCE_80_ZOOM_CALIBRATION_V496 = true;
  window.__auditGannzillaReference80ZoomCalibrationV496 = () => {
    const canvas = findWheel();
    const requestedZoom = numberParam('gannzillaZoom', 0.80, 0.10, 3.00);
    const calibration = numberParam('gannzillaReferenceZoomCalibration', 1.35, 1.00, 1.60);
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaReference80ZoomCalibrationV496 === 'true'
        && Math.abs(Number(canvas.dataset.gannzillaEffectiveVisualZoom) - requestedZoom * calibration) < 0.001,
      build: BUILD,
      requestedZoom,
      calibration,
      effectiveVisualZoom: requestedZoom * calibration,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { observer, schedule, apply };
  schedule('install');
}

install();
