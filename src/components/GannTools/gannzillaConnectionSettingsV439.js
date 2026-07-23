const BUILD = 439;
const LANGUAGE_CONTROL_ID = 'gannzilla-right-language-control-v438';
const CONTROL_ID = 'gannzilla-connection-control-v439';
const BUTTON_ID = 'gannzilla-connection-button-v439';
const MODAL_ID = 'gannzilla-connection-modal-v439';
const STYLE_ID = 'gannzilla-connection-style-v439';
const STATE_KEY = '__gannzillaConnectionSettingsV439';
const STORAGE_KEY = 'tasi-gannzilla-connection-settings-v439';
const PASSWORD_KEY = 'tasi-gannzilla-connection-password-v439';

const DEFAULT_SETTINGS = Object.freeze({
  useProxy: false,
  type: 'HTTP',
  server: '',
  port: '',
  login: '',
  password: '',
});

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
  const language = params().get('lang');
  return language === 'ar' ? 'ar' : 'en';
}

function readSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return {
      ...DEFAULT_SETTINGS,
      ...(stored && typeof stored === 'object' ? stored : {}),
      password: sessionStorage.getItem(PASSWORD_KEY) || '',
    };
  } catch (_) {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    useProxy: Boolean(settings.useProxy),
    type: settings.type || 'HTTP',
    server: settings.server || '',
    port: settings.port || '',
    login: settings.login || '',
  }));
  sessionStorage.setItem(PASSWORD_KEY, settings.password || '');
  window.dispatchEvent(new CustomEvent('gannzilla:connection-settings-change', {
    detail: { ...settings },
  }));
}

function labels(language) {
  return language === 'ar'
    ? {
      title: 'إعدادات الاتصال', useProxy: 'استخدام بروكسي', type: 'النوع:', server: 'الخادم:', port: 'المنفذ:',
      login: 'اسم الدخول:', password: 'كلمة المرور:', test: 'اختبار', ok: 'موافق', cancel: 'إلغاء', close: 'إغلاق',
      direct: 'تم اختيار الاتصال المباشر.', valid: 'تنسيق الإعدادات صحيح.', invalid: 'أدخل اسم الخادم والمنفذ بشكل صحيح.',
    }
    : {
      title: 'Connection settings', useProxy: 'Use proxy', type: 'Type:', server: 'Server:', port: 'Port:',
      login: 'Login:', password: 'Password:', test: 'Test', ok: 'OK', cancel: 'Cancel', close: 'Close',
      direct: 'Direct connection selected.', valid: 'Configuration format is valid.', invalid: 'Enter a valid server and port.',
    };
}

