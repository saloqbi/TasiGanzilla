const BUILD = 510;
const STATE_KEY = '__gannzillaStablePanWheelV510';
const FINAL_AUTHORITY_STATE_KEY = '__gannzillaFinalWheelAuthorityV506';
const DEFAULT_WHEEL_GAIN = 3.4;
const DEFAULT_MIN_WHEEL_STEP = 56;
const DEFAULT_MAX_WHEEL_STEP = 720;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('mouseWheelPanSpeed')) {
      url.searchParams.set('mouseWheelPanSpeed', String(DEFAULT_WHEEL_GAIN));
    }
    if (!url.searchParams.has('mouseWheelMinStep')) {
      url.searchParams.set('mouseWheelMinStep', String(DEFAULT_MIN_WHEEL_STEP));
    }
    if (!url.searchParams.has('mouseWheelMaxStep')) {
      url.searchParams.set('mouseWheelMaxStep', String(DEFAULT_MAX_WHEEL_STEP));
    }
    url.searchParams.set('stablePanAuthority', 'true');
    url.searchParams.set('panTransformAllowed', 'true');
    url.searchParams.set('wheelPanRafBatch', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime controls remain active.
  }
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => canvas instanceof HTMLCanvasElement && !canvas.closest('aside'))
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

let disconnectCount = 0;
let applyCount = 0;
let lastApply = null;

function disconnectPresentationRepairObserver() {
  const authority = window[FINAL_AUTHORITY_STATE_KEY];
  const observer = authority?.observer;
  if (!observer || typeof observer.disconnect !== 'function') return false;
  observer.disconnect();
  disconnectCount += 1;
  return true;
}

function apply(source = 'apply') {
  persistFlags();
  const observerDisconnected = disconnectPresentationRepairObserver();
  const canvas = findWheel();

  if (canvas instanceof HTMLCanvasElement) {
    canvas.style.setProperty('transition', 'none', 'important');
    canvas.style.setProperty('will-change', 'transform', 'important');
    canvas.style.setProperty('transform-origin', 'center center', 'important');
    canvas.dataset.gannzillaStablePanWheelV510 = 'true';
    canvas.dataset.gannzillaPanTransformAllowed = 'true';
    canvas.dataset.gannzillaPresentationRepairObserverDisabled = 'true';
    canvas.dataset.gannzillaMouseWheelPanSpeed = String(
      Number(params().get('mouseWheelPanSpeed')) || DEFAULT_WHEEL_GAIN,
    );
    canvas.dataset.gannzillaMouseWheelMinStep = String(
      Number(params().get('mouseWheelMinStep')) || DEFAULT_MIN_WHEEL_STEP,
    );
    canvas.dataset.gannzillaMouseWheelMaxStep = String(
      Number(params().get('mouseWheelMaxStep')) || DEFAULT_MAX_WHEEL_STEP,
    );
  }

  applyCount += 1;
  lastApply = {
    source,
    observerDisconnected,
    wheelGain: Number(params().get('mouseWheelPanSpeed')) || DEFAULT_WHEEL_GAIN,
    minStep: Number(params().get('mouseWheelMinStep')) || DEFAULT_MIN_WHEEL_STEP,
    maxStep: Number(params().get('mouseWheelMaxStep')) || DEFAULT_MAX_WHEEL_STEP,
    at: Date.now(),
  };
  return canvas instanceof HTMLCanvasElement;
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || !wheelMode()
    || window[STATE_KEY]) return;

  const refresh = (event) => window.requestAnimationFrame(() => apply(event?.type || 'refresh'));

  window.addEventListener('gannzilla:final-wheel-authority-v506', refresh, false);
  window.addEventListener('gannzilla:center-cell-comfort-v508', refresh, false);
  window.addEventListener('load', refresh, { once: true });

  window.GANNZILLA_STABLE_PAN_WHEEL_V510 = true;
  window.__auditGannzillaStablePanWheelV510 = () => {
    const canvas = findWheel();
    const gain = Number(params().get('mouseWheelPanSpeed'));
    const minStep = Number(params().get('mouseWheelMinStep'));
    const maxStep = Number(params().get('mouseWheelMaxStep'));
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaStablePanWheelV510 === 'true'
        && canvas.dataset.gannzillaPanTransformAllowed === 'true'
        && canvas.dataset.gannzillaPresentationRepairObserverDisabled === 'true'
        && gain >= DEFAULT_WHEEL_GAIN
        && minStep >= DEFAULT_MIN_WHEEL_STEP
        && maxStep >= DEFAULT_MAX_WHEEL_STEP,
      build: BUILD,
      wheelGain: gain,
      minWheelStep: minStep,
      maxWheelStep: maxStep,
      panTransformAllowed: true,
      continuousPresentationRepairDisabled: true,
      repeatedMutationObserver: false,
      disconnectCount,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { refresh, apply };
  apply('install');
  [80, 260, 700, 1600].forEach((delay) => {
    window.setTimeout(() => apply(`boot-${delay}`), delay);
  });
}

install();