const BUILD = 615;
const STATE_KEY = '__gannzillaCenterClockDateAtRemovedRuleV615';
const DATE_ID = 'gannzilla-center-clock-date-v614';
const DATE_RULE_ID = 'gannzilla-center-clock-date-rule-v614';

let frame = 0;
let timer = 0;
let applyCount = 0;
let lastApply = null;

function setImportant(element, property, value) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.style.getPropertyValue(property) === value
      && element.style.getPropertyPriority(property) === 'important') return false;
  element.style.setProperty(property, value, 'important');
  return true;
}

function apply(source = 'apply') {
  frame = 0;

  const date = document.getElementById(DATE_ID);
  const dateRule = document.getElementById(DATE_RULE_ID);
  dateRule?.remove();

  if (!(date instanceof HTMLDivElement)) return false;

  // Place the date centre exactly where the removed rule was positioned.
  setImportant(date, 'top', '19%');
  setImportant(date, 'transform', 'translate3d(0, -50%, 0)');

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    dateTopPercent: 19,
    dateRuleRemoved: !document.getElementById(DATE_RULE_ID),
    otherLayoutChanged: false,
    at: Date.now(),
  };
  return true;
}

function schedule(source = 'schedule') {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => apply(source));
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || window[STATE_KEY]) return;

  [0, 80, 220, 600, 1400, 3000].forEach((delay) => {
    window.setTimeout(() => schedule(`boot-${delay}`), delay);
  });

  window.addEventListener('resize', () => schedule('window-resize'), false);
  timer = window.setInterval(() => apply('persistent-date-position'), 200);

  window.GANNZILLA_CENTER_CLOCK_DATE_AT_REMOVED_RULE_V615 = true;
  window.__auditGannzillaCenterClockDateAtRemovedRuleV615 = () => ({
    ok: document.getElementById(DATE_ID) instanceof HTMLDivElement
      && !document.getElementById(DATE_RULE_ID),
    build: BUILD,
    dateTopPercent: 19,
    dateRuleRemoved: !document.getElementById(DATE_RULE_ID),
    timerActive: Boolean(timer),
    applyCount,
    lastApply,
  });

  window[STATE_KEY] = { apply, schedule, timer };
  schedule('install');
}

install();
