import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = '176';
const TOOLBAR_ID = 'gannzilla-toolbar-direct-v176';
const DRAW_LAYER_ID = 'gannzilla-draw-layer-v176';
const STORAGE_KEY = 'gannzillaDrawingToolsVisibleV125';
const ORIGINAL_LABELS = new Set(['↖', '—', '▢', 'T', '🔒', '🔐', '⌕', '🔍', '🔎', '⛶', '⤢', '↗']);

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function inside(rect, x, y) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function point(rect, x, y) {
  return {
    x: Math.max(0, Math.min(1, (x - rect.left) / Math.max(1, rect.width))),
    y: Math.max(0, Math.min(1, (y - rect.top) / Math.max(1, rect.height))),
  };
}

function readPalettesVisible() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value !== null) return value !== 'false';
  } catch (_) {}
  const query = new URLSearchParams(window.location.search);
  return query.get('drawingTools') !== 'false';
}

function applyPalettesVisible(visible) {
  window.__gannzillaDrawingToolsVisibleV125 = visible;
  try { localStorage.setItem(STORAGE_KEY, String(visible)); } catch (_) {}

  const selectors = [
    '[data-gannzilla-left-reference-palette="true"]',
    '[data-gannzilla-right-drawing-palette="true"]',
    '[id^="gannzilla-left-reference-palette-"]',
    '[id^="gannzilla-left-drawing-palette-"]',
    '[id^="gannzilla-right-drawing-palette-"]',
  ].join(',');

  document.querySelectorAll(selectors).forEach((element) => {
    element.style.setProperty('display', visible ? 'flex' : 'none', 'important');
    element.style.setProperty('visibility', visible ? 'visible' : 'hidden', 'important');
    element.style.setProperty('pointer-events', visible ? 'auto' : 'none', 'important');
  });

  const detail = { visible, source: `toolbar-direct-v${BUILD}` };
  window.dispatchEvent(new CustomEvent('gannzilla:drawing-tools-visibility-v125', { detail }));
  window.dispatchEvent(new CustomEvent('gannzilla:drawing-tools-visibility', { detail }));
}

function toggleFullscreen() {
  const root = document.documentElement;
  const active = document.fullscreenElement || document.webkitFullscreenElement;
  if (active) {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    return undefined;
  }
  if (root.requestFullscreen) return root.requestFullscreen();
  if (root.webkitRequestFullscreen) return root.webkitRequestFullscreen();
  return undefined;
}

const buttonBase = {
  width: 26,
  minWidth: 26,
  height: 23,
  padding: 0,
  margin: 0,
  border: '1px solid #8fa5b4',
  borderRadius: 3,
  color: '#1c75bc',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  pointerEvents: 'auto',
  touchAction: 'manipulation',
  userSelect: 'none',
  boxSizing: 'border-box',
  font: '800 15px Segoe UI Symbol, Segoe UI, Arial, sans-serif',
  lineHeight: 1,
};

