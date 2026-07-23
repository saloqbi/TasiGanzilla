const BUILD = 436;
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const INFO_BUTTON_ID = 'gannzilla-about-info-button-v432';
const LEGACY_WRAP_ID = 'gannzilla-language-selector-wrap-v434';
const CONTROL_ID = 'gannzilla-language-control-v436';
const BUTTON_ID = 'gannzilla-language-button-v436';
const MENU_ID = 'gannzilla-language-menu-v436';
const STYLE_ID = 'gannzilla-language-control-style-v436';
const STATE_KEY = '__gannzillaLanguageControlV436';
const LANGUAGE_KEY = 'tasi-gannzilla-ui-language-v434';

function params() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  const value = String(query.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function currentLanguage() {
  const queryLanguage = params().get('lang');
  if (queryLanguage === 'ar' || queryLanguage === 'en') return queryLanguage;
  try {
    return localStorage.getItem(LANGUAGE_KEY) === 'ar' ? 'ar' : 'en';
  } catch (_) {
    return 'en';
  }
}

function flagSvg(language) {
  if (language === 'ar') {
    return '<svg viewBox="0 0 60 36" aria-hidden="true"><rect width="60" height="36" fill="#006c35"/><path d="M13 22.5h34" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="M16 25.5h27l4-2" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M17 13h26M19 16h22M23 19h15" stroke="#fff" stroke-width="1.35" stroke-linecap="round"/></svg>';
  }
  return '<svg viewBox="0 0 60 36" aria-hidden="true"><rect width="60" height="36" fill="#012169"/><path d="M0 0 60 36M60 0 0 36" stroke="#fff" stroke-width="8"/><path d="M0 0 60 36M60 0 0 36" stroke="#c8102e" stroke-width="4"/><path d="M30 0v36M0 18h60" stroke="#fff" stroke-width="12"/><path d="M30 0v36M0 18h60" stroke="#c8102e" stroke-width="7"/></svg>';
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar {
      display: flex !important;
      grid-template-columns: none !important;
      position: relative !important;
      align-items: center !important;
      gap: 4px !important;
      overflow: visible !important;
      direction: ltr !important;
      padding-left: 6px !important;
      padding-right: 6px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar > span:nth-of-type(2) {
      flex: 1 1 auto !important;
      min-width: 42px !important;
      text-align: left !important;
    }

    html body #${LEGACY_WRAP_ID} {
      display: none !important;
      visibility: hidden !important;
      position: absolute !important;
      width: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
      pointer-events: none !important;
    }

    #${CONTROL_ID} {
      order: 900 !important;
      position: relative !important;
      flex: 0 0 132px !important;
      width: 132px !important;
      min-width: 132px !important;
      height: 30px !important;
      margin-left: auto !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      overflow: visible !important;
      direction: ltr !important;
      z-index: 2147483600 !important;
    }

    #${BUTTON_ID} {
      width: 132px !important;
      min-width: 132px !important;
      max-width: 132px !important;
      height: 30px !important;
      min-height: 30px !important;
      max-height: 30px !important;
      margin: 0 !important;
      padding: 0 8px !important;
      border: 1px solid #929aa3 !important;
      border-radius: 0 !important;
      background: linear-gradient(#fbfbfb, #dedede) !important;
      color: #202020 !important;
      display: grid !important;
      grid-template-columns: 24px minmax(0,1fr) 15px !important;
      align-items: center !important;
      gap: 5px !important;
      text-align: left !important;
      font: 600 15px/28px Arial, "Segoe UI", Tahoma, sans-serif !important;
      cursor: pointer !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      overflow: hidden !important;
    }

    #${BUTTON_ID}:hover,
    #${CONTROL_ID}[data-open="true"] #${BUTTON_ID} {
      border-color: #477da8 !important;
      background: linear-gradient(#fff, #dcecff) !important;
    }

    #${BUTTON_ID} .gz436-flag,
    #${MENU_ID} .gz436-flag {
      width: 22px !important;
      height: 14px !important;
      display: inline-flex !important;
      overflow: hidden !important;
      border: 1px solid rgba(0,0,0,.2) !important;
    }

    #${BUTTON_ID} .gz436-flag svg,
    #${MENU_ID} .gz436-flag svg {
      width: 100% !important;
      height: 100% !important;
      display: block !important;
    }

    #${BUTTON_ID} .gz436-label {
      min-width: 0 !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }

    #${BUTTON_ID} .gz436-caret {
      color: #333 !important;
      font-size: 11px !important;
      text-align: right !important;
    }

    #${MENU_ID} {
      position: absolute !important;
      top: calc(100% + 2px) !important;
      left: 0 !important;
      width: 132px !important;
      min-width: 132px !important;
      display: none !important;
      padding: 2px !important;
      border: 1px solid #7f8790 !important;
      background: #f8f8f8 !important;
      box-shadow: 0 4px 12px rgba(0,0,0,.26) !important;
      z-index: 2147483646 !important;
      direction: ltr !important;
    }

    #${CONTROL_ID}[data-open="true"] #${MENU_ID} {
      display: block !important;
    }

    #${MENU_ID} button {
      width: 100% !important;
      height: 32px !important;
      min-height: 32px !important;
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
    #${MENU_ID} button[aria-current="true"] {
      background: #dcecff !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar #${INFO_BUTTON_ID} {
      order: 901 !important;
      flex: 0 0 28px !important;
      margin: 0 0 0 2px !important;
      display: inline-flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    @media (max-width: 520px) {
      #${CONTROL_ID}, #${BUTTON_ID}, #${MENU_ID} {
        width: 112px !important;
        min-width: 112px !important;
        max-width: 112px !important;
      }
      #${CONTROL_ID} { flex-basis: 112px !important; }
      #${BUTTON_ID} { font-size: 13px !important; }
    }
  `;
}

function setButtonLanguage(button, language) {
  if (!(button instanceof HTMLButtonElement) || button.dataset.language === language) return;
  button.dataset.language = language;

  const flag = button.querySelector('.gz436-flag');
  const label = button.querySelector('.gz436-label');
  if (flag instanceof HTMLElement) flag.innerHTML = flagSvg(language);
  if (label instanceof HTMLElement) label.textContent = language === 'ar' ? 'العربية' : 'English';
  button.setAttribute('aria-label', language === 'ar' ? 'اختيار اللغة' : 'Choose language');
}

function changeLanguage(language) {
  const next = language === 'ar' ? 'ar' : 'en';
  try {
    localStorage.setItem(LANGUAGE_KEY, next);
  } catch (_) {
    // URL remains authoritative.
  }

  const url = new URL(window.location.href);
  url.searchParams.set('lang', next);
  url.searchParams.set('bilingualPanel', 'true');
  url.searchParams.set('showLanguageControl', 'true');
  url.searchParams.set('v', String(BUILD));
  window.location.assign(`${url.pathname}${url.search}${url.hash}`);
}

function createOption(language, label) {
  const option = document.createElement('button');
  option.type = 'button';
  option.dataset.language = language;

  const flag = document.createElement('span');
  flag.className = 'gz436-flag';
  flag.innerHTML = flagSvg(language);

  const text = document.createElement('span');
  text.textContent = label;

  option.append(flag, text);
  option.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    changeLanguage(language);
  });
  return option;
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

  const flag = document.createElement('span');
  flag.className = 'gz436-flag';
  const label = document.createElement('span');
  label.className = 'gz436-label';
  const caret = document.createElement('span');
  caret.className = 'gz436-caret';
  caret.textContent = '▼';
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
  menu.append(createOption('en', 'English'), createOption('ar', 'العربية'));
  control.append(button, menu);
  return control;
}

function closeMenu() {
  const control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) return;
  control.dataset.open = 'false';
  document.getElementById(BUTTON_ID)?.setAttribute('aria-expanded', 'false');
}

function mountControl() {
  const panel = document.getElementById(PANEL_ID);
  const bar = panel?.querySelector('.gz421-preset-bar');
  if (!(panel instanceof HTMLElement) || !(bar instanceof HTMLElement)) return false;

  const legacy = document.getElementById(LEGACY_WRAP_ID);
  if (legacy instanceof HTMLElement && !legacy.hidden) {
    legacy.hidden = true;
    legacy.setAttribute('aria-hidden', 'true');
  }

  let control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) control = createControl();

  const infoButton = document.getElementById(INFO_BUTTON_ID);
  if (infoButton instanceof HTMLElement && infoButton.parentElement === bar) {
    if (control.parentElement !== bar || control.nextElementSibling !== infoButton) bar.insertBefore(control, infoButton);
  } else if (control.parentElement !== bar) {
    bar.appendChild(control);
  }

  const language = currentLanguage();
  setButtonLanguage(document.getElementById(BUTTON_ID), language);
  control.querySelectorAll(`#${MENU_ID} button`).forEach((option) => {
    if (option instanceof HTMLButtonElement) option.setAttribute('aria-current', option.dataset.language === language ? 'true' : 'false');
  });

  control.hidden = false;
  control.removeAttribute('aria-hidden');
  panel.dataset.gannzillaLanguageControlV436 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showLanguageControl', true) || window[STATE_KEY]) return;

  installStyle();
  let frame = 0;
  let panelObserver = null;
  let bootstrapObserver = null;

  const schedule = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      installStyle();
      if (!mountControl()) return;

      const panel = document.getElementById(PANEL_ID);
      if (!panelObserver && panel instanceof HTMLElement) {
        panelObserver = new MutationObserver(schedule);
        panelObserver.observe(panel, { childList: true, subtree: true });
      }
      bootstrapObserver?.disconnect();
      bootstrapObserver = null;
    });
  };

  schedule();
  [20, 60, 140, 320, 700, 1400, 2800, 5000].forEach((delay) => window.setTimeout(schedule, delay));
  bootstrapObserver = new MutationObserver(schedule);
  bootstrapObserver.observe(document.documentElement, { childList: true, subtree: true });

  const onDocumentClick = (event) => {
    const control = document.getElementById(CONTROL_ID);
    if (control instanceof HTMLElement && !control.contains(event.target)) closeMenu();
  };
  const onKeyDown = (event) => { if (event.key === 'Escape') closeMenu(); };
  document.addEventListener('click', onDocumentClick, true);
  document.addEventListener('keydown', onKeyDown);

  window.GANNZILLA_LANGUAGE_CONTROL_V436 = true;
  window.__auditGannzillaLanguageControlV436 = () => {
    const button = document.getElementById(BUTTON_ID);
    const info = document.getElementById(INFO_BUTTON_ID);
    const rect = button?.getBoundingClientRect();
    const infoRect = info?.getBoundingClientRect();
    return {
      ok: Boolean(button && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showLanguageControl', true),
      currentLanguage: currentLanguage(),
      visibleLanguageButton: Boolean(button && window.getComputedStyle(button).visibility !== 'hidden'),
      realFlagSvgVisible: Boolean(button?.querySelector('svg')),
      options: ['English', 'العربية'],
      immediatelyLeftOfInformationIcon: Boolean(rect && infoRect && rect.right <= infoRect.left + 4),
      legacySelectorHidden: document.getElementById(LEGACY_WRAP_ID)?.hidden === true,
      stableScopedObserver: true,
    };
  };

  window[STATE_KEY] = { onDocumentClick, onKeyDown };
}

install();
