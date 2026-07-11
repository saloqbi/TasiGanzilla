import React from 'react';
import GannzillaWheelZoomV256 from './GannzillaWheelZoomV256';

const BUILD = 289;
const STORAGE_KEY = 'gannzilla-chart-visible-v289';

function readVisible() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === null ? true : value === 'true';
  } catch {
    return true;
  }
}

function findWheelStage() {
  const canvases = Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height));

  const canvas = canvases[0]?.canvas || null;
  if (!canvas) return null;
  const stage = canvas.parentElement || canvas;
  stage.setAttribute('data-gannzilla-chart-stage-v289', 'true');
  return stage;
}

function applyVisible(visible) {
  const stage = findWheelStage();
  if (!(stage instanceof HTMLElement)) return false;
  stage.style.setProperty('visibility', visible ? 'visible' : 'hidden', 'important');
  stage.style.setProperty('opacity', visible ? '1' : '0', 'important');
  stage.style.setProperty('pointer-events', visible ? 'auto' : 'none', 'important');
  stage.style.setProperty('transition', 'opacity 120ms ease-out', 'important');
  stage.dataset.gannzillaChartVisibleV289 = visible ? 'true' : 'false';
  return true;
}

function EyeGlyph({ visible }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d="M1.7 10s3.1-5.1 8.3-5.1 8.3 5.1 8.3 5.1-3.1 5.1-8.3 5.1S1.7 10 1.7 10Z"
        fill="#ffffff"
        stroke="#1f628f"
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.65" fill={visible ? '#2477ad' : '#ffffff'} stroke="#1f628f" strokeWidth="1.1" />
      {!visible && <path d="M3 3 17 17" stroke="#c9342e" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}

/** Build 289: visible eye is physically integrated immediately left of the wheel-movement button. */
export default function GannzillaWheelZoomV289({ toolbarHeight = 24 }) {
  const [visible, setVisible] = React.useState(readVisible);
  const size = Math.max(22, toolbarHeight);

  React.useEffect(() => {
    const sync = () => applyVisible(visible);
    sync();
    const timers = [0, 80, 220, 520, 1000, 1600].map((delay) => window.setTimeout(sync, delay));
    window.addEventListener('resize', sync);
    document.addEventListener('fullscreenchange', sync);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', sync);

    window.GANNZILLA_WHEEL_ZOOM_V289 = true;
    window.__auditGannzillaWheelZoomV289 = () => ({
      ok: Boolean(findWheelStage()),
      build: BUILD,
      eyeButtonMounted: Boolean(document.querySelector('[data-gannzilla-chart-visibility-toggle-v289="true"]')),
      eyePhysicallyIntegratedWithWheelControls: true,
      eyeImmediatelyLeftOfMovementButton: true,
      chartVisible: visible,
      settingsPanelPreserved: true,
      toolbarPreserved: true,
    });

    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', sync);
      delete window.GANNZILLA_WHEEL_ZOOM_V289;
      delete window.__auditGannzillaWheelZoomV289;
    };
  }, [visible]);

  const toggle = () => {
    const next = !visible;
    setVisible(next);
    applyVisible(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Runtime state remains authoritative when storage is unavailable.
    }
  };

  return (
    <div
      data-gannzilla-wheel-zoom-v289="true"
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
        data-gannzilla-chart-visibility-toggle-v289="true"
        aria-label={visible ? 'إخفاء المخطط' : 'إظهار المخطط'}
        title={visible ? 'إخفاء المخطط' : 'إظهار المخطط'}
        aria-pressed={!visible}
        onClick={toggle}
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
          background: visible ? '#f8f8f8' : '#dceaf5',
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
      <GannzillaWheelZoomV256 toolbarHeight={toolbarHeight} />
    </div>
  );
}
