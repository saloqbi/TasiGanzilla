import React from 'react';

const STORAGE_KEY = 'gannzillaUnifiedDrawingPalettesVisibleV118';
const LEFT_TOP = 168;

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

function getPaletteLeft() {
  const aside = document.querySelector('aside');
  if (!aside) return 12;
  const style = window.getComputedStyle(aside);
  const rect = aside.getBoundingClientRect();
  const shown = style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0;
  return shown ? Math.ceil(rect.right + 14) : 12;
}

function findToolbar() {
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

function findLockButton() {
  const toolbar = findToolbar();
  if (!toolbar) return null;
  return Array.from(toolbar.querySelectorAll('button')).find((button) => {
    const text = String(button.textContent || '').trim();
    const title = `${button.title || ''} ${button.getAttribute('aria-label') || ''}`.toLowerCase();
    return text.includes('🔒') || text.includes('🔐') || title.includes('lock') || title.includes('قفل');
  }) || null;
}

function findSearchButton() {
  const lock = findLockButton();
  if (!lock?.parentElement) return null;
  const next = lock.nextElementSibling;
  if (next?.tagName === 'BUTTON') return next;
  return Array.from(lock.parentElement.querySelectorAll('button')).find((button) => {
    const text = String(button.textContent || '').trim();
    return text === '⌕' || text === '🔍';
  }) || null;
}

function findRightPalette() {
  return Array.from(document.querySelectorAll('div')).find((element) => {
    const style = window.getComputedStyle(element);
    const buttons = Array.from(element.children).filter((child) => child.tagName === 'BUTTON');
    const right = Number.parseFloat(style.right);
    const top = Number.parseFloat(style.top);
    return style.position === 'fixed'
      && buttons.length === 9
      && Number.isFinite(right)
      && Math.abs(right - 18) <= 5
      && Number.isFinite(top)
      && top >= 150
      && top <= 190;
  }) || null;
}

function readVisible() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch (_) {
    return true;
  }
}

export default function GannzillaUnifiedDrawingPalettesV118() {
  const [visible, setVisible] = React.useState(readVisible);
  const [left, setLeft] = React.useState(getPaletteLeft);
  const [buttonRect, setButtonRect] = React.useState({ left: 0, top: 1, width: 22, height: 21 });
  const [active, setActive] = React.useState(() => String(new URLSearchParams(window.location.search).get('divisions') || '36'));
  const rightPaletteRef = React.useRef(null);

  const syncRightPalette = React.useCallback((nextVisible) => {
    let palette = rightPaletteRef.current;
    if (!palette || !document.body.contains(palette)) palette = findRightPalette();
    if (!palette) return;
    rightPaletteRef.current = palette;
    palette.style.setProperty('display', nextVisible ? 'flex' : 'none', 'important');
    palette.setAttribute('aria-hidden', nextVisible ? 'false' : 'true');
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(visible));
    } catch (_) {
      // no-op
    }
    syncRightPalette(visible);
    window.__gannzillaUnifiedDrawingPalettesVisibleV118 = visible;
  }, [visible, syncRightPalette]);

  React.useEffect(() => {
    const sync = () => {
      setLeft(getPaletteLeft());
      syncRightPalette(visible);
      const button = findSearchButton();
      if (button) {
        const rect = button.getBoundingClientRect();
        setButtonRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
      }
    };

    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    const timer = window.setInterval(sync, 180);
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    sync();

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
      if (rightPaletteRef.current) {
        rightPaletteRef.current.style.removeProperty('display');
        rightPaletteRef.current.removeAttribute('aria-hidden');
      }
    };
  }, [syncRightPalette, visible]);

  const choose = (value) => {
    setActive(value);
    if (['12', '24', '36'].includes(value)) {
      const url = new URL(window.location.href);
      url.searchParams.set('divisions', value);
      url.searchParams.set('v', '118');
      window.location.assign(url.toString());
    }
  };

  return (
    <>
      <button
        type="button"
        title={visible ? 'إخفاء أدوات الرسم اليمنى واليسرى' : 'إظهار أدوات الرسم اليمنى واليسرى'}
        aria-pressed={visible}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setVisible((current) => !current);
        }}
        style={{
          position: 'fixed',
          left: buttonRect.left,
          top: buttonRect.top,
          width: Math.max(22, buttonRect.width),
          height: Math.max(21, buttonRect.height),
          zIndex: 2147483647,
          padding: 0,
          margin: 0,
          border: '1px solid #8fa5b4',
          borderRadius: 2,
          background: visible ? '#d9edf9' : '#f7f7f7',
          color: '#1c75bc',
          font: '800 12px Segoe UI, Arial, sans-serif',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}
      >
        ⌕
      </button>

      {visible && (
        <div
          id="gannzilla-left-drawing-palette-v118"
          style={{
            position: 'fixed',
            left,
            top: LEFT_TOP,
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
      )}
    </>
  );
}
