import React from 'react';

const STORAGE_KEY = 'tasi-gannzilla-wheel-line-drawings-v1';
const STATE_KEY = 'tasi-gannzilla-wheel-line-tool-state-v1';

function safeReadJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

function readDrawings() {
  return safeReadJson(STORAGE_KEY, []);
}

function writeDrawings(drawings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drawings));
}

function readToolState() {
  return { enabled: false, width: 2, color: '#1c75bc', ...safeReadJson(STATE_KEY, {}) };
}

function writeToolState(patch) {
  const next = { ...readToolState(), ...patch };
  localStorage.setItem(STATE_KEY, JSON.stringify(next));
  return next;
}

function pagePoint(event) {
  return { x: Math.round(event.clientX), y: Math.round(event.clientY) };
}

function renderLines(svg, preview = null) {
  const drawings = readDrawings();
  const all = preview ? [...drawings, preview] : drawings;
  svg.innerHTML = all.map((line) => `
    <line
      x1="${line.x1}"
      y1="${line.y1}"
      x2="${line.x2}"
      y2="${line.y2}"
      stroke="${line.color || '#1c75bc'}"
      stroke-width="${line.width || 2}"
      stroke-linecap="round"
      opacity="0.92"
    />
  `).join('');
}

function installStyle() {
  const STYLE_ID = 'gannzilla-wheel-line-drawing-style-v1';
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #gannzilla-wheel-line-drawing-host-v1 {
      position: fixed !important;
      top: 1px !important;
      left: 430px !important;
      z-index: 140 !important;
      height: 22px !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 2px !important;
      direction: ltr !important;
      font-family: Segoe UI, Arial, sans-serif !important;
    }
    .gannzilla-line-tool-btn {
      height: 22px !important;
      min-width: 26px !important;
      width: 26px !important;
      border: 1px solid #9b9b9b !important;
      border-radius: 2px !important;
      background: #f7f7f7 !important;
      color: #1c75bc !important;
      font-size: 14px !important;
      font-weight: 900 !important;
      line-height: 1 !important;
      padding: 0 !important;
      margin: 0 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      box-sizing: border-box !important;
    }
    .gannzilla-line-tool-btn.active {
      background: #dceeff !important;
      border-color: #2f80c1 !important;
      box-shadow: inset 0 0 0 1px #82b8df !important;
    }
    .gannzilla-line-tool-select {
      height: 22px !important;
      width: 45px !important;
      border: 1px solid #9b9b9b !important;
      background: #fff !important;
      color: #222 !important;
      font-size: 11px !important;
      font-weight: 800 !important;
      padding: 0 2px !important;
    }
    .gannzilla-line-tool-color {
      height: 22px !important;
      width: 26px !important;
      min-width: 26px !important;
      border: 1px solid #9b9b9b !important;
      background: #fff !important;
      padding: 1px !important;
      box-sizing: border-box !important;
      cursor: pointer !important;
    }
    #gannzilla-wheel-line-drawing-overlay-v1 {
      position: fixed !important;
      inset: 0 !important;
      z-index: 95 !important;
      overflow: visible !important;
      pointer-events: none !important;
    }
    #gannzilla-wheel-line-drawing-overlay-v1.active {
      pointer-events: auto !important;
      cursor: crosshair !important;
    }
  `;
  document.head.appendChild(style);
}

function ensureOverlay() {
  let svg = document.getElementById('gannzilla-wheel-line-drawing-overlay-v1');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'gannzilla-wheel-line-drawing-overlay-v1';
    document.body.appendChild(svg);
  }
  svg.setAttribute('width', String(window.innerWidth));
  svg.setAttribute('height', String(window.innerHeight));
  svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
  return svg;
}

function syncToolUi() {
  const state = readToolState();
  const svg = document.getElementById('gannzilla-wheel-line-drawing-overlay-v1');
  const lineButton = document.querySelector('[data-gannzilla-line-tool="toggle"]');
  if (svg) svg.classList.toggle('active', !!state.enabled);
  if (lineButton) lineButton.classList.toggle('active', !!state.enabled);
}

function makeButton(label, title, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'gannzilla-line-tool-btn';
  button.textContent = label;
  button.title = title;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick?.(button);
  }, true);
  return button;
}

function ensureToolbar(svg) {
  let host = document.getElementById('gannzilla-wheel-line-drawing-host-v1');
  if (host) return host;

  host = document.createElement('span');
  host.id = 'gannzilla-wheel-line-drawing-host-v1';

  const lineButton = makeButton('╱', 'تشغيل رسم الخط على العجلة', () => {
    const current = readToolState();
    writeToolState({ enabled: !current.enabled });
    syncToolUi();
  });
  lineButton.dataset.gannzillaLineTool = 'toggle';
  host.appendChild(lineButton);

  const widthSelect = document.createElement('select');
  widthSelect.className = 'gannzilla-line-tool-select';
  [1, 2, 3, 5, 8].forEach((w) => {
    const option = document.createElement('option');
    option.value = String(w);
    option.textContent = `${w}px`;
    widthSelect.appendChild(option);
  });
  widthSelect.value = String(readToolState().width || 2);
  widthSelect.title = 'سماكة الخط';
  widthSelect.addEventListener('change', () => writeToolState({ width: Number(widthSelect.value) || 2 }), true);
  host.appendChild(widthSelect);

  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.className = 'gannzilla-line-tool-color';
  colorInput.value = readToolState().color || '#1c75bc';
  colorInput.title = 'لون الخط';
  colorInput.addEventListener('change', () => writeToolState({ color: colorInput.value || '#1c75bc' }), true);
  host.appendChild(colorInput);

  host.appendChild(makeButton('⌫', 'مسح آخر خط', () => {
    const next = readDrawings();
    next.pop();
    writeDrawings(next);
    renderLines(svg);
  }));

  host.appendChild(makeButton('×', 'مسح كل خطوط الرسم', () => {
    writeDrawings([]);
    renderLines(svg);
  }));

  document.body.appendChild(host);
  syncToolUi();
  return host;
}

function installDrawing(svg) {
  if (svg.dataset.gannzillaLineDrawingEvents === 'true') return;
  svg.dataset.gannzillaLineDrawingEvents = 'true';

  let drawing = false;
  let start = null;
  let preview = null;

  svg.addEventListener('pointerdown', (event) => {
    const state = readToolState();
    if (!state.enabled) return;
    event.preventDefault();
    event.stopPropagation();
    drawing = true;
    start = pagePoint(event);
    preview = {
      id: `line-${Date.now()}`,
      x1: start.x,
      y1: start.y,
      x2: start.x,
      y2: start.y,
      color: state.color || '#1c75bc',
      width: Number(state.width || 2)
    };
    renderLines(svg, preview);
    svg.setPointerCapture?.(event.pointerId);
  }, true);

  svg.addEventListener('pointermove', (event) => {
    if (!drawing || !preview) return;
    event.preventDefault();
    const p = pagePoint(event);
    preview.x2 = p.x;
    preview.y2 = p.y;
    renderLines(svg, preview);
  }, true);

  const finish = (event) => {
    if (!drawing || !preview) return;
    event?.preventDefault?.();
    const finalLine = { ...preview };
    drawing = false;
    start = null;
    preview = null;
    writeDrawings([...readDrawings(), finalLine]);
    renderLines(svg);
  };

  svg.addEventListener('pointerup', finish, true);
  svg.addEventListener('pointercancel', finish, true);
}

export default function GannzillaWheelLineDrawingPatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    installStyle();
    const svg = ensureOverlay();
    ensureToolbar(svg);
    installDrawing(svg);
    renderLines(svg);
    syncToolUi();

    const onResize = () => {
      const nextSvg = ensureOverlay();
      renderLines(nextSvg);
      syncToolUi();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      document.getElementById('gannzilla-wheel-line-drawing-host-v1')?.remove();
      document.getElementById('gannzilla-wheel-line-drawing-overlay-v1')?.remove();
      document.getElementById('gannzilla-wheel-line-drawing-style-v1')?.remove();
    };
  }, []);

  return null;
}
