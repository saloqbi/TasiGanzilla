const BUILD = 547;
const STATE_KEY = '__gannzillaTasiTimeTrackerV547';
const HOST_ID = 'gannzilla-tasi-time-tracker-v547';
const MINUTES = 60;
const TWO_PI = Math.PI * 2;

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = false) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function enabled() {
  return wheelMode() && boolParam('timeTracker', false);
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function arabicDay(date) {
  const names = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return names[date.getDay()] || '';
}

function formattedDate(date) {
  return `${pad(date.getDate())} - ${pad(date.getMonth() + 1)} - ${date.getFullYear()}`;
}

function formattedTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function minuteAngle(minute) {
  return minute * 6;
}

function setImportant(element, name, value) {
  if (!(element instanceof HTMLElement)) return;
  element.style.setProperty(name, value, 'important');
}

function visible(element) {
  if (!(element instanceof HTMLElement)) return false;
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(style.opacity || 1) > 0.01
    && rect.width > 1
    && rect.height > 1;
}

function panelRightEdge() {
  return Array.from(document.querySelectorAll('aside'))
    .filter((aside) => visible(aside))
    .map((aside) => aside.getBoundingClientRect())
    .filter((rect) => rect.left <= 12 && rect.width <= 520)
    .reduce((maximum, rect) => Math.max(maximum, rect.right), 0);
}

function toolbarBottomEdge() {
  const selectors = [
    '[data-gannzilla-toolbar="true"]',
    '.gannzilla-chart-toolbar-v328',
    '#gannzilla-top-center-drawing-toolbar-v471',
    '#gannzilla-unified-wheel-tools-v453',
  ];
  return selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)))
    .filter((element) => visible(element))
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.top < 180)
    .reduce((maximum, rect) => Math.max(maximum, rect.bottom), 0);
}

