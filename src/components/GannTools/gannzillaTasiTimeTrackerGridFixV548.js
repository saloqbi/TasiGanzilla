const BUILD = 548;
const STATE_KEY = '__gannzillaTasiTimeTrackerGridFixV548';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';

function apply(source = 'apply') {
  const host = document.getElementById(HOST_ID);
  const top = host?.shadowRoot?.querySelector('.top');
  if (!(host instanceof HTMLElement) || !(top instanceof HTMLElement)) return false;

  const compact = window.innerWidth < 1020;
  top.style.setProperty(
    'grid-template-columns',
    compact
      ? '56px minmax(155px, 1fr) minmax(190px, 1.25fr) repeat(6, minmax(60px, .55fr))'
      : '68px minmax(170px, 1fr) minmax(240px, 1.55fr) repeat(6, minmax(70px, .65fr))',
    'important',
  );
  top.dataset.gannzillaTasiTimeTrackerGridFixV548 = 'true';
  host.dataset.gannzillaTasiTimeTrackerGridColumnsV548 = '9';
  host.dataset.gannzillaTasiTimeTrackerGridFixSourceV548 = source;
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || window[STATE_KEY]) return;

  let timer = 0;
  const schedule = (source = 'schedule', delay = 0) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => apply(source), delay);
  };

  window.addEventListener('resize', () => schedule('resize', 0), false);
  const observer = new MutationObserver(() => schedule('dom-mutation', 0));
  observer.observe(document.body, { childList: true, subtree: true });

  [0, 80, 220, 600, 1400, 3200].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`, 0), delay);
  });

  window.GANNZILLA_TASI_TIME_TRACKER_GRID_FIX_V548 = true;
  window.__auditGannzillaTasiTimeTrackerGridFixV548 = () => {
    const host = document.getElementById(HOST_ID);
    const top = host?.shadowRoot?.querySelector('.top');
    return {
      ok: host instanceof HTMLElement
        && top instanceof HTMLElement
        && top.dataset.gannzillaTasiTimeTrackerGridFixV548 === 'true'
        && host.dataset.gannzillaTasiTimeTrackerGridColumnsV548 === '9',
      build: BUILD,
      columns: Number(host?.dataset?.gannzillaTasiTimeTrackerGridColumnsV548 || 0),
      source: host?.dataset?.gannzillaTasiTimeTrackerGridFixSourceV548 || null,
    };
  };

  window[STATE_KEY] = { apply, schedule, observer };
}

install();
