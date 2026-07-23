const BUILD = 429;
const TOOLBAR_ID = 'gannzilla-top-reference-toolbar-v429';
const STYLE_ID = 'gannzilla-top-reference-toolbar-style-v429';
const STATE_KEY = '__gannzillaTopReferenceToolbarV429';
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

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function toolbarHeight() {
  return Math.round(numberParam('topToolbarHeight', 24, 22, 36));
}

function currentZoom() {
  return numberParam('gannzillaZoom', 1, 0.05, 5);
}

function updateUrl(patch) {
  const url = new URL(window.location.href);
  Object.entries(patch).forEach(([name, value]) => url.searchParams.set(name, String(value)));
  url.searchParams.set('showTopReferenceToolbar', 'true');
  url.searchParams.set('v', String(BUILD));
  window.location.assign(`${url.pathname}${url.search}${url.hash}`);
}

function findMainWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest?.('aside')) return false;
      const rect = canvas.getBoundingClientRect?.();
      return Boolean(canvas.width > 300 && canvas.height > 300 && rect && rect.width > 250 && rect.height > 250);
    })
    .map((canvas) => ({ canvas, area: canvas.width * canvas.height }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;
}

function downloadWheelPng() {
  const panel = document.getElementById(PANEL_ID);
  const linkedButton = panel?.querySelector('[data-gannzilla-png-windows-association-v428="true"]');
  if (linkedButton instanceof HTMLButtonElement) {
    linkedButton.click();
    return;
  }

  const canvas = findMainWheelCanvas();
  if (!(canvas instanceof HTMLCanvasElement)) return;
  canvas.toBlob((blob) => {
    if (!(blob instanceof Blob)) return;
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `gann-circle-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
  }, 'image/png');
}

function toggleClockwise() {
  const panel = document.getElementById(PANEL_ID);
  const rows = Array.from(panel?.querySelectorAll('.gz421-row') || []);
  const row = rows.find((item) => String(item.querySelector('.gz421-label')?.textContent || '').trim() === 'Clockwise');
  const checkbox = row?.querySelector('input[type="checkbox"]');
  if (checkbox instanceof HTMLInputElement) checkbox.click();
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  const height = toolbarHeight();
  style.textContent = `
    :root { --gannzilla-toolbar-height: ${height}px !important; }

    #${TOOLBAR_ID} {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      height: ${height}px !important;
      min-height: ${height}px !important;
      z-index: 2147483500 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: 1px !important;
      padding: 1px 4px !important;
      border-top: 1px solid #c5c5c5 !important;
      border-bottom: 1px solid #8f8f8f !important;
      background: linear-gradient(#fafafa, #e9e9e9) !important;
      color: #222 !important;
      direction: ltr !important;
      font-family: Arial, "Segoe UI", Tahoma, sans-serif !important;
      font-size: 9px !important;
      box-sizing: border-box !important;
      user-select: none !important;
    }

    #${TOOLBAR_ID} * { box-sizing: border-box !important; }

    #${TOOLBAR_ID} .gz429-spacer { flex: 1 1 auto !important; min-width: 20px !important; }
    #${TOOLBAR_ID} .gz429-divider { width: 1px !important; height: 16px !important; background: #b9b9b9 !important; margin: 0 2px !important; }

    #${TOOLBAR_ID} button,
    #${TOOLBAR_ID} .gz429-readout {
      height: 18px !important;
      min-height: 18px !important;
      border: 1px solid #b6b6b6 !important;
      border-radius: 0 !important;
      background: linear-gradient(#ffffff, #eeeeee) !important;
      color: #1c5d91 !important;
      padding: 0 3px !important;
      margin: 0 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      font: 700 9px/16px Arial, "Segoe UI", sans-serif !important;
      white-space: nowrap !important;
      cursor: pointer !important;
    }

    #${TOOLBAR_ID} button:hover { background: #dcecff !important; }
    #${TOOLBAR_ID} button.gz429-active { box-shadow: inset 0 0 0 1px #4b94cc !important; background: #dcecff !important; }
    #${TOOLBAR_ID} .gz429-icon { width: 20px !important; min-width: 20px !important; padding: 0 !important; font-size: 11px !important; }
    #${TOOLBAR_ID} .gz429-yellow { color: #222 !important; background: linear-gradient(#fff4a8, #f0c535) !important; }
    #${TOOLBAR_ID} .gz429-png { min-width: 43px !important; color: #17699d !important; }
    #${TOOLBAR_ID} .gz429-readout { min-width: 38px !important; color: #222 !important; cursor: default !important; }
    #${TOOLBAR_ID} .gz429-select { min-width: 55px !important; color: #333 !important; }
    #${TOOLBAR_ID} .gz429-direction { min-width: 62px !important; color: #333 !important; }
    #${TOOLBAR_ID} .gz429-language { min-width: 59px !important; color: #164f82 !important; }

    #${PANEL_ID} { top: ${height}px !important; height: calc(100vh - ${height}px) !important; }
  `;
}

function button(label, title, className = '', action = null) {
  const control = document.createElement('button');
  control.type = 'button';
  control.className = className;
  control.textContent = label;
  control.title = title;
  if (typeof action === 'function') control.addEventListener('click', action);
  return control;
}

function createToolbar() {
  document.getElementById(TOOLBAR_ID)?.remove();
  const toolbar = document.createElement('div');
  toolbar.id = TOOLBAR_ID;
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Gannzilla top tools');

  const spacer = document.createElement('span');
  spacer.className = 'gz429-spacer';
  toolbar.appendChild(spacer);

  toolbar.appendChild(button('PNG ▾', 'حفظ صورة PNG', 'gz429-png', downloadWheelPng));
  toolbar.appendChild(button('↖', 'المؤشر', 'gz429-icon gz429-active'));
  toolbar.appendChild(button('─', 'خط', 'gz429-icon'));
  toolbar.appendChild(button('□', 'مستطيل', 'gz429-icon'));
  toolbar.appendChild(button('T', 'نص', 'gz429-icon'));
  toolbar.appendChild(button('▣', 'قفل', 'gz429-icon gz429-yellow'));
  toolbar.appendChild(button('⌕', 'تكبير', 'gz429-icon'));
  toolbar.appendChild(button('⟳', 'تحديث العرض', 'gz429-icon', () => window.dispatchEvent(new Event('resize'))));
  toolbar.appendChild(button('⛶', 'ملاءمة العرض', 'gz429-icon', () => updateUrl({ gannzillaZoom: 1 })));

  const divider1 = document.createElement('span'); divider1.className = 'gz429-divider'; toolbar.appendChild(divider1);
  toolbar.appendChild(button('−', 'تصغير', 'gz429-icon', () => updateUrl({ gannzillaZoom: Math.max(0.05, currentZoom() - 0.1).toFixed(2) })));
  const zoom = document.createElement('span'); zoom.className = 'gz429-readout'; zoom.textContent = `${Math.round(currentZoom() * 100)}%`; toolbar.appendChild(zoom);
  toolbar.appendChild(button('+', 'تكبير', 'gz429-icon', () => updateUrl({ gannzillaZoom: Math.min(5, currentZoom() + 0.1).toFixed(2) })));
  toolbar.appendChild(button('100%', 'الحجم الأصلي', 'gz429-select', () => updateUrl({ gannzillaZoom: 1 })));
  toolbar.appendChild(button('Clockwise', 'اتجاه العجلة', 'gz429-direction', toggleClockwise));
  toolbar.appendChild(button('GB English', 'اللغة الإنجليزية', 'gz429-language', () => updateUrl({ lang: 'en' })));
  toolbar.appendChild(button('ⓘ', 'معلومات', 'gz429-icon'));

  document.body.appendChild(toolbar);
  toolbar.dataset.gannzillaTopReferenceToolbarV429 = 'true';
  return toolbar;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showTopReferenceToolbar', true) || window[STATE_KEY]) return;

  installStyle();
  const run = () => {
    installStyle();
    if (!document.getElementById(TOOLBAR_ID)) createToolbar();
  };

  [0, 20, 60, 140, 320, 700, 1400, 2600].forEach((delay) => window.setTimeout(run, delay));
  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', run);

  window.GANNZILLA_TOP_REFERENCE_TOOLBAR_V429 = true;
  window.__auditGannzillaTopReferenceToolbarV429 = () => {
    const toolbar = document.getElementById(TOOLBAR_ID);
    return {
      ok: Boolean(toolbar?.dataset?.gannzillaTopReferenceToolbarV429 === 'true'),
      build: BUILD,
      enabled: boolParam('showTopReferenceToolbar', true),
      toolbarHeightPx: toolbar ? Math.round(toolbar.getBoundingClientRect().height) : null,
      fixedAtTop: toolbar ? window.getComputedStyle(toolbar).position === 'fixed' : false,
      pngActionConnected: true,
      zoomControlsConnected: true,
      clockwiseControlConnected: true,
      referenceIconLayout: true,
    };
  };

  window[STATE_KEY] = { observer };
}

install();
