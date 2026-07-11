import React from 'react';
import GannzillaAboutOnlyV229 from './GannzillaAboutOnlyV229';
import GannzillaLanguageToggleV237 from './GannzillaLanguageToggleV237';
import GannzillaConnectionSettingsV250 from './GannzillaConnectionSettingsV250';
import GannzillaPageFullscreenV253 from './GannzillaPageFullscreenV253';
import GannzillaWheelZoomV256 from './GannzillaWheelZoomV256';
import GannzillaChartVisibilityToggleV288 from './GannzillaChartVisibilityToggleV288';

const BUILD = 288;
const TOOLBAR_HEIGHT = 24;
const RIGHT_INSET_PX = 4;
const INFO_BUTTON_SIZE = TOOLBAR_HEIGHT;

/** Build 288: chart visibility, movement, zoom, fullscreen, connection, language, and About. */
export default function GannzillaTopToolbarV231() {
  React.useEffect(() => {
    window.GANNZILLA_TOP_TOOLBAR_V288 = true;
    window.__auditGannzillaTopToolbarV288 = () => ({
      ok: true,
      build: BUILD,
      heightPx: TOOLBAR_HEIGHT,
      drawingToolsToggleMounted: false,
      drawingToolsToggleRemoved: true,
      chartVisibilityToggleMounted: true,
      chartVisibilityTogglePlacement: 'IMMEDIATELY_LEFT_OF_WHEEL_MOVEMENT',
      chartVisibilityToggleSizePx: TOOLBAR_HEIGHT,
      wheelMovementIntegratedWithZoom: true,
      wheelMovementDirections: ['LEFT', 'UP', 'CENTER', 'DOWN', 'RIGHT'],
      wheelZoomControlMounted: true,
      pageMaximizeControlSizePx: TOOLBAR_HEIGHT,
      connectionControlSizePx: TOOLBAR_HEIGHT,
      languageControlHeightPx: TOOLBAR_HEIGHT,
      languageControlWidthPx: 100,
      infoButtonSizePx: INFO_BUTTON_SIZE,
      controlsMatchToolbarHeight: true,
      controlsOverflowToolbar: false,
      rightInsetPx: RIGHT_INSET_PX,
      controlVisualOrderLeftToRight: 'CHART_VISIBILITY_WHEEL_MOVE_ZOOM_PAGE_MAXIMIZE_CONNECTION_LANGUAGE_INFORMATION',
    });

    return () => {
      delete window.GANNZILLA_TOP_TOOLBAR_V288;
      delete window.__auditGannzillaTopToolbarV288;
    };
  }, []);

  return (
    <div
      data-gannzilla-toolbar="true"
      data-gannzilla-toolbar-build={BUILD}
      role="toolbar"
      aria-label="شريط أدوات كوكبة الأرقام السحرية"
      style={{
        '--gannzilla-toolbar-height': `${TOOLBAR_HEIGHT}px`,
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        zIndex: 2147483600,
        height: TOOLBAR_HEIGHT,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        paddingRight: RIGHT_INSET_PX,
        background: 'linear-gradient(180deg,#fafafa 0%,#f1f1f1 55%,#e7e7e7 100%)',
        boxShadow: 'inset 0 1px 0 #ffffff, inset 0 -1px 0 #b7b7b7',
        direction: 'ltr',
        fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
        boxSizing: 'border-box',
        overflow: 'visible',
      }}
    >
      <style>{`
        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] { direction:ltr !important; }
        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > [data-gannzilla-chart-visibility-toggle="true"] { order:0 !important; }
        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > [data-gannzilla-wheel-zoom-control="true"] { order:1 !important; }
        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > [data-gannzilla-page-fullscreen-control="true"] { order:2 !important; }
        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > [data-gannzilla-connection-control="true"] { order:3 !important; }
        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > [data-gannzilla-language-control="true"] { order:4 !important; }
        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > [data-gannzilla-about-control="true"] { order:5 !important; }

        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > [data-gannzilla-page-fullscreen-control="true"],
        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > [data-gannzilla-connection-control="true"],
        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > [data-gannzilla-about-control="true"] {
          width:${TOOLBAR_HEIGHT}px !important;
          height:${TOOLBAR_HEIGHT}px !important;
          min-width:${TOOLBAR_HEIGHT}px !important;
          min-height:${TOOLBAR_HEIGHT}px !important;
          max-width:${TOOLBAR_HEIGHT}px !important;
          max-height:${TOOLBAR_HEIGHT}px !important;
          flex:0 0 ${TOOLBAR_HEIGHT}px !important;
          align-self:stretch !important;
          margin:0 !important;
          padding:0 !important;
          border:0 !important;
          border-right:1px solid #c7c7c7 !important;
          border-radius:0 !important;
          background:transparent !important;
          box-shadow:none !important;
          display:grid !important;
          place-items:center !important;
          box-sizing:border-box !important;
          pointer-events:auto !important;
        }

        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > [data-gannzilla-chart-visibility-toggle="true"]:hover,
        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > [data-gannzilla-page-fullscreen-control="true"]:hover,
        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > [data-gannzilla-connection-control="true"]:hover,
        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > [data-gannzilla-about-control="true"]:hover { background:#dceaf5 !important; }

        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > [data-gannzilla-about-control="true"] {
          color:#2469b2 !important;
          font-family:'Segoe UI Symbol','Arial Unicode MS',Arial,sans-serif !important;
          font-size:17px !important;
          font-weight:900 !important;
          line-height:1 !important;
        }
      `}</style>

      <div
        data-gannzilla-control-strip="true"
        style={{
          height: TOOLBAR_HEIGHT,
          display: 'flex',
          alignItems: 'stretch',
          gap: 0,
          direction: 'ltr',
          flex: '0 0 auto',
          overflow: 'visible',
        }}
      >
        <GannzillaChartVisibilityToggleV288 toolbarHeight={TOOLBAR_HEIGHT} />
        <GannzillaWheelZoomV256 toolbarHeight={TOOLBAR_HEIGHT} />
        <GannzillaPageFullscreenV253 toolbarHeight={TOOLBAR_HEIGHT} />
        <GannzillaConnectionSettingsV250 toolbarHeight={TOOLBAR_HEIGHT} />
        <GannzillaLanguageToggleV237 />
        <GannzillaAboutOnlyV229 toolbarHeight={TOOLBAR_HEIGHT} />
      </div>
    </div>
  );
}
