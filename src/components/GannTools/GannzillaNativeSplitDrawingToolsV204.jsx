import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = 204;
const LINE_CONTROL_ID = 'gannzilla-native-line-split-v204';
const SHAPE_CONTROL_ID = 'gannzilla-native-shape-split-v204';
const LINE_MENU_ID = 'gannzilla-native-line-menu-v204';
const SHAPE_MENU_ID = 'gannzilla-native-shape-menu-v204';
const DRAW_LAYER_ID = 'gannzilla-native-drawing-layer-v204';
const DRAWING_ID_ATTRIBUTE = 'data-gannzilla-drawing-id';
const CONTROL_WIDTH = 34;
const CONTROL_HEIGHT = 23;
const MAIN_WIDTH = 24;
const ARROW_WIDTH = 9;

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

function findOriginalButton(labels) {
  return Array.from(document.querySelectorAll('button')).find((button) => {
    if (
      button.closest?.(`#${LINE_CONTROL_ID}, #${SHAPE_CONTROL_ID}, #${LINE_MENU_ID}, #${SHAPE_MENU_ID}`)
    ) return false;
    return isTopToolbarButton(button) && labels.includes(cleanLabel(button));
  }) || null;
}

function prepareAnchor(button) {
  if (!button) return null;
  button.style.setProperty('width', `${CONTROL_WIDTH}px`, 'important');
  button.style.setProperty('min-width', `${CONTROL_WIDTH}px`, 'important');
  button.style.setProperty('height', `${CONTROL_HEIGHT}px`, 'important');
  button.style.setProperty('min-height', `${CONTROL_HEIGHT}px`, 'important');
  button.style.setProperty('padding', '0', 'important');
  button.style.setProperty('margin-left', '1px', 'important');
  button.style.setProperty('margin-right', '1px', 'important');
  button.style.setProperty('opacity', '0', 'important');
  button.style.setProperty('pointer-events', 'none', 'important');
  const rect = button.getBoundingClientRect();
  return {
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    width: CONTROL_WIDTH,
    height: Math.max(CONTROL_HEIGHT, Math.round(rect.height)),
    right: Math.round(rect.left) + CONTROL_WIDTH,
    bottom: Math.round(rect.top) + Math.max(CONTROL_HEIGHT, Math.round(rect.height)),
  };
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function normalizePoint(event, rect) {
  return {
    x: Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width))),
    y: Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height))),
  };
}

function pointInside(rect, x, y) {
  return Boolean(rect) && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function LineIcon({ mode = 'plain', selected = false, menu = false }) {
  const stroke = selected ? '#ffffff' : '#0877c9';
  const markerId = `gann-line-v204-${mode}-${selected ? 'selected' : 'normal'}-${menu ? 'menu' : 'toolbar'}`;
  return (
    <svg width={menu ? 28 : 18} height={menu ? 18 : 14} viewBox="0 0 32 18" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      <defs>
        <marker id={markerId} markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L5,2.5 L0,5 Z" fill={stroke} />
        </marker>
      </defs>
      <line
        x1="4"
        y1="9"
        x2="28"
        y2="9"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        markerStart={mode === 'double' ? `url(#${markerId})` : undefined}
        markerEnd={mode === 'arrow' || mode === 'double' ? `url(#${markerId})` : undefined}
      />
    </svg>
  );
}

function ShapeIcon({ mode = 'rectangle', selected = false, menu = false }) {
  const stroke = selected ? '#ffffff' : '#0877c9';
  const common = { fill: 'none', stroke, strokeWidth: 2, strokeLinejoin: 'round' };
  return (
    <svg width={menu ? 26 : 17} height={menu ? 20 : 15} viewBox="0 0 28 22" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      {mode === 'triangle' && <path d="M14 3 L24 19 H4 Z" {...common} />}
      {mode === 'rectangle' && <rect x="4" y="4" width="20" height="14" rx="1" {...common} />}
      {mode === 'circle' && <ellipse cx="14" cy="11" rx="10" ry="7" {...common} />}
    </svg>
  );
}

function SplitControl({ id, rect, active, open, title, icon, onActivate, onToggleMenu }) {
  if (!rect) return null;
  return createPortal(
    <div
      id={id}
      role="group"
      aria-label={title}
      style={{
        position: 'fixed',
        left: rect.left,
        top: rect.top,
        width: CONTROL_WIDTH,
        minWidth: CONTROL_WIDTH,
        height: rect.height,
        minHeight: rect.height,
        zIndex: 2147483647,
        display: 'grid',
        gridTemplateColumns: `${MAIN_WIDTH}px ${ARROW_WIDTH}px`,
        direction: 'ltr',
        margin: 0,
        padding: 0,
        border: '1px solid #8ba2b1',
        borderRadius: 2,
        background: active ? '#d9edf9' : '#f7f7f7',
        boxSizing: 'border-box',
        overflow: 'hidden',
        pointerEvents: 'auto',
        userSelect: 'none',
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
          width: MAIN_WIDTH,
          minWidth: MAIN_WIDTH,
          height: '100%',
          padding: 0,
          margin: 0,
          border: 0,
          background: 'transparent',
          color: '#0877c9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'crosshair',
          pointerEvents: 'auto',
          touchAction: 'manipulation',
          boxSizing: 'border-box',
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
          width: ARROW_WIDTH,
          minWidth: ARROW_WIDTH,
          height: '100%',
          padding: 0,
          margin: 0,
          border: 0,
          borderLeft: '1px solid #9aaab4',
          background: open ? '#c7e4f6' : '#eef1f3',
          color: '#111111',
          fontSize: 9,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          pointerEvents: 'auto',
          touchAction: 'manipulation',
          boxSizing: 'border-box',
        }}
      >
        <span aria-hidden="true" style={{ display: 'block', transform: 'translateY(-1px)', pointerEvents: 'none' }}>▾</span>
      </button>
    </div>,
    document.body,
  );
}

function OptionsMenu({ id, rect, type, options, selected, onSelect }) {
  if (!rect) return null;
  return createPortal(
    <div
      id={id}
      role="menu"
      style={{
        position: 'fixed',
        left: rect.left,
        top: rect.top + rect.height + 2,
        width: 38,
        padding: 3,
        zIndex: 2147483647,
        border: '1px solid #8f9eaa',
        borderRadius: 2,
        background: '#edf0f2',
        boxShadow: '0 3px 8px rgba(0,0,0,.24)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        pointerEvents: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {options.map(({ value, title }) => {
        const isSelected = selected === value;
        return (
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
              width: 30,
              height: 27,
              minWidth: 30,
              minHeight: 27,
              padding: 0,
              margin: 0,
              border: '1px solid #9aa7b0',
              borderRadius: 1,
              background: isSelected ? '#0783dc' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              pointerEvents: 'auto',
              touchAction: 'manipulation',
              boxSizing: 'border-box',
            }}
          >
            {type === 'line'
              ? <LineIcon mode={value} selected={isSelected} menu />
              : <ShapeIcon mode={value} selected={isSelected} menu />}
          </button>
        );
      })}
    </div>,
    document.body,
  );
}

