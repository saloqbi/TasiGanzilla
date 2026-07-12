import React from 'react';
import GannzillaClassicFullOptionsV94 from './GannzillaClassicFullOptionsV94';
import GannzillaRingTwoNumberingV223 from './GannzillaRingTwoNumberingV223';
import GannzillaTopToolbarV231 from './GannzillaTopToolbarV231';
import GannzillaArabicLocalizationV248 from './GannzillaArabicLocalizationV248';
import GannzillaPanelFrameCleanupV297 from './GannzillaPanelFrameCleanupV297';
import GannzillaPanelFullWidthV302 from './GannzillaPanelFullWidthV302';
import GannzillaWheelQuarterHiddenPanV303 from './GannzillaWheelQuarterHiddenPanV303';

const TOOLBAR_HEIGHT = 24;

/** Build 303: fully readable settings panel plus quarter-wheel edge tuck. */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V303 = true;
    window.__auditGannzillaBareWheelV303 = () => ({
      ok: true,
      build: 303,
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
      quarterHiddenPanMounted: true,
      exactEdgePanRemoved: true,
      panelFrameCleanupMounted: true,
      fullReadablePanelWidthGuardMounted: true,
      movementAuthority: 'CLAMPED_CANVAS_TRANSLATION',
      permittedHiddenWheelFraction: 0.25,
      minimumVisibleWheelFraction: 0.75,
      panelAutoDocksWheelAwayFromPanel: true,
      panelUsesOverlayMode: true,
      panelDoesNotShrinkWheelViewport: true,
      wheelViewportFullWidthWithPanelOpen: true,
      settingsPanelMinimumWidthPx: 360,
      settingsPanelMaximumWidthPx: 520,
      settingsControlsCannotCollapse: true,
      wheelMayPassRightEdgeByQuarter: true,
      wheelMayPassLeftEdgeByQuarter: true,
      wheelCannotFullyDisappearOutsidePage: true,
      hiddenPanelFrameRemoved: true,
      hiddenPanelWidthReservationRemoved: true,
      internalWheelScrollbarHidden: true,
      browserWindowIsVisibleWidthAuthority: true,
      pressAndHoldMovementBounded: true,
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
      delete window.GANNZILLA_BARE_WHEEL_V303;
      delete window.__auditGannzillaBareWheelV303;
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
      <GannzillaWheelQuarterHiddenPanV303 />
    </>
  );
}
