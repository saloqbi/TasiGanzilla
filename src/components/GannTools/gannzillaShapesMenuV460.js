const BUILD = 460;
const ROOT_ID = 'gannzilla-unified-wheel-tools-v453';
const FIRST_EYE_ID = 'gannzilla-unified-eye-v453';
const TRIGGER_ID = 'gannzilla-shapes-menu-trigger-v460';
const MENU_ID = 'gannzilla-shapes-menu-v460';
const OVERLAY_ID = 'gannzilla-shapes-overlay-v460';
const STYLE_ID = 'gannzilla-shapes-menu-style-v460';
const STATE_KEY = '__gannzillaShapesMenuV460';
const STORAGE_KEY = 'tasi-gannzilla-selected-shapes-v460';

const ITEMS = Object.freeze([
  { id: 'circle', label: 'دائرة', kind: 'circle', color: '#f2d600' },
  { id: 'straightLine', label: 'خط مستقيم', kind: 'line', color: '#202020' },
  { id: 'triangle', label: 'ثلاثي (3 أضلاع)', kind: 'polygon', sides: 3, color: '#e53935' },
  { id: 'square', label: 'رباعي (4 أضلاع)', kind: 'polygon', sides: 4, color: '#202020' },
  { id: 'pentagon', label: 'خماسي (5 أضلاع)', kind: 'polygon', sides: 5, color: '#1976d2' },
  { id: 'hexagon', label: 'سداسي (6 أضلاع)', kind: 'polygon', sides: 6, color: '#2eae49' },
  { id: 'heptagon', label: 'سباعي (7 أضلاع)', kind: 'polygon', sides: 7, color: '#7556b7' },
  { id: 'octagon', label: 'ثماني (8 أضلاع)', kind: 'polygon', sides: 8, color: '#f39c12' },
  { id: 'enneagon', label: 'تساعي (9 أضلاع)', kind: 'polygon', sides: 9, color: '#169c91' },
  { id: 'decagon', label: 'عشاري (10 أضلاع)', kind: 'polygon', sides: 10, color: '#c73e68' },
  { id: 'hendecagon', label: 'أحد عشري (11 ضلع)', kind: 'polygon', sides: 11, color: '#8a7a3d' },
  { id: 'dodecagon', label: 'اثنا عشر (12 ضلع)', kind: 'polygon', sides: 12, color: '#199ec7' },
  { id: 'filledSquare', label: 'مربع ممتلئ', kind: 'filledSquare', color: '#202020' },
  { id: 'filledDiamond', label: 'معين (الماسي)', kind: 'filledDiamond', color: '#176bd4' },
  { id: 'emptyDiamond', label: 'معين فارغ', kind: 'emptyDiamond', color: '#176bd4' },
  { id: 'hexCircle', label: 'دائرة سداسية', kind: 'hexCircle', color: '#d33428' },
  { id: 'pentCircle', label: 'دائرة خماسية', kind: 'pentCircle', color: '#1a55a8' },
  { id: 'nestedCircles', label: 'دوائر متداخلة', kind: 'nestedCircles', color: '#2a9d43' },
  { id: 'octagonalSquare', label: 'المربع الثماني', kind: 'octagonalSquare', color: '#1a55a8' },
  { id: 'magnet', label: 'المغناطيس', kind: 'magnet', color: '#d9362d' },
  { id: 'angleWheel', label: 'عجلة الزوايا', kind: 'angleWheel', color: '#cbbd00' },
  { id: 'grid', label: 'الشكل الشبكي', kind: 'grid', color: '#7048bd' },
  { id: 'triangleStar', label: 'نجمة ثلاثية', kind: 'star', sides: 3, color: '#f2c21c' },
  { id: 'squareStar', label: 'نجمة رباعية', kind: 'star', sides: 4, color: '#f2c21c' },
  { id: 'pentagonStar', label: 'نجمة خماسية', kind: 'star', sides: 5, color: '#f2c21c' },
  { id: 'hexagonStar', label: 'نجمة سداسية', kind: 'star', sides: 6, color: '#f2c21c' },
  { id: 'heptagonStar', label: 'نجمة سباعية', kind: 'star', sides: 7, color: '#f2c21c' },
  { id: 'octagonStar', label: 'نجمة ثمانية', kind: 'star', sides: 8, color: '#f2c21c' },
  { id: 'enneagonStar', label: 'نجمة تساعية', kind: 'star', sides: 9, color: '#f2c21c' },
  { id: 'decagonStar', label: 'نجمة عشرية', kind: 'star', sides: 10, color: '#f2c21c' },
  { id: 'hendecagonStar', label: 'نجمة أحد عشرية', kind: 'star', sides: 11, color: '#f2c21c' },
  { id: 'dodecagonStar', label: 'نجمة اثنا عشرية', kind: 'star', sides: 12, color: '#f2c21c' },
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

function loadSelected() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(value)) return new Set();
    const valid = new Set(ITEMS.map((item) => item.id));
    return new Set(value.filter((id) => valid.has(id)));
  } catch (_) {
    return new Set();
  }
}

