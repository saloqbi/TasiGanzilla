const BUILD = 516;
const STATE_KEY = '__gannzillaCompactZoomSelectV516';
const TOOLBAR_ID = 'gannzilla-unified-wheel-tools-v453';
const ZOOM_GROUP_ID = 'gannzilla-unified-zoom-group-v509';
const ZOOM_SELECT_ID = 'gannzilla-unified-zoom-select-v509';
const STYLE_ID = 'gannzilla-compact-zoom-select-style-v516';
const SELECT_WIDTH = 46;
const BUTTON_WIDTH = 30;
const GROUP_WIDTH = BUTTON_WIDTH * 2 + SELECT_WIDTH;
const TOOLBAR_WIDTH = 242;

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
    url.searchParams.set('compactZoomSelect', 'true');
    url.searchParams.set('compactZoomSelectWidth', String(SELECT_WIDTH));
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
    }
    #${ZOOM_GROUP_ID}{
      flex:0 0 ${GROUP_WIDTH}px!important;
      width:${GROUP_WIDTH}px!important;
      min-width:${GROUP_WIDTH}px!important;
      max-width:${GROUP_WIDTH}px!important;
      height:30px!important;
      display:flex!important;
      align-items:stretch!important;
      gap:0!important;
    }
    #${ZOOM_SELECT_ID}{
      flex:0 0 ${SELECT_WIDTH}px!important;
      width:${SELECT_WIDTH}px!important;
      min-width:${SELECT_WIDTH}px!important;
      max-width:${SELECT_WIDTH}px!important;
      height:30px!important;
      min-height:30px!important;
      max-height:30px!important;
      margin:0!important;
      padding:0 1px!important;
      border:1px solid #8d969f!important;
      border-radius:0!important;
      background:linear-gradient(#fff,#e5e5e5)!important;
      color:#222!important;
      font:700 10px/28px Arial,"Segoe UI",Tahoma,sans-serif!important;
      text-align:center!important;
      text-align-last:center!important;
      vertical-align:middle!important;
      cursor:pointer!important;
      visibility:visible!important;
      opacity:1!important;
      pointer-events:auto!important;
      box-shadow:none!important;
      box-sizing:border-box!important;
    }
  `;
}

function mark() {
  const toolbar = document.getElementById(TOOLBAR_ID);
  const group = document.getElementById(ZOOM_GROUP_ID);
  const select = document.getElementById(ZOOM_SELECT_ID);
  if (!(toolbar instanceof HTMLElement)
    || !(group instanceof HTMLElement)
    || !(select instanceof HTMLSelectElement)) return false;

  toolbar.dataset.gannzillaCompactZoomSelectV516 = 'true';
  group.dataset.gannzillaCompactZoomSelectV516 = 'true';
  select.dataset.gannzillaCompactZoomSelectV516 = 'true';
  select.style.setProperty('pointer-events', 'auto', 'important');
  select.style.setProperty('cursor', 'pointer', 'important');
  return true;
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || !wheelMode()
    || window[STATE_KEY]) return;

  persistFlag();
  installStyle();

  let frame = 0;
  const apply = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      installStyle();
      mark();
    });
  };

  apply();
  [50, 150, 400, 900, 1800, 3600].forEach((delay) => setTimeout(apply, delay));

  const toolbarObserver = new MutationObserver(apply);
  const observeToolbar = () => {
    const toolbar = document.getElementById(TOOLBAR_ID);
    if (toolbar instanceof HTMLElement) {
      toolbarObserver.disconnect();
      toolbarObserver.observe(toolbar, { childList: true, subtree: true });
    }
  };
  observeToolbar();
  [120, 500, 1400].forEach((delay) => setTimeout(observeToolbar, delay));

  window.GANNZILLA_COMPACT_ZOOM_SELECT_V516 = true;
  window.__auditGannzillaCompactZoomSelectV516 = () => {
    const toolbar = document.getElementById(TOOLBAR_ID);
    const group = document.getElementById(ZOOM_GROUP_ID);
    const select = document.getElementById(ZOOM_SELECT_ID);
    const toolbarRect = toolbar?.getBoundingClientRect();
    const groupRect = group?.getBoundingClientRect();
    const selectRect = select?.getBoundingClientRect();
    return {
      ok: toolbar instanceof HTMLElement
        && group instanceof HTMLElement
        && select instanceof HTMLSelectElement
        && Math.abs((selectRect?.width || 0) - SELECT_WIDTH) < 1
        && Math.abs((selectRect?.height || 0) - 30) < 1
        && Math.abs((groupRect?.width || 0) - GROUP_WIDTH) < 1
        && Math.abs((toolbarRect?.width || 0) - TOOLBAR_WIDTH) < 1,
      build: BUILD,
      selectWidth: selectRect?.width || 0,
      selectHeight: selectRect?.height || 0,
      groupWidth: groupRect?.width || 0,
      toolbarWidth: toolbarRect?.width || 0,
      targetSelectWidth: SELECT_WIDTH,
      sameHeightAsButtons: Math.abs((selectRect?.height || 0) - 30) < 1,
      zoomBehaviorUntouched: true,
    };
  };

  window[STATE_KEY] = { apply, toolbarObserver };
}

install();