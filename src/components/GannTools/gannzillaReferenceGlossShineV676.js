const BUILD = 676;
const ENABLE_PARAM = 'referenceGlossShine';
const STYLE_ID = 'gannzilla-reference-gloss-shine-v676';
const STATE_KEY = '__gannzillaReferenceGlossShineV676';
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const TOOLBAR_ID = 'gannzilla-full-mirror-toolbar-strip-v672';
const WHEEL_GLOSS_ID = 'gannzilla-reference-wheel-gloss-v676';

let observer = null;
let timer = 0;
let applyCount = 0;
let lastApply = null;

function query() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const p = query();
  const wheelMode = p.get('gannzillaPro') === 'true' || p.get('wheelPro') === 'true';
  return wheelMode && ['true', '1', 'yes', 'on'].includes(String(p.get(ENABLE_PARAM) || '').toLowerCase());
}

function findWheel() {
  const preferred = document.querySelector('canvas[data-gannzilla-final-wheel-authority-v506="true"],canvas[data-gannzilla-final-wheel-authority-v491="true"]');
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
      const rect = canvas.getBoundingClientRect();
      return canvas.width > 300 && canvas.height > 300 && rect.width > 250 && rect.height > 250;
    })
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  } else if (style !== document.head.lastElementChild) {
    document.head.appendChild(style);
  }

  style.textContent = `
    #${TOOLBAR_ID} {
      border-width: 4px !important;
      border-radius: 12px !important;
      background:
        linear-gradient(90deg,transparent 0%,rgba(255,255,255,.42) 12%,rgba(255,255,255,.08) 27%,rgba(255,255,255,.55) 50%,rgba(255,255,255,.08) 73%,rgba(255,255,255,.42) 88%,transparent 100%) padding-box,
        linear-gradient(180deg,#fff 0%,#f7fcff 10%,#c6d3da 30%,#81939e 50%,#f9fdff 69%,#d2dde3 85%,#8b9da7 100%) padding-box,
        linear-gradient(128deg,#0b151c 0%,#627986 7%,#e8f8ff 12%,#fff 17%,#738b98 23%,#172832 30%,#dff5ff 38%,#fff 45%,#536b78 54%,#ecfaff 62%,#fff 71%,#4f6571 80%,#e8f7fd 89%,#fff 94%,#172933 100%) border-box !important;
      background-clip: padding-box,padding-box,border-box !important;
      box-shadow:0 0 0 1px rgba(8,17,23,.98),0 0 0 2px rgba(235,249,255,.98),0 0 0 4px rgba(45,65,77,.78),inset 0 2px 0 #fff,inset 0 -2px 0 rgba(24,39,48,.78),inset 0 0 18px rgba(226,246,255,.76),0 3px 11px rgba(8,18,25,.40),0 0 16px rgba(203,235,248,.42) !important;
    }

    #${TOOLBAR_ID}::before {
      inset:2px !important;
      border-radius:7px !important;
      border:1px solid #f8feff !important;
      box-shadow:inset 0 0 0 1px rgba(38,55,65,.88),inset 0 3px 8px rgba(255,255,255,.96),inset 0 -3px 8px rgba(66,83,93,.30),0 0 9px rgba(209,240,252,.72) !important;
    }

    #${TOOLBAR_ID}::after {
      left:2.5% !important;right:2.5% !important;top:1px !important;height:8px !important;opacity:.98 !important;
      background:linear-gradient(90deg,transparent,rgba(220,246,255,.66) 10%,#fff 34%,#fff 58%,rgba(215,244,255,.66) 88%,transparent) !important;
      box-shadow:0 0 5px #fff,0 0 12px rgba(195,235,252,.95) !important;
    }

    #${PANEL_ID} {
      background:
        linear-gradient(104deg,rgba(255,255,255,.52),rgba(255,255,255,.08) 18%,rgba(255,255,255,.38) 37%,rgba(255,255,255,.05) 62%,rgba(255,255,255,.42) 84%,rgba(255,255,255,.12)),
        linear-gradient(90deg,#c8d2d8 0%,#f9fdff 16%,#aab8c0 34%,#f6fbfd 52%,#a5b4bd 70%,#fbfeff 87%,#c0ccd2 100%) padding-box,
        linear-gradient(128deg,#0c171e 0%,#59717f 6%,#e5f7ff 11%,#fff 16%,#728996 22%,#172832 29%,#d7f1fc 36%,#fff 43%,#526a77 50%,#eaf9ff 58%,#fff 66%,#536b77 74%,#edfaff 83%,#fff 91%,#1a2c36 100%) border-box !important;
      background-clip:padding-box,padding-box,border-box !important;
      box-shadow:0 0 0 1px rgba(7,15,20,.98),0 0 0 2px rgba(238,251,255,.98),0 0 0 4px rgba(45,66,78,.88),8px 10px 25px rgba(7,16,22,.40),inset 0 0 0 1px #fff,inset 0 0 22px rgba(224,245,254,.74),0 0 14px rgba(202,236,250,.46) !important;
    }

    #${PANEL_ID} .gz421-window-title,#${PANEL_ID} .gz421-preset-bar,#${PANEL_ID} .gz421-section-header,#${PANEL_ID} .gz421-profile-switch,#${PANEL_ID} .gz421-footer {
      background:linear-gradient(90deg,rgba(255,255,255,.54),rgba(255,255,255,.07) 22%,rgba(255,255,255,.44) 51%,rgba(255,255,255,.08) 78%,rgba(255,255,255,.38)),linear-gradient(180deg,#fff 0%,#f3f8fb 12%,#c0ccd3 31%,#8799a4 51%,#f6fafc 70%,#c9d4da 87%,#9cabb4 100%) !important;
      box-shadow:inset 0 2px 0 #fff,inset 0 -2px 0 rgba(30,47,57,.72),inset 0 0 9px rgba(232,248,255,.72),0 1px 3px rgba(11,23,30,.34) !important;
    }

    #${PANEL_ID} .gz421-scroll,#${PANEL_ID} .gz421-section-body,#${PANEL_ID} .gz421-table-wrap,#${PANEL_ID} table {
      background:linear-gradient(104deg,rgba(255,255,255,.45),rgba(255,255,255,.05) 20%,rgba(255,255,255,.32) 49%,rgba(255,255,255,.06) 74%,rgba(255,255,255,.34)),linear-gradient(90deg,#cbd5da 0%,#f7fafb 21%,#c9d3d8 47%,#fbfdfe 72%,#bcc8ce 100%) !important;
    }

    #${PANEL_ID} .gz421-row,#${PANEL_ID} .gz421-row:nth-child(even) {
      background:linear-gradient(100deg,rgba(255,255,255,.44),rgba(255,255,255,.04) 28%,rgba(255,255,255,.30) 58%,rgba(255,255,255,.07)),linear-gradient(90deg,#cfd8dd 0%,#f8fafb 33%,#c3cdd2 64%,#f1f5f7 100%) !important;
    }

    #${PANEL_ID} input:not([type='checkbox']):not([type='radio']):not([type='color']),#${PANEL_ID} select,#${PANEL_ID} textarea,#${PANEL_ID} button {
      background:linear-gradient(100deg,rgba(255,255,255,.72),rgba(255,255,255,.10) 30%,rgba(255,255,255,.55) 58%,rgba(255,255,255,.10)),linear-gradient(180deg,#fff 0%,#eef4f7 18%,#b6c3ca 49%,#f7fbfd 73%,#bdc9cf 100%) !important;
      box-shadow:inset 0 2px 0 #fff,inset 0 -1px 0 rgba(26,43,52,.58),0 1px 3px rgba(10,22,29,.30) !important;
    }

    #${WHEEL_GLOSS_ID} {
      position:fixed !important;display:none;pointer-events:none !important;border-radius:50% !important;z-index:2147482510 !important;
      background:conic-gradient(from 308deg,transparent 0deg,rgba(255,255,255,.48) 17deg,rgba(220,244,255,.20) 29deg,transparent 47deg,transparent 274deg,rgba(255,255,255,.36) 289deg,transparent 316deg),radial-gradient(circle at 30% 8%,rgba(255,255,255,.36),rgba(255,255,255,.12) 14%,transparent 34%) !important;
      -webkit-mask:radial-gradient(circle,transparent 0%,transparent 75%,rgba(0,0,0,.25) 80%,#000 88%,#000 100%);mask:radial-gradient(circle,transparent 0%,transparent 75%,rgba(0,0,0,.25) 80%,#000 88%,#000 100%);
      mix-blend-mode:screen !important;opacity:.82 !important;filter:blur(.15px) saturate(1.06) !important;
      box-shadow:inset 0 0 20px rgba(255,255,255,.24),inset 0 0 46px rgba(255,225,150,.10),0 0 10px rgba(255,255,255,.20) !important;
    }
  `;
}

