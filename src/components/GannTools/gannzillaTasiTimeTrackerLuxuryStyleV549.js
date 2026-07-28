const BUILD = 549;
const STATE_KEY = '__gannzillaTasiTimeTrackerLuxuryStyleV549';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const STYLE_ID = 'gannzilla-tasi-time-tracker-luxury-style-v549';
const TITLE_CLASS = 'tasi-luxury-title-v549';
const GUIDE_CLASS = 'tasi-luxury-guide-v549';
const GEM_CLASS = 'tasi-luxury-gem-v549';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = false) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  return wheelMode
    && boolParam('timeTracker', false)
    && boolParam('timeTrackerLuxuryStyle', true);
}

function cssText() {
  return `
    :host {
      --v549-ivory-0: #f4d9ad;
      --v549-ivory-1: #d9ad75;
      --v549-ivory-2: #b6793d;
      --v549-copper-0: #2c0f04;
      --v549-copper-1: #6d2b0d;
      --v549-copper-2: #b25c22;
      --v549-copper-3: #eaa266;
      --v549-cell: #080706;
      --v549-active: #ff8b34;
      --v549-cell-min: 18px;
      font-family: "Noto Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif !important;
    }

    .tracker {
      position: relative !important;
      min-width: 900px !important;
      margin-top: 24px !important;
      padding: 11px 13px 13px !important;
      overflow: visible !important;
      border: 3px solid #713012 !important;
      border-radius: 4px !important;
      background:
        linear-gradient(90deg, transparent 0 7px, rgba(255,205,145,.34) 8px, transparent 10px),
        linear-gradient(180deg, #120805 0, #4d1d09 8px, #9b4d1d 11px, #211007 15px, #090504 100%) !important;
      box-shadow:
        0 0 0 1px #f1b475 inset,
        0 0 0 5px #351205 inset,
        0 5px 20px rgba(0,0,0,.65),
        0 0 13px rgba(204,93,29,.35) !important;
    }

    .tracker::before,
    .tracker::after {
      width: 34px !important;
      height: 34px !important;
      border: 2px solid #d48b4a !important;
      background:
        radial-gradient(circle at 35% 30%, #fff1d2 0 5%, #b91f13 8% 28%, #4b0b05 30% 58%, #110503 60% 100%) !important;
      box-shadow: 0 0 0 4px #351005, 0 0 14px rgba(221,77,23,.65) !important;
    }
    .tracker::before { right: -18px !important; }
    .tracker::after { left: -18px !important; }

    .${TITLE_CLASS} {
      position: absolute;
      z-index: 20;
      top: -31px;
      left: 50%;
      min-width: 235px;
      padding: 5px 34px 6px;
      transform: translateX(-50%);
      border: 2px solid #8f4218;
      border-radius: 5px 5px 12px 12px;
      background: linear-gradient(180deg, #2c1208, #090504 78%);
      color: #e8bd80;
      font: 700 15px/1.1 Georgia, "Times New Roman", serif;
      letter-spacing: 1.7px;
      text-align: center;
      text-shadow: 0 1px 2px #000;
      box-shadow: 0 0 0 1px rgba(255,202,138,.35) inset, 0 4px 8px rgba(0,0,0,.55);
    }
    .${TITLE_CLASS}::before,
    .${TITLE_CLASS}::after {
      content: "❧";
      position: absolute;
      top: 50%;
      color: #d18a4a;
      font-size: 28px;
      line-height: 1;
      transform: translateY(-54%);
    }
    .${TITLE_CLASS}::before { right: calc(100% - 5px); }
    .${TITLE_CLASS}::after { left: calc(100% - 5px); transform: translateY(-54%) scaleX(-1); }

    .top {
      direction: ltr !important;
      grid-template-columns: 88px 185px minmax(270px, 1.45fr) repeat(6, minmax(78px, .58fr)) !important;
      gap: 0 !important;
      min-height: 94px !important;
      border: 2px solid #8b471f !important;
      background:
        radial-gradient(circle at 50% 0, rgba(255,255,255,.38), transparent 33%),
        repeating-linear-gradient(0deg, rgba(89,45,19,.035) 0 1px, transparent 1px 4px),
        linear-gradient(180deg, #efd2a3, #c8955c) !important;
      box-shadow: 0 0 0 1px #ffe0aa inset, 0 0 0 5px rgba(103,45,15,.17) inset !important;
    }

    .clock-face,
    .metric,
    .identity {
      direction: rtl !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    .clock-face {
      align-self: center !important;
      width: 72px !important;
      height: 72px !important;
      border: 4px solid #693018 !important;
      border-radius: 50% !important;
      background:
        radial-gradient(circle at 50% 50%, transparent 0 55%, rgba(214,139,73,.75) 56% 59%, transparent 60%),
        repeating-conic-gradient(from -1deg, #d8a267 0 1.5deg, transparent 1.5deg 15deg),
        radial-gradient(circle, #100b08 0 63%, #8d4a20 64% 69%, #251006 70% 100%) !important;
      box-shadow: 0 0 0 2px #e1a568, 0 0 0 5px #311106, 0 0 13px rgba(88,33,10,.45) !important;
    }

    .identity {
      grid-template-columns: 1fr !important;
      grid-template-rows: 1fr 1fr !important;
      border-left: 1px solid rgba(94,48,22,.52) !important;
      border-right: 1px solid rgba(94,48,22,.52) !important;
    }
    .identity > div {
      padding: 7px 8px !important;
      color: #2c1a0d !important;
    }
    .identity > div + div {
      border-right: 0 !important;
      border-top: 1px solid rgba(100,50,20,.28) !important;
    }

    .metric {
      min-width: 0 !important;
      padding: 7px 6px !important;
      border-left: 1px solid rgba(92,42,18,.35) !important;
      text-align: center !important;
    }

    .label {
      color: #2f1a0d !important;
      font-size: 12px !important;
      font-weight: 800 !important;
      text-shadow: none !important;
    }
    .value {
      color: #24140b !important;
      font-size: 19px !important;
      font-weight: 900 !important;
      text-shadow: none !important;
    }

    .current-time {
      border-right: 1px solid rgba(92,42,18,.42) !important;
      border-left: 1px solid rgba(92,42,18,.42) !important;
    }
    .time-value {
      color: #1c1008 !important;
      font-family: Georgia, "Times New Roman", serif !important;
      font-size: clamp(34px, 4vw, 52px) !important;
      font-weight: 700 !important;
      letter-spacing: 2.8px !important;
      line-height: .96 !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.45) !important;
    }
    .time-subtitle {
      margin-top: 5px !important;
      color: #432816 !important;
      font-size: 11px !important;
      font-weight: 700 !important;
    }

    .metric.hour,
    .metric.minute,
    .metric.second,
    .metric.angle {
      box-shadow: none !important;
    }
    .metric.hour .value,
    .metric.minute .value,
    .metric.second .value,
    .metric.angle .value {
      min-width: 58px !important;
      margin-top: 5px !important;
      padding: 7px 12px 8px !important;
      clip-path: polygon(9% 0, 91% 0, 100% 20%, 100% 80%, 91% 100%, 9% 100%, 0 80%, 0 20%);
      border: 1px solid #c07a3d !important;
      background: linear-gradient(180deg, #29150b, #080605 75%) !important;
      color: #f0c18a !important;
      font-family: Georgia, "Times New Roman", serif !important;
      font-size: 24px !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      box-shadow: 0 0 0 2px #4b1b09, 0 3px 5px rgba(0,0,0,.35) !important;
    }
    .metric.minute .value {
      border-color: #ffb05a !important;
      color: #ffe6be !important;
      box-shadow: 0 0 0 2px #7b2c0c, 0 0 10px #ff7f27, 0 0 18px rgba(255,120,29,.55) !important;
    }
    .metric.direction .value {
      color: #168727 !important;
      font-size: 17px !important;
    }
    .metric.cycle .value {
      color: #24140b !important;
      font-size: 17px !important;
    }
    .cycle-ring {
      width: 27px !important;
      height: 27px !important;
      background: conic-gradient(#2f1b0d var(--cycle-progress, 0deg), rgba(78,42,19,.26) 0) !important;
      box-shadow: 0 0 0 2px rgba(64,30,12,.72) inset !important;
    }
    .cycle-ring::after {
      width: 17px !important;
      height: 17px !important;
      margin: 5px !important;
      background: #c99861 !important;
    }

    .section-title {
      position: relative !important;
      z-index: 5 !important;
      float: left !important;
      width: 122px !important;
      max-width: none !important;
      height: 31px !important;
      margin: 7px 0 -32px 0 !important;
      padding: 7px 7px 5px !important;
      border: 1px solid #9f5426 !important;
      border-radius: 2px !important;
      background: linear-gradient(180deg, #241209, #080605) !important;
      color: #d8a369 !important;
      font-size: 11px !important;
      line-height: 1 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: clip !important;
    }
    .section-title::before,
    .section-title::after { display: none !important; }

    .row-shell {
      clear: both !important;
      height: 32px !important;
      margin-left: 121px !important;
      border: 1px solid #9d5124 !important;
      border-radius: 1px !important;
      background: #070605 !important;
      overflow-x: hidden !important;
      box-shadow: 0 0 0 1px rgba(242,168,95,.13) inset !important;
    }
    .cells {
      height: 30px !important;
      min-width: 100% !important;
      grid-template-columns: repeat(60, minmax(13px, 1fr)) !important;
    }
    .cell {
      min-width: 0 !important;
      border-right: 1px solid #5c2a10 !important;
      background: linear-gradient(180deg, #17100b, #040302) !important;
      color: #d9a468 !important;
      font-size: clamp(7px, .72vw, 10px) !important;
      font-weight: 700 !important;
    }
    .cell.cardinal {
      color: #e4b16e !important;
      box-shadow: none !important;
    }
    .cell.active {
      z-index: 8 !important;
      border: 1px solid #ffc27b !important;
      background: linear-gradient(180deg, #65300f, #160a04 55%, #8e4114) !important;
      color: #fff5df !important;
      font-size: 12px !important;
      transform: translateY(-1px) scale(1.16) !important;
      box-shadow: 0 0 0 1px #fff0c6 inset, 0 0 7px #ff812f, 0 0 16px rgba(255,119,31,.78) !important;
    }
    .cell.active::after {
      bottom: -9px !important;
      border-top-color: #ff9a45 !important;
    }

    .footer { display: none !important; }

    .${GUIDE_CLASS} {
      position: absolute;
      z-index: 15;
      top: 139px;
      width: 2px;
      height: 66px;
      pointer-events: none;
      background: linear-gradient(180deg, transparent 0, #ffb664 12%, #ff7c28 47%, #ffd08b 88%, transparent 100%);
      box-shadow: 0 0 5px #ff862e, 0 0 12px rgba(255,121,35,.78);
      transform: translateX(-50%);
    }
    .${GUIDE_CLASS}::before,
    .${GUIDE_CLASS}::after {
      content: "";
      position: absolute;
      left: 50%;
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      transform: translateX(-50%);
      filter: drop-shadow(0 0 3px #ff8b32);
    }
    .${GUIDE_CLASS}::before { top: -1px; border-top: 8px solid #ffc16e; }
    .${GUIDE_CLASS}::after { bottom: -1px; border-bottom: 8px solid #ffc16e; }

    .${GEM_CLASS} {
      position: absolute;
      z-index: 18;
      left: 50%;
      bottom: -17px;
      width: 34px;
      height: 34px;
      transform: translateX(-50%) rotate(45deg);
      border: 3px solid #9f5022;
      background: radial-gradient(circle at 35% 30%, #ffe3b7 0 5%, #ac1b12 8% 30%, #4d0b05 32% 60%, #130503 62% 100%);
      box-shadow: 0 0 0 3px #321006, 0 0 10px rgba(212,67,22,.58);
    }

    @media (max-width: 1180px) {
      .top {
        grid-template-columns: 76px 158px minmax(220px, 1.2fr) repeat(6, minmax(64px, .52fr)) !important;
        min-height: 84px !important;
      }
      .clock-face { width: 62px !important; height: 62px !important; }
      .time-value { font-size: 34px !important; }
      .metric.hour .value,
      .metric.minute .value,
      .metric.second .value,
      .metric.angle .value {
        min-width: 48px !important;
        padding: 6px 8px 7px !important;
        font-size: 20px !important;
      }
      .label { font-size: 10px !important; }
      .${GUIDE_CLASS} { top: 129px; }
    }
  `;
}

