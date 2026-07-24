const BUILD = 463;
const WHEEL_TOOLBAR_ID = 'gannzilla-unified-wheel-tools-v453';
const STRIP_ID = 'gannzilla-compact-drawing-tools-v463';
const DRAW_TRIGGER_ID = 'gannzilla-drawing-tools-trigger-v463';
const DRAW_MENU_ID = 'gannzilla-drawing-tools-menu-v463';
const SELECT_TRIGGER_ID = 'gannzilla-selection-trigger-v463';
const SELECT_MENU_ID = 'gannzilla-selection-menu-v463';
const PASTE_TRIGGER_ID = 'gannzilla-paste-trigger-v463';
const PASTE_MENU_ID = 'gannzilla-paste-menu-v463';
const THICKNESS_MENU_ID = 'gannzilla-thickness-menu-v463';
const COLOR_MENU_ID = 'gannzilla-color-menu-v463';
const OVERLAY_ID = 'gannzilla-compact-drawing-overlay-v463';
const FILE_INPUT_ID = 'gannzilla-compact-drawing-file-v463';
const STYLE_ID = 'gannzilla-compact-drawing-style-v463';
const STATE_KEY = '__gannzillaCompactDrawingToolsV463';
const DRAWINGS_KEY = 'tasi-gannzilla-compact-drawings-v463';
const PREFS_KEY = 'tasi-gannzilla-compact-drawing-prefs-v463';
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';

