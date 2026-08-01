const BUILD = 732;
const STATE_KEY = '__gannzillaStableExternalFrame172V732';
const OVERLAY_ID = 'gannzilla-stable-external-frame-v731';
const THICKNESS_MULTIPLIER = 1.72;

let pendingFrame = 0;
let applyCount = 0;
let lastApply = null;

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-wheel-ivory-champagne-final-authority-v682="true"]',
    'canvas[data-gannzilla-outer-empty-ring-v518="true"]',
    'canvas[data-gannzilla-empty-outer-ring-v518="true"]',
    'canvas[data-gannzilla-final-wheel-authority-v506="true"]',
  ].join(','));

  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
      const id = String(canvas.id || '').toLowerCase();
      return !id.includes('overlay')
        && !id.includes('preview')
        && !id.includes('tracker')
        && canvas.width > 300
        && canvas.height > 300;
    })
    .sort((a, b) => (b.width * b.height) - (a.width * a.height))[0] || null;
}

function calculateVisibleInnerRadius(wheel, overlay) {
  const overlayRect = overlay.getBoundingClientRect();
  const logicalSize = Number(wheel.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518)
    || Number(wheel.dataset.gannzillaCanvasCssSize)
    || Math.min(overlayRect.width, overlayRect.height);
  const appliedZoom = Math.max(0.5, Number(wheel.dataset.gannzillaAppliedZoom) || 1);
  const half = logicalSize / 2;
  const baseReservedMargin = Math.min(half * 0.205, Math.max(108, 128 * appliedZoom));
  const baseInner = half - baseReservedMargin + Math.max(2, 2.5 * appliedZoom);
  const outer = half - Math.max(3.5, 4.5 * appliedZoom);
  const baseFrameWidth = outer - baseInner;
  const visibleFrameWidth = Math.min(
    outer - Math.max(34, 38 * appliedZoom),
    baseFrameWidth * THICKNESS_MULTIPLIER,
  );
  const visibleInnerLogical = outer - visibleFrameWidth;
  const displayScale = Math.min(overlayRect.width, overlayRect.height) / logicalSize;

  return {
    logicalSize,
    appliedZoom,
    outer,
    baseFrameWidth,
    visibleFrameWidth,
    visibleInnerLogical,
    visibleInnerCss: visibleInnerLogical * displayScale,
  };
}

function apply(source = 'apply') {
  pendingFrame = 0;

  const overlay = document.getElementById(OVERLAY_ID);
  const wheel = findWheel();
  if (!(overlay instanceof HTMLCanvasElement)
      || !(wheel instanceof HTMLCanvasElement)
      || overlay.style.display === 'none') return false;

  const geometry = calculateVisibleInnerRadius(wheel, overlay);
  if (!(geometry.visibleInnerCss > 0)) return false;

  const edge = Math.max(1, Number(window.devicePixelRatio) || 1);
  const mask = `radial-gradient(circle at center, transparent 0px, transparent ${geometry.visibleInnerCss}px, #000 ${geometry.visibleInnerCss + edge}px, #000 100%)`;

  overlay.style.setProperty('-webkit-mask-image', mask, 'important');
  overlay.style.setProperty('mask-image', mask, 'important');
  overlay.style.setProperty('-webkit-mask-repeat', 'no-repeat', 'important');
  overlay.style.setProperty('mask-repeat', 'no-repeat', 'important');
  overlay.style.setProperty('-webkit-mask-position', 'center', 'important');
  overlay.style.setProperty('mask-position', 'center', 'important');
  overlay.style.setProperty('-webkit-mask-size', '100% 100%', 'important');
  overlay.style.setProperty('mask-size', '100% 100%', 'important');
  overlay.style.setProperty('transition', 'none', 'important');
  overlay.style.setProperty('animation', 'none', 'important');

  overlay.dataset.gannzillaStableExternalFrameVisibleThickness = String(THICKNESS_MULTIPLIER);
  overlay.dataset.gannzillaStableExternalFrameVisibleAuthority = 'external-mask-v732';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    thicknessMultiplier: THICKNESS_MULTIPLIER,
    visibleFrameWidth: geometry.visibleFrameWidth,
    visibleInnerLogical: geometry.visibleInnerLogical,
    visibleInnerCss: geometry.visibleInnerCss,
    appliedZoom: geometry.appliedZoom,
    externalOnly: true,
    wheelGeometryChanged: false,
    recurringTimer: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  if (pendingFrame) window.cancelAnimationFrame(pendingFrame);
  pendingFrame = window.requestAnimationFrame(() => {
    apply(source);
    window.requestAnimationFrame(() => apply(`${source}-settled`));
  });
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || window[STATE_KEY]) return;

  [
    'resize',
    'scroll',
    'wheel',
    'pointerup',
    'pointercancel',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:wheel-ivory-champagne-final-authority-v682',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459',
    'gannzilla:page-scrollbar-pan-v305',
    'gannzilla:layout-panel-visibility-change',
  ].forEach((eventName) => {
    window.addEventListener(eventName, () => schedule(eventName), true);
  });

  if (typeof MutationObserver === 'function') {
    const observer = new MutationObserver(() => schedule('overlay-or-wheel-change'));
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'width', 'height'],
    });
  }

  [0, 80, 220, 520, 1100, 2200, 4200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.GANNZILLA_STABLE_EXTERNAL_FRAME_172_V732 = true;
  window.__auditGannzillaStableExternalFrame172V732 = () => {
    const overlay = document.getElementById(OVERLAY_ID);
    return {
      ok: overlay instanceof HTMLCanvasElement
        && overlay.dataset.gannzillaStableExternalFrameVisibleThickness === '1.72'
        && overlay.dataset.gannzillaStableExternalFrameVisibleAuthority === 'external-mask-v732'
        && applyCount > 0,
      build: BUILD,
      thicknessMultiplier: THICKNESS_MULTIPLIER,
      externalOnly: true,
      wheelGeometryChanged: false,
      recurringTimer: false,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