function ensureDecorations(shadow) {
  const tracker = shadow.querySelector('.tracker');
  if (!(tracker instanceof HTMLElement)) return null;

  let title = shadow.querySelector(`.${TITLE_CLASS}`);
  if (!(title instanceof HTMLElement)) {
    title = document.createElement('div');
    title.className = TITLE_CLASS;
    title.textContent = 'TASI TIME TRACKER';
    tracker.prepend(title);
  }

  let guide = shadow.querySelector(`.${GUIDE_CLASS}`);
  if (!(guide instanceof HTMLElement)) {
    guide = document.createElement('div');
    guide.className = GUIDE_CLASS;
    tracker.appendChild(guide);
  }

  let gem = shadow.querySelector(`.${GEM_CLASS}`);
  if (!(gem instanceof HTMLElement)) {
    gem = document.createElement('div');
    gem.className = GEM_CLASS;
    tracker.appendChild(gem);
  }

  return { tracker, guide };
}

function updateGuide(tracker, guide) {
  const activeMinute = tracker.querySelector('.cell[data-type="minute"].active');
  if (!(activeMinute instanceof HTMLElement)) return false;
  const trackerRect = tracker.getBoundingClientRect();
  const cellRect = activeMinute.getBoundingClientRect();
  const center = cellRect.left - trackerRect.left + cellRect.width / 2;
  guide.style.left = `${center}px`;
  return true;
}

