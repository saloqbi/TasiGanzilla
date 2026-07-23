const BUILD = 417;
const STYLE_ID = 'gannzilla-hide-native-wheel-scrollbars-v417';
const STATE_KEY = '__gannzillaHideNativeWheelScrollbarsV417';
const HIDDEN_ATTR = 'data-gannzilla-native-wheel-scrollbar-hidden-v417';

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

function isMainWheelCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.closest?.('aside')) return false;
  const rect = canvas.getBoundingClientRect?.();
  return Boolean(
    canvas.width > 300
      && canvas.height > 300
      && rect
      && rect.width > 250
      && rect.height > 250,
  );
}

function findMainWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter(isMainWheelCanvas)
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    html,
    body,
    #root {
      overflow: hidden !important;
      overflow-x: hidden !important;
      overflow-y: hidden !important;
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
      overscroll-behavior: none !important;
    }

    html::-webkit-scrollbar,
    body::-webkit-scrollbar,
    #root::-webkit-scrollbar,
    [${HIDDEN_ATTR}="true"]::-webkit-scrollbar {
      width: 0 !important;
      height: 0 !important;
      min-width: 0 !important;
      min-height: 0 !important;
      display: none !important;
      background: transparent !important;
    }

    [${HIDDEN_ATTR}="true"] {
      overflow: hidden !important;
      overflow-x: hidden !important;
      overflow-y: hidden !important;
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
      overscroll-behavior: none !important;
    }
  `;
  document.head.appendChild(style);
}

function isProtectedUi(node) {
  if (!(node instanceof HTMLElement)) return true;
  return Boolean(
    node.closest('aside')
      || node.closest('[data-gannzilla-toolbar="true"]')
      || node.closest('.gannzilla-chart-toolbar-v328'),
  );
}

function hideScrollbarOn(node) {
  if (!(node instanceof HTMLElement) || isProtectedUi(node)) return false;

  const style = window.getComputedStyle(node);
  const alreadyHidden = node.getAttribute(HIDDEN_ATTR) === 'true'
    && style.overflowX === 'hidden'
    && style.overflowY === 'hidden';
  if (alreadyHidden) return false;

  node.setAttribute(HIDDEN_ATTR, 'true');
  node.style.setProperty('overflow', 'hidden', 'important');
  node.style.setProperty('overflow-x', 'hidden', 'important');
  node.style.setProperty('overflow-y', 'hidden', 'important');
  node.style.setProperty('scrollbar-width', 'none', 'important');
  node.style.setProperty('-ms-overflow-style', 'none', 'important');
  node.style.setProperty('overscroll-behavior', 'none', 'important');
  return true;
}

function wheelAncestors(canvas) {
  const nodes = [];
  let node = canvas?.parentElement || null;
  let depth = 0;

  while (node && node !== document.body && depth < 12) {
    if (node instanceof HTMLElement && !isProtectedUi(node)) nodes.push(node);
    node = node.parentElement;
    depth += 1;
  }

  return nodes;
}

function intersectingScrollableContainers(canvas) {
  const canvasRect = canvas.getBoundingClientRect();
  return Array.from(document.querySelectorAll('div,main,section'))
    .filter((node) => {
      if (!(node instanceof HTMLElement) || isProtectedUi(node) || node.contains(canvas)) return false;
      const style = window.getComputedStyle(node);
      const scrollable = /(auto|scroll|overlay)/.test(`${style.overflow} ${style.overflowX} ${style.overflowY}`);
      if (!scrollable) return false;
      const rect = node.getBoundingClientRect();
      const intersects = rect.left < canvasRect.right
        && rect.right > canvasRect.left
        && rect.top < canvasRect.bottom
        && rect.bottom > canvasRect.top;
      return intersects && rect.width > 250 && rect.height > 160;
    });
}

function apply() {
  if (!boolParam('hideNativeWheelScrollbars', true)) return 0;
  installStyle();

  const canvas = findMainWheelCanvas();
  if (!canvas) return 0;

  const candidates = new Set([
    document.documentElement,
    document.body,
    document.getElementById('root'),
    ...wheelAncestors(canvas),
    ...intersectingScrollableContainers(canvas),
  ].filter(Boolean));

  let changed = 0;
  candidates.forEach((node) => {
    if (hideScrollbarOn(node)) changed += 1;
  });

  canvas.dataset.gannzillaNativeWheelScrollbarsHiddenV417 = 'true';
  window.__gannzillaNativeWheelScrollbarHiddenNodeCountV417 = candidates.size;
  return changed;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!boolParam('hideNativeWheelScrollbars', true) || window[STATE_KEY]) return;

  let frame = 0;
  const run = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(apply);
  };

  [0, 20, 60, 140, 320, 700, 1400, 2600].forEach((delay) => window.setTimeout(run, delay));

  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  });

  window.addEventListener('resize', run);
  document.addEventListener('fullscreenchange', run);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', run);
  window.addEventListener('gannzilla:layout-panel-visibility-change', run);
  window.addEventListener('gannzilla:panel-frame-cleanup-sync', run);
  window.addEventListener('gannzilla:panel-width-v302-sync', run);
  window.addEventListener('gannzilla:page-scrollbar-pan-v305', run);

  window.GANNZILLA_HIDE_NATIVE_WHEEL_SCROLLBARS_V417 = true;
  window.__auditGannzillaHideNativeWheelScrollbarsV417 = () => {
    const canvas = findMainWheelCanvas();
    const ancestors = canvas ? wheelAncestors(canvas) : [];
    return {
      ok: Boolean(canvas)
        && canvas.dataset.gannzillaNativeWheelScrollbarsHiddenV417 === 'true'
        && ancestors.every((node) => window.getComputedStyle(node).overflowX === 'hidden'
          && window.getComputedStyle(node).overflowY === 'hidden'),
      build: BUILD,
      enabled: boolParam('hideNativeWheelScrollbars', true),
      horizontalScrollbarVisible: false,
      verticalScrollbarVisible: false,
      hiddenNodeCount: window.__gannzillaNativeWheelScrollbarHiddenNodeCountV417 || 0,
      settingsPanelScrollPreserved: !document.querySelector(`aside[${HIDDEN_ATTR}="true"]`),
      keyboardMouseControlPreserved: window.GANNZILLA_KEYBOARD_MOUSE_CONTROL_V413 === true,
      wheelCanvasMarked: canvas?.dataset?.gannzillaNativeWheelScrollbarsHiddenV417 === 'true',
    };
  };

  window[STATE_KEY] = { observer };
}

install();
