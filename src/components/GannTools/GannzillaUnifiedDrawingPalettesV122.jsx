import React from 'react';

const MARKER = 'GANNZILLA_DRAWING_TOOLS_MASTER_TOGGLE_V124';
const STORAGE_KEY = 'gannzillaDrawingToolsVisibleV124';
const LEGACY_KEYS = [
  'gannzillaDrawingToolsVisibleV123',
  'gannzillaDrawingToolsVisibleV122',
  'gannzillaUnifiedDrawingPalettesVisibleV117',
];
const LEFT_ID = 'gannzilla-left-drawing-palette-v124';
const RIGHT_ID = 'gannzilla-right-drawing-palette-v124';

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
        pointerEvents: 'auto',
      }}
    >
      {children}
    </button>
  );
}

function readVisible() {
  const query = new URLSearchParams(window.location.search);
  const requested = query.get('drawingTools') || query.get('showDrawingTools');
  if (requested === 'true') return true;
  if (requested === 'false') return false;

  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current !== null) return current !== 'false';

    for (const key of LEGACY_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy !== null) return legacy !== 'false';
    }
  } catch (_) {
    // Continue with visible tools when storage is unavailable.
  }

  return true;
}

function writeVisible(value) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch (_) {
    // Runtime state remains authoritative.
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

function isTopToolbar(element) {
  if (!(element instanceof HTMLElement)) return false;
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return style.position === 'fixed'
    && rect.top <= 4
    && rect.left <= 4
    && rect.width >= window.innerWidth * 0.75
    && rect.height >= 18
    && rect.height <= 38
    && element.querySelectorAll('button').length >= 6;
}

function findNativeToggleButton() {
  const explicit = document.querySelector('[data-gannzilla-drawing-toggle="true"]');
  if (explicit) return explicit;

  const toolbars = Array.from(document.querySelectorAll('div')).filter(isTopToolbar);
  const buttons = toolbars.flatMap((toolbar) => Array.from(toolbar.querySelectorAll('button')));

  const exact = buttons.find((button) => {
    const text = String(button.textContent || '').trim();
    return text === '⌕' || text === '🔍' || text === '🔎' || text === '🔍︎';
  });
  if (exact) return exact;

  return buttons.find((button) => {
    const title = `${button.title || ''} ${button.getAttribute('aria-label') || ''}`.toLowerCase();
    return title.includes('drawing tools')
      || title.includes('أدوات الرسم')
      || title.includes('zoom')
      || title.includes('search')
      || title.includes('تكبير')
      || title.includes('بحث');
  }) || null;
}

function findRightPalette() {
  const explicit = document.getElementById(RIGHT_ID)
    || document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  if (explicit) return explicit;

  return Array.from(document.querySelectorAll('div')).find((element) => {
    if (element.id === LEFT_ID) return false;

    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const directButtons = Array.from(element.children).filter((child) => child.tagName === 'BUTTON');
    const right = Number.parseFloat(style.right);

    return style.position === 'fixed'
      && directButtons.length >= 8
      && directButtons.length <= 12
      && Number.isFinite(right)
      && right >= 0
      && right <= 64
      && rect.top >= 35
      && rect.width >= 30
      && rect.width <= 90;
  }) || null;
}

function applyRightVisibility(visible, top) {
  const rightPalette = findRightPalette();
  if (!rightPalette) return null;

  rightPalette.id = RIGHT_ID;
  rightPalette.dataset.gannzillaRightDrawingPalette = 'true';
  rightPalette.style.setProperty('top', `${top}px`, 'important');
  rightPalette.style.setProperty('display', visible ? 'flex' : 'none', 'important');
  rightPalette.style.setProperty('visibility', visible ? 'visible' : 'hidden', 'important');
  rightPalette.style.setProperty('pointer-events', visible ? 'auto' : 'none', 'important');
  rightPalette.setAttribute('aria-hidden', visible ? 'false' : 'true');
  return rightPalette;
}

function styleNativeButton(button, visible) {
  if (!button) return;

  button.dataset.gannzillaDrawingToggle = 'true';
  button.title = visible
    ? 'إخفاء أدوات الرسم اليمنى واليسرى'
    : 'إظهار أدوات الرسم اليمنى واليسرى';
  button.setAttribute('aria-label', button.title);
  button.setAttribute('aria-pressed', String(visible));
  button.style.setProperty('pointer-events', 'auto', 'important');
  button.style.setProperty('cursor', 'pointer', 'important');
  button.style.setProperty('touch-action', 'manipulation', 'important');
  button.style.setProperty('position', 'relative', 'important');
  button.style.setProperty('z-index', '2147483647', 'important');
  button.style.setProperty('background', visible ? '#d9edf9' : '#f7f7f7', 'important');
  button.style.setProperty('box-shadow', visible ? 'inset 0 0 0 1px #5f9fc5' : 'none', 'important');
}

export default function GannzillaUnifiedDrawingPalettesV122() {
  const [visible, setVisible] = React.useState(readVisible);
  const [left, setLeft] = React.useState(getPaletteLeft);
  const [top, setTop] = React.useState(getPaletteTop);
  const [active, setActive] = React.useState(() => String(
    new URLSearchParams(window.location.search).get('divisions') || '36',
  ));

  const visibleRef = React.useRef(visible);
  const boundButtonRef = React.useRef(null);
  const clickLockRef = React.useRef(false);

  const setBothVisible = React.useCallback((nextVisible) => {
    const normalized = Boolean(nextVisible);
    visibleRef.current = normalized;
    setVisible(normalized);
    writeVisible(normalized);
    window.__gannzillaDrawingToolsVisibleV124 = normalized;
    applyRightVisibility(normalized, getPaletteTop());
    styleNativeButton(findNativeToggleButton(), normalized);
    window.dispatchEvent(new CustomEvent('gannzilla:drawing-tools-state-v124', {
      detail: { visible: normalized },
    }));
  }, []);

  const toggleBoth = React.useCallback((event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (clickLockRef.current) return;
    clickLockRef.current = true;
    window.setTimeout(() => { clickLockRef.current = false; }, 180);
    setBothVisible(!visibleRef.current);
  }, [setBothVisible]);

  React.useEffect(() => {
    visibleRef.current = visible;
    writeVisible(visible);
    applyRightVisibility(visible, top);
    styleNativeButton(findNativeToggleButton(), visible);
  }, [visible, top]);

  React.useEffect(() => {
    const enabled = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    if (!enabled) return undefined;

    const bind = () => {
      const nextTop = getPaletteTop();
      setLeft(getPaletteLeft());
      setTop(nextTop);

      const button = findNativeToggleButton();
      if (button !== boundButtonRef.current) {
        if (boundButtonRef.current) {
          boundButtonRef.current.removeEventListener('click', toggleBoth, true);
          boundButtonRef.current.removeEventListener('pointerup', toggleBoth, true);
        }

        boundButtonRef.current = button;
        if (button) {
          button.addEventListener('click', toggleBoth, true);
          button.addEventListener('pointerup', toggleBoth, true);
        }
      }

      styleNativeButton(button, visibleRef.current);
      applyRightVisibility(visibleRef.current, nextTop);
    };

    const delegatedClick = (event) => {
      const button = findNativeToggleButton();
      const target = event.target;
      if (button && target instanceof Node && (target === button || button.contains(target))) {
        toggleBoth(event);
      }
    };

    document.addEventListener('click', delegatedClick, true);
    const timer = window.setInterval(bind, 120);
    const observer = new MutationObserver(bind);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', bind);
    window.addEventListener('scroll', bind, true);
    bind();

    window[MARKER] = true;
    window.__auditGannzillaDrawingToolsMasterToggleV124 = () => {
      const button = findNativeToggleButton();
      const rightPalette = findRightPalette();
      const leftPalette = document.getElementById(LEFT_ID);
      const rightVisible = rightPalette
        ? window.getComputedStyle(rightPalette).display !== 'none'
          && window.getComputedStyle(rightPalette).visibility !== 'hidden'
        : null;

      return {
        ok: window[MARKER] === true
          && Boolean(button)
          && Boolean(rightPalette)
          && (visibleRef.current ? Boolean(leftPalette) && rightVisible === true : !leftPalette && rightVisible === false),
        marker: window[MARKER] === true,
        nativeButtonBound: Boolean(button),
        controlsBothSides: true,
        visible: visibleRef.current,
        leftVisible: Boolean(leftPalette),
        rightVisible,
      };
    };

    return () => {
      document.removeEventListener('click', delegatedClick, true);
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('resize', bind);
      window.removeEventListener('scroll', bind, true);

      if (boundButtonRef.current) {
        boundButtonRef.current.removeEventListener('click', toggleBoth, true);
        boundButtonRef.current.removeEventListener('pointerup', toggleBoth, true);
        delete boundButtonRef.current.dataset.gannzillaDrawingToggle;
      }
      boundButtonRef.current = null;
    };
  }, [toggleBoth]);

  const choose = (value) => {
    setActive(value);
    if (['12', '24', '36'].includes(value)) {
      const url = new URL(window.location.href);
      url.searchParams.set('divisions', value);
      url.searchParams.set('v', '124');
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
        pointerEvents: 'auto',
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
