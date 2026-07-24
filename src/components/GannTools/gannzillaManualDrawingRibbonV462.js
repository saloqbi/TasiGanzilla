const BUILD = 462;
const TOOLBAR_ID = 'gannzilla-unified-wheel-tools-v453';
const SHAPES_TRIGGER_ID = 'gannzilla-shapes-menu-trigger-v460';
const FIRST_EYE_ID = 'gannzilla-unified-eye-v453';
const TRIGGER_ID = 'gannzilla-manual-drawing-trigger-v462';
const RIBBON_ID = 'gannzilla-manual-drawing-ribbon-v462';
const COLOR_PANEL_ID = 'gannzilla-manual-drawing-colors-v462';
const OVERLAY_ID = 'gannzilla-manual-drawing-overlay-v462';
const FILE_INPUT_ID = 'gannzilla-manual-drawing-file-v462';
const STYLE_ID = 'gannzilla-manual-drawing-style-v462';
const STATE_KEY = '__gannzillaManualDrawingRibbonV462';
const DRAWINGS_KEY = 'tasi-gannzilla-manual-drawings-v462';
const PREFS_KEY = 'tasi-gannzilla-manual-drawing-prefs-v462';
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value == null ? fallback : value;
  } catch (_) {
    return fallback;
  }
}

const savedPrefs = readJson(PREFS_KEY, {});
let drawings = Array.isArray(readJson(DRAWINGS_KEY, [])) ? readJson(DRAWINGS_KEY, []) : [];
let undoStack = [];
let redoStack = [];
let activeTool = typeof savedPrefs.activeTool === 'string' ? savedPrefs.activeTool : 'select';
let primaryColor = typeof savedPrefs.primaryColor === 'string' ? savedPrefs.primaryColor : '#000000';
let secondaryColor = typeof savedPrefs.secondaryColor === 'string' ? savedPrefs.secondaryColor : '#ffffff';
let lineWidth = Number.isFinite(Number(savedPrefs.lineWidth)) ? Number(savedPrefs.lineWidth) : 4;
let fillShapes = savedPrefs.fillShapes === true;
let drawingVisible = savedPrefs.drawingVisible !== false;
let ribbonOpen = params().has('drawingRibbonOpen')
  ? boolParam('drawingRibbonOpen', true)
  : savedPrefs.ribbonOpen === true;
let colorPanelOpen = false;
let colorTarget = 'primary';
let currentObject = null;
let currentPointerId = null;
let observedWheelCanvas = null;
let wheelResizeObserver = null;
let overlayFrame = 0;
let layoutFrame = 0;
let lastAction = null;
let actionCount = 0;
const layoutOriginal = new Map();

function persist() {
  try { localStorage.setItem(DRAWINGS_KEY, JSON.stringify(drawings)); }
  catch (_) { /* Runtime state remains active. */ }
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({
      activeTool,
      primaryColor,
      secondaryColor,
      lineWidth,
      fillShapes,
      drawingVisible,
      ribbonOpen,
    }));
  } catch (_) { /* Runtime state remains active. */ }
}

function persistUrlState() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('showManualDrawingRibbon', 'true');
    url.searchParams.set('drawingRibbonOpen', ribbonOpen ? 'true' : 'false');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // The visible state remains active.
  }
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
      const style = window.getComputedStyle(canvas);
      const rect = canvas.getBoundingClientRect();
      return canvas.width > 300
        && canvas.height > 300
        && rect.width > 250
        && rect.height > 250
        && style.display !== 'none'
        && style.visibility !== 'hidden';
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

function ensureOverlay() {
  let canvas = document.getElementById(OVERLAY_ID);
  if (canvas instanceof HTMLCanvasElement) return canvas;
  canvas = document.createElement('canvas');
  canvas.id = OVERLAY_ID;
  canvas.setAttribute('aria-label', 'طبقة الرسم اليدوي');
  canvas.classList.add('gannzilla-chart-toolbar-v328');
  canvas.dataset.gannzillaManualDrawingSurfaceV462 = 'true';
  document.body.appendChild(canvas);
  bindOverlayInput(canvas);
  return canvas;
}

function normalizedPoint(event, rect) {
  return {
    x: Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width))),
    y: Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height))),
  };
}

function pointDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function lineWidthRatio(multiplier = 1) {
  const canvas = findWheelCanvas();
  const rect = canvas?.getBoundingClientRect();
  const base = rect ? Math.max(160, Math.min(rect.width, rect.height)) : 1000;
  return (lineWidth * multiplier) / base;
}

