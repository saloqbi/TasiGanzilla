const BUILD = 433;
const STYLE_ID = 'gannzilla-enlarge-copy-icon-v425';
const STATE_KEY = '__gannzillaEnlargeCopyIconV425';
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
    iconSize: Math.round(numberParam('copyIconSize', 28, 18, 42)),
    buttonSize: Math.round(numberParam('copyButtonSize', 40, 28, 54)),
  };
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  const { iconSize, buttonSize } = settings();
  const columnSize = buttonSize + 4;

  style.textContent = `
    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar {
      grid-template-columns: 21px minmax(0, 1fr) 27px 27px 27px ${columnSize}px 36px !important;
      align-items: center !important;
      overflow: visible !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar button[data-gannzilla-copy-icon-enlarged-v425="true"] {
      width: ${buttonSize}px !important;
      min-width: ${buttonSize}px !important;
      max-width: ${buttonSize}px !important;
      height: ${buttonSize}px !important;
      min-height: ${buttonSize}px !important;
      max-height: ${buttonSize}px !important;
      padding: 0 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: ${iconSize}px !important;
      font-weight: 800 !important;
      line-height: 1 !important;
      overflow: visible !important;
    }
  `;
}

function markButton() {
  const panel = document.getElementById(PANEL_ID);
  if (!(panel instanceof HTMLElement)) return false;
  const buttons = panel.querySelectorAll('.gz421-preset-bar button');
  const copyButton = buttons[3] || buttons[buttons.length - 1];
  if (!(copyButton instanceof HTMLButtonElement)) return false;

  copyButton.dataset.gannzillaCopyIconEnlargedV425 = 'true';
  copyButton.setAttribute('aria-label', copyButton.getAttribute('aria-label') || 'Copy / export');
  panel.dataset.gannzillaCopyIconEnlargedV425 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('enlargeCopyIcon', true) || window[STATE_KEY]) return;

  installStyle();
  let frame = 0;
  const run = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      installStyle();
      markButton();
    });
  };

  [0, 20, 60, 140, 320, 700, 1400, 2600].forEach((delay) => window.setTimeout(run, delay));
  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  });
  window.addEventListener('resize', run);

  window.GANNZILLA_ENLARGE_COPY_ICON_V425 = true;
  window.__auditGannzillaEnlargeCopyIconV425 = () => {
    const panel = document.getElementById(PANEL_ID);
    const button = panel?.querySelector('[data-gannzilla-copy-icon-enlarged-v425="true"]');
    const aboutButton = document.getElementById('gannzilla-about-info-button-v432');
    const { iconSize, buttonSize } = settings();
    return {
      ok: Boolean(button),
      build: BUILD,
      enabled: boolParam('enlargeCopyIcon', true),
      targetIconSizePx: iconSize,
      targetButtonSizePx: buttonSize,
      actualFontSizePx: button ? parseFloat(window.getComputedStyle(button).fontSize) : null,
      actualButtonWidthPx: button ? Math.round(button.getBoundingClientRect().width) : null,
      otherToolbarButtonsPreserved: true,
      aboutIconColumnReserved: true,
      aboutIconVisible: aboutButton ? window.getComputedStyle(aboutButton).visibility !== 'hidden' : null,
    };
  };

  window[STATE_KEY] = { observer };
}

install();
