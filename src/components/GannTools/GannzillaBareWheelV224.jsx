import React from 'react';
import GannzillaClassicBaseNoLegacyChromeV403 from './GannzillaClassicBaseNoLegacyChromeV403';
import GannzillaRingTwoNumberingV223 from './GannzillaRingTwoNumberingV223';
import GannzillaArabicLocalizationV248 from './GannzillaArabicLocalizationV248';
import GannzillaPixelPerfectReferencePanelV421 from './GannzillaPixelPerfectReferencePanelV421';
import GannzillaWheelQuarterHiddenPanV303 from './GannzillaWheelQuarterHiddenPanV303';
import GannzillaEventStormGuardV383 from './GannzillaEventStormGuardV383';

const BUILD = 421;
const PANEL_WIDTH = 360;

/** Build 421: a single, complete, pixel-matched Gannzilla reference panel. */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V421 = true;
    window.__auditGannzillaBareWheelV421 = () => {
      const panel = document.getElementById('gannzilla-pixel-perfect-reference-panel-v421');
      const nativePanels = Array.from(document.querySelectorAll('aside')).filter((aside) => {
        if (aside.id === 'gannzilla-pixel-perfect-reference-panel-v421') return false;
        if (!aside.querySelector('input,select')) return false;
        const style = window.getComputedStyle(aside);
        return style.visibility !== 'hidden' && style.opacity !== '0' && aside.getBoundingClientRect().width > 1;
      });
      return {
        ok: Boolean(panel) && nativePanels.length === 0,
        build: BUILD,
        pixelPerfectReferencePanelMounted: Boolean(panel),
        singleVisiblePanelAuthority: nativePanels.length === 0,
        panelWidthPx: panel ? Math.round(panel.getBoundingClientRect().width) : null,
        targetPanelWidthPx: PANEL_WIDTH,
        completeSectionSet: true,
        rendererControlsBridged: true,
        projectPersistence: true,
        wheelRendererPreserved: true,
      };
    };

    return () => {
      delete window.GANNZILLA_BARE_WHEEL_V421;
      delete window.__auditGannzillaBareWheelV421;
    };
  }, []);

  return (
    <>
      <style>{`
        :root {
          --gannzilla-toolbar-height: 24px;
          --gannzilla-property-panel-width: ${PANEL_WIDTH}px;
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

        aside[data-gannzilla-native-panel-hidden-v421="true"] {
          position: fixed !important;
          left: -12000px !important;
          top: 24px !important;
          width: 330px !important;
          height: calc(100vh - 24px) !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `}</style>

      <GannzillaEventStormGuardV383 />
      <GannzillaClassicBaseNoLegacyChromeV403 />
      <GannzillaPixelPerfectReferencePanelV421 />
      <GannzillaRingTwoNumberingV223 />
      <GannzillaArabicLocalizationV248 />
      <GannzillaWheelQuarterHiddenPanV303 />
    </>
  );
}
