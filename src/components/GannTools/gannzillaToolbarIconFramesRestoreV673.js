const BUILD = 673;
const STATE_KEY = '__gannzillaToolbarIconFramesRestoreV673';
const ENABLE_PARAM = 'restoreToolbarIconFrames';

let observer = null;
let timer = 0;
let applyCount = 0;
let lastApply = null;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = false) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function enabled() {
  return wheelMode() && boolParam(ENABLE_PARAM, false);
}

function targetIds() {
  return [
    'gannzilla-unified-eye-v509',
    'gannzilla-panel-visibility-eye-v511',
    'gannzilla-time-tracker-visibility-clock-v578',
    'gannzilla-unified-move-v509',
    'gannzilla-unified-zoom-out-v509',
    'gannzilla-unified-zoom-select-v509',
    'gannzilla-unified-zoom-in-v509',
    'gannzilla-unified-fullscreen-v509',
    'gannzilla-top-center-drawing-trigger-v471',
    'gannzilla-wheel-color-toggle-v511',
    'gannzilla-connection-button-v439',
    'gannzilla-right-language-button-v438',
  ];
}

function clearMirrorFrame(element) {
  if (!(element instanceof HTMLElement)) return false;
  [
    'border',
    'border-radius',
    'background',
    'background-clip',
    'box-shadow',
    'outline',
    'filter',
  ].forEach((property) => element.style.removeProperty(property));
  delete element.dataset.gannzillaToolbarIconMirrorFrameV670;
  delete element.dataset.gannzillaToolbarIconMirrorFrameV671;
  delete element.dataset.gannzillaToolbarFrameOnlyV670;
  delete element.dataset.gannzillaToolbarFrameAuthorityV671;
  element.dataset.gannzillaToolbarIconFramesRestoredV673 = 'true';
  return true;
}

function removeLegacyAuthorities() {
  document.getElementById('gannzilla-toolbar-icon-mirror-frames-v670')?.remove();
}

function apply(source = 'apply') {
  if (!enabled()) return false;
  removeLegacyAuthorities();
  const controls = targetIds()
    .map((id) => document.getElementById(id))
    .filter((element) => element instanceof HTMLElement);
  controls.forEach(clearMirrorFrame);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    controlCount: controls.length,
    mirrorFramesRemoved: true,
    fullToolbarStripPreserved: true,
    iconGlyphsChanged: false,
    geometryChanged: false,
    at: Date.now(),
  };
  return controls.length > 0;
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('toolbarIconMirrorFrames', 'false');
    url.searchParams.set('toolbarFullMirrorStrip', 'true');
    url.searchParams.set(ENABLE_PARAM, 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime restoration remains authoritative.
  }
}

function schedule(source = 'schedule', delay = 0) {
  window.clearTimeout(schedule.timer);
  schedule.timer = window.setTimeout(() => apply(source), delay);
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  persistFlags();
  [0, 20, 60, 120, 240, 500, 1000, 1800, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  observer = new MutationObserver(() => schedule('mutation', 0));
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  });
  window.addEventListener('resize', () => schedule('resize', 0), false);
  timer = window.setInterval(() => apply('restore-watch'), 300);

  window.GANNZILLA_TOOLBAR_ICON_FRAMES_RESTORE_V673 = true;
  window.__auditGannzillaToolbarIconFramesRestoreV673 = () => {
    const controls = targetIds()
      .map((id) => document.getElementById(id))
      .filter((element) => element instanceof HTMLElement);
    const restored = controls.filter((element) => (
      element.dataset.gannzillaToolbarIconFramesRestoredV673 === 'true'
    ));
    return {
      ok: controls.length > 0 && restored.length === controls.length,
      build: BUILD,
      enabled: enabled(),
      controlCount: controls.length,
      restoredControlCount: restored.length,
      mirrorFramesRemoved: true,
      fullToolbarStripPreserved: true,
      iconGlyphsChanged: false,
      geometryChanged: false,
      applyCount,
      observerActive: Boolean(observer),
      timerActive: Boolean(timer),
      lastApply,
    };
  };

  window[STATE_KEY] = { apply, schedule };
  schedule('install');
}

install();
