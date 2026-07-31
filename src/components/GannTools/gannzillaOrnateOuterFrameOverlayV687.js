const BUILD = 687;
const STATE_KEY = '__gannzillaOrnateOuterFrameOverlayV687';
const SVG_NS = 'http://www.w3.org/2000/svg';

let wheel = null;
let overlay = null;
let mutationObserver = null;
let resizeObserver = null;
let frame = 0;
let timer = 0;
let applyCount = 0;
let lastApply = null;
let renderKey = '';

function effectiveParams() {
  try {
    const raw = window.__gannzillaV672CanonicalSearch
      || window.sessionStorage.getItem('gannzilla:v672:canonical-search')
      || window.location.search
      || '';
    return new URLSearchParams(raw);
  } catch (_) {
    return new URLSearchParams();
  }
}

function boolParam(name, fallback = true) {
  const query = effectiveParams();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function enabled() {
  const query = effectiveParams();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  return wheelMode
    && boolParam('ornateOuterFrame', true)
    && (window.location.pathname === '/v672.html' || query.get('ornateOuterFrame') === 'true');
}

function isWheelCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
  const id = String(canvas.id || '').toLowerCase();
  if (id.includes('overlay') || id.includes('preview') || id.includes('tracker')) return false;
  return canvas.width > 300 && canvas.height > 300;
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-wheel-ivory-champagne-final-authority-v682="true"]',
    'canvas[data-gannzilla-outer-empty-ring-mirror-silver-v668="true"]',
    'canvas[data-gannzilla-empty-outer-ring-v518="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
  ].join(','));
  if (isWheelCanvas(preferred)) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter(isWheelCanvas)
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: cx + Math.cos(radians) * radius,
    y: cy + Math.sin(radians) * radius,
  };
}

function annulusPath(cx, cy, inner, outer) {
  return [
    `M ${cx + outer} ${cy}`,
    `A ${outer} ${outer} 0 1 0 ${cx - outer} ${cy}`,
    `A ${outer} ${outer} 0 1 0 ${cx + outer} ${cy}`,
    'Z',
    `M ${cx + inner} ${cy}`,
    `A ${inner} ${inner} 0 1 1 ${cx - inner} ${cy}`,
    `A ${inner} ${inner} 0 1 1 ${cx + inner} ${cy}`,
    'Z',
  ].join(' ');
}

function diamondMarkup(cx, cy, radius, angle, size) {
  const point = polar(cx, cy, radius, angle);
  const half = size / 2;
  return `
    <g transform="translate(${point.x} ${point.y}) rotate(45)">
      <rect x="${-half}" y="${-half}" width="${size}" height="${size}" rx="${size * 0.08}"
        fill="#090b0d" stroke="#4b2107" stroke-width="${Math.max(1.3, size * 0.14)}"/>
      <rect x="${-half * 0.68}" y="${-half * 0.68}" width="${size * 0.68}" height="${size * 0.68}"
        fill="url(#goldFacet687)" stroke="#ffe59d" stroke-width="${Math.max(0.7, size * 0.07)}"/>
      <circle cx="0" cy="0" r="${size * 0.17}" fill="url(#blueGem687)" stroke="#ffe49a"
        stroke-width="${Math.max(0.7, size * 0.07)}"/>
    </g>`;
}

