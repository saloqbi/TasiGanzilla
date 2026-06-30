import React from 'react';

const STORE_KEY = 'tasi-gannzilla-wheel-line-draw-v1';
const SETTINGS_KEY = 'tasi-gannzilla-wheel-line-draw-settings-v1';

function readLines() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]') || []; }
  catch { return []; }
}

function writeLines(lines) {
  localStorage.setItem(STORE_KEY, JSON.stringify(lines));
}

function readSettings() {
  try {
    return { active: false, color: '#1c75bc', width: 2, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') || {}) };
  } catch {
    return { active: false, color: '#1c75bc', width: 2 };
  }
}

function writeSettings(patch) {
  const next = { ...readSettings(), ...patch, updatedAt: new Date().toISOString() };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

function getWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 120 && rect.height > 120)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function escapeAttr(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function renderLines(svg, preview = null) {
  const lines = readLines();
  const all = preview ? [...lines, preview] : lines;
  svg.innerHTML = all.map((line) => `
    <line
      x1="${Number(line.x1 || 0)}"
      y1="${Number(line.y1 || 0)}"
      x2="${Number(line.x2 || 0)}"
      y2="${Number(line.y2 || 0)}"
      stroke="${escapeAttr(line.color || '#1c75bc')}"
      stroke-width="${Number(line.width || 2)}"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
      opacity="0.98"
    />
  `).join('');
}

function ensureStyle() {
  const id = 'gannzilla-wheel-line-draw-style-v1';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    #gannzilla-wheel-line-draw-host-v1{
      display:inline-flex!important;
      align-items:center!important;
      gap:2px!important;
      margin-left:3px!important;
      margin-right:3px!important;
      direction:ltr!important;
      vertical-align:middle!important;
    }
    .gannzilla-line-draw-btn{
      height:22px!important;
      min-width:26px!important;
      width:26px!important;
      border:1px solid #9b9b9b!important;
      border-radius:2px!important;
      background:#f7f7f7!important;
      color:#1c75bc!important;
      font-size:14px!important;
      font-weight:900!important;
      line-height:1!important;
      padding:0!important;
      margin:0!important;
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      cursor:pointer!important;
      box-sizing:border-box!important;
      visibility:visible!important;
      opacity:1!important;
      pointer-events:auto!important;
    }
    .gannzilla-line-draw-btn:hover,
    .gannzilla-line-draw-btn.active{
      background:#dceeff!important;
      border-color:#1c75bc!important;
      box-shadow:inset 0 0 0 1px rgba(28,117,188,.25)!important;
    }
    .gannzilla-line-draw-color{
      width:24px!important;
      min-width:24px!important;
      height:22px!important;
      border:1px solid #9b9b9b!important;
      padding:1px!important;
      margin:0!important;
      background:#fff!important;
      cursor:pointer!important;
      box-sizing:border-box!important;
    }
    .gannzilla-line-draw-width{
      height:22px!important;
      width:45px!important;
      min-width:45px!important;
      border:1px solid #9b9b9b!important;
      background:#fff!important;
      color:#111!important;
      font-size:12px!important;
      font-weight:800!important;
      padding:0!important;
      margin:0!important;
      box-sizing:border-box!important;
    }
    #gannzilla-wheel-line-draw-overlay-v1{
      position:fixed!important;
      z-index:2147482100!important;
      overflow:visible!important;
      pointer-events:none!important;
      touch-action:none!important;
    }
    #gannzilla-wheel-line-draw-overlay-v1.active{
      pointer-events:auto!important;
      cursor:crosshair!important;
    }
  `;
  document.head.appendChild(style);
}

function findToolbarParent() {
  const panHost = document.getElementById('gannzilla-wheel-pan-buttons-host-v2');
  if (panHost?.parentElement) return { parent: panHost.parentElement, anchor: panHost.nextSibling };

  const topButtons = Array.from(document.querySelectorAll('button'))
    .map((button) => ({ button, rect: button.getBoundingClientRect?.(), text: (button.textContent || '').trim() }))
    .filter(({ rect }) => rect && rect.top <= 28 && rect.height <= 30);

  const plus = topButtons.find(({ text }) => text === '＋' || text === '+');
  if (plus?.button?.parentElement) return { parent: plus.button.parentElement, anchor: plus.button };

  const toolbar = Array.from(document.querySelectorAll('div'))
    .find((node) => {
      const rect = node.getBoundingClientRect?.();
      const text = (node.textContent || '').replace(/\s+/g, ' ');
      return rect && rect.top <= 28 && rect.height >= 18 && rect.height <= 40 && /%|Gannzilla|Hide|Show|Clockwise|Counter/.test(text);
    });
  return toolbar ? { parent: toolbar, anchor: null } : null;
}

function mountControls() {
  ensureStyle();
  const found = findToolbarParent();
  if (!found?.parent) return;

  let host = document.getElementById('gannzilla-wheel-line-draw-host-v1');
  if (!host) {
    host = document.createElement('span');
    host.id = 'gannzilla-wheel-line-draw-host-v1';

    const lineButton = document.createElement('button');
    lineButton.type = 'button';
    lineButton.className = 'gannzilla-line-draw-btn';
    lineButton.dataset.gannzillaLineDrawToggle = 'true';
    lineButton.textContent = '╲';
    lineButton.title = 'تفعيل رسم الخط على العجلة';
    lineButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      const next = writeSettings({ active: !readSettings().active });
      applyControlsState(next);
    }, true);

    const color = document.createElement('input');
    color.type = 'color';
    color.className = 'gannzilla-line-draw-color';
    color.title = 'لون الخط';
    color.value = readSettings().color || '#1c75bc';
    color.addEventListener('input', () => writeSettings({ color: color.value }), true);
    color.addEventListener('change', () => writeSettings({ color: color.value }), true);

    const width = document.createElement('select');
    width.className = 'gannzilla-line-draw-width';
    width.title = 'سمك الخط';
    [1, 2, 3, 4, 5, 8, 12].forEach((value) => {
      const option = document.createElement('option');
      option.value = String(value);
      option.textContent = `${value}px`;
      width.appendChild(option);
    });
    width.value = String(readSettings().width || 2);
    width.addEventListener('change', () => writeSettings({ width: Number(width.value || 2) }), true);

    const undo = document.createElement('button');
    undo.type = 'button';
    undo.className = 'gannzilla-line-draw-btn';
    undo.textContent = '↶';
    undo.title = 'حذف آخر خط';
    undo.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      const lines = readLines();
      lines.pop();
      writeLines(lines);
      const svg = document.getElementById('gannzilla-wheel-line-draw-overlay-v1');
      if (svg) renderLines(svg);
    }, true);

    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'gannzilla-line-draw-btn';
    clear.textContent = '⌫';
    clear.title = 'مسح خطوط الرسم';
    clear.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      writeLines([]);
      const svg = document.getElementById('gannzilla-wheel-line-draw-overlay-v1');
      if (svg) renderLines(svg);
    }, true);

    host.appendChild(lineButton);
    host.appendChild(color);
    host.appendChild(width);
    host.appendChild(undo);
    host.appendChild(clear);
  }

  if (host.parentElement !== found.parent) {
    found.parent.insertBefore(host, found.anchor || found.parent.firstChild);
  }

  applyControlsState(readSettings());
}

function applyControlsState(settings = readSettings()) {
  const button = document.querySelector('[data-gannzilla-line-draw-toggle="true"]');
  const svg = document.getElementById('gannzilla-wheel-line-draw-overlay-v1');
  if (button) {
    button.classList.toggle('active', !!settings.active);
    button.title = settings.active ? 'إيقاف رسم الخط على العجلة' : 'تفعيل رسم الخط على العجلة';
  }
  if (svg) svg.classList.toggle('active', !!settings.active);
}

function ensureOverlay() {
  let svg = document.getElementById('gannzilla-wheel-line-draw-overlay-v1');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'gannzilla-wheel-line-draw-overlay-v1';
    document.body.appendChild(svg);
  }
  return svg;
}

function syncOverlayRect(svg) {
  const canvas = getWheelCanvas();
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  svg.style.left = `${rect.left}px`;
  svg.style.top = `${rect.top}px`;
  svg.style.width = `${Math.max(1, rect.width)}px`;
  svg.style.height = `${Math.max(1, rect.height)}px`;
  svg.setAttribute('width', String(Math.max(1, Math.round(rect.width))));
  svg.setAttribute('height', String(Math.max(1, Math.round(rect.height))));
  svg.setAttribute('viewBox', `0 0 ${Math.max(1, Math.round(rect.width))} ${Math.max(1, Math.round(rect.height))}`);
}

function installDrawing(svg) {
  if (svg.dataset.gannzillaLineDrawEvents === 'true') return;
  svg.dataset.gannzillaLineDrawEvents = 'true';

  let drawing = false;
  let start = null;
  let preview = null;

  const point = (event) => {
    const rect = svg.getBoundingClientRect();
    return {
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top)
    };
  };

  svg.addEventListener('pointerdown', (event) => {
    if (!readSettings().active) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    const settings = readSettings();
    drawing = true;
    start = point(event);
    preview = {
      x1: start.x,
      y1: start.y,
      x2: start.x,
      y2: start.y,
      color: settings.color || '#1c75bc',
      width: Number(settings.width || 2)
    };
    renderLines(svg, preview);
    svg.setPointerCapture?.(event.pointerId);
  }, true);

  svg.addEventListener('pointermove', (event) => {
    if (!drawing || !preview) return;
    event.preventDefault();
    const p = point(event);
    preview.x2 = p.x;
    preview.y2 = p.y;
    renderLines(svg, preview);
  }, true);

  const finish = (event) => {
    if (!drawing || !preview) return;
    event?.preventDefault?.();
    const dx = Math.abs(preview.x2 - preview.x1);
    const dy = Math.abs(preview.y2 - preview.y1);
    if (dx + dy > 4) {
      writeLines([...readLines(), { ...preview, id: `${Date.now()}-${Math.random()}` }]);
    }
    drawing = false;
    start = null;
    preview = null;
    renderLines(svg);
  };

  svg.addEventListener('pointerup', finish, true);
  svg.addEventListener('pointercancel', finish, true);
}

export default function GannzillaWheelLineDrawPatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    ensureStyle();
    const svg = ensureOverlay();
    installDrawing(svg);

    const run = () => {
      mountControls();
      syncOverlayRect(svg);
      applyControlsState(readSettings());
      renderLines(svg);
    };

    run();
    const timer = window.setInterval(run, 250);
    window.addEventListener('resize', run);
    window.addEventListener('scroll', run, true);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', run);
      window.removeEventListener('scroll', run, true);
      document.getElementById('gannzilla-wheel-line-draw-host-v1')?.remove();
      document.getElementById('gannzilla-wheel-line-draw-overlay-v1')?.remove();
      document.getElementById('gannzilla-wheel-line-draw-style-v1')?.remove();
    };
  }, []);

  return null;
}
