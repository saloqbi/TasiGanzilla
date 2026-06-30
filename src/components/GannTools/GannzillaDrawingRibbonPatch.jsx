import React from 'react';

const STORAGE_KEY = 'tasi-gannzilla-drawing-ribbon-v2';
const CLIP_KEY = 'tasi-gannzilla-drawing-ribbon-clipboard-v2';
const DEFAULT_COLORS = [
  '#000000','#ffffff','#7f7f7f','#c0c0c0','#880015','#ed1c24','#ff7f27','#fff200',
  '#22b14c','#00a2e8','#3f48cc','#a349a4','#b97a57','#ffaec9','#ffc90e','#efe4b0',
  '#99d9ea','#7092be','#c8bfe7','#b5e61d','#ffaec9','#f6989d','#a349a4','#808080',
  '#2f3699','#00a651','#fff79a','#f26d7d','#8b0000','#333333'
];

function readDrawings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') || []; }
  catch { return []; }
}

function writeDrawings(drawings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drawings));
}

function svgPoint(svg, event) {
  const rect = svg.getBoundingClientRect();
  return { x: Math.round(event.clientX - rect.left), y: Math.round(event.clientY - rect.top) };
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function regularPolygon(cx, cy, r, sides, rotation = -90) {
  return Array.from({ length: sides }).map((_, i) => {
    const a = ((rotation + (i * 360 / sides)) * Math.PI) / 180;
    return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
  }).join(' ');
}

function starPoints(cx, cy, outer, inner, points = 5) {
  const out = [];
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = ((-90 + i * 180 / points) * Math.PI) / 180;
    out.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
  }
  return out.join(' ');
}

function shapeBox(item) {
  const x = Math.min(item.x1, item.x2);
  const y = Math.min(item.y1, item.y2);
  const w = Math.abs(item.x2 - item.x1);
  const h = Math.abs(item.y2 - item.y1);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.max(4, Math.min(w, h) / 2);
  return { x, y, w, h, cx, cy, r };
}

