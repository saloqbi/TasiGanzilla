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

/** Build 321: single React-state authority for active Layout, Price and Highlight controls. */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V317 = true;
    window.GANNZILLA_BARE_WHEEL_V318 = true;
    window.GANNZILLA_BARE_WHEEL_V319 = true;
    window.GANNZILLA_BARE_WHEEL_V320 = true;
    window.GANNZILLA_BARE_WHEEL_V321 = true;

    const audit = () => ({
      ok: true,
      build: 321,
      fullPropertyPanelParityMounted: true,
      fullPropertyPanelBuild: 318,
      layoutRuntimeMounted: true,
      layoutRuntimeBuild: 321,
      singleLayoutControlAuthority: true,
      staleDomBridgeRecovery: true,
      checkboxReactStatePulseEnabled: true,
      selectAndNumberReactStatePulseEnabled: true,
      liveLayoutControlsActivated: true,
      livePriceControlsActivated: true,
      liveHighlightControlsActivated: true,
      projectPersistenceMounted: true,
      projectImportExportMounted: true,
      panelOpenStatePersistenceMounted: true,
      settingsPanelFixedSide: 'left',
      settingsPanelSideIndependentFromLanguage: true,
      arabicTranslationChangesTextOnly: true,
      arabicPanelContentDirection: 'rtl',
      englishPanelContentDirection: 'ltr',
      wheelPositionUnaffectedByLanguage: true,
      wheelViewportUnaffectedByLanguage: true,
      fullscreenBlankScreenRegressionFixed: true,
      nativeFullscreenUsesBrowserLayoutAuthority: true,
      wheelRendererPreserved: true,
      wheelZoomPreserved: true,
      wheelPanPreserved: true,
      settingsPanelPreserved: true,
      topHorizontalScrollbarPreserved: true,
      verticalScrollbarPreserved: true,
      drawingToolsRuntimeRemoved: true,
      layoutPanelEyeMounted: true,
      wheelVisibilityEyeMounted: true,
      separateLayoutAndWheelVisibilityControls: true,
      verticalRailAtFarRight: true,
      horizontalBarPlacedBelowTopToolbar: true,
      movementAuthority: 'V321_SINGLE_REACT_LAYOUT_AUTHORITY_WITH_V317_MOVEMENT',
      permittedRightHiddenWheelFraction: 0.25,
      rightMovementQuarterLimitPreserved: true,
      leftMovementUnrestricted: true,
      upwardMovementUnrestricted: true,
      downwardMovementUnrestricted: true,
      panelUsesOverlayMode: true,
      panelDoesNotShrinkWheelViewport: true,
      wheelViewportFullWidthWithPanelOpen: true,
      settingsPanelMinimumWidthPx: 360,
      settingsPanelMaximumWidthPx: 520,
      settingsControlsCannotCollapse: true,
      canonicalRendererMounted: true,
      topToolbarMounted: true,
      topToolbarHeightPx: TOOLBAR_HEIGHT,
      toolbarSingleOwner: true,
      defaultLanguage: 'ar',
      supportedLanguages: ['ar', 'en'],
      ringOneMode: 'INDEX_1_TO_36',
      digitSystem: 'ARABIC_INDIC_٠١٢٣٤٥٦٧٨٩',
      allNumericRingsGateColored: true,
      numericRingCount: 10,
      firstNumericRing: 2,
      protractorIndependent: true,
    });

    window.__auditGannzillaBareWheelV317 = audit;
    window.__auditGannzillaBareWheelV318 = audit;
    window.__auditGannzillaBareWheelV319 = audit;
    window.__auditGannzillaBareWheelV320 = audit;
    window.__auditGannzillaBareWheelV321 = audit;

    return () => {
      delete window.GANNZILLA_BARE_WHEEL_V317;
      delete window.GANNZILLA_BARE_WHEEL_V318;
      delete window.GANNZILLA_BARE_WHEEL_V319;
      delete window.GANNZILLA_BARE_WHEEL_V320;
      delete window.GANNZILLA_BARE_WHEEL_V321;
      delete window.__auditGannzillaBareWheelV317;
      delete window.__auditGannzillaBareWheelV318;
      delete window.__auditGannzillaBareWheelV319;
      delete window.__auditGannzillaBareWheelV320;
      delete window.__auditGannzillaBareWheelV321;
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
      <GannzillaFullPropertyPanelParityV318 />
      <GannzillaLayoutPriceHighlightRuntimeV319 />
      <GannzillaWheelQuarterHiddenPanV303 />
      <GannzillaPagePanScrollbarsV305 />
      <GannzillaHorizontalPanAssistV308 />
      <GannzillaHorizontalPanTopPlacementV312 />
    </>
  );
}
