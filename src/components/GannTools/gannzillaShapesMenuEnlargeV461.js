const BUILD = 461;
const MENU_ID = 'gannzilla-shapes-menu-v460';
const TRIGGER_ID = 'gannzilla-shapes-menu-trigger-v460';
const STYLE_ID = 'gannzilla-shapes-menu-enlarge-style-v461';
const STATE_KEY = '__gannzillaShapesMenuEnlargeV461';

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
    width: Math.round(numberParam('shapesMenuWidth', 420, 320, 620)),
    titleHeight: Math.round(numberParam('shapesMenuTitleHeight', 58, 42, 88)),
    titleFont: Math.round(numberParam('shapesMenuTitleFontSize', 26, 18, 38)),
    rowHeight: Math.round(numberParam('shapesMenuRowHeight', 72, 48, 96)),
    rowFont: Math.round(numberParam('shapesMenuFontSize', 28, 18, 38)),
    iconBox: Math.round(numberParam('shapesMenuIconBoxSize', 56, 36, 76)),
    iconSize: Math.round(numberParam('shapesMenuIconSize', 48, 30, 68)),
    scrollbar: Math.round(numberParam('shapesMenuScrollbarWidth', 20, 12, 28)),
  };
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  const { width, titleHeight, titleFont, rowHeight, rowFont, iconBox, iconSize, scrollbar } = settings();
  style.textContent = `
    #${MENU_ID} {
      width: min(${width}px, calc(100vw - 12px)) !important;
      min-width: min(${width}px, calc(100vw - 12px)) !important;
      max-width: min(${width}px, calc(100vw - 12px)) !important;
      max-height: calc(100vh - 46px) !important;
    }

    #${MENU_ID} .gz460-title {
      height: ${titleHeight}px !important;
      min-height: ${titleHeight}px !important;
      padding: 0 16px !important;
      font-size: ${titleFont}px !important;
      font-weight: 700 !important;
      line-height: ${titleHeight}px !important;
    }

    #${MENU_ID} .gz460-list {
      max-height: calc(100vh - ${titleHeight + 48}px) !important;
      scrollbar-width: auto !important;
    }

    #${MENU_ID} .gz460-list::-webkit-scrollbar {
      width: ${scrollbar}px !important;
    }

    #${MENU_ID} .gz460-list::-webkit-scrollbar-thumb {
      border-width: 3px !important;
    }

    #${MENU_ID} .gz460-item {
      height: ${rowHeight}px !important;
      min-height: ${rowHeight}px !important;
      grid-template-columns: ${iconBox}px minmax(0, 1fr) !important;
      gap: 14px !important;
      padding: 0 18px 0 12px !important;
      font-size: ${rowFont}px !important;
      font-weight: 600 !important;
      line-height: 1.18 !important;
    }

    #${MENU_ID} .gz460-item-icon {
      width: ${iconBox}px !important;
      min-width: ${iconBox}px !important;
      height: ${iconBox}px !important;
      min-height: ${iconBox}px !important;
    }

    #${MENU_ID} .gz460-item-icon svg {
      width: ${iconSize}px !important;
      height: ${iconSize}px !important;
    }

    #${MENU_ID} .gz460-item-label {
      font-size: ${rowFont}px !important;
      font-weight: 600 !important;
      line-height: 1.18 !important;
      text-overflow: clip !important;
    }
  `;
}

function positionMenu() {
  const menu = document.getElementById(MENU_ID);
  const trigger = document.getElementById(TRIGGER_ID);
  if (!(menu instanceof HTMLElement) || !(trigger instanceof HTMLElement) || menu.hidden) return false;

  const { width, titleHeight } = settings();
  const triggerRect = trigger.getBoundingClientRect();
  const actualWidth = Math.min(width, Math.max(220, window.innerWidth - 12));
  const left = Math.max(6, Math.min(window.innerWidth - actualWidth - 6, Math.round(triggerRect.left)));
  const top = Math.max(36, Math.round(triggerRect.bottom + 3));
  const availableHeight = Math.max(180, window.innerHeight - top - 8);

  menu.style.setProperty('left', `${left}px`, 'important');
  menu.style.setProperty('top', `${top}px`, 'important');
  menu.style.setProperty('width', `${actualWidth}px`, 'important');
  menu.style.setProperty('min-width', `${actualWidth}px`, 'important');
  menu.style.setProperty('max-width', `${actualWidth}px`, 'important');
  menu.style.setProperty('max-height', `${availableHeight}px`, 'important');

  const list = menu.querySelector('.gz460-list');
  if (list instanceof HTMLElement) {
    list.style.setProperty('max-height', `${Math.max(120, availableHeight - titleHeight)}px`, 'important');
  }
  menu.dataset.gannzillaShapesMenuEnlargedV461 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('enlargeShapesMenu', true) || window[STATE_KEY]) return;

  let frame = 0;
  let observedMenu = null;
  let menuObserver = null;

  const refresh = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      installStyle();
      const menu = document.getElementById(MENU_ID);
      if (menu instanceof HTMLElement) {
        if (observedMenu !== menu && typeof MutationObserver === 'function') {
          menuObserver?.disconnect();
          observedMenu = menu;
          menuObserver = new MutationObserver(refresh);
          menuObserver.observe(menu, { attributes: true, attributeFilter: ['hidden', 'style', 'class'] });
        }
        positionMenu();
      }
    });
  };

  refresh();
  const timers = [30, 100, 250, 600, 1200, 2400, 4500].map((delay) => window.setTimeout(refresh, delay));
  window.addEventListener('resize', refresh);
  window.addEventListener('scroll', refresh, true);
  document.addEventListener('fullscreenchange', refresh);

  window.GANNZILLA_SHAPES_MENU_ENLARGE_V461 = true;
  window.__auditGannzillaShapesMenuEnlargeV461 = () => {
    const menu = document.getElementById(MENU_ID);
    const row = menu?.querySelector('.gz460-item');
    const icon = menu?.querySelector('.gz460-item-icon svg');
    const menuRect = menu?.getBoundingClientRect();
    const rowRect = row?.getBoundingClientRect();
    const iconRect = icon?.getBoundingClientRect();
    const cfg = settings();
    return {
      ok: Boolean(menu?.dataset?.gannzillaShapesMenuEnlargedV461 === 'true'),
      build: BUILD,
      enabled: boolParam('enlargeShapesMenu', true),
      targetWidthPx: cfg.width,
      actualWidthPx: menuRect ? Math.round(menuRect.width) : null,
      targetRowHeightPx: cfg.rowHeight,
      actualRowHeightPx: rowRect ? Math.round(rowRect.height) : null,
      targetFontSizePx: cfg.rowFont,
      targetIconSizePx: cfg.iconSize,
      actualIconSizePx: iconRect ? Math.round(iconRect.width) : null,
      scopedObserverOnly: true,
    };
  };

  window[STATE_KEY] = { timers, get menuObserver() { return menuObserver; }, refresh };
}

install();
