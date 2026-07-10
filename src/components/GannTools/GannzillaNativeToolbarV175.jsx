import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = '175';
const MOUNT_ID = 'gannzilla-native-toolbar-v175';
const DRAW_LAYER_ID = 'gannzilla-native-draw-layer-v175';
const LEGACY_HITBOX_ID = 'gannzilla-drawing-tools-hitbox-v125';
const TOOL_LABELS = ['↖', '—', '▢', 'T', '🔒', '🔐', '⌕', '🔍', '🔎', '🔍︎', '⛶', '⤢', '↗', '⛶︎'];
const STORAGE_KEYS = [
  'gannzillaDrawingToolsVisibleV125',
  'gannzillaDrawingToolsVisibleV124',
  'gannzillaDrawingToolsVisibleV123',
  'gannzillaDrawingToolsVisibleV122',
];

function textOf(element) {
  return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
}

function readDrawingVisible() {
  const query = new URLSearchParams(window.location.search);
  const requested = query.get('drawingTools') || query.get('showDrawingTools');
  if (requested === 'true') return true;
  if (requested === 'false') return false;
  try {
    for (const key of STORAGE_KEYS) {
      const stored = localStorage.getItem(key);
      if (stored !== null) return stored !== 'false';
    }
  } catch (_) {}
  return true;
}

function persistDrawingVisible(value) {
  window.__gannzillaDrawingToolsVisibleV125 = value;
  try {
    STORAGE_KEYS.forEach((key) => localStorage.setItem(key, String(value)));
  } catch (_) {}
  const detail = { visible: value, source: `native-toolbar-v${BUILD}` };
  window.dispatchEvent(new CustomEvent('gannzilla:drawing-tools-visibility-v125', { detail }));
  window.dispatchEvent(new CustomEvent('gannzilla:drawing-tools-visibility', { detail }));
}

function applyDrawingVisibility(value) {
  const selector = [
    '[data-gannzilla-left-reference-palette="true"]',
    '[data-gannzilla-right-drawing-palette="true"]',
    '[id^="gannzilla-left-reference-palette-"]',
    '[id^="gannzilla-left-drawing-palette-"]',
    '[id^="gannzilla-right-drawing-palette-"]',
  ].join(',');

  document.querySelectorAll(selector).forEach((element) => {
    element.style.setProperty('display', value ? 'flex' : 'none', 'important');
    element.style.setProperty('visibility', value ? 'visible' : 'hidden', 'important');
    element.style.setProperty('pointer-events', value ? 'auto' : 'none', 'important');
    element.setAttribute('aria-hidden', value ? 'false' : 'true');
  });
}

function findToolbarAnchor() {
  const candidates = Array.from(document.querySelectorAll('button')).filter((button) => {
    const rect = button.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= 44 && TOOL_LABELS.includes(textOf(button));
  });
  return candidates[0] || null;
}

function prepareInlineMount() {
  let mount = document.getElementById(MOUNT_ID);
  const anchor = findToolbarAnchor();
  if (!anchor?.parentElement) return null;

  if (!mount) {
    mount = document.createElement('div');
    mount.id = MOUNT_ID;
    mount.style.display = 'inline-flex';
    mount.style.alignItems = 'center';
    mount.style.gap = '2px';
    mount.style.height = '24px';
    mount.style.flex = '0 0 auto';
    mount.style.pointerEvents = 'auto';
    anchor.parentElement.insertBefore(mount, anchor);
  } else if (mount.parentElement !== anchor.parentElement) {
    anchor.parentElement.insertBefore(mount, anchor);
  }

  Array.from(anchor.parentElement.querySelectorAll('button')).forEach((button) => {
    if (button.closest(`#${MOUNT_ID}`)) return;
    if (!TOOL_LABELS.includes(textOf(button))) return;
    button.style.setProperty('display', 'none', 'important');
    button.style.setProperty('pointer-events', 'none', 'important');
    button.setAttribute('aria-hidden', 'true');
  });

  const legacyHitbox = document.getElementById(LEGACY_HITBOX_ID);
  if (legacyHitbox) {
    legacyHitbox.style.setProperty('display', 'none', 'important');
    legacyHitbox.style.setProperty('pointer-events', 'none', 'important');
  }

  return mount;
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function requestFullscreenDirect() {
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

function pointForEvent(event, rect) {
  return {
    x: Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width))),
    y: Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height))),
  };
}

const buttonStyle = {
  width: 22,
  minWidth: 22,
  height: 21,
  padding: 0,
  margin: 0,
  border: '1px solid #a7a7a7',
  borderRadius: 2,
  color: '#1c75bc',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  pointerEvents: 'auto',
  touchAction: 'manipulation',
  userSelect: 'none',
  boxSizing: 'border-box',
  font: '800 14px Segoe UI Symbol, Segoe UI, Arial, sans-serif',
  lineHeight: 1,
};

