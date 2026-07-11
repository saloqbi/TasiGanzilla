import React from 'react';
import GannzillaClassicFullOptionsV94 from './GannzillaClassicFullOptionsV94';
import GannzillaRingTwoNumberingV223 from './GannzillaRingTwoNumberingV223';
import GannzillaAboutOnlyV229 from './GannzillaAboutOnlyV229';

/**
 * Build 229: stable V228 wheel plus the first restored control: About.
 *
 * Ring 1 is a standalone 1..36 index ring using 147/258/369 colors.
 * Ten numeric rings start from ring 2 and use the same gate colors.
 * The wheel uses the warm Gannzilla-style alternating ring palette.
 * The About icon/dialog is React-owned with no interval or MutationObserver.
 */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V229 = true;
    window.__auditGannzillaBareWheelV229 = () => ({
      ok: true,
      build: 229,
      canonicalRendererMounted: true,
      topToolbarMounted: false,
      sideToolbarsMounted: false,
      aboutControlMounted: true,
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
      delete window.GANNZILLA_BARE_WHEEL_V229;
      delete window.__auditGannzillaBareWheelV229;
    };
  }, []);

  return (
    <>
      <style>{`
        body {
          margin: 0 !important;
          overflow: hidden !important;
          background: #ffffff !important;
        }

        [data-gannzilla-build="229"] > div > div:first-of-type {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        [data-gannzilla-build="229"] > div > div:nth-of-type(2) {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        [data-gannzilla-build="229"] > div > button {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        [data-gannzilla-build="229"] > div > aside {
          top: 0 !important;
          height: 100vh !important;
        }

        [data-gannzilla-build="229"] > div > div:last-of-type {
          top: 0 !important;
        }
      `}</style>
      <GannzillaClassicFullOptionsV94 />
      <GannzillaRingTwoNumberingV223 />
      <GannzillaAboutOnlyV229 />
    </>
  );
}
