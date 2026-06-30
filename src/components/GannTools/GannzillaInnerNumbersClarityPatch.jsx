import React from 'react';

const STYLE_ID = 'gannzilla-inner-numbers-clarity-style-v1';
const LAYER_ID = 'gannzilla-inner-numbers-clarity-layer-v1';
const CARDINAL_ROTATION_DEG = 5;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeRotation(angle) {
  let rot = angle - 90;
  while (rot > 180) rot -= 360;
  while (rot < -180) rot += 360;
  if (rot > 90) rot -= 180;
  if (rot < -90) rot += 180;
  return rot;
}

function polar(cx, cy, radius, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function wheelNumberColor(value) {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n)) return '#111111';
  const mod = ((n % 3) + 3) % 3;
  if (mod === 1) return '#d71920';
  if (mod === 2) return '#0b45c5';
  return '#111111';
}

function numberAtRing(startValue, ringIndex, sectorIndex, divisions, increment) {
  return startValue + ((ringIndex - 1) * divisions + sectorIndex) * increment;
}

function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(4)));
}

function getWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 120 && rect.height > 120)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function getViewSelect() {
  return Array.from(document.querySelectorAll('aside select')).find((select) =>
    Array.from(select.options || []).some((option) => String(option.textContent || '').includes('Circle of 36'))
  );
}

function getNumberInputs() {
  return Array.from(document.querySelectorAll('aside input[type="number"]'));
}

function getSettings() {
  const inputs = getNumberInputs();
  const levels = clamp(Number(inputs[0]?.value) || 5, 1, 12);
  const startValue = Number(inputs[1]?.value ?? 1) || 0;
  const increment = Number(inputs[3]?.value ?? 1) || 1;
  const divisions = Number(getViewSelect()?.value) || 36;
  const clockwise = true;
  return { levels, startValue, increment, divisions, clockwise };
}

function getUnrotatedRect(canvas) {
  const visual = canvas.getBoundingClientRect();
  const width = canvas.offsetWidth || Number.parseFloat(canvas.style.width) || visual.width;
  const height = canvas.offsetHeight || Number.parseFloat(canvas.style.height) || visual.height;
  const centerX = visual.left + visual.width / 2;
  const centerY = visual.top + visual.height / 2;
  const left = centerX - width / 2;
  const top = centerY - height / 2;
  return { left, top, width, height };
}

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #${LAYER_ID} {
      position: fixed !important;
      z-index: 43 !important;
      pointer-events: none !important;
      overflow: visible !important;
      shape-rendering: geometricPrecision !important;
      text-rendering: geometricPrecision !important;
      -webkit-font-smoothing: antialiased !important;
    }
    #${LAYER_ID} text {
      font-family: "Segoe UI", Tahoma, Arial, sans-serif !important;
      font-weight: 950 !important;
      paint-order: stroke fill !important;
      stroke: rgba(255,255,255,.92) !important;
      stroke-linejoin: round !important;
      stroke-linecap: round !important;
    }
  `;
  document.head.appendChild(style);
}

function ensureLayer() {
  let svg = document.getElementById(LAYER_ID);
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = LAYER_ID;
    document.body.appendChild(svg);
  }
  return svg;
}

function renderLayer() {
  const canvas = getWheelCanvas();
  const svg = ensureLayer();
  if (!canvas) {
    svg.innerHTML = '';
    return;
  }

  const { levels, startValue, increment, divisions, clockwise } = getSettings();
  if (divisions > 60) {
    svg.innerHTML = '';
    return;
  }

  const rect = getUnrotatedRect(canvas);
  const designSize = 470 + 96 * levels;
  const zoom = rect.width / designSize;
  const innerRadius = 92 * zoom;
  const ringWidth = 48 * zoom;
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const sector = 360 / divisions;
  const direction = clockwise ? 1 : -1;
  const rotationDeg = canvas.dataset.gannzillaCardinalBalanced === 'true' ? CARDINAL_ROTATION_DEG : 0;

  svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  svg.setAttribute('width', String(rect.width));
  svg.setAttribute('height', String(rect.height));
  svg.style.setProperty('left', `${rect.left}px`, 'important');
  svg.style.setProperty('top', `${rect.top}px`, 'important');
  svg.style.setProperty('width', `${rect.width}px`, 'important');
  svg.style.setProperty('height', `${rect.height}px`, 'important');
  svg.style.setProperty('transform-origin', 'center center', 'important');
  svg.style.setProperty('transform', rotationDeg ? `rotate(${rotationDeg}deg)` : 'none', 'important');

  const parts = [];
  const maxRing = Math.min(3, levels);
  for (let ring = 1; ring <= maxRing; ring += 1) {
    const inner = innerRadius + (ring - 1) * ringWidth;
    const outer = inner + ringWidth;
    const mid = (inner + outer) / 2;
    const fontSize = clamp(ringWidth * (ring === 1 ? 0.42 : ring === 2 ? 0.39 : 0.37), 10.5, 19);
    const strokeWidth = clamp(fontSize * 0.17, 1.4, 2.7);

    for (let i = 0; i < divisions; i += 1) {
      const centerDeg = direction * (i + 0.5) * sector;
      const value = numberAtRing(startValue, ring, i, divisions, increment);
      const text = formatNumber(value);
      const p = polar(cx, cy, mid, centerDeg);
      const rot = normalizeRotation(centerDeg);
      const color = wheelNumberColor(value);
      parts.push(`<text x="${p.x.toFixed(2)}" y="${p.y.toFixed(2)}" transform="rotate(${rot.toFixed(3)} ${p.x.toFixed(2)} ${p.y.toFixed(2)})" text-anchor="middle" dominant-baseline="central" font-size="${fontSize.toFixed(2)}" stroke-width="${strokeWidth.toFixed(2)}" fill="${color}">${text}</text>`);
    }
  }

  svg.innerHTML = parts.join('');
}

export default function GannzillaInnerNumbersClarityPatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    installStyle();
    renderLayer();
    const timer = window.setInterval(renderLayer, 220);
    window.addEventListener('resize', renderLayer);
    window.addEventListener('scroll', renderLayer, true);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', renderLayer);
      window.removeEventListener('scroll', renderLayer, true);
      document.getElementById(LAYER_ID)?.remove();
      document.getElementById(STYLE_ID)?.remove();
    };
  }, []);

  return null;
}
