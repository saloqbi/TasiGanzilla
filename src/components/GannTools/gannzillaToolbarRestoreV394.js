const STYLE_ID = 'gannzilla-toolbar-restore-v394';
const STATE_KEY = '__gannzillaToolbarRestoreV394';
const CHARTS_KEY = 'tasi-gannzilla-chart-registry-v328';
const ACTIVE_KEY = 'tasi-gannzilla-active-chart-v328';
const PANEL_STATE_KEY = 'tasi-gannzilla-canonical-panel-v326';

function enabled() {
  try {
    const query = new URLSearchParams(window.location.search || '');
    if (!query.has('restoreToolbarIcons')) return true;
    const value = String(query.get('restoreToolbarIcons') || '').toLowerCase();
    return value === 'true' || value === '1' || value === 'yes' || value === 'on';
  } catch (_) {
    return true;
  }
}

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    [data-gannzilla-toolbar="true"] {
      display: flex !important;
      visibility: visible !important;
      flex-wrap: nowrap !important;
      overflow: visible !important;
      height: 24px !important;
      min-height: 24px !important;
      max-height: 24px !important;
    }

    [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] {
      display: flex !important;
      flex-wrap: nowrap !important;
      align-items: stretch !important;
      gap: 0 !important;
      overflow: visible !important;
    }

    #gannzilla-clean-property-panel-v325 .gannzilla-chart-toolbar-v328 {
      display: flex !important;
      visibility: visible !important;
      flex-wrap: nowrap !important;
      align-items: center !important;
      overflow: hidden !important;
      white-space: nowrap !important;
    }

    #gannzilla-clean-property-panel-v325 .gannzilla-chart-toolbar-v328 select {
      min-width: 90px !important;
    }

    #gannzilla-clean-property-panel-v325 .gannzilla-chart-toolbar-v328 button {
      flex: 0 0 27px !important;
      width: 27px !important;
      min-width: 27px !important;
      max-width: 27px !important;
    }
  `;
  document.head.appendChild(style);
}

function hideDuplicates(selector) {
  const nodes = Array.from(document.querySelectorAll(selector));
  nodes.forEach((node, index) => {
    if (index === 0) {
      node.style.removeProperty('display');
      node.style.removeProperty('visibility');
      node.dataset.gannzillaToolbarPrimaryV394 = 'true';
      return;
    }
    node.style.setProperty('display', 'none', 'important');
    node.style.setProperty('visibility', 'hidden', 'important');
    node.style.setProperty('pointer-events', 'none', 'important');
    node.dataset.gannzillaToolbarDuplicateHiddenV394 = 'true';
  });
}

function duplicateActiveChart() {
  try {
    const charts = JSON.parse(localStorage.getItem(CHARTS_KEY) || '[]');
    if (!Array.isArray(charts) || charts.length === 0) return false;
    const activeId = localStorage.getItem(ACTIVE_KEY) || charts[0].id;
    const active = charts.find((chart) => chart.id === activeId) || charts[0];
    const currentState = window.__gannzillaCanonicalPanelStateV326
      || JSON.parse(localStorage.getItem(PANEL_STATE_KEY) || 'null')
      || active.state
      || {};
    const copyId = `chart-copy-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const copyName = `${active.name || 'Default'} Copy`;
    const nextCharts = charts.map((chart) => (
      chart.id === activeId ? { ...chart, state: JSON.parse(JSON.stringify(currentState)) } : chart
    ));
    nextCharts.push({ id: copyId, name: copyName, state: JSON.parse(JSON.stringify(currentState)) });
    localStorage.setItem(CHARTS_KEY, JSON.stringify(nextCharts));
    localStorage.setItem(ACTIVE_KEY, copyId);
    localStorage.setItem(PANEL_STATE_KEY, JSON.stringify(currentState));
    window.__gannzillaLastChartToolbarActionV394 = { action: 'copy', sourceId: activeId, activeId: copyId, at: Date.now() };
    window.location.reload();
    return true;
  } catch (_) {
    return false;
  }
}

function restoreCopyIcon() {
  const toolbar = document.querySelector('#gannzilla-clean-property-panel-v325 .gannzilla-chart-toolbar-v328');
  if (!toolbar) return false;
  const buttons = Array.from(toolbar.querySelectorAll('button'));
  if (buttons.length < 4) return false;
  const copyButton = buttons[3];
  if (copyButton.dataset.gannzillaCopyButtonV394 === 'true') return true;

  copyButton.dataset.gannzillaCopyButtonV394 = 'true';
  copyButton.textContent = '⧉';
  copyButton.title = 'نسخ المخطط';
  copyButton.setAttribute('aria-label', 'نسخ المخطط');
  copyButton.style.color = '#333';

  copyButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    duplicateActiveChart();
  }, true);

  return true;
}

function apply() {
  if (!enabled()) return false;
  installStyle();
  hideDuplicates('[data-gannzilla-toolbar="true"]');
  hideDuplicates('#gannzilla-clean-property-panel-v325 .gannzilla-chart-toolbar-v328');
  restoreCopyIcon();
  window.GANNZILLA_TOOLBAR_RESTORE_V394 = true;
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled()) return;
  if (window[STATE_KEY]) return;
  const run = () => apply();
  [0, 80, 220, 500, 1000].forEach((delay) => window.setTimeout(run, delay));
  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', run);
  window[STATE_KEY] = { observer };
}

install();
