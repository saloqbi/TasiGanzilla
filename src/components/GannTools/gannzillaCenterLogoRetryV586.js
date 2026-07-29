const BUILD = 586;
const STATE_KEY = '__gannzillaCenterLogoRetryV586';
const AUTHORITY_KEY = '__gannzillaCenterLogoRealJpegV585';
const RETRY_INTERVAL_MS = 250;
const RETRY_WINDOW_MS = 15000;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function enabled() {
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  const logoEnabled = !['false', '0', 'off', 'no'].includes(
    String(query.get('centerLogo') || 'true').toLowerCase(),
  );
  return wheelMode && logoEnabled;
}

let attemptCount = 0;
let successCount = 0;
let lastAttempt = null;
let retryTimer = 0;
let stopTimer = 0;

function draw(source = 'draw') {
  if (!enabled()) return false;

  const authority = window[AUTHORITY_KEY];
  const drawLogo = authority?.drawLogo;
  const ok = typeof drawLogo === 'function' && drawLogo(`v586-${source}`) === true;

  attemptCount += 1;
  if (ok) successCount += 1;
  lastAttempt = { source, ok, at: Date.now() };
  return ok;
}

function schedule(source = 'schedule') {
  window.requestAnimationFrame(() => draw(source));
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  const events = [
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:copper-top-correction-v541',
    'gannzilla:center-cell-comfort-v508',
    'gannzilla:native-dpr-zoom-v504',
  ];
  events.forEach((name) => window.addEventListener(name, () => schedule(name), false));
  window.addEventListener('resize', () => schedule('resize'), false);

  [0, 80, 180, 350, 700, 1200, 2200, 4000, 7000, 11000, 14500].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  retryTimer = window.setInterval(() => draw('retry-window'), RETRY_INTERVAL_MS);
  stopTimer = window.setTimeout(() => {
    window.clearInterval(retryTimer);
    retryTimer = 0;
  }, RETRY_WINDOW_MS);

  window.GANNZILLA_CENTER_LOGO_RETRY_V586 = true;
  window.__auditGannzillaCenterLogoRetryV586 = () => ({
    ok: successCount > 0,
    build: BUILD,
    attemptCount,
    successCount,
    retryActive: retryTimer !== 0,
    retryWindowMs: RETRY_WINDOW_MS,
    lastAttempt,
  });

  window[STATE_KEY] = {
    draw,
    schedule,
    get retryTimer() { return retryTimer; },
    get stopTimer() { return stopTimer; },
  };
}

install();
