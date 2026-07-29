const BUILD = 599;
const STATE_KEY = '__gannzillaCenterLogoDigitalClockToggleV599';
const LOGO_ID = 'gannzilla-center-logo-responsive-81-v596';
const CLOCK_ID = 'gannzilla-center-digital-clock-v599';
const STYLE_ID = 'gannzilla-center-digital-clock-style-v599';

let mode = 'logo';
let frame = 0;
let clockTimer = 0;
let styleObserver = null;
let observedLogo = null;
let applyCount = 0;
let toggleCount = 0;
let lastApply = null;
let lastToggle = null;

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
    #${LOGO_ID} {
      cursor: pointer !important;
    }

    #${CLOCK_ID} {
      position: absolute !important;
      z-index: 81 !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      border: 2px solid rgba(190, 141, 46, 0.98) !important;
      border-radius: 50% !important;
      clip-path: circle(50% at 50% 50%) !important;
      background: radial-gradient(circle at 50% 42%, #15100a 0%, #070604 54%, #020202 100%) !important;
      color: #f6d88a !important;
      font-family: "Courier New", Consolas, monospace !important;
      font-variant-numeric: tabular-nums !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      letter-spacing: 0.015em !important;
      text-align: center !important;
      align-items: center !important;
      justify-content: center !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      cursor: pointer !important;
      pointer-events: auto !important;
      user-select: none !important;
      transform: translate3d(-50%, -50%, 0) !important;
      transform-origin: center center !important;
      transition: none !important;
      animation: none !important;
      box-shadow: inset 0 0 24px rgba(190, 141, 46, 0.16) !important;
    }
  `;
}

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return;
  if (element.style.getPropertyValue(property) === value
      && element.style.getPropertyPriority(property) === 'important') return;
  element.style.setProperty(property, value, 'important');
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function currentTimeText() {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function updateClockText() {
  const clock = document.getElementById(CLOCK_ID);
  if (!(clock instanceof HTMLDivElement)) return false;
  const nextText = currentTimeText();
  if (clock.textContent !== nextText) clock.textContent = nextText;
  clock.setAttribute('aria-label', `الوقت الحالي ${nextText}. اضغط للعودة إلى الشعار`);
  return true;
}

function handleToggleKey(event, nextMode, source) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  setMode(nextMode, source);
}

function attachLogoInteraction(logo) {
  if (!(logo instanceof HTMLImageElement) || logo.dataset.gannzillaClockToggleBoundV599 === 'true') return;
  logo.dataset.gannzillaClockToggleBoundV599 = 'true';
  logo.setAttribute('role', 'button');
  logo.setAttribute('tabindex', '0');
  logo.setAttribute('aria-label', 'اضغط لعرض الساعة الرقمية');
  logo.title = 'اضغط لعرض الساعة الرقمية';
  logo.addEventListener('click', () => setMode('clock', 'logo-click'), false);
  logo.addEventListener('keydown', (event) => handleToggleKey(event, 'clock', 'logo-keyboard'), false);
}

function ensureClock(logo) {
  const stage = logo?.parentElement;
  if (!(logo instanceof HTMLImageElement) || !(stage instanceof HTMLElement)) return null;

  let clock = document.getElementById(CLOCK_ID);
  if (!(clock instanceof HTMLDivElement)) {
    clock = document.createElement('div');
    clock.id = CLOCK_ID;
    clock.setAttribute('role', 'button');
    clock.setAttribute('tabindex', '0');
    clock.title = 'اضغط للعودة إلى الشعار';
    clock.dataset.gannzillaCenterDigitalClockV599 = 'true';
    clock.addEventListener('click', () => setMode('logo', 'clock-click'), false);
    clock.addEventListener('keydown', (event) => handleToggleKey(event, 'logo', 'clock-keyboard'), false);
  }

  if (clock.parentElement !== stage) stage.appendChild(clock);
  return clock;
}

function applyMode(logo, clock) {
  const logoReady = logo.complete && logo.naturalWidth > 0 && logo.naturalHeight > 0;

  if (mode === 'clock') {
    setImportant(logo, 'visibility', 'hidden');
    setImportant(logo, 'opacity', '0');
    setImportant(logo, 'pointer-events', 'none');
    setImportant(clock, 'display', 'flex');
    setImportant(clock, 'visibility', 'visible');
    setImportant(clock, 'opacity', '1');
    setImportant(clock, 'pointer-events', 'auto');
    return;
  }

  setImportant(clock, 'display', 'none');
  setImportant(clock, 'visibility', 'hidden');
  setImportant(clock, 'opacity', '0');
  setImportant(clock, 'pointer-events', 'none');
  setImportant(logo, 'pointer-events', 'auto');
  setImportant(logo, 'visibility', logoReady ? 'visible' : 'hidden');
  setImportant(logo, 'opacity', logoReady ? '1' : '0');
}

function syncGeometry(source = 'sync') {
  frame = 0;
  if (!enabled()) return false;

  ensureStyle();
  const logo = document.getElementById(LOGO_ID);
  if (!(logo instanceof HTMLImageElement)) return false;

  attachLogoInteraction(logo);
  const clock = ensureClock(logo);
  if (!(clock instanceof HTMLDivElement)) return false;

  ['left', 'top', 'width', 'height'].forEach((property) => {
    const value = logo.style.getPropertyValue(property);
    if (value) setImportant(clock, property, value);
  });

  const diameter = Number.parseFloat(logo.style.getPropertyValue('width'))
    || logo.getBoundingClientRect().width
    || 0;
  if (diameter > 0) {
    setImportant(clock, 'font-size', `${Math.max(24, diameter * 0.17).toFixed(3)}px`);
  }

  applyMode(logo, clock);
  updateClockText();
  attachStyleObserver(logo);

  applyCount += 1;
  lastApply = {
    source,
    mode,
    diameter,
    left: logo.style.getPropertyValue('left'),
    top: logo.style.getPropertyValue('top'),
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => syncGeometry(source));
}

function attachStyleObserver(logo) {
  if (typeof MutationObserver !== 'function' || !(logo instanceof HTMLImageElement)) return false;
  if (logo === observedLogo && styleObserver) return true;

  styleObserver?.disconnect();
  observedLogo = logo;
  styleObserver = new MutationObserver((records) => {
    if (records.some((record) => record.attributeName === 'style')) schedule('logo-style-change');
  });
  styleObserver.observe(logo, { attributes: true, attributeFilter: ['style'] });
  return true;
}

function setMode(nextMode, source = 'set-mode') {
  const normalized = nextMode === 'clock' ? 'clock' : 'logo';
  if (mode !== normalized) toggleCount += 1;
  mode = normalized;
  lastToggle = { mode, source, at: Date.now() };
  schedule(source);
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

  clockTimer = window.setInterval(updateClockText, 250);

  window.GANNZILLA_CENTER_LOGO_DIGITAL_CLOCK_TOGGLE_V599 = true;
  window.__auditGannzillaCenterLogoDigitalClockToggleV599 = () => {
    const logo = document.getElementById(LOGO_ID);
    const clock = document.getElementById(CLOCK_ID);
    const logoRect = logo?.getBoundingClientRect();
    const clockRect = clock?.getBoundingClientRect();
    return {
      ok: logo instanceof HTMLImageElement
        && clock instanceof HTMLDivElement
        && clock.parentElement === logo.parentElement
        && logo.dataset.gannzillaCenterLogoScaleV596 === '0.99'
        && Math.abs(Number(logoRect?.width || 0) - Number(clockRect?.width || 0)) < 0.5,
      build: BUILD,
      mode,
      clockText: clock?.textContent || '',
      sameGeometry: {
        width: Math.abs(Number(logoRect?.width || 0) - Number(clockRect?.width || 0)) < 0.5,
        height: Math.abs(Number(logoRect?.height || 0) - Number(clockRect?.height || 0)) < 0.5,
        centerX: Math.abs(
          Number((logoRect?.left || 0) + (logoRect?.width || 0) / 2)
          - Number((clockRect?.left || 0) + (clockRect?.width || 0) / 2),
        ) < 0.5,
        centerY: Math.abs(
          Number((logoRect?.top || 0) + (logoRect?.height || 0) / 2)
          - Number((clockRect?.top || 0) + (clockRect?.height || 0) / 2),
        ) < 0.5,
      },
      applyCount,
      toggleCount,
      lastApply,
      lastToggle,
      timerActive: Boolean(clockTimer),
    };
  };

  window[STATE_KEY] = { setMode, schedule, syncGeometry };
  schedule('install');
}

install();
