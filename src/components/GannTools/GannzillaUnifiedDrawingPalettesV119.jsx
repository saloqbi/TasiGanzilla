import React from 'react';
import GannzillaUnifiedDrawingPalettesV118 from './GannzillaUnifiedDrawingPalettesV118';

const STORAGE_KEY = 'gannzillaUnifiedDrawingPalettesVisibleV119';
const V118_STORAGE_KEY = 'gannzillaUnifiedDrawingPalettesVisibleV118';
const LEFT_ID = 'gannzilla-left-drawing-palette-v118';

function readVisible() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? true : saved !== 'false';
  } catch (_) {
    return true;
  }
}

function findNativeSearchButton() {
  const bars = Array.from(document.querySelectorAll('div'));
  const toolbar = bars.find((element) => {
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

  const buttons = Array.from(toolbar.querySelectorAll('button'));
  return buttons.find((button) => {
    const text = String(button.textContent || '').trim();
    return text === '⌕' || text === '🔍';
  }) || null;
}

function findRightPalette() {
  return Array.from(document.querySelectorAll('div')).find((element) => {
    const style = window.getComputedStyle(element);
    const buttons = Array.from(element.children).filter((child) => child.tagName === 'BUTTON');
    const right = Number.parseFloat(style.right);
    return style.position === 'fixed'
      && buttons.length === 9
      && Number.isFinite(right)
      && Math.abs(right - 18) <= 6;
  }) || null;
}

function centeredTop() {
  const estimatedHeight = 586;
  return Math.max(16, Math.round(((window.innerHeight || 768) - estimatedHeight) / 2));
}

export default function GannzillaUnifiedDrawingPalettesV119() {
  try {
    localStorage.setItem(V118_STORAGE_KEY, 'true');
  } catch (_) {
    // Continue without storage.
  }

  const [visible, setVisible] = React.useState(readVisible);
  const [buttonRect, setButtonRect] = React.useState({ left: 0, top: 1, width: 22, height: 21 });

  React.useEffect(() => {
    const apply = () => {
      const leftPalette = document.getElementById(LEFT_ID);
      const rightPalette = findRightPalette();
      const top = centeredTop();

      if (leftPalette) {
        leftPalette.style.setProperty('top', `${top}px`, 'important');
        leftPalette.style.setProperty('display', visible ? 'flex' : 'none', 'important');
      }
      if (rightPalette) {
        rightPalette.style.setProperty('top', `${top}px`, 'important');
        rightPalette.style.setProperty('display', visible ? 'flex' : 'none', 'important');
      }

      const nativeButton = findNativeSearchButton();
      if (nativeButton) {
        const rect = nativeButton.getBoundingClientRect();
        setButtonRect({
          left: Math.round(rect.left),
          top: Math.round(rect.top),
          width: Math.max(22, Math.round(rect.width)),
          height: Math.max(21, Math.round(rect.height)),
        });
      }

      Array.from(document.querySelectorAll('button')).forEach((button) => {
        if (button !== nativeButton && String(button.textContent || '').trim() === '⌕' && button.style.zIndex === '2147483647') {
          button.style.pointerEvents = 'none';
          button.style.opacity = '0';
        }
      });
    };

    try {
      localStorage.setItem(STORAGE_KEY, String(visible));
    } catch (_) {
      // Continue without storage.
    }

    apply();
    const timer = window.setInterval(apply, 250);
    window.addEventListener('resize', apply);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', apply);
    };
  }, [visible]);

  return (
    <>
      <GannzillaUnifiedDrawingPalettesV118 />
      <button
        type="button"
        title={visible ? 'إخفاء أدوات الرسم' : 'إظهار أدوات الرسم'}
        aria-label={visible ? 'إخفاء أدوات الرسم' : 'إظهار أدوات الرسم'}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
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
          borderRadius: 2,
          background: visible ? '#d9edf9' : '#f7f7f7',
          color: '#1c75bc',
          font: '800 12px Segoe UI, Arial, sans-serif',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          touchAction: 'manipulation',
        }}
      >
        ⌕
      </button>
    </>
  );
}
