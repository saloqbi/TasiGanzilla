import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = 266;
const EVENT_NAME = 'gannzilla:drawing-tools-v266';
const STORAGE_KEY = 'gannzilla-drawing-tools-visible-v266';
const LEFT_ID = 'gannzilla-left-drawing-palette-v266';
const RIGHT_ID = 'gannzilla-right-drawing-palette-v266';
const OVERLAY_ID = 'gannzilla-drawing-overlay-v266';
const ICON = '#8f999f';
const ACTIVE = '#5f83b9';

function readVisible() {
  const query = new URLSearchParams(window.location.search || '');
  if (query.get('drawingTools') === 'true') return true;
  if (query.get('drawingTools') === 'false') return false;
  try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
}

function wheelRect() {
  const canvas = Array.from(document.querySelectorAll('canvas'))
    .map((node) => ({ node, rect: node.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => b.rect.width * b.rect.height - a.rect.width * a.rect.height)[0];
  if (!canvas) return null;
  const { left, top, width, height } = canvas.rect;
  return { left, top, width, height };
}

function point(event, rect) {
  return {
    x: Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width))),
    y: Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height))),
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
    <button type="button" title={title} aria-label={title} aria-pressed={active} onClick={onClick} style={{
      width: 34, minWidth: 34, height: 34, minHeight: 34, padding: 0, margin: 0,
      border: active ? `2px solid ${ACTIVE}` : '1px solid #c7c7c7',
      borderRadius: round ? '50%' : 2,
      background: active ? '#f3f7ff' : '#ffffff',
      color: ICON, display: 'grid', placeItems: 'center', boxSizing: 'border-box',
      cursor: 'pointer', pointerEvents: 'auto', userSelect: 'none',
      font: '700 13px Segoe UI, Tahoma, Arial, sans-serif', lineHeight: 1,
    }}>{children}</button>
  );
}

function ShapeGlyph({ type }) {
  const common = { fill: type === 'cursor' ? '#f8fbfd' : 'none', stroke: ICON, strokeWidth: 1.5, strokeLinejoin: 'round' };
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      {type === 'cursor' && <path d="m7 4 13 9-6 1.2 3.1 7-2.5 1-3-7-4.6 4Z" {...common} />}
      {type === 'rect' && <rect x="5" y="6" width="18" height="16" rx="1" {...common} />}
      {type === 'circle' && <circle cx="14" cy="14" r="9" {...common} />}
      {type === 'triangle' && <path d="M14 4 24 22H4Z" {...common} />}
      {type === 'angle' && <path d="M5 22 22 6M5 22h17" fill="none" stroke={ICON} strokeWidth="1.6" />}
      {type === 'rings' && <><circle cx="14" cy="14" r="10" {...common} /><circle cx="14" cy="14" r="5" {...common} /></>}
      {type.startsWith('p') && <polygon points={polygonPoints(Number(type.slice(1)), 14, 14, 10, Number(type.slice(1)) === 4 ? -Math.PI / 4 : -Math.PI / 2)} {...common} />}
    </svg>
  );
}

function ReferenceGlyph({ value }) {
  if (['12', '24', '36'].includes(value)) {
    return <span style={{ width: 29, height: 29, border: '1px solid #aeb4b8', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 10 }}>{value}</span>;
  }
  if (value === 'N') return <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontSize: 19, fontWeight: 700 }}>N</span>;
  if (['4', '9'].includes(value)) return <span style={{ fontSize: 12 }}>{value}°</span>;
  return <ShapeGlyph type={value} />;
}

function paletteStyle(side) {
  return {
    position: 'fixed', [side]: 10, top: 88, zIndex: 2147483605,
    width: 46, maxHeight: 'calc(100vh - 106px)', padding: '6px 5px',
    background: 'rgba(248,248,248,.97)', border: '1px solid #d5d5d5', borderRadius: 23,
    boxShadow: '0 1px 5px rgba(0,0,0,.14)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 4, overflowY: 'auto', overflowX: 'hidden',
    scrollbarWidth: 'thin', pointerEvents: 'auto', boxSizing: 'border-box',
  };
}

function drawingNode(item, index, rect) {
  const x1 = item.start.x * rect.width;
  const y1 = item.start.y * rect.height;
  const x2 = item.end.x * rect.width;
  const y2 = item.end.y * rect.height;
  const left = Math.min(x1, x2), top = Math.min(y1, y2);
  const width = Math.abs(x2 - x1), height = Math.abs(y2 - y1);
  const common = { fill: 'none', stroke: '#0877c9', strokeWidth: 2, vectorEffect: 'non-scaling-stroke' };
  if (item.type === 'rect') return <rect key={index} x={left} y={top} width={width} height={height} {...common} />;
  if (item.type === 'circle') return <ellipse key={index} cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} rx={width / 2} ry={height / 2} {...common} />;
  if (item.type === 'triangle') return <polygon key={index} points={`${(x1+x2)/2},${top} ${left},${top+height} ${left+width},${top+height}`} {...common} />;
  if (item.type === 'angle') return <path key={index} d={`M${x1} ${y1} L${x2} ${y2} M${x1} ${y1} L${x2} ${y1}`} {...common} />;
  if (item.type === 'rings') return <g key={index}><ellipse cx={(x1+x2)/2} cy={(y1+y2)/2} rx={width/2} ry={height/2} {...common}/><ellipse cx={(x1+x2)/2} cy={(y1+y2)/2} rx={width/4} ry={height/4} {...common}/></g>;
  if (item.type.startsWith('p')) return <polygon key={index} points={polygonPoints(Number(item.type.slice(1)), (x1+x2)/2, (y1+y2)/2, Math.max(2, Math.min(width,height)/2), Number(item.type.slice(1))===4 ? -Math.PI/4 : -Math.PI/2)} {...common} />;
  return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} {...common} />;
}

