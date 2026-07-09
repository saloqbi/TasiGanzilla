import React from 'react';

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
  return Array.from(toolbar.querySelectorAll('button')).find((button) => String(button.textContent || '').trim() === '⌕') || null;
}

function findV118Toggle() {
  return Array.from(document.querySelectorAll('button')).find((button) => (
    String(button.textContent || '').trim() === '⌕'
    && button.style.position === 'fixed'
    && Number(button.style.zIndex) > 1000000
  )) || null;
}

function centeredTop() {
  return Math.max(16, Math.round(((window.innerHeight || 768) - 586) / 2));
}

export default function GannzillaUnifiedDrawingPalettesV119() {
  const [rect, setRect] = React.useState({ left: 0, top: 1, width: 22, height: 21 });

  React.useEffect(() => {
    const sync = () => {
      const nativeButton = findNativeButton();
      if (nativeButton) {
        const next = nativeButton.getBoundingClientRect();
        setRect({ left: next.left, top: next.top, width: Math.max(22, next.width), height: Math.max(21, next.height) });
      }

      const originalToggle = findV118Toggle();
      if (originalToggle) {
        originalToggle.style.pointerEvents = 'none';
        originalToggle.style.opacity = '0';
      }

      const top = centeredTop();
      const leftPalette = document.getElementById('gannzilla-left-drawing-palette-v118');
      if (leftPalette) leftPalette.style.setProperty('top', `${top}px`, 'important');

      Array.from(document.querySelectorAll('div')).forEach((element) => {
        const style = window.getComputedStyle(element);
        const buttons = Array.from(element.children).filter((child) => child.tagName === 'BUTTON');
        if (style.position === 'fixed' && buttons.length === 9 && Math.abs(Number.parseFloat(style.right) - 18) <= 6) {
          element.style.setProperty('top', `${top}px`, 'important');
        }
      });
    };

    sync();
    const timer = window.setInterval(sync, 250);
    window.addEventListener('resize', sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', sync);
    };
  }, []);

  const toggle = () => {
    const originalToggle = findV118Toggle();
    if (!originalToggle) return;
    originalToggle.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      pointerType: 'mouse',
      isPrimary: true,
    }));
  };

  return (
    <button
      type="button"
      title="إخفاء أو إظهار أدوات الرسم"
      aria-label="إخفاء أو إظهار أدوات الرسم"
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
        background: '#d9edf9',
        color: '#1c75bc',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'manipulation',
      }}
    >
      ⌕
    </button>
  );
}
