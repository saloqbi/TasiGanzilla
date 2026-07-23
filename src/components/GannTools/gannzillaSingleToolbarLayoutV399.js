const STYLE_ID = 'gannzilla-single-toolbar-layout-v399';
const STATE_KEY = '__gannzillaSingleToolbarLayoutV399';

function enabled() {
  try {
    const q = new URLSearchParams(window.location.search || '');
    if (!q.has('singleToolbarLayout')) return true;
    const v = String(q.get('singleToolbarLayout') || '').toLowerCase();
    return v === 'true' || v === '1' || v === 'yes' || v === 'on';
  } catch (_) {
    return true;
  }
}

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* Keep one 24px application toolbar only. */
    [data-gannzilla-single-toolbar-v399="true"] {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      height: 24px !important;
      min-height: 24px !important;
      max-height: 24px !important;
      z-index: 2147483600 !important;
      display: flex !important;
      align-items: stretch !important;
      flex-wrap: nowrap !important;
      overflow: hidden !important;
    }

    /* Hide the duplicate legacy left block: Gannzilla Pro / Default / Add / Delete. */
    [data-gannzilla-single-toolbar-v399="true"] > [data-gannzilla-legacy-left-block-v399="true"] {
      display: none !important;
      visibility: hidden !important;
      width: 0 !important;
      min-width: 0 !important;
      max-width: 0 !important;
      flex: 0 0 0 !important;
      overflow: hidden !important;
      pointer-events: none !important;
    }

    /* Keep the original right-side icon controls. */
    [data-gannzilla-single-toolbar-v399="true"] > [data-gannzilla-original-icons-v399="true"] {
      margin-left: 330px !important;
      flex: 1 1 auto !important;
      min-width: 0 !important;
      height: 24px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      overflow: hidden !important;
      white-space: nowrap !important;
    }

    /* Place the canonical Default/copy toolbar in the freed left slot. */
    #gannzilla-clean-property-panel-v325 {
      top: 24px !important;
    }

    #gannzilla-clean-property-panel-v325 .gannzilla-chart-toolbar-v328 {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: auto !important;
      width: 330px !important;
      height: 24px !important;
      min-height: 24px !important;
      max-height: 24px !important;
      z-index: 2147483640 !important;
      padding: 1px 3px !important;
      gap: 2px !important;
      display: flex !important;
      align-items: center !important;
      flex-wrap: nowrap !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }

    #gannzilla-clean-property-panel-v325 .gannzilla-chart-toolbar-v328 select {
      height: 22px !important;
      min-height: 22px !important;
      max-height: 22px !important;
      min-width: 100px !important;
    }

    #gannzilla-clean-property-panel-v325 .gannzilla-chart-toolbar-v328 button {
      width: 22px !important;
      min-width: 22px !important;
      max-width: 22px !important;
      height: 22px !important;
      min-height: 22px !important;
      max-height: 22px !important;
      line-height: 20px !important;
      padding: 0 !important;
      flex: 0 0 22px !important;
    }

    #gannzilla-clean-property-panel-v325 .gannzilla-canonical-property-panel-v326 {
      padding-top: 0 !important;
    }
  `;
  document.head.appendChild(style);
}

function findLegacyTopToolbar() {
  return Array.from(document.querySelectorAll('body div')).find((node) => {
    const style = getComputedStyle(node);
    if (style.position !== 'fixed' || Math.round(parseFloat(style.top) || 0) !== 0) return false;
    const text = String(node.textContent || '');
    return text.includes('Gannzilla Pro') && text.includes('Clockwise') && node.children.length >= 2;
  }) || null;
}

function apply() {
  if (!enabled()) return false;
  installStyle();

  const toolbar = findLegacyTopToolbar();
  if (!toolbar) return false;

  toolbar.dataset.gannzillaSingleToolbarV399 = 'true';
  const children = Array.from(toolbar.children);
  if (children[0]) children[0].dataset.gannzillaLegacyLeftBlockV399 = 'true';
  if (children[1]) children[1].dataset.gannzillaOriginalIconsV399 = 'true';

  /* Hide any additional legacy top toolbar containers if React rendered more than one. */
  Array.from(document.querySelectorAll('[data-gannzilla-single-toolbar-v399="true"]')).forEach((node, index) => {
    if (index === 0) return;
    node.style.setProperty('display', 'none', 'important');
    node.style.setProperty('visibility', 'hidden', 'important');
    node.style.setProperty('pointer-events', 'none', 'important');
  });

  window.GANNZILLA_SINGLE_TOOLBAR_LAYOUT_V399 = true;
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled()) return;
  if (window[STATE_KEY]) return;

  const run = () => apply();
  [0, 50, 120, 260, 600, 1200].forEach((delay) => window.setTimeout(run, delay));
  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', run);
  window[STATE_KEY] = { observer };
}

install();
