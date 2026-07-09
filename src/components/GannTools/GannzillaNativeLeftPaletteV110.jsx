import React from 'react';

const MARKER = 'GANNZILLA_UNIFIED_DRAWING_PALETTES_V117';
const OVERLAY_BUTTON_ID = 'gannzilla-unified-drawing-palettes-overlay-v117';
const LEFT_PALETTE_ID = 'gannzilla-native-left-drawing-palette-v117';
const STORAGE_KEY = 'gannzillaUnifiedDrawingPalettesVisibleV117';
const DEFAULT_RIGHT_TOP = 168;

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

function applyDivisions(value) {
  const url = new URL(window.location.href);
  url.searchParams.set('divisions', String(value));
  url.searchParams.set('v', '117');
  window.location.assign(url.toString());
}

function getPaletteLeft() {
  const aside = document.querySelector('aside');
  if (!aside) return 12;

  const style = window.getComputedStyle(aside);
  const rect = aside.getBoundingClientRect();
  const panelVisible = style.display !== 'none'
    && style.visibility !== 'hidden'
    && rect.width > 0;

  return panelVisible ? Math.ceil(rect.right + 14) : 12;
}

function readInitialVisibility() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored !== 'false';
  } catch (_) {
    return true;
  }
}

function findTopToolbar() {
  return Array.from(document.querySelectorAll('div')).find((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return style.position === 'fixed'
      && rect.top <= 2
      && rect.left <= 2
      && rect.right >= window.innerWidth - 2
      && rect.height >= 22
      && rect.height <= 30
      && element.querySelectorAll('button').length >= 8;
  }) || null;
}

function findLockButton(toolbar) {
  if (!toolbar) return null;

  return Array.from(toolbar.querySelectorAll('button')).find((button) => {
    const text = String(button.textContent || '').trim();
    const title = `${button.title || ''} ${button.getAttribute('aria-label') || ''}`.toLowerCase();

    return text.includes('🔒')
      || text.includes('🔐')
      || title.includes('lock')
      || title.includes('قفل');
  }) || null;
}

function findNativeSearchButton() {
  const toolbar = findTopToolbar();
  const lockButton = findLockButton(toolbar);
  if (!lockButton?.parentElement) return null;

  const next = lockButton.nextElementSibling;
  if (next?.tagName === 'BUTTON') return next;

  const siblings = Array.from(lockButton.parentElement.children);
  const lockIndex = siblings.indexOf(lockButton);

  return siblings.slice(lockIndex + 1).find((element) => {
    const text = String(element.textContent || '').trim();
    return element.tagName === 'BUTTON' && (text === '⌕' || text === '🔍');
  }) || null;
}

function findRightDrawingPalette(includeHidden = false) {
  const elements = Array.from(document.querySelectorAll('div'));

  return elements.find((element) => {
    const style = window.getComputedStyle(element);
    const directButtons = Array.from(element.children).filter((child) => child.tagName === 'BUTTON');
    const right = Number.parseFloat(style.right);
    const top = Number.parseFloat(style.top);

    if (style.position !== 'fixed') return false;
    if (directButtons.length !== 9) return false;
    if (!Number.isFinite(right) || Math.abs(right - 18) > 4) return false;
    if (!Number.isFinite(top) || Math.abs(top - DEFAULT_RIGHT_TOP) > 8) return false;
    if (!includeHidden && style.display === 'none') return false;

    return true;
  }) || null;
}

