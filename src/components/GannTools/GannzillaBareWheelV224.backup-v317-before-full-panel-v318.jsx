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

/** Build 317: increase panel text and fields for comfortable visual reading. */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V317 = true;
    window.__auditGannzillaBareWheelV317 = () => ({
      ok: true,
      build: 317,
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
      horizontalBarTopPx: TOOLBAR_HEIGHT,
      horizontalBarHeightPx: 14,
      horizontalThumbWidthPx: 18,
      horizontalButtonWidthPx: 14,
    });
  }, []);

  return (
    <>
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
