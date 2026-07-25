const BUILD = 483;
const CANONICAL_KEY = 'tasi-gannzilla-canonical-panel-v326';
const REFERENCE_KEY = 'tasi-gannzilla-reference-panel-v421';
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const STATE_KEY = '__gannzillaClockwiseDirectionBridgeV483';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function readJson(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch (_) {
    return {};
  }
}

function readState() {
  const runtime = window.__gannzillaReferencePanelStateV421
    || window.__gannzillaCanonicalPanelStateV326;
  return runtime && typeof runtime === 'object' ? runtime : readJson(CANONICAL_KEY);
}

function writeState(clockwise, source = 'direction') {
  const current = readState();
  const next = {
    ...current,
    layout: {
      ...(current.layout || {}),
      clockwise: Boolean(clockwise),
    },
  };

  window.__gannzillaCanonicalPanelStateV326 = next;
  window.__gannzillaReferencePanelStateV421 = next;

  try { localStorage.setItem(CANONICAL_KEY, JSON.stringify(next)); } catch (_) { /* runtime state remains active */ }
  try { localStorage.setItem(REFERENCE_KEY, JSON.stringify(next)); } catch (_) { /* runtime state remains active */ }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('clockwise', clockwise ? 'true' : 'false');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) { /* URL persistence is optional */ }

  const redraw = () => {
    window.__gannzillaUnlimitedRingLayersV480?.schedule?.(`clockwise-v${BUILD}-${source}`);
    window.__gannzillaAllToolsRuntimeV482?.sched?.(`clockwise-v${BUILD}-${source}`);
    window.dispatchEvent(new CustomEvent('gannzilla:clockwise-direction-commit-v483', {
      detail: { clockwise: Boolean(clockwise), source, build: BUILD },
    }));
  };

  redraw();
  requestAnimationFrame(redraw);
  window.setTimeout(redraw, 40);
  window.setTimeout(redraw, 140);
  return next;
}

function layoutCheckbox() {
  const panel = document.getElementById(PANEL_ID);
  if (!(panel instanceof HTMLElement)) return null;
  const section = panel.querySelector('[data-section-id="layout"]');
  if (!(section instanceof HTMLElement)) return null;
  const rows = Array.from(section.querySelectorAll(':scope > .gz421-section-body > .gz421-row'));
  const row = rows.find((node) => {
    const label = String(node.querySelector('.gz421-label')?.textContent || '').trim().toLowerCase();
    return label === 'clockwise' || label.includes('عقرب');
  });
  const input = row?.querySelector('input[type="checkbox"]');
  return input instanceof HTMLInputElement ? input : null;
}

let syncingPanel = false;
function syncPanelCheckbox(clockwise) {
  const input = layoutCheckbox();
  if (!(input instanceof HTMLInputElement) || input.checked === Boolean(clockwise) || syncingPanel) return;
  syncingPanel = true;
  input.click();
  window.setTimeout(() => { syncingPanel = false; }, 0);
}

function normalizedText(node) {
  return String(node?.textContent || '').replace(/\s+/g, ' ').trim();
}

function directionButtonValue(button) {
  const text = normalizedText(button).toLowerCase();
  if (/^(clockwise|مع عقارب الساعة|مع عقرب الساعة)$/.test(text)) return false;
  if (/^(counter|counterclockwise|عكس عقارب الساعة|عكس عقرب الساعة)$/.test(text)) return true;
  return null;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode() || window[STATE_KEY]) return;

  let commits = 0;
  let lastCommit = null;

  const commit = (clockwise, source, syncPanel = false, redispatch = false) => {
    writeState(Boolean(clockwise), source);
    commits += 1;
    lastCommit = { clockwise: Boolean(clockwise), source, at: Date.now() };
    if (syncPanel) window.setTimeout(() => syncPanelCheckbox(Boolean(clockwise)), 0);
    if (redispatch) {
      window.dispatchEvent(new CustomEvent('gannzilla:canonical-property-change-v326', {
        detail: { path: 'layout.clockwise', value: Boolean(clockwise), source, build: BUILD },
      }));
    }
  };

  const onCanonical = (event) => {
    if (event?.detail?.path !== 'layout.clockwise') return;
    commit(event.detail.value, event.detail.source || 'canonical-event', false, false);
  };

  const onPanelChange = (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'checkbox') return;
    const section = input.closest('[data-section-id="layout"]');
    if (!(section instanceof HTMLElement) || section.id === '') return;
    const row = input.closest('.gz421-row');
    const label = String(row?.querySelector('.gz421-label')?.textContent || '').trim().toLowerCase();
    if (label !== 'clockwise' && !label.includes('عقرب')) return;
    commit(input.checked, 'layout-checkbox', false, true);
  };

  const onDirectionButton = (event) => {
    const button = event.target?.closest?.('button');
    if (!(button instanceof HTMLButtonElement) || button.closest('aside')) return;
    const next = directionButtonValue(button);
    if (next === null) return;
    commit(next, 'toolbar-direction-button', true, true);
  };

  window.addEventListener('gannzilla:canonical-property-change-v326', onCanonical, true);
  document.addEventListener('change', onPanelChange, true);
  document.addEventListener('click', onDirectionButton, true);

  const initial = readState()?.layout?.clockwise !== false;
  writeState(initial, 'install');

  window.GANNZILLA_CLOCKWISE_DIRECTION_BRIDGE_V483 = true;
  window.__auditGannzillaClockwiseDirectionBridgeV483 = () => ({
    ok: window.GANNZILLA_CLOCKWISE_DIRECTION_BRIDGE_V483 === true
      && readState()?.layout?.clockwise === window.__gannzillaCanonicalPanelStateV326?.layout?.clockwise,
    build: BUILD,
    clockwise: readState()?.layout?.clockwise !== false,
    canonicalSynchronized: true,
    panelCheckboxFound: layoutCheckbox() instanceof HTMLInputElement,
    unlimitedWheelScheduleAvailable: typeof window.__gannzillaUnlimitedRingLayersV480?.schedule === 'function',
    allToolsScheduleAvailable: typeof window.__gannzillaAllToolsRuntimeV482?.sched === 'function',
    commits,
    lastCommit,
  });

  window[STATE_KEY] = { onCanonical, onPanelChange, onDirectionButton, writeState };
}

install();
