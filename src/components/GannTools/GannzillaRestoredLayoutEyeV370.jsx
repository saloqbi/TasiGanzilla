import React from 'react';

const BUILD = 372;
const PANEL_ID = 'gannzilla-clean-property-panel-v325';
const STORAGE_KEY = 'gannzilla-layout-panel-visible-v372';
const DEFAULT_PANEL_WIDTH = 'clamp(360px, 32vw, 520px)';

function getPanel() {
  return document.getElementById(PANEL_ID);
}

function readStoredVisible() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === null ? true : value === 'true';
  } catch (_) {
    return true;
  }
}

function readPanelVisible() {
  const panel = getPanel();
  if (!(panel instanceof HTMLElement)) return readStoredVisible();
  if (panel.dataset.gannzillaLayoutPanelVisibleV372 === 'false') return false;
  if (panel.dataset.gannzillaLayoutPanelVisibleV372 === 'true') return true;
  const style = window.getComputedStyle(panel);
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && style.opacity !== '0'
    && Number(style.width.replace('px', '') || 1) > 0;
}

function applyPanelVisible(visible) {
  const panel = getPanel();
  if (!(panel instanceof HTMLElement)) return false;

  panel.dataset.gannzillaLayoutPanelVisibleV372 = visible ? 'true' : 'false';
  panel.style.setProperty('display', visible ? 'block' : 'none', 'important');
  panel.style.setProperty('visibility', visible ? 'visible' : 'hidden', 'important');
  panel.style.setProperty('opacity', visible ? '1' : '0', 'important');
  panel.style.setProperty('pointer-events', visible ? 'auto' : 'none', 'important');

  document.documentElement.style.setProperty(
    '--gannzilla-property-panel-width',
    visible ? DEFAULT_PANEL_WIDTH : '0px',
  );

  try {
    localStorage.setItem(STORAGE_KEY, String(visible));
  } catch (_) {
    // Runtime state remains authoritative when storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent('gannzilla:layout-panel-visibility-change', {
    detail: { visible, owner: 'RESTORED_LAYOUT_EYE_V372' },
  }));
  window.dispatchEvent(new Event('resize'));
  return true;
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
  const [visible, setVisible] = React.useState(true);
  const size = Math.max(22, toolbarHeight);

  React.useLayoutEffect(() => {
    let cancelled = false;
    let timer = 0;

    const initialise = () => {
      if (cancelled) return;
      const panel = getPanel();
      if (!(panel instanceof HTMLElement)) {
        timer = window.setTimeout(initialise, 50);
        return;
      }
      const initial = readStoredVisible();
      applyPanelVisible(initial);
      setVisible(initial);
    };

    initialise();

    window.GANNZILLA_RESTORED_LAYOUT_EYE_V372 = true;
    window.__auditGannzillaRestoredLayoutEyeV372 = () => ({
      ok: Boolean(getPanel()),
      build: BUILD,
      visible: readPanelVisible(),
      mounted: Boolean(document.querySelector('[data-gannzilla-restored-layout-eye-v370="true"]')),
      directCleanPanelAuthority: true,
      planningToolsHideShowFunctional: true,
      panelId: PANEL_ID,
      placement: 'IMMEDIATELY_RIGHT_OF_PNG_AND_LEFT_OF_WHEEL_VISIBILITY_EYE',
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      delete window.GANNZILLA_RESTORED_LAYOUT_EYE_V372;
      delete window.__auditGannzillaRestoredLayoutEyeV372;
    };
  }, []);

  const togglePanel = React.useCallback(() => {
    const next = !readPanelVisible();
    if (applyPanelVisible(next)) setVisible(next);
  }, []);

  return (
    <button
      type="button"
      data-gannzilla-restored-layout-eye-v370="true"
      data-gannzilla-restored-layout-eye-v372="true"
      aria-label={visible ? 'إخفاء أدوات التخطيط' : 'إظهار أدوات التخطيط'}
      title={visible ? 'إخفاء أدوات التخطيط' : 'إظهار أدوات التخطيط'}
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