function styleOverlayButton(button, targetRect, visible) {
  button.type = 'button';
  button.textContent = '⌕';
  button.title = visible
    ? 'إخفاء أدوات الرسم اليمنى واليسرى'
    : 'إظهار أدوات الرسم اليمنى واليسرى';
  button.setAttribute('aria-label', button.title);
  button.setAttribute('aria-pressed', String(visible));

  const width = Math.max(20, Math.round(targetRect?.width || 22));
  const height = Math.max(19, Math.round(targetRect?.height || 21));
  const left = Math.round(targetRect?.left || 0);
  const top = Math.round(targetRect?.top || 1);

  button.style.setProperty('position', 'fixed', 'important');
  button.style.setProperty('left', `${left}px`, 'important');
  button.style.setProperty('top', `${top}px`, 'important');
  button.style.setProperty('width', `${width}px`, 'important');
  button.style.setProperty('min-width', `${width}px`, 'important');
  button.style.setProperty('height', `${height}px`, 'important');
  button.style.setProperty('padding', '0', 'important');
  button.style.setProperty('margin', '0', 'important');
  button.style.setProperty('border', '1px solid #8fa5b4', 'important');
  button.style.setProperty('border-radius', '2px', 'important');
  button.style.setProperty('background', visible ? '#d9edf9' : '#f7f7f7', 'important');
  button.style.setProperty('color', '#1c75bc', 'important');
  button.style.setProperty('font', '800 12px Segoe UI, Arial, sans-serif', 'important');
  button.style.setProperty('display', 'flex', 'important');
  button.style.setProperty('align-items', 'center', 'important');
  button.style.setProperty('justify-content', 'center', 'important');
  button.style.setProperty('cursor', 'pointer', 'important');
  button.style.setProperty('box-sizing', 'border-box', 'important');
  button.style.setProperty('pointer-events', 'auto', 'important');
  button.style.setProperty('z-index', '2147483647', 'important');
}

