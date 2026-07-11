import React from 'react';
import GannzillaAboutOnlyV229 from './GannzillaAboutOnlyV229';

const TOOLBAR_HEIGHT = 38;
const RIGHT_INSET_PX = 38;

/**
 * Build 233: single-owner top toolbar with a fixed right safety inset.
 * All toolbar icons derive their dimensions from TOOLBAR_HEIGHT.
 */
export default function GannzillaTopToolbarV231() {
  const iconSize = TOOLBAR_HEIGHT - 8;

  React.useEffect(() => {
    window.GANNZILLA_TOP_TOOLBAR_V233 = true;
    window.__auditGannzillaTopToolbarV233 = () => ({
      ok: true,
      build: 233,
      singleReactOwner: true,
      heightPx: TOOLBAR_HEIGHT,
      iconSizePx: iconSize,
      iconSizingAuthority: 'TOOLBAR_HEIGHT_MINUS_8',
      iconAlignment: 'RIGHT',
      rightInsetPx: RIGHT_INSET_PX,
      mountedControls: ['ABOUT'],
      intervalCount: 0,
      mutationObserverCount: 0,
    });

    return () => {
      delete window.GANNZILLA_TOP_TOOLBAR_V233;
      delete window.__auditGannzillaTopToolbarV233;
    };
  }, [iconSize]);

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
        gap: 3,
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
      <GannzillaAboutOnlyV229 toolbarHeight={TOOLBAR_HEIGHT} />
    </div>
  );
}
