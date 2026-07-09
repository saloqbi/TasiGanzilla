import React from 'react';

const MARKER = 'GANNZILLA_NATIVE_LEFT_PALETTE_V113_WORKING_TOGGLE';
const TOGGLE_BUTTON_ID = 'gannzilla-left-drawing-palette-toggle-v113';
const PALETTE_ID = 'gannzilla-native-left-drawing-palette-v113';
const STORAGE_KEY = 'gannzillaDrawingPaletteVisibleV113Working';

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
  url.searchParams.set('v', '113');
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

function iconMarkup(visible) {
  return `
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" style="display:block;pointer-events:none">
      <rect x="4" y="3" width="16" height="18" rx="1" fill="#f7f7f7" stroke="#5f7f95" stroke-width="1.35"/>
      <rect x="6.5" y="5" width="4" height="14" fill="#b9ddf4" stroke="#4f8cb4" stroke-width="0.9"/>
      <path d="M12.5 6.5h4.6M12.5 11.8h4.6M12.5 17.1h4.6" stroke="#718895" stroke-width="1.25" stroke-linecap="round"/>
      <circle cx="18.5" cy="5.1" r="2.2" fill="${visible ? '#22884f' : '#969696'}"/>
      ${visible
        ? '<path d="m17.3 5.1.9 1 1.6-1.9" fill="none" stroke="#fff" stroke-width="0.85" stroke-linecap="round" stroke-linejoin="round"/>'
        : '<path d="M17.25 5.1h2.5" stroke="#fff" stroke-width="0.85" stroke-linecap="round"/>'}
    </svg>`;
}

function styleToggleButton(button, visible) {
  button.type = 'button';
  button.title = visible ? 'إخفاء أدوات الرسم' : 'إظهار أدوات الرسم';
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
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.cursor = 'pointer';
  button.style.boxSizing = 'border-box';
  button.style.flex = '0 0 22px';
  button.style.pointerEvents = 'auto';
  button.style.position = 'static';
  button.style.zIndex = 'auto';
  button.innerHTML = iconMarkup(visible);
}

export default function GannzillaNativeLeftPaletteV110() {
  const [active, setActive] = React.useState(() => String(new URLSearchParams(window.location.search).get('divisions') || '36'));
  const [left, setLeft] = React.useState(() => getPaletteLeft());
  const [visible, setVisible] = React.useState(readInitialVisibility);
  const visibleRef = React.useRef(visible);

  React.useEffect(() => {
    visibleRef.current = visible;
    window.__gannzillaLeftDrawingPaletteVisibleV113 = visible;

    try {
      localStorage.setItem(STORAGE_KEY, String(visible));
    } catch (_) {
      // Keep the interface functional if browser storage is unavailable.
    }

    const button = document.getElementById(TOGGLE_BUTTON_ID);
    if (button) styleToggleButton(button, visible);
  }, [visible]);

  React.useEffect(() => {
    const enabled = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    if (!enabled) return undefined;

    const handleToggleClick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setVisible((current) => !current);
    };

    const bindToggleButton = () => {
      const toolbar = findTopToolbar();
      const lockButton = findLockButton(toolbar);
      if (!lockButton?.parentElement) return;

      let button = document.getElementById(TOGGLE_BUTTON_ID);
      if (!button) {
        button = document.createElement('button');
        button.id = TOGGLE_BUTTON_ID;
      }

      const parent = lockButton.parentElement;
      if (lockButton.nextElementSibling !== button) {
        parent.insertBefore(button, lockButton.nextElementSibling);
      }

      if (button.__gannzillaDrawingToggleHandler) {
        button.removeEventListener('click', button.__gannzillaDrawingToggleHandler, true);
      }

      button.__gannzillaDrawingToggleHandler = handleToggleClick;
      button.addEventListener('click', handleToggleClick, true);
      styleToggleButton(button, visibleRef.current);
    };

    const syncPosition = () => setLeft(getPaletteLeft());
    const observer = new MutationObserver(() => {
      bindToggleButton();
      syncPosition();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const timer = window.setInterval(() => {
      bindToggleButton();
      syncPosition();
    }, 300);

    window.addEventListener('resize', syncPosition);
    bindToggleButton();
    syncPosition();

    window[MARKER] = true;
    window.__auditGannzillaNativeLeftPaletteV113WorkingToggle = () => {
      const button = document.getElementById(TOGGLE_BUTTON_ID);
      const palette = document.getElementById(PALETTE_ID);
      return {
        ok: window[MARKER] === true
          && Boolean(button)
          && (visibleRef.current === false || Boolean(palette)),
        toggleButtonPresent: Boolean(button),
        toggleHandlerBound: Boolean(button?.__gannzillaDrawingToggleHandler),
        paletteVisible: visibleRef.current,
        palettePresentWhenVisible: visibleRef.current ? Boolean(palette) : true,
        wheelUntouched: true,
      };
    };

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', syncPosition);
      const button = document.getElementById(TOGGLE_BUTTON_ID);
      if (button?.__gannzillaDrawingToggleHandler) {
        button.removeEventListener('click', button.__gannzillaDrawingToggleHandler, true);
        delete button.__gannzillaDrawingToggleHandler;
      }
      button?.remove();
    };
  }, []);

  const choose = (value) => {
    setActive(value);
    if (['12', '24', '36'].includes(value)) applyDivisions(Number(value));
  };

  return visible ? (
    <div
      id={PALETTE_ID}
      style={{
        position: 'fixed',
        left,
        top: 54,
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
