const BUILD = 438;
const CONTROL_ID = 'gannzilla-right-language-control-v438';
const BUTTON_ID = 'gannzilla-right-language-button-v438';
const MENU_ID = 'gannzilla-right-language-menu-v438';
const STYLE_ID = 'gannzilla-right-language-style-v438';
const STATE_KEY = '__gannzillaRightLanguageControlV438';
const LANGUAGE_KEY = 'tasi-gannzilla-ui-language-v434';
const OBSOLETE_IDS = [
  'gannzilla-language-selector-wrap-v434',
  'gannzilla-language-control-v435',
  'gannzilla-language-control-v436',
  'gannzilla-language-anchor-v437',
];

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  const value = String(query.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function currentLanguage() {
  const value = params().get('lang');
  if (value === 'ar' || value === 'en') return value;
  try { return localStorage.getItem(LANGUAGE_KEY) === 'ar' ? 'ar' : 'en'; }
  catch (_) { return 'en'; }
}

function flagSvg(language) {
  if (language === 'ar') {
    return '<svg viewBox="0 0 60 36" aria-hidden="true"><rect width="60" height="36" fill="#006c35"/><path d="M13 22.5h34" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="M16 25.5h27l4-2" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M17 13h26M19 16h22M23 19h15" stroke="#fff" stroke-width="1.35" stroke-linecap="round"/></svg>';
  }
  return '<svg viewBox="0 0 60 36" aria-hidden="true"><rect width="60" height="36" fill="#012169"/><path d="M0 0 60 36M60 0 0 36" stroke="#fff" stroke-width="8"/><path d="M0 0 60 36M60 0 0 36" stroke="#c8102e" stroke-width="4"/><path d="M30 0v36M0 18h60" stroke="#fff" stroke-width="12"/><path d="M30 0v36M0 18h60" stroke="#c8102e" stroke-width="7"/></svg>';
}

function settings() {
  return {
    top: Math.round(numberParam('rightLanguageTop', 8, 2, 160)),
    right: Math.round(numberParam('rightLanguageRight', 10, 2, 160)),
    width: Math.round(numberParam('rightLanguageWidth', 136, 104, 200)),
  };
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  const { top, right, width } = settings();
  style.textContent = `
    ${OBSOLETE_IDS.map((id) => `#${id}`).join(',')} {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    #${CONTROL_ID} {
      position: fixed !important;
      top: ${top}px !important;
      right: ${right}px !important;
      left: auto !important;
      width: ${width}px !important;
      min-width: ${width}px !important;
      height: 30px !important;
      z-index: 2147483646 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      overflow: visible !important;
      direction: ltr !important;
      font-family: Arial, "Segoe UI", Tahoma, sans-serif !important;
      box-sizing: border-box !important;
    }

    #${CONTROL_ID}, #${CONTROL_ID} * { box-sizing: border-box !important; }

    #${BUTTON_ID} {
      width: 100% !important;
      height: 30px !important;
      min-height: 30px !important;
      margin: 0 !important;
      padding: 0 8px !important;
      border: 1px solid #8d969f !important;
      border-radius: 0 !important;
      background: linear-gradient(#ffffff, #dedede) !important;
      color: #202020 !important;
      display: grid !important;
      grid-template-columns: 24px minmax(0,1fr) 14px !important;
      align-items: center !important;
      gap: 6px !important;
      text-align: left !important;
      font: 600 15px/28px Arial, "Segoe UI", Tahoma, sans-serif !important;
      cursor: pointer !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      box-shadow: 0 1px 3px rgba(0,0,0,.18) !important;
    }

    #${BUTTON_ID}:hover,
    #${CONTROL_ID}[data-open="true"] #${BUTTON_ID} {
      border-color: #477da8 !important;
      background: linear-gradient(#fff, #dcecff) !important;
    }

    #${BUTTON_ID} .gz438-flag,
    #${MENU_ID} .gz438-flag {
      width: 22px !important;
      height: 14px !important;
      display: inline-flex !important;
      overflow: hidden !important;
      border: 1px solid rgba(0,0,0,.2) !important;
      background: #fff !important;
    }

    #${BUTTON_ID} .gz438-flag svg,
    #${MENU_ID} .gz438-flag svg {
      width: 100% !important;
      height: 100% !important;
      display: block !important;
    }

    #${BUTTON_ID} .gz438-label {
      min-width: 0 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    #${BUTTON_ID} .gz438-caret {
      color: #333 !important;
      font-size: 10px !important;
      line-height: 1 !important;
      text-align: right !important;
    }

    #${MENU_ID} {
      position: absolute !important;
      top: calc(100% + 2px) !important;
      right: 0 !important;
      left: auto !important;
      width: 100% !important;
      display: none !important;
      padding: 2px !important;
      border: 1px solid #7f8790 !important;
      background: #f8f8f8 !important;
      box-shadow: 0 4px 12px rgba(0,0,0,.26) !important;
      z-index: 2147483647 !important;
      direction: ltr !important;
    }

    #${CONTROL_ID}[data-open="true"] #${MENU_ID} { display: block !important; }

    #${MENU_ID} button {
      width: 100% !important;
      height: 32px !important;
      margin: 0 !important;
      padding: 0 8px !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      color: #202020 !important;
      display: grid !important;
      grid-template-columns: 24px minmax(0,1fr) !important;
      align-items: center !important;
      gap: 7px !important;
      text-align: left !important;
      font: 600 14px/30px Arial, "Segoe UI", Tahoma, sans-serif !important;
      cursor: pointer !important;
    }

    #${MENU_ID} button:hover,
    #${MENU_ID} button[aria-current="true"] { background: #dcecff !important; }
  `;
}

function changeLanguage(language) {
  const next = language === 'ar' ? 'ar' : 'en';
  try { localStorage.setItem(LANGUAGE_KEY, next); } catch (_) { /* URL remains authoritative. */ }
  const url = new URL(window.location.href);
  url.searchParams.set('lang', next);
  url.searchParams.set('bilingualPanel', 'true');
  url.searchParams.set('showRightLanguageControl', 'true');
  url.searchParams.set('showAnchoredLanguageControl', 'false');
  url.searchParams.set('showLanguageControl', 'false');
  url.searchParams.set('v', String(BUILD));
  window.location.assign(`${url.pathname}${url.search}${url.hash}`);
}

function makeOption(language, label) {
  const item = document.createElement('button');
  item.type = 'button';
  item.dataset.language = language;
  const flag = document.createElement('span');
  flag.className = 'gz438-flag';
  flag.innerHTML = flagSvg(language);
  const text = document.createElement('span');
  text.textContent = label;
  item.append(flag, text);
  item.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    changeLanguage(language);
  });
  return item;
}

function setButtonLanguage(button, language) {
  const flag = button.querySelector('.gz438-flag');
  const label = button.querySelector('.gz438-label');
  if (flag instanceof HTMLElement) flag.innerHTML = flagSvg(language);
  if (label instanceof HTMLElement) label.textContent = language === 'ar' ? 'العربية' : 'English';
  button.setAttribute('aria-label', language === 'ar' ? 'اختيار اللغة' : 'Choose language');
}

function createControl() {
  const control = document.createElement('div');
  control.id = CONTROL_ID;
  control.dataset.open = 'false';

  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.setAttribute('aria-haspopup', 'menu');
  button.setAttribute('aria-controls', MENU_ID);
  button.setAttribute('aria-expanded', 'false');

  const flag = document.createElement('span'); flag.className = 'gz438-flag';
  const label = document.createElement('span'); label.className = 'gz438-label';
  const caret = document.createElement('span'); caret.className = 'gz438-caret'; caret.textContent = '▼';
  button.append(flag, label, caret);
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const open = control.dataset.open !== 'true';
    control.dataset.open = open ? 'true' : 'false';
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  const menu = document.createElement('div');
  menu.id = MENU_ID;
  menu.setAttribute('role', 'menu');
  menu.append(makeOption('en', 'English'), makeOption('ar', 'العربية'));
  control.append(button, menu);
  document.body.appendChild(control);
  return control;
}

function mount() {
  OBSOLETE_IDS.forEach((id) => document.getElementById(id)?.remove());
  let control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) control = createControl();
  const language = currentLanguage();
  setButtonLanguage(document.getElementById(BUTTON_ID), language);
  control.querySelectorAll(`#${MENU_ID} button`).forEach((item) => {
    if (item instanceof HTMLButtonElement) item.setAttribute('aria-current', item.dataset.language === language ? 'true' : 'false');
  });
  control.hidden = false;
  control.style.setProperty('display', 'block', 'important');
  return true;
}

