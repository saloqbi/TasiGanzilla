import React from 'react';

const MARKER = 'GANNZILLA_UNIFIED_DRAWING_PALETTES_V123_FIXED';
const STORAGE_KEY = 'gannzillaDrawingToolsVisibleV123';
const LEGACY_STORAGE_KEY = 'gannzillaDrawingToolsVisibleV122';
const LEFT_ID = 'gannzilla-left-drawing-palette-v123';
const OVERLAY_ID = 'gannzilla-drawing-tools-toggle-v123';

function polygonPoints(sides, radius = 13, cx = 16, cy = 16) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(' ');
}

function ToolButton({ active, round = false, title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        padding: 0,
        border: active ? '2px solid #6f86c5' : '1px solid #c7c7c7',
        borderRadius: round ? '50%' : 2,
        background: active ? '#f7f9ff' : '#ffffff',
        color: '#777777',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxSizing: 'border-box',
        font: '700 14px Segoe UI, Arial, sans-serif',
      }}
    >
      {children}
    </button>
  );
}

function readVisible() {
  const params = new URLSearchParams(window.location.search);
  const queryValue = params.get('drawingTools') || params.get('showDrawingTools');
  if (queryValue === 'true') return true;
  if (queryValue === 'false') return false;

  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current !== null) return current !== 'false';

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    return legacy === null ? true : legacy !== 'false';
  } catch (_) {
    return true;
  }
}

function writeVisible(value) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch (_) {
    // Continue without persistent storage.
  }
}

function getPaletteLeft() {
  const aside = document.querySelector('aside');
  if (!aside) return 12;

  const rect = aside.getBoundingClientRect();
  const style = window.getComputedStyle(aside);
  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0
    ? Math.ceil(rect.right + 14)
    : 12;
}

function getPaletteTop() {
  const paletteHeight = 586;
  const viewportHeight = Math.max(320, window.innerHeight || 768);
  return Math.max(16, Math.round((viewportHeight - paletteHeight) / 2));
}

function findTopToolbar() {
  return Array.from(document.querySelectorAll('div')).find((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return style.position === 'fixed'
      && rect.top <= 3
      && rect.left <= 3
      && rect.width >= window.innerWidth * 0.8
      && rect.height >= 20
      && rect.height <= 34
      && element.querySelectorAll('button').length >= 7;
  }) || null;
}

function findNativeSearchButton() {
  const explicit = document.querySelector('[data-gannzilla-tool="zoom"]');
  if (explicit) return explicit;

  const toolbar = findTopToolbar();
  if (!toolbar) return null;

  return Array.from(toolbar.querySelectorAll('button')).find((button) => {
    if (button.id === OVERLAY_ID) return false;

    const text = String(button.textContent || '').trim();
    const title = `${button.title || ''} ${button.getAttribute('aria-label') || ''}`.toLowerCase();

    return text === '⌕'
      || text === '🔍'
      || title.includes('zoom')
      || title.includes('search')
      || title.includes('تكبير')
      || title.includes('بحث');
  }) || null;
}

function findRightPalette() {
  const explicit = document.getElementById('gannzilla-right-drawing-palette')
    || document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  if (explicit) return explicit;

  return Array.from(document.querySelectorAll('div')).find((element) => {
    if (element.id === LEFT_ID || element.id === OVERLAY_ID) return false;

    const style = window.getComputedStyle(element);
    const directButtons = Array.from(element.children).filter((child) => child.tagName === 'BUTTON');
    const right = Number.parseFloat(style.right);
    const top = Number.parseFloat(style.top);
    const flexDirection = style.flexDirection;

    return style.position === 'fixed'
      && directButtons.length >= 8
      && directButtons.length <= 12
      && Number.isFinite(right)
      && right >= 0
      && right <= 42
      && Number.isFinite(top)
      && top >= 40
      && flexDirection === 'column';
  }) || null;
}

function setRightPaletteVisibility(visible, top) {
  const rightPalette = findRightPalette();
  if (!rightPalette) return null;

  rightPalette.style.setProperty('top', `${top}px`, 'important');
  rightPalette.style.setProperty('display', visible ? 'flex' : 'none', 'important');
  rightPalette.style.setProperty('pointer-events', visible ? 'auto' : 'none', 'important');
  rightPalette.setAttribute('aria-hidden', visible ? 'false' : 'true');
  rightPalette.dataset.gannzillaRightDrawingPalette = 'true';
  rightPalette.id = rightPalette.id || 'gannzilla-right-drawing-palette';
  return rightPalette;
}

