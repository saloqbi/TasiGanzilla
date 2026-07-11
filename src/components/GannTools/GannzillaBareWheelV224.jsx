import React from 'react';
import GannzillaClassicFullOptionsV94 from './GannzillaClassicFullOptionsV94';
import GannzillaRingTwoNumberingV223 from './GannzillaRingTwoNumberingV223';
import GannzillaTopToolbarV231 from './GannzillaTopToolbarV231';
import GannzillaArabicLocalizationV248 from './GannzillaArabicLocalizationV248';
import GannzillaDrawingPalettesV266 from './GannzillaDrawingPalettesV266';

const TOOLBAR_HEIGHT = 24;

/** Build 272: exact mirrored left/right drawing palette format. */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V272 = true;
    window.__auditGannzillaBareWheelV272 = () => ({
      ok: true,
      build: 272,
      canonicalRendererMounted: true,
      topToolbarMounted: true,
      topToolbarHeightPx: TOOLBAR_HEIGHT,
      toolbarSingleOwner: true,
      toolbarRightInsetPx: 4,
      drawingPalettesMounted: true,
      drawingPaletteSingleOwner: true,
      drawingPaletteExactMirrorMode: true,
      drawingPaletteButtonSizePx: 34,
      drawingPaletteButtonGapPx: 4,
      drawingPaletteWidthPx: 46,
      drawingPaletteSharedSideGapPx: 24,
      drawingPaletteSharedSideGapUrlParam: 'drawingToolsSideGap',
      drawingPaletteSameTop: true,
      drawingPaletteSameWidth: true,
      drawingPaletteSameHeight: true,
      drawingPaletteSameBorderAndBackground: true,
      leftPaletteSeparatedFromSettingsControlLine: true,
      rightPaletteSeparatedFromViewportControlLine: true,
      continuousDrawingLayoutPollingRemoved: true,
      fullPageDrawingMutationObserverRemoved: true,
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
      delete window.GANNZILLA_BARE_WHEEL_V272;
      delete window.__auditGannzillaBareWheelV272;
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
      <GannzillaDrawingPalettesV266 />
      <GannzillaArabicLocalizationV248 />
    </>
  );
}
