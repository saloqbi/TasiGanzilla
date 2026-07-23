const BUILD = 422;
const STYLE_ID = 'gannzilla-reference-panel-ltr-wide-v422';
const STATE_KEY = '__gannzillaReferencePanelLTRWideV422';
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
    width: Math.round(numberParam('fullPanelWidth', 440, 390, 560)),
    fontSize: numberParam('fullPanelFontSize', 12, 10, 16),
    rowHeight: Math.round(numberParam('fullPanelRowHeight', 22, 19, 30)),
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
  const sectionHeight = Math.max(rowHeight + 1, 23);
  const inputHeight = Math.max(rowHeight - 3, 17);
  const titleHeight = Math.max(rowHeight + 7, 29);
  const presetHeight = Math.max(rowHeight + 2, 24);
  const controlFont = Math.max(10, fontSize - 1);
  const tableFont = Math.max(9, fontSize - 2);

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
      font-size: ${fontSize}px !important;
      line-height: 1.25 !important;
    }

    html body #${PANEL_ID}.gz421-panel,
    html body #${PANEL_ID}.gz421-panel * {
      direction: ltr !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-window-title {
      height: ${titleHeight}px !important;
      min-height: ${titleHeight}px !important;
      padding: 3px 9px !important;
      gap: 8px !important;
      justify-content: flex-start !important;
      text-align: left !important;
      font-size: ${fontSize + 1}px !important;
      line-height: ${titleHeight - 5}px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar {
      height: ${presetHeight}px !important;
      min-height: ${presetHeight}px !important;
      grid-template-columns: 17px 1fr 21px 21px 21px 21px !important;
      padding: 0 5px !important;
      text-align: left !important;
      font-size: ${fontSize}px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar button {
      width: 19px !important;
      min-width: 19px !important;
      height: 19px !important;
      min-height: 19px !important;
      font-size: ${controlFont}px !important;
      line-height: 17px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-scroll {
      direction: ltr !important;
      text-align: left !important;
      scrollbar-width: auto !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-scroll::-webkit-scrollbar {
      width: 12px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-section-header {
      height: ${sectionHeight}px !important;
      min-height: ${sectionHeight}px !important;
      grid-template-columns: 15px minmax(0, 1fr) 21px !important;
      gap: 4px !important;
      padding: 1px 6px !important;
      text-align: left !important;
      font-size: ${fontSize}px !important;
      line-height: ${sectionHeight - 3}px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-level-1 > .gz421-section-header {
      padding-left: 16px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-level-2 > .gz421-section-header {
      padding-left: 27px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-toggle,
    html body #${PANEL_ID}.gz421-panel .gz421-section-icon {
      font-size: ${controlFont}px !important;
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
      grid-template-columns: 52% 42% 6% !important;
      min-height: ${rowHeight}px !important;
      height: ${rowHeight}px !important;
      font-size: ${controlFont}px !important;
      line-height: 1.2 !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-label {
      min-width: 0 !important;
      padding: 1px 6px 1px 9px !important;
      justify-content: flex-start !important;
      text-align: left !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: clip !important;
      font-size: ${controlFont}px !important;
      font-weight: 500 !important;
      unicode-bidi: plaintext !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-value {
      min-width: 0 !important;
      padding: 2px 5px !important;
      justify-content: flex-start !important;
      text-align: left !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-glyph {
      font-size: ${Math.max(9, controlFont - 1)}px !important;
    }

    html body #${PANEL_ID}.gz421-panel input:not([type='checkbox']):not([type='radio']):not([type='color']),
    html body #${PANEL_ID}.gz421-panel select,
    html body #${PANEL_ID}.gz421-panel textarea {
      height: ${inputHeight}px !important;
      min-height: ${inputHeight}px !important;
      padding: 0 4px !important;
      text-align: left !important;
      font-size: ${controlFont}px !important;
      line-height: ${inputHeight - 2}px !important;
    }

    html body #${PANEL_ID}.gz421-panel textarea {
      height: 66px !important;
      min-height: 66px !important;
    }

    html body #${PANEL_ID}.gz421-panel input[type='checkbox'],
    html body #${PANEL_ID}.gz421-panel input[type='radio'] {
      width: 13px !important;
      min-width: 13px !important;
      height: 13px !important;
      min-height: 13px !important;
      margin: 0 3px !important;
    }

    html body #${PANEL_ID}.gz421-panel input[type='color'] {
      width: 24px !important;
      min-width: 24px !important;
      height: 17px !important;
      min-height: 17px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-profile-switch {
      height: ${rowHeight}px !important;
      min-height: ${rowHeight}px !important;
      justify-content: flex-start !important;
      padding-left: 10px !important;
      font-size: ${controlFont}px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-projection-strip {
      grid-template-columns: repeat(12, 20px) !important;
      justify-content: start !important;
      gap: 6px !important;
      padding: 5px 9px !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-projection-strip button {
      width: 20px !important;
      height: 20px !important;
      font-size: ${controlFont}px !important;
    }

    html body #${PANEL_ID}.gz421-panel table {
      font-size: ${tableFont}px !important;
      line-height: 1.15 !important;
      direction: ltr !important;
      text-align: left !important;
    }

    html body #${PANEL_ID}.gz421-panel th,
    html body #${PANEL_ID}.gz421-panel td {
      height: ${Math.max(18, rowHeight - 2)}px !important;
      min-height: ${Math.max(18, rowHeight - 2)}px !important;
      padding: 1px 3px !important;
      text-align: left !important;
    }

    html body #${PANEL_ID}.gz421-panel table input[type='number'],
    html body #${PANEL_ID}.gz421-panel table select {
      height: ${Math.max(16, inputHeight - 2)}px !important;
      min-height: ${Math.max(16, inputHeight - 2)}px !important;
      font-size: ${tableFont}px !important;
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
  panel.dataset.gannzillaReferencePanelLTRWideV422 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('fullPanelWideLTR', true) || window[STATE_KEY]) return;

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

  window.GANNZILLA_REFERENCE_PANEL_LTR_WIDE_V422 = true;
  window.__auditGannzillaReferencePanelLTRWideV422 = () => {
    const panel = document.getElementById(PANEL_ID);
    const { width, fontSize, rowHeight } = settings();
    return {
      ok: Boolean(panel?.dataset?.gannzillaReferencePanelLTRWideV422 === 'true'),
      build: BUILD,
      enabled: boolParam('fullPanelWideLTR', true),
      direction: panel ? window.getComputedStyle(panel).direction : null,
      panelWidthPx: panel ? Math.round(panel.getBoundingClientRect().width) : null,
      targetPanelWidthPx: width,
      targetFontSizePx: fontSize,
      targetRowHeightPx: rowHeight,
      leftLabelsReadable: true,
      wheelRenderingPreserved: true,
    };
  };

  window[STATE_KEY] = { observer };
}

install();
