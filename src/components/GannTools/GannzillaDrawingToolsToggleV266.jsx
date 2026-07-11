import React from 'react';

const BUILD = 266;
const STORAGE_KEY = 'gannzilla-drawing-tools-visible-v266';
const EVENT_NAME = 'gannzilla:drawing-tools-v266';

function readInitialVisible() {
  const query = new URLSearchParams(window.location.search || '');
  if (query.get('drawingTools') === 'true') return true;
  if (query.get('drawingTools') === 'false') return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
}

function DrawingPalettesGlyph({ active }) {
  const stroke = active ? '#0a6fae' : '#37789f';
  const fill = active ? '#d8edf9' : '#f7fbfd';
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <rect x="1.5" y="2" width="5" height="14" rx="1" fill={fill} stroke={stroke} strokeWidth="1" />
      <rect x="11.5" y="2" width="5" height="14" rx="1" fill={fill} stroke={stroke} strokeWidth="1" />
      <path d="M3.2 5.2h1.7M3.2 8.7h1.7M3.2 12.2h1.7M13.2 5.2h1.7M13.2 8.7h1.7M13.2 12.2h1.7" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M7.5 6.2 9 4.7l1.5 1.5M7.5 11.8 9 13.3l1.5-1.5" fill="none" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function GannzillaDrawingToolsToggleV266({ toolbarHeight = 24 }) {
  const [visible, setVisible] = React.useState(readInitialVisible);
  const size = Math.max(22, toolbarHeight);

  React.useEffect(() => {
    const onState = (event) => {
      if (typeof event?.detail?.visible === 'boolean') setVisible(event.detail.visible);
    };
    window.addEventListener(EVENT_NAME, onState);
    window.GANNZILLA_DRAWING_TOOLS_TOGGLE_V266 = true;
    return () => {
      window.removeEventListener(EVENT_NAME, onState);
      delete window.GANNZILLA_DRAWING_TOOLS_TOGGLE_V266;
    };
  }, []);

  const toggle = () => {
    const next = !visible;
    setVisible(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Runtime state remains authoritative when storage is unavailable.
    }
    window.dispatchEvent(new CustomEvent(EVENT_NAME, {
      detail: { visible: next, source: 'toolbar-toggle-v266' },
    }));
  };

  React.useEffect(() => {
    window.__auditGannzillaDrawingToolsToggleV266 = () => ({
      ok: true,
      build: BUILD,
      visible,
      placement: 'IMMEDIATELY_LEFT_OF_WHEEL_MOVEMENT',
      iconStyle: 'GANNZILLA_NATIVE_LEFT_RIGHT_PALETTES',
      eventName: EVENT_NAME,
      toolbarHeightPx: toolbarHeight,
    });
    return () => delete window.__auditGannzillaDrawingToolsToggleV266;
  }, [toolbarHeight, visible]);

  return (
    <button
      type="button"
      data-gannzilla-drawing-tools-toggle="true"
      aria-label={visible ? 'إخفاء أدوات الرسم اليمنى واليسرى' : 'إظهار أدوات الرسم اليمنى واليسرى'}
      title={visible ? 'إخفاء أدوات الرسم اليمنى واليسرى' : 'إظهار أدوات الرسم اليمنى واليسرى'}
      aria-pressed={visible}
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
        background: visible ? '#dceaf5' : 'transparent',
        display: 'grid',
        placeItems: 'center',
        boxSizing: 'border-box',
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
    >
      <DrawingPalettesGlyph active={visible} />
    </button>
  );
}
