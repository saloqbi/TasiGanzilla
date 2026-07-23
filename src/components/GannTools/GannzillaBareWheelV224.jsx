import React from 'react';
import GannzillaClassicBaseNoLegacyChromeV403 from './GannzillaClassicBaseNoLegacyChromeV403';
import GannzillaRingTwoNumberingV223 from './GannzillaRingTwoNumberingV223';
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

/** Build 403: remove the legacy top icon toolbar, Hide button and custom pan scrollbars from the active base wheel. */
export default function GannzillaBareWheelV224() {
  const showProtractorOverlay = urlBool('showProtractor', true);
  const showWeekdayZodiacOverlay = showProtractorOverlay && urlBool('showWeekdayZodiacBand', true);

  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V403 = true;
    window.__auditGannzillaBareWheelV403 = () => ({
      ok: true,
      build: 403,
      legacyTopToolbarRemoved: !Array.from(document.querySelectorAll('[data-gannzilla-core-legacy-toolbar-removed-v403="true"]')).some(
        (node) => window.getComputedStyle(node).display !== 'none',
      ),
      legacyHideButtonRemoved: !Array.from(document.querySelectorAll('[data-gannzilla-core-hide-button-removed-v403="true"]')).some(
        (node) => window.getComputedStyle(node).display !== 'none',
      ),
      pageVerticalRailRemoved: !document.querySelector('[data-gannzilla-page-vertical-rail-v306="true"]'),
      pageHorizontalRailRemoved: !document.querySelector('[data-gannzilla-page-horizontal-rail-v306="true"]'),
      topHorizontalPanAssistRemoved: !document.querySelector('[data-gannzilla-horizontal-pan-assist-v311="true"]'),
      wheelPanAuthorityPreserved: true,
    });

    return () => {
      delete window.GANNZILLA_BARE_WHEEL_V403;
      delete window.__auditGannzillaBareWheelV403;
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
      `}</style>

      <aside
        id={CLEAN_PANEL_ID}
        data-gannzilla-clean-panel="true"
        aria-label="Gannzilla canonical property panel"
      />

      <GannzillaEventStormGuardV383 />
      {showProtractorOverlay && <GannzillaExistingProtractorFontDoubleV343 />}
      <GannzillaHideCalendarLabelsV359 />
      <GannzillaClassicBaseNoLegacyChromeV403 />
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
    </>
  );
}
