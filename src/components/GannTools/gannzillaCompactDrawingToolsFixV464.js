const BUILD = 464;
const STRIP_ID = 'gannzilla-compact-drawing-tools-v463';
const ROOT_ID = 'gannzilla-unified-wheel-tools-v453';
const STATE_KEY = '__gannzillaCompactDrawingToolsFixV464';

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

function installHistoryButton(action, key, shiftKey = false) {
  const strip = document.getElementById(STRIP_ID);
  const button = strip?.querySelector(`[data-action="${action}"]`);
  if (!(button instanceof HTMLButtonElement) || button.dataset.gannzillaHistoryFixedV464 === 'true') return false;

  const replacement = button.cloneNode(true);
  replacement.dataset.gannzillaHistoryFixedV464 = 'true';
  replacement.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key,
      code: `Key${key.toUpperCase()}`,
      ctrlKey: true,
      shiftKey,
      bubbles: true,
      cancelable: true,
      composed: true,
    }));
  });
  button.replaceWith(replacement);
  return true;
}

function positionStrip() {
  const strip = document.getElementById(STRIP_ID);
  const root = document.getElementById(ROOT_ID);
  if (!(strip instanceof HTMLElement) || !(root instanceof HTMLElement)) return false;

  const rootRect = root.getBoundingClientRect();
  if (rootRect.width < 1 || rootRect.height < 1) return false;
  const requested = Math.round(numberParam('compactDrawingToolbarWidth', 820, 420, 1040));
  const gap = Math.round(numberParam('compactDrawingToolbarGap', 6, 2, 20));
  const available = Math.max(220, Math.round(rootRect.left - gap - 4));
  const width = Math.min(requested, available);
  const left = Math.max(4, Math.round(rootRect.left - gap - width));

  strip.style.setProperty('left', `${left}px`, 'important');
  strip.style.setProperty('top', `${Math.max(2, Math.round(rootRect.top))}px`, 'important');
  strip.style.setProperty('width', `${width}px`, 'important');
  strip.style.setProperty('min-width', `${width}px`, 'important');
  strip.style.setProperty('max-width', `${width}px`, 'important');
  strip.dataset.gannzillaResponsivePositionV464 = 'true';
  return true;
}

function refresh() {
  const undoFixed = installHistoryButton('undo', 'z', false);
  const redoFixed = installHistoryButton('redo', 'y', false);
  const positioned = positionStrip();
  return undoFixed || redoFixed || positioned;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showCompactDrawingTools', true) || window[STATE_KEY]) return;

  let frame = 0;
  let rootObserver = null;
  const schedule = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(refresh);
  };

  schedule();
  const timers = [40, 120, 300, 700, 1500, 3000, 5000].map((delay) => window.setTimeout(schedule, delay));
  const root = document.getElementById(ROOT_ID);
  if (root instanceof HTMLElement && typeof ResizeObserver === 'function') {
    rootObserver = new ResizeObserver(schedule);
    rootObserver.observe(root);
  }
  window.addEventListener('resize', schedule);
  document.addEventListener('fullscreenchange', schedule);

  window.GANNZILLA_COMPACT_DRAWING_TOOLS_FIX_V464 = true;
  window.__auditGannzillaCompactDrawingToolsFixV464 = () => {
    const strip = document.getElementById(STRIP_ID);
    return {
      ok: Boolean(
        strip?.querySelector('[data-action="undo"][data-gannzilla-history-fixed-v464="true"]')
        && strip?.querySelector('[data-action="redo"][data-gannzilla-history-fixed-v464="true"]')
        && strip?.dataset?.gannzillaResponsivePositionV464 === 'true'
      ),
      build: BUILD,
      undoFixed: Boolean(strip?.querySelector('[data-action="undo"][data-gannzilla-history-fixed-v464="true"]')),
      redoFixed: Boolean(strip?.querySelector('[data-action="redo"][data-gannzilla-history-fixed-v464="true"]')),
      responsivePosition: strip?.dataset?.gannzillaResponsivePositionV464 === 'true',
    };
  };

  window[STATE_KEY] = { timers, get rootObserver() { return rootObserver; }, schedule };
}

install();
