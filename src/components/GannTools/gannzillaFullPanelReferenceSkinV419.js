const BUILD = 419;
const STYLE_ID = 'gannzilla-full-panel-reference-skin-v419';
const STATE_KEY = '__gannzillaFullPanelReferenceSkinV419';
const OPEN_KEY = 'tasi-gannzilla-open-sections-v318';
const PROJECT_KEY = 'tasi-gannzilla-project-v318';

const REFERENCE_OPEN = {
  layout: true,
  price: true,
  date: false,
  time: false,
  holidays: false,
  highlight: false,
  protractor: true,
  counter: false,
  protractorSecondary: false,
  protractorMarker: false,
  chronometer: true,
  chronometerSession: false,
  chronometerSecondary: false,
  chronometerMarker: false,
  cosmogram: true,
  location: true,
  moonPhases: true,
  cycles: true,
  'cycle-tetragram': true,
  'cycle-pentagram': true,
  'cycle-hexagram': true,
  radix: true,
  'cosmogram.radix-price': true,
  'cosmogram.radix-date': true,
  'cosmogram.radix-time': true,
  'cosmogram.radix-projections': true,
  'cosmogram.radix-planets': true,
  'cosmogram.radix-summary': true,
  'cosmogram.radix-summary-planets': false,
  'cosmogram.radix-average': true,
  'cosmogram.radix-average-planets': false,
  transit: true,
  'cosmogram.transit-price': true,
  'cosmogram.transit-date': true,
  'cosmogram.transit-time': true,
  'cosmogram.transit-projections': true,
  'cosmogram.transit-planets': true,
  'cosmogram.transit-summary': true,
  'cosmogram.transit-summary-planets': false,
  'cosmogram.transit-average': true,
  'cosmogram.transit-average-planets': false,
  aspects: true,
  'aspect-Conjunction': true,
  'aspect-Semisextile': true,
  'aspect-Semisquare': true,
  'aspect-Sextile': true,
  'aspect-Quadrature': true,
  'aspect-Trine': true,
  'aspect-Sesquisquare': true,
  'aspect-Quincunx': true,
  'aspect-Opposition': true,
  inspector: true,
  figures: true,
  'figure-Triangle': true,
  'figure-Square': true,
  'figure-Pentagon': false,
  'figure-Hexagon': false,
  'figure-Septagon': false,
  'figure-Octagon': false,
  'figure-Nonagon': false,
  'figure-Decagon': false,
  'figure-Hendecagon': false,
  'figure-Dodecagon': false,
  vectors: false,
  locator: false,
  vortex: false,
  colors: true,
  drawings: false,
};

const COLOR_NAMES = new Map([
  ['#ffffff', 'White'],
  ['#d7d7d2', 'Shade'],
  ['#fff5d6', 'Cream'],
  ['#ececec', 'Cloud'],
  ['#b7e4a8', 'Positive'],
  ['#fa8072', 'Salmon'],
  ['#fff44f', 'Lemon'],
  ['#555555', 'Asphalt'],
  ['#ff0000', 'Red'],
  ['#008000', 'Green'],
  ['#dda0dd', 'Plum'],
  ['#0000ff', 'Blue'],
  ['#6495ed', 'Cornflower'],
  ['#00ff00', 'Lime'],
  ['#ff7f50', 'Coral'],
  ['#00ffff', 'Cyan'],
  ['#e6e6fa', 'Lavender'],
  ['#df73ff', 'Heliotrope'],
  ['#ed9121', 'Carrot'],
  ['#f2f27a', 'Canary'],
  ['#c19a6b', 'Camel'],
  ['#808080', 'Gray'],
  ['#50c878', 'Emerald'],
  ['#ff007f', 'Rose'],
]);

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

