import React from 'react';
import GannzillaAboutOnlyV229 from './GannzillaAboutOnlyV229';

const TOOLBAR_HEIGHT = 38;

/**
 * Build 231: single-owner top toolbar.
 *
 * All toolbar icons derive their dimensions from TOOLBAR_HEIGHT. New controls
 * must be added inside this component so the toolbar remains the only layout
 * owner and icon sizing stays consistent.
 */
export default function GannzillaTopToolbarV231() {
  const iconSize = TOOLBAR_HEIGHT - 8;

  React.useEffect(() => {
    window.GANNZILLA_TOP_TOOLBAR_V231 = true;
    window.__auditGannzillaTopToolbarV231 = () => ({
      ok: true,
      build: 231,
      singleReactOwner: true,
      heightPx: TOOLBAR_HEIGHT,
      iconSizePx: iconSize,
      iconSizingAuthority: 'TOOLBAR_HEIGHT_MINUS_8',
      mountedControls: ['ABOUT'],
      intervalCount: 0,
      mutationObserverCount: 0,
    });

    return () => {
      delete window.GANNZILLA_TOP_TOOLBAR_V231;
      delete window.__auditGannzillaTopToolbarV231;
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
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 3,
        padding: '4px 5px',
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
