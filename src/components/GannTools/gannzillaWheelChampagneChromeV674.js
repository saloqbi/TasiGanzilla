const BUILD = 674;
const STATE_KEY = '__gannzillaWheelChampagneChromeV674';
const ENABLE_PARAM = 'wheelChampagneChrome';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const THEME_OVERLAY_ID = 'gannzilla-wheel-line-theme-overlay-v473';
const TWO_PI = Math.PI * 2;

let observer = null;
let timer = 0;
let frame = 0;
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

function numberParam(name, fallback) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? value : fallback;
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  return wheelMode && boolParam(ENABLE_PARAM, false);
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement)
        || canvas.closest('aside')
        || canvas.id === DRAWING_OVERLAY_ID
        || canvas.id === THEME_OVERLAY_ID) return false;
      const rect = canvas.getBoundingClientRect();
      return canvas.width > 300 && canvas.height > 300 && rect.width > 250 && rect.height > 250;
    })
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
}

function strokeCircle(ctx, cx, cy, radius, strength = 1) {
  const passes = [
    { color: '#6f4310', width: 2.55 * strength },
    { color: '#c8922c', width: 1.65 * strength },
    { color: '#ffe6a0', width: 0.58 * strength },
  ];
  passes.forEach(({ color, width }) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TWO_PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  });
}

function strokeLine(ctx, from, to, strength = 1) {
  const passes = [
    { color: '#6f4310', width: 2.35 * strength },
    { color: '#c8922c', width: 1.45 * strength },
    { color: '#ffe6a0', width: 0.50 * strength },
  ];
  passes.forEach(({ color, width }) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  });
}

function strokeChromeCircle(ctx, cx, cy, radius, strength = 1) {
  const passes = [
    { color: '#202a31', width: 5.4 * strength },
    { color: '#7e8990', width: 4.0 * strength },
    { color: '#c8cfd3', width: 2.7 * strength },
    { color: '#ffffff', width: 0.85 * strength },
  ];
  passes.forEach(({ color, width }) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TWO_PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  });
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled()) return false;

  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr) || Number(window.devicePixelRatio) || 1);
  const cssSize = Number(canvas.dataset.gannzillaCanvasCssSize) || canvas.width / dpr;
  const appliedZoom = Number(canvas.dataset.gannzillaAppliedZoom) || numberParam('gannzillaZoom', 1);
  const divisions = Math.max(3, Math.round(numberParam('divisions', 36)));
  const clockwise = boolParam('clockwise', true);
  const direction = clockwise ? 1 : -1;
  const sector = 360 / divisions;
  const northOffset = direction * sector / 2;
  const innerRadiusSetting = numberParam('gannzillaInnerRadius', 279.32);
  const ringWidthSetting = numberParam('gannzillaRingWidth', 96.76);
  const adjustedInnerRadius = Math.max(20, innerRadiusSetting - ringWidthSetting) * appliedZoom;
  const ringWidths = String(canvas.dataset.gannzillaRingWidths || '')
    .split(',')
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!ringWidths.length) return false;

  const boundaries = [adjustedInnerRadius];
  ringWidths.forEach((width) => boundaries.push(boundaries[boundaries.length - 1] + width));
  const outerRadius = boundaries[boundaries.length - 1];
  const cx = cssSize / 2;
  const cy = cssSize / 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  boundaries.forEach((radius, index) => {
    const isAnchor = index === 0 || index === boundaries.length - 1;
    strokeCircle(ctx, cx, cy, radius, isAnchor ? 1.20 : 0.82);
  });

  for (let index = 0; index < divisions; index += 1) {
    const degrees = northOffset + direction * index * sector;
    const from = polar(cx, cy, adjustedInnerRadius, degrees);
    const to = polar(cx, cy, outerRadius, degrees);
    const cardinal = divisions % 4 === 0 && index % (divisions / 4) === 0;
    strokeLine(ctx, from, to, cardinal ? 1.28 : 0.72);
  }

  strokeChromeCircle(ctx, cx, cy, Math.max(2, adjustedInnerRadius - 4.5 * appliedZoom), 0.85);
  strokeChromeCircle(ctx, cx, cy, outerRadius + 4.5 * appliedZoom, 0.95);

  ctx.restore();

  canvas.dataset.gannzillaWheelChampagneChromeV674 = 'true';
  canvas.dataset.gannzillaWheelFrameMaterialV674 = 'mirror-silver-chrome';
  canvas.dataset.gannzillaWheelGridMaterialV674 = 'champagne-gold-polished';
  canvas.dataset.gannzillaWheelGeometryChangedV674 = 'false';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    divisions,
    ringBoundaryCount: boundaries.length,
    innerRadius: adjustedInnerRadius,
    outerRadius,
    champagneGold: '#c8922c',
    goldHighlight: '#ffe6a0',
    chromeMid: '#c8cfd3',
    geometryChanged: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(schedule.timer);
  schedule.timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => apply(source));
  }, delay);
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(ENABLE_PARAM, 'true');
    url.searchParams.set('wheelFrameMaterial', 'mirrorSilverChrome');
    url.searchParams.set('wheelGridMaterial', 'champagneGold');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime rendering remains authoritative.
  }
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled() || window[STATE_KEY]) return;

  persistFlags();
  [0, 40, 100, 220, 500, 1000, 1800, 3200, 5200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  const onWheelDraw = () => schedule('final-wheel-event', 24);
  window.addEventListener('gannzilla:final-wheel-authority-v506', onWheelDraw, false);
  window.addEventListener('gannzilla:final-wheel-authority-v491', onWheelDraw, false);
  window.addEventListener('resize', () => schedule('resize', 40), false);

  observer = new MutationObserver(() => schedule('mutation', 20));
  observer.observe(document.documentElement, { childList: true, subtree: true });
  timer = window.setInterval(() => schedule('champagne-chrome-watch', 0), 1200);

  window.GANNZILLA_WHEEL_CHAMPAGNE_CHROME_V674 = true;
  window.__auditGannzillaWheelChampagneChromeV674 = () => {
    const canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaWheelChampagneChromeV674 === 'true',
      build: BUILD,
      enabled: enabled(),
      geometryChanged: false,
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
