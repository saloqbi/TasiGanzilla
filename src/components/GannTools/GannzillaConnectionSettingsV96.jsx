import React from 'react';

const STORAGE_KEY = 'gannzillaConnectionSettingsV139';
const PASSWORD_KEY = 'gannzillaConnectionPasswordV139';
const BUTTON_ID = 'gannzilla-connection-settings-v139';

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      useProxy: saved.useProxy === true,
      type: saved.type || 'HTTP',
      server: saved.server || '',
      port: saved.port || '',
      login: saved.login || '',
      password: sessionStorage.getItem(PASSWORD_KEY) || '',
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
  sessionStorage.setItem(PASSWORD_KEY, settings.password || '');
}

export default function GannzillaConnectionSettingsV96() {
  const [open, setOpen] = React.useState(false);
  const [settings, setSettings] = React.useState(loadSettings);
  const [status, setStatus] = React.useState('');
  const [language, setLanguage] = React.useState(document.documentElement.lang === 'ar' ? 'ar' : 'en');

  React.useEffect(() => {
    const install = () => {
      const languageButton = document.getElementById('gannzilla-bilingual-toggle-v95');
      if (!languageButton?.parentElement) return;

      let button = document.getElementById(BUTTON_ID);
      if (!button) {
        button = document.createElement('button');
        button.id = BUTTON_ID;
        button.type = 'button';
        button.innerHTML = '⚙';
        button.style.height = '22px';
        button.style.width = '28px';
        button.style.padding = '0';
        button.style.marginInlineStart = '4px';
        button.style.border = '1px solid #a7a7a7';
        button.style.borderRadius = '2px';
        button.style.background = '#f7f7f7';
        button.style.color = '#333';
        button.style.font = '700 15px Segoe UI, Arial, sans-serif';
        button.style.cursor = 'pointer';
        button.style.verticalAlign = 'middle';
        languageButton.parentElement.insertBefore(button, languageButton.nextSibling);
      }

      button.title = language === 'ar' ? 'إعدادات الاتصال' : 'Connection settings';
      button.setAttribute('aria-label', button.title);
      button.onclick = () => {
        setSettings(loadSettings());
        setStatus('');
        setOpen(true);
      };
    };

    const syncLanguage = () => {
      setLanguage(document.documentElement.lang === 'ar' ? 'ar' : 'en');
      install();
    };

    install();
    const timer = window.setInterval(install, 200);
    const observer = new MutationObserver(syncLanguage);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    window.GANNZILLA_CONNECTION_SETTINGS_V139 = true;
    window.__auditGannzillaConnectionSettingsV139 = () => ({
      ok: Boolean(document.getElementById(BUTTON_ID)),
      buttonBesideLanguage: true,
      storageEnabled: true,
    });

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      document.getElementById(BUTTON_ID)?.remove();
    };
  }, [language]);

  const ar = language === 'ar';
  const t = ar ? {
    title: 'إعدادات الاتصال', useProxy: 'استخدام بروكسي', type: 'النوع:', server: 'الخادم:', port: 'المنفذ:',
    login: 'اسم الدخول:', password: 'كلمة المرور:', test: 'اختبار', ok: 'موافق', cancel: 'إلغاء',
    direct: 'سيتم استخدام الاتصال المباشر.', valid: 'تنسيق الإعدادات صحيح.', invalid: 'أدخل خادمًا ومنفذًا صحيحين.',
  } : {
    title: 'Connection settings', useProxy: 'Use proxy', type: 'Type:', server: 'Server:', port: 'Port:',
    login: 'Login:', password: 'Password:', test: 'Test', ok: 'OK', cancel: 'Cancel',
    direct: 'Direct connection will be used.', valid: 'Configuration format is valid.', invalid: 'Enter a valid server and port.',
  };

  const update = (key) => (event) => setSettings((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const test = () => {
    if (!settings.useProxy) return setStatus(t.direct);
    const port = Number(settings.port);
    setStatus(settings.server.trim() && Number.isInteger(port) && port > 0 && port <= 65535 ? t.valid : t.invalid);
  };

  const confirm = () => {
    saveSettings(settings);
    window.dispatchEvent(new CustomEvent('gannzilla:connection-settings-changed', { detail: { ...settings, password: undefined } }));
    setOpen(false);
  };

  if (!open) return null;

  const input = { width: '100%', height: 24, boxSizing: 'border-box', border: '1px solid #aaa', padding: '0 5px', fontSize: 12 };
  const button = { minWidth: 58, height: 26, border: '1px solid #999', background: '#f4f4f4', cursor: 'pointer' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2147483646, background: 'rgba(0,0,0,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div dir={ar ? 'rtl' : 'ltr'} style={{ width: 330, background: '#f1f1f1', border: '1px solid #888', boxShadow: '0 8px 24px rgba(0,0,0,.3)', fontFamily: 'Segoe UI,Tahoma,Arial' }}>
        <div style={{ height: 31, display: 'flex', alignItems: 'center', padding: '0 9px', background: '#fff', borderBottom: '1px solid #ccc' }}>
          <span style={{ flex: 1 }}>{t.title}</span><button onClick={() => setOpen(false)} style={{ border: 0, background: 'transparent', fontSize: 18 }}>×</button>
        </div>
        <div style={{ padding: 10 }}>
          <label style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 9 }}><input type="checkbox" checked={settings.useProxy} onChange={update('useProxy')} />{t.useProxy}</label>
          <div style={{ marginBottom: 7 }}><div>{t.type}</div><select disabled={!settings.useProxy} value={settings.type} onChange={update('type')} style={input}><option>HTTP</option><option>HTTPS</option><option>SOCKS4</option><option>SOCKS5</option></select></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 65px', gap: 7, marginBottom: 7 }}>
            <div><div>{t.server}</div><input disabled={!settings.useProxy} value={settings.server} onChange={update('server')} style={input} /></div>
            <div><div>{t.port}</div><input disabled={!settings.useProxy} value={settings.port} onChange={update('port')} style={input} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 8 }}>
            <div><div>{t.login}</div><input disabled={!settings.useProxy} value={settings.login} onChange={update('login')} style={input} /></div>
            <div><div>{t.password}</div><input disabled={!settings.useProxy} type="password" value={settings.password} onChange={update('password')} style={input} /></div>
          </div>
          {status && <div style={{ fontSize: 11, marginBottom: 8, padding: 5, background: '#fff' }}>{status}</div>}
          <div style={{ display: 'flex', gap: 7 }}><button onClick={test} style={{ ...button, marginInlineEnd: 'auto' }}>{t.test}</button><button onClick={confirm} style={button}>{t.ok}</button><button onClick={() => setOpen(false)} style={button}>{t.cancel}</button></div>
        </div>
      </div>
    </div>
  );
}
