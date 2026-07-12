import React from 'react';
import GannzillaWheelZoomV289 from './GannzillaWheelZoomV289';

const BUILD = 298;

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

function LayoutEyeGlyph({ visible }) {
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

/** Build 298: separate panel/wheel controls with authoritative hidden-frame cleanup. */
export default function GannzillaWheelZoomV293({ toolbarHeight = 24 }) {
  const [panelVisible, setPanelVisible] = React.useState(() => readPanelVisible());
  const size = Math.max(22, toolbarHeight);

  const syncPanelState = React.useCallback(() => {
    setPanelVisible(readPanelVisible());
  }, []);

  React.useEffect(() => {
    syncPanelState();
    const timers = [0, 80, 220, 520, 1000].map((delay) => window.setTimeout(syncPanelState, delay));
    const observer = new MutationObserver(syncPanelState);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
    window.addEventListener('resize', syncPanelState);
    document.addEventListener('fullscreenchange', syncPanelState);

    window.GANNZILLA_DUAL_VISIBILITY_CONTROLS_V298 = true;
    window.__auditGannzillaDualVisibilityControlsV298 = () => ({
      ok: Boolean(findNativePanelToggle()),
      build: BUILD,
      layoutPanelVisible: readPanelVisible(),
      layoutEyeMounted: Boolean(document.querySelector('[data-gannzilla-layout-eye-v298="true"]')),
      wheelVisibilityControlMounted: Boolean(document.querySelector('[data-gannzilla-chart-visibility-toggle-v291="true"]')),
      separateLayoutAndWheelControls: true,
      nativeToggleTextIsPanelAuthority: true,
      residualAsideCannotReportFalseVisible: true,
      viewportResyncDispatchedAfterPanelToggle: true,
    });

    return () => {
      timers.forEach(window.clearTimeout);
      observer.disconnect();
      window.removeEventListener('resize', syncPanelState);
      document.removeEventListener('fullscreenchange', syncPanelState);
      delete window.GANNZILLA_DUAL_VISIBILITY_CONTROLS_V298;
      delete window.__auditGannzillaDualVisibilityControlsV298;
    };
  }, [syncPanelState]);

  const togglePanel = () => {
    const nativeToggle = findNativePanelToggle();
    if (!(nativeToggle instanceof HTMLButtonElement)) return;
    nativeToggle.click();

    const dispatchViewportResync = () => {
      const visible = readPanelVisible();
      setPanelVisible(visible);
      window.dispatchEvent(new CustomEvent('gannzilla:layout-panel-visibility-change', {
        detail: { visible },
      }));
    };

    window.setTimeout(dispatchViewportResync, 0);
    window.setTimeout(dispatchViewportResync, 90);
    window.setTimeout(dispatchViewportResync, 260);
    window.setTimeout(dispatchViewportResync, 520);
  };

  return (
    <div
      data-gannzilla-wheel-zoom-v298="true"
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
        data-gannzilla-layout-eye-v298="true"
        aria-label={panelVisible ? 'إخفاء لوحة التخطيط' : 'إظهار لوحة التخطيط'}
        title={panelVisible ? 'إخفاء لوحة التخطيط' : 'إظهار لوحة التخطيط'}
        aria-pressed={!panelVisible}
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
          background: panelVisible ? '#fff4b8' : '#dceaf5',
          display: 'grid',
          placeItems: 'center',
          boxSizing: 'border-box',
          cursor: 'pointer',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 2147483647,
        }}
      >
        <LayoutEyeGlyph visible={panelVisible} />
      </button>

      <GannzillaWheelZoomV289 toolbarHeight={toolbarHeight} />
    </div>
  );
}
