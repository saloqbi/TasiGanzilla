import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = 282;
const EVENT_NAME = 'gannzilla:drawing-tools-v266';
const STORAGE_KEY = 'gannzilla-drawing-tools-visible-v266';
const LEFT_ID = 'gannzilla-left-drawing-palette';
const RIGHT_ID = 'gannzilla-right-drawing-palette';
const OVERLAY_ID = 'gannzilla-drawing-overlay';
const ACTIVE = '#5f83b9';
const BUTTON_SIZE = 68;
const BUTTON_GAP = 8;
const PALETTE_WIDTH = 92;
const DEFAULT_SIDE_GAP = 24;
const TOP_GAP = 6;
const MAX_BUTTON_COUNT = 16;
const PALETTE_NATURAL_HEIGHT = (MAX_BUTTON_COUNT * BUTTON_SIZE) + ((MAX_BUTTON_COUNT - 1) * BUTTON_GAP) + 28;

const TOOL_COLORS = {
  circle: { fill: '#F2D536', stroke: '#A88F00' },
  line: { fill: 'none', stroke: '#687078' },
  p3: { fill: '#A8D59B', stroke: '#4F7F45' },
  p4: { fill: '#E53935', stroke: '#A91F1C' },
  p5: { fill: '#F39C3D', stroke: '#B9650C' },
  p6: { fill: '#3454D1', stroke: '#1B2D86' },
  p7: { fill: '#7E57C2', stroke: '#4E3287' },
  p8: { fill: '#9E3346', stroke: '#651C2A' },
  p9: { fill: '#D5B34D', stroke: '#84691A' },
  p10: { fill: '#54B8B2', stroke: '#287C77' },
  p11: { fill: '#6574C4', stroke: '#38468E' },
  p12: { fill: '#B9825A', stroke: '#75472B' },
  leaf: { fill: '#C98E9B', stroke: '#7E4E59' },
  spiral: { fill: 'none', stroke: '#8F999F' },
};

const RIGHT_TOOLS = [
  'circle',
  'line',
  'p3',
  'p4',
  'p5',
  'p6',
  'p7',
  'p8',
  'p9',
  'p10',
  'p11',
  'p12',
  'leaf',
  'spiral',
];

const TOOL_TITLES = {
  circle: 'رسم دائرة',
  line: 'رسم شكل ثنائي — خط مستقيم',
  p3: 'رسم مثلث — 3 أضلاع',
  p4: 'رسم مربع — 4 أضلاع',
  p5: 'رسم خماسي — 5 أضلاع',
  p6: 'رسم سداسي — 6 أضلاع',
  p7: 'رسم سباعي — 7 أضلاع',
  p8: 'رسم ثماني — 8 أضلاع',
  p9: 'رسم تساعي — 9 أضلاع',
  p10: 'رسم عشاري — 10 أضلاع',
  p11: 'رسم حادي عشر — 11 ضلعًا',
  p12: 'رسم اثني عشر — 12 ضلعًا',
  leaf: 'أداة البوصلة',
  spiral: 'رسم حلزوني',
};

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
      const controlLineX = Math.round(rect.right);
      node.setAttribute('data-gannzilla-wheel-scroll-viewport', 'true');
      node.dataset.gannzillaVisibleRightControlLineX = String(controlLineX);
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
  const maxHeight = Math.max(220, Math.round(window.innerHeight - top - 8));
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

function spiralPath(cx, cy, rx, ry, turns = 3.2) {
  const points = [];
  const steps = 100;
  for (let index = 0; index <= steps; index += 1) {
    const ratio = index / steps;
    const angle = ratio * Math.PI * 2 * turns;
    const radiusRatio = 1 - ratio * 0.86;
    const x = cx + Math.cos(angle) * rx * radiusRatio;
    const y = cy + Math.sin(angle) * ry * radiusRatio;
    points.push(`${index === 0 ? 'M' : 'L'}${x} ${y}`);
  }
  return points.join(' ');
}