function closeMenu() {
  const control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) return;
  control.dataset.open = 'false';
  document.getElementById(BUTTON_ID)?.setAttribute('aria-expanded', 'false');
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showRightLanguageControl', true) || window[STATE_KEY]) return;
  installStyle();
  mount();
  [40, 120, 360, 900, 2000].forEach((delay) => window.setTimeout(() => { installStyle(); mount(); }, delay));

  const onDocumentClick = (event) => {
    const control = document.getElementById(CONTROL_ID);
    if (control instanceof HTMLElement && !control.contains(event.target)) closeMenu();
  };
  const onKeyDown = (event) => { if (event.key === 'Escape') closeMenu(); };
  document.addEventListener('click', onDocumentClick, true);
  document.addEventListener('keydown', onKeyDown);

  window.GANNZILLA_RIGHT_LANGUAGE_CONTROL_V438 = true;
  window.__auditGannzillaRightLanguageControlV438 = () => {
    const button = document.getElementById(BUTTON_ID);
    const rect = button?.getBoundingClientRect();
    return {
      ok: Boolean(button && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      currentLanguage: currentLanguage(),
      fixedAtPageRight: Boolean(rect && rect.right >= window.innerWidth - settings().right - 2),
      realFlagSvgVisible: Boolean(button?.querySelector('svg')),
      options: ['English', 'العربية'],
      panelLocalizationPreserved: true,
    };
  };

  window[STATE_KEY] = { onDocumentClick, onKeyDown };
}

install();
