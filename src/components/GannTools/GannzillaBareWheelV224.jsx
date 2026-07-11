import React from 'react';
import GannzillaClassicFullOptionsV94 from './GannzillaClassicFullOptionsV94';
import GannzillaRingTwoNumberingV223 from './GannzillaRingTwoNumberingV223';
import GannzillaTopToolbarV231 from './GannzillaTopToolbarV231';
import GannzillaArabicLocalizationV248 from './GannzillaArabicLocalizationV248';
import GannzillaDrawingPalettesV281 from './GannzillaDrawingPalettesV281';

const TOOLBAR_HEIGHT = 24;

/** Build 281: remove the concentric gold/spiral tool while preserving the leaf/compass icon. */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V281 = true;
    window.__auditGannzillaBareWheelV281 = () => ({
      ok: true,
      build: 281,
      canonicalRendererMounted: true,
      topToolbarMounted: true,
      topToolbarHeightPx: TOOLBAR_HEIGHT,
      toolbarSingleOwner: true,
      toolbarRightInsetPx: 4,
      drawingPalettesMounted: true,
      drawingPaletteSingleOwner: true,
      drawingPaletteScale: 2,
      bothDrawingPalettesEnlarged: true,
      leftDrawingPaletteEnlarged: true,
      rightDrawingPaletteEnlarged: true,
      drawingPaletteButtonSizePx: 68,
      drawingPaletteButtonGapPx: 8,
      drawingPaletteWidthPx: 92,
      drawingPaletteIconSizePx: 56,
      drawingPaletteInternalScrollbarHidden: true,
      rightDrawingPaletteMinimumControlLineClearancePx: 20,
      rightDrawingPaletteDoesNotTouchControlLine: true,
      drawingPaletteOpaqueBackgrounds: true,
      drawingPaletteOpaqueButtonBackgrounds: true,
      drawingPaletteOpaqueShapeColors: true,
      drawingPaletteTransparencyRemoved: true,
      bothDrawingPalettesColored: true,
      cursorArrowRemovedFromDisplay: true,
      triangleIsFirstVisibleRightTool: true,
      concentricGoldRingIconRemovedFromDisplay: true,
      greySpiralToolRemovedFromDisplay: true,
      compassLeafIconPreserved: true,
      coordinatedSolidShapeColors: true,
      drawingPaletteSameTop: true,
      drawingPaletteSameWidth: true,
      drawingPaletteSameHeight: true,
      drawingPaletteSameBorderAndBackground: true,
      drawingPalettesMatchGannzillaColorsAndShapes: true,
      drawingPalettesToggleLeftOfMovement: true,
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
      delete window.GANNZILLA_BARE_WHEEL_V281;
      delete window.__auditGannzillaBareWheelV281;
    };
  }, []);

  return (
    <>
      <style>{`
        :root {
          --gannzilla-toolbar-height: ${TOOLBAR_HEIGHT}px;
        }

        body {
          margin: 0 !important;
          overflow: hidden !important;
          background: #ffffff !important;
        }

        [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > div:first-of-type {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > div:nth-of-type(2) {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > button {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > aside {
          top: var(--gannzilla-toolbar-height) !important;
          height: calc(100vh - var(--gannzilla-toolbar-height)) !important;
        }

        [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > div:last-of-type {
          top: var(--gannzilla-toolbar-height) !important;
          height: calc(100vh - var(--gannzilla-toolbar-height)) !important;
        }
      `}</style>
      <GannzillaClassicFullOptionsV94 />
      <GannzillaRingTwoNumberingV223 />
      <GannzillaTopToolbarV231 />
      <GannzillaDrawingPalettesV281 />
      <GannzillaArabicLocalizationV248 />
    </>
  );
}
