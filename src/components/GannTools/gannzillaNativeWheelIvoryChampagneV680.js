const BUILD = 681;
const STATE_KEY = '__gannzillaNativeWheelIvoryChampagneV681';
const ENABLE_PARAM = 'wheelIvoryChampagneNative';
const FINAL_EVENT = 'gannzilla:final-wheel-authority-v506';
const LEGACY_FINAL_EVENT = 'gannzilla:final-wheel-authority-v491';

const IVORY_FILL = '#fffaf0';
const CHAMPAGNE_GRID = '#cba55f';
const CHAMPAGNE_FRAME = '#98620b';
const CARDINAL_DARK = '#6f4000';
const CARDINAL_GOLD = '#bd7b10';
const CARDINAL_LIGHT = '#ffe09a';
const CHROME_DARK = '#33424a';
const CHROME_MID = '#aebbc2';
const CHROME_LIGHT = '#f8fdff';

let fillReplacementCount = 0;
let strokeReplacementCount = 0;
let widthReplacementCount = 0;
let cardinalDrawCount = 0;
let installed = false;
let lastReplacement = null;
let lastCardinalDraw = null;

function effectiveSearch() {
  return window.__gannzillaV672CanonicalSearch || window.location.search || '';
}

function params() {
  try { return new URLSearchParams(effectiveSearch()); }
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
  if (typeof window === 'undefined') return false;
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  const shortLinkAuthority = window.location.pathname === '/v672.html';
  return wheelMode && (shortLinkAuthority || boolParam(ENABLE_PARAM, false));
}

function normalizedColor(value) {
  if (typeof value !== 'string') return '';
  return value.toLowerCase().replace(/\s+/g, '');
}

function targetCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
  const id = String(canvas.id || '').toLowerCase();
  if (id.includes('overlay') || id.includes('preview') || id.includes('tracker')) return false;
  return canvas.width > 300 && canvas.height > 300;
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
  ].join(','));
  if (targetCanvas(preferred)) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter(targetCanvas)
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function translateFill(value) {
  const color = normalizedColor(value);
  if (color === '#fff'
    || color === '#ffffff'
    || color === 'rgb(255,255,255)'
    || color === 'rgba(255,255,255,1)') {
    return IVORY_FILL;
  }
  return value;
}

function translateStroke(value) {
  const color = normalizedColor(value);
  if (color === '#b5b5b5'
    || color === 'rgb(181,181,181)'
    || color === 'rgba(181,181,181,1)') {
    return CHAMPAGNE_GRID;
  }
  if (color === '#7a7a7a'
    || color === 'rgb(122,122,122)'
    || color === 'rgba(122,122,122,1)') {
    return CHAMPAGNE_FRAME;
  }
  return value;
}

function translateLineWidth(context, value) {
  const width = Number(value);
  if (!Number.isFinite(width)) return value;
  const stroke = normalizedColor(context.strokeStyle);
  if (stroke === normalizedColor(CHAMPAGNE_GRID)) return Math.max(width, 0.92);
  if (stroke === normalizedColor(CHAMPAGNE_FRAME)) return Math.max(width, 1.35);
  return value;
}

function installStyleAccessor(property, translator, counterName) {
  const prototype = window.CanvasRenderingContext2D?.prototype;
  const descriptor = prototype && Object.getOwnPropertyDescriptor(prototype, property);
  if (!prototype || !descriptor?.get || !descriptor?.set || descriptor.configurable === false) return false;

  Object.defineProperty(prototype, property, {
    configurable: true,
    enumerable: descriptor.enumerable,
    get() {
      return descriptor.get.call(this);
    },
    set(value) {
      let nextValue = value;
      if (enabled() && targetCanvas(this.canvas)) {
        nextValue = translator(value);
        if (nextValue !== value) {
          if (counterName === 'fill') fillReplacementCount += 1;
          else strokeReplacementCount += 1;
          this.canvas.dataset.gannzillaNativeIvoryChampagneV681 = 'true';
          this.canvas.dataset.gannzillaNativeIvoryFillV681 = IVORY_FILL;
          this.canvas.dataset.gannzillaNativeChampagneGridV681 = CHAMPAGNE_GRID;
          this.canvas.dataset.gannzillaNativeChampagneFrameV681 = CHAMPAGNE_FRAME;
          lastReplacement = {
            property,
            source: String(value),
            target: String(nextValue),
            at: Date.now(),
          };
        }
      }
      return descriptor.set.call(this, nextValue);
    },
  });
  return true;
}

function installLineWidthAccessor() {
  const prototype = window.CanvasRenderingContext2D?.prototype;
  const descriptor = prototype && Object.getOwnPropertyDescriptor(prototype, 'lineWidth');
  if (!prototype || !descriptor?.get || !descriptor?.set || descriptor.configurable === false) return false;

  Object.defineProperty(prototype, 'lineWidth', {
    configurable: true,
    enumerable: descriptor.enumerable,
    get() {
      return descriptor.get.call(this);
    },
    set(value) {
      let nextValue = value;
      if (enabled() && targetCanvas(this.canvas)) {
        nextValue = translateLineWidth(this, value);
        if (nextValue !== value) {
          widthReplacementCount += 1;
          lastReplacement = {
            property: 'lineWidth',
            source: String(value),
            target: String(nextValue),
            at: Date.now(),
          };
        }
      }
      return descriptor.set.call(this, nextValue);
    },
  });
  return true;
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function layeredLine(ctx, from, to, layers) {
  layers.forEach(({ color, width }) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  });
}

function layeredCircle(ctx, cx, cy, radius, layers) {
  layers.forEach(({ color, width }) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  });
}

