import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = 214;
const SOURCE_TOOLBAR_ID = 'gannzilla-exact-drawing-toolbar-v208';
const FINAL_TOOLBAR_ID = 'gannzilla-final-drawing-toolbar-v214';
const TOOLBAR_HEIGHT = 23;
const POINTER_WIDTH = 22;
const LINE_WIDTH = 30;
const SHAPE_WIDTH = 31;
const TEXT_WIDTH = 21;
const TOOLBAR_WIDTH = POINTER_WIDTH + LINE_WIDTH + SHAPE_WIDTH + TEXT_WIDTH;
const HIDDEN_ATTR = 'data-gannzilla-native-drawing-hidden-v214';

function compactLabel(element) {
  return String(element?.textContent || '').replace(/\s+/g, '').trim();
}

function isTopButton(button) {
  const rect = button?.getBoundingClientRect?.();
  return Boolean(rect)
    && rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.bottom <= 55;
}

function hideNativeDrawingButtons() {
  Array.from(document.querySelectorAll('button')).forEach((button) => {
    if (button.closest?.(`#${SOURCE_TOOLBAR_ID}, #${FINAL_TOOLBAR_ID}`)) return;
    if (!isTopButton(button)) return;
    const label = compactLabel(button);
    if (!['↖', '↗', '➤', '—', '−', '-', '▢', '□', '▭', 'T'].includes(label)) return;
    button.setAttribute(HIDDEN_ATTR, 'true');
    button.style.setProperty('opacity', '0', 'important');
    button.style.setProperty('visibility', 'hidden', 'important');
    button.style.setProperty('pointer-events', 'none', 'important');
  });
}

function PointerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      <path d="M3.2 2.1 15.7 12.2l-5.1.5 2.8 5-2.5 1.3-2.7-5-3.6 3.4Z" fill="#f8fbfd" stroke="#52788f" strokeWidth="1.15" strokeLinejoin="round" />
      <path d="m10.1 12.8 3.2 5" fill="none" stroke="#8b8b8b" strokeWidth=".75" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg width="17" height="14" viewBox="0 0 28 18" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      <line x1="3" y1="9" x2="25" y2="9" stroke="#0878c8" strokeWidth="2.25" strokeLinecap="square" />
    </svg>
  );
}

function ShapeIcon() {
  return (
    <svg width="17" height="15" viewBox="0 0 28 22" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      <rect x="4" y="4" width="20" height="14" rx=".5" fill="none" stroke="#0878c8" strokeWidth="2.2" />
    </svg>
  );
}

function DropArrow() {
  return <span aria-hidden="true" style={{ width: 0, height: 0, borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderTop: '4px solid #161616', transform: 'translateY(1px)', pointerEvents: 'none' }} />;
}

const baseControl = {
  height: TOOLBAR_HEIGHT,
  minHeight: TOOLBAR_HEIGHT,
  padding: 0,
  margin: 0,
  border: '1px solid #9da7ae',
  borderRadius: 0,
  background: 'linear-gradient(#ffffff 0%, #f6f6f6 52%, #e8e8e8 100%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.9)',
  color: '#0878c8',
  boxSizing: 'border-box',
  userSelect: 'none',
};

function SingleControl({ width, active, title, children, onClick, joinLeft = false }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); }}
      onClick={(event) => { event.preventDefault(); event.stopPropagation(); onClick(); }}
      style={{
        ...baseControl,
        width,
        minWidth: width,
        borderLeft: joinLeft ? 0 : baseControl.border,
        background: active ? 'linear-gradient(#e7f7ff 0%, #c8e7f7 55%, #b8daed 100%)' : baseControl.background,
        borderColor: active ? '#7aa5bd' : '#9da7ae',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
    >
      {children}
    </button>
  );
}

function SplitControl({ width, active, title, icon, onMain, onArrow }) {
  const arrowWidth = 9;
  const mainWidth = width - arrowWidth;
  return (
    <div role="group" aria-label={title} style={{ ...baseControl, width, minWidth: width, borderLeft: 0, display: 'grid', gridTemplateColumns: `${mainWidth}px ${arrowWidth}px`, overflow: 'hidden', pointerEvents: 'auto' }}>
      <button
        type="button"
        title={title}
        aria-label={title}
        onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); }}
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); onMain(); }}
        style={{ width: mainWidth, height: '100%', padding: 0, margin: 0, border: 0, background: active ? '#d9edf9' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'crosshair', pointerEvents: 'auto' }}
      >
        {icon}
      </button>
      <button
        type="button"
        title={`${title} - الخيارات`}
        aria-label={`${title} - الخيارات`}
        onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); }}
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); onArrow(); }}
        style={{ width: arrowWidth, height: '100%', padding: 0, margin: 0, border: 0, borderLeft: '1px solid #9aaab4', background: active ? '#c7e5f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', pointerEvents: 'auto' }}
      >
        <DropArrow />
      </button>
    </div>
  );
}

