const BUILD = 542;
const STATE_KEY = '__gannzillaTimeRingOverlayV542';
const OVERLAY_ID = 'gannzilla-time-ring-overlay-v542';
const SVG_NS = 'http://www.w3.org/2000/svg';

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

function enabled() {
  return wheelMode()
    && boolParam('timeRing', false)
    && boolParam('gannzillaTimeRingOverlay', true);
}

function findWheel() {
  const canvas = document.querySelector('canvas[data-gannzilla-empty-outer-ring-v518="true"]');
  return canvas instanceof HTMLCanvasElement && !canvas.closest('aside') ? canvas : null;
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: cx + Math.cos(radians) * radius,
    y: cy + Math.sin(radians) * radius,
  };
}

function annularSectorPath(cx, cy, inner, outer, centerDegrees, spanDegrees, direction) {
  const startDegrees = centerDegrees - direction * spanDegrees / 2;
  const endDegrees = centerDegrees + direction * spanDegrees / 2;
  const outerStart = polar(cx, cy, outer, startDegrees);
  const outerEnd = polar(cx, cy, outer, endDegrees);
  const innerEnd = polar(cx, cy, inner, endDegrees);
  const innerStart = polar(cx, cy, inner, startDegrees);
  const sweep = direction > 0 ? 1 : 0;
  const reverseSweep = sweep ? 0 : 1;

  return [
    `M ${outerStart.x.toFixed(3)} ${outerStart.y.toFixed(3)}`,
    `A ${outer.toFixed(3)} ${outer.toFixed(3)} 0 0 ${sweep} ${outerEnd.x.toFixed(3)} ${outerEnd.y.toFixed(3)}`,
    `L ${innerEnd.x.toFixed(3)} ${innerEnd.y.toFixed(3)}`,
    `A ${inner.toFixed(3)} ${inner.toFixed(3)} 0 0 ${reverseSweep} ${innerStart.x.toFixed(3)} ${innerStart.y.toFixed(3)}`,
    'Z',
  ].join(' ');
}

function readableRotation(degrees) {
  const normalized = ((degrees % 360) + 360) % 360;
  return normalized > 90 && normalized < 270 ? degrees + 180 : degrees;
}

function formatTime(date) {
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

function removeOverlay() {
  document.getElementById(OVERLAY_ID)?.remove();
}

let overlay = null;
let activeCanvas = null;
let canvasObserver = null;
let layoutFrame = 0;
let renderFrame = 0;
let clockTimer = 0;
let applyCount = 0;
let lastApply = null;
let lastMinuteKey = '';

function ensureOverlay(canvas, expandedCssSize) {
  const stage = canvas.parentElement;
  if (!(stage instanceof HTMLElement)) return null;

  if (!(overlay instanceof SVGSVGElement)) {
    overlay = svgElement('svg', {
      id: OVERLAY_ID,
      xmlns: SVG_NS,
      'aria-hidden': 'true',
      focusable: 'false',
    });
    overlay.style.setProperty('position', 'absolute', 'important');
    overlay.style.setProperty('pointer-events', 'none', 'important');
    overlay.style.setProperty('user-select', 'none', 'important');
    overlay.style.setProperty('overflow', 'visible', 'important');
    overlay.style.setProperty('z-index', '24', 'important');
    overlay.style.setProperty('transition', 'none', 'important');
    overlay.style.setProperty('will-change', 'transform', 'important');
  }

  const stageStyle = window.getComputedStyle(stage);
  if (stageStyle.position === 'static') {
    stage.style.setProperty('position', 'relative');
    stage.dataset.gannzillaTimeRingPositionContextV542 = 'true';
  }

  if (overlay.parentElement !== stage) stage.appendChild(overlay);
  overlay.setAttribute('viewBox', `0 0 ${expandedCssSize} ${expandedCssSize}`);
  overlay.setAttribute('preserveAspectRatio', 'none');
  return overlay;
}

function syncOverlayLayout(source = 'layout') {
  if (!enabled()) {
    removeOverlay();
    overlay = null;
    return false;
  }

  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)) return false;
  const expandedCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 || 0);
  if (!(expandedCssSize > 0)) return false;

  const svg = ensureOverlay(canvas, expandedCssSize);
  if (!(svg instanceof SVGSVGElement)) return false;

  svg.style.setProperty('left', `${canvas.offsetLeft}px`, 'important');
  svg.style.setProperty('top', `${canvas.offsetTop}px`, 'important');
  svg.style.setProperty('width', `${canvas.offsetWidth}px`, 'important');
  svg.style.setProperty('height', `${canvas.offsetHeight}px`, 'important');
  svg.style.setProperty('transform', canvas.style.transform || 'none', 'important');
  svg.style.setProperty('transform-origin', canvas.style.transformOrigin || 'center center', 'important');
  svg.dataset.gannzillaTimeRingLayoutSourceV542 = source;

  if (activeCanvas !== canvas) {
    canvasObserver?.disconnect();
    activeCanvas = canvas;
    canvasObserver = new MutationObserver(() => scheduleLayout('canvas-mutation'));
    canvasObserver.observe(canvas, {
      attributes: true,
      attributeFilter: ['style', 'width', 'height', 'class'],
    });
  }

  return true;
}

