const BUILD = 605;
const STATE_KEY = '__gannzillaCenterClockBeigeThemeV605';
const STYLE_ID = 'gannzilla-center-clock-beige-theme-style-v605';
const CLOCK_ID = 'gannzilla-center-digital-clock-v599';
const DISPLAY_ID = 'gannzilla-center-clock-date-angle-time-v604';
const CONTENT_ID = 'gannzilla-center-clock-upper-content-v604';
const DATE_ID = 'gannzilla-center-clock-date-line-v604';
const ANGLE_ID = 'gannzilla-center-clock-angle-line-v604';
const TIME_ID = 'gannzilla-center-clock-time-line-v604';
const DIVIDER_ID = 'gannzilla-center-clock-divider-v604';

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
  const toggleEnabled = !['false', '0', 'off', 'no'].includes(
    String(query.get('centerLogoClockToggle') || 'true').toLowerCase(),
  );
  return wheelMode && logoEnabled && toggleEnabled;
}

function install() {
  if (typeof window === 'undefined'
      || typeof document === 'undefined'
      || !enabled()
      || window[STATE_KEY]) return;

  let style = document.getElementById(STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${CLOCK_ID},
    #${DISPLAY_ID} {
      background: #DDBD8A !important;
    }

    #${CONTENT_ID},
    #${DATE_ID},
    #${ANGLE_ID},
    #${TIME_ID} {
      color: #342116 !important;
      text-shadow: none !important;
    }

    #${DIVIDER_ID} {
      background: rgba(52, 33, 22, 0.78) !important;
      box-shadow: 0 0 2px rgba(52, 33, 22, 0.22) !important;
    }
  `;

  window.GANNZILLA_CENTER_CLOCK_BEIGE_THEME_V605 = true;
  window.__auditGannzillaCenterClockBeigeThemeV605 = () => {
    const clock = document.getElementById(CLOCK_ID);
    const display = document.getElementById(DISPLAY_ID);
    const date = document.getElementById(DATE_ID);
    const angle = document.getElementById(ANGLE_ID);
    const time = document.getElementById(TIME_ID);
    return {
      ok: style instanceof HTMLStyleElement,
      build: BUILD,
      background: '#DDBD8A',
      textColor: '#342116',
      clockReady: clock instanceof HTMLDivElement,
      displayReady: display instanceof HTMLDivElement,
      textReady: date instanceof HTMLDivElement
        && angle instanceof HTMLDivElement
        && time instanceof HTMLDivElement,
      layoutChanged: false,
      geometryChanged: false,
      logicChanged: false,
    };
  };

  window[STATE_KEY] = { style };
}

install();
