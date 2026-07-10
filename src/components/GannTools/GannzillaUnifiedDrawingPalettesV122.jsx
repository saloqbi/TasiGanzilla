import React from 'react';

const BUILD = '125';
const STORAGE_KEY = 'gannzillaDrawingToolsVisibleV125';
const LEFT_ID = 'gannzilla-left-drawing-palette-v125';
const RIGHT_ID = 'gannzilla-right-drawing-palette-v125';
const HITBOX_ID = 'gannzilla-drawing-tools-hitbox-v125';

function polygonPoints(sides, radius = 13, cx = 16, cy = 16) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(' ');
}

function readInitialVisible() {
  const query = new URLSearchParams(window.location.search);
  const requested = query.get('drawingTools') || query.get('showDrawingTools');
  if (requested === 'true') return true;
  if (requested === 'false') return false;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored !== 'false';
  } catch (_) {
    return true;
  }
}

function saveVisible(value) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch (_) {
    // Runtime state remains authoritative when storage is unavailable.
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
  const candidates = Array.from(document.querySelectorAll('button')).filter((button) => {
    const text = String(button.textContent || '').trim();
    if (!['⌕', '🔍', '🔎', '🔍︎'].includes(text)) return false;
    const rect = button.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top <= 40;
  });

  return candidates.sort((a, b) => {
    const ar = a.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    return ar.top - br.top || br.left - ar.left;
  })[0] || null;
}

