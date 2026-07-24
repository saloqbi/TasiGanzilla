const BUILD = 471;
const ROOT_ID = 'gannzilla-unified-wheel-tools-v453';
const TRIGGER_ID = 'gannzilla-top-center-drawing-trigger-v471';
const TOOLBAR_ID = 'gannzilla-top-center-drawing-toolbar-v471';
const OVERLAY_ID = 'gannzilla-top-center-drawing-overlay-v471';
const FILE_ID = 'gannzilla-top-center-drawing-file-v471';
const STYLE_ID = 'gannzilla-top-center-drawing-style-v471';
const STATE_KEY = '__gannzillaTopCenterDrawingToolbarV471';
const STORE_KEY = 'tasi-gannzilla-top-center-drawings-v471';
const PREF_KEY = 'tasi-gannzilla-top-center-prefs-v471';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}
function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}
function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}
function wheelMode() {
  return params().get('gannzillaPro') === 'true' || params().get('wheelPro') === 'true';
}
function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch (_) { return fallback; }
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function uid() { return `gz471-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }

const saved = readJson(PREF_KEY, {});
let toolbarOpen = params().has('topDrawingToolbarOpen') ? boolParam('topDrawingToolbarOpen', true) : saved.toolbarOpen !== false;
let activeTool = typeof saved.activeTool === 'string' ? saved.activeTool : 'hand';
let drawings = Array.isArray(readJson(STORE_KEY, [])) ? readJson(STORE_KEY, []) : [];
let undoStack = [];
let redoStack = [];
let selectedId = null;
let current = null;
let pointerId = null;
let moving = null;
let overlayFrame = 0;
let layoutFrame = 0;
let wheelObserver = null;
let observedWheel = null;
let rootObserver = null;
let actionCount = 0;
let lastAction = null;
const imageCache = new Map();

function persist() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(drawings)); } catch (_) { /* runtime only */ }
  try { localStorage.setItem(PREF_KEY, JSON.stringify({ toolbarOpen, activeTool })); } catch (_) { /* runtime only */ }
}
function persistUrl() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('showTopCenterDrawingToolbar', 'true');
    url.searchParams.set('topDrawingToolbarOpen', toolbarOpen ? 'true' : 'false');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) { /* runtime state remains active */ }
}

function findWheel() {
  const preferred = document.querySelector([
    'canvas[data-gannzilla-unified-wheel-tools-v453="true"]',
    'canvas[data-gannzilla-native-wheel-scrollbars-hidden-v417="true"]',
    'canvas[data-gannzilla-keyboard-mouse-control-v459="true"]',
  ].join(','));
  if (preferred instanceof HTMLCanvasElement && preferred.id !== OVERLAY_ID && !preferred.closest?.('aside')) return preferred;
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.id === OVERLAY_ID || canvas.closest?.('aside')) return false;
      const rect = canvas.getBoundingClientRect();
      const style = getComputedStyle(canvas);
      return canvas.width > 300 && canvas.height > 300 && rect.width > 250 && rect.height > 250 && style.display !== 'none' && style.visibility !== 'hidden';
    })
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
}
function point(event, rect) {
  return { x: clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1), y: clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1) };
}
function bounds(object) {
  const values = [];
  if (object.start) values.push(object.start);
  if (object.end) values.push(object.end);
  if (Array.isArray(object.points)) values.push(...object.points);
  if (object.type === 'text') values.push({ x: object.start.x + Math.max(.04, String(object.text || '').length * .018), y: object.start.y + .05 });
  if (object.type === 'image') values.push({ x: object.x, y: object.y }, { x: object.x + object.w, y: object.y + object.h });
  if (!values.length) return { x1: 0, y1: 0, x2: 0, y2: 0 };
  return { x1: Math.min(...values.map((p) => p.x)), y1: Math.min(...values.map((p) => p.y)), x2: Math.max(...values.map((p) => p.x)), y2: Math.max(...values.map((p) => p.y)) };
}
function hit(p) {
  for (let index = drawings.length - 1; index >= 0; index -= 1) {
    const b = bounds(drawings[index]);
    if (p.x >= b.x1 - .018 && p.x <= b.x2 + .018 && p.y >= b.y1 - .018 && p.y <= b.y2 + .018) return drawings[index];
  }
  return null;
}
function moveObject(object, dx, dy) {
  const movePoint = (p) => ({ x: clamp(p.x + dx, -1, 2), y: clamp(p.y + dy, -1, 2) });
  if (object.start) object.start = movePoint(object.start);
  if (object.end) object.end = movePoint(object.end);
  if (Array.isArray(object.points)) object.points = object.points.map(movePoint);
  if (object.type === 'image') { object.x += dx; object.y += dy; }
}
function getImage(src) {
  if (imageCache.has(src)) return imageCache.get(src);
  const image = new Image();
  image.onload = scheduleOverlay;
  image.src = src;
  imageCache.set(src, image);
  return image;
}
function drawObject(ctx, object, width, height) {
  const p = (value) => ({ x: value.x * width, y: value.y * height });
  const start = p(object.start || { x: 0, y: 0 });
  const end = p(object.end || object.start || { x: 0, y: 0 });
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const w = Math.abs(dx);
  const h = Math.abs(dy);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1, (object.width || 3) * Math.min(width, height) / 900);
  ctx.strokeStyle = object.color || '#1479bd';
  ctx.fillStyle = object.fillColor || object.color || '#1479bd';
  if (object.type === 'erase') ctx.globalCompositeOperation = 'destination-out';
  if (object.type === 'pencil' || object.type === 'erase') {
    const points = object.points || [];
    if (points.length) {
      ctx.beginPath();
      const first = p(points[0]);
      ctx.moveTo(first.x, first.y);
      points.slice(1).forEach((value) => { const next = p(value); ctx.lineTo(next.x, next.y); });
      ctx.stroke();
    }
  } else if (object.type === 'text') {
    ctx.font = `700 ${Math.max(14, (object.size || 28) * Math.min(width, height) / 900)}px Tahoma,Arial,sans-serif`;
    ctx.direction = 'rtl';
    ctx.textBaseline = 'top';
    ctx.fillText(object.text || '', start.x, start.y);
  } else if (object.type === 'image') {
    const image = getImage(object.src);
    if (image.complete) ctx.drawImage(image, object.x * width, object.y * height, object.w * width, object.h * height);
  } else if (object.type === 'line' || object.type === 'arrow') {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    if (object.type === 'arrow') {
      const angle = Math.atan2(dy, dx);
      const head = Math.max(10, ctx.lineWidth * 4);
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - head * Math.cos(angle - Math.PI / 7), end.y - head * Math.sin(angle - Math.PI / 7));
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - head * Math.cos(angle + Math.PI / 7), end.y - head * Math.sin(angle + Math.PI / 7));
      ctx.stroke();
    }
  } else if (object.type === 'rect' || object.type === 'roundRect') {
    if (object.fill) { ctx.globalAlpha = .2; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1; }
    if (object.type === 'roundRect') ctx.roundRect(x, y, w, h, Math.min(w, h) * .18);
    else ctx.rect(x, y, w, h);
    ctx.stroke();
  } else if (object.type === 'ellipse') {
    ctx.beginPath();
    ctx.ellipse((start.x + end.x) / 2, (start.y + end.y) / 2, Math.max(.5, w / 2), Math.max(.5, h / 2), 0, 0, Math.PI * 2);
    if (object.fill) { ctx.globalAlpha = .2; ctx.fill(); ctx.globalAlpha = 1; }
    ctx.stroke();
  } else if (object.type === 'triangle') {
    ctx.beginPath();
    ctx.moveTo((start.x + end.x) / 2, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    if (object.fill) { ctx.globalAlpha = .2; ctx.fill(); ctx.globalAlpha = 1; }
    ctx.stroke();
  }
  ctx.restore();
}
function renderOverlay() {
  const overlay = ensureOverlay();
  const wheel = findWheel();
  if (!wheel) { overlay.style.display = 'none'; return; }
  if (observedWheel !== wheel && typeof ResizeObserver === 'function') {
    wheelObserver?.disconnect();
    observedWheel = wheel;
    wheelObserver = new ResizeObserver(scheduleOverlay);
    wheelObserver.observe(wheel);
  }
  const rect = wheel.getBoundingClientRect();
  const dpr = clamp(devicePixelRatio || 1, 1, 2);
  overlay.width = Math.max(1, Math.round(rect.width * dpr));
  overlay.height = Math.max(1, Math.round(rect.height * dpr));
  Object.assign(overlay.style, { display: 'block', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
  overlay.style.pointerEvents = activeTool === 'hand' ? 'none' : 'auto';
  overlay.style.cursor = activeTool === 'text' ? 'text' : activeTool === 'erase' ? 'cell' : activeTool === 'hand' ? 'default' : 'crosshair';
  const ctx = overlay.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  drawings.forEach((object) => drawObject(ctx, object, rect.width, rect.height));
  if (selectedId) {
    const object = drawings.find((value) => value.id === selectedId);
    if (object) {
      const b = bounds(object);
      ctx.save();
      ctx.strokeStyle = '#1479bd';
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(b.x1 * rect.width, b.y1 * rect.height, Math.max(3, (b.x2 - b.x1) * rect.width), Math.max(3, (b.y2 - b.y1) * rect.height));
      ctx.restore();
    }
  }
}
function scheduleOverlay() {
  cancelAnimationFrame(overlayFrame);
  overlayFrame = requestAnimationFrame(renderOverlay);
}
function saveHistory() {
  undoStack.push(clone(drawings));
  if (undoStack.length > 50) undoStack.shift();
  redoStack = [];
  updateUi();
}
function finish(source) {
  current = null;
  pointerId = null;
  moving = null;
  persist();
  scheduleOverlay();
  actionCount += 1;
  lastAction = { source, activeTool, drawingCount: drawings.length, at: Date.now() };
  updateUi();
}
function undo() {
  if (!undoStack.length) return;
  redoStack.push(clone(drawings));
  drawings = undoStack.pop();
  selectedId = null;
  finish('undo');
}
function redo() {
  if (!redoStack.length) return;
  undoStack.push(clone(drawings));
  drawings = redoStack.pop();
  selectedId = null;
  finish('redo');
}
function selectTool(tool) {
  activeTool = tool;
  current = null;
  pointerId = null;
  moving = null;
  persist();
  updateUi();
  scheduleOverlay();
}
function bindOverlay(overlay) {
  overlay.addEventListener('pointerdown', (event) => {
    if (activeTool === 'hand' || event.button !== 0) return;
    const wheel = findWheel();
    if (!wheel) return;
    const p = point(event, wheel.getBoundingClientRect());
    if (activeTool === 'select') {
      const target = hit(p);
      selectedId = target?.id || null;
      if (target) { saveHistory(); moving = { start: p, original: clone(target) }; }
      scheduleOverlay();
      event.preventDefault(); event.stopPropagation();
      return;
    }
    if (activeTool === 'fill') {
      const target = hit(p);
      if (target) { saveHistory(); target.fill = true; target.fillColor = '#1479bd'; finish('fill'); }
      event.preventDefault(); event.stopPropagation();
      return;
    }
    if (activeTool === 'text') {
      const text = prompt('اكتب النص');
      if (text) { saveHistory(); drawings.push({ id: uid(), type: 'text', start: p, text, color: '#173f60', size: 28 }); finish('text'); }
      event.preventDefault(); event.stopPropagation();
      return;
    }
    saveHistory();
    current = { id: uid(), type: activeTool, start: p, end: p, points: ['pencil', 'erase'].includes(activeTool) ? [p] : undefined, color: '#1479bd', width: activeTool === 'erase' ? 16 : 3 };
    drawings.push(current);
    selectedId = current.id;
    pointerId = event.pointerId;
    overlay.setPointerCapture?.(event.pointerId);
    event.preventDefault(); event.stopPropagation();
  });
  overlay.addEventListener('pointermove', (event) => {
    const wheel = findWheel();
    if (!wheel) return;
    const p = point(event, wheel.getBoundingClientRect());
    if (activeTool === 'select' && moving && selectedId) {
      const target = drawings.find((value) => value.id === selectedId);
      if (target) { Object.assign(target, clone(moving.original)); moveObject(target, p.x - moving.start.x, p.y - moving.start.y); scheduleOverlay(); }
      event.preventDefault(); event.stopPropagation();
      return;
    }
    if (pointerId !== event.pointerId || !current) return;
    if (Array.isArray(current.points)) {
      const last = current.points.at(-1);
      if (!last || Math.hypot(last.x - p.x, last.y - p.y) > .0015) current.points.push(p);
    } else current.end = p;
    scheduleOverlay();
    event.preventDefault(); event.stopPropagation();
  });
  const end = (event) => {
    if (moving) { moving = null; finish('move'); return; }
    if (pointerId == null || (event?.pointerId != null && event.pointerId !== pointerId)) return;
    overlay.releasePointerCapture?.(pointerId);
    finish('draw');
  };
  overlay.addEventListener('pointerup', end);
  overlay.addEventListener('pointercancel', end);
  overlay.addEventListener('lostpointercapture', end);
}
function ensureOverlay() {
  let overlay = document.getElementById(OVERLAY_ID);
  if (overlay) return overlay;
  overlay = document.createElement('canvas');
  overlay.id = OVERLAY_ID;
  document.body.appendChild(overlay);
  bindOverlay(overlay);
  return overlay;
}
function fileToUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function addImage(src) {
  const image = new Image();
  image.src = src;
  await new Promise((resolve) => { image.onload = resolve; image.onerror = resolve; });
  const ratio = (image.naturalHeight || 1) / Math.max(1, image.naturalWidth || 1);
  let w = .42; let h = w * ratio;
  if (h > .42) { h = .42; w = h / Math.max(.01, ratio); }
  saveHistory();
  const object = { id: uid(), type: 'image', src, x: .5 - w / 2, y: .5 - h / 2, w, h };
  drawings.push(object); selectedId = object.id; finish('paste-image');
}
async function paste() {
  try {
    if (navigator.clipboard?.read) {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((value) => value.startsWith('image/'));
        if (type) { await addImage(await fileToUrl(await item.getType(type))); return; }
      }
    }
    const text = await navigator.clipboard?.readText?.();
    if (text) { saveHistory(); drawings.push({ id: uid(), type: 'text', start: { x: .45, y: .45 }, text, color: '#173f60', size: 28 }); finish('paste-text'); return; }
  } catch (_) { /* use file fallback */ }
  document.getElementById(FILE_ID)?.click();
}
function svg(name) {
  const map = {
    pencil: '<svg viewBox="0 0 24 24"><path d="M4 20 7 13 17 3l4 4L11 17Z" fill="#f4c34e" stroke="#6f5420"/><path d="m17 3 4 4" stroke="#6f5420"/><path d="m4 20-1 3 3-1" fill="#2f79aa"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="#173f60" stroke-width="2" stroke-linecap="round"/></svg>',
    triangle: '<svg viewBox="0 0 24 24"><path d="M12 3 21 20H3Z" fill="none" stroke="#167abb" stroke-width="1.8"/></svg>',
    roundRect: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="4" fill="none" stroke="#167abb" stroke-width="1.8"/></svg>',
    rect: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="15" fill="none" stroke="#167abb" stroke-width="1.8"/></svg>',
    ellipse: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="9" ry="7" fill="none" stroke="#167abb" stroke-width="1.8"/></svg>',
    line: '<svg viewBox="0 0 24 24"><path d="M4 20 20 4" stroke="#173f60" stroke-width="2" stroke-linecap="round"/></svg>',
    text: '<svg viewBox="0 0 24 24"><text x="12" y="18" text-anchor="middle" font-family="Georgia" font-size="19" font-weight="700" fill="#16344e">A</text></svg>',
    fill: '<svg viewBox="0 0 24 24"><path d="m4 13 8-8 6 6-8 8Z" fill="#d7eefb" stroke="#2c719c"/><path d="M4 21c0-2 2-4 4-4s4 2 4 4" fill="#5db3e5" stroke="#2c719c"/></svg>',
    erase: '<svg viewBox="0 0 24 24"><path d="m5 17 8-12 7 5-8 12H6Z" fill="#f06d82" stroke="#994050"/><path d="m5 17 6 5" stroke="#994050"/></svg>',
    select: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" fill="none" stroke="#2585c9" stroke-width="1.7" stroke-dasharray="4 2"/></svg>',
    paste: '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="13" height="18" rx="2" fill="#f7f7f7" stroke="#7e571f"/><path d="M9 4V2h7v2" fill="#f1c254" stroke="#7e571f"/></svg>',
    undo: '<svg viewBox="0 0 24 24"><path d="M10 5 4 11l6 6v-4c7-1 10 2 11 7 1-9-3-13-11-13Z" fill="#9db0c0" stroke="#728798"/></svg>',
    redo: '<svg viewBox="0 0 24 24"><path d="m14 5 6 6-6 6v-4c-7-1-10 2-11 7-1-9 3-13 11-13Z" fill="#22a6df" stroke="#177aa9"/></svg>',
  };
  return map[name] || map.pencil;
}
function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) { style = document.createElement('style'); style.id = STYLE_ID; document.head.appendChild(style); }
  const top = Math.round(numberParam('topDrawingToolbarTop', 2, 0, 80));
  style.textContent = `
    #${TRIGGER_ID}{position:fixed!important;width:30px!important;height:30px!important;z-index:2147483647!important;padding:4px!important;border:1px solid #8d969f!important;border-radius:0!important;background:linear-gradient(#fff,#dedede)!important;display:flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;box-shadow:0 1px 3px rgba(0,0,0,.18)!important}
    #${TRIGGER_ID}:hover,#${TRIGGER_ID}[data-open="true"]{background:linear-gradient(#fff,#dcecff)!important;border-color:#477da8!important}#${TRIGGER_ID} svg{width:20px!important;height:20px!important}
    #${TOOLBAR_ID}{position:fixed!important;left:50%!important;top:${top}px!important;transform:translateX(-50%)!important;z-index:2147483600!important;height:56px!important;width:max-content!important;max-width:calc(100vw - 360px)!important;display:flex!important;align-items:stretch!important;overflow-x:auto!important;overflow-y:hidden!important;border:1px solid #d2d6da!important;background:linear-gradient(#fff,#f4f4f4)!important;box-shadow:0 2px 6px rgba(0,0,0,.16)!important;font-family:Tahoma,Arial,sans-serif!important;box-sizing:border-box!important}
    #${TOOLBAR_ID}[hidden]{display:none!important}#${TOOLBAR_ID},#${TOOLBAR_ID} *{box-sizing:border-box!important}#${TOOLBAR_ID} .g{height:100%!important;display:flex!important;align-items:center!important;gap:2px!important;padding:3px 6px!important;border-right:1px solid #d9dde0!important;flex:0 0 auto!important}
    #${TOOLBAR_ID} button{margin:0!important;font-family:Tahoma,Arial,sans-serif!important}#${TOOLBAR_ID} .main{width:100px!important;height:48px!important;border:1px solid transparent!important;background:transparent!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;font-size:13px!important;font-weight:700!important;cursor:pointer!important}
    #${TOOLBAR_ID} .tool{width:31px!important;height:38px!important;padding:2px!important;border:1px solid transparent!important;background:transparent!important;display:flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important}#${TOOLBAR_ID} .tool svg,#${TOOLBAR_ID} .main svg{width:23px!important;height:23px!important}
    #${TOOLBAR_ID} .tool:hover,#${TOOLBAR_ID} .tool[data-active="true"],#${TOOLBAR_ID} .main:hover{background:#e9f4fd!important;border-color:#98c2e2!important}#${TOOLBAR_ID} .split{min-width:58px!important;height:48px!important;padding:2px 5px!important;border:1px solid transparent!important;background:transparent!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;font-size:11px!important;font-weight:700!important;cursor:pointer!important}#${TOOLBAR_ID} .split svg{width:22px!important;height:22px!important}
    #${TOOLBAR_ID} .history button{width:31px!important;height:38px!important;padding:2px!important;border:1px solid transparent!important;background:transparent!important;cursor:pointer!important}#${TOOLBAR_ID} .history button:disabled{opacity:.35!important}#${OVERLAY_ID}{position:fixed!important;z-index:2147483000!important;background:transparent!important;touch-action:none!important}
  `;
}
function button(className, title, markup, handler) {
  const value = document.createElement('button');
  value.type = 'button'; value.className = className; value.title = title; value.setAttribute('aria-label', title); value.innerHTML = markup;
  value.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); handler(); });
  return value;
}
function tool(toolName, title, iconName) {
  const value = button('tool', title, svg(iconName), () => selectTool(toolName));
  value.dataset.tool = toolName;
  return value;
}
function ensureUi() {
  installStyle(); ensureOverlay();
  let toolbar = document.getElementById(TOOLBAR_ID);
  if (!toolbar) {
    toolbar = document.createElement('div'); toolbar.id = TOOLBAR_ID; toolbar.setAttribute('role', 'toolbar'); toolbar.setAttribute('aria-label', 'أدوات الرسم');
    const main = document.createElement('div'); main.className = 'g'; main.appendChild(button('main', 'أدوات الرسم', `${svg('menu')}<span>أدوات الرسم</span>`, () => selectTool(activeTool === 'pencil' ? 'hand' : 'pencil')));
    const quick = document.createElement('div'); quick.className = 'g'; quick.append(tool('triangle','مثلث','triangle'),tool('roundRect','مستطيل مستدير','roundRect'),tool('rect','مستطيل','rect'),tool('ellipse','دائرة','ellipse'),tool('line','خط','line'),tool('text','نص','text'),tool('fill','تعبئة','fill'),tool('erase','ممحاة','erase'));
    const selection = document.createElement('div'); selection.className = 'g'; const select = button('split','تحديد',`${svg('select')}<span>تحديد</span>`,()=>selectTool('select')); select.dataset.tool='select'; selection.appendChild(select);
    const pasteGroup = document.createElement('div'); pasteGroup.className='g'; pasteGroup.appendChild(button('split','لصق',`${svg('paste')}<span>لصق</span>`,paste));
    const history = document.createElement('div'); history.className='g history'; const u=button('','تراجع',svg('undo'),undo);u.dataset.action='undo';const r=button('','إعادة',svg('redo'),redo);r.dataset.action='redo';history.append(u,r);
    toolbar.append(main,quick,selection,pasteGroup,history); document.body.appendChild(toolbar);
  }
  let trigger = document.getElementById(TRIGGER_ID);
  if (!trigger) {
    trigger = button('', 'إظهار أو إخفاء أدوات الرسم', svg('pencil'), () => { toolbarOpen=!toolbarOpen;if(!toolbarOpen)selectTool('hand');persist();persistUrl();updateUi();scheduleLayout(); });
    trigger.id=TRIGGER_ID;document.body.appendChild(trigger);
  }
  let input=document.getElementById(FILE_ID);
  if(!input){input=document.createElement('input');input.id=FILE_ID;input.type='file';input.accept='image/*';input.hidden=true;input.addEventListener('change',async()=>{const file=input.files?.[0];input.value='';if(file)await addImage(await fileToUrl(file));});document.body.appendChild(input);}
  updateUi(); return {toolbar,trigger};
}
function updateUi(){document.querySelectorAll(`#${TOOLBAR_ID} [data-tool]`).forEach((node)=>{node.dataset.active=node.dataset.tool===activeTool?'true':'false';});const toolbar=document.getElementById(TOOLBAR_ID);if(toolbar)toolbar.hidden=!toolbarOpen;const trigger=document.getElementById(TRIGGER_ID);if(trigger)trigger.dataset.open=toolbarOpen?'true':'false';const u=document.querySelector(`#${TOOLBAR_ID} [data-action="undo"]`);const r=document.querySelector(`#${TOOLBAR_ID} [data-action="redo"]`);if(u)u.disabled=!undoStack.length;if(r)r.disabled=!redoStack.length;}
function positionTrigger(){const trigger=document.getElementById(TRIGGER_ID);if(!trigger)return;const root=document.getElementById(ROOT_ID);if(root){const rect=root.getBoundingClientRect();if(rect.width>1){trigger.style.left=`${Math.max(2,Math.round(rect.left-34))}px`;trigger.style.top=`${Math.round(rect.top)}px`;trigger.style.removeProperty('right');return;}}trigger.style.right='360px';trigger.style.top='8px';}
function scheduleLayout(){cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(()=>{ensureUi();positionTrigger();scheduleOverlay();});}
function install(){if(typeof window==='undefined'||typeof document==='undefined'||!wheelMode()||!boolParam('showTopCenterDrawingToolbar',true)||window[STATE_KEY])return;ensureUi();scheduleLayout();const root=document.getElementById(ROOT_ID);if(root&&typeof ResizeObserver==='function'){rootObserver=new ResizeObserver(scheduleLayout);rootObserver.observe(root);}const timers=[40,120,300,700,1500,3000,5000].map((delay)=>setTimeout(scheduleLayout,delay));const key=(event)=>{if(event.key==='Escape'){selectedId=null;selectTool('hand');}if((event.key==='Delete'||event.key==='Backspace')&&selectedId){saveHistory();drawings=drawings.filter((value)=>value.id!==selectedId);selectedId=null;finish('delete');}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();event.shiftKey?redo():undo();}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='y'){event.preventDefault();redo();}};document.addEventListener('keydown',key);window.addEventListener('resize',scheduleLayout);window.addEventListener('scroll',scheduleLayout,true);document.addEventListener('fullscreenchange',scheduleLayout);window.addEventListener('gannzilla:unified-wheel-tools-v453',scheduleLayout);window.addEventListener('gannzilla:wheel-pan-offset-v305',scheduleOverlay);window.GANNZILLA_TOP_CENTER_DRAWING_TOOLBAR_V471=true;window.__auditGannzillaTopCenterDrawingToolbarV471=()=>{const toolbar=document.getElementById(TOOLBAR_ID);const trigger=document.getElementById(TRIGGER_ID);const tr=toolbar?.getBoundingClientRect();const ir=trigger?.getBoundingClientRect();return{ok:Boolean(toolbar&&trigger&&tr?.width>0),build:BUILD,toolbarOpen,topCenter:tr?Math.abs(tr.left+tr.width/2-innerWidth/2)<3:false,trigger30px:ir?Math.round(ir.width)===30&&Math.round(ir.height)===30:false,activeTool,drawingCount:drawings.length,actionCount,lastAction,chartDisplacement:false};};window[STATE_KEY]={timers,key,get rootObserver(){return rootObserver;}};}
install();
