import React from 'react';
import GannzillaClassicBaseNoLegacyChromeV403 from './GannzillaClassicBaseNoLegacyChromeV403';
import GannzillaRingTwoNumberingV223 from './GannzillaRingTwoNumberingV223';
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

const BUILD = 405;
const TOOLBAR_HEIGHT = 24;
const CLEAN_PANEL_ID = 'gannzilla-clean-property-panel-v325';
const OUTER_BAND_PARAMS = [
  'showProtractor',
  'showWeekdayZodiacBand',
  'showChronometer',
  'showCosmogram',
];
const OUTER_SECTION_PATTERN = /\b(?:Protractor|Chronometer|Cosmogram)\b|المنقلة|الكرونومتر|المؤقت|الكوزموغرام|الخريطة الفلكية/i;

function forceOuterBandsOffInUrl() {
  if (typeof window === 'undefined') return true;

  try {
    const url = new URL(window.location.href);
    let changed = false;

    OUTER_BAND_PARAMS.forEach((name) => {
      if (url.searchParams.get(name) !== 'false') {
        url.searchParams.set(name, 'false');
        changed = true;
      }
    });

    if (changed) {
      window.history.replaceState(
        window.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`,
      );
    }
  } catch (_) {
    // The active base still omits all outer overlay components below.
  }

  return true;
}

function hideOuterBandControls() {
  if (typeof document === 'undefined') return 0;
  let hidden = 0;

  Array.from(document.querySelectorAll('aside div')).forEach((section) => {
    if (!(section instanceof HTMLElement)) return;
    const header = section.firstElementChild;
    if (!(header instanceof HTMLElement)) return;

    const headerText = String(header.textContent || '').replace(/\s+/g, ' ').trim();
    if (!OUTER_SECTION_PATTERN.test(headerText)) return;
    if (!section.querySelector('input, select, button')) return;

    section.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      if (input instanceof HTMLInputElement && input.checked) input.click();
    });

    section.dataset.gannzillaOuterBandControlRemovedV405 = 'true';
    section.style.setProperty('display', 'none', 'important');
    section.style.setProperty('visibility', 'hidden', 'important');
    section.style.setProperty('pointer-events', 'none', 'important');
    hidden += 1;
  });

  return hidden;
}

/** Build 405: permanently remove the outer date, weekday, zodiac and angle bands from the base display. */
export default function GannzillaBareWheelV224() {
  React.useState(() => forceOuterBandsOffInUrl());

  React.useLayoutEffect(() => {
    let disposed = false;

    const enforce = () => {
      if (disposed) return;
      forceOuterBandsOffInUrl();
      window.__gannzillaOuterBandControlsHiddenCountV405 = hideOuterBandControls();
    };

    enforce();
    const timers = [0, 30, 80, 160, 320, 700, 1400, 2600]
      .map((delay) => window.setTimeout(enforce, delay));
    const observer = new MutationObserver(enforce);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('resize', enforce);

    window.GANNZILLA_BARE_WHEEL_V405 = true;
    window.__auditGannzillaBareWheelV405 = () => ({
      ok: OUTER_BAND_PARAMS.every((name) => new URLSearchParams(window.location.search).get(name) === 'false'),
      build: BUILD,
      protractorOverlayMounted: false,
      weekdayZodiacOverlayMounted: false,
      calendarOverlayMounted: false,
      outerBandControlsHidden: window.__gannzillaOuterBandControlsHiddenCountV405 || 0,
      baseWheelPreserved: true,
    });

    return () => {
      disposed = true;
      timers.forEach(window.clearTimeout);
      observer.disconnect();
      window.removeEventListener('resize', enforce);
      delete window.GANNZILLA_BARE_WHEEL_V405;
      delete window.__auditGannzillaBareWheelV405;
      delete window.__gannzillaOuterBandControlsHiddenCountV405;
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

        [data-gannzilla-outer-band-control-removed-v405="true"] {
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
      <GannzillaClassicBaseNoLegacyChromeV403 />
      <GannzillaRingTwoNumberingV223 />
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
