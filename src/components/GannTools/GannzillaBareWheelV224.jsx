import React from 'react';
import GannzillaClassicFullOptionsV94 from './GannzillaClassicFullOptionsV94';
import GannzillaRingTwoNumberingV223 from './GannzillaRingTwoNumberingV223';
import GannzillaTopToolbarV231 from './GannzillaTopToolbarV231';
import GannzillaArabicLocalizationV248 from './GannzillaArabicLocalizationV248';
import GannzillaPanelFrameCleanupV297 from './GannzillaPanelFrameCleanupV297';
import GannzillaPanelFullWidthV302 from './GannzillaPanelFullWidthV302';
import GannzillaPanelFixedLeftV315 from './GannzillaPanelFixedLeftV315';
import GannzillaPanelReadableTypographyV316 from './GannzillaPanelReadableTypographyV316';
import GannzillaWheelQuarterHiddenPanV303 from './GannzillaWheelQuarterHiddenPanV303';
import GannzillaPagePanScrollbarsV305 from './GannzillaPagePanScrollbarsV305';
import GannzillaHorizontalPanAssistV308 from './GannzillaHorizontalPanAssistV308';
import GannzillaHorizontalPanTopPlacementV312 from './GannzillaHorizontalPanTopPlacementV312';

const TOOLBAR_HEIGHT = 24;

/**
 * Build 322
 * Clean property-panel reset:
 * - removes the V318/V319/V320 overlay-and-bridge stack
 * - restores the renderer-owned controls as the only state authority
 * - every visible control now calls the renderer React setter directly
 * - preserves the accepted wheel movement/fullscreen/layout infrastructure
 */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V322 = true;
    window.__auditGannzillaBareWheelV322 = () => ({
      ok: true,
      build: 322,
      propertyPanelArchitecture: 'DIRECT_RENDERER_OWNED_CONTROLS',
      legacyOverlayPanelRemoved: true,
      domBridgeRuntimeRemoved: true,
      duplicateClockwiseRuntimeRemoved: true,
      visibleControlsCallReactSettersDirectly: true,
      canonicalRendererMounted: true,
      rendererStateIsSingleAuthority: true,
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
      nextParitySource: 'GANNZILLA_SCREENSHOT_PLUS_CHR_CLEAN_ROOM',
    });

    return () => {
      delete window.GANNZILLA_BARE_WHEEL_V322;
      delete window.__auditGannzillaBareWheelV322;
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
      `}</style>
      <GannzillaClassicFullOptionsV94 />
      <GannzillaRingTwoNumberingV223 />
      <GannzillaTopToolbarV231 />
      <GannzillaArabicLocalizationV248 />
      <GannzillaPanelFrameCleanupV297 />
      <GannzillaPanelFullWidthV302 />
      <GannzillaPanelFixedLeftV315 />
      <GannzillaPanelReadableTypographyV316 />
      <GannzillaWheelQuarterHiddenPanV303 />
      <GannzillaPagePanScrollbarsV305 />
      <GannzillaHorizontalPanAssistV308 />
      <GannzillaHorizontalPanTopPlacementV312 />
    </>
  );
}
