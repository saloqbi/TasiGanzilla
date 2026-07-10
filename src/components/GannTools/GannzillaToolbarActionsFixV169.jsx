import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = '173';
const OVERLAY_PREFIX = 'gannzilla-toolbar-action-v173-';
const DRAW_LAYER_ID = 'gannzilla-toolbar-drawing-layer-v173';
const SHAPES_KEY = 'gannzillaToolbarDrawingsV173';
const LEGACY_HITBOX_ID = 'gannzilla-drawing-tools-hitbox-v125';
const STORAGE_KEYS = [
  'gannzillaDrawingToolsVisibleV125',
  'gannzillaDrawingToolsVisibleV124',
  'gannzillaDrawingToolsVisibleV123',
  'gannzillaDrawingToolsVisibleV122',
];

const TOOL_DEFS = [
  { key: 'select', labels: ['↖'] },
  { key: 'line', labels: ['—'] },
  { key: 'rectangle', labels: ['▢'] },
  { key: 'text', labels: ['T'] },
  { key: 'lock', labels: ['🔒', '🔐'] },
  { key: 'palettes', labels: ['⌕', '🔍', '🔎', '🔍︎'] },
  { key: 'fullscreen', labels: ['⛶', '⤢', '↗', '⛶︎'] },
];

function textOf(element) {
  return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
}

function isVisibleTopButton(button) {
  if (!button) return false;
  const rect = button.getBoundingClientRect?.();
  const style = window.getComputedStyle(button);
  return Boolean(rect)
    && rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.bottom <= 44
    && style.display !== 'none'
    && style.visibility !== 'hidden'
    && style.opacity !== '0';
}

function toolKeyForButton(button) {
  if (!button || String(button.id || '').startsWith(OVERLAY_PREFIX)) return null;
  if (!isVisibleTopButton(button)) return null;
  const label = textOf(button);
  return TOOL_DEFS.find((tool) => tool.labels.includes(label))?.key || null;
}

function findNativeButtons() {
  const buttons = Array.from(document.querySelectorAll('button'))
    .filter((button) => !String(button.id || '').startsWith(OVERLAY_PREFIX))
    .filter(isVisibleTopButton);

  const found = {};
  TOOL_DEFS.forEach((tool) => {
    found[tool.key] = buttons.find((button) => tool.labels.includes(textOf(button))) || null;
  });
  return found;
}

function rectOf(element, padding = 0) {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  return {
    left: Math.round(rect.left - padding),
    top: Math.round(rect.top - padding),
    width: Math.max(22, Math.round(rect.width + padding * 2)),
    height: Math.max(21, Math.round(rect.height + padding * 2)),
  };
}