function addDefinitions(svg) {
  const defs = svgElement('defs');

  const activeGradient = svgElement('linearGradient', {
    id: 'gannzilla-time-active-gradient-v542',
    x1: '0%', y1: '0%', x2: '100%', y2: '100%',
  });
  [
    ['0%', '#7a2c08'],
    ['32%', '#b8581f'],
    ['67%', '#e99759'],
    ['100%', '#71300e'],
  ].forEach(([offset, color]) => activeGradient.appendChild(svgElement('stop', { offset, 'stop-color': color })));

  const badgeGradient = svgElement('linearGradient', {
    id: 'gannzilla-time-badge-gradient-v542',
    x1: '0%', y1: '0%', x2: '0%', y2: '100%',
  });
  [
    ['0%', '#fff9f1'],
    ['55%', '#f7dec5'],
    ['100%', '#d9965d'],
  ].forEach(([offset, color]) => badgeGradient.appendChild(svgElement('stop', { offset, 'stop-color': color })));

  const glow = svgElement('filter', {
    id: 'gannzilla-time-glow-v542',
    x: '-80%', y: '-80%', width: '260%', height: '260%',
  });
  glow.appendChild(svgElement('feDropShadow', {
    dx: '0', dy: '0', stdDeviation: '4',
    'flood-color': '#d7782f', 'flood-opacity': '0.86',
  }));

  defs.appendChild(activeGradient);
  defs.appendChild(badgeGradient);
  defs.appendChild(glow);
  svg.appendChild(defs);
}

