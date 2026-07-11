import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = 220;
const MOVE_ID = 'gannzilla-wheel-move-v220';
const FIT_ID = 'gannzilla-wheel-fit-v220';

function compactLabel(element) {
  return String(element?.textContent || '').replace(/\s+/g, '').trim();
}

function isTopButton(button) {
  const rect = button?.getBoundingClientRect?.();
  return Boolean(rect)
    && rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.bottom <= 55;
}

function findNativeFitButton() {
  return Array.from(document.querySelectorAll('button'))
    .filter((button) => button.id !== MOVE_ID && button.id !== FIT_ID)
    .filter(isTopButton)
    .find((button) => {
      const label = compactLabel(button);
      const title = String(button.getAttribute?.('title') || '').toLowerCase();
      const aria = String(button.getAttribute?.('aria-label') || '').toLowerCase();
      const text = `${title} ${aria}`;
      return ['⛶', '⤢', '↗'].includes(label)
        || text.includes('fit')
        || text.includes('fullscreen')
        || text.includes('full screen')
        || text.includes('ملاءمة')
        || text.includes('تكبير الصفحة')
        || text.includes('احتواء');
    }) || null;
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function findWheelViewport(canvas = findWheelCanvas()) {
  let node = canvas?.parentElement || null;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflow = `${style.overflow} ${style.overflowX} ${style.overflowY}`;
    if (/(auto|scroll)/.test(overflow)) return node;
    node = node.parentElement;
  }
  return null;
}

function centerViewport() {
  const canvas = findWheelCanvas();
  const viewport = findWheelViewport(canvas);
  if (!canvas || !viewport) return false;
  viewport.scrollLeft = Math.max(0, (canvas.offsetWidth - viewport.clientWidth) / 2);
  viewport.scrollTop = Math.max(0, (canvas.offsetHeight - viewport.clientHeight) / 2);
  return true;
}

function fallbackFitToViewport() {
  const canvas = findWheelCanvas();
  const viewport = findWheelViewport(canvas);
  if (!canvas || !viewport) return false;

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const naturalWidth = canvas.width / dpr;
  const naturalHeight = canvas.height / dpr;
  if (!naturalWidth || !naturalHeight) return false;

  const fit = Math.max(0.1, Math.min(1,
    (viewport.clientWidth - 60) / naturalWidth,
    (viewport.clientHeight - 60) / naturalHeight));

  canvas.style.width = `${Math.round(naturalWidth * fit)}px`;
  canvas.style.height = `${Math.round(naturalHeight * fit)}px`;
  window.setTimeout(centerViewport, 30);
  return true;
}

function getLayout() {
  const nativeFit = findNativeFitButton();
  if (nativeFit) {
    nativeFit.style.setProperty('margin-left', '30px', 'important');
    const rect = nativeFit.getBoundingClientRect();
    return {
      move: { left: Math.round(rect.left - 28), top: Math.round(rect.top), width: 26, height: Math.max(21, Math.round(rect.height)) },
      fit: { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.max(24, Math.round(rect.width)), height: Math.max(21, Math.round(rect.height)) },
      nativeFit,
    };
  }

  const percentage = Array.from(document.querySelectorAll('span,div,button'))
    .filter((element) => /^\d{2,3}%$/.test(compactLabel(element)))
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= 55;
    })[0] || null;

  const percentRect = percentage?.getBoundingClientRect?.();
  const fitLeft = percentRect ? Math.max(8, Math.round(percentRect.left - 58)) : Math.max(36, window.innerWidth - 164);
  const top = percentRect ? Math.round(percentRect.top) : 1;
  const height = percentRect ? Math.max(21, Math.round(percentRect.height)) : 22;
  return {
    move: { left: fitLeft - 28, top, width: 26, height },
    fit: { left: fitLeft, top, width: 26, height },
    nativeFit: null,
  };
}

const controlStyle = (active = false) => ({
  position: 'fixed',
  padding: 0,
  margin: 0,
  zIndex: 2147483647,
  border: '1px solid #7e9aad',
  borderRadius: 2,
  background: active ? '#cbe8f8' : 'linear-gradient(#ffffff 0%, #f6f6f6 52%, #e8e8e8 100%)',
  color: '#176ea6',
  boxShadow: active ? 'inset 0 0 0 1px #5f9fc5' : 'inset 0 1px 0 rgba(255,255,255,.9)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  visibility: 'visible',
  opacity: 1,
  pointerEvents: 'auto',
  cursor: 'pointer',
  userSelect: 'none',
  touchAction: 'manipulation',
  boxSizing: 'border-box',
});

function MoveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      <path d="M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FitIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', pointerEvents: 'none' }}>
      <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="square" />
    </svg>
  );
}

