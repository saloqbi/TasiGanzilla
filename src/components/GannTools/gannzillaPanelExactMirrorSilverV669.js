const BUILD = 669;
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const STYLE_ID = 'gannzilla-panel-exact-mirror-silver-v669';
const CLASS_NAME = 'gannzilla-panel-exact-mirror-silver-v669';
const STATE_KEY = '__gannzillaPanelExactMirrorSilverV669';
const ENABLE_PARAM = 'panelExactMirrorSilver';

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

function installStyle() {
  if (!enabled()) return false;

  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${PANEL_ID}.${CLASS_NAME} {
      --gz669-dark: #17232b;
      --gz669-mid-dark: #50616c;
      --gz669-mid: #9caab2;
      --gz669-light: #edf8fc;
      --gz669-white: #ffffff;
      --gz669-blue: #0a5d9c;
      position: fixed !important;
      border: 5px solid transparent !important;
      border-radius: 18px !important;
      color: #111820 !important;
      background:
        repeating-linear-gradient(0deg,
          rgba(255,255,255,.20) 0px,
          rgba(255,255,255,.20) 1px,
          rgba(79,94,103,.045) 1px,
          rgba(79,94,103,.045) 2px),
        linear-gradient(90deg,
          #d8e0e4 0%,
          #f9fcfd 15%,
          #b8c3c9 32%,
          #f4f8fa 50%,
          #b0bcc3 69%,
          #f8fbfc 86%,
          #d1dbe0 100%) padding-box,
        linear-gradient(128deg,
          #101820 0%,
          #526876 5%,
          #eefbff 10%,
          #ffffff 15%,
          #7f96a3 21%,
          #24343e 27%,
          #d9f3ff 34%,
          #ffffff 40%,
          #607682 47%,
          #edfaff 54%,
          #1c2b34 62%,
          #9eb5c1 70%,
          #ffffff 78%,
          #4a606c 87%,
          #e9f9ff 94%,
          #263842 100%) border-box !important;
      box-shadow:
        0 0 0 1px rgba(10,18,24,.98),
        0 0 0 2px rgba(238,250,255,.96),
        0 0 0 4px rgba(43,65,78,.86),
        7px 10px 24px rgba(10,18,25,.34),
        inset 0 0 0 1px rgba(255,255,255,.96),
        inset 0 0 18px rgba(225,244,252,.54) !important;
      isolation: isolate !important;
      overflow: hidden !important;
    }

    #${PANEL_ID}.${CLASS_NAME}::before {
      content: '';
      position: absolute;
      inset: 2px;
      z-index: 2147483001;
      pointer-events: none;
      border-radius: 12px;
      border: 1px solid rgba(231,248,255,.98);
      box-shadow:
        inset 0 0 0 1px rgba(31,48,58,.84),
        inset 0 0 0 3px rgba(255,255,255,.22),
        inset 0 0 12px rgba(255,255,255,.58),
        0 0 7px rgba(192,232,249,.58);
    }

    #${PANEL_ID}.${CLASS_NAME}::after {
      content: '';
      position: absolute;
      left: 7%;
      right: 7%;
      top: 1px;
      height: 7px;
      z-index: 2147483002;
      pointer-events: none;
      border-radius: 999px;
      background: linear-gradient(90deg,
        rgba(255,255,255,0),
        rgba(215,244,255,.48) 17%,
        rgba(255,255,255,.98) 43%,
        rgba(255,255,255,1) 52%,
        rgba(210,241,253,.50) 82%,
        rgba(255,255,255,0));
      filter: blur(.2px);
      box-shadow: 0 0 8px rgba(209,241,255,.86);
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-window-title,
    #${PANEL_ID}.${CLASS_NAME} .gz421-preset-bar,
    #${PANEL_ID}.${CLASS_NAME} .gz421-section-header,
    #${PANEL_ID}.${CLASS_NAME} .gz421-profile-switch,
    #${PANEL_ID}.${CLASS_NAME} .gz421-footer {
      color: #101820 !important;
      background:
        repeating-linear-gradient(0deg,
          rgba(255,255,255,.24) 0px,
          rgba(255,255,255,.24) 1px,
          rgba(68,82,91,.055) 1px,
          rgba(68,82,91,.055) 2px),
        linear-gradient(180deg,
          #ffffff 0%,
          #dce3e7 18%,
          #aebac1 48%,
          #eef3f5 72%,
          #c2ccd1 100%) !important;
      border-color: #62737d !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,1),
        inset 0 -1px 0 rgba(23,36,44,.70),
        0 1px 2px rgba(21,31,38,.28) !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.72) !important;
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-window-title {
      border-bottom: 1px solid #31434e !important;
      padding-left: 10px !important;
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-preset-bar {
      border-top: 1px solid rgba(255,255,255,.92) !important;
      border-bottom: 1px solid #52636d !important;
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-section {
      border-bottom-color: #87959d !important;
      background: transparent !important;
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-section-header {
      border-top: 1px solid rgba(255,255,255,.94) !important;
      border-bottom: 1px solid #6d7b84 !important;
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-section-header:hover,
    #${PANEL_ID}.${CLASS_NAME} button:hover {
      filter: brightness(1.045) contrast(1.02);
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-scroll,
    #${PANEL_ID}.${CLASS_NAME} .gz421-section-body,
    #${PANEL_ID}.${CLASS_NAME} .gz421-table-wrap,
    #${PANEL_ID}.${CLASS_NAME} table,
    #${PANEL_ID}.${CLASS_NAME} .gz421-projection-strip,
    #${PANEL_ID}.${CLASS_NAME} .gz421-matrix {
      background:
        repeating-linear-gradient(0deg,
          rgba(255,255,255,.17) 0px,
          rgba(255,255,255,.17) 1px,
          rgba(72,87,96,.040) 1px,
          rgba(72,87,96,.040) 2px),
        linear-gradient(90deg,
          #cbd4d9 0%,
          #f4f7f8 20%,
          #d3dade 48%,
          #f8fafb 71%,
          #c4ced3 100%) !important;
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-row,
    #${PANEL_ID}.${CLASS_NAME} .gz421-row:nth-child(even) {
      color: #111820 !important;
      border-bottom-color: rgba(93,108,117,.42) !important;
      background:
        repeating-linear-gradient(0deg,
          rgba(255,255,255,.12) 0px,
          rgba(255,255,255,.12) 1px,
          rgba(74,89,98,.032) 1px,
          rgba(74,89,98,.032) 2px),
        linear-gradient(90deg,
          #d3dbe0 0%,
          #f6f8f9 32%,
          #c8d1d6 62%,
          #f2f6f7 100%) !important;
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-row:nth-child(even) {
      background:
        repeating-linear-gradient(0deg,
          rgba(255,255,255,.10) 0px,
          rgba(255,255,255,.10) 1px,
          rgba(75,91,100,.036) 1px,
          rgba(75,91,100,.036) 2px),
        linear-gradient(90deg,
          #c9d2d7 0%,
          #eef3f5 34%,
          #bec9cf 65%,
          #edf2f4 100%) !important;
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-label {
      border-right-color: rgba(79,94,103,.46) !important;
      color: #111820 !important;
      font-weight: 600 !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.72) !important;
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-glyph,
    #${PANEL_ID}.${CLASS_NAME} .gz421-section-icon,
    #${PANEL_ID}.${CLASS_NAME} .gz421-toggle {
      color: #162630 !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.70) !important;
    }

    #${PANEL_ID}.${CLASS_NAME} input:not([type='checkbox']):not([type='radio']):not([type='color']),
    #${PANEL_ID}.${CLASS_NAME} select,
    #${PANEL_ID}.${CLASS_NAME} textarea,
    #${PANEL_ID}.${CLASS_NAME} button {
      color: #111820 !important;
      border: 1px solid #5f707a !important;
      border-radius: 3px !important;
      background:
        linear-gradient(180deg,
          #ffffff 0%,
          #e7ecef 22%,
          #bac5cb 53%,
          #f5f8f9 78%,
          #c4ced3 100%) !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,1),
        inset 0 -1px 0 rgba(28,42,50,.50),
        inset 1px 0 0 rgba(255,255,255,.46),
        0 1px 2px rgba(14,24,31,.25) !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.72) !important;
    }

    #${PANEL_ID}.${CLASS_NAME} input:focus,
    #${PANEL_ID}.${CLASS_NAME} select:focus,
    #${PANEL_ID}.${CLASS_NAME} textarea:focus,
    #${PANEL_ID}.${CLASS_NAME} button:focus-visible {
      outline: 1px solid rgba(50,146,204,.95) !important;
      outline-offset: 0 !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,1),
        inset 0 -1px 0 rgba(28,42,50,.50),
        0 0 0 1px rgba(214,244,255,.92),
        0 0 5px rgba(33,134,194,.62) !important;
    }

    #${PANEL_ID}.${CLASS_NAME} input[type='checkbox'],
    #${PANEL_ID}.${CLASS_NAME} input[type='radio'] {
      accent-color: #0a609e !important;
      filter: drop-shadow(0 1px 0 rgba(255,255,255,.85));
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-preset-bar button,
    #${PANEL_ID}.${CLASS_NAME} .gz421-projection-strip button,
    #${PANEL_ID}.${CLASS_NAME} .gz421-matrix button {
      border-radius: 3px !important;
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-preset-bar .add {
      color: #ffffff !important;
      border-color: #174e70 !important;
      background: radial-gradient(circle at 35% 25%, #4aa8dc 0%, #0b669f 58%, #073c63 100%) !important;
      text-shadow: 0 -1px 0 rgba(0,0,0,.42) !important;
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-scroll {
      scrollbar-color: #617580 #d9e1e5 !important;
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-scroll::-webkit-scrollbar {
      width: 12px !important;
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-scroll::-webkit-scrollbar-track {
      border-left: 1px solid #62737d !important;
      background: linear-gradient(90deg, #7f929d 0%, #edf8fc 24%, #b6c3ca 52%, #f7ffff 76%, #6f838e 100%) !important;
      box-shadow: inset 0 0 3px rgba(18,31,39,.44) !important;
    }

    #${PANEL_ID}.${CLASS_NAME} .gz421-scroll::-webkit-scrollbar-thumb {
      border: 1px solid #d9edf5 !important;
      border-radius: 7px !important;
      background: linear-gradient(90deg, #263842 0%, #9fb4bf 18%, #ffffff 38%, #738995 57%, #effcff 76%, #344a56 100%) !important;
      box-shadow:
        inset 0 0 0 1px rgba(21,35,43,.70),
        0 0 3px rgba(211,244,255,.70) !important;
    }

    #${PANEL_ID}.${CLASS_NAME} th,
    #${PANEL_ID}.${CLASS_NAME} td {
      border-color: rgba(91,107,116,.48) !important;
    }

    #${PANEL_ID}.${CLASS_NAME} th {
      color: #111820 !important;
      background: linear-gradient(180deg, #f9fcfd 0%, #bec9ce 54%, #edf2f4 100%) !important;
    }
  `;

  return true;
}

function apply(source = 'apply') {
  if (!enabled()) return false;
  installStyle();

  const panel = document.getElementById(PANEL_ID);
  if (!(panel instanceof HTMLElement)) return false;

  panel.classList.add(CLASS_NAME);
  panel.dataset.gannzillaPanelExactMirrorSilverV669 = 'true';
  panel.dataset.gannzillaPanelMaterialV669 = 'mirror-zinc-chrome-edges-and-brushed-silver-interior';
  panel.dataset.gannzillaPanelGeometryChangedV669 = 'false';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    material: 'mirror-zinc-chrome-edges-and-brushed-silver-interior',
    geometryChanged: false,
    controlsChanged: false,
    at: Date.now(),
  };
  return true;
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(ENABLE_PARAM, 'true');
    url.searchParams.set('panelMirrorZincEdges', 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Styling remains authoritative if URL replacement is unavailable.
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

  window.addEventListener('gannzilla:reference-panel-change-v421', () => schedule('panel-change', 0), false);
  window.addEventListener('resize', () => schedule('resize', 35), false);
  timer = window.setInterval(() => schedule('exact-mirror-silver-watch', 0), 1400);

  window.GANNZILLA_PANEL_EXACT_MIRROR_SILVER_V669 = true;
  window.__auditGannzillaPanelExactMirrorSilverV669 = () => {
    const panel = document.getElementById(PANEL_ID);
    return {
      ok: panel instanceof HTMLElement
        && panel.classList.contains(CLASS_NAME)
        && panel.dataset.gannzillaPanelExactMirrorSilverV669 === 'true',
      build: BUILD,
      enabled: enabled(),
      material: 'mirror-zinc-chrome-edges-and-brushed-silver-interior',
      geometryChanged: false,
      controlsChanged: false,
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
