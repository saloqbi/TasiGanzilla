import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = 193;
const LINE_CONTROL_ID = 'gannzilla-line-control-v185';
const SHAPE_CONTROL_ID = 'gannzilla-shape-control-v185';
const LINE_MENU_ID = 'gannzilla-line-menu-v185';
const SHAPE_MENU_ID = 'gannzilla-shape-menu-v185';
const DRAW_LAYER_ID = 'gannzilla-dual-drawing-layer-v185';
const DRAWING_ID_ATTRIBUTE = 'data-gannzilla-drawing-id';

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

function findOriginalButton(label) {
  return Array.from(document.querySelectorAll('button')).find((button) => {
    if (
      button.id === LINE_CONTROL_ID
      || button.id === SHAPE_CONTROL_ID
      || button.closest?.(`#${LINE_MENU_ID}, #${SHAPE_MENU_ID}`)
    ) return false;
    return isTopToolbarButton(button) && cleanLabel(button) === label;
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

function normalizedPoint(event, rect) {
  return {
    x: Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width))),
    y: Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height))),
  };
}

function LineIcon({ mode = 'plain', selected = false, width = 28, height = 18 }) {
  const stroke = selected ? '#ffffff' : '#0877c9';
  const markerId = `toolbar-line-${mode}-${selected ? 'selected' : 'normal'}`;
  return (
    <svg width={width} height={height} viewBox="0 0 34 20" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      <defs>
        <marker id={markerId} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L6,3 L0,6 Z" fill={stroke} />
        </marker>
      </defs>
      <line
        x1="5"
        y1="10"
        x2="29"
        y2="10"
        stroke={stroke}
        strokeWidth="2"
        markerStart={mode === 'double' ? `url(#${markerId})` : undefined}
        markerEnd={mode === 'arrow' || mode === 'double' ? `url(#${markerId})` : undefined}
      />
    </svg>
  );
}

function ShapeIcon({ mode = 'rectangle', selected = false, width = 28, height = 20 }) {
  const stroke = selected ? '#ffffff' : '#0877c9';
  const common = { fill: 'none', stroke, strokeWidth: 2 };
  return (
    <svg width={width} height={height} viewBox="0 0 34 22" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      {mode === 'triangle' && <path d="M17 3 L29 19 H5 Z" {...common} />}
      {mode === 'rectangle' && <rect x="6" y="4" width="22" height="14" rx="1" {...common} />}
      {mode === 'circle' && <ellipse cx="17" cy="11" rx="11" ry="8" {...common} />}
    </svg>
  );
}

function ToolControl({ id, rect, active, title, icon, open, onActivate, onToggleMenu }) {
  if (!rect) return null;
  return createPortal(
    <div
      id={id}
      style={{
        position: 'fixed',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        zIndex: 2147483647,
        display: 'flex',
        direction: 'ltr',
        border: '1px solid #8fa5b4',
        borderRadius: 2,
        background: active ? '#d9edf9' : '#f7f7f7',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        title={title}
        aria-label={title}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          event.nativeEvent?.stopImmediatePropagation?.();
          onActivate();
        }}
        style={{
          flex: 1,
          minWidth: 0,
          padding: 0,
          border: 0,
          background: 'transparent',
          color: '#0877c9',
          cursor: 'crosshair',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </button>
      <button
        type="button"
        title={`${title} - الخيارات`}
        aria-label={`${title} - الخيارات`}
        aria-expanded={open}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          event.nativeEvent?.stopImmediatePropagation?.();
          onToggleMenu();
        }}
        style={{
          width: 11,
          minWidth: 11,
          padding: 0,
          border: 0,
          borderLeft: '1px solid #9aadb9',
          background: open ? '#c8e5f8' : 'transparent',
          color: '#111',
          fontSize: 8,
          lineHeight: 1,
          cursor: 'pointer',
        }}
      >▼</button>
    </div>,
    document.body,
  );
}

function ToolMenu({ id, rect, options, selected, onSelect, type }) {
  if (!rect) return null;
  return createPortal(
    <div
      id={id}
      role="menu"
      style={{
        position: 'fixed',
        left: rect.left + 1,
        top: rect.top + rect.height + 2,
        width: 49,
        padding: 3,
        zIndex: 2147483647,
        border: '1px solid #9ca9b2',
        borderRadius: 2,
        background: '#f3f3f3',
        boxShadow: '0 3px 8px rgba(0,0,0,.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        boxSizing: 'border-box',
      }}
    >
      {options.map(({ value, title }) => (
        <button
          key={value}
          type="button"
          role="menuitem"
          title={title}
          aria-label={title}
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            event.nativeEvent?.stopImmediatePropagation?.();
            onSelect(value);
          }}
          style={{
            width: 41,
            height: 31,
            padding: 1,
            border: '1px solid #9da8b0',
            borderRadius: 2,
            background: selected === value ? '#0783dc' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {type === 'line'
            ? <LineIcon mode={value} selected={selected === value} width={34} height={20} />
            : <ShapeIcon mode={value} selected={selected === value} width={34} height={22} />}
        </button>
      ))}
    </div>,
    document.body,
  );
}

