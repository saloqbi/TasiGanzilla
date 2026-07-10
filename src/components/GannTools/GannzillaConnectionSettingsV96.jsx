import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = '150';
const STORAGE_KEY = 'gannzillaConnectionSettingsV141';
const PASSWORD_KEY = 'gannzillaConnectionPasswordV141';
const PLACEHOLDER_ID = 'gannzilla-connection-settings-v141';
const HITBOX_ID = 'gannzilla-connection-hitbox-v149';
const ABOUT_ID = 'gannzilla-about-v141';
const LANGUAGE_BUTTON_ID = 'gannzilla-bilingual-toggle-v95';
const OPEN_EVENT = 'gannzilla:open-connection-settings-v150';

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

function stopEvent(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
}

function getEventPoint(event) {
  const touch = event?.touches?.[0] || event?.changedTouches?.[0];
  return {
    x: Number.isFinite(event?.clientX) ? event.clientX : touch?.clientX,
    y: Number.isFinite(event?.clientY) ? event.clientY : touch?.clientY,
  };
}

function pointInside(rect, x, y, padding = 6) {
  if (!rect || !Number.isFinite(x) || !Number.isFinite(y)) return false;
  return x >= rect.left - padding
    && x <= rect.left + rect.width + padding
    && y >= rect.top - padding
    && y <= rect.top + rect.height + padding;
}

function stylePlaceholder(button) {
  Object.assign(button.style, {
    width: '27px',
    minWidth: '27px',
    height: '22px',
    padding: '0',
    marginInlineEnd: '3px',
    border: '0',
    background: 'transparent',
    boxSizing: 'border-box',
    display: 'inline-flex',
    visibility: 'hidden',
    pointerEvents: 'none',
    opacity: '0',
  });
  button.disabled = true;
  button.setAttribute('aria-hidden', 'true');
}

function styleAboutButton(button) {
  Object.assign(button.style, {
    width: '30px', minWidth: '30px', height: '24px', padding: '0', marginInlineStart: '3px',
    border: '1px solid #8794a6', borderRadius: '2px', background: 'linear-gradient(#ffffff,#dfe5eb)',
    cursor: 'pointer', boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', visibility: 'visible', pointerEvents: 'auto', zIndex: '2147483647',
  });
  button.disabled = false;
  button.removeAttribute('aria-hidden');
}

function ConnectionGlyph() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      <rect x="4" y="3" width="16" height="18" fill="#efefef" stroke="#8c8c8c" strokeWidth="1.3" />
      <rect x="7" y="5" width="10" height="12" fill="#fff" stroke="#999" />
      <path d="M10 17v-5h4v5M9 8h6" stroke="#555" strokeWidth="1.2" />
      <circle cx="12" cy="19" r="1" fill="#555" />
    </svg>
  );
}