function sameRect(a, b) {
  return Boolean(a && b)
    && a.left === b.left
    && a.top === b.top
    && a.width === b.width
    && a.height === b.height;
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function loadShapes() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SHAPES_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function saveShapes(shapes) {
  try {
    localStorage.setItem(SHAPES_KEY, JSON.stringify(shapes));
  } catch (_) {}
}

function readDrawingVisible() {
  if (typeof window.__gannzillaDrawingToolsVisibleV125 === 'boolean') {
    return window.__gannzillaDrawingToolsVisibleV125;
  }
  const query = new URLSearchParams(window.location.search);
  const requested = query.get('drawingTools') || query.get('showDrawingTools');
  if (requested === 'true') return true;
  if (requested === 'false') return false;
  try {
    for (const key of STORAGE_KEYS) {
      const saved = localStorage.getItem(key);
      if (saved !== null) return saved !== 'false';
    }
  } catch (_) {}
  return true;
}

function persistDrawingVisible(visible) {
  window.__gannzillaDrawingToolsVisibleV125 = visible;
  try {
    STORAGE_KEYS.forEach((key) => localStorage.setItem(key, String(visible)));
  } catch (_) {}
  const detail = { visible, source: `toolbar-actions-v${BUILD}` };
  window.dispatchEvent(new CustomEvent('gannzilla:drawing-tools-visibility-v125', { detail }));
  window.dispatchEvent(new CustomEvent('gannzilla:drawing-tools-visibility', { detail }));
}

function setImportant(element, property, value) {
  if (!element) return;
  const current = element.style.getPropertyValue(property);
  const priority = element.style.getPropertyPriority(property);
  if (current !== value || priority !== 'important') {
    element.style.setProperty(property, value, 'important');
  }
}

function enforceDrawingVisibility(visible) {
  const selectors = [
    '[data-gannzilla-left-reference-palette="true"]',
    '[data-gannzilla-right-drawing-palette="true"]',
    '[id^="gannzilla-left-reference-palette-"]',
    '[id^="gannzilla-left-drawing-palette-"]',
    '[id^="gannzilla-right-drawing-palette-"]',
  ].join(',');

  document.querySelectorAll(selectors).forEach((element) => {
    setImportant(element, 'display', visible ? 'flex' : 'none');
    setImportant(element, 'visibility', visible ? 'visible' : 'hidden');
    setImportant(element, 'pointer-events', visible ? 'auto' : 'none');
    element.setAttribute('aria-hidden', visible ? 'false' : 'true');
  });
}

function requestFullscreenNow() {
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

function clickNative(button) {
  if (!button) return;
  button.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
  }));
}

function normalizedPoint(event, rect) {
  return {
    x: Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width))),
    y: Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height))),
  };
}

