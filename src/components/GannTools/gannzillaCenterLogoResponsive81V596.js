import brandPart0 from './gannzillaBrandImageV247Part0';
import brandPart1 from './gannzillaBrandImageV247Part1';
import brandPart2 from './gannzillaBrandImageV247Part2';

const BUILD = 596;
const STATE_KEY = '__gannzillaCenterLogoResponsive81V596';
const IMAGE_ID = 'gannzilla-center-logo-responsive-81-v596';
const STYLE_ID = 'gannzilla-center-logo-responsive-81-style-v596';
const STAGE_DATASET_KEY = 'gannzillaCenterLogoResponsive81V596';
const LOGO_SCALE = 0.99;
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
    'gannzilla-center-logo-stage-v590',
    'gannzilla-center-logo-stage-v591',
    'gannzilla-center-logo-fixed-71-v592',
    'gannzilla-center-logo-responsive-71-v593',
    'gannzilla-center-logo-responsive-78-v594',
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
    [data-gannzilla-center-logo-responsive81-v596="true"] {
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
      will-change: left, top, width, height !important;
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
      image.dataset.gannzillaCenterLogoImageErrorV596 = 'true';
    }, { once: true });
  }

  if (image.parentElement !== stage) stage.appendChild(image);
  return image;
}

let frame = 0;
let applyCount = 0;
let lastApply = null;

function apply(source = 'apply') {
  frame = 0;
  if (!enabled()) return false;

  removeLegacyLogoNodes();
  ensureStyle();

  const canvas = findWheel();
  const stage = canvas?.parentElement;
  if (!(canvas instanceof HTMLCanvasElement) || !(stage instanceof HTMLElement)) return false;

  stage.dataset[STAGE_DATASET_KEY] = 'true';
  const image = ensureImage(stage);
  const imageReady = image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
  if (!imageReady) {
    image.style.setProperty('visibility', 'hidden', 'important');
    image.style.setProperty('opacity', '0', 'important');
    return false;
  }

  const canvasRect = canvas.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  const dpr = Math.max(1, Number(canvas.dataset.gannzillaNativeDpr) || window.devicePixelRatio || 1);
  const logicalSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518)
    || Number(canvas.dataset.gannzillaCanvasCssSize)
    || canvas.width / dpr;
  const viewportScale = logicalSize > 0 ? canvasRect.width / logicalSize : 1;
  const emptyCenterRadius = Number(canvas.dataset.gannzillaExpandedCenterRadius)
    || Number(params().get('expandedCenterRadius'))
    || Math.max(
      20,
      (Number(params().get('gannzillaInnerRadius')) || 279.32)
        - (Number(params().get('gannzillaRingWidth')) || 96.76),
    );

  const centerX = canvasRect.left - stageRect.left + stage.scrollLeft + canvasRect.width / 2;
  const centerY = canvasRect.top - stageRect.top + stage.scrollTop + canvasRect.height / 2;
  const emptyRadiusOnScreen = emptyCenterRadius * viewportScale;
  const logoRadius = Math.max(28, emptyRadiusOnScreen * LOGO_SCALE);
  const diameter = logoRadius * 2;

  image.style.setProperty('left', `${centerX.toFixed(3)}px`, 'important');
  image.style.setProperty('top', `${centerY.toFixed(3)}px`, 'important');
  image.style.setProperty('width', `${diameter.toFixed(3)}px`, 'important');
  image.style.setProperty('height', `${diameter.toFixed(3)}px`, 'important');
  image.style.setProperty('visibility', 'visible', 'important');
  image.style.setProperty('opacity', '1', 'important');

  image.dataset.gannzillaCenterLogoResponsive81V596 = 'true';
  image.dataset.gannzillaCenterLogoBuildV596 = String(BUILD);
  image.dataset.gannzillaCenterLogoScaleV596 = String(LOGO_SCALE);
  image.dataset.gannzillaCenterLogoViewportScaleV596 = viewportScale.toFixed(6);
  image.dataset.gannzillaCenterLogoEmptyRadiusV596 = emptyRadiusOnScreen.toFixed(3);
  image.dataset.gannzillaCenterLogoDiameterV596 = diameter.toFixed(3);
  image.dataset.gannzillaCenterLogoInteractiveV596 = 'false';
  image.dataset.gannzillaCenterLogoPanAddedV596 = 'false';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    centerX,
    centerY,
    logicalSize,
    viewportScale,
    emptyCenterRadius,
    emptyRadiusOnScreen,
    logoRadius,
    diameter,
    scale: LOGO_SCALE,
    panAdded: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => apply(source));
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

  window.GANNZILLA_CENTER_LOGO_RESPONSIVE_81_V596 = true;
  window.__auditGannzillaCenterLogoResponsive81V596 = () => {
    const image = document.getElementById(IMAGE_ID);
    const canvas = findWheel();
    const imageRect = image?.getBoundingClientRect();
    const emptyRadius = Number(image?.dataset.gannzillaCenterLogoEmptyRadiusV596 || 0);
    const logoDiameter = Number(image?.dataset.gannzillaCenterLogoDiameterV596 || 0);
    return {
      ok: image instanceof HTMLImageElement
        && canvas instanceof HTMLCanvasElement
        && image.parentElement === canvas.parentElement
        && image.complete
        && image.naturalWidth > 0
        && image.dataset.gannzillaCenterLogoResponsive81V596 === 'true'
        && image.dataset.gannzillaCenterLogoScaleV596 === String(LOGO_SCALE)
        && image.dataset.gannzillaCenterLogoPanAddedV596 === 'false'
        && logoDiameter > 50
        && logoDiameter < emptyRadius * 2,
      build: BUILD,
      scale: LOGO_SCALE,
      panAdded: false,
      renderedWidth: Number(imageRect?.width || 0),
      diameter: logoDiameter,
      emptyRadius,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
