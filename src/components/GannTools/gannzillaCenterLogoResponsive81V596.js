import brandPart0 from './gannzillaBrandImageV247Part0';
import brandPart1 from './gannzillaBrandImageV247Part1';
import brandPart2 from './gannzillaBrandImageV247Part2';

const BUILD = 597;
const STATE_KEY = '__gannzillaCenterLogoFixedV597';
const IMAGE_ID = 'gannzilla-center-logo-fixed-v597';
const STYLE_ID = 'gannzilla-center-logo-fixed-style-v597';
const STAGE_DATASET_KEY = 'gannzillaCenterLogoFixedV597';
const DEFAULT_FIXED_DIAMETER = 361.47;
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

function fixedDiameter() {
  const requested = Number(params().get('centerLogoFixedDiameter'));
  return Number.isFinite(requested) && requested >= 50
    ? requested
    : DEFAULT_FIXED_DIAMETER;
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
    'gannzilla-center-logo-stage-v590',
    'gannzilla-center-logo-stage-v591',
    'gannzilla-center-logo-fixed-71-v592',
    'gannzilla-center-logo-responsive-71-v593',
    'gannzilla-center-logo-responsive-78-v594',
    'gannzilla-center-logo-responsive-81-v596',
  ].forEach((id) => document.getElementById(id)?.remove());

  [
    'gannzilla-center-logo-style-v579',
    'gannzilla-center-logo-layer-style-v580',
    'gannzilla-center-logo-visible-canvas-style-v581',
    'gannzilla-center-logo-fixed-image-style-v587',
    'gannzilla-center-logo-stable-fit-style-v588',
    'gannzilla-center-logo-stage-style-v590',
    'gannzilla-center-logo-stage-style-v591',
    'gannzilla-center-logo-fixed-71-style-v592',
    'gannzilla-center-logo-responsive-71-style-v593',
    'gannzilla-center-logo-responsive-78-style-v594',
    'gannzilla-center-logo-responsive-81-style-v596',
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
    [data-gannzilla-center-logo-fixed-v597="true"] {
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
      transform: translate3d(-50%, -50%, 0) !important;
      transform-origin: center center !important;
      will-change: left, top !important;
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
    image.addEventListener('load', () => schedule('image-load'), { once: true });
    image.addEventListener('error', () => {
      image.style.setProperty('visibility', 'hidden', 'important');
      image.style.setProperty('opacity', '0', 'important');
      image.dataset.gannzillaCenterLogoImageErrorV597 = 'true';
    }, { once: true });
  }

  if (image.parentElement !== stage) stage.appendChild(image);
  return image;
}

let frame = 0;
let applyCount = 0;
let lastApply = null;

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => apply(source));
}

function ensureStageScrollTracking(stage) {
  if (stage.dataset.gannzillaCenterLogoScrollTrackingV597 === 'true') return;
  stage.dataset.gannzillaCenterLogoScrollTrackingV597 = 'true';
  stage.addEventListener('scroll', () => schedule('stage-scroll'), { passive: true });
}

function apply(source = 'apply') {
  frame = 0;
  if (!enabled()) return false;

  removeLegacyLogoNodes();
  ensureStyle();

  const canvas = findWheel();
  const stage = canvas?.parentElement;
  if (!(canvas instanceof HTMLCanvasElement) || !(stage instanceof HTMLElement)) return false;

  stage.dataset[STAGE_DATASET_KEY] = 'true';
  ensureStageScrollTracking(stage);

  const image = ensureImage(stage);
  const imageReady = image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
  if (!imageReady) {
    image.style.setProperty('visibility', 'hidden', 'important');
    image.style.setProperty('opacity', '0', 'important');
    return false;
  }

  const stageRect = stage.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const hasStageViewport = stage.clientWidth > 0 && stage.clientHeight > 0;

  const centerX = hasStageViewport
    ? stage.scrollLeft + stage.clientWidth / 2
    : canvasRect.left - stageRect.left + stage.scrollLeft + canvasRect.width / 2;
  const centerY = hasStageViewport
    ? stage.scrollTop + stage.clientHeight / 2
    : canvasRect.top - stageRect.top + stage.scrollTop + canvasRect.height / 2;
  const diameter = fixedDiameter();

  image.style.setProperty('left', `${centerX.toFixed(3)}px`, 'important');
  image.style.setProperty('top', `${centerY.toFixed(3)}px`, 'important');
  image.style.setProperty('width', `${diameter.toFixed(3)}px`, 'important');
  image.style.setProperty('height', `${diameter.toFixed(3)}px`, 'important');
  image.style.setProperty('visibility', 'visible', 'important');
  image.style.setProperty('opacity', '1', 'important');

  image.dataset.gannzillaCenterLogoFixedV597 = 'true';
  image.dataset.gannzillaCenterLogoBuildV597 = String(BUILD);
  image.dataset.gannzillaCenterLogoDiameterV597 = diameter.toFixed(3);
  image.dataset.gannzillaCenterLogoZoomLinkedV597 = 'false';
  image.dataset.gannzillaCenterLogoPanLinkedV597 = 'false';
  image.dataset.gannzillaCenterLogoViewportFixedV597 = 'true';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    centerX,
    centerY,
    diameter,
    stageClientWidth: stage.clientWidth,
    stageClientHeight: stage.clientHeight,
    stageScrollLeft: stage.scrollLeft,
    stageScrollTop: stage.scrollTop,
    zoomLinked: false,
    panLinked: false,
    at: Date.now(),
  };
  return true;
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
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
  ].forEach((name) => window.addEventListener(name, () => schedule(name), false));

  window.addEventListener('resize', () => schedule('resize'), false);
  [0, 80, 220, 600, 1400, 3000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.GANNZILLA_CENTER_LOGO_FIXED_V597 = true;
  window.__auditGannzillaCenterLogoFixedV597 = () => {
    const image = document.getElementById(IMAGE_ID);
    const canvas = findWheel();
    const stage = canvas?.parentElement;
    const imageRect = image?.getBoundingClientRect();
    const stageRect = stage?.getBoundingClientRect();
    const diameter = Number(image?.dataset.gannzillaCenterLogoDiameterV597 || 0);
    const renderedCenterX = Number(imageRect?.left || 0) + Number(imageRect?.width || 0) / 2;
    const renderedCenterY = Number(imageRect?.top || 0) + Number(imageRect?.height || 0) / 2;
    const expectedCenterX = Number(stageRect?.left || 0) + Number(stage?.clientWidth || 0) / 2;
    const expectedCenterY = Number(stageRect?.top || 0) + Number(stage?.clientHeight || 0) / 2;
    const centerError = Math.hypot(
      renderedCenterX - expectedCenterX,
      renderedCenterY - expectedCenterY,
    );
    const sizeError = Math.abs(Number(imageRect?.width || 0) - diameter);

    return {
      ok: image instanceof HTMLImageElement
        && canvas instanceof HTMLCanvasElement
        && stage instanceof HTMLElement
        && image.parentElement === stage
        && image.complete
        && image.naturalWidth > 0
        && image.dataset.gannzillaCenterLogoFixedV597 === 'true'
        && image.dataset.gannzillaCenterLogoZoomLinkedV597 === 'false'
        && image.dataset.gannzillaCenterLogoPanLinkedV597 === 'false'
        && diameter >= 50
        && centerError <= 1.5
        && sizeError <= 1.5,
      build: BUILD,
      diameter,
      renderedWidth: Number(imageRect?.width || 0),
      renderedHeight: Number(imageRect?.height || 0),
      centerError,
      sizeError,
      zoomLinked: false,
      panLinked: false,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