export default function GannzillaConnectionSettingsV96() {
  const [open, setOpen] = React.useState(false);
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [settings, setSettings] = React.useState(loadSettings);
  const [status, setStatus] = React.useState('');
  const [language, setLanguage] = React.useState(document.documentElement.lang === 'ar' ? 'ar' : 'en');
  const [buttonRect, setButtonRect] = React.useState(null);
  const buttonRectRef = React.useRef(null);
  const languageRef = React.useRef(language);

  const openConnection = React.useCallback((event) => {
    stopEvent(event);
    setSettings(loadSettings());
    setStatus('');
    setAboutOpen(false);
    setOpen(true);
  }, []);

  const openAbout = React.useCallback((event) => {
    stopEvent(event);
    setOpen(false);
    setAboutOpen(true);
  }, []);

  React.useEffect(() => {
    languageRef.current = language;
  }, [language]);

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setLanguage(document.documentElement.lang === 'ar' ? 'ar' : 'en');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    let disposed = false;

    const install = () => {
      if (disposed) return;
      const languageButton = document.getElementById(LANGUAGE_BUTTON_ID);
      const parent = languageButton?.parentElement;
      if (!parent) return;

      let placeholder = document.getElementById(PLACEHOLDER_ID);
      if (!placeholder) {
        placeholder = document.createElement('button');
        placeholder.id = PLACEHOLDER_ID;
        placeholder.type = 'button';
      }
      stylePlaceholder(placeholder);
      if (placeholder.parentElement !== parent || placeholder.nextSibling !== languageButton) {
        parent.insertBefore(placeholder, languageButton);
      }

      const rect = placeholder.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const next = {
          left: Math.round(rect.left), top: Math.round(rect.top),
          width: Math.max(27, Math.round(rect.width)), height: Math.max(22, Math.round(rect.height)),
        };
        buttonRectRef.current = next;
        setButtonRect((current) => (
          current && current.left === next.left && current.top === next.top
            && current.width === next.width && current.height === next.height ? current : next
        ));
      }

      let aboutButton = document.getElementById(ABOUT_ID);
      if (!aboutButton) {
        aboutButton = document.createElement('button');
        aboutButton.id = ABOUT_ID;
        aboutButton.type = 'button';
        const circle = document.createElement('span');
        circle.textContent = 'i';
        Object.assign(circle.style, {
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px',
          borderRadius: '50%', background: '#4b70c2', color: '#fff', font: '700 15px Georgia, serif',
          lineHeight: '18px', pointerEvents: 'none',
        });
        aboutButton.appendChild(circle);
      }
      styleAboutButton(aboutButton);
      aboutButton.title = languageRef.current === 'ar' ? 'حول البرنامج' : 'About';
      aboutButton.setAttribute('aria-label', aboutButton.title);
      aboutButton.onclick = openAbout;
      if (aboutButton.parentElement !== parent || languageButton.nextSibling !== aboutButton) {
        parent.insertBefore(aboutButton, languageButton.nextSibling);
      }
    };

    install();
    const observer = new MutationObserver(install);
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setInterval(install, 200);
    window.addEventListener('resize', install);
    window.addEventListener('scroll', install, true);

    return () => {
      disposed = true;
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', install);
      window.removeEventListener('scroll', install, true);
      document.getElementById(PLACEHOLDER_ID)?.remove();
      document.getElementById(ABOUT_ID)?.remove();
    };
  }, [openAbout]);

  React.useEffect(() => {
    const activateByCoordinates = (event) => {
      const target = event.target instanceof Element ? event.target.closest(`#${HITBOX_ID}`) : null;
      const point = getEventPoint(event);
      if (target || pointInside(buttonRectRef.current, point.x, point.y)) openConnection(event);
    };
    const activateByEvent = (event) => openConnection(event);

    document.addEventListener('pointerdown', activateByCoordinates, true);
    document.addEventListener('mousedown', activateByCoordinates, true);
    document.addEventListener('click', activateByCoordinates, true);
    document.addEventListener('touchstart', activateByCoordinates, { capture: true, passive: false });
    window.addEventListener(OPEN_EVENT, activateByEvent);

    window.GANNZILLA_CONNECTION_SETTINGS_V150 = true;
    window.__openGannzillaConnectionSettingsV150 = () => openConnection();
    window.__auditGannzillaConnectionSettingsV150 = () => {
      const hitbox = document.getElementById(HITBOX_ID);
      const style = hitbox ? window.getComputedStyle(hitbox) : null;
      return {
        ok: Boolean(hitbox)
          && style?.display !== 'none'
          && style?.visibility !== 'hidden'
          && style?.pointerEvents !== 'none'
          && Boolean(buttonRectRef.current),
        build: BUILD,
        dedicatedClickableOverlay: Boolean(hitbox),
        coordinateCaptureEnabled: true,
        dialogOpen: Boolean(document.getElementById('gannzilla-connection-dialog-v150')),
      };
    };

    return () => {
      document.removeEventListener('pointerdown', activateByCoordinates, true);
      document.removeEventListener('mousedown', activateByCoordinates, true);
      document.removeEventListener('click', activateByCoordinates, true);
      document.removeEventListener('touchstart', activateByCoordinates, true);
      window.removeEventListener(OPEN_EVENT, activateByEvent);
    };
  }, [openConnection]);

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
    about: 'About', version: 'Version: 8.3', author: 'Author: Artem Kalashnikov', rights: 'All rights reserved', close: 'Close',
  };

  const update = (key) => (event) => setSettings((current) => ({
    ...current,
    [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
  }));

  const test = () => {
    if (!settings.useProxy) return setStatus(t.direct);
    const port = Number(settings.port);
    setStatus(settings.server.trim() && Number.isInteger(port) && port > 0 && port <= 65535 ? t.valid : t.invalid);
  };

  const confirm = () => {
    saveSettings(settings);
    window.dispatchEvent(new CustomEvent('gannzilla:connection-settings-changed', {
      detail: { ...settings, password: undefined },
    }));
    setOpen(false);
  };

  const input = { width: '100%', height: 24, boxSizing: 'border-box', border: '1px solid #aaa', padding: '0 5px', fontSize: 12 };
  const button = { minWidth: 58, height: 26, border: '1px solid #999', background: '#f4f4f4', cursor: 'pointer' };

  const overlay = buttonRect && createPortal(
    <button
      id={HITBOX_ID}
      type="button"
      title={t.title}
      aria-label={t.title}
      onPointerDown={openConnection}
      onMouseDown={openConnection}
      onTouchStart={openConnection}
      onClick={openConnection}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') openConnection(event);
      }}
      style={{
        position: 'fixed', left: buttonRect.left, top: buttonRect.top,
        width: Math.max(31, buttonRect.width + 4), height: Math.max(26, buttonRect.height + 4),
        transform: 'translate(-2px,-2px)', zIndex: 2147483647,
        padding: 0, margin: 0, border: '1px solid #8794a6', borderRadius: 2,
        background: 'linear-gradient(#ffffff,#dfe5eb)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', visibility: 'visible', opacity: 1, pointerEvents: 'auto',
        cursor: 'pointer', boxSizing: 'border-box', touchAction: 'manipulation',
      }}
    >
      <ConnectionGlyph />
    </button>,
    document.body,
  );

  const connectionDialog = open && createPortal(
    <div id="gannzilla-connection-dialog-v150" style={{ position: 'fixed', inset: 0, zIndex: 2147483647, background: 'rgba(0,0,0,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
      <div dir={ar ? 'rtl' : 'ltr'} style={{ width: 330, background: '#f1f1f1', border: '1px solid #888', boxShadow: '0 8px 24px rgba(0,0,0,.3)', fontFamily: 'Segoe UI,Tahoma,Arial', color: '#111' }}>
        <div style={{ height: 31, display: 'flex', alignItems: 'center', padding: '0 9px', background: '#fff', borderBottom: '1px solid #ccc' }}>
          <span style={{ flex: 1 }}>{t.title}</span><button onClick={() => setOpen(false)} style={{ border: 0, background: 'transparent', fontSize: 18, cursor: 'pointer' }}>×</button>
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
    </div>,
    document.body,
  );

  const aboutDialog = aboutOpen && createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 2147483647, background: 'rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
      <div dir={ar ? 'rtl' : 'ltr'} style={{ width: 300, background: '#efefef', border: '1px solid #8f8f8f', boxShadow: '0 8px 24px rgba(0,0,0,.3)', fontFamily: 'Segoe UI,Tahoma,Arial', color: '#111' }}>
        <div style={{ height: 30, display: 'flex', alignItems: 'center', padding: '0 8px', background: '#fff', borderBottom: '1px solid #c9c9c9', fontSize: 13 }}>
          <span style={{ flex: 1 }}>{t.about}</span><button onClick={() => setAboutOpen(false)} style={{ border: 0, background: 'transparent', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '22px 20px 12px', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 58, height: 58, margin: '0 auto 8px' }}><div style={{ position: 'absolute', inset: '2px 10px 10px 2px', border: '6px solid #78a620' }} /><div style={{ position: 'absolute', inset: '10px 2px 2px 10px', border: '6px solid #e07a00' }} /></div>
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
    </div>,
    document.body,
  );

  return <>{overlay}{connectionDialog}{aboutDialog}</>;
}