let applyCount = 0;
let lastApply = null;
let timer = 0;
let observer = null;
let clockTimer = 0;

function apply(source = 'apply') {
  if (!enabled()) return false;
  const host = document.getElementById(HOST_ID);
  const shadow = host?.shadowRoot;
  const top = shadow?.querySelector('.top');
  if (!(host instanceof HTMLElement)
      || !(shadow instanceof ShadowRoot)
      || !(top instanceof HTMLElement)) return false;

  let style = shadow.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = cssText();
    shadow.appendChild(style);
  }

  const compact = window.innerWidth < 1180;
  top.style.setProperty(
    'grid-template-columns',
    compact
      ? '76px 158px minmax(220px, 1.2fr) repeat(6, minmax(64px, .52fr))'
      : '88px 185px minmax(270px, 1.45fr) repeat(6, minmax(78px, .58fr))',
    'important',
  );

  const decoration = ensureDecorations(shadow);
  if (!decoration) return false;
  updateGuide(decoration.tracker, decoration.guide);

  host.dataset.gannzillaTasiTimeTrackerLuxuryStyleV549 = 'true';
  host.dataset.gannzillaTasiTimeTrackerReferenceV549 = 'ivory-copper-two-rows';
  host.dataset.gannzillaTasiTimeTrackerCanvasChangedV549 = 'false';
  host.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    reference: 'ivory-copper-two-rows',
    canvasChanged: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => requestAnimationFrame(() => apply(source)), delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  observer = new MutationObserver(() => schedule('dom-mutation', 20));
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', () => schedule('resize', 10), false);

  [0, 80, 220, 600, 1400, 3200, 6200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });
  clockTimer = window.setInterval(() => apply('clock-sync'), 500);

  window.GANNZILLA_TASI_TIME_TRACKER_LUXURY_STYLE_V549 = true;
  window.__auditGannzillaTasiTimeTrackerLuxuryStyleV549 = () => {
    const host = document.getElementById(HOST_ID);
    const shadow = host?.shadowRoot;
    return {
      ok: host instanceof HTMLElement
        && shadow instanceof ShadowRoot
        && host.dataset.gannzillaTasiTimeTrackerLuxuryStyleV549 === 'true'
        && shadow.getElementById(STYLE_ID) instanceof HTMLStyleElement
        && shadow.querySelector(`.${TITLE_CLASS}`) instanceof HTMLElement
        && shadow.querySelector(`.${GUIDE_CLASS}`) instanceof HTMLElement,
      build: BUILD,
      applyCount,
      reference: host?.dataset?.gannzillaTasiTimeTrackerReferenceV549 || null,
      canvasChanged: host?.dataset?.gannzillaTasiTimeTrackerCanvasChangedV549 === 'true',
      lastApply,
    };
  };

  window[STATE_KEY] = {
    apply,
    schedule,
    observer,
    get clockTimer() { return clockTimer; },
  };

  schedule('install', 0);
}

install();