function ornamentMarkup(cx, cy, radius, angle, label, frameWidth) {
  const point = polar(cx, cy, radius, angle);
  const plaqueW = clamp(frameWidth * 1.15, 66, 118);
  const plaqueH = clamp(frameWidth * 0.44, 28, 48);
  const wing = clamp(frameWidth * 0.56, 30, 62);
  const gemR = plaqueH * 0.13;
  const labelSize = clamp(plaqueH * 0.56, 18, 30);

  return `
    <g transform="translate(${point.x} ${point.y})">
      <path d="M ${-plaqueW * 0.36} 0
        C ${-plaqueW * 0.62} ${-wing * 0.72}, ${-plaqueW * 1.02} ${-wing * 0.68}, ${-plaqueW * 1.22} ${-wing * 0.12}
        C ${-plaqueW * 0.92} ${-wing * 0.18}, ${-plaqueW * 0.82} ${wing * 0.22}, ${-plaqueW * 0.53} ${wing * 0.28}"
        fill="none" stroke="url(#goldLine687)" stroke-width="${clamp(frameWidth * 0.055, 2.2, 5.5)}"
        stroke-linecap="round"/>
      <path d="M ${plaqueW * 0.36} 0
        C ${plaqueW * 0.62} ${-wing * 0.72}, ${plaqueW * 1.02} ${-wing * 0.68}, ${plaqueW * 1.22} ${-wing * 0.12}
        C ${plaqueW * 0.92} ${-wing * 0.18}, ${plaqueW * 0.82} ${wing * 0.22}, ${plaqueW * 0.53} ${wing * 0.28}"
        fill="none" stroke="url(#goldLine687)" stroke-width="${clamp(frameWidth * 0.055, 2.2, 5.5)}"
        stroke-linecap="round"/>
      <path d="M ${-plaqueW * 0.48} ${plaqueH * 0.18}
        C ${-plaqueW * 0.72} ${wing * 0.52}, ${-plaqueW * 0.98} ${wing * 0.42}, ${-plaqueW * 1.08} ${wing * 0.10}"
        fill="none" stroke="#9f5313" stroke-width="${clamp(frameWidth * 0.026, 1.1, 2.5)}"/>
      <path d="M ${plaqueW * 0.48} ${plaqueH * 0.18}
        C ${plaqueW * 0.72} ${wing * 0.52}, ${plaqueW * 0.98} ${wing * 0.42}, ${plaqueW * 1.08} ${wing * 0.10}"
        fill="none" stroke="#9f5313" stroke-width="${clamp(frameWidth * 0.026, 1.1, 2.5)}"/>
      <rect x="${-plaqueW / 2}" y="${-plaqueH / 2}" width="${plaqueW}" height="${plaqueH}"
        rx="${plaqueH * 0.30}" fill="url(#blackPlaque687)" stroke="url(#goldLine687)"
        stroke-width="${clamp(frameWidth * 0.052, 2.2, 5.2)}"/>
      <rect x="${-plaqueW / 2 + plaqueH * 0.10}" y="${-plaqueH / 2 + plaqueH * 0.10}"
        width="${plaqueW - plaqueH * 0.20}" height="${plaqueH - plaqueH * 0.20}"
        rx="${plaqueH * 0.22}" fill="none" stroke="rgba(255,235,168,0.55)"
        stroke-width="${clamp(frameWidth * 0.016, 0.8, 1.5)}"/>
      <path d="M 0 ${-plaqueH * 1.10} L ${plaqueH * 0.34} ${-plaqueH * 0.48}
        L 0 ${-plaqueH * 0.22} L ${-plaqueH * 0.34} ${-plaqueH * 0.48} Z"
        fill="url(#goldFacet687)" stroke="#542408" stroke-width="${clamp(frameWidth * 0.025, 1.0, 2.2)}"/>
      <circle cx="0" cy="${-plaqueH * 0.52}" r="${gemR}" fill="url(#blueGem687)" stroke="#ffe49a"
        stroke-width="${clamp(frameWidth * 0.018, 0.8, 1.8)}"/>
      <text x="0" y="${labelSize * 0.08}" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, sans-serif" font-size="${labelSize}" font-weight="800"
        fill="#fff1bf" stroke="#241004" stroke-width="${clamp(frameWidth * 0.022, 1.1, 2.2)}"
        paint-order="stroke">${label}</text>
    </g>`;
}