export default function GannzillaToolbarDirectV176() {
  const [activeTool, setActiveTool] = React.useState('select');
  const [locked, setLocked] = React.useState(false);
  const [palettesVisible, setPalettesVisible] = React.useState(readPalettesVisible);
  const [fullscreen, setFullscreen] = React.useState(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
  const [canvasRect, setCanvasRect] = React.useState(null);
  const [shapes, setShapes] = React.useState([]);
  const [draft, setDraft] = React.useState(null);
  const [selectedId, setSelectedId] = React.useState(null);

  React.useEffect(() => {
    const sync = () => {
      const canvas = findWheelCanvas();
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setCanvasRect((current) => current
          && current.left === rect.left
          && current.top === rect.top
          && current.width === rect.width
          && current.height === rect.height
          ? current
          : { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height });
        canvas.style.setProperty('cursor', locked ? 'not-allowed' : activeTool === 'select' ? 'default' : activeTool === 'text' ? 'text' : 'crosshair', 'important');
      }

      document.querySelectorAll('button').forEach((button) => {
        if (button.closest(`#${TOOLBAR_ID}`)) return;
        const rect = button.getBoundingClientRect();
        const label = String(button.textContent || '').replace(/\s+/g, '').trim();
        if (rect.top >= 0 && rect.bottom <= 44 && ORIGINAL_LABELS.has(label)) {
          button.style.setProperty('display', 'none', 'important');
          button.style.setProperty('pointer-events', 'none', 'important');
        }
      });
    };

    sync();
    const timer = window.setInterval(sync, 800);
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, [activeTool, locked]);

  React.useEffect(() => {
    applyPalettesVisible(palettesVisible);
  }, [palettesVisible]);

  React.useEffect(() => {
    const onFullscreenChange = () => {
      setFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
      window.scrollTo(0, 0);
      window.setTimeout(() => window.dispatchEvent(new Event('resize')), 120);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  React.useEffect(() => {
    const down = (event) => {
      if (!canvasRect || locked || activeTool === 'select') return;
      if (event.target instanceof Element && event.target.closest(`#${TOOLBAR_ID}`)) return;
      if (!inside(canvasRect, event.clientX, event.clientY)) return;

      event.preventDefault();
      const p = point(canvasRect, event.clientX, event.clientY);
      if (activeTool === 'text') {
        const value = window.prompt('اكتب النص المطلوب');
        if (value?.trim()) {
          setShapes((current) => [...current, { id: `${Date.now()}-${Math.random()}`, type: 'text', x: p.x, y: p.y, text: value.trim() }]);
        }
        return;
      }
      setDraft({ type: activeTool, x1: p.x, y1: p.y, x2: p.x, y2: p.y });
    };

    const move = (event) => {
      if (!draft || !canvasRect) return;
      const p = point(canvasRect, event.clientX, event.clientY);
      setDraft((current) => current ? { ...current, x2: p.x, y2: p.y } : current);
    };

    const up = () => {
      if (!draft) return;
      const distance = Math.hypot(draft.x2 - draft.x1, draft.y2 - draft.y1);
      if (distance > 0.004) {
        setShapes((current) => [...current, { ...draft, id: `${Date.now()}-${Math.random()}` }]);
      }
      setDraft(null);
    };

    window.addEventListener('pointerdown', down, true);
    window.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', up, true);
    window.addEventListener('pointercancel', up, true);
    return () => {
      window.removeEventListener('pointerdown', down, true);
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', up, true);
      window.removeEventListener('pointercancel', up, true);
    };
  }, [activeTool, canvasRect, draft, locked]);

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId && !locked) {
        setShapes((current) => current.filter((shape) => shape.id !== selectedId));
        setSelectedId(null);
      }
      if (event.key === 'Escape') {
        setDraft(null);
        setActiveTool('select');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [locked, selectedId]);

  const tools = [
    { key: 'select', label: '↖', title: 'تحديد الرسومات' },
    { key: 'line', label: '—', title: 'رسم خط' },
    { key: 'rectangle', label: '▢', title: 'رسم مستطيل' },
    { key: 'text', label: 'T', title: 'إضافة نص' },
    { key: 'lock', label: locked ? '🔐' : '🔒', title: locked ? 'فتح القفل' : 'قفل الرسومات' },
    { key: 'palettes', label: '⌕', title: palettesVisible ? 'إخفاء أدوات الرسم الجانبية' : 'إظهار أدوات الرسم الجانبية' },
    { key: 'fullscreen', label: '⛶', title: fullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة بالكامل' },
  ];

  const activate = (key, event) => {
    event.preventDefault();
    event.stopPropagation();
    if (key === 'lock') {
      setLocked((value) => !value);
      return;
    }
    if (key === 'palettes') {
      setPalettesVisible((value) => !value);
      return;
    }
    if (key === 'fullscreen') {
      window.scrollTo(0, 0);
      try { toggleFullscreen()?.catch?.(() => {}); } catch (_) {}
      return;
    }
    if (!locked) {
      setActiveTool(key);
      setSelectedId(null);
    }
  };

  const toolbar = createPortal(
    <div id={TOOLBAR_ID} data-build={BUILD} style={{
      position: 'fixed',
      right: 8,
      top: 1,
      zIndex: 2147483647,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2,
      height: 23,
      padding: 0,
      margin: 0,
      background: '#efefef',
      pointerEvents: 'auto',
    }}>
      {tools.map((tool) => {
        const active = (['select', 'line', 'rectangle', 'text'].includes(tool.key) && activeTool === tool.key)
          || (tool.key === 'lock' && locked)
          || (tool.key === 'palettes' && palettesVisible)
          || (tool.key === 'fullscreen' && fullscreen);
        return (
          <button
            key={tool.key}
            type="button"
            title={tool.title}
            aria-label={tool.title}
            aria-pressed={active}
            onPointerDown={(event) => activate(tool.key, event)}
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}
            style={{
              ...buttonBase,
              background: active ? '#d9edf9' : '#f7f7f7',
              boxShadow: active ? 'inset 0 0 0 1px #5f9fc5' : 'none',
            }}
          >
            {tool.label}
          </button>
        );
      })}
    </div>,
    document.body,
  );

  const drawingLayer = canvasRect ? createPortal(
    <svg id={DRAW_LAYER_ID} width={canvasRect.width} height={canvasRect.height} viewBox={`0 0 ${canvasRect.width} ${canvasRect.height}`} style={{
      position: 'fixed',
      left: canvasRect.left,
      top: canvasRect.top,
      width: canvasRect.width,
      height: canvasRect.height,
      zIndex: 2147483500,
      overflow: 'visible',
      pointerEvents: 'none',
    }}>
      {shapes.map((shape) => {
        const selected = selectedId === shape.id;
        if (shape.type === 'line') {
          return <line key={shape.id} x1={shape.x1 * canvasRect.width} y1={shape.y1 * canvasRect.height} x2={shape.x2 * canvasRect.width} y2={shape.y2 * canvasRect.height} stroke={selected ? '#e29018' : '#1c75bc'} strokeWidth={selected ? 3 : 2} />;
        }
        if (shape.type === 'rectangle') {
          return <rect key={shape.id} x={Math.min(shape.x1, shape.x2) * canvasRect.width} y={Math.min(shape.y1, shape.y2) * canvasRect.height} width={Math.abs(shape.x2 - shape.x1) * canvasRect.width} height={Math.abs(shape.y2 - shape.y1) * canvasRect.height} fill="none" stroke={selected ? '#e29018' : '#1c75bc'} strokeWidth={selected ? 3 : 2} />;
        }
        return <text key={shape.id} x={shape.x * canvasRect.width} y={shape.y * canvasRect.height} fill={selected ? '#e29018' : '#1c75bc'} fontSize="18" fontWeight="700" textAnchor="middle">{shape.text}</text>;
      })}
      {draft?.type === 'line' && <line x1={draft.x1 * canvasRect.width} y1={draft.y1 * canvasRect.height} x2={draft.x2 * canvasRect.width} y2={draft.y2 * canvasRect.height} stroke="#1c75bc" strokeWidth="2" strokeDasharray="6 4" />}
      {draft?.type === 'rectangle' && <rect x={Math.min(draft.x1, draft.x2) * canvasRect.width} y={Math.min(draft.y1, draft.y2) * canvasRect.height} width={Math.abs(draft.x2 - draft.x1) * canvasRect.width} height={Math.abs(draft.y2 - draft.y1) * canvasRect.height} fill="none" stroke="#1c75bc" strokeWidth="2" strokeDasharray="6 4" />}
    </svg>,
    document.body,
  ) : null;

  React.useEffect(() => {
    window.GANNZILLA_TOOLBAR_DIRECT_V176 = true;
    window.__auditGannzillaToolbarDirectV176 = () => ({
      ok: Boolean(document.getElementById(TOOLBAR_ID)),
      build: BUILD,
      activeTool,
      locked,
      palettesVisible,
      fullscreen: Boolean(document.fullscreenElement || document.webkitFullscreenElement),
      shapeCount: shapes.length,
    });
  }, [activeTool, fullscreen, locked, palettesVisible, shapes.length]);

  return <>{toolbar}{drawingLayer}</>;
}
