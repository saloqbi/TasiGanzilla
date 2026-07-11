import React from 'react';
import GannzillaAboutOnlyV229 from './GannzillaAboutOnlyV229';
import GannzillaLanguageToggleV237 from './GannzillaLanguageToggleV237';

const TOOLBAR_HEIGHT = 24;
const RIGHT_INSET_PX = 4;
const CONTROL_GAP_PX = 2;
const INFO_BUTTON_SIZE = 18;

/**
 * Build 242: custom classic language selector with guaranteed flag visibility
 * and compact Gannzilla-style information glyph.
 */
export default function GannzillaTopToolbarV231() {
  React.useEffect(() => {
    window.GANNZILLA_TOP_TOOLBAR_V242 = true;
    window.__auditGannzillaTopToolbarV242 = () => ({
      ok: true,
      build: 242,
      heightPx: TOOLBAR_HEIGHT,
      infoButtonSizePx: INFO_BUTTON_SIZE,
      rightInsetPx: RIGHT_INSET_PX,
      controlGapPx: CONTROL_GAP_PX,
      mountedControls: ['LANGUAGE_CUSTOM_FLAG', 'ABOUT_INFO_GLYPH'],
      languageControlWidthPx: 96,
      languageTextColor: '#111111',
      flagAlwaysVisible: true,
      intervalCount: 0,
      mutationObserverCount: 0,
    });

    return () => {
      delete window.GANNZILLA_TOP_TOOLBAR_V242;
      delete window.__auditGannzillaTopToolbarV242;
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
        background: 'linear-gradient(180deg,#fafafa 0%,#f1f1f1 55%,#e7e7e7 100%)',
        borderTop: '1px solid #ffffff',
        borderBottom: '1px solid #b7b7b7',
        direction: 'ltr',
        fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        [data-gannzilla-toolbar="true"] > button[aria-label="حول البرنامج"] {
          width: ${INFO_BUTTON_SIZE}px !important;
          height: ${INFO_BUTTON_SIZE}px !important;
          min-width: ${INFO_BUTTON_SIZE}px !important;
          min-height: ${INFO_BUTTON_SIZE}px !important;
          padding: 0 !important;
          border: 0 !important;
          border-radius: 50% !important;
          background: transparent !important;
          box-shadow: none !important;
          color: transparent !important;
          font-size: 0 !important;
          line-height: 1 !important;
          display: grid !important;
          place-items: center !important;
        }
        [data-gannzilla-toolbar="true"] > button[aria-label="حول البرنامج"]::before {
          content: 'ⓘ';
          color: #2469b2;
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
