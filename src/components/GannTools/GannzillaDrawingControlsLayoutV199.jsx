import React from 'react';

const LINE_CONTROL_ID = 'gannzilla-line-control-v185';
const SHAPE_CONTROL_ID = 'gannzilla-shape-control-v185';
const LINE_MENU_ID = 'gannzilla-line-menu-v185';
const SHAPE_MENU_ID = 'gannzilla-shape-menu-v185';
const CONTROL_WIDTH = 38;
const GAP = 7;
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

export default function GannzillaDrawingControlsLayoutV199() {
  React.useLayoutEffect(() => {
    let disposed = false;
    let timer = null;
    let attempts = 0;

    const apply = () => {
      if (disposed) return;
      attempts += 1;

      const line = document.getElementById(LINE_CONTROL_ID);
      const shape = document.getElementById(SHAPE_CONTROL_ID);
      const textButton = findTopTextButton('T');

      if (!line || !shape || !textButton) {
        if (attempts < MAX_ATTEMPTS) timer = window.setTimeout(apply, RETRY_MS);
        return;
      }

      const textRect = textButton.getBoundingClientRect();
      const shapeLeft = Math.round(textRect.left - GAP - CONTROL_WIDTH);
      const lineLeft = Math.round(shapeLeft - GAP - CONTROL_WIDTH);
      const top = Math.round(textRect.top);
      const height = Math.max(22, Math.round(textRect.height));

      [line, shape].forEach((control) => {
        setImportant(control, 'width', `${CONTROL_WIDTH}px`);
        setImportant(control, 'min-width', `${CONTROL_WIDTH}px`);
        setImportant(control, 'height', `${height}px`);
        setImportant(control, 'min-height', `${height}px`);
        setImportant(control, 'top', `${top}px`);
        setImportant(control, 'transform', 'none');
        setImportant(control, 'margin', '0');
        setImportant(control, 'overflow', 'hidden');
      });

      setImportant(shape, 'left', `${shapeLeft}px`);
      setImportant(line, 'left', `${lineLeft}px`);

      const lineMenu = document.getElementById(LINE_MENU_ID);
      const shapeMenu = document.getElementById(SHAPE_MENU_ID);
      if (lineMenu) setImportant(lineMenu, 'left', `${lineLeft}px`);
      if (shapeMenu) setImportant(shapeMenu, 'left', `${shapeLeft}px`);

      window.GANNZILLA_DRAWING_CONTROLS_LAYOUT_V199 = {
        ok: true,
        lineLeft,
        shapeLeft,
        gap: GAP,
        width: CONTROL_WIDTH,
      };

      if (attempts < 25) timer = window.setTimeout(apply, RETRY_MS);
    };

    const refreshSoon = () => {
      attempts = 0;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(apply, 0);
    };

    apply();
    window.addEventListener('resize', refreshSoon);
    window.addEventListener('scroll', refreshSoon, true);
    document.addEventListener('pointerdown', refreshSoon, true);

    return () => {
      disposed = true;
      if (timer) window.clearTimeout(timer);
      window.removeEventListener('resize', refreshSoon);
      window.removeEventListener('scroll', refreshSoon, true);
      document.removeEventListener('pointerdown', refreshSoon, true);
    };
  }, []);

  return null;
}
