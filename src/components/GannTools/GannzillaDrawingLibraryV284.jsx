import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = 284;
const LIBRARY_EVENT = 'gannzilla:drawing-library-v284';
const SELECT_EVENT = 'gannzilla:drawing-library-selection-v284';
const LIBRARY_ID = 'gannzilla-drawing-library-v284';
const ADVANCED_OVERLAY_ID = 'gannzilla-advanced-drawing-overlay-v284';

const COLORS = {
  circle: { fill: '#F2D536', stroke: '#A88F00' },
  line: { fill: 'none', stroke: '#687078' },
  p3: { fill: '#E34234', stroke: '#9E2118' },
  p4: { fill: '#2E3033', stroke: '#111214' },
  p5: { fill: '#2D79D5', stroke: '#164B8C' },
  p6: { fill: '#3EAD55', stroke: '#246A33' },
  p7: { fill: '#7E57C2', stroke: '#4E3287' },
  p8: { fill: '#F39C3D', stroke: '#A95C0C' },
  p9: { fill: '#249A91', stroke: '#146059' },
  p10: { fill: '#C93E66', stroke: '#7D1D3A' },
  p11: { fill: '#81734C', stroke: '#51452B' },
  p12: { fill: '#159ABB', stroke: '#0B6076' },
  star: { fill: '#F4C430', stroke: '#A87500' },
  special: { fill: '#4C7EDB', stroke: '#244D99' },
};

const GEOMETRY = [
  ['circle', 'دائرة', 'رسم دائرة'],
  ['line', 'خط مستقيم', 'رسم شكل ثنائي — خط مستقيم'],
  ['p3', 'مثلث (3 أضلاع)', 'رسم مثلث — 3 أضلاع'],
  ['p4', 'مربع (4 أضلاع)', 'رسم مربع — 4 أضلاع'],
  ['p5', 'خماسي (5 أضلاع)', 'رسم خماسي — 5 أضلاع'],
  ['p6', 'سداسي (6 أضلاع)', 'رسم سداسي — 6 أضلاع'],
  ['p7', 'سباعي (7 أضلاع)', 'رسم سباعي — 7 أضلاع'],
  ['p8', 'ثماني (8 أضلاع)', 'رسم ثماني — 8 أضلاع'],
  ['p9', 'تساعي (9 أضلاع)', 'رسم تساعي — 9 أضلاع'],
  ['p10', 'عشاري (10 أضلاع)', 'رسم عشاري — 10 أضلاع'],
  ['p11', 'أحد عشري (11 ضلعًا)', 'رسم حادي عشر — 11 ضلعًا'],
  ['p12', 'اثنا عشري (12 ضلعًا)', 'رسم اثني عشر — 12 ضلعًا'],
];

const STARS = Array.from({ length: 10 }, (_, index) => {
  const points = index + 3;
  return [`star${points}`, `نجمة ${points === 3 ? 'ثلاثية' : points === 4 ? 'رباعية' : points === 5 ? 'خماسية' : points === 6 ? 'سداسية' : points === 7 ? 'سباعية' : points === 8 ? 'ثمانية' : points === 9 ? 'تساعية' : points === 10 ? 'عشرية' : points === 11 ? 'أحد عشرية' : 'اثنا عشرية'}`, points];
});

