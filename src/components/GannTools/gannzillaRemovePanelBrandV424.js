const BUILD = 424;
const STYLE_ID = 'gannzilla-remove-panel-brand-v424';
const STATE_KEY = '__gannzillaRemovePanelBrandV424';
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';

function params() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  const value = String(query.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #${PANEL_ID} .gz421-window-title {
      display: none !important;
      visibility: hidden !important;
      width: 0 !important;
      min-width: 0 !important;
      max-width: 0 !important;
      height: 0 !important;
      min-height: 0 !important;
      max-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      overflow: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);
}

function removeBrand() {
  const panel = document.getElementById(PANEL_ID);
  if (!(panel instanceof HTMLElement)) return false;

  panel.querySelectorAll('.gz421-window-title').forEach((header) => {
    if (!(header instanceof HTMLElement)) return;
    header.setAttribute('aria-hidden', 'true');
    header.dataset.gannzillaPanelBrandRemovedV424 = 'true';
    header.remove();
  });

  panel.dataset.gannzillaPanelBrandRemovedV424 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('removePanelBrand', true) || window[STATE_KEY]) return;

  installStyle();

  let frame = 0;
  const run = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(removeBrand);
  };

  [0, 20, 60, 140, 320, 700, 1400, 2600].forEach((delay) => window.setTimeout(run, delay));
  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.GANNZILLA_REMOVE_PANEL_BRAND_V424 = true;
  window.__auditGannzillaRemovePanelBrandV424 = () => {
    const panel = document.getElementById(PANEL_ID);
    return {
      ok: Boolean(panel?.dataset?.gannzillaPanelBrandRemovedV424 === 'true')
        && !panel?.querySelector('.gz421-window-title'),
      build: BUILD,
      enabled: boolParam('removePanelBrand', true),
      logoVisible: false,
      gannzillaProTitleVisible: false,
      titleRowRemoved: true,
      remainingPanelContentPreserved: true,
    };
  };

  window[STATE_KEY] = { observer };
}

install();
