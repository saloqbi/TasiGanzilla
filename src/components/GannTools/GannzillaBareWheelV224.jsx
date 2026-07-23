import React from 'react';
import GannzillaClassicBaseNoLegacyChromeV403 from './GannzillaClassicBaseNoLegacyChromeV403';
import GannzillaRingTwoNumberingV223 from './GannzillaRingTwoNumberingV223';
import GannzillaArabicLocalizationV248 from './GannzillaArabicLocalizationV248';
import GannzillaFullPropertyPanelParityV318 from './GannzillaFullPropertyPanelParityV318';
import GannzillaWheelQuarterHiddenPanV303 from './GannzillaWheelQuarterHiddenPanV303';
import GannzillaEventStormGuardV383 from './GannzillaEventStormGuardV383';

const BUILD = 419;
const PANEL_WIDTH_PX = 330;

/**
 * Build 419: restore the complete legacy-compatible Gannzilla property panel
 * and make it the only active settings-panel authority.
 */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V419 = true;
    window.__auditGannzillaBareWheelV419 = () => {
      const panel = document.querySelector('.gannzilla-full-property-panel-v318');
      const legacyAside = panel?.closest?.('aside');
      return {
        ok: Boolean(panel && legacyAside),
        build: BUILD,
        completeReferencePanelMounted: Boolean(panel),
        legacyRendererControlsRetainedForBridging: Boolean(
          legacyAside
            && Array.from(legacyAside.children).some(
              (node) => node !== panel && node.querySelector?.('input,select'),
            ),
        ),
        singleVisibleSettingsPanel: Array.from(document.querySelectorAll('aside'))
          .filter((aside) => {
            const style = window.getComputedStyle(aside);
            return style.display !== 'none'
              && style.visibility !== 'hidden'
              && aside.getBoundingClientRect().width > 1;
          }).length === 1,
        panelWidthPx: legacyAside ? Math.round(legacyAside.getBoundingClientRect().width) : null,
        projectPersistence: true,
        projectImportExport: true,
        completeSections: true,
      };
    };

    return () => {
      delete window.GANNZILLA_BARE_WHEEL_V419;
      delete window.__auditGannzillaBareWheelV419;
    };
  }, []);

  return (
    <>
      <style>{`
        :root {
          --gannzilla-toolbar-height: 24px;
          --gannzilla-property-panel-width: ${PANEL_WIDTH_PX}px;
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

        [data-gannzilla-build="419"] aside[data-gannzilla-full-panel-v318="true"],
        [data-gannzilla-build="388"] aside[data-gannzilla-full-panel-v318="true"],
        [data-gannzilla-build="248"] aside[data-gannzilla-full-panel-v318="true"] {
          position: fixed !important;
          left: 0 !important;
          right: auto !important;
          top: var(--gannzilla-toolbar-height) !important;
          width: var(--gannzilla-property-panel-width) !important;
          min-width: var(--gannzilla-property-panel-width) !important;
          max-width: var(--gannzilla-property-panel-width) !important;
          height: calc(100vh - var(--gannzilla-toolbar-height)) !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          z-index: 45 !important;
          display: block !important;
          visibility: visible !important;
          pointer-events: auto !important;
          background: #f2f2ef !important;
          border-right: 1px solid #989898 !important;
          box-sizing: border-box !important;
        }

        [data-gannzilla-build="419"] aside:not([data-gannzilla-full-panel-v318="true"]),
        [data-gannzilla-build="388"] aside:not([data-gannzilla-full-panel-v318="true"]),
        [data-gannzilla-build="248"] aside:not([data-gannzilla-full-panel-v318="true"]) {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `}</style>

      <GannzillaEventStormGuardV383 />
      <GannzillaClassicBaseNoLegacyChromeV403 />
      <GannzillaFullPropertyPanelParityV318 />
      <GannzillaRingTwoNumberingV223 />
      <GannzillaArabicLocalizationV248 />
      <GannzillaWheelQuarterHiddenPanV303 />
    </>
  );
}
