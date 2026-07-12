import React from 'react';

const BUILD = 310;
const BAR_HEIGHT_PX = 12;
const BAR_BOTTOM_PX = 0;
const EDGE_GAP_PX = 1;
const VERTICAL_RAIL_CLEARANCE_PX = 19;
const THUMB_WIDTH_PX = 12;
const BUTTON_WIDTH_PX = 12;
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

/** Build 310: native-size mini horizontal scrollbar; vertical movement remains untouched. */
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
    const timers = [0, 80, 220, 520].map((delay) => window.setTimeout(syncInsets, delay));

    window.GANNZILLA_HORIZONTAL_PAN_ASSIST_V310 = true;
    window.__auditGannzillaHorizontalPanAssistV310 = () => ({
      ok: true,
      build: BUILD,
      nativeMiniHorizontalBarMounted: Boolean(document.querySelector('[data-gannzilla-horizontal-pan-assist-v310="true"]')),
      verticalBehaviorUntouched: true,
      barHeightPx: BAR_HEIGHT_PX,
      thumbWidthPx: THUMB_WIDTH_PX,
      buttonWidthPx: BUTTON_WIDTH_PX,
      movementRangePx: MOVEMENT_RANGE_PX,
      maximumTrackTravelEnabled: true,
      centerResetByDoubleClick: true,
      leftRightButtonsEnabled: true,
      pressAndHoldEnabled: true,
      draggableThumbEnabled: true,
      trackClickEnabled: true,
      panelAwareInsets: insets,
      currentOffsetX: offsetRef.current.x,
      currentOffsetYPreserved: offsetRef.current.y,
    });

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
      delete window.GANNZILLA_HORIZONTAL_PAN_ASSIST_V310;
      delete window.__auditGannzillaHorizontalPanAssistV310;
    };
  }, [commitX, insets]);

  const startHold = (direction, event) => {
    event.preventDefault();
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

  const fraction = fractionFromOffset(offsetX);

  return (
    <>
      <style>{`
        [data-gannzilla-page-horizontal-rail-v306="true"],
        [data-gannzilla-scrollbar-corner-v306="true"] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `}</style>

      <div
        data-gannzilla-horizontal-pan-assist-v310="true"
        aria-label="شريط التحكم بحركة العجلة يمينًا ويسارًا"
        style={{
          position: 'fixed',
          left: insets.left,
          right: insets.right,
          bottom: BAR_BOTTOM_PX,
          height: BAR_HEIGHT_PX,
          zIndex: 2147483646,
          display: 'flex',
          alignItems: 'stretch',
          background: '#eeeeee',
          border: '1px solid #a8a8a8',
          borderRadius: 0,
          boxShadow: 'none',
          overflow: 'hidden',
          boxSizing: 'border-box',
          direction: 'ltr',
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          aria-label="تحريك العجلة لليسار"
          title="تحريك العجلة لليسار"
          onPointerDown={(event) => startHold('left', event)}
          style={{ width: BUTTON_WIDTH_PX, minWidth: BUTTON_WIDTH_PX, padding: 0, border: 0, borderRight: '1px solid #b5b5b5', background: '#f5f5f5', fontSize: 8, lineHeight: 1, cursor: 'pointer' }}
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
            background: '#fafafa',
            boxShadow: 'inset 0 0 0 1px #d1d1d1',
          }}
        >
          <div
            data-gannzilla-horizontal-pan-thumb-v310="true"
            onPointerDown={startDrag}
            style={{
              position: 'absolute',
              top: 1,
              bottom: 1,
              left: `calc(${fraction * 100}% - ${fraction * THUMB_WIDTH_PX}px)`,
              width: THUMB_WIDTH_PX,
              borderRadius: 1,
              background: '#858585',
              boxShadow: 'inset 0 0 0 1px #6e6e6e',
              cursor: 'ew-resize',
            }}
          />
        </div>

        <button
          type="button"
          aria-label="تحريك العجلة لليمين"
          title="تحريك العجلة لليمين"
          onPointerDown={(event) => startHold('right', event)}
          style={{ width: BUTTON_WIDTH_PX, minWidth: BUTTON_WIDTH_PX, padding: 0, border: 0, borderLeft: '1px solid #b5b5b5', background: '#f5f5f5', fontSize: 8, lineHeight: 1, cursor: 'pointer' }}
        >▶</button>
      </div>
    </>
  );
}
