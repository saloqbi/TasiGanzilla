import React from 'react';

const MARKER = 'GANNZILLA_EXACT_TOOLBAR_V97';
const MIN_ZOOM = 0.10;
const MAX_ZOOM = 3.00;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function SvgIcon({ children, size = 19, viewBox = '0 0 24 24' }) {
  return <svg width={size} height={size} viewBox={viewBox} aria-hidden="true" style={{ display: 'block' }}>{children}</svg>;
}

function PointerIcon() {
  return (
    <SvgIcon>
      <path d="M5 2.5 18 13l-6 .9 3.2 6-2.8 1.5-3.1-6-4.3 4.2Z" fill="#f7fbff" stroke="#3779a9" strokeWidth="1.5" />
    </SvgIcon>
  );
}

function LineIcon({ arrow = false }) {
  return (
    <SvgIcon>
      <path d="M3 12h16" stroke="#1874b8" strokeWidth="3" strokeLinecap="round" />
      {arrow && <path d="m15 7 5 5-5 5" fill="none" stroke="#1874b8" strokeWidth="2" />}
    </SvgIcon>
  );
}

function RectIcon({ ellipse = false }) {
  return (
    <SvgIcon>
      {ellipse ? <ellipse cx="12" cy="12" rx="8.5" ry="6.5" fill="none" stroke="#1978bb" strokeWidth="2.5" /> : <rect x="4" y="5" width="16" height="14" rx="1" fill="none" stroke="#1978bb" strokeWidth="2.5" />}
    </SvgIcon>
  );
}

function TextIcon() {
  return <span style={{ color: '#1978bb', fontWeight: 900, fontSize: 22, lineHeight: 1, fontFamily: 'Georgia, serif' }}>T</span>;
}

function LockIcon({ locked }) {
  return (
    <SvgIcon>
      <rect x="5" y="10" width="14" height="11" rx="1.5" fill={locked ? '#f0b923' : '#f4d36b'} stroke="#333" strokeWidth="1.5" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" fill="none" stroke="#333" strokeWidth="1.7" />
    </SvgIcon>
  );
}

function ZoomIcon({ plus }) {
  return (
    <SvgIcon>
      <circle cx="10" cy="10" r="6.5" fill="#eef4f8" stroke="#8194a4" strokeWidth="1.7" />
      <path d="M5.8 10h8.4" stroke="#1b70ae" strokeWidth="1.8" />
      {plus && <path d="M10 5.8v8.4" stroke="#1b70ae" strokeWidth="1.8" />}
      <path d="m15 15 5 5" stroke="#8194a4" strokeWidth="2.2" strokeLinecap="round" />
    </SvgIcon>
  );
}

function FullscreenIcon() {
  return (
    <SvgIcon>
      <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="#337cb3" strokeWidth="2.2" />
      <path d="m8.5 8.5-4-4M15.5 8.5l4-4M15.5 15.5l4 4M8.5 15.5l-4 4" stroke="#337cb3" strokeWidth="1.5" />
    </SvgIcon>
  );
}

function ConnectionIcon() {
  return (
    <SvgIcon>
      <rect x="4" y="3" width="16" height="18" fill="#efefef" stroke="#8c8c8c" strokeWidth="1.3" />
      <rect x="7" y="5" width="10" height="12" fill="#fff" stroke="#999" />
      <path d="M10 17v-5h4v5M9 8h6" stroke="#555" strokeWidth="1.2" />
      <circle cx="12" cy="19" r="1" fill="#555" />
    </SvgIcon>
  );
}

function InfoIcon() {
  return <span style={{ color: '#236bb0', fontWeight: 900, fontSize: 16 }}>ⓘ</span>;
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 300 && rect.height > 300)
    .sort((a, b) => (b.canvas.width * b.canvas.height) - (a.canvas.width * a.canvas.height))[0]?.canvas || null;
}

