const BUILD = 672;
const STRIP_ID = 'gannzilla-full-mirror-toolbar-strip-v672';
const STYLE_ID = 'gannzilla-full-mirror-toolbar-strip-style-v672';
const STATE_KEY = '__gannzillaToolbarFullMirrorStripV672';
const ENABLE_PARAM = 'toolbarFullMirrorStrip';
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const BAR_HEIGHT = 32;

let observer = null;
let timer = 0;
let applyCount = 0;
let lastApply = null;

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
  return wheelMode() && boolParam(ENABLE_PARAM, false);
}

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return;
  element.style.setProperty(property, value, 'important');
}

function ensureStrip() {
  let strip = document.getElementById(STRIP_ID);
  if (!(strip instanceof HTMLElement)) {
    strip = document.createElement('div');
    strip.id = STRIP_ID;
    strip.setAttribute('aria-hidden', 'true');
    strip.dataset.gannzillaToolbarFullMirrorStripV672 = 'true';
    document.body.appendChild(strip);
  }
  return strip;
}

function installStyle() {
  if (!enabled()) return false;

  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  } else if (style !== document.head.lastElementChild) {
    document.head.appendChild(style);
  }

  style.textContent = `
    :root { --gannzilla-toolbar-height: ${BAR_HEIGHT}px !important; }

    #${STRIP_ID} {
      position: fixed !important;
      top: 2px !important;
      left: 2px !important;
      right: 2px !important;
      width: auto !important;
      height: ${BAR_HEIGHT - 4}px !important;
      min-height: ${BAR_HEIGHT - 4}px !important;
      max-height: ${BAR_HEIGHT - 4}px !important;
      z-index: 2147483600 !important;
      pointer-events: none !important;
      box-sizing: border-box !important;
      border: 3px solid transparent !important;
      border-radius: 8px !important;
      background:
        repeating-linear-gradient(0deg,
          rgba(255,255,255,.20) 0px,
          rgba(255,255,255,.20) 1px,
          rgba(68,84,94,.045) 1px,
          rgba(68,84,94,.045) 2px) padding-box,
        linear-gradient(180deg,
          #ffffff 0%,
          #e8eef1 15%,
          #aebbc3 42%,
          #f9fcfd 67%,
          #c2cdd3 100%) padding-box,
        linear-gradient(128deg,
          #14212a 0%,
          #617783 6%,
          #eefaff 12%,
          #ffffff 18%,
          #718894 25%,
          #20313b 32%,
          #dff5ff 40%,
          #ffffff 48%,
          #5f7581 57%,
          #edfaff 66%,
          #ffffff 76%,
          #536a76 86%,
          #f1fbff 94%,
          #263943 100%) border-box !important;
      background-clip: padding-box, padding-box, border-box !important;
      box-shadow:
        0 0 0 1px rgba(17,29,37,.94),
        0 0 0 2px rgba(228,246,253,.94),
        inset 0 1px 0 rgba(255,255,255,1),
        inset 0 -1px 0 rgba(28,45,55,.70),
        inset 0 0 13px rgba(217,241,251,.58),
        0 2px 7px rgba(10,19,25,.32) !important;
      overflow: hidden !important;
    }

    #${STRIP_ID}::before {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: 4px;
      border: 1px solid rgba(243,252,255,.98);
      box-shadow:
        inset 0 0 0 1px rgba(45,62,72,.72),
        inset 0 0 7px rgba(255,255,255,.70);
    }

    #${STRIP_ID}::after {
      content: '';
      position: absolute;
      left: 3%;
      right: 3%;
      top: 2px;
      height: 5px;
      border-radius: 999px;
      background: linear-gradient(90deg,
        rgba(255,255,255,0),
        rgba(217,244,255,.62) 15%,
        rgba(255,255,255,1) 45%,
        rgba(255,255,255,1) 54%,
        rgba(214,242,253,.58) 84%,
        rgba(255,255,255,0));
      box-shadow: 0 0 7px rgba(203,239,253,.88);
    }

    #gannzilla-unified-wheel-tools-v453,
    #gannzilla-top-center-drawing-trigger-v471,
    #gannzilla-wheel-color-toggle-v511,
    #gannzilla-connection-control-v439,
    #gannzilla-right-language-control-v438,
    #gannzilla-top-reference-toolbar-v430 {
      z-index: 2147483646 !important;
    }

    #gannzilla-unified-wheel-tools-v453 {
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
    }

    #gannzilla-connection-control-v439,
    #gannzilla-right-language-control-v438 {
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
    }

    #${PANEL_ID} {
      top: ${BAR_HEIGHT}px !important;
      height: calc(100vh - ${BAR_HEIGHT}px) !important;
    }
  `;

  return true;
}

