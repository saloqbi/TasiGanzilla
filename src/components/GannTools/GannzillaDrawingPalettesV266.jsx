import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = 272;
const EVENT_NAME = 'gannzilla:drawing-tools-v266';
const STORAGE_KEY = 'gannzilla-drawing-tools-visible-v266';
const LEFT_ID = 'gannzilla-left-drawing-palette';
const RIGHT_ID = 'gannzilla-right-drawing-palette';
const OVERLAY_ID = 'gannzilla-drawing-overlay';
const ICON = '#8f999f';
const ACTIVE = '#5f83b9';
const BUTTON_SIZE = 34;
const BUTTON_GAP = 4;
const PALETTE_WIDTH = 46;
const DEFAULT_SIDE_GAP = 24;
const TOP_GAP = 6;
const MAX_BUTTON_COUNT = 13;
const PALETTE_NATURAL_HEIGHT = (MAX_BUTTON_COUNT * BUTTON_SIZE) + ((MAX_BUTTON_COUNT - 1) * BUTTON_GAP) + 14;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function numberParam(name, fallback, min, max) {
  try {
    const value = Number(new URLSearchParams(window.location.search || '').get(name));
    return Number.isFinite(value) ? clamp(value, min, max) : fallback;
  } catch {
    return fallback;
  }
}

function readVisible() {
  try {
    const query = new URLSearchParams(window.location.search || '');
    if (query.get('drawingTools') === 'true') return true;
    if (query.get('drawingTools') === 'false') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function getWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((node) => ({ node, rect: node.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0] || null;
}

function getSettingsPanelRect() {
  return Array.from(document.querySelectorAll('aside, [data-gannzilla-settings-panel="true"]'))
    .map((node) => ({ rect: node.getBoundingClientRect(), style: window.getComputedStyle(node) }))
    .filter(({ rect, style }) => (
      rect.width >= 180
      && rect.height >= 250
      && rect.left <= 12
      && style.display !== 'none'
      && style.visibility !== 'hidden'
      && style.opacity !== '0'
    ))
    .sort((a, b) => b.rect.height - a.rect.height)[0]?.rect || null;
}

function getViewportMetrics(wheelCanvas) {
  if (!wheelCanvas?.node) return { controlLineX: window.innerWidth, scrollbarWidth: 0 };

  let node = wheelCanvas.node.parentElement;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflowY = String(style.overflowY || style.overflow || '').toLowerCase();
    const overflowX = String(style.overflowX || style.overflow || '').toLowerCase();
    if (['auto', 'scroll'].includes(overflowY) || ['auto', 'scroll'].includes(overflowX)) {
      const rect = node.getBoundingClientRect();
      const scrollbarWidth = Math.max(0, node.offsetWidth - node.clientWidth);
      const controlLineX = Math.round(rect.right - scrollbarWidth);
      node.setAttribute('data-gannzilla-wheel-scroll-viewport', 'true');
      node.dataset.gannzillaVerticalControlLineX = String(controlLineX);
      return { controlLineX, scrollbarWidth };
    }
    node = node.parentElement;
  }

  return { controlLineX: window.innerWidth, scrollbarWidth: 0 };
}

function readLayout() {
  const wheelCanvas = getWheelCanvas();
  const wheel = wheelCanvas?.rect || null;
  const panel = getSettingsPanelRect();
  const viewport = getViewportMetrics(wheelCanvas);
  const toolbarHeight = Number.parseFloat(
    window.getComputedStyle(document.documentElement).getPropertyValue('--gannzilla-toolbar-height'),
  ) || 24;
  const sideGap = numberParam('drawingToolsSideGap', DEFAULT_SIDE_GAP, 12, 70);
  const top = Math.max(toolbarHeight + TOP_GAP, Math.round((wheel?.top || toolbarHeight) + TOP_GAP));
  const leftControlLineX = panel ? Math.round(panel.right) : Math.round(wheel?.left || 0);
  const rightControlLineX = Number.isFinite(viewport.controlLineX) ? viewport.controlLineX : window.innerWidth;
  const maxHeight = Math.max(180, Math.round(window.innerHeight - top - 8));
  const paletteHeight = Math.min(PALETTE_NATURAL_HEIGHT, maxHeight);

  return {
    left: leftControlLineX + sideGap,
    right: Math.max(sideGap, Math.round(window.innerWidth - rightControlLineX + sideGap)),
    sideGap,
    top,
    maxHeight,
    paletteHeight,
    leftControlLineX,
    rightControlLineX,
    scrollbarWidth: viewport.scrollbarWidth,
    wheelRect: wheel ? {
      left: wheel.left,
      top: wheel.top,
      width: wheel.width,
      height: wheel.height,
    } : null,
  };
}

function sameLayout(a, b) {
  return Boolean(
    a && b
    && a.left === b.left
    && a.right === b.right
    && a.sideGap === b.sideGap
    && a.top === b.top
    && a.maxHeight === b.maxHeight
    && a.paletteHeight === b.paletteHeight
    && a.leftControlLineX === b.leftControlLineX
    && a.rightControlLineX === b.rightControlLineX
    && a.scrollbarWidth === b.scrollbarWidth
    && JSON.stringify(a.wheelRect) === JSON.stringify(b.wheelRect)
  );
}

function point(event, rect) {
  return {
    x: clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1),
    y: clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1),
  };
}

