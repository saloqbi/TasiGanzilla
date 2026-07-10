import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = '178';
const DRAW_LAYER_ID = 'gannzilla-native-binding-draw-layer-v178';
const STATUS_ID = 'gannzilla-native-binding-status-v178';
const LEGACY_HITBOX_ID = 'gannzilla-drawing-tools-hitbox-v125';
const TOOL_LABELS = {
  '↖': 'select',
  '—': 'line',
  '▢': 'rectangle',
  T: 'text',
  '🔒': 'lock',
  '🔐': 'lock',
  '⌕': 'palettes',
  '🔍': 'palettes',
  '🔎': 'palettes',
  '⛶': 'fullscreen',
  '⤢': 'fullscreen',
  '↗': 'fullscreen',
};

function labelOf(element) {
  return String(element?.textContent || '').replace(/\s+/g, '').trim();
}

function isTopToolbarButton(button) {
  const rect = button?.getBoundingClientRect?.();
  return Boolean(rect)
    && rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.bottom <= 48;
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function toggleFullscreenNow() {
  const root = document.documentElement;
  const active = document.fullscreenElement || document.webkitFullscreenElement;
  if (active) {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    return undefined;
  }
  if (root.requestFullscreen) return root.requestFullscreen({ navigationUI: 'hide' });
  if (root.webkitRequestFullscreen) return root.webkitRequestFullscreen();
  return undefined;
}

function normalizedPoint(event, rect) {
  return {
    x: Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width))),
    y: Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height))),
  };
}

function isInside(rect, x, y) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function triggerPaletteOwner(targetEvent) {
  const hitbox = document.getElementById(LEGACY_HITBOX_ID);
  if (!hitbox) return false;
  if (targetEvent?.target === hitbox || targetEvent?.target?.closest?.(`#${LEGACY_HITBOX_ID}`)) {
    return true;
  }
  const proxyEvent = new PointerEvent('pointerdown', {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: 'mouse',
    clientX: targetEvent?.clientX || 0,
    clientY: targetEvent?.clientY || 0,
  });
  hitbox.dispatchEvent(proxyEvent);
  return true;
}

