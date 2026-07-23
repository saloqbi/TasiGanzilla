const STATE_KEY = '__gannzillaToolbarDeduplicateV396';

function boolParam(name, fallback = false) {
  try {
    const query = new URLSearchParams(window.location.search || '');
    if (!query.has(name)) return fallback;
    const value = String(query.get(name) || '').toLowerCase();
    return value === 'true' || value === '1' || value === 'yes' || value === 'on';
  } catch (_) {
    return fallback;
  }
}

function enabled() {
  return boolParam('dedupeToolbar', true);
}

function hideNode(node) {
  if (!node) return;
  node.style.setProperty('display', 'none', 'important');
  node.style.setProperty('visibility', 'hidden', 'important');
  node.style.setProperty('pointer-events', 'none', 'important');
  node.dataset.gannzillaToolbarDuplicateHiddenV396 = 'true';
}

function keepOnlyFirst(selector) {
  const nodes = Array.from(document.querySelectorAll(selector));
  nodes.forEach((node, index) => {
    if (index === 0) {
      node.dataset.gannzillaToolbarPrimaryV396 = 'true';
      return;
    }
    hideNode(node);
  });
}

function removeLegacyToolbarRows() {
  const primaryToolbar = document.querySelector('[data-gannzilla-toolbar="true"]');
  const chartToolbar = document.querySelector('#gannzilla-clean-property-panel-v325 .gannzilla-chart-toolbar-v328');

  Array.from(document.querySelectorAll('body *')).forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node === primaryToolbar || node === chartToolbar) return;
    if (primaryToolbar?.contains(node) || chartToolbar?.contains(node)) return;
    if (node.closest?.('aside')) return;

    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    if (rect.height > 42 || rect.width < Math.max(420, window.innerWidth * 0.45)) return;
    if (rect.top < 0 || rect.top > 70) return;

    const hasControls = node.querySelector?.('button,select,input,[role="toolbar"]');
    if (!hasControls) return;

    hideNode(node);
  });
}

function dedupeControlsInsidePrimaryToolbar() {
  const toolbar = document.querySelector('[data-gannzilla-toolbar="true"]');
  if (!toolbar) return;

  const selectors = [
    '[data-gannzilla-canvas-export-v360="true"]',
    '[data-gannzilla-restored-layout-eye-v370="true"]',
    '[data-gannzilla-chart-visibility-toggle-v291="true"]',
    '[data-gannzilla-wheel-zoom-v298="true"]',
    '[data-gannzilla-page-fullscreen-control="true"]',
    '[data-gannzilla-connection-control="true"]',
    '[data-gannzilla-language-control="true"]',
    '[data-gannzilla-about-control="true"]',
  ];

  selectors.forEach((selector) => {
    const nodes = Array.from(toolbar.querySelectorAll(selector));
    nodes.forEach((node, index) => {
      if (index > 0) hideNode(node);
    });
  });
}

function apply() {
  if (!enabled()) return false;
  keepOnlyFirst('[data-gannzilla-toolbar="true"]');
  keepOnlyFirst('#gannzilla-clean-property-panel-v325 .gannzilla-chart-toolbar-v328');
  dedupeControlsInsidePrimaryToolbar();
  removeLegacyToolbarRows();
  window.GANNZILLA_TOOLBAR_DEDUPLICATE_V396 = true;
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled()) return;
  if (window[STATE_KEY]) return;

  const run = () => apply();
  [0, 60, 160, 320, 700, 1400].forEach((delay) => window.setTimeout(run, delay));
  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', run);
  window[STATE_KEY] = { observer };
}

install();
