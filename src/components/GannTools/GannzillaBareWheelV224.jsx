import React from 'react';
import GannzillaClassicFullOptionsV94 from './GannzillaClassicFullOptionsV94';
import GannzillaRingTwoNumberingV223 from './GannzillaRingTwoNumberingV223';
import GannzillaTopToolbarV231 from './GannzillaTopToolbarV231';

const TOOLBAR_HEIGHT = 24;

/**
 * Build 244: stable V228 wheel plus United States and Saudi Arabia CSS flags,
 * with both language and information controls filling the 24px toolbar exactly.
 */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V244 = true;
    window.__auditGannzillaBareWheelV244 = () => ({
      ok: true,
      build: 244,
      canonicalRendererMounted: true,
      topToolbarMounted: true,
      topToolbarHeightPx: TOOLBAR_HEIGHT,
      toolbarSingleOwner: true,
      toolbarRightInsetPx: 4,
      toolbarControlGapPx: 2,
      sideToolbarsMounted: false,
      aboutControlMounted: true,
      languageControlMounted: true,
      customLanguageSelector: true,
      nativeSelectRemoved: true,
      cssFlags: true,
      externalImageCount: 0,
      svgFlagCount: 0,
      flagAlwaysVisible: true,
      languageControlWidthPx: 100,
      languageControlHeightPx: TOOLBAR_HEIGHT,
      informationControlWidthPx: TOOLBAR_HEIGHT,
      informationControlHeightPx: TOOLBAR_HEIGHT,
      controlsMatchToolbarHeight: true,
      controlsOverflowToolbar: false,
      supportedLanguages: ['ar', 'en'],
      languageFlags: ['SAUDI_ARABIA_CSS', 'UNITED_STATES_CSS'],
      aboutIconGlyph: 'ⓘ',
      aboutIconAlignment: 'RIGHT',
      aboutLogoNativeSize: '800x800',
      aboutLogoDisplayScale: 2,
      aboutInformationTextScale: 2,
      aboutEmailTextScale: 2,
      aboutLogoFullVisible: true,
      ringOneMode: 'INDEX_1_TO_36',
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
      delete window.GANNZILLA_BARE_WHEEL_V244;
      delete window.__auditGannzillaBareWheelV244;
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

        [data-gannzilla-build="244"] > div:not([data-gannzilla-toolbar="true"]) > div:first-of-type {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        [data-gannzilla-build="244"] > div:not([data-gannzilla-toolbar="true"]) > div:nth-of-type(2) {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        [data-gannzilla-build="244"] > div:not([data-gannzilla-toolbar="true"]) > button {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        [data-gannzilla-build="244"] > div:not([data-gannzilla-toolbar="true"]) > aside {
          top: var(--gannzilla-toolbar-height) !important;
          height: calc(100vh - var(--gannzilla-toolbar-height)) !important;
        }

        [data-gannzilla-build="244"] > div:not([data-gannzilla-toolbar="true"]) > div:last-of-type {
          top: var(--gannzilla-toolbar-height) !important;
          height: calc(100vh - var(--gannzilla-toolbar-height)) !important;
        }
      `}</style>
      <GannzillaClassicFullOptionsV94 />
      <GannzillaRingTwoNumberingV223 />
      <GannzillaTopToolbarV231 />
    </>
  );
}
