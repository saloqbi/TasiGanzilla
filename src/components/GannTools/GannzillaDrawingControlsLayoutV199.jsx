import React from 'react';

const LINE_CONTROL_ID = 'gannzilla-line-control-v185';
const SHAPE_CONTROL_ID = 'gannzilla-shape-control-v185';
const LINE_MENU_ID = 'gannzilla-line-menu-v185';
const SHAPE_MENU_ID = 'gannzilla-shape-menu-v185';
const CONTROL_WIDTH = 38;
const CONTROL_GAP = 8;
const TEXT_GAP = 11;
const MAX_ATTEMPTS = 80;
const RETRY_MS = 100;

function cleanLabel(element) {
  return String(element?.textContent || '').replace(/\s+/g, '').trim();
}

function findTopTextButton(label) {
  return Array.from(document.querySelectorAll('button')).find((button) => {
    const rect = button.getBoundingClientRect();
    return rect.width > 0
      && rect.height > 0
      && rect.top >= 0
      && rect.bottom <= 48
      && cleanLabel(button) === label;
  }) || null;
}

function setImportant(element, property, value) {
  element?.style?.setProperty(property, value, 'important');
}

function requestApply(callback) {
  window.requestAnimationFrame(() => window.requestAnimationFrame(callback));
}

export default function GannzillaDrawingControlsLayoutV199() {
  React.useLayoutEffect(() => {
    let disposed = false;
    let retryTimer = null;
    let attempts = 0;

    const apply = () => {
      if (disposed) return false;

      const line = document.getElementById(LINE_CONTROL_ID);
      const shape = document.getElementById(SHAPE_CONTROL_ID);
      const textButton = findTopTextButton('T');

      if (!line || !shape || !textButton) return false;

      const textRect = textButton.getBoundingClientRect();
      const top = Math.round(textRect.top);
      const height = Math.max(22, Math.round(textRect.height));
      const shapeLeft = Math.round(textRect.left - TEXT_GAP - CONTROL_WIDTH);
      const lineLeft = Math.round(shapeLeft - CONTROL_GAP - CONTROL_WIDTH);

      [line, shape].forEach((control) => {
        setImportant(control, 'transform', 'none');
        setImportant(control, 'width', `${CONTROL_WIDTH}px`);
        setImportant(control, 'min-width', `${CONTROL_WIDTH}px`);
        setImportant(control, 'height', `${height}px`);
        setImportant(control, 'min-height', `${height}px`);
        setImportant(control, 'top', `${top}px`);
        setImportant(control, 'margin', '0');
        setImportant(control, 'overflow', 'hidden');
        setImportant(control, 'pointer-events', 'auto');
        setImportant(control, 'z-index', '2147483647');
      });

      const lineBase = line.getBoundingClientRect();
      const shapeBase = shape.getBoundingClientRect();
      const lineShift = Math.round(lineLeft - lineBase.left);
      const shapeShift = Math.round(shapeLeft - shapeBase.left);

      setImportant(line, 'transform', `translate3d(${lineShift}px, 0, 0)`);
      setImportant(shape, 'transform', `translate3d(${shapeShift}px, 0, 0)`);

      const positionMenu = (menuId, desiredLeft) => {
        const menu = document.getElementById(menuId);
        if (!menu) return;
        setImportant(menu, 'transform', 'none');
        setImportant(menu, 'pointer-events', 'auto');
        setImportant(menu, 'z-index', '2147483647');
        const base = menu.getBoundingClientRect();
        const shift = Math.round(desiredLeft - base.left);
        setImportant(menu, 'transform', `translate3d(${shift}px, 0, 0)`);
      };

      positionMenu(LINE_MENU_ID, lineLeft);
      positionMenu(SHAPE_MENU_ID, shapeLeft);

      window.GANNZILLA_DRAWING_CONTROLS_LAYOUT_V200 = {
        ok: true,
        lineLeft,
        shapeLeft,
        controlGap: CONTROL_GAP,
        textGap: TEXT_GAP,
        width: CONTROL_WIDTH,
        lineShift,
        shapeShift,
      };

      return true;
    };

    const retry = () => {
      if (disposed) return;
      attempts += 1;
      if (apply() || attempts >= MAX_ATTEMPTS) return;
      retryTimer = window.setTimeout(retry, RETRY_MS);
    };

    const refresh = () => requestApply(apply);
    retry();

    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);

    return () => {
      disposed = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      observer.disconnect();
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
    };
  }, []);

  return null;
}
