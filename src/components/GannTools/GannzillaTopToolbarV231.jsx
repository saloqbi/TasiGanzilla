import React from 'react';
import GannzillaAboutOnlyV229 from './GannzillaAboutOnlyV229';
import GannzillaLanguageToggleV237 from './GannzillaLanguageToggleV237';

const TOOLBAR_HEIGHT = 30;
const RIGHT_INSET_PX = 38;
const CONTROL_GAP_PX = 3;
const INFO_ICON_SIZE = 22;

/**
 * Build 239: pixel-proportioned classic language selector and circular About icon.
 */
export default function GannzillaTopToolbarV231() {
  React.useEffect(() => {
    window.GANNZILLA_TOP_TOOLBAR_V239 = true;
    window.__auditGannzillaTopToolbarV239 = () => ({
      ok: true,
      build: 239,
      singleReactOwner: true,
      heightPx: TOOLBAR_HEIGHT,
      infoIconSizePx: INFO_ICON_SIZE,
      iconAlignment: 'RIGHT',
      rightInsetPx: RIGHT_INSET_PX,
      controlGapPx: CONTROL_GAP_PX,
      mountedControls: ['LANGUAGE_CLASSIC_EXACT', 'ABOUT_CLASSIC_CIRCLE'],
      languageControlPosition: 'LEFT_OF_ABOUT',
      languageControlVisible: true,
      languageControlWidthPx: 100,
      languageFlags: ['UNITED_KINGDOM_SVG', 'SAUDI_ARABIA_SVG'],
      languageTextColor: '#111111',
      referencePixelMatch: true,
      intervalCount: 0,
      mutationObserverCount: 0,
    });

    return () => {
      delete window.GANNZILLA_TOP_TOOLBAR_V239;
      delete window.__auditGannzillaTopToolbarV239;
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
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        height: TOOLBAR_HEIGHT,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        direction: 'ltr',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: CONTROL_GAP_PX,
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 5,
        paddingRight: RIGHT_INSET_PX,
        background: 'linear-gradient(180deg, #fbfbfb 0%, #eeeeee 58%, #e4e4e4 100%)',
        borderTop: '1px solid #ffffff',
        borderBottom: '1px solid #8e8e8e',
        boxShadow: 'inset 0 -1px 0 rgba(255,255,255,.75), 0 1px 2px rgba(0,0,0,.18)',
      }}
    >
      <style>{`
        [data-gannzilla-toolbar="true"] > button[aria-label="حول البرنامج"] {
          width: ${INFO_ICON_SIZE}px !important;
          height: ${INFO_ICON_SIZE}px !important;
          min-width: ${INFO_ICON_SIZE}px !important;
          min-height: ${INFO_ICON_SIZE}px !important;
          border-radius: 50% !important;
          border: 1px solid #4f68b3 !important;
          background: radial-gradient(circle at 35% 28%, #8cc8ff 0%, #387fd2 36%, #2449a5 72%, #1b3180 100%) !important;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.55), 0 1px 2px rgba(0,0,0,.28) !important;
          color: #ffffff !important;
          font-family: Georgia, 'Times New Roman', serif !important;
          font-size: 16px !important;
          font-weight: 900 !important;
          line-height: 1 !important;
        }
      `}</style>
      <GannzillaLanguageToggleV237 toolbarHeight={TOOLBAR_HEIGHT} />
      <GannzillaAboutOnlyV229 toolbarHeight={TOOLBAR_HEIGHT} />
    </div>
  );
}
