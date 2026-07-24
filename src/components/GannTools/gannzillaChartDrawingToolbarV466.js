const BUILD = 466;
const TOOLBAR_ID = 'gannzilla-chart-drawing-toolbar-v466';
const DRAW_MENU_ID = 'gannzilla-chart-drawing-menu-v466';
const SELECT_MENU_ID = 'gannzilla-chart-selection-menu-v466';
const PASTE_MENU_ID = 'gannzilla-chart-paste-menu-v466';
const STYLE_ID = 'gannzilla-chart-drawing-toolbar-style-v466';
const STATE_KEY = '__gannzillaChartDrawingToolbarV466';
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = false) {
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

function findWheelCanvas() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && !preferred.closest?.('aside')) return preferred;

  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.closest?.('aside')) return false;
      const rect = canvas.getBoundingClientRect();
      const style = window.getComputedStyle(canvas);
      return canvas.width > 300 && canvas.height > 300
        && rect.width > 250 && rect.height > 250
        && style.display !== 'none' && style.visibility !== 'hidden';
    })
    .map((canvas) => ({ canvas, area: canvas.width * canvas.height }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;
}

function findWheelViewport(canvas = findWheelCanvas()) {
  if (!(canvas instanceof HTMLCanvasElement)) return null;
  let node = canvas.parentElement;
  while (node && node !== document.body) {
    if (node instanceof HTMLElement) {
      const style = window.getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      const clipped = /(auto|scroll|hidden)/.test(`${style.overflow} ${style.overflowX} ${style.overflowY}`);
      const positioned = style.position === 'absolute' || style.position === 'fixed';
      if ((clipped || positioned) && rect.width > 280 && rect.height > 180 && node.contains(canvas)) return node;
    }
    node = node.parentElement;
  }
  return canvas.parentElement instanceof HTMLElement ? canvas.parentElement : null;
}

function icon(name, size = 23) {
  const common = `width="${size}" height="${size}" viewBox="0 0 28 28" aria-hidden="true" focusable="false"`;
  const map = {
    drawing: `<svg ${common}><rect x="3.5" y="3.5" width="16" height="16" fill="none" stroke="#2480bd" stroke-width="1.4" stroke-dasharray="3 2"/><path d="M7 21 9 15 20 4l4 4-11 11Z" fill="#f2c34c" stroke="#72541e" stroke-width="1"/><path d="m20 4 4 4" stroke="#72541e" stroke-width="1.2"/><path d="m7 21-1 3 3-1" fill="#2f79aa"/></svg>`,
    triangle: `<svg ${common}><path d="M14 4 24 23H4Z" fill="none" stroke="#167abb" stroke-width="1.8"/></svg>`,
    roundRect: `<svg ${common}><rect x="4" y="7" width="20" height="15" rx="4" fill="none" stroke="#167abb" stroke-width="1.8"/></svg>`,
    rect: `<svg ${common}><rect x="4" y="6" width="20" height="17" fill="none" stroke="#167abb" stroke-width="1.8"/></svg>`,
    ellipse: `<svg ${common}><ellipse cx="14" cy="14" rx="10" ry="8" fill="none" stroke="#167abb" stroke-width="1.8"/></svg>`,
    line: `<svg ${common}><path d="M5 23 23 5" stroke="#173f60" stroke-width="1.9" stroke-linecap="round"/></svg>`,
    text: `<svg ${common}><text x="14" y="21" text-anchor="middle" font-family="Georgia,serif" font-size="21" font-weight="700" fill="#16344e">A</text></svg>`,
    fill: `<svg ${common}><path d="m6 15 9-9 7 7-9 9Z" fill="#d7eefb" stroke="#2c719c" stroke-width="1.2"/><path d="m10 11 7 7" stroke="#2c719c"/><path d="M6 24c0-2.5 2-4.5 4.5-4.5S15 21.5 15 24" fill="#5db3e5" stroke="#2c719c"/></svg>`,
    eraser: `<svg ${common}><path d="m7 20 9-13 7 5-9 13H8Z" fill="#f06d82" stroke="#994050" stroke-width="1.1"/><path d="m7 20 6 5" stroke="#994050"/></svg>`,
    select: `<svg ${common}><rect x="4" y="4" width="20" height="20" fill="none" stroke="#2585c9" stroke-width="1.8" stroke-dasharray="4 2"/></svg>`,
    paste: `<svg ${common}><rect x="7" y="5" width="15" height="20" rx="2" fill="#f7f7f7" stroke="#7e571f" stroke-width="1.2"/><path d="M11 5V3h8v2" fill="#f1c254" stroke="#7e571f"/><path d="M10 11h9M10 15h9M10 19h7" stroke="#b49e76"/></svg>`,
    undo: `<svg ${common}><path d="M12 7 6 13l6 6v-4c7-1 10 2 11 7 1-9-3-13-11-13Z" fill="#9db0c0" stroke="#728798"/></svg>`,
    redo: `<svg ${common}><path d="m16 7 6 6-6 6v-4c-7-1-10 2-11 7-1-9 3-13 11-13Z" fill="#22a6df" stroke="#177aa9"/></svg>`,
    pencil: `<svg ${common}><path d="M6 22 9 15 20 4l4 4-11 11Z" fill="#f3c34d" stroke="#72541e"/><path d="m20 4 4 4" stroke="#72541e"/><path d="m6 22-1 3 3-1" fill="#2f79aa"/></svg>`,
    arrow: `<svg ${common}><path d="M5 23 22 6M16 6h6v6" fill="none" stroke="#173f60" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
  return map[name] || map.drawing;
}

function caret() {
  return '<span class="gz466-caret" aria-hidden="true"></span>';
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${TOOLBAR_ID} {
      position: fixed !important;
      z-index: 2147483290 !important;
      height: 58px !important;
      min-height: 58px !important;
      max-height: 58px !important;
      display: flex !important;
      align-items: stretch !important;
      direction: ltr !important;
      overflow: hidden !important;
      border: 1px solid #d4d8db !important;
      background: linear-gradient(#ffffff,#f3f3f3) !important;
      box-shadow: 0 2px 5px rgba(0,0,0,.12) !important;
      font-family: Tahoma,"Segoe UI",Arial,sans-serif !important;
      box-sizing: border-box !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    #${TOOLBAR_ID}, #${TOOLBAR_ID} * { box-sizing: border-box !important; }
    #${TOOLBAR_ID} .gz466-group { flex: 0 0 auto !important; height: 100% !important; display: flex !important; align-items: center !important; gap: 2px !important; padding: 3px 5px !important; border-right: 1px solid #dadddf !important; }
    #${TOOLBAR_ID} button { margin: 0 !important; font-family: Tahoma,"Segoe UI",Arial,sans-serif !important; }
    #${TOOLBAR_ID} .gz466-main, #${TOOLBAR_ID} .gz466-split { height: 50px !important; border: 1px solid transparent !important; background: transparent !important; display: inline-flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; gap: 1px !important; color: #222 !important; cursor: pointer !important; padding: 2px 4px !important; font-size: 11px !important; font-weight: 700 !important; }
    #${TOOLBAR_ID} .gz466-main { width: 76px !important; min-width: 76px !important; }
    #${TOOLBAR_ID} .gz466-split { width: 55px !important; min-width: 55px !important; }
    #${TOOLBAR_ID} .gz466-main:hover, #${TOOLBAR_ID} .gz466-split:hover, #${TOOLBAR_ID} button[aria-expanded="true"] { background: #eaf4fd !important; border-color: #91bcdf !important; }
    #${TOOLBAR_ID} .gz466-main svg, #${TOOLBAR_ID} .gz466-split svg { width: 25px !important; height: 25px !important; }
    #${TOOLBAR_ID} .gz466-quick { min-width: 238px !important; }
    #${TOOLBAR_ID} .gz466-tool { width: 27px !important; min-width: 27px !important; height: 37px !important; padding: 1px !important; border: 1px solid transparent !important; background: transparent !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }
    #${TOOLBAR_ID} .gz466-tool:hover, #${TOOLBAR_ID} .gz466-tool[data-active="true"] { background: #e9f4fd !important; border-color: #98c2e2 !important; }
    #${TOOLBAR_ID} .gz466-tool svg { width: 22px !important; height: 22px !important; }
    #${TOOLBAR_ID} .gz466-history { width: 64px !important; min-width: 64px !important; justify-content: center !important; }
    #${TOOLBAR_ID} .gz466-history button { width: 27px !important; height: 37px !important; border: 1px solid transparent !important; background: transparent !important; padding: 1px !important; cursor: pointer !important; }
    #${TOOLBAR_ID} .gz466-history button:hover { background: #e9f4fd !important; border-color: #98c2e2 !important; }
    #${TOOLBAR_ID} .gz466-history svg { width: 22px !important; height: 22px !important; }
    #${TOOLBAR_ID} .gz466-caret { width: 0 !important; height: 0 !important; border-left: 3px solid transparent !important; border-right: 3px solid transparent !important; border-top: 4px solid #333 !important; }
    #${TOOLBAR_ID}[data-compact="true"] .gz466-main { width: 58px !important; min-width: 58px !important; font-size: 9px !important; }
    #${TOOLBAR_ID}[data-compact="true"] .gz466-quick { min-width: 192px !important; }
    #${TOOLBAR_ID}[data-compact="true"] .gz466-tool { width: 22px !important; min-width: 22px !important; }
    #${TOOLBAR_ID}[data-compact="true"] .gz466-split { width: 44px !important; min-width: 44px !important; font-size: 9px !important; }
    #${TOOLBAR_ID}[data-compact="true"] .gz466-history { width: 52px !important; min-width: 52px !important; }

    .gz466-menu { position: fixed !important; z-index: 2147483647 !important; min-width: 190px !important; background: #fff !important; border: 1px solid #a8aeb3 !important; box-shadow: 0 5px 15px rgba(0,0,0,.22) !important; direction: rtl !important; font-family: Tahoma,"Segoe UI",Arial,sans-serif !important; overflow: hidden !important; }
    .gz466-menu[hidden] { display: none !important; }
    .gz466-menu button { width: 100% !important; height: 34px !important; padding: 0 9px !important; border: 0 !important; border-bottom: 1px solid #ececec !important; background: #fff !important; display: grid !important; grid-template-columns: 1fr 30px !important; align-items: center !important; gap: 7px !important; text-align: right !important; cursor: pointer !important; font: 500 13px Tahoma,"Segoe UI",Arial,sans-serif !important; }
    .gz466-menu button:hover { background: #edf6ff !important; }
    .gz466-menu button svg { width: 23px !important; height: 23px !important; }
  `;
}

let openMenuId = null;
let activeTool = 'hand';

function closeMenus() {
  [DRAW_MENU_ID, SELECT_MENU_ID, PASTE_MENU_ID].forEach((id) => {
    const menu = document.getElementById(id);
    if (menu instanceof HTMLElement) menu.hidden = true;
  });
  document.querySelectorAll(`#${TOOLBAR_ID} [aria-expanded]`).forEach((node) => node.setAttribute('aria-expanded', 'false'));
  openMenuId = null;
}

function positionMenu(menu, trigger) {
  if (!(menu instanceof HTMLElement) || !(trigger instanceof HTMLElement) || menu.hidden) return;
  const rect = trigger.getBoundingClientRect();
  const width = menu.getBoundingClientRect().width || 210;
  const left = Math.max(6, Math.min(window.innerWidth - width - 6, Math.round(rect.left)));
  const top = Math.round(rect.bottom + 3);
  menu.style.setProperty('left', `${left}px`, 'important');
  menu.style.setProperty('top', `${top}px`, 'important');
}

function toggleMenu(id, trigger) {
  const reopening = openMenuId !== id;
  closeMenus();
  if (!reopening) return;
  const menu = document.getElementById(id);
  if (!(menu instanceof HTMLElement)) return;
  menu.hidden = false;
  openMenuId = id;
  trigger.setAttribute('aria-expanded', 'true');
  positionMenu(menu, trigger);
}

function menuRow(label, iconName, action) {
  const button = document.createElement('button');
  button.type = 'button';
  button.innerHTML = `<span>${label}</span>${icon(iconName, 23)}`;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    activeTool = action;
    document.querySelectorAll(`#${TOOLBAR_ID} [data-tool]`).forEach((node) => {
      node.dataset.active = node.dataset.tool === activeTool ? 'true' : 'false';
    });
    closeMenus();
  });
  return button;
}

