import React from 'react';

const BUILD = 264;
const MIN_ZOOM = 0.10;
const MAX_ZOOM = 3.00;
const MOVE_STEP_PX = 48;
const HOLD_STEP_PX = 14;
const PAN_STORAGE_KEY = 'gannzilla-wheel-pan-v264';

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

function findWheelTarget() {
  const selectors = ['canvas', 'svg'];
  for (const selector of selectors) {
    const target = Array.from(document.querySelectorAll(selector))
      .map((node) => ({ node, rect: node.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 250 && rect.height > 250)
      .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.node;
    if (target) return target;
  }
  return null;
}

function readStoredOffset() {
  try {
    const value = JSON.parse(localStorage.getItem(PAN_STORAGE_KEY) || '{}');
    return {
      x: Number.isFinite(Number(value.x)) ? Number(value.x) : 0,
      y: Number.isFinite(Number(value.y)) ? Number(value.y) : 0,
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
      <path d="M9 1.6 6.3 4.3h1.8v2h1.8v-2h1.8L9 1.6Z" fill="#2d73a8" stroke="#1d5f91" strokeWidth=".35" />
      <path d="m9 16.4 2.7-2.7H9.9v-2H8.1v2H6.3L9 16.4Z" fill="#2d73a8" stroke="#1d5f91" strokeWidth=".35" />
      <path d="M1.6 9 4.3 6.3v1.8h2v1.8h-2v1.8L1.6 9Z" fill="#2d73a8" stroke="#1d5f91" strokeWidth=".35" />
      <path d="m16.4 9-2.7 2.7V9.9h-2V8.1h2V6.3L16.4 9Z" fill="#2d73a8" stroke="#1d5f91" strokeWidth=".35" />
      <circle cx="9" cy="9" r="1.65" fill="#fff" stroke="#2d73a8" strokeWidth="1" />
    </svg>
  );
}

function ArrowGlyph({ direction }) {
  const rotation = { up: 0, right: 90, down: 180, left: 270 }[direction] || 0;
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      aria-hidden="true"
      focusable="false"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path
        d="M8.5 2 3.4 7.1h3.2V15h3.8V7.1h3.2L8.5 2Z"
        fill="#2d73a8"
        stroke="#1d5f91"
        strokeWidth=".55"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CenterGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true" focusable="false">
      <circle cx="8.5" cy="8.5" r="5.1" fill="#fff" stroke="#2d73a8" strokeWidth="1.1" />
      <circle cx="8.5" cy="8.5" r="1.8" fill="#2d73a8" />
      <path d="M8.5 1.2v2.2M8.5 13.6v2.2M1.2 8.5h2.2M13.6 8.5h2.2" stroke="#2d73a8" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export default function GannzillaWheelZoomV256({ toolbarHeight = 24 }) {
  const rootRef = React.useRef(null);
  const repeatDelayRef = React.useRef(0);
  const repeatIntervalRef = React.useRef(0);
  const holdActivatedRef = React.useRef(false);
  const initialOffset = React.useMemo(readStoredOffset, []);
  const offsetRef = React.useRef(initialOffset);
  const [zoom, setZoom] = React.useState(() => readCurrentZoom());
  const [panOpen, setPanOpen] = React.useState(false);
  const percent = Math.round(zoom * 100);
  const size = Math.max(22, toolbarHeight);

  const syncZoom = React.useCallback(() => {
    setZoom(readCurrentZoom());
  }, []);

  const applyOffset = React.useCallback((offset = offsetRef.current) => {
    const target = findWheelTarget();
    if (!target) return false;

    const x = Math.round(offset.x);
    const y = Math.round(offset.y);
    target.style.setProperty('translate', `${x}px ${y}px`);
    target.style.setProperty('will-change', 'translate');
    target.style.setProperty('transition', 'translate 100ms ease-out');
    target.dataset.gannzillaPanX = String(x);
    target.dataset.gannzillaPanY = String(y);
    return true;
  }, []);

  const commitOffset = React.useCallback((nextOffset) => {
    offsetRef.current = nextOffset;
    applyOffset(nextOffset);
    try {
      localStorage.setItem(PAN_STORAGE_KEY, JSON.stringify(nextOffset));
    } catch {
      // Storage is optional. Runtime movement remains functional.
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

  const stopRepeat = React.useCallback(() => {
    if (repeatDelayRef.current) window.clearTimeout(repeatDelayRef.current);
    if (repeatIntervalRef.current) window.clearInterval(repeatIntervalRef.current);
    repeatDelayRef.current = 0;
    repeatIntervalRef.current = 0;
  }, []);

  const beginHold = React.useCallback((direction) => {
    stopRepeat();
    holdActivatedRef.current = false;
    repeatDelayRef.current = window.setTimeout(() => {
      holdActivatedRef.current = true;
      moveWheel(direction, HOLD_STEP_PX);
      repeatIntervalRef.current = window.setInterval(() => moveWheel(direction, HOLD_STEP_PX), 65);
    }, 360);
  }, [moveWheel, stopRepeat]);

  const finishHold = React.useCallback(() => {
    stopRepeat();
  }, [stopRepeat]);

  const handleDirectionClick = React.useCallback((direction) => {
    if (holdActivatedRef.current) {
      holdActivatedRef.current = false;
      return;
    }
    moveWheel(direction);
  }, [moveWheel]);

  const resetWheelPosition = React.useCallback(() => {
    commitOffset({ x: 0, y: 0 });
  }, [commitOffset]);

  React.useEffect(() => {
    const zoomTimers = [0, 50, 150, 350, 700].map((delay) => window.setTimeout(syncZoom, delay));
    const panTimers = [0, 60, 180, 420].map((delay) => window.setTimeout(() => applyOffset(), delay));
    const reapply = () => window.setTimeout(() => applyOffset(), 40);

    window.addEventListener('resize', reapply);
    document.addEventListener('fullscreenchange', reapply);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', reapply);

    window.GANNZILLA_WHEEL_ZOOM_V264 = true;
    window.GANNZILLA_WHEEL_PAN_V264 = true;
    window.__auditGannzillaWheelControlsV264 = () => ({
      ok: Boolean(findWheelTarget()),
      build: BUILD,
      zoomVisible: true,
      movementTriggerVisible: true,
      directionPadOpen: panOpen,
      directionButtonCount: document.querySelectorAll('[data-gannzilla-pan-direction]').length,
      movementIconPlacement: 'INSIDE_ZOOM_CONTROL_IMMEDIATELY_LEFT_OF_MINUS',
      movementDirections: ['LEFT', 'UP', 'CENTER', 'DOWN', 'RIGHT'],
      movementOffset: { ...offsetRef.current },
      clickMovementEnabled: true,
      pressAndHoldEnabled: true,
      currentPercent: Math.round(readCurrentZoom() * 100),
      minPercent: MIN_ZOOM * 100,
      maxPercent: MAX_ZOOM * 100,
      toolbarHeightPx: toolbarHeight,
    });

    return () => {
      zoomTimers.forEach(window.clearTimeout);
      panTimers.forEach(window.clearTimeout);
      stopRepeat();
      window.removeEventListener('resize', reapply);
      document.removeEventListener('fullscreenchange', reapply);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', reapply);
      delete window.GANNZILLA_WHEEL_ZOOM_V264;
      delete window.GANNZILLA_WHEEL_PAN_V264;
      delete window.__auditGannzillaWheelControlsV264;
    };
  }, [applyOffset, panOpen, stopRepeat, syncZoom, toolbarHeight]);

  React.useEffect(() => {
    if (!panOpen) return undefined;
    const closeOnOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setPanOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setPanOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutside);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      window.removeEventListener('keydown', closeOnEscape);
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
      window.setTimeout(() => { syncZoom(); applyOffset(); }, 60);
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
      window.setTimeout(() => { syncZoom(); applyOffset(); }, 60);
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
      window.setTimeout(() => { syncZoom(); applyOffset(); }, 60);
      return;
    }
    applyFallback(1);
  };

  const iconButton = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    padding: 0,
    margin: 0,
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
    visibility: 'visible',
    pointerEvents: 'auto',
  };

  const directionButton = (direction, label, gridColumn, gridRow) => (
    <button
      key={direction}
      type="button"
      data-gannzilla-pan-direction={direction}
      aria-label={label}
      title={label}
      onClick={() => handleDirectionClick(direction)}
      onPointerDown={(event) => {
        event.preventDefault();
        beginHold(direction);
      }}
      onPointerUp={finishHold}
      onPointerCancel={finishHold}
      onPointerLeave={finishHold}
      style={{ ...padButton, gridColumn, gridRow }}
    >
      <ArrowGlyph direction={direction} />
    </button>
  );

  return (
    <div
      ref={rootRef}
      data-gannzilla-wheel-zoom-control="true"
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
        [data-gannzilla-wheel-zoom-control="true"] button:hover { background:#dceaf5 !important; }
        [data-gannzilla-wheel-zoom-control="true"] button:active { background:#c8deef !important; }
        [data-gannzilla-direction-pad="true"] [data-gannzilla-pan-direction] {
          display:grid !important;
          visibility:visible !important;
          pointer-events:auto !important;
          width:28px !important;
          min-width:28px !important;
          max-width:28px !important;
          height:28px !important;
          min-height:28px !important;
          max-height:28px !important;
          opacity:1 !important;
        }
      `}</style>

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={panOpen}
        aria-label="أداة اتجاهات العجلة"
        title="اتجاهات العجلة"
        onClick={() => setPanOpen((value) => !value)}
        style={{ ...iconButton, background: panOpen ? '#dceaf5' : 'transparent' }}
      >
        <FourWayGlyph />
      </button>

      {panOpen && (
        <div
          data-gannzilla-direction-pad="true"
          role="menu"
          aria-label="اتجاهات العجلة"
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
            pointerEvents: 'auto',
          }}
        >
          {directionButton('up', 'أعلى', 2, 1)}
          {directionButton('left', 'يسار', 1, 2)}
          <button
            type="button"
            data-gannzilla-pan-center="true"
            aria-label="توسيط"
            title="توسيط"
            onClick={resetWheelPosition}
            style={{ ...padButton, gridColumn: 2, gridRow: 2 }}
          >
            <CenterGlyph />
          </button>
          {directionButton('right', 'يمين', 3, 2)}
          {directionButton('down', 'أسفل', 2, 3)}
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