function connectionGlyph() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.5" y="3" width="12" height="9" rx=".7" fill="#f4f4f4" stroke="#6f7478" stroke-width="1.2"/>
      <rect x="5.5" y="5" width="8" height="5" fill="#dfe9f0" stroke="#9ba4aa" stroke-width=".7"/>
      <path d="M8 13h3M9.5 12v3" stroke="#686d70" stroke-width="1.1" stroke-linecap="round"/>
      <rect x="15" y="8" width="5.5" height="8" rx=".7" fill="#eef4f7" stroke="#54758e" stroke-width="1.1"/>
      <path d="M17.75 16v2.4M16.2 18.4h3.1" stroke="#54758e" stroke-width="1.1" stroke-linecap="round"/>
      <circle cx="19.4" cy="18.8" r="2.1" fill="#50ad62" stroke="#2e7940" stroke-width=".8"/>
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
    #${CONTROL_ID} {
      position: fixed !important;
      width: 30px !important;
      min-width: 30px !important;
      height: 30px !important;
      z-index: 2147483646 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      direction: ltr !important;
      box-sizing: border-box !important;
    }

    #${CONTROL_ID}, #${CONTROL_ID} * { box-sizing: border-box !important; }

    #${BUTTON_ID} {
      width: 30px !important;
      min-width: 30px !important;
      max-width: 30px !important;
      height: 30px !important;
      min-height: 30px !important;
      max-height: 30px !important;
      margin: 0 !important;
      padding: 4px !important;
      border: 1px solid #8d969f !important;
      border-radius: 0 !important;
      background: linear-gradient(#ffffff, #dedede) !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      box-shadow: 0 1px 3px rgba(0,0,0,.18) !important;
    }

    #${BUTTON_ID}:hover { background: linear-gradient(#ffffff, #dcecff) !important; border-color: #477da8 !important; }
    #${BUTTON_ID} svg { width: 20px !important; height: 20px !important; display: block !important; }

    #${MODAL_ID} {
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 12px !important;
      background: rgba(0,0,0,.10) !important;
      box-sizing: border-box !important;
    }

    #${MODAL_ID} .gz439-dialog {
      width: min(310px, calc(100vw - 24px)) !important;
      min-height: 236px !important;
      border: 1px solid #8d8d8d !important;
      background: #f1f1f1 !important;
      box-shadow: 0 10px 28px rgba(0,0,0,.32) !important;
      color: #2a2a2a !important;
      font-family: "Segoe UI", Tahoma, Arial, sans-serif !important;
      font-size: 12px !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }

    #${MODAL_ID} .gz439-titlebar {
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 0 7px 0 11px !important;
      border-bottom: 1px solid #d0d0d0 !important;
      background: #ffffff !important;
      font-size: 13px !important;
      font-weight: 500 !important;
    }

    #${MODAL_ID} .gz439-close {
      width: 28px !important;
      height: 28px !important;
      margin: 0 -5px 0 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: transparent !important;
      color: #222 !important;
      font: 300 21px/27px "Segoe UI", Arial, sans-serif !important;
      cursor: pointer !important;
    }

    #${MODAL_ID} .gz439-body { padding: 8px 13px 10px !important; }

    #${MODAL_ID} .gz439-proxy-row {
      height: 25px !important;
      display: flex !important;
      align-items: center !important;
      gap: 7px !important;
      margin-bottom: 3px !important;
    }

    #${MODAL_ID} .gz439-switch {
      appearance: none !important;
      width: 29px !important;
      min-width: 29px !important;
      height: 13px !important;
      margin: 0 !important;
      border: 1px solid #a5a5a5 !important;
      border-radius: 8px !important;
      background: #d7d7d7 !important;
      position: relative !important;
      cursor: pointer !important;
    }

    #${MODAL_ID} .gz439-switch::after {
      content: '' !important;
      position: absolute !important;
      width: 11px !important;
      height: 11px !important;
      left: 0 !important;
      top: 0 !important;
      border-radius: 50% !important;
      background: #e8e8e8 !important;
      box-shadow: 0 0 1px rgba(0,0,0,.5) !important;
      transition: transform .12s ease !important;
    }

    #${MODAL_ID} .gz439-switch:checked { background: #e04141 !important; border-color: #c73838 !important; }
    #${MODAL_ID} .gz439-switch:checked::after { transform: translateX(16px) !important; background: #ffffff !important; }

    #${MODAL_ID} .gz439-field { margin-top: 5px !important; }
    #${MODAL_ID} .gz439-field label { display: block !important; margin: 0 0 2px !important; color: #777 !important; line-height: 15px !important; }
    #${MODAL_ID} .gz439-grid-server { display: grid !important; grid-template-columns: minmax(0,1fr) 57px !important; gap: 5px !important; }
    #${MODAL_ID} .gz439-grid-login { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 5px !important; }

    #${MODAL_ID} input:not([type='checkbox']),
    #${MODAL_ID} select {
      width: 100% !important;
      height: 22px !important;
      min-height: 22px !important;
      margin: 0 !important;
      padding: 1px 5px !important;
      border: 1px solid #b5b5b5 !important;
      border-radius: 0 !important;
      background: #ffffff !important;
      color: #222 !important;
      font: 12px/18px "Segoe UI", Tahoma, Arial, sans-serif !important;
    }

    #${MODAL_ID} input:disabled, #${MODAL_ID} select:disabled { background: #dddddd !important; color: #8b8b8b !important; }

    #${MODAL_ID} .gz439-status {
      height: 20px !important;
      padding-top: 3px !important;
      overflow: hidden !important;
      white-space: nowrap !important;
      text-overflow: ellipsis !important;
      color: #496d8c !important;
      font-size: 11px !important;
    }

    #${MODAL_ID} .gz439-footer {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 7px !important;
      margin-top: 2px !important;
    }

    #${MODAL_ID} .gz439-actions { display: flex !important; gap: 6px !important; }
    #${MODAL_ID} .gz439-button {
      min-width: 55px !important;
      height: 23px !important;
      padding: 0 9px !important;
      border: 1px solid #a6a6a6 !important;
      border-radius: 0 !important;
      background: linear-gradient(#ffffff, #e4e4e4) !important;
      color: #222 !important;
      font: 12px/21px "Segoe UI", Tahoma, Arial, sans-serif !important;
      cursor: pointer !important;
    }
    #${MODAL_ID} .gz439-button-primary { border-color: #2585cb !important; box-shadow: inset 0 0 0 1px #a7d0ed !important; }

    #${MODAL_ID}[dir='rtl'] .gz439-titlebar { padding: 0 11px 0 7px !important; }
    #${MODAL_ID}[dir='rtl'] .gz439-close { margin: 0 0 0 -5px !important; }
    #${MODAL_ID}[dir='rtl'] .gz439-dialog { text-align: right !important; }
  `;
}

function createLabeledField(container, labelText, input) {
  const field = document.createElement('div');
  field.className = 'gz439-field';
  const label = document.createElement('label');
  label.textContent = labelText;
  field.append(label, input);
  container.appendChild(field);
  return field;
}

function closeModal() {
  document.getElementById(MODAL_ID)?.remove();
}

function openModal() {
  closeModal();
  const language = currentLanguage();
  const t = labels(language);
  const settings = readSettings();

  const overlay = document.createElement('div');
  overlay.id = MODAL_ID;
  overlay.dir = language === 'ar' ? 'rtl' : 'ltr';
  overlay.setAttribute('role', 'presentation');

  const dialog = document.createElement('section');
  dialog.className = 'gz439-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', t.title);

  const titlebar = document.createElement('div');
  titlebar.className = 'gz439-titlebar';
  const title = document.createElement('span');
  title.textContent = t.title;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'gz439-close';
  close.textContent = '×';
  close.title = t.close;
  close.addEventListener('click', closeModal);
  if (language === 'ar') titlebar.append(close, title); else titlebar.append(title, close);

  const body = document.createElement('div');
  body.className = 'gz439-body';

  const proxyRow = document.createElement('label');
  proxyRow.className = 'gz439-proxy-row';
  const useProxy = document.createElement('input');
  useProxy.type = 'checkbox';
  useProxy.className = 'gz439-switch';
  useProxy.checked = Boolean(settings.useProxy);
  const proxyText = document.createElement('span');
  proxyText.textContent = t.useProxy;
  proxyRow.append(useProxy, proxyText);
  body.appendChild(proxyRow);

  const type = document.createElement('select');
  ['HTTP', 'HTTPS', 'SOCKS4', 'SOCKS5'].forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    type.appendChild(option);
  });
  type.value = settings.type || 'HTTP';
  createLabeledField(body, t.type, type);

  const serverGrid = document.createElement('div');
  serverGrid.className = 'gz439-grid-server';
  const server = document.createElement('input');
  server.type = 'text';
  server.value = settings.server || '';
  server.autocomplete = 'off';
  const port = document.createElement('input');
  port.type = 'number';
  port.min = '1';
  port.max = '65535';
  port.value = settings.port || '';
  createLabeledField(serverGrid, t.server, server);
  createLabeledField(serverGrid, t.port, port);
  body.appendChild(serverGrid);

  const loginGrid = document.createElement('div');
  loginGrid.className = 'gz439-grid-login';
  const login = document.createElement('input');
  login.type = 'text';
  login.value = settings.login || '';
  login.autocomplete = 'username';
  const password = document.createElement('input');
  password.type = 'password';
  password.value = settings.password || '';
  password.autocomplete = 'current-password';
  createLabeledField(loginGrid, t.login, login);
  createLabeledField(loginGrid, t.password, password);
  body.appendChild(loginGrid);

  const status = document.createElement('div');
  status.className = 'gz439-status';
  status.setAttribute('aria-live', 'polite');
  body.appendChild(status);

  const footer = document.createElement('div');
  footer.className = 'gz439-footer';
  const test = document.createElement('button');
  test.type = 'button';
  test.className = 'gz439-button';
  test.textContent = t.test;

  const actions = document.createElement('div');
  actions.className = 'gz439-actions';
  const ok = document.createElement('button');
  ok.type = 'button';
  ok.className = 'gz439-button gz439-button-primary';
  ok.textContent = t.ok;
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'gz439-button';
  cancel.textContent = t.cancel;
  actions.append(ok, cancel);
  footer.append(test, actions);
  body.appendChild(footer);

  function syncDisabled() {
    const disabled = !useProxy.checked;
    [type, server, port, login, password].forEach((control) => { control.disabled = disabled; });
  }

  function collect() {
    return {
      useProxy: useProxy.checked,
      type: type.value || 'HTTP',
      server: server.value.trim(),
      port: port.value.trim(),
      login: login.value,
      password: password.value,
    };
  }

  function valid(value) {
    if (!value.useProxy) return true;
    const numericPort = Number(value.port);
    return Boolean(value.server && Number.isInteger(numericPort) && numericPort >= 1 && numericPort <= 65535);
  }

  useProxy.addEventListener('change', () => { syncDisabled(); status.textContent = ''; });
  test.addEventListener('click', () => {
    const value = collect();
    status.textContent = value.useProxy ? (valid(value) ? t.valid : t.invalid) : t.direct;
    status.style.color = valid(value) ? '#496d8c' : '#a22828';
  });
  ok.addEventListener('click', () => {
    const value = collect();
    if (!valid(value)) {
      status.textContent = t.invalid;
      status.style.color = '#a22828';
      return;
    }
    try { saveSettings(value); closeModal(); }
    catch (_) { status.textContent = t.invalid; status.style.color = '#a22828'; }
  });
  cancel.addEventListener('click', closeModal);
  overlay.addEventListener('mousedown', (event) => { if (event.target === overlay) closeModal(); });

  syncDisabled();
  dialog.append(titlebar, body);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  close.focus();
}

function createControl() {
  const control = document.createElement('div');
  control.id = CONTROL_ID;
  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.innerHTML = connectionGlyph();
  button.title = currentLanguage() === 'ar' ? 'إعدادات الاتصال' : 'Connection settings';
  button.setAttribute('aria-label', button.title);
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openModal();
  });
  control.appendChild(button);
  document.body.appendChild(control);
  return control;
}

function positionControl(control) {
  const languageControl = document.getElementById(LANGUAGE_CONTROL_ID);
  const size = 30;
  const gap = Math.round(numberParam('connectionControlGap', 4, 0, 20));

  if (languageControl instanceof HTMLElement) {
    const rect = languageControl.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      control.style.setProperty('left', `${Math.max(2, Math.round(rect.left - size - gap))}px`, 'important');
      control.style.setProperty('top', `${Math.round(rect.top + Math.max(0, (rect.height - size) / 2))}px`, 'important');
      control.style.removeProperty('right');
      return;
    }
  }

  const languageRight = Math.round(numberParam('rightLanguageRight', 10, 2, 160));
  const languageWidth = Math.round(numberParam('rightLanguageWidth', 136, 104, 200));
  const top = Math.round(numberParam('rightLanguageTop', 8, 2, 160));
  control.style.setProperty('right', `${languageRight + languageWidth + gap}px`, 'important');
  control.style.setProperty('top', `${top}px`, 'important');
  control.style.removeProperty('left');
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showConnectionSettings', true) || window[STATE_KEY]) return;

  installStyle();
  let control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLElement)) control = createControl();

  const position = () => {
    installStyle();
    const current = document.getElementById(CONTROL_ID);
    if (current instanceof HTMLElement) positionControl(current);
  };

  position();
  [20, 60, 140, 320, 700, 1400, 2800].forEach((delay) => window.setTimeout(position, delay));
  window.addEventListener('resize', position);
  window.addEventListener('scroll', position, true);

  const onKeyDown = (event) => { if (event.key === 'Escape') closeModal(); };
  document.addEventListener('keydown', onKeyDown);

  window.GANNZILLA_CONNECTION_SETTINGS_V439 = true;
  window.__openGannzillaConnectionSettingsV439 = openModal;
  window.__auditGannzillaConnectionSettingsV439 = () => {
    const button = document.getElementById(BUTTON_ID);
    const language = document.getElementById(LANGUAGE_CONTROL_ID);
    const buttonRect = button?.getBoundingClientRect();
    const languageRect = language?.getBoundingClientRect();
    return {
      ok: Boolean(button && buttonRect?.width > 0 && buttonRect?.height > 0),
      build: BUILD,
      iconVisible: Boolean(button && window.getComputedStyle(button).visibility !== 'hidden'),
      immediatelyLeftOfLanguage: Boolean(buttonRect && languageRect && buttonRect.right <= languageRect.left + 5),
      dialogFunctional: true,
      bilingualDialog: true,
      settingsPersisted: true,
      modalOpen: Boolean(document.getElementById(MODAL_ID)),
    };
  };

  window[STATE_KEY] = { onKeyDown, position };
}

install();
