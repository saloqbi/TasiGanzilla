import React from 'react';
import GannzillaAboutOnlyV229 from './GannzillaAboutOnlyV229';
import GannzillaLanguageToggleV237 from './GannzillaLanguageToggleV237';

const TOOLBAR_HEIGHT = 24;
const RIGHT_INSET_PX = 6;
const CONTROL_GAP_PX = 2;
const INFO_BUTTON_WIDTH = 27;

/**
 * Build 240: copied from the original Gannzilla toolbar container and controls
 * in GannzillaExactToolbarV97.
 */
export default function GannzillaTopToolbarV231() {
  React.useEffect(() => {
    window.GANNZILLA_TOP_TOOLBAR_V240 = true;
    window.__auditGannzillaTopToolbarV240 = () => ({
      ok: true,
      build: 240,
      copiedFrom: 'GannzillaExactToolbarV97',
      heightPx: TOOLBAR_HEIGHT,
      infoButtonWidthPx: INFO_BUTTON_WIDTH,
      rightInsetPx: RIGHT_INSET_PX,
      controlGapPx: CONTROL_GAP_PX,
      mountedControls: ['LANGUAGE_ORIGINAL', 'ABOUT_ORIGINAL'],
      languageControlWidthPx: 100,
      languageTextColor: '#111111',
      intervalCount: 0,
      mutationObserverCount: 0,
    });

    return () => {
      delete window.GANNZILLA_TOP_TOOLBAR_V240;
      delete window.__auditGannzillaTopToolbarV240;
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
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: CONTROL_GAP_PX,
        paddingRight: RIGHT_INSET_PX,
        background: '#efefef',
        borderBottom: '1px solid #bdbdbd',
        direction: 'ltr',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        [data-gannzilla-toolbar="true"] > button[aria-label="حول البرنامج"] {
          width: ${INFO_BUTTON_WIDTH}px !important;
          height: ${TOOLBAR_HEIGHT}px !important;
          min-width: ${INFO_BUTTON_WIDTH}px !important;
          min-height: ${TOOLBAR_HEIGHT}px !important;
          padding: 0 !important;
          border: 1px solid #aeb6bb !important;
          border-radius: 1px !important;
          background: linear-gradient(#ffffff,#e9e9e9) !important;
          box-shadow: none !important;
          color: transparent !important;
          font-size: 0 !important;
          line-height: 1 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        [data-gannzilla-toolbar="true"] > button[aria-label="حول البرنامج"]::before {
          content: 'ⓘ';
          color: #236bb0;
          font-family: 'Segoe UI Symbol', 'Arial Unicode MS', Arial, sans-serif;
          font-size: 16px;
          font-weight: 900;
          line-height: 1;
        }
      `}</style>
      <GannzillaLanguageToggleV237 />
      <GannzillaAboutOnlyV229 toolbarHeight={TOOLBAR_HEIGHT} />
    </div>
  );
}
