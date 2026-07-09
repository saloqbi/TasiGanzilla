import React from 'react';

const MARKER = 'GANNZILLA_CONNECTION_SETTINGS_V96';
const STORAGE_KEY = 'gannzillaConnectionSettingsV96';
const SESSION_PASSWORD_KEY = 'gannzillaConnectionPasswordV96';
const ICON_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAdCAIAAAAhEQuvAAAD00lEQVR4AayUS08jRxDH2z0ztrHHNgvYC1GS3SW3RCQCISC8xBUQ78cpwl+FfAWkxMACUg5R8gm4ceKAlWDDGohwEJwRb+PH2J5XfjZSVnv2tkrt6uqqf/2rqj3SbXhJ0fD6HCw8DS/pNLzkZ1gNd1PI3xpecmZmpru7e35+fmlpaW5ubmpqamFhYWJigiP74uIiDtPT0xjHx8dxm5ycXF5exoIDx9nZWWnbtqqqiqLkcrlyuUxzK5VKU1NTtVrFyJEdeVEsy9I0rVQqoRSLxcfHx1orfT4f79M0TYbb0tKi6zr6CxYWwzAIMAwDC954gsUeDofb2tpwAEsWCgWsXPv9/tvb22Qy+W99ZTKZk5OTbDZ7Xl/Yzs7OTk9PM5kM+/7+/s3NDfmCwaAECQEIbATr6OhoX1/fyMjIwMAA+4/1NTw83N/fzxHj2NgYbiSG79PTk6S2QCDAaCmYPZ/P39/f7+7u0gvaRF9IgFAIAVS0t7eHDwpGBB/JgR8gUQiDSGtr6+DgIEcaBmdKyGazFEUkZLu6ukKhENA4E0jjpap6OZMBCtBBv7u74w6Pq6urjY2Nn+trfX398vISLiS7vr7GjS4QQqC0LVcIyvHZtmtZjmnarusxjAoKR2JAWF1dtSyLAqn8+fkZCMgSz2vAIrnzCIUDwgXw5Acb2uSJRCIwYl7RaFTXw9zirygKDhSFZ60Qn1+TiuCOhFwLIWiwoihYCIZRLpd/eHjK54v556Km+Zg90OSjlwCBIokkOWfCHMfhIQHPS2VsGDs6Or77tuuH77u/6PiSBIEmnRpxgCOZoECINM2Kx0M7SC9wQvy+QDjU7BGKWbVDesR1hapqsdjrcrlCIyiNSIZFMlhQo4QY2RghlCCCAEwSFN77mzdvGUQqlVKZnNcrpcL/wuv1EiWEKJfLpJT1gmHhaJoipQSbhl9cXJRKhqpq795947qeQqEUi7UHgyEcQGQ0BFMIWKSXL8lVVQUPnnBrb2/v6elpbm6GDq+Iv1NnZycfhK+/ehuNvh4aGorFYngyTmLpoxTCsawqXMiA8upVZHvn/cZmIpH4dWdne3v7PcJXaXNz848/f08kfllbW9va2qLNpIQFuYEQBAOGiVb19vbyIYnH4yufrJ9WVpCaKR6P8/nBjf87LGBdgwAJCDrKW6BCXdfpufA4NRG06X9xhHC5JZivDPF0pNYLIkECgg5TPDoDo05I1cSuWghabTfRHx7umBfxhBBPlDw8TCeTf/GlSafTx8fHR0dHHz4cnZ//k0r9/VHSdb2+89/F55CwdJr94ODgPwAAAP//Zvr7CwAAAAZJREFUAwCku+4b9/jjQwAAAABJRU5ErkJggg==';

const TEXT = {
  en: {
    title: 'Connection settings',
    useProxy: 'Use proxy',
    type: 'Type:',
    server: 'Server:',
    port: 'Port:',
    login: 'Login:',
    password: 'Password:',
    test: 'Test',
    ok: 'OK',
    cancel: 'Cancel',
    direct: 'Proxy is disabled. Direct connection will be used.',
    invalid: 'Enter a valid server and a port between 1 and 65535.',
    valid: 'Configuration format is valid.',
    saved: 'Connection settings saved.',
    passwordNote: 'Password is kept only for the current browser session.',
    tooltip: 'Connection settings',
  },
  ar: {
    title: 'إعدادات الاتصال',
    useProxy: 'استخدام بروكسي',
    type: 'النوع:',
    server: 'الخادم:',
    port: 'المنفذ:',
    login: 'اسم الدخول:',
    password: 'كلمة المرور:',
    test: 'اختبار',
    ok: 'موافق',
    cancel: 'إلغاء',
    direct: 'البروكسي غير مفعّل. سيتم استخدام الاتصال المباشر.',
    invalid: 'أدخل خادمًا صحيحًا ومنفذًا بين 1 و65535.',
    valid: 'تنسيق الإعدادات صحيح.',
    saved: 'تم حفظ إعدادات الاتصال.',
    passwordNote: 'يتم الاحتفاظ بكلمة المرور خلال جلسة المتصفح الحالية فقط.',
    tooltip: 'إعدادات الاتصال',
  },
};

function readStoredSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      useProxy: parsed.useProxy === true,
      type: parsed.type || 'HTTP',
      server: parsed.server || '',
      port: parsed.port || '',
      login: parsed.login || '',
      password: sessionStorage.getItem(SESSION_PASSWORD_KEY) || '',
    };
  } catch (_) {
    return { useProxy: false, type: 'HTTP', server: '', port: '', login: '', password: '' };
  }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    useProxy: settings.useProxy,
    type: settings.type,
    server: settings.server,
    port: settings.port,
    login: settings.login,
  }));
  sessionStorage.setItem(SESSION_PASSWORD_KEY, settings.password || '');
}

function findToolbarIconButton() {
  return Array.from(document.querySelectorAll('button')).find((button) => String(button.textContent || '').trim() === '▣') || null;
}

export default function GannzillaConnectionSettingsV96() {
  const [open, setOpen] = React.useState(false);
  const [language, setLanguage] = React.useState(document.documentElement.lang === 'ar' ? 'ar' : 'en');
  const [settings, setSettings] = React.useState(readStoredSettings);
  const [status, setStatus] = React.useState(null);
  const boundButtonRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setLanguage(document.documentElement.lang === 'ar' ? 'ar' : 'en');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const bind = () => {
      const button = findToolbarIconButton();
      if (!button) return;
      if (boundButtonRef.current && boundButtonRef.current !== button) {
        boundButtonRef.current.removeEventListener('click', boundButtonRef.current.__gannzillaConnectionHandler);
      }

      if (!button.__gannzillaConnectionHandler) {
        const handler = (event) => {
          event.preventDefault();
          event.stopPropagation();
          setSettings(readStoredSettings());
          setStatus(null);
          setOpen(true);
        };
        button.__gannzillaConnectionHandler = handler;
        button.addEventListener('click', handler);
      }

      button.innerHTML = `<img src="${ICON_DATA_URI}" alt="" style="display:block;width:14px;height:18px;object-fit:contain;margin:auto;" />`;
      button.title = TEXT[language].tooltip;
      button.setAttribute('aria-label', TEXT[language].tooltip);
      boundButtonRef.current = button;
    };

    const timer = window.setInterval(bind, 250);
    bind();
    return () => {
      window.clearInterval(timer);
      const button = boundButtonRef.current;
      if (button?.__gannzillaConnectionHandler) {
        button.removeEventListener('click', button.__gannzillaConnectionHandler);
        delete button.__gannzillaConnectionHandler;
      }
    };
  }, [language]);

  React.useEffect(() => {
    window[MARKER] = true;
    window.__gannzillaGetConnectionSettingsV96 = () => readStoredSettings();
    window.__auditGannzillaConnectionSettingsV96 = () => ({
      ok: window[MARKER] === true && Boolean(boundButtonRef.current),
      iconBound: Boolean(boundButtonRef.current),
      settings: { ...readStoredSettings(), password: readStoredSettings().password ? 'SESSION_ONLY' : '' },
    });
  }, []);

  const t = TEXT[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const testSettings = async () => {
    if (!settings.useProxy) {
      setStatus({ kind: 'success', text: t.direct });
      return;
    }

    const port = Number(settings.port);
    if (!settings.server.trim() || !Number.isInteger(port) || port < 1 || port > 65535) {
      setStatus({ kind: 'error', text: t.invalid });
      return;
    }

    if (typeof window.__gannzillaConnectionSettingsTestHookV96 === 'function') {
      try {
        const result = await window.__gannzillaConnectionSettingsTestHookV96({ ...settings });
        setStatus({ kind: result?.ok === false ? 'error' : 'success', text: result?.message || t.valid });
        return;
      } catch (error) {
        setStatus({ kind: 'error', text: error?.message || t.invalid });
        return;
      }
    }

    setStatus({ kind: 'success', text: t.valid });
  };

  const confirm = () => {
    saveSettings(settings);
    window.dispatchEvent(new CustomEvent('gannzilla:connection-settings-changed', {
      detail: { ...settings },
    }));
    setStatus({ kind: 'success', text: t.saved });
    window.setTimeout(() => setOpen(false), 350);
  };

  if (!open) return null;

  const labelStyle = { fontSize: 12, marginBottom: 2, color: '#333' };
  const inputStyle = { height: 23, border: '1px solid #a9a9a9', background: '#fff', padding: '0 5px', fontSize: 12, width: '100%', boxSizing: 'border-box' };
  const buttonStyle = { minWidth: 58, height: 25, border: '1px solid #9b9b9b', background: '#f2f2f2', fontSize: 12, cursor: 'pointer' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2147483646, background: 'rgba(0,0,0,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div dir={dir} role="dialog" aria-modal="true" aria-label={t.title} style={{ width: 330, background: '#f3f3f3', border: '1px solid #8f8f8f', boxShadow: '0 8px 24px rgba(0,0,0,0.30)', fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', color: '#222' }}>
        <div style={{ height: 30, display: 'flex', alignItems: 'center', padding: '0 8px', background: '#ffffff', borderBottom: '1px solid #c9c9c9', fontSize: 13 }}>
          <span style={{ flex: 1 }}>{t.title}</span>
          <button type="button" onClick={() => setOpen(false)} style={{ border: 0, background: 'transparent', fontSize: 18, cursor: 'pointer', color: '#777' }}>×</button>
        </div>

        <div style={{ padding: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, fontSize: 12 }}>
            <input type="checkbox" checked={settings.useProxy} onChange={(event) => setSettings((current) => ({ ...current, useProxy: event.target.checked }))} />
            <span>{t.useProxy}</span>
          </label>

          <div style={{ marginBottom: 7 }}>
            <div style={labelStyle}>{t.type}</div>
            <select disabled={!settings.useProxy} value={settings.type} onChange={(event) => setSettings((current) => ({ ...current, type: event.target.value }))} style={{ ...inputStyle, background: settings.useProxy ? '#fff' : '#dedede' }}>
              <option>HTTP</option>
              <option>HTTPS</option>
              <option>SOCKS4</option>
              <option>SOCKS5</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 62px', gap: 6, marginBottom: 7 }}>
            <div>
              <div style={labelStyle}>{t.server}</div>
              <input disabled={!settings.useProxy} value={settings.server} onChange={(event) => setSettings((current) => ({ ...current, server: event.target.value }))} style={{ ...inputStyle, background: settings.useProxy ? '#fff' : '#ededed' }} />
            </div>
            <div>
              <div style={labelStyle}>{t.port}</div>
              <input disabled={!settings.useProxy} type="number" min="1" max="65535" value={settings.port} onChange={(event) => setSettings((current) => ({ ...current, port: event.target.value }))} style={{ ...inputStyle, background: settings.useProxy ? '#fff' : '#ededed' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
            <div>
              <div style={labelStyle}>{t.login}</div>
              <input disabled={!settings.useProxy} autoComplete="username" value={settings.login} onChange={(event) => setSettings((current) => ({ ...current, login: event.target.value }))} style={{ ...inputStyle, background: settings.useProxy ? '#fff' : '#ededed' }} />
            </div>
            <div>
              <div style={labelStyle}>{t.password}</div>
              <input disabled={!settings.useProxy} type="password" autoComplete="current-password" value={settings.password} onChange={(event) => setSettings((current) => ({ ...current, password: event.target.value }))} style={{ ...inputStyle, background: settings.useProxy ? '#fff' : '#ededed' }} />
            </div>
          </div>

          <div style={{ minHeight: 28, fontSize: 11, color: '#666', marginBottom: 4 }}>{t.passwordNote}</div>
          {status && <div style={{ minHeight: 24, padding: '4px 6px', marginBottom: 7, border: `1px solid ${status.kind === 'error' ? '#c55' : '#6a9d6a'}`, background: status.kind === 'error' ? '#fff0f0' : '#f0fff0', color: status.kind === 'error' ? '#a11' : '#276227', fontSize: 11 }}>{status.text}</div>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <button type="button" onClick={testSettings} style={{ ...buttonStyle, marginInlineEnd: 'auto' }}>{t.test}</button>
            <button type="button" onClick={confirm} style={{ ...buttonStyle, borderColor: '#0078d4', boxShadow: 'inset 0 0 0 1px #0078d4' }}>{t.ok}</button>
            <button type="button" onClick={() => setOpen(false)} style={buttonStyle}>{t.cancel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
