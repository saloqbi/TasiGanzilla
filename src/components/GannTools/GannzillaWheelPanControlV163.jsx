import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = '163';
const CONTROL_ID = 'gannzilla-wheel-pan-control-v163';
const PANEL_ID = 'gannzilla-wheel-pan-panel-v163';
const PAN_STEP = 120;
const RESERVED_SPACE = 24;

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
    width: 22,
    height: Math.max(21, Math.round(rect.height)),
  };
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 300 && rect.height > 300)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function findWheelViewport() {
  const canvas = findWheelCanvas();
  if (!canvas) return null;

  let current = canvas.parentElement;
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    if (['auto', 'scroll', 'overlay'].includes(style.overflowX)
      || ['auto', 'scroll', 'overlay'].includes(style.overflowY)) return current;
    current = current.parentElement;
  }
  return null;
}

function moveWheel(direction) {
  const viewport = findWheelViewport();
  if (!viewport) return false;

  const delta = {
    left: { left: PAN_STEP, top: 0 },
    right: { left: -PAN_STEP, top: 0 },
    up: { left: 0, top: PAN_STEP },
    down: { left: 0, top: -PAN_STEP },
  }[direction];

  if (!delta) return false;
  viewport.scrollBy({ ...delta, behavior: 'smooth' });
  return true;
}

function centerWheel() {
  const viewport = findWheelViewport();
  if (!viewport) return false;
  viewport.scrollTo({
    left: Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2),
    top: Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2),
    behavior: 'smooth',
  });
  return true;
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
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['style', 'class'] });
    const languageObserver = new MutationObserver(refresh);
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    const timer = window.setInterval(refresh, 150);
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);

    window.GANNZILLA_WHEEL_PAN_CONTROL_V163 = true;
    window.__auditGannzillaWheelPanControlV163 = () => {
      const control = document.getElementById(CONTROL_ID);
      const style = control ? window.getComputedStyle(control) : null;
      const minus = findZoomMinusButton();
      return {
        ok: Boolean(control)
          && style?.display !== 'none'
          && style?.visibility !== 'hidden'
          && style?.pointerEvents !== 'none'
          && Boolean(minus)
          && Number.parseFloat(window.getComputedStyle(minus).marginLeft) >= RESERVED_SPACE,
        build: BUILD,
        visible: Boolean(control),
        anchoredToZoomMinus: Boolean(minus),
        reservedToolbarSpace: minus ? window.getComputedStyle(minus).marginLeft : null,
        panelOpen: Boolean(document.getElementById(PANEL_ID)),
        wheelViewportFound: Boolean(findWheelViewport()),
      };
    };

    return () => {
      disposed = true;
      observer.disconnect();
      languageObserver.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
      findZoomMinusButton()?.style.removeProperty('margin-left');
    };
  }, []);

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
        position: 'fixed',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        minWidth: rect.width,
        height: rect.height,
        padding: 0,
        margin: 0,
        zIndex: 2147483647,
        border: '1px solid #a7a7a7',
        borderRadius: 2,
        background: '#f7f7f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        visibility: 'visible',
        opacity: 1,
        pointerEvents: 'auto',
        cursor: 'pointer',
        boxSizing: 'border-box',
        touchAction: 'manipulation',
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
        position: 'fixed',
        left: Math.max(4, rect.left - 43),
        top: rect.top + rect.height + 4,
        width: 110,
        height: 110,
        zIndex: 2147483647,
        display: 'grid',
        gridTemplateColumns: '34px 34px 34px',
        gridTemplateRows: '34px 34px 34px',
        gap: 2,
        padding: 4,
        border: '1px solid #8e9aa5',
        borderRadius: 3,
        background: '#eef1f3',
        boxShadow: '0 4px 12px rgba(0,0,0,.22)',
        boxSizing: 'border-box',
      }}
    >
      <button type="button" title={labels.up} aria-label={labels.up} onClick={() => moveWheel('up')} style={{ gridColumn: 2, gridRow: 1 }}><Arrow direction="up" /></button>
      <button type="button" title={labels.left} aria-label={labels.left} onClick={() => moveWheel('left')} style={{ gridColumn: 1, gridRow: 2 }}><Arrow direction="left" /></button>
      <button type="button" title={labels.center} aria-label={labels.center} onClick={centerWheel} style={{ gridColumn: 2, gridRow: 2 }}><span style={{ width: 12, height: 12, border: '2px solid #1c75bc', borderRadius: '50%', display: 'block', boxSizing: 'border-box' }} /></button>
      <button type="button" title={labels.right} aria-label={labels.right} onClick={() => moveWheel('right')} style={{ gridColumn: 3, gridRow: 2 }}><Arrow direction="right" /></button>
      <button type="button" title={labels.down} aria-label={labels.down} onClick={() => moveWheel('down')} style={{ gridColumn: 2, gridRow: 3 }}><Arrow direction="down" /></button>
      <style>{`
        #${PANEL_ID} button {
          width: 34px;
          height: 34px;
          padding: 0;
          border: 1px solid #a5afb8;
          border-radius: 2px;
          background: linear-gradient(#ffffff,#e3e7ea);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-sizing: border-box;
        }
      `}</style>
    </div>,
    document.body,
  );

  return <>{toolbarButton}{panel}</>;
}
