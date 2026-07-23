const BUILD = 435;
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const INFO_BUTTON_ID = 'gannzilla-about-info-button-v432';
const LEGACY_WRAP_ID = 'gannzilla-language-selector-wrap-v434';
const CONTROL_ID = 'gannzilla-language-control-v435';
const BUTTON_ID = 'gannzilla-language-button-v435';
const MENU_ID = 'gannzilla-language-menu-v435';
const STYLE_ID = 'gannzilla-language-control-style-v435';
const STATE_KEY = '__gannzillaLanguageControlV435';
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
  const value = params().get('lang');
  if (value === 'ar' || value === 'en') return value;
  try {
    return localStorage.getItem(LANGUAGE_KEY) === 'ar' ? 'ar' : 'en';
  } catch (_) {
    return 'en';
  }
}

function flagMarkup(language) {
  if (language === 'ar') {
    return `
      <svg viewBox="0 0 60 36" aria-hidden="true" focusable="false">
        <rect width="60" height="36" rx="1" fill="#006c35"/>
        <path d="M13 22.5h34" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M16 25.5h27l4-2" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round"/>
        <path d="M17 13h26M19 16h22M23 19h15" stroke="#fff" stroke-width="1.35" stroke-linecap="round"/>
      </svg>`;
  }

  return `
    <svg viewBox="0 0 60 36" aria-hidden="true" focusable="false">
      <rect width="60" height="36" rx="1" fill="#012169"/>
      <path d="M0 0 60 36M60 0 0 36" stroke="#fff" stroke-width="8"/>
      <path d="M0 0 60 36M60 0 0 36" stroke="#c8102e" stroke-width="4"/>
      <path d="M30 0v36M0 18h60" stroke="#fff" stroke-width="12"/>
      <path d="M30 0v36M0 18h60" stroke="#c8102e" stroke-width="7"/>
    </svg>`;
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
      min-width: 46px !important;
      text-align: left !important;
    }

    html body #${LEGACY_WRAP_ID} {
      display: none !important;
      visibility: hidden !important;
      width: 0 !important;
      min-width: 0 !important;
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
      grid-template-columns: 24px minmax(0, 1fr) 15px !important;
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
      background: linear-gradient(#ffffff, #dcecff) !important;
    }

    #${BUTTON_ID} .gz435-flag,
    #${MENU_ID} .gz435-flag {
      width: 22px !important;
      height: 14px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      overflow: hidden !important;
      border: 1px solid rgba(0,0,0,.2) !important;
      box-shadow: 0 0 0 1px rgba(255,255,255,.5) inset !important;
    }

    #${BUTTON_ID} .gz435-flag svg,
    #${MENU_ID} .gz435-flag svg {
      width: 100% !important;
      height: 100% !important;
      display: block !important;
    }

    #${BUTTON_ID} .gz435-label {
      min-width: 0 !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }

    #${BUTTON_ID} .gz435-caret {
      color: #333 !important;
      font-size: 11px !important;
      text-align: right !important;
      line-height: 1 !important;
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
      grid-template-columns: 24px minmax(0, 1fr) !important;
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
      #${BUTTON_ID} { grid-template-columns: 22px minmax(0,1fr) 12px !important; font-size: 13px !important; }
    }
  `;
}

function setButtonContent(button, language) {
  button.replaceChildren();

  const flag = document.createElement('span');
  flag.className = 'gz435-flag';
  flag.innerHTML = flagMarkup(language);

  const label = document.createElement('span');
  label.className = 'gz435-label';
  label.textContent = language === 'ar' ? 'العربية' : 'English';

  const caret = document.createElement('span');
  caret.className = 'gz435-caret';
  caret.textContent = '▼';

  button.append(flag, label, caret);
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

function createMenuOption(language, label) {
  const option = document.createElement('button');
  option.type = 'button';
  option.dataset.language = language;

  const flag = document.createElement('span');
  flag.className = 'gz435-flag';
  flag.innerHTML = flagMarkup(language);

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

function closeMenu() {
  const control = document.getElementById(CONTROL_ID);
  if (control instanceof HTMLElement) {
    control.dataset.open = 'false';
    document.getElementById(BUTTON_ID)?.setAttribute('aria-expanded', 'false');
  }
}

function mountControl() {
  const panel = document.getElementById(PANEL_ID);
  const bar = panel?.querySelector('.gz421-preset-bar');
  if (!(panel instanceof HTMLElement) || !(bar instanceof HTMLElement)) return false;

  const legacy = document.getElementById(LEGACY_WRAP_ID);
  if (legacy instanceof HTMLElement) {
    legacy.hidden = true;
    legacy.setAttribute('aria-hidden', 'true');
  }

  let control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) {
    control = document.createElement('div');
    control.id = CONTROL_ID;
    control.dataset.open = 'false';

    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-controls', MENU_ID);
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const nextOpen = control.dataset.open !== 'true';
      control.dataset.open = nextOpen ? 'true' : 'false';
      button.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
    });

    const menu = document.createElement('div');
    menu.id = MENU_ID;
    menu.setAttribute('role', 'menu');
    menu.append(
      createMenuOption('en', 'English'),
      createMenuOption('ar', 'العربية'),
    );

    control.append(button, menu);
  }

  const language = currentLanguage();
  const button = document.getElementById(BUTTON_ID);
  if (button instanceof HTMLButtonElement) setButtonContent(button, language);

  control.querySelectorAll(`#${MENU_ID} button`).forEach((option) => {
    if (option instanceof HTMLButtonElement) {
      option.setAttribute('aria-current', option.dataset.language === language ? 'true' : 'false');
    }
  });

  const infoButton = document.getElementById(INFO_BUTTON_ID);
  if (infoButton instanceof HTMLElement && infoButton.parentElement === bar) {
    if (control.parentElement !== bar || control.nextElementSibling !== infoButton) {
      bar.insertBefore(control, infoButton);
    }
  } else if (control.parentElement !== bar) {
    bar.appendChild(control);
  }

  control.hidden = false;
  control.removeAttribute('aria-hidden');
  panel.dataset.gannzillaLanguageControlV435 = 'true';
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
      const mounted = mountControl();
      if (!mounted) return;

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

  window.GANNZILLA_LANGUAGE_CONTROL_V435 = true;
  window.__auditGannzillaLanguageControlV435 = () => {
    const control = document.getElementById(CONTROL_ID);
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
      legacyNativeSelectorHidden: document.getElementById(LEGACY_WRAP_ID)?.hidden === true,
      lightweightScopedObserver: true,
    };
  };

  window[STATE_KEY] = {
    get panelObserver() { return panelObserver; },
    get bootstrapObserver() { return bootstrapObserver; },
    onDocumentClick,
    onKeyDown,
  };
}

install();