function polygonPoints(sides, cx, cy, radius, rotation = -Math.PI / 2) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = rotation + index * Math.PI * 2 / sides;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(' ');
}

function PaletteButton({ title, active, onClick, children, round = false }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      style={{
        width: BUTTON_SIZE,
        minWidth: BUTTON_SIZE,
        height: BUTTON_SIZE,
        minHeight: BUTTON_SIZE,
        padding: 0,
        margin: 0,
        border: active ? `2px solid ${ACTIVE}` : '1px solid #c7c7c7',
        borderRadius: round ? '50%' : 2,
        background: active ? '#f3f7ff' : '#ffffff',
        color: ICON,
        display: 'grid',
        placeItems: 'center',
        boxSizing: 'border-box',
        cursor: 'pointer',
        pointerEvents: 'auto',
        userSelect: 'none',
        font: '700 13px Segoe UI, Tahoma, Arial, sans-serif',
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

function ShapeGlyph({ type }) {
  const common = {
    fill: type === 'cursor' ? '#f8fbfd' : 'none',
    stroke: ICON,
    strokeWidth: 1.5,
    strokeLinejoin: 'round',
  };
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      {type === 'cursor' && <path d="m7 4 13 9-6 1.2 3.1 7-2.5 1-3-7-4.6 4Z" {...common} />}
      {type === 'rect' && <rect x="5" y="6" width="18" height="16" rx="1" {...common} />}
      {type === 'circle' && <circle cx="14" cy="14" r="9" {...common} />}
      {type === 'triangle' && <path d="M14 4 24 22H4Z" {...common} />}
      {type === 'angle' && <path d="M5 22 22 6M5 22h17" fill="none" stroke={ICON} strokeWidth="1.6" />}
      {type === 'rings' && (
        <>
          <circle cx="14" cy="14" r="10" {...common} />
          <circle cx="14" cy="14" r="5" {...common} />
        </>
      )}
      {type.startsWith('p') && (
        <polygon
          points={polygonPoints(
            Number(type.slice(1)),
            14,
            14,
            10,
            Number(type.slice(1)) === 4 ? -Math.PI / 4 : -Math.PI / 2,
          )}
          {...common}
        />
      )}
    </svg>
  );
}

function ReferenceGlyph({ value }) {
  if (['12', '24', '36'].includes(value)) {
    return (
      <span style={{
        width: 29,
        height: 29,
        border: '1px solid #aeb4b8',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        fontSize: 10,
      }}>
        {value}
      </span>
    );
  }
  if (value === 'N') {
    return <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontSize: 19, fontWeight: 700 }}>N</span>;
  }
  if (['4', '9'].includes(value)) return <span style={{ fontSize: 12 }}>{value}°</span>;
  return <ShapeGlyph type={value} />;
}

function paletteStyle(side, layout) {
  const anchor = side === 'left' ? { left: layout.left } : { right: layout.right };
  return {
    position: 'fixed',
    ...anchor,
    top: layout.top,
    zIndex: 2147483605,
    width: PALETTE_WIDTH,
    height: layout.paletteHeight,
    minHeight: layout.paletteHeight,
    maxHeight: layout.paletteHeight,
    padding: '6px 5px',
    background: 'rgba(248,248,248,.97)',
    border: '1px solid #d5d5d5',
    borderRadius: 23,
    boxShadow: '0 1px 5px rgba(0,0,0,.14)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: BUTTON_GAP,
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarWidth: 'thin',
    pointerEvents: 'auto',
    boxSizing: 'border-box',
  };
}

