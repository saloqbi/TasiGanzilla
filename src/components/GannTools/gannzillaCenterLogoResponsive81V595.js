const BUILD = 595;
const STATE_KEY = '__gannzillaCenterLogoResponsive81V595';
const SOURCE_IMAGE_ID = 'gannzilla-center-logo-responsive-78-v594';
const SOURCE_SCALE = 0.78;
const TARGET_SCALE = 0.81;
const SCALE_RATIO = TARGET_SCALE / SOURCE_SCALE;

let frame = 0;
let applyCount = 0;
let lastApply = null;

function apply(source = 'apply') {
  frame = 0;
  const image = document.getElementById(SOURCE_IMAGE_ID);
  if (!(image instanceof HTMLImageElement)
      || !image.complete
      || image.naturalWidth <= 0
      || image.naturalHeight <= 0) return false;

  const sourceDiameter = Number(image.dataset.gannzillaCenterLogoDiameterV594);
  const measuredDiameter = image.getBoundingClientRect().width;
  const baseDiameter = Number.isFinite(sourceDiameter) && sourceDiameter > 0
    ? sourceDiameter
    : measuredDiameter / SCALE_RATIO;
  if (!Number.isFinite(baseDiameter) || baseDiameter <= 0) return false;

  const targetDiameter = baseDiameter * SCALE_RATIO;
  image.style.setProperty('width', `${targetDiameter.toFixed(3)}px`, 'important');
  image.style.setProperty('height', `${targetDiameter.toFixed(3)}px`, 'important');
  image.dataset.gannzillaCenterLogoResponsive81V595 = 'true';
  image.dataset.gannzillaCenterLogoScaleV595 = String(TARGET_SCALE);
  image.dataset.gannzillaCenterLogoDiameterV595 = targetDiameter.toFixed(3);
  image.dataset.gannzillaCenterLogoSourceScaleV595 = String(SOURCE_SCALE);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    sourceDiameter: baseDiameter,
    targetDiameter,
    targetScale: TARGET_SCALE,
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
      || window[STATE_KEY]) return;

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

  window.GANNZILLA_CENTER_LOGO_RESPONSIVE_81_V595 = true;
  window.__auditGannzillaCenterLogoResponsive81V595 = () => {
    const image = document.getElementById(SOURCE_IMAGE_ID);
    const diameter = Number(image?.dataset.gannzillaCenterLogoDiameterV595 || 0);
    return {
      ok: image instanceof HTMLImageElement
        && image.dataset.gannzillaCenterLogoResponsive81V595 === 'true'
        && image.dataset.gannzillaCenterLogoScaleV595 === String(TARGET_SCALE)
        && diameter > 50,
      build: BUILD,
      targetScale: TARGET_SCALE,
      sourceScale: SOURCE_SCALE,
      diameter,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
