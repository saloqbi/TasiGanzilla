const BUILD = 600;
const STATE_KEY = '__gannzillaCenterLogoClockClickBridgeV600';
const LOGO_ID = 'gannzilla-center-logo-responsive-81-v596';
const CLOCK_ID = 'gannzilla-center-digital-clock-v599';
const TOGGLE_STATE_KEY = '__gannzillaCenterLogoDigitalClockToggleV599';
const HIT_ID = 'gannzilla-center-logo-clock-hit-v600';
const STYLE_ID = 'gannzilla-center-logo-clock-hit-style-v600';

let frame = 0;
let observer = null;
let observedLogo = null;
let clickCount = 0;
let lastClick = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  const logoEnabled = !['false', '0', 'off', 'no'].includes(
    String(query.get('centerLogo') || 'true').toLowerCase(),
  );
  const toggleEnabled = !['false', '0', 'off', 'no'].includes(
    String(query.get('centerLogoClockToggle') || 'true').toLowerCase(),
  );
  return wheelMode && logoEnabled && toggleEnabled;
}

function ensureStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${HIT_ID} {
      position: absolute !important;
      z-index: 82 !important;
      display: block !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      border-radius: 50% !important;
      background: transparent !important;
      color: transparent !important;
      opacity: 1 !important;
      cursor: pointer !important;
      pointer-events: auto !important;
      user-select: none !important;
      transform: translate3d(-50%, -50%, 0) !important;
      transform-origin: center center !important;
      touch-action: manipulation !important;
      -webkit-tap-highlight-color: transparent !important;
    }
  `;
}

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return;
  element.style.setProperty(property, value, 'important');
}

function toggleMode(source) {
  const authority = window[TOGGLE_STATE_KEY];
  if (!authority || typeof authority.setMode !== 'function') return false;

  const clock = document.getElementById(CLOCK_ID);
  const clockVisible = clock instanceof HTMLElement
    && getComputedStyle(clock).display !== 'none'
    && getComputedStyle(clock).visibility !== 'hidden'
    && Number(getComputedStyle(clock).opacity || 0) > 0;

  authority.setMode(clockVisible ? 'logo' : 'clock', source);
  clickCount += 1;
  lastClick = { nextMode: clockVisible ? 'logo' : 'clock', source, at: Date.now() };
  return true;
}

function ensureHitTarget(logo) {
  const stage = logo?.parentElement;
  if (!(logo instanceof HTMLImageElement) || !(stage instanceof HTMLElement)) return null;

  let hit = document.getElementById(HIT_ID);
  if (!(hit instanceof HTMLButtonElement)) {
    hit = document.createElement('button');
    hit.id = HIT_ID;
    hit.type = 'button';
    hit.setAttribute('aria-label', 'تبديل الشعار والساعة الرقمية');
    hit.title = 'اضغط للتبديل بين الشعار والساعة الرقمية';
    hit.dataset.gannzillaCenterLogoClockHitV600 = 'true';
    hit.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      event.stopPropagation();
    }, true);
    hit.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleMode('hit-target-click');
    }, true);
  }

  if (hit.parentElement !== stage) stage.appendChild(hit);
  return hit;
}

function sync(source = 'sync') {
  frame = 0;
  if (!enabled()) return false;

  ensureStyle();
  const logo = document.getElementById(LOGO_ID);
  if (!(logo instanceof HTMLImageElement)) return false;

  const hit = ensureHitTarget(logo);
  if (!(hit instanceof HTMLButtonElement)) return false;

  ['left', 'top', 'width', 'height'].forEach((property) => {
    const value = logo.style.getPropertyValue(property);
    if (value) setImportant(hit, property, value);
  });

  attachObserver(logo);
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => sync(source));
}

function attachObserver(logo) {
  if (typeof MutationObserver !== 'function' || !(logo instanceof HTMLImageElement)) return false;
  if (logo === observedLogo && observer) return true;

  observer?.disconnect();
  observedLogo = logo;
  observer = new MutationObserver((records) => {
    if (records.some((record) => record.attributeName === 'style')) schedule('logo-style-change');
  });
  observer.observe(logo, { attributes: true, attributeFilter: ['style'] });
  return true;
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  ensureStyle();

  [
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name), false));

  window.addEventListener('resize', () => schedule('window-resize'), false);

  [0, 80, 220, 600, 1400, 3000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.GANNZILLA_CENTER_LOGO_CLOCK_CLICK_BRIDGE_V600 = true;
  window.__auditGannzillaCenterLogoClockClickBridgeV600 = () => {
    const logo = document.getElementById(LOGO_ID);
    const hit = document.getElementById(HIT_ID);
    const logoRect = logo?.getBoundingClientRect();
    const hitRect = hit?.getBoundingClientRect();
    return {
      ok: logo instanceof HTMLImageElement
        && hit instanceof HTMLButtonElement
        && hit.parentElement === logo.parentElement
        && Math.abs(Number(logoRect?.width || 0) - Number(hitRect?.width || 0)) < 0.5
        && Math.abs(Number(logoRect?.height || 0) - Number(hitRect?.height || 0)) < 0.5,
      build: BUILD,
      clickCount,
      lastClick,
      toggleAuthorityReady: Boolean(
        window[TOGGLE_STATE_KEY] && typeof window[TOGGLE_STATE_KEY].setMode === 'function'
      ),
    };
  };

  window[STATE_KEY] = { schedule, sync, toggleMode };
  schedule('install');
}

install();