function iconMarkup(visible) {
  return `
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" style="display:block;pointer-events:none">
      <rect x="3" y="4" width="5" height="16" rx="1" fill="#d8eaf5" stroke="#5f7f95" stroke-width="1.2"/>
      <rect x="16" y="4" width="5" height="16" rx="1" fill="#d8eaf5" stroke="#5f7f95" stroke-width="1.2"/>
      <path d="M9.5 12h5" stroke="#2b6f9b" stroke-width="1.5" stroke-linecap="round"/>
      <path d="m11 9-2.5 3 2.5 3M13 9l2.5 3-2.5 3" fill="none" stroke="#2b6f9b" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="19" cy="5" r="2.4" fill="${visible ? '#22884f' : '#969696'}"/>
    </svg>`;
}

function styleOverlayButton(button, nativeButton, visible) {
  const rect = nativeButton?.getBoundingClientRect();
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    button.style.setProperty('display', 'none', 'important');
    return;
  }

  button.type = 'button';
  button.innerHTML = iconMarkup(visible);
  button.title = visible
    ? 'إخفاء أدوات الرسم اليمنى واليسرى'
    : 'إظهار أدوات الرسم اليمنى واليسرى';
  button.setAttribute('aria-label', button.title);
  button.setAttribute('aria-pressed', String(visible));

  button.style.setProperty('position', 'fixed', 'important');
  button.style.setProperty('left', `${Math.round(rect.left)}px`, 'important');
  button.style.setProperty('top', `${Math.round(rect.top)}px`, 'important');
  button.style.setProperty('width', `${Math.max(22, Math.round(rect.width))}px`, 'important');
  button.style.setProperty('min-width', `${Math.max(22, Math.round(rect.width))}px`, 'important');
  button.style.setProperty('height', `${Math.max(21, Math.round(rect.height))}px`, 'important');
  button.style.setProperty('padding', '0', 'important');
  button.style.setProperty('margin', '0', 'important');
  button.style.setProperty('border', '1px solid #8fa5b4', 'important');
  button.style.setProperty('border-radius', '2px', 'important');
  button.style.setProperty('background', visible ? '#d9edf9' : '#f7f7f7', 'important');
  button.style.setProperty('display', 'flex', 'important');
  button.style.setProperty('align-items', 'center', 'important');
  button.style.setProperty('justify-content', 'center', 'important');
  button.style.setProperty('cursor', 'pointer', 'important');
  button.style.setProperty('box-sizing', 'border-box', 'important');
  button.style.setProperty('pointer-events', 'auto', 'important');
  button.style.setProperty('touch-action', 'manipulation', 'important');
  button.style.setProperty('z-index', '2147483647', 'important');
}

