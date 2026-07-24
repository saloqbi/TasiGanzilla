const BUILD = 461;
const MENU_ID = 'gannzilla-shapes-menu-v460';
const TRIGGER_ID = 'gannzilla-shapes-menu-trigger-v460';
const STYLE_ID = 'gannzilla-shapes-menu-large-style-v461';
const STATE_KEY = '__gannzillaShapesMenuLargeV461';

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  const value = String(query.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function settings() {
  return {
    width: Math.round(numberParam('shapesMenuWidth', 380, 300, 560)),
    rowHeight: Math.round(numberParam('shapesMenuRowHeight', 56, 44, 82)),
    fontSize: Math.round(numberParam('shapesMenuFontSize', 20, 16, 30)),
    iconSize: Math.round(numberParam('shapesMenuIconSize', 38, 30, 56)),
    titleHeight: Math.round(numberParam('shapesMenuTitleHeight', 48, 38, 68)),
    titleFontSize: Math.round(numberParam('shapesMenuTitleFontSize', 20, 16, 28)),
    scrollbarWidth: Math.round(numberParam('shapesMenuScrollbarWidth', 18, 13, 24)),
  };
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  const {
    width,
    rowHeight,
    fontSize,
    iconSize,
    titleHeight,
    titleFontSize,
    scrollbarWidth,
  } = settings();
  const iconColumn = Math.max(iconSize + 14, 54);
  const labelPadding = Math.max(14, Math.round(fontSize * 0.75));

  style.textContent = `
    #${MENU_ID} {
      width: ${width}px !important;
      min-width: ${width}px !important;
      max-width: ${width}px !important;
      border-radius: 4px !important;
      box-shadow: 0 9px 28px rgba(0,0,0,.30) !important;
    }

    #${MENU_ID} .gz460-title {
      height: ${titleHeight}px !important;
      min-height: ${titleHeight}px !important;
      padding: 0 16px !important;
      font-size: ${titleFontSize}px !important;
      line-height: ${titleHeight}px !important;
      font-weight: 700 !important;
    }

    #${MENU_ID} .gz460-list {
      max-height: calc(100vh - ${titleHeight + 50}px) !important;
      scrollbar-width: auto !important;
    }

    #${MENU_ID} .gz460-list::-webkit-scrollbar {
      width: ${scrollbarWidth}px !important;
    }

    #${MENU_ID} .gz460-list::-webkit-scrollbar-thumb {
      border-width: 3px !important;
      border-radius: ${Math.max(8, Math.round(scrollbarWidth / 2))}px !important;
    }

    #${MENU_ID} .gz460-item {
      height: ${rowHeight}px !important;
      min-height: ${rowHeight}px !important;
      grid-template-columns: ${iconColumn}px minmax(0, 1fr) !important;
      gap: 12px !important;
      padding: 0 ${labelPadding}px 0 12px !important;
      border: 1px solid #e4e7eb !important;
      border-top: 0 !important;
      background: #ffffff !important;
      font-size: ${fontSize}px !important;
      font-weight: 600 !important;
      line-height: 1.25 !important;
    }

    #${MENU_ID} .gz460-item:first-child {
      border-top: 1px solid #e4e7eb !important;
      border-radius: 4px 4px 0 0 !important;
    }

    #${MENU_ID} .gz460-item:last-child {
      border-radius: 0 0 4px 4px !important;
    }

    #${MENU_ID} .gz460-item:hover {
      background: #eef5ff !important;
    }

    #${MENU_ID} .gz460-item[data-selected="true"] {
      background: #176bd4 !important;
      color: #ffffff !important;
    }

    #${MENU_ID} .gz460-item-icon {
      width: ${iconColumn}px !important;
      height: ${rowHeight}px !important;
    }

    #${MENU_ID} .gz460-item-icon svg {
      width: ${iconSize}px !important;
      height: ${iconSize}px !important;
      filter: drop-shadow(0 1px 1px rgba(0,0,0,.14)) !important;
    }

    #${MENU_ID} .gz460-item-label {
      font-size: ${fontSize}px !important;
      line-height: 1.25 !important;
      overflow: visible !important;
      text-overflow: clip !important;
    }
  `;
}

function positionMenu() {
  const trigger = document.getElementById(TRIGGER_ID);
  const menu = document.getElementById(MENU_ID);
  if (!(trigger instanceof HTMLElement) || !(menu instanceof HTMLElement) || menu.hidden) return false;

  const { width, titleHeight } = settings();
  const rect = trigger.getBoundingClientRect();
  const viewportPadding = 8;
  const preferredLeft = Math.round(rect.left);
  const left = Math.max(
    viewportPadding,
    Math.min(window.innerWidth - width - viewportPadding, preferredLeft),
  );
  const top = Math.max(36, Math.round(rect.bottom + 4));
  const maxHeight = Math.max(titleHeight + 120, window.innerHeight - top - viewportPadding);

  menu.style.setProperty('left', `${left}px`, 'important');
  menu.style.setProperty('top', `${top}px`, 'important');
  menu.style.setProperty('width', `${width}px`, 'important');
  menu.style.setProperty('min-width', `${width}px`, 'important');
  menu.style.setProperty('max-width', `${width}px`, 'important');
  menu.style.setProperty('max-height', `${maxHeight}px`, 'important');
  menu.style.removeProperty('right');
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('largeShapesMenu', true) || window[STATE_KEY]) return;

  installStyle();
  let frame = 0;
  let menuObserver = null;
  let triggerObserver = null;
  let observedMenu = null;
  let observedTrigger = null;

  const schedule = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      installStyle();
      positionMenu();

      const menu = document.getElementById(MENU_ID);
      if (menu instanceof HTMLElement && menu !== observedMenu && typeof MutationObserver === 'function') {
        menuObserver?.disconnect();
        observedMenu = menu;
        menuObserver = new MutationObserver(() => {
          installStyle();
          positionMenu();
        });
        menuObserver.observe(menu, { attributes: true, attributeFilter: ['hidden', 'style', 'class'] });
      }

      const trigger = document.getElementById(TRIGGER_ID);
      if (trigger instanceof HTMLElement && trigger !== observedTrigger && typeof ResizeObserver === 'function') {
        triggerObserver?.disconnect();
        observedTrigger = trigger;
        triggerObserver = new ResizeObserver(positionMenu);
        triggerObserver.observe(trigger);
      }
    });
  };

  schedule();
  const timers = [50, 150, 400, 900, 1800, 3500].map((delay) => window.setTimeout(schedule, delay));
  const onViewportChange = () => schedule();
  const onTriggerClick = (event) => {
    const trigger = event.target instanceof Element ? event.target.closest(`#${TRIGGER_ID}`) : null;
    if (!trigger) return;
    window.requestAnimationFrame(positionMenu);
    window.setTimeout(positionMenu, 30);
  };

  document.addEventListener('click', onTriggerClick, true);
  document.addEventListener('fullscreenchange', onViewportChange);
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('scroll', onViewportChange, true);

  window.GANNZILLA_SHAPES_MENU_LARGE_V461 = true;
  window.__auditGannzillaShapesMenuLargeV461 = () => {
    const menu = document.getElementById(MENU_ID);
    const firstRow = menu?.querySelector('.gz460-item');
    const icon = firstRow?.querySelector('.gz460-item-icon svg');
    const configured = settings();
    const rect = menu?.getBoundingClientRect();
    return {
      ok: Boolean(menu && rect?.width >= configured.width - 1),
      build: BUILD,
      enabled: boolParam('largeShapesMenu', true),
      configured,
      actualMenuWidth: rect ? Math.round(rect.width) : null,
      actualRowHeight: firstRow ? Math.round(firstRow.getBoundingClientRect().height) : null,
      actualFontSize: firstRow ? parseFloat(window.getComputedStyle(firstRow).fontSize) : null,
      actualIconSize: icon ? Math.round(icon.getBoundingClientRect().width) : null,
      scopedObserversOnly: true,
    };
  };

  window[STATE_KEY] = {
    timers,
    get menuObserver() { return menuObserver; },
    get triggerObserver() { return triggerObserver; },
    onViewportChange,
    onTriggerClick,
  };
}

install();