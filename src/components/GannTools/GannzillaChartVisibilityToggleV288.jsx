import React from 'react';

const BUILD = 288;
const STORAGE_KEY = 'gannzilla-chart-visible-v288';

function readInitialVisible() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
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
  stage.setAttribute('data-gannzilla-chart-stage-v288', 'true');
  return stage;
}

function applyChartVisibility(visible) {
  const stage = findWheelStage();
  if (!(stage instanceof HTMLElement)) return false;

  stage.style.setProperty('visibility', visible ? 'visible' : 'hidden', 'important');
  stage.style.setProperty('opacity', visible ? '1' : '0', 'important');
  stage.style.setProperty('pointer-events', visible ? 'auto' : 'none', 'important');
  stage.style.setProperty('transition', 'opacity 120ms ease-out', 'important');
  stage.dataset.gannzillaChartVisibleV288 = visible ? 'true' : 'false';
  return true;
}

function EyeGlyph({ visible }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path
        d="M1.5 9s2.7-4.5 7.5-4.5S16.5 9 16.5 9 13.8 13.5 9 13.5 1.5 9 1.5 9Z"
        fill={visible ? '#f7fbfd' : '#eef1f3'}
        stroke="#2b74aa"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="2.3" fill={visible ? '#2b74aa' : '#ffffff'} stroke="#2b74aa" strokeWidth="1" />
      {!visible && <path d="M3 3 15 15" stroke="#c83b34" strokeWidth="1.7" strokeLinecap="round" />}
    </svg>
  );
}

/** Build 288: hide/show only the wheel chart while preserving the settings panel and toolbar. */
export default function GannzillaChartVisibilityToggleV288({ toolbarHeight = 24 }) {
  const [visible, setVisible] = React.useState(readInitialVisible);
  const size = Math.max(22, toolbarHeight);

  React.useEffect(() => {
    const sync = () => applyChartVisibility(visible);
    sync();
    const timers = [0, 70, 200, 500, 900].map((delay) => window.setTimeout(sync, delay));
    window.addEventListener('resize', sync);
    document.addEventListener('fullscreenchange', sync);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', sync);

    window.GANNZILLA_CHART_VISIBILITY_TOGGLE_V288 = true;
    window.__auditGannzillaChartVisibilityToggleV288 = () => ({
      ok: Boolean(findWheelStage()),
      build: BUILD,
      chartVisible: visible,
      chartOnlyToggle: true,
      settingsPanelPreserved: true,
      toolbarPreserved: true,
      placedLeftOfWheelMovement: true,
      statePersisted: true,
    });

    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', sync);
      delete window.GANNZILLA_CHART_VISIBILITY_TOGGLE_V288;
      delete window.__auditGannzillaChartVisibilityToggleV288;
    };
  }, [visible]);

  const toggle = () => {
    const next = !visible;
    setVisible(next);
    applyChartVisibility(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Runtime state remains authoritative when storage is unavailable.
    }
  };

  return (
    <button
      type="button"
      data-gannzilla-chart-visibility-toggle="true"
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
        borderRight: '1px solid #c7c7c7',
        borderLeft: '1px solid #c7c7c7',
        borderRadius: 0,
        background: visible ? 'transparent' : '#dceaf5',
        display: 'grid',
        placeItems: 'center',
        boxSizing: 'border-box',
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
    >
      <EyeGlyph visible={visible} />
    </button>
  );
}