export default function GannzillaFinalDrawingToolbarV214() {
  const [rect, setRect] = React.useState(null);
  const [active, setActive] = React.useState('select');

  React.useEffect(() => {
    let disposed = false;
    const sync = () => {
      if (disposed) return;
      const source = document.getElementById(SOURCE_TOOLBAR_ID);
      if (!source) {
        setRect(null);
        return;
      }

      const sourceRect = source.getBoundingClientRect();
      if (sourceRect.width > 0 && sourceRect.height > 0) {
        const next = {
          left: Math.round(sourceRect.left),
          top: Math.round(sourceRect.top),
        };
        setRect((current) => current && current.left === next.left && current.top === next.top ? current : next);
      }

      source.style.setProperty('width', `${TOOLBAR_WIDTH}px`, 'important');
      source.style.setProperty('min-width', `${TOOLBAR_WIDTH}px`, 'important');
      source.style.setProperty('height', `${TOOLBAR_HEIGHT}px`, 'important');
      source.style.setProperty('min-height', `${TOOLBAR_HEIGHT}px`, 'important');
      source.style.setProperty('opacity', '0', 'important');
      source.style.setProperty('visibility', 'visible', 'important');
      source.style.setProperty('pointer-events', 'none', 'important');
      source.style.setProperty('transform', 'none', 'important');

      hideNativeDrawingButtons();

      const staleReplica = document.getElementById('gannzilla-pixel-toolbar-v212');
      if (staleReplica) staleReplica.style.setProperty('display', 'none', 'important');

      window.GANNZILLA_FINAL_DRAWING_TOOLBAR_V214 = true;
      window.__auditGannzillaFinalDrawingToolbarV214 = () => ({
        ok: Boolean(document.getElementById(FINAL_TOOLBAR_ID)) && Boolean(source),
        build: BUILD,
        width: TOOLBAR_WIDTH,
        height: TOOLBAR_HEIGHT,
        hiddenNativeCount: document.querySelectorAll(`[${HIDDEN_ATTR}="true"]`).length,
      });
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setInterval(sync, 200);
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    return () => {
      disposed = true;
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, []);

  const press = (controlIndex, buttonIndex = null, tool = null) => {
    const source = document.getElementById(SOURCE_TOOLBAR_ID);
    const control = source?.children?.[controlIndex];
    const target = buttonIndex === null
      ? (control?.matches?.('button') ? control : control?.querySelector?.('button'))
      : control?.querySelectorAll?.('button')?.[buttonIndex];
    target?.click?.();
    if (tool) setActive(tool);
  };

  if (!rect) return null;

  return createPortal(
    <div
      id={FINAL_TOOLBAR_ID}
      role="toolbar"
      aria-label="أدوات الرسم بأسلوب جانزيلا"
      style={{
        position: 'fixed',
        left: rect.left,
        top: rect.top,
        width: TOOLBAR_WIDTH,
        minWidth: TOOLBAR_WIDTH,
        height: TOOLBAR_HEIGHT,
        minHeight: TOOLBAR_HEIGHT,
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'stretch',
        direction: 'ltr',
        padding: 0,
        margin: 0,
        gap: 0,
        background: 'transparent',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        pointerEvents: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <SingleControl width={POINTER_WIDTH} active={active === 'select'} title="أداة التحديد" onClick={() => press(0, null, 'select')}>
        <PointerIcon />
      </SingleControl>
      <SplitControl width={LINE_WIDTH} active={active === 'line'} title="أداة الخط والسهم" icon={<LineIcon />} onMain={() => press(1, 0, 'line')} onArrow={() => press(1, 1)} />
      <SplitControl width={SHAPE_WIDTH} active={active === 'shape'} title="أداة الأشكال" icon={<ShapeIcon />} onMain={() => press(2, 0, 'shape')} onArrow={() => press(2, 1)} />
      <SingleControl width={TEXT_WIDTH} active={active === 'text'} title="أداة النص" joinLeft onClick={() => press(3, null, 'text')}>
        <span aria-hidden="true" style={{ color: '#0878c8', fontFamily: 'Times New Roman, Georgia, serif', fontSize: 18, fontWeight: 800, lineHeight: 1, transform: 'translateY(-1px)', pointerEvents: 'none' }}>T</span>
      </SingleControl>
    </div>,
    document.body,
  );
}
