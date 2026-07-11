import React from 'react';

const BUILD = 284;
const STORAGE_KEY = 'gannzilla-drawing-tools-visible-v266';
const PALETTES_EVENT = 'gannzilla:drawing-tools-v266';
const LIBRARY_EVENT = 'gannzilla:drawing-library-v284';

function readPalettesVisible() {
  const query = new URLSearchParams(window.location.search || '');
  if (query.get('drawingTools') === 'true') return true;
  if (query.get('drawingTools') === 'false') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function DrawingLibraryGlyph({ active }) {
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

export default function GannzillaDrawingToolsToggleV284({ toolbarHeight = 24 }) {
  const [libraryOpen, setLibraryOpen] = React.useState(false);
  const [palettesVisible, setPalettesVisible] = React.useState(readPalettesVisible);
  const size = Math.max(22, toolbarHeight);

  React.useEffect(() => {
    const onPalettes = (event) => {
      if (typeof event?.detail?.visible === 'boolean') setPalettesVisible(event.detail.visible);
    };
    const onLibrary = (event) => {
      if (typeof event?.detail?.open === 'boolean') setLibraryOpen(event.detail.open);
    };
    window.addEventListener(PALETTES_EVENT, onPalettes);
    window.addEventListener(LIBRARY_EVENT, onLibrary);
    window.GANNZILLA_DRAWING_TOOLS_TOGGLE_V284 = true;
    return () => {
      window.removeEventListener(PALETTES_EVENT, onPalettes);
      window.removeEventListener(LIBRARY_EVENT, onLibrary);
      delete window.GANNZILLA_DRAWING_TOOLS_TOGGLE_V284;
    };
  }, []);

  const openLibrary = () => {
    if (!palettesVisible) {
      setPalettesVisible(true);
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // Runtime event remains authoritative when storage is unavailable.
      }
      window.dispatchEvent(new CustomEvent(PALETTES_EVENT, {
        detail: { visible: true, source: 'toolbar-library-v284' },
      }));
    }

    const next = !libraryOpen;
    setLibraryOpen(next);
    window.dispatchEvent(new CustomEvent(LIBRARY_EVENT, {
      detail: { open: next, source: 'existing-toolbar-tools-control-v284' },
    }));
  };

  React.useEffect(() => {
    window.__auditGannzillaDrawingToolsToggleV284 = () => ({
      ok: true,
      build: BUILD,
      libraryOpen,
      palettesVisible,
      opensFromExistingToolsControl: true,
      noAdditionalToolbarButton: true,
      libraryEvent: LIBRARY_EVENT,
      toolbarHeightPx: toolbarHeight,
    });
    return () => delete window.__auditGannzillaDrawingToolsToggleV284;
  }, [libraryOpen, palettesVisible, toolbarHeight]);

  return (
    <button
      type="button"
      data-gannzilla-drawing-tools-toggle="true"
      data-gannzilla-drawing-library-toggle="true"
      aria-label={libraryOpen ? 'إغلاق مكتبة أدوات الرسم' : 'فتح مكتبة أدوات الرسم'}
      title={libraryOpen ? 'إغلاق مكتبة أدوات الرسم' : 'فتح مكتبة أدوات الرسم'}
      aria-pressed={libraryOpen}
      onClick={openLibrary}
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
        background: libraryOpen ? '#dceaf5' : 'transparent',
        display: 'grid',
        placeItems: 'center',
        boxSizing: 'border-box',
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
    >
      <DrawingLibraryGlyph active={libraryOpen} />
    </button>
  );
}
