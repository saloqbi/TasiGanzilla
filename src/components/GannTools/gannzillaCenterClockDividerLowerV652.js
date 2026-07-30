const BUILD = 652;
const STATE_KEY = '__gannzillaCenterClockDividerLowerV652';
const DIVIDER_ID = 'gannzilla-center-clock-divider-v614';
const PARAM = 'centerClockDividerLower';
const TOP_PARAM = 'centerClockDividerTop';
const DEFAULT_TOP_PERCENT = 53;

let frame = 0;
let timer = 0;
let observer = null;
let applyCount = 0;
let lastApply = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const value = String(params().get(PARAM) || '').toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(value);
}

function dividerTopPercent() {
  const value = Number(params().get(TOP_PARAM));
  if (!Number.isFinite(value)) return DEFAULT_TOP_PERCENT;
  return Math.max(50, Math.min(58, value));
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled()) return false;

  const divider = document.getElementById(DIVIDER_ID);
  if (!(divider instanceof HTMLElement)) return false;

  const top = dividerTopPercent();
  divider.style.setProperty('top', `${top}%`, 'important');
  divider.style.setProperty('transform', 'translateY(-50%)', 'important');
  divider.dataset.gannzillaCenterClockDividerLowerV652 = 'true';
  divider.dataset.gannzillaCenterClockDividerTopV652 = String(top);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    dividerTopPercent: top,
    dividerOnly: true,
    clockSizeChanged: false,
    wheelSizeChanged: false,
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

  if (typeof MutationObserver === 'function') {
    observer = new MutationObserver(() => schedule('dom-change'));
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener('resize', () => schedule('window-resize'), false);
  timer = window.setInterval(() => schedule('divider-watch'), 750);

  window.GANNZILLA_CENTER_CLOCK_DIVIDER_LOWER_V652 = true;
  window.__auditGannzillaCenterClockDividerLowerV652 = () => {
    const divider = document.getElementById(DIVIDER_ID);
    const top = dividerTopPercent();
    return {
      ok: enabled()
        && divider instanceof HTMLElement
        && divider.dataset.gannzillaCenterClockDividerLowerV652 === 'true'
        && Number(divider.dataset.gannzillaCenterClockDividerTopV652) === top,
      build: BUILD,
      dividerTopPercent: top,
      dividerOnly: true,
      clockSizeChanged: false,
      wheelSizeChanged: false,
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
