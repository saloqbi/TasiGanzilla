const STYLE_ID = 'gannzilla-clip-outer-frames-v406';
const STATE_KEY = '__gannzillaClipOuterFramesV406';

function params() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function numberParam(name, fallback) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? value : fallback;
}

function enabled() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function clipRadiusCssPx() {
  const levels = Math.max(1, Math.round(numberParam('levels', 10)));
  const innerRadius = Math.max(1, numberParam('gannzillaInnerRadius', 170));
  const ringWidth = Math.max(1, numberParam('gannzillaRingWidth', 60));
  const zoom = Math.max(0.1, numberParam('gannzillaZoom', 1));

  // Keep the full numbered wheel and its outside stroke, while clipping every
  // native frame, date label and angle label drawn beyond the wheel edge.
  return Math.max(1, (innerRadius + levels * ringWidth + 2) * zoom);
}

function isMainWheelCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
  const rect = canvas.getBoundingClientRect();
  const style = window.getComputedStyle(canvas);
  return canvas.width > 0
    && canvas.height > 0
    && rect.width > 300
    && rect.height > 300
    && style.display !== 'none'
    && style.visibility !== 'hidden';
}

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    canvas[data-gannzilla-outer-frames-clipped-v406="true"] {
      clip-path: circle(var(--gannzilla-core-wheel-radius-v406) at 50% 50%) !important;
      -webkit-clip-path: circle(var(--gannzilla-core-wheel-radius-v406) at 50% 50%) !important;
    }
  `;
  document.head.appendChild(style);
}

function applyClip() {
  if (!enabled()) return 0;
  installStyle();

  const radius = clipRadiusCssPx();
  let clipped = 0;

  Array.from(document.querySelectorAll('canvas')).forEach((canvas) => {
    if (!isMainWheelCanvas(canvas)) return;
    canvas.dataset.gannzillaOuterFramesClippedV406 = 'true';
    canvas.style.setProperty('--gannzilla-core-wheel-radius-v406', `${radius}px`);
    canvas.style.setProperty('clip-path', `circle(${radius}px at 50% 50%)`, 'important');
    canvas.style.setProperty('-webkit-clip-path', `circle(${radius}px at 50% 50%)`, 'important');
    clipped += 1;
  });

  window.__gannzillaOuterFramesClippedCountV406 = clipped;
  return clipped;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled()) return;
  if (window[STATE_KEY]) return;

  const run = () => applyClip();
  [0, 20, 60, 120, 260, 600, 1200, 2400].forEach((delay) => window.setTimeout(run, delay));

  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', run);
  document.addEventListener('fullscreenchange', run);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', run);
  window.addEventListener('gannzilla:layout-panel-visibility-change', run);

  window.GANNZILLA_CLIP_OUTER_FRAMES_V406 = true;
  window.__auditGannzillaClipOuterFramesV406 = () => ({
    ok: Array.from(document.querySelectorAll('canvas')).filter(isMainWheelCanvas).every(
      (canvas) => canvas.dataset.gannzillaOuterFramesClippedV406 === 'true',
    ),
    build: 406,
    clippedCanvasCount: window.__gannzillaOuterFramesClippedCountV406 || 0,
    clipRadiusCssPx: clipRadiusCssPx(),
    twoOuterFramesVisible: false,
    numberedWheelPreserved: true,
  });

  window[STATE_KEY] = { observer };
}

install();
