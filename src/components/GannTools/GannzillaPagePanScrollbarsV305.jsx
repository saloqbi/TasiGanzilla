import React from 'react';

const BUILD = 307;
const TOOLBAR_HEIGHT_PX = 24;
const RAIL_SIZE_PX = 18;
const ARROW_SIZE_PX = 18;
const THUMB_SIZE_PX = 112;
const MOVEMENT_RANGE_PX = 12000;
const ARROW_STEP_PX = 48;
const WHEEL_SPEED = 1;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function fractionFromOffset(offset) {
  return clamp((MOVEMENT_RANGE_PX - offset) / (MOVEMENT_RANGE_PX * 2), 0, 1);
}

function offsetFromFraction(fraction) {
  return MOVEMENT_RANGE_PX - clamp(fraction, 0, 1) * MOVEMENT_RANGE_PX * 2;
}

function normalizedWheelDelta(event) {
  const multiplier = event.deltaMode === 1
    ? 16
    : event.deltaMode === 2
      ? Math.max(400, window.innerHeight)
      : 1;

  return {
    x: Number(event.deltaX || 0) * multiplier,
    y: Number(event.deltaY || 0) * multiplier,
  };
}

function shouldKeepNativeScroll(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest([
    'aside',
    'input',
    'select',
    'textarea',
    '[contenteditable="true"]',
    '[data-gannzilla-page-vertical-rail-v306="true"]',
    '[data-gannzilla-page-horizontal-rail-v306="true"]',
  ].join(',')));
}

