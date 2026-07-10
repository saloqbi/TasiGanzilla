import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = 208;
const TOOLBAR_ID = 'gannzilla-exact-drawing-toolbar-v208';
const LINE_MENU_ID = 'gannzilla-exact-line-menu-v208';
const SHAPE_MENU_ID = 'gannzilla-exact-shape-menu-v208';
const DRAW_LAYER_ID = 'gannzilla-exact-drawing-layer-v208';

const TOOLBAR_HEIGHT = 23;
const POINTER_WIDTH = 22;
const LINE_WIDTH = 30;
const SHAPE_WIDTH = 31;
const TEXT_WIDTH = 21;
const TOOLBAR_WIDTH = POINTER_WIDTH + LINE_WIDTH + SHAPE_WIDTH + TEXT_WIDTH;

function compactLabel(element) {
  return String(element?.textContent || '').replace(/\s+/g, '').trim();
}

function isTopToolbarButton(button) {
  const rect = button?.getBoundingClientRect?.();
  return Boolean(rect)
    && rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.bottom <= 50;
}

function findNativeButton(labels) {
  return Array.from(document.querySelectorAll('button')).find((button) => (
    !button.closest?.(`#${TOOLBAR_ID}, #${LINE_MENU_ID}, #${SHAPE_MENU_ID}`)
    && isTopToolbarButton(button)
    && labels.includes(compactLabel(button))
  )) || null;
}

function rememberAndHide(button) {
  if (!button) return;
  if (!button.dataset.gannzillaV208Prepared) {
    button.dataset.gannzillaV208Prepared = 'true';
    button.dataset.gannzillaV208Opacity = button.style.opacity || '';
    button.dataset.gannzillaV208PointerEvents = button.style.pointerEvents || '';
  }
  button.style.setProperty('opacity', '0', 'important');
  button.style.setProperty('pointer-events', 'none', 'important');
}

function restoreNativeButton(button) {
  if (!button?.dataset.gannzillaV208Prepared) return;
  button.style.opacity = button.dataset.gannzillaV208Opacity || '';
  button.style.pointerEvents = button.dataset.gannzillaV208PointerEvents || '';
  delete button.dataset.gannzillaV208Prepared;
  delete button.dataset.gannzillaV208Opacity;
  delete button.dataset.gannzillaV208PointerEvents;
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function pointFromEvent(event, rect) {
  return {
    x: Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width))),
    y: Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height))),
  };
}

function PointerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      <path
        d="M3.2 2.1 15.7 12.2l-5.1.5 2.8 5-2.5 1.3-2.7-5-3.6 3.4Z"
        fill="#f8fbfd"
        stroke="#52788f"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <path d="m10.1 12.8 3.2 5" fill="none" stroke="#8b8b8b" strokeWidth=".75" />
    </svg>
  );
}

function LineIcon({ mode = 'plain', menu = false }) {
  const markerId = `gannzilla-v208-line-${mode}-${menu ? 'menu' : 'toolbar'}`;
  return (
    <svg width={menu ? 24 : 17} height={menu ? 16 : 14} viewBox="0 0 28 18" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      <defs>
        <marker id={markerId} markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#0878c8" />
        </marker>
      </defs>
      <line
        x1="3"
        y1="9"
        x2="25"
        y2="9"
        stroke="#0878c8"
        strokeWidth="2.25"
        strokeLinecap="square"
        markerStart={mode === 'double' ? `url(#${markerId})` : undefined}
        markerEnd={mode === 'arrow' || mode === 'double' ? `url(#${markerId})` : undefined}
      />
    </svg>
  );
}

function ShapeIcon({ mode = 'rectangle', menu = false }) {
  const common = {
    fill: 'none',
    stroke: '#0878c8',
    strokeWidth: 2.2,
    strokeLinejoin: 'round',
  };
  return (
    <svg width={menu ? 23 : 17} height={menu ? 18 : 15} viewBox="0 0 28 22" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      {mode === 'triangle' && <path d="M14 3 L24 19 H4 Z" {...common} />}
      {mode === 'rectangle' && <rect x="4" y="4" width="20" height="14" rx=".5" {...common} />}
      {mode === 'circle' && <ellipse cx="14" cy="11" rx="10" ry="7" {...common} />}
    </svg>
  );
}