function ensureWheelGloss() {
  let overlay = document.getElementById(WHEEL_GLOSS_ID);
  if (!(overlay instanceof HTMLDivElement)) {
    overlay = document.createElement('div');
    overlay.id = WHEEL_GLOSS_ID;
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
  }
  return overlay;
}

function apply(source = 'apply') {
  if (!enabled()) return false;
  installStyle();
  const wheel = findWheel();
  const overlay = ensureWheelGloss();
  let wheelGloss = false;

  if (wheel instanceof HTMLCanvasElement) {
    const rect = wheel.getBoundingClientRect();
    if (rect.width > 250 && rect.height > 250) {
      Object.assign(overlay.style, {
        display: 'block', left: `${rect.left}px`, top: `${rect.top}px`,
        width: `${rect.width}px`, height: `${rect.height}px`,
      });
      wheelGloss = true;
    }
  }
  if (!wheelGloss) overlay.style.display = 'none';

  applyCount += 1;
  lastApply = { source, build: BUILD, wheelGloss, geometryChanged: false, numberLayoutChanged: false, at: Date.now() };
  return true;
}

function schedule(source, delay = 0) {
  window.clearTimeout(schedule.timer);
  schedule.timer = window.setTimeout(() => apply(source), delay);
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled() || window[STATE_KEY]) return;
  [0, 30, 80, 180, 400, 900, 1800, 3600, 7000].forEach((delay) => window.setTimeout(() => schedule(`boot-${delay}`), delay));
  observer = new MutationObserver(() => schedule('mutation'));
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'width', 'height'] });
  window.addEventListener('resize', () => schedule('resize'), false);
  window.addEventListener('scroll', () => schedule('scroll'), true);
  timer = window.setInterval(() => apply('gloss-watch'), 160);

  window.GANNZILLA_REFERENCE_GLOSS_SHINE_V676 = true;
  window.__auditGannzillaReferenceGlossShineV676 = () => ({
    ok: enabled() && document.getElementById(STYLE_ID) instanceof HTMLStyleElement,
    build: BUILD, enabled: enabled(), wheelGlossMounted: document.getElementById(WHEEL_GLOSS_ID) instanceof HTMLElement,
    geometryChanged: false, numberLayoutChanged: false, applyCount,
    observerActive: Boolean(observer), timerActive: Boolean(timer), lastApply,
  });
  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
