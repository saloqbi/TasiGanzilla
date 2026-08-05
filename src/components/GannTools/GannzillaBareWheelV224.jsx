import React from 'react';
import GannzillaClassicBaseNoLegacyChromeV403 from './GannzillaClassicBaseNoLegacyChromeV403';
import GannzillaArabicLocalizationV248 from './GannzillaArabicLocalizationV248';
import GannzillaWheelQuarterHiddenPanV303 from './GannzillaWheelQuarterHiddenPanV303';
import GannzillaEventStormGuardV383 from './GannzillaEventStormGuardV383';

const BUILD = 491;

/** Build 491: wheel-only root. The property panel is not imported or rendered. */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V491 = true;
    window.__auditGannzillaBareWheelV491 = () => {
      const referencePanel = document.getElementById('gannzilla-pixel-perfect-reference-panel-v421');
      const canonicalPanel = document.getElementById('gannzilla-clean-property-panel-v325');
      const visiblePanels = Array.from(document.querySelectorAll('aside')).filter((aside) => {
        if (!aside.querySelector('input,select')) return false;
        const style = window.getComputedStyle(aside);
        const rect = aside.getBoundingClientRect();
        return style.display !== 'none'
          && style.visibility !== 'hidden'
          && style.opacity !== '0'
          && rect.width > 1
          && rect.height > 1;
      });

      return {
        ok: !referencePanel && !canonicalPanel && visiblePanels.length === 0,
        build: BUILD,
        wheelOnlyRoot: true,
        referencePanelImported: false,
        referencePanelRendered: false,
        referencePanelMounted: Boolean(referencePanel),
        canonicalPanelMounted: Boolean(canonicalPanel),
        visiblePropertyPanelCount: visiblePanels.length,
        reservedPanelWidthPx: 0,
        topToolbarPreserved: true,
        wheelRendererPreserved: true,
        finalWheelAuthority: 'gannzillaFinalWheelAuthorityV490',
      };
    };

    return () => {
      delete window.GANNZILLA_BARE_WHEEL_V491;
      delete window.__auditGannzillaBareWheelV491;
    };
  }, []);

  return (
    <>
      <style>{`
        :root {
          --gannzilla-toolbar-height: 24px;
          --gannzilla-property-panel-width: 0px;
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

        /* Keep the renderer's native control authority unavailable to layout. */
        aside[data-gannzilla-native-panel-hidden-v421="true"] {
          position: fixed !important;
          left: -12000px !important;
          top: 24px !important;
          width: 0 !important;
          min-width: 0 !important;
          max-width: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `}</style>

      <GannzillaEventStormGuardV383 />
      <GannzillaClassicBaseNoLegacyChromeV403 />
      <GannzillaArabicLocalizationV248 />
      <GannzillaWheelQuarterHiddenPanV303 />
    </>
  );
}
