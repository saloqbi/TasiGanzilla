const BUILD = 493;
const ALL_TOOLS_SVG_ID = 'gannzilla-all-tools-runtime-overlay-v482';
const DRAWING_STORE_KEY = 'tasi-gannzilla-top-center-drawings-v471';
const STATE_KEY = '__gannzillaRemoveLargeRedGreenOverlaysV493';

function wheelMode() {
  try {
    const query = new URLSearchParams(window.location.search || '');
    return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  } catch (_) {
    return false;
  }
}

function rgb(value) {
  try {
    const context = document.createElement('canvas').getContext('2d');
    if (!context) return null;
    context.fillStyle = '#000000';
    context.fillStyle = String(value || '');
    const normalized = String(context.fillStyle || '').trim().toLowerCase();
    if (/^#[0-9a-f]{6}$/.test(normalized)) {
      return {
        r: parseInt(normalized.slice(1, 3), 16),
        g: parseInt(normalized.slice(3, 5), 16),
        b: parseInt(normalized.slice(5, 7), 16),
      };
    }
    const match = normalized.match(/^rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
    return match ? { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) } : null;
  } catch (_) {
    return null;
  }
}

function isRed(value) {
  const color = rgb(value);
  return Boolean(color && color.r >= 120 && color.r > color.g * 1.28 && color.r > color.b * 1.20);
}

function isGreen(value) {
  const color = rgb(value);
  return Boolean(color && color.g >= 90 && color.g > color.r * 1.18 && color.g > color.b * 1.18);
}

function elementColor(element) {
  return [
    element.getAttribute('stroke'),
    element.getAttribute('fill'),
    element.style?.stroke,
    element.style?.fill,
  ].filter(Boolean);
}

function isTargetColor(element) {
  return elementColor(element).some((value) => isRed(value) || isGreen(value));
}

function svgSize(svg) {
  const viewBox = svg.viewBox?.baseVal;
  const rect = svg.getBoundingClientRect();
  return {
    width: Math.max(1, Number(viewBox?.width) || rect.width || 1),
    height: Math.max(1, Number(viewBox?.height) || rect.height || 1),
  };
}

function isLargeGeometry(element, svg) {
  const { width, height } = svgSize(svg);
  const threshold = Math.min(width, height) * 0.16;
  const tag = element.tagName.toLowerCase();

  if (tag === 'line') {
    const x1 = Number(element.getAttribute('x1')) || 0;
    const y1 = Number(element.getAttribute('y1')) || 0;
    const x2 = Number(element.getAttribute('x2')) || 0;
    const y2 = Number(element.getAttribute('y2')) || 0;
    return Math.hypot(x2 - x1, y2 - y1) >= threshold;
  }

  if (tag === 'circle') {
    const radius = Number(element.getAttribute('r')) || 0;
    return radius > 0 && radius <= Math.max(18, threshold * 0.12);
  }

  try {
    const box = element.getBBox();
    return Math.max(box.width, box.height, Math.hypot(box.width, box.height)) >= threshold;
  } catch (_) {
    return false;
  }
}

let removedCount = 0;
let applyCount = 0;
let lastApply = null;

function clearSavedDrawings() {
  try {
    const stored = JSON.parse(localStorage.getItem(DRAWING_STORE_KEY) || '[]');
    const count = Array.isArray(stored) ? stored.length : 0;
    if (count > 0) localStorage.setItem(DRAWING_STORE_KEY, '[]');
    return count;
  } catch (_) {
    try { localStorage.setItem(DRAWING_STORE_KEY, '[]'); } catch (_) { /* runtime only */ }
    return 0;
  }
}

function removeTargets(source = 'apply') {
  const svg = document.getElementById(ALL_TOOLS_SVG_ID);
  let removedNow = 0;

  if (svg instanceof SVGSVGElement) {
    const elements = Array.from(svg.querySelectorAll('polygon,polyline,line,path,circle'));
    elements.forEach((element) => {
      if (!isTargetColor(element) || !isLargeGeometry(element, svg)) return;
      element.remove();
      removedNow += 1;
    });
  }

  const savedCleared = clearSavedDrawings();
  removedCount += removedNow;
  applyCount += 1;
  lastApply = { source, removedNow, savedCleared, at: Date.now() };
  return removedNow;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode() || window[STATE_KEY]) return;

  clearSavedDrawings();

  const observer = new MutationObserver(() => {
    queueMicrotask(() => removeTargets('mutation'));
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['stroke', 'fill', 'points', 'd', 'x1', 'y1', 'x2', 'y2'],
  });

  [0, 30, 90, 180, 360, 700, 1400, 2600, 5000, 8000].forEach((delay) => {
    window.setTimeout(() => removeTargets(`boot-${delay}`), delay);
  });

  window.addEventListener('gannzilla:canonical-property-change-v326', () => removeTargets('canonical'), true);
  window.addEventListener('gannzilla:reference-panel-change-v421', () => removeTargets('reference'), true);
  window.addEventListener('resize', () => removeTargets('resize'), true);

  window.GANNZILLA_REMOVE_LARGE_RED_GREEN_OVERLAYS_V493 = true;
  window.__auditGannzillaRemoveLargeRedGreenOverlaysV493 = () => {
    const svg = document.getElementById(ALL_TOOLS_SVG_ID);
    const remaining = svg instanceof SVGSVGElement
      ? Array.from(svg.querySelectorAll('polygon,polyline,line,path,circle'))
        .filter((element) => isTargetColor(element) && isLargeGeometry(element, svg)).length
      : 0;
    return {
      ok: remaining === 0,
      build: BUILD,
      remainingLargeRedGreenOverlays: remaining,
      removedCount,
      applyCount,
      lastApply,
      savedDrawingStoreEmpty: (() => {
        try {
          const stored = JSON.parse(localStorage.getItem(DRAWING_STORE_KEY) || '[]');
          return Array.isArray(stored) && stored.length === 0;
        } catch (_) {
          return false;
        }
      })(),
    };
  };

  window[STATE_KEY] = { observer, removeTargets };
  removeTargets('install');
}

install();
