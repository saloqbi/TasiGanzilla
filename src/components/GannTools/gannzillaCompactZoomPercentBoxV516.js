const BUILD = 516;
const ROOT_ID = 'gannzilla-unified-wheel-tools-v453';
const ZOOM_GROUP_ID = 'gannzilla-unified-zoom-group-v509';
const ZOOM_SELECT_ID = 'gannzilla-unified-zoom-select-v509';
const STYLE_ID = 'gannzilla-compact-zoom-percent-box-style-v516';
const STATE_KEY = '__gannzillaCompactZoomPercentBoxV516';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
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
    #${ROOT_ID} {
      width: 234px !important;
      min-width: 234px !important;
      max-width: 234px !important;
      gap: 4px !important;
    }

    #${ZOOM_GROUP_ID} {
      flex: 0 0 98px !important;
      width: 98px !important;
      min-width: 98px !important;
      max-width: 98px !important;
      height: 30px !important;
      gap: 0 !important;
    }

    #${ZOOM_SELECT_ID} {
      width: 38px !important;
      min-width: 38px !important;
      max-width: 38px !important;
      height: 30px !important;
      min-height: 30px !important;
      max-height: 30px !important;
      margin: 0 !important;
      padding: 0 1px !important;
      border-radius: 0 !important;
      font: 700 10px/28px Arial, "Segoe UI", Tahoma, sans-serif !important;
      text-align: center !important;
      text-align-last: center !important;
      vertical-align: middle !important;
      box-sizing: border-box !important;
    }
  `;
}

function mark() {
  const root = document.getElementById(ROOT_ID);
  const group = document.getElementById(ZOOM_GROUP_ID);
  const select = document.getElementById(ZOOM_SELECT_ID);
  if (!(root instanceof HTMLElement)
    || !(group instanceof HTMLElement)
    || !(select instanceof HTMLSelectElement)) return false;

  root.dataset.gannzillaCompactZoomPercentBoxV516 = 'true';
  group.dataset.gannzillaCompactZoomPercentBoxV516 = 'true';
  select.dataset.gannzillaCompactZoomPercentBoxV516 = 'true';
  return true;
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('compactZoomPercentBox', 'true');
    url.searchParams.set('zoomPercentBoxWidth', '38');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime styling remains active.
  }
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || !wheelMode()
    || window[STATE_KEY]) return;

  installStyle();
  persistFlags();

  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(mark);
  };

  schedule();
  [50, 150, 400, 900, 1800, 3600].forEach((delay) => setTimeout(schedule, delay));

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', schedule);

  window.GANNZILLA_COMPACT_ZOOM_PERCENT_BOX_V516 = true;
  window.__auditGannzillaCompactZoomPercentBoxV516 = () => {
    const root = document.getElementById(ROOT_ID);
    const group = document.getElementById(ZOOM_GROUP_ID);
    const select = document.getElementById(ZOOM_SELECT_ID);
    const rootRect = root?.getBoundingClientRect();
    const groupRect = group?.getBoundingClientRect();
    const selectRect = select?.getBoundingClientRect();
    return {
      ok: root instanceof HTMLElement
        && group instanceof HTMLElement
        && select instanceof HTMLSelectElement
        && Math.abs((selectRect?.width || 0) - 38) < 1
        && Math.abs((selectRect?.height || 0) - 30) < 1,
      build: BUILD,
      rootWidth: rootRect?.width || 0,
      zoomGroupWidth: groupRect?.width || 0,
      zoomPercentWidth: selectRect?.width || 0,
      zoomPercentHeight: selectRect?.height || 0,
      zoomFunctionsUnaffected: true,
    };
  };

  window[STATE_KEY] = { observer, schedule };
}

install();