function trackerMarkup() {
  return `
    <style>
      :host {
        all: initial;
        --tt-copper-0: #2f1207;
        --tt-copper-1: #5c260d;
        --tt-copper-2: #9c4a1d;
        --tt-copper-3: #d47a3b;
        --tt-copper-4: #f0b377;
        --tt-gold: #e9bd7a;
        --tt-gold-soft: #ffdca8;
        --tt-ink: #050505;
        --tt-panel: rgba(8, 6, 5, 0.975);
        --tt-cell-min: 18px;
        display: block;
        direction: rtl;
        font-family: "Noto Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif;
        color: var(--tt-gold-soft);
      }

      * { box-sizing: border-box; }

      .tracker {
        position: relative;
        width: 100%;
        min-width: 720px;
        padding: 8px 12px 10px;
        border: 2px solid #7a3515;
        border-radius: 12px;
        background:
          radial-gradient(circle at 50% -15%, rgba(213, 112, 43, 0.24), transparent 34%),
          repeating-linear-gradient(115deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 11px),
          linear-gradient(180deg, rgba(18, 13, 9, 0.985), rgba(3, 3, 3, 0.99));
        box-shadow:
          0 0 0 1px rgba(242, 169, 104, 0.42) inset,
          0 0 0 4px rgba(54, 20, 6, 0.68) inset,
          0 7px 24px rgba(0, 0, 0, 0.52),
          0 0 16px rgba(177, 75, 22, 0.24);
        overflow: hidden;
      }

      .tracker::before,
      .tracker::after {
        content: "◆";
        position: absolute;
        top: 50%;
        z-index: 4;
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border: 2px solid #b7632e;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 30%, #fff2d3 0 5%, #d73622 8% 25%, #541208 27% 58%, #160704 60% 100%);
        color: #f6bd77;
        font-size: 9px;
        transform: translateY(-50%);
        box-shadow: 0 0 0 3px #311006, 0 0 14px rgba(220, 82, 25, 0.55);
      }
      .tracker::before { right: -14px; }
      .tracker::after { left: -14px; }

      .top {
        display: grid;
        grid-template-columns: 68px minmax(170px, 1fr) minmax(240px, 1.55fr) repeat(5, minmax(74px, .65fr));
        gap: 6px;
        align-items: stretch;
        min-height: 62px;
        direction: rtl;
      }

      .clock-face,
      .metric,
      .identity {
        position: relative;
        min-width: 0;
        border: 1px solid rgba(183, 92, 40, 0.82);
        border-radius: 8px;
        background:
          linear-gradient(180deg, rgba(40, 24, 15, 0.92), rgba(7, 6, 5, 0.98));
        box-shadow: 0 0 0 1px rgba(248, 190, 122, 0.15) inset;
      }

      .clock-face {
        display: grid;
        place-items: center;
        border-radius: 50%;
        aspect-ratio: 1;
        width: 58px;
        height: 58px;
        margin: auto;
        background:
          radial-gradient(circle, #18100b 0 42%, transparent 43%),
          repeating-conic-gradient(from -1deg, #c97a3d 0 1deg, transparent 1deg 15deg),
          radial-gradient(circle, #090706 0 58%, #9b4b1f 59% 62%, #120805 63% 100%);
        box-shadow: 0 0 0 2px #2b0d04, 0 0 10px rgba(216, 107, 42, 0.35);
      }

      .hand {
        position: absolute;
        left: 50%;
        bottom: 50%;
        width: 2px;
        transform-origin: 50% 100%;
        border-radius: 999px;
      }
      .hand-hour { height: 15px; background: #f0bd80; }
      .hand-minute { height: 21px; background: #f5d1a0; }
      .hand-second { width: 1px; height: 23px; background: #e54d2e; }
      .clock-pin {
        position: absolute;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #f1b26e;
        box-shadow: 0 0 5px #ff8c42;
      }

      .identity {
        display: grid;
        grid-template-columns: 1fr 1.25fr;
        gap: 0;
        overflow: hidden;
      }
      .identity > div,
      .metric {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 5px 7px;
        text-align: center;
      }
      .identity > div + div { border-right: 1px solid rgba(176, 82, 34, .58); }

      .label {
        color: #d7a66c;
        font-size: 11px;
        font-weight: 700;
        line-height: 1.1;
        white-space: nowrap;
      }
      .value {
        margin-top: 2px;
        color: #ffe0b1;
        font-size: 17px;
        font-weight: 800;
        line-height: 1.05;
        white-space: nowrap;
        text-shadow: 0 1px 4px rgba(0,0,0,.85);
      }
      .time-value {
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(27px, 3vw, 42px);
        letter-spacing: 2px;
        color: #ffd59a;
        text-shadow: 0 0 10px rgba(222, 104, 38, .62), 0 2px 3px #000;
      }
      .time-subtitle { font-size: 10px; color: #c99762; }

      .metric.hour { box-shadow: 0 -3px 0 #2376d9 inset, 0 0 12px rgba(27, 99, 210, .16); }
      .metric.minute { box-shadow: 0 -3px 0 #e3312f inset, 0 0 12px rgba(227, 49, 47, .2); }
      .metric.second { box-shadow: 0 -3px 0 #b7632e inset; }
      .metric.angle { box-shadow: 0 -3px 0 #f09a42 inset, 0 0 12px rgba(240, 154, 66, .18); }
      .metric.direction .value { color: #66df6b; }

      .cycle-value {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .cycle-ring {
        width: 19px;
        height: 19px;
        border-radius: 50%;
        background: conic-gradient(#e17a35 var(--cycle-progress, 0deg), #26130c 0);
        box-shadow: 0 0 0 2px #6f2c10 inset;
      }
      .cycle-ring::after {
        content: "";
        display: block;
        width: 11px;
        height: 11px;
        margin: 4px;
        border-radius: 50%;
        background: #080605;
      }

      .section-title {
        position: relative;
        z-index: 2;
        width: max-content;
        max-width: 70%;
        margin: 6px auto 3px;
        padding: 1px 24px 2px;
        border: 1px solid rgba(159, 69, 26, .72);
        border-radius: 999px;
        background: linear-gradient(180deg, #26130c, #090605);
        color: #e5b477;
        font-size: 11px;
        font-weight: 800;
        line-height: 1.4;
        text-align: center;
      }
      .section-title::before,
      .section-title::after {
        content: "◆";
        position: absolute;
        top: 50%;
        color: #c06a33;
        font-size: 8px;
        transform: translateY(-50%);
      }
      .section-title::before { right: 8px; }
      .section-title::after { left: 8px; }

      .row-shell {
        position: relative;
        direction: ltr;
        overflow-x: auto;
        overflow-y: hidden;
        border: 1px solid rgba(140, 60, 23, .88);
        border-radius: 6px;
        background: rgba(2, 2, 2, .92);
        scrollbar-width: none;
        box-shadow: 0 0 0 1px rgba(238, 153, 87, .10) inset;
      }
      .row-shell::-webkit-scrollbar { display: none; }

      .cells {
        display: grid;
        grid-template-columns: repeat(60, minmax(var(--tt-cell-min), 1fr));
        min-width: calc(var(--tt-cell-min) * 60);
        height: 28px;
      }

      .cell {
        position: relative;
        display: grid;
        place-items: center;
        border-right: 1px solid rgba(120, 58, 30, .70);
        background: linear-gradient(180deg, rgba(25,17,12,.97), rgba(5,4,3,.99));
        color: #e7be87;
        font-family: Arial, sans-serif;
        font-size: 10px;
        font-weight: 700;
        line-height: 1;
        white-space: nowrap;
      }
      .cell:first-child { border-left: 1px solid rgba(120, 58, 30, .70); }
      .cell.cardinal {
        color: #9dc8ff;
        box-shadow: 0 -2px 0 rgba(43, 111, 206, .75) inset;
      }
      .cell.active {
        z-index: 3;
        border: 1px solid #ffb364;
        background: linear-gradient(180deg, #6d2d0d, #241007 48%, #9c4515);
        color: #fff4df;
        font-size: 12px;
        font-weight: 900;
        transform: translateY(-1px) scale(1.12);
        box-shadow:
          0 0 0 1px #fff0c4 inset,
          0 0 9px #ff7b2d,
          0 0 20px rgba(255, 103, 30, .60);
      }
      .cell.active::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: -8px;
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 7px solid #ff9b4e;
        transform: translateX(-50%);
        filter: drop-shadow(0 0 3px #ff7d2d);
      }

      .footer {
        margin-top: 6px;
        text-align: center;
        color: #b77b49;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 11px;
        letter-spacing: 2.6px;
      }

      @media (max-width: 1020px) {
        .top {
          grid-template-columns: 56px minmax(155px, 1fr) minmax(190px, 1.25fr) repeat(5, minmax(64px, .55fr));
        }
        .clock-face { width: 50px; height: 50px; }
        .label { font-size: 9px; }
        .value { font-size: 14px; }
        .time-value { font-size: 28px; }
        .tracker { min-width: 660px; }
      }
    </style>

    <section class="tracker" aria-label="TASI Time Tracker">
      <div class="top">
        <div class="clock-face" aria-hidden="true">
          <span class="hand hand-hour"></span>
          <span class="hand hand-minute"></span>
          <span class="hand hand-second"></span>
          <span class="clock-pin"></span>
        </div>

        <div class="identity">
          <div><span class="label">اليوم</span><span class="value" data-day></span></div>
          <div><span class="label">التاريخ</span><span class="value" data-date></span></div>
        </div>

        <div class="metric current-time">
          <span class="value time-value" data-time></span>
          <span class="time-subtitle">الوقت الحالي بنظام 24 ساعة</span>
        </div>

        <div class="metric hour"><span class="label">الساعة</span><span class="value" data-hour></span></div>
        <div class="metric minute"><span class="label">الدقيقة</span><span class="value" data-minute></span></div>
        <div class="metric second"><span class="label">الثانية</span><span class="value" data-second></span></div>
        <div class="metric angle"><span class="label">الزاوية</span><span class="value" data-angle></span></div>
        <div class="metric direction"><span class="label">الاتجاه</span><span class="value">▲ صاعد</span></div>
        <div class="metric cycle"><span class="label">الدورة</span><span class="value cycle-value"><span data-cycle></span><span class="cycle-ring"></span></span></div>
      </div>

      <div class="section-title">الدقائق — كل خانة تمثل دقيقة واحدة</div>
      <div class="row-shell" data-minute-shell><div class="cells" data-minute-cells></div></div>

      <div class="section-title">الزوايا — كل دقيقة = 6 درجات</div>
      <div class="row-shell" data-angle-shell><div class="cells" data-angle-cells></div></div>

      <div class="footer">TASI TIME TRACKER · شريط الزمن والدقائق والزوايا</div>
    </section>
  `;
}