function drawTimeRing(source = 'apply') {
  if (!syncOverlayLayout(source)) return false;
  const canvas = findWheel();
  const svg = overlay;
  if (!(canvas instanceof HTMLCanvasElement) || !(svg instanceof SVGSVGElement)) return false;

  const baseCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingBaseCssSizeV518 || 0);
  const expandedCssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 || 0);
  const ringWidth = Number(canvas.dataset.gannzillaEmptyOuterRingWidthV518 || 0);
  const appliedZoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);
  const clockwise = boolParam('clockwise', true);

  if (!(baseCssSize > 0) || !(expandedCssSize > 0) || !(ringWidth > 0)
      || canvas.dataset.gannzillaZodiacOuterRingV522 !== 'true') return false;

  const direction = clockwise ? 1 : -1;
  const cx = expandedCssSize / 2;
  const cy = expandedCssSize / 2;
  const margin = 90 * appliedZoom;
  const zodiacInner = Math.max(1, (baseCssSize - margin * 2) / 2);
  const insetScale = numberParam('gannzillaTimeRingInsetScale', 0.055, 0.02, 0.22);
  const widthScale = numberParam('gannzillaTimeRingWidthScale', 0.34, 0.20, 0.52);
  const outer = zodiacInner - ringWidth * insetScale;
  const width = ringWidth * widthScale;
  const inner = outer - width;
  const labelRadius = inner + width * 0.51;
  const fontSize = numberParam('gannzillaTimeRingFontSize', 13, 8, 22) * appliedZoom;
  const badgeWidth = numberParam('gannzillaTimeBadgeWidth', 76, 54, 118) * appliedZoom;
  const badgeHeight = numberParam('gannzillaTimeBadgeHeight', 29, 22, 48) * appliedZoom;
  const badgeRadius = inner - badgeHeight * 0.72;
  const date = new Date();
  const activeMinute = date.getMinutes();
  const minuteKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${activeMinute}`;

  while (svg.firstChild) svg.removeChild(svg.firstChild);
  addDefinitions(svg);

  const ringGroup = svgElement('g', {
    'data-gannzilla-time-ring-cells-v542': '60',
  });

  for (let minute = 0; minute < 60; minute += 1) {
    const centerDegrees = direction * minute * 6;
    const active = minute === activeMinute;
    const path = svgElement('path', {
      d: annularSectorPath(cx, cy, inner, outer, centerDegrees, 6, direction),
      fill: active ? 'url(#gannzilla-time-active-gradient-v542)' : 'rgba(255,255,255,0.20)',
      stroke: active ? '#7d300d' : 'rgba(117,72,43,0.42)',
      'stroke-width': active ? Math.max(1.4, 1.15 * appliedZoom) : Math.max(0.55, 0.52 * appliedZoom),
      'vector-effect': 'non-scaling-stroke',
      'data-minute': String(minute).padStart(2, '0'),
      'data-active': active ? 'true' : 'false',
    });
    if (active) path.setAttribute('filter', 'url(#gannzilla-time-glow-v542)');
    ringGroup.appendChild(path);

    const point = polar(cx, cy, labelRadius, centerDegrees);
    const rotation = readableRotation(centerDegrees);
    const text = svgElement('text', {
      x: '0', y: '0',
      transform: `translate(${point.x.toFixed(3)} ${point.y.toFixed(3)}) rotate(${rotation.toFixed(3)})`,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-family': 'Arial, "Segoe UI", sans-serif',
      'font-size': fontSize.toFixed(3),
      'font-weight': active ? '800' : '700',
      fill: active ? '#ffffff' : 'rgba(45,29,20,0.86)',
      'paint-order': 'stroke',
      stroke: active ? 'rgba(80,25,4,0.48)' : 'rgba(255,255,255,0.65)',
      'stroke-width': active ? Math.max(0.5, 0.42 * appliedZoom) : Math.max(0.28, 0.24 * appliedZoom),
    });
    text.textContent = String(minute).padStart(2, '0');
    ringGroup.appendChild(text);
  }

  ringGroup.appendChild(svgElement('circle', {
    cx, cy, r: inner,
    fill: 'none', stroke: 'rgba(122,62,23,0.72)',
    'stroke-width': Math.max(0.7, 0.72 * appliedZoom),
    'vector-effect': 'non-scaling-stroke',
  }));
  ringGroup.appendChild(svgElement('circle', {
    cx, cy, r: outer,
    fill: 'none', stroke: 'rgba(122,62,23,0.80)',
    'stroke-width': Math.max(0.9, 0.88 * appliedZoom),
    'vector-effect': 'non-scaling-stroke',
  }));
  svg.appendChild(ringGroup);

  const activeDegrees = direction * activeMinute * 6;
  const badgePoint = polar(cx, cy, badgeRadius, activeDegrees);
  const badgeRotation = readableRotation(activeDegrees);
  const badge = svgElement('g', {
    transform: `translate(${badgePoint.x.toFixed(3)} ${badgePoint.y.toFixed(3)}) rotate(${badgeRotation.toFixed(3)})`,
    filter: 'url(#gannzilla-time-glow-v542)',
    'data-gannzilla-time-badge-v542': 'true',
  });
  badge.appendChild(svgElement('rect', {
    x: (-badgeWidth / 2).toFixed(3),
    y: (-badgeHeight / 2).toFixed(3),
    width: badgeWidth.toFixed(3),
    height: badgeHeight.toFixed(3),
    rx: (badgeHeight * 0.22).toFixed(3),
    fill: 'url(#gannzilla-time-badge-gradient-v542)',
    stroke: '#8b3d11',
    'stroke-width': Math.max(1.1, 1.05 * appliedZoom),
  }));
  const badgeText = svgElement('text', {
    x: '0', y: '0',
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
    'font-family': 'Arial, "Segoe UI", sans-serif',
    'font-size': (numberParam('gannzillaTimeBadgeFontSize', 17, 12, 27) * appliedZoom).toFixed(3),
    'font-weight': '800',
    fill: '#522006',
  });
  badgeText.textContent = formatTime(date);
  badge.appendChild(badgeText);
  svg.appendChild(badge);

  svg.dataset.gannzillaTimeRingOverlayV542 = 'true';
  svg.dataset.gannzillaTimeRingPositionV542 = 'under-zodiac-inside';
  svg.dataset.gannzillaTimeRingCellCountV542 = '60';
  svg.dataset.gannzillaTimeRingActiveMinuteV542 = String(activeMinute).padStart(2, '0');
  svg.dataset.gannzillaTimeRingDisplayedTimeV542 = formatTime(date);
  svg.dataset.gannzillaTimeRingCanvasResizedV542 = 'false';
  svg.dataset.gannzillaTimeRingBaseGeometryChangedV542 = 'false';
  canvas.dataset.gannzillaTimeRingOverlayV542 = 'true';
  canvas.dataset.gannzillaAuthorityBuild = String(BUILD);

  applyCount += 1;
  lastMinuteKey = minuteKey;
  lastApply = {
    source,
    build: BUILD,
    cells: 60,
    activeMinute,
    displayedTime: formatTime(date),
    position: 'under-zodiac-inside',
    canvasResized: false,
    baseGeometryChanged: false,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:time-ring-overlay-v542', { detail: lastApply }));
  return true;
}

function scheduleLayout(source = 'schedule-layout') {
  cancelAnimationFrame(layoutFrame);
  layoutFrame = requestAnimationFrame(() => {
    syncOverlayLayout(source);
    scheduleRender(source);
  });
}

function scheduleRender(source = 'schedule-render') {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => drawTimeRing(source));
}

function tickClock() {
  if (!enabled()) {
    removeOverlay();
    overlay = null;
    return;
  }
  const date = new Date();
  const minuteKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
  if (minuteKey !== lastMinuteKey) scheduleRender('clock-minute-change');
  else syncOverlayLayout('clock-layout-sync');
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || window[STATE_KEY]) return;

  const refresh = (event) => scheduleLayout(event?.type || 'refresh');
  [
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:zodiac-outer-ring-v522',
    'gannzilla:weekdays-outer-ring-v523',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
    'gannzilla:stable-pan-wheel-v510',
  ].forEach((eventName) => window.addEventListener(eventName, refresh, false));
  window.addEventListener('resize', refresh, false);
  window.addEventListener('scroll', () => scheduleLayout('window-scroll'), { passive: true });

  [180, 420, 900, 1700, 3200, 5600, 9000].forEach((delay) => {
    window.setTimeout(() => scheduleLayout(`boot-${delay}`), delay);
  });

  clockTimer = window.setInterval(tickClock, 1000);

  window.GANNZILLA_TIME_RING_OVERLAY_V542 = true;
  window.__auditGannzillaTimeRingOverlayV542 = () => {
    const canvas = findWheel();
    const svg = document.getElementById(OVERLAY_ID);
    return {
      ok: !enabled() || (
        canvas instanceof HTMLCanvasElement
        && svg instanceof SVGSVGElement
        && svg.dataset.gannzillaTimeRingOverlayV542 === 'true'
        && svg.dataset.gannzillaTimeRingPositionV542 === 'under-zodiac-inside'
        && Number(svg.dataset.gannzillaTimeRingCellCountV542) === 60
        && svg.dataset.gannzillaTimeRingCanvasResizedV542 === 'false'
        && svg.dataset.gannzillaTimeRingBaseGeometryChangedV542 === 'false'
      ),
      build: BUILD,
      enabled: enabled(),
      cells: Number(svg?.dataset?.gannzillaTimeRingCellCountV542 || 0),
      activeMinute: svg?.dataset?.gannzillaTimeRingActiveMinuteV542 || null,
      displayedTime: svg?.dataset?.gannzillaTimeRingDisplayedTimeV542 || null,
      position: svg?.dataset?.gannzillaTimeRingPositionV542 || null,
      canvasResized: svg?.dataset?.gannzillaTimeRingCanvasResizedV542 === 'true',
      baseGeometryChanged: svg?.dataset?.gannzillaTimeRingBaseGeometryChangedV542 === 'true',
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = {
    drawTimeRing,
    scheduleLayout,
    scheduleRender,
    removeOverlay,
    get clockTimer() { return clockTimer; },
  };

  scheduleLayout('install');
}

install();