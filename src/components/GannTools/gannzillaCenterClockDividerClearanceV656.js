const BUILD = 656;
const STATE_KEY = '__gannzillaCenterClockDividerClearanceV656';
const PARAM = 'centerClockDividerClearance';
const TOP_PARAM = 'centerClockDividerTop';
const DIVIDER_ID = 'gannzilla-center-clock-divider-v614';
const DEFAULT_TOP = 55.5;

let frame = 0;
let timer = 0;
let observer = null;
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

function dividerTop() {
  const value = Number(params().get(TOP_PARAM));
  if (!Number.isFinite(value)) return DEFAULT_TOP;
  return Math.max(53, Math.min(58, value));
}

function bindObserver(divider) {
  if (!(divider instanceof HTMLElement) || observer) return;
  observer = new MutationObserver(() => {
    if (!applying) schedule('divider-style-overwrite');
  });
  observer.observe(divider, { attributes: true, attributeFilter: ['style'] });
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled() || applying) return false;

  const divider = document.getElementById(DIVIDER_ID);
  if (!(divider instanceof HTMLElement)) return false;

  const top = dividerTop();
  applying = true;
  try {
    divider.style.setProperty('top', `${top}%`, 'important');
    divider.style.setProperty('transform', 'translateY(-50%)', 'important');
    divider.dataset.gannzillaCenterClockDividerClearanceV656 = 'true';
    divider.dataset.gannzillaCenterClockDividerTopV656 = String(top);
  } finally {
    applying = false;
  }

  bindObserver(divider);
  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    dividerTopPercent: top,
    dividerOnly: true,
    innerFrameChanged: false,
    wheelSizeChanged: false,
    wheelGeometryChanged: false,
    clockDiameterChanged: false,
    textLayoutChanged: false,
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
  timer = window.setInterval(() => schedule('divider-clearance-watch'), 500);

  window.GANNZILLA_CENTER_CLOCK_DIVIDER_CLEARANCE_V656 = true;
  window.__auditGannzillaCenterClockDividerClearanceV656 = () => {
    const divider = document.getElementById(DIVIDER_ID);
    const top = dividerTop();
    return {
      ok: enabled()
        && divider instanceof HTMLElement
        && divider.dataset.gannzillaCenterClockDividerClearanceV656 === 'true'
        && Number(divider.dataset.gannzillaCenterClockDividerTopV656) === top,
      build: BUILD,
      dividerTopPercent: top,
      dividerOnly: true,
      innerFrameChanged: false,
      wheelSizeChanged: false,
      wheelGeometryChanged: false,
      clockDiameterChanged: false,
      textLayoutChanged: false,
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