let host = null;
let shadow = null;
let timer = 0;
let placementFrame = 0;
let observer = null;
let lastMinute = -1;
let applyCount = 0;
let lastApply = null;

function buildCells(container, formatter, type) {
  if (!(container instanceof HTMLElement) || container.children.length === MINUTES) return;
  const fragment = document.createDocumentFragment();
  for (let minute = 0; minute < MINUTES; minute += 1) {
    const cell = document.createElement('span');
    cell.className = 'cell';
    cell.dataset.index = String(minute);
    cell.dataset.type = type;
    cell.textContent = formatter(minute);
    if (type === 'angle' && minuteAngle(minute) % 90 === 0) cell.classList.add('cardinal');
    fragment.appendChild(cell);
  }
  container.replaceChildren(fragment);
}

function ensureTracker() {
  if (!enabled()) {
    document.getElementById(HOST_ID)?.remove();
    host = null;
    shadow = null;
    return false;
  }

  if (!(host instanceof HTMLElement)) {
    host = document.getElementById(HOST_ID);
  }

  if (!(host instanceof HTMLElement)) {
    host = document.createElement('div');
    host.id = HOST_ID;
    host.dataset.gannzillaTasiTimeTrackerV547 = 'true';
    host.setAttribute('role', 'region');
    host.setAttribute('aria-label', 'TASI Time Tracker');
    document.body.appendChild(host);
  }

  setImportant(host, 'position', 'fixed');
  setImportant(host, 'z-index', '2147482500');
  setImportant(host, 'display', 'block');
  setImportant(host, 'visibility', 'visible');
  setImportant(host, 'opacity', '1');
  setImportant(host, 'pointer-events', 'auto');
  setImportant(host, 'max-height', 'calc(100vh - 90px)');

  shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
  if (!shadow.querySelector('.tracker')) shadow.innerHTML = trackerMarkup();

  buildCells(shadow.querySelector('[data-minute-cells]'), (minute) => pad(minute), 'minute');
  buildCells(shadow.querySelector('[data-angle-cells]'), (minute) => `${minuteAngle(minute)}°`, 'angle');

  const cellMin = numberParam('timeTrackerCellMin', 18, 14, 34);
  shadow.host.style.setProperty('--tt-cell-min', `${cellMin}px`);
  return true;
}