export default function GannzillaDrawingPalettesV266() {
  const [visible, setVisible] = React.useState(readVisible);
  const [activeTool, setActiveTool] = React.useState('cursor');
  const [activeReference, setActiveReference] = React.useState('36');
  const [rect, setRect] = React.useState(wheelRect);
  const [items, setItems] = React.useState([]);
  const [draft, setDraft] = React.useState(null);

  React.useEffect(() => {
    const onVisibility = (event) => {
      if (typeof event?.detail?.visible !== 'boolean') return;
      setVisible(event.detail.visible);
      try { localStorage.setItem(STORAGE_KEY, String(event.detail.visible)); } catch {}
    };
    window.addEventListener(EVENT_NAME, onVisibility);
    return () => window.removeEventListener(EVENT_NAME, onVisibility);
  }, []);

  React.useEffect(() => {
    const sync = () => {
      const next = wheelRect();
      if (!next) return;
      setRect((current) => current && Math.abs(current.left-next.left)<.5 && Math.abs(current.top-next.top)<.5 && Math.abs(current.width-next.width)<.5 && Math.abs(current.height-next.height)<.5 ? current : next);
    };
    sync();
    const timer = window.setInterval(sync, 250);
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    document.addEventListener('fullscreenchange', sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
      document.removeEventListener('fullscreenchange', sync);
    };
  }, []);

  React.useEffect(() => {
    window.GANNZILLA_DRAWING_PALETTES_V266 = true;
    window.__auditGannzillaDrawingPalettesV266 = () => ({
      ok: true, build: BUILD, visible, activeTool, activeReference, drawingCount: items.length,
      leftPaletteMounted: Boolean(document.getElementById(LEFT_ID)),
      rightPaletteMounted: Boolean(document.getElementById(RIGHT_ID)),
      nativeButtonSizePx: 34, nativePaletteWidthPx: 46,
      colors: { icon: ICON, active: ACTIVE, background: '#ffffff' },
      exactRightShapes: ['CURSOR','RECTANGLE','PENTAGON','HEXAGON','HEPTAGON','CIRCLE','TRIANGLE','ANGLE','RINGS'],
    });
    return () => {
      delete window.GANNZILLA_DRAWING_PALETTES_V266;
      delete window.__auditGannzillaDrawingPalettesV266;
    };
  }, [activeReference, activeTool, items.length, visible]);

  const selectReference = (value) => {
    setActiveReference(value);
    if (['12','24','36'].includes(value)) {
      const url = new URL(window.location.href);
      url.searchParams.set('divisions', value);
      url.searchParams.set('drawingTools', 'true');
      url.searchParams.set('v', String(BUILD));
      window.location.assign(url.toString());
    }
  };

  const pointerDown = (event) => {
    if (!rect || activeTool === 'cursor') return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const start = point(event, rect);
    setDraft({ type: activeTool, start, end: start });
  };
  const pointerMove = (event) => {
    if (!draft || !rect) return;
    event.preventDefault();
    setDraft((current) => current ? { ...current, end: point(event, rect) } : current);
  };
  const pointerUp = () => {
    if (!draft) return;
    const distance = Math.hypot(draft.end.x-draft.start.x, draft.end.y-draft.start.y);
    if (distance > .004) setItems((current) => [...current, draft]);
    setDraft(null);
  };

  if (!visible || typeof document === 'undefined') return null;

  const leftValues = ['12','24','36','4','9','N','p3','p4','p5','p6','p7','p8','p9'];
  const rightTools = ['cursor','rect','p5','p6','p7','circle','triangle','angle','rings'];

  return createPortal(<>
    <div id={LEFT_ID} data-gannzilla-left-drawing-palette="true" style={paletteStyle('left')}>
      {leftValues.map((value) => <PaletteButton key={value} round={['12','24','36'].includes(value)} active={activeReference===value} title={value==='N'?'North':value.startsWith('p')?`${value.slice(1)}-sided shape`:`${value}${['4','9'].includes(value)?'°':''}`} onClick={() => selectReference(value)}><ReferenceGlyph value={value}/></PaletteButton>)}
    </div>

    <div id={RIGHT_ID} data-gannzilla-right-drawing-palette="true" style={paletteStyle('right')}>
      {rightTools.map((tool) => <PaletteButton key={tool} active={activeTool===tool} title={tool} onClick={() => setActiveTool(tool)}><ShapeGlyph type={tool}/></PaletteButton>)}
      <PaletteButton title="تراجع" onClick={() => setItems((current) => current.slice(0,-1))}>↶</PaletteButton>
      <PaletteButton title="مسح الكل" onClick={() => { setItems([]); setDraft(null); }}>×</PaletteButton>
    </div>

    {rect && <svg id={OVERLAY_ID} viewBox={`0 0 ${rect.width} ${rect.height}`} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => setDraft(null)} style={{
      position:'fixed', left:rect.left, top:rect.top, width:rect.width, height:rect.height,
      zIndex:2147483590, pointerEvents:activeTool==='cursor'?'none':'auto', cursor:activeTool==='cursor'?'default':'crosshair', touchAction:'none', overflow:'visible',
    }}>
      {items.map((item,index) => drawingNode(item,index,rect))}
      {draft && drawingNode(draft,'draft',rect)}
    </svg>}
  </>, document.body);
}
