const BUILD = 671;
const STATE_KEY = '__gannzillaToolbarIconMirrorFramesV671';
const ENABLE_PARAM = 'toolbarIconMirrorFrames';

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

function chromeBackground() {
  return [
    'linear-gradient(180deg,rgba(255,255,255,.98) 0%,rgba(239,244,247,.98) 38%,rgba(202,211,217,.98) 64%,rgba(249,251,252,.98) 100%) padding-box',
    'linear-gradient(132deg,#17232b 0%,#718793 8%,#f7fdff 16%,#ffffff 24%,#879aa5 34%,#273944 43%,#dff6ff 52%,#ffffff 61%,#637984 72%,#eefbff 83%,#ffffff 91%,#314550 100%) border-box',
  ].join(',');
}

function chromeShadow() {
  return [
    '0 0 0 1px rgba(25,39,48,.92)',
    'inset 0 1px 0 rgba(255,255,255,1)',
    'inset 0 -1px 0 rgba(37,54,64,.62)',
    'inset 1px 0 0 rgba(255,255,255,.60)',
    '0 1px 3px rgba(12,23,30,.30)',
    '0 0 5px rgba(204,239,252,.58)',
  ].join(',');
}

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return;
  element.style.setProperty(property, value, 'important');
}

function applyFrame(element) {
  setImportant(element, 'border', '2px solid transparent');
  setImportant(element, 'border-radius', '4px');
  setImportant(element, 'background', chromeBackground());
  setImportant(element, 'background-clip', 'padding-box, border-box');
  setImportant(element, 'box-shadow', chromeShadow());
  setImportant(element, 'outline', 'none');
  element.dataset.gannzillaToolbarIconMirrorFrameV671 = 'true';
  element.dataset.gannzillaToolbarFrameAuthorityV671 = 'inline-important';
}

function apply(source = 'apply') {
  if (!enabled()) return false;
  const controls = targetIds()
    .map((id) => document.getElementById(id))
    .filter((element) => element instanceof HTMLElement);

  controls.forEach(applyFrame);

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    controlCount: controls.length,
    inlineImportantAuthority: true,
    frameOnly: true,
    iconGlyphsChanged: false,
    geometryChanged: false,
    at: Date.now(),
  };
  return controls.length > 0;
}

function persistFlags() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(ENABLE_PARAM, 'true');
    url.searchParams.set('v', String(BUILD));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Runtime styling remains authoritative.
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

  [0, 20, 60, 120, 240, 500, 1000, 1800, 3200, 5200, 8200].forEach((delay) => {
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
  timer = window.setInterval(() => apply('inline-frame-watch'), 80);

  window.GANNZILLA_TOOLBAR_ICON_MIRROR_FRAMES_V671 = true;
  window.__auditGannzillaToolbarIconMirrorFramesV671 = () => {
    const controls = targetIds()
      .map((id) => document.getElementById(id))
      .filter((element) => element instanceof HTMLElement);
    const styled = controls.filter((element) => (
      element.dataset.gannzillaToolbarIconMirrorFrameV671 === 'true'
      && element.style.getPropertyPriority('border') === 'important'
      && element.style.getPropertyPriority('box-shadow') === 'important'
    ));
    return {
      ok: controls.length > 0 && styled.length === controls.length,
      build: BUILD,
      enabled: enabled(),
      controlCount: controls.length,
      styledControlCount: styled.length,
      inlineImportantAuthority: true,
      frameOnly: true,
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
