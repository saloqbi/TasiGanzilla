import React from 'react';

const STORAGE_KEY = 'tasi-gannzilla-drawing-ribbon-v1';
const CLIP_KEY = 'tasi-gannzilla-drawing-ribbon-clipboard-v1';
const DEFAULT_COLORS = ['#000000','#ffffff','#7f7f7f','#c0c0c0','#880015','#ed1c24','#ff7f27','#fff200','#22b14c','#00a2e8','#3f48cc','#a349a4','#b97a57','#ffaec9','#ffc90e','#efe4b0'];

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

function elementMarkup(item) {
  const stroke = item.color || '#000';
  const fill = item.fill || 'none';
  const width = item.width || 2;
  if (item.type === 'pen') {
    const points = (item.points || []).map((p) => `${p.x},${p.y}`).join(' ');
    return `<polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" data-drawing-id="${item.id}"/>`;
  }
  if (item.type === 'line') {
    return `<line x1="${item.x1}" y1="${item.y1}" x2="${item.x2}" y2="${item.y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" data-drawing-id="${item.id}"/>`;
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
    return `<g data-drawing-id="${item.id}"><line x1="${item.x1}" y1="${item.y1}" x2="${item.x2}" y2="${item.y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/><polyline points="${item.x2},${item.y2} ${hx1},${hy1} ${hx2},${hy2} ${item.x2},${item.y2}" fill="${stroke}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/></g>`;
  }
  if (item.type === 'rect') {
    const x = Math.min(item.x1, item.x2); const y = Math.min(item.y1, item.y2);
    const w = Math.abs(item.x2 - item.x1); const h = Math.abs(item.y2 - item.y1);
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" data-drawing-id="${item.id}"/>`;
  }
  if (item.type === 'ellipse') {
    const cx = (item.x1 + item.x2) / 2; const cy = (item.y1 + item.y2) / 2;
    const rx = Math.abs(item.x2 - item.x1) / 2; const ry = Math.abs(item.y2 - item.y1) / 2;
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" data-drawing-id="${item.id}"/>`;
  }
  if (item.type === 'text') {
    return `<text x="${item.x}" y="${item.y}" fill="${stroke}" font-family="Segoe UI, Arial" font-size="${item.size || 24}" font-weight="700" data-drawing-id="${item.id}">${esc(item.text)}</text>`;
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

function makeGroup(title) {
  const group = document.createElement('div');
  group.className = 'gz-ribbon-group';
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
function currentWidth() { return Number(document.body.dataset.gannzillaDrawingWidth || 3); }
function fillMode() { return document.body.dataset.gannzillaDrawingFill === 'true'; }

function installStyle() {
  const styleId = 'gannzilla-drawing-ribbon-style-v1';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    #gannzilla-drawing-ribbon-toggle-v1{
      position:fixed;top:27px;right:10px;z-index:2147483600;height:28px;min-width:92px;border:1px solid #9e9e9e;background:linear-gradient(#fff,#e7e7e7);color:#1c5f93;font-weight:900;font-size:13px;border-radius:3px;cursor:pointer;
    }
    #gannzilla-drawing-ribbon-v1{
      position:fixed;top:58px;left:0;right:0;z-index:2147483590;min-height:92px;background:linear-gradient(#f8fbff,#dfeaf6);border-top:1px solid #b9c7d4;border-bottom:1px solid #9fb3c4;box-shadow:0 2px 5px rgba(0,0,0,.22);display:flex;align-items:stretch;gap:4px;padding:6px 8px 4px 8px;direction:rtl;font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#333;box-sizing:border-box;
    }
    #gannzilla-drawing-ribbon-v1.collapsed{display:none!important;}
    .gz-ribbon-group{display:flex;flex-direction:column;align-items:center;justify-content:space-between;min-width:74px;border-left:1px solid #c1ccd6;padding:0 6px;}
    .gz-ribbon-group-body{display:flex;align-items:center;justify-content:center;gap:4px;flex-wrap:wrap;max-width:230px;}
    .gz-ribbon-caption{font-size:11px;color:#555;text-align:center;margin-top:3px;white-space:nowrap;}
    .gz-ribbon-btn{height:25px;min-width:28px;border:1px solid #9caec0;background:linear-gradient(#fff,#e7eef6);border-radius:2px;color:#155c90;font-size:15px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;}
    .gz-ribbon-btn:hover,.gz-ribbon-btn.active{background:linear-gradient(#dff0ff,#a7d4ff);border-color:#4d91c5;}
    .gz-ribbon-wide{min-width:56px;font-size:12px;color:#333;}
    .gz-ribbon-color{width:22px!important;min-width:22px!important;height:22px!important;padding:0!important;border:1px solid #777!important;}
    .gz-ribbon-color.active{outline:2px solid #1c75bc;outline-offset:1px;}
    .gz-ribbon-select{height:25px;border:1px solid #9caec0;background:#fff;font-size:12px;font-weight:700;}
    #gannzilla-drawing-ribbon-overlay-v1{position:fixed;inset:24px 0 0 0;z-index:2147482000;pointer-events:none;overflow:visible;}
  `;
  document.getElementById('gannzilla-drawing-ribbon-style-v2')?.remove();
  document.head.appendChild(style);
}

function buildRibbon(svg) {
  const ribbon = document.createElement('div');
  ribbon.id = 'gannzilla-drawing-ribbon-v1';

  const { group: editGroup, body: editBody } = makeGroup('التحرير');
  editBody.appendChild(makeButton('↶', 'تراجع', () => { const d = readDrawings(); d.pop(); writeDrawings(d); renderOverlay(svg); }));
  editBody.appendChild(makeButton('📋', 'نسخ الرسم', () => localStorage.setItem(CLIP_KEY, JSON.stringify(readDrawings()))));
  editBody.appendChild(makeButton('📄', 'لصق الرسم', () => {
    let copied = [];
    try { copied = JSON.parse(localStorage.getItem(CLIP_KEY) || '[]') || []; } catch { copied = []; }
    const moved = copied.map((item) => ({ ...item, id: `${Date.now()}-${Math.random()}`, x: item.x ? item.x + 24 : item.x, y: item.y ? item.y + 24 : item.y, x1: item.x1 ? item.x1 + 24 : item.x1, y1: item.y1 ? item.y1 + 24 : item.y1, x2: item.x2 ? item.x2 + 24 : item.x2, y2: item.y2 ? item.y2 + 24 : item.y2, points: item.points?.map((p) => ({ x: p.x + 24, y: p.y + 24 })) }));
    writeDrawings([...readDrawings(), ...moved]); renderOverlay(svg);
  }));
  editBody.appendChild(makeButton('🗑', 'مسح كل الرسم', () => { writeDrawings([]); renderOverlay(svg); }));
  ribbon.appendChild(editGroup);

  const { group: toolsGroup, body: toolsBody } = makeGroup('الأدوات');
  [['cursor','↖','تحديد'],['pen','✎','قلم'],['text','T','كتابة'],['eraser','⌫','ممحاة']].forEach(([tool,label,title]) => {
    const b = makeButton(label, title, () => setActiveTool(tool), 'gz-ribbon-tool');
    b.dataset.tool = tool; toolsBody.appendChild(b);
  });
  ribbon.appendChild(toolsGroup);

  const { group: shapeGroup, body: shapeBody } = makeGroup('الأشكال');
  [['line','╱','خط'],['arrow','➜','سهم'],['rect','□','مربع'],['ellipse','○','دائرة']].forEach(([tool,label,title]) => {
    const b = makeButton(label, title, () => setActiveTool(tool), 'gz-ribbon-tool');
    b.dataset.tool = tool; shapeBody.appendChild(b);
  });
  ribbon.appendChild(shapeGroup);

  const { group: colorGroup, body: colorBody } = makeGroup('الألوان');
  DEFAULT_COLORS.forEach((color) => {
    const b = makeButton('', color, () => {
      document.body.dataset.gannzillaDrawingColor = color;
      document.querySelectorAll('.gz-ribbon-color').forEach((x) => x.classList.toggle('active', x.dataset.color === color));
    }, 'gz-ribbon-color');
    b.dataset.color = color; b.style.background = color; colorBody.appendChild(b);
  });
  ribbon.appendChild(colorGroup);

  const { group: sizeGroup, body: sizeBody } = makeGroup('الحجم والتعبئة');
  const widthSelect = document.createElement('select');
  widthSelect.className = 'gz-ribbon-select';
  [1,2,3,5,8,12].forEach((w) => { const o = document.createElement('option'); o.value = w; o.textContent = `${w}px`; widthSelect.appendChild(o); });
  widthSelect.value = '3';
  widthSelect.addEventListener('change', () => { document.body.dataset.gannzillaDrawingWidth = widthSelect.value; });
  sizeBody.appendChild(widthSelect);
  sizeBody.appendChild(makeButton('تعبئة', 'تشغيل/إيقاف التعبئة', (e, b) => { const next = document.body.dataset.gannzillaDrawingFill !== 'true'; document.body.dataset.gannzillaDrawingFill = next ? 'true' : 'false'; b.classList.toggle('active', next); }, 'gz-ribbon-wide'));
  ribbon.appendChild(sizeGroup);

  const { group: closeGroup, body: closeBody } = makeGroup('عرض');
  closeBody.appendChild(makeButton('×', 'إخفاء الشريط', () => ribbon.classList.add('collapsed')));
  ribbon.appendChild(closeGroup);

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
    const base = { id: `preview-${Date.now()}`, type: tool, color: currentColor(), width: currentWidth(), fill: fillMode() && (tool === 'rect' || tool === 'ellipse') ? currentColor() : 'none' };
    preview = tool === 'pen' ? { ...base, points: [p] } : { ...base, x1: p.x, y1: p.y, x2: p.x, y2: p.y };
    renderOverlay(svg, preview);
    svg.setPointerCapture?.(event.pointerId);
  });

  svg.addEventListener('pointermove', (event) => {
    if (!drawing || !preview) return;
    event.preventDefault();
    const p = svgPoint(svg, event);
    if (preview.type === 'pen') preview.points.push(p);
    else { preview.x2 = p.x; preview.y2 = p.y; }
    renderOverlay(svg, preview);
  });

  const finish = (event) => {
    if (!drawing || !preview) return;
    event?.preventDefault?.();
    const finalItem = { ...preview, id: `${Date.now()}-${Math.random()}` };
    if (finalItem.type !== 'pen') {
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
    document.body.dataset.gannzillaDrawingWidth = document.body.dataset.gannzillaDrawingWidth || '3';
    document.body.dataset.gannzillaDrawingFill = document.body.dataset.gannzillaDrawingFill || 'false';
    setActiveTool(currentTool());
    document.querySelector('.gz-ribbon-color')?.classList.add('active');
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
      document.getElementById('gannzilla-drawing-ribbon-style-v1')?.remove();
      document.getElementById('gannzilla-drawing-ribbon-style-v2')?.remove();
    };
  }, []);
  return null;
}
