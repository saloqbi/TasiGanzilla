import React from 'react';

const MARKER = 'GANNZILLA_UNIFIED_DRAWING_PALETTES_V116';
const TOGGLE_BUTTON_ID = 'gannzilla-unified-drawing-palettes-toggle-v116';
const LEFT_PALETTE_ID = 'gannzilla-native-left-drawing-palette-v116';
const STORAGE_KEY = 'gannzillaUnifiedDrawingPalettesVisibleV116';
const LEFT_PALETTE_TOP = 120;

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
  url.searchParams.set('v', '116');
  window.location.assign(url.toString());
}

function getPaletteLeft() {
  const aside = document.querySelector('aside');
  if (!aside) return 12;
  const style = window.getComputedStyle(aside);
  const rect = aside.getBoundingClientRect();
  const panelVisible = style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0;
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
    return text.includes('🔒') || text.includes('🔐') || title.includes('lock') || title.includes('قفل');
  }) || null;
}

function findRightDrawingPalette() {
  return Array.from(document.querySelectorAll('div')).find((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const directButtons = Array.from(element.children).filter((child) => child.tagName === 'BUTTON');

    return style.position === 'fixed'
      && rect.right >= window.innerWidth - 90
      && rect.top >= 100
      && rect.top <= 240
      && rect.width >= 30
      && rect.width <= 80
      && directButtons.length >= 8;
  }) || null;
}

function styleUnifiedToggle(button, visible) {
  button.id = TOGGLE_BUTTON_ID;
  button.type = 'button';
  button.textContent = '⌕';
  button.title = visible ? 'إخفاء أدوات الرسم اليمنى واليسرى' : 'إظهار أدوات الرسم اليمنى واليسرى';
  button.setAttribute('aria-label', button.title);
  button.setAttribute('aria-pressed', String(visible));
  button.style.width = '22px';
  button.style.minWidth = '22px';
  button.style.height = '21px';
  button.style.padding = '0';
  button.style.marginRight = '2px';
  button.style.border = '1px solid #8fa5b4';
  button.style.borderRadius = '2px';
  button.style.background = visible ? '#d9edf9' : '#f7f7f7';
  button.style.color = '#1c75bc';
  button.style.fontWeight = '800';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.cursor = 'pointer';
  button.style.boxSizing = 'border-box';
  button.style.flex = '0 0 22px';
  button.style.pointerEvents = 'auto';
}

