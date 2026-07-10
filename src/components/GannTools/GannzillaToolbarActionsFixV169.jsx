import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = '171';
const FULLSCREEN_ID = 'gannzilla-fullscreen-action-v171';
const DRAWING_ID = 'gannzilla-drawing-toggle-v171';
const OLD_DRAWING_HITBOX_ID = 'gannzilla-drawing-tools-hitbox-v125';
const STORAGE_KEYS = [
  'gannzillaDrawingToolsVisibleV125',
  'gannzillaDrawingToolsVisibleV124',
  'gannzillaDrawingToolsVisibleV123',
  'gannzillaDrawingToolsVisibleV122',
];

function textOf(element) {
  return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
}

function isTopToolbarButton(button) {
  const rect = button?.getBoundingClientRect?.();
  return Boolean(rect)
    && rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.bottom <= 44;
}

function isOverlayButton(button) {
  const id = String(button?.id || '');
  return id === FULLSCREEN_ID
    || id === DRAWING_ID
    || id === OLD_DRAWING_HITBOX_ID
    || id.startsWith('gannzilla-fullscreen-')
    || id.startsWith('gannzilla-drawing-toggle-');
}

function findNativeButton(kind) {
  return Array.from(document.querySelectorAll('button'))
    .filter((button) => !isOverlayButton(button))
    .filter(isTopToolbarButton)
    .find((button) => {
      const label = textOf(button);
      if (kind === 'fullscreen') return ['⛶', '⤢', '↗', '⛶︎'].includes(label);
      return ['⌕', '🔍', '🔎', '🔍︎'].includes(label);
    }) || null;
}

function rectOf(button, padding = 0) {
  if (!button) return null;
  const rect = button.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  return {
    left: Math.round(rect.left - padding),
    top: Math.round(rect.top - padding),
    width: Math.max(22, Math.round(rect.width + padding * 2)),
    height: Math.max(21, Math.round(rect.height + padding * 2)),
  };
}

function readDrawingVisible() {
  if (typeof window.__gannzillaDrawingToolsVisibleV125 === 'boolean') {
    return window.__gannzillaDrawingToolsVisibleV125;
  }
  const query = new URLSearchParams(window.location.search);
  const requested = query.get('drawingTools') || query.get('showDrawingTools');
  if (requested === 'true') return true;
  if (requested === 'false') return false;
  try {
    for (const key of STORAGE_KEYS) {
      const saved = localStorage.getItem(key);
      if (saved !== null) return saved !== 'false';
    }
  } catch (_) {}
  return true;
}

function persistDrawingVisible(visible) {
  window.__gannzillaDrawingToolsVisibleV125 = visible;
  try {
    STORAGE_KEYS.forEach((key) => localStorage.setItem(key, String(visible)));
  } catch (_) {}

  const detail = { visible, source: `toolbar-actions-v${BUILD}` };
  window.dispatchEvent(new CustomEvent('gannzilla:drawing-tools-visibility-v125', { detail }));
  window.dispatchEvent(new CustomEvent('gannzilla:drawing-tools-visibility', { detail }));
}

function enforceDrawingVisibility(visible) {
  const selectors = [
    '[data-gannzilla-left-reference-palette="true"]',
    '[data-gannzilla-right-drawing-palette="true"]',
    '[id^="gannzilla-left-reference-palette-"]',
    '[id^="gannzilla-left-drawing-palette-"]',
    '[id^="gannzilla-right-drawing-palette-"]',
  ].join(',');

  document.querySelectorAll(selectors).forEach((element) => {
    element.style.setProperty('display', visible ? 'flex' : 'none', 'important');
    element.style.setProperty('visibility', visible ? 'visible' : 'hidden', 'important');
    element.style.setProperty('pointer-events', visible ? 'auto' : 'none', 'important');
    element.setAttribute('aria-hidden', visible ? 'false' : 'true');
  });
}

function isFullscreen() {
  return Boolean(
    document.fullscreenElement
    || document.webkitFullscreenElement
    || document.msFullscreenElement,
  );
}

function enterOrExitFullscreen() {
  const root = document.documentElement;

  if (isFullscreen()) {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    if (document.msExitFullscreen) return document.msExitFullscreen();
    return undefined;
  }

  // Call the browser API directly from the trusted pointer event.
  // Do not await anything before this call, otherwise Chrome may consume user activation.
  if (root.requestFullscreen) return root.requestFullscreen();
  if (root.webkitRequestFullscreen) return root.webkitRequestFullscreen();
  if (root.msRequestFullscreen) return root.msRequestFullscreen();
  return undefined;
}

function clickNativeFit(button) {
  if (!button) return;
  button.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
  }));
}

const overlayStyle = {
  position: 'fixed',
  zIndex: 2147483647,
  padding: 0,
  margin: 0,
  border: '1px solid #8fa5b4',
  borderRadius: 3,
  background: '#f7f7f7',
  color: '#1c75bc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  pointerEvents: 'auto',
  touchAction: 'manipulation',
  userSelect: 'none',
  boxSizing: 'border-box',
  font: '800 15px Segoe UI Symbol, Segoe UI, Arial, sans-serif',
  lineHeight: 1,
};

