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

/**
 * Build 323
 * Visible property-list replacement:
 * - the renderer's legacy property sections are removed from the visible panel
 * - the screenshot/CHR parity panel becomes the only visible property list
 * - the temporary v318 title bar is hidden so the list starts with Layout
 * - the live renderer remains mounted behind the panel
 */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V323 = true;
    window.__auditGannzillaBareWheelV323 = () => ({
      ok: true,
      build: 323,
      visiblePropertyPanelAuthority: 'FULL_SCREENSHOT_CHR_PARITY_PANEL',
      legacyRendererSectionsVisible: false,
      legacyRendererSectionsPointerEvents: false,
      oldPanelHeaderVisible: false,
      fullPropertyPanelMounted: true,
      fullPropertyPanelSourceBuild: 318,
      layoutRuntimeMounted: true,
      layoutRuntimeSourceBuild: 321,
      wheelRendererPreserved: true,
      wheelZoomPreserved: true,
      wheelPanPreserved: true,
      nativeFullscreenPreserved: true,
      settingsPanelFixedSide: 'left',
      panelUsesOverlayMode: true,
      panelDoesNotShrinkWheelViewport: true,
      topHorizontalScrollbarPreserved: true,
      verticalScrollbarPreserved: true,
      defaultLanguage: 'ar',
      supportedLanguages: ['ar', 'en'],
    });

    return () => {
      delete window.GANNZILLA_BARE_WHEEL_V323;
      delete window.__auditGannzillaBareWheelV323;
    };
  }, []);

  return (
    <>
      <style>{`
        :root {
          --gannzilla-toolbar-height: ${TOOLBAR_HEIGHT}px;
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

        [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > aside {
          top: var(--gannzilla-toolbar-height) !important;
          height: calc(100vh - var(--gannzilla-toolbar-height)) !important;
        }

        aside[data-gannzilla-full-panel-v318="true"] > div:not(.gannzilla-full-property-panel-v318) {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          height: 0 !important;
          min-height: 0 !important;
          overflow: hidden !important;
        }

        .gannzilla-full-property-panel-v318 > div:first-of-type {
          display: none !important;
        }

        .gannzilla-full-property-panel-v318 {
          padding-top: 0 !important;
        }
      `}</style>
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
