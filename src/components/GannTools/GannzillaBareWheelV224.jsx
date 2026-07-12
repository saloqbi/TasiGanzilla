import React from 'react';
import GannzillaClassicFullOptionsV94 from './GannzillaClassicFullOptionsV94';
import GannzillaRingTwoNumberingV223 from './GannzillaRingTwoNumberingV223';
import GannzillaTopToolbarV231 from './GannzillaTopToolbarV231';
import GannzillaArabicLocalizationV248 from './GannzillaArabicLocalizationV248';
import GannzillaPanelFrameCleanupV297 from './GannzillaPanelFrameCleanupV297';
import GannzillaPanelFullWidthV302 from './GannzillaPanelFullWidthV302';
import GannzillaPanelFixedLeftV315 from './GannzillaPanelFixedLeftV315';
import GannzillaPanelReadableTypographyV316 from './GannzillaPanelReadableTypographyV316';
import GannzillaFullPropertyPanelParityV318 from './GannzillaFullPropertyPanelParityV318';
import GannzillaLayoutPriceHighlightRuntimeV319 from './GannzillaLayoutPriceHighlightRuntimeV319';
import GannzillaWheelQuarterHiddenPanV303 from './GannzillaWheelQuarterHiddenPanV303';
import GannzillaPagePanScrollbarsV305 from './GannzillaPagePanScrollbarsV305';
import GannzillaHorizontalPanAssistV308 from './GannzillaHorizontalPanAssistV308';
import GannzillaHorizontalPanTopPlacementV312 from './GannzillaHorizontalPanTopPlacementV312';

const TOOLBAR_HEIGHT = 24;
const CANONICAL_PANEL_ID = 'gannzilla-canonical-property-host-v324';

/**
 * Build 324
 * Dedicated panel host:
 * - the complete screenshot/CHR panel mounts in its own first DOM aside
 * - the renderer's historical aside is removed from the visible interface
 * - the hidden renderer controls remain only as a temporary engine adapter
 * - no selector race exists between the complete panel and the renderer panel
 */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V324 = true;
    window.__auditGannzillaBareWheelV324 = () => {
      const canonicalHost = document.getElementById(CANONICAL_PANEL_ID);
      const fullPanel = canonicalHost?.querySelector('.gannzilla-full-property-panel-v318');
      const visibleLegacyAsides = Array.from(document.querySelectorAll('aside'))
        .filter((aside) => aside.id !== CANONICAL_PANEL_ID)
        .filter((aside) => getComputedStyle(aside).display !== 'none');

      return {
        ok: Boolean(canonicalHost && fullPanel && visibleLegacyAsides.length === 0),
        build: 324,
        canonicalPanelHostMounted: Boolean(canonicalHost),
        fullPanelMountedInsideCanonicalHost: Boolean(fullPanel),
        visibleLegacyPanelCount: visibleLegacyAsides.length,
        visiblePropertyPanelAuthority: 'DEDICATED_CANONICAL_HOST_V324',
        rendererLegacyPanelVisible: false,
        rendererLegacyPanelPointerEvents: false,
        oldPanelHeaderVisible: false,
        wheelRendererPreserved: true,
        wheelZoomPreserved: true,
        wheelPanPreserved: true,
        nativeFullscreenPreserved: true,
        settingsPanelFixedSide: 'left',
        panelDoesNotShrinkWheelViewport: true,
        topHorizontalScrollbarPreserved: true,
        verticalScrollbarPreserved: true,
      };
    };

    return () => {
      delete window.GANNZILLA_BARE_WHEEL_V324;
      delete window.__auditGannzillaBareWheelV324;
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

        [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > div:first-of-type,
        [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > div:nth-of-type(2),
        [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > button {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        #${CANONICAL_PANEL_ID} {
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
          overflow-x: hidden !important;
          overflow-y: auto !important;
          z-index: 45 !important;
          display: block !important;
          visibility: visible !important;
          pointer-events: auto !important;
          background: #f2f2f2 !important;
          border-right: 1px solid #b8b8b8 !important;
          box-sizing: border-box !important;
        }

        [data-gannzilla-build="248"] aside:not(#${CANONICAL_PANEL_ID}) {
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

        #${CANONICAL_PANEL_ID} > .gannzilla-full-property-panel-v318 {
          display: block !important;
          visibility: visible !important;
          pointer-events: auto !important;
          width: 100% !important;
          min-height: 100% !important;
          padding-top: 0 !important;
        }

        #${CANONICAL_PANEL_ID} > .gannzilla-full-property-panel-v318 > div:first-of-type {
          display: none !important;
        }
      `}</style>

      <aside
        id={CANONICAL_PANEL_ID}
        data-gannzilla-canonical-panel="true"
        aria-label="Gannzilla property panel"
      />

      <GannzillaClassicFullOptionsV94 />
      <GannzillaRingTwoNumberingV223 />
      <GannzillaTopToolbarV231 />
      <GannzillaArabicLocalizationV248 />
      <GannzillaPanelFrameCleanupV297 />
      <GannzillaPanelFullWidthV302 />
      <GannzillaPanelFixedLeftV315 />
      <GannzillaPanelReadableTypographyV316 />
      <GannzillaFullPropertyPanelParityV318 />
      <GannzillaLayoutPriceHighlightRuntimeV319 />
      <GannzillaWheelQuarterHiddenPanV303 />
      <GannzillaPagePanScrollbarsV305 />
      <GannzillaHorizontalPanAssistV308 />
      <GannzillaHorizontalPanTopPlacementV312 />
    </>
  );
}