export default function GannzillaNativeToolbarV175() {
  const [mount, setMount] = React.useState(null);
  const [activeTool, setActiveTool] = React.useState('select');
  const [locked, setLocked] = React.useState(false);
  const [drawingVisible, setDrawingVisible] = React.useState(readDrawingVisible);
  const [fullscreen, setFullscreen] = React.useState(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
  const [canvasRect, setCanvasRect] = React.useState(null);
  const [shapes, setShapes] = React.useState([]);
  const [draft, setDraft] = React.useState(null);
  const [selectedId, setSelectedId] = React.useState(null);
  const [language, setLanguage] = React.useState(document.documentElement.lang === 'ar' ? 'ar' : 'en');

  React.useEffect(() => {
    const sync = () => {
      const inlineMount = prepareInlineMount();
      if (inlineMount) setMount((current) => current === inlineMount ? current : inlineMount);
      const canvas = findWheelCanvas();
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setCanvasRect((current) => current
          && current.left === rect.left
          && current.top === rect.top
          && current.width === rect.width
          && current.height === rect.height
          ? current
          : { left: rect.left, top: rect.top, width: rect.width, height: rect.height });
        canvas.style.setProperty('cursor', locked ? 'not-allowed' : activeTool === 'select' ? 'default' : activeTool === 'text' ? 'text' : 'crosshair', 'important');
      }
      setLanguage(document.documentElement.lang === 'ar' ? 'ar' : 'en');
      applyDrawingVisibility(drawingVisible);
    };

    sync();
    const timer = window.setInterval(sync, 500);
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, [activeTool, drawingVisible, locked]);

  React.useEffect(() => {
    persistDrawingVisible(drawingVisible);
    applyDrawingVisibility(drawingVisible);
  }, [drawingVisible]);

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
    const onKeyDown = (event) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId && !locked) {
        setShapes((current) => current.filter((shape) => shape.id !== selectedId));
        setSelectedId(null);
      }
      if (event.key === 'Escape') {
        setActiveTool('select');
        setDraft(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [locked, selectedId]);

  const activate = React.useCallback((tool, event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.nativeEvent?.stopImmediatePropagation?.();

    if (tool === 'lock') {
      setLocked((current) => {
        const next = !current;
        if (next) setActiveTool('select');
        return next;
      });
      return;
    }
    if (tool === 'palettes') {
      setDrawingVisible((current) => !current);
      return;
    }
    if (tool === 'fullscreen') {
      window.scrollTo(0, 0);
      try {
        const result = requestFullscreenDirect();
        result?.catch?.(() => {});
      } catch (_) {}
      return;
    }
    if (locked) return;
    setActiveTool(tool);
    setSelectedId(null);
  }, [locked]);

  const ar = language === 'ar';
  const tools = [
    { key: 'select', label: '↖', title: ar ? 'تحديد الرسومات' : 'Select drawings' },
    { key: 'line', label: '—', title: ar ? 'رسم خط' : 'Draw line' },
    { key: 'rectangle', label: '▢', title: ar ? 'رسم مستطيل' : 'Draw rectangle' },
    { key: 'text', label: 'T', title: ar ? 'إضافة نص' : 'Add text' },
    { key: 'lock', label: locked ? '🔐' : '🔒', title: locked ? (ar ? 'فتح قفل الرسومات' : 'Unlock drawings') : (ar ? 'قفل الرسومات' : 'Lock drawings') },
    { key: 'palettes', label: '⌕', title: drawingVisible ? (ar ? 'إخفاء أدوات الرسم الجانبية' : 'Hide side drawing tools') : (ar ? 'إظهار أدوات الرسم الجانبية' : 'Show side drawing tools') },
    { key: 'fullscreen', label: '⛶', title: fullscreen ? (ar ? 'الخروج من ملء الشاشة' : 'Exit fullscreen') : (ar ? 'ملء الشاشة' : 'Enter fullscreen') },
  ];

  const toolbar = mount ? createPortal(
    <>
      {tools.map((tool) => {
        const active = (['select', 'line', 'rectangle', 'text'].includes(tool.key) && activeTool === tool.key)
          || (tool.key === 'lock' && locked)
          || (tool.key === 'palettes' && drawingVisible)
          || (tool.key === 'fullscreen' && fullscreen);
        return (
          <button
            key={tool.key}
            type="button"
            title={tool.title}
            aria-label={tool.title}
            aria-pressed={active}
            onPointerDown={(event) => activate(tool.key, event)}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            style={{
              ...buttonStyle,
              background: active ? '#d9edf9' : '#f7f7f7',
              boxShadow: active ? 'inset 0 0 0 1px #5f9fc5' : 'none',
            }}
          >
            {tool.label}
          </button>
        );
      })}
    </>,
    mount,
  ) : null;

  const finishDraft = () => {
    if (!draft) return;
    const distance = Math.hypot(draft.x2 - draft.x1, draft.y2 - draft.y1);
    if (distance > 0.004) {
      setShapes((current) => [...current, { ...draft, id: `${Date.now()}-${Math.random()}` }]);
    }
    setDraft(null);
  };

  const drawingLayer = canvasRect ? createPortal(
    <svg
      id={DRAW_LAYER_ID}
      viewBox={`0 0 ${canvasRect.width} ${canvasRect.height}`}
      style={{
        position: 'fixed',
        left: canvasRect.left,
        top: canvasRect.top,
        width: canvasRect.width,
        height: canvasRect.height,
        zIndex: 2147483400,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      {shapes.map((shape) => {
        const selected = shape.id === selectedId;
        const common = {
          stroke: selected ? '#e29018' : '#1c75bc',
          strokeWidth: selected ? 3 : 2,
          fill: 'none',
          pointerEvents: activeTool === 'select' && !locked ? 'stroke' : 'none',
          onPointerDown: (event) => {
            event.stopPropagation();
            setSelectedId(shape.id);
          },
        };
        if (shape.type === 'line') {
          return <line key={shape.id} x1={shape.x1 * canvasRect.width} y1={shape.y1 * canvasRect.height} x2={shape.x2 * canvasRect.width} y2={shape.y2 * canvasRect.height} {...common} />;
        }
        if (shape.type === 'rectangle') {
          return <rect key={shape.id} x={Math.min(shape.x1, shape.x2) * canvasRect.width} y={Math.min(shape.y1, shape.y2) * canvasRect.height} width={Math.abs(shape.x2 - shape.x1) * canvasRect.width} height={Math.abs(shape.y2 - shape.y1) * canvasRect.height} {...common} />;
        }
        return (
          <text
            key={shape.id}
            x={shape.x * canvasRect.width}
            y={shape.y * canvasRect.height}
            fill={selected ? '#e29018' : '#1c75bc'}
            fontSize="18"
            fontWeight="700"
            textAnchor="middle"
            pointerEvents={activeTool === 'select' && !locked ? 'all' : 'none'}
            onPointerDown={(event) => {
              event.stopPropagation();
              setSelectedId(shape.id);
            }}
          >
            {shape.text}
          </text>
        );
      })}

      {draft?.type === 'line' && <line x1={draft.x1 * canvasRect.width} y1={draft.y1 * canvasRect.height} x2={draft.x2 * canvasRect.width} y2={draft.y2 * canvasRect.height} stroke="#1c75bc" strokeWidth="2" strokeDasharray="6 4" />}
      {draft?.type === 'rectangle' && <rect x={Math.min(draft.x1, draft.x2) * canvasRect.width} y={Math.min(draft.y1, draft.y2) * canvasRect.height} width={Math.abs(draft.x2 - draft.x1) * canvasRect.width} height={Math.abs(draft.y2 - draft.y1) * canvasRect.height} fill="none" stroke="#1c75bc" strokeWidth="2" strokeDasharray="6 4" />}

      {!locked && ['line', 'rectangle', 'text'].includes(activeTool) && (
        <rect
          x="0"
          y="0"
          width={canvasRect.width}
          height={canvasRect.height}
          fill="transparent"
          pointerEvents="all"
          style={{ cursor: activeTool === 'text' ? 'text' : 'crosshair' }}
          onPointerDown={(event) => {
            event.preventDefault();
            const point = pointForEvent(event, canvasRect);
            if (activeTool === 'text') {
              const value = window.prompt(ar ? 'اكتب النص المطلوب' : 'Enter text');
              if (value?.trim()) {
                setShapes((current) => [...current, { id: `${Date.now()}-${Math.random()}`, type: 'text', x: point.x, y: point.y, text: value.trim() }]);
              }
              return;
            }
            event.currentTarget.setPointerCapture?.(event.pointerId);
            setDraft({ type: activeTool, x1: point.x, y1: point.y, x2: point.x, y2: point.y });
          }}
          onPointerMove={(event) => {
            if (!draft) return;
            const point = pointForEvent(event, canvasRect);
            setDraft((current) => current ? { ...current, x2: point.x, y2: point.y } : current);
          }}
          onPointerUp={finishDraft}
          onPointerCancel={() => setDraft(null)}
        />
      )}
    </svg>,
    document.body,
  ) : null;

  React.useEffect(() => {
    window.GANNZILLA_NATIVE_TOOLBAR_V175 = true;
    window.__auditGannzillaNativeToolbarV175 = () => ({
      ok: Boolean(document.getElementById(MOUNT_ID)),
      build: BUILD,
      activeTool,
      locked,
      drawingVisible,
      fullscreen: Boolean(document.fullscreenElement || document.webkitFullscreenElement),
      shapeCount: shapes.length,
    });
  }, [activeTool, drawingVisible, fullscreen, locked, shapes.length]);

  return <>{toolbar}{drawingLayer}</>;
}
