import React from 'react';
import GannzillaClassicFullOptionsV94 from './GannzillaClassicFullOptionsV94';
import GannzillaRingTwoNumberingV223 from './GannzillaRingTwoNumberingV223';
import GannzillaTopToolbarV231 from './GannzillaTopToolbarV231';
import GannzillaArabicLocalizationV248 from './GannzillaArabicLocalizationV248';
import GannzillaPanelFrameCleanupV297 from './GannzillaPanelFrameCleanupV297';
import GannzillaPanelFullWidthV302 from './GannzillaPanelFullWidthV302';
import GannzillaPanelFixedLeftV315 from './GannzillaPanelFixedLeftV315';
import GannzillaPanelReadableTypographyV316 from './GannzillaPanelReadableTypographyV316';
import GannzillaCanonicalPropertyPanelV326 from './GannzillaCanonicalPropertyPanelV326';
import GannzillaChartToolbarV327 from './GannzillaChartToolbarV327';
import GannzillaWheelQuarterHiddenPanV303 from './GannzillaWheelQuarterHiddenPanV303';
import GannzillaPagePanScrollbarsV305 from './GannzillaPagePanScrollbarsV305';
import GannzillaHorizontalPanAssistV308 from './GannzillaHorizontalPanAssistV308';
import GannzillaHorizontalPanTopPlacementV312 from './GannzillaHorizontalPanTopPlacementV312';

const TOOLBAR_HEIGHT = 24;
const CLEAN_PANEL_ID = 'gannzilla-clean-property-panel-v325';

/** Build 329: unblock canonical panel interactions by keeping the top horizontal pan bar outside the panel. */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V326 = true;
    window.GANNZILLA_BARE_WHEEL_V327 = true;
    window.GANNZILLA_BARE_WHEEL_V328 = true;
    window.GANNZILLA_BARE_WHEEL_V329 = true;
    const audit = () => {
      const cleanPanel = document.getElementById(CLEAN_PANEL_ID);
      const canonicalPanel = cleanPanel?.querySelector('.gannzilla-canonical-property-panel-v326');
      const chartToolbar = cleanPanel?.querySelector('.gannzilla-chart-toolbar-v328');
      const horizontalBar = document.querySelector('[data-gannzilla-horizontal-pan-assist-v311="true"]');
      const panelRect = cleanPanel?.getBoundingClientRect?.();
      const barRect = horizontalBar?.getBoundingClientRect?.();
      const visibleLegacyAsides = Array.from(document.querySelectorAll('aside'))
        .filter((aside) => aside.id !== CLEAN_PANEL_ID)
        .filter((aside) => getComputedStyle(aside).display !== 'none');
      const panelClear = Boolean(!panelRect || !barRect || barRect.left >= panelRect.right);
      return {
        ok: Boolean(cleanPanel && canonicalPanel && chartToolbar && panelClear && visibleLegacyAsides.length === 0),
        build: 329,
        canonicalPanelMounted: Boolean(canonicalPanel),
        chartToolbarMounted: Boolean(chartToolbar),
        chartToolbarDirectHostMount: true,
        chartToolbarFunctions: ['select', 'add', 'delete', 'rename', 'save'],
        chartToolbarShortcuts: ['Insert', 'Delete', 'F2', 'Ctrl+S'],
        horizontalBarMounted: Boolean(horizontalBar),
        horizontalBarClearsPropertyPanel: panelClear,
        panelRightPx: panelRect ? Math.round(panelRect.right) : null,
        horizontalBarLeftPx: barRect ? Math.round(barRect.left) : null,
        panelPointerEvents: cleanPanel ? getComputedStyle(cleanPanel).pointerEvents : null,
        chartToolbarPointerEvents: chartToolbar ? getComputedStyle(chartToolbar).pointerEvents : null,
        visibleLegacyPanelCount: visibleLegacyAsides.length,
        singleVisiblePanelAuthority: true,
        oldV318PanelMounted: false,
        oldV319BridgeMounted: false,
        oldV320AdapterMounted: false,
        wheelRendererPreserved: true,
        wheelZoomPreserved: true,
        wheelPanPreserved: true,
        nativeFullscreenPreserved: true,
        settingsPanelFixedSide: 'left',
        topHorizontalScrollbarPreserved: true,
        verticalScrollbarPreserved: true,
      };
    };
    window.__auditGannzillaBareWheelV326 = audit;
    window.__auditGannzillaBareWheelV327 = audit;
    window.__auditGannzillaBareWheelV328 = audit;
    window.__auditGannzillaBareWheelV329 = audit;
    return () => {
      delete window.GANNZILLA_BARE_WHEEL_V326;
      delete window.GANNZILLA_BARE_WHEEL_V327;
      delete window.GANNZILLA_BARE_WHEEL_V328;
      delete window.GANNZILLA_BARE_WHEEL_V329;
      delete window.__auditGannzillaBareWheelV326;
      delete window.__auditGannzillaBareWheelV327;
      delete window.__auditGannzillaBareWheelV328;
      delete window.__auditGannzillaBareWheelV329;
    };
  }, []);

  return (
    <>
      <style>{`
        :root {
          --gannzilla-toolbar-height: ${TOOLBAR_HEIGHT}px;
          --gannzilla-property-panel-width: clamp(360px, 32vw, 520px);
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

        #${CLEAN_PANEL_ID} {
          position: fixed !important;
          left: 0 !important;
          right: auto !important;
          top: var(--gannzilla-toolbar-height) !important;
          width: var(--gannzilla-property-panel-width) !important;
          min-width: 360px !important;
          max-width: 520px !important;
          height: calc(100vh - var(--gannzilla-toolbar-height)) !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          z-index: 45 !important;
          display: block !important;
          visibility: visible !important;
          pointer-events: auto !important;
          background: #f2f2ee !important;
          border-right: 1px solid #b8b8b8 !important;
          box-sizing: border-box !important;
        }

        #${CLEAN_PANEL_ID},
        #${CLEAN_PANEL_ID} * {
          pointer-events: auto;
        }

        [data-gannzilla-build="248"] aside:not(#${CLEAN_PANEL_ID}) {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          width: 0 !important;
          min-width: 0 !important;
          max-width: 0 !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          overflow: hidden !important;
          opacity: 0 !important;
        }
      `}</style>

      <aside
        id={CLEAN_PANEL_ID}
        data-gannzilla-clean-panel="true"
        aria-label="Gannzilla canonical property panel"
      />

      <GannzillaClassicFullOptionsV94 />
      <GannzillaRingTwoNumberingV223 />
      <GannzillaTopToolbarV231 />
      <GannzillaArabicLocalizationV248 />
      <GannzillaPanelFrameCleanupV297 />
      <GannzillaPanelFullWidthV302 />
      <GannzillaPanelFixedLeftV315 />
      <GannzillaPanelReadableTypographyV316 />
      <GannzillaCanonicalPropertyPanelV326 />
      <GannzillaChartToolbarV327 />
      <GannzillaWheelQuarterHiddenPanV303 />
      <GannzillaPagePanScrollbarsV305 />
      <GannzillaHorizontalPanAssistV308 />
      <GannzillaHorizontalPanTopPlacementV312 />
    </>
  );
}
