import React from 'react';

const BUILD = 370;

function getClassicRoot() {
  return document.querySelector('[data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"])');
}

function findLayoutPanel() {
  const root = getClassicRoot();
  if (!(root instanceof HTMLElement)) return null;
  return Array.from(root.children).find((node) => node instanceof HTMLElement && node.tagName === 'ASIDE') || null;
}

function findNativePanelToggle() {
  const root = getClassicRoot();
  if (!(root instanceof HTMLElement)) return null;

  const directButtons = Array.from(root.children)
    .filter((node) => node instanceof HTMLButtonElement);

  return directButtons.find((button) => {
    const text = String(button.textContent || '').trim();
    return /^(Hide|Show|إخفاء|إظهار)$/i.test(text);
  }) || directButtons[0] || null;
}

function readPanelVisible() {
  const toggle = findNativePanelToggle();
  const text = String(toggle?.textContent || '').trim();
  if (/^(Show|إظهار)$/i.test(text)) return false;
  if (/^(Hide|إخفاء)$/i.test(text)) return true;

  const panel = findLayoutPanel();
  if (!(panel instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(panel);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

function EyeGlyph({ visible }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d="M1.6 10s3.1-5 8.4-5 8.4 5 8.4 5-3.1 5-8.4 5-8.4-5-8.4-5Z"
        fill="#ffffff"
        stroke="#145f91"
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.55" fill={visible ? '#2180b8' : '#ffffff'} stroke="#145f91" strokeWidth="1.05" />
      <rect x="2.35" y="4.25" width="2.35" height="11.5" rx="0.55" fill={visible ? '#f0a629' : '#cbd5db'} stroke="#8b681d" strokeWidth="0.55" />
      {!visible && <path d="M3 3 17 17" stroke="#cf342d" strokeWidth="1.8" strokeLinecap="round" />}
    </svg>
  );
}

export default function GannzillaRestoredLayoutEyeV370({ toolbarHeight = 24 }) {
  const [visible, setVisible] = React.useState(() => readPanelVisible());
  const size = Math.max(22, toolbarHeight);

  const sync = React.useCallback(() => setVisible(readPanelVisible()), []);

  React.useEffect(() => {
    const timers = [0, 80, 220, 520, 1000].map((delay) => window.setTimeout(sync, delay));
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
    window.addEventListener('resize', sync);
    document.addEventListener('fullscreenchange', sync);

    window.GANNZILLA_RESTORED_LAYOUT_EYE_V370 = true;
    window.__auditGannzillaRestoredLayoutEyeV370 = () => ({
      ok: Boolean(findNativePanelToggle()),
      build: BUILD,
      visible: readPanelVisible(),
      mounted: Boolean(document.querySelector('[data-gannzilla-restored-layout-eye-v370="true"]')),
      placement: 'IMMEDIATELY_RIGHT_OF_PNG_AND_LEFT_OF_WHEEL_VISIBILITY_EYE',
    });

    return () => {
      timers.forEach(window.clearTimeout);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      delete window.GANNZILLA_RESTORED_LAYOUT_EYE_V370;
      delete window.__auditGannzillaRestoredLayoutEyeV370;
    };
  }, [sync]);

  const togglePanel = () => {
    const nativeToggle = findNativePanelToggle();
    if (!(nativeToggle instanceof HTMLButtonElement)) return;
    nativeToggle.click();

    const resync = () => {
      const nextVisible = readPanelVisible();
      setVisible(nextVisible);
      window.dispatchEvent(new CustomEvent('gannzilla:layout-panel-visibility-change', {
        detail: { visible: nextVisible },
      }));
    };

    [0, 90, 260, 520].forEach((delay) => window.setTimeout(resync, delay));
  };

  return (
    <button
      type="button"
      data-gannzilla-restored-layout-eye-v370="true"
      aria-label={visible ? 'إخفاء لوحة التخطيط' : 'إظهار لوحة التخطيط'}
      title={visible ? 'إخفاء لوحة التخطيط' : 'إظهار لوحة التخطيط'}
      aria-pressed={!visible}
      onClick={togglePanel}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        maxWidth: size,
        maxHeight: size,
        flex: `0 0 ${size}px`,
        margin: 0,
        padding: 0,
        border: 0,
        borderLeft: '1px solid #c7c7c7',
        borderRight: '1px solid #c7c7c7',
        borderRadius: 0,
        background: visible ? '#fff4b8' : '#dceaf5',
        display: 'grid',
        placeItems: 'center',
        boxSizing: 'border-box',
        cursor: 'pointer',
        pointerEvents: 'auto',
        position: 'relative',
        zIndex: 2147483647,
      }}
    >
      <EyeGlyph visible={visible} />
    </button>
  );
}