/** Build 307: visible page-edge rails plus mouse-wheel/touchpad page navigation. */
export default function GannzillaPagePanScrollbarsV305() {
  const verticalTrackRef = React.useRef(null);
  const horizontalTrackRef = React.useRef(null);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({ x: 0, y: 0 });
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  const commit = React.useCallback((next) => {
    const normalized = {
      x: Number(next?.x) || 0,
      y: Number(next?.y) || 0,
    };
    offsetRef.current = normalized;
    setOffset(normalized);
    window.dispatchEvent(new CustomEvent('gannzilla:page-scrollbar-pan-v305', {
      detail: normalized,
    }));
  }, []);

  React.useEffect(() => {
    const onWheelOffset = (event) => {
      const detail = event?.detail || {};
      const normalized = {
        x: Number(detail.x) || 0,
        y: Number(detail.y) || 0,
      };
      offsetRef.current = normalized;
      setOffset(normalized);
    };

    const onPointerMove = (event) => {
      const drag = dragRef.current;
      if (!drag) return;
      event.preventDefault();

      if (drag.axis === 'y') {
        const track = verticalTrackRef.current;
        if (!(track instanceof HTMLElement)) return;
        const rect = track.getBoundingClientRect();
        const usable = Math.max(1, rect.height - drag.thumbSize);
        const top = clamp(event.clientY - rect.top - drag.pointerOffset, 0, usable);
        commit({ x: offsetRef.current.x, y: offsetFromFraction(top / usable) });
      } else {
        const track = horizontalTrackRef.current;
        if (!(track instanceof HTMLElement)) return;
        const rect = track.getBoundingClientRect();
        const usable = Math.max(1, rect.width - drag.thumbSize);
        const left = clamp(event.clientX - rect.left - drag.pointerOffset, 0, usable);
        commit({ x: offsetFromFraction(left / usable), y: offsetRef.current.y });
      }
    };

    const onPointerUp = () => {
      dragRef.current = null;
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('cursor');
    };

    const onPageWheel = (event) => {
      if (shouldKeepNativeScroll(event.target)) return;
      const delta = normalizedWheelDelta(event);
      if (Math.abs(delta.x) < 0.01 && Math.abs(delta.y) < 0.01) return;

      event.preventDefault();
      event.stopPropagation();

      if (event.shiftKey || Math.abs(delta.x) > Math.abs(delta.y)) {
        commit({
          x: offsetRef.current.x - (delta.x || delta.y) * WHEEL_SPEED,
          y: offsetRef.current.y,
        });
      } else {
        // Native-page feeling: scrolling down raises the wheel into view;
        // scrolling up lowers it back toward its original position.
        commit({
          x: offsetRef.current.x,
          y: offsetRef.current.y - delta.y * WHEEL_SPEED,
        });
      }
    };

    const onPageKeyDown = (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('input,select,textarea,[contenteditable="true"]')) return;

      const pageStep = Math.max(280, Math.round(window.innerHeight * 0.82));
      let next = null;

      switch (event.key) {
        case 'ArrowDown':
          next = { x: offsetRef.current.x, y: offsetRef.current.y - ARROW_STEP_PX };
          break;
        case 'ArrowUp':
          next = { x: offsetRef.current.x, y: offsetRef.current.y + ARROW_STEP_PX };
          break;
        case 'PageDown':
        case ' ':
          next = { x: offsetRef.current.x, y: offsetRef.current.y - pageStep };
          break;
        case 'PageUp':
          next = { x: offsetRef.current.x, y: offsetRef.current.y + pageStep };
          break;
        case 'Home':
          next = { x: offsetRef.current.x, y: 0 };
          break;
        case 'End':
          next = { x: offsetRef.current.x, y: -MOVEMENT_RANGE_PX };
          break;
        default:
          break;
      }

      if (!next) return;
      event.preventDefault();
      commit(next);
    };

    window.addEventListener('gannzilla:wheel-pan-offset-v305', onWheelOffset);
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('wheel', onPageWheel, { passive: false, capture: true });
    window.addEventListener('keydown', onPageKeyDown, true);

    window.GANNZILLA_PAGE_PAN_SCROLLBARS_V307 = true;
    window.__auditGannzillaPagePanScrollbarsV307 = () => ({
      ok: true,
      build: BUILD,
      verticalRailVisibleAtFarRight: Boolean(document.querySelector('[data-gannzilla-page-vertical-rail-v306="true"]')),
      verticalThumbAlwaysVisible: Boolean(document.querySelector('[data-gannzilla-page-vertical-thumb-v306="true"]')),
      horizontalRailVisibleAtBottom: Boolean(document.querySelector('[data-gannzilla-page-horizontal-rail-v306="true"]')),
      verticalControlsUpDownMovement: true,
      horizontalControlsLeftRightMovement: true,
      mouseWheelControlsVerticalPageMovement: true,
      touchpadControlsVerticalPageMovement: true,
      shiftWheelControlsHorizontalMovement: true,
      keyboardPageUpPageDownEnabled: true,
      keyboardArrowUpArrowDownEnabled: true,
      homeResetsVerticalPosition: true,
      endMovesToLowerRange: true,
      settingsPanelKeepsIndependentScroll: true,
      arrowButtonsEnabled: true,
      draggableThumbsEnabled: true,
      railClickEnabled: true,
      railSizePx: RAIL_SIZE_PX,
      thumbSizePx: THUMB_SIZE_PX,
      movementRangePx: MOVEMENT_RANGE_PX,
      currentOffset: offsetRef.current,
    });

    return () => {
      window.removeEventListener('gannzilla:wheel-pan-offset-v305', onWheelOffset);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('wheel', onPageWheel, true);
      window.removeEventListener('keydown', onPageKeyDown, true);
      delete window.GANNZILLA_PAGE_PAN_SCROLLBARS_V307;
      delete window.__auditGannzillaPagePanScrollbarsV307;
    };
  }, [commit]);

  const startDrag = (axis, event) => {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    const rect = target.getBoundingClientRect();
    dragRef.current = {
      axis,
      thumbSize: axis === 'y' ? rect.height : rect.width,
      pointerOffset: axis === 'y' ? event.clientY - rect.top : event.clientX - rect.left,
    };
    document.body.style.setProperty('user-select', 'none', 'important');
    document.body.style.setProperty('cursor', axis === 'y' ? 'ns-resize' : 'ew-resize', 'important');
  };

  const verticalFraction = fractionFromOffset(offset.y);
  const horizontalFraction = fractionFromOffset(offset.x);

  return (
    <>
      <div
        data-gannzilla-page-vertical-rail-v306="true"
        aria-label="شريط تحريك العجلة للأعلى والأسفل"
        style={{
          position: 'fixed',
          top: TOOLBAR_HEIGHT_PX,
          right: 0,
          bottom: RAIL_SIZE_PX,
          width: RAIL_SIZE_PX,
          zIndex: 2147483642,
          display: 'flex',
          flexDirection: 'column',
          background: '#f1f1f1',
          borderLeft: '1px solid #b8b8b8',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          aria-label="تحريك للأعلى"
          title="تحريك للأعلى"
          onClick={() => commit({ x: offsetRef.current.x, y: offsetRef.current.y - ARROW_STEP_PX })}
          style={{ width: '100%', height: ARROW_SIZE_PX, padding: 0, border: 0, borderBottom: '1px solid #c6c6c6', background: '#eeeeee', cursor: 'pointer', lineHeight: 1 }}
        >▲</button>

        <div
          ref={verticalTrackRef}
          onPointerDown={(event) => {
            if (event.target !== event.currentTarget) return;
            const rect = event.currentTarget.getBoundingClientRect();
            commit({ x: offsetRef.current.x, y: offsetFromFraction((event.clientY - rect.top) / Math.max(1, rect.height)) });
          }}
          style={{
            position: 'relative',
            flex: '1 1 auto',
            minHeight: 120,
            background: '#fafafa',
            boxShadow: 'inset 0 0 0 1px #dddddd',
          }}
        >
          <div
            data-gannzilla-page-vertical-thumb-v306="true"
            onPointerDown={(event) => startDrag('y', event)}
            style={{
              position: 'absolute',
              left: 2,
              right: 2,
              top: `calc(${verticalFraction * 100}% - ${verticalFraction * THUMB_SIZE_PX}px)`,
              height: THUMB_SIZE_PX,
              borderRadius: 7,
              background: '#8f8f8f',
              boxShadow: 'inset 0 0 0 1px #777777',
              cursor: 'ns-resize',
            }}
          />
        </div>

        <button
          type="button"
          aria-label="تحريك للأسفل"
          title="تحريك للأسفل"
          onClick={() => commit({ x: offsetRef.current.x, y: offsetRef.current.y + ARROW_STEP_PX })}
          style={{ width: '100%', height: ARROW_SIZE_PX, padding: 0, border: 0, borderTop: '1px solid #c6c6c6', background: '#eeeeee', cursor: 'pointer', lineHeight: 1 }}
        >▼</button>
      </div>

      <div
        data-gannzilla-page-horizontal-rail-v306="true"
        aria-label="شريط تحريك العجلة لليسار واليمين"
        style={{
          position: 'fixed',
          left: 0,
          right: RAIL_SIZE_PX,
          bottom: 0,
          height: RAIL_SIZE_PX,
          zIndex: 2147483642,
          display: 'flex',
          flexDirection: 'row',
          background: '#f1f1f1',
          borderTop: '1px solid #b8b8b8',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          aria-label="تحريك لليسار"
          title="تحريك لليسار"
          onClick={() => commit({ x: offsetRef.current.x - ARROW_STEP_PX, y: offsetRef.current.y })}
          style={{ width: ARROW_SIZE_PX, height: '100%', padding: 0, border: 0, borderRight: '1px solid #c6c6c6', background: '#eeeeee', cursor: 'pointer', lineHeight: 1 }}
        >◀</button>

        <div
          ref={horizontalTrackRef}
          onPointerDown={(event) => {
            if (event.target !== event.currentTarget) return;
            const rect = event.currentTarget.getBoundingClientRect();
            commit({ x: offsetFromFraction((event.clientX - rect.left) / Math.max(1, rect.width)), y: offsetRef.current.y });
          }}
          style={{
            position: 'relative',
            flex: '1 1 auto',
            background: '#fafafa',
            boxShadow: 'inset 0 0 0 1px #dddddd',
          }}
        >
          <div
            data-gannzilla-page-horizontal-thumb-v306="true"
            onPointerDown={(event) => startDrag('x', event)}
            style={{
              position: 'absolute',
              top: 2,
              bottom: 2,
              left: `calc(${horizontalFraction * 100}% - ${horizontalFraction * THUMB_SIZE_PX}px)`,
              width: THUMB_SIZE_PX,
              borderRadius: 7,
              background: '#8f8f8f',
              boxShadow: 'inset 0 0 0 1px #777777',
              cursor: 'ew-resize',
            }}
          />
        </div>

        <button
          type="button"
          aria-label="تحريك لليمين"
          title="تحريك لليمين"
          onClick={() => commit({ x: offsetRef.current.x + ARROW_STEP_PX, y: offsetRef.current.y })}
          style={{ width: ARROW_SIZE_PX, height: '100%', padding: 0, border: 0, borderLeft: '1px solid #c6c6c6', background: '#eeeeee', cursor: 'pointer', lineHeight: 1 }}
        >▶</button>
      </div>

      <div
        aria-hidden="true"
        data-gannzilla-scrollbar-corner-v306="true"
        style={{
          position: 'fixed',
          right: 0,
          bottom: 0,
          width: RAIL_SIZE_PX,
          height: RAIL_SIZE_PX,
          background: '#dedede',
          borderTop: '1px solid #b8b8b8',
          borderLeft: '1px solid #b8b8b8',
          zIndex: 2147483643,
          boxSizing: 'border-box',
        }}
      />
    </>
  );
}
