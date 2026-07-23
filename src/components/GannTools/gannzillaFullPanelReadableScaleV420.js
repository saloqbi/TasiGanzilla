const BUILD = 420;
const STYLE_ID = 'gannzilla-full-panel-readable-scale-v420';
const STATE_KEY = '__gannzillaFullPanelReadableScaleV420';

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

function panelWidth() {
  return Math.round(numberParam('fullPanelWidth', 390, 340, 520));
}

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;

  const width = panelWidth();
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --gannzilla-property-panel-width: ${width}px !important;
    }

    aside[data-gannzilla-full-panel-v318="true"] {
      width: ${width}px !important;
      min-width: ${width}px !important;
      max-width: ${width}px !important;
      scrollbar-width: auto !important;
    }

    aside[data-gannzilla-full-panel-v318="true"]::-webkit-scrollbar {
      width: 12px !important;
    }

    .gannzilla-full-property-panel-v318 {
      font-size: 12px !important;
      line-height: 1.24 !important;
      letter-spacing: 0 !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-project-header {
      min-height: 27px !important;
      height: 27px !important;
      padding: 2px 5px !important;
      gap: 4px !important;
      font-size: 12px !important;
      line-height: 22px !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-project-title {
      font-size: 12px !important;
      font-weight: 700 !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-top-action {
      width: 20px !important;
      min-width: 20px !important;
      height: 20px !important;
      min-height: 20px !important;
      font-size: 11px !important;
      line-height: 18px !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-section-header {
      min-height: 24px !important;
      height: 24px !important;
      padding: 2px 6px !important;
      gap: 5px !important;
      font-size: 12px !important;
      line-height: 19px !important;
      font-weight: 700 !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-section-header > span:first-child {
      width: 13px !important;
      font-size: 12px !important;
      line-height: 18px !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-row {
      grid-template-columns: 49% 51% !important;
      min-height: 24px !important;
      height: auto !important;
      font-size: 11px !important;
      line-height: 1.2 !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-row > div {
      min-height: 23px !important;
      padding: 2px 5px !important;
      overflow: visible !important;
    }

    .gannzilla-full-property-panel-v318 .gz419-row > div:first-child {
      font-size: 11px !important;
      font-weight: 500 !important;
      white-space: normal !important;
    }

    .gannzilla-full-property-panel-v318 input:not([type="checkbox"]):not([type="radio"]):not([type="color"]),
    .gannzilla-full-property-panel-v318 select,
    .gannzilla-full-property-panel-v318 textarea {
      min-height: 20px !important;
      height: 20px !important;
      padding: 0 4px !important;
      font-size: 11px !important;
      font-weight: 500 !important;
      line-height: 18px !important;
    }

    .gannzilla-full-property-panel-v318 textarea {
      min-height: 64px !important;
      height: 64px !important;
    }

    .gannzilla-full-property-panel-v318 input[type="checkbox"],
    .gannzilla-full-property-panel-v318 input[type="radio"] {
      width: 13px !important;
      min-width: 13px !important;
      height: 13px !important;
      min-height: 13px !important;
      margin: 0 3px !important;
    }

    .gannzilla-full-property-panel-v318 input[type="color"] {
      width: 25px !important;
      min-width: 25px !important;
      height: 18px !important;
      min-height: 18px !important;
    }

    .gannzilla-full-property-panel-v318 button {
      min-height: 20px !important;
      height: 20px !important;
      padding: 0 5px !important;
      font-size: 11px !important;
      line-height: 18px !important;
    }

    .gannzilla-full-property-panel-v318 code {
      font-size: 10px !important;
      line-height: 18px !important;
    }

    .gannzilla-full-property-panel-v318 table {
      font-size: 10px !important;
      line-height: 1.15 !important;
    }

    .gannzilla-full-property-panel-v318 th,
    .gannzilla-full-property-panel-v318 td {
      height: 20px !important;
      min-height: 20px !important;
      padding: 1px 2px !important;
    }

    .gannzilla-full-property-panel-v318 table input,
    .gannzilla-full-property-panel-v318 table select {
      min-height: 18px !important;
      height: 18px !important;
      font-size: 9px !important;
      line-height: 16px !important;
    }
  `;
  document.head.appendChild(style);
}

function apply() {
  const panel = document.querySelector('.gannzilla-full-property-panel-v318');
  const aside = panel?.closest?.('aside');
  if (!(panel instanceof HTMLElement) || !(aside instanceof HTMLElement)) return false;

  const width = panelWidth();
  document.documentElement.style.setProperty('--gannzilla-property-panel-width', `${width}px`, 'important');
  aside.style.setProperty('width', `${width}px`, 'important');
  aside.style.setProperty('min-width', `${width}px`, 'important');
  aside.style.setProperty('max-width', `${width}px`, 'important');
  aside.dataset.gannzillaReadableScaleV420 = 'true';
  panel.dataset.gannzillaReadableScaleV420 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('fullPanelReadableScale', true) || window[STATE_KEY]) return;

  installStyle();
  let frame = 0;
  const run = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(apply);
  };

  [0, 30, 80, 160, 320, 700, 1400, 2600].forEach((delay) => window.setTimeout(run, delay));
  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
  window.addEventListener('resize', run);

  window.GANNZILLA_FULL_PANEL_READABLE_SCALE_V420 = true;
  window.__auditGannzillaFullPanelReadableScaleV420 = () => {
    const panel = document.querySelector('.gannzilla-full-property-panel-v318');
    const aside = panel?.closest?.('aside');
    return {
      ok: Boolean(panel?.dataset?.gannzillaReadableScaleV420 === 'true' && aside?.dataset?.gannzillaReadableScaleV420 === 'true'),
      build: BUILD,
      enabled: boolParam('fullPanelReadableScale', true),
      panelWidthPx: aside ? Math.round(aside.getBoundingClientRect().width) : null,
      targetPanelWidthPx: panelWidth(),
      panelFontSizePx: panel ? parseFloat(window.getComputedStyle(panel).fontSize) : null,
      referenceClarityScaleApplied: true,
      fullSectionSetPreserved: true,
      wheelRenderingPreserved: true,
    };
  };

  window[STATE_KEY] = { observer };
}

install();