function buildMarkup(size, extension) {
  const cx = size / 2;
  const cy = size / 2;
  const canvasRadius = (size - extension * 2) / 2;
  const inner = canvasRadius + clamp(extension * 0.08, 3, 8);
  const outer = size / 2 - clamp(extension * 0.08, 3, 8);
  const frameWidth = outer - inner;
  const centerRadius = inner + frameWidth * 0.52;
  const beadRadius = inner + frameWidth * 0.20;
  const jewelSize = clamp(frameWidth * 0.22, 10, 21);

  const beads = [];
  for (let degree = 0; degree < 360; degree += 5) {
    if (degree % 45 === 0) continue;
    const p = polar(cx, cy, beadRadius, degree);
    const r = degree % 10 === 0 ? clamp(frameWidth * 0.016, 0.8, 1.7) : clamp(frameWidth * 0.011, 0.6, 1.2);
    beads.push(`<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${degree % 10 === 0 ? '#f7d77f' : '#9b5518'}"/>`);
  }

  const diamonds = [45, 135, 225, 315]
    .map((angle) => diamondMarkup(cx, cy, centerRadius, angle, jewelSize))
    .join('');

  const ornaments = [
    [0, '360°'],
    [90, '90°'],
    [180, '180°'],
    [270, '270°'],
  ].map(([angle, label]) => ornamentMarkup(cx, cy, centerRadius, angle, label, frameWidth)).join('');

  return `
    <defs>
      <radialGradient id="frameFill687" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#6f3108"/>
        <stop offset="8%" stop-color="#f0ac3c"/>
        <stop offset="15%" stop-color="#ffe8a3"/>
        <stop offset="23%" stop-color="#713008"/>
        <stop offset="32%" stop-color="#171411"/>
        <stop offset="52%" stop-color="#030506"/>
        <stop offset="72%" stop-color="#15110e"/>
        <stop offset="82%" stop-color="#7d390c"/>
        <stop offset="91%" stop-color="#ffd37c"/>
        <stop offset="97%" stop-color="#9c4f12"/>
        <stop offset="100%" stop-color="#351506"/>
      </radialGradient>
      <linearGradient id="goldLine687" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#6a2d07"/>
        <stop offset="22%" stop-color="#e9a538"/>
        <stop offset="49%" stop-color="#fff0a5"/>
        <stop offset="76%" stop-color="#d27b19"/>
        <stop offset="100%" stop-color="#5a2405"/>
      </linearGradient>
      <linearGradient id="goldFacet687" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff0a8"/>
        <stop offset="28%" stop-color="#d88d20"/>
        <stop offset="58%" stop-color="#fff3ad"/>
        <stop offset="100%" stop-color="#874108"/>
      </linearGradient>
      <radialGradient id="blueGem687" cx="34%" cy="28%" r="72%">
        <stop offset="0%" stop-color="#f1fdff"/>
        <stop offset="30%" stop-color="#72d0ff"/>
        <stop offset="70%" stop-color="#176fb8"/>
        <stop offset="100%" stop-color="#062f64"/>
      </radialGradient>
      <linearGradient id="blackPlaque687" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#39271e"/>
        <stop offset="48%" stop-color="#07090b"/>
        <stop offset="100%" stop-color="#24140d"/>
      </linearGradient>
      <filter id="frameShadow687" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="${clamp(frameWidth * 0.025, 1, 3)}" stdDeviation="${clamp(frameWidth * 0.045, 2, 6)}"
          flood-color="#000000" flood-opacity="0.45"/>
      </filter>
    </defs>
    <g filter="url(#frameShadow687)">
      <path d="${annulusPath(cx, cy, inner, outer)}" fill="url(#frameFill687)" fill-rule="evenodd"/>
      <circle cx="${cx}" cy="${cy}" r="${inner}" fill="none" stroke="#351404"
        stroke-width="${clamp(frameWidth * 0.055, 2.5, 6)}"/>
      <circle cx="${cx}" cy="${cy}" r="${inner + frameWidth * 0.075}" fill="none" stroke="url(#goldLine687)"
        stroke-width="${clamp(frameWidth * 0.075, 3.2, 7.5)}"/>
      <circle cx="${cx}" cy="${cy}" r="${inner + frameWidth * 0.17}" fill="none" stroke="rgba(255,235,168,0.78)"
        stroke-width="${clamp(frameWidth * 0.018, 0.9, 2)}"/>
      <circle cx="${cx}" cy="${cy}" r="${outer - frameWidth * 0.18}" fill="none" stroke="#6c3109"
        stroke-width="${clamp(frameWidth * 0.025, 1.1, 2.8)}"/>
      <circle cx="${cx}" cy="${cy}" r="${outer - frameWidth * 0.08}" fill="none" stroke="url(#goldLine687)"
        stroke-width="${clamp(frameWidth * 0.080, 3.5, 8)}"/>
      <circle cx="${cx}" cy="${cy}" r="${outer}" fill="none" stroke="#2e1003"
        stroke-width="${clamp(frameWidth * 0.055, 2.5, 6)}"/>
      ${beads.join('')}
      ${diamonds}
      ${ornaments}
    </g>`;
}