function applyLayout() {
  const strip = ensureStrip();
  setImportant(strip, 'display', 'block');

  const topLevelIds = [
    'gannzilla-unified-wheel-tools-v453',
    'gannzilla-top-center-drawing-trigger-v471',
    'gannzilla-wheel-color-toggle-v511',
    'gannzilla-connection-control-v439',
    'gannzilla-right-language-control-v438',
  ];

  topLevelIds.forEach((id) => {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLElement)) return;
    setImportant(element, 'top', '5px');
    setImportant(element, 'z-index', '2147483646');
  });

  const panel = document.getElementById(PANEL_ID);
  if (panel instanceof HTMLElement) {
    setImportant(panel, 'top', `${BAR_HEIGHT}px`);
    setImportant(panel, 'height', `calc(100vh - ${BAR_HEIGHT}px)`);
  }

  return topLevelIds
    .map((id) => document.getElementById(id))
    .filter((element) => element instanceof HTMLElement).length;
}

function apply(source = 'apply') {
  if (!enabled()) return false;
  installStyle();
  const controlGroupCount = applyLayout();

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    fullWidthMirrorStrip: true,
    stripHeightPx: BAR_HEIGHT,
    controlGroupCount,
    iconGlyphsChanged: false,
    wheelGeometryChanged: false,
    at: Date.now(),
  };
  return controlGroupCount > 0;
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(ENABLE_PARAM, 'true');
    url.searchParams.set('toolbarIconMirrorFrames', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime styling remains authoritative.
  }
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(schedule.timer);
  schedule.timer = window.setTimeout(() => apply(source), delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  persistFlags();
  installStyle();

  [0, 20, 60, 120, 240, 500, 1000, 1800, 3200, 5200, 8200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  observer = new MutationObserver(() => schedule('mutation', 0));
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  });

  window.addEventListener('resize', () => schedule('resize', 0), false);
  timer = window.setInterval(() => apply('full-strip-watch'), 100);

  window.GANNZILLA_TOOLBAR_FULL_MIRROR_STRIP_V672 = true;
  window.__auditGannzillaToolbarFullMirrorStripV672 = () => {
    const strip = document.getElementById(STRIP_ID);
    const panel = document.getElementById(PANEL_ID);
    return {
      ok: strip instanceof HTMLElement
        && strip.dataset.gannzillaToolbarFullMirrorStripV672 === 'true'
        && strip.getBoundingClientRect().width >= Math.max(1, window.innerWidth - 8),
      build: BUILD,
      enabled: enabled(),
      stripMounted: strip instanceof HTMLElement,
      stripWidthPx: strip ? Math.round(strip.getBoundingClientRect().width) : null,
      viewportWidthPx: window.innerWidth,
      fullWidthMirrorStrip: true,
      panelOffsetPx: panel ? Math.round(panel.getBoundingClientRect().top) : null,
      iconGlyphsChanged: false,
      wheelGeometryChanged: false,
      applyCount,
      observerActive: Boolean(observer),
      timerActive: Boolean(timer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule, installStyle };
  schedule('install');
}

install();