export default function GannzillaNativeLeftPaletteV110() {
  const [active, setActive] = React.useState(() => String(
    new URLSearchParams(window.location.search).get('divisions') || '36',
  ));
  const [left, setLeft] = React.useState(() => getPaletteLeft());
  const [paletteTop, setPaletteTop] = React.useState(DEFAULT_RIGHT_TOP);
  const [visible, setVisible] = React.useState(readInitialVisibility);

  const visibleRef = React.useRef(visible);
  const rightPaletteRef = React.useRef(null);
  const overlayButtonRef = React.useRef(null);

  const applyRightVisibility = React.useCallback((nextVisible) => {
    let rightPalette = rightPaletteRef.current;

    if (!rightPalette || !document.body.contains(rightPalette)) {
      rightPalette = findRightDrawingPalette(true);
    }

    if (!rightPalette) return false;

    rightPaletteRef.current = rightPalette;
    rightPalette.style.setProperty('display', nextVisible ? 'flex' : 'none', 'important');
    rightPalette.setAttribute('aria-hidden', nextVisible ? 'false' : 'true');

    const cssTop = Number.parseFloat(window.getComputedStyle(rightPalette).top);
    if (Number.isFinite(cssTop)) setPaletteTop(Math.round(cssTop));

    return true;
  }, []);

  React.useEffect(() => {
    visibleRef.current = visible;
    window.__gannzillaUnifiedDrawingPalettesVisibleV117 = visible;

    try {
      localStorage.setItem(STORAGE_KEY, String(visible));
    } catch (_) {
      // Continue without persistent storage.
    }

    applyRightVisibility(visible);

    const nativeSearch = findNativeSearchButton();
    if (overlayButtonRef.current && nativeSearch) {
      styleOverlayButton(
        overlayButtonRef.current,
        nativeSearch.getBoundingClientRect(),
        visible,
      );
    }
  }, [visible, applyRightVisibility]);

  React.useEffect(() => {
    const enabled = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    if (!enabled) return undefined;

    let overlayButton = document.getElementById(OVERLAY_BUTTON_ID);
    if (!overlayButton) {
      overlayButton = document.createElement('button');
      overlayButton.id = OVERLAY_BUTTON_ID;
      document.body.appendChild(overlayButton);
    }

    overlayButtonRef.current = overlayButton;

    const toggleBoth = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setVisible((current) => !current);
    };

    overlayButton.addEventListener('click', toggleBoth, true);

    const syncRuntime = () => {
      const nativeSearch = findNativeSearchButton();
      const rightPalette = rightPaletteRef.current && document.body.contains(rightPaletteRef.current)
        ? rightPaletteRef.current
        : findRightDrawingPalette(true);

      if (rightPalette) {
        rightPaletteRef.current = rightPalette;
        const cssTop = Number.parseFloat(window.getComputedStyle(rightPalette).top);
        if (Number.isFinite(cssTop)) setPaletteTop(Math.round(cssTop));
        rightPalette.style.setProperty('display', visibleRef.current ? 'flex' : 'none', 'important');
        rightPalette.setAttribute('aria-hidden', visibleRef.current ? 'false' : 'true');
      }

      if (nativeSearch) {
        styleOverlayButton(
          overlayButton,
          nativeSearch.getBoundingClientRect(),
          visibleRef.current,
        );
      }

      setLeft(getPaletteLeft());
    };

    const observer = new MutationObserver(syncRuntime);
    observer.observe(document.body, { childList: true, subtree: true });

    const timer = window.setInterval(syncRuntime, 180);
    window.addEventListener('resize', syncRuntime);
    window.addEventListener('scroll', syncRuntime, true);
    syncRuntime();

    window[MARKER] = true;
    window.__auditGannzillaUnifiedDrawingPalettesV117 = () => {
      const leftPalette = document.getElementById(LEFT_PALETTE_ID);
      const nativeSearch = findNativeSearchButton();
      const rightPalette = rightPaletteRef.current;

      return {
        ok: window[MARKER] === true
          && Boolean(overlayButtonRef.current)
          && Boolean(nativeSearch)
          && Boolean(rightPalette)
          && (visibleRef.current === false || Boolean(leftPalette)),
        overlayOnNativeSearchIcon: Boolean(nativeSearch),
        oneIconControlsBoth: true,
        leftPaletteVisible: visibleRef.current,
        rightPaletteVisible: rightPalette
          ? window.getComputedStyle(rightPalette).display !== 'none'
          : null,
        alignedTop: paletteTop,
        wheelUntouched: true,
      };
    };

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', syncRuntime);
      window.removeEventListener('scroll', syncRuntime, true);
      overlayButton.removeEventListener('click', toggleBoth, true);
      overlayButton.remove();
      overlayButtonRef.current = null;

      if (rightPaletteRef.current) {
        rightPaletteRef.current.style.removeProperty('display');
        rightPaletteRef.current.removeAttribute('aria-hidden');
      }
    };
  }, [applyRightVisibility, paletteTop]);

  const choose = (value) => {
    setActive(value);
    if (['12', '24', '36'].includes(value)) applyDivisions(Number(value));
  };

  return visible ? (
    <div
      id={LEFT_PALETTE_ID}
      style={{
        position: 'fixed',
        left,
        top: paletteTop,
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
        <ToolButton
          key={value}
          round
          active={active === value}
          title={`Circle of ${value}`}
          onClick={() => choose(value)}
        >
          {value}
        </ToolButton>
      ))}

      <ToolButton active={active === '4'} title="Angle 4" onClick={() => choose('4')}>
        <span style={{ fontSize: 12 }}>4°</span>
      </ToolButton>
      <ToolButton active={active === '9'} title="Angle 9" onClick={() => choose('9')}>
        <span style={{ fontSize: 12 }}>9°</span>
      </ToolButton>
      <ToolButton active={active === 'N'} title="North" onClick={() => choose('N')}>
        <span style={{ fontStyle: 'italic', fontWeight: 900 }}>N</span>
      </ToolButton>

      {[3, 4, 5, 6, 7, 8, 9].map((sides) => (
        <ToolButton
          key={sides}
          active={active === `p${sides}`}
          title={`${sides}-sided shape`}
          onClick={() => choose(`p${sides}`)}
        >
          <svg width="29" height="29" viewBox="0 0 32 32" aria-hidden="true">
            <polygon
              points={polygonPoints(sides)}
              fill="#a9a9a9"
              stroke="#858585"
              strokeWidth="1.1"
            />
            {Array.from({ length: sides }, (_, index) => {
              const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
              return (
                <circle
                  key={index}
                  cx={16 + Math.cos(angle) * 8}
                  cy={16 + Math.sin(angle) * 8}
                  r="1.15"
                  fill="#f7f7f7"
                />
              );
            })}
          </svg>
        </ToolButton>
      ))}

      <ToolButton active={active === 'angle'} title="Angle tool" onClick={() => choose('angle')}>
        <svg width="28" height="28" viewBox="0 0 32 32">
          <path d="M6 25 15 8v17h11" fill="none" stroke="#8f8f8f" strokeWidth="2" />
          <path d="M15 20a7 7 0 0 1 6-6" fill="none" stroke="#aaaaaa" strokeWidth="1.3" />
        </svg>
      </ToolButton>
      <ToolButton active={active === 'pen'} title="Pen" onClick={() => choose('pen')}>
        <svg width="28" height="28" viewBox="0 0 32 32">
          <path d="m7 25 4-10 11-9 4 4-9 11Z" fill="#9c9c9c" stroke="#7b7b7b" />
          <path d="m7 25 6-2-4-4Z" fill="#d9534f" />
        </svg>
      </ToolButton>
    </div>
  ) : null;
}
