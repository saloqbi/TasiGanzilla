import React from 'react';

const BUILD = '162';
const CONTROL_ID = 'gannzilla-wheel-pan-control-v162';
const PANEL_ID = 'gannzilla-wheel-pan-panel-v162';
const PAN_STEP = 120;

function normalizeLabel(element) {
  return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
}

function isTopToolbarRow(element) {
  const rect = element?.getBoundingClientRect?.();
  return Boolean(rect)
    && rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.bottom <= 42;
}

function findZoomMinusButton() {
  return Array.from(document.querySelectorAll('button')).find((button) => {
    if (!isTopToolbarRow(button)) return false;
    const label = normalizeLabel(button);
    if (label !== '-' && label !== '−') return false;
    const percent = button.nextElementSibling;
    return Boolean(percent && /^\d+%$/.test(normalizeLabel(percent)));
  }) || null;
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 300 && rect.height > 300)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function findWheelViewport() {
  const canvas = findWheelCanvas();
  if (!canvas) return null;

  let current = canvas.parentElement;
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const scrollable = ['auto', 'scroll', 'overlay'].includes(style.overflowX)
      || ['auto', 'scroll', 'overlay'].includes(style.overflowY);
    if (scrollable) return current;
    current = current.parentElement;
  }
  return null;
}

function moveWheel(direction) {
  const viewport = findWheelViewport();
  if (!viewport) return false;

  const delta = {
    left: { left: PAN_STEP, top: 0 },
    right: { left: -PAN_STEP, top: 0 },
    up: { left: 0, top: PAN_STEP },
    down: { left: 0, top: -PAN_STEP },
  }[direction];

  if (!delta) return false;
  viewport.scrollBy({ ...delta, behavior: 'smooth' });
  return true;
}

function centerWheel() {
  const viewport = findWheelViewport();
  if (!viewport) return false;

  viewport.scrollTo({
    left: Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2),
    top: Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2),
    behavior: 'smooth',
  });
  return true;
}

function arrowSvg(direction) {
  const path = {
    up: 'M12 4 5 12h4v8h6v-8h4L12 4Z',
    down: 'm12 20 7-8h-4V4H9v8H5l7 8Z',
    left: 'M4 12l8-7v4h8v6h-8v4l-8-7Z',
    right: 'm20 12-8 7v-4H4V9h8V5l8 7Z',
  }[direction];
  return `<svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" style="display:block;pointer-events:none"><path d="${path}" fill="#1c75bc"/></svg>`;
}

function controlSvg() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="display:block;pointer-events:none"><path d="M12 2 9 5h2v4h2V5h2L12 2Z" fill="#1c75bc"/><path d="m12 22 3-3h-2v-4h-2v4H9l3 3Z" fill="#1c75bc"/><path d="M2 12 5 9v2h4v2H5v2l-3-3Z" fill="#1c75bc"/><path d="m22 12-3 3v-2h-4v-2h4V9l3 3Z" fill="#1c75bc"/><circle cx="12" cy="12" r="2" fill="#d9edf9" stroke="#1c75bc"/></svg>';
}

function styleToolbarButton(button) {
  Object.assign(button.style, {
    width: '22px',
    minWidth: '22px',
    height: '21px',
    padding: '0',
    marginRight: '2px',
    border: '1px solid #a7a7a7',
    borderRadius: '2px',
    background: '#f7f7f7',
    color: '#1c75bc',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxSizing: 'border-box',
    visibility: 'visible',
    opacity: '1',
    pointerEvents: 'auto',
    verticalAlign: 'middle',
  });
}