export default function GannzillaNativeToolbarBindingV178() {
  const [activeTool, setActiveTool] = React.useState('select');
  const [locked, setLocked] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
  const [canvasRect, setCanvasRect] = React.useState(null);
  const [shapes, setShapes] = React.useState([]);
  const [draft, setDraft] = React.useState(null);
  const [status, setStatus] = React.useState('');

  const activeToolRef = React.useRef(activeTool);
  const lockedRef = React.useRef(locked);
  const canvasRectRef = React.useRef(canvasRect);
  const draftRef = React.useRef(draft);
  const statusTimerRef = React.useRef(null);

  React.useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  React.useEffect(() => { lockedRef.current = locked; }, [locked]);
  React.useEffect(() => { canvasRectRef.current = canvasRect; }, [canvasRect]);
  React.useEffect(() => { draftRef.current = draft; }, [draft]);

  const flash = React.useCallback((message) => {
    setStatus(message);
    window.clearTimeout(statusTimerRef.current);
    statusTimerRef.current = window.setTimeout(() => setStatus(''), 1400);
  }, []);

  const activate = React.useCallback((tool) => {
    if (tool === 'lock') {
      setLocked((current) => {
        const next = !current;
        lockedRef.current = next;
        if (next) {
          setActiveTool('select');
          activeToolRef.current = 'select';
        }
        flash(next ? 'تم قفل الرسومات' : 'تم فتح قفل الرسومات');
        return next;
      });
      return;
    }

    if (tool === 'fullscreen') {
      window.scrollTo(0, 0);
      flash(fullscreen ? 'الخروج من ملء الشاشة' : 'فتح ملء الشاشة');
      try {
        const result = toggleFullscreenNow();
        result?.catch?.(() => flash('المتصفح منع ملء الشاشة'));
      } catch (_) {
        flash('تعذر فتح ملء الشاشة');
      }
      return;
    }

    if (lockedRef.current) {
      flash('الرسومات مقفلة');
      return;
    }

    setActiveTool(tool);
    activeToolRef.current = tool;
    const messages = {
      select: 'أداة التحديد مفعلة',
      line: 'أداة الخط مفعلة — اسحب فوق العجلة',
      rectangle: 'أداة المستطيل مفعلة — اسحب فوق العجلة',
      text: 'أداة النص مفعلة — اضغط داخل العجلة',
    };
    flash(messages[tool] || 'تم تفعيل الأداة');
  }, [flash, fullscreen]);

  React.useEffect(() => {
    const sync = () => {
      const canvas = findWheelCanvas();
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const next = {
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        };
        const current = canvasRectRef.current;
        if (!current
          || current.left !== next.left
          || current.top !== next.top
          || current.width !== next.width
          || current.height !== next.height) {
          canvasRectRef.current = next;
          setCanvasRect(next);
        }
        const cursor = lockedRef.current
          ? 'not-allowed'
          : activeToolRef.current === 'select'
            ? 'default'
            : activeToolRef.current === 'text'
              ? 'text'
              : 'crosshair';
        canvas.style.setProperty('cursor', cursor, 'important');
      }

      document.querySelectorAll('button').forEach((button) => {
        if (!isTopToolbarButton(button)) return;
        const tool = TOOL_LABELS[labelOf(button)];
        if (!tool || tool === 'palettes') return;
        button.style.setProperty('pointer-events', 'auto', 'important');
        button.style.setProperty('cursor', 'pointer', 'important');
        button.removeAttribute('disabled');
        button.removeAttribute('aria-hidden');
        const active = (['select', 'line', 'rectangle', 'text'].includes(tool) && activeToolRef.current === tool)
          || (tool === 'lock' && lockedRef.current)
          || (tool === 'fullscreen' && Boolean(document.fullscreenElement || document.webkitFullscreenElement));
        button.style.setProperty('background', active ? '#d9edf9' : '#f7f7f7', 'important');
        button.style.setProperty('box-shadow', active ? 'inset 0 0 0 1px #5f9fc5' : 'none', 'important');
      });

      const hitbox = document.getElementById(LEGACY_HITBOX_ID);
      if (hitbox) {
        hitbox.style.setProperty('display', 'flex', 'important');
        hitbox.style.setProperty('visibility', 'visible', 'important');
        hitbox.style.setProperty('pointer-events', 'auto', 'important');
        hitbox.removeAttribute('disabled');
        hitbox.removeAttribute('aria-hidden');
      }
    };

    sync();
    const timer = window.setInterval(sync, 300);
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, []);

  React.useEffect(() => {
    const onFullscreenChange = () => {
      const value = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setFullscreen(value);
      window.scrollTo(0, 0);
      window.setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  React.useEffect(() => {
    const onPointerDown = (event) => {
      const target = event.target instanceof Element ? event.target.closest('button') : null;
      if (target && isTopToolbarButton(target)) {
        const tool = TOOL_LABELS[labelOf(target)];
        if (tool === 'palettes') {
          if (target.id === LEGACY_HITBOX_ID) return;
          event.preventDefault();
          event.stopPropagation();
          triggerPaletteOwner(event);
          return;
        }
        if (tool) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation?.();
          activate(tool);
          return;
        }
      }

      const rect = canvasRectRef.current;
      const tool = activeToolRef.current;
      if (!rect || lockedRef.current || tool === 'select') return;
      if (!isInside(rect, event.clientX, event.clientY)) return;

      event.preventDefault();
      event.stopPropagation();
      const point = normalizedPoint(event, rect);
      if (tool === 'text') {
        const value = window.prompt('اكتب النص المطلوب');
        if (value?.trim()) {
          setShapes((current) => [...current, {
            id: `${Date.now()}-${Math.random()}`,
            type: 'text',
            x: point.x,
            y: point.y,
            text: value.trim(),
          }]);
          flash('تمت إضافة النص');
        }
        return;
      }

      const nextDraft = { type: tool, x1: point.x, y1: point.y, x2: point.x, y2: point.y };
      draftRef.current = nextDraft;
      setDraft(nextDraft);
    };

    const onPointerMove = (event) => {
      const rect = canvasRectRef.current;
      if (!rect || !draftRef.current) return;
      const point = normalizedPoint(event, rect);
      const next = { ...draftRef.current, x2: point.x, y2: point.y };
      draftRef.current = next;
      setDraft(next);
    };

    const onPointerUp = () => {
      const current = draftRef.current;
      if (!current) return;
      const distance = Math.hypot(current.x2 - current.x1, current.y2 - current.y1);
      if (distance > 0.004) {
        setShapes((items) => [...items, { ...current, id: `${Date.now()}-${Math.random()}` }]);
        flash(current.type === 'line' ? 'تم رسم الخط' : 'تم رسم المستطيل');
      }
      draftRef.current = null;
      setDraft(null);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointermove', onPointerMove, true);
    document.addEventListener('pointerup', onPointerUp, true);
    document.addEventListener('pointercancel', onPointerUp, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointermove', onPointerMove, true);
      document.removeEventListener('pointerup', onPointerUp, true);
      document.removeEventListener('pointercancel', onPointerUp, true);
    };
  }, [activate, flash]);

  React.useEffect(() => () => window.clearTimeout(statusTimerRef.current), []);

  React.useEffect(() => {
    window.GANNZILLA_NATIVE_TOOLBAR_BINDING_V178 = true;
    window.__auditGannzillaNativeToolbarBindingV178 = () => ({
      ok: Boolean(document.getElementById(LEGACY_HITBOX_ID)),
      build: BUILD,
      activeTool,
      locked,
      paletteOwnerPresent: Boolean(document.getElementById(LEGACY_HITBOX_ID)),
      fullscreen: Boolean(document.fullscreenElement || document.webkitFullscreenElement),
      shapeCount: shapes.length,
    });
  }, [activeTool, locked, shapes.length]);

  const drawingLayer = canvasRect ? createPortal(
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
        if (shape.type === 'line') {
          return <line key={shape.id} x1={shape.x1 * canvasRect.width} y1={shape.y1 * canvasRect.height} x2={shape.x2 * canvasRect.width} y2={shape.y2 * canvasRect.height} stroke="#1c75bc" strokeWidth="2" />;
        }
        if (shape.type === 'rectangle') {
          return <rect key={shape.id} x={Math.min(shape.x1, shape.x2) * canvasRect.width} y={Math.min(shape.y1, shape.y2) * canvasRect.height} width={Math.abs(shape.x2 - shape.x1) * canvasRect.width} height={Math.abs(shape.y2 - shape.y1) * canvasRect.height} fill="none" stroke="#1c75bc" strokeWidth="2" />;
        }
        return <text key={shape.id} x={shape.x * canvasRect.width} y={shape.y * canvasRect.height} fill="#1c75bc" fontSize="18" fontWeight="700" textAnchor="middle">{shape.text}</text>;
      })}
      {draft?.type === 'line' && <line x1={draft.x1 * canvasRect.width} y1={draft.y1 * canvasRect.height} x2={draft.x2 * canvasRect.width} y2={draft.y2 * canvasRect.height} stroke="#1c75bc" strokeWidth="2" strokeDasharray="6 4" />}
      {draft?.type === 'rectangle' && <rect x={Math.min(draft.x1, draft.x2) * canvasRect.width} y={Math.min(draft.y1, draft.y2) * canvasRect.height} width={Math.abs(draft.x2 - draft.x1) * canvasRect.width} height={Math.abs(draft.y2 - draft.y1) * canvasRect.height} fill="none" stroke="#1c75bc" strokeWidth="2" strokeDasharray="6 4" />}
    </svg>,
    document.body,
  ) : null;

  const statusToast = status ? createPortal(
    <div
      id={STATUS_ID}
      style={{
        position: 'fixed',
        top: 32,
        right: 12,
        zIndex: 2147483647,
        padding: '7px 12px',
        border: '1px solid #5f9fc5',
        borderRadius: 4,
        background: '#eef8ff',
        color: '#174f72',
        font: '700 13px Segoe UI, Tahoma, Arial, sans-serif',
        boxShadow: '0 2px 7px rgba(0,0,0,0.18)',
        pointerEvents: 'none',
        direction: 'rtl',
      }}
    >
      {status}
    </div>,
    document.body,
  ) : null;

  return <>{drawingLayer}{statusToast}</>;
}