export default function GannzillaNativeSplitDrawingToolsV204() {
  const [lineRect, setLineRect] = React.useState(null);
  const [shapeRect, setShapeRect] = React.useState(null);
  const [canvasRect, setCanvasRect] = React.useState(null);
  const [activeTool, setActiveTool] = React.useState(null);
  const [openMenu, setOpenMenu] = React.useState(null);
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

    const sync = () => {
      if (disposed) return;
      const lineAnchor = findOriginalButton(['—', '−', '-']);
      const shapeAnchor = findOriginalButton(['▢', '□', '▭']);
      const nextLine = prepareAnchor(lineAnchor);
      const nextShape = prepareAnchor(shapeAnchor);
      setLineRect((current) => JSON.stringify(current) === JSON.stringify(nextLine) ? current : nextLine);
      setShapeRect((current) => JSON.stringify(current) === JSON.stringify(nextShape) ? current : nextShape);

      const canvas = findWheelCanvas();
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const nextCanvas = {
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        };
        canvasRectRef.current = nextCanvas;
        setCanvasRect((current) => current
          && current.left === nextCanvas.left
          && current.top === nextCanvas.top
          && current.width === nextCanvas.width
          && current.height === nextCanvas.height
          ? current
          : nextCanvas);
        canvas.style.setProperty('cursor', activeToolRef.current ? 'crosshair' : 'default', 'important');
      }
    };

    sync();
    const timer = window.setInterval(sync, 400);
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
      if (!tool || !pointInside(rect, event.clientX, event.clientY)) {
        setOpenMenu(null);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      const point = normalizePoint(event, rect);
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
      const point = normalizePoint(event, rect);
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
      if (event.key !== 'Escape') return;
      setOpenMenu(null);
      setActiveTool(null);
      activeToolRef.current = null;
      draftRef.current = null;
      setDraft(null);
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
    window.GANNZILLA_NATIVE_SPLIT_DRAWING_TOOLS_V204 = true;
    window.__auditGannzillaNativeSplitDrawingToolsV204 = () => ({
      ok: Boolean(document.getElementById(LINE_CONTROL_ID)) && Boolean(document.getElementById(SHAPE_CONTROL_ID)),
      build: BUILD,
      activeTool,
      openMenu,
      lineMode,
      shapeMode,
      itemCount: items.length,
    });
  }, [activeTool, openMenu, lineMode, shapeMode, items.length]);

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

  const renderItem = (item, key, dashed = false) => {
    if (!canvasRect) return null;
    const x1 = item.x1 * canvasRect.width;
    const y1 = item.y1 * canvasRect.height;
    const x2 = item.x2 * canvasRect.width;
    const y2 = item.y2 * canvasRect.height;
    const stroke = '#0877c9';
    const hitProps = dashed ? {} : {
      [DRAWING_ID_ATTRIBUTE]: item.id,
      stroke: 'rgba(0,0,0,0.001)',
      strokeWidth: 14,
      fill: 'none',
      style: { cursor: 'pointer', pointerEvents: 'stroke' },
    };

    if (item.type === 'line') {
      const markerId = `gann-v204-marker-${String(key).replace(/[^a-zA-Z0-9_-]/g, '')}`;
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
      return <g key={key}>{!dashed && <path d={path} {...hitProps} />}<path d={path} {...common} /></g>;
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

  const lineControl = SplitControl({
    id: LINE_CONTROL_ID,
    rect: lineRect,
    active: activeTool === 'line',
    open: openMenu === 'line',
    title: 'أداة الخط والسهم',
    icon: <LineIcon mode={lineMode} />,
    onActivate: () => activateTool('line'),
    onToggleMenu: () => setOpenMenu((current) => current === 'line' ? null : 'line'),
  });

  const shapeControl = SplitControl({
    id: SHAPE_CONTROL_ID,
    rect: shapeRect,
    active: activeTool === 'shape',
    open: openMenu === 'shape',
    title: 'أداة الأشكال',
    icon: <ShapeIcon mode={shapeMode} />,
    onActivate: () => activateTool('shape'),
    onToggleMenu: () => setOpenMenu((current) => current === 'shape' ? null : 'shape'),
  });

  const lineMenu = openMenu === 'line' ? OptionsMenu({
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

  const shapeMenu = openMenu === 'shape' ? OptionsMenu({
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
