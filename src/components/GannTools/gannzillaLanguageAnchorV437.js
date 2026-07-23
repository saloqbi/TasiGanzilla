const BUILD = 437;
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const INFO_BUTTON_ID = 'gannzilla-about-info-button-v432';
const CONTROL_ID = 'gannzilla-language-anchor-v437';
const BUTTON_ID = 'gannzilla-language-anchor-button-v437';
const MENU_ID = 'gannzilla-language-anchor-menu-v437';
const STYLE_ID = 'gannzilla-language-anchor-style-v437';
const STATE_KEY = '__gannzillaLanguageAnchorV437';
const LANGUAGE_KEY = 'tasi-gannzilla-ui-language-v434';
const OBSOLETE_IDS = [
  'gannzilla-language-selector-wrap-v434',
  'gannzilla-language-control-v435',
  'gannzilla-language-control-v436',
];

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
  const queryLanguage = params().get('lang');
  if (queryLanguage === 'ar' || queryLanguage === 'en') return queryLanguage;
  try {
    return localStorage.getItem(LANGUAGE_KEY) === 'ar' ? 'ar' : 'en';
  } catch (_) {
    return 'en';
  }
}

function requestedWidth() {
  return Math.round(numberParam('languageControlWidth', 124, 92, 180));
}

function flagSvg(language) {
  if (language === 'ar') {
    return '<svg viewBox="0 0 60 36" aria-hidden="true" focusable="false"><rect width="60" height="36" fill="#006c35"/><path d="M13 22.5h34" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="M16 25.5h27l4-2" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M17 13h26M19 16h22M23 19h15" stroke="#fff" stroke-width="1.35" stroke-linecap="round"/></svg>';
  }
  return '<svg viewBox="0 0 60 36" aria-hidden="true" focusable="false"><rect width="60" height="36" fill="#012169"/><path d="M0 0 60 36M60 0 0 36" stroke="#fff" stroke-width="8"/><path d="M0 0 60 36M60 0 0 36" stroke="#c8102e" stroke-width="4"/><path d="M30 0v36M0 18h60" stroke="#fff" stroke-width="12"/><path d="M30 0v36M0 18h60" stroke="#c8102e" stroke-width="7"/></svg>';
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #gannzilla-language-selector-wrap-v434,
    #gannzilla-language-control-v435,
    #gannzilla-language-control-v436 {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      width: 0 !important;
      min-width: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
    }

    #${CONTROL_ID} {
      position: fixed !important;
      width: 124px;
      min-width: 92px;
      height: 28px !important;
      z-index: 2147483645 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      overflow: visible !important;
      direction: ltr !important;
      font-family: Arial, "Segoe UI", Tahoma, sans-serif !important;
      box-sizing: border-box !important;
    }

    #${CONTROL_ID}, #${CONTROL_ID} * {
      box-sizing: border-box !important;
    }

    #${BUTTON_ID} {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      height: 28px !important;
      min-height: 28px !important;
      max-height: 28px !important;
      margin: 0 !important;
      padding: 0 7px !important;
      border: 1px solid #929aa3 !important;
      border-radius: 0 !important;
      background: linear-gradient(#fbfbfb, #dedede) !important;
      color: #202020 !important;
      display: grid !important;
      grid-template-columns: 23px minmax(0, 1fr) 13px !important;
      align-items: center !important;
      gap: 5px !important;
      text-align: left !important;
      font: 600 14px/26px Arial, "Segoe UI", Tahoma, sans-serif !important;
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

    #${BUTTON_ID} .gz437-flag,
    #${MENU_ID} .gz437-flag {
      width: 22px !important;
      height: 14px !important;
      display: inline-flex !important;
      overflow: hidden !important;
      border: 1px solid rgba(0, 0, 0, .2) !important;
      background: #fff !important;
    }

    #${BUTTON_ID} .gz437-flag svg,
    #${MENU_ID} .gz437-flag svg {
      width: 100% !important;
      height: 100% !important;
      display: block !important;
    }

    #${BUTTON_ID} .gz437-label {
      min-width: 0 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    #${BUTTON_ID} .gz437-caret {
      color: #333 !important;
      font-size: 10px !important;
      line-height: 1 !important;
      text-align: right !important;
    }

    #${MENU_ID} {
      position: absolute !important;
      top: calc(100% + 2px) !important;
      left: 0 !important;
      width: 100% !important;
      min-width: 100% !important;
      display: none !important;
      padding: 2px !important;
      border: 1px solid #7f8790 !important;
      background: #f8f8f8 !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, .26) !important;
      z-index: 2147483646 !important;
      direction: ltr !important;
    }

    #${CONTROL_ID}[data-open="true"] #${MENU_ID} {
      display: block !important;
    }

    #${MENU_ID} button {
      width: 100% !important;
      height: 31px !important;
      min-height: 31px !important;
      margin: 0 !important;
      padding: 0 7px !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      color: #202020 !important;
      display: grid !important;
      grid-template-columns: 23px minmax(0, 1fr) !important;
      align-items: center !important;
      gap: 7px !important;
      text-align: left !important;
      font: 600 14px/29px Arial, "Segoe UI", Tahoma, sans-serif !important;
      cursor: pointer !important;
    }

    #${MENU_ID} button:hover,
    #${MENU_ID} button[aria-current="true"] {
      background: #dcecff !important;
    }
  `;
}

function setButtonLanguage(button, language) {
  if (!(button instanceof HTMLButtonElement)) return;
  const flag = button.querySelector('.gz437-flag');
  const label = button.querySelector('.gz437-label');
  if (flag instanceof HTMLElement) flag.innerHTML = flagSvg(language);
  if (label instanceof HTMLElement) label.textContent = language === 'ar' ? 'العربية' : 'English';
  button.dataset.language = language;
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
  url.searchParams.set('showAnchoredLanguageControl', 'true');
  url.searchParams.set('v', String(BUILD));
  window.location.assign(`${url.pathname}${url.search}${url.hash}`);
}

function option(language, label) {
  const item = document.createElement('button');
  item.type = 'button';
  item.dataset.language = language;
  const flag = document.createElement('span');
  flag.className = 'gz437-flag';
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
  flag.className = 'gz437-flag';
  const label = document.createElement('span');
  label.className = 'gz437-label';
  const caret = document.createElement('span');
  caret.className = 'gz437-caret';
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
  menu.append(option('en', 'English'), option('ar', 'العربية'));
  control.append(button, menu);
  document.body.appendChild(control);
  return control;
}

function closeMenu() {
  const control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) return;
  control.dataset.open = 'false';
  document.getElementById(BUTTON_ID)?.setAttribute('aria-expanded', 'false');
}

function hideObsoleteControls() {
  OBSOLETE_IDS.forEach((id) => {
    const node = document.getElementById(id);
    if (!(node instanceof HTMLElement)) return;
    node.hidden = true;
    node.setAttribute('aria-hidden', 'true');
    node.style.setProperty('display', 'none', 'important');
  });
}

function positionControl(control, panel, infoButton) {
  const panelRect = panel.getBoundingClientRect();
  const infoRect = infoButton instanceof HTMLElement ? infoButton.getBoundingClientRect() : null;
  const preferred = requestedWidth();
  const infoLeft = infoRect?.left && infoRect.width > 0 ? infoRect.left : panelRect.right - 34;
  const available = Math.max(92, infoLeft - panelRect.left - 10);
  const width = Math.max(92, Math.min(preferred, available));
  const left = Math.max(panelRect.left + 4, infoLeft - width - 4);
  const top = infoRect?.height > 0
    ? infoRect.top + Math.max(0, (infoRect.height - 28) / 2)
    : panelRect.top + 2;

  control.style.setProperty('left', `${Math.round(left)}px`, 'important');
  control.style.setProperty('top', `${Math.round(top)}px`, 'important');
  control.style.setProperty('width', `${Math.round(width)}px`, 'important');
  control.style.setProperty('min-width', `${Math.round(width)}px`, 'important');
  control.style.setProperty('max-width', `${Math.round(width)}px`, 'important');
}

function mountControl() {
  const panel = document.getElementById(PANEL_ID);
  if (!(panel instanceof HTMLElement)) return false;

  hideObsoleteControls();
  let control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) control = createControl();

  const language = currentLanguage();
  setButtonLanguage(document.getElementById(BUTTON_ID), language);
  control.querySelectorAll(`#${MENU_ID} button`).forEach((item) => {
    if (item instanceof HTMLButtonElement) item.setAttribute('aria-current', item.dataset.language === language ? 'true' : 'false');
  });

  const infoButton = document.getElementById(INFO_BUTTON_ID);
  positionControl(control, panel, infoButton);
  control.hidden = false;
  control.removeAttribute('aria-hidden');
  control.style.setProperty('display', 'block', 'important');
  control.style.setProperty('visibility', 'visible', 'important');
  control.style.setProperty('opacity', '1', 'important');
  panel.dataset.gannzillaLanguageAnchorV437 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showAnchoredLanguageControl', true) || window[STATE_KEY]) return;

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
  window.addEventListener('resize', schedule);
  window.addEventListener('scroll', schedule, true);

  const onDocumentClick = (event) => {
    const control = document.getElementById(CONTROL_ID);
    if (control instanceof HTMLElement && !control.contains(event.target)) closeMenu();
  };
  const onKeyDown = (event) => { if (event.key === 'Escape') closeMenu(); };
  document.addEventListener('click', onDocumentClick, true);
  document.addEventListener('keydown', onKeyDown);

  window.GANNZILLA_LANGUAGE_ANCHOR_V437 = true;
  window.__auditGannzillaLanguageAnchorV437 = () => {
    const panel = document.getElementById(PANEL_ID);
    const button = document.getElementById(BUTTON_ID);
    const info = document.getElementById(INFO_BUTTON_ID);
    const rect = button?.getBoundingClientRect();
    const infoRect = info?.getBoundingClientRect();
    return {
      ok: Boolean(button && rect?.width > 0 && rect?.height > 0),
      build: BUILD,
      enabled: boolParam('showAnchoredLanguageControl', true),
      currentLanguage: currentLanguage(),
      visibleLanguageButton: Boolean(button && window.getComputedStyle(button).visibility !== 'hidden'),
      realFlagSvgVisible: Boolean(button?.querySelector('svg')),
      options: ['English', 'العربية'],
      viewportAnchored: window.getComputedStyle(document.getElementById(CONTROL_ID)).position === 'fixed',
      immediatelyLeftOfInformationIcon: Boolean(rect && infoRect && rect.right <= infoRect.left + 5),
      panelLocalizedByV434: Boolean(panel?.dataset?.gannzillaUiLanguageV434),
    };
  };

  window[STATE_KEY] = { onDocumentClick, onKeyDown };
}

install();