const PALETTE = Object.freeze([
  '#000000', '#404040', '#7f7f7f', '#c0c0c0', '#ffffff',
  '#b71c1c', '#e53935', '#ff6f00', '#f9a825', '#fdd835',
  '#7cb342', '#2eae49', '#00897b', '#00acc1', '#1976d2',
  '#0d47a1', '#5e35b1', '#8e24aa', '#d81b60', '#f48fb1',
]);

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
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

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value == null ? fallback : value;
  } catch (_) {
    return fallback;
  }
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function uid() { return `gz463-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

const savedPrefs = readJson(PREFS_KEY, {});
let drawings = Array.isArray(readJson(DRAWINGS_KEY, [])) ? readJson(DRAWINGS_KEY, []) : [];
let activeTool = typeof savedPrefs.activeTool === 'string' ? savedPrefs.activeTool : 'hand';
let primaryColor = typeof savedPrefs.primaryColor === 'string' ? savedPrefs.primaryColor : '#000000';
let lineWidth = Number.isFinite(Number(savedPrefs.lineWidth)) ? Number(savedPrefs.lineWidth) : 4;
let transparentSelection = savedPrefs.transparentSelection === true;
let selectedIds = new Set();
let undoStack = [];
let redoStack = [];
let currentObject = null;
let currentPointerId = null;
let selectionDraft = null;
let selectionMove = null;
let openMenu = null;
let observedWheelCanvas = null;
let wheelResizeObserver = null;
let rootResizeObserver = null;
let layoutFrame = 0;
let overlayFrame = 0;
let lastAction = null;
let actionCount = 0;
const imageCache = new Map();
const originalLayout = new Map();

function persist() {
  try { localStorage.setItem(DRAWINGS_KEY, JSON.stringify(drawings)); } catch (_) { /* runtime only */ }
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({
      activeTool,
      primaryColor,
      lineWidth,
      transparentSelection,
    }));
  } catch (_) { /* runtime only */ }
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
      const positioned = style.position === 'absolute' || style.position === 'fixed';
      const clipped = /(auto|scroll|hidden)/.test(`${style.overflow} ${style.overflowX} ${style.overflowY}`);
      if ((positioned || clipped) && rect.width > 280 && rect.height > 180 && node.contains(canvas)) return node;
    }
    node = node.parentElement;
  }
  return canvas.parentElement?.parentElement instanceof HTMLElement
    ? canvas.parentElement.parentElement
    : canvas.parentElement;
}

function rememberStyle(node, properties) {
  if (!(node instanceof HTMLElement) || originalLayout.has(node)) return;
  const saved = {};
  properties.forEach((property) => {
    saved[property] = {
      value: node.style.getPropertyValue(property),
      priority: node.style.getPropertyPriority(property),
    };
  });
  originalLayout.set(node, saved);
}

function restoreLayout() {
  originalLayout.forEach((saved, node) => {
    if (!(node instanceof HTMLElement)) return;
    Object.entries(saved).forEach(([property, detail]) => {
      if (detail.value) node.style.setProperty(property, detail.value, detail.priority || '');
      else node.style.removeProperty(property);
    });
  });
  originalLayout.clear();
}

function applyWorkspaceOffset(bottom) {
  const panel = document.getElementById(PANEL_ID);
  if (panel instanceof HTMLElement && window.getComputedStyle(panel).display !== 'none') {
    rememberStyle(panel, ['top', 'height']);
    panel.style.setProperty('top', `${bottom}px`, 'important');
    panel.style.setProperty('height', `calc(100vh - ${bottom}px)`, 'important');
  }

  const viewport = findWheelViewport();
  if (viewport instanceof HTMLElement) {
    rememberStyle(viewport, ['top']);
    viewport.style.setProperty('top', `${bottom}px`, 'important');
  }
}

function icon(name, size = 34) {
  const common = `width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true" focusable="false"`;
  const map = {
    drawing: `<svg ${common}><rect x="4" y="4" width="20" height="20" fill="none" stroke="#2178bd" stroke-width="1.8" stroke-dasharray="3 2"/><path d="M8 23 10.5 16 22 4.5l4.5 4.5L15 20.5Z" fill="#f4c34e" stroke="#6f5420" stroke-width="1.2"/><path d="m22 4.5 4.5 4.5" stroke="#6f5420" stroke-width="1.4"/><path d="M8 23 7 27l4-1 4-5.5" fill="#2d78b6" stroke="#345e80" stroke-width="1.1"/></svg>`,
    triangle: `<svg ${common}><path d="M16 5 27 26H5Z" fill="none" stroke="#1479bd" stroke-width="2"/></svg>`,
    roundRect: `<svg ${common}><rect x="5" y="8" width="22" height="16" rx="5" fill="none" stroke="#1479bd" stroke-width="2"/></svg>`,
    rect: `<svg ${common}><rect x="5" y="7" width="22" height="18" fill="none" stroke="#1479bd" stroke-width="2"/></svg>`,
    ellipse: `<svg ${common}><ellipse cx="16" cy="16" rx="11" ry="9" fill="none" stroke="#1479bd" stroke-width="2"/></svg>`,
    line: `<svg ${common}><path d="M6 26 26 6" stroke="#173f60" stroke-width="2.3" stroke-linecap="round"/></svg>`,
    arrow: `<svg ${common}><path d="M6 26 25 7M18 7h7v7" fill="none" stroke="#173f60" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    text: `<svg ${common}><text x="16" y="25" text-anchor="middle" font-family="Georgia,serif" font-size="25" font-weight="700" fill="#142f4c">A</text></svg>`,
    fill: `<svg ${common}><path d="m8 17 10-10 8 8-10 10Z" fill="#d8eefb" stroke="#286f9e" stroke-width="1.4"/><path d="m13 12 8 8" stroke="#286f9e" stroke-width="1.2"/><path d="M8 26c0-3 2.2-5.5 5-5.5S18 23 18 26" fill="#55aee4" stroke="#286f9e" stroke-width="1.2"/></svg>`,
    eraser: `<svg ${common}><path d="m8 22 10-14 8 6-10 14H9Z" fill="#f26d83" stroke="#9a4050" stroke-width="1.2"/><path d="m8 22 7 6" stroke="#9a4050" stroke-width="1.2"/></svg>`,
    pencil: `<svg ${common}><path d="M7 25 10 17 23 4l5 5-13 13Z" fill="#f5c54c" stroke="#6f5420" stroke-width="1.2"/><path d="m23 4 5 5" stroke="#6f5420" stroke-width="1.4"/><path d="m7 25-1 3 3-1" fill="#1e5b89"/></svg>`,
    selectRect: `<svg ${common}><rect x="5" y="5" width="22" height="22" fill="none" stroke="#2585c9" stroke-width="2" stroke-dasharray="4 2"/></svg>`,
    selectFree: `<svg ${common}><path d="M8 7c6-4 13 0 14 6 1 5 6 7 2 12-4 4-10 0-14 1-5 1-7-5-4-9 2-3-2-6 2-10Z" fill="none" stroke="#2585c9" stroke-width="2" stroke-dasharray="4 2"/></svg>`,
    selectAll: `<svg ${common}><rect x="6" y="6" width="20" height="20" fill="none" stroke="#2585c9" stroke-width="1.6" stroke-dasharray="3 2"/><rect x="10" y="10" width="12" height="12" fill="#d8eefb" stroke="#2585c9" stroke-width="1.5"/></svg>`,
    invert: `<svg ${common}><rect x="6" y="6" width="17" height="17" fill="none" stroke="#7894a8" stroke-width="1.6" stroke-dasharray="3 2"/><path d="M22 18v8m-4-4h8" stroke="#2585c9" stroke-width="2"/></svg>`,
    delete: `<svg ${common}><path d="M8 8 24 24M24 8 8 24" stroke="#8b9aab" stroke-width="3" stroke-linecap="round"/></svg>`,
    transparent: `<svg ${common}><rect x="6" y="6" width="20" height="20" fill="url(#checker463)" stroke="#2585c9" stroke-width="1.5"/><defs><pattern id="checker463" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/><rect width="3" height="3" fill="#d9e3ea"/><rect x="3" y="3" width="3" height="3" fill="#d9e3ea"/></pattern></defs></svg>`,
    paste: `<svg ${common}><rect x="8" y="6" width="17" height="22" rx="2" fill="#f4f4f4" stroke="#80571f" stroke-width="1.5"/><path d="M12 6V4h9v2" fill="#f2c55c" stroke="#80571f" stroke-width="1.4"/><path d="M12 12h9M12 17h9M12 22h7" stroke="#b6a17a" stroke-width="1.2"/></svg>`,
    pasteFile: `<svg ${common}><path d="M7 5h13l5 5v17H7Z" fill="#eef5fb" stroke="#55738a" stroke-width="1.3"/><path d="M20 5v6h6" fill="#d4e8f7"/><rect x="14" y="19" width="13" height="9" rx="1" fill="#4fa5dc" stroke="#286f9e"/><path d="M20.5 17v8m-3-3 3 3 3-3" fill="none" stroke="#fff" stroke-width="1.6"/></svg>`,
    undo: `<svg ${common}><path d="M13 9 7 15l6 6v-4c8-1 12 2 13 8 1-10-4-15-13-14Z" fill="#9eb2c2" stroke="#71879a" stroke-width="1.1"/></svg>`,
    redo: `<svg ${common}><path d="m19 9 6 6-6 6v-4c-8-1-12 2-13 8-1-10 4-15 13-14Z" fill="#21a7e0" stroke="#167bac" stroke-width="1.1"/></svg>`,
    color: `<svg ${common}><circle cx="16" cy="16" r="12" fill="#fff" stroke="#737373"/><circle cx="16" cy="8" r="4" fill="#e53935"/><circle cx="23" cy="13" r="4" fill="#f9a825"/><circle cx="21" cy="22" r="4" fill="#2eae49"/><circle cx="11" cy="23" r="4" fill="#1976d2"/><circle cx="8" cy="13" r="4" fill="#8e24aa"/></svg>`,
  };
  return map[name] || map.drawing;
}

function menuArrow() { return '<span class="gz463-caret" aria-hidden="true"></span>'; }

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  const height = Math.round(numberParam('compactDrawingToolbarHeight', 96, 78, 118));
  style.textContent = `
    #${STRIP_ID} {
      position: fixed !important; height: ${height}px !important; min-height:${height}px !important; max-height:${height}px !important;
      z-index:2147483290 !important; display:flex !important; align-items:stretch !important; direction:ltr !important;
      background:linear-gradient(#ffffff,#f4f4f4) !important; border:1px solid #d3d8dc !important;
      box-shadow:0 2px 5px rgba(0,0,0,.14) !important; overflow-x:auto !important; overflow-y:hidden !important;
      font-family:Tahoma,"Segoe UI",Arial,sans-serif !important; color:#222 !important; box-sizing:border-box !important;
      scrollbar-width:thin !important;
    }
    #${STRIP_ID}, #${STRIP_ID} * { box-sizing:border-box !important; }
    #${STRIP_ID} button { font-family:Tahoma,"Segoe UI",Arial,sans-serif !important; }
    #${STRIP_ID} .gz463-group { flex:0 0 auto !important; height:100% !important; display:flex !important; align-items:center !important; gap:4px !important; padding:4px 8px !important; border-right:1px solid #d9dde0 !important; }
    #${STRIP_ID} .gz463-main, #${STRIP_ID} .gz463-split {
      border:1px solid transparent !important; background:transparent !important; color:#202020 !important; cursor:pointer !important;
      display:flex !important; flex-direction:column !important; align-items:center !important; justify-content:center !important;
      padding:4px !important; margin:0 !important; user-select:none !important; touch-action:manipulation !important;
    }
    #${STRIP_ID} .gz463-main { width:112px !important; min-width:112px !important; height:86px !important; gap:3px !important; font-size:15px !important; font-weight:700 !important; }
    #${STRIP_ID} .gz463-main svg { width:42px !important; height:42px !important; }
    #${STRIP_ID} .gz463-main:hover, #${STRIP_ID} .gz463-main[aria-expanded="true"],
    #${STRIP_ID} .gz463-split:hover, #${STRIP_ID} .gz463-split[aria-expanded="true"] { background:#eaf4fd !important; border-color:#93bde0 !important; }
    #${STRIP_ID} .gz463-caret { width:0 !important; height:0 !important; border-left:4px solid transparent !important; border-right:4px solid transparent !important; border-top:5px solid #333 !important; }
    #${STRIP_ID} .gz463-quick { min-width:330px !important; }
    #${STRIP_ID} .gz463-quick-button { width:38px !important; min-width:38px !important; height:58px !important; border:1px solid transparent !important; background:transparent !important; padding:2px !important; cursor:pointer !important; display:flex !important; align-items:center !important; justify-content:center !important; }
    #${STRIP_ID} .gz463-quick-button svg { width:31px !important; height:31px !important; }
    #${STRIP_ID} .gz463-quick-button:hover { background:#edf6fe !important; border-color:#a5c9e7 !important; }
    #${STRIP_ID} .gz463-quick-button[data-active="true"] { background:#d8edfc !important; border-color:#4b9ade !important; box-shadow:inset 0 0 0 1px #fff !important; }
    #${STRIP_ID} .gz463-split { width:82px !important; min-width:82px !important; height:86px !important; font-size:15px !important; font-weight:700 !important; gap:2px !important; }
    #${STRIP_ID} .gz463-split svg { width:43px !important; height:43px !important; }
    #${STRIP_ID} .gz463-history { width:84px !important; min-width:84px !important; justify-content:center !important; }
    #${STRIP_ID} .gz463-history button { width:36px !important; height:48px !important; border:1px solid transparent !important; background:transparent !important; padding:1px !important; cursor:pointer !important; }
    #${STRIP_ID} .gz463-history button:hover { background:#edf6fe !important; border-color:#a5c9e7 !important; }
    #${STRIP_ID} .gz463-history button:disabled { opacity:.38 !important; cursor:default !important; }
    #${STRIP_ID} .gz463-history svg { width:31px !important; height:31px !important; }

    .gz463-menu {
      position:fixed !important; z-index:2147483647 !important; background:#fff !important; border:1px solid #a8aeb3 !important;
      box-shadow:0 5px 16px rgba(0,0,0,.23) !important; direction:rtl !important; text-align:right !important;
      font-family:Tahoma,"Segoe UI",Arial,sans-serif !important; color:#222 !important; overflow:hidden !important;
    }
    .gz463-menu[hidden] { display:none !important; }
    .gz463-menu .gz463-title { height:38px !important; display:flex !important; align-items:center !important; justify-content:center !important; padding:0 12px !important; background:linear-gradient(#fafafa,#ececec) !important; border-bottom:1px solid #d0d0d0 !important; font-size:16px !important; font-weight:700 !important; }
    .gz463-menu .gz463-section { height:34px !important; display:flex !important; align-items:center !important; justify-content:flex-end !important; padding:0 12px !important; background:#f4f4f4 !important; border-top:1px solid #ddd !important; border-bottom:1px solid #ddd !important; color:#666 !important; font-size:14px !important; font-weight:700 !important; }
    .gz463-menu .gz463-row { width:100% !important; min-height:42px !important; display:grid !important; grid-template-columns:minmax(0,1fr) 38px !important; align-items:center !important; gap:8px !important; padding:3px 10px !important; border:0 !important; border-bottom:1px solid #e7e7e7 !important; background:#fff !important; color:#222 !important; cursor:pointer !important; font-size:16px !important; font-weight:500 !important; text-align:right !important; }
    .gz463-menu .gz463-row:hover { background:#eef6ff !important; }
    .gz463-menu .gz463-row[data-active="true"] { background:#d9edff !important; color:#0c4f86 !important; }
    .gz463-menu .gz463-row:disabled { opacity:.42 !important; cursor:default !important; }
    .gz463-menu .gz463-row svg { width:29px !important; height:29px !important; }
    .gz463-menu .gz463-subarrow { font-size:18px !important; color:#555 !important; }
    #${DRAW_MENU_ID} { width:285px !important; }
    #${SELECT_MENU_ID} { width:330px !important; }
    #${PASTE_MENU_ID} { width:210px !important; }
    #${THICKNESS_MENU_ID} { width:190px !important; padding:6px !important; }
    #${THICKNESS_MENU_ID} .gz463-width-row { height:38px !important; display:flex !important; align-items:center !important; justify-content:center !important; gap:10px !important; border-bottom:1px solid #eee !important; cursor:pointer !important; }
    #${THICKNESS_MENU_ID} .gz463-width-row:hover { background:#eef6ff !important; }
    #${THICKNESS_MENU_ID} .gz463-width-line { width:105px !important; background:#234d70 !important; }
    #${COLOR_MENU_ID} { width:270px !important; padding:10px !important; }
    #${COLOR_MENU_ID} .gz463-palette { display:grid !important; grid-template-columns:repeat(5,42px) !important; gap:7px !important; justify-content:center !important; }
    #${COLOR_MENU_ID} .gz463-color { width:42px !important; height:34px !important; border:1px solid #777 !important; cursor:pointer !important; }
    #${COLOR_MENU_ID} .gz463-current { height:42px !important; display:flex !important; align-items:center !important; justify-content:space-between !important; margin-bottom:9px !important; font-size:15px !important; }
    #${COLOR_MENU_ID} .gz463-current-chip { width:44px !important; height:32px !important; border:1px solid #555 !important; }
    #${COLOR_MENU_ID} input[type="color"] { width:54px !important; height:34px !important; padding:0 !important; border:1px solid #777 !important; }
    #${OVERLAY_ID} { position:fixed !important; z-index:2147482400 !important; margin:0 !important; padding:0 !important; border:0 !important; background:transparent !important; touch-action:none !important; user-select:none !important; }
  `;
}

function makeButton(className, title, html) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.title = title;
  button.setAttribute('aria-label', title);
  button.innerHTML = html;
  return button;
}

function toolQuickButton(tool, title, iconName) {
  const button = makeButton('gz463-quick-button', title, icon(iconName, 32));
  button.dataset.tool = tool;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveTool(tool, `quick:${tool}`);
  });
  return button;
}

function row(label, iconName, action, options = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'gz463-row';
  button.dataset.action = action;
  if (options.tool) button.dataset.tool = options.tool;
  button.innerHTML = `<span>${label}${options.submenu ? '<span class="gz463-subarrow"> ◀</span>' : ''}</span><span>${icon(iconName, 29)}</span>`;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    options.onClick?.(button);
  });
  return button;
}

function createDrawingMenu() {
  const menu = document.createElement('div');
  menu.id = DRAW_MENU_ID;
  menu.className = 'gz463-menu gannzilla-chart-toolbar-v328';
  menu.hidden = true;
  menu.setAttribute('data-gannzilla-control-strip', 'true');
  menu.innerHTML = '<div class="gz463-title">أدوات الرسم</div>';
  const items = [
    ['قلم', 'pencil', 'pencil'],
    ['خط', 'line', 'line'],
    ['سهم', 'arrow', 'arrow'],
    ['مستطيل', 'rect', 'rect'],
    ['دائرة', 'ellipse', 'ellipse'],
    ['نص', 'text', 'text'],
    ['تعبئة', 'fill', 'fill'],
    ['ممحاة', 'eraser', 'eraser'],
  ];
  items.forEach(([label, tool, iconName]) => {
    menu.appendChild(row(label, iconName, `tool:${tool}`, {
      tool,
      onClick: () => { setActiveTool(tool, `menu:${tool}`); closeMenus(); },
    }));
  });
  menu.appendChild(row('سماكة الخط', 'line', 'thickness', {
    submenu: true,
    onClick: (button) => openSubmenu(THICKNESS_MENU_ID, button),
  }));
  menu.appendChild(row('اللون', 'color', 'color', {
    submenu: true,
    onClick: (button) => openSubmenu(COLOR_MENU_ID, button),
  }));
  document.body.appendChild(menu);
  return menu;
}

function createSelectionMenu() {
  const menu = document.createElement('div');
  menu.id = SELECT_MENU_ID;
  menu.className = 'gz463-menu gannzilla-chart-toolbar-v328';
  menu.hidden = true;
  menu.setAttribute('data-gannzilla-control-strip', 'true');
  menu.innerHTML = '<div class="gz463-title">أشكال التحديد</div>';
  menu.append(
    row('تحديد مستطيلي الشكل', 'selectRect', 'selectRect', { tool: 'selectRect', onClick: () => { setActiveTool('selectRect', 'selection-menu'); closeMenus(); } }),
    row('تحديد شكل حر', 'selectFree', 'selectFree', { tool: 'selectFree', onClick: () => { setActiveTool('selectFree', 'selection-menu'); closeMenus(); } }),
  );
  const section = document.createElement('div');
  section.className = 'gz463-section';
  section.textContent = 'خيارات التحديد';
  menu.appendChild(section);
  menu.append(
    row('تحديد الكل', 'selectAll', 'selectAll', { onClick: () => { selectAll(); closeMenus(); } }),
    row('عكس التحديد', 'invert', 'invert', { onClick: () => { invertSelection(); closeMenus(); } }),
    row('حذف', 'delete', 'delete', { onClick: () => { deleteSelected(); closeMenus(); } }),
    row('تحديد شفاف', 'transparent', 'transparent', { onClick: (button) => { transparentSelection = !transparentSelection; persist(); button.dataset.active = transparentSelection ? 'true' : 'false'; scheduleOverlay(); updateUi(); } }),
  );
  document.body.appendChild(menu);
  return menu;
}

function createPasteMenu() {
  const menu = document.createElement('div');
  menu.id = PASTE_MENU_ID;
  menu.className = 'gz463-menu gannzilla-chart-toolbar-v328';
  menu.hidden = true;
  menu.setAttribute('data-gannzilla-control-strip', 'true');
  menu.append(
    row('لصق', 'paste', 'paste', { onClick: () => { pasteClipboard(); closeMenus(); } }),
    row('لصق من ملف', 'pasteFile', 'pasteFile', { onClick: () => { document.getElementById(FILE_INPUT_ID)?.click(); closeMenus(); } }),
  );
  document.body.appendChild(menu);
  return menu;
}

function createThicknessMenu() {
  const menu = document.createElement('div');
  menu.id = THICKNESS_MENU_ID;
  menu.className = 'gz463-menu gannzilla-chart-toolbar-v328';
  menu.hidden = true;
  menu.setAttribute('data-gannzilla-control-strip', 'true');
  [1, 2, 4, 6, 10, 14].forEach((width) => {
    const item = document.createElement('div');
    item.className = 'gz463-width-row';
    item.dataset.width = String(width);
    item.innerHTML = `<span>${width}</span><span class="gz463-width-line" style="height:${Math.max(1, width / 2)}px"></span>`;
    item.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      lineWidth = width;
      persist();
      closeMenus();
      updateUi();
    });
    menu.appendChild(item);
  });
  document.body.appendChild(menu);
  return menu;
}

function createColorMenu() {
  const menu = document.createElement('div');
  menu.id = COLOR_MENU_ID;
  menu.className = 'gz463-menu gannzilla-chart-toolbar-v328';
  menu.hidden = true;
  menu.setAttribute('data-gannzilla-control-strip', 'true');
  menu.innerHTML = '<div class="gz463-current"><span>اللون الحالي</span><span class="gz463-current-chip"></span><input type="color" aria-label="لون مخصص"></div><div class="gz463-palette"></div>';
  const palette = menu.querySelector('.gz463-palette');
  PALETTE.forEach((color) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gz463-color';
    button.style.background = color;
    button.title = color;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      primaryColor = color;
      persist();
      closeMenus();
      updateUi();
    });
    palette.appendChild(button);
  });
  const custom = menu.querySelector('input[type="color"]');
  custom.value = primaryColor;
  custom.addEventListener('input', () => {
    primaryColor = custom.value;
    persist();
    updateUi();
  });
  custom.addEventListener('change', closeMenus);
  document.body.appendChild(menu);
  return menu;
}

function createFileInput() {
  let input = document.getElementById(FILE_INPUT_ID);
  if (input instanceof HTMLInputElement) return input;
  input = document.createElement('input');
  input.id = FILE_INPUT_ID;
  input.type = 'file';
  input.accept = 'image/*';
  input.hidden = true;
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const dataUrl = await blobToDataUrl(file);
    await addImageDrawing(dataUrl, 'paste-file');
  });
  document.body.appendChild(input);
  return input;
}

function createStrip() {
  const strip = document.createElement('div');
  strip.id = STRIP_ID;
  strip.className = 'gannzilla-chart-toolbar-v328';
  strip.setAttribute('data-gannzilla-control-strip', 'true');
  strip.setAttribute('role', 'toolbar');
  strip.setAttribute('aria-label', 'أدوات الرسم المختصرة');

  const mainGroup = document.createElement('div');
  mainGroup.className = 'gz463-group';
  const main = makeButton('gz463-main', 'أدوات الرسم', `${icon('drawing', 42)}<span>أدوات الرسم</span>${menuArrow()}`);
  main.id = DRAW_TRIGGER_ID;
  main.setAttribute('aria-expanded', 'false');
  main.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); toggleMenu(DRAW_MENU_ID, main); });
  mainGroup.appendChild(main);

  const quick = document.createElement('div');
  quick.className = 'gz463-group gz463-quick';
  quick.append(
    toolQuickButton('triangle', 'مثلث', 'triangle'),
    toolQuickButton('roundRect', 'مستطيل مستدير', 'roundRect'),
    toolQuickButton('rect', 'مستطيل', 'rect'),
    toolQuickButton('ellipse', 'دائرة', 'ellipse'),
    toolQuickButton('line', 'خط', 'line'),
    toolQuickButton('text', 'نص', 'text'),
    toolQuickButton('fill', 'تعبئة', 'fill'),
    toolQuickButton('eraser', 'ممحاة', 'eraser'),
  );

  const selectGroup = document.createElement('div');
  selectGroup.className = 'gz463-group';
  const select = makeButton('gz463-split', 'تحديد', `${icon('selectRect', 43)}<span>تحديد</span>${menuArrow()}`);
  select.id = SELECT_TRIGGER_ID;
  select.setAttribute('aria-expanded', 'false');
  select.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); toggleMenu(SELECT_MENU_ID, select); });
  selectGroup.appendChild(select);

  const pasteGroup = document.createElement('div');
  pasteGroup.className = 'gz463-group';
  const paste = makeButton('gz463-split', 'لصق', `${icon('paste', 43)}<span>لصق</span>${menuArrow()}`);
  paste.id = PASTE_TRIGGER_ID;
  paste.setAttribute('aria-expanded', 'false');
  paste.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); toggleMenu(PASTE_MENU_ID, paste); });
  pasteGroup.appendChild(paste);

  const history = document.createElement('div');
  history.className = 'gz463-group gz463-history';
  const undo = makeButton('', 'تراجع', icon('undo', 31));
  undo.dataset.action = 'undo';
  undo.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); undo(); });
  const redo = makeButton('', 'إعادة', icon('redo', 31));
  redo.dataset.action = 'redo';
  redo.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); redo(); });
  history.append(undo, redo);

  strip.append(mainGroup, quick, selectGroup, pasteGroup, history);
  document.body.appendChild(strip);
  return strip;
}

function ensureUi() {
  installStyle();
  let strip = document.getElementById(STRIP_ID);
  if (!(strip instanceof HTMLElement)) strip = createStrip();
  if (!document.getElementById(DRAW_MENU_ID)) createDrawingMenu();
  if (!document.getElementById(SELECT_MENU_ID)) createSelectionMenu();
  if (!document.getElementById(PASTE_MENU_ID)) createPasteMenu();
  if (!document.getElementById(THICKNESS_MENU_ID)) createThicknessMenu();
  if (!document.getElementById(COLOR_MENU_ID)) createColorMenu();
  createFileInput();
  ensureOverlay();
  updateUi();
  return strip;
}

function positionMenu(menu, trigger) {
  if (!(menu instanceof HTMLElement) || !(trigger instanceof HTMLElement) || menu.hidden) return;
  const rect = trigger.getBoundingClientRect();
  const menuWidth = menu.getBoundingClientRect().width || 285;
  const left = clamp(Math.round(rect.left), 6, Math.max(6, window.innerWidth - menuWidth - 6));
  const top = Math.round(rect.bottom + 3);
  menu.style.setProperty('left', `${left}px`, 'important');
  menu.style.setProperty('top', `${top}px`, 'important');
  menu.style.setProperty('max-height', `${Math.max(150, window.innerHeight - top - 8)}px`, 'important');
}

function openSubmenu(id, anchor) {
  const menu = document.getElementById(id);
  if (!(menu instanceof HTMLElement) || !(anchor instanceof HTMLElement)) return;
  [THICKNESS_MENU_ID, COLOR_MENU_ID].forEach((other) => {
    if (other !== id) document.getElementById(other)?.setAttribute('hidden', '');
  });
  menu.hidden = false;
  const rect = anchor.getBoundingClientRect();
  const width = menu.getBoundingClientRect().width || 220;
  let left = rect.right + 4;
  if (left + width > window.innerWidth - 6) left = rect.left - width - 4;
  menu.style.setProperty('left', `${Math.max(6, left)}px`, 'important');
  menu.style.setProperty('top', `${Math.max(6, rect.top)}px`, 'important');
  updateUi();
}

function toggleMenu(id, trigger) {
  const wasOpen = openMenu === id;
  closeMenus();
  if (wasOpen) return;
  const menu = document.getElementById(id);
  if (!(menu instanceof HTMLElement)) return;
  menu.hidden = false;
  openMenu = id;
  trigger?.setAttribute('aria-expanded', 'true');
  positionMenu(menu, trigger);
  updateUi();
}

function closeMenus() {
  [DRAW_MENU_ID, SELECT_MENU_ID, PASTE_MENU_ID, THICKNESS_MENU_ID, COLOR_MENU_ID].forEach((id) => {
    const menu = document.getElementById(id);
    if (menu instanceof HTMLElement) menu.hidden = true;
  });
  [DRAW_TRIGGER_ID, SELECT_TRIGGER_ID, PASTE_TRIGGER_ID].forEach((id) => document.getElementById(id)?.setAttribute('aria-expanded', 'false'));
  openMenu = null;
}

function positionStrip() {
  const root = document.getElementById(WHEEL_TOOLBAR_ID);
  const strip = document.getElementById(STRIP_ID);
  if (!(root instanceof HTMLElement) || !(strip instanceof HTMLElement)) return false;

  const rootRect = root.getBoundingClientRect();
  if (rootRect.width < 1 || rootRect.height < 1) return false;
  const requested = Math.round(numberParam('compactDrawingToolbarWidth', 760, 540, 980));
  const gap = Math.round(numberParam('compactDrawingToolbarGap', 6, 2, 20));
  const available = Math.max(420, Math.round(rootRect.left - gap - 4));
  const width = Math.min(requested, available);
  const left = Math.max(4, Math.round(rootRect.left - gap - width));
  const top = Math.max(2, Math.round(rootRect.top));
  strip.style.setProperty('left', `${left}px`, 'important');
  strip.style.setProperty('top', `${top}px`, 'important');
  strip.style.setProperty('width', `${width}px`, 'important');
  strip.style.setProperty('min-width', `${width}px`, 'important');
  strip.style.setProperty('max-width', `${width}px`, 'important');
  strip.style.setProperty('visibility', 'visible', 'important');
  strip.style.setProperty('opacity', '1', 'important');
  strip.style.setProperty('pointer-events', 'auto', 'important');
  const bottom = Math.round(strip.getBoundingClientRect().bottom + 4);
  applyWorkspaceOffset(bottom);
  strip.dataset.gannzillaCompactDrawingPositionedV463 = 'true';
  return true;
}

function scheduleLayout() {
  window.cancelAnimationFrame(layoutFrame);
  layoutFrame = window.requestAnimationFrame(() => {
    ensureUi();
    positionStrip();
    scheduleOverlay();
    if (openMenu) {
      const trigger = openMenu === DRAW_MENU_ID
        ? document.getElementById(DRAW_TRIGGER_ID)
        : openMenu === SELECT_MENU_ID
          ? document.getElementById(SELECT_TRIGGER_ID)
          : document.getElementById(PASTE_TRIGGER_ID);
      positionMenu(document.getElementById(openMenu), trigger);
    }
  });
}

function ensureOverlay() {
  let overlay = document.getElementById(OVERLAY_ID);
  if (overlay instanceof HTMLCanvasElement) return overlay;
  overlay = document.createElement('canvas');
  overlay.id = OVERLAY_ID;
  overlay.className = 'gannzilla-chart-toolbar-v328';
  overlay.setAttribute('data-gannzilla-control-strip', 'true');
  overlay.setAttribute('aria-label', 'طبقة أدوات الرسم');
  document.body.appendChild(overlay);
  bindOverlayInput(overlay);
  return overlay;
}

function normalizePoint(event, rect) {
  return {
    x: clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1),
    y: clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1),
  };
}

function denormalize(point, width, height) { return { x: point.x * width, y: point.y * height }; }
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function widthRatio(multiplier = 1) {
  const rect = findWheelCanvas()?.getBoundingClientRect();
  const base = rect ? Math.max(160, Math.min(rect.width, rect.height)) : 1000;
  return (lineWidth * multiplier) / base;
}

function objectBounds(object) {
  const points = [];
  if (Array.isArray(object.points)) points.push(...object.points);
  if (object.start) points.push(object.start);
  if (object.end) points.push(object.end);
  if (object.type === 'image') {
    points.push({ x: object.x, y: object.y }, { x: object.x + object.w, y: object.y + object.h });
  }
  if (object.type === 'text') {
    const width = Math.max(.04, String(object.text || '').length * Number(object.fontRatio || .03) * .58);
    const height = Number(object.fontRatio || .03) * 1.3;
    points.push(object.start || { x: .5, y: .5 }, { x: (object.start?.x || .5) + width, y: (object.start?.y || .5) + height });
  }
  if (!points.length) return { x1: 0, y1: 0, x2: 0, y2: 0 };
  return {
    x1: Math.min(...points.map((p) => p.x)),
    y1: Math.min(...points.map((p) => p.y)),
    x2: Math.max(...points.map((p) => p.x)),
    y2: Math.max(...points.map((p) => p.y)),
  };
}

function boundsIntersect(a, b) { return a.x1 <= b.x2 && a.x2 >= b.x1 && a.y1 <= b.y2 && a.y2 >= b.y1; }
function pointInBounds(point, bounds, pad = .012) { return point.x >= bounds.x1 - pad && point.x <= bounds.x2 + pad && point.y >= bounds.y1 - pad && point.y <= bounds.y2 + pad; }
function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x; const yi = polygon[i].y;
    const xj = polygon[j].x; const yj = polygon[j].y;
    const intersects = ((yi > point.y) !== (yj > point.y))
      && (point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || 1e-9) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function hitDrawing(point) {
  for (let index = drawings.length - 1; index >= 0; index -= 1) {
    if (drawings[index].type === 'erase') continue;
    if (pointInBounds(point, objectBounds(drawings[index]), .018)) return drawings[index];
  }
  return null;
}

function selectedBounds() {
  const bounds = drawings.filter((object) => selectedIds.has(object.id)).map(objectBounds);
  if (!bounds.length) return null;
  return {
    x1: Math.min(...bounds.map((b) => b.x1)),
    y1: Math.min(...bounds.map((b) => b.y1)),
    x2: Math.max(...bounds.map((b) => b.x2)),
    y2: Math.max(...bounds.map((b) => b.y2)),
  };
}

function moveObject(object, dx, dy) {
  const movePoint = (point) => ({ x: clamp(point.x + dx, -1, 2), y: clamp(point.y + dy, -1, 2) });
  if (Array.isArray(object.points)) object.points = object.points.map(movePoint);
  if (object.start) object.start = movePoint(object.start);
  if (object.end) object.end = movePoint(object.end);
  if (object.type === 'image') { object.x = clamp(object.x + dx, -1, 2); object.y = clamp(object.y + dy, -1, 2); }
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function getImage(src) {
  if (!src) return null;
  if (imageCache.has(src)) return imageCache.get(src);
  const image = new Image();
  image.decoding = 'async';
  image.onload = scheduleOverlay;
  image.src = src;
  imageCache.set(src, image);
  return image;
}

function drawObject(ctx, object, width, height) {
  const p = (value) => denormalize(value, width, height);
  const stroke = Math.max(1, Number(object.widthRatio || .004) * Math.min(width, height));
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = stroke;
  ctx.strokeStyle = object.color || '#000';
  ctx.fillStyle = object.fillColor || object.color || '#000';

  if (object.type === 'erase') ctx.globalCompositeOperation = 'destination-out';
  if (['freehand', 'erase'].includes(object.type)) {
    const points = Array.isArray(object.points) ? object.points : [];
    if (points.length) {
      ctx.beginPath();
      const first = p(points[0]);
      ctx.moveTo(first.x, first.y);
      points.slice(1).forEach((point) => { const next = p(point); ctx.lineTo(next.x, next.y); });
      if (points.length === 1) ctx.lineTo(first.x + .1, first.y + .1);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (object.type === 'text') {
    const point = p(object.start || { x: .5, y: .5 });
    const fontSize = Math.max(12, Number(object.fontRatio || .035) * Math.min(width, height));
    ctx.font = `700 ${fontSize}px Tahoma,"Segoe UI",Arial,sans-serif`;
    ctx.textAlign = 'start';
    ctx.textBaseline = 'top';
    ctx.direction = 'rtl';
    ctx.fillStyle = object.color || '#000';
    ctx.fillText(String(object.text || ''), point.x, point.y);
    ctx.restore();
    return;
  }

  if (object.type === 'image') {
    const image = getImage(object.src);
    if (image?.complete) ctx.drawImage(image, object.x * width, object.y * height, object.w * width, object.h * height);
    ctx.restore();
    return;
  }

  const start = p(object.start || { x: 0, y: 0 });
  const end = p(object.end || object.start || { x: 0, y: 0 });
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  ctx.beginPath();

  if (object.type === 'line' || object.type === 'arrow') {
    ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    if (object.type === 'arrow') {
      const angle = Math.atan2(dy, dx);
      const head = Math.max(11, stroke * 4.5);
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - head * Math.cos(angle - Math.PI / 7), end.y - head * Math.sin(angle - Math.PI / 7));
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - head * Math.cos(angle + Math.PI / 7), end.y - head * Math.sin(angle + Math.PI / 7));
      ctx.stroke();
    }
  } else if (object.type === 'rect' || object.type === 'roundRect') {
    const x = Math.min(start.x, end.x); const y = Math.min(start.y, end.y);
    const w = Math.abs(dx); const h = Math.abs(dy);
    if (object.type === 'roundRect') {
      ctx.beginPath(); roundedRectPath(ctx, x, y, w, h, Math.min(w, h) * .18); ctx.closePath();
      if (object.fill) { ctx.globalAlpha = .24; ctx.fill(); ctx.globalAlpha = 1; }
      ctx.stroke();
    } else {
      if (object.fill) { ctx.globalAlpha = .24; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1; }
      ctx.strokeRect(x, y, w, h);
    }
  } else if (object.type === 'ellipse') {
    ctx.ellipse((start.x + end.x) / 2, (start.y + end.y) / 2, Math.max(.5, Math.abs(dx) / 2), Math.max(.5, Math.abs(dy) / 2), 0, 0, Math.PI * 2);
    if (object.fill) { ctx.globalAlpha = .24; ctx.fill(); ctx.globalAlpha = 1; }
    ctx.stroke();
  } else if (object.type === 'triangle') {
    const x1 = (start.x + end.x) / 2; const y1 = Math.min(start.y, end.y);
    const x2 = Math.max(start.x, end.x); const y2 = Math.max(start.y, end.y);
    const x3 = Math.min(start.x, end.x); const y3 = y2;
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath();
    if (object.fill) { ctx.globalAlpha = .24; ctx.fill(); ctx.globalAlpha = 1; }
    ctx.stroke();
  }
  ctx.restore();
}

function drawSelection(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = '#1479bd';
  ctx.fillStyle = transparentSelection ? 'rgba(255,255,255,.03)' : 'rgba(61,145,210,.10)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  drawings.filter((object) => selectedIds.has(object.id)).forEach((object) => {
    const b = objectBounds(object);
    const x = b.x1 * width; const y = b.y1 * height;
    const w = Math.max(3, (b.x2 - b.x1) * width); const h = Math.max(3, (b.y2 - b.y1) * height);
    ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  });
  if (selectionDraft?.type === 'rect') {
    const a = denormalize(selectionDraft.start, width, height);
    const b = denormalize(selectionDraft.end, width, height);
    ctx.fillRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    ctx.strokeRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
  } else if (selectionDraft?.type === 'free' && selectionDraft.points.length) {
    ctx.beginPath();
    const first = denormalize(selectionDraft.points[0], width, height);
    ctx.moveTo(first.x, first.y);
    selectionDraft.points.slice(1).forEach((point) => { const p = denormalize(point, width, height); ctx.lineTo(p.x, p.y); });
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function bindWheelObserver(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || observedWheelCanvas === canvas) return;
  wheelResizeObserver?.disconnect();
  observedWheelCanvas = canvas;
  if (typeof ResizeObserver === 'function') {
    wheelResizeObserver = new ResizeObserver(scheduleOverlay);
    wheelResizeObserver.observe(canvas);
  }
}

function renderOverlay() {
  const overlay = ensureOverlay();
  const wheel = findWheelCanvas();
  if (!(wheel instanceof HTMLCanvasElement)) { overlay.style.display = 'none'; return false; }
  bindWheelObserver(wheel);
  const rect = wheel.getBoundingClientRect();
  const style = window.getComputedStyle(wheel);
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0 || rect.width < 2 || rect.height < 2) {
    overlay.style.setProperty('display', 'none', 'important');
    return false;
  }
  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const targetWidth = Math.max(1, Math.round(rect.width * dpr));
  const targetHeight = Math.max(1, Math.round(rect.height * dpr));
  if (overlay.width !== targetWidth) overlay.width = targetWidth;
  if (overlay.height !== targetHeight) overlay.height = targetHeight;
  overlay.style.setProperty('display', 'block', 'important');
  overlay.style.setProperty('left', `${rect.left}px`, 'important');
  overlay.style.setProperty('top', `${rect.top}px`, 'important');
  overlay.style.setProperty('width', `${rect.width}px`, 'important');
  overlay.style.setProperty('height', `${rect.height}px`, 'important');
  const interactive = activeTool !== 'hand';
  overlay.style.setProperty('pointer-events', interactive ? 'auto' : 'none', 'important');
  overlay.style.setProperty('cursor', activeTool === 'text' ? 'text' : activeTool === 'eraser' ? 'cell' : interactive ? 'crosshair' : 'default', 'important');
  const ctx = overlay.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  drawings.forEach((object) => drawObject(ctx, object, rect.width, rect.height));
  drawSelection(ctx, rect.width, rect.height);
  return true;
}

function scheduleOverlay() {
  window.cancelAnimationFrame(overlayFrame);
  overlayFrame = window.requestAnimationFrame(renderOverlay);
}

function saveHistory() {
  undoStack.push(clone(drawings));
  if (undoStack.length > 60) undoStack.shift();
  redoStack = [];
  updateUi();
}

function finishMutation(source) {
  currentObject = null;
  currentPointerId = null;
  selectionDraft = null;
  selectionMove = null;
  persist();
  scheduleOverlay();
  actionCount += 1;
  lastAction = { source, count: drawings.length, selected: [...selectedIds], at: Date.now() };
  updateUi();
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(clone(drawings));
  drawings = undoStack.pop();
  selectedIds.clear();
  finishMutation('undo');
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(clone(drawings));
  drawings = redoStack.pop();
  selectedIds.clear();
  finishMutation('redo');
}

function selectAll() { selectedIds = new Set(drawings.filter((o) => o.type !== 'erase').map((o) => o.id)); scheduleOverlay(); updateUi(); }
function invertSelection() {
  selectedIds = new Set(drawings.filter((o) => o.type !== 'erase' && !selectedIds.has(o.id)).map((o) => o.id));
  scheduleOverlay(); updateUi();
}
function deleteSelected() {
  if (!selectedIds.size) return;
  saveHistory();
  drawings = drawings.filter((object) => !selectedIds.has(object.id));
  selectedIds.clear();
  finishMutation('delete-selection');
}

function setActiveTool(tool, source) {
  activeTool = tool;
  currentObject = null;
  selectionDraft = null;
  selectionMove = null;
  persist();
  scheduleOverlay();
  updateUi();
  lastAction = { source, tool, at: Date.now() };
}

function updateUi() {
  document.querySelectorAll(`#${STRIP_ID} [data-tool]`).forEach((button) => {
    button.dataset.active = button.getAttribute('data-tool') === activeTool ? 'true' : 'false';
  });
  document.querySelectorAll(`.gz463-menu [data-tool]`).forEach((button) => {
    button.dataset.active = button.getAttribute('data-tool') === activeTool ? 'true' : 'false';
  });
  const transparent = document.querySelector(`#${SELECT_MENU_ID} [data-action="transparent"]`);
  if (transparent instanceof HTMLElement) transparent.dataset.active = transparentSelection ? 'true' : 'false';
  const current = document.querySelector(`#${COLOR_MENU_ID} .gz463-current-chip`);
  if (current instanceof HTMLElement) current.style.background = primaryColor;
  const custom = document.querySelector(`#${COLOR_MENU_ID} input[type="color"]`);
  if (custom instanceof HTMLInputElement && custom.value !== primaryColor) custom.value = primaryColor;
  const undoButton = document.querySelector(`#${STRIP_ID} [data-action="undo"]`);
  const redoButton = document.querySelector(`#${STRIP_ID} [data-action="redo"]`);
  if (undoButton instanceof HTMLButtonElement) undoButton.disabled = undoStack.length === 0;
  if (redoButton instanceof HTMLButtonElement) redoButton.disabled = redoStack.length === 0;
}

function applyRectSelection() {
  if (!selectionDraft?.start || !selectionDraft?.end) return;
  const a = selectionDraft.start; const b = selectionDraft.end;
  const bounds = { x1: Math.min(a.x, b.x), y1: Math.min(a.y, b.y), x2: Math.max(a.x, b.x), y2: Math.max(a.y, b.y) };
  selectedIds = new Set(drawings.filter((object) => object.type !== 'erase' && boundsIntersect(bounds, objectBounds(object))).map((object) => object.id));
}

function applyFreeSelection() {
  const points = selectionDraft?.points || [];
  if (points.length < 3) return;
  selectedIds = new Set(drawings.filter((object) => {
    if (object.type === 'erase') return false;
    const b = objectBounds(object);
    return pointInPolygon({ x: (b.x1 + b.x2) / 2, y: (b.y1 + b.y2) / 2 }, points);
  }).map((object) => object.id));
}

function bindOverlayInput(overlay) {
  overlay.addEventListener('pointerdown', (event) => {
    if (activeTool === 'hand' || event.button !== 0) return;
    const wheel = findWheelCanvas();
    if (!(wheel instanceof HTMLCanvasElement)) return;
    const rect = wheel.getBoundingClientRect();
    const point = normalizePoint(event, rect);

    if (activeTool === 'fill') {
      const target = hitDrawing(point);
      if (target) {
        saveHistory();
        target.fill = true;
        target.fillColor = primaryColor;
        if (['freehand', 'line', 'arrow', 'text'].includes(target.type)) target.color = primaryColor;
        finishMutation('fill');
      }
      event.preventDefault(); event.stopPropagation();
      return;
    }

    if (activeTool === 'text') {
      const text = window.prompt('اكتب النص');
      if (text) {
        saveHistory();
        drawings.push({ id: uid(), type: 'text', start: point, text, color: primaryColor, fontRatio: Math.max(.022, lineWidth * .006) });
        finishMutation('text');
      }
      event.preventDefault(); event.stopPropagation();
      return;
    }

    if (activeTool === 'selectRect' || activeTool === 'selectFree') {
      const bounds = selectedBounds();
      if (bounds && pointInBounds(point, bounds, .018)) {
        saveHistory();
        selectionMove = {
          start: point,
          originals: drawings.filter((object) => selectedIds.has(object.id)).map((object) => ({ id: object.id, value: clone(object) })),
        };
      } else if (activeTool === 'selectRect') {
        selectionDraft = { type: 'rect', start: point, end: point };
        selectedIds.clear();
      } else {
        selectionDraft = { type: 'free', points: [point] };
        selectedIds.clear();
      }
      currentPointerId = event.pointerId;
      try { overlay.setPointerCapture?.(event.pointerId); } catch (_) { /* optional */ }
      event.preventDefault(); event.stopPropagation(); scheduleOverlay();
      return;
    }

    saveHistory();
    const base = { id: uid(), color: primaryColor, fillColor: primaryColor, fill: false, widthRatio: widthRatio(1) };
    if (activeTool === 'pencil') currentObject = { ...base, type: 'freehand', points: [point] };
    else if (activeTool === 'eraser') currentObject = { ...base, type: 'erase', widthRatio: widthRatio(3.5), points: [point] };
    else if (['line', 'arrow', 'triangle', 'roundRect', 'rect', 'ellipse'].includes(activeTool)) currentObject = { ...base, type: activeTool, start: point, end: point };
    if (!currentObject) return;
    drawings.push(currentObject);
    currentPointerId = event.pointerId;
    try { overlay.setPointerCapture?.(event.pointerId); } catch (_) { /* optional */ }
    event.preventDefault(); event.stopPropagation(); scheduleOverlay();
  });

  overlay.addEventListener('pointermove', (event) => {
    if (currentPointerId !== event.pointerId) return;
    const wheel = findWheelCanvas();
    if (!(wheel instanceof HTMLCanvasElement)) return;
    const point = normalizePoint(event, wheel.getBoundingClientRect());
    if (selectionMove) {
      const dx = point.x - selectionMove.start.x;
      const dy = point.y - selectionMove.start.y;
      selectionMove.originals.forEach(({ id, value }) => {
        const target = drawings.find((object) => object.id === id);
        if (!target) return;
        Object.keys(target).forEach((key) => delete target[key]);
        Object.assign(target, clone(value));
        moveObject(target, dx, dy);
      });
    } else if (selectionDraft?.type === 'rect') selectionDraft.end = point;
    else if (selectionDraft?.type === 'free') {
      const last = selectionDraft.points.at(-1);
      if (!last || distance(last, point) > .002) selectionDraft.points.push(point);
    } else if (currentObject) {
      if (Array.isArray(currentObject.points)) {
        const last = currentObject.points.at(-1);
        if (!last || distance(last, point) > .0015) currentObject.points.push(point);
      } else currentObject.end = point;
    }
    event.preventDefault(); event.stopPropagation(); scheduleOverlay();
  });

  const finish = (event) => {
    if (currentPointerId == null || (event?.pointerId != null && currentPointerId !== event.pointerId)) return;
    try { overlay.releasePointerCapture?.(currentPointerId); } catch (_) { /* optional */ }
    if (selectionDraft?.type === 'rect') applyRectSelection();
    else if (selectionDraft?.type === 'free') applyFreeSelection();
    const source = selectionMove ? 'move-selection' : selectionDraft ? 'select' : currentObject ? 'draw' : 'pointer';
    event?.preventDefault?.(); event?.stopPropagation?.();
    finishMutation(source);
  };
  overlay.addEventListener('pointerup', finish);
  overlay.addEventListener('pointercancel', finish);
  overlay.addEventListener('lostpointercapture', finish);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function imageSize(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth || 1, height: image.naturalHeight || 1 });
    image.onerror = () => resolve({ width: 1, height: 1 });
    image.src = src;
  });
}

async function addImageDrawing(src, source) {
  if (!src) return;
  const size = await imageSize(src);
  const maxW = .45; const maxH = .45;
  let w = maxW; let h = w * size.height / Math.max(1, size.width);
  if (h > maxH) { h = maxH; w = h * size.width / Math.max(1, size.height); }
  saveHistory();
  drawings.push({ id: uid(), type: 'image', src, x: .5 - w / 2, y: .5 - h / 2, w, h });
  selectedIds = new Set([drawings.at(-1).id]);
  finishMutation(source);
}

async function pasteClipboard() {
  try {
    if (navigator.clipboard?.read) {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          await addImageDrawing(await blobToDataUrl(blob), 'paste-clipboard-image');
          return;
        }
      }
    }
    if (navigator.clipboard?.readText) {
      const text = await navigator.clipboard.readText();
      if (text) {
        saveHistory();
        drawings.push({ id: uid(), type: 'text', start: { x: .45, y: .45 }, text, color: primaryColor, fontRatio: .035 });
        finishMutation('paste-clipboard-text');
      }
    }
  } catch (_) {
    window.alert('تعذر الوصول إلى الحافظة. استخدم لصق من ملف أو اسمح للمتصفح بالوصول إلى الحافظة.');
  }
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showCompactDrawingTools', true) || window[STATE_KEY]) return;

  ensureUi();
  scheduleLayout();
  const bootstrapTimers = [40, 120, 300, 700, 1500, 3000, 5000].map((delay) => window.setTimeout(scheduleLayout, delay));

  const root = document.getElementById(WHEEL_TOOLBAR_ID);
  if (root instanceof HTMLElement && typeof ResizeObserver === 'function') {
    rootResizeObserver = new ResizeObserver(scheduleLayout);
    rootResizeObserver.observe(root);
  }

  const onDocumentClick = (event) => {
    if (!openMenu) return;
    const menus = [DRAW_MENU_ID, SELECT_MENU_ID, PASTE_MENU_ID, THICKNESS_MENU_ID, COLOR_MENU_ID]
      .map((id) => document.getElementById(id)).filter(Boolean);
    const triggers = [DRAW_TRIGGER_ID, SELECT_TRIGGER_ID, PASTE_TRIGGER_ID]
      .map((id) => document.getElementById(id)).filter(Boolean);
    if (menus.some((menu) => menu.contains(event.target)) || triggers.some((trigger) => trigger.contains(event.target))) return;
    closeMenus();
  };
  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeMenus();
      setActiveTool('hand', 'escape');
      selectedIds.clear();
      scheduleOverlay();
    }
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedIds.size && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
      event.preventDefault(); deleteSelected();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault(); event.shiftKey ? redo() : undo();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
  };
  const onViewportChange = () => { scheduleLayout(); scheduleOverlay(); };

  document.addEventListener('click', onDocumentClick, true);
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('scroll', onViewportChange, true);
  document.addEventListener('fullscreenchange', onViewportChange);
  window.addEventListener('gannzilla:page-scrollbar-pan-v305', scheduleOverlay);
  window.addEventListener('gannzilla:wheel-pan-offset-v305', scheduleOverlay);
  window.addEventListener('gannzilla:wheel-input-v459', scheduleOverlay);
  window.addEventListener('gannzilla:unified-wheel-tools-v453', scheduleOverlay);
  window.addEventListener('gannzilla:layout-panel-visibility-change', onViewportChange);

  window.GANNZILLA_COMPACT_DRAWING_TOOLS_V463 = true;
  window.__auditGannzillaCompactDrawingToolsV463 = () => {
    const strip = document.getElementById(STRIP_ID);
    const overlay = document.getElementById(OVERLAY_ID);
    const rect = strip?.getBoundingClientRect();
    return {
      ok: Boolean(strip && overlay && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showCompactDrawingTools', true),
      activeTool,
      drawingCount: drawings.length,
      selectedCount: selectedIds.size,
      undoCount: undoStack.length,
      redoCount: redoStack.length,
      toolbarImmediatelyLeftOfWheelTools: Boolean(rect && document.getElementById(WHEEL_TOOLBAR_ID)?.getBoundingClientRect().left >= rect.right - 2),
      workspaceShiftedBelowToolbar: true,
      lastAction,
      actionCount,
    };
  };

  window[STATE_KEY] = {
    bootstrapTimers,
    onDocumentClick,
    onKeyDown,
    onViewportChange,
    get rootResizeObserver() { return rootResizeObserver; },
    get wheelResizeObserver() { return wheelResizeObserver; },
    restoreLayout,
  };
}

install();