function createPanel(control, language) {
  document.getElementById(PANEL_ID)?.remove();

  const ar = language === 'ar';
  const labels = ar
    ? { up: 'أعلى', down: 'أسفل', left: 'يسار', right: 'يمين', center: 'توسيط العجلة' }
    : { up: 'Up', down: 'Down', left: 'Left', right: 'Right', center: 'Center wheel' };

  const rect = control.getBoundingClientRect();
  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', ar ? 'تحريك العجلة' : 'Move wheel');
  Object.assign(panel.style, {
    position: 'fixed',
    left: `${Math.max(4, Math.round(rect.left + rect.width / 2 - 55))}px`,
    top: `${Math.round(rect.bottom + 4)}px`,
    width: '110px',
    height: '110px',
    zIndex: '2147483647',
    display: 'grid',
    gridTemplateColumns: '34px 34px 34px',
    gridTemplateRows: '34px 34px 34px',
    gap: '2px',
    padding: '4px',
    border: '1px solid #8e9aa5',
    borderRadius: '3px',
    background: '#eef1f3',
    boxShadow: '0 4px 12px rgba(0,0,0,.22)',
    boxSizing: 'border-box',
  });

  const makeButton = (title, html, onClick, column, row) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.title = title;
    button.setAttribute('aria-label', title);
    button.innerHTML = html;
    Object.assign(button.style, {
      gridColumn: String(column),
      gridRow: String(row),
      width: '34px',
      height: '34px',
      padding: '0',
      border: '1px solid #a5afb8',
      borderRadius: '2px',
      background: 'linear-gradient(#ffffff,#e3e7ea)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxSizing: 'border-box',
    });
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });
    panel.appendChild(button);
  };

  makeButton(labels.up, arrowSvg('up'), () => moveWheel('up'), 2, 1);
  makeButton(labels.left, arrowSvg('left'), () => moveWheel('left'), 1, 2);
  makeButton(labels.center, '<span style="width:12px;height:12px;border:2px solid #1c75bc;border-radius:50%;display:block;box-sizing:border-box"></span>', centerWheel, 2, 2);
  makeButton(labels.right, arrowSvg('right'), () => moveWheel('right'), 3, 2);
  makeButton(labels.down, arrowSvg('down'), () => moveWheel('down'), 2, 3);

  document.body.appendChild(panel);
  return panel;
}

export default function GannzillaWheelPanControlV162() {
  React.useEffect(() => {
    let disposed = false;
    let outsideHandler = null;

    const closePanel = () => {
      document.getElementById(PANEL_ID)?.remove();
      if (outsideHandler) {
        document.removeEventListener('pointerdown', outsideHandler, true);
        outsideHandler = null;
      }
    };

    const install = () => {
      if (disposed) return;
      const zoomMinus = findZoomMinusButton();
      const parent = zoomMinus?.parentElement;
      if (!zoomMinus || !parent) return;

      let control = document.getElementById(CONTROL_ID);
      if (!control) {
        control = document.createElement('button');
        control.id = CONTROL_ID;
        control.type = 'button';
        control.innerHTML = controlSvg();
      }

      const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      const title = language === 'ar' ? 'تحريك العجلة' : 'Move wheel';
      control.title = title;
      control.setAttribute('aria-label', title);
      styleToolbarButton(control);

      control.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const existing = document.getElementById(PANEL_ID);
        if (existing) {
          closePanel();
          return;
        }
        const panel = createPanel(control, language);
        outsideHandler = (outsideEvent) => {
          const target = outsideEvent.target instanceof Element ? outsideEvent.target : null;
          if (target?.closest(`#${CONTROL_ID}, #${PANEL_ID}`)) return;
          panel.remove();
          if (outsideHandler) {
            document.removeEventListener('pointerdown', outsideHandler, true);
            outsideHandler = null;
          }
        };
        document.addEventListener('pointerdown', outsideHandler, true);
      };

      if (control.parentElement !== parent || control.nextSibling !== zoomMinus) {
        parent.insertBefore(control, zoomMinus);
      }
    };

    install();
    const observer = new MutationObserver(install);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    const languageObserver = new MutationObserver(install);
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    const timer = window.setInterval(install, 100);
    window.addEventListener('resize', install);

    window.GANNZILLA_WHEEL_PAN_CONTROL_V162 = true;
    window.__auditGannzillaWheelPanControlV162 = () => {
      const control = document.getElementById(CONTROL_ID);
      const style = control ? window.getComputedStyle(control) : null;
      return {
        ok: Boolean(control)
          && style?.display !== 'none'
          && style?.visibility !== 'hidden'
          && style?.pointerEvents !== 'none'
          && control.nextElementSibling === findZoomMinusButton(),
        build: BUILD,
        visible: Boolean(control),
        insertedImmediatelyBeforeZoomMinus: control?.nextElementSibling === findZoomMinusButton(),
        panelOpen: Boolean(document.getElementById(PANEL_ID)),
        wheelViewportFound: Boolean(findWheelViewport()),
      };
    };

    return () => {
      disposed = true;
      observer.disconnect();
      languageObserver.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', install);
      closePanel();
      document.getElementById(CONTROL_ID)?.remove();
    };
  }, []);

  return null;
}
