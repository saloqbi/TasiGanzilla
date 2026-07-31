const BUILD = 685;
const STATE_KEY = '__gannzillaOrnateOuterFrameV685';
const ENABLE_PARAM = 'ornateOuterFrame';
const TWO_PI = Math.PI * 2;

let frame = 0;
let timer = 0;
let applyCount = 0;
let lastApply = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function enabled() {
  return wheelMode() && boolParam(ENABLE_PARAM, true);
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-wheel-ivory-champagne-final-authority-v682="true"]',
    'canvas[data-gannzilla-outer-empty-ring-mirror-silver-v668="true"]',
    'canvas[data-gannzilla-empty-outer-ring-v518="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
  ].join(','));
  return preferred instanceof HTMLCanvasElement && !preferred.closest('aside') ? preferred : null;
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: cx + Math.cos(radians) * radius,
    y: cy + Math.sin(radians) * radius,
  };
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

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawDiamond(ctx, cx, cy, radius, angle, zoom) {
  const point = polar(cx, cy, radius, angle);
  const size = Math.max(7, 10.5 * zoom);

  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate((angle * Math.PI) / 180 + Math.PI / 4);

  const gold = ctx.createLinearGradient(-size, -size, size, size);
  gold.addColorStop(0, '#fff0a8');
  gold.addColorStop(0.24, '#d99424');
  gold.addColorStop(0.55, '#fff2a9');
  gold.addColorStop(1, '#8a470d');

  ctx.beginPath();
  ctx.rect(-size / 2, -size / 2, size, size);
  ctx.fillStyle = '#1a130f';
  ctx.fill();
  ctx.strokeStyle = '#3a1d08';
  ctx.lineWidth = Math.max(1.2, 1.8 * zoom);
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(-size * 0.36, -size * 0.36, size * 0.72, size * 0.72);
  ctx.fillStyle = gold;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.20, 0, TWO_PI);
  const gem = ctx.createRadialGradient(-size * 0.05, -size * 0.08, 0, 0, 0, size * 0.22);
  gem.addColorStop(0, '#e8fbff');
  gem.addColorStop(0.28, '#65c8ff');
  gem.addColorStop(0.70, '#176fbd');
  gem.addColorStop(1, '#083a73');
  ctx.fillStyle = gem;
  ctx.fill();
  ctx.strokeStyle = '#f8d985';
  ctx.lineWidth = Math.max(0.7, 1.0 * zoom);
  ctx.stroke();

  ctx.restore();
}

