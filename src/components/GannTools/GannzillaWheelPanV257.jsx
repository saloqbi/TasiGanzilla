import React from 'react';

const BUILD = 257;
const MOVE_STEP_PX = 48;
const REPEAT_STEP_PX = 14;
const STORAGE_KEY = 'gannzilla-wheel-pan-v257';

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

function ArrowGlyph({ direction }) {
  const rotations = { up: 0, right: 90, down: 180, left: 270 };
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false" style={{ transform: `rotate(${rotations[direction]}deg)` }}>
      <path d="M8 2.2 3.1 7.1h3.1v6.7h3.6V7.1h3.1L8 2.2Z" fill="#2d73a8" stroke="#1d5f91" strokeWidth="0.55" strokeLinejoin="round" />
    </svg>
  );
}

function CenterGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="5.2" fill="#ffffff" stroke="#2d73a8" strokeWidth="1.1" />
      <circle cx="8" cy="8" r="1.8" fill="#2d73a8" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="#2d73a8" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export default function GannzillaWheelPanV257({ toolbarHeight = 24 }) {
  const initial = React.useMemo(readStoredOffset, []);
  const [offset, setOffset] = React.useState(initial);
  const offsetRef = React.useRef(initial);
  const repeatDelayRef = React.useRef(0);
  const repeatIntervalRef = React.useRef(0);
  const size = Math.max(22, toolbarHeight);

  const applyOffset = React.useCallback((nextOffset = offsetRef.current) => {
    const canvas = findWheelCanvas();
    if (!canvas) return false;
    canvas.style.transform = `translate3d(${Math.round(nextOffset.x)}px, ${Math.round(nextOffset.y)}px, 0)`;
    canvas.style.transformOrigin = 'center center';
    canvas.style.willChange = 'transform';
    canvas.style.transition = 'transform 110ms ease-out';
    canvas.dataset.gannzillaPanX = String(Math.round(nextOffset.x));
    canvas.dataset.gannzillaPanY = String(Math.round(nextOffset.y));
    return true;
  }, []);

  const commitOffset = React.useCallback((nextOffset) => {
    offsetRef.current = nextOffset;
    setOffset(nextOffset);
    applyOffset(nextOffset);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextOffset));
    } catch {
      // Browser storage is optional; runtime movement remains authoritative.
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
      repeatIntervalRef.current = window.setInterval(() => move(direction, REPEAT_STEP_PX), 55);
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

    window.GANNZILLA_WHEEL_PAN_V257 = true;
    window.__auditGannzillaWheelPanV257 = () => ({
      ok: Boolean(findWheelCanvas()),
      build: BUILD,
      mounted: true,
      directions: ['LEFT', 'UP', 'CENTER', 'DOWN', 'RIGHT'],
      offset: { ...offsetRef.current },
      clickStepPx: MOVE_STEP_PX,
      pressAndHoldEnabled: true,
      persistentPosition: true,
      canvasTransformOnly: true,
      wheelGeometryUnchanged: true,
      toolbarHeightPx: toolbarHeight,
    });

    return () => {
      timers.forEach(window.clearTimeout);
      stopRepeat();
      window.removeEventListener('resize', reapply);
      document.removeEventListener('fullscreenchange', reapply);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', reapply);
      delete window.GANNZILLA_WHEEL_PAN_V257;
      delete window.__auditGannzillaWheelPanV257;
    };
  }, [applyOffset, stopRepeat, toolbarHeight]);

  const buttonStyle = {
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
    userSelect: 'none',
    touchAction: 'none',
    pointerEvents: 'auto',
  };

  const directionButton = (direction, label) => (
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
      style={buttonStyle}
    >
      <ArrowGlyph direction={direction} />
    </button>
  );

  return (
    <div
      data-gannzilla-wheel-pan-control="true"
      role="group"
      aria-label="التحكم في موضع العجلة"
      style={{
        height: toolbarHeight,
        display: 'flex',
        alignItems: 'stretch',
        flex: '0 0 auto',
        direction: 'ltr',
        margin: 0,
        padding: 0,
        borderLeft: '1px solid #c7c7c7',
        background: 'linear-gradient(180deg,#fafafa 0%,#f1f1f1 55%,#e7e7e7 100%)',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        [data-gannzilla-wheel-pan-control="true"] button:hover { background:#dceaf5 !important; }
        [data-gannzilla-wheel-pan-control="true"] button:active { background:#c8deef !important; }
      `}</style>

      {directionButton('left', 'تحريك العجلة إلى اليسار')}
      {directionButton('up', 'تحريك العجلة إلى الأعلى')}
      <button type="button" aria-label="إعادة العجلة إلى المنتصف" title="إعادة العجلة إلى المنتصف" onClick={resetCenter} style={buttonStyle}>
        <CenterGlyph />
      </button>
      {directionButton('down', 'تحريك العجلة إلى الأسفل')}
      {directionButton('right', 'تحريك العجلة إلى اليمين')}
    </div>
  );
}