export default function GannzillaToolbarActionsFixV169() {
  const [fullscreenRect, setFullscreenRect] = React.useState(null);
  const [drawingRect, setDrawingRect] = React.useState(null);
  const [drawingVisible, setDrawingVisible] = React.useState(readDrawingVisible);
  const fullscreenSourceRef = React.useRef(null);
  const fullscreenBusyRef = React.useRef(false);

  const refresh = React.useCallback(() => {
    document.getElementById(OLD_DRAWING_HITBOX_ID)?.remove();

    const fullscreenSource = findNativeButton('fullscreen');
    const drawingSource = findNativeButton('drawing');
    fullscreenSourceRef.current = fullscreenSource;

    if (fullscreenSource) {
      fullscreenSource.style.setProperty('pointer-events', 'none', 'important');
      fullscreenSource.setAttribute('aria-hidden', 'true');
    }
    if (drawingSource) {
      drawingSource.style.setProperty('pointer-events', 'none', 'important');
      drawingSource.setAttribute('aria-hidden', 'true');
    }

    const nextFullscreenRect = rectOf(fullscreenSource, 1);
    const nextDrawingRect = rectOf(drawingSource, 2);
    setFullscreenRect((current) => JSON.stringify(current) === JSON.stringify(nextFullscreenRect) ? current : nextFullscreenRect);
    setDrawingRect((current) => JSON.stringify(current) === JSON.stringify(nextDrawingRect) ? current : nextDrawingRect);
    enforceDrawingVisibility(drawingVisible);
  }, [drawingVisible]);

  React.useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 100);
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
    };
  }, [refresh]);

  React.useEffect(() => {
    persistDrawingVisible(drawingVisible);
    enforceDrawingVisibility(drawingVisible);
    const timer = window.setTimeout(() => enforceDrawingVisibility(drawingVisible), 300);
    return () => window.clearTimeout(timer);
  }, [drawingVisible]);

  React.useEffect(() => {
    const onFullscreenChange = () => {
      fullscreenBusyRef.current = false;
      window.scrollTo(0, 0);

      // Match Gannzilla: after the browser enters fullscreen, fit and center the wheel.
      const fit = () => {
        clickNativeFit(fullscreenSourceRef.current || findNativeButton('fullscreen'));
        window.scrollTo(0, 0);
        window.dispatchEvent(new Event('resize'));
      };
      window.setTimeout(fit, 80);
      window.setTimeout(fit, 260);
      window.setTimeout(fit, 520);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('MSFullscreenChange', onFullscreenChange);
    };
  }, []);

  React.useEffect(() => {
    window.GANNZILLA_TOOLBAR_ACTIONS_FIX_V171 = true;
    window.__auditGannzillaToolbarActionsFixV171 = () => ({
      ok: Boolean(document.getElementById(FULLSCREEN_ID))
        && Boolean(document.getElementById(DRAWING_ID)),
      build: BUILD,
      fullscreenControlVisible: Boolean(document.getElementById(FULLSCREEN_ID)),
      drawingControlVisible: Boolean(document.getElementById(DRAWING_ID)),
      drawingVisible,
      fullscreen: isFullscreen(),
      nativeFullscreenSourceFound: Boolean(fullscreenSourceRef.current),
    });
  }, [drawingVisible]);

  const activateFullscreen = React.useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent?.stopImmediatePropagation?.();
    if (fullscreenBusyRef.current) return;

    fullscreenBusyRef.current = true;
    window.scrollTo(0, 0);

    try {
      const result = enterOrExitFullscreen();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          fullscreenBusyRef.current = false;
          // Safe fallback: at least fit and center the wheel when fullscreen is denied.
          clickNativeFit(fullscreenSourceRef.current || findNativeButton('fullscreen'));
          window.scrollTo(0, 0);
        });
      }
    } catch (_) {
      fullscreenBusyRef.current = false;
      clickNativeFit(fullscreenSourceRef.current || findNativeButton('fullscreen'));
      window.scrollTo(0, 0);
    }
  }, []);

  const fullscreenButton = fullscreenRect && createPortal(
    <button
      id={FULLSCREEN_ID}
      type="button"
      title="فتح ملء الشاشة مثل Gannzilla"
      aria-label="فتح ملء الشاشة مثل Gannzilla"
      aria-pressed={isFullscreen()}
      onPointerDown={activateFullscreen}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') activateFullscreen(event);
      }}
      style={{ ...overlayStyle, ...fullscreenRect }}
    >
      ⛶
    </button>,
    document.body,
  );

  const drawingButton = drawingRect && createPortal(
    <button
      id={DRAWING_ID}
      type="button"
      title={drawingVisible ? 'إخفاء أدوات الرسم اليمنى واليسرى' : 'إظهار أدوات الرسم اليمنى واليسرى'}
      aria-label={drawingVisible ? 'إخفاء أدوات الرسم اليمنى واليسرى' : 'إظهار أدوات الرسم اليمنى واليسرى'}
      aria-pressed={drawingVisible}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent?.stopImmediatePropagation?.();
        setDrawingVisible((current) => !current);
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      style={{
        ...overlayStyle,
        ...drawingRect,
        background: drawingVisible ? '#d9edf9' : '#f7f7f7',
        boxShadow: drawingVisible ? 'inset 0 0 0 1px #5f9fc5' : 'none',
      }}
    >
      ⌕
    </button>,
    document.body,
  );

  return <>{fullscreenButton}{drawingButton}</>;
}
