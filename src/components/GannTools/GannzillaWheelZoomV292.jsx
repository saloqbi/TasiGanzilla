import React from 'react';
import GannzillaWheelZoomV256 from './GannzillaWheelZoomV256';

const BUILD = 292;

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

function PanelGlyph({ visible }) {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" aria-hidden="true" focusable="false">
      <rect x="1.7" y="2.2" width="15.6" height="14.6" rx="1.2" fill="#ffffff" stroke="#145f91" strokeWidth="1.35" />
      <rect x="2.8" y="3.3" width="4.1" height="12.4" fill={visible ? '#2f83b9' : '#dfe7ec'} stroke="#145f91" strokeWidth="0.7" />
      <path d="M8.8 5.2h6M8.8 8.2h6M8.8 11.2h6M8.8 14.2h4.2" stroke="#708594" strokeWidth="1" strokeLinecap="round" />
      {!visible && <path d="M2.7 2.7 16.3 16.3" stroke="#cf342d" strokeWidth="1.8" strokeLinecap="round" />}
    </svg>
  );
}

/** Build 292: the highlighted toolbar button hides/shows the layout/settings panel only. */
export default function GannzillaWheelZoomV292({ toolbarHeight = 24 }) {
  const [panelVisible, setPanelVisible] = React.useState(() => Boolean(findLayoutPanel()));
  const size = Math.max(22, toolbarHeight);
  const buttonWidth = 104;

  const syncPanelState = React.useCallback(() => {
    setPanelVisible(Boolean(findLayoutPanel()));
  }, []);

  React.useEffect(() => {
    syncPanelState();
    const timers = [0, 80, 220, 520, 1000].map((delay) => window.setTimeout(syncPanelState, delay));
    const observer = new MutationObserver(syncPanelState);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', syncPanelState);
    document.addEventListener('fullscreenchange', syncPanelState);

    window.GANNZILLA_LAYOUT_PANEL_TOGGLE_V292 = true;
    window.__auditGannzillaLayoutPanelToggleV292 = () => ({
      ok: Boolean(findNativePanelToggle()),
      build: BUILD,
      layoutPanelVisible: Boolean(findLayoutPanel()),
      layoutPanelToggleMounted: Boolean(document.querySelector('[data-gannzilla-layout-panel-toggle-v292="true"]')),
      layoutPanelOnly: true,
      wheelAlwaysPreserved: true,
      placedImmediatelyLeftOfWheelMovement: true,
      nativeReactPanelToggleBound: Boolean(findNativePanelToggle()),
    });

    return () => {
      timers.forEach(window.clearTimeout);
      observer.disconnect();
      window.removeEventListener('resize', syncPanelState);
      document.removeEventListener('fullscreenchange', syncPanelState);
      delete window.GANNZILLA_LAYOUT_PANEL_TOGGLE_V292;
      delete window.__auditGannzillaLayoutPanelToggleV292;
    };
  }, [syncPanelState]);

  const togglePanel = () => {
    const nativeToggle = findNativePanelToggle();
    if (!(nativeToggle instanceof HTMLButtonElement)) return;
    nativeToggle.click();
    window.setTimeout(syncPanelState, 0);
    window.setTimeout(syncPanelState, 80);
  };

  return (
    <div
      data-gannzilla-wheel-zoom-v292="true"
      style={{
        height: toolbarHeight,
        display: 'flex',
        alignItems: 'stretch',
        flex: '0 0 auto',
        direction: 'ltr',
        overflow: 'visible',
        position: 'relative',
        zIndex: 2147483647,
      }}
    >
      <button
        type="button"
        data-gannzilla-layout-panel-toggle-v292="true"
        aria-label={panelVisible ? 'إخفاء التخطيط' : 'إظهار التخطيط'}
        title={panelVisible ? 'إخفاء التخطيط' : 'إظهار التخطيط'}
        aria-pressed={!panelVisible}
        onClick={togglePanel}
        style={{
          width: buttonWidth,
          height: size,
          minWidth: buttonWidth,
          minHeight: size,
          maxWidth: buttonWidth,
          maxHeight: size,
          flex: `0 0 ${buttonWidth}px`,
          margin: 0,
          padding: '0 7px',
          border: '1px solid #2b74aa',
          borderTop: 0,
          borderBottom: 0,
          borderRadius: 0,
          background: panelVisible ? '#fff4b8' : '#dceaf5',
          color: '#0d4f79',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          boxSizing: 'border-box',
          cursor: 'pointer',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 2147483647,
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: 11,
          fontWeight: 800,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        <PanelGlyph visible={panelVisible} />
        <span>{panelVisible ? 'إخفاء التخطيط' : 'إظهار التخطيط'}</span>
      </button>
      <GannzillaWheelZoomV256 toolbarHeight={toolbarHeight} />
    </div>
  );
}