function drawCardinalOrnament(ctx, cx, cy, radius, angle, label, frameWidth, zoom) {
  const point = polar(cx, cy, radius, angle);
  const radians = (angle * Math.PI) / 180;
  const plaqueWidth = Math.max(58, frameWidth * 0.86);
  const plaqueHeight = Math.max(27, frameWidth * 0.38);
  const wing = Math.max(28, frameWidth * 0.46);

  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(radians);

  const goldStroke = ctx.createLinearGradient(-plaqueWidth, 0, plaqueWidth, 0);
  goldStroke.addColorStop(0, '#6d3108');
  goldStroke.addColorStop(0.22, '#e7a936');
  goldStroke.addColorStop(0.48, '#fff0a0');
  goldStroke.addColorStop(0.76, '#d4821d');
  goldStroke.addColorStop(1, '#612806');

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  [-1, 1].forEach((side) => {
    ctx.save();
    ctx.scale(side, 1);

    ctx.beginPath();
    ctx.moveTo(plaqueWidth * 0.42, 0);
    ctx.bezierCurveTo(
      plaqueWidth * 0.62, -wing * 0.48,
      plaqueWidth * 0.94, -wing * 0.58,
      plaqueWidth * 1.12, -wing * 0.18,
    );
    ctx.bezierCurveTo(
      plaqueWidth * 0.92, -wing * 0.17,
      plaqueWidth * 0.80, wing * 0.12,
      plaqueWidth * 0.64, wing * 0.22,
    );
    ctx.strokeStyle = goldStroke;
    ctx.lineWidth = Math.max(2.0, 2.5 * zoom);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(plaqueWidth * 0.48, plaqueHeight * 0.16);
    ctx.bezierCurveTo(
      plaqueWidth * 0.68, wing * 0.48,
      plaqueWidth * 0.94, wing * 0.52,
      plaqueWidth * 1.04, wing * 0.18,
    );
    ctx.strokeStyle = '#9b5010';
    ctx.lineWidth = Math.max(1.2, 1.5 * zoom);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(plaqueWidth * 0.58, -plaqueHeight * 0.13);
    ctx.bezierCurveTo(
      plaqueWidth * 0.72, -wing * 0.30,
      plaqueWidth * 0.84, -wing * 0.26,
      plaqueWidth * 0.88, -wing * 0.07,
    );
    ctx.strokeStyle = '#ffdda0';
    ctx.lineWidth = Math.max(0.8, 1.0 * zoom);
    ctx.stroke();

    ctx.restore();
  });

  ctx.save();
  ctx.rotate(-radians);

  const plaqueX = -plaqueWidth / 2;
  const plaqueY = -plaqueHeight / 2;
  roundedRectPath(ctx, plaqueX, plaqueY, plaqueWidth, plaqueHeight, plaqueHeight * 0.34);
  const plaqueGradient = ctx.createLinearGradient(0, plaqueY, 0, plaqueY + plaqueHeight);
  plaqueGradient.addColorStop(0, '#31261f');
  plaqueGradient.addColorStop(0.48, '#08090b');
  plaqueGradient.addColorStop(1, '#24170f');
  ctx.fillStyle = plaqueGradient;
  ctx.fill();
  ctx.strokeStyle = goldStroke;
  ctx.lineWidth = Math.max(2.0, 2.7 * zoom);
  ctx.stroke();

  roundedRectPath(
    ctx,
    plaqueX + plaqueHeight * 0.11,
    plaqueY + plaqueHeight * 0.11,
    plaqueWidth - plaqueHeight * 0.22,
    plaqueHeight - plaqueHeight * 0.22,
    plaqueHeight * 0.25,
  );
  ctx.strokeStyle = 'rgba(255,230,151,0.58)';
  ctx.lineWidth = Math.max(0.7, 0.9 * zoom);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, plaqueY - plaqueHeight * 0.72);
  ctx.lineTo(plaqueHeight * 0.34, plaqueY - plaqueHeight * 0.16);
  ctx.lineTo(0, plaqueY + plaqueHeight * 0.02);
  ctx.lineTo(-plaqueHeight * 0.34, plaqueY - plaqueHeight * 0.16);
  ctx.closePath();
  ctx.fillStyle = goldStroke;
  ctx.fill();
  ctx.strokeStyle = '#4f2107';
  ctx.lineWidth = Math.max(1.0, 1.3 * zoom);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, plaqueY - plaqueHeight * 0.30, plaqueHeight * 0.13, 0, TWO_PI);
  const jewel = ctx.createRadialGradient(
    -plaqueHeight * 0.04,
    plaqueY - plaqueHeight * 0.35,
    0,
    0,
    plaqueY - plaqueHeight * 0.30,
    plaqueHeight * 0.15,
  );
  jewel.addColorStop(0, '#effcff');
  jewel.addColorStop(0.34, '#78d0ff');
  jewel.addColorStop(0.72, '#1a78c5');
  jewel.addColorStop(1, '#073b77');
  ctx.fillStyle = jewel;
  ctx.fill();
  ctx.strokeStyle = '#ffe49b';
  ctx.lineWidth = Math.max(0.8, 1.1 * zoom);
  ctx.stroke();

  ctx.font = `800 ${Math.max(18, plaqueHeight * 0.62)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff0bd';
  ctx.strokeStyle = '#241004';
  ctx.lineWidth = Math.max(1.2, 1.7 * zoom);
  ctx.strokeText(label, 0, 1 * zoom);
  ctx.fillText(label, 0, 1 * zoom);

  ctx.restore();
  ctx.restore();
}

function ornateGradient(ctx, cx, cy, inner, outer) {
  const gradient = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  gradient.addColorStop(0, '#5b2b0c');
  gradient.addColorStop(0.055, '#edac3a');
  gradient.addColorStop(0.12, '#ffdda0');
  gradient.addColorStop(0.18, '#7c3b0c');
  gradient.addColorStop(0.25, '#171311');
  gradient.addColorStop(0.50, '#050607');
  gradient.addColorStop(0.73, '#17120f');
  gradient.addColorStop(0.82, '#8b480f');
  gradient.addColorStop(0.90, '#ffcf76');
  gradient.addColorStop(0.955, '#a55a16');
  gradient.addColorStop(1, '#3b1b08');
  return gradient;
}

function drawFrame(source = 'apply', force = false) {
  frame = 0;
  if (!enabled()) return false;

  const canvas = findWheel();
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  const cssSize = Number(
    canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518
      || canvas.dataset.gannzillaCanvasCssSize
      || canvas.getBoundingClientRect().width
      || 0,
  );
  const dpr = Math.max(
    1,
    Number(canvas.dataset.gannzillaNativeDpr)
      || (cssSize > 0 ? canvas.width / cssSize : 0)
      || Number(window.devicePixelRatio)
      || 1,
  );
  const zoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);

  if (!(cssSize > 0) || canvas.width < 1 || canvas.height < 1) return false;

  const renderKey = [
    canvas.width,
    canvas.height,
    cssSize,
    dpr.toFixed(4),
    zoom.toFixed(4),
  ].join(':');
  if (!force && canvas.dataset.gannzillaOrnateOuterFrameRenderKeyV685 === renderKey) {
    return true;
  }

  const cx = cssSize / 2;
  const cy = cssSize / 2;
  const half = cssSize / 2;
  const reservedMargin = 90 * zoom;
  const existingOuter = half - reservedMargin;
  const inner = existingOuter + Math.max(5, 6 * zoom);
  const outer = half - Math.max(5, 7 * zoom);
  const frameWidth = outer - inner;

  if (!(frameWidth > Math.max(38, 48 * zoom))) return false;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;

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

  // Reset only the previously unused outer margin. Existing wheel and silver frame
  // end at existingOuter and remain untouched.
  fillAnnulus(ctx, cx, cy, existingOuter + Math.max(1.2, 1.5 * zoom), half, '#fbf6ea');

  fillAnnulus(ctx, cx, cy, inner, outer, ornateGradient(ctx, cx, cy, inner, outer));

  const innerGold = ctx.createRadialGradient(cx, cy, inner, cx, cy, inner + frameWidth * 0.15);
  innerGold.addColorStop(0, '#5d2605');
  innerGold.addColorStop(0.32, '#e79c2c');
  innerGold.addColorStop(0.65, '#fff0aa');
  innerGold.addColorStop(1, '#8e430c');

  const outerGold = ctx.createRadialGradient(cx, cy, outer - frameWidth * 0.15, cx, cy, outer);
  outerGold.addColorStop(0, '#6d2d07');
  outerGold.addColorStop(0.38, '#f0aa39');
  outerGold.addColorStop(0.72, '#ffe8a0');
  outerGold.addColorStop(1, '#6b2a06');

  strokeCircle(ctx, cx, cy, inner, '#381606', Math.max(2.2, 3.0 * zoom));
  strokeCircle(ctx, cx, cy, inner + frameWidth * 0.055, innerGold, Math.max(3.0, 4.0 * zoom));
  strokeCircle(ctx, cx, cy, inner + frameWidth * 0.13, 'rgba(255,235,166,0.78)', Math.max(0.9, 1.2 * zoom));
  strokeCircle(ctx, cx, cy, inner + frameWidth * 0.24, '#4d250b', Math.max(1.0, 1.4 * zoom));
  strokeCircle(ctx, cx, cy, outer - frameWidth * 0.22, '#6e340a', Math.max(1.0, 1.4 * zoom));
  strokeCircle(ctx, cx, cy, outer - frameWidth * 0.12, 'rgba(255,226,139,0.82)', Math.max(1.0, 1.3 * zoom));
  strokeCircle(ctx, cx, cy, outer - frameWidth * 0.055, outerGold, Math.max(3.2, 4.4 * zoom));
  strokeCircle(ctx, cx, cy, outer, '#301104', Math.max(2.4, 3.2 * zoom));

  const beadRadius = inner + frameWidth * 0.19;
  for (let degree = 0; degree < 360; degree += 5) {
    if (degree % 45 === 0) continue;
    const point = polar(cx, cy, beadRadius, degree);
    ctx.beginPath();
    ctx.arc(point.x, point.y, Math.max(0.65, 0.95 * zoom), 0, TWO_PI);
    ctx.fillStyle = degree % 10 === 0 ? '#f9d77e' : '#9e5b1d';
    ctx.fill();
  }

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.beginPath();
  ctx.arc(
    cx,
    cy,
    inner + frameWidth * 0.56,
    (205 * Math.PI) / 180,
    (335 * Math.PI) / 180,
  );
  const highlight = ctx.createLinearGradient(cx - outer, cy, cx + outer, cy);
  highlight.addColorStop(0, 'rgba(255,255,255,0)');
  highlight.addColorStop(0.35, 'rgba(255,215,139,0.10)');
  highlight.addColorStop(0.50, 'rgba(255,246,205,0.54)');
  highlight.addColorStop(0.65, 'rgba(255,215,139,0.10)');
  highlight.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.strokeStyle = highlight;
  ctx.lineWidth = Math.max(1.8, frameWidth * 0.075);
  ctx.stroke();
  ctx.restore();

  [45, 135, 225, 315].forEach((angle) => {
    drawDiamond(ctx, cx, cy, inner + frameWidth * 0.54, angle, zoom);
  });

  [
    [0, '360°'],
    [90, '90°'],
    [180, '180°'],
    [270, '270°'],
  ].forEach(([angle, label]) => {
    drawCardinalOrnament(
      ctx,
      cx,
      cy,
      inner + frameWidth * 0.54,
      angle,
      label,
      frameWidth,
      zoom,
    );
  });

  ctx.restore();

  canvas.dataset.gannzillaOrnateOuterFrameV685 = 'true';
  canvas.dataset.gannzillaOrnateOuterFrameRenderKeyV685 = renderKey;
  canvas.dataset.gannzillaOrnateOuterFrameInnerV685 = String(inner);
  canvas.dataset.gannzillaOrnateOuterFrameOuterV685 = String(outer);
  canvas.dataset.gannzillaOrnateOuterFrameGeometryChangedV685 = 'false';
  canvas.dataset.gannzillaOrnateOuterFrameExistingContentChangedV685 = 'false';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    innerRadius: inner,
    outerRadius: outer,
    frameWidth,
    material: 'gloss-black-antique-gold-blue-gem',
    cardinalOrnaments: [360, 90, 180, 270],
    diamondMarkers: [45, 135, 225, 315],
    geometryChanged: false,
    existingContentChanged: false,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent('gannzilla:ornate-outer-frame-v685', {
    detail: lastApply,
  }));
  return true;
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(ENABLE_PARAM, 'true');
    url.searchParams.set('ornateOuterFrameBuild', String(BUILD));
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    );
  } catch (_) {
    // Runtime rendering remains authoritative if URL replacement is blocked.
  }
}

function schedule(source = 'schedule', force = true, delay = 0) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => drawFrame(source, force));
  }, delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !wheelMode()
      || window[STATE_KEY]) return;

  persistFlags();

  [
    'gannzilla:wheel-ivory-champagne-final-authority-v682',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:outer-empty-ring-mirror-silver-v668',
    'gannzilla:panel-exact-mirror-silver-v669',
    'gannzilla:angle-tick-contrast-black-silver-v666',
    'gannzilla:metallic-angle-outer-ring-v531',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:native-dpr-zoom-v504',
  ].forEach((name) => {
    window.addEventListener(name, () => schedule(name, true, 55), false);
  });

  window.addEventListener('resize', () => schedule('window-resize', true, 90), false);

  [0, 100, 260, 620, 1250, 2400, 4800, 8200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, true, 0), delay);
  });

  if (document.fonts?.ready) {
    document.fonts.ready
      .then(() => schedule('fonts-ready', true, 0))
      .catch(() => {});
  }

  window.GANNZILLA_ORNATE_OUTER_FRAME_V685 = true;
  window.__auditGannzillaOrnateOuterFrameV685 = () => {
    const canvas = findWheel();
    return {
      ok: enabled()
        && canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaOrnateOuterFrameV685 === 'true'
        && canvas.dataset.gannzillaOrnateOuterFrameGeometryChangedV685 === 'false'
        && canvas.dataset.gannzillaOrnateOuterFrameExistingContentChangedV685 === 'false',
      build: BUILD,
      enabled: enabled(),
      material: 'gloss-black-antique-gold-blue-gem',
      innerRadius: Number(canvas?.dataset?.gannzillaOrnateOuterFrameInnerV685 || 0),
      outerRadius: Number(canvas?.dataset?.gannzillaOrnateOuterFrameOuterV685 || 0),
      geometryChanged: canvas?.dataset?.gannzillaOrnateOuterFrameGeometryChangedV685 === 'true',
      existingContentChanged: canvas?.dataset?.gannzillaOrnateOuterFrameExistingContentChangedV685 === 'true',
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { drawFrame, schedule };
}

install();