let selected = loadSelected();
let menuOpen = false;
let observedCanvas = null;
let canvasResizeObserver = null;
let overlayFrame = 0;
let positionFrame = 0;
let lastChangedShape = null;

function persistSelected() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...selected])); }
  catch (_) { /* Runtime state remains active. */ }
}

function regularPoints(sides, radius, rotation = -90) {
  const values = [];
  for (let index = 0; index < sides; index += 1) {
    const angle = (rotation + index * 360 / sides) * Math.PI / 180;
    values.push(`${(radius * Math.cos(angle)).toFixed(2)},${(radius * Math.sin(angle)).toFixed(2)}`);
  }
  return values.join(' ');
}

function starPoints(points, outerRadius, innerRadius, rotation = -90) {
  const values = [];
  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = (rotation + index * 180 / points) * Math.PI / 180;
    values.push(`${(radius * Math.cos(angle)).toFixed(2)},${(radius * Math.sin(angle)).toFixed(2)}`);
  }
  return values.join(' ');
}

function menuTriggerMarkup() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="3.3" height="3.3" rx=".6" fill="#e53935"/>
      <rect x="3" y="10.35" width="3.3" height="3.3" rx=".6" fill="#f2c21c"/>
      <rect x="3" y="16.7" width="3.3" height="3.3" rx=".6" fill="#1976d2"/>
      <path d="M8.5 5.65h12M8.5 12h12M8.5 18.35h12" fill="none" stroke="#326f98" stroke-width="1.75" stroke-linecap="round"/>
    </svg>`;
}

function shiftedPoints(points) {
  return points.split(' ').map((pair) => {
    const [x, y] = pair.split(',').map(Number);
    return `${x + 12},${y + 12}`;
  }).join(' ');
}

function itemIconMarkup(item) {
  const common = 'stroke="#343434" stroke-width="1"';
  let body = '';
  switch (item.kind) {
    case 'circle':
      body = `<circle cx="12" cy="12" r="7" fill="${item.color}" ${common}/>`;
      break;
    case 'line':
      body = '<path d="M4 20 20 4" fill="none" stroke="#222" stroke-width="1.6" stroke-linecap="round"/>';
      break;
    case 'polygon':
      body = `<polygon points="${shiftedPoints(regularPoints(item.sides, 7.5))}" fill="${item.color}" ${common}/>`;
      break;
    case 'filledSquare':
      body = '<rect x="5" y="5" width="14" height="14" fill="#222" stroke="#111" stroke-width="1"/>';
      break;
    case 'filledDiamond':
      body = `<polygon points="12,4 20,12 12,20 4,12" fill="${item.color}" ${common}/>`;
      break;
    case 'emptyDiamond':
      body = `<polygon points="12,4 20,12 12,20 4,12" fill="none" stroke="${item.color}" stroke-width="1.8"/>`;
      break;
    case 'hexCircle':
      body = '<circle cx="12" cy="12" r="7.4" fill="none" stroke="#d33428" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#fff" stroke="#d33428" stroke-width="2"/><circle cx="12" cy="12" r="1" fill="#d33428"/>';
      break;
    case 'pentCircle':
      body = '<circle cx="12" cy="12" r="7.4" fill="none" stroke="#1a55a8" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#fff" stroke="#1a55a8" stroke-width="2"/><circle cx="12" cy="12" r="1" fill="#1a55a8"/>';
      break;
    case 'nestedCircles':
      body = '<circle cx="12" cy="12" r="8" fill="none" stroke="#2a9d43" stroke-width="1.7"/><circle cx="12" cy="12" r="5.2" fill="none" stroke="#2a9d43" stroke-width="1.4"/><circle cx="12" cy="12" r="2.2" fill="none" stroke="#2a9d43" stroke-width="1.3"/>';
      break;
    case 'octagonalSquare':
      body = '<circle cx="12" cy="12" r="7.8" fill="none" stroke="#1a55a8" stroke-width="1.5"/><rect x="7" y="7" width="10" height="10" transform="rotate(45 12 12)" fill="none" stroke="#1a55a8" stroke-width="1.5"/><circle cx="12" cy="12" r="2" fill="#1a55a8"/>';
      break;
    case 'magnet':
      body = '<path d="M5 18V10a7 7 0 0 1 14 0v8h-5v-8a2 2 0 0 0-4 0v8Z" fill="#e13b32" stroke="#7d1813" stroke-width="1"/><rect x="5" y="15" width="5" height="3" fill="#333"/><rect x="14" y="15" width="5" height="3" fill="#333"/>';
      break;
    case 'angleWheel': {
      const spokes = Array.from({ length: 12 }, (_, index) => {
        const angle = index * Math.PI / 6;
        return `<path d="M12 12 L${(12 + Math.cos(angle) * 7).toFixed(2)} ${(12 + Math.sin(angle) * 7).toFixed(2)}" stroke="#7b7200" stroke-width=".75"/>`;
      }).join('');
      body = `<circle cx="12" cy="12" r="8" fill="#fff9a8" stroke="#b6aa00" stroke-width="1.2"/>${spokes}<circle cx="12" cy="12" r="1.2" fill="#b6aa00"/>`;
      break;
    }
    case 'grid': {
      const lines = [8, 12, 16].map((value) => `<path d="M${value} 4v16M4 ${value}h16" stroke="#7048bd" stroke-width="1"/>`).join('');
      body = `<rect x="4" y="4" width="16" height="16" fill="#eee8ff" stroke="#7048bd" stroke-width="1"/>${lines}`;
      break;
    }
    case 'star':
      body = `<polygon points="${shiftedPoints(starPoints(item.sides, 8, item.sides === 3 ? 3.2 : 4))}" fill="${item.color}" ${common}/>`;
      break;
    default:
      body = '<circle cx="12" cy="12" r="6" fill="#ccc"/>';
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
}

function overlayShapeMarkup(item, radius) {
  const color = item.color;
  const stroke = `stroke="${color}" stroke-width="2.4" vector-effect="non-scaling-stroke"`;
  switch (item.kind) {
    case 'circle':
      return `<circle cx="0" cy="0" r="${radius}" fill="none" ${stroke}/>`;
    case 'line':
      return `<path d="M${-radius} 0H${radius}" fill="none" stroke="#202020" stroke-width="2.4" vector-effect="non-scaling-stroke"/>`;
    case 'polygon':
      return `<polygon points="${regularPoints(item.sides, radius)}" fill="none" ${stroke}/>`;
    case 'filledSquare': {
      const side = radius * 1.38;
      return `<rect x="${-side / 2}" y="${-side / 2}" width="${side}" height="${side}" fill="#202020" fill-opacity=".10" stroke="#202020" stroke-width="2.4" vector-effect="non-scaling-stroke"/>`;
    }
    case 'filledDiamond':
      return `<polygon points="0,${-radius} ${radius},0 0,${radius} ${-radius},0" fill="${color}" fill-opacity=".11" ${stroke}/>`;
    case 'emptyDiamond':
      return `<polygon points="0,${-radius} ${radius},0 0,${radius} ${-radius},0" fill="none" ${stroke}/>`;
    case 'hexCircle':
      return `<circle cx="0" cy="0" r="${radius}" fill="none" ${stroke}/><polygon points="${regularPoints(6, radius * .83)}" fill="none" ${stroke}/><circle cx="0" cy="0" r="${radius * .12}" fill="none" ${stroke}/>`;
    case 'pentCircle':
      return `<circle cx="0" cy="0" r="${radius}" fill="none" ${stroke}/><polygon points="${regularPoints(5, radius * .83)}" fill="none" ${stroke}/><circle cx="0" cy="0" r="${radius * .12}" fill="none" ${stroke}/>`;
    case 'nestedCircles':
      return `<circle cx="0" cy="0" r="${radius}" fill="none" ${stroke}/><circle cx="0" cy="0" r="${radius * .70}" fill="none" ${stroke}/><circle cx="0" cy="0" r="${radius * .40}" fill="none" ${stroke}/>`;
    case 'octagonalSquare':
      return `<circle cx="0" cy="0" r="${radius}" fill="none" ${stroke}/><polygon points="${regularPoints(8, radius)}" fill="none" ${stroke}/><polygon points="${regularPoints(4, radius * .72, -45)}" fill="none" ${stroke}/>`;
    case 'magnet': {
      const w = radius * 1.20;
      const h = radius * 1.20;
      const arm = radius * .28;
      return `<path d="M${-w / 2} ${h / 2}V${-h * .05}A${w / 2} ${w / 2} 0 0 1 ${w / 2} ${-h * .05}V${h / 2}H${w / 2 - arm}V${-h * .05}A${w / 2 - arm} ${w / 2 - arm} 0 0 0 ${-w / 2 + arm} ${-h * .05}V${h / 2}Z" fill="${color}" fill-opacity=".16" stroke="${color}" stroke-width="3" vector-effect="non-scaling-stroke"/><path d="M${-w / 2} ${h / 2 - arm}h${arm}M${w / 2 - arm} ${h / 2 - arm}h${arm}" stroke="#333" stroke-width="6" vector-effect="non-scaling-stroke"/>`;
    }
    case 'angleWheel': {
      const spokes = Array.from({ length: 24 }, (_, index) => {
        const angle = index * Math.PI / 12;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return `<path d="M0 0L${x.toFixed(2)} ${y.toFixed(2)}" stroke="${color}" stroke-opacity=".72" stroke-width="1.25" vector-effect="non-scaling-stroke"/>`;
      }).join('');
      return `<circle cx="0" cy="0" r="${radius}" fill="none" ${stroke}/>${spokes}<circle cx="0" cy="0" r="${radius * .08}" fill="${color}"/>`;
    }
    case 'grid': {
      const half = radius * .78;
      const step = half * 2 / 4;
      let lines = '';
      for (let index = 0; index <= 4; index += 1) {
        const value = -half + index * step;
        lines += `<path d="M${value} ${-half}V${half}M${-half} ${value}H${half}" stroke="${color}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`;
      }
      return `<rect x="${-half}" y="${-half}" width="${half * 2}" height="${half * 2}" fill="${color}" fill-opacity=".035" stroke="${color}" stroke-width="2.2" vector-effect="non-scaling-stroke"/>${lines}`;
    }
    case 'star':
      return `<polygon points="${starPoints(item.sides, radius, radius * (item.sides === 3 ? .38 : .48))}" fill="none" ${stroke}/>`;
    default:
      return '';
  }
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${ROOT_ID} {
      width: 282px !important;
      min-width: 282px !important;
      max-width: 282px !important;
      transform: translateX(-68px) !important;
      transform-origin: top left !important;
      overflow: visible !important;
    }
    #${TRIGGER_ID} {
      flex: 0 0 30px !important; width: 30px !important; min-width: 30px !important; max-width: 30px !important;
      height: 30px !important; min-height: 30px !important; max-height: 30px !important; margin: 0 !important; padding: 4px !important;
      border: 1px solid #8d969f !important; border-radius: 0 !important; background: linear-gradient(#ffffff, #dedede) !important;
      display: inline-flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important;
      visibility: visible !important; opacity: 1 !important; pointer-events: auto !important; user-select: none !important;
      touch-action: manipulation !important; box-shadow: 0 1px 3px rgba(0,0,0,.18) !important; box-sizing: border-box !important;
    }
    #${TRIGGER_ID}:hover, #${TRIGGER_ID}[aria-expanded="true"] { background: linear-gradient(#ffffff, #dcecff) !important; border-color: #477da8 !important; }
    #${TRIGGER_ID} svg { width: 20px !important; height: 20px !important; display: block !important; pointer-events: none !important; }
    #${MENU_ID} {
      position: fixed !important; width: 270px !important; min-width: 270px !important; max-width: 270px !important;
      max-height: calc(100vh - 46px) !important; padding: 0 !important; border: 1px solid #a7a7a7 !important;
      background: #ffffff !important; box-shadow: 0 7px 22px rgba(0,0,0,.28) !important; z-index: 2147483647 !important;
      direction: rtl !important; text-align: right !important; overflow: hidden !important; visibility: visible !important;
      opacity: 1 !important; pointer-events: auto !important; font-family: Tahoma, "Segoe UI", Arial, sans-serif !important; box-sizing: border-box !important;
    }
    #${MENU_ID}[hidden] { display: none !important; }
    #${MENU_ID} .gz460-title { height: 34px !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 0 10px !important; border-bottom: 1px solid #c9c9c9 !important; background: linear-gradient(#f8f8f8, #e8e8e8) !important; color: #222 !important; font-size: 14px !important; font-weight: 700 !important; user-select: none !important; }
    #${MENU_ID} .gz460-list { max-height: calc(100vh - 82px) !important; overflow-y: auto !important; overflow-x: hidden !important; scrollbar-width: auto !important; scrollbar-color: #8a8a8a #eeeeee !important; background: #fff !important; }
    #${MENU_ID} .gz460-list::-webkit-scrollbar { width: 13px !important; }
    #${MENU_ID} .gz460-list::-webkit-scrollbar-track { background: #efefef !important; }
    #${MENU_ID} .gz460-list::-webkit-scrollbar-thumb { background: #8b8b8b !important; border: 2px solid #efefef !important; border-radius: 8px !important; }
    #${MENU_ID} .gz460-item { height: 38px !important; min-height: 38px !important; display: grid !important; grid-template-columns: 34px minmax(0, 1fr) !important; align-items: center !important; gap: 8px !important; padding: 0 10px 0 8px !important; border-bottom: 1px solid #e4e4e4 !important; background: #fff !important; color: #181818 !important; cursor: pointer !important; user-select: none !important; pointer-events: auto !important; font-size: 14px !important; font-weight: 500 !important; line-height: 1.2 !important; box-sizing: border-box !important; direction: ltr !important; }
    #${MENU_ID} .gz460-item:hover { background: #eef5ff !important; }
    #${MENU_ID} .gz460-item[data-selected="true"] { background: #176bd4 !important; color: #fff !important; }
    #${MENU_ID} .gz460-item:focus-visible { outline: 2px solid #3d8bd9 !important; outline-offset: -2px !important; }
    #${MENU_ID} .gz460-item-icon { width: 27px !important; height: 27px !important; display: flex !important; align-items: center !important; justify-content: center !important; }
    #${MENU_ID} .gz460-item-icon svg { width: 24px !important; height: 24px !important; display: block !important; }
    #${MENU_ID} .gz460-item-label { min-width: 0 !important; direction: rtl !important; text-align: right !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
    #${OVERLAY_ID} { position: fixed !important; margin: 0 !important; padding: 0 !important; border: 0 !important; overflow: visible !important; pointer-events: none !important; z-index: 2147482000 !important; transform: none !important; transform-origin: top left !important; }
  `;
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
      return canvas.width > 300 && canvas.height > 300 && rect.width > 250 && rect.height > 250 && style.display !== 'none';
    })
    .map((canvas) => ({ canvas, area: canvas.width * canvas.height }))
    .sort((a, b) => b.area - a.area)[0]?.canvas || null;
}

function ensureOverlay() {
  let overlay = document.getElementById(OVERLAY_ID);
  if (overlay instanceof SVGSVGElement) return overlay;
  overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  overlay.id = OVERLAY_ID;
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('focusable', 'false');
  document.body.appendChild(overlay);
  return overlay;
}

function bindCanvasObserver(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || observedCanvas === canvas) return;
  canvasResizeObserver?.disconnect();
  observedCanvas = canvas;
  if (typeof ResizeObserver === 'function') {
    canvasResizeObserver = new ResizeObserver(() => scheduleOverlay());
    canvasResizeObserver.observe(canvas);
  }
}

function renderOverlay() {
  const overlay = ensureOverlay();
  const canvas = findWheelCanvas();
  if (!(canvas instanceof HTMLCanvasElement) || selected.size === 0) {
    overlay.style.setProperty('display', 'none', 'important');
    return false;
  }
  bindCanvasObserver(canvas);
  const style = window.getComputedStyle(canvas);
  const rect = canvas.getBoundingClientRect();
  const hidden = style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0;
  if (hidden || rect.width < 2 || rect.height < 2) {
    overlay.style.setProperty('display', 'none', 'important');
    return false;
  }
  overlay.style.setProperty('display', 'block', 'important');
  overlay.style.setProperty('left', `${rect.left}px`, 'important');
  overlay.style.setProperty('top', `${rect.top}px`, 'important');
  overlay.style.setProperty('width', `${rect.width}px`, 'important');
  overlay.style.setProperty('height', `${rect.height}px`, 'important');
  overlay.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  overlay.setAttribute('width', String(rect.width));
  overlay.setAttribute('height', String(rect.height));
  const ratio = numberParam('shapeOverlayRadiusRatio', .34, .12, .48);
  const radius = Math.min(rect.width, rect.height) * ratio;
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  overlay.innerHTML = ITEMS
    .filter((item) => selected.has(item.id))
    .map((item) => `<g data-gannzilla-shape="${item.id}" transform="translate(${cx} ${cy})">${overlayShapeMarkup(item, radius)}</g>`)
    .join('');
  return true;
}

function scheduleOverlay() {
  window.cancelAnimationFrame(overlayFrame);
  overlayFrame = window.requestAnimationFrame(renderOverlay);
}

function updateRows() {
  const menu = document.getElementById(MENU_ID);
  if (!(menu instanceof HTMLElement)) return;
  menu.querySelectorAll('[data-shape-id]').forEach((row) => {
    const active = selected.has(row.getAttribute('data-shape-id'));
    row.setAttribute('data-selected', active ? 'true' : 'false');
    row.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function toggleShape(shapeId) {
  if (selected.has(shapeId)) selected.delete(shapeId);
  else selected.add(shapeId);
  lastChangedShape = shapeId;
  persistSelected();
  updateRows();
  scheduleOverlay();
  window.dispatchEvent(new CustomEvent('gannzilla:shape-menu-change-v460', {
    detail: { selected: [...selected], changed: shapeId, build: BUILD },
  }));
}

function createMenu() {
  const menu = document.createElement('div');
  menu.id = MENU_ID;
  menu.hidden = true;
  menu.setAttribute('dir', 'rtl');
  menu.setAttribute('role', 'menu');
  menu.classList.add('gannzilla-chart-toolbar-v328');
  menu.setAttribute('aria-label', 'قائمة الأشكال الهندسية');
  const title = document.createElement('div');
  title.className = 'gz460-title';
  title.textContent = '-- اختر الشكل --';
  const list = document.createElement('div');
  list.className = 'gz460-list';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-multiselectable', 'true');
  ITEMS.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'gz460-item';
    row.tabIndex = 0;
    row.setAttribute('role', 'option');
    row.setAttribute('data-shape-id', item.id);
    row.setAttribute('data-selected', selected.has(item.id) ? 'true' : 'false');
    row.setAttribute('aria-pressed', selected.has(item.id) ? 'true' : 'false');
    const icon = document.createElement('span');
    icon.className = 'gz460-item-icon';
    icon.innerHTML = itemIconMarkup(item);
    const label = document.createElement('span');
    label.className = 'gz460-item-label';
    label.textContent = item.label;
    row.append(icon, label);
    row.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleShape(item.id);
    });
    row.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
      toggleShape(item.id);
    });
    list.appendChild(row);
  });
  menu.append(title, list);
  document.body.appendChild(menu);
  return menu;
}

function createTrigger() {
  const trigger = document.createElement('span');
  trigger.id = TRIGGER_ID;
  trigger.tabIndex = 0;
  trigger.innerHTML = menuTriggerMarkup();
  trigger.title = 'قائمة الأشكال';
  trigger.setAttribute('aria-label', 'إظهار أو إخفاء قائمة الأشكال');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(!menuOpen);
  });
  trigger.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(!menuOpen);
  });
  return trigger;
}

function positionMenu() {
  const trigger = document.getElementById(TRIGGER_ID);
  const menu = document.getElementById(MENU_ID);
  if (!(trigger instanceof HTMLElement) || !(menu instanceof HTMLElement) || !menuOpen) return false;
  const rect = trigger.getBoundingClientRect();
  const width = 270;
  const left = Math.max(6, Math.min(window.innerWidth - width - 6, Math.round(rect.left)));
  const top = Math.max(36, Math.round(rect.bottom + 3));
  menu.style.setProperty('left', `${left}px`, 'important');
  menu.style.setProperty('top', `${top}px`, 'important');
  menu.style.setProperty('max-height', `${Math.max(160, window.innerHeight - top - 8)}px`, 'important');
  return true;
}

function schedulePosition() {
  window.cancelAnimationFrame(positionFrame);
  positionFrame = window.requestAnimationFrame(positionMenu);
}

function setMenuOpen(open) {
  menuOpen = Boolean(open);
  const menu = document.getElementById(MENU_ID) || createMenu();
  const trigger = document.getElementById(TRIGGER_ID);
  menu.hidden = !menuOpen;
  trigger?.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
  if (menuOpen) {
    updateRows();
    schedulePosition();
  }
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

function mount() {
  installStyle();
  const root = document.getElementById(ROOT_ID);
  const firstEye = document.getElementById(FIRST_EYE_ID);
  if (!(root instanceof HTMLElement) || !(firstEye instanceof HTMLElement)) return false;
  root.classList.add('gannzilla-chart-toolbar-v328');
  root.setAttribute('data-gannzilla-control-strip', 'true');
  root.style.setProperty('overflow', 'visible', 'important');
  let trigger = document.getElementById(TRIGGER_ID);
  if (!(trigger instanceof HTMLElement)) trigger = createTrigger();
  if (trigger.parentElement !== root || trigger.nextElementSibling !== firstEye) root.insertBefore(trigger, firstEye);
  clearHiddenState(trigger);
  if (!document.getElementById(MENU_ID)) createMenu();
  ensureOverlay();
  scheduleOverlay();
  if (menuOpen) schedulePosition();
  root.dataset.gannzillaShapesMenuV460 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showShapesMenu', true) || window[STATE_KEY]) return;
  let frame = 0;
  let rootObserver = null;
  let observedRoot = null;
  const scheduleMount = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      const mounted = mount();
      const root = document.getElementById(ROOT_ID);
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
    const menu = document.getElementById(MENU_ID);
    const trigger = document.getElementById(TRIGGER_ID);
    if (!menuOpen) return;
    if (menu?.contains(event.target) || trigger?.contains(event.target)) return;
    setMenuOpen(false);
  };
  const onKeyDown = (event) => { if (event.key === 'Escape') setMenuOpen(false); };
  const onViewportChange = () => { schedulePosition(); scheduleOverlay(); };
  document.addEventListener('click', onDocumentClick, true);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('fullscreenchange', onViewportChange);
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('scroll', onViewportChange, true);
  window.addEventListener('gannzilla:page-scrollbar-pan-v305', scheduleOverlay);
  window.addEventListener('gannzilla:wheel-pan-offset-v305', scheduleOverlay);
  window.addEventListener('gannzilla:wheel-input-v459', scheduleOverlay);
  window.addEventListener('gannzilla:unified-wheel-tools-v453', scheduleOverlay);
  window.addEventListener('gannzilla:layout-panel-visibility-change', onViewportChange);
  window.addEventListener('gannzilla:ring-two-numbering-refresh', scheduleOverlay);
  window.GANNZILLA_SHAPES_MENU_V460 = true;
  window.__auditGannzillaShapesMenuV460 = () => {
    const root = document.getElementById(ROOT_ID);
    const trigger = document.getElementById(TRIGGER_ID);
    const menu = document.getElementById(MENU_ID);
    const overlay = document.getElementById(OVERLAY_ID);
    const rect = trigger?.getBoundingClientRect();
    return {
      ok: Boolean(root && trigger && menu && overlay && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showShapesMenu', true),
      triggerImmediatelyLeftOfFirstEye: trigger?.nextElementSibling?.id === FIRST_EYE_ID,
      menuOpen,
      itemCount: ITEMS.length,
      selectedShapes: [...selected],
      lastChangedShape,
      overlayVisible: overlay ? window.getComputedStyle(overlay).display !== 'none' : false,
      scopedToolbarObserverOnly: true,
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