function DropArrow() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 0,
        height: 0,
        borderLeft: '3px solid transparent',
        borderRight: '3px solid transparent',
        borderTop: '4px solid #161616',
        transform: 'translateY(1px)',
        pointerEvents: 'none',
      }}
    />
  );
}

const baseButtonStyle = {
  height: TOOLBAR_HEIGHT,
  minHeight: TOOLBAR_HEIGHT,
  padding: 0,
  margin: 0,
  border: '1px solid #9da7ae',
  borderRadius: 0,
  color: '#0878c8',
  background: 'linear-gradient(#ffffff 0%, #f6f6f6 52%, #e8e8e8 100%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.9)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  cursor: 'pointer',
  userSelect: 'none',
  touchAction: 'manipulation',
  pointerEvents: 'auto',
};

function SingleButton({ width, title, active, children, onActivate, joinLeft = false }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onActivate();
      }}
      style={{
        ...baseButtonStyle,
        width,
        minWidth: width,
        background: active
          ? 'linear-gradient(#e7f7ff 0%, #c8e7f7 55%, #b8daed 100%)'
          : baseButtonStyle.background,
        borderColor: active ? '#7aa5bd' : '#9da7ae',
        borderLeft: joinLeft ? 0 : baseButtonStyle.border,
        boxShadow: active
          ? 'inset 0 0 0 1px #d8f1ff, inset 0 1px 0 #ffffff'
          : baseButtonStyle.boxShadow,
      }}
    >
      {children}
    </button>
  );
}