function updatePlacement(source = 'placement') {
  if (!ensureTracker()) return false;
  cancelAnimationFrame(placementFrame);
  placementFrame = requestAnimationFrame(() => {
    const left = Math.max(8, Math.round(panelRightEdge() + 8));
    const top = Math.max(
      numberParam('timeTrackerTop', 76, 32, 280),
      Math.round(toolbarBottomEdge() + 8),
    );
    const right = numberParam('timeTrackerRight', 8, 0, 80);
    setImportant(host, 'left', `${left}px`);
    setImportant(host, 'right', `${right}px`);
    setImportant(host, 'top', `${top}px`);
    host.dataset.gannzillaTimeTrackerPlacementV547 = `${left},${top},${right}`;
    host.dataset.gannzillaTimeTrackerPlacementSourceV547 = source;
  });
  return true;
}

function activateCell(type, index) {
  if (!shadow) return null;
  const cells = Array.from(shadow.querySelectorAll(`.cell[data-type="${type}"]`));
  cells.forEach((cell, cellIndex) => cell.classList.toggle('active', cellIndex === index));
  return cells[index] || null;
}

function revealActive(activeMinuteCell, activeAngleCell) {
  if (!shadow) return;
  const minuteShell = shadow.querySelector('[data-minute-shell]');
  const angleShell = shadow.querySelector('[data-angle-shell]');
  if (!(minuteShell instanceof HTMLElement) || !(angleShell instanceof HTMLElement)) return;

  const target = activeMinuteCell instanceof HTMLElement ? activeMinuteCell : activeAngleCell;
  if (!(target instanceof HTMLElement)) return;

  const desired = Math.max(0, target.offsetLeft - minuteShell.clientWidth / 2 + target.offsetWidth / 2);
  minuteShell.scrollLeft = desired;
  angleShell.scrollLeft = desired;
}

function updateClockHands(date) {
  if (!shadow) return;
  const seconds = date.getSeconds() + date.getMilliseconds() / 1000;
  const minutes = date.getMinutes() + seconds / 60;
  const hours = (date.getHours() % 12) + minutes / 60;
  const set = (selector, degrees) => {
    const hand = shadow.querySelector(selector);
    if (hand instanceof HTMLElement) hand.style.transform = `translateX(-50%) rotate(${degrees}deg)`;
  };
  set('.hand-hour', hours * 30);
  set('.hand-minute', minutes * 6);
  set('.hand-second', seconds * 6);
}

