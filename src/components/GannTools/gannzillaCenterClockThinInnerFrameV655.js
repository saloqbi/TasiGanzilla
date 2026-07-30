const BUILD = 655;
const STATE_KEY = '__gannzillaCenterClockThinInnerFrameV655';
const PARAM = 'centerClockThinInnerFrame';
const DISPLAY_ID = 'gannzilla-center-clock-display-v614';

let frame = 0;
let timer = 0;
let observer = null;
let observedDisplay = null;
let applying = false;
let applyCount = 0;
let lastApply = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  const value = String(query.get(PARAM) || '').toLowerCase();
  return wheelMode && ['true', '1', 'yes', 'on'].includes(value);
}

function thinFrameShadow() {
  return [
    'inset 0 0 0 1px #382015',
    'inset 0 0 0 3px #8b512b',
    'inset 0 0 0 5px #c9954f',
    'inset 0 0 0 7.5px #f1d49b',
    'inset 0 0 0 9.5px #70401f',
    'inset 0 0 14px rgba(55,29,16,0.18)',
  ].join(', ');
}

function bindObserver(display) {
  if (!(display instanceof HTMLDivElement) || observedDisplay === display) return;
  observer?.disconnect();
  observedDisplay = display;
  observer = new MutationObserver(() => {
    if (!applying) schedule('frame-style-overwrite');
  });
  observer.observe(display, { attributes: true, attributeFilter: ['style'] });
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled() || applying) return false;

  const display = document.getElementById(DISPLAY_ID);
  if (!(display instanceof HTMLDivElement)) return false;

  applying = true;
  try {
    display.style.setProperty('box-shadow', thinFrameShadow(), 'important');
    display.dataset.gannzillaCenterClockThinInnerFrameV655 = 'true';
    display.dataset.gannzillaCenterClockInnerFrameOuterInsetV655 = '9.5';
  } finally {
    applying = false;
  }

  bindObserver(display);
  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    frameOnly: true,
    previousOuterInsetPx: 11.5,
    newOuterInsetPx: 9.5,
    gainedInnerDiameterPx: 4,
    wheelSizeChanged: false,
    wheelGeometryChanged: false,
    clockDiameterChanged: false,
    textLayoutChanged: false,
    dividerChanged: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => apply(source));
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  [0, 60, 160, 360, 800, 1600, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  [
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name), false));

  window.addEventListener('resize', () => schedule('window-resize'), false);
  timer = window.setInterval(() => schedule('thin-frame-watch'), 400);

  window.GANNZILLA_CENTER_CLOCK_THIN_INNER_FRAME_V655 = true;
  window.__auditGannzillaCenterClockThinInnerFrameV655 = () => {
    const display = document.getElementById(DISPLAY_ID);
    return {
      ok: enabled()
        && display instanceof HTMLDivElement
        && display.dataset.gannzillaCenterClockThinInnerFrameV655 === 'true'
        && display.dataset.gannzillaCenterClockInnerFrameOuterInsetV655 === '9.5',
      build: BUILD,
      frameOnly: true,
      wheelSizeChanged: false,
      wheelGeometryChanged: false,
      clockDiameterChanged: false,
      textLayoutChanged: false,
      dividerChanged: false,
      applyCount,
      observerActive: Boolean(observer),
      timerActive: Boolean(timer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
