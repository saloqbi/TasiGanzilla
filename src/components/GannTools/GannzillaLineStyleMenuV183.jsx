import React from 'react';
import { createPortal } from 'react-dom';

const CONTROL_ID = 'gannzilla-line-style-control-v183';
const MENU_ID = 'gannzilla-line-style-menu-v183';
const LAYER_ID = 'gannzilla-line-style-layer-v183';

function cleanLabel(element) {
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

function findOriginalLineButton() {
  return Array.from(document.querySelectorAll('button')).find((button) => {
    if (button.id === CONTROL_ID || button.closest?.(`#${MENU_ID}`)) return false;
    return isTopToolbarButton(button) && ['—', '-', '−'].includes(cleanLabel(button));
  }) || null;
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function inside(rect, x, y) {
  return Boolean(rect) && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function pointFromEvent(event, rect) {
  return {
    x: Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width))),
    y: Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height))),
  };
}

function ModeIcon({ mode, selected = false }) {
  const stroke = selected ? '#ffffff' : '#0877c9';
  return (
    <svg width="34" height="20" viewBox="0 0 34 20" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      <defs>
        <marker id={`menu-arrow-${mode}-${selected ? 'on' : 'off'}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L6,3 L0,6 Z" fill={stroke} />
        </marker>
      </defs>
      <line
        x1="5" y1="10" x2="29" y2="10"
        stroke={stroke}
        strokeWidth="2"
        markerStart={mode === 'double' ? `url(#menu-arrow-${mode}-${selected ? 'on' : 'off'})` : undefined}
        markerEnd={mode === 'arrow' || mode === 'double' ? `url(#menu-arrow-${mode}-${selected ? 'on' : 'off'})` : undefined}
      />
    </svg>
  );
}

export default function GannzillaLineStyleMenuV183() {
  const [anchorRect, setAnchorRect] = React.useState(null);
  const [canvasRect, setCanvasRect] = React.useState(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const [mode, setMode] = React.useState('plain');
  const [lines, setLines] = React.useState([]);
  const [draft, setDraft] = React.useState(null);

  const activeRef = React.useRef(active);
  const modeRef = React.useRef(mode);
  const canvasRectRef = React.useRef(canvasRect);
  const draftRef = React.useRef(draft);

  React.useEffect(() => { activeRef.current = active; }, [active]);
  React.useEffect(() => { modeRef.current = mode; }, [mode]);
  React.useEffect(() => { canvasRectRef.current = canvasRect; }, [canvasRect]);
  React.useEffect(() => { draftRef.current = draft; }, [draft]);

  React.useEffect(() => {
    let disposed = false;
    const sync = () => {
      if (disposed) return;
      const lineButton = findOriginalLineButton();
      if (lineButton) {
        const rect = lineButton.getBoundingClientRect();
        const next = lineButton.nextElementSibling;
        if (next?.tagName === 'BUTTON') next.style.setProperty('margin-left', '17px', 'important');
        const value = {
          left: Math.round(rect.left),
          top: Math.round(rect.top),
          width: Math.max(22, Math.round(rect.width)),
          height: Math.max(21, Math.round(rect.height)),
        };
        setAnchorRect((current) => current
          && current.left === value.left
          && current.top === value.top
          && current.width === value.width
          && current.height === value.height
          ? current
          : value);
      }

      const canvas = findWheelCanvas();
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const value = { left: rect.left, top: rect.top, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom };
        canvasRectRef.current = value;
        setCanvasRect((current) => current
          && current.left === value.left
          && current.top === value.top
          && current.width === value.width
          && current.height === value.height
          ? current
          : value);
        if (activeRef.current) canvas.style.setProperty('cursor', 'crosshair', 'important');
      }
    };

    sync();
    const timer = window.setInterval(sync, 250);
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, []);

  React.useEffect(() => {
    const onPointerDown = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest?.(`#${CONTROL_ID}, #${MENU_ID}`)) return;

      const toolbarButton = target?.closest?.('button');
      if (toolbarButton && isTopToolbarButton(toolbarButton)) {
        setActive(false);
        activeRef.current = false;
        setMenuOpen(false);
        return;
      }

      const rect = canvasRectRef.current;
      if (!activeRef.current || !inside(rect, event.clientX, event.clientY)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      const point = pointFromEvent(event, rect);
      const next = { x1: point.x, y1: point.y, x2: point.x, y2: point.y, mode: modeRef.current };
      draftRef.current = next;
      setDraft(next);
    };

    const onPointerMove = (event) => {
      const rect = canvasRectRef.current;
      const current = draftRef.current;
      if (!rect || !current) return;
      event.preventDefault();
      event.stopPropagation();
      const point = pointFromEvent(event, rect);
      const next = { ...current, x2: point.x, y2: point.y };
      draftRef.current = next;
      setDraft(next);
    };

    const onPointerUp = (event) => {
      const current = draftRef.current;
      if (!current) return;
      event.preventDefault();
      event.stopPropagation();
      const distance = Math.hypot(current.x2 - current.x1, current.y2 - current.y1);
      if (distance > 0.004) {
        setLines((items) => [...items, { ...current, id: `${Date.now()}-${Math.random()}` }]);
      }
      draftRef.current = null;
      setDraft(null);
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setActive(false);
        activeRef.current = false;
      }
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointermove', onPointerMove, true);
    document.addEventListener('pointerup', onPointerUp, true);
    document.addEventListener('pointercancel', onPointerUp, true);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointermove', onPointerMove, true);
      document.removeEventListener('pointerup', onPointerUp, true);
      document.removeEventListener('pointercancel', onPointerUp, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, []);

  React.useEffect(() => {
    window.GANNZILLA_LINE_STYLE_MENU_V183 = true;
    window.__auditGannzillaLineStyleMenuV183 = () => ({
      ok: Boolean(document.getElementById(CONTROL_ID)),
      build: 183,
      active,
      mode,
      menuOpen,
      lineCount: lines.length,
    });
  }, [active, mode, menuOpen, lines.length]);

  const chooseMode = (nextMode) => {
    setMode(nextMode);
    modeRef.current = nextMode;
    setActive(true);
    activeRef.current = true;
    setMenuOpen(false);
  };

  const control = anchorRect ? createPortal(
    <div
      id={CONTROL_ID}
      style={{
        position: 'fixed', left: anchorRect.left, top: anchorRect.top,
        width: anchorRect.width + 16, height: anchorRect.height,
        zIndex: 2147483647, display: 'flex', direction: 'ltr',
        border: '1px solid #8fa5b4', borderRadius: 2,
        background: active ? '#d9edf9' : '#f7f7f7', boxSizing: 'border-box',
      }}
    >
      <button
        type="button"
        title="أداة الخط"
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          event.nativeEvent?.stopImmediatePropagation?.();
          setActive(true);
          activeRef.current = true;
        }}
        style={{ flex: 1, minWidth: 0, padding: 0, border: 0, background: 'transparent', cursor: 'crosshair', color: '#0877c9' }}
      >
        <ModeIcon mode={mode} />
      </button>
      <button
        type="button"
        title="خيارات الخط"
        aria-expanded={menuOpen}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          event.nativeEvent?.stopImmediatePropagation?.();
          setMenuOpen((value) => !value);
        }}
        style={{ width: 16, padding: 0, border: 0, borderLeft: '1px solid #9aadb9', background: 'transparent', cursor: 'pointer', color: '#111', fontSize: 10 }}
      >▼</button>
    </div>,
    document.body,
  ) : null;

  const menu = anchorRect && menuOpen ? createPortal(
    <div
      id={MENU_ID}
      style={{
        position: 'fixed', left: anchorRect.left + 2, top: anchorRect.top + anchorRect.height + 2,
        width: 47, padding: 3, zIndex: 2147483647,
        border: '1px solid #9ca9b2', borderRadius: 2,
        background: '#f3f3f3', boxShadow: '0 3px 8px rgba(0,0,0,.25)',
        display: 'flex', flexDirection: 'column', gap: 3,
      }}
    >
      {[
        ['plain', 'خط عادي'],
        ['arrow', 'سهم باتجاه واحد'],
        ['double', 'سهم باتجاهين'],
      ].map(([value, title]) => (
        <button
          key={value}
          type="button"
          title={title}
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            event.nativeEvent?.stopImmediatePropagation?.();
            chooseMode(value);
          }}
          style={{
            width: 39, height: 31, padding: 1,
            border: '1px solid #9da8b0', borderRadius: 2,
            background: mode === value ? '#0783dc' : '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <ModeIcon mode={value} selected={mode === value} />
        </button>
      ))}
    </div>,
    document.body,
  ) : null;

  const renderLine = (line, key, dashed = false) => {
    if (!canvasRect) return null;
    const markerId = `gann-line-arrow-${key}`;
    return (
      <g key={key}>
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L8,4 L0,8 Z" fill="#0877c9" />
          </marker>
        </defs>
        <line
          x1={line.x1 * canvasRect.width}
          y1={line.y1 * canvasRect.height}
          x2={line.x2 * canvasRect.width}
          y2={line.y2 * canvasRect.height}
          stroke="#0877c9"
          strokeWidth="2.4"
          strokeDasharray={dashed ? '6 4' : undefined}
          markerStart={line.mode === 'double' ? `url(#${markerId})` : undefined}
          markerEnd={line.mode === 'arrow' || line.mode === 'double' ? `url(#${markerId})` : undefined}
        />
      </g>
    );
  };

  const layer = canvasRect ? createPortal(
    <svg
      id={LAYER_ID}
      width={canvasRect.width}
      height={canvasRect.height}
      viewBox={`0 0 ${canvasRect.width} ${canvasRect.height}`}
      style={{
        position: 'fixed', left: canvasRect.left, top: canvasRect.top,
        width: canvasRect.width, height: canvasRect.height,
        zIndex: 2147483400, overflow: 'visible', pointerEvents: 'none',
      }}
    >
      {lines.map((line) => renderLine(line, line.id))}
      {draft && renderLine(draft, 'draft', true)}
    </svg>,
    document.body,
  ) : null;

  return <>{control}{menu}{layer}</>;
}