function createMenu(id, rows) {
  const menu = document.createElement('div');
  menu.id = id;
  menu.className = 'gz466-menu gannzilla-chart-toolbar-v328';
  menu.hidden = true;
  menu.setAttribute('data-gannzilla-control-strip', 'true');
  rows.forEach(([label, iconName, action]) => menu.appendChild(menuRow(label, iconName, action)));
  document.body.appendChild(menu);
  return menu;
}

function quickButton(tool, title, iconName) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'gz466-tool';
  button.title = title;
  button.setAttribute('aria-label', title);
  button.dataset.tool = tool;
  button.innerHTML = icon(iconName, 23);
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    activeTool = tool;
    document.querySelectorAll(`#${TOOLBAR_ID} [data-tool]`).forEach((node) => {
      node.dataset.active = node.dataset.tool === activeTool ? 'true' : 'false';
    });
  });
  return button;
}

function createToolbar() {
  const toolbar = document.createElement('div');
  toolbar.id = TOOLBAR_ID;
  toolbar.className = 'gannzilla-chart-toolbar-v328';
  toolbar.setAttribute('data-gannzilla-control-strip', 'true');
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'موضع أدوات الرسم فوق المخطط');

  const mainGroup = document.createElement('div');
  mainGroup.className = 'gz466-group';
  const main = document.createElement('button');
  main.type = 'button';
  main.className = 'gz466-main';
  main.innerHTML = `${icon('drawing', 25)}<span>أدوات الرسم</span>${caret()}`;
  main.setAttribute('aria-expanded', 'false');
  main.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); toggleMenu(DRAW_MENU_ID, main); });
  mainGroup.appendChild(main);

  const quick = document.createElement('div');
  quick.className = 'gz466-group gz466-quick';
  quick.append(
    quickButton('triangle', 'مثلث', 'triangle'),
    quickButton('roundRect', 'مستطيل مستدير', 'roundRect'),
    quickButton('rect', 'مستطيل', 'rect'),
    quickButton('ellipse', 'دائرة', 'ellipse'),
    quickButton('line', 'خط', 'line'),
    quickButton('text', 'نص', 'text'),
    quickButton('fill', 'تعبئة', 'fill'),
    quickButton('eraser', 'ممحاة', 'eraser'),
  );

  const selectGroup = document.createElement('div');
  selectGroup.className = 'gz466-group';
  const select = document.createElement('button');
  select.type = 'button';
  select.className = 'gz466-split';
  select.innerHTML = `${icon('select', 25)}<span>تحديد</span>${caret()}`;
  select.setAttribute('aria-expanded', 'false');
  select.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); toggleMenu(SELECT_MENU_ID, select); });
  selectGroup.appendChild(select);

  const pasteGroup = document.createElement('div');
  pasteGroup.className = 'gz466-group';
  const paste = document.createElement('button');
  paste.type = 'button';
  paste.className = 'gz466-split';
  paste.innerHTML = `${icon('paste', 25)}<span>لصق</span>${caret()}`;
  paste.setAttribute('aria-expanded', 'false');
  paste.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); toggleMenu(PASTE_MENU_ID, paste); });
  pasteGroup.appendChild(paste);

  const history = document.createElement('div');
  history.className = 'gz466-group gz466-history';
  const undo = document.createElement('button');
  undo.type = 'button';
  undo.title = 'تراجع';
  undo.innerHTML = icon('undo', 23);
  const redo = document.createElement('button');
  redo.type = 'button';
  redo.title = 'إعادة';
  redo.innerHTML = icon('redo', 23);
  history.append(undo, redo);

  toolbar.append(mainGroup, quick, selectGroup, pasteGroup, history);
  document.body.appendChild(toolbar);
  return toolbar;
}