function elementMarkup(item) {
  const stroke = item.color || '#000';
  const fill = item.fill || 'none';
  const width = item.width || 2;
  const id = esc(item.id);

  if (item.type === 'pen' || item.type === 'brush') {
    const points = (item.points || []).map((p) => `${p.x},${p.y}`).join(' ');
    return `<polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="${item.type === 'brush' ? width + 4 : width}" stroke-linecap="round" stroke-linejoin="round" opacity="${item.type === 'brush' ? 0.75 : 1}" data-drawing-id="${id}"/>`;
  }

  if (item.type === 'line') {
    return `<line x1="${item.x1}" y1="${item.y1}" x2="${item.x2}" y2="${item.y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" data-drawing-id="${id}"/>`;
  }

  if (item.type === 'curve') {
    const mx = (item.x1 + item.x2) / 2;
    const my = Math.min(item.y1, item.y2) - Math.abs(item.x2 - item.x1) * 0.18;
    return `<path d="M ${item.x1} ${item.y1} Q ${mx} ${my} ${item.x2} ${item.y2}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" data-drawing-id="${id}"/>`;
  }

  if (item.type === 'arrow') {
    const angle = Math.atan2(item.y2 - item.y1, item.x2 - item.x1);
    const head = 12 + width;
    const a1 = angle + Math.PI * 0.84;
    const a2 = angle - Math.PI * 0.84;
    const hx1 = item.x2 + Math.cos(a1) * head;
    const hy1 = item.y2 + Math.sin(a1) * head;
    const hx2 = item.x2 + Math.cos(a2) * head;
    const hy2 = item.y2 + Math.sin(a2) * head;
    return `<g data-drawing-id="${id}"><line x1="${item.x1}" y1="${item.y1}" x2="${item.x2}" y2="${item.y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/><polyline points="${item.x2},${item.y2} ${hx1},${hy1} ${hx2},${hy2} ${item.x2},${item.y2}" fill="${stroke}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/></g>`;
  }

  if (item.type === 'rect' || item.type === 'roundRect') {
    const { x, y, w, h } = shapeBox(item);
    const radius = item.type === 'roundRect' ? Math.min(18, Math.max(4, Math.min(w, h) * 0.16)) : 0;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" ry="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" data-drawing-id="${id}"/>`;
  }

  if (item.type === 'ellipse') {
    const { cx, cy, w, h } = shapeBox(item);
    return `<ellipse cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" data-drawing-id="${id}"/>`;
  }

  if (item.type === 'triangle') {
    const { x, y, w, h } = shapeBox(item);
    return `<polygon points="${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" data-drawing-id="${id}"/>`;
  }

  if (item.type === 'rightTriangle') {
    const { x, y, w, h } = shapeBox(item);
    return `<polygon points="${x},${y} ${x + w},${y + h} ${x},${y + h}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" data-drawing-id="${id}"/>`;
  }

  if (item.type === 'diamond') {
    const { x, y, w, h } = shapeBox(item);
    return `<polygon points="${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" data-drawing-id="${id}"/>`;
  }

  if (item.type === 'pentagon' || item.type === 'hexagon' || item.type === 'octagon') {
    const { cx, cy, r } = shapeBox(item);
    const sides = item.type === 'pentagon' ? 5 : item.type === 'hexagon' ? 6 : 8;
    return `<polygon points="${regularPolygon(cx, cy, r, sides)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" data-drawing-id="${id}"/>`;
  }

  if (item.type === 'star') {
    const { cx, cy, r } = shapeBox(item);
    return `<polygon points="${starPoints(cx, cy, r, r * 0.45, 5)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" data-drawing-id="${id}"/>`;
  }

  if (item.type === 'callout') {
    const { x, y, w, h } = shapeBox(item);
    const tailX = x + w * 0.35;
    const tailY = y + h;
    return `<path d="M ${x + 8} ${y} H ${x + w - 8} Q ${x + w} ${y} ${x + w} ${y + 8} V ${y + h - 16} Q ${x + w} ${y + h - 8} ${x + w - 8} ${y + h - 8} H ${tailX + 18} L ${tailX} ${tailY} L ${tailX + 4} ${y + h - 8} H ${x + 8} Q ${x} ${y + h - 8} ${x} ${y + h - 16} V ${y + 8} Q ${x} ${y} ${x + 8} ${y} Z" fill="${fill}" stroke="${stroke}" stroke-width="${width}" data-drawing-id="${id}"/>`;
  }

  if (item.type === 'text') {
    return `<text x="${item.x}" y="${item.y}" fill="${stroke}" font-family="Segoe UI, Arial" font-size="${item.size || 24}" font-weight="700" data-drawing-id="${id}">${esc(item.text)}</text>`;
  }

  return '';
}

function renderOverlay(svg, preview = null) {
  const drawings = readDrawings();
  const all = preview ? [...drawings, preview] : drawings;
  svg.innerHTML = all.map(elementMarkup).join('');
}

function makeButton(label, title, onClick, className = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `gz-ribbon-btn ${className}`;
  button.textContent = label;
  button.title = title;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick?.(event, button);
  });
  return button;
}

function makeGroup(title, extraClass = '') {
  const group = document.createElement('div');
  group.className = `gz-ribbon-group ${extraClass}`;
  const body = document.createElement('div');
  body.className = 'gz-ribbon-group-body';
  const caption = document.createElement('div');
  caption.className = 'gz-ribbon-caption';
  caption.textContent = title;
  group.appendChild(body);
  group.appendChild(caption);
  return { group, body };
}

function setActiveTool(tool) {
  document.body.dataset.gannzillaDrawingTool = tool;
  document.querySelectorAll('.gz-ribbon-tool').forEach((button) => button.classList.toggle('active', button.dataset.tool === tool));
  const overlay = document.getElementById('gannzilla-drawing-ribbon-overlay-v1');
  if (overlay) overlay.style.pointerEvents = tool === 'cursor' ? 'none' : 'auto';
}

function currentTool() { return document.body.dataset.gannzillaDrawingTool || 'cursor'; }
function currentColor() { return document.body.dataset.gannzillaDrawingColor || '#000000'; }
function currentFillColor() { return document.body.dataset.gannzillaDrawingFillColor || '#ffffff'; }
function currentWidth() { return Number(document.body.dataset.gannzillaDrawingWidth || 3); }
function fillMode() { return document.body.dataset.gannzillaDrawingFill === 'true'; }

