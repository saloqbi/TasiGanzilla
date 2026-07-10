import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = '165';
const CONTROL_ID = 'gannzilla-wheel-pan-control-v163';
const PANEL_ID = 'gannzilla-wheel-pan-panel-v163';
const PAN_STEP = 100;
const RESERVED_SPACE = 30;
const STORAGE_KEY = 'gannzillaWheelPanV165';

function textOf(element) {
  return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
}

function isTopRow(element) {
  const rect = element?.getBoundingClientRect?.();
  return Boolean(rect)
    && rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.bottom <= 42;
}

function findZoomMinusButton() {
  const percent = Array.from(document.querySelectorAll('span, div'))
    .filter(isTopRow)
    .find((element) => /^\d+%$/.test(textOf(element)) && element.children.length === 0);

  const previous = percent?.previousElementSibling;
  if (previous?.tagName === 'BUTTON' && ['-', '−'].includes(textOf(previous))) return previous;

  return Array.from(document.querySelectorAll('button'))
    .filter(isTopRow)
    .find((button) => {
      if (!['-', '−'].includes(textOf(button))) return false;
      const next = button.nextElementSibling;
      return Boolean(next && /^\d+%$/.test(textOf(next)));
    }) || null;
}

function getControlRect() {
  const minus = findZoomMinusButton();
  if (!minus) return null;

  minus.style.setProperty('margin-left', `${RESERVED_SPACE}px`, 'important');
  const rect = minus.getBoundingClientRect();
  return {
    left: Math.round(rect.left - RESERVED_SPACE),
    top: Math.round(rect.top),
    width: 24,
    height: Math.max(21, Math.round(rect.height)),
  };
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function loadPan() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    return {
      x: Number.isFinite(saved.x) ? saved.x : 0,
      y: Number.isFinite(saved.y) ? saved.y : 0,
    };
  } catch (_) {
    return { x: 0, y: 0 };
  }
}

function savePan(pan) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pan));
  } catch (_) {
    // Ignore storage restrictions.
  }
}

function DirectionIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      <path d="M12 2 9 5h2v4h2V5h2L12 2Z" fill="#1c75bc" />
      <path d="m12 22 3-3h-2v-4h-2v4H9l3 3Z" fill="#1c75bc" />
      <path d="M2 12 5 9v2h4v2H5v2l-3-3Z" fill="#1c75bc" />
      <path d="m22 12-3 3v-2h-4v-2h4V9l3 3Z" fill="#1c75bc" />
      <circle cx="12" cy="12" r="2" fill="#d9edf9" stroke="#1c75bc" />
    </svg>
  );
}

function Arrow({ direction }) {
  const path = {
    up: 'M12 4 5 12h4v8h6v-8h4L12 4Z',
    down: 'm12 20 7-8h-4V4H9v8H5l7 8Z',
    left: 'M4 12l8-7v4h8v6h-8v4l-8-7Z',
    right: 'm20 12-8 7v-4H4V9h8V5l8 7Z',
  }[direction];
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      <path d={path} fill="#1c75bc" />
    </svg>
  );
}

