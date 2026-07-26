const BUILD = 517;
const STATE_KEY = '__gannzillaCompactToolbarSpacingV517';
const TOOLBAR_ID = 'gannzilla-unified-wheel-tools-v453';
const STYLE_ID = 'gannzilla-compact-toolbar-spacing-style-v517';
const TOOLBAR_WIDTH = 214;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function persistFlag() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('compactToolbarSpacing', 'true');
    url.searchParams.set('compactToolbarWidth', String(TOOLBAR_WIDTH));
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime styling remains authoritative.
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
    #${TOOLBAR_ID}{
      width:${TOOLBAR_WIDTH}px!important;
      min-width:${TOOLBAR_WIDTH}px!important;
      max-width:${TOOLBAR_WIDTH}px!important;
      padding:0!important;
      justify-content:flex-end!important;
    }
  `;
}

function apply() {
  installStyle();
  const toolbar = document.getElementById(TOOLBAR_ID);
  if (!(toolbar instanceof HTMLElement)) return false;
  toolbar.dataset.gannzillaCompactToolbarSpacingV517 = 'true';
  toolbar.style.setProperty('justify-content', 'flex-end', 'important');
  return true;
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || !wheelMode()
    || window[STATE_KEY]) return;

  persistFlag();
  apply();
  [50, 150, 400, 900, 1800, 3600].forEach((delay) => setTimeout(apply, delay));

  window.GANNZILLA_COMPACT_TOOLBAR_SPACING_V517 = true;
  window.__auditGannzillaCompactToolbarSpacingV517 = () => {
    const toolbar = document.getElementById(TOOLBAR_ID);
    const rect = toolbar?.getBoundingClientRect();
    const style = toolbar ? getComputedStyle(toolbar) : null;
    return {
      ok: toolbar instanceof HTMLElement
        && Math.abs((rect?.width || 0) - TOOLBAR_WIDTH) < 1
        && style?.justifyContent === 'flex-end',
      build: BUILD,
      toolbarWidth: rect?.width || 0,
      targetToolbarWidth: TOOLBAR_WIDTH,
      justifyContent: style?.justifyContent || null,
      spacingOnly: true,
      behaviorUntouched: true,
    };
  };

  window[STATE_KEY] = { apply };
}

install();
