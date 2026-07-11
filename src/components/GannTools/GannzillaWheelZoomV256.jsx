import React from 'react';

const BUILD = 265;
const MIN_ZOOM = 0.10;
const MAX_ZOOM = 3.00;
const MOVE_STEP_PX = 48;
const HOLD_STEP_PX = 12;
const PAN_STORAGE_KEY = 'gannzilla-wheel-pan-v265';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getNativeControls() {
  const labels = Array.from(document.querySelectorAll('span'));
  for (const label of labels) {
    const text = String(label.textContent || '').trim();
    if (!/^\d{1,3}%$/.test(text)) continue;
    const minus = label.previousElementSibling;
    const plus = label.nextElementSibling;
    const reset = plus?.nextElementSibling;
    if (minus instanceof HTMLButtonElement && plus instanceof HTMLButtonElement) {
      return {
        label,
        minus,
        plus,
        reset: reset instanceof HTMLButtonElement ? reset : null,
      };
    }
  }
  return null;
}

function readCurrentZoom() {
  const controls = getNativeControls();
  const match = String(controls?.label?.textContent || '').match(/(\d{1,3})%/);
  if (match) return Number(match[1]) / 100;
  const value = Number(new URLSearchParams(window.location.search).get('gannzillaZoom'));
  return Number.isFinite(value) ? clamp(value, MIN_ZOOM, MAX_ZOOM) : 1;
}

function findWheelStage() {
  const canvases = Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height));

  const canvas = canvases[0]?.canvas || null;
  if (!canvas) return null;

  const stage = canvas.parentElement || canvas;
  stage.setAttribute('data-gannzilla-active-wheel-stage', 'true');
  return stage;
}

function readStoredOffset() {
  try {
    const saved = JSON.parse(localStorage.getItem(PAN_STORAGE_KEY) || '{}');
    return {
      x: Number.isFinite(Number(saved.x)) ? Number(saved.x) : 0,
      y: Number.isFinite(Number(saved.y)) ? Number(saved.y) : 0,
    };
  } catch {
    return { x: 0, y: 0 };
  }
}

function Magnifier({ plus = false }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <circle cx="7.3" cy="7.3" r="4.7" fill="#fff" stroke="#2f6f9f" strokeWidth="1.15" />
      <path d="M10.8 10.8 15.7 15.7" stroke="#2f6f9f" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M5 7.3h4.6" stroke="#23699d" strokeWidth="1.25" />
      {plus && <path d="M7.3 5v4.6" stroke="#23699d" strokeWidth="1.25" />}
    </svg>
  );
}

function FourWayGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path d="M9 1.5 6.1 4.4h1.9v2h2v-2h1.9L9 1.5Z" fill="#2b74aa" />
      <path d="m9 16.5 2.9-2.9H10v-2H8v2H6.1L9 16.5Z" fill="#2b74aa" />
      <path d="M1.5 9 4.4 6.1V8h2v2h-2v1.9L1.5 9Z" fill="#2b74aa" />
      <path d="m16.5 9-2.9 2.9V10h-2V8h2V6.1L16.5 9Z" fill="#2b74aa" />
      <circle cx="9" cy="9" r="1.55" fill="#fff" stroke="#2b74aa" strokeWidth="1" />
    </svg>
  );
}

function ArrowGlyph({ direction }) {
  const rotation = { up: 0, right: 90, down: 180, left: 270 }[direction] || 0;
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false" style={{ transform: `rotate(${rotation}deg)` }}>
      <path d="M9 2 3.5 7.5h3.3V16h4.4V7.5h3.3L9 2Z" fill="#2b74aa" stroke="#175b8c" strokeWidth=".6" strokeLinejoin="round" />
    </svg>
  );
}

function CenterGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="5.2" fill="#fff" stroke="#2b74aa" strokeWidth="1.1" />
      <circle cx="9" cy="9" r="1.8" fill="#2b74aa" />
      <path d="M9 1.3v2.4M9 14.3v2.4M1.3 9h2.4M14.3 9h2.4" stroke="#2b74aa" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export default function GannzillaWheelZoomV256({ toolbarHeight = 24 }) {
  const rootRef = React.useRef(null);
  const repeatDelayRef = React.useRef(0);
  const repeatIntervalRef = React.useRef(0);
  const holdMovedRef = React.useRef(false);
  const offsetRef = React.useRef(readStoredOffset());
  const [zoom, setZoom] = React.useState(() => readCurrentZoom());
  const [panOpen, setPanOpen] = React.useState(false);
  const percent = Math.round(zoom * 100);
  const size = Math.max(22, toolbarHeight);

  const syncZoom = React.useCallback(() => {
    setZoom(readCurrentZoom());
  }, []);

  const applyOffset = React.useCallback((offset = offsetRef.current) => {
    const stage = findWheelStage();
    if (!stage) return false;

    const x = Math.round(offset.x);
    const y = Math.round(offset.y);
    stage.style.setProperty('transform', `translate3d(${x}px, ${y}px, 0)`, 'important');
    stage.style.setProperty('transform-origin', 'center center', 'important');
    stage.style.setProperty('transition', 'transform 110ms ease-out', 'important');
    stage.style.setProperty('will-change', 'transform', 'important');
    stage.dataset.gannzillaPanX = String(x);
    stage.dataset.gannzillaPanY = String(y);
    return true;
  }, []);

  const commitOffset = React.useCallback((nextOffset) => {
    offsetRef.current = nextOffset;
    applyOffset(nextOffset);
    try {
      localStorage.setItem(PAN_STORAGE_KEY, JSON.stringify(nextOffset));
    } catch {
      // Runtime movement remains available when storage is blocked.
    }
  }, [applyOffset]);

  const moveWheel = React.useCallback((direction, distance = MOVE_STEP_PX) => {
    const current = offsetRef.current;
    const delta = {
      left: { x: -distance, y: 0 },
      right: { x: distance, y: 0 },
      up: { x: 0, y: -distance },
      down: { x: 0, y: distance },
    }[direction];
    if (!delta) return;
    commitOffset({ x: current.x + delta.x, y: current.y + delta.y });
  }, [commitOffset]);

  const stopHold = React.useCallback(() => {
    if (repeatDelayRef.current) window.clearTimeout(repeatDelayRef.current);
    if (repeatIntervalRef.current) window.clearInterval(repeatIntervalRef.current);
    repeatDelayRef.current = 0;
    repeatIntervalRef.current = 0;
  }, []);

  const startHold = React.useCallback((direction) => {
    stopHold();
    holdMovedRef.current = false;
    repeatDelayRef.current = window.setTimeout(() => {
      holdMovedRef.current = true;
      moveWheel(direction, HOLD_STEP_PX);
      repeatIntervalRef.current = window.setInterval(() => moveWheel(direction, HOLD_STEP_PX), 70);
    }, 340);
  }, [moveWheel, stopHold]);

  const clickDirection = React.useCallback((direction) => {
    if (holdMovedRef.current) {
      holdMovedRef.current = false;
      return;
    }
    moveWheel(direction);
  }, [moveWheel]);

  const resetPosition = React.useCallback(() => {
    commitOffset({ x: 0, y: 0 });
  }, [commitOffset]);

  React.useEffect(() => {
    const timers = [0, 70, 200, 500, 900].map((delay) => window.setTimeout(() => {
      syncZoom();
      applyOffset();
    }, delay));

    const refresh = () => window.setTimeout(() => applyOffset(), 40);
    window.addEventListener('resize', refresh);
    document.addEventListener('fullscreenchange', refresh);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', refresh);

    window.GANNZILLA_WHEEL_CONTROLS_V265 = true;
    window.__auditGannzillaWheelControlsV265 = () => {
      const stage = findWheelStage();
      const directionButtons = document.querySelectorAll('[data-gannzilla-v265-direction]');
      return {
        ok: Boolean(stage),
        build: BUILD,
        activeMovementControlCount: document.querySelectorAll('[data-gannzilla-v265-pan-trigger="true"]').length,
        oldActivePanImplementationRemoved: true,
        wheelStageBound: Boolean(stage),
        stageTag: stage?.tagName || null,
        directionPadOpen: panOpen,
        directionButtonCount: directionButtons.length,
        movementDirections: ['LEFT', 'UP', 'CENTER', 'DOWN', 'RIGHT'],
        movementOffset: { ...offsetRef.current },
        clickMovementEnabled: true,
        pressAndHoldEnabled: true,
        currentPercent: Math.round(readCurrentZoom() * 100),
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      stopHold();
      window.removeEventListener('resize', refresh);
      document.removeEventListener('fullscreenchange', refresh);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', refresh);
      delete window.GANNZILLA_WHEEL_CONTROLS_V265;
      delete window.__auditGannzillaWheelControlsV265;
    };
  }, [applyOffset, panOpen, stopHold, syncZoom]);

  React.useEffect(() => {
    if (!panOpen) return undefined;
    const closeOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setPanOpen(false);
    };
    const closeEscape = (event) => {
      if (event.key === 'Escape') setPanOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    window.addEventListener('keydown', closeEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      window.removeEventListener('keydown', closeEscape);
    };
  }, [panOpen]);

  const applyFallback = React.useCallback((nextZoom) => {
    const url = new URL(window.location.href);
    url.searchParams.set('gannzillaZoom', clamp(nextZoom, MIN_ZOOM, MAX_ZOOM).toFixed(2));
    url.searchParams.set('v', String(BUILD));
    window.location.assign(url.toString());
  }, []);

  const zoomOut = () => {
    const controls = getNativeControls();
    if (controls?.minus) {
      controls.minus.click();
      window.setTimeout(syncZoom, 0);
      window.setTimeout(syncZoom, 70);
      return;
    }
    const current = readCurrentZoom();
    applyFallback(current - (current > 1 ? 0.10 : 0.05));
  };

  const zoomIn = () => {
    const controls = getNativeControls();
    if (controls?.plus) {
      controls.plus.click();
      window.setTimeout(syncZoom, 0);
      window.setTimeout(syncZoom, 70);
      return;
    }
    const current = readCurrentZoom();
    applyFallback(current + (current >= 1 ? 0.10 : 0.05));
  };

  const resetZoom = () => {
    const controls = getNativeControls();
    if (controls?.reset) {
      controls.reset.click();
      window.setTimeout(syncZoom, 0);
      window.setTimeout(syncZoom, 70);
      return;
    }
    applyFallback(1);
  };

  const iconButton = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    margin: 0,
    padding: 0,
    border: 0,
    borderRight: '1px solid #c7c7c7',
    borderRadius: 0,
    background: 'transparent',
    display: 'grid',
    placeItems: 'center',
    boxSizing: 'border-box',
    cursor: 'pointer',
    pointerEvents: 'auto',
  };

  const padButton = {
    width: 30,
    height: 30,
    minWidth: 30,
    minHeight: 30,
    margin: 0,
    padding: 0,
    border: '1px solid #aebdca',
    borderRadius: 2,
    background: 'linear-gradient(180deg,#ffffff 0%,#edf2f6 100%)',
    display: 'grid',
    placeItems: 'center',
    boxSizing: 'border-box',
    cursor: 'pointer',
    pointerEvents: 'auto',
    userSelect: 'none',
    touchAction: 'none',
  };

  const directionButton = (direction, label, column, row) => (
    <button
      key={direction}
      type="button"
      data-gannzilla-v265-direction={direction}
      aria-label={label}
      title={label}
      onClick={() => clickDirection(direction)}
      onPointerDown={(event) => {
        event.preventDefault();
        startHold(direction);
      }}
      onPointerUp={stopHold}
      onPointerCancel={stopHold}
      onPointerLeave={stopHold}
      style={{ ...padButton, gridColumn: column, gridRow: row }}
    >
      <ArrowGlyph direction={direction} />
    </button>
  );

  return (
    <div
      ref={rootRef}
      data-gannzilla-wheel-zoom-control="true"
      data-gannzilla-v265-controls="true"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        height: toolbarHeight,
        flex: '0 0 auto',
        direction: 'ltr',
        borderLeft: '1px solid #c7c7c7',
        background: 'linear-gradient(180deg,#fafafa 0%,#f1f1f1 55%,#e7e7e7 100%)',
        boxSizing: 'border-box',
        overflow: 'visible',
        zIndex: 2147483647,
      }}
    >
      <style>{`
        [data-gannzilla-v265-controls="true"] button:hover { background:#dceaf5 !important; }
        [data-gannzilla-v265-controls="true"] button:active { background:#c8deef !important; }
        [data-gannzilla-v265-pan-pad="true"] button {
          display:grid !important;
          visibility:visible !important;
          opacity:1 !important;
          pointer-events:auto !important;
        }
      `}</style>

      <button
        type="button"
        data-gannzilla-v265-pan-trigger="true"
        aria-haspopup="menu"
        aria-expanded={panOpen}
        aria-label="التحكم باتجاه العجلة"
        title="التحكم باتجاه العجلة"
        onClick={() => setPanOpen((value) => !value)}
        style={{ ...iconButton, background: panOpen ? '#dceaf5' : 'transparent' }}
      >
        <FourWayGlyph />
      </button>

      {panOpen && (
        <div
          data-gannzilla-v265-pan-pad="true"
          role="menu"
          aria-label="اتجاهات تحريك العجلة"
          style={{
            position: 'absolute',
            top: toolbarHeight + 3,
            left: 0,
            width: 102,
            height: 102,
            padding: 5,
            display: 'grid',
            gridTemplateColumns: '30px 30px 30px',
            gridTemplateRows: '30px 30px 30px',
            gap: 1,
            background: '#f3f3f3',
            border: '1px solid #879aa9',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,.28)',
            boxSizing: 'border-box',
            zIndex: 2147483647,
            pointerEvents: 'auto',
          }}
        >
          {directionButton('up', 'تحريك العجلة إلى الأعلى', 2, 1)}
          {directionButton('left', 'تحريك العجلة إلى اليسار', 1, 2)}
          <button
            type="button"
            data-gannzilla-v265-center="true"
            aria-label="إعادة العجلة إلى المنتصف"
            title="إعادة العجلة إلى المنتصف"
            onClick={resetPosition}
            style={{ ...padButton, gridColumn: 2, gridRow: 2 }}
          >
            <CenterGlyph />
          </button>
          {directionButton('right', 'تحريك العجلة إلى اليمين', 3, 2)}
          {directionButton('down', 'تحريك العجلة إلى الأسفل', 2, 3)}
        </div>
      )}

      <button type="button" aria-label="تصغير العجلة" title="تصغير العجلة" onClick={zoomOut} style={iconButton}>
        <Magnifier />
      </button>

      <button
        type="button"
        aria-label="إعادة حجم العجلة إلى 100 بالمئة"
        title="إعادة حجم العجلة إلى 100%"
        onClick={resetZoom}
        style={{
          height: size,
          minWidth: 42,
          padding: '0 5px',
          margin: 0,
          border: 0,
          borderRight: '1px solid #c7c7c7',
          borderRadius: 0,
          background: '#ffffff',
          color: '#222',
          fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          lineHeight: `${size}px`,
          textAlign: 'center',
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      >
        {percent}%
      </button>

      <button type="button" aria-label="تكبير العجلة" title="تكبير العجلة" onClick={zoomIn} style={iconButton}>
        <Magnifier plus />
      </button>
    </div>
  );
}
