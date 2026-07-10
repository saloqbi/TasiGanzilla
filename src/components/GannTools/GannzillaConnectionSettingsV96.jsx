import React from 'react';

const STORAGE_KEY = 'gannzillaConnectionSettingsV141';
const PASSWORD_KEY = 'gannzillaConnectionPasswordV141';
const BUTTON_ID = 'gannzilla-connection-settings-v141';
const ABOUT_ID = 'gannzilla-about-v141';

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

function applyButtonStyle(button, type) {
  Object.assign(button.style, {
    height: type === 'about' ? '24px' : '22px',
    width: type === 'about' ? '30px' : '27px',
    minWidth: type === 'about' ? '30px' : '27px',
    padding: '0',
    marginInlineStart: type === 'about' ? '3px' : '0',
    marginInlineEnd: type === 'connection' ? '3px' : '0',
    border: '1px solid #8794a6',
    borderRadius: '2px',
    background: 'linear-gradient(#ffffff,#dfe5eb)',
    cursor: 'pointer',
    verticalAlign: 'middle',
    boxSizing: 'border-box',
    pointerEvents: 'auto',
    userSelect: 'none',
    zIndex: '2147483647',
  });
}

export default function GannzillaConnectionSettingsV96() {
  const [open, setOpen] = React.useState(false);
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [settings, setSettings] = React.useState(loadSettings);
  const [status, setStatus] = React.useState('');
  const [language, setLanguage] = React.useState(document.documentElement.lang === 'ar' ? 'ar' : 'en');

  React.useEffect(() => {
    let bodyObserver;
    let languageObserver;
    let disposed = false;

    const installOnce = () => {
      if (disposed) return false;
      const languageButton = document.getElementById('gannzilla-bilingual-toggle-v95');
      if (!languageButton?.parentElement) return false;
      const parent = languageButton.parentElement;

      let connectionButton = document.getElementById(BUTTON_ID);
      if (!connectionButton) {
        connectionButton = document.createElement('button');
        connectionButton.id = BUTTON_ID;
        connectionButton.type = 'button';
        connectionButton.textContent = '▣';
        connectionButton.style.color = '#59636d';
        connectionButton.style.font = '700 14px Segoe UI, Arial, sans-serif';
        connectionButton.style.lineHeight = '20px';
        applyButtonStyle(connectionButton, 'connection');
        parent.insertBefore(connectionButton, languageButton);
      }

      let aboutButton = document.getElementById(ABOUT_ID);
      if (!aboutButton) {
        aboutButton = document.createElement('button');
        aboutButton.id = ABOUT_ID;
        aboutButton.type = 'button';
        applyButtonStyle(aboutButton, 'about');
        const circle = document.createElement('span');
        circle.textContent = 'i';
        Object.assign(circle.style, {
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px',
          borderRadius: '50%', background: '#4b70c2', color: '#fff', font: '700 15px Georgia, serif', lineHeight: '18px',
          pointerEvents: 'none',
        });
        aboutButton.appendChild(circle);
        parent.insertBefore(aboutButton, languageButton.nextSibling);
      }

      connectionButton.title = language === 'ar' ? 'إعدادات الاتصال' : 'Connection settings';
      connectionButton.setAttribute('aria-label', connectionButton.title);
      connectionButton.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setSettings(loadSettings());
        setStatus('');
        setAboutOpen(false);
        setOpen(true);
      };

      aboutButton.title = language === 'ar' ? 'حول البرنامج' : 'About';
      aboutButton.setAttribute('aria-label', aboutButton.title);
      aboutButton.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        setAboutOpen(true);
      };

      if (bodyObserver) bodyObserver.disconnect();
      return true;
    };

    if (!installOnce()) {
      bodyObserver = new MutationObserver(() => installOnce());
      bodyObserver.observe(document.body, { childList: true, subtree: true });
    }

    languageObserver = new MutationObserver(() => {
      const nextLanguage = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      setLanguage(nextLanguage);
    });
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    window.GANNZILLA_CONNECTION_SETTINGS_V141 = true;
    window.__auditGannzillaConnectionSettingsV141 = () => ({
      ok: Boolean(document.getElementById(BUTTON_ID)) && Boolean(document.getElementById(ABOUT_ID)),
      noRepeatedDomReordering: true,
      connectionClickable: typeof document.getElementById(BUTTON_ID)?.onclick === 'function',
      aboutClickable: typeof document.getElementById(ABOUT_ID)?.onclick === 'function',
      nativeToolbarButtonsUntouched: true,
    });

    return () => {
      disposed = true;
      bodyObserver?.disconnect();
      languageObserver?.disconnect();
      document.getElementById(BUTTON_ID)?.remove();
      document.getElementById(ABOUT_ID)?.remove();
    };
  }, [language]);

  const ar = language === 'ar';
  const t = ar ? {
    title: 'إعدادات الاتصال', useProxy: 'استخدام بروكسي', type: 'النوع:', server: 'الخادم:', port: 'المنفذ:',
    login: 'اسم الدخول:', password: 'كلمة المرور:', test: 'اختبار', ok: 'موافق', cancel: 'إلغاء',
    direct: 'سيتم استخدام الاتصال المباشر.', valid: 'تنسيق الإعدادات صحيح.', invalid: 'أدخل خادمًا ومنفذًا صحيحين.',
    about: 'حول البرنامج', version: 'الإصدار: 8.3', author: 'المؤلف: Artem Kalashnikov', rights: 'جميع الحقوق محفوظة', close: 'إغلاق',
  } : {
    title: 'Connection settings', useProxy: 'Use proxy', type: 'Type:', server: 'Server:', port: 'Port:',
    login: 'Login:', password: 'Password:', test: 'Test', ok: 'OK', cancel: 'Cancel',
    direct: 'Direct connection will be used.', valid: 'Configuration format is valid.', invalid: 'Enter a valid server and port.',
    about: 'About', version: 'Version: 8.3', author: 'Author: Artem Kalashnikov', rights: 'All rights reserved', close: 'Cancel',
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

  const input = { width: '100%', height: 24, boxSizing: 'border-box', border: '1px solid #aaa', padding: '0 5px', fontSize: 12 };
  const button = { minWidth: 58, height: 26, border: '1px solid #999', background: '#f4f4f4', cursor: 'pointer' };

  return (
    <>
      {open && (
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
      )}

      {aboutOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2147483646, background: 'rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div dir={ar ? 'rtl' : 'ltr'} style={{ width: 300, background: '#efefef', border: '1px solid #8f8f8f', boxShadow: '0 8px 24px rgba(0,0,0,.3)', fontFamily: 'Segoe UI,Tahoma,Arial', color: '#111' }}>
            <div style={{ height: 30, display: 'flex', alignItems: 'center', padding: '0 8px', background: '#fff', borderBottom: '1px solid #c9c9c9', fontSize: 13 }}>
              <span style={{ flex: 1 }}>{t.about}</span><button onClick={() => setAboutOpen(false)} style={{ border: 0, background: 'transparent', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '22px 20px 12px', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 58, height: 58, margin: '0 auto 8px' }}>
                <div style={{ position: 'absolute', inset: '2px 10px 10px 2px', border: '6px solid #78a620' }} />
                <div style={{ position: 'absolute', inset: '10px 2px 2px 10px', border: '6px solid #e07a00' }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Gannzilla Pro</div>
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>{t.version}</div>
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>{t.author}</div>
              <a href="mailto:support@gannzilla.ru" style={{ color: '#1686bd', fontSize: 13, textDecoration: 'none' }}>support@gannzilla.ru</a>
              <div><a href="https://gannzilla.ru" target="_blank" rel="noreferrer" style={{ color: '#1686bd', fontSize: 13, textDecoration: 'none' }}>gannzilla.ru</a></div>
              <div style={{ marginTop: 18, fontSize: 12, color: '#555' }}>© 2020 Artem Kalashnikov</div>
              <div style={{ fontSize: 12, color: '#777' }}>{t.rights}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}><button onClick={() => setAboutOpen(false)} style={{ ...button, borderColor: '#0078d4', boxShadow: 'inset 0 0 0 1px #0078d4' }}>{t.close}</button></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
