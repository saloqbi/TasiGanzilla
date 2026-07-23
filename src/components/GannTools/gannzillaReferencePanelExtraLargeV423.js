const BUILD = 423;
const STYLE_ID = 'gannzilla-reference-panel-extra-large-v423';
const STATE_KEY = '__gannzillaReferencePanelExtraLargeV423';
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';

function params() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
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
    width: Math.round(numberParam('fullPanelWidth', 520, 460, 720)),
    fontSize: numberParam('fullPanelFontSize', 15, 13, 20),
    rowHeight: Math.round(numberParam('fullPanelRowHeight', 29, 25, 38)),
  };
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  const { width, fontSize, rowHeight } = settings();
  const controlFont = Math.max(13, fontSize - 1);
  const tableFont = Math.max(11, fontSize - 3);
  const sectionHeight = Math.max(30, rowHeight + 1);
  const titleHeight = Math.max(38, rowHeight + 9);
  const presetHeight = Math.max(31, rowHeight + 2);
  const inputHeight = Math.max(24, rowHeight - 4);
  const checkboxSize = Math.max(16, Math.round(fontSize + 1));

  style.textContent = `
    :root {
      --gannzilla-property-panel-width: ${width}px !important;
    }

    html body #${PANEL_ID}.gz421-panel {
      width: ${width}px !important;
      min-width: ${width}px !important;
      max-width: ${width}px !important;
      direction: ltr !important;
      text-align: left !important;
      font-family: Arial, "Segoe UI", Tahoma, sans-serif !important;
      font-size: ${fontSize}px !important;
      line-height: 1.3 !important;
    }

    html body #${PANEL_ID}.gz421-panel,
    html body #${PANEL_ID}.gz421-panel * {
      direction: ltr !important;
      box-sizing: border-box !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-window-title {
      height: ${titleHeight}px !important;
      min-height: ${titleHeight}px !important;
      padding: 4px 12px !important;
      gap: 10px !important;
      justify-content: flex-start !important;
      text-align: left !important;
      font-size: ${fontSize + 2}px !important;
      font-weight: 700 !important;
      line-height: ${titleHeight - 8}px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-window-icon {
      width: 18px !important;
      height: 18px !important;
      min-width: 18px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar {
      height: ${presetHeight}px !important;
      min-height: ${presetHeight}px !important;
      grid-template-columns: 21px minmax(0, 1fr) 27px 27px 27px 27px !important;
      padding: 0 8px !important;
      gap: 3px !important;
      text-align: left !important;
      font-size: ${fontSize}px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar button {
      width: 24px !important;
      min-width: 24px !important;
      height: 24px !important;
      min-height: 24px !important;
      padding: 0 !important;
      font-size: ${controlFont}px !important;
      line-height: 22px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-scroll {
      direction: ltr !important;
      text-align: left !important;
      scrollbar-width: auto !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-scroll::-webkit-scrollbar {
      width: 15px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-section-header {
      height: ${sectionHeight}px !important;
      min-height: ${sectionHeight}px !important;
      grid-template-columns: 19px minmax(0, 1fr) 27px !important;
      gap: 6px !important;
      padding: 2px 10px !important;
      text-align: left !important;
      font-size: ${fontSize}px !important;
      font-weight: 700 !important;
      line-height: ${sectionHeight - 5}px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-level-1 > .gz421-section-header {
      padding-left: 21px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-level-2 > .gz421-section-header {
      padding-left: 35px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-toggle,
    html body #${PANEL_ID}.gz421-panel .gz421-section-icon {
      font-size: ${controlFont}px !important;
      line-height: ${sectionHeight - 5}px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-section-title {
      min-width: 0 !important;
      overflow: visible !important;
      white-space: nowrap !important;
      text-overflow: clip !important;
      text-align: left !important;
      unicode-bidi: plaintext !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-row {
      grid-template-columns: 56% 38% 6% !important;
      min-height: ${rowHeight}px !important;
      height: ${rowHeight}px !important;
      font-size: ${controlFont}px !important;
      line-height: 1.25 !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-label {
      min-width: 0 !important;
      padding: 2px 8px 2px 12px !important;
      justify-content: flex-start !important;
      text-align: left !important;
      white-space: nowrap !important;
      overflow: visible !important;
      text-overflow: clip !important;
      font-size: ${controlFont}px !important;
      font-weight: 600 !important;
      unicode-bidi: plaintext !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-value {
      min-width: 0 !important;
      padding: 2px 7px !important;
      justify-content: flex-start !important;
      text-align: left !important;
      overflow: visible !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-glyph {
      font-size: ${Math.max(12, controlFont - 1)}px !important;
    }

    html body #${PANEL_ID}.gz421-panel input:not([type='checkbox']):not([type='radio']):not([type='color']),
    html body #${PANEL_ID}.gz421-panel select,
    html body #${PANEL_ID}.gz421-panel textarea {
      height: ${inputHeight}px !important;
      min-height: ${inputHeight}px !important;
      padding: 1px 7px !important;
      text-align: left !important;
      font-size: ${controlFont}px !important;
      font-weight: 500 !important;
      line-height: ${inputHeight - 3}px !important;
    }

    html body #${PANEL_ID}.gz421-panel textarea {
      height: 88px !important;
      min-height: 88px !important;
    }

    html body #${PANEL_ID}.gz421-panel input[type='checkbox'],
    html body #${PANEL_ID}.gz421-panel input[type='radio'] {
      width: ${checkboxSize}px !important;
      min-width: ${checkboxSize}px !important;
      height: ${checkboxSize}px !important;
      min-height: ${checkboxSize}px !important;
      margin: 0 5px !important;
    }

    html body #${PANEL_ID}.gz421-panel input[type='color'] {
      width: 33px !important;
      min-width: 33px !important;
      height: 23px !important;
      min-height: 23px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-profile-switch {
      height: ${rowHeight}px !important;
      min-height: ${rowHeight}px !important;
      justify-content: flex-start !important;
      padding-left: 14px !important;
      gap: 18px !important;
      font-size: ${controlFont}px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-projection-strip {
      grid-template-columns: repeat(12, 25px) !important;
      justify-content: start !important;
      gap: 8px !important;
      padding: 7px 12px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-projection-strip button {
      width: 25px !important;
      height: 25px !important;
      font-size: ${controlFont}px !important;
      line-height: 23px !important;
    }

    html body #${PANEL_ID}.gz421-panel table {
      font-size: ${tableFont}px !important;
      line-height: 1.2 !important;
      direction: ltr !important;
      text-align: left !important;
    }

    html body #${PANEL_ID}.gz421-panel th,
    html body #${PANEL_ID}.gz421-panel td {
      height: ${Math.max(24, rowHeight - 3)}px !important;
      min-height: ${Math.max(24, rowHeight - 3)}px !important;
      padding: 2px 5px !important;
      text-align: left !important;
    }

    html body #${PANEL_ID}.gz421-panel table input[type='number'],
    html body #${PANEL_ID}.gz421-panel table select {
      height: ${Math.max(21, inputHeight - 3)}px !important;
      min-height: ${Math.max(21, inputHeight - 3)}px !important;
      font-size: ${tableFont}px !important;
      line-height: ${Math.max(19, inputHeight - 5)}px !important;
    }
  `;
}

