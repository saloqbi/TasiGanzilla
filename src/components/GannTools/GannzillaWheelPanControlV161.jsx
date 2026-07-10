import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = '161';
const HOST_ID = 'gannzilla-wheel-pan-host-v161';
const CONTROL_ID = 'gannzilla-wheel-pan-control-v161';
const PANEL_ID = 'gannzilla-wheel-pan-panel-v161';
const PAN_STEP = 120;

function isTopRow(element) {
  const rect = element?.getBoundingClientRect?.();
  return Boolean(rect)
    && rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.bottom <= 42;
}

function normalizeLabel(element) {
  return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
}

function findZoomMinusButton() {
  return Array.from(document.querySelectorAll('button')).find((button) => {
    if (!isTopRow(button)) return false;
    const label = normalizeLabel(button);
    if (label !== '-' && label !== '−') return false;
    const next = button.nextElementSibling;
    return Boolean(next && /^\d+%$/.test(normalizeLabel(next)));
  }) || null;
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
    const overflowX = style.overflowX;
    const overflowY = style.overflowY;
    const scrollableStyle = ['auto', 'scroll', 'overlay'].includes(overflowX)
      || ['auto', 'scroll', 'overlay'].includes(overflowY);
    const hasOverflow = current.scrollWidth > current.clientWidth + 2
      || current.scrollHeight > current.clientHeight + 2;

    if (scrollableStyle || hasOverflow) return current;
    current = current.parentElement;
  }

  return canvas.parentElement?.parentElement || canvas.parentElement || null;
}

function moveWheel(direction) {
  const viewport = findWheelViewport();
  if (!viewport) return false;

  // The control moves the wheel itself, not the viewport camera.
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
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      <path d="M12 2 9 5h2v4h2V5h2L12 2Z" fill="#1c75bc" />
      <path d="m12 22 3-3h-2v-4h-2v4H9l3 3Z" fill="#1c75bc" />
      <path d="M2 12 5 9v2h4v2H5v2l-3-3Z" fill="#1c75bc" />
      <path d="m22 12-3 3v-2h-4v-2h4V9l3 3Z" fill="#1c75bc" />
      <circle cx="12" cy="12" r="2.2" fill="#d9edf9" stroke="#1c75bc" strokeWidth="1" />
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

export default function GannzillaWheelPanControlV161() {
  const [host, setHost] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [panelPosition, setPanelPosition] = React.useState({ left: 0, top: 27 });
  const [language, setLanguage] = React.useState(document.documentElement.lang === 'ar' ? 'ar' : 'en');

  React.useEffect(() => {
    let disposed = false;

    const install = () => {
      if (disposed) return;
      setLanguage(document.documentElement.lang === 'ar' ? 'ar' : 'en');

      const zoomMinus = findZoomMinusButton();
      const parent = zoomMinus?.parentElement;
      if (!zoomMinus || !parent) return;

      let nextHost = document.getElementById(HOST_ID);
      if (!nextHost) {
        nextHost = document.createElement('span');
        nextHost.id = HOST_ID;
      }

      Object.assign(nextHost.style, {
        display: 'inline-flex',
        alignItems: 'center',
        height: '24px',
        marginRight: '2px',
        verticalAlign: 'middle',
      });

      if (nextHost.parentElement !== parent || nextHost.nextSibling !== zoomMinus) {
        parent.insertBefore(nextHost, zoomMinus);
      }

      setHost((current) => (current === nextHost ? current : nextHost));
    };

    install();
    const observer = new MutationObserver(install);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    const timer = window.setInterval(install, 250);
    window.addEventListener('resize', install);

    window.GANNZILLA_WHEEL_PAN_CONTROL_V161 = true;
    window.__auditGannzillaWheelPanControlV161 = () => {
      const control = document.getElementById(CONTROL_ID);
      const style = control ? window.getComputedStyle(control) : null;
      return {
        ok: Boolean(control)
          && style?.display !== 'none'
          && style?.visibility !== 'hidden'
          && style?.pointerEvents !== 'none'
          && Boolean(findWheelViewport()),
        build: BUILD,
        visible: Boolean(control),
        panelOpen: Boolean(document.getElementById(PANEL_ID)),
        wheelViewportFound: Boolean(findWheelViewport()),
      };
    };

    return () => {
      disposed = true;
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', install);
      document.getElementById(HOST_ID)?.remove();
    };
  }, []);

  React.useEffect(() => {
    if (!open) return undefined;
    const onOutside = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(`#${CONTROL_ID}, #${PANEL_ID}`)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onOutside, true);
    return () => document.removeEventListener('pointerdown', onOutside, true);
  }, [open]);

  if (!host) return null;

  const title = language === 'ar' ? 'تحريك العجلة' : 'Move wheel';
  const labels = language === 'ar'
    ? { up: 'أعلى', down: 'أسفل', left: 'يسار', right: 'يمين', center: 'توسيط العجلة' }
    : { up: 'Up', down: 'Down', left: 'Left', right: 'Right', center: 'Center wheel' };

  const buttonStyle = {
    width: 29,
    height: 24,
    padding: 0,
    border: '1px solid #aeb6bb',
    borderRadius: 1,
    background: 'linear-gradient(#ffffff,#e9e9e9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxSizing: 'border-box',
  };

  const control = createPortal(
    <button
      id={CONTROL_ID}
      type="button"
      title={title}
      aria-label={title}
      aria-expanded={open}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        setPanelPosition({
          left: Math.max(4, Math.round(rect.left + rect.width / 2 - 53)),
          top: Math.round(rect.bottom + 3),
        });
        setOpen((value) => !value);
      }}
      style={buttonStyle}
    >
      <DirectionIcon />
    </button>,
    host,
  );

  const panel = open && createPortal(
    <div
      id={PANEL_ID}
      role="group"
      aria-label={title}
      style={{
        position: 'fixed',
        left: panelPosition.left,
        top: panelPosition.top,
        width: 106,
        height: 106,
        zIndex: 2147483647,
        display: 'grid',
        gridTemplateColumns: '34px 34px 34px',
        gridTemplateRows: '34px 34px 34px',
        gap: 2,
        padding: 4,
        border: '1px solid #8e9aa5',
        borderRadius: 3,
        background: '#eef1f3',
        boxShadow: '0 4px 12px rgba(0,0,0,.28)',
        boxSizing: 'border-box',
      }}
    >
      <span />
      <button type="button" title={labels.up} aria-label={labels.up} onClick={() => moveWheel('up')} style={buttonStyle}><Arrow direction="up" /></button>
      <span />
      <button type="button" title={labels.left} aria-label={labels.left} onClick={() => moveWheel('left')} style={buttonStyle}><Arrow direction="left" /></button>
      <button type="button" title={labels.center} aria-label={labels.center} onClick={centerWheel} style={{ ...buttonStyle, color: '#1c75bc', fontWeight: 900, fontSize: 16 }}>●</button>
      <button type="button" title={labels.right} aria-label={labels.right} onClick={() => moveWheel('right')} style={buttonStyle}><Arrow direction="right" /></button>
      <span />
      <button type="button" title={labels.down} aria-label={labels.down} onClick={() => moveWheel('down')} style={buttonStyle}><Arrow direction="down" /></button>
      <span />
    </div>,
    document.body,
  );

  return <>{control}{panel}</>;
}