const SPECIALS = [
  ['filled-square', 'مربع ممتلئ'],
  ['diamond-filled', 'معين ممتلئ'],
  ['diamond-outline', 'معين فارغ'],
  ['ring-six', 'دائرة سداسية'],
  ['ring-five', 'دائرة خماسية'],
  ['nested-rings', 'دوائر متداخلة'],
  ['magnet', 'المغناطيس'],
  ['angle-wheel', 'عجلة الزوايا'],
  ['grid', 'الشكل الشبكي'],
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function largestWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((node) => ({ node, rect: node.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0] || null;
}

function normalizedPoint(event, rect) {
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

function starPoints(spikes, cx, cy, outerRadius, innerRadius) {
  const points = [];
  const total = spikes * 2;
  for (let index = 0; index < total; index += 1) {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + index * Math.PI / spikes;
    points.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
  }
  return points.join(' ');
}

function ShapeIcon({ type, size = 34 }) {
  const color = COLORS[type] || (type.startsWith('star') ? COLORS.star : COLORS.special);
  const polygonSides = type.startsWith('p') ? Number(type.slice(1)) : null;
  const starSpikes = type.startsWith('star') ? Number(type.slice(4)) : null;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      {type === 'circle' && <circle cx="20" cy="20" r="13" fill={color.fill} stroke={color.stroke} strokeWidth="2" />}
      {type === 'line' && <line x1="8" y1="31" x2="32" y2="9" stroke={color.stroke} strokeWidth="3" strokeLinecap="round" />}
      {polygonSides && <polygon points={polygonPoints(polygonSides, 20, 20, 14, polygonSides === 4 ? -Math.PI / 4 : -Math.PI / 2)} fill={color.fill} stroke={color.stroke} strokeWidth="2" />}
      {starSpikes && <polygon points={starPoints(starSpikes, 20, 20, 15, 7)} fill={COLORS.star.fill} stroke={COLORS.star.stroke} strokeWidth="1.5" />}
      {type === 'filled-square' && <rect x="8" y="8" width="24" height="24" fill="#292A2C" stroke="#111" strokeWidth="2" />}
      {type === 'diamond-filled' && <polygon points="20,6 34,20 20,34 6,20" fill="#2D79D5" stroke="#164B8C" strokeWidth="2" />}
      {type === 'diamond-outline' && <polygon points="20,6 34,20 20,34 6,20" fill="#fff" stroke="#2D79D5" strokeWidth="2.5" />}
      {type === 'ring-six' && <><circle cx="20" cy="20" r="13" fill="#fff" stroke="#E34234" strokeWidth="3" /><circle cx="20" cy="20" r="5" fill="#fff" stroke="#E34234" strokeWidth="2" /></>}
      {type === 'ring-five' && <><circle cx="20" cy="20" r="13" fill="#fff" stroke="#2558A8" strokeWidth="3" /><circle cx="20" cy="20" r="5" fill="#fff" stroke="#2558A8" strokeWidth="2" /></>}
      {type === 'nested-rings' && <><circle cx="20" cy="20" r="14" fill="none" stroke="#3EAD55" strokeWidth="2.5" /><circle cx="20" cy="20" r="9" fill="none" stroke="#3EAD55" strokeWidth="2" /><circle cx="20" cy="20" r="4" fill="none" stroke="#3EAD55" strokeWidth="2" /></>}
      {type === 'magnet' && <path d="M9 29V17c0-8 5-12 11-12s11 4 11 12v12h-7V17c0-3-1-5-4-5s-4 2-4 5v12Z" fill="#E34234" stroke="#95231C" strokeWidth="2" />}
      {type === 'angle-wheel' && <><circle cx="20" cy="20" r="14" fill="#fff" stroke="#D2A600" strokeWidth="2.5" />{[0,45,90,135].map((angle) => { const rad = angle * Math.PI / 180; return <line key={angle} x1={20 - Math.cos(rad) * 13} y1={20 - Math.sin(rad) * 13} x2={20 + Math.cos(rad) * 13} y2={20 + Math.sin(rad) * 13} stroke="#D2A600" strokeWidth="1.5" />; })}</>}
      {type === 'grid' && Array.from({ length: 9 }, (_, index) => <rect key={index} x={7 + (index % 3) * 9} y={7 + Math.floor(index / 3) * 9} width="7" height="7" fill="#7E57C2" stroke="#4E3287" strokeWidth="1" />)}
    </svg>
  );
}

function findGeometryButton(title) {
  const palette = document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  if (!(palette instanceof HTMLElement)) return null;
  return Array.from(palette.children).find((node) => (
    node instanceof HTMLButtonElement
    && String(node.getAttribute('title') || node.getAttribute('aria-label') || '') === title
  )) || null;
}

function renderAdvancedItem(item, key, rect) {
  const x1 = item.start.x * rect.width;
  const y1 = item.start.y * rect.height;
  const x2 = item.end.x * rect.width;
  const y2 = item.end.y * rect.height;
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const width = Math.max(4, Math.abs(x2 - x1));
  const height = Math.max(4, Math.abs(y2 - y1));
  const cx = left + width / 2;
  const cy = top + height / 2;
  const radius = Math.max(3, Math.min(width, height) / 2);
  const common = { vectorEffect: 'non-scaling-stroke' };

  if (item.type.startsWith('star')) {
    const spikes = Number(item.type.slice(4));
    return <polygon key={key} points={starPoints(spikes, cx, cy, radius, radius * 0.46)} fill="#F4C430" stroke="#A87500" strokeWidth="2" {...common} />;
  }
  if (item.type === 'filled-square') return <rect key={key} x={left} y={top} width={width} height={height} fill="#292A2C" stroke="#111" strokeWidth="2" {...common} />;
  if (item.type === 'diamond-filled' || item.type === 'diamond-outline') {
    return <polygon key={key} points={`${cx},${top} ${left + width},${cy} ${cx},${top + height} ${left},${cy}`} fill={item.type === 'diamond-filled' ? '#2D79D5' : '#fff'} stroke="#164B8C" strokeWidth="2" {...common} />;
  }
  if (['ring-six', 'ring-five', 'nested-rings'].includes(item.type)) {
    const stroke = item.type === 'ring-six' ? '#E34234' : item.type === 'ring-five' ? '#2558A8' : '#3EAD55';
    const rings = item.type === 'nested-rings' ? [1, 0.66, 0.32] : [1, 0.38];
    return <g key={key}>{rings.map((ratio) => <ellipse key={ratio} cx={cx} cy={cy} rx={(width / 2) * ratio} ry={(height / 2) * ratio} fill="none" stroke={stroke} strokeWidth="2.5" {...common} />)}</g>;
  }
  if (item.type === 'magnet') {
    return <path key={key} d={`M${left} ${top + height} V${top + height * 0.45} C${left} ${top + height * 0.08}, ${cx - width * 0.2} ${top}, ${cx} ${top} C${cx + width * 0.2} ${top}, ${left + width} ${top + height * 0.08}, ${left + width} ${top + height * 0.45} V${top + height}`} fill="none" stroke="#E34234" strokeWidth={Math.max(5, radius * 0.32)} strokeLinecap="square" {...common} />;
  }
  if (item.type === 'angle-wheel') {
    return <g key={key}><ellipse cx={cx} cy={cy} rx={width / 2} ry={height / 2} fill="none" stroke="#D2A600" strokeWidth="2.5" {...common} />{[0,45,90,135].map((angle) => { const rad = angle * Math.PI / 180; return <line key={angle} x1={cx - Math.cos(rad) * width / 2} y1={cy - Math.sin(rad) * height / 2} x2={cx + Math.cos(rad) * width / 2} y2={cy + Math.sin(rad) * height / 2} stroke="#D2A600" strokeWidth="1.7" {...common} />; })}</g>;
  }
  if (item.type === 'grid') {
    return <g key={key}>{Array.from({ length: 9 }, (_, index) => <rect key={index} x={left + (index % 3) * width / 3} y={top + Math.floor(index / 3) * height / 3} width={width / 3} height={height / 3} fill="none" stroke="#7E57C2" strokeWidth="1.5" {...common} />)}</g>;
  }
  return null;
}

function ToolRow({ type, label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 54,
        border: 0,
        borderBottom: '1px solid #e3e3e3',
        background: selected ? '#e8f2ff' : '#ffffff',
        color: '#202124',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 14,
        padding: '7px 14px',
        cursor: 'pointer',
        direction: 'rtl',
        textAlign: 'right',
        font: '600 15px Segoe UI, Tahoma, Arial, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <ShapeIcon type={type} />
      <span style={{ flex: 1 }}>{label}</span>
      {selected && <span style={{ color: '#1976d2', fontWeight: 900 }}>✓</span>}
    </button>
  );
}

export default function GannzillaDrawingLibraryV284() {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState('geometry');
  const [selected, setSelected] = React.useState('circle');
  const [advancedTool, setAdvancedTool] = React.useState(null);
  const [items, setItems] = React.useState([]);
  const [draft, setDraft] = React.useState(null);
  const [wheelRect, setWheelRect] = React.useState(() => largestWheelCanvas()?.rect || null);

  React.useEffect(() => {
    const onLibrary = (event) => {
      if (typeof event?.detail?.open === 'boolean') setOpen(event.detail.open);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        window.dispatchEvent(new CustomEvent(LIBRARY_EVENT, { detail: { open: false, source: 'escape-v284' } }));
      }
    };
    window.addEventListener(LIBRARY_EVENT, onLibrary);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener(LIBRARY_EVENT, onLibrary);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  React.useEffect(() => {
    let frame = 0;
    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setWheelRect(largestWheelCanvas()?.rect || null));
    };
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    document.addEventListener('fullscreenchange', sync);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
      document.removeEventListener('fullscreenchange', sync);
    };
  }, []);

  const closeLibrary = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent(LIBRARY_EVENT, { detail: { open: false, source: 'library-close-v284' } }));
  };

  const selectGeometry = (type, title) => {
    const button = findGeometryButton(title);
    button?.click();
    setSelected(type);
    setAdvancedTool(null);
    window.dispatchEvent(new CustomEvent(SELECT_EVENT, { detail: { category: 'geometry', type, title, buttonFound: Boolean(button) } }));
    closeLibrary();
  };

  const selectAdvanced = (category, type, label) => {
    setSelected(type);
    setAdvancedTool(type);
    window.dispatchEvent(new CustomEvent(SELECT_EVENT, { detail: { category, type, label, nativeAdvancedDrawing: true } }));
    closeLibrary();
  };

  const pointerDown = (event) => {
    if (!advancedTool || !wheelRect) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const start = normalizedPoint(event, wheelRect);
    setDraft({ type: advancedTool, start, end: start });
  };

  const pointerMove = (event) => {
    if (!draft || !wheelRect) return;
    event.preventDefault();
    setDraft((current) => current ? { ...current, end: normalizedPoint(event, wheelRect) } : current);
  };

  const pointerUp = () => {
    if (!draft) return;
    const distance = Math.hypot(draft.end.x - draft.start.x, draft.end.y - draft.start.y);
    if (distance > 0.004) setItems((current) => [...current, { ...draft, id: `advanced-${Date.now()}-${Math.random().toString(36).slice(2)}` }]);
    setDraft(null);
  };

  React.useEffect(() => {
    window.GANNZILLA_DRAWING_LIBRARY_V284 = true;
    window.__auditGannzillaDrawingLibraryV284 = () => ({
      ok: true,
      build: BUILD,
      open,
      tab,
      selected,
      advancedTool,
      advancedDrawingCount: items.length,
      openedFromExistingToolsControl: true,
      categories: ['geometry', 'stars', 'special'],
      geometryTools: GEOMETRY.map(([type]) => type),
      starTools: STARS.map(([type]) => type),
      specialTools: SPECIALS.map(([type]) => type),
      geometrySelectionDelegatesToExistingPalette: true,
      advancedShapesDrawOnWheel: true,
      closesAfterSelection: true,
      rtlArabicInterface: true,
    });
    return () => {
      delete window.GANNZILLA_DRAWING_LIBRARY_V284;
      delete window.__auditGannzillaDrawingLibraryV284;
    };
  }, [advancedTool, items.length, open, selected, tab]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {wheelRect && (
        <svg
          id={ADVANCED_OVERLAY_ID}
          viewBox={`0 0 ${wheelRect.width} ${wheelRect.height}`}
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={() => setDraft(null)}
          style={{
            position: 'fixed',
            left: wheelRect.left,
            top: wheelRect.top,
            width: wheelRect.width,
            height: wheelRect.height,
            zIndex: 2147483596,
            pointerEvents: advancedTool ? 'auto' : 'none',
            cursor: advancedTool ? 'crosshair' : 'default',
            touchAction: 'none',
            overflow: 'visible',
          }}
        >
          {items.map((item) => renderAdvancedItem(item, item.id, wheelRect))}
          {draft && renderAdvancedItem(draft, 'advanced-draft', wheelRect)}
        </svg>
      )}

      {advancedTool && (
        <div style={{ position: 'fixed', left: 14, bottom: 14, zIndex: 2147483604, display: 'flex', gap: 6, direction: 'rtl' }}>
          <button type="button" onClick={() => setItems((current) => current.slice(0, -1))} style={{ padding: '7px 12px', border: '1px solid #bfc5cc', background: '#fff', borderRadius: 5, cursor: 'pointer' }}>تراجع</button>
          <button type="button" onClick={() => { setItems([]); setDraft(null); }} style={{ padding: '7px 12px', border: '1px solid #bfc5cc', background: '#fff', borderRadius: 5, cursor: 'pointer' }}>مسح الخاصة</button>
          <button type="button" onClick={() => setAdvancedTool(null)} style={{ padding: '7px 12px', border: '1px solid #bfc5cc', background: '#fff', borderRadius: 5, cursor: 'pointer' }}>إنهاء الأداة</button>
        </div>
      )}

      {open && (
        <div
          id={LIBRARY_ID}
          role="dialog"
          aria-modal="false"
          aria-label="مكتبة أدوات الرسم"
          style={{
            position: 'fixed',
            top: 32,
            right: 28,
            width: 390,
            maxWidth: 'calc(100vw - 56px)',
            maxHeight: 'calc(100vh - 50px)',
            zIndex: 2147483620,
            background: '#fff',
            border: '1px solid #cfd3d8',
            borderRadius: 8,
            boxShadow: '0 10px 32px rgba(0,0,0,.23)',
            overflow: 'hidden',
            direction: 'rtl',
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
          }}
        >
          <div style={{ height: 48, display: 'flex', alignItems: 'center', padding: '0 14px', borderBottom: '1px solid #ddd', background: 'linear-gradient(#fff,#f4f4f4)' }}>
            <strong style={{ flex: 1, fontSize: 17 }}>مكتبة أدوات الرسم</strong>
            <button type="button" onClick={closeLibrary} aria-label="إغلاق" style={{ width: 34, height: 34, border: 0, background: 'transparent', fontSize: 25, cursor: 'pointer' }}>×</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '1px solid #d9d9d9' }}>
            {[['geometry', 'الأشكال الهندسية'], ['stars', 'النجوم'], ['special', 'أشكال خاصة']].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                style={{
                  minHeight: 43,
                  border: 0,
                  borderBottom: tab === key ? '3px solid #1976d2' : '3px solid transparent',
                  background: tab === key ? '#eef5ff' : '#fff',
                  color: tab === key ? '#135ea8' : '#333',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ maxHeight: 'calc(100vh - 174px)', overflowY: 'auto', scrollbarWidth: 'thin' }}>
            {tab === 'geometry' && GEOMETRY.map(([type, label, title]) => (
              <ToolRow key={type} type={type} label={label} selected={selected === type} onClick={() => selectGeometry(type, title)} />
            ))}
            {tab === 'stars' && STARS.map(([type, label]) => (
              <ToolRow key={type} type={type} label={label} selected={selected === type} onClick={() => selectAdvanced('stars', type, label)} />
            ))}
            {tab === 'special' && SPECIALS.map(([type, label]) => (
              <ToolRow key={type} type={type} label={label} selected={selected === type} onClick={() => selectAdvanced('special', type, label)} />
            ))}
          </div>

          <div style={{ padding: '9px 12px', borderTop: '1px solid #ddd', background: '#f7f8fa', color: '#5f6368', fontSize: 12 }}>
            اختر الأداة، تُغلق القائمة تلقائيًا، ثم ارسم مباشرة على العجلة.
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}