function installStyle() {
  const styleId = 'gannzilla-drawing-ribbon-style-v2';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    #gannzilla-drawing-ribbon-toggle-v1{
      position:fixed;top:27px;right:10px;z-index:2147483600;height:28px;min-width:104px;border:1px solid #9e9e9e;background:linear-gradient(#fff,#e7e7e7);color:#1c5f93;font-weight:900;font-size:13px;border-radius:3px;cursor:pointer;
    }
    #gannzilla-drawing-ribbon-v1{
      position:fixed;top:58px;left:0;right:0;z-index:2147483590;min-height:104px;background:linear-gradient(#f8fbff,#dfeaf6);border-top:1px solid #b9c7d4;border-bottom:1px solid #9fb3c4;box-shadow:0 2px 5px rgba(0,0,0,.22);display:flex;align-items:stretch;gap:3px;padding:6px 8px 4px 8px;direction:rtl;font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#333;box-sizing:border-box;overflow-x:auto;
    }
    #gannzilla-drawing-ribbon-v1.collapsed{display:none!important;}
    .gz-ribbon-group{display:flex;flex-direction:column;align-items:center;justify-content:space-between;min-width:70px;border-left:1px solid #c1ccd6;padding:0 6px;}
    .gz-ribbon-group-body{display:flex;align-items:center;justify-content:center;gap:3px;flex-wrap:wrap;max-width:245px;}
    .gz-ribbon-group.compact .gz-ribbon-group-body{max-width:100px;}
    .gz-ribbon-group.colors .gz-ribbon-group-body{max-width:260px;}
    .gz-ribbon-caption{font-size:11px;color:#555;text-align:center;margin-top:3px;white-space:nowrap;}
    .gz-ribbon-btn{height:25px;min-width:28px;border:1px solid #9caec0;background:linear-gradient(#fff,#e7eef6);border-radius:2px;color:#155c90;font-size:15px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;}
    .gz-ribbon-btn:hover,.gz-ribbon-btn.active{background:linear-gradient(#dff0ff,#a7d4ff);border-color:#4d91c5;}
    .gz-ribbon-wide{min-width:56px;font-size:12px;color:#333;}
    .gz-ribbon-tall{height:54px;min-width:46px;flex-direction:column;gap:2px;font-size:20px;}
    .gz-ribbon-tall small{font-size:10px;color:#333;font-weight:600;}
    .gz-ribbon-color{width:22px!important;min-width:22px!important;height:22px!important;padding:0!important;border:1px solid #777!important;}
    .gz-ribbon-color.active{outline:2px solid #1c75bc;outline-offset:1px;}
    .gz-ribbon-select{height:25px;border:1px solid #9caec0;background:#fff;font-size:12px;font-weight:700;}
    .gz-ribbon-colorbox{display:flex;align-items:center;gap:4px;height:54px;padding:4px;border:1px solid #b5c2cf;background:#edf4fb;}
    .gz-ribbon-color-swatch{width:30px;height:30px;border:2px solid #777;background:#000;}
    .gz-ribbon-mini-label{font-size:10px;color:#333;font-weight:700;text-align:center;}
    .gz-shape-grid{display:grid!important;grid-template-columns:repeat(7,24px);gap:2px!important;max-width:185px!important;}
    .gz-shape-grid .gz-ribbon-btn{min-width:24px!important;width:24px!important;height:22px!important;font-size:14px!important;padding:0!important;}
    #gannzilla-drawing-ribbon-overlay-v1{position:fixed;inset:24px 0 0 0;z-index:2147482000;pointer-events:none;overflow:visible;}
  `;
  document.getElementById('gannzilla-drawing-ribbon-style-v1')?.remove();
  document.head.appendChild(style);
}

function buildRibbon(svg) {
  const ribbon = document.createElement('div');
  ribbon.id = 'gannzilla-drawing-ribbon-v1';

  const { group: clipboardGroup, body: clipboardBody } = makeGroup('الحافظة', 'compact');
  clipboardBody.appendChild(makeButton('📋', 'لصق', () => {
    let copied = [];
    try { copied = JSON.parse(localStorage.getItem(CLIP_KEY) || '[]') || []; } catch { copied = []; }
    const moved = copied.map((item) => ({ ...item, id: `${Date.now()}-${Math.random()}`, x: item.x ? item.x + 24 : item.x, y: item.y ? item.y + 24 : item.y, x1: item.x1 ? item.x1 + 24 : item.x1, y1: item.y1 ? item.y1 + 24 : item.y1, x2: item.x2 ? item.x2 + 24 : item.x2, y2: item.y2 ? item.y2 + 24 : item.y2, points: item.points?.map((p) => ({ x: p.x + 24, y: p.y + 24 })) }));
    writeDrawings([...readDrawings(), ...moved]); renderOverlay(svg);
  }, 'gz-ribbon-tall'));
  clipboardBody.appendChild(makeButton('✂', 'قص / نسخ ثم مسح', () => { localStorage.setItem(CLIP_KEY, JSON.stringify(readDrawings())); writeDrawings([]); renderOverlay(svg); }));
  clipboardBody.appendChild(makeButton('نسخ', 'نسخ الرسم', () => localStorage.setItem(CLIP_KEY, JSON.stringify(readDrawings())), 'gz-ribbon-wide'));
  ribbon.appendChild(clipboardGroup);

  const { group: imageGroup, body: imageBody } = makeGroup('صورة', 'compact');
  imageBody.appendChild(makeButton('تحديد', 'تحديد', () => setActiveTool('cursor'), 'gz-ribbon-wide gz-ribbon-tool'));
  imageBody.lastChild.dataset.tool = 'cursor';
  imageBody.appendChild(makeButton('قص', 'مسح الرسم المحدد / الكل', () => { writeDrawings([]); renderOverlay(svg); }, 'gz-ribbon-wide'));
  imageBody.appendChild(makeButton('↻', 'تدوير الرسم بصريًا', () => {
    const drawings = readDrawings().map((item) => ({ ...item, rotate: (Number(item.rotate || 0) + 90) % 360 }));
    writeDrawings(drawings); renderOverlay(svg);
  }));
  ribbon.appendChild(imageGroup);

  const { group: toolsGroup, body: toolsBody } = makeGroup('الأدوات', 'compact');
  [['pen','✎','قلم'],['fillTool','🪣','تعبئة'],['text','A','نص'],['eraser','⌫','ممحاة'],['picker','⌾','قطارة'],['magnifier','⌕','مكبر']].forEach(([tool,label,title]) => {
    const b = makeButton(label, title, () => setActiveTool(tool), 'gz-ribbon-tool');
    b.dataset.tool = tool; toolsBody.appendChild(b);
  });
  ribbon.appendChild(toolsGroup);

  const { group: brushGroup, body: brushBody } = makeGroup('فرشاة', 'compact');
  const brush = makeButton('🖌', 'فرشاة', () => setActiveTool('brush'), 'gz-ribbon-tool gz-ribbon-tall');
  brush.dataset.tool = 'brush';
  brushBody.appendChild(brush);
  ribbon.appendChild(brushGroup);

  const { group: shapeGroup, body: shapeBody } = makeGroup('الأشكال');
  shapeBody.classList.add('gz-shape-grid');
  [
    ['line','╱','خط'],['curve','⌒','منحنى'],['arrow','➜','سهم'],['rect','□','مربع'],['roundRect','▢','مستطيل ناعم'],['ellipse','○','دائرة'],['triangle','△','مثلث'],
    ['rightTriangle','◿','مثلث قائم'],['diamond','◇','معين'],['pentagon','⬟','خماسي'],['hexagon','⬡','سداسي'],['octagon','⬢','ثماني'],['star','☆','نجمة'],['callout','☁','فقاعة']
  ].forEach(([tool,label,title]) => {
    const b = makeButton(label, title, () => setActiveTool(tool), 'gz-ribbon-tool');
    b.dataset.tool = tool; shapeBody.appendChild(b);
  });
  ribbon.appendChild(shapeGroup);

  const { group: styleGroup, body: styleBody } = makeGroup('النمط والحجم', 'compact');
  const outline = document.createElement('select');
  outline.className = 'gz-ribbon-select';
  ['إطار', 'بدون إطار'].forEach((v) => { const o = document.createElement('option'); o.textContent = v; outline.appendChild(o); });
  styleBody.appendChild(outline);
  const fillSelect = document.createElement('select');
  fillSelect.className = 'gz-ribbon-select';
  ['بدون تعبئة', 'تعبئة'].forEach((v) => { const o = document.createElement('option'); o.textContent = v; fillSelect.appendChild(o); });
  fillSelect.addEventListener('change', () => { document.body.dataset.gannzillaDrawingFill = fillSelect.value === 'تعبئة' ? 'true' : 'false'; });
  styleBody.appendChild(fillSelect);
  const widthSelect = document.createElement('select');
  widthSelect.className = 'gz-ribbon-select';
  [1,2,3,5,8,12].forEach((w) => { const o = document.createElement('option'); o.value = w; o.textContent = `${w}px`; widthSelect.appendChild(o); });
  widthSelect.value = '3';
  widthSelect.addEventListener('change', () => { document.body.dataset.gannzillaDrawingWidth = widthSelect.value; });
  styleBody.appendChild(widthSelect);
  ribbon.appendChild(styleGroup);

  const { group: colorsGroup, body: colorsBody } = makeGroup('الألوان', 'colors');
  const color1 = document.createElement('div');
  color1.className = 'gz-ribbon-colorbox';
  color1.innerHTML = '<div><div class="gz-ribbon-mini-label">لون 1</div><div class="gz-ribbon-color-swatch" data-color-one="true"></div></div>';
  colorsBody.appendChild(color1);
  const color2 = document.createElement('div');
  color2.className = 'gz-ribbon-colorbox';
  color2.innerHTML = '<div><div class="gz-ribbon-mini-label">لون 2</div><div class="gz-ribbon-color-swatch" data-color-two="true" style="background:#fff"></div></div>';
  colorsBody.appendChild(color2);
  DEFAULT_COLORS.forEach((color) => {
    const b = makeButton('', color, () => {
      document.body.dataset.gannzillaDrawingColor = color;
      document.querySelector('[data-color-one="true"]').style.background = color;
      document.querySelectorAll('.gz-ribbon-color').forEach((x) => x.classList.toggle('active', x.dataset.color === color));
    }, 'gz-ribbon-color');
    b.dataset.color = color; b.style.background = color; colorsBody.appendChild(b);
  });
  colorsBody.appendChild(makeButton('تحرير الألوان', 'تحرير الألوان', () => {
    const next = window.prompt('ضع كود اللون مثال #ff0000', currentColor());
    if (next) {
      document.body.dataset.gannzillaDrawingColor = next;
      const sw = document.querySelector('[data-color-one="true"]');
      if (sw) sw.style.background = next;
    }
  }, 'gz-ribbon-wide'));
  ribbon.appendChild(colorsGroup);

  const { group: viewGroup, body: viewBody } = makeGroup('عرض', 'compact');
  viewBody.appendChild(makeButton('↶', 'تراجع', () => { const d = readDrawings(); d.pop(); writeDrawings(d); renderOverlay(svg); }));
  viewBody.appendChild(makeButton('🗑', 'مسح الكل', () => { writeDrawings([]); renderOverlay(svg); }));
  viewBody.appendChild(makeButton('×', 'إخفاء الشريط', () => ribbon.classList.add('collapsed')));
  ribbon.appendChild(viewGroup);

  return ribbon;
}

function installDrawingEvents(svg) {
  if (svg.dataset.gannzillaDrawingEvents === 'true') return;
  svg.dataset.gannzillaDrawingEvents = 'true';
  let drawing = false;
  let start = null;
  let preview = null;

  svg.addEventListener('pointerdown', (event) => {
    const tool = currentTool();
    if (tool === 'cursor') return;
    event.preventDefault();
    const p = svgPoint(svg, event);

    if (tool === 'eraser') {
      const target = event.target?.closest?.('[data-drawing-id]');
      if (target) {
        const id = target.getAttribute('data-drawing-id');
        writeDrawings(readDrawings().filter((item) => item.id !== id));
        renderOverlay(svg);
      } else {
        const d = readDrawings(); d.pop(); writeDrawings(d); renderOverlay(svg);
      }
      return;
    }

    if (tool === 'picker') {
      document.body.dataset.gannzillaDrawingColor = '#1c75bc';
      const sw = document.querySelector('[data-color-one="true"]');
      if (sw) sw.style.background = '#1c75bc';
      return;
    }

    if (tool === 'magnifier') {
      document.body.style.zoom = document.body.style.zoom === '1.08' ? '1' : '1.08';
      return;
    }

    if (tool === 'fillTool') {
      const fillItem = { id: `${Date.now()}-${Math.random()}`, type: 'rect', x1: 0, y1: 24, x2: window.innerWidth, y2: window.innerHeight, color: currentColor(), fill: currentColor(), width: 0 };
      writeDrawings([fillItem, ...readDrawings()]);
      renderOverlay(svg);
      return;
    }

    if (tool === 'text') {
      const text = window.prompt('اكتب النص', 'نص');
      if (text) {
        writeDrawings([...readDrawings(), { id: `${Date.now()}-${Math.random()}`, type: 'text', x: p.x, y: p.y, text, color: currentColor(), size: 24 }]);
        renderOverlay(svg);
      }
      return;
    }

    drawing = true;
    start = p;
    const base = { id: `preview-${Date.now()}`, type: tool, color: currentColor(), width: currentWidth(), fill: fillMode() && !['line','arrow','curve','pen','brush'].includes(tool) ? currentColor() : 'none' };
    preview = tool === 'pen' || tool === 'brush' ? { ...base, points: [p] } : { ...base, x1: p.x, y1: p.y, x2: p.x, y2: p.y };
    renderOverlay(svg, preview);
    svg.setPointerCapture?.(event.pointerId);
  });

  svg.addEventListener('pointermove', (event) => {
    if (!drawing || !preview) return;
    event.preventDefault();
    const p = svgPoint(svg, event);
    if (preview.type === 'pen' || preview.type === 'brush') preview.points.push(p);
    else { preview.x2 = p.x; preview.y2 = p.y; }
    renderOverlay(svg, preview);
  });

  const finish = (event) => {
    if (!drawing || !preview) return;
    event?.preventDefault?.();
    const finalItem = { ...preview, id: `${Date.now()}-${Math.random()}` };
    if (finalItem.type !== 'pen' && finalItem.type !== 'brush') {
      finalItem.x2 = finalItem.x2 ?? start.x;
      finalItem.y2 = finalItem.y2 ?? start.y;
    }
    writeDrawings([...readDrawings(), finalItem]);
    preview = null; drawing = false; start = null;
    renderOverlay(svg);
  };
  svg.addEventListener('pointerup', finish);
  svg.addEventListener('pointercancel', finish);
}

export default function GannzillaDrawingRibbonPatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    installStyle();
    let svg = document.getElementById('gannzilla-drawing-ribbon-overlay-v1');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'gannzilla-drawing-ribbon-overlay-v1';
      document.body.appendChild(svg);
    }
    svg.setAttribute('width', String(window.innerWidth));
    svg.setAttribute('height', String(window.innerHeight));
    svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);

    document.getElementById('gannzilla-drawing-ribbon-v1')?.remove();
    let ribbon = buildRibbon(svg);
    document.body.appendChild(ribbon);

    let toggle = document.getElementById('gannzilla-drawing-ribbon-toggle-v1');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.id = 'gannzilla-drawing-ribbon-toggle-v1';
      toggle.textContent = '🎨 أدوات الرسم';
      toggle.title = 'إظهار / إخفاء أدوات الرسم والكتابة';
      toggle.addEventListener('click', () => document.getElementById('gannzilla-drawing-ribbon-v1')?.classList.toggle('collapsed'));
      document.body.appendChild(toggle);
    }

    document.body.dataset.gannzillaDrawingColor = document.body.dataset.gannzillaDrawingColor || '#000000';
    document.body.dataset.gannzillaDrawingFillColor = document.body.dataset.gannzillaDrawingFillColor || '#ffffff';
    document.body.dataset.gannzillaDrawingWidth = document.body.dataset.gannzillaDrawingWidth || '3';
    document.body.dataset.gannzillaDrawingFill = document.body.dataset.gannzillaDrawingFill || 'false';
    setActiveTool(currentTool());
    const colorOne = document.querySelector('[data-color-one="true"]');
    if (colorOne) colorOne.style.background = currentColor();
    const firstColor = document.querySelector('.gz-ribbon-color');
    if (firstColor) firstColor.classList.add('active');
    renderOverlay(svg);
    installDrawingEvents(svg);

    const onResize = () => {
      svg.setAttribute('width', String(window.innerWidth));
      svg.setAttribute('height', String(window.innerHeight));
      svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
      renderOverlay(svg);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      document.getElementById('gannzilla-drawing-ribbon-v1')?.remove();
      document.getElementById('gannzilla-drawing-ribbon-toggle-v1')?.remove();
      document.getElementById('gannzilla-drawing-ribbon-overlay-v1')?.remove();
      document.getElementById('gannzilla-drawing-ribbon-style-v2')?.remove();
    };
  }, []);
  return null;
}