function drawObject(ctx, object, width, height) {
  const toPoint = (value) => ({ x: value.x * width, y: value.y * height });
  const strokeWidth = Math.max(1, Number(object.widthRatio || .004) * Math.min(width, height));
  const primary = object.color || '#000000';
  const secondary = object.fillColor || '#ffffff';

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = primary;
  ctx.fillStyle = secondary;

  if (object.type === 'erase') {
    ctx.globalCompositeOperation = 'destination-out';
  }

  if (object.type === 'freehand' || object.type === 'brush' || object.type === 'erase') {
    const points = Array.isArray(object.points) ? object.points : [];
    if (!points.length) { ctx.restore(); return; }
    ctx.beginPath();
    const first = toPoint(points[0]);
    ctx.moveTo(first.x, first.y);
    points.slice(1).forEach((point) => {
      const p = toPoint(point);
      ctx.lineTo(p.x, p.y);
    });
    if (points.length === 1) ctx.lineTo(first.x + .1, first.y + .1);
    if (object.type === 'brush') ctx.globalAlpha = .88;
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (object.type === 'text') {
    const p = toPoint(object.start || { x: .5, y: .5 });
    const fontSize = Math.max(12, Number(object.fontRatio || .03) * Math.min(width, height));
    ctx.font = `700 ${fontSize}px Tahoma, "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = 'start';
    ctx.textBaseline = 'top';
    ctx.direction = 'rtl';
    ctx.fillStyle = primary;
    ctx.fillText(String(object.text || ''), p.x, p.y);
    ctx.restore();
    return;
  }

  const start = toPoint(object.start || { x: 0, y: 0 });
  const end = toPoint(object.end || object.start || { x: 0, y: 0 });
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const shouldFill = object.fill === true;

  ctx.beginPath();
  if (object.type === 'line' || object.type === 'arrow') {
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    if (object.type === 'arrow') {
      const angle = Math.atan2(dy, dx);
      const head = Math.max(10, strokeWidth * 4.5);
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - head * Math.cos(angle - Math.PI / 7), end.y - head * Math.sin(angle - Math.PI / 7));
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - head * Math.cos(angle + Math.PI / 7), end.y - head * Math.sin(angle + Math.PI / 7));
      ctx.stroke();
    }
  } else if (object.type === 'rect') {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(dx);
    const h = Math.abs(dy);
    if (shouldFill) { ctx.globalAlpha = .22; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1; }
    ctx.strokeRect(x, y, w, h);
  } else if (object.type === 'ellipse') {
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    const rx = Math.abs(dx) / 2;
    const ry = Math.abs(dy) / 2;
    ctx.ellipse(cx, cy, Math.max(.5, rx), Math.max(.5, ry), 0, 0, Math.PI * 2);
    if (shouldFill) { ctx.globalAlpha = .22; ctx.fill(); ctx.globalAlpha = 1; }
    ctx.stroke();
  } else if (object.type === 'polygon') {
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    const radius = Math.max(1, Math.sqrt(dx * dx + dy * dy) / 2);
    const sides = Math.max(3, Math.min(12, Number(object.sides) || 5));
    for (let index = 0; index < sides; index += 1) {
      const angle = -Math.PI / 2 + index * Math.PI * 2 / sides;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (shouldFill) { ctx.globalAlpha = .22; ctx.fill(); ctx.globalAlpha = 1; }
    ctx.stroke();
  }
  ctx.restore();
}

function bindWheelObserver(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || observedWheelCanvas === canvas) return;
  wheelResizeObserver?.disconnect();
  observedWheelCanvas = canvas;
  if (typeof ResizeObserver === 'function') {
    wheelResizeObserver = new ResizeObserver(() => scheduleOverlay());
    wheelResizeObserver.observe(canvas);
  }
}

function renderOverlay() {
  const overlay = ensureOverlay();
  const wheel = findWheelCanvas();
  if (!(wheel instanceof HTMLCanvasElement)) {
    overlay.style.setProperty('display', 'none', 'important');
    return false;
  }
  bindWheelObserver(wheel);
  const rect = wheel.getBoundingClientRect();
  const wheelStyle = window.getComputedStyle(wheel);
  const hidden = wheelStyle.display === 'none'
    || wheelStyle.visibility === 'hidden'
    || Number(wheelStyle.opacity) === 0
    || rect.width < 2
    || rect.height < 2;
  if (hidden || !drawingVisible) {
    overlay.style.setProperty('display', 'none', 'important');
    return false;
  }

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const targetWidth = Math.max(1, Math.round(rect.width * dpr));
  const targetHeight = Math.max(1, Math.round(rect.height * dpr));
  if (overlay.width !== targetWidth) overlay.width = targetWidth;
  if (overlay.height !== targetHeight) overlay.height = targetHeight;
  overlay.style.setProperty('display', 'block', 'important');
  overlay.style.setProperty('left', `${rect.left}px`, 'important');
  overlay.style.setProperty('top', `${rect.top}px`, 'important');
  overlay.style.setProperty('width', `${rect.width}px`, 'important');
  overlay.style.setProperty('height', `${rect.height}px`, 'important');
  const drawingMode = ribbonOpen && activeTool !== 'select' && activeTool !== 'eyedropper';
  overlay.style.setProperty('pointer-events', drawingMode || (ribbonOpen && activeTool === 'eyedropper') ? 'auto' : 'none', 'important');
  overlay.style.setProperty('cursor', activeTool === 'text' ? 'text' : activeTool === 'eraser' ? 'cell' : drawingMode ? 'crosshair' : 'default', 'important');

  const ctx = overlay.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  drawings.forEach((object) => drawObject(ctx, object, rect.width, rect.height));
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
  updateControlStates();
}

function finishMutation(source) {
  currentObject = null;
  currentPointerId = null;
  persist();
  scheduleOverlay();
  updateControlStates();
  actionCount += 1;
  lastAction = { source, drawings: drawings.length, at: Date.now() };
}

function sampleColor(event) {
  const wheel = findWheelCanvas();
  if (!(wheel instanceof HTMLCanvasElement)) return;
  const rect = wheel.getBoundingClientRect();
  const x = Math.max(0, Math.min(wheel.width - 1, Math.round((event.clientX - rect.left) / rect.width * wheel.width)));
  const y = Math.max(0, Math.min(wheel.height - 1, Math.round((event.clientY - rect.top) / rect.height * wheel.height)));
  try {
    const pixel = wheel.getContext('2d').getImageData(x, y, 1, 1).data;
    primaryColor = `#${[pixel[0], pixel[1], pixel[2]].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
    activeTool = 'select';
    persist();
    updateRibbonState();
    scheduleOverlay();
  } catch (_) {
    // Some browser contexts can prevent pixel reads; keep the current color.
  }
}

function bindOverlayInput(overlay) {
  overlay.addEventListener('pointerdown', (event) => {
    if (!ribbonOpen || activeTool === 'select' || event.button !== 0) return;
    const wheel = findWheelCanvas();
    if (!(wheel instanceof HTMLCanvasElement)) return;
    const rect = wheel.getBoundingClientRect();
    if (activeTool === 'eyedropper') {
      event.preventDefault();
      event.stopPropagation();
      sampleColor(event);
      return;
    }

    const point = normalizedPoint(event, rect);
    if (activeTool === 'text') {
      const text = window.prompt('اكتب النص');
      if (!text) return;
      saveHistory();
      drawings.push({
        type: 'text',
        start: point,
        text,
        color: primaryColor,
        fontRatio: Math.max(.016, Math.min(.08, lineWidth * 5 / Math.max(160, Math.min(rect.width, rect.height)))),
      });
      finishMutation('text');
      return;
    }

    saveHistory();
    const base = {
      color: primaryColor,
      fillColor: secondaryColor,
      fill: fillShapes,
      widthRatio: lineWidthRatio(1),
    };
    if (activeTool === 'pencil') currentObject = { ...base, type: 'freehand', points: [point] };
    else if (activeTool === 'brush') currentObject = { ...base, type: 'brush', widthRatio: lineWidthRatio(2.2), points: [point] };
    else if (activeTool === 'eraser') currentObject = { ...base, type: 'erase', widthRatio: lineWidthRatio(3.6), points: [point] };
    else if (activeTool === 'line') currentObject = { ...base, type: 'line', start: point, end: point };
    else if (activeTool === 'arrow') currentObject = { ...base, type: 'arrow', start: point, end: point };
    else if (activeTool === 'rect') currentObject = { ...base, type: 'rect', start: point, end: point };
    else if (activeTool === 'ellipse') currentObject = { ...base, type: 'ellipse', start: point, end: point };
    else if (activeTool === 'polygon') currentObject = { ...base, type: 'polygon', sides: 5, start: point, end: point };
    if (!currentObject) return;
    drawings.push(currentObject);
    currentPointerId = event.pointerId;
    try { overlay.setPointerCapture?.(event.pointerId); } catch (_) { /* optional */ }
    event.preventDefault();
    event.stopPropagation();
    scheduleOverlay();
  });

  overlay.addEventListener('pointermove', (event) => {
    if (!currentObject || currentPointerId !== event.pointerId) return;
    const wheel = findWheelCanvas();
    if (!(wheel instanceof HTMLCanvasElement)) return;
    const point = normalizedPoint(event, wheel.getBoundingClientRect());
    if (Array.isArray(currentObject.points)) {
      const last = currentObject.points[currentObject.points.length - 1];
      if (!last || pointDistance(last, point) > .0015) currentObject.points.push(point);
    } else {
      currentObject.end = point;
    }
    event.preventDefault();
    event.stopPropagation();
    scheduleOverlay();
  });

  const finish = (event) => {
    if (!currentObject || (event?.pointerId != null && currentPointerId !== event.pointerId)) return;
    try { overlay.releasePointerCapture?.(currentPointerId); } catch (_) { /* optional */ }
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    finishMutation('draw');
  };
  overlay.addEventListener('pointerup', finish);
  overlay.addEventListener('pointercancel', finish);
  overlay.addEventListener('lostpointercapture', finish);
}

function iconMarkup(name) {
  const common = 'viewBox="0 0 28 28" aria-hidden="true" focusable="false"';
  const icons = {
    trigger: `<svg ${common}><path d="M5 20.5 7.8 13l9.8-9.8 4.2 4.2-9.8 9.8L5 20.5Z" fill="#f3c24f" stroke="#77541c"/><path d="m17.6 3.2 4.2 4.2" stroke="#77541c" stroke-width="1.5"/><path d="M5 20.5 4 24l3.5-1 4.5-5.8" fill="#2d78b6" stroke="#345e80"/><path d="M15 22c2.5-3.2 4.5-2.3 7.5-1" fill="none" stroke="#2f7bc0" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    new: `<svg ${common}><path d="M7 3h10l5 5v17H7Z" fill="#fff" stroke="#4d6d86"/><path d="M17 3v6h5" fill="#dcecff" stroke="#4d6d86"/></svg>`,
    open: `<svg ${common}><path d="M3 8h9l2 2h11l-3 13H5Z" fill="#efb64f" stroke="#805d1f"/><path d="M4 8V5h8l2 3" fill="#ffe0a1" stroke="#805d1f"/></svg>`,
    save: `<svg ${common}><rect x="4" y="3" width="20" height="22" rx="1" fill="#7857b8" stroke="#44306f"/><rect x="8" y="4" width="11" height="7" fill="#fff"/><rect x="8" y="16" width="12" height="8" fill="#e8def8"/></svg>`,
    select: `<svg ${common}><rect x="4" y="4" width="20" height="20" fill="none" stroke="#2479b8" stroke-width="1.8" stroke-dasharray="3 2"/></svg>`,
    pencil: `<svg ${common}><path d="M5 22 8 14 20 2l6 6-12 12Z" fill="#f2c44e" stroke="#6e4d18"/><path d="m20 2 6 6" stroke="#6e4d18"/><path d="m5 22-1 3 3-1" fill="#333"/></svg>`,
    brush: `<svg ${common}><path d="M15 3c3-2 7 1 5 5l-8 11-5-4Z" fill="#d88a38" stroke="#694215"/><path d="M7 15c-5 1-6 5-3 9 4 0 8-2 8-6Z" fill="#406fa2" stroke="#26496e"/></svg>`,
    eraser: `<svg ${common}><path d="m5 18 10-13 8 7-10 13H8Z" fill="#f07a8c" stroke="#80414c"/><path d="m14 19 4-5 5 4-4 5H8" fill="#dce8ef" stroke="#6b7c86"/></svg>`,
    eyedropper: `<svg ${common}><path d="m7 22 9-9" stroke="#245d83" stroke-width="3"/><path d="m14 8 5-5 6 6-5 5Z" fill="#6f9fc0" stroke="#315c78"/><circle cx="6" cy="23" r="2" fill="#39a8d8"/></svg>`,
    text: `<svg ${common}><path d="M6 23h16M9 23l6-19 6 19M11 16h8" fill="none" stroke="#2b4860" stroke-width="2.2"/></svg>`,
    line: `<svg ${common}><path d="M5 23 23 5" stroke="#111" stroke-width="2" stroke-linecap="round"/></svg>`,
    arrow: `<svg ${common}><path d="M5 23 23 5M14 5h9v9" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    ellipse: `<svg ${common}><ellipse cx="14" cy="14" rx="10" ry="9" fill="none" stroke="#1b70aa" stroke-width="2"/></svg>`,
    rect: `<svg ${common}><rect x="5" y="5" width="18" height="18" fill="none" stroke="#1b70aa" stroke-width="2"/></svg>`,
    polygon: `<svg ${common}><polygon points="14,3 25,11 21,24 7,24 3,11" fill="none" stroke="#1b70aa" stroke-width="2"/></svg>`,
    fill: `<svg ${common}><path d="m8 4 12 12-8 8L2 14Z" fill="#4ba4d0" stroke="#285a75"/><path d="M18 21c0-3 2-5 4-7 2 2 4 4 4 7a4 4 0 0 1-8 0Z" fill="#63b4e3"/></svg>`,
    undo: `<svg ${common}><path d="M10 8H4l5-5M5 8c9-3 18 2 18 10 0 5-4 8-9 8" fill="none" stroke="#1f6fac" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    redo: `<svg ${common}><path d="M18 8h6l-5-5M23 8C14 5 5 10 5 18c0 5 4 8 9 8" fill="none" stroke="#8ca2b2" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    clear: `<svg ${common}><path d="M8 7h12l-1 18H9ZM6 7h16M11 7V3h6v4" fill="#ef5b48" stroke="#823125" stroke-width="1.3"/><path d="M12 11v10M16 11v10" stroke="#fff"/></svg>`,
    hide: `<svg ${common}><path d="M2 14s4.5-7 12-7 12 7 12 7-4.5 7-12 7S2 14 2 14Z" fill="#dff4ff" stroke="#28709f" stroke-width="1.5"/><circle cx="14" cy="14" r="4" fill="#4d89b5"/><circle cx="14" cy="14" r="1.5" fill="#173f5d"/></svg>`,
    colors: `<svg ${common}><circle cx="14" cy="14" r="11" fill="#fff" stroke="#667"/><path d="M14 3a11 11 0 0 1 9.5 5.5L14 14Z" fill="#e53935"/><path d="M23.5 8.5A11 11 0 0 1 22 20L14 14Z" fill="#f6c52e"/><path d="M22 20A11 11 0 0 1 8 24L14 14Z" fill="#27ae60"/><path d="M8 24A11 11 0 0 1 3 9L14 14Z" fill="#3498db"/><path d="M3 9A11 11 0 0 1 14 3v11Z" fill="#8e44ad"/><circle cx="14" cy="14" r="3" fill="#fff"/></svg>`,
  };
  return icons[name] || icons.pencil;
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  const ribbonTop = Math.round(numberParam('drawingRibbonTop', 40, 32, 90));
  const ribbonHeight = Math.round(numberParam('drawingRibbonHeight', 138, 108, 190));
  style.textContent = `
    #${TOOLBAR_ID} {
      width: 316px !important;
      min-width: 316px !important;
      max-width: 316px !important;
      transform: translateX(-102px) !important;
      transform-origin: top left !important;
      overflow: visible !important;
    }
    #${TRIGGER_ID} {
      flex: 0 0 30px !important; width: 30px !important; min-width: 30px !important; max-width: 30px !important;
      height: 30px !important; min-height: 30px !important; max-height: 30px !important; margin: 0 !important; padding: 4px !important;
      border: 1px solid #8d969f !important; border-radius: 0 !important; background: linear-gradient(#fff,#dedede) !important;
      display: inline-flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important;
      visibility: visible !important; opacity: 1 !important; pointer-events: auto !important; user-select: none !important;
      touch-action: manipulation !important; box-shadow: 0 1px 3px rgba(0,0,0,.18) !important; box-sizing: border-box !important;
    }
    #${TRIGGER_ID}:hover, #${TRIGGER_ID}[aria-expanded="true"] { background: linear-gradient(#fff,#dcecff) !important; border-color:#477da8 !important; }
    #${TRIGGER_ID} svg { width:20px !important; height:20px !important; display:block !important; pointer-events:none !important; }
    #${RIBBON_ID} {
      position: fixed !important; left: 0 !important; right: 0 !important; top: ${ribbonTop}px !important;
      height: ${ribbonHeight}px !important; min-height: ${ribbonHeight}px !important; max-height: ${ribbonHeight}px !important;
      z-index: 2147483300 !important; display: flex !important; align-items: stretch !important; direction: rtl !important;
      overflow-x: auto !important; overflow-y: hidden !important; background: linear-gradient(#fbfbfb,#f0f0f0) !important;
      border-top: 1px solid #d1d1d1 !important; border-bottom: 1px solid #aaa !important; box-shadow: 0 2px 5px rgba(0,0,0,.13) !important;
      font-family: Tahoma, "Segoe UI", Arial, sans-serif !important; color:#222 !important; box-sizing:border-box !important;
    }
    #${RIBBON_ID}[hidden] { display:none !important; }
    #${RIBBON_ID}, #${RIBBON_ID} * { box-sizing:border-box !important; }
    #${RIBBON_ID} .gz462-groups { min-width:max-content !important; width:100% !important; height:100% !important; display:flex !important; flex-direction:row !important; direction:rtl !important; align-items:stretch !important; }
    #${RIBBON_ID} .gz462-group { position:relative !important; flex:0 0 auto !important; min-width:106px !important; height:100% !important; display:flex !important; align-items:flex-start !important; justify-content:center !important; gap:5px !important; padding:10px 9px 28px !important; border-left:1px solid #d7d7d7 !important; direction:rtl !important; }
    #${RIBBON_ID} .gz462-group.gz462-wide { min-width:250px !important; }
    #${RIBBON_ID} .gz462-group.gz462-colors { min-width:210px !important; }
    #${RIBBON_ID} .gz462-group-title { position:absolute !important; right:0 !important; left:0 !important; bottom:4px !important; height:20px !important; text-align:center !important; color:#555 !important; font-size:13px !important; font-weight:600 !important; line-height:20px !important; white-space:nowrap !important; }
    #${RIBBON_ID} .gz462-tool { min-width:55px !important; height:78px !important; padding:5px 4px !important; border:1px solid transparent !important; border-radius:2px !important; background:transparent !important; display:inline-flex !important; flex-direction:column !important; align-items:center !important; justify-content:flex-start !important; gap:4px !important; color:#222 !important; cursor:pointer !important; font:600 12px/1.2 Tahoma,"Segoe UI",Arial,sans-serif !important; white-space:nowrap !important; pointer-events:auto !important; }
    #${RIBBON_ID} .gz462-tool:hover { background:#eaf3fd !important; border-color:#aac8e7 !important; }
    #${RIBBON_ID} .gz462-tool[data-active="true"] { background:linear-gradient(#eaf5ff,#cce5ff) !important; border-color:#4c9be8 !important; box-shadow:inset 0 0 0 1px #fff !important; }
    #${RIBBON_ID} .gz462-tool svg { width:34px !important; height:34px !important; flex:0 0 34px !important; pointer-events:none !important; }
    #${RIBBON_ID} .gz462-tool.gz462-small { min-width:46px !important; height:65px !important; }
    #${RIBBON_ID} .gz462-tool.gz462-small svg { width:28px !important; height:28px !important; flex-basis:28px !important; }
    #${RIBBON_ID} .gz462-swatches { display:flex !important; gap:6px !important; align-items:flex-start !important; }
    #${RIBBON_ID} .gz462-swatch { width:54px !important; height:78px !important; padding:5px !important; display:flex !important; flex-direction:column !important; align-items:center !important; gap:5px !important; border:1px solid transparent !important; background:transparent !important; cursor:pointer !important; font:600 12px Tahoma,Arial,sans-serif !important; }
    #${RIBBON_ID} .gz462-swatch[data-active="true"] { border-color:#4c9be8 !important; background:#eaf5ff !important; }
    #${RIBBON_ID} .gz462-swatch-box { width:42px !important; height:42px !important; border:2px solid #777 !important; box-shadow:inset 0 0 0 1px #fff !important; }
    #${RIBBON_ID} .gz462-thickness { width:72px !important; height:78px !important; display:flex !important; flex-direction:column !important; align-items:center !important; gap:8px !important; padding:5px !important; }
    #${RIBBON_ID} .gz462-thickness-lines { width:48px !important; height:38px !important; display:flex !important; flex-direction:column !important; justify-content:space-around !important; }
    #${RIBBON_ID} .gz462-thickness-lines span { display:block !important; width:48px !important; background:#345675 !important; }
    #${RIBBON_ID} select { height:25px !important; min-width:66px !important; border:1px solid #aaa !important; background:#fff !important; font:600 12px Tahoma,Arial,sans-serif !important; }
    #${COLOR_PANEL_ID} {
      position:fixed !important; width:360px !important; padding:12px !important; z-index:2147483647 !important;
      background:#fff !important; border:1px solid #aaa !important; box-shadow:0 7px 22px rgba(0,0,0,.28) !important;
      direction:rtl !important; font-family:Tahoma,"Segoe UI",Arial,sans-serif !important; box-sizing:border-box !important;
    }
    #${COLOR_PANEL_ID}[hidden] { display:none !important; }
    #${COLOR_PANEL_ID} .gz462-color-head { display:grid !important; grid-template-columns:1fr 42px 1fr !important; gap:8px !important; align-items:center !important; margin-bottom:10px !important; font-size:14px !important; }
    #${COLOR_PANEL_ID} .gz462-color-preview { display:flex !important; align-items:center !important; gap:7px !important; }
    #${COLOR_PANEL_ID} .gz462-color-chip { width:30px !important; height:30px !important; border:1px solid #666 !important; }
    #${COLOR_PANEL_ID} .gz462-swap { width:38px !important; height:32px !important; border:1px solid #aaa !important; background:#f3f3f3 !important; font-size:22px !important; cursor:pointer !important; }
    #${COLOR_PANEL_ID} .gz462-palette { display:grid !important; grid-template-columns:repeat(10, 28px) !important; gap:5px !important; justify-content:center !important; padding:8px 0 12px !important; border-top:1px solid #ddd !important; border-bottom:1px solid #ddd !important; }
    #${COLOR_PANEL_ID} .gz462-color { width:28px !important; height:28px !important; border:1px solid #777 !important; padding:0 !important; cursor:pointer !important; }
    #${COLOR_PANEL_ID} .gz462-custom { margin-top:10px !important; display:flex !important; align-items:center !important; justify-content:space-between !important; gap:10px !important; font-size:14px !important; }
    #${COLOR_PANEL_ID} input[type="color"] { width:52px !important; height:34px !important; padding:0 !important; border:1px solid #999 !important; }
    #${OVERLAY_ID} { position:fixed !important; z-index:2147482500 !important; margin:0 !important; padding:0 !important; border:0 !important; background:transparent !important; touch-action:none !important; user-select:none !important; }
  `;
}

function toolButton(action, label, icon, extra = '') {
  return `<button type="button" class="gz462-tool ${extra}" data-action="${action}" title="${label}">${iconMarkup(icon)}<span>${label}</span></button>`;
}

function createRibbon() {
  const ribbon = document.createElement('div');
  ribbon.id = RIBBON_ID;
  ribbon.hidden = !ribbonOpen;
  ribbon.classList.add('gannzilla-chart-toolbar-v328');
  ribbon.setAttribute('data-gannzilla-control-strip', 'true');
  ribbon.setAttribute('role', 'toolbar');
  ribbon.setAttribute('aria-label', 'أدوات الرسم اليدوي');
  ribbon.innerHTML = `
    <div class="gz462-groups">
      <section class="gz462-group">
        ${toolButton('new', 'جديد', 'new', 'gz462-small')}
        ${toolButton('open', 'فتح', 'open', 'gz462-small')}
        ${toolButton('save', 'حفظ', 'save', 'gz462-small')}
        <span class="gz462-group-title">ملف</span>
      </section>
      <section class="gz462-group">
        ${toolButton('undo', 'تراجع', 'undo', 'gz462-small')}
        ${toolButton('redo', 'إعادة', 'redo', 'gz462-small')}
        ${toolButton('clear', 'مسح الكل', 'clear', 'gz462-small')}
        ${toolButton('visibility', 'إخفاء الرسم', 'hide', 'gz462-small')}
        <span class="gz462-group-title">تحكم</span>
      </section>
      <section class="gz462-group">
        ${toolButton('tool:select', 'تحديد', 'select')}
        <span class="gz462-group-title">صورة</span>
      </section>
      <section class="gz462-group gz462-wide">
        ${toolButton('tool:pencil', 'قلم', 'pencil')}
        ${toolButton('tool:eraser', 'ممحاة', 'eraser')}
        ${toolButton('tool:eyedropper', 'قطّارة', 'eyedropper')}
        ${toolButton('tool:text', 'نص', 'text')}
        <span class="gz462-group-title">أدوات</span>
      </section>
      <section class="gz462-group">
        ${toolButton('tool:brush', 'فرشاة', 'brush')}
        <span class="gz462-group-title">فرشاة</span>
      </section>
      <section class="gz462-group gz462-wide">
        ${toolButton('tool:line', 'خط', 'line')}
        ${toolButton('tool:arrow', 'سهم', 'arrow')}
        ${toolButton('tool:ellipse', 'دائرة', 'ellipse')}
        ${toolButton('tool:rect', 'مستطيل', 'rect')}
        ${toolButton('tool:polygon', 'مضلع', 'polygon')}
        <span class="gz462-group-title">أشكال</span>
      </section>
      <section class="gz462-group">
        ${toolButton('fill', 'تعبئة', 'fill')}
        <span class="gz462-group-title">تعبئة</span>
      </section>
      <section class="gz462-group">
        <div class="gz462-thickness">
          <div class="gz462-thickness-lines"><span style="height:1px"></span><span style="height:3px"></span><span style="height:6px"></span><span style="height:9px"></span></div>
          <select data-action="width" aria-label="سماكة الخط">
            <option value="2">2</option><option value="4">4</option><option value="6">6</option><option value="10">10</option><option value="14">14</option>
          </select>
        </div>
        <span class="gz462-group-title">الحجم</span>
      </section>
      <section class="gz462-group gz462-colors">
        <div class="gz462-swatches">
          <button type="button" class="gz462-swatch" data-color-target="primary"><span class="gz462-swatch-box"></span><span>اللون 1</span></button>
          <button type="button" class="gz462-swatch" data-color-target="secondary"><span class="gz462-swatch-box"></span><span>اللون 2</span></button>
          ${toolButton('colors', 'الألوان', 'colors')}
        </div>
        <span class="gz462-group-title">الألوان</span>
      </section>
    </div>
  `;
  document.body.appendChild(ribbon);

  ribbon.querySelectorAll('[data-action]').forEach((button) => {
    const action = button.getAttribute('data-action');
    if (action === 'width') {
      button.value = String(lineWidth);
      button.addEventListener('change', () => {
        lineWidth = Number(button.value) || 4;
        persist();
        updateRibbonState();
      });
      return;
    }
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleRibbonAction(action, button);
    });
  });
  ribbon.querySelectorAll('[data-color-target]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      colorTarget = button.getAttribute('data-color-target') === 'secondary' ? 'secondary' : 'primary';
      colorPanelOpen = true;
      updateRibbonState();
      positionColorPanel();
    });
  });
  updateRibbonState();
  return ribbon;
}