export default function GannzillaLineStyleMenuV183() {
  const [lineRect, setLineRect] = React.useState(null);
  const [shapeRect, setShapeRect] = React.useState(null);
  const [canvasRect, setCanvasRect] = React.useState(null);
  const [openMenu, setOpenMenu] = React.useState(null);
  const [activeTool, setActiveTool] = React.useState(null);
  const [lineMode, setLineMode] = React.useState('plain');
  const [shapeMode, setShapeMode] = React.useState('rectangle');
  const [items, setItems] = React.useState([]);
  const [draft, setDraft] = React.useState(null);

  const activeToolRef = React.useRef(activeTool);
  const lineModeRef = React.useRef(lineMode);
  const shapeModeRef = React.useRef(shapeMode);
  const canvasRectRef = React.useRef(canvasRect);
  const draftRef = React.useRef(draft);

  React.useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  React.useEffect(() => { lineModeRef.current = lineMode; }, [lineMode]);
  React.useEffect(() => { shapeModeRef.current = shapeMode; }, [shapeMode]);
  React.useEffect(() => { canvasRectRef.current = canvasRect; }, [canvasRect]);
  React.useEffect(() => { draftRef.current = draft; }, [draft]);

  React.useEffect(() => {
    let disposed = false;

    const applyRect = (button, setter) => {
      if (!button) {
        setter(null);
        return;
      }
      button.style.setProperty('width', '32px', 'important');
      button.style.setProperty('min-width', '32px', 'important');
      button.style.setProperty('opacity', '0', 'important');
      const rect = button.getBoundingClientRect();
      const value = {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.max(32, Math.round(rect.width)),
        height: Math.max(21, Math.round(rect.height)),
      };
      setter((current) => current
        && current.left === value.left
        && current.top === value.top
        && current.width === value.width
        && current.height === value.height
        ? current
        : value);
    };

    const sync = () => {
      if (disposed) return;
      applyRect(findOriginalButton('—'), setLineRect);
      applyRect(findOriginalButton('▢'), setShapeRect);

      const canvas = findWheelCanvas();
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const value = {
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        };
        canvasRectRef.current = value;
        setCanvasRect((current) => current
          && current.left === value.left
          && current.top === value.top
          && current.width === value.width
          && current.height === value.height
          ? current
          : value);
        if (activeToolRef.current) canvas.style.setProperty('cursor', 'crosshair', 'important');
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
      if (target?.closest?.(`#${LINE_CONTROL_ID}, #${SHAPE_CONTROL_ID}, #${LINE_MENU_ID}, #${SHAPE_MENU_ID}`)) return;

      const drawingTarget = target?.closest?.(`[${DRAWING_ID_ATTRIBUTE}]`);
      if (drawingTarget) {
        const drawingId = drawingTarget.getAttribute(DRAWING_ID_ATTRIBUTE);
        if (drawingId) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation?.();
          setItems((existing) => existing.filter((item) => item.id !== drawingId));
          draftRef.current = null;
          setDraft(null);
          return;
        }
      }

      const toolbarButton = target?.closest?.('button');
      if (toolbarButton && isTopToolbarButton(toolbarButton)) {
        setOpenMenu(null);
        setActiveTool(null);
        activeToolRef.current = null;
        return;
      }

      const rect = canvasRectRef.current;
      const tool = activeToolRef.current;
      if (!tool || !inside(rect, event.clientX, event.clientY)) {
        setOpenMenu(null);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      const point = normalizedPoint(event, rect);
      const nextDraft = {
        type: tool,
        mode: tool === 'line' ? lineModeRef.current : shapeModeRef.current,
        x1: point.x,
        y1: point.y,
        x2: point.x,
        y2: point.y,
      };
      draftRef.current = nextDraft;
      setDraft(nextDraft);
      setOpenMenu(null);
    };

    const onPointerMove = (event) => {
      const rect = canvasRectRef.current;
      const current = draftRef.current;
      if (!rect || !current) return;
      event.preventDefault();
      event.stopPropagation();
      const point = normalizedPoint(event, rect);
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
        setItems((existing) => [...existing, { ...current, id: `${Date.now()}-${Math.random()}` }]);
      }
      draftRef.current = null;
      setDraft(null);
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setActiveTool(null);
        activeToolRef.current = null;
        draftRef.current = null;
        setDraft(null);
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
    window.GANNZILLA_DUAL_DRAWING_MENUS_V185 = true;
    window.__auditGannzillaDualDrawingMenusV185 = () => ({
      ok: Boolean(document.getElementById(LINE_CONTROL_ID)) && Boolean(document.getElementById(SHAPE_CONTROL_ID)),
      build: BUILD,
      activeTool,
      lineMode,
      shapeMode,
      openMenu,
      itemCount: items.length,
      clickToDelete: true,
    });
  }, [activeTool, lineMode, shapeMode, openMenu, items.length]);

  const activateTool = (tool) => {
    setActiveTool(tool);
    activeToolRef.current = tool;
    setOpenMenu(null);
  };

  const selectLineMode = (mode) => {
    setLineMode(mode);
    lineModeRef.current = mode;
    activateTool('line');
  };

  const selectShapeMode = (mode) => {
    setShapeMode(mode);
    shapeModeRef.current = mode;
    activateTool('shape');
  };

  const lineControl = ToolControl({
    id: LINE_CONTROL_ID,
    rect: lineRect,
    active: activeTool === 'line',
    title: 'أداة الخط والسهم',
    icon: <LineIcon mode={lineMode} />,
    open: openMenu === 'line',
    onActivate: () => activateTool('line'),
    onToggleMenu: () => setOpenMenu((current) => current === 'line' ? null : 'line'),
  });

  const shapeControl = ToolControl({
    id: SHAPE_CONTROL_ID,
    rect: shapeRect,
    active: activeTool === 'shape',
    title: 'أداة الأشكال',
    icon: <ShapeIcon mode={shapeMode} />,
    open: openMenu === 'shape',
    onActivate: () => activateTool('shape'),
    onToggleMenu: () => setOpenMenu((current) => current === 'shape' ? null : 'shape'),
  });

  const lineMenu = openMenu === 'line' ? ToolMenu({
    id: LINE_MENU_ID,
    rect: lineRect,
    type: 'line',
    selected: lineMode,
    options: [
      { value: 'plain', title: 'خط عادي' },
      { value: 'arrow', title: 'سهم باتجاه واحد' },
      { value: 'double', title: 'سهم باتجاهين' },
    ],
    onSelect: selectLineMode,
  }) : null;

  const shapeMenu = openMenu === 'shape' ? ToolMenu({
    id: SHAPE_MENU_ID,
    rect: shapeRect,
    type: 'shape',
    selected: shapeMode,
    options: [
      { value: 'triangle', title: 'مثلث' },
      { value: 'rectangle', title: 'مستطيل' },
      { value: 'circle', title: 'دائرة أو شكل بيضاوي' },
    ],
    onSelect: selectShapeMode,
  }) : null;

  const renderItem = (item, key, dashed = false) => {
    if (!canvasRect) return null;
    const x1 = item.x1 * canvasRect.width;
    const y1 = item.y1 * canvasRect.height;
    const x2 = item.x2 * canvasRect.width;
    const y2 = item.y2 * canvasRect.height;
    const stroke = '#0877c9';
    const hitProps = dashed ? {} : {
      [DRAWING_ID_ATTRIBUTE]: item.id,
      stroke: 'rgba(0, 0, 0, 0.001)',
      strokeWidth: 14,
      fill: 'none',
      style: { cursor: 'pointer', pointerEvents: 'stroke' },
    };

    if (item.type === 'line') {
      const markerId = `gann-line-marker-${String(key).replace(/[^a-zA-Z0-9_-]/g, '')}`;
      return (
        <g key={key}>
          <defs>
            <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L8,4 L0,8 Z" fill={stroke} />
            </marker>
          </defs>
          {!dashed && <line x1={x1} y1={y1} x2={x2} y2={y2} {...hitProps} />}
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={stroke}
            strokeWidth="2.4"
            strokeDasharray={dashed ? '6 4' : undefined}
            markerStart={item.mode === 'double' ? `url(#${markerId})` : undefined}
            markerEnd={item.mode === 'arrow' || item.mode === 'double' ? `url(#${markerId})` : undefined}
            style={{ pointerEvents: 'none' }}
          />
        </g>
      );
    }

    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    const common = {
      fill: 'none',
      stroke,
      strokeWidth: 2.4,
      strokeDasharray: dashed ? '6 4' : undefined,
      style: { pointerEvents: 'none' },
    };

    if (item.mode === 'triangle') {
      const path = `M ${left + width / 2} ${top} L ${left + width} ${top + height} L ${left} ${top + height} Z`;
      return (
        <g key={key}>
          {!dashed && <path d={path} {...hitProps} />}
          <path d={path} {...common} />
        </g>
      );
    }
    if (item.mode === 'circle') {
      return (
        <g key={key}>
          {!dashed && <ellipse cx={left + width / 2} cy={top + height / 2} rx={width / 2} ry={height / 2} {...hitProps} />}
          <ellipse cx={left + width / 2} cy={top + height / 2} rx={width / 2} ry={height / 2} {...common} />
        </g>
      );
    }
    return (
      <g key={key}>
        {!dashed && <rect x={left} y={top} width={width} height={height} {...hitProps} />}
        <rect x={left} y={top} width={width} height={height} {...common} />
      </g>
    );
  };

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
        zIndex: 2147483400,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      {items.map((item) => renderItem(item, item.id))}
      {draft && renderItem(draft, 'draft', true)}
    </svg>,
    document.body,
  ) : null;

  return <>{lineControl}{shapeControl}{lineMenu}{shapeMenu}{drawingLayer}</>;
}