function findRightPalette(previous) {
  if (previous && document.body.contains(previous)) return previous;

  const explicit = document.getElementById(RIGHT_ID)
    || document.querySelector('[data-gannzilla-right-drawing-palette="true"]');
  if (explicit) return explicit;

  return Array.from(document.querySelectorAll('div')).find((element) => {
    if (element.id === LEFT_ID || element.id === HITBOX_ID) return false;
    const style = window.getComputedStyle(element);
    const directButtons = Array.from(element.children).filter((child) => child.tagName === 'BUTTON');
    const right = Number.parseFloat(style.right);
    const top = Number.parseFloat(style.top);

    return style.position === 'fixed'
      && directButtons.length === 9
      && Number.isFinite(right)
      && right >= 0
      && right <= 64
      && Number.isFinite(top)
      && top >= 40;
  }) || null;
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

export default function GannzillaUnifiedDrawingPalettesV122() {
  const [visible, setVisible] = React.useState(readInitialVisible);
  const [left, setLeft] = React.useState(getPaletteLeft);
  const [top, setTop] = React.useState(getPaletteTop);
  const [buttonRect, setButtonRect] = React.useState(null);
  const [active, setActive] = React.useState(() => String(
    new URLSearchParams(window.location.search).get('divisions') || '36',
  ));

  const visibleRef = React.useRef(visible);
  const nativeButtonRef = React.useRef(null);
  const rightPaletteRef = React.useRef(null);

  const applyVisibility = React.useCallback((nextVisible) => {
    const normalized = Boolean(nextVisible);
    visibleRef.current = normalized;
    setVisible(normalized);
    saveVisible(normalized);
    window.__gannzillaDrawingToolsVisibleV125 = normalized;

    const rightPalette = findRightPalette(rightPaletteRef.current);
    if (rightPalette) {
      rightPaletteRef.current = rightPalette;
      rightPalette.id = RIGHT_ID;
      rightPalette.dataset.gannzillaRightDrawingPalette = 'true';
      rightPalette.style.setProperty('display', normalized ? 'flex' : 'none', 'important');
      rightPalette.style.setProperty('visibility', normalized ? 'visible' : 'hidden', 'important');
      rightPalette.style.setProperty('pointer-events', normalized ? 'auto' : 'none', 'important');
      rightPalette.setAttribute('aria-hidden', normalized ? 'false' : 'true');
    }
  }, []);

  const toggle = React.useCallback((event) => {
    event?.preventDefault();
    event?.stopPropagation();
    applyVisibility(!visibleRef.current);
  }, [applyVisibility]);

  React.useEffect(() => {
    const sync = () => {
      setLeft(getPaletteLeft());
      setTop(getPaletteTop());

      const nativeButton = findNativeSearchButton();
      if (nativeButton) {
        nativeButtonRef.current = nativeButton;
        const rect = nativeButton.getBoundingClientRect();
        setButtonRect({
          left: Math.round(rect.left - 5),
          top: Math.round(rect.top - 3),
          width: Math.max(32, Math.round(rect.width + 10)),
          height: Math.max(27, Math.round(rect.height + 6)),
        });
        nativeButton.style.setProperty('pointer-events', 'none', 'important');
        nativeButton.setAttribute('aria-hidden', 'true');
      }

      const rightPalette = findRightPalette(rightPaletteRef.current);
      if (rightPalette) {
        rightPaletteRef.current = rightPalette;
        rightPalette.id = RIGHT_ID;
        rightPalette.dataset.gannzillaRightDrawingPalette = 'true';
        rightPalette.style.setProperty('display', visibleRef.current ? 'flex' : 'none', 'important');
        rightPalette.style.setProperty('visibility', visibleRef.current ? 'visible' : 'hidden', 'important');
        rightPalette.style.setProperty('pointer-events', visibleRef.current ? 'auto' : 'none', 'important');
      }
    };

    sync();
    const timer = window.setInterval(sync, 150);
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);

    window.GANNZILLA_DRAWING_TOOLS_TOGGLE_V125 = true;
    window.__auditGannzillaDrawingToolsToggleV125 = () => {
      const rightPalette = rightPaletteRef.current;
      const rightVisible = rightPalette
        ? window.getComputedStyle(rightPalette).display !== 'none'
          && window.getComputedStyle(rightPalette).visibility !== 'hidden'
        : null;
      const leftVisible = Boolean(document.getElementById(LEFT_ID));
      return {
        ok: Boolean(buttonRect)
          && (visibleRef.current
            ? leftVisible && rightVisible === true
            : !leftVisible && rightVisible === false),
        build: BUILD,
        hitboxPresent: Boolean(document.getElementById(HITBOX_ID)),
        nativeButtonFound: Boolean(nativeButtonRef.current),
        visible: visibleRef.current,
        leftVisible,
        rightVisible,
      };
    };

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
      if (nativeButtonRef.current) {
        nativeButtonRef.current.style.removeProperty('pointer-events');
        nativeButtonRef.current.removeAttribute('aria-hidden');
      }
    };
  }, [buttonRect, applyVisibility]);

  React.useEffect(() => {
    applyVisibility(visible);
  }, [visible, applyVisibility]);

  const choose = (value) => {
    setActive(value);
    if (['12', '24', '36'].includes(value)) {
      const url = new URL(window.location.href);
      url.searchParams.set('divisions', value);
      url.searchParams.set('v', BUILD);
      window.location.assign(url.toString());
    }
  };

  return (
    <>
      {buttonRect && (
        <button
          id={HITBOX_ID}
          type="button"
          title={visible ? 'إخفاء أدوات الرسم اليمنى واليسرى' : 'إظهار أدوات الرسم اليمنى واليسرى'}
          aria-label={visible ? 'إخفاء أدوات الرسم اليمنى واليسرى' : 'إظهار أدوات الرسم اليمنى واليسرى'}
          aria-pressed={visible}
          onPointerDown={toggle}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') toggle(event);
          }}
          style={{
            position: 'fixed',
            left: buttonRect.left,
            top: buttonRect.top,
            width: buttonRect.width,
            height: buttonRect.height,
            zIndex: 2147483647,
            padding: 0,
            margin: 0,
            border: '1px solid #8fa5b4',
            borderRadius: 3,
            background: visible ? '#d9edf9' : '#f7f7f7',
            color: '#1c75bc',
            boxShadow: visible ? 'inset 0 0 0 1px #5f9fc5' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            pointerEvents: 'auto',
            touchAction: 'manipulation',
            userSelect: 'none',
            font: '800 15px Segoe UI, Arial, sans-serif',
          }}
        >
          ⌕
        </button>
      )}

      {visible && (
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
      )}
    </>
  );
}
