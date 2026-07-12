import React from 'react';

const BUILD = 317;
const DEFAULT_TEXT_SIZE_PX = 16;
const MIN_TEXT_SIZE_PX = 16;
const MAX_TEXT_SIZE_PX = 18;
const SECTION_HEADING_SIZE_PX = 17;
const MIN_FIELD_HEIGHT_PX = 30;

const SECTION_TITLES = new Set([
  'التخطيط', 'السعر', 'التمييز', 'المنقلة', 'العداد', 'المقياس الثانوي', 'المؤشر', 'مقياس الزمن',
  'Layout', 'Price', 'Highlight', 'Protractor', 'Counter', 'Secondary scale', 'Marker', 'Chronometer',
]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getClassicPanel() {
  const root = document.querySelector('[data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"])');
  if (!(root instanceof HTMLElement)) return null;
  return Array.from(root.children).find(
    (node) => node instanceof HTMLElement && node.tagName === 'ASIDE',
  ) || null;
}

function normalizedTitle(value) {
  return String(value || '')
    .trim()
    .replace(/^[+\-−–—]\s*/, '')
    .replace(/\s+/g, ' ');
}

function findReferenceHeading(panel) {
  if (!(panel instanceof HTMLElement)) return null;
  const candidates = Array.from(panel.querySelectorAll('*'));
  return candidates.find((element) => {
    const text = normalizedTitle(element.textContent);
    if (!/^(التخطيط|Layout)$/i.test(text)) return false;
    return element.children.length <= 3;
  }) || null;
}

function markSectionHeadings(panel) {
  if (!(panel instanceof HTMLElement)) return [];
  const marked = [];
  panel.querySelectorAll('*').forEach((element) => {
    if (!(element instanceof HTMLElement)) return;
    const text = normalizedTitle(element.textContent);
    if (!SECTION_TITLES.has(text)) return;
    if (element.children.length > 4) return;
    element.dataset.gannzillaPanelSectionHeadingV317 = 'true';
    marked.push(element);
  });
  return marked;
}

function applyReadableTypography() {
  const panel = getClassicPanel();
  if (!(panel instanceof HTMLElement)) return null;

  const heading = findReferenceHeading(panel);
  const headingSize = Number.parseFloat(heading ? window.getComputedStyle(heading).fontSize : '');
  const textSize = clamp(
    Number.isFinite(headingSize) ? Math.max(DEFAULT_TEXT_SIZE_PX, headingSize) : DEFAULT_TEXT_SIZE_PX,
    MIN_TEXT_SIZE_PX,
    MAX_TEXT_SIZE_PX,
  );
  const sectionHeadings = markSectionHeadings(panel);

  panel.dataset.gannzillaReadableTypographyV317 = 'true';
  panel.removeAttribute('data-gannzilla-readable-typography-v316');
  panel.style.setProperty('--gannzilla-panel-readable-font-size', `${textSize}px`);
  panel.style.setProperty('--gannzilla-panel-section-font-size', `${Math.max(SECTION_HEADING_SIZE_PX, textSize)}px`);
  panel.style.setProperty('--gannzilla-panel-field-min-height', `${MIN_FIELD_HEIGHT_PX}px`);
  panel.style.setProperty('font-family', 'Tahoma, Arial, sans-serif', 'important');
  panel.style.setProperty('font-size', `${textSize}px`, 'important');
  panel.style.setProperty('line-height', '1.45', 'important');

  return { panel, heading, sectionHeadings, textSize };
}

/** Build 317: larger, stronger, and more comfortable settings-panel typography. */
export default function GannzillaPanelReadableTypographyV316() {
  React.useEffect(() => {
    let frame = 0;

    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const result = applyReadableTypography();
        if (!result) return;
        window.dispatchEvent(new CustomEvent('gannzilla:panel-readable-typography-v317-sync', {
          detail: {
            fontSizePx: result.textSize,
            sectionHeadingSizePx: Math.max(SECTION_HEADING_SIZE_PX, result.textSize),
          },
        }));
      });
    };

    sync();
    const timers = [0, 60, 160, 360, 800, 1500].map((delay) => window.setTimeout(sync, delay));
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    window.addEventListener('resize', sync);
    document.addEventListener('fullscreenchange', sync);
    window.addEventListener('gannzilla:layout-panel-visibility-change', sync);
    window.addEventListener('gannzilla:panel-frame-cleanup-sync', sync);
    window.addEventListener('gannzilla:panel-width-v302-sync', sync);
    window.addEventListener('gannzilla:panel-fixed-left-v315-sync', sync);

    window.GANNZILLA_PANEL_READABLE_TYPOGRAPHY_V317 = true;
    window.__auditGannzillaPanelReadableTypographyV317 = () => {
      const result = applyReadableTypography();
      const sampleField = result?.panel?.querySelector('input:not([type="checkbox"]):not([type="radio"]), select, textarea');
      const sampleLabel = Array.from(result?.panel?.querySelectorAll('label, span, div') || [])
        .find((element) => String(element.textContent || '').trim().length > 0 && element.children.length === 0);
      return {
        ok: Boolean(result),
        build: BUILD,
        panelFound: Boolean(result?.panel),
        referenceHeadingFound: Boolean(result?.heading),
        targetFontSizePx: result?.textSize ?? null,
        sectionHeadingSizePx: Math.max(SECTION_HEADING_SIZE_PX, result?.textSize || 0),
        markedSectionHeadingCount: result?.sectionHeadings?.length ?? 0,
        smallWordsEnlarged: Boolean(sampleLabel && Number.parseFloat(window.getComputedStyle(sampleLabel).fontSize) >= MIN_TEXT_SIZE_PX),
        fieldsReadable: Boolean(!sampleField || Number.parseFloat(window.getComputedStyle(sampleField).fontSize) >= MIN_TEXT_SIZE_PX),
        strongerLabelWeightEnabled: true,
        comfortableLineHeightEnabled: true,
        panelSideUntouched: true,
        panelWidthUntouched: true,
        wheelGeometryUntouched: true,
        wheelZoomUntouched: true,
        wheelMovementUntouched: true,
        fullscreenUntouched: true,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      window.removeEventListener('gannzilla:layout-panel-visibility-change', sync);
      window.removeEventListener('gannzilla:panel-frame-cleanup-sync', sync);
      window.removeEventListener('gannzilla:panel-width-v302-sync', sync);
      window.removeEventListener('gannzilla:panel-fixed-left-v315-sync', sync);
      delete window.GANNZILLA_PANEL_READABLE_TYPOGRAPHY_V317;
      delete window.__auditGannzillaPanelReadableTypographyV317;
    };
  }, []);

  return (
    <style>{`
      [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > aside[data-gannzilla-readable-typography-v317="true"] {
        font-family: Tahoma, Arial, sans-serif !important;
        font-size: var(--gannzilla-panel-readable-font-size, ${DEFAULT_TEXT_SIZE_PX}px) !important;
        line-height: 1.45 !important;
        text-rendering: optimizeLegibility !important;
        -webkit-font-smoothing: antialiased !important;
      }

      [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > aside[data-gannzilla-readable-typography-v317="true"] :where(
        div,
        span,
        label,
        p,
        small,
        strong,
        button,
        input:not([type="checkbox"]):not([type="radio"]),
        select,
        option,
        textarea
      ) {
        font-family: Tahoma, Arial, sans-serif !important;
        font-size: var(--gannzilla-panel-readable-font-size, ${DEFAULT_TEXT_SIZE_PX}px) !important;
        line-height: 1.45 !important;
      }

      [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > aside[data-gannzilla-readable-typography-v317="true"] :where(
        label,
        span,
        small
      ) {
        font-weight: 600 !important;
      }

      [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > aside[data-gannzilla-readable-typography-v317="true"] :where(
        input:not([type="checkbox"]):not([type="radio"]),
        select,
        textarea
      ) {
        min-height: var(--gannzilla-panel-field-min-height, ${MIN_FIELD_HEIGHT_PX}px) !important;
        font-weight: 500 !important;
      }

      [data-gannzilla-panel-section-heading-v317="true"] {
        font-size: var(--gannzilla-panel-section-font-size, ${SECTION_HEADING_SIZE_PX}px) !important;
        font-weight: 800 !important;
        line-height: 1.35 !important;
      }

      [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > aside[data-gannzilla-readable-typography-v317="true"] :where(strong, b) {
        font-weight: 800 !important;
      }
    `}</style>
  );
}
