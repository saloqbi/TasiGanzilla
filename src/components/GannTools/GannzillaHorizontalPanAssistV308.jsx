import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = 311;
const BAR_HEIGHT_PX = 14;
const BAR_BOTTOM_PX = 18;
const EDGE_GAP_PX = 2;
const VERTICAL_RAIL_CLEARANCE_PX = 20;
const THUMB_WIDTH_PX = 18;
const BUTTON_WIDTH_PX = 14;
const MOVEMENT_RANGE_PX = 80000;
const STEP_PX = 64;
const HOLD_STEP_PX = 24;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function fractionFromOffset(offset) {
  return clamp((MOVEMENT_RANGE_PX - offset) / (MOVEMENT_RANGE_PX * 2), 0, 1);
}

function offsetFromFraction(fraction) {
  return MOVEMENT_RANGE_PX - clamp(fraction, 0, 1) * MOVEMENT_RANGE_PX * 2;
}

function getPanelInsets() {
  const root = document.querySelector('[data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"])');
  const panel = Array.from(root?.children || []).find(
    (node) => node instanceof HTMLElement && node.tagName === 'ASIDE',
  );

  if (!(panel instanceof HTMLElement)) {
    return { left: EDGE_GAP_PX, right: VERTICAL_RAIL_CLEARANCE_PX };
  }

  const style = window.getComputedStyle(panel);
  const rect = panel.getBoundingClientRect();
  const visible = style.display !== 'none'
    && style.visibility !== 'hidden'
    && style.opacity !== '0'
    && rect.width > 1
    && rect.height > 1;

  if (!visible) {
    return { left: EDGE_GAP_PX, right: VERTICAL_RAIL_CLEARANCE_PX };
  }

  if (rect.left <= window.innerWidth / 2) {
    return {
      left: Math.round(rect.right + EDGE_GAP_PX),
      right: VERTICAL_RAIL_CLEARANCE_PX,
    };
  }

  return {
    left: EDGE_GAP_PX,
    right: Math.round(window.innerWidth - rect.left + EDGE_GAP_PX),
  };
}

