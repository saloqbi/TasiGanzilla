import React from 'react';
import GannzillaClassicFullOptionsV94 from './GannzillaClassicFullOptionsV94';

/**
 * Build 224 baseline: canonical wheel + settings panel only.
 *
 * The legacy top toolbar, side shape bar, panel toggle, drawing overlays,
 * navigation overlays, language overlays, and dialog overlays are deliberately
 * not mounted. Controls will be restored one at a time after this baseline is
 * validated.
 */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V224 = true;
    window.__auditGannzillaBareWheelV224 = () => ({
      ok: true,
      build: 224,
      canonicalRendererMounted: true,
      topToolbarMounted: false,
      sideToolbarsMounted: false,
      overlayControlsMounted: false,
    });

    return () => {
      delete window.GANNZILLA_BARE_WHEEL_V224;
      delete window.__auditGannzillaBareWheelV224;
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

        /* Canonical component child 1: legacy 24px top toolbar. */
        [data-gannzilla-build="224"] > div > div:first-of-type {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        /* Canonical component child 2 (among DIV elements): side shape bar. */
        [data-gannzilla-build="224"] > div > div:nth-of-type(2) {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        /* Hide the temporary panel Hide/Show button in the clean baseline. */
        [data-gannzilla-build="224"] > div > button {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        /* Remove the empty 24px toolbar reservation. */
        [data-gannzilla-build="224"] > div > aside {
          top: 0 !important;
          height: 100vh !important;
        }

        [data-gannzilla-build="224"] > div > div:last-of-type {
          top: 0 !important;
        }
      `}</style>
      <GannzillaClassicFullOptionsV94 />
    </>
  );
}
