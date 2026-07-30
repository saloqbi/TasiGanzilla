const BUILD = 667;
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const STYLE_ID = 'gannzilla-panel-mirror-zinc-outer-silver-v667';
const STATE_KEY = '__gannzillaPanelMirrorZincOuterSilverV667';
const PANEL_PARAM = 'panelMirrorZincEdges';
const OUTER_PARAM = 'angleOuterSilverFrame';
const TWO_PI = Math.PI * 2;

let frame = 0;
let timer = 0;
let applying = false;
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

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function panelEnabled() {
  return wheelMode() && boolParam(PANEL_PARAM, false);
}

function outerEnabled() {
  return wheelMode() && boolParam(OUTER_PARAM, false);
}

function installPanelStyle() {
  if (!panelEnabled()) return false;

  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${PANEL_ID} {
      border: 4px solid transparent !important;
      border-radius: 15px !important;
      background:
        linear-gradient(180deg, #f2f5f7 0%, #d5dade 46%, #eef1f3 100%) padding-box,
        linear-gradient(128deg,
          #101820 0%,
          #667b88 6%,
          #eefbff 12%,
          #8fa6b3 18%,
          #263640 25%,
          #d9f3ff 33%,
          #ffffff 40%,
          #536976 48%,
          #eefcff 57%,
          #1b2932 66%,
          #9fb8c5 75%,
          #f9ffff 84%,
          #435864 92%,
          #dff5ff 100%) border-box !important;
      box-shadow:
        0 0 0 1px rgba(15, 25, 32, 0.96),
        0 0 0 2px rgba(236, 250, 255, 0.92),
        7px 0 18px rgba(12, 23, 31, 0.30),
        inset 0 0 0 1px rgba(255, 255, 255, 0.88) !important;
      isolation: isolate !important;
    }

    #${PANEL_ID}::before {
      content: '';
      position: absolute;
      inset: 1px;
      z-index: 2147483001;
      pointer-events: none;
      border-radius: 11px;
      border: 1px solid rgba(224, 245, 253, 0.92);
      box-shadow:
        inset 0 0 0 1px rgba(26, 42, 52, 0.72),
        inset 0 0 10px rgba(255, 255, 255, 0.52),
        0 0 7px rgba(207, 241, 255, 0.42);
    }

    #${PANEL_ID} .gz421-window-title,
    #${PANEL_ID} .gz421-preset-bar,
    #${PANEL_ID} .gz421-section-header,
    #${PANEL_ID} .gz421-profile-switch {
      background:
        repeating-linear-gradient(0deg,
          rgba(255,255,255,0.16) 0px,
          rgba(255,255,255,0.16) 1px,
          rgba(90,104,113,0.05) 1px,
          rgba(90,104,113,0.05) 2px),
        linear-gradient(180deg, #fafcfd 0%, #d5dade 48%, #eef1f3 100%) !important;
      border-color: #87949c !important;
    }

    #${PANEL_ID} .gz421-row,
    #${PANEL_ID} .gz421-row:nth-child(even),
    #${PANEL_ID} .gz421-table-wrap,
    #${PANEL_ID} table,
    #${PANEL_ID} .gz421-projection-strip,
    #${PANEL_ID} .gz421-matrix {
      background:
        repeating-linear-gradient(0deg,
          rgba(255,255,255,0.10) 0px,
          rgba(255,255,255,0.10) 1px,
          rgba(95,108,116,0.035) 1px,
          rgba(95,108,116,0.035) 2px),
        linear-gradient(90deg, #eef1f3 0%, #d9dee1 48%, #f5f7f8 100%) !important;
    }

    #${PANEL_ID} input:not([type='checkbox']):not([type='radio']):not([type='color']),
    #${PANEL_ID} select,
    #${PANEL_ID} textarea,
    #${PANEL_ID} button {
      border-color: #7d8a92 !important;
      background: linear-gradient(180deg, #ffffff 0%, #dce2e6 52%, #f7f9fa 100%) !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.96),
        inset 0 -1px 0 rgba(64,79,88,0.22) !important;
    }

    #${PANEL_ID} .gz421-scroll::-webkit-scrollbar-track {
      background: linear-gradient(90deg, #c7d0d5, #f2f6f8, #b8c3c9) !important;
      border-left-color: #71808a !important;
    }

    #${PANEL_ID} .gz421-scroll::-webkit-scrollbar-thumb {
      background: linear-gradient(90deg, #4c606b 0%, #effcff 30%, #8aa1ad 54%, #ffffff 72%, #526975 100%) !important;
      border-color: #dcebf1 !important;
      box-shadow: inset 0 0 0 1px rgba(24,39,48,0.62) !important;
    }
  `;

  const panel = document.getElementById(PANEL_ID);
  if (panel instanceof HTMLElement) {
    panel.dataset.gannzillaPanelMirrorZincEdgesV667 = 'true';
    panel.dataset.gannzillaPanelInteriorV667 = 'brushed-silver';
  }
  return true;
}

function findWheel() {
  const canvas = document.querySelector('canvas[data-gannzilla-empty-outer-ring-v518="true"]');
  return canvas instanceof HTMLCanvasElement && !canvas.closest('aside') ? canvas : null;
}

function fillAnnulus(ctx, cx, cy, inner, outer, fillStyle) {
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, outer), 0, TWO_PI);
  ctx.arc(cx, cy, Math.max(1, inner), TWO_PI, 0, true);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function strokeCircle(ctx, cx, cy, radius, strokeStyle, lineWidth) {
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, radius), 0, TWO_PI);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return { x: cx + Math.cos(radians) * radius, y: cy + Math.sin(radians) * radius };
}

function silverMirrorGradient(ctx, cx, cy, inner, outer) {
  const gradient = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  gradient.addColorStop(0, '#17232b');
  gradient.addColorStop(0.08, '#667985');
  gradient.addColorStop(0.18, '#e9f8ff');
  gradient.addColorStop(0.31, '#8fa1ab');
  gradient.addColorStop(0.43, '#ffffff');
  gradient.addColorStop(0.55, '#b9c6cd');
  gradient.addColorStop(0.67, '#f7ffff');
  gradient.addColorStop(0.80, '#6e818c');
  gradient.addColorStop(0.92, '#dff2fa');
  gradient.addColorStop(1, '#273741');
  return gradient;
}

function drawTopMirrorHighlight(ctx, cx, cy, inner, width) {
  const radius = inner + width * 0.55;
  const gradient = ctx.createLinearGradient(cx - radius, 0, cx + radius, 0);
  gradient.addColorStop(0, 'rgba(255,255,255,0)');
  gradient.addColorStop(0.18, 'rgba(218,245,255,0.20)');
  gradient.addColorStop(0.38, 'rgba(255,255,255,0.78)');
  gradient.addColorStop(0.52, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.68, 'rgba(214,242,253,0.70)');
  gradient.addColorStop(0.86, 'rgba(255,255,255,0.18)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(222,247,255,0.82)';
  ctx.shadowBlur = Math.max(2, width * 0.28);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, (188 * Math.PI) / 180, (352 * Math.PI) / 180);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = Math.max(1, width * 0.22);
  ctx.stroke();
  ctx.restore();
}

function drawSegmentLines(ctx, cx, cy, inner, outer, divisions, zoom) {
  ctx.save();
  ctx.setLineDash([]);
  ctx.lineCap = 'butt';
  for (let index = 0; index < divisions; index += 1) {
    const angle = (index * 360) / divisions;
    const start = polar(cx, cy, inner + Math.max(1, zoom * 1.4), angle);
    const end = polar(cx, cy, outer - Math.max(1, zoom * 1.2), angle);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = index % 9 === 0 ? 'rgba(35,48,57,0.78)' : 'rgba(74,91,101,0.48)';
    ctx.lineWidth = Math.max(0.7, (index % 9 === 0 ? 1.25 : 0.8) * zoom);
    ctx.stroke();
  }
  ctx.restore();
}

function applyOuterSilver(source = 'apply') {
  frame = 0;
  if (!outerEnabled() || applying) return false;

  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)
      || canvas.dataset.gannzillaMetallicAngleOuterRingV531 !== 'true') return false;

  const baseCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingBaseCssSizeV518 || 0);
  const expandedCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 || 0);
  const ringWidth = Number(canvas.dataset.gannzillaEmptyOuterRingWidthV518 || 0);
  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr)
    || (expandedCssSize > 0 ? canvas.width / expandedCssSize : 0)
    || Number(window.devicePixelRatio)
    || 1);
  const zoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);

  if (!(baseCssSize > 0) || !(expandedCssSize > 0) || !(ringWidth > 0)) return false;

  const ringScale = numberParam('gannzillaAngleRingScale', 2, 1.7, 2);
  const baseFrameWidth = numberParam('gannzillaAngleFrameStrokeWidth', 5.6, 3, 12) * zoom;
  const outerFrameWidth = numberParam('gannzillaAngleOuterFrameStrokeWidth', 40, 30, 52) * zoom;
  const requestedSilverWidth = numberParam('gannzillaAngleOuterSilverFrameWidth', 18, 8, 34) * zoom;
  const divisions = Math.max(3, Math.min(360, Math.round(numberParam('divisions', 36, 3, 360))));

  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * zoom;
  const baseOuter = Math.max(1, (baseCssSize - margin * 2) / 2);
  const angleInnerRadius = baseOuter + ringWidth * 2;
  const angleOuterRadius = angleInnerRadius + ringWidth * ringScale;
  const outerFrameInner = angleOuterRadius - baseFrameWidth / 2;
  const outerFrameOuter = outerFrameInner + outerFrameWidth;
  const maximumRadius = expandedCssSize / 2 - Math.max(2, zoom * 2);
  const silverInner = Math.min(maximumRadius - Math.max(4, requestedSilverWidth), outerFrameOuter + Math.max(1.5, zoom * 1.5));
  const silverOuter = Math.min(maximumRadius, silverInner + requestedSilverWidth);
  const silverWidth = Math.max(1, silverOuter - silverInner);

  if (!(silverOuter > silverInner + 1)) return false;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

  applying = true;
  try {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.setLineDash([]);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    fillAnnulus(ctx, cx, cy, silverInner, silverOuter, silverMirrorGradient(ctx, cx, cy, silverInner, silverOuter));
    strokeCircle(ctx, cx, cy, silverInner, 'rgba(27,39,47,0.98)', Math.max(1.1, silverWidth * 0.075));
    strokeCircle(ctx, cx, cy, silverInner + silverWidth * 0.16, 'rgba(236,251,255,0.86)', Math.max(0.8, silverWidth * 0.055));
    strokeCircle(ctx, cx, cy, silverOuter - silverWidth * 0.12, 'rgba(255,255,255,0.94)', Math.max(0.9, silverWidth * 0.060));
    strokeCircle(ctx, cx, cy, silverOuter, 'rgba(39,54,63,0.98)', Math.max(1, silverWidth * 0.070));
    drawSegmentLines(ctx, cx, cy, silverInner, silverOuter, divisions, zoom);
    drawTopMirrorHighlight(ctx, cx, cy, silverInner, silverWidth);
    ctx.restore();

    canvas.dataset.gannzillaAngleOuterSilverFrameV667 = 'true';
    canvas.dataset.gannzillaAngleOuterSilverFrameGeometryChangedV667 = 'false';
    canvas.dataset.gannzillaAngleOuterSilverFrameWidthV667 = String(silverWidth / zoom);
  } finally {
    applying = false;
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    panelMirrorZincEdges: panelEnabled(),
    panelInterior: 'brushed-silver',
    outerFrame: 'mirror-silver',
    outerFrameWidth: silverWidth / zoom,
    wheelGeometryChanged: false,
    angleGeometryChanged: false,
    angleLabelsChanged: false,
    at: Date.now(),
  };
  return true;
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    if (panelEnabled()) url.searchParams.set(PANEL_PARAM, 'true');
    if (outerEnabled()) url.searchParams.set(OUTER_PARAM, 'true');
    if (outerEnabled() && !url.searchParams.has('gannzillaAngleOuterSilverFrameWidth')) {
      url.searchParams.set('gannzillaAngleOuterSilverFrameWidth', '18');
    }
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Rendering remains authoritative even if the browser blocks URL replacement.
  }
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(schedule.timer);
  schedule.timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      installPanelStyle();
      applyOuterSilver(source);
    });
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistFlags();
  installPanelStyle();

  [0, 100, 260, 600, 1200, 2400, 4800, 8200, 12000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  [
    'gannzilla:angle-frame-clock-palette-v660',
    'gannzilla:angle-inner-frame-visible-clock-palette-v662',
    'gannzilla:angle-label-band-clock-palette-v663',
    'gannzilla:angle-minor-silver-shine-v664',
    'gannzilla:angle-tick-hierarchy-black-silver-v665',
    'gannzilla:angle-tick-contrast-black-silver-v666',
    'gannzilla:copper-top-correction-v541',
    'gannzilla:clean-outer-frame-v540',
    'gannzilla:metallic-angle-outer-ring-v531',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name, 55), false));

  window.addEventListener('resize', () => schedule('window-resize', 80), false);
  timer = window.setInterval(() => schedule('mirror-zinc-silver-watch', 0), 1450);

  window.GANNZILLA_PANEL_MIRROR_ZINC_OUTER_SILVER_V667 = true;
  window.__auditGannzillaPanelMirrorZincOuterSilverV667 = () => {
    const panel = document.getElementById(PANEL_ID);
    const canvas = findWheel();
    return {
      ok: wheelMode()
        && (!panelEnabled() || (panel instanceof HTMLElement && panel.dataset.gannzillaPanelMirrorZincEdgesV667 === 'true'))
        && (!outerEnabled() || (canvas instanceof HTMLCanvasElement && canvas.dataset.gannzillaAngleOuterSilverFrameV667 === 'true')),
      build: BUILD,
      panelMirrorZincEdgesEnabled: panelEnabled(),
      panelInterior: 'brushed-silver',
      outerFrameSilverEnabled: outerEnabled(),
      wheelGeometryChanged: false,
      angleGeometryChanged: false,
      angleLabelsChanged: false,
      applyCount,
      timerActive: Boolean(timer),
      lastApply,
    };
  };

  window[STATE_KEY] = { installPanelStyle, applyOuterSilver, schedule };
  schedule('install');
}

install();
