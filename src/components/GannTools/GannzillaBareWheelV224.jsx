import React from 'react';
import GannzillaClassicFullOptionsV94 from './GannzillaClassicFullOptionsV94';
import GannzillaRingTwoNumberingV223 from './GannzillaRingTwoNumberingV223';
import GannzillaTopToolbarV231 from './GannzillaTopToolbarV231';
import GannzillaExistingProtractorFontDoubleV343 from './GannzillaExistingProtractorFontDoubleV343';
import GannzillaWeekdayZodiacBandV380 from './GannzillaWeekdayZodiacBandV380';
import GannzillaHideCalendarLabelsV359 from './GannzillaHideCalendarLabelsV359';
import GannzillaArabicLocalizationV248 from './GannzillaArabicLocalizationV248';
import GannzillaPanelFrameCleanupV297 from './GannzillaPanelFrameCleanupV297';
import GannzillaPanelFullWidthV302 from './GannzillaPanelFullWidthV302';
import GannzillaPanelFixedLeftV315 from './GannzillaPanelFixedLeftV315';
import GannzillaPanelReadableTypographyV316 from './GannzillaPanelReadableTypographyV316';
import GannzillaCanonicalPropertyPanelV326 from './GannzillaCanonicalPropertyPanelV326';
import GannzillaChartToolbarV327 from './GannzillaChartToolbarV327';
import GannzillaChartImageExportV368 from './GannzillaChartImageExportV368';
import GannzillaWheelQuarterHiddenPanV303 from './GannzillaWheelQuarterHiddenPanV303';
import GannzillaPagePanScrollbarsV305 from './GannzillaPagePanScrollbarsV305';
import GannzillaHorizontalPanAssistV308 from './GannzillaHorizontalPanAssistV308';
import GannzillaHorizontalPanTopPlacementV312 from './GannzillaHorizontalPanTopPlacementV312';
import GannzillaEventStormGuardV383 from './GannzillaEventStormGuardV383';

const TOOLBAR_HEIGHT = 24;
const CLEAN_PANEL_ID = 'gannzilla-clean-property-panel-v325';

function urlBool(name, fallback) {
  try {
    const query = new URLSearchParams(window.location.search || '');
    if (!query.has(name)) return fallback;
    const value = String(query.get(name) || '').toLowerCase();
    return value === 'true' || value === '1' || value === 'yes' || value === 'on';
  } catch (_) {
    return fallback;
  }
}

function suppressLegacyCoreToolbar() {
  const restoredToolbar = document.querySelector('[data-gannzilla-toolbar="true"]');
  let hiddenCount = 0;

  Array.from(document.querySelectorAll('div')).forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node === restoredToolbar || restoredToolbar?.contains(node) || node.closest('[data-gannzilla-toolbar="true"]')) return;

    const style = window.getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    if (style.position !== 'fixed') return;
    if (Math.abs(Number.parseFloat(style.top) || 0) > 1) return;
    if (rect.height < 20 || rect.height > 34) return;
    if (rect.width < Math.max(600, window.innerWidth * 0.72)) return;

    const buttons = node.querySelectorAll('button').length;
    const hasPercent = Array.from(node.querySelectorAll('span')).some((span) => /^\d{1,3}%$/.test(String(span.textContent || '').trim()));
    const text = String(node.textContent || '');
    const looksLikeLegacyToolbar = buttons >= 4 && (hasPercent || text.includes('Gannzilla Pro') || text.includes('Clockwise'));
    if (!looksLikeLegacyToolbar) return;

    node.dataset.gannzillaLegacyCoreToolbarHiddenV400 = 'true';
    node.style.setProperty('display', 'none', 'important');
    node.style.setProperty('visibility', 'hidden', 'important');
    node.style.setProperty('pointer-events', 'none', 'important');
    hiddenCount += 1;
  });

  return hiddenCount;
}

