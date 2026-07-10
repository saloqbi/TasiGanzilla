import React from 'react';
import { createPortal } from 'react-dom';

const CONTROL_ID = 'gannzilla-wheel-pan-v180';
const PANEL_ID = 'gannzilla-wheel-pan-panel-v180';
const STEP = 100;

function labelOf(element) {
  return String(element?.textContent || '').replace(/\s+/g, '').trim();
}

function topRow(element) {
  const rect = element?.getBoundingClientRect?.();
  return Boolean(rect) && rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= 48;
}

function getButtonRect() {
  const buttons = Array.from(document.querySelectorAll('button')).filter(topRow);
  const anchor = buttons.find((button) => ['⛶', '⤢', '↗'].includes(labelOf(button)))
    || buttons.find((button) => ['-', '−'].includes(labelOf(button)));

  if (!anchor) {
    return { left: Math.max(8, window.innerWidth - 190), top: 1, width: 26, height: 22 };
  }

  anchor.style.setProperty('margin-left', '30px', 'important');
  const rect = anchor.getBoundingClientRect();
  return {
    left: Math.round(rect.left - 28),
    top: Math.round(rect.top),
    width: 26,
    height: Math.max(21, Math.round(rect.height)),
  };
}

function findCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function MoveIcon() {
  return <span aria-hidden="true" style={{ color: '#176ea6', fontSize: 17, fontWeight: 900, lineHeight: 1 }}>✥</span>;
}

export default function GannzillaWheelPanControlV180() {
  const [rect, setRect] = React.useState(getButtonRect);
  const [open, setOpen] = React.useState(false);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const refresh = () => setRect(getButtonRect());
    refresh();
    const timer = window.setInterval(refresh, 500);
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
    };
  }, []);

  React.useEffect(() => {
    const canvas = findCanvas();
    if (!canvas) return;
    canvas.style.setProperty('transform', `translate3d(${pan.x}px, ${pan.y}px, 0)`, 'important');
    canvas.style.setProperty('transform-origin', 'center center', 'important');
    canvas.style.setProperty('transition', 'transform 150ms ease-out', 'important');
  }, [pan]);

  React.useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest(`#${CONTROL_ID}, #${PANEL_ID}`)) setOpen(false);
    };
    document.addEventListener('pointerdown', close, true);
    return () => document.removeEventListener('pointerdown', close, true);
  }, [open]);

  const move = (direction) => {
    const delta = {
      up: { x: 0, y: -STEP },
      down: { x: 0, y: STEP },
      left: { x: -STEP, y: 0 },
      right: { x: STEP, y: 0 },
    }[direction];
    setPan((current) => ({ x: current.x + delta.x, y: current.y + delta.y }));
  };

  const button = createPortal(
    <button
      id={CONTROL_ID}
      type="button"
      title="تحريك العجلة"
      aria-label="تحريك العجلة"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setOpen((value) => !value);
      }}
      style={{
        position: 'fixed', left: rect.left, top: rect.top, width: rect.width, minWidth: rect.width,
        height: rect.height, padding: 0, margin: 0, zIndex: 2147483647,
        border: '1px solid #7e9aad', borderRadius: 2, background: open ? '#d9edf9' : '#f7f7f7',
        display: 'flex', alignItems: 'center', justifyContent: 'center', visibility: 'visible',
        opacity: 1, pointerEvents: 'auto', cursor: 'pointer', boxSizing: 'border-box',
      }}
    ><MoveIcon /></button>,
    document.body,
  );

  const panel = open ? createPortal(
    <div id={PANEL_ID} style={{
      position: 'fixed', left: Math.max(4, rect.left - 42), top: rect.top + rect.height + 4,
      width: 110, height: 110, zIndex: 2147483647, display: 'grid',
      gridTemplateColumns: '34px 34px 34px', gridTemplateRows: '34px 34px 34px',
      gap: 2, padding: 4, border: '1px solid #8e9aa5', borderRadius: 3,
      background: '#eef1f3', boxShadow: '0 4px 12px rgba(0,0,0,.22)', boxSizing: 'border-box',
    }}>
      <button type="button" onClick={() => move('up')} style={{ gridColumn: 2, gridRow: 1 }}>▲</button>
      <button type="button" onClick={() => move('left')} style={{ gridColumn: 1, gridRow: 2 }}>◀</button>
      <button type="button" onClick={() => setPan({ x: 0, y: 0 })} style={{ gridColumn: 2, gridRow: 2 }}>●</button>
      <button type="button" onClick={() => move('right')} style={{ gridColumn: 3, gridRow: 2 }}>▶</button>
      <button type="button" onClick={() => move('down')} style={{ gridColumn: 2, gridRow: 3 }}>▼</button>
      <style>{`#${PANEL_ID} button{width:34px;height:34px;padding:0;border:1px solid #a5afb8;border-radius:2px;background:#fff;color:#176ea6;display:flex;align-items:center;justify-content:center;cursor:pointer}`}</style>
    </div>,
    document.body,
  ) : null;

  return <>{button}{panel}</>;
}