export default function GannzillaWheelNavigationV220() {
  const [layout, setLayout] = React.useState(getLayout);
  const [dragEnabled, setDragEnabled] = React.useState(false);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    let disposed = false;
    const refresh = () => {
      if (disposed) return;
      const next = getLayout();
      setLayout((current) => {
        const same = current
          && current.move.left === next.move.left
          && current.move.top === next.move.top
          && current.fit.left === next.fit.left
          && current.fit.top === next.fit.top
          && current.fit.width === next.fit.width
          && current.fit.height === next.fit.height
          && current.nativeFit === next.nativeFit;
        return same ? current : next;
      });
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'title', 'aria-label'] });
    const timer = window.setInterval(refresh, 300);
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);

    return () => {
      disposed = true;
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
    };
  }, []);

  React.useEffect(() => {
    const canvas = findWheelCanvas();
    if (!canvas) return;
    canvas.style.setProperty('transform', `translate3d(${pan.x}px, ${pan.y}px, 0)`, 'important');
    canvas.style.setProperty('transform-origin', 'center center', 'important');
  }, [pan]);

  React.useEffect(() => {
    const viewport = findWheelViewport();
    if (!viewport) return undefined;

    viewport.style.setProperty('cursor', dragEnabled ? 'grab' : 'default', 'important');
    viewport.style.setProperty('touch-action', dragEnabled ? 'none' : 'auto', 'important');
    if (!dragEnabled) return undefined;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startPan = pan;

    const down = (event) => {
      if (event.button !== 0) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('button,input,select,textarea,a,[role="button"]')) return;
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      startPan = pan;
      viewport.style.setProperty('cursor', 'grabbing', 'important');
      event.preventDefault();
      event.stopPropagation();
    };

    const move = (event) => {
      if (!dragging) return;
      setPan({
        x: startPan.x + (event.clientX - startX),
        y: startPan.y + (event.clientY - startY),
      });
      event.preventDefault();
    };

    const up = () => {
      if (!dragging) return;
      dragging = false;
      viewport.style.setProperty('cursor', 'grab', 'important');
    };

    viewport.addEventListener('pointerdown', down, true);
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up, true);
    window.addEventListener('pointercancel', up, true);

    return () => {
      viewport.removeEventListener('pointerdown', down, true);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up, true);
      window.removeEventListener('pointercancel', up, true);
      viewport.style.removeProperty('cursor');
      viewport.style.removeProperty('touch-action');
    };
  }, [dragEnabled, pan]);

  const fitToScreen = React.useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setPan({ x: 0, y: 0 });

    const nativeFit = findNativeFitButton() || layout.nativeFit;
    if (nativeFit) nativeFit.click();
    else fallbackFitToViewport();

    window.setTimeout(centerViewport, 80);
    window.setTimeout(centerViewport, 260);
    window.setTimeout(centerViewport, 600);
  }, [layout.nativeFit]);

  React.useEffect(() => {
    window.GANNZILLA_WHEEL_NAVIGATION_V220 = true;
    window.__auditGannzillaWheelNavigationV220 = () => ({
      ok: Boolean(document.getElementById(MOVE_ID)) && Boolean(document.getElementById(FIT_ID)),
      build: BUILD,
      dragEnabled,
      nativeFitFound: Boolean(findNativeFitButton()),
      viewportFound: Boolean(findWheelViewport()),
      canvasFound: Boolean(findWheelCanvas()),
      pan,
    });
  }, [dragEnabled, pan]);

  return createPortal(
    <>
      <button
        id={MOVE_ID}
        type="button"
        title={dragEnabled ? 'إيقاف تحريك العجلة' : 'تحريك العجلة: اضغط ثم اسحب العجلة'}
        aria-label={dragEnabled ? 'إيقاف تحريك العجلة' : 'تشغيل تحريك العجلة'}
        aria-pressed={dragEnabled}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragEnabled((value) => !value);
        }}
        style={{
          ...controlStyle(dragEnabled),
          left: layout.move.left,
          top: layout.move.top,
          width: layout.move.width,
          minWidth: layout.move.width,
          height: layout.move.height,
        }}
      >
        <MoveIcon />
      </button>

      <button
        id={FIT_ID}
        type="button"
        title="ملاءمة العجلة داخل الصفحة"
        aria-label="ملاءمة العجلة داخل الصفحة"
        onClick={fitToScreen}
        style={{
          ...controlStyle(false),
          left: layout.fit.left,
          top: layout.fit.top,
          width: layout.fit.width,
          minWidth: layout.fit.width,
          height: layout.fit.height,
        }}
      >
        <FitIcon />
      </button>
    </>,
    document.body,
  );
}