export default function GannzillaUnifiedDrawingPalettesV122() {
  const [visible, setVisible] = React.useState(readVisible);
  const [left, setLeft] = React.useState(getPaletteLeft);
  const [top, setTop] = React.useState(getPaletteTop);
  const [active, setActive] = React.useState(() => String(
    new URLSearchParams(window.location.search).get('divisions') || '36',
  ));

  const visibleRef = React.useRef(visible);
  const overlayRef = React.useRef(null);

  React.useEffect(() => {
    visibleRef.current = visible;
    window.__gannzillaDrawingToolsVisibleV123 = visible;
    writeVisible(visible);
    setRightPaletteVisibility(visible, getPaletteTop());

    const nativeButton = findNativeSearchButton();
    if (overlayRef.current && nativeButton) {
      styleOverlayButton(overlayRef.current, nativeButton, visible);
    }
  }, [visible]);

  React.useEffect(() => {
    const enabled = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    if (!enabled) return undefined;

    let overlayButton = document.getElementById(OVERLAY_ID);
    if (!overlayButton) {
      overlayButton = document.createElement('button');
      overlayButton.id = OVERLAY_ID;
      document.body.appendChild(overlayButton);
    }

    overlayRef.current = overlayButton;

    const stopPointer = (event) => {
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    const toggleBoth = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setVisible((current) => !current);
    };

    overlayButton.addEventListener('pointerdown', stopPointer, true);
    overlayButton.addEventListener('mousedown', stopPointer, true);
    overlayButton.addEventListener('touchstart', stopPointer, { capture: true, passive: true });
    overlayButton.addEventListener('click', toggleBoth, true);

    const sync = () => {
      const nextTop = getPaletteTop();
      setLeft(getPaletteLeft());
      setTop(nextTop);

      const nativeButton = findNativeSearchButton();
      if (nativeButton) {
        nativeButton.style.setProperty('pointer-events', 'none', 'important');
        nativeButton.setAttribute('aria-hidden', 'true');
        styleOverlayButton(overlayButton, nativeButton, visibleRef.current);
      }

      setRightPaletteVisibility(visibleRef.current, nextTop);
    };

    sync();
    const timer = window.setInterval(sync, 160);
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);

    window[MARKER] = true;
    window.__auditGannzillaUnifiedDrawingPalettesV123 = () => {
      const nativeButton = findNativeSearchButton();
      const rightPalette = findRightPalette();
      const leftPalette = document.getElementById(LEFT_ID);
      const overlay = document.getElementById(OVERLAY_ID);

      return {
        ok: window[MARKER] === true
          && Boolean(nativeButton)
          && Boolean(overlay)
          && Boolean(rightPalette)
          && (visibleRef.current === false || Boolean(leftPalette)),
        marker: window[MARKER] === true,
        togglePresent: Boolean(overlay),
        controlsBothSides: true,
        leftVisible: Boolean(leftPalette),
        rightVisible: rightPalette
          ? window.getComputedStyle(rightPalette).display !== 'none'
          : null,
        persistedVisible: visibleRef.current,
      };
    };

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
      overlayButton.removeEventListener('pointerdown', stopPointer, true);
      overlayButton.removeEventListener('mousedown', stopPointer, true);
      overlayButton.removeEventListener('touchstart', stopPointer, true);
      overlayButton.removeEventListener('click', toggleBoth, true);
      overlayButton.remove();
      overlayRef.current = null;

      const nativeButton = findNativeSearchButton();
      if (nativeButton) {
        nativeButton.style.removeProperty('pointer-events');
        nativeButton.removeAttribute('aria-hidden');
      }
    };
  }, []);

  const choose = (value) => {
    setActive(value);
    if (['12', '24', '36'].includes(value)) {
      const url = new URL(window.location.href);
      url.searchParams.set('divisions', value);
      url.searchParams.set('v', '123');
      window.location.assign(url.toString());
    }
  };

  if (!visible) return null;

  return (
    <div
      id={LEFT_ID}
      style={{
        position: 'fixed',
        left,
        top,
        zIndex: 2147483600,
        width: 44,
        padding: '6px 4px',
        background: 'rgba(248,248,248,0.96)',
        border: '1px solid #dddddd',
        borderRadius: 22,
        boxShadow: '0 1px 5px rgba(0,0,0,0.14)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {['12', '24', '36'].map((value) => (
        <ToolButton key={value} round active={active === value} title={`Circle of ${value}`} onClick={() => choose(value)}>
          {value}
        </ToolButton>
      ))}
      <ToolButton active={active === '4'} title="Angle 4" onClick={() => choose('4')}><span style={{ fontSize: 12 }}>4°</span></ToolButton>
      <ToolButton active={active === '9'} title="Angle 9" onClick={() => choose('9')}><span style={{ fontSize: 12 }}>9°</span></ToolButton>
      <ToolButton active={active === 'N'} title="North" onClick={() => choose('N')}><span style={{ fontStyle: 'italic', fontWeight: 900 }}>N</span></ToolButton>
      {[3, 4, 5, 6, 7, 8, 9].map((sides) => (
        <ToolButton key={sides} active={active === `p${sides}`} title={`${sides}-sided shape`} onClick={() => choose(`p${sides}`)}>
          <svg width="29" height="29" viewBox="0 0 32 32" aria-hidden="true">
            <polygon points={polygonPoints(sides)} fill="#a9a9a9" stroke="#858585" strokeWidth="1.1" />
          </svg>
        </ToolButton>
      ))}
      <ToolButton active={active === 'angle'} title="Angle tool" onClick={() => choose('angle')}>∠</ToolButton>
      <ToolButton active={active === 'pen'} title="Pen" onClick={() => choose('pen')}>✎</ToolButton>
    </div>
  );
}
