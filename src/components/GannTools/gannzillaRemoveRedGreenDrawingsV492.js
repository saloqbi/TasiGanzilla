const BUILD = 492;
const STORE_KEY = 'tasi-gannzilla-top-center-drawings-v471';
const CLEANUP_KEY = 'tasi-gannzilla-remove-red-green-drawings-v492';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function rgb(value) {
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#000000';
    ctx.fillStyle = String(value || '');
    const normalized = String(ctx.fillStyle || '').trim().toLowerCase();
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

function objectColor(object) {
  return object?.color || object?.strokeColor || object?.stroke || object?.fillColor || '';
}

function isRed(value) {
  const color = rgb(value);
  return Boolean(color && color.r >= 120 && color.r > color.g * 1.35 && color.r > color.b * 1.35);
}

function isGreen(value) {
  const color = rgb(value);
  return Boolean(color && color.g >= 100 && color.g > color.r * 1.3 && color.g > color.b * 1.3);
}

function isTarget(object) {
  const type = String(object?.type || '').toLowerCase();
  const color = objectColor(object);
  const redTriangle = type === 'triangle' && isRed(color);
  const greenLine = ['line', 'arrow', 'pencil'].includes(type) && isGreen(color);
  return redTriangle || greenLine;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;

  let before = [];
  try {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    before = Array.isArray(stored) ? stored : [];
  } catch (_) {
    before = [];
  }

  const after = before.filter((object) => !isTarget(object));
  const removed = before.length - after.length;

  try { localStorage.setItem(STORE_KEY, JSON.stringify(after)); } catch (_) { /* runtime cleanup still proceeds */ }
  try {
    localStorage.setItem(CLEANUP_KEY, JSON.stringify({ build: BUILD, removed, at: Date.now() }));
  } catch (_) { /* audit marker is optional */ }

  window.GANNZILLA_REMOVE_RED_GREEN_DRAWINGS_V492 = true;
  window.__auditGannzillaRemoveRedGreenDrawingsV492 = () => ({
    ok: true,
    build: BUILD,
    removed,
    beforeCount: before.length,
    afterCount: after.length,
    redTriangleRemoved: !after.some((object) => String(object?.type || '').toLowerCase() === 'triangle' && isRed(objectColor(object))),
    greenLineRemoved: !after.some((object) => ['line', 'arrow', 'pencil'].includes(String(object?.type || '').toLowerCase()) && isGreen(objectColor(object))),
  });
}

install();