function createOverlay() {
  if (overlay?.isConnected) return overlay;
  overlay = document.createElementNS(SVG_NS, 'svg');
  overlay.id = 'gannzilla-ornate-outer-frame-overlay-v687';
  overlay.dataset.gannzillaOrnateOuterFrameOverlayV687 = 'true';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.setProperty('position', 'fixed', 'important');
  overlay.style.setProperty('pointer-events', 'none', 'important');
  overlay.style.setProperty('overflow', 'visible', 'important');
  overlay.style.setProperty('z-index', '4', 'important');
  overlay.style.setProperty('transform', 'translateZ(0)', 'important');
  overlay.style.setProperty('contain', 'layout style paint', 'important');
  document.body.appendChild(overlay);
  return overlay;
}

function disconnectCanvasObservers() {
  mutationObserver?.disconnect();
  resizeObserver?.disconnect();
  mutationObserver = null;
  resizeObserver = null;
}

function observeCanvas(canvas) {
  disconnectCanvasObservers();
  mutationObserver = new MutationObserver(() => schedule('canvas-mutation'));
  mutationObserver.observe(canvas, {
    attributes: true,
    attributeFilter: ['style', 'width', 'height', 'class'],
  });
  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(() => schedule('canvas-resize'));
    resizeObserver.observe(canvas);
  }
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled()) {
    if (overlay) overlay.style.display = 'none';
    return false;
  }

  const nextWheel = findWheel();
  if (!(nextWheel instanceof HTMLCanvasElement)) return false;
  if (wheel !== nextWheel) {
    wheel = nextWheel;
    observeCanvas(wheel);
    renderKey = '';
  }

  const rect = wheel.getBoundingClientRect();
  if (!(rect.width > 250) || !(rect.height > 250)) return false;

  const extension = clamp(Math.min(rect.width, rect.height) * 0.058, 46, 92);
  const width = rect.width + extension * 2;
  const height = rect.height + extension * 2;
  const size = Math.min(width, height);
  const nextKey = [
    Math.round(size * 10) / 10,
    Math.round(extension * 10) / 10,
    window.devicePixelRatio || 1,
  ].join(':');

  const svg = createOverlay();
  svg.style.display = 'block';
  svg.style.left = `${rect.left - extension}px`;
  svg.style.top = `${rect.top - extension}px`;
  svg.style.width = `${width}px`;
  svg.style.height = `${height}px`;
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));

  if (renderKey !== nextKey) {
    svg.innerHTML = buildMarkup(size, extension);
    renderKey = nextKey;
  }

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    overlay: true,
    independentFromWheelCanvas: true,
    wheelWidth: rect.width,
    extension,
    renderKey,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => apply(source));
  }, delay);
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || window[STATE_KEY]) return;

  const refresh = (event) => schedule(event?.type || 'refresh');
  [
    'gannzilla:wheel-ivory-champagne-final-authority-v682',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:outer-empty-ring-mirror-silver-v668',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
    'gannzilla:layout-panel-visibility-change',
  ].forEach((name) => window.addEventListener(name, refresh, false));

  window.addEventListener('resize', refresh, false);
  window.addEventListener('scroll', refresh, true);
  document.addEventListener('visibilitychange', refresh, false);

  [0, 80, 220, 520, 1000, 1800, 3200, 5600].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });
  const watchTimer = window.setInterval(() => schedule('overlay-watch'), 650);

  window.GANNZILLA_ORNATE_OUTER_FRAME_OVERLAY_V687 = true;
  window.__auditGannzillaOrnateOuterFrameOverlayV687 = () => ({
    ok: enabled()
      && wheel instanceof HTMLCanvasElement
      && overlay instanceof SVGElement
      && overlay.isConnected
      && overlay.dataset.gannzillaOrnateOuterFrameOverlayV687 === 'true'
      && overlay.style.display !== 'none',
    build: BUILD,
    enabled: enabled(),
    overlayConnected: Boolean(overlay?.isConnected),
    independentFromWheelCanvas: true,
    cannotBeOverwrittenByWheelRedraw: true,
    applyCount,
    lastApply,
  });

  window[STATE_KEY] = {
    apply,
    schedule,
    get wheel() { return wheel; },
    get overlay() { return overlay; },
    watchTimer,
  };
}

install();
