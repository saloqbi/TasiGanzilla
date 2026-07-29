import brandPart0 from './gannzillaBrandImageV247Part0';
import brandPart1 from './gannzillaBrandImageV247Part1';
import brandPart2 from './gannzillaBrandImageV247Part2';

const BUILD = 590;
const STATE_KEY = '__gannzillaCenterLogoStageV590';
const IMAGE_ID = 'gannzilla-center-logo-stage-v590';
const STYLE_ID = 'gannzilla-center-logo-stage-style-v590';
const STAGE_MARKER = 'gannzillaCenterLogoStageV590';
const LOGO_SCALE = 0.72;
const IMAGE_DATA_URL = `data:image/webp;base64,${brandPart0}${brandPart1}${brandPart2}`;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  const logoEnabled = !['false', '0', 'off', 'no'].includes(
    String(query.get('centerLogo') || 'true').toLowerCase(),
  );
  return wheelMode && logoEnabled;
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v491="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
      const rect = canvas.getBoundingClientRect();
      const style = getComputedStyle(canvas);
      return rect.width > 250
        && rect.height > 250
        && style.display !== 'none'
        && style.visibility !== 'hidden';
    })
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function removeLegacyLogoNodes() {
  [
    'gannzilla-center-logo-v579',
    'gannzilla-center-logo-layer-v580',
    'gannzilla-center-logo-visible-canvas-v581',
    'gannzilla-center-logo-fixed-image-v587',
    'gannzilla-center-logo-stable-fit-v588',
  ].forEach((id) => document.getElementById(id)?.remove());

  [
    'gannzilla-center-logo-style-v579',
    'gannzilla-center-logo-layer-style-v580',
    'gannzilla-center-logo-visible-canvas-style-v581',
    'gannzilla-center-logo-fixed-image-style-v587',
    'gannzilla-center-logo-stable-fit-style-v588',
  ].forEach((id) => document.getElementById(id)?.remove());
}

function ensureStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    [data-${STAGE_MARKER.replace(/[A-Z]/g, (value) => `-${value.toLowerCase()}`)}="true"] {
      position: relative !important;
    }

    #${IMAGE_ID} {
      position: absolute !important;
      display: block !important;
      z-index: 80 !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      border: 2px solid rgba(190, 141, 46, 0.98) !important;
      border-radius: 50% !important;
      clip-path: circle(50% at 50% 50%) !important;
      object-fit: cover !important;
      object-position: center center !important;
      background: #020202 !important;
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-drag: none !important;
      transition: none !important;
      animation: none !important;
      will-change: transform !important;
      transform-origin: center center !important;
    }
  `;
}

function ensureImage(stage) {
  let image = document.getElementById(IMAGE_ID);
  if (!(image instanceof HTMLImageElement)) {
    image = document.createElement('img');
    image.id = IMAGE_ID;
    image.alt = 'شعار كوكبة تاسي للذهب';
    image.draggable = false;
    image.decoding = 'async';
    image.loading = 'eager';
    image.style.setProperty('visibility', 'hidden', 'important');
    image.style.setProperty('opacity', '0', 'important');
    image.src = IMAGE_DATA_URL;
    image.addEventListener('load', () => scheduleGeometry('image-load'), { once: true });
    image.addEventListener('error', () => {
      image.style.setProperty('visibility', 'hidden', 'important');
      image.style.setProperty('opacity', '0', 'important');
      image.dataset.gannzillaCenterLogoImageErrorV590 = 'true';
    }, { once: true });
  }

  if (image.parentElement !== stage) stage.appendChild(image);
  return image;
}

let currentCanvas = null;
let currentStage = null;
let currentImage = null;
let baseCenterX = 0;
let baseCenterY = 0;
let diameter = 0;
let panX = 0;
let panY = 0;
let geometryFrame = 0;
let geometryApplyCount = 0;
let panApplyCount = 0;
let lastGeometry = null;
let lastPan = null;

function readPan(canvas, detail = null) {
  const nextX = Number(detail?.x);
  const nextY = Number(detail?.y);
  return {
    x: Number.isFinite(nextX) ? nextX : Number(canvas?.dataset?.gannzillaPanX || 0),
    y: Number.isFinite(nextY) ? nextY : Number(canvas?.dataset?.gannzillaPanY || 0),
  };
}

function applyPan(source = 'pan', detail = null) {
  if (!(currentCanvas instanceof HTMLCanvasElement)
      || !(currentImage instanceof HTMLImageElement)) return false;

  const next = readPan(currentCanvas, detail);
  panX = Number.isFinite(next.x) ? next.x : 0;
  panY = Number.isFinite(next.y) ? next.y : 0;

  currentImage.style.setProperty(
    'transform',
    `translate3d(calc(-50% + ${panX}px), calc(-50% + ${panY}px), 0)`,
    'important',
  );

  currentImage.dataset.gannzillaCenterLogoPanXV590 = String(panX);
  currentImage.dataset.gannzillaCenterLogoPanYV590 = String(panY);
  panApplyCount += 1;
  lastPan = { source, panX, panY, at: Date.now() };
  return true;
}

function applyGeometry(source = 'geometry') {
  geometryFrame = 0;
  if (!enabled()) return false;

  removeLegacyLogoNodes();
  ensureStyle();

  const canvas = findWheel();
  const stage = canvas?.parentElement;
  if (!(canvas instanceof HTMLCanvasElement) || !(stage instanceof HTMLElement)) return false;

  stage.dataset[STAGE_MARKER] = 'true';
  const image = ensureImage(stage);
  const imageReady = image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
  if (!imageReady) {
    image.style.setProperty('visibility', 'hidden', 'important');
    image.style.setProperty('opacity', '0', 'important');
    return false;
  }

  currentCanvas = canvas;
  currentStage = stage;
  currentImage = image;

  const appliedZoom = Number(canvas.dataset.gannzillaAppliedZoom)
    || Number(params().get('gannzillaZoom'))
    || 1;
  const emptyCenterRadius = Number(canvas.dataset.gannzillaExpandedCenterRadius)
    || Number(params().get('expandedCenterRadius'))
    || Math.max(
      20,
      (Number(params().get('gannzillaInnerRadius')) || 279.32)
        - (Number(params().get('gannzillaRingWidth')) || 96.76),
    );

  baseCenterX = canvas.offsetLeft + canvas.offsetWidth / 2;
  baseCenterY = canvas.offsetTop + canvas.offsetHeight / 2;
  const logoRadius = Math.max(36, emptyCenterRadius * appliedZoom * LOGO_SCALE);
  diameter = logoRadius * 2;

  image.style.setProperty('left', `${baseCenterX.toFixed(3)}px`, 'important');
  image.style.setProperty('top', `${baseCenterY.toFixed(3)}px`, 'important');
  image.style.setProperty('width', `${diameter.toFixed(3)}px`, 'important');
  image.style.setProperty('height', `${diameter.toFixed(3)}px`, 'important');
  image.style.setProperty('visibility', 'visible', 'important');
  image.style.setProperty('opacity', '1', 'important');

  image.dataset.gannzillaCenterLogoStageV590 = 'true';
  image.dataset.gannzillaCenterLogoBuildV590 = String(BUILD);
  image.dataset.gannzillaCenterLogoScaleV590 = String(LOGO_SCALE);
  image.dataset.gannzillaCenterLogoEmptyRadiusV590 = String(emptyCenterRadius);
  image.dataset.gannzillaCenterLogoDiameterV590 = diameter.toFixed(3);
  image.dataset.gannzillaCenterLogoInteractiveV590 = 'false';
  image.dataset.gannzillaCenterLogoStageBoundV590 = 'true';

  applyPan(`${source}-pan-sync`);

  geometryApplyCount += 1;
  lastGeometry = {
    source,
    build: BUILD,
    baseCenterX,
    baseCenterY,
    emptyCenterRadius,
    appliedZoom,
    logoRadius,
    diameter,
    stageTag: stage.tagName,
    canvasId: canvas.id || null,
    at: Date.now(),
  };
  return true;
}

function scheduleGeometry(source = 'schedule') {
  cancelAnimationFrame(geometryFrame);
  geometryFrame = requestAnimationFrame(() => applyGeometry(source));
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  removeLegacyLogoNodes();
  ensureStyle();

  [
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:copper-top-correction-v541',
    'gannzilla:center-cell-comfort-v508',
    'gannzilla:native-dpr-zoom-v504',
  ].forEach((name) => {
    window.addEventListener(name, () => scheduleGeometry(name), false);
  });

  const onPan = (event) => {
    if (!(currentImage instanceof HTMLImageElement)) {
      scheduleGeometry(event?.type || 'pan-before-geometry');
      return;
    }
    applyPan(event?.type || 'pan', event?.detail || null);
  };
  window.addEventListener('gannzilla:wheel-input-v459', onPan, false);
  window.addEventListener('gannzilla:page-scrollbar-pan-v305', onPan, false);
  window.addEventListener('resize', () => scheduleGeometry('resize'), false);

  [0, 80, 220, 600, 1400, 3000].forEach((delay) => {
    window.setTimeout(() => scheduleGeometry(`boot-${delay}`), delay);
  });

  window.GANNZILLA_CENTER_LOGO_STAGE_V590 = true;
  window.__auditGannzillaCenterLogoStageV590 = () => {
    const image = document.getElementById(IMAGE_ID);
    const canvas = findWheel();
    const stage = image?.parentElement;
    const imageRect = image?.getBoundingClientRect();
    const emptyCenterRadius = Number(image?.dataset.gannzillaCenterLogoEmptyRadiusV590 || 0);
    const logoDiameter = Number(image?.dataset.gannzillaCenterLogoDiameterV590 || 0);
    return {
      ok: image instanceof HTMLImageElement
        && canvas instanceof HTMLCanvasElement
        && stage === canvas.parentElement
        && image.complete
        && image.naturalWidth > 0
        && image.dataset.gannzillaCenterLogoStageV590 === 'true'
        && image.dataset.gannzillaCenterLogoStageBoundV590 === 'true'
        && image.dataset.gannzillaCenterLogoInteractiveV590 === 'false'
        && logoDiameter > 60
        && logoDiameter < emptyCenterRadius * 2,
      build: BUILD,
      imageLoaded: image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
      naturalWidth: image instanceof HTMLImageElement ? image.naturalWidth : 0,
      naturalHeight: image instanceof HTMLImageElement ? image.naturalHeight : 0,
      stageBound: stage === canvas?.parentElement,
      scale: LOGO_SCALE,
      diameter: logoDiameter,
      renderedWidth: Number(imageRect?.width || 0),
      emptyCenterRadius,
      panX,
      panY,
      geometryApplyCount,
      panApplyCount,
      lastGeometry,
      lastPan,
    };
  };

  window[STATE_KEY] = {
    applyGeometry,
    scheduleGeometry,
    applyPan,
    onPan,
  };
  scheduleGeometry('install');
}

install();