/** Build 400: remove the legacy icon strip and mount the restored toolbar shown in the reference. */
export default function GannzillaBareWheelV224() {
  const showProtractorOverlay = urlBool('showProtractor', true);
  const showWeekdayZodiacOverlay = showProtractorOverlay && urlBool('showWeekdayZodiacBand', true);

  React.useEffect(() => {
    const apply = () => {
      window.__gannzillaLegacyCoreToolbarHiddenCountV400 = suppressLegacyCoreToolbar();
    };

    const timers = [0, 40, 120, 260, 600, 1200].map((delay) => window.setTimeout(apply, delay));
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('resize', apply);

    window.GANNZILLA_BARE_WHEEL_V400 = true;
    window.__auditGannzillaBareWheelV400 = () => ({
      ok: Boolean(document.querySelector('[data-gannzilla-toolbar="true"]')),
      build: 400,
      restoredToolbarMounted: Boolean(document.querySelector('[data-gannzilla-toolbar="true"]')),
      legacyToolbarHiddenCount: window.__gannzillaLegacyCoreToolbarHiddenCountV400 || 0,
      referenceIconSetEnabled: true,
    });

    return () => {
      timers.forEach(window.clearTimeout);
      observer.disconnect();
      window.removeEventListener('resize', apply);
      delete window.GANNZILLA_BARE_WHEEL_V400;
      delete window.__auditGannzillaBareWheelV400;
      delete window.__gannzillaLegacyCoreToolbarHiddenCountV400;
    };
  }, []);

  return (
    <>
      <style>{`
        :root {
          --gannzilla-toolbar-height: ${TOOLBAR_HEIGHT}px;
          --gannzilla-property-panel-width: clamp(360px, 32vw, 520px);
        }

        html,
        body,
        #root {
          width: 100% !important;
          min-width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: #ffffff !important;
        }

        #${CLEAN_PANEL_ID} {
          position: fixed !important;
          left: 0 !important;
          right: auto !important;
          top: var(--gannzilla-toolbar-height) !important;
          width: var(--gannzilla-property-panel-width) !important;
          min-width: 360px !important;
          max-width: 520px !important;
          height: calc(100vh - var(--gannzilla-toolbar-height)) !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          z-index: 45 !important;
          display: block !important;
          visibility: visible !important;
          pointer-events: auto !important;
          background: #f2f2ee !important;
          border-right: 1px solid #b8b8b8 !important;
          box-sizing: border-box !important;
        }

        #${CLEAN_PANEL_ID},
        #${CLEAN_PANEL_ID} * {
          pointer-events: auto;
        }

        [data-gannzilla-build="248"] aside:not(#${CLEAN_PANEL_ID}) {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          width: 0 !important;
          min-width: 0 !important;
          max-width: 0 !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          overflow: hidden !important;
          opacity: 0 !important;
        }

        [data-gannzilla-legacy-core-toolbar-hidden-v400="true"] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `}</style>

      <aside
        id={CLEAN_PANEL_ID}
        data-gannzilla-clean-panel="true"
        aria-label="Gannzilla canonical property panel"
      />

      <GannzillaEventStormGuardV383 />
      {showProtractorOverlay && <GannzillaExistingProtractorFontDoubleV343 />}
      <GannzillaHideCalendarLabelsV359 />
      <GannzillaClassicFullOptionsV94 />
      <GannzillaTopToolbarV231 />
      <GannzillaRingTwoNumberingV223 />
      {showWeekdayZodiacOverlay && <GannzillaWeekdayZodiacBandV380 />}
      <GannzillaArabicLocalizationV248 />
      <GannzillaPanelFrameCleanupV297 />
      <GannzillaPanelFullWidthV302 />
      <GannzillaPanelFixedLeftV315 />
      <GannzillaPanelReadableTypographyV316 />
      <GannzillaCanonicalPropertyPanelV326 />
      <GannzillaChartToolbarV327 />
      <GannzillaChartImageExportV368 />
      <GannzillaWheelQuarterHiddenPanV303 />
      <GannzillaPagePanScrollbarsV305 />
      <GannzillaHorizontalPanAssistV308 />
      <GannzillaHorizontalPanTopPlacementV312 />
    </>
  );
}