function drawingNode(item, index, rect) {
  const x1 = item.start.x * rect.width;
  const y1 = item.start.y * rect.height;
  const x2 = item.end.x * rect.width;
  const y2 = item.end.y * rect.height;
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const common = { fill: 'none', stroke: '#0877c9', strokeWidth: 2, vectorEffect: 'non-scaling-stroke' };

  if (item.type === 'rect') return <rect key={index} x={left} y={top} width={width} height={height} {...common} />;
  if (item.type === 'circle') return <ellipse key={index} cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} rx={width / 2} ry={height / 2} {...common} />;
  if (item.type === 'triangle') return <polygon key={index} points={`${(x1 + x2) / 2},${top} ${left},${top + height} ${left + width},${top + height}`} {...common} />;
  if (item.type === 'angle') return <path key={index} d={`M${x1} ${y1} L${x2} ${y2} M${x1} ${y1} L${x2} ${y1}`} {...common} />;
  if (item.type === 'rings') {
    return (
      <g key={index}>
        <ellipse cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} rx={width / 2} ry={height / 2} {...common} />
        <ellipse cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} rx={width / 4} ry={height / 4} {...common} />
      </g>
    );
  }
  if (item.type.startsWith('p')) {
    return (
      <polygon
        key={index}
        points={polygonPoints(
          Number(item.type.slice(1)),
          (x1 + x2) / 2,
          (y1 + y2) / 2,
          Math.max(2, Math.min(width, height) / 2),
          Number(item.type.slice(1)) === 4 ? -Math.PI / 4 : -Math.PI / 2,
        )}
        {...common}
      />
    );
  }
  return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} {...common} />;
}

