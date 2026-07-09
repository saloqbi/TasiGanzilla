import React from 'react';

const BUTTON_ID = 'gannzilla-drawing-toggle-v121';
const STORAGE_KEY = 'gannzillaDrawingPalettesVisibleV121';

function findNativeButton() {
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
    return text === '⌕' || text === '🔍';
  }) || null;
}

function findRightPalette() {
  return Array.from(document.querySelectorAll('div')).find((element) => {
    const style = window.getComputedStyle(element);
    const directButtons = Array.from(element.children).filter((child) => child.tagName === 'BUTTON');
    const right = Number.parseFloat(style.right);
    return style.position === 'fixed'
      && directButtons.length === 9
      && Number.isFinite(right)
      && Math.abs(right - 18) <= 6;
  }) || null;
}

function readVisible() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch (_) {
    return true;
  }
}

function centeredTop() {
  return Math.max(16, Math.round(((window.innerHeight || 768) - 586) / 2));
}

export default function GannzillaUnifiedDrawingPalettesV119() {
  const [rect, setRect] = React.useState({ left: 0, top: 1, width: 22, height: 21 });
  const [visible, setVisible] = React.useState(readVisible);
  const visibleRef = React.useRef(visible);

  const applyVisibility = React.useCallback((nextVisible) => {
    visibleRef.current = nextVisible;

    const leftPalette = document.getElementById('gannzilla-left-drawing-palette-v118');
    if (leftPalette) {
      leftPalette.style.setProperty('display', nextVisible ? 'flex' : 'none', 'important');
      leftPalette.setAttribute('aria-hidden', nextVisible ? 'false' : 'true');
    }

    const rightPalette = findRightPalette();
    if (rightPalette) {
      rightPalette.style.setProperty('display', nextVisible ? 'flex' : 'none', 'important');
      rightPalette.setAttribute('aria-hidden', nextVisible ? 'false' : 'true');
    }

    try {
      localStorage.setItem(STORAGE_KEY, String(nextVisible));
    } catch (_) {
      // Continue without persistence.
    }
  }, []);

  React.useEffect(() => {
    visibleRef.current = visible;
    applyVisibility(visible);
  }, [visible, applyVisibility]);

  React.useEffect(() => {
    const sync = () => {
      const nativeButton = findNativeButton();
      if (nativeButton) {
        const next = nativeButton.getBoundingClientRect();
        setRect({
          left: Math.round(next.left),
          top: Math.round(next.top),
          width: Math.max(22, Math.round(next.width)),
          height: Math.max(21, Math.round(next.height)),
        });
      }

      Array.from(document.querySelectorAll('button')).forEach((button) => {
        if (
          button.id !== BUTTON_ID
          && String(button.textContent || '').trim() === '⌕'
          && button.style.position === 'fixed'
          && Number(button.style.zIndex) > 1000000
        ) {
          button.style.setProperty('display', 'none', 'important');
          button.style.pointerEvents = 'none';
        }
      });

      const top = centeredTop();
      const leftPalette = document.getElementById('gannzilla-left-drawing-palette-v118');
      if (leftPalette) leftPalette.style.setProperty('top', `${top}px`, 'important');

      const rightPalette = findRightPalette();
      if (rightPalette) rightPalette.style.setProperty('top', `${top}px`, 'important');

      applyVisibility(visibleRef.current);
    };

    sync();
    const timer = window.setInterval(sync, 250);
    window.addEventListener('resize', sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', sync);
    };
  }, [applyVisibility]);

  const toggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const nextVisible = !visibleRef.current;
    visibleRef.current = nextVisible;
    applyVisibility(nextVisible);
    setVisible(nextVisible);
  };

  return (
    <button
      id={BUTTON_ID}
      type="button"
      title={visible ? 'إخفاء أدوات الرسم' : 'إظهار أدوات الرسم'}
      aria-label={visible ? 'إخفاء أدوات الرسم' : 'إظهار أدوات الرسم'}
      aria-pressed={visible}
      onClick={toggle}
      style={{
        position: 'fixed',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        zIndex: 2147483647,
        padding: 0,
        margin: 0,
        border: '1px solid #8fa5b4',
        borderRadius: 2,
        background: visible ? '#d9edf9' : '#f7f7f7',
        color: '#1c75bc',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'manipulation',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      ⌕
    </button>
  );
}
