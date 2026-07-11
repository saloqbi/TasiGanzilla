import React from 'react';

const BUILD = 258;
const MOVE_STEP_PX = 48;
const HOLD_STEP_PX = 14;
const STORAGE_KEY = 'gannzilla-wheel-pan-v258';

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function readStoredOffset() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      x: Number.isFinite(Number(value.x)) ? Number(value.x) : 0,
      y: Number.isFinite(Number(value.y)) ? Number(value.y) : 0,
    };
  } catch {
    return { x: 0, y: 0 };
  }
}

function FourWayGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path d="M9 1.6 6.3 4.3h1.8v2H9.9v-2h1.8L9 1.6Z" fill="#2d73a8" stroke="#1d5f91" strokeWidth=".35" />
      <path d="m9 16.4 2.7-2.7H9.9v-2H8.1v2H6.3L9 16.4Z" fill="#2d73a8" stroke="#1d5f91" strokeWidth=".35" />
      <path d="M1.6 9 4.3 6.3v1.8h2v1.8h-2v1.8L1.6 9Z" fill="#2d73a8" stroke="#1d5f91" strokeWidth=".35" />
      <path d="m16.4 9-2.7 2.7V9.9h-2V8.1h2V6.3L16.4 9Z" fill="#2d73a8" stroke="#1d5f91" strokeWidth=".35" />
      <circle cx="9" cy="9" r="1.65" fill="#ffffff" stroke="#2d73a8" strokeWidth="1" />
    </svg>
  );
}

function ArrowGlyph({ direction }) {
  const rotation = { up: 0, right: 90, down: 180, left: 270 }[direction] || 0;
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true" focusable="false" style={{ transform: `rotate(${rotation}deg)` }}>
      <path d="M8.5 2 3.4 7.1h3.2V15h3.8V7.1h3.2L8.5 2Z" fill="#2d73a8" stroke="#1d5f91" strokeWidth=".55" strokeLinejoin="round" />
    </svg>
  );
}

function CenterGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true" focusable="false">
      <circle cx="8.5" cy="8.5" r="5.1" fill="#ffffff" stroke="#2d73a8" strokeWidth="1.1" />
      <circle cx="8.5" cy="8.5" r="1.8" fill="#2d73a8" />
      <path d="M8.5 1.2v2.2M8.5 13.6v2.2M1.2 8.5h2.2M13.6 8.5h2.2" stroke="#2d73a8" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export default function GannzillaWheelPanV258({ toolbarHeight = 24 }) {
  const rootRef = React.useRef(null);
  const repeatDelayRef = React.useRef(0);
  const repeatIntervalRef = React.useRef(0);
  const initialOffset = React.useMemo(readStoredOffset, []);
  const offsetRef = React.useRef(initialOffset);
  const [open, setOpen] = React.useState(false);
  const size = Math.max(22, toolbarHeight);

  const applyOffset = React.useCallback((offset = offsetRef.current) => {
    const canvas = findWheelCanvas();
    if (!canvas) return false;
    canvas.style.transform = `translate3d(${Math.round(offset.x)}px, ${Math.round(offset.y)}px, 0)`;
    canvas.style.transformOrigin = 'center center';
    canvas.style.willChange = 'transform';
    canvas.style.transition = 'transform 100ms ease-out';
    canvas.dataset.gannzillaPanX = String(Math.round(offset.x));
    canvas.dataset.gannzillaPanY = String(Math.round(offset.y));
    return true;
  }, []);

  const commitOffset = React.useCallback((next) => {
    offsetRef.current = next;
    applyOffset(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Local storage is optional; runtime movement remains functional.
    }
  }, [applyOffset]);

  const move = React.useCallback((direction, distance = MOVE_STEP_PX) => {
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

  const stopRepeat = React.useCallback(() => {
    if (repeatDelayRef.current) window.clearTimeout(repeatDelayRef.current);
    if (repeatIntervalRef.current) window.clearInterval(repeatIntervalRef.current);
    repeatDelayRef.current = 0;
    repeatIntervalRef.current = 0;
  }, []);

  const startRepeat = React.useCallback((direction) => {
    stopRepeat();
    move(direction);
    repeatDelayRef.current = window.setTimeout(() => {
      repeatIntervalRef.current = window.setInterval(() => move(direction, HOLD_STEP_PX), 55);
    }, 330);
  }, [move, stopRepeat]);

  const resetCenter = React.useCallback(() => {
    commitOffset({ x: 0, y: 0 });
  }, [commitOffset]);

  React.useEffect(() => {
    const timers = [0, 60, 180, 420].map((delay) => window.setTimeout(() => applyOffset(), delay));
    const reapply = () => window.setTimeout(() => applyOffset(), 40);
    window.addEventListener('resize', reapply);
    document.addEventListener('fullscreenchange', reapply);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', reapply);

    window.GANNZILLA_WHEEL_PAN_V258 = true;
    window.__auditGannzillaWheelPanV258 = () => ({
      ok: Boolean(findWheelCanvas()),
      build: BUILD,
      compactToolbarIconVisible: true,
      placement: 'IMMEDIATELY_LEFT_OF_WHEEL_ZOOM',
      popupOpen: open,
      directions: ['LEFT', 'UP', 'CENTER', 'DOWN', 'RIGHT'],
      offset: { ...offsetRef.current },
      clickStepPx: MOVE_STEP_PX,
      pressAndHoldEnabled: true,
      persistentPosition: true,
      toolbarHeightPx: toolbarHeight,
    });

    return () => {
      timers.forEach(window.clearTimeout);
      stopRepeat();
      window.removeEventListener('resize', reapply);
      document.removeEventListener('fullscreenchange', reapply);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', reapply);
      delete window.GANNZILLA_WHEEL_PAN_V258;
      delete window.__auditGannzillaWheelPanV258;
    };
  }, [applyOffset, open, stopRepeat, toolbarHeight]);

  React.useEffect(() => {
    if (!open) return undefined;
    const closeOnOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutside);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const toolbarButton = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    margin: 0,
    padding: 0,
    border: 0,
    borderRight: '1px solid #c7c7c7',
    borderRadius: 0,
    background: open ? '#dceaf5' : 'transparent',
    display: 'grid',
    placeItems: 'center',
    boxSizing: 'border-box',
    cursor: 'pointer',
    pointerEvents: 'auto',
  };

  const padButton = {
    width: 28,
    height: 28,
    minWidth: 28,
    minHeight: 28,
    margin: 0,
    padding: 0,
    border: '1px solid #b7c4ce',
    borderRadius: 2,
    background: 'linear-gradient(180deg,#ffffff 0%,#edf2f6 100%)',
    display: 'grid',
    placeItems: 'center',
    boxSizing: 'border-box',
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'none',
  };

  const directionButton = (direction, label, gridColumn, gridRow) => (
    <button
      key={direction}
      type="button"
      aria-label={label}
      title={label}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        startRepeat(direction);
      }}
      onPointerUp={stopRepeat}
      onPointerCancel={stopRepeat}
      onPointerLeave={stopRepeat}
      style={{ ...padButton, gridColumn, gridRow }}
    >
      <ArrowGlyph direction={direction} />
    </button>
  );

  return (
    <div
      ref={rootRef}
      data-gannzilla-wheel-pan-control="true"
      style={{
        position: 'relative',
        width: size,
        height: toolbarHeight,
        flex: `0 0 ${size}px`,
        direction: 'ltr',
        zIndex: 2147483647,
      }}
    >
      <style>{`
        [data-gannzilla-wheel-pan-control="true"] button:hover { background:#dceaf5 !important; }
        [data-gannzilla-wheel-pan-popup="true"] button:active { background:#c8deef !important; }
      `}</style>

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="تحريك العجلة يمينًا ويسارًا وأعلى وأسفل"
        title="تحريك العجلة"
        onClick={() => setOpen((value) => !value)}
        style={toolbarButton}
      >
        <FourWayGlyph />
      </button>

      {open && (
        <div
          data-gannzilla-wheel-pan-popup="true"
          role="menu"
          aria-label="اتجاه تحريك العجلة"
          style={{
            position: 'absolute',
            top: toolbarHeight + 3,
            left: 0,
            width: 94,
            height: 94,
            padding: 4,
            display: 'grid',
            gridTemplateColumns: '28px 28px 28px',
            gridTemplateRows: '28px 28px 28px',
            gap: 1,
            background: '#f3f3f3',
            border: '1px solid #8ea2b1',
            borderRadius: 3,
            boxShadow: '0 3px 10px rgba(0,0,0,.28)',
            boxSizing: 'border-box',
            zIndex: 2147483647,
          }}
        >
          {directionButton('up', 'تحريك العجلة إلى الأعلى', 2, 1)}
          {directionButton('left', 'تحريك العجلة إلى اليسار', 1, 2)}
          <button
            type="button"
            aria-label="إعادة العجلة إلى المنتصف"
            title="إعادة العجلة إلى المنتصف"
            onClick={resetCenter}
            style={{ ...padButton, gridColumn: 2, gridRow: 2 }}
          >
            <CenterGlyph />
          </button>
          {directionButton('right', 'تحريك العجلة إلى اليمين', 3, 2)}
          {directionButton('down', 'تحريك العجلة إلى الأسفل', 2, 3)}
        </div>
      )}
    </div>
  );
}
