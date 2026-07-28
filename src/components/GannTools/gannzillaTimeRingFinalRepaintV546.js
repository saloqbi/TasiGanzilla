const BUILD = 546;
const STATE_KEY = '__gannzillaTimeRingFinalRepaintV546';
const V543_STATE_KEY = '__gannzillaIndependentTimeRingV543';
const V515_STATE_KEY = '__gannzillaUnifiedPaintPreviewZoomV515';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = false) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function enabled() {
  return wheelMode()
    && boolParam('timeRing', false)
    && boolParam('gannzillaIndependentTimeRing', true);
}

function findWheel() {
  const canvas = document.querySelector([
    'canvas[data-gannzilla-independent-time-ring-v543="true"]',
    'canvas[data-gannzilla-empty-outer-ring-v518="true"]',
  ].join(','));
  return canvas instanceof HTMLCanvasElement && !canvas.closest('aside') ? canvas : null;
}

let applyCount = 0;
let lastApply = null;
let timer = 0;
let frame = 0;
let generation = 0;
let integrityTimer = 0;

function repaint(source = 'repaint') {
  if (!enabled()) return false;
  const authority = window[V543_STATE_KEY];
  if (!authority || typeof authority.drawIndependentTimeRing !== 'function') return false;

  const painted = authority.drawIndependentTimeRing(`v546:${source}`, true) === true;
  const canvas = findWheel();
  if (painted && canvas instanceof HTMLCanvasElement) {
    canvas.dataset.gannzillaTimeRingFinalRepaintV546 = 'true';
    canvas.dataset.gannzillaTimeRingFinalRepaintGenerationV546 = String(generation);
    canvas.dataset.gannzillaAuthorityBuild = String(BUILD);
  }

  const presentation = window[V515_STATE_KEY];
  if (presentation && typeof presentation.applyGeometry === 'function') {
    presentation.applyGeometry();
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    painted,
    generation,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:time-ring-final-repaint-v546', {
    detail: lastApply,
  }));
  return painted;
}

function schedule(source = 'schedule', delay = 0) {
  generation += 1;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => repaint(source));
  }, delay);
}

function scheduleCascade(source = 'cascade') {
  schedule(`${source}:20`, 20);
  window.setTimeout(() => schedule(`${source}:90`, 0), 90);
  window.setTimeout(() => schedule(`${source}:240`, 0), 240);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  [
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:center-cell-comfort-v508',
    'gannzilla:stable-pan-wheel-v510',
    'gannzilla:paint-zoom-v515',
    'gannzilla:single-visible-wheel-v535',
    'gannzilla:wheel-color-toggle-v511',
    'gannzilla:clockwise-direction-bridge-v483',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:zodiac-outer-ring-v522',
    'gannzilla:weekdays-outer-ring-v523',
    'gannzilla:metallic-angle-outer-ring-v531',
    'gannzilla:clean-outer-frame-v540',
    'gannzilla:copper-top-correction-v541',
  ].forEach((eventName) => {
    window.addEventListener(eventName, () => scheduleCascade(eventName), false);
  });

  window.addEventListener('resize', () => scheduleCascade('resize'), false);
  window.addEventListener('load', () => scheduleCascade('load'), { once: true });

  [0, 80, 180, 360, 700, 1200, 2100, 3600, 5600, 8200, 11200, 14500, 18000, 22000]
    .forEach((delay) => window.setTimeout(() => schedule(`boot-${delay}`, 0), delay));

  // Low-frequency integrity pass protects against late asynchronous redraws
  // without introducing another canvas or changing presentation geometry.
  integrityTimer = window.setInterval(() => repaint('integrity-5000'), 5000);

  window.GANNZILLA_TIME_RING_FINAL_REPAINT_V546 = true;
  window.__auditGannzillaTimeRingFinalRepaintV546 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaTimeRingFinalRepaintV546 === 'true'
        && canvas.dataset.gannzillaIndependentTimeRingV543 === 'true'
        && canvas.dataset.gannzillaTimeRingPresentationModeV545 === 'live-canvas',
      build: BUILD,
      applyCount,
      generation,
      finalRepaint: canvas?.dataset?.gannzillaTimeRingFinalRepaintV546 === 'true',
      liveCanvas: canvas?.dataset?.gannzillaTimeRingPresentationModeV545 === 'live-canvas',
      lastApply,
    };
  };

  window[STATE_KEY] = {
    repaint,
    schedule,
    scheduleCascade,
    get integrityTimer() { return integrityTimer; },
  };

  scheduleCascade('install');
}

install();