const baseButtonStyle = {
  position: 'fixed',
  zIndex: 2147483647,
  padding: 0,
  margin: 0,
  border: '1px solid #8fa5b4',
  borderRadius: 3,
  color: '#1c75bc',
  display: 'flex',
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

export default function GannzillaToolbarActionsFixV169() {
  const [rects, setRects] = React.useState({});
  const [canvasRect, setCanvasRect] = React.useState(null);
  const [activeTool, setActiveTool] = React.useState('select');
  const [locked, setLocked] = React.useState(false);
  const [drawingVisible, setDrawingVisible] = React.useState(readDrawingVisible);
  const [fullscreen, setFullscreen] = React.useState(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
  const [shapes, setShapes] = React.useState(loadShapes);
  const [draft, setDraft] = React.useState(null);
  const [selectedId, setSelectedId] = React.useState(null);
  const [language, setLanguage] = React.useState(document.documentElement.lang === 'ar' ? 'ar' : 'en');
  const sourcesRef = React.useRef({});
  const lastPointerRef = React.useRef({ key: '', time: 0 });

  const refresh = React.useCallback(() => {
    const legacyHitbox = document.getElementById(LEGACY_HITBOX_ID);
    if (legacyHitbox) {
      setImportant(legacyHitbox, 'display', 'none');
      setImportant(legacyHitbox, 'pointer-events', 'none');
    }

    const sources = findNativeButtons();
    sourcesRef.current = sources;
    const nextRects = {};
    Object.entries(sources).forEach(([key, button]) => {
      if (!button) return;
      nextRects[key] = rectOf(button, key === 'palettes' ? 2 : 1);
    });
    setRects((current) => JSON.stringify(current) === JSON.stringify(nextRects) ? current : nextRects);

    const canvas = findWheelCanvas();
    const nextCanvasRect = canvas ? rectOf(canvas) : null;
    setCanvasRect((current) => sameRect(current, nextCanvasRect) ? current : nextCanvasRect);
    setLanguage(document.documentElement.lang === 'ar' ? 'ar' : 'en');
    enforceDrawingVisibility(drawingVisible);

    if (canvas) {
      const cursor = locked ? 'not-allowed' : activeTool === 'select' ? 'default' : activeTool === 'text' ? 'text' : 'crosshair';
      setImportant(canvas, 'cursor', cursor);
    }
  }, [activeTool, drawingVisible, locked]);

  React.useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 500);
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
    };
  }, [refresh]);

  React.useEffect(() => {
    persistDrawingVisible(drawingVisible);
    enforceDrawingVisibility(drawingVisible);
  }, [drawingVisible]);

  React.useEffect(() => {
    saveShapes(shapes);
  }, [shapes]);

  React.useEffect(() => {
    const onFullscreenChange = () => {
      const value = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setFullscreen(value);
      window.scrollTo(0, 0);
      window.setTimeout(() => {
        clickNative(sourcesRef.current.fullscreen || findNativeButtons().fullscreen);
        window.dispatchEvent(new Event('resize'));
      }, 120);
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

  const activate = React.useCallback((tool) => {
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
        const result = requestFullscreenNow();
        result?.catch?.(() => clickNative(sourcesRef.current.fullscreen));
      } catch (_) {
        clickNative(sourcesRef.current.fullscreen);
      }
      return;
    }
    if (locked) return;
    setActiveTool(tool);
    setSelectedId(null);
    window.dispatchEvent(new CustomEvent('gannzilla:top-toolbar-tool-v173', { detail: { tool } }));
  }, [locked]);

  React.useEffect(() => {
    const nativeFallback = (event) => {
      const target = event.target instanceof Element ? event.target.closest('button') : null;
      if (!target || String(target.id || '').startsWith(OVERLAY_PREFIX)) return;
      const key = toolKeyForButton(target);
      if (!key) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      activate(key);
    };
    document.addEventListener('pointerdown', nativeFallback, true);
    return () => document.removeEventListener('pointerdown', nativeFallback, true);
  }, [activate]);

  const ar = language === 'ar';
  const titles = {
    select: ar ? 'تحديد العناصر' : 'Select',
    line: ar ? 'رسم خط' : 'Draw line',
    rectangle: ar ? 'رسم مستطيل' : 'Draw rectangle',
    text: ar ? 'إضافة نص' : 'Add text',
    lock: locked ? (ar ? 'إلغاء قفل الرسومات' : 'Unlock drawings') : (ar ? 'قفل الرسومات' : 'Lock drawings'),
    palettes: drawingVisible ? (ar ? 'إخفاء أدوات الرسم الجانبية' : 'Hide side drawing tools') : (ar ? 'إظهار أدوات الرسم الجانبية' : 'Show side drawing tools'),
    fullscreen: fullscreen ? (ar ? 'الخروج من ملء الشاشة' : 'Exit fullscreen') : (ar ? 'ملء الشاشة بالكامل' : 'Enter fullscreen'),
  };

  const labels = {
    select: '↖',
    line: '—',
    rectangle: '▢',
    text: 'T',
    lock: locked ? '🔐' : '🔒',
    palettes: '⌕',
    fullscreen: '⛶',
  };

  const toolbarButtons = TOOL_DEFS.map(({ key }) => {
    const rect = rects[key];
    if (!rect) return null;
    const active = (['select', 'line', 'rectangle', 'text'].includes(key) && activeTool === key)
      || (key === 'lock' && locked)
      || (key === 'palettes' && drawingVisible)
      || (key === 'fullscreen' && fullscreen);

    return createPortal(
      <button
        key={key}
        id={`${OVERLAY_PREFIX}${key}`}
        type="button"
        title={titles[key]}
        aria-label={titles[key]}
        aria-pressed={active}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          event.nativeEvent?.stopImmediatePropagation?.();
          const now = Date.now();
          if (lastPointerRef.current.key === key && now - lastPointerRef.current.time < 180) return;
          lastPointerRef.current = { key, time: now };
          activate(key);
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        style={{
          ...baseButtonStyle,
          ...rect,
          background: active ? '#d9edf9' : '#f7f7f7',
          boxShadow: active ? 'inset 0 0 0 1px #5f9fc5' : 'none',
        }}
      >
        {labels[key]}
      </button>,
      document.body,
    );
  });

  const commitDraft = () => {
    if (!draft) return;
    const distance = Math.hypot(draft.x2 - draft.x1, draft.y2 - draft.y1);
    if (distance > 0.004) {
      setShapes((current) => [...current, { ...draft, id: `${Date.now()}-${Math.random()}` }]);
    }
    setDraft(null);
  };

  const drawingLayer = canvasRect && createPortal(
    <svg
      id={DRAW_LAYER_ID}
      width={canvasRect.width}
      height={canvasRect.height}
      viewBox={`0 0 ${canvasRect.width} ${canvasRect.height}`}
      style={{
        position: 'fixed',
        left: canvasRect.left,
        top: canvasRect.top,
        width: canvasRect.width,
        height: canvasRect.height,
        zIndex: 2147483500,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      {shapes.map((shape) => {
        const selected = selectedId === shape.id;
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
          const x = Math.min(shape.x1, shape.x2) * canvasRect.width;
          const y = Math.min(shape.y1, shape.y2) * canvasRect.height;
          const width = Math.abs(shape.x2 - shape.x1) * canvasRect.width;
          const height = Math.abs(shape.y2 - shape.y1) * canvasRect.height;
          return <rect key={shape.id} x={x} y={y} width={width} height={height} {...common} />;
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

      {draft?.type === 'line' && (
        <line x1={draft.x1 * canvasRect.width} y1={draft.y1 * canvasRect.height} x2={draft.x2 * canvasRect.width} y2={draft.y2 * canvasRect.height} stroke="#1c75bc" strokeWidth="2" strokeDasharray="6 4" />
      )}
      {draft?.type === 'rectangle' && (
        <rect
          x={Math.min(draft.x1, draft.x2) * canvasRect.width}
          y={Math.min(draft.y1, draft.y2) * canvasRect.height}
          width={Math.abs(draft.x2 - draft.x1) * canvasRect.width}
          height={Math.abs(draft.y2 - draft.y1) * canvasRect.height}
          fill="none"
          stroke="#1c75bc"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
      )}

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
            const point = normalizedPoint(event, canvasRect);
            if (activeTool === 'text') {
              const value = window.prompt(ar ? 'اكتب النص المطلوب' : 'Enter text');
              if (value?.trim()) {
                setShapes((current) => [...current, {
                  id: `${Date.now()}-${Math.random()}`,
                  type: 'text',
                  x: point.x,
                  y: point.y,
                  text: value.trim(),
                }]);
              }
              return;
            }
            event.currentTarget.setPointerCapture?.(event.pointerId);
            setDraft({ type: activeTool, x1: point.x, y1: point.y, x2: point.x, y2: point.y });
          }}
          onPointerMove={(event) => {
            if (!draft) return;
            const point = normalizedPoint(event, canvasRect);
            setDraft((current) => current ? { ...current, x2: point.x, y2: point.y } : current);
          }}
          onPointerUp={commitDraft}
          onPointerCancel={() => setDraft(null)}
        />
      )}
    </svg>,
    document.body,
  );

  React.useEffect(() => {
    window.GANNZILLA_TOOLBAR_ACTIONS_FIX_V173 = true;
    window.__auditGannzillaToolbarActionsFixV173 = () => ({
      ok: TOOL_DEFS.every(({ key }) => Boolean(document.getElementById(`${OVERLAY_PREFIX}${key}`))),
      build: BUILD,
      activeTool,
      locked,
      drawingVisible,
      fullscreen: Boolean(document.fullscreenElement || document.webkitFullscreenElement),
      shapeCount: shapes.length,
      controls: TOOL_DEFS.reduce((result, { key }) => ({ ...result, [key]: Boolean(document.getElementById(`${OVERLAY_PREFIX}${key}`)) }), {}),
    });
  }, [activeTool, drawingVisible, fullscreen, locked, shapes.length]);

  return <>{toolbarButtons}{drawingLayer}<style>{`#${LEGACY_HITBOX_ID}{display:none!important;pointer-events:none!important;}`}</style></>;
}
