import React from 'react';

const STORAGE_KEY = 'gannzillaDrawingToolsVisibleV122';
const LEFT_ID = 'gannzilla-left-drawing-palette-v122';

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
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch (_) {
    return true;
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

function findNativeSearchButton() {
  const toolbar = Array.from(document.querySelectorAll('div')).find((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return style.position === 'fixed'
      && rect.top <= 2
      && rect.left <= 2
      && rect.right >= window.innerWidth - 2
      && rect.height >= 22
      && rect.height <= 30
      && element.querySelectorAll('button').length >= 8;
  });

  if (!toolbar) return null;

  return Array.from(toolbar.querySelectorAll('button')).find((button) => {
    const text = String(button.textContent || '').trim();
    const title = `${button.title || ''} ${button.getAttribute('aria-label') || ''}`.toLowerCase();
    return text === '⌕' || text === '🔍' || title.includes('zoom');
  }) || null;
}

function findRightPalette() {
  return Array.from(document.querySelectorAll('div')).find((element) => {
    if (element.id === LEFT_ID) return false;
    const style = window.getComputedStyle(element);
    const directButtons = Array.from(element.children).filter((child) => child.tagName === 'BUTTON');
    const right = Number.parseFloat(style.right);
    return style.position === 'fixed'
      && directButtons.length === 9
      && Number.isFinite(right)
      && Math.abs(right - 18) <= 6;
  }) || null;
}

export default function GannzillaUnifiedDrawingPalettesV122() {
  const [visible, setVisible] = React.useState(readVisible);
  const [left, setLeft] = React.useState(getPaletteLeft);
  const [top, setTop] = React.useState(getPaletteTop);
  const [active, setActive] = React.useState(() => String(
    new URLSearchParams(window.location.search).get('divisions') || '36',
  ));
  const visibleRef = React.useRef(visible);

  React.useEffect(() => {
    visibleRef.current = visible;
    try {
      localStorage.setItem(STORAGE_KEY, String(visible));
    } catch (_) {
      // Continue without persistence.
    }

    const rightPalette = findRightPalette();
    if (rightPalette) {
      rightPalette.style.setProperty('display', visible ? 'flex' : 'none', 'important');
      rightPalette.setAttribute('aria-hidden', visible ? 'false' : 'true');
    }
  }, [visible]);

  React.useEffect(() => {
    let boundButton = null;

    const toggleFromNativeButton = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setVisible((current) => !current);
    };

    const sync = () => {
      setLeft(getPaletteLeft());
      setTop(getPaletteTop());

      const nativeButton = findNativeSearchButton();
      if (nativeButton !== boundButton) {
        if (boundButton) boundButton.removeEventListener('pointerdown', toggleFromNativeButton, true);
        boundButton = nativeButton;
        if (boundButton) {
          boundButton.addEventListener('pointerdown', toggleFromNativeButton, true);
          boundButton.dataset.gannzillaDrawingToggle = 'v122';
          boundButton.title = visibleRef.current ? 'إخفاء أدوات الرسم' : 'إظهار أدوات الرسم';
          boundButton.setAttribute('aria-label', boundButton.title);
          boundButton.style.cursor = 'pointer';
          boundButton.style.pointerEvents = 'auto';
        }
      }

      if (boundButton) {
        boundButton.title = visibleRef.current ? 'إخفاء أدوات الرسم' : 'إظهار أدوات الرسم';
        boundButton.setAttribute('aria-label', boundButton.title);
        boundButton.style.background = visibleRef.current ? '#d9edf9' : '#f7f7f7';
      }

      const rightPalette = findRightPalette();
      if (rightPalette) {
        rightPalette.style.setProperty('top', `${getPaletteTop()}px`, 'important');
        rightPalette.style.setProperty('display', visibleRef.current ? 'flex' : 'none', 'important');
        rightPalette.setAttribute('aria-hidden', visibleRef.current ? 'false' : 'true');
      }
    };

    sync();
    const timer = window.setInterval(sync, 250);
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', sync);

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      if (boundButton) boundButton.removeEventListener('pointerdown', toggleFromNativeButton, true);
    };
  }, []);

  const choose = (value) => {
    setActive(value);
    if (['12', '24', '36'].includes(value)) {
      const url = new URL(window.location.href);
      url.searchParams.set('divisions', value);
      url.searchParams.set('v', '122');
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
        <ToolButton key={value} round active={active === value} title={`Circle of ${value}`} onClick={() => choose(value)}>{value}</ToolButton>
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
