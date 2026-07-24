const BUILD = 449;
const ZOOM_STRIP_ID = 'gannzilla-zoom-fullscreen-strip-v443';
const WRAP_ID = 'gannzilla-wheel-visibility-inline-v448';
const BUTTON_ID = 'gannzilla-wheel-visibility-button-v448';
const STYLE_ID = 'gannzilla-wheel-visibility-guard-style-v449';
const STATE_KEY = '__gannzillaWheelVisibilityGuardV449';

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

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${ZOOM_STRIP_ID}, #${WRAP_ID} {
      overflow: visible !important;
    }

    #${WRAP_ID} {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    #${BUTTON_ID} {
      display: inline-flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }
  `;
}

function clearHiddenState(node, display) {
  if (!(node instanceof HTMLElement)) return false;
  node.removeAttribute('role');
  node.removeAttribute('hidden');
  node.removeAttribute('aria-hidden');
  node.removeAttribute('data-gannzilla-v145-hidden');
  node.removeAttribute('data-gannzilla-v145-previous-display');
  node.removeAttribute('data-gannzilla-toolbar-duplicate-hidden-v396');
  node.removeAttribute('data-gannzilla-duplicate-toolbar-v393');
  node.style.setProperty('display', display, 'important');
  node.style.setProperty('visibility', 'visible', 'important');
  node.style.setProperty('opacity', '1', 'important');
  node.style.setProperty('pointer-events', 'auto', 'important');
  return true;
}

function repair() {
  installStyle();
  const strip = document.getElementById(ZOOM_STRIP_ID);
  const wrap = document.getElementById(WRAP_ID);
  const button = document.getElementById(BUTTON_ID);
  if (!(strip instanceof HTMLElement) || !(wrap instanceof HTMLElement) || !(button instanceof HTMLElement)) return false;

  strip.style.setProperty('overflow', 'visible', 'important');
  clearHiddenState(wrap, 'block');
  clearHiddenState(button, 'inline-flex');
  button.tabIndex = 0;
  wrap.dataset.gannzillaWheelVisibilityGuardV449 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showWheelVisibilityControl', true) || window[STATE_KEY]) return;

  let frame = 0;
  const schedule = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(repair);
  };

  schedule();
  [20, 60, 140, 320, 700, 1400, 2800, 5000].forEach((delay) => window.setTimeout(schedule, delay));
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'hidden', 'role', 'aria-hidden'],
  });

  window.addEventListener('resize', schedule);
  document.addEventListener('fullscreenchange', schedule);

  window.GANNZILLA_WHEEL_VISIBILITY_GUARD_V449 = true;
  window.__auditGannzillaWheelVisibilityGuardV449 = () => {
    const wrap = document.getElementById(WRAP_ID);
    const button = document.getElementById(BUTTON_ID);
    const rect = button?.getBoundingClientRect();
    return {
      ok: Boolean(wrap?.dataset?.gannzillaWheelVisibilityGuardV449 === 'true' && button && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      legacyRoleRemoved: button?.getAttribute('role') !== 'button',
      visible: Boolean(button && getComputedStyle(button).visibility !== 'hidden' && getComputedStyle(button).display !== 'none'),
    };
  };

  window[STATE_KEY] = { observer };
}

install();