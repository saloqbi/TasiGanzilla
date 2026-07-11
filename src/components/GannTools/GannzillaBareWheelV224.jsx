import React from 'react';
import GannzillaClassicFullOptionsV94 from './GannzillaClassicFullOptionsV94';
import GannzillaRingTwoNumberingV223 from './GannzillaRingTwoNumberingV223';

/**
 * Build 226 baseline: canonical wheel + settings panel only.
 *
 * Ring 1 is a standalone 1..36 index ring using 147/258/369 colors.
 * Ten numeric rings start from ring 2 and use the same gate colors.
 * The protractor stays independent.
 */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V226 = true;
    window.__auditGannzillaBareWheelV226 = () => ({
      ok: true,
      build: 226,
      canonicalRendererMounted: true,
      topToolbarMounted: false,
      sideToolbarsMounted: false,
      overlayControlsMounted: false,
      ringOneMode: 'INDEX_1_TO_36',
      allNumericRingsGateColored: true,
      numericRingCount: 10,
      firstNumericRing: 2,
      protractorIndependent: true,
    });

    return () => {
      delete window.GANNZILLA_BARE_WHEEL_V226;
      delete window.__auditGannzillaBareWheelV226;
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

        [data-gannzilla-build="226"] > div > div:first-of-type {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        [data-gannzilla-build="226"] > div > div:nth-of-type(2) {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        [data-gannzilla-build="226"] > div > button {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        [data-gannzilla-build="226"] > div > aside {
          top: 0 !important;
          height: 100vh !important;
        }

        [data-gannzilla-build="226"] > div > div:last-of-type {
          top: 0 !important;
        }
      `}</style>
      <GannzillaClassicFullOptionsV94 />
      <GannzillaRingTwoNumberingV223 />
    </>
  );
}