function createColorPanel() {
  const panel = document.createElement('div');
  panel.id = COLOR_PANEL_ID;
  panel.hidden = true;
  panel.classList.add('gannzilla-chart-toolbar-v328');
  panel.setAttribute('data-gannzilla-control-strip', 'true');
  panel.innerHTML = `
    <div class="gz462-color-head">
      <div class="gz462-color-preview"><span class="gz462-color-chip" data-preview="primary"></span><span>اللون 1 (الرسم)</span></div>
      <button type="button" class="gz462-swap" title="تبديل اللونين">⇄</button>
      <div class="gz462-color-preview"><span class="gz462-color-chip" data-preview="secondary"></span><span>اللون 2 (التعبئة)</span></div>
    </div>
    <div class="gz462-palette">${PALETTE.map((color) => `<button type="button" class="gz462-color" data-color="${color}" style="background:${color}" title="${color}"></button>`).join('')}</div>
    <div class="gz462-custom"><span>لون مخصص</span><input type="color" value="${primaryColor}" aria-label="لون مخصص"></div>
  `;
  panel.querySelectorAll('[data-color]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setTargetColor(button.getAttribute('data-color'));
    });
  });
  panel.querySelector('.gz462-swap')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const temp = primaryColor;
    primaryColor = secondaryColor;
    secondaryColor = temp;
    persist();
    updateRibbonState();
  });
  panel.querySelector('input[type="color"]')?.addEventListener('input', (event) => setTargetColor(event.target.value));
  document.body.appendChild(panel);
  updateColorPanel();
  return panel;
}

