const BUILD = 579;
const STATE_KEY = '__gannzillaCenterLogoV579';
const OVERLAY_ID = 'gannzilla-center-logo-v579';
const STYLE_ID = 'gannzilla-center-logo-style-v579';
const IMAGE_DATA_URL = 'data:image/jpeg;base64,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';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const query = params();
  return (query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true')
    && !['false', '0', 'off', 'no'].includes(String(query.get('centerLogo') || 'true').toLowerCase());
}

function findWheel() {
  const preferred = document.querySelector('canvas[data-gannzilla-final-wheel-authority-v506="true"],canvas[data-gannzilla-final-wheel-authority-v491="true"]');
  if (preferred instanceof HTMLCanvasElement && !preferred.closest('aside')) return preferred;
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => canvas instanceof HTMLCanvasElement && !canvas.closest('aside'))
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}

function ensureStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `
    #${OVERLAY_ID}{position:fixed!important;z-index:2147481200!important;margin:0!important;padding:0!important;border:3px solid rgba(168,126,45,.96)!important;border-radius:50%!important;overflow:hidden!important;background:#020202!important;box-sizing:border-box!important;transform:translate(-50%,-50%)!important;pointer-events:none!important;user-select:none!important;box-shadow:0 0 0 2px rgba(35,25,8,.95),0 0 18px rgba(202,154,57,.36)!important;}
    #${OVERLAY_ID} img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;border-radius:50%!important;pointer-events:none!important;user-select:none!important;-webkit-user-drag:none!important;}
  `;
}

function ensureOverlay() {
  let overlay = document.getElementById(OVERLAY_ID);
  if (!(overlay instanceof HTMLElement)) {
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('aria-hidden', 'true');
    const image = document.createElement('img');
    image.alt = '';
    image.draggable = false;
    image.src = IMAGE_DATA_URL;
    overlay.appendChild(image);
    document.body.appendChild(overlay);
  }
  return overlay;
}

let frame = 0;
let applyCount = 0;
let lastApply = null;

function apply(source = 'apply') {
  frame = 0;
  if (!enabled()) return false;
  ensureStyle();
  const canvas = findWheel();
  const overlay = ensureOverlay();
  if (!(canvas instanceof HTMLCanvasElement)) {
    overlay.style.setProperty('visibility', 'hidden', 'important');
    return false;
  }

  const rect = canvas.getBoundingClientRect();
  const style = getComputedStyle(canvas);
  const visible = style.display !== 'none' && style.visibility !== 'hidden'
    && Number(style.opacity || 1) > 0.01 && rect.width > 1 && rect.height > 1;
  const expandedRadius = Number(canvas.dataset.gannzillaExpandedCenterRadius)
    || Number(params().get('expandedCenterRadius')) || 182.56;
  const appliedZoom = Number(canvas.dataset.gannzillaAppliedZoom)
    || Number(params().get('gannzillaZoom')) || 1;
  const scale = Math.max(.7, Math.min(1, Number(params().get('centerLogoScale')) || .96));
  const diameter = Math.max(80, Math.min(2400, expandedRadius * 2 * appliedZoom * scale));
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  overlay.style.setProperty('left', `${centerX}px`, 'important');
  overlay.style.setProperty('top', `${centerY}px`, 'important');
  overlay.style.setProperty('width', `${diameter}px`, 'important');
  overlay.style.setProperty('height', `${diameter}px`, 'important');
  overlay.style.setProperty('visibility', visible ? 'visible' : 'hidden', 'important');
  overlay.style.setProperty('opacity', visible ? '1' : '0', 'important');
  overlay.dataset.gannzillaCenterLogoV579 = 'true';
  overlay.dataset.gannzillaCenterLogoDiameterV579 = diameter.toFixed(2);
  overlay.dataset.gannzillaCenterLogoScaleV579 = scale.toFixed(2);
  overlay.dataset.gannzillaCenterLogoCanvasChangedV579 = 'false';

  applyCount += 1;
  lastApply = { source, centerX, centerY, diameter, expandedRadius, appliedZoom, scale, visible, at: Date.now() };
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => apply(source));
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled() || window[STATE_KEY]) return;
  const observer = new MutationObserver(() => schedule('dom-mutation'));
  observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  window.addEventListener('resize', () => schedule('resize'));
  window.addEventListener('scroll', () => schedule('scroll'), { passive: true });
  window.addEventListener('pointermove', () => schedule('pointermove'), true);
  window.addEventListener('wheel', () => schedule('wheel'), { capture: true, passive: true });
  ['gannzilla:final-wheel-authority-v506','gannzilla:final-wheel-authority-v491','gannzilla:center-cell-comfort-v508','gannzilla:native-dpr-zoom-v504','gannzilla:page-scrollbar-pan-v305']
    .forEach((name) => window.addEventListener(name, () => schedule(name)));
  [0, 80, 220, 600, 1400, 3200].forEach((delay) => setTimeout(() => schedule(`boot-${delay}`), delay));
  window.setInterval(() => schedule('safety-refresh'), 500);
  window.GANNZILLA_CENTER_LOGO_V579 = true;
  window.__auditGannzillaCenterLogoV579 = () => {
    const overlay = document.getElementById(OVERLAY_ID);
    const rect = overlay?.getBoundingClientRect();
    return {
      ok: overlay instanceof HTMLElement && overlay.dataset.gannzillaCenterLogoV579 === 'true'
        && Number(rect?.width || 0) > 80 && Math.abs((rect?.width || 0) - (rect?.height || 0)) < 1,
      build: BUILD,
      circular: true,
      diameter: Number(overlay?.dataset.gannzillaCenterLogoDiameterV579 || 0),
      scale: Number(overlay?.dataset.gannzillaCenterLogoScaleV579 || 0),
      canvasChanged: overlay?.dataset.gannzillaCenterLogoCanvasChangedV579 === 'true',
      applyCount,
      lastApply,
    };
  };
  window[STATE_KEY] = { apply, schedule, observer };
  schedule('install');
}

install();
