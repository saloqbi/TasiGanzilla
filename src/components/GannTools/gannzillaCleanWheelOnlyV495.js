const BUILD = 495;
const STATE_KEY = '__gannzillaCleanWheelOnlyV495';
const IDS = [
  'gannzilla-all-tools-runtime-overlay-v482',
  'gannzilla-top-center-drawing-overlay-v471',
  'gannzilla-top-center-drawing-toolbar-v471',
  'gannzilla-top-center-drawing-trigger-v471',
  'gannzilla-top-center-drawing-file-v471',
];
const STORAGE_KEYS = [
  'tasi-gannzilla-all-tools-active-paths-v482',
  'tasi-gannzilla-top-center-drawings-v471',
  'tasi-gannzilla-top-center-prefs-v471',
];

function wheelMode() {
  try {
    const q = new URLSearchParams(location.search || '');
    return q.get('gannzillaPro') === 'true' || q.get('wheelPro') === 'true';
  } catch (_) {
    return false;
  }
}

let applyCount = 0;
let removedCount = 0;
let lastApply = null;

function clearStorage() {
  STORAGE_KEYS.forEach((key) => {
    try { localStorage.removeItem(key); } catch (_) { /* no-op */ }
  });
}

function removeKnownNodes() {
  let removed = 0;
  IDS.forEach((id) => {
    document.querySelectorAll(`#${CSS.escape(id)}`).forEach((node) => {
      node.remove();
      removed += 1;
    });
  });
  return removed;
}

function removeLargeFloatingSvgs() {
  let removed = 0;
  document.querySelectorAll('svg').forEach((svg) => {
    if (svg.closest('aside,button,[role="toolbar"],#gannzilla-unified-wheel-tools-v453')) return;
    const rect = svg.getBoundingClientRect();
    const style = getComputedStyle(svg);
    const floating = ['fixed', 'absolute'].includes(style.position);
    const large = rect.width > 240 && rect.height > 240;
    if (floating && large) {
      svg.remove();
      removed += 1;
    }
  });
  return removed;
}

function apply(source = 'apply') {
  clearStorage();
  const removedNow = removeKnownNodes() + removeLargeFloatingSvgs();
  removedCount += removedNow;
  applyCount += 1;
  lastApply = { source, removedNow, at: Date.now() };
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode() || window[STATE_KEY]) return;
  apply('install');

  const observer = new MutationObserver(() => queueMicrotask(() => apply('mutation')));
  observer.observe(document.documentElement, { childList: true, subtree: true });

  [0, 30, 80, 160, 320, 700, 1400, 2800, 5200, 9000].forEach((delay) => {
    setTimeout(() => apply(`boot-${delay}`), delay);
  });

  window.GANNZILLA_CLEAN_WHEEL_ONLY_V495 = true;
  window.__auditGannzillaCleanWheelOnlyV495 = () => ({
    ok: IDS.every((id) => !document.getElementById(id))
      && !Array.from(document.querySelectorAll('svg')).some((svg) => {
        if (svg.closest('aside,button,[role="toolbar"],#gannzilla-unified-wheel-tools-v453')) return false;
        const rect = svg.getBoundingClientRect();
        const style = getComputedStyle(svg);
        return ['fixed', 'absolute'].includes(style.position) && rect.width > 240 && rect.height > 240;
      }),
    build: BUILD,
    applyCount,
    removedCount,
    lastApply,
  });

  window[STATE_KEY] = { observer, apply };
}

install();