function getNaturalSize(canvas) {
  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  return {
    width: Math.max(1, canvas.width / dpr),
    height: Math.max(1, canvas.height / dpr),
  };
}

function normalizedPoint(event, rect) {
  return {
    x: clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1),
    y: clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1),
  };
}

function ToolButton({ active, title, children, onClick, width = 27 }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      style={{
        width,
        height: 24,
        padding: 0,
        border: '1px solid #aeb6bb',
        borderRadius: 1,
        background: active ? '#d7ebf9' : 'linear-gradient(#ffffff,#e9e9e9)',
        boxShadow: active ? 'inset 0 0 0 1px #8cc3e8' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function SplitTool({ active, title, icon, options, onSelect }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: 'relative', display: 'flex' }}>
      <ToolButton active={active} title={title} onClick={() => onSelect(options[0].value)} width={27}>{icon}</ToolButton>
      <button type="button" onClick={() => setOpen((value) => !value)} title={`${title} options`} style={{ width: 13, height: 24, padding: 0, border: '1px solid #aeb6bb', borderLeft: 0, background: 'linear-gradient(#fff,#e9e9e9)', cursor: 'pointer', fontSize: 9 }}>▼</button>
      {open && (
        <div style={{ position: 'absolute', top: 25, left: 0, minWidth: 122, background: '#fff', border: '1px solid #9aa3a8', boxShadow: '0 3px 9px rgba(0,0,0,.22)', zIndex: 2147483647 }}>
          {options.map((option) => (
            <button key={option.value} type="button" onClick={() => { onSelect(option.value); setOpen(false); }} style={{ width: '100%', height: 28, border: 0, borderBottom: '1px solid #eee', background: '#fff', display: 'flex', alignItems: 'center', gap: 7, padding: '0 7px', cursor: 'pointer', textAlign: 'left' }}>
              {option.icon}<span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GannzillaExactToolbarV97() {
  const [tool, setTool] = React.useState('select');
  const [locked, setLocked] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [canvasRect, setCanvasRect] = React.useState(null);
  const [shapes, setShapes] = React.useState([]);
  const [draft, setDraft] = React.useState(null);
  const [selectedId, setSelectedId] = React.useState(null);
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [language, setLanguage] = React.useState(document.documentElement.lang === 'ar' ? 'ar' : 'en');
  const canvasRef = React.useRef(null);
  const startRef = React.useRef(null);
  const oldToolbarRightRef = React.useRef(null);
  const applyingZoomRef = React.useRef(false);

  const updateCanvasRect = React.useCallback(() => {
    const canvas = canvasRef.current || findWheelCanvas();
    if (!canvas) return;
    canvasRef.current = canvas;
    const rect = canvas.getBoundingClientRect();
    setCanvasRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
  }, []);

  const applyZoom = React.useCallback((nextZoom, center = true) => {
    const canvas = canvasRef.current || findWheelCanvas();
    if (!canvas) return;
    canvasRef.current = canvas;
    const natural = getNaturalSize(canvas);
    const safe = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    applyingZoomRef.current = true;
    canvas.style.setProperty('width', `${natural.width * safe}px`, 'important');
    canvas.style.setProperty('height', `${natural.height * safe}px`, 'important');
    const viewport = canvas.parentElement?.parentElement;
    if (center && viewport) {
      requestAnimationFrame(() => {
        viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
        viewport.scrollTop = Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2);
        updateCanvasRect();
      });
    } else {
      requestAnimationFrame(updateCanvasRect);
    }
    setZoom(safe);
    window.setTimeout(() => { applyingZoomRef.current = false; }, 40);
  }, [updateCanvasRect]);

  const fitToScreen = React.useCallback(() => {
    const canvas = canvasRef.current || findWheelCanvas();
    if (!canvas) return;
    const viewport = canvas.parentElement?.parentElement;
    const natural = getNaturalSize(canvas);
    if (!viewport) return;
    const fitted = clamp(Math.min((viewport.clientWidth - 60) / natural.width, (viewport.clientHeight - 60) / natural.height), MIN_ZOOM, 1);
    applyZoom(fitted, true);
  }, [applyZoom]);

  React.useEffect(() => {
    const discover = () => {
      const canvas = findWheelCanvas();
      if (canvas) {
        canvasRef.current = canvas;
        const natural = getNaturalSize(canvas);
        const rect = canvas.getBoundingClientRect();
        const detectedZoom = clamp(rect.width / natural.width, MIN_ZOOM, MAX_ZOOM);
        if (!applyingZoomRef.current && Math.abs(detectedZoom - zoom) > 0.01) applyZoom(zoom, false);
        updateCanvasRect();
      }

      const topBars = Array.from(document.querySelectorAll('div')).filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.position === 'fixed' && rect.top <= 1 && rect.height >= 20 && rect.height <= 28 && String(element.textContent || '').includes('Gannzilla Pro');
      });
      const topBar = topBars.sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
      const rightSection = topBar?.children?.[1];
      if (rightSection && rightSection !== oldToolbarRightRef.current) {
        oldToolbarRightRef.current = rightSection;
        rightSection.style.setProperty('visibility', 'hidden', 'important');
      }
    };

    const timer = window.setInterval(discover, 250);
    const onMove = () => updateCanvasRect();
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    const languageObserver = new MutationObserver(() => setLanguage(document.documentElement.lang === 'ar' ? 'ar' : 'en'));
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    discover();

    window[MARKER] = true;
    window.__auditGannzillaExactToolbarV97 = () => ({
      ok: window[MARKER] === true && Boolean(canvasRef.current),
      order: ['select', 'line', 'shape', 'text', 'lock', 'zoomOut', 'zoomPercent', 'zoomIn', 'fullscreen', 'connection', 'language', 'info'],
      activeTool: tool,
      locked,
      zoom,
      drawingCount: shapes.length,
    });

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
      languageObserver.disconnect();
      if (oldToolbarRightRef.current) oldToolbarRightRef.current.style.removeProperty('visibility');
    };
  }, [applyZoom, locked, shapes.length, tool, updateCanvasRect, zoom]);

  React.useEffect(() => {
    const onKey = (event) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId && !locked) {
        setShapes((current) => current.filter((shape) => shape.id !== selectedId));
        setSelectedId(null);
      }
      if (event.key === 'Escape') {
        setDraft(null);
        setSelectedId(null);
        setTool('select');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked, selectedId]);

  const onPointerDown = (event) => {
    if (locked || !canvasRect) return;
    if (tool === 'select') return;
    if (tool === 'zoom') {
      applyZoom(clamp(zoom + (event.altKey ? -0.10 : 0.10), MIN_ZOOM, MAX_ZOOM), false);
      return;
    }
    const point = normalizedPoint(event, canvasRect);
    if (tool === 'text') {
      const value = window.prompt(language === 'ar' ? 'أدخل النص' : 'Enter text');
      if (value) setShapes((current) => [...current, { id: crypto.randomUUID(), type: 'text', x: point.x, y: point.y, text: value }]);
      return;
    }
    startRef.current = point;
    setDraft({ id: 'draft', type: tool, x1: point.x, y1: point.y, x2: point.x, y2: point.y });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!draft || !canvasRect || locked) return;
    const point = normalizedPoint(event, canvasRect);
    setDraft((current) => current ? { ...current, x2: point.x, y2: point.y } : null);
  };

  const onPointerUp = () => {
    if (!draft || locked) return;
    const dx = Math.abs(draft.x2 - draft.x1);
    const dy = Math.abs(draft.y2 - draft.y1);
    if (dx + dy > 0.004) setShapes((current) => [...current, { ...draft, id: crypto.randomUUID() }]);
    setDraft(null);
  };

  const openConnection = () => {
    const candidate = Array.from(document.querySelectorAll('button')).find((button) => {
      const title = String(button.title || button.getAttribute('aria-label') || '').toLowerCase();
      return title.includes('connection') || title.includes('الاتصال');
    });
    candidate?.click();
  };

  const toggleLanguage = () => {
    const languageButton = document.getElementById('gannzilla-bilingual-toggle-v95');
    languageButton?.click();
    window.setTimeout(() => setLanguage(document.documentElement.lang === 'ar' ? 'ar' : 'en'), 30);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch (_) {
      fitToScreen();
    }
  };

  const renderShape = (shape) => {
    const w = canvasRect?.width || 1;
    const h = canvasRect?.height || 1;
    if (shape.type === 'text') {
      return <text key={shape.id} x={shape.x * w} y={shape.y * h} fontSize="18" fontWeight="700" fill="#1268a7" stroke="#fff" strokeWidth="3" paintOrder="stroke" onPointerDown={(event) => { event.stopPropagation(); if (!locked && tool === 'select') setSelectedId(shape.id); }}>{shape.text}</text>;
    }
    const x1 = shape.x1 * w; const y1 = shape.y1 * h; const x2 = shape.x2 * w; const y2 = shape.y2 * h;
    const selected = selectedId === shape.id;
    const common = { stroke: selected ? '#ef8a00' : '#1573b4', strokeWidth: selected ? 3 : 2, fill: 'none', vectorEffect: 'non-scaling-stroke', onPointerDown: (event) => { event.stopPropagation(); if (!locked && tool === 'select') setSelectedId(shape.id); } };
    if (shape.type === 'rect') return <rect key={shape.id} x={Math.min(x1, x2)} y={Math.min(y1, y2)} width={Math.abs(x2 - x1)} height={Math.abs(y2 - y1)} {...common} />;
    if (shape.type === 'ellipse') return <ellipse key={shape.id} cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} rx={Math.abs(x2 - x1) / 2} ry={Math.abs(y2 - y1) / 2} {...common} />;
    const markerEnd = shape.type === 'arrow' ? 'url(#gannzilla-arrow-v97)' : undefined;
    return <line key={shape.id} x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={markerEnd} {...common} />;
  };

  const allShapes = draft ? [...shapes, draft] : shapes;
  const lineOptions = [
    { value: 'line', label: language === 'ar' ? 'خط' : 'Line', icon: <LineIcon /> },
    { value: 'arrow', label: language === 'ar' ? 'سهم' : 'Arrow', icon: <LineIcon arrow /> },
  ];
  const shapeOptions = [
    { value: 'rect', label: language === 'ar' ? 'مستطيل' : 'Rectangle', icon: <RectIcon /> },
    { value: 'ellipse', label: language === 'ar' ? 'دائرة / بيضاوي' : 'Ellipse', icon: <RectIcon ellipse /> },
  ];

  return (
    <>
      <div style={{ position: 'fixed', left: 330, right: 0, top: 0, height: 24, zIndex: 2147483600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, paddingRight: 6, background: '#efefef', borderBottom: '1px solid #bdbdbd', direction: 'ltr', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
        <ToolButton active={tool === 'select'} title={language === 'ar' ? 'أداة التحديد' : 'Select tool'} onClick={() => setTool('select')}><PointerIcon /></ToolButton>
        <SplitTool active={tool === 'line' || tool === 'arrow'} title={language === 'ar' ? 'أدوات الخط' : 'Line tools'} icon={tool === 'arrow' ? <LineIcon arrow /> : <LineIcon />} options={lineOptions} onSelect={setTool} />
        <SplitTool active={tool === 'rect' || tool === 'ellipse'} title={language === 'ar' ? 'أدوات الأشكال' : 'Shape tools'} icon={tool === 'ellipse' ? <RectIcon ellipse /> : <RectIcon />} options={shapeOptions} onSelect={setTool} />
        <ToolButton active={tool === 'text'} title={language === 'ar' ? 'إضافة نص' : 'Text tool'} onClick={() => setTool('text')}><TextIcon /></ToolButton>
        <ToolButton active={locked} title={language === 'ar' ? 'قفل أدوات الرسم' : 'Lock drawings'} onClick={() => setLocked((value) => !value)}><LockIcon locked={locked} /></ToolButton>
        <ToolButton active={tool === 'zoom'} title={language === 'ar' ? 'تصغير' : 'Zoom out'} onClick={() => applyZoom(zoom - (zoom > 1 ? 0.10 : 0.05), true)}><ZoomIcon plus={false} /></ToolButton>
        <button type="button" title={language === 'ar' ? 'إعادة إلى 100%' : 'Reset to 100%'} onClick={() => applyZoom(1, true)} style={{ minWidth: 55, height: 24, border: 0, background: 'transparent', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>{Math.round(zoom * 100)}%</button>
        <ToolButton title={language === 'ar' ? 'تكبير' : 'Zoom in'} onClick={() => applyZoom(zoom + (zoom >= 1 ? 0.10 : 0.05), true)}><ZoomIcon plus /></ToolButton>
        <ToolButton title={language === 'ar' ? 'ملء الشاشة' : 'Fullscreen'} onClick={toggleFullscreen}><FullscreenIcon /></ToolButton>
        <ToolButton title={language === 'ar' ? 'إعدادات الاتصال' : 'Connection settings'} onClick={openConnection}><ConnectionIcon /></ToolButton>
        <button type="button" onClick={toggleLanguage} title={language === 'ar' ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'} style={{ height: 24, minWidth: 100, padding: '0 7px', border: 0, background: 'transparent', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>{language === 'ar' ? '🇸🇦 العربية' : '🇬🇧 English'} ▾</button>
        <ToolButton title={language === 'ar' ? 'معلومات الأدوات' : 'Toolbar information'} onClick={() => setInfoOpen(true)}><InfoIcon /></ToolButton>
      </div>

      {canvasRect && (
        <svg
          style={{ position: 'fixed', left: canvasRect.left, top: canvasRect.top, width: canvasRect.width, height: canvasRect.height, zIndex: 2147483500, pointerEvents: locked ? 'none' : 'auto', cursor: tool === 'text' ? 'text' : tool === 'select' ? 'default' : tool === 'zoom' ? 'zoom-in' : 'crosshair' }}
          width={canvasRect.width}
          height={canvasRect.height}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <defs><marker id="gannzilla-arrow-v97" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#1573b4" /></marker></defs>
          {allShapes.map(renderShape)}
        </svg>
      )}

      {infoOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2147483646, background: 'rgba(0,0,0,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseDown={() => setInfoOpen(false)}>
          <div dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ width: 390, background: '#fff', border: '1px solid #888', boxShadow: '0 8px 24px rgba(0,0,0,.3)', padding: 16, fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif' }} onMouseDown={(event) => event.stopPropagation()}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>{language === 'ar' ? 'أدوات جانزيلا' : 'Gannzilla toolbar'}</div>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              {language === 'ar'
                ? 'التحديد، رسم الخط والسهم، المستطيل والدائرة، إضافة النص، قفل الرسومات، التصغير والتكبير، إعادة 100%، ملء الشاشة، إعدادات الاتصال، واللغة. حدد أي رسم واضغط Delete لحذفه، واضغط Esc للعودة إلى أداة التحديد.'
                : 'Select, draw lines and arrows, rectangles and ellipses, add text, lock drawings, zoom out/in, reset to 100%, fullscreen, connection settings, and language. Select a drawing and press Delete to remove it; press Esc to return to Select.'}
            </div>
            <button type="button" onClick={() => setInfoOpen(false)} style={{ marginTop: 14, minWidth: 70, height: 28 }}>{language === 'ar' ? 'إغلاق' : 'Close'}</button>
          </div>
        </div>
      )}
    </>
  );
}