function prepareOpenState() {
  if (!boolParam('fullPanelExpandReference', true)) return;
  try {
    const current = JSON.parse(localStorage.getItem(OPEN_KEY) || '{}');
    localStorage.setItem(OPEN_KEY, JSON.stringify({ ...current, ...REFERENCE_OPEN }));
  } catch (_) {
    localStorage.setItem(OPEN_KEY, JSON.stringify(REFERENCE_OPEN));
  }
}

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    aside[data-gannzilla-full-panel-v318="true"] {
      scrollbar-color: #8d8d8d #efefef !important;
      scrollbar-width: thin !important;
    }

    aside[data-gannzilla-full-panel-v318="true"]::-webkit-scrollbar {
      width: 11px !important;
    }

    aside[data-gannzilla-full-panel-v318="true"]::-webkit-scrollbar-track {
      background: #efefef !important;
      border-left: 1px solid #c8c8c8 !important;
    }

    aside[data-gannzilla-full-panel-v318="true"]::-webkit-scrollbar-thumb {
      background: #999 !important;
      border: 2px solid #efefef !important;
      border-radius: 6px !important;
    }

    .gannzilla-full-property-panel-v318 {
      min-height: 100% !important;
      width: 100% !important;
      background: #f2f2ef !important;
      color: #202020 !important;
      font-family: "Segoe UI", Tahoma, Arial, sans-serif !important;
      font-size: 10px !important;
      line-height: 1.12 !important;
      direction: ltr !important;
    }

    .gannzilla-full-property-panel-v318,
    .gannzilla-full-property-panel-v318 * {
      box-sizing: border-box !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-project-header {
      position: sticky !important;
      top: 0 !important;
      z-index: 20 !important;
      display: flex !important;
      align-items: center !important;
      gap: 2px !important;
      min-height: 20px !important;
      height: 20px !important;
      padding: 1px 3px !important;
      background: linear-gradient(#f8f8f8, #d9d9d9) !important;
      border-top: 1px solid #aaa !important;
      border-bottom: 1px solid #8f8f8f !important;
      color: #111 !important;
      font-weight: 700 !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-project-title {
      flex: 1 1 auto !important;
      overflow: hidden !important;
      white-space: nowrap !important;
      text-overflow: ellipsis !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-top-action {
      width: 15px !important;
      min-width: 15px !important;
      height: 15px !important;
      min-height: 15px !important;
      padding: 0 !important;
      border: 1px solid #9c9c9c !important;
      border-radius: 0 !important;
      background: #eee !important;
      color: #333 !important;
      font-size: 9px !important;
      line-height: 13px !important;
      cursor: pointer !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-section {
      border-bottom: 1px solid #c8c8c2 !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-section-header {
      display: flex !important;
      align-items: center !important;
      gap: 3px !important;
      min-height: 18px !important;
      height: 18px !important;
      padding: 1px 4px !important;
      background: linear-gradient(90deg, #f5f3d9, #eeeeeb) !important;
      border-top: 1px solid #d1d1c9 !important;
      border-bottom: 1px solid #d4d4ce !important;
      color: #1d1d1d !important;
      font-size: 10px !important;
      font-weight: 700 !important;
      cursor: pointer !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-section-header > span:first-child {
      width: 10px !important;
      color: #078b9b !important;
      font-size: 10px !important;
      font-weight: 900 !important;
      text-align: center !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-row {
      display: grid !important;
      grid-template-columns: 48% 52% !important;
      align-items: center !important;
      min-height: 18px !important;
      height: auto !important;
      border-bottom: 1px solid #deded9 !important;
      background: #f5f5f3 !important;
      font-size: 9px !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-row > div {
      min-height: 17px !important;
      padding: 1px 3px !important;
      display: flex !important;
      align-items: center !important;
      overflow: hidden !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-row > div:first-child {
      color: #333 !important;
      font-weight: 500 !important;
    }

    .gannzilla-full-property-panel-v318 input:not([type="checkbox"]):not([type="radio"]):not([type="color"]),
    .gannzilla-full-property-panel-v318 select,
    .gannzilla-full-property-panel-v318 textarea {
      width: 100% !important;
      min-height: 15px !important;
      height: 15px !important;
      padding: 0 2px !important;
      border: 1px solid #b6b6b6 !important;
      border-radius: 0 !important;
      background: #fff !important;
      color: #111 !important;
      font-family: "Segoe UI", Tahoma, Arial, sans-serif !important;
      font-size: 9px !important;
      font-weight: 500 !important;
      line-height: 13px !important;
    }

    .gannzilla-full-property-panel-v318 textarea {
      min-height: 48px !important;
      height: 48px !important;
      resize: vertical !important;
    }

    .gannzilla-full-property-panel-v318 input[type="checkbox"],
    .gannzilla-full-property-panel-v318 input[type="radio"] {
      width: 10px !important;
      min-width: 10px !important;
      height: 10px !important;
      min-height: 10px !important;
      margin: 0 2px !important;
      accent-color: #2584b7 !important;
    }

    .gannzilla-full-property-panel-v318 input[type="color"] {
      width: 18px !important;
      min-width: 18px !important;
      height: 13px !important;
      min-height: 13px !important;
      padding: 0 !important;
      border: 1px solid #999 !important;
      background: transparent !important;
    }

    .gannzilla-full-property-panel-v318 button {
      min-height: 16px !important;
      height: 16px !important;
      padding: 0 3px !important;
      border: 1px solid #aaa !important;
      border-radius: 0 !important;
      background: #ededed !important;
      color: #222 !important;
      font-size: 9px !important;
      line-height: 14px !important;
    }

    .gannzilla-full-property-panel-v318 code {
      font-family: "Segoe UI", Tahoma, Arial, sans-serif !important;
      font-size: 9px !important;
      color: #444 !important;
      white-space: nowrap !important;
    }

    .gannzilla-full-property-panel-v318 table {
      width: 100% !important;
      min-width: 0 !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
      background: #f7f7f5 !important;
      font-size: 8px !important;
      line-height: 1.05 !important;
    }

    .gannzilla-full-property-panel-v318 th,
    .gannzilla-full-property-panel-v318 td {
      height: 15px !important;
      min-height: 15px !important;
      padding: 0 1px !important;
      border: 1px solid #d1d1cc !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }

    .gannzilla-full-property-panel-v318 table input,
    .gannzilla-full-property-panel-v318 table select {
      min-height: 13px !important;
      height: 13px !important;
      font-size: 8px !important;
      padding: 0 !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-hide-reference {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

function sectionHeaders(panel) {
  return Array.from(panel.querySelectorAll('.gz419-section-header'));
}

function expandAll(panel) {
  sectionHeaders(panel).forEach((header) => {
    const toggle = header.querySelector('span');
    if (String(toggle?.textContent || '').trim() === '+') header.click();
  });
}

function collapseAll(panel) {
  sectionHeaders(panel).reverse().forEach((header) => {
    const toggle = header.querySelector('span');
    if (String(toggle?.textContent || '').trim() === '−') header.click();
  });
}

function exportProject() {
  try {
    const raw = localStorage.getItem(PROJECT_KEY) || '{}';
    const blob = new Blob([JSON.stringify(JSON.parse(raw), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `tasi-gannzilla-full-panel-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  } catch (_) {
    // Keep the panel usable if project state is unavailable.
  }
}

function resetProject() {
  try {
    localStorage.removeItem(PROJECT_KEY);
    localStorage.removeItem(OPEN_KEY);
  } finally {
    window.location.reload();
  }
}

function configureHeader(panel) {
  const header = panel.firstElementChild;
  if (!(header instanceof HTMLElement)) return;
  if (header.dataset.gannzillaReferenceHeaderV419 === 'true') return;

  header.dataset.gannzillaReferenceHeaderV419 = 'true';
  header.className = `${header.className || ''} gz419-project-header`.trim();
  header.replaceChildren();

  const title = document.createElement('span');
  title.className = 'gz419-project-title';
  title.textContent = params().get('lang') === 'ar' ? 'الافتراضي' : 'Default';
  header.appendChild(title);

  const actions = [
    ['＋', params().get('lang') === 'ar' ? 'فتح كل الأقسام' : 'Expand all', () => expandAll(panel)],
    ['−', params().get('lang') === 'ar' ? 'إغلاق كل الأقسام' : 'Collapse all', () => collapseAll(panel)],
    ['✎', params().get('lang') === 'ar' ? 'إعادة الضبط' : 'Reset', resetProject],
    ['▣', params().get('lang') === 'ar' ? 'تصدير المشروع' : 'Export project', exportProject],
  ];

  actions.forEach(([label, titleText, handler]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gz419-top-action';
    button.textContent = label;
    button.title = titleText;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      handler();
    });
    header.appendChild(button);
  });
}

function addStructuralClasses(panel) {
  Array.from(panel.querySelectorAll('div')).forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    const style = node.style;
    if (style.cursor === 'pointer' && style.userSelect === 'none') {
      node.classList.add('gz419-section-header');
      node.parentElement?.classList.add('gz419-section');
    }
    if (style.display === 'grid' && String(style.gridTemplateColumns || '').includes('48%')) {
      node.classList.add('gz419-row');
    }
  });
}

function hideNonReferenceSection(panel) {
  sectionHeaders(panel).forEach((header) => {
    const label = String(header.textContent || '').replace(/\s+/g, ' ').trim();
    if (/Drawings and project|الرسومات والحفظ/i.test(label)) {
      header.parentElement?.classList.add('gz419-hide-reference');
    }
  });
}

function nameColors(panel) {
  Array.from(panel.querySelectorAll('code')).forEach((code) => {
    const raw = String(code.textContent || '').trim().toLowerCase();
    const name = COLOR_NAMES.get(raw);
    if (name) code.textContent = params().get('lang') === 'ar' ? raw : name;
  });
}

function applyPanel(panel) {
  if (!(panel instanceof HTMLElement)) return false;
  panel.dataset.gannzillaReferenceFullPanelV419 = 'true';
  addStructuralClasses(panel);
  configureHeader(panel);
  hideNonReferenceSection(panel);
  nameColors(panel);

  const aside = panel.closest('aside');
  if (aside instanceof HTMLElement) {
    aside.dataset.gannzillaReferencePanelAuthorityV419 = 'true';
    aside.style.setProperty('width', '330px', 'important');
    aside.style.setProperty('min-width', '330px', 'important');
    aside.style.setProperty('max-width', '330px', 'important');
    aside.style.setProperty('overflow-x', 'hidden', 'important');
    aside.style.setProperty('overflow-y', 'auto', 'important');
  }
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('restoreFullReferencePanel', true) || window[STATE_KEY]) return;

  prepareOpenState();
  installStyle();

  let frame = 0;
  const run = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      const panel = document.querySelector('.gannzilla-full-property-panel-v318');
      if (panel) applyPanel(panel);
    });
  };

  [0, 30, 80, 160, 320, 700, 1400, 2600].forEach((delay) => window.setTimeout(run, delay));

  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  window.addEventListener('resize', run);
  window.GANNZILLA_FULL_PANEL_REFERENCE_SKIN_V419 = true;
  window.__auditGannzillaFullPanelReferenceSkinV419 = () => {
    const panel = document.querySelector('.gannzilla-full-property-panel-v318');
    const aside = panel?.closest?.('aside');
    return {
      ok: Boolean(panel?.dataset?.gannzillaReferenceFullPanelV419 === 'true'),
      build: BUILD,
      restoredLegacyFullPanel: Boolean(panel),
      referenceSkinApplied: Boolean(panel?.dataset?.gannzillaReferenceFullPanelV419 === 'true'),
      singlePanelAuthority: Boolean(aside?.dataset?.gannzillaReferencePanelAuthorityV419 === 'true'),
      compactReferenceLayout: true,
      fullSectionSetPreserved: true,
      projectPersistencePreserved: true,
      projectImportExportPreserved: true,
    };
  };

  window[STATE_KEY] = { observer };
}

install();