function ensureUi() {
  installStyle();
  let toolbar = document.getElementById(TOOLBAR_ID);
  if (!(toolbar instanceof HTMLElement)) toolbar = createToolbar();
  if (!document.getElementById(DRAW_MENU_ID)) createMenu(DRAW_MENU_ID, [
    ['قلم', 'pencil', 'pencil'],
    ['خط', 'line', 'line'],
    ['سهم', 'arrow', 'arrow'],
    ['مستطيل', 'rect', 'rect'],
    ['دائرة', 'ellipse', 'ellipse'],
    ['نص', 'text', 'text'],
    ['تعبئة', 'fill', 'fill'],
    ['ممحاة', 'eraser', 'eraser'],
  ]);
  if (!document.getElementById(SELECT_MENU_ID)) createMenu(SELECT_MENU_ID, [
    ['تحديد مستطيلي', 'select', 'selectRect'],
    ['تحديد حر', 'select', 'selectFree'],
    ['تحديد الكل', 'select', 'selectAll'],
    ['إلغاء التحديد', 'select', 'selectNone'],
  ]);
  if (!document.getElementById(PASTE_MENU_ID)) createMenu(PASTE_MENU_ID, [
    ['لصق', 'paste', 'paste'],
    ['لصق من ملف', 'paste', 'pasteFile'],
  ]);
  return toolbar;
}

