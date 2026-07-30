const BUILD = 670;
const STYLE_ID = 'gannzilla-toolbar-icon-mirror-frames-v670';
const STATE_KEY = '__gannzillaToolbarIconMirrorFramesV670';
const ENABLE_PARAM = 'toolbarIconMirrorFrames';

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

function targetSelector() {
  return [
    '#gannzilla-unified-wheel-tools-v453 button',
    '#gannzilla-unified-wheel-tools-v453 select',
    '#gannzilla-top-center-drawing-trigger-v471',
    '#gannzilla-wheel-color-toggle-v511',
    '#gannzilla-panel-visibility-eye-v511',
    '#gannzilla-time-tracker-visibility-clock-v578',
    '#gannzilla-connection-button-v439',
    '#gannzilla-right-language-button-v438',
    '#gannzilla-top-reference-toolbar-v430 button',
    '#gannzilla-top-reference-toolbar-v430 .gz430-readout',
  ].join(',');
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

  const targets = targetSelector();
  style.textContent = `
    ${targets} {
      border: 2px solid transparent !important;
      border-radius: 4px !important;
      background:
        linear-gradient(180deg,
          rgba(255,255,255,.98) 0%,
          rgba(238,243,246,.98) 38%,
          rgba(198,207,213,.98) 64%,
          rgba(247,250,251,.98) 100%) padding-box,
        linear-gradient(132deg,
          #17232b 0%,
          #718793 8%,
          #f7fdff 16%,
          #ffffff 24%,
          #879aa5 34%,
          #273944 43%,
          #dff6ff 52%,
          #ffffff 61%,
          #637984 72%,
          #eefbff 83%,
          #ffffff 91%,
          #314550 100%) border-box !important;
      box-shadow:
        0 0 0 1px rgba(25,39,48,.88),
        inset 0 1px 0 rgba(255,255,255,1),
        inset 0 -1px 0 rgba(37,54,64,.60),
        inset 1px 0 0 rgba(255,255,255,.58),
        0 1px 3px rgba(12,23,30,.28),
        0 0 4px rgba(204,239,252,.46) !important;
      background-clip: padding-box, border-box !important;
      text-shadow: inherit !important;
    }

    ${targets}:hover {
      filter: brightness(1.07) contrast(1.025) !important;
      box-shadow:
        0 0 0 1px rgba(20,36,46,.94),
        inset 0 1px 0 rgba(255,255,255,1),
        inset 0 -1px 0 rgba(33,52,63,.64),
        0 1px 4px rgba(8,20,28,.32),
        0 0 7px rgba(192,234,252,.74) !important;
    }

    ${targets}:focus-visible {
      outline: 1px solid rgba(63,158,211,.95) !important;
      outline-offset: 1px !important;
    }

    #gannzilla-unified-wheel-tools-v453 button svg,
    #gannzilla-top-center-drawing-trigger-v471 svg,
    #gannzilla-wheel-color-toggle-v511 svg,
    #gannzilla-panel-visibility-eye-v511 svg,
    #gannzilla-time-tracker-visibility-clock-v578 svg,
    #gannzilla-connection-button-v439 svg,
    #gannzilla-right-language-button-v438 svg {
      filter: none !important;
    }
  `;

  return true;
}

function apply(source = 'apply') {
  if (!enabled()) return false;
  installStyle();

  const controls = Array.from(document.querySelectorAll(targetSelector()));
  controls.forEach((control) => {
    if (!(control instanceof HTMLElement)) return;
    control.dataset.gannzillaToolbarIconMirrorFrameV670 = 'true';
    control.dataset.gannzillaToolbarFrameOnlyV670 = 'true';
  });

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    controlCount: controls.length,
    frameOnly: true,
    iconGlyphsChanged: false,
    geometryChanged: false,
    at: Date.now(),
  };
  return controls.length > 0;
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(ENABLE_PARAM, 'true');
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

  [0, 40, 100, 220, 500, 1000, 1800, 3200, 5200, 8200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  observer = new MutationObserver(() => schedule('mutation', 10));
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', () => schedule('resize', 35), false);
  timer = window.setInterval(() => schedule('toolbar-frame-watch', 0), 1400);

  window.GANNZILLA_TOOLBAR_ICON_MIRROR_FRAMES_V670 = true;
  window.__auditGannzillaToolbarIconMirrorFramesV670 = () => {
    const controls = Array.from(document.querySelectorAll(targetSelector()));
    const styled = controls.filter((control) => control instanceof HTMLElement
      && control.dataset.gannzillaToolbarIconMirrorFrameV670 === 'true');
    return {
      ok: controls.length > 0 && styled.length === controls.length,
      build: BUILD,
      enabled: enabled(),
      controlCount: controls.length,
      styledControlCount: styled.length,
      frameOnly: true,
      iconGlyphsChanged: false,
      geometryChanged: false,
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