function setTargetColor(color) {
  if (!/^#[0-9a-f]{6}$/i.test(String(color || ''))) return;
  if (colorTarget === 'secondary') secondaryColor = color;
  else primaryColor = color;
  persist();
  updateRibbonState();
  updateColorPanel();
}

function updateColorPanel() {
  const panel = document.getElementById(COLOR_PANEL_ID);
  if (!(panel instanceof HTMLElement)) return;
  const p = panel.querySelector('[data-preview="primary"]');
  const s = panel.querySelector('[data-preview="secondary"]');
  if (p instanceof HTMLElement) p.style.background = primaryColor;
  if (s instanceof HTMLElement) s.style.background = secondaryColor;
  const custom = panel.querySelector('input[type="color"]');
  if (custom instanceof HTMLInputElement) custom.value = colorTarget === 'secondary' ? secondaryColor : primaryColor;
}

function positionColorPanel() {
  const panel = document.getElementById(COLOR_PANEL_ID) || createColorPanel();
  const button = document.querySelector(`#${RIBBON_ID} [data-action="colors"]`);
  panel.hidden = !colorPanelOpen;
  if (!colorPanelOpen || !(button instanceof HTMLElement)) return;
  updateColorPanel();
  const rect = button.getBoundingClientRect();
  const width = 360;
  const left = Math.max(6, Math.min(window.innerWidth - width - 6, Math.round(rect.right - width)));
  panel.style.setProperty('left', `${left}px`, 'important');
  panel.style.setProperty('top', `${Math.round(rect.bottom + 3)}px`, 'important');
}

function updateRibbonState() {
  const ribbon = document.getElementById(RIBBON_ID);
  if (!(ribbon instanceof HTMLElement)) return;
  ribbon.hidden = !ribbonOpen;
  ribbon.querySelectorAll('[data-action^="tool:"]').forEach((button) => {
    button.dataset.active = button.getAttribute('data-action') === `tool:${activeTool}` ? 'true' : 'false';
  });
  const fill = ribbon.querySelector('[data-action="fill"]');
  if (fill instanceof HTMLElement) fill.dataset.active = fillShapes ? 'true' : 'false';
  const visibility = ribbon.querySelector('[data-action="visibility"] span');
  if (visibility) visibility.textContent = drawingVisible ? 'إخفاء الرسم' : 'إظهار الرسم';
  const widthSelect = ribbon.querySelector('[data-action="width"]');
  if (widthSelect instanceof HTMLSelectElement) {
    const values = [...widthSelect.options].map((option) => Number(option.value));
    if (values.includes(lineWidth)) widthSelect.value = String(lineWidth);
  }
  ribbon.querySelectorAll('[data-color-target]').forEach((button) => {
    const target = button.getAttribute('data-color-target');
    button.dataset.active = target === colorTarget ? 'true' : 'false';
    const box = button.querySelector('.gz462-swatch-box');
    if (box instanceof HTMLElement) box.style.background = target === 'secondary' ? secondaryColor : primaryColor;
  });
  updateControlStates();
  updateColorPanel();
  scheduleOverlay();
}

function updateControlStates() {
  const ribbon = document.getElementById(RIBBON_ID);
  if (!(ribbon instanceof HTMLElement)) return;
  const undo = ribbon.querySelector('[data-action="undo"]');
  const redo = ribbon.querySelector('[data-action="redo"]');
  if (undo instanceof HTMLButtonElement) undo.disabled = undoStack.length === 0;
  if (redo instanceof HTMLButtonElement) redo.disabled = redoStack.length === 0;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

function exportPng() {
  const wheel = findWheelCanvas();
  const overlay = ensureOverlay();
  if (!(wheel instanceof HTMLCanvasElement)) return;
  renderOverlay();
  const output = document.createElement('canvas');
  output.width = wheel.width;
  output.height = wheel.height;
  const ctx = output.getContext('2d');
  ctx.drawImage(wheel, 0, 0, output.width, output.height);
  if (drawingVisible && drawings.length) ctx.drawImage(overlay, 0, 0, output.width, output.height);
  output.toBlob((blob) => { if (blob) downloadBlob(blob, `gannzilla-drawing-${Date.now()}.png`); }, 'image/png');
}

function exportProject() {
  const payload = { build: BUILD, drawings, prefs: { primaryColor, secondaryColor, lineWidth, fillShapes, drawingVisible } };
  downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `gannzilla-drawing-${Date.now()}.json`);
}

function importProject(file) {
  if (!file) return;
  file.text().then((text) => {
    const value = JSON.parse(text);
    const next = Array.isArray(value) ? value : value?.drawings;
    if (!Array.isArray(next)) throw new Error('INVALID_DRAWING_FILE');
    saveHistory();
    drawings = next;
    if (value?.prefs) {
      primaryColor = value.prefs.primaryColor || primaryColor;
      secondaryColor = value.prefs.secondaryColor || secondaryColor;
      lineWidth = Number(value.prefs.lineWidth) || lineWidth;
      fillShapes = value.prefs.fillShapes === true;
      drawingVisible = value.prefs.drawingVisible !== false;
    }
    finishMutation('import');
    updateRibbonState();
  }).catch(() => window.alert('ملف الرسم غير صالح'));
}

function handleRibbonAction(action) {
  if (!action) return;
  if (action.startsWith('tool:')) {
    activeTool = action.slice(5);
    persist();
    updateRibbonState();
    return;
  }
  if (action === 'fill') {
    fillShapes = !fillShapes;
  } else if (action === 'colors') {
    colorPanelOpen = !colorPanelOpen;
    positionColorPanel();
    return;
  } else if (action === 'undo' && undoStack.length) {
    redoStack.push(clone(drawings));
    drawings = undoStack.pop();
  } else if (action === 'redo' && redoStack.length) {
    undoStack.push(clone(drawings));
    drawings = redoStack.pop();
  } else if (action === 'clear') {
    if (!drawings.length || !window.confirm('مسح جميع الرسومات اليدوية؟')) return;
    saveHistory();
    drawings = [];
  } else if (action === 'visibility') {
    drawingVisible = !drawingVisible;
  } else if (action === 'new') {
    if (drawings.length && !window.confirm('بدء رسم جديد ومسح الرسم الحالي؟')) return;
    saveHistory();
    drawings = [];
  } else if (action === 'open') {
    document.getElementById(FILE_INPUT_ID)?.click();
    return;
  } else if (action === 'save') {
    exportPng();
    exportProject();
    return;
  }
  persist();
  updateRibbonState();
  scheduleOverlay();
  actionCount += 1;
  lastAction = { source: action, drawings: drawings.length, at: Date.now() };
}

function createTrigger() {
  const trigger = document.createElement('span');
  trigger.id = TRIGGER_ID;
  trigger.tabIndex = 0;
  trigger.innerHTML = iconMarkup('trigger');
  trigger.title = 'أدوات الرسم اليدوي';
  trigger.setAttribute('aria-label', 'إظهار أو إخفاء أدوات الرسم اليدوي');
  trigger.setAttribute('aria-expanded', ribbonOpen ? 'true' : 'false');
  const toggle = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setRibbonOpen(!ribbonOpen);
  };
  trigger.addEventListener('click', toggle);
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') toggle(event);
  });
  return trigger;
}

