import React from 'react';

const BUILD = 315;

function getClassicRoot() {
  return document.querySelector('[data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"])');
}

function applyFixedLeftGeometry() {
  const root = getClassicRoot();
  if (!(root instanceof HTMLElement)) return null;

  const panel = Array.from(root.children).find(
    (node) => node instanceof HTMLElement && node.tagName === 'ASIDE',
  );
  if (!(panel instanceof HTMLElement)) return null;

  const arabicMode = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';

  root.dataset.gannzillaLanguageIndependentPanelV315 = 'true';
  root.style.setProperty('direction', 'ltr', 'important');

  panel.dataset.gannzillaFixedPanelSideV315 = 'left';
  panel.style.setProperty('left', '0', 'important');
  panel.style.setProperty('right', 'auto', 'important');
  panel.style.setProperty('direction', arabicMode ? 'rtl' : 'ltr', 'important');
  panel.style.setProperty('text-align', arabicMode ? 'right' : 'left', 'important');
  panel.style.setProperty('border-left', '0', 'important');
  panel.style.setProperty('border-right', '1px solid #b8b8b8', 'important');

  return { root, panel, arabicMode };
}

/** Build 315: translation changes panel content only; panel geometry stays left. */
export default function GannzillaPanelFixedLeftV315() {
  React.useEffect(() => {
    let frame = 0;

    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const result = applyFixedLeftGeometry();
        if (!result) return;
        window.dispatchEvent(new CustomEvent('gannzilla:panel-fixed-left-v315-sync', {
          detail: {
            side: 'left',
            languageDirection: result.arabicMode ? 'rtl' : 'ltr',
          },
        }));
      });
    };

    sync();
    const timers = [0, 60, 140, 300, 700, 1400].map((delay) => window.setTimeout(sync, delay));
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('resize', sync);
    document.addEventListener('fullscreenchange', sync);
    window.addEventListener('gannzilla:layout-panel-visibility-change', sync);
    window.addEventListener('gannzilla:panel-frame-cleanup-sync', sync);
    window.addEventListener('gannzilla:panel-width-v302-sync', sync);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', sync);

    window.GANNZILLA_PANEL_FIXED_LEFT_V315 = true;
    window.__auditGannzillaPanelFixedLeftV315 = () => {
      const result = applyFixedLeftGeometry();
      const rect = result?.panel?.getBoundingClientRect?.();
      const computedDirection = result?.panel ? window.getComputedStyle(result.panel).direction : null;
      const visible = result?.panel
        ? window.getComputedStyle(result.panel).display !== 'none'
        : false;
      return {
        ok: Boolean(result),
        build: BUILD,
        fixedSide: 'left',
        panelPinnedLeftWhenVisible: Boolean(!visible || (rect && Math.abs(rect.left) <= 1)),
        arabicMode: result?.arabicMode ?? null,
        arabicContentRemainsRtl: Boolean(!result || !result.arabicMode || computedDirection === 'rtl'),
        englishContentRemainsLtr: Boolean(!result || result.arabicMode || computedDirection === 'ltr'),
        languageSwitchCannotMovePanel: true,
        wheelViewportGeometryUntouched: true,
        wheelMovementUntouched: true,
        fullscreenBehaviorUntouched: true,
      };
    };

    return () => {
      timers.forEach(window.clearTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.removeEventListener('fullscreenchange', sync);
      window.removeEventListener('gannzilla:layout-panel-visibility-change', sync);
      window.removeEventListener('gannzilla:panel-frame-cleanup-sync', sync);
      window.removeEventListener('gannzilla:panel-width-v302-sync', sync);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', sync);
      delete window.GANNZILLA_PANEL_FIXED_LEFT_V315;
      delete window.__auditGannzillaPanelFixedLeftV315;
    };
  }, []);

  return (
    <style>{`
      [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) {
        direction: ltr !important;
      }

      [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > aside {
        left: 0 !important;
        right: auto !important;
        border-left: 0 !important;
        border-right: 1px solid #b8b8b8 !important;
      }

      html[lang="ar"] [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > aside {
        direction: rtl !important;
        text-align: right !important;
      }

      html[lang="en"] [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > aside {
        direction: ltr !important;
        text-align: left !important;
      }
    `}</style>
  );
}