function positionToolbar() {
  const toolbar = ensureUi();
  const canvas = findWheelCanvas();
  const viewport = findWheelViewport(canvas);
  const panel = document.getElementById(PANEL_ID);
  if (!(toolbar instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement)) return false;

  const canvasRect = canvas.getBoundingClientRect();
  const viewportRect = viewport instanceof HTMLElement ? viewport.getBoundingClientRect() : canvasRect;
  const panelRect = panel instanceof HTMLElement && window.getComputedStyle(panel).display !== 'none'
    ? panel.getBoundingClientRect()
    : null;

  const height = Math.round(numberParam('chartDrawingToolbarHeight', 58, 48, 74));
  const gap = Math.round(numberParam('chartDrawingToolbarGap', 4, 0, 16));
  const requestedWidth = Math.round(numberParam('chartDrawingToolbarWidth', 620, 360, 900));

  const leftBoundary = panelRect && panelRect.width > 20
    ? Math.round(panelRect.right + gap)
    : Math.round(Math.max(4, viewportRect.left));
  const rightBoundary = Math.round(Math.min(window.innerWidth - 4, viewportRect.right > leftBoundary ? viewportRect.right : window.innerWidth - 4));
  const availableWidth = Math.max(280, rightBoundary - leftBoundary);
  const width = Math.min(requestedWidth, availableWidth);
  const topAnchor = panelRect?.top > 40 ? panelRect.top : Math.max(canvasRect.top, viewportRect.top);
  const top = Math.max(28, Math.round(topAnchor - height - gap));

  toolbar.style.setProperty('left', `${leftBoundary}px`, 'important');
  toolbar.style.setProperty('top', `${top}px`, 'important');
  toolbar.style.setProperty('width', `${width}px`, 'important');
  toolbar.style.setProperty('min-width', `${width}px`, 'important');
  toolbar.style.setProperty('max-width', `${width}px`, 'important');
  toolbar.style.setProperty('height', `${height}px`, 'important');
  toolbar.style.setProperty('min-height', `${height}px`, 'important');
  toolbar.style.setProperty('max-height', `${height}px`, 'important');
  toolbar.dataset.compact = width < 560 ? 'true' : 'false';
  toolbar.dataset.gannzillaChartPositionedV466 = 'true';
  toolbar.dataset.chartLeft = String(leftBoundary);
  toolbar.dataset.chartRight = String(rightBoundary);
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showChartDrawingToolbar', false) || window[STATE_KEY]) return;

  let frame = 0;
  let panelObserver = null;
  let viewportObserver = null;

  const schedule = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      positionToolbar();
      const panel = document.getElementById(PANEL_ID);
      if (panel instanceof HTMLElement && !panelObserver && typeof ResizeObserver === 'function') {
        panelObserver = new ResizeObserver(schedule);
        panelObserver.observe(panel);
      }
      const viewport = findWheelViewport();
      if (viewport instanceof HTMLElement && !viewportObserver && typeof ResizeObserver === 'function') {
        viewportObserver = new ResizeObserver(schedule);
        viewportObserver.observe(viewport);
      }
    });
  };

  schedule();
  const timers = [40, 120, 300, 700, 1500, 3000, 5000].map((delay) => window.setTimeout(schedule, delay));

  const onDocumentClick = (event) => {
    if (!openMenuId) return;
    const menu = document.getElementById(openMenuId);
    const toolbar = document.getElementById(TOOLBAR_ID);
    if (menu?.contains(event.target) || toolbar?.contains(event.target)) return;
    closeMenus();
  };
  const onKeyDown = (event) => { if (event.key === 'Escape') closeMenus(); };

  document.addEventListener('click', onDocumentClick, true);
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', schedule);
  window.addEventListener('scroll', schedule, true);
  document.addEventListener('fullscreenchange', schedule);
  window.addEventListener('gannzilla:layout-panel-visibility-change', schedule);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', schedule);
  window.addEventListener('gannzilla:unified-wheel-tools-v453', schedule);

  window.GANNZILLA_CHART_DRAWING_TOOLBAR_V466 = true;
  window.__auditGannzillaChartDrawingToolbarV466 = () => {
    const toolbar = document.getElementById(TOOLBAR_ID);
    const rect = toolbar?.getBoundingClientRect();
    const panel = document.getElementById(PANEL_ID);
    const panelRect = panel?.getBoundingClientRect();
    return {
      ok: Boolean(toolbar && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      positionOnlyStage: true,
      eyeLinked: false,
      leftOfChartOnly: panelRect ? rect.left >= panelRect.right : true,
      widthPx: rect ? Math.round(rect.width) : null,
      compact: toolbar?.dataset?.compact === 'true',
    };
  };

  window[STATE_KEY] = { timers, schedule, onDocumentClick, onKeyDown, get panelObserver() { return panelObserver; }, get viewportObserver() { return viewportObserver; } };
}

install();