function createItemId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `drawing-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
        border: active ? `3px solid ${ACTIVE}` : '1px solid #c7c7c7',
        borderRadius: round ? '50%' : 3,
        background: active ? '#f3f7ff' : '#ffffff',
        display: 'grid',
        placeItems: 'center',
        boxSizing: 'border-box',
        cursor: 'pointer',
        pointerEvents: 'auto',
        userSelect: 'none',
        font: '700 22px Segoe UI, Tahoma, Arial, sans-serif',
        lineHeight: 1,
        opacity: 1,
      }}
    >
      {children}
    </button>
  );
}

function ShapeGlyph({ type }) {
  const color = TOOL_COLORS[type] || { fill: '#ffffff', stroke: '#8f999f' };
  const common = {
    fill: color.fill,
    stroke: color.stroke,
    strokeWidth: 2.8,
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    opacity: 1,
  };

  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true" style={{ opacity: 1 }}>
      {type === 'circle' && <circle cx="28" cy="28" r="19" {...common} />}
      {type === 'line' && <line x1="10" y1="43" x2="46" y2="13" {...common} fill="none" strokeWidth="4" />}
      {type.startsWith('p') && (
        <polygon
          points={polygonPoints(
            Number(type.slice(1)),
            28,
            28,
            20,
            Number(type.slice(1)) === 4 ? -Math.PI / 4 : -Math.PI / 2,
          )}
          {...common}
        />
      )}
      {type === 'leaf' && (
        <>
          <path d="M13 40 C18 24 29 14 44 12 C42 27 33 39 17 44 Z" {...common} />
          <path d="M16 42 L38 18" fill="none" stroke="#6F8B63" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="17" cy="42" r="3.2" fill="#D9B47A" stroke="#8A6A37" strokeWidth="1.8" />
        </>
      )}
      {type === 'spiral' && (
        <path
          d="M28 48 C16 48 8 40 8 28 C8 16 16 8 28 8 C40 8 48 16 48 28 C48 38 41 44 32 44 C23 44 17 38 17 30 C17 22 22 17 29 17 C36 17 40 22 40 28 C40 34 36 37 31 37 C26 37 23 34 23 30 C23 26 26 23 30 23 C34 23 36 25 36 28"
          fill="none"
          stroke={color.stroke}
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function ReferenceGlyph({ value }) {
  if (['12', '24', '36'].includes(value)) {
    return (
      <span style={{
        width: 56,
        height: 56,
        border: '2px solid #aeb4b8',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        fontSize: 18,
        background: '#ffffff',
      }}>
        {value}
      </span>
    );
  }
  if (value === 'N') {
    return <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontSize: 34, fontWeight: 700 }}>N</span>;
  }
  if (['4', '9'].includes(value)) return <span style={{ fontSize: 22 }}>{value}°</span>;
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
    padding: '12px 10px',
    background: '#ffffff',
    border: '1px solid #d5d5d5',
    borderRadius: 46,
    boxShadow: '0 1px 6px rgba(0,0,0,.16)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: BUTTON_GAP,
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    pointerEvents: 'auto',
    boxSizing: 'border-box',
    opacity: 1,
  };
}

function drawingNode(item, key, rect) {
  const x1 = item.start.x * rect.width;
  const y1 = item.start.y * rect.height;
  const x2 = item.end.x * rect.width;
  const y2 = item.end.y * rect.height;
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const color = TOOL_COLORS[item.type] || { stroke: '#0877c9' };
  const visible = {
    fill: 'none',
    stroke: color.stroke,
    strokeWidth: 2.5,
    vectorEffect: 'non-scaling-stroke',
    pointerEvents: 'none',
  };

  if (item.type === 'circle') {
    return <ellipse key={key} cx={cx} cy={cy} rx={width / 2} ry={height / 2} {...visible} />;
  }
  if (item.type === 'line') {
    return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} {...visible} />;
  }
  if (item.type.startsWith('p')) {
    const sides = Number(item.type.slice(1));
    return (
      <polygon
        key={key}
        points={polygonPoints(
          sides,
          cx,
          cy,
          Math.max(2, Math.min(width, height) / 2),
          sides === 4 ? -Math.PI / 4 : -Math.PI / 2,
        )}
        {...visible}
      />
    );
  }
  if (item.type === 'leaf') {
    const path = [
      `M${left + width * 0.18} ${top + height * 0.82}`,
      `C${left + width * 0.28} ${top + height * 0.36}, ${left + width * 0.58} ${top + height * 0.12}, ${left + width * 0.86} ${top + height * 0.12}`,
      `C${left + width * 0.82} ${top + height * 0.56}, ${left + width * 0.55} ${top + height * 0.82}, ${left + width * 0.2} ${top + height * 0.9}`,
      'Z',
    ].join(' ');
    return (
      <g key={key}>
        <path d={path} {...visible} />
        <line x1={left + width * 0.2} y1={top + height * 0.86} x2={left + width * 0.72} y2={top + height * 0.24} {...visible} />
      </g>
    );
  }
  if (item.type === 'spiral') {
    return (
      <path
        key={key}
        d={spiralPath(cx, cy, Math.max(width / 2, 4), Math.max(height / 2, 4))}
        {...visible}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }
  return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} {...visible} />;
}

export default function GannzillaDrawingPalettesV282() {
  const [visible, setVisible] = React.useState(readVisible);
  const [activeTool, setActiveTool] = React.useState('circle');
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
        // Keep runtime behavior if storage is unavailable.
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
    window.GANNZILLA_DRAWING_PALETTES_V282 = true;
    window.__auditGannzillaDrawingPalettesV282 = () => {
      const leftRect = document.getElementById(LEFT_ID)?.getBoundingClientRect?.() || null;
      const rightRect = document.getElementById(RIGHT_ID)?.getBoundingClientRect?.() || null;
      return {
        ok: Boolean(leftRect && rightRect && RIGHT_TOOLS.length === 14),
        build: BUILD,
        visible,
        activeTool,
        drawingCount: items.length,
        angleToolRemoved: !RIGHT_TOOLS.includes('angle'),
        goldRingToolRemoved: !RIGHT_TOOLS.includes('rings'),
        geometricSequence: ['circle', 'line', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12'],
        sequenceStartsWithCircleThenTwoSidedLine: RIGHT_TOOLS[0] === 'circle' && RIGHT_TOOLS[1] === 'line',
        sequenceEndsAtTwelveSides: RIGHT_TOOLS[11] === 'p12',
        leafToolPreserved: RIGHT_TOOLS.includes('leaf'),
        spiralToolPreserved: RIGHT_TOOLS.includes('spiral'),
        rightToolCountBeforeActions: RIGHT_TOOLS.length,
        buttonSizePx: BUTTON_SIZE,
        iconSizePx: 56,
        paletteWidthPx: PALETTE_WIDTH,
        internalScrollbarHidden: true,
        leftPaletteMounted: Boolean(leftRect),
        rightPaletteMounted: Boolean(rightRect),
      };
    };

    return () => {
      delete window.GANNZILLA_DRAWING_PALETTES_V282;
      delete window.__auditGannzillaDrawingPalettesV282;
    };
  }, [activeTool, items.length, visible]);

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

  const selectTool = (tool) => {
    setActiveTool(tool);
    setDraft(null);
  };

  const pointerDown = (event) => {
    const rect = layout.wheelRect;
    if (!rect) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const start = point(event, rect);
    setDraft({ id: 'draft', type: activeTool, start, end: start });
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
    if (distance > 0.004) {
      setItems((current) => [...current, { ...draft, id: createItemId() }]);
    }
    setDraft(null);
  };

  if (!visible || typeof document === 'undefined') return null;

  const leftValues = ['12', '24', '36', '4', '9', 'N', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'];
  const rect = layout.wheelRect;

  return createPortal(
    <>
      <style>{`
        #${LEFT_ID}::-webkit-scrollbar,
        #${RIGHT_ID}::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
          display: none !important;
        }
      `}</style>

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
        data-gannzilla-geometric-order="circle-line-3-4-5-6-7-8-9-10-11-12"
        data-gannzilla-angle-removed="true"
        data-gannzilla-gold-ring-removed="true"
        style={paletteStyle('right', layout)}
      >
        {RIGHT_TOOLS.map((tool) => (
          <PaletteButton
            key={tool}
            active={activeTool === tool}
            title={TOOL_TITLES[tool] || tool}
            onClick={() => selectTool(tool)}
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
            pointerEvents: 'auto',
            cursor: 'crosshair',
            touchAction: 'none',
            overflow: 'visible',
          }}
        >
          {items.map((item) => drawingNode(item, item.id, rect))}
          {draft && drawingNode(draft, 'draft', rect)}
        </svg>
      )}
    </>,
    document.body,
  );
}
