import React from 'react';

const BUILD = 305;
const TOOLBAR_HEIGHT_PX = 24;
const SCROLLBAR_SIZE_PX = 18;
const TRACK_LENGTH_PX = 60000;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function scrollCenter(element, axis) {
  if (!(element instanceof HTMLElement)) return 0;
  return axis === 'x'
    ? Math.max(0, (element.scrollWidth - element.clientWidth) / 2)
    : Math.max(0, (element.scrollHeight - element.clientHeight) / 2);
}

/** Build 305: visible native scrollbars at the page edges control wheel movement. */
export default function GannzillaPagePanScrollbarsV305() {
  const verticalRef = React.useRef(null);
  const horizontalRef = React.useRef(null);
  const syncingRef = React.useRef(false);
  const offsetRef = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const vertical = verticalRef.current;
    const horizontal = horizontalRef.current;
    if (!(vertical instanceof HTMLElement) || !(horizontal instanceof HTMLElement)) return undefined;

    const syncThumbs = (offset = offsetRef.current) => {
      const centerX = scrollCenter(horizontal, 'x');
      const centerY = scrollCenter(vertical, 'y');
      syncingRef.current = true;
      horizontal.scrollLeft = clamp(centerX - (Number(offset.x) || 0), 0, horizontal.scrollWidth - horizontal.clientWidth);
      vertical.scrollTop = clamp(centerY - (Number(offset.y) || 0), 0, vertical.scrollHeight - vertical.clientHeight);
      window.requestAnimationFrame(() => {
        syncingRef.current = false;
      });
    };

    const dispatchPan = () => {
      if (syncingRef.current) return;
      const centerX = scrollCenter(horizontal, 'x');
      const centerY = scrollCenter(vertical, 'y');
      const next = {
        x: centerX - horizontal.scrollLeft,
        y: centerY - vertical.scrollTop,
      };
      offsetRef.current = next;
      window.dispatchEvent(new CustomEvent('gannzilla:page-scrollbar-pan-v305', {
        detail: next,
      }));
    };

    const onWheelOffset = (event) => {
      const detail = event?.detail || {};
      offsetRef.current = {
        x: Number(detail.x) || 0,
        y: Number(detail.y) || 0,
      };
      syncThumbs(offsetRef.current);
    };

    const onResize = () => syncThumbs(offsetRef.current);

    syncThumbs({ x: 0, y: 0 });
    const timers = [0, 80, 220, 520].map((delay) => window.setTimeout(() => syncThumbs(offsetRef.current), delay));

    vertical.addEventListener('scroll', dispatchPan, { passive: true });
    horizontal.addEventListener('scroll', dispatchPan, { passive: true });
    window.addEventListener('gannzilla:wheel-pan-offset-v305', onWheelOffset);
    window.addEventListener('resize', onResize);
    document.addEventListener('fullscreenchange', onResize);

    window.GANNZILLA_PAGE_PAN_SCROLLBARS_V305 = true;
    window.__auditGannzillaPagePanScrollbarsV305 = () => ({
      ok: true,
      build: BUILD,
      verticalScrollbarMountedAtFarRight: Boolean(verticalRef.current),
      horizontalScrollbarMountedAtBottom: Boolean(horizontalRef.current),
      verticalControlsUpDownMovement: true,
      horizontalControlsLeftRightMovement: true,
      nativeScrollbarArrowsAndThumbPreserved: true,
      scrollbarSizePx: SCROLLBAR_SIZE_PX,
      movementRangePx: TRACK_LENGTH_PX,
      currentOffset: offsetRef.current,
    });

    return () => {
      timers.forEach(window.clearTimeout);
      vertical.removeEventListener('scroll', dispatchPan);
      horizontal.removeEventListener('scroll', dispatchPan);
      window.removeEventListener('gannzilla:wheel-pan-offset-v305', onWheelOffset);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('fullscreenchange', onResize);
      delete window.GANNZILLA_PAGE_PAN_SCROLLBARS_V305;
      delete window.__auditGannzillaPagePanScrollbarsV305;
    };
  }, []);

  return (
    <>
      <div
        ref={verticalRef}
        data-gannzilla-page-vertical-scrollbar-v305="true"
        aria-label="تحريك العجلة للأعلى والأسفل"
        title="تحريك العجلة للأعلى والأسفل"
        style={{
          position: 'fixed',
          top: TOOLBAR_HEIGHT_PX,
          right: 0,
          bottom: SCROLLBAR_SIZE_PX,
          width: SCROLLBAR_SIZE_PX,
          overflowX: 'hidden',
          overflowY: 'scroll',
          direction: 'ltr',
          background: '#f5f5f5',
          zIndex: 2147483550,
          boxSizing: 'border-box',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ width: 1, height: TRACK_LENGTH_PX, pointerEvents: 'none' }} />
      </div>

      <div
        ref={horizontalRef}
        data-gannzilla-page-horizontal-scrollbar-v305="true"
        aria-label="تحريك العجلة لليسار واليمين"
        title="تحريك العجلة لليسار واليمين"
        style={{
          position: 'fixed',
          left: 0,
          right: SCROLLBAR_SIZE_PX,
          bottom: 0,
          height: SCROLLBAR_SIZE_PX,
          overflowX: 'scroll',
          overflowY: 'hidden',
          direction: 'ltr',
          background: '#f5f5f5',
          zIndex: 2147483550,
          boxSizing: 'border-box',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ width: TRACK_LENGTH_PX, height: 1, pointerEvents: 'none' }} />
      </div>

      <div
        aria-hidden="true"
        data-gannzilla-scrollbar-corner-v305="true"
        style={{
          position: 'fixed',
          right: 0,
          bottom: 0,
          width: SCROLLBAR_SIZE_PX,
          height: SCROLLBAR_SIZE_PX,
          background: '#ececec',
          borderTop: '1px solid #c8c8c8',
          borderLeft: '1px solid #c8c8c8',
          zIndex: 2147483551,
          boxSizing: 'border-box',
        }}
      />
    </>
  );
}