/** Build 311: portal-mounted compact horizontal scrollbar that cannot be clipped by the app frame. */
export default function GannzillaHorizontalPanAssistV308() {
  const trackRef = React.useRef(null);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({ x: 0, y: 0 });
  const holdDelayRef = React.useRef(0);
  const holdIntervalRef = React.useRef(0);
  const [offsetX, setOffsetX] = React.useState(0);
  const [insets, setInsets] = React.useState(getPanelInsets);

  const commitX = React.useCallback((nextX) => {
    const next = {
      x: Number(nextX) || 0,
      y: Number(offsetRef.current.y) || 0,
    };
    offsetRef.current = next;
    setOffsetX(next.x);
    window.dispatchEvent(new CustomEvent('gannzilla:page-scrollbar-pan-v305', {
      detail: next,
    }));
  }, []);

  React.useEffect(() => {
    const stopHold = () => {
      if (holdDelayRef.current) window.clearTimeout(holdDelayRef.current);
      if (holdIntervalRef.current) window.clearInterval(holdIntervalRef.current);
      holdDelayRef.current = 0;
      holdIntervalRef.current = 0;
    };

    const onWheelOffset = (event) => {
      const detail = event?.detail || {};
      offsetRef.current = {
        x: Number(detail.x) || 0,
        y: Number(detail.y) || 0,
      };
      setOffsetX(offsetRef.current.x);
    };

    const onPointerMove = (event) => {
      const drag = dragRef.current;
      if (!drag) return;
      event.preventDefault();
      const track = trackRef.current;
      if (!(track instanceof HTMLElement)) return;
      const rect = track.getBoundingClientRect();
      const usable = Math.max(1, rect.width - drag.thumbWidth);
      const left = clamp(event.clientX - rect.left - drag.pointerOffset, 0, usable);
      commitX(offsetFromFraction(left / usable));
    };

    const onPointerUp = () => {
      dragRef.current = null;
      stopHold();
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('cursor');
    };

    const syncInsets = () => setInsets(getPanelInsets());

    window.addEventListener('gannzilla:wheel-pan-offset-v305', onWheelOffset);
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('resize', syncInsets);
    window.addEventListener('gannzilla:layout-panel-visibility-change', syncInsets);
    window.addEventListener('gannzilla:panel-frame-cleanup-sync', syncInsets);
    window.addEventListener('gannzilla:panel-width-v302-sync', syncInsets);

    const observer = new MutationObserver(syncInsets);
    observer.observe(document.body, { childList: true, subtree: true });
    const timers = [0, 80, 220, 520, 1000].map((delay) => window.setTimeout(syncInsets, delay));

    window.GANNZILLA_HORIZONTAL_PAN_ASSIST_V311 = true;
    window.__auditGannzillaHorizontalPanAssistV311 = () => {
      const bar = document.querySelector('[data-gannzilla-horizontal-pan-assist-v311="true"]');
      const rect = bar?.getBoundingClientRect?.();
      return {
        ok: Boolean(bar),
        build: BUILD,
        portalMountedDirectlyUnderBody: Boolean(bar?.parentElement === document.body),
        compactHorizontalBarVisible: Boolean(rect && rect.height >= BAR_HEIGHT_PX && rect.bottom <= window.innerHeight - BAR_BOTTOM_PX + 1),
        verticalBehaviorUntouched: true,
        barHeightPx: BAR_HEIGHT_PX,
        barBottomPx: BAR_BOTTOM_PX,
        thumbWidthPx: THUMB_WIDTH_PX,
        buttonWidthPx: BUTTON_WIDTH_PX,
        movementRangePx: MOVEMENT_RANGE_PX,
        leftRightButtonsEnabled: true,
        pressAndHoldEnabled: true,
        draggableThumbEnabled: true,
        trackClickEnabled: true,
        centerResetByDoubleClick: true,
        panelAwareInsets: getPanelInsets(),
        currentOffsetX: offsetRef.current.x,
        currentOffsetYPreserved: offsetRef.current.y,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      stopHold();
      observer.disconnect();
      window.removeEventListener('gannzilla:wheel-pan-offset-v305', onWheelOffset);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('resize', syncInsets);
      window.removeEventListener('gannzilla:layout-panel-visibility-change', syncInsets);
      window.removeEventListener('gannzilla:panel-frame-cleanup-sync', syncInsets);
      window.removeEventListener('gannzilla:panel-width-v302-sync', syncInsets);
      delete window.GANNZILLA_HORIZONTAL_PAN_ASSIST_V311;
      delete window.__auditGannzillaHorizontalPanAssistV311;
    };
  }, [commitX]);

  const startHold = (direction, event) => {
    event.preventDefault();
    event.stopPropagation();
    const delta = direction === 'left' ? -STEP_PX : STEP_PX;
    commitX(offsetRef.current.x + delta);
    holdDelayRef.current = window.setTimeout(() => {
      holdIntervalRef.current = window.setInterval(() => {
        commitX(offsetRef.current.x + (direction === 'left' ? -HOLD_STEP_PX : HOLD_STEP_PX));
      }, 70);
    }, 340);
  };

  const startDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    const rect = target.getBoundingClientRect();
    dragRef.current = {
      thumbWidth: rect.width,
      pointerOffset: event.clientX - rect.left,
    };
    document.body.style.setProperty('user-select', 'none', 'important');
    document.body.style.setProperty('cursor', 'ew-resize', 'important');
  };

  if (typeof document === 'undefined') return null;

  const fraction = fractionFromOffset(offsetX);

  return createPortal(
    <>
      <style>{`
        [data-gannzilla-page-horizontal-rail-v306="true"],
        [data-gannzilla-scrollbar-corner-v306="true"] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        [data-gannzilla-horizontal-pan-assist-v311="true"] {
          position: fixed !important;
          bottom: ${BAR_BOTTOM_PX}px !important;
          height: ${BAR_HEIGHT_PX}px !important;
          min-height: ${BAR_HEIGHT_PX}px !important;
          max-height: ${BAR_HEIGHT_PX}px !important;
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          transform: none !important;
          filter: none !important;
          z-index: 2147483647 !important;
          pointer-events: auto !important;
        }
      `}</style>

      <div
        data-gannzilla-horizontal-pan-assist-v311="true"
        aria-label="شريط التحكم بحركة العجلة يمينًا ويسارًا"
        style={{
          left: insets.left,
          right: insets.right,
          alignItems: 'stretch',
          background: '#d8d8d8',
          border: '1px solid #777777',
          borderRadius: 0,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.8)',
          overflow: 'hidden',
          boxSizing: 'border-box',
          direction: 'ltr',
        }}
      >
        <button
          type="button"
          aria-label="تحريك العجلة لليسار"
          title="تحريك العجلة لليسار"
          onPointerDown={(event) => startHold('left', event)}
          style={{ width: BUTTON_WIDTH_PX, minWidth: BUTTON_WIDTH_PX, padding: 0, border: 0, borderRight: '1px solid #888888', background: '#eeeeee', color: '#222222', fontSize: 9, lineHeight: 1, cursor: 'pointer' }}
        >◀</button>

        <div
          ref={trackRef}
          onPointerDown={(event) => {
            if (event.target !== event.currentTarget) return;
            const rect = event.currentTarget.getBoundingClientRect();
            commitX(offsetFromFraction((event.clientX - rect.left) / Math.max(1, rect.width)));
          }}
          onDoubleClick={() => commitX(0)}
          title="اسحب المقبض للتحريك — انقر مرتين لإعادة المنتصف"
          style={{
            position: 'relative',
            flex: '1 1 auto',
            minWidth: 60,
            background: '#f4f4f4',
            boxShadow: 'inset 0 0 0 1px #b8b8b8',
          }}
        >
          <div
            data-gannzilla-horizontal-pan-thumb-v311="true"
            onPointerDown={startDrag}
            style={{
              position: 'absolute',
              top: 1,
              bottom: 1,
              left: `calc(${fraction * 100}% - ${fraction * THUMB_WIDTH_PX}px)`,
              width: THUMB_WIDTH_PX,
              borderRadius: 1,
              background: '#686868',
              boxShadow: 'inset 0 0 0 1px #4d4d4d',
              cursor: 'ew-resize',
            }}
          />
        </div>

        <button
          type="button"
          aria-label="تحريك العجلة لليمين"
          title="تحريك العجلة لليمين"
          onPointerDown={(event) => startHold('right', event)}
          style={{ width: BUTTON_WIDTH_PX, minWidth: BUTTON_WIDTH_PX, padding: 0, border: 0, borderLeft: '1px solid #888888', background: '#eeeeee', color: '#222222', fontSize: 9, lineHeight: 1, cursor: 'pointer' }}
        >▶</button>
      </div>
    </>,
    document.body,
  );
}