function render(source = 'render') {
  if (!ensureTracker()) return false;
  const date = new Date();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const angle = minuteAngle(minute);

  const write = (selector, value) => {
    const element = shadow.querySelector(selector);
    if (element instanceof HTMLElement) element.textContent = value;
  };

  write('[data-day]', arabicDay(date));
  write('[data-date]', formattedDate(date));
  write('[data-time]', formattedTime(date));
  write('[data-hour]', pad(hour));
  write('[data-minute]', pad(minute));
  write('[data-second]', pad(second));
  write('[data-angle]', `${angle}°`);
  write('[data-cycle]', `${minute} / 60`);

  const cycleRing = shadow.querySelector('.cycle-ring');
  if (cycleRing instanceof HTMLElement) {
    cycleRing.style.setProperty('--cycle-progress', `${minute * 6}deg`);
  }

  updateClockHands(date);

  if (minute !== lastMinute) {
    const activeMinuteCell = activateCell('minute', minute);
    const activeAngleCell = activateCell('angle', minute);
    requestAnimationFrame(() => revealActive(activeMinuteCell, activeAngleCell));
    lastMinute = minute;
  }

  host.dataset.gannzillaTimeTrackerCurrentHourV547 = pad(hour);
  host.dataset.gannzillaTimeTrackerCurrentMinuteV547 = pad(minute);
  host.dataset.gannzillaTimeTrackerCurrentSecondV547 = pad(second);
  host.dataset.gannzillaTimeTrackerCurrentAngleV547 = String(angle);
  host.dataset.gannzillaTimeTrackerCanvasChangedV547 = 'false';

  applyCount += 1;
  lastApply = {
    source,
    build: BUILD,
    hour,
    minute,
    second,
    angle,
    canvasChanged: false,
    at: Date.now(),
  };
  return true;
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || window[STATE_KEY]) return;

  if (!enabled()) return;

  ensureTracker();
  updatePlacement('install');
  render('install');

  timer = window.setInterval(() => render('clock-tick'), 250);
  window.addEventListener('resize', () => updatePlacement('resize'), false);
  window.addEventListener('scroll', () => updatePlacement('scroll'), { passive: true });

  observer = new MutationObserver(() => updatePlacement('dom-mutation'));
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'hidden'] });

  [100, 350, 900, 1800, 3600, 7200].forEach((delay) => {
    window.setTimeout(() => {
      updatePlacement(`boot-${delay}`);
      render(`boot-${delay}`);
    }, delay);
  });

  window.GANNZILLA_TASI_TIME_TRACKER_V547 = true;
  window.__auditGannzillaTasiTimeTrackerV547 = () => {
    const trackerHost = document.getElementById(HOST_ID);
    const trackerShadow = trackerHost?.shadowRoot;
    const minuteCells = trackerShadow?.querySelectorAll('.cell[data-type="minute"]').length || 0;
    const angleCells = trackerShadow?.querySelectorAll('.cell[data-type="angle"]').length || 0;
    const activeMinuteCells = trackerShadow?.querySelectorAll('.cell[data-type="minute"].active').length || 0;
    const activeAngleCells = trackerShadow?.querySelectorAll('.cell[data-type="angle"].active').length || 0;
    return {
      ok: trackerHost instanceof HTMLElement
        && minuteCells === 60
        && angleCells === 60
        && activeMinuteCells === 1
        && activeAngleCells === 1
        && trackerHost.dataset.gannzillaTimeTrackerCanvasChangedV547 === 'false',
      build: BUILD,
      enabled: enabled(),
      minuteCells,
      angleCells,
      activeMinuteCells,
      activeAngleCells,
      currentHour: trackerHost?.dataset?.gannzillaTimeTrackerCurrentHourV547 || null,
      currentMinute: trackerHost?.dataset?.gannzillaTimeTrackerCurrentMinuteV547 || null,
      currentSecond: trackerHost?.dataset?.gannzillaTimeTrackerCurrentSecondV547 || null,
      currentAngle: trackerHost?.dataset?.gannzillaTimeTrackerCurrentAngleV547 || null,
      canvasChanged: trackerHost?.dataset?.gannzillaTimeTrackerCanvasChangedV547 === 'true',
      placement: trackerHost?.dataset?.gannzillaTimeTrackerPlacementV547 || null,
      applyCount,
      lastApply,
    };
  };

  window[STATE_KEY] = {
    render,
    updatePlacement,
    ensureTracker,
    get timer() { return timer; },
    get observer() { return observer; },
  };
}

install();