function clearHiddenState(node) {
  if (!(node instanceof HTMLElement)) return;
  node.hidden = false;
  node.removeAttribute('aria-hidden');
  node.removeAttribute('data-gannzilla-v145-hidden');
  node.removeAttribute('data-gannzilla-v145-previous-display');
  node.removeAttribute('data-gannzilla-toolbar-duplicate-hidden-v396');
  node.removeAttribute('data-gannzilla-duplicate-toolbar-v393');
  node.style.setProperty('display', 'inline-flex', 'important');
  node.style.setProperty('visibility', 'visible', 'important');
  node.style.setProperty('opacity', '1', 'important');
  node.style.setProperty('pointer-events', 'auto', 'important');
}

function rememberLayout(node, properties) {
  if (!(node instanceof HTMLElement) || layoutOriginal.has(node)) return;
  const values = {};
  properties.forEach((property) => {
    values[property] = {
      value: node.style.getPropertyValue(property),
      priority: node.style.getPropertyPriority(property),
    };
  });
  layoutOriginal.set(node, values);
}

function applyContentOffset() {
  window.cancelAnimationFrame(layoutFrame);
  layoutFrame = window.requestAnimationFrame(() => {
    const ribbonTop = Math.round(numberParam('drawingRibbonTop', 40, 32, 90));
    const ribbonHeight = Math.round(numberParam('drawingRibbonHeight', 138, 108, 190));
    const contentTop = ribbonTop + ribbonHeight + 4;
    const panel = document.getElementById(PANEL_ID);
    const viewport = findWheelViewport();
    if (ribbonOpen) {
      if (panel instanceof HTMLElement) {
        rememberLayout(panel, ['top', 'height']);
        panel.style.setProperty('top', `${contentTop}px`, 'important');
        panel.style.setProperty('height', `calc(100vh - ${contentTop}px)`, 'important');
      }
      if (viewport instanceof HTMLElement) {
        rememberLayout(viewport, ['top', 'bottom']);
        viewport.style.setProperty('top', `${contentTop}px`, 'important');
        viewport.style.setProperty('bottom', '0px', 'important');
      }
    } else {
      layoutOriginal.forEach((snapshot, node) => {
        if (!(node instanceof HTMLElement) || !node.isConnected) return;
        Object.entries(snapshot).forEach(([property, saved]) => {
          if (saved.value) node.style.setProperty(property, saved.value, saved.priority || '');
          else node.style.removeProperty(property);
        });
      });
      layoutOriginal.clear();
    }
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new CustomEvent('gannzilla:manual-drawing-ribbon-layout-v462', {
      detail: { open: ribbonOpen, contentTop, build: BUILD },
    }));
    scheduleOverlay();
  });
}