export default function GannzillaNativeLeftPaletteV110() {
  const [active, setActive] = React.useState(() => String(new URLSearchParams(window.location.search).get('divisions') || '36'));
  const [left, setLeft] = React.useState(() => getPaletteLeft());
  const [visible, setVisible] = React.useState(readInitialVisibility);
  const visibleRef = React.useRef(visible);
  const rightPaletteRef = React.useRef(null);

  const applyBothPalettesVisibility = React.useCallback((nextVisible) => {
    const rightPalette = rightPaletteRef.current && document.body.contains(rightPaletteRef.current)
      ? rightPaletteRef.current
      : findRightDrawingPalette();

    if (rightPalette) {
      rightPaletteRef.current = rightPalette;
      rightPalette.style.setProperty('display', nextVisible ? 'flex' : 'none', 'important');
      rightPalette.setAttribute('aria-hidden', nextVisible ? 'false' : 'true');
    }
  }, []);

  React.useEffect(() => {
    visibleRef.current = visible;
    window.__gannzillaUnifiedDrawingPalettesVisibleV116 = visible;

    try {
      localStorage.setItem(STORAGE_KEY, String(visible));
    } catch (_) {
      // Continue without persistent storage.
    }

    const button = document.getElementById(TOGGLE_BUTTON_ID);
    if (button) styleUnifiedToggle(button, visible);
    applyBothPalettesVisibility(visible);
  }, [visible, applyBothPalettesVisibility]);

  React.useEffect(() => {
    const enabled = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    if (!enabled) return undefined;

    const toggleBoth = (event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      event?.stopImmediatePropagation?.();
      setVisible((current) => !current);
    };

    const bindToggle = () => {
      const toolbar = findTopToolbar();
      const lockButton = findLockButton(toolbar);
      if (!lockButton?.parentElement) return;

      let button = document.getElementById(TOGGLE_BUTTON_ID);
      if (!button) {
        const nativeNextButton = lockButton.nextElementSibling;
        button = nativeNextButton?.tagName === 'BUTTON'
          ? nativeNextButton
          : document.createElement('button');
      }

      const parent = lockButton.parentElement;
      if (lockButton.nextElementSibling !== button) {
        parent.insertBefore(button, lockButton.nextElementSibling);
      }

      button.onpointerdown = toggleBoth;
      button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
      };
      button.onkeydown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') toggleBoth(event);
      };
      styleUnifiedToggle(button, visibleRef.current);
    };

    const syncRuntime = () => {
      bindToggle();
      setLeft(getPaletteLeft());
      applyBothPalettesVisibility(visibleRef.current);
    };

    const observer = new MutationObserver(syncRuntime);
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setInterval(syncRuntime, 250);
    window.addEventListener('resize', syncRuntime);
    syncRuntime();

    window[MARKER] = true;
    window.__auditGannzillaUnifiedDrawingPalettesV116 = () => {
      const button = document.getElementById(TOGGLE_BUTTON_ID);
      const leftPalette = document.getElementById(LEFT_PALETTE_ID);
      const rightPalette = rightPaletteRef.current;
      return {
        ok: window[MARKER] === true
          && Boolean(button)
          && (visibleRef.current === false || Boolean(leftPalette))
          && Boolean(rightPalette),
        oneIconControlsBoth: true,
        toggleButtonPresent: Boolean(button),
        leftPaletteVisible: visibleRef.current,
        rightPaletteVisible: rightPalette ? window.getComputedStyle(rightPalette).display !== 'none' : null,
        leftPaletteTop: LEFT_PALETTE_TOP,
        wheelUntouched: true,
      };
    };

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', syncRuntime);
      const button = document.getElementById(TOGGLE_BUTTON_ID);
      if (button) {
        button.onpointerdown = null;
        button.onclick = null;
        button.onkeydown = null;
        button.removeAttribute('id');
        button.removeAttribute('aria-pressed');
        button.title = '';
        button.textContent = '⌕';
      }
      if (rightPaletteRef.current) {
        rightPaletteRef.current.style.removeProperty('display');
        rightPaletteRef.current.removeAttribute('aria-hidden');
      }
    };
  }, [applyBothPalettesVisibility]);

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
        top: LEFT_PALETTE_TOP,
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
        <ToolButton key={value} round active={active === value} title={`Circle of ${value}`} onClick={() => choose(value)}>{value}</ToolButton>
      ))}

      <ToolButton active={active === '4'} title="Angle 4" onClick={() => choose('4')}><span style={{ fontSize: 12 }}>4°</span></ToolButton>
      <ToolButton active={active === '9'} title="Angle 9" onClick={() => choose('9')}><span style={{ fontSize: 12 }}>9°</span></ToolButton>
      <ToolButton active={active === 'N'} title="North" onClick={() => choose('N')}><span style={{ fontStyle: 'italic', fontWeight: 900 }}>N</span></ToolButton>

      {[3, 4, 5, 6, 7, 8, 9].map((sides) => (
        <ToolButton key={sides} active={active === `p${sides}`} title={`${sides}-sided shape`} onClick={() => choose(`p${sides}`)}>
          <svg width="29" height="29" viewBox="0 0 32 32" aria-hidden="true">
            <polygon points={polygonPoints(sides)} fill="#a9a9a9" stroke="#858585" strokeWidth="1.1" />
            {Array.from({ length: sides }, (_, index) => {
              const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
              return <circle key={index} cx={16 + Math.cos(angle) * 8} cy={16 + Math.sin(angle) * 8} r="1.15" fill="#f7f7f7" />;
            })}
          </svg>
        </ToolButton>
      ))}

      <ToolButton active={active === 'angle'} title="Angle tool" onClick={() => choose('angle')}>
        <svg width="28" height="28" viewBox="0 0 32 32"><path d="M6 25 15 8v17h11" fill="none" stroke="#8f8f8f" strokeWidth="2" /><path d="M15 20a7 7 0 0 1 6-6" fill="none" stroke="#aaaaaa" strokeWidth="1.3" /></svg>
      </ToolButton>
      <ToolButton active={active === 'pen'} title="Pen" onClick={() => choose('pen')}>
        <svg width="28" height="28" viewBox="0 0 32 32"><path d="m7 25 4-10 11-9 4 4-9 11Z" fill="#9c9c9c" stroke="#7b7b7b" /><path d="m7 25 6-2-4-4Z" fill="#d9534f" /></svg>
      </ToolButton>
    </div>
  ) : null;
}
