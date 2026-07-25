const BUILD = 494;
const STYLE_ID = 'gannzilla-hide-all-overlay-remnants-v494';
const ALL_TOOLS_OVERLAY_ID = 'gannzilla-all-tools-runtime-overlay-v482';
const DRAWING_OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const ACTIVE_PATHS_KEY = 'tasi-gannzilla-all-tools-active-paths-v482';
const DRAWINGS_KEY = 'tasi-gannzilla-top-center-drawings-v471';
const STATE_KEY = '__gannzillaHideAllOverlayRemnantsV494';

function wheelMode() {
  try {
    const query = new URLSearchParams(window.location.search || '');
    return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  } catch (_) {
    return false;
  }
}

function clearStores() {
  try { localStorage.setItem(ACTIVE_PATHS_KEY, '[]'); } catch (_) { /* runtime only */ }
  try { localStorage.setItem(DRAWINGS_KEY, '[]'); } catch (_) { /* runtime only */ }
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `
    #${ALL_TOOLS_OVERLAY_ID},
    #${DRAWING_OVERLAY_ID} {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
}

let applyCount = 0;
let lastApply = null;

function apply(source = 'apply') {
  clearStores();
  installStyle();

  const allTools = document.getElementById(ALL_TOOLS_OVERLAY_ID);
  const drawing = document.getElementById(DRAWING_OVERLAY_ID);

  [allTools, drawing].forEach((node) => {
    if (!(node instanceof HTMLElement || node instanceof SVGElement)) return;
    node.setAttribute('aria-hidden', 'true');
    node.style.setProperty('display', 'none', 'important');
    node.style.setProperty('visibility', 'hidden', 'important');
    node.style.setProperty('opacity', '0', 'important');
    node.style.setProperty('pointer-events', 'none', 'important');
  });

  applyCount += 1;
  lastApply = {
    source,
    allToolsPresent: Boolean(allTools),
    drawingOverlayPresent: Boolean(drawing),
    at: Date.now(),
  };
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode() || window[STATE_KEY]) return;

  apply('install');

  const observer = new MutationObserver(() => {
    queueMicrotask(() => apply('mutation'));
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'width', 'height'],
  });

  [0, 30, 80, 160, 320, 700, 1400, 2800, 5200, 9000].forEach((delay) => {
    window.setTimeout(() => apply(`boot-${delay}`), delay);
  });

  window.addEventListener('resize', () => apply('resize'), true);
  window.addEventListener('gannzilla:canonical-property-change-v326', () => apply('canonical'), true);
  window.addEventListener('gannzilla:reference-panel-change-v421', () => apply('reference'), true);

  window.GANNZILLA_HIDE_ALL_OVERLAY_REMNANTS_V494 = true;
  window.__auditGannzillaHideAllOverlayRemnantsV494 = () => {
    const allTools = document.getElementById(ALL_TOOLS_OVERLAY_ID);
    const drawing = document.getElementById(DRAWING_OVERLAY_ID);
    const hidden = (node) => !node || getComputedStyle(node).display === 'none' || getComputedStyle(node).visibility === 'hidden';
    return {
      ok: hidden(allTools) && hidden(drawing),
      build: BUILD,
      allToolsOverlayHidden: hidden(allTools),
      drawingOverlayHidden: hidden(drawing),
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = { observer, apply };
}

install();