function setRibbonOpen(open) {
  ribbonOpen = Boolean(open);
  if (!ribbonOpen) colorPanelOpen = false;
  const trigger = document.getElementById(TRIGGER_ID);
  trigger?.setAttribute('aria-expanded', ribbonOpen ? 'true' : 'false');
  const ribbon = document.getElementById(RIBBON_ID) || createRibbon();
  ribbon.hidden = !ribbonOpen;
  const colorPanel = document.getElementById(COLOR_PANEL_ID);
  if (colorPanel instanceof HTMLElement) colorPanel.hidden = !colorPanelOpen;
  persist();
  persistUrlState();
  updateRibbonState();
  applyContentOffset();
  lastAction = { source: ribbonOpen ? 'ribbon-open' : 'ribbon-close', at: Date.now() };
}

function mount() {
  installStyle();
  const root = document.getElementById(TOOLBAR_ID);
  if (!(root instanceof HTMLElement)) return false;
  root.classList.add('gannzilla-chart-toolbar-v328');
  root.setAttribute('data-gannzilla-control-strip', 'true');
  root.style.setProperty('overflow', 'visible', 'important');

  let trigger = document.getElementById(TRIGGER_ID);
  if (!(trigger instanceof HTMLElement)) trigger = createTrigger();
  const shapesTrigger = document.getElementById(SHAPES_TRIGGER_ID);
  const firstEye = document.getElementById(FIRST_EYE_ID);
  const anchor = shapesTrigger instanceof HTMLElement && shapesTrigger.parentElement === root
    ? shapesTrigger
    : firstEye instanceof HTMLElement && firstEye.parentElement === root
      ? firstEye
      : root.firstElementChild;
  if (trigger.parentElement !== root || trigger.nextElementSibling !== anchor) root.insertBefore(trigger, anchor || null);
  clearHiddenState(trigger);

  if (!document.getElementById(RIBBON_ID)) createRibbon();
  if (!document.getElementById(COLOR_PANEL_ID)) createColorPanel();
  if (!document.getElementById(FILE_INPUT_ID)) {
    const input = document.createElement('input');
    input.id = FILE_INPUT_ID;
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.hidden = true;
    input.addEventListener('change', () => {
      importProject(input.files?.[0]);
      input.value = '';
    });
    document.body.appendChild(input);
  }
  ensureOverlay();
  trigger.setAttribute('aria-expanded', ribbonOpen ? 'true' : 'false');
  updateRibbonState();
  applyContentOffset();
  scheduleOverlay();
  root.dataset.gannzillaManualDrawingRibbonV462 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showManualDrawingRibbon', true) || window[STATE_KEY]) return;

  let frame = 0;
  let rootObserver = null;
  let observedRoot = null;
  const scheduleMount = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      const mounted = mount();
      const root = document.getElementById(TOOLBAR_ID);
      if (mounted && root instanceof HTMLElement && root !== observedRoot && typeof MutationObserver === 'function') {
        rootObserver?.disconnect();
        observedRoot = root;
        rootObserver = new MutationObserver(scheduleMount);
        rootObserver.observe(root, { childList: true });
      }
    });
  };

  scheduleMount();
  const timers = [30, 100, 250, 600, 1200, 2400, 4500].map((delay) => window.setTimeout(scheduleMount, delay));
  const onDocumentClick = (event) => {
    if (!colorPanelOpen) return;
    const panel = document.getElementById(COLOR_PANEL_ID);
    const colorButton = document.querySelector(`#${RIBBON_ID} [data-action="colors"]`);
    if (panel?.contains(event.target) || colorButton?.contains(event.target)) return;
    colorPanelOpen = false;
    positionColorPanel();
  };
  const onKeyDown = (event) => {
    if (event.key === 'Escape' && colorPanelOpen) {
      colorPanelOpen = false;
      positionColorPanel();
    }
  };
  const onViewportChange = () => {
    if (colorPanelOpen) positionColorPanel();
    scheduleOverlay();
  };

  document.addEventListener('click', onDocumentClick, true);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('fullscreenchange', onViewportChange);
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('scroll', onViewportChange, true);
  window.addEventListener('gannzilla:wheel-input-v459', scheduleOverlay);
  window.addEventListener('gannzilla:page-scrollbar-pan-v305', scheduleOverlay);
  window.addEventListener('gannzilla:wheel-pan-offset-v305', scheduleOverlay);
  window.addEventListener('gannzilla:unified-wheel-tools-v453', scheduleOverlay);
  window.addEventListener('gannzilla:layout-panel-visibility-change', () => { applyContentOffset(); scheduleOverlay(); });
  window.addEventListener('gannzilla:ring-two-numbering-refresh', scheduleOverlay);

  window.GANNZILLA_MANUAL_DRAWING_RIBBON_V462 = true;
  window.__auditGannzillaManualDrawingRibbonV462 = () => {
    const root = document.getElementById(TOOLBAR_ID);
    const trigger = document.getElementById(TRIGGER_ID);
    const ribbon = document.getElementById(RIBBON_ID);
    const overlay = document.getElementById(OVERLAY_ID);
    const rect = trigger?.getBoundingClientRect();
    return {
      ok: Boolean(root && trigger && ribbon && overlay && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showManualDrawingRibbon', true),
      ribbonOpen,
      colorPanelOpen,
      activeTool,
      drawingVisible,
      drawingCount: drawings.length,
      undoDepth: undoStack.length,
      redoDepth: redoStack.length,
      triggerImmediatelyLeftOfShapesMenu: trigger?.nextElementSibling?.id === SHAPES_TRIGGER_ID,
      colorsHiddenUntilRequested: true,
      scopedToolbarObserverOnly: true,
      actionCount,
      lastAction,
    };
  };

  window[STATE_KEY] = {
    timers,
    get rootObserver() { return rootObserver; },
    onDocumentClick,
    onKeyDown,
    onViewportChange,
  };
}

install();