export default function GannzillaWheelPanControlV163() {
  const [rect, setRect] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [language, setLanguage] = React.useState(document.documentElement.lang === 'ar' ? 'ar' : 'en');
  const [pan, setPan] = React.useState(loadPan);

  const applyPan = React.useCallback((nextPan = pan) => {
    const canvas = findWheelCanvas();
    if (!canvas) return false;
    canvas.style.setProperty('transform', `translate3d(${nextPan.x}px, ${nextPan.y}px, 0)`, 'important');
    canvas.style.setProperty('transform-origin', 'center center', 'important');
    canvas.style.setProperty('transition', 'transform 160ms ease-out', 'important');
    canvas.dataset.gannzillaPanV165 = `${nextPan.x},${nextPan.y}`;
    return true;
  }, [pan]);

  React.useEffect(() => {
    let disposed = false;
    const refresh = () => {
      if (disposed) return;
      setLanguage(document.documentElement.lang === 'ar' ? 'ar' : 'en');
      const next = getControlRect();
      setRect((current) => (
        current && next
        && current.left === next.left
        && current.top === next.top
        && current.width === next.width
        && current.height === next.height
          ? current
          : next
      ));
      applyPan();
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    const languageObserver = new MutationObserver(refresh);
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    const timer = window.setInterval(refresh, 250);
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);

    window.GANNZILLA_WHEEL_PAN_CONTROL_V165 = true;
    window.__auditGannzillaWheelPanControlV165 = () => {
      const control = document.getElementById(CONTROL_ID);
      const canvas = findWheelCanvas();
      const style = control ? window.getComputedStyle(control) : null;
      return {
        ok: Boolean(control)
          && style?.display !== 'none'
          && style?.visibility !== 'hidden'
          && style?.pointerEvents !== 'none'
          && Boolean(canvas)
          && canvas?.dataset?.gannzillaPanV165 === `${pan.x},${pan.y}`,
        build: BUILD,
        visible: Boolean(control),
        panelOpen: Boolean(document.getElementById(PANEL_ID)),
        canvasFound: Boolean(canvas),
        pan,
      };
    };

    return () => {
      disposed = true;
      observer.disconnect();
      languageObserver.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
    };
  }, [applyPan, pan]);

  React.useEffect(() => {
    applyPan(pan);
    savePan(pan);
  }, [applyPan, pan]);

  React.useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(`#${CONTROL_ID}, #${PANEL_ID}`)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', close, true);
    return () => document.removeEventListener('pointerdown', close, true);
  }, [open]);

  const move = React.useCallback((direction) => {
    setPan((current) => {
      const delta = {
        left: { x: -PAN_STEP, y: 0 },
        right: { x: PAN_STEP, y: 0 },
        up: { x: 0, y: -PAN_STEP },
        down: { x: 0, y: PAN_STEP },
      }[direction];
      if (!delta) return current;
      return {
        x: Math.max(-2000, Math.min(2000, current.x + delta.x)),
        y: Math.max(-2000, Math.min(2000, current.y + delta.y)),
      };
    });
  }, []);

  if (!rect) return null;

  const ar = language === 'ar';
  const title = ar ? 'تحريك العجلة' : 'Move wheel';
  const labels = ar
    ? { up: 'أعلى', down: 'أسفل', left: 'يسار', right: 'يمين', center: 'توسيط العجلة' }
    : { up: 'Up', down: 'Down', left: 'Left', right: 'Right', center: 'Center wheel' };

  const toolbarButton = createPortal(
    <button
      id={CONTROL_ID}
      type="button"
      title={title}
      aria-label={title}
      aria-expanded={open}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setOpen((value) => !value);
      }}
      style={{
        position: 'fixed', left: rect.left - 4, top: rect.top, width: rect.width, minWidth: rect.width,
        height: rect.height, padding: 0, margin: 0, zIndex: 2147483647,
        border: '1px solid #a7a7a7', borderRadius: 2, background: '#f7f7f7',
        display: 'flex', alignItems: 'center', justifyContent: 'center', visibility: 'visible',
        opacity: 1, pointerEvents: 'auto', cursor: 'pointer', boxSizing: 'border-box', touchAction: 'manipulation',
      }}
    >
      <DirectionIcon />
    </button>,
    document.body,
  );

  const panel = open && createPortal(
    <div
      id={PANEL_ID}
      role="group"
      aria-label={title}
      style={{
        position: 'fixed', left: Math.max(4, rect.left - 47), top: rect.top + rect.height + 4,
        width: 110, height: 110, zIndex: 2147483647, display: 'grid',
        gridTemplateColumns: '34px 34px 34px', gridTemplateRows: '34px 34px 34px',
        gap: 2, padding: 4, border: '1px solid #8e9aa5', borderRadius: 3,
        background: '#eef1f3', boxShadow: '0 4px 12px rgba(0,0,0,.22)', boxSizing: 'border-box',
      }}
    >
      <button type="button" title={labels.up} aria-label={labels.up} onClick={() => move('up')} style={{ gridColumn: 2, gridRow: 1 }}><Arrow direction="up" /></button>
      <button type="button" title={labels.left} aria-label={labels.left} onClick={() => move('left')} style={{ gridColumn: 1, gridRow: 2 }}><Arrow direction="left" /></button>
      <button type="button" title={labels.center} aria-label={labels.center} onClick={() => setPan({ x: 0, y: 0 })} style={{ gridColumn: 2, gridRow: 2 }}><span style={{ width: 12, height: 12, border: '2px solid #1c75bc', borderRadius: '50%', display: 'block', boxSizing: 'border-box' }} /></button>
      <button type="button" title={labels.right} aria-label={labels.right} onClick={() => move('right')} style={{ gridColumn: 3, gridRow: 2 }}><Arrow direction="right" /></button>
      <button type="button" title={labels.down} aria-label={labels.down} onClick={() => move('down')} style={{ gridColumn: 2, gridRow: 3 }}><Arrow direction="down" /></button>
      <style>{`
        #${PANEL_ID} button {
          width: 34px; height: 34px; padding: 0; border: 1px solid #a5afb8; border-radius: 2px;
          background: linear-gradient(#ffffff,#e3e7ea); display: flex; align-items: center;
          justify-content: center; cursor: pointer; box-sizing: border-box;
        }
        #${PANEL_ID} button:active { background: #cfe7f7; transform: translateY(1px); }
      `}</style>
    </div>,
    document.body,
  );

  return <>{toolbarButton}{panel}</>;
}