function drawCardinalAuthority(source = 'event') {
  if (!enabled()) return false;
  const wheel = findWheel();
  if (!targetCanvas(wheel)) return false;

  const cssSize = Number(wheel.dataset.gannzillaCanvasCssSize)
    || Number.parseFloat(wheel.style.width)
    || wheel.getBoundingClientRect().width;
  const appliedZoom = Number(wheel.dataset.gannzillaAppliedZoom) || numberParam('gannzillaZoom', 1);
  const dpr = Number(wheel.dataset.gannzillaNativeDpr) || Math.max(1, Number(window.devicePixelRatio) || 1);
  const divisions = Math.max(4, Math.round(numberParam('divisions', 36)));
  const clockwise = !['false', '0', 'no', 'off'].includes(String(params().get('clockwise') || 'true').toLowerCase());
  const direction = clockwise ? 1 : -1;
  const sector = 360 / divisions;
  const northOffset = direction * sector / 2;
  const innerRadiusSetting = numberParam('gannzillaInnerRadius', 279.32);
  const ringWidthSetting = numberParam('gannzillaRingWidth', 96.76);
  const innerRadius = Math.max(20, innerRadiusSetting - ringWidthSetting) * appliedZoom;
  const ringWidths = String(wheel.dataset.gannzillaRingWidths || '')
    .split(',')
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);
  if (!ringWidths.length) return false;

  const outerRadius = ringWidths.reduce((sum, width) => sum + width, innerRadius);
  const cx = cssSize / 2;
  const cy = cssSize / 2;
  const ctx = wheel.getContext('2d');
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  const cardinalStep = divisions / 4;
  for (let cardinal = 0; cardinal < 4; cardinal += 1) {
    const index = cardinal * cardinalStep;
    const degrees = northOffset + direction * index * sector;
    layeredLine(
      ctx,
      polar(cx, cy, innerRadius, degrees),
      polar(cx, cy, outerRadius, degrees),
      [
        { color: CARDINAL_DARK, width: 3.8 },
        { color: CARDINAL_GOLD, width: 2.45 },
        { color: CARDINAL_LIGHT, width: 0.72 },
      ],
    );
  }

  layeredCircle(ctx, cx, cy, Math.max(2, innerRadius - 1.8), [
    { color: CARDINAL_DARK, width: 4.2 },
    { color: CARDINAL_GOLD, width: 2.8 },
    { color: CARDINAL_LIGHT, width: 0.78 },
  ]);

  layeredCircle(ctx, cx, cy, outerRadius + 1.8, [
    { color: CHROME_DARK, width: 5.4 },
    { color: CHROME_MID, width: 3.7 },
    { color: CHROME_LIGHT, width: 1.1 },
  ]);
  ctx.restore();

  wheel.dataset.gannzillaCardinalChampagneAuthorityV681 = 'true';
  wheel.dataset.gannzillaCardinalChampagneCountV681 = '4';
  cardinalDrawCount += 1;
  lastCardinalDraw = {
    source,
    cssSize,
    dpr,
    divisions,
    innerRadius,
    outerRadius,
    cardinalCount: 4,
    geometryChanged: false,
    numberLayoutChanged: false,
    at: Date.now(),
  };
  return true;
}

function scheduleCardinals(source, delay = 0) {
  window.clearTimeout(scheduleCardinals.timer);
  scheduleCardinals.timer = window.setTimeout(() => {
    window.requestAnimationFrame(() => drawCardinalAuthority(source));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || window[STATE_KEY]) return;

  const fillInstalled = installStyleAccessor('fillStyle', translateFill, 'fill');
  const strokeInstalled = installStyleAccessor('strokeStyle', translateStroke, 'stroke');
  const widthInstalled = installLineWidthAccessor();
  installed = fillInstalled && strokeInstalled && widthInstalled;

  window.addEventListener(FINAL_EVENT, () => scheduleCardinals(FINAL_EVENT, 0), false);
  window.addEventListener(LEGACY_FINAL_EVENT, () => scheduleCardinals(LEGACY_FINAL_EVENT, 0), false);
  window.addEventListener('resize', () => scheduleCardinals('resize', 20), false);
  window.addEventListener('gannzilla:native-dpr-zoom-v504', () => scheduleCardinals('zoom', 30), false);

  [0, 80, 220, 600, 1400, 3000, 6000].forEach((delay) => {
    window.setTimeout(() => scheduleCardinals(`boot-${delay}`, 0), delay);
  });

  window.GANNZILLA_NATIVE_WHEEL_IVORY_CHAMPAGNE_V681 = installed;
  window.__auditGannzillaNativeWheelIvoryChampagneV681 = () => {
    const wheel = findWheel();
    return {
      ok: installed
        && enabled()
        && wheel instanceof HTMLCanvasElement
        && fillReplacementCount > 0
        && strokeReplacementCount > 0
        && widthReplacementCount > 0
        && cardinalDrawCount > 0
        && wheel.dataset.gannzillaCardinalChampagneAuthorityV681 === 'true',
      build: BUILD,
      enabled: enabled(),
      installed,
      wheelFound: wheel instanceof HTMLCanvasElement,
      fillReplacementCount,
      strokeReplacementCount,
      widthReplacementCount,
      cardinalDrawCount,
      ivoryFill: IVORY_FILL,
      champagneGrid: CHAMPAGNE_GRID,
      champagneFrame: CHAMPAGNE_FRAME,
      cardinalDark: CARDINAL_DARK,
      cardinalGold: CARDINAL_GOLD,
      cardinalLight: CARDINAL_LIGHT,
      geometryChanged: false,
      numberLayoutChanged: false,
      lastReplacement,
      lastCardinalDraw,
    };
  };

  window[STATE_KEY] = {
    installed,
    translateFill,
    translateStroke,
    translateLineWidth,
    drawCardinalAuthority,
    scheduleCardinals,
  };
}

install();