function SplitButton({
  width,
  title,
  active,
  open,
  icon,
  onActivate,
  onToggle,
}) {
  const arrowWidth = 9;
  const mainWidth = width - arrowWidth;

  return (
    <div
      role="group"
      aria-label={title}
      style={{
        width,
        minWidth: width,
        height: TOOLBAR_HEIGHT,
        display: 'grid',
        gridTemplateColumns: `${mainWidth}px ${arrowWidth}px`,
        padding: 0,
        margin: 0,
        border: '1px solid #9da7ae',
        borderLeft: 0,
        background: active
          ? 'linear-gradient(#e7f7ff 0%, #c8e7f7 55%, #b8daed 100%)'
          : 'linear-gradient(#ffffff 0%, #f6f6f6 52%, #e8e8e8 100%)',
        boxShadow: active
          ? 'inset 0 0 0 1px #d8f1ff, inset 0 1px 0 #ffffff'
          : 'inset 0 1px 0 rgba(255,255,255,.9)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      <button
        type="button"
        title={title}
        aria-label={title}
        aria-pressed={active}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onActivate();
        }}
        style={{
          width: mainWidth,
          height: '100%',
          padding: 0,
          margin: 0,
          border: 0,
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'crosshair',
          pointerEvents: 'auto',
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
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggle();
        }}
        style={{
          width: arrowWidth,
          height: '100%',
          padding: 0,
          margin: 0,
          border: 0,
          background: open ? '#c7e5f6' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      >
        <DropArrow />
      </button>
    </div>
  );
}

function ToolMenu({ id, left, top, type, options, selected, onSelect }) {
  return createPortal(
    <div
      id={id}
      role="menu"
      style={{
        position: 'fixed',
        left,
        top,
        width: 35,
        padding: 3,
        zIndex: 2147483647,
        border: '1px solid #8f9da7',
        background: '#edf0f2',
        boxShadow: '0 3px 8px rgba(0,0,0,.24)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        boxSizing: 'border-box',
        pointerEvents: 'auto',
      }}
    >
      {options.map(({ value, title }) => {
        const isSelected = value === selected;
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
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSelect(value);
            }}
            style={{
              width: 27,
              height: 25,
              padding: 0,
              margin: 0,
              border: '1px solid #9ca7ae',
              borderRadius: 0,
              background: isSelected ? '#d4ecfa' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            {type === 'line'
              ? <LineIcon mode={value} menu />
              : <ShapeIcon mode={value} menu />}
          </button>
        );
      })}
    </div>,
    document.body,
  );
}

export default function GannzillaExactDrawingToolbarV208() {
  const [toolbarRect, setToolbarRect] = React.useState(null);
  const [canvasRect, setCanvasRect] = React.useState(null);
  const [activeTool, setActiveTool] = React.useState('select');
  const [openMenu, setOpenMenu] = React.useState(null);
  const [lineMode, setLineMode] = React.useState('plain');
  const [shapeMode, setShapeMode] = React.useState('rectangle');
  const [items, setItems] = React.useState([]);
  const [draft, setDraft] = React.useState(null);
  const [selectedId, setSelectedId] = React.useState(null);

  const nativeButtonsRef = React.useRef([]);
  const draftRef = React.useRef(null);

  React.useEffect(() => {
    let disposed = false;

    const sync = () => {
      if (disposed) return;

      const pointerButton = findNativeButton(['↖', '↗', '➤']);
      const lineButton = findNativeButton(['—', '−', '-']);
      const shapeButton = findNativeButton(['▢', '□', '▭']);
      const textButton = findNativeButton(['T']);

      const buttons = [pointerButton, lineButton, shapeButton, textButton].filter(Boolean);
      nativeButtonsRef.current = buttons;
      buttons.forEach(rememberAndHide);

      if (buttons.length) {
        const rects = buttons.map((button) => button.getBoundingClientRect());
        const right = Math.max(...rects.map((rect) => rect.right));
        const top = Math.round(Math.min(...rects.map((rect) => rect.top)));
        const next = {
          left: Math.round(right - TOOLBAR_WIDTH),
          top,
          width: TOOLBAR_WIDTH,
          height: TOOLBAR_HEIGHT,
        };
        setToolbarRect((current) => current
          && current.left === next.left
          && current.top === next.top
          ? current
          : next);
      }

      const canvas = findWheelCanvas();
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const nextCanvas = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        };
        setCanvasRect((current) => current
          && current.left === nextCanvas.left
          && current.top === nextCanvas.top
          && current.width === nextCanvas.width
          && current.height === nextCanvas.height
          ? current
          : nextCanvas);
      }
    };

    sync();
    const timer = window.setInterval(sync, 300);
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);

    return () => {
      disposed = true;
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
      nativeButtonsRef.current.forEach(restoreNativeButton);
    };
  }, []);

  React.useEffect(() => {
    const closeMenus = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest?.(`#${TOOLBAR_ID}, #${LINE_MENU_ID}, #${SHAPE_MENU_ID}`)) return;
      setOpenMenu(null);
    };
    document.addEventListener('pointerdown', closeMenus);
    return () => document.removeEventListener('pointerdown', closeMenus);
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
        setItems((current) => current.filter((item) => item.id !== selectedId));
        setSelectedId(null);
      }
      if (event.key === 'Escape') {
        draftRef.current = null;
        setDraft(null);
        setSelectedId(null);
        setOpenMenu(null);
        setActiveTool('select');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId]);

  React.useEffect(() => {
    window.GANNZILLA_EXACT_DRAWING_TOOLBAR_V208 = true;
    window.__auditGannzillaExactDrawingToolbarV208 = () => ({
      ok: Boolean(document.getElementById(TOOLBAR_ID)),
      build: BUILD,
      activeTool,
      openMenu,
      lineMode,
      shapeMode,
      itemCount: items.length,
      exactDimensions: {
        height: TOOLBAR_HEIGHT,
        pointer: POINTER_WIDTH,
        line: LINE_WIDTH,
        shape: SHAPE_WIDTH,
        text: TEXT_WIDTH,
        total: TOOLBAR_WIDTH,
      },
    });
  }, [activeTool, items.length, lineMode, openMenu, shapeMode]);

  const activate = (tool) => {
    setActiveTool(tool);
    setSelectedId(null);
    setOpenMenu(null);
  };

  const selectLine = (mode) => {
    setLineMode(mode);
    setActiveTool('line');
    setSelectedId(null);
    setOpenMenu(null);
  };

  const selectShape = (mode) => {
    setShapeMode(mode);
    setActiveTool('shape');
    setSelectedId(null);
    setOpenMenu(null);
  };

  const beginDrawing = (event) => {
    if (!canvasRect) return;

    if (activeTool === 'select') {
      setSelectedId(null);
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const point = pointFromEvent(event, canvasRect);

    if (activeTool === 'text') {
      const value = window.prompt(document.documentElement.lang === 'ar' ? 'اكتب النص المطلوب' : 'Enter text');
      if (value?.trim()) {
        setItems((current) => [
          ...current,
          {
            id: `${Date.now()}-${Math.random()}`,
            type: 'text',
            x: point.x,
            y: point.y,
            text: value.trim(),
          },
        ]);
      }
      return;
    }

    event.currentTarget.setPointerCapture?.(event.pointerId);
    const next = {
      type: activeTool,
      mode: activeTool === 'line' ? lineMode : shapeMode,
      x1: point.x,
      y1: point.y,
      x2: point.x,
      y2: point.y,
    };
    draftRef.current = next;
    setDraft(next);
  };

  const moveDrawing = (event) => {
    const current = draftRef.current;
    if (!current || !canvasRect) return;
    event.preventDefault();
    event.stopPropagation();
    const point = pointFromEvent(event, canvasRect);
    const next = { ...current, x2: point.x, y2: point.y };
    draftRef.current = next;
    setDraft(next);
  };

  const finishDrawing = (event) => {
    const current = draftRef.current;
    if (!current) return;
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const distance = Math.hypot(current.x2 - current.x1, current.y2 - current.y1);
    if (distance > 0.004) {
      setItems((existing) => [
        ...existing,
        { ...current, id: `${Date.now()}-${Math.random()}` },
      ]);
    }
    draftRef.current = null;
    setDraft(null);
  };

  const renderItem = (item, key, isDraft = false) => {
    if (!canvasRect) return null;

    if (item.type === 'text') {
      const selected = selectedId === item.id;
      return (
        <text
          key={key}
          x={item.x * canvasRect.width}
          y={item.y * canvasRect.height}
          fill={selected ? '#e48711' : '#0878c8'}
          stroke="#ffffff"
          strokeWidth="3"
          paintOrder="stroke"
          fontSize="18"
          fontWeight="700"
          textAnchor="middle"
          style={{
            cursor: activeTool === 'select' ? 'pointer' : 'default',
            pointerEvents: activeTool === 'select' ? 'all' : 'none',
          }}
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (activeTool === 'select') setSelectedId(item.id);
          }}
        >
          {item.text}
        </text>
      );
    }

    const x1 = item.x1 * canvasRect.width;
    const y1 = item.y1 * canvasRect.height;
    const x2 = item.x2 * canvasRect.width;
    const y2 = item.y2 * canvasRect.height;
    const selected = selectedId === item.id;
    const stroke = selected ? '#e48711' : '#0878c8';
    const hit = (event) => {
      if (isDraft || activeTool !== 'select') return;
      event.preventDefault();
      event.stopPropagation();
      setSelectedId(item.id);
    };

    if (item.type === 'line') {
      const markerId = `gannzilla-v208-drawing-${String(key).replace(/[^a-zA-Z0-9_-]/g, '')}`;
      return (
        <g key={key}>
          <defs>
            <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L8,4 L0,8 Z" fill={stroke} />
            </marker>
          </defs>
          {!isDraft && (
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(0,0,0,0.001)"
              strokeWidth="14"
              style={{ cursor: 'pointer', pointerEvents: activeTool === 'select' ? 'stroke' : 'none' }}
              onPointerDown={hit}
            />
          )}
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={stroke}
            strokeWidth={selected ? 3 : 2.4}
            strokeDasharray={isDraft ? '6 4' : undefined}
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
      strokeWidth: selected ? 3 : 2.4,
      strokeDasharray: isDraft ? '6 4' : undefined,
      style: { pointerEvents: 'none' },
    };

    let visibleShape;
    let hitShape;

    if (item.mode === 'triangle') {
      const path = `M ${left + width / 2} ${top} L ${left + width} ${top + height} L ${left} ${top + height} Z`;
      visibleShape = <path d={path} {...common} />;
      hitShape = <path d={path} fill="none" stroke="rgba(0,0,0,0.001)" strokeWidth="14" />;
    } else if (item.mode === 'circle') {
      visibleShape = <ellipse cx={left + width / 2} cy={top + height / 2} rx={width / 2} ry={height / 2} {...common} />;
      hitShape = <ellipse cx={left + width / 2} cy={top + height / 2} rx={width / 2} ry={height / 2} fill="none" stroke="rgba(0,0,0,0.001)" strokeWidth="14" />;
    } else {
      visibleShape = <rect x={left} y={top} width={width} height={height} {...common} />;
      hitShape = <rect x={left} y={top} width={width} height={height} fill="none" stroke="rgba(0,0,0,0.001)" strokeWidth="14" />;
    }

    return (
      <g key={key}>
        {!isDraft && React.cloneElement(hitShape, {
          style: { cursor: 'pointer', pointerEvents: activeTool === 'select' ? 'stroke' : 'none' },
          onPointerDown: hit,
        })}
        {visibleShape}
      </g>
    );
  };

  const toolbar = toolbarRect ? createPortal(
    <div
      id={TOOLBAR_ID}
      role="toolbar"
      aria-label="أدوات الرسم بأسلوب جانزيلا"
      style={{
        position: 'fixed',
        left: toolbarRect.left,
        top: toolbarRect.top,
        width: TOOLBAR_WIDTH,
        height: TOOLBAR_HEIGHT,
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'stretch',
        direction: 'ltr',
        padding: 0,
        margin: 0,
        background: 'transparent',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        pointerEvents: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <SingleButton
        width={POINTER_WIDTH}
        title="أداة التحديد"
        active={activeTool === 'select'}
        onActivate={() => activate('select')}
      >
        <PointerIcon />
      </SingleButton>

      <SplitButton
        width={LINE_WIDTH}
        title="أداة الخط والسهم"
        active={activeTool === 'line'}
        open={openMenu === 'line'}
        icon={<LineIcon mode={lineMode} />}
        onActivate={() => activate('line')}
        onToggle={() => setOpenMenu((current) => current === 'line' ? null : 'line')}
      />

      <SplitButton
        width={SHAPE_WIDTH}
        title="أداة الأشكال"
        active={activeTool === 'shape'}
        open={openMenu === 'shape'}
        icon={<ShapeIcon mode={shapeMode} />}
        onActivate={() => activate('shape')}
        onToggle={() => setOpenMenu((current) => current === 'shape' ? null : 'shape')}
      />

      <SingleButton
        width={TEXT_WIDTH}
        title="أداة النص"
        active={activeTool === 'text'}
        onActivate={() => activate('text')}
        joinLeft
      >
        <span
          aria-hidden="true"
          style={{
            color: '#0878c8',
            fontFamily: 'Times New Roman, Georgia, serif',
            fontSize: 18,
            fontWeight: 800,
            lineHeight: 1,
            transform: 'translateY(-1px)',
            pointerEvents: 'none',
          }}
        >
          T
        </span>
      </SingleButton>
    </div>,
    document.body,
  ) : null;

  const lineMenu = openMenu === 'line' && toolbarRect ? (
    <ToolMenu
      id={LINE_MENU_ID}
      left={toolbarRect.left + POINTER_WIDTH}
      top={toolbarRect.top + TOOLBAR_HEIGHT + 2}
      type="line"
      selected={lineMode}
      options={[
        { value: 'plain', title: 'خط عادي' },
        { value: 'arrow', title: 'سهم باتجاه واحد' },
        { value: 'double', title: 'سهم باتجاهين' },
      ]}
      onSelect={selectLine}
    />
  ) : null;

  const shapeMenu = openMenu === 'shape' && toolbarRect ? (
    <ToolMenu
      id={SHAPE_MENU_ID}
      left={toolbarRect.left + POINTER_WIDTH + LINE_WIDTH}
      top={toolbarRect.top + TOOLBAR_HEIGHT + 2}
      type="shape"
      selected={shapeMode}
      options={[
        { value: 'triangle', title: 'مثلث' },
        { value: 'rectangle', title: 'مستطيل' },
        { value: 'circle', title: 'دائرة أو شكل بيضاوي' },
      ]}
      onSelect={selectShape}
    />
  ) : null;

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
      {activeTool !== 'select' && (
        <rect
          x="0"
          y="0"
          width={canvasRect.width}
          height={canvasRect.height}
          fill="transparent"
          style={{
            cursor: activeTool === 'text' ? 'text' : 'crosshair',
            pointerEvents: 'all',
          }}
          onPointerDown={beginDrawing}
          onPointerMove={moveDrawing}
          onPointerUp={finishDrawing}
          onPointerCancel={finishDrawing}
        />
      )}
      {items.map((item) => renderItem(item, item.id))}
      {draft && renderItem(draft, 'draft', true)}
    </svg>,
    document.body,
  ) : null;

  return <>{toolbar}{lineMenu}{shapeMenu}{drawingLayer}</>;
}