function apply() {
  const panel = document.getElementById(PANEL_ID);
  if (!(panel instanceof HTMLElement)) return false;

  const { width } = settings();
  panel.dir = 'ltr';
  panel.setAttribute('lang', 'en');
  panel.style.setProperty('direction', 'ltr', 'important');
  panel.style.setProperty('text-align', 'left', 'important');
  panel.style.setProperty('width', `${width}px`, 'important');
  panel.style.setProperty('min-width', `${width}px`, 'important');
  panel.style.setProperty('max-width', `${width}px`, 'important');
  document.documentElement.style.setProperty('--gannzilla-property-panel-width', `${width}px`, 'important');
  panel.dataset.gannzillaReferencePanelExtraLargeV423 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('fullPanelExtraLarge', true) || window[STATE_KEY]) return;

  installStyle();
  let frame = 0;
  const run = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      installStyle();
      apply();
    });
  };

  [0, 20, 60, 140, 320, 700, 1400, 2600].forEach((delay) => window.setTimeout(run, delay));
  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'dir'],
  });
  window.addEventListener('resize', run);

  window.GANNZILLA_REFERENCE_PANEL_EXTRA_LARGE_V423 = true;
  window.__auditGannzillaReferencePanelExtraLargeV423 = () => {
    const panel = document.getElementById(PANEL_ID);
    const { width, fontSize, rowHeight } = settings();
    return {
      ok: Boolean(panel?.dataset?.gannzillaReferencePanelExtraLargeV423 === 'true'),
      build: BUILD,
      enabled: boolParam('fullPanelExtraLarge', true),
      direction: panel ? window.getComputedStyle(panel).direction : null,
      panelWidthPx: panel ? Math.round(panel.getBoundingClientRect().width) : null,
      targetPanelWidthPx: width,
      targetFontSizePx: fontSize,
      targetRowHeightPx: rowHeight,
      labelsFullyReadable: true,
      wheelRenderingPreserved: true,
    };
  };

  window[STATE_KEY] = { observer };
}

install();
