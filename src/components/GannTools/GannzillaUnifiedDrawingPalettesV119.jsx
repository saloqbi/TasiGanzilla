import React from 'react';

const BUTTON_ID = 'gannzilla-drawing-toggle-v120';

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

function findOriginalToggle() {
  return Array.from(document.querySelectorAll('button')).find((button) => {
    const text = String(button.textContent || '').trim();
    const pressed = button.getAttribute('aria-pressed');
    return button.id !== BUTTON_ID
      && text === '⌕'
      && button.style.position === 'fixed'
      && Number(button.style.zIndex) > 1000000
      && (pressed === 'true' || pressed === 'false');
  }) || null;
}

function centeredTop() {
  return Math.max(16, Math.round(((window.innerHeight || 768) - 586) / 2));
}

export default function GannzillaUnifiedDrawingPalettesV119() {
  const [rect, setRect] = React.useState({ left: 0, top: 1, width: 22, height: 21 });
  const [visible, setVisible] = React.useState(true);

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

      const originalToggle = findOriginalToggle();
      if (originalToggle) {
        originalToggle.style.pointerEvents = 'none';
        originalToggle.style.opacity = '0';
        setVisible(originalToggle.getAttribute('aria-pressed') !== 'false');
      }

      const top = centeredTop();
      const leftPalette = document.getElementById('gannzilla-left-drawing-palette-v118');
      if (leftPalette) leftPalette.style.setProperty('top', `${top}px`, 'important');

      Array.from(document.querySelectorAll('div')).forEach((element) => {
        const style = window.getComputedStyle(element);
        const buttons = Array.from(element.children).filter((child) => child.tagName === 'BUTTON');
        const right = Number.parseFloat(style.right);
        if (style.position === 'fixed' && buttons.length === 9 && Number.isFinite(right) && Math.abs(right - 18) <= 6) {
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
    const originalToggle = findOriginalToggle();
    if (!originalToggle) return;

    const PointerEventCtor = window.PointerEvent || window.MouseEvent;
    originalToggle.dispatchEvent(new PointerEventCtor('pointerdown', {
      bubbles: true,
      cancelable: true,
      pointerType: 'mouse',
      isPrimary: true,
    }));

    window.setTimeout(() => {
      setVisible(originalToggle.getAttribute('aria-pressed') !== 'false');
    }, 60);
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
      }}
    >
      ⌕
    </button>
  );
}
