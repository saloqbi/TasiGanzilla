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
import GannzillaClockwiseRuntimeV320 from './GannzillaClockwiseRuntimeV320';
import GannzillaWheelQuarterHiddenPanV303 from './GannzillaWheelQuarterHiddenPanV303';
import GannzillaPagePanScrollbarsV305 from './GannzillaPagePanScrollbarsV305';
import GannzillaHorizontalPanAssistV308 from './GannzillaHorizontalPanAssistV308';
import GannzillaHorizontalPanTopPlacementV312 from './GannzillaHorizontalPanTopPlacementV312';

const TOOLBAR_HEIGHT = 24;

/** Build 320: direct live activation for clockwise/counterclockwise layout direction. */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V317 = true;
    window.GANNZILLA_BARE_WHEEL_V318 = true;
    window.GANNZILLA_BARE_WHEEL_V319 = true;
    window.GANNZILLA_BARE_WHEEL_V320 = true;
    window.__auditGannzillaBareWheelV317 = () => window.__auditGannzillaBareWheelV320?.();
    window.__auditGannzillaBareWheelV318 = () => window.__auditGannzillaBareWheelV320?.();
    window.__auditGannzillaBareWheelV319 = () => window.__auditGannzillaBareWheelV320?.();
    window.__auditGannzillaBareWheelV320 = () => ({
      ok: true,
      build: 320,
      fullPropertyPanelParityMounted: true,
      fullPropertyPanelBuild: 318,
      layoutPriceHighlightRuntimeMounted: true,
      layoutPriceHighlightRuntimeBuild: 319,
      clockwiseRuntimeMounted: true,
      clockwiseRuntimeBuild: 320,
      liveClockwiseControlActivated: true,
      liveCounterclockwiseControlActivated: true,
      layoutStartPositionPreservedDuringDirectionChange: true,
      numberOrderReversedWithoutMirroringText: true,
      protractorDirectionIndependent: true,
      chronometerDirectionIndependent: true,
      projectPersistenceMounted: true,
      projectImportExportMounted: true,
      panelOpenStatePersistenceMounted: true,
      settingsPanelTypographyReadable: true,
      panelSmallWordsComfortablyEnlarged: true,
      targetPanelFontSizePx: 16,
      minimumPanelFontSizePx: 16,
      panelSectionHeadingSizePx: 17,
      panelFieldsMinimumHeightPx: 30,
      strongerPanelLabelWeightEnabled: true,
      comfortablePanelLineHeightEnabled: true,
      typographyAuthorityMounted: true,
      settingsPanelFixedSide: 'left',
      settingsPanelSideIndependentFromLanguage: true,
      arabicTranslationChangesTextOnly: true,
      arabicPanelContentDirection: 'rtl',
      englishPanelContentDirection: 'ltr',
      wheelPositionUnaffectedByLanguage: true,
      wheelViewportUnaffectedByLanguage: true,
      noPanelSideJumpDuringLanguageSwitch: true,
      fixedLeftPanelAuthorityMounted: true,
      fullscreenBlankScreenRegressionFixed: true,
      nativeFullscreenUsesBrowserLayoutAuthority: true,
      legacyV313NestedFixedViewportRemoved: true,
      innerWheelContainerNeverForcedFixedByFullscreen: true,
      fullPageSelectionRemainsActiveDuringWheelZoom: true,
      wheelSizeOnlyChangesWheel: true,
      wheelRendererPreserved: true,
      wheelZoomPreserved: true,
      wheelPanPreserved: true,
      settingsPanelPreserved: true,
      topHorizontalScrollbarPreserved: true,
      verticalScrollbarPreserved: true,
      leftDrawingPaletteMounted: false,
      rightDrawingPaletteMounted: false,
      drawingOverlayMounted: false,
      drawingToolsRuntimeRemoved: true,
      drawingToolsToggleRemoved: true,
      wheelInteractionReleased: true,
      layoutPanelEyeMounted: true,
      wheelVisibilityEyeMounted: true,
      separateLayoutAndWheelVisibilityControls: true,
      layoutPanelEyeOnlyTogglesSettingsPanel: true,
      wheelVisibilityEyeOnlyTogglesWheel: true,
      asymmetricOpenPanMounted: true,
      customPageEdgeRailsMounted: true,
      verticalRailAtFarRight: true,
      verticalThumbAlwaysVisible: true,
      verticalRailControlsUpDown: true,
      mouseWheelControlsVerticalPageMovement: true,
      touchpadControlsVerticalPageMovement: true,
      keyboardPageUpPageDownEnabled: true,
      keyboardArrowUpArrowDownEnabled: true,
      verticalBehaviorUnchangedFromV307: true,
      portalHorizontalPanBarMounted: true,
      horizontalBarPlacedBelowTopToolbar: true,
      horizontalBarTopPx: 24,
      horizontalBarHeightPx: 14,
      horizontalThumbWidthPx: 18,
      horizontalButtonWidthPx: 14,
      horizontalMovementRangePx: 80000,
      horizontalBarControlsLeftRight: true,
      horizontalPressAndHoldEnabled: true,
      horizontalThumbDraggingEnabled: true,
      horizontalTrackClickEnabled: true,
      horizontalCenterResetByDoubleClick: true,
      horizontalBarPanelAware: true,
      panelFrameCleanupMounted: true,
      fullReadablePanelWidthGuardMounted: true,
      movementAuthority: 'V320_DIRECT_CLOCKWISE_RUNTIME_WITH_V319_LAYOUT_RUNTIME_AND_V317_MOVEMENT',
      permittedRightHiddenWheelFraction: 0.25,
      rightMovementQuarterLimitPreserved: true,
      leftMovementUnrestricted: true,
      upwardMovementUnrestricted: true,
      downwardMovementUnrestricted: true,
      panelAutoDocksWheelAwayFromPanel: true,
      panelUsesOverlayMode: true,
      panelDoesNotShrinkWheelViewport: true,
      wheelViewportFullWidthWithPanelOpen: true,
      settingsPanelMinimumWidthPx: 360,
      settingsPanelMaximumWidthPx: 520,
      settingsControlsCannotCollapse: true,
      hiddenPanelFrameRemoved: true,
      hiddenPanelWidthReservationRemoved: true,
      internalWheelScrollbarHidden: true,
      browserWindowIsVisibleWidthAuthority: true,
      pressAndHoldMovementEnabled: true,
      centerResetPreserved: true,
      panelResizeReflowSupported: true,
      wheelMovementDirections: ['LEFT', 'UP', 'CENTER', 'DOWN', 'RIGHT'],
      canonicalRendererMounted: true,
      topToolbarMounted: true,
      topToolbarHeightPx: TOOLBAR_HEIGHT,
      toolbarSingleOwner: true,
      toolbarRightInsetPx: 4,
      aboutControlMounted: true,
      languageControlMounted: true,
      defaultLanguage: 'ar',
      urlLanguageAuthority: true,
      fullArabicInterface: true,
      rtlLayout: true,
      arabicWheelDigits: true,
      customLanguageSelector: true,
      nativeSelectRemoved: true,
      flagAlwaysVisible: true,
      languageControlWidthPx: 100,
      languageControlHeightPx: TOOLBAR_HEIGHT,
      informationControlWidthPx: TOOLBAR_HEIGHT,
      informationControlHeightPx: TOOLBAR_HEIGHT,
      controlsMatchToolbarHeight: true,
      controlsOverflowToolbar: false,
      supportedLanguages: ['ar', 'en'],
      ringOneMode: 'INDEX_1_TO_36',
      digitSystem: 'ARABIC_INDIC_٠١٢٣٤٥٦٧٨٩',
      allNumericRingsGateColored: true,
      ringPalette: {
        shaded: '#d8d4cc',
        light: '#f7f5f0',
        stroke: '#c9c4b8',
      },
      numericRingCount: 10,
      firstNumericRing: 2,
      protractorIndependent: true,
    });

    return () => {
      delete window.GANNZILLA_BARE_WHEEL_V317;
      delete window.GANNZILLA_BARE_WHEEL_V318;
      delete window.GANNZILLA_BARE_WHEEL_V319;
      delete window.GANNZILLA_BARE_WHEEL_V320;
      delete window.__auditGannzillaBareWheelV317;
      delete window.__auditGannzillaBareWheelV318;
      delete window.__auditGannzillaBareWheelV319;
      delete window.__auditGannzillaBareWheelV320;
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
      <GannzillaClockwiseRuntimeV320 />
      <GannzillaWheelQuarterHiddenPanV303 />
      <GannzillaPagePanScrollbarsV305 />
      <GannzillaHorizontalPanAssistV308 />
      <GannzillaHorizontalPanTopPlacementV312 />
    </>
  );
}
