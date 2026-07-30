const BUILD = 641;
const STATE_KEY = '__gannzillaTopIconShadowRemovalV641';
const STYLE_ID = 'gannzilla-top-icon-shadow-removal-style-v641';
const PARAM = 'removeIconShadow';

const SELECTORS = [
  '#gannzilla-unified-wheel-tools-v453',
  '#gannzilla-unified-eye-v509',
  '#gannzilla-panel-visibility-eye-v511',
  '#gannzilla-time-tracker-visibility-clock-v578',
  '#gannzilla-unified-move-wrap-v509',
  '#gannzilla-unified-move-v509',
  '#gannzilla-unified-zoom-group-v509',
  '#gannzilla-unified-zoom-out-v509',
  '#gannzilla-unified-zoom-select-v509',
  '#gannzilla-unified-zoom-in-v509',
  '#gannzilla-unified-fullscreen-v509',
  '#gannzilla-top-center-drawing-trigger-v471',
  '#gannzilla-wheel-color-toggle-v511',
  '#gannzilla-connection-control-v439',
  '#gannzilla-connection-button-v439',
  '#gannzilla-right-language-control-v438',
  '#gannzilla-right-language-button-v438',
];

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

function ensureStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  } else if (style !== document.head.lastElementChild) {
    document.head.appendChild(style);
  }

  const targets = SELECTORS.join(',');
  const svgTargets = SELECTORS.map((selector) => `${selector} svg`).join(',');
  style.textContent = `
    ${targets} {
      box-shadow: none !important;
      filter: none !important;
      text-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }

    ${svgTargets} {
      filter: none !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }

    #gannzilla-unified-wheel-tools-v453::before,
    #gannzilla-unified-wheel-tools-v453::after,
    #gannzilla-right-language-control-v438::before,
    #gannzilla-right-language-control-v438::after {
      content: none !important;
      display: none !important;
      box-shadow: none !important;
      filter: none !important;
    }
  `;
  return true;
}

function apply(source = 'apply') {
  if (!enabled()) return false;
  ensureStyle();

  const existing = SELECTORS
    .map((selector) => document.querySelector(selector))
    .filter((element) => element instanceof HTMLElement);

  existing.forEach((element) => {
    element.style.setProperty('box-shadow', 'none', 'important');
    element.style.setProperty('filter', 'none', 'important');
    element.style.setProperty('text-shadow', 'none', 'important');
    element.style.setProperty('backdrop-filter', 'none', 'important');
    element.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
  });

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    iconsOnly: true,
    wheelChanged: false,
    panelChanged: false,
    removedShadowCount: existing.length,
    at: Date.now(),
  };
  return existing.length > 0;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled() || window[STATE_KEY]) return;

  [0, 40, 120, 300, 700, 1500, 3200].forEach((delay) => {
    window.setTimeout(() => apply(`boot-${delay}`), delay);
  });

  if (typeof MutationObserver === 'function') {
    observer = new MutationObserver(() => apply('dom-change'));
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener('resize', () => apply('window-resize'), false);
  timer = window.setInterval(() => apply('shadow-watch'), 500);

  window.GANNZILLA_TOP_ICON_SHADOW_REMOVAL_V641 = true;
  window.__auditGannzillaTopIconShadowRemovalV641 = () => {
    const toolbar = document.getElementById('gannzilla-unified-wheel-tools-v453');
    const computed = toolbar instanceof HTMLElement ? getComputedStyle(toolbar) : null;
    return {
      ok: enabled() && (!(toolbar instanceof HTMLElement) || computed?.boxShadow === 'none'),
      build: BUILD,
      iconsOnly: true,
      wheelChanged: false,
      panelChanged: false,
      toolbarBoxShadow: computed?.boxShadow || null,
      timerActive: Boolean(timer),
      observerActive: Boolean(observer),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, ensureStyle };
  apply('install');
}

install();
