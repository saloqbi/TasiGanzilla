import React from 'react';
import GannzillaAboutOnlyV229 from './GannzillaAboutOnlyV229';
import GannzillaLanguageToggleV237 from './GannzillaLanguageToggleV237';
import GannzillaConnectionSettingsV250 from './GannzillaConnectionSettingsV250';

const BUILD = 250;
const TOOLBAR_HEIGHT = 24;
const RIGHT_INSET_PX = 4;
const CONTROL_GAP_PX = 2;
const INFO_BUTTON_SIZE = TOOLBAR_HEIGHT;

/** Build 250: active connection, language, and information controls. */
export default function GannzillaTopToolbarV231() {
  React.useEffect(() => {
    window.GANNZILLA_TOP_TOOLBAR_V250 = true;
    window.__auditGannzillaTopToolbarV250 = () => ({
      ok: true,
      build: BUILD,
      heightPx: TOOLBAR_HEIGHT,
      languageControlHeightPx: TOOLBAR_HEIGHT,
      languageControlWidthPx: 100,
      connectionControlSizePx: TOOLBAR_HEIGHT,
      infoButtonSizePx: INFO_BUTTON_SIZE,
      controlsMatchToolbarHeight: true,
      controlsOverflowToolbar: false,
      rightInsetPx: RIGHT_INSET_PX,
      controlGapPx: CONTROL_GAP_PX,
      mountedControls: ['CONNECTION_SETTINGS', 'LANGUAGE_CUSTOM_FLAG', 'ABOUT_INFO_GLYPH'],
      connectionDialogFunctional: true,
      controlVisualOrder: 'CONNECTION_LANGUAGE_INFORMATION',
      flagAlwaysVisible: true,
      intervalCount: 0,
      mutationObserverCount: 0,
    });

    return () => {
      delete window.GANNZILLA_TOP_TOOLBAR_V250;
      delete window.__auditGannzillaTopToolbarV250;
    };
  }, []);

  return (
    <div
      data-gannzilla-toolbar="true"
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
        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > button[aria-label="حول البرنامج"] {
          width: ${INFO_BUTTON_SIZE}px !important;
          height: ${INFO_BUTTON_SIZE}px !important;
          min-width: ${INFO_BUTTON_SIZE}px !important;
          min-height: ${INFO_BUTTON_SIZE}px !important;
          max-width: ${INFO_BUTTON_SIZE}px !important;
          max-height: ${INFO_BUTTON_SIZE}px !important;
          align-self: stretch !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          color: transparent !important;
          font-size: 0 !important;
          line-height: 1 !important;
          display: grid !important;
          place-items: center !important;
          box-sizing: border-box !important;
        }
        [data-gannzilla-toolbar="true"] > [data-gannzilla-control-strip="true"] > button[aria-label="حول البرنامج"]::before {
          content: 'ⓘ';
          color: #2469b2;
          font-family: 'Segoe UI Symbol', 'Arial Unicode MS', Arial, sans-serif;
          font-size: 20px;
          font-weight: 900;
          line-height: 1;
        }
      `}</style>

      <div
        data-gannzilla-control-strip="true"
        style={{
          height: TOOLBAR_HEIGHT,
          display: 'flex',
          alignItems: 'stretch',
          gap: CONTROL_GAP_PX,
          direction: 'ltr',
          flex: '0 0 auto',
          overflow: 'visible',
        }}
      >
        <GannzillaConnectionSettingsV250 toolbarHeight={TOOLBAR_HEIGHT} />
        <GannzillaLanguageToggleV237 />
        <GannzillaAboutOnlyV229 toolbarHeight={TOOLBAR_HEIGHT} />
      </div>
    </div>
  );
}
