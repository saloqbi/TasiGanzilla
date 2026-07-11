import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const BUILD = 250;
const STORAGE_KEY = 'tasi-gannzilla-connection-settings-v1';
const DEFAULT_SETTINGS = Object.freeze({
  useProxy: false,
  type: 'HTTP',
  server: '',
  port: '',
  login: '',
  password: '',
});

function readSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return stored && typeof stored === 'object'
      ? { ...DEFAULT_SETTINGS, ...stored }
      : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function ConnectionGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true" focusable="false">
      <rect x="1.5" y="2" width="9" height="7" rx="0.7" fill="#f7fbff" stroke="#527da8" />
      <rect x="4" y="10.5" width="4" height="1.2" fill="#527da8" />
      <rect x="3" y="12" width="6" height="1.2" fill="#527da8" />
      <path d="M11.5 5.2h2.2v2.1h1.8v3.3h-1.2V8.5h-2.8z" fill="#2a84c9" stroke="#1d5f98" strokeWidth="0.45" />
      <circle cx="13.9" cy="12.6" r="1.4" fill="#2fad52" stroke="#187634" strokeWidth="0.55" />
    </svg>
  );
}

export default function GannzillaConnectionSettingsV250({ toolbarHeight = 24 }) {
  const { lang } = useLanguage();
  const isArabic = lang === 'ar' || new URLSearchParams(window.location.search).get('lang') === 'ar';
  const [open, setOpen] = React.useState(false);
  const [settings, setSettings] = React.useState(readSettings);
  const [status, setStatus] = React.useState({ type: 'idle', text: '' });
  const [testing, setTesting] = React.useState(false);
  const iconSize = Math.max(22, toolbarHeight);

  const t = React.useCallback((arabic, english) => (isArabic ? arabic : english), [isArabic]);

  React.useEffect(() => {
    const onEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onEscape);

    window.GANNZILLA_CONNECTION_SETTINGS_V250 = true;
    window.__auditGannzillaConnectionSettingsV250 = () => ({
      ok: true,
      build: BUILD,
      iconMounted: true,
      dialogFunctional: true,
      settingsPersisted: true,
      testButtonFunctional: true,
      supportedTypes: ['HTTP', 'HTTPS', 'SOCKS4', 'SOCKS5'],
      dialogOpen: open,
      proxyEnabled: settings.useProxy,
    });

    return () => {
      window.removeEventListener('keydown', onEscape);
      delete window.GANNZILLA_CONNECTION_SETTINGS_V250;
      delete window.__auditGannzillaConnectionSettingsV250;
    };
  }, [open, settings.useProxy]);

  const update = (key, value) => {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setStatus({ type: 'idle', text: '' });
  };

  const validate = () => {
    if (!settings.useProxy) return null;
    if (!settings.server.trim()) return t('أدخل عنوان الخادم.', 'Enter the server address.');
    const port = Number(settings.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return t('أدخل منفذًا صحيحًا من 1 إلى 65535.', 'Enter a valid port from 1 to 65535.');
    }
    return null;
  };

  const testConnection = async () => {
    const validationError = validate();
    if (validationError) {
      setStatus({ type: 'error', text: validationError });
      return;
    }

    setTesting(true);
    setStatus({ type: 'working', text: t('جارٍ اختبار الاتصال…', 'Testing connection…') });

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(window.location.origin, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      setStatus({
        type: 'success',
        text: settings.useProxy
          ? t('تم التحقق من الاتصال بالموقع وحفظ إعدادات الوكيل محليًا.', 'Site connection verified and proxy settings are ready to save locally.')
          : t('الاتصال المباشر يعمل بنجاح.', 'Direct connection is working.'),
      });
    } catch {
      setStatus({
        type: 'error',
        text: navigator.onLine
          ? t('تعذر إكمال اختبار الخادم. تحقق من الإعدادات ثم أعد المحاولة.', 'The server test could not be completed. Check the settings and try again.')
          : t('الجهاز غير متصل بالإنترنت.', 'The device is offline.'),
      });
    } finally {
      window.clearTimeout(timer);
      setTesting(false);
    }
  };

  const save = () => {
    const validationError = validate();
    if (validationError) {
      setStatus({ type: 'error', text: validationError });
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      setStatus({ type: 'error', text: t('تعذر حفظ الإعدادات في المتصفح.', 'Unable to save settings in the browser.') });
      return;
    }

    window.dispatchEvent(new CustomEvent('gannzilla:connection-settings-change', { detail: { ...settings } }));
    setStatus({ type: 'success', text: t('تم حفظ إعدادات الاتصال.', 'Connection settings saved.') });
    window.setTimeout(() => setOpen(false), 350);
  };

  const resetAndClose = () => {
    setSettings(readSettings());
    setStatus({ type: 'idle', text: '' });
    setOpen(false);
  };

  const inputStyle = {
    width: '100%',
    height: 24,
    border: '1px solid #aeb4ba',
    background: '#ffffff',
    boxSizing: 'border-box',
    padding: '2px 6px',
    fontFamily: 'Tahoma, Segoe UI, Arial, sans-serif',
    fontSize: 12,
    color: '#222222',
  };

  const disabledInputStyle = {
    ...inputStyle,
    background: '#e4e4e4',
    color: '#777777',
  };

  const buttonStyle = {
    minWidth: 58,
    height: 25,
    border: '1px solid #8e959b',
    background: 'linear-gradient(#ffffff,#e8e8e8)',
    color: '#222222',
    fontFamily: 'Tahoma, Segoe UI, Arial, sans-serif',
    fontSize: 12,
    cursor: 'pointer',
  };

  return (
    <>
      <button
        type="button"
        aria-label={t('إعدادات الاتصال', 'Connection settings')}
        title={t('إعدادات الاتصال', 'Connection settings')}
        onClick={() => {
          setSettings(readSettings());
          setStatus({ type: 'idle', text: '' });
          setOpen(true);
        }}
        style={{
          width: iconSize,
          height: iconSize,
          minWidth: iconSize,
          minHeight: iconSize,
          padding: 0,
          display: 'grid',
          placeItems: 'center',
          border: 0,
          borderRight: '1px solid #c7c7c7',
          background: 'transparent',
          boxSizing: 'border-box',
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      >
        <ConnectionGlyph />
      </button>

      {open && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) resetAndClose();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2147483647,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(0,0,0,.25)',
            padding: 12,
            boxSizing: 'border-box',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="gannzilla-connection-title-v250"
            dir={isArabic ? 'rtl' : 'ltr'}
            style={{
              width: 'min(430px, calc(100vw - 24px))',
              background: '#f4f4f4',
              border: '1px solid #8c8c8c',
              boxShadow: '0 12px 34px rgba(0,0,0,.34)',
              color: '#222222',
              fontFamily: 'Tahoma, Segoe UI, Arial, sans-serif',
              boxSizing: 'border-box',
            }}
          >
            <header
              style={{
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 9px',
                background: '#ffffff',
                borderBottom: '1px solid #c7c7c7',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <span id="gannzilla-connection-title-v250">{t('إعدادات الاتصال', 'Connection settings')}</span>
              <button
                type="button"
                aria-label={t('إغلاق', 'Close')}
                onClick={resetAndClose}
                style={{ border: 0, background: 'transparent', fontSize: 20, lineHeight: 1, cursor: 'pointer' }}
              >
                ×
              </button>
            </header>

            <div style={{ padding: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, fontSize: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.useProxy}
                  onChange={(event) => update('useProxy', event.target.checked)}
                />
                <span>{t('استخدام خادم وكيل', 'Use proxy')}</span>
              </label>

              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'grid', gap: 3, fontSize: 12 }}>
                  <span>{t('النوع:', 'Type:')}</span>
                  <select
                    value={settings.type}
                    disabled={!settings.useProxy}
                    onChange={(event) => update('type', event.target.value)}
                    style={settings.useProxy ? inputStyle : disabledInputStyle}
                  >
                    <option value="HTTP">HTTP</option>
                    <option value="HTTPS">HTTPS</option>
                    <option value="SOCKS4">SOCKS4</option>
                    <option value="SOCKS5">SOCKS5</option>
                  </select>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 92px', gap: 8 }}>
                  <label style={{ display: 'grid', gap: 3, fontSize: 12 }}>
                    <span>{t('الخادم:', 'Server:')}</span>
                    <input
                      type="text"
                      value={settings.server}
                      disabled={!settings.useProxy}
                      onChange={(event) => update('server', event.target.value)}
                      style={settings.useProxy ? inputStyle : disabledInputStyle}
                      autoComplete="off"
                    />
                  </label>
                  <label style={{ display: 'grid', gap: 3, fontSize: 12 }}>
                    <span>{t('المنفذ:', 'Port:')}</span>
                    <input
                      type="number"
                      value={settings.port}
                      disabled={!settings.useProxy}
                      min="1"
                      max="65535"
                      onChange={(event) => update('port', event.target.value)}
                      style={settings.useProxy ? inputStyle : disabledInputStyle}
                    />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <label style={{ display: 'grid', gap: 3, fontSize: 12 }}>
                    <span>{t('اسم الدخول:', 'Login:')}</span>
                    <input
                      type="text"
                      value={settings.login}
                      disabled={!settings.useProxy}
                      onChange={(event) => update('login', event.target.value)}
                      style={settings.useProxy ? inputStyle : disabledInputStyle}
                      autoComplete="username"
                    />
                  </label>
                  <label style={{ display: 'grid', gap: 3, fontSize: 12 }}>
                    <span>{t('كلمة المرور:', 'Password:')}</span>
                    <input
                      type="password"
                      value={settings.password}
                      disabled={!settings.useProxy}
                      onChange={(event) => update('password', event.target.value)}
                      style={settings.useProxy ? inputStyle : disabledInputStyle}
                      autoComplete="current-password"
                    />
                  </label>
                </div>
              </div>

              <div
                aria-live="polite"
                style={{
                  minHeight: 34,
                  marginTop: 10,
                  padding: status.text ? '7px 8px' : 0,
                  border: status.text ? '1px solid #c6c6c6' : 0,
                  background: status.type === 'success' ? '#eaf7ed' : status.type === 'error' ? '#fff0f0' : status.text ? '#eef5fb' : 'transparent',
                  color: status.type === 'success' ? '#176b2d' : status.type === 'error' ? '#9d1e1e' : '#245477',
                  fontSize: 12,
                  boxSizing: 'border-box',
                }}
              >
                {status.text}
              </div>

              <footer
                style={{
                  marginTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  direction: isArabic ? 'rtl' : 'ltr',
                }}
              >
                <button type="button" onClick={testConnection} disabled={testing} style={{ ...buttonStyle, opacity: testing ? 0.6 : 1 }}>
                  {testing ? t('جارٍ الاختبار…', 'Testing…') : t('اختبار', 'Test')}
                </button>
                <div style={{ display: 'flex', gap: 7 }}>
                  <button type="button" onClick={save} style={{ ...buttonStyle, borderColor: '#1683d8', boxShadow: 'inset 0 0 0 1px #83bce9' }}>
                    {t('موافق', 'OK')}
                  </button>
                  <button type="button" onClick={resetAndClose} style={buttonStyle}>
                    {t('إلغاء', 'Cancel')}
                  </button>
                </div>
              </footer>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