export default function GannzillaDrawingPalettesV266() {
  const [visible, setVisible] = React.useState(readVisible);
  const [activeTool, setActiveTool] = React.useState('cursor');
  const [activeReference, setActiveReference] = React.useState('36');
  const [layout, setLayout] = React.useState(readLayout);
  const [items, setItems] = React.useState([]);
  const [draft, setDraft] = React.useState(null);

  const syncLayout = React.useCallback(() => {
    const next = readLayout();
    setLayout((current) => (sameLayout(current, next) ? current : next));
  }, []);

  React.useEffect(() => {
    const onVisibility = (event) => {
      if (typeof event?.detail?.visible !== 'boolean') return;
      setVisible(event.detail.visible);
      try {
        localStorage.setItem(STORAGE_KEY, String(event.detail.visible));
      } catch {
        // Keep runtime behavior when storage is unavailable.
      }
    };
    window.addEventListener(EVENT_NAME, onVisibility);
    return () => window.removeEventListener(EVENT_NAME, onVisibility);
  }, []);

  React.useEffect(() => {
    let frame = 0;
    const scheduleSync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncLayout);
    };

    syncLayout();
    const timers = [80, 240, 600].map((delay) => window.setTimeout(scheduleSync, delay));
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(scheduleSync) : null;
    const wheelCanvas = getWheelCanvas();
    const panel = document.querySelector('aside, [data-gannzilla-settings-panel="true"]');
    if (wheelCanvas?.node) resizeObserver?.observe(wheelCanvas.node);
    if (panel) resizeObserver?.observe(panel);
    resizeObserver?.observe(document.documentElement);

    window.addEventListener('resize', scheduleSync);
    window.addEventListener('scroll', scheduleSync, true);
    document.addEventListener('fullscreenchange', scheduleSync);
    document.addEventListener('click', scheduleSync, true);

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', scheduleSync);
      window.removeEventListener('scroll', scheduleSync, true);
      document.removeEventListener('fullscreenchange', scheduleSync);
      document.removeEventListener('click', scheduleSync, true);
    };
  }, [syncLayout]);

  React.useEffect(() => {
    window.GANNZILLA_DRAWING_PALETTES_V272 = true;
    window.__auditGannzillaDrawingPalettesV272 = () => {
      const leftRect = document.getElementById(LEFT_ID)?.getBoundingClientRect?.() || null;
      const rightRect = document.getElementById(RIGHT_ID)?.getBoundingClientRect?.() || null;
      const leftGap = leftRect ? Math.round(leftRect.left - layout.leftControlLineX) : null;
      const rightGap = rightRect ? Math.round(layout.rightControlLineX - rightRect.right) : null;
      return {
        ok: Boolean(leftRect && rightRect && leftGap === rightGap),
        build: BUILD,
        visible,
        activeTool,
        activeReference,
        drawingCount: items.length,
        exactMirrorMode: true,
        singleDrawingPaletteComponent: true,
        leftPaletteMounted: Boolean(leftRect),
        rightPaletteMounted: Boolean(rightRect),
        paletteWidthPx: PALETTE_WIDTH,
        paletteHeightPx: layout.paletteHeight,
        buttonSizePx: BUTTON_SIZE,
        buttonGapPx: BUTTON_GAP,
        configuredSharedSideGapPx: layout.sideGap,
        actualLeftGapPx: leftGap,
        actualRightGapPx: rightGap,
        sameTop: Boolean(leftRect && rightRect && Math.round(leftRect.top) === Math.round(rightRect.top)),
        sameWidth: Boolean(leftRect && rightRect && Math.round(leftRect.width) === Math.round(rightRect.width)),
        sameHeight: Boolean(leftRect && rightRect && Math.round(leftRect.height) === Math.round(rightRect.height)),
        sameFrameStyle: true,
        placementMode: 'EXACT_MIRROR_AROUND_LEFT_AND_RIGHT_CONTROL_LINES',
      };
    };

    return () => {
      delete window.GANNZILLA_DRAWING_PALETTES_V272;
      delete window.__auditGannzillaDrawingPalettesV272;
    };
  }, [activeReference, activeTool, items.length, layout, visible]);

  const selectReference = (value) => {
    setActiveReference(value);
    if (['12', '24', '36'].includes(value)) {
      const url = new URL(window.location.href);
      url.searchParams.set('divisions', value);
      url.searchParams.set('drawingTools', 'true');
      url.searchParams.set('drawingToolsSideGap', String(layout.sideGap));
      url.searchParams.set('v', String(BUILD));
      window.location.assign(url.toString());
    }
  };

  const pointerDown = (event) => {
    const rect = layout.wheelRect;
    if (!rect || activeTool === 'cursor') return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const start = point(event, rect);
    setDraft({ type: activeTool, start, end: start });
  };

  const pointerMove = (event) => {
    const rect = layout.wheelRect;
    if (!draft || !rect) return;
    event.preventDefault();
    setDraft((current) => (current ? { ...current, end: point(event, rect) } : current));
  };

  const pointerUp = () => {
    if (!draft) return;
    const distance = Math.hypot(draft.end.x - draft.start.x, draft.end.y - draft.start.y);
    if (distance > 0.004) setItems((current) => [...current, draft]);
    setDraft(null);
  };

  if (!visible || typeof document === 'undefined') return null;

  const leftValues = ['12', '24', '36', '4', '9', 'N', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'];
  const rightTools = ['cursor', 'rect', 'p5', 'p6', 'p7', 'circle', 'triangle', 'angle', 'rings'];
  const rect = layout.wheelRect;

  return createPortal(
    <>
      <div
        id={LEFT_ID}
        data-gannzilla-left-drawing-palette="true"
        data-gannzilla-exact-mirror="true"
        style={paletteStyle('left', layout)}
      >
        {leftValues.map((value) => (
          <PaletteButton
            key={value}
            round={['12', '24', '36'].includes(value)}
            active={activeReference === value}
            title={value === 'N' ? 'North' : value.startsWith('p') ? `${value.slice(1)}-sided shape` : `${value}${['4', '9'].includes(value) ? '°' : ''}`}
            onClick={() => selectReference(value)}
          >
            <ReferenceGlyph value={value} />
          </PaletteButton>
        ))}
      </div>

      <div
        id={RIGHT_ID}
        data-gannzilla-right-drawing-palette="true"
        data-gannzilla-exact-mirror="true"
        style={paletteStyle('right', layout)}
      >
        {rightTools.map((tool) => (
          <PaletteButton
            key={tool}
            active={activeTool === tool}
            title={tool}
            onClick={() => setActiveTool(tool)}
          >
            <ShapeGlyph type={tool} />
          </PaletteButton>
        ))}
        <PaletteButton title="تراجع" onClick={() => setItems((current) => current.slice(0, -1))}>↶</PaletteButton>
        <PaletteButton title="مسح الكل" onClick={() => { setItems([]); setDraft(null); }}>×</PaletteButton>
      </div>

      {rect && (
        <svg
          id={OVERLAY_ID}
          viewBox={`0 0 ${rect.width} ${rect.height}`}
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={() => setDraft(null)}
          style={{
            position: 'fixed',
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            zIndex: 2147483590,
            pointerEvents: activeTool === 'cursor' ? 'none' : 'auto',
            cursor: activeTool === 'cursor' ? 'default' : 'crosshair',
            touchAction: 'none',
            overflow: 'visible',
          }}
        >
          {items.map((item, index) => drawingNode(item, index, rect))}
          {draft && drawingNode(draft, 'draft', rect)}
        </svg>
      )}
    </>,
    document.body,
  );
}
