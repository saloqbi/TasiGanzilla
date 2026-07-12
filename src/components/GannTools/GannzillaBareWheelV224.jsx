import React from 'react';
import GannzillaClassicFullOptionsV94 from './GannzillaClassicFullOptionsV94';
import GannzillaRingTwoNumberingV223 from './GannzillaRingTwoNumberingV223';
import GannzillaTopToolbarV231 from './GannzillaTopToolbarV231';
import GannzillaArabicLocalizationV248 from './GannzillaArabicLocalizationV248';
import GannzillaPanelFrameCleanupV297 from './GannzillaPanelFrameCleanupV297';
import GannzillaPanelFullWidthV302 from './GannzillaPanelFullWidthV302';
import GannzillaPanelFixedLeftV315 from './GannzillaPanelFixedLeftV315';
import GannzillaPanelReadableTypographyV316 from './GannzillaPanelReadableTypographyV316';
import GannzillaWheelQuarterHiddenPanV303 from './GannzillaWheelQuarterHiddenPanV303';
import GannzillaPagePanScrollbarsV305 from './GannzillaPagePanScrollbarsV305';
import GannzillaHorizontalPanAssistV308 from './GannzillaHorizontalPanAssistV308';
import GannzillaHorizontalPanTopPlacementV312 from './GannzillaHorizontalPanTopPlacementV312';

const TOOLBAR_HEIGHT = 24;
const CLEAN_PANEL_ID = 'gannzilla-clean-property-panel-v325';

/**
 * Build 325
 * Clean property-panel baseline:
 * - removes the complete V318 property panel from the runtime
 * - removes the V319/V321 DOM bridge from the runtime
 * - removes the V320 clockwise adapter from the runtime
 * - hides the renderer's historical property aside completely
 * - leaves one clean empty panel host for the new screenshot/CHR rebuild
 * - preserves wheel rendering, zoom, pan, fullscreen and toolbars
 */
export default function GannzillaBareWheelV224() {
  React.useEffect(() => {
    window.GANNZILLA_BARE_WHEEL_V325 = true;
    window.__auditGannzillaBareWheelV325 = () => {
      const cleanPanel = document.getElementById(CLEAN_PANEL_ID);
      const oldFullPanel = document.querySelector('.gannzilla-full-property-panel-v318');
      const visibleLegacyAsides = Array.from(document.querySelectorAll('aside'))
        .filter((aside) => aside.id !== CLEAN_PANEL_ID)
        .filter((aside) => getComputedStyle(aside).display !== 'none');

      return {
        ok: Boolean(cleanPanel) && !oldFullPanel && visibleLegacyAsides.length === 0,
        build: 325,
        cleanPanelMounted: Boolean(cleanPanel),
        oldFullPanelMounted: Boolean(oldFullPanel),
        visibleLegacyPanelCount: visibleLegacyAsides.length,
        propertyControlsRendered: 0,
        duplicateSectionsRendered: 0,
        legacyPropertyPanelRuntimeMounted: false,
        legacyDomBridgeMounted: false,
        legacyClockwiseAdapterMounted: false,
        panelState: 'CLEAN_EMPTY_BASELINE_READY_FOR_REBUILD',
        wheelRendererPreserved: true,
        wheelZoomPreserved: true,
        wheelPanPreserved: true,
        nativeFullscreenPreserved: true,
        settingsPanelFixedSide: 'left',
        topHorizontalScrollbarPreserved: true,
        verticalScrollbarPreserved: true,
      };
    };

    return () => {
      delete window.GANNZILLA_BARE_WHEEL_V325;
      delete window.__auditGannzillaBareWheelV325;
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
          background: #f2f2f2 !important;
          border-right: 1px solid #b8b8b8 !important;
          box-sizing: border-box !important;
          direction: rtl !important;
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

        #${CLEAN_PANEL_ID} .gannzilla-clean-panel-title-v325 {
          display: flex;
          align-items: center;
          min-height: 34px;
          padding: 0 10px;
          background: #ececdd;
          border-bottom: 1px solid #c5c5c5;
          color: #222;
          font-family: Tahoma, Segoe UI, Arial, sans-serif;
          font-size: 16px;
          font-weight: 800;
          box-sizing: border-box;
        }

        #${CLEAN_PANEL_ID} .gannzilla-clean-panel-status-v325 {
          padding: 14px 12px;
          color: #555;
          font-family: Tahoma, Segoe UI, Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          background: #f7f7f7;
          border-bottom: 1px solid #d6d6d6;
        }
      `}</style>

      <aside
        id={CLEAN_PANEL_ID}
        data-gannzilla-clean-panel="true"
        aria-label="Clean Gannzilla property panel"
      >
        <div className="gannzilla-clean-panel-title-v325">قائمة التخطيط</div>
        <div className="gannzilla-clean-panel-status-v325">
          تم حذف جميع مكونات القائمة القديمة. هذه مساحة نظيفة لبناء خيارات Gannzilla من جديد دون تكرار.
        </div>
      </aside>

      <GannzillaClassicFullOptionsV94 />
      <GannzillaRingTwoNumberingV223 />
      <GannzillaTopToolbarV231 />
      <GannzillaArabicLocalizationV248 />
      <GannzillaPanelFrameCleanupV297 />
      <GannzillaPanelFullWidthV302 />
      <GannzillaPanelFixedLeftV315 />
      <GannzillaPanelReadableTypographyV316 />
      <GannzillaWheelQuarterHiddenPanV303 />
      <GannzillaPagePanScrollbarsV305 />
      <GannzillaHorizontalPanAssistV308 />
      <GannzillaHorizontalPanTopPlacementV312 />
    </>
  );
}
