import React from 'react';

const BUILD = 213;
const TOOLBAR_ID = 'gannzilla-exact-drawing-toolbar-v208';
const TOOLBAR_WIDTH = 104;
const TOOLBAR_HEIGHT = 23;
const CONTROL_WIDTHS = [22, 30, 31, 21];

export default function GannzillaCenteredToolbarV211() {
  React.useEffect(() => {
    let disposed = false;

    const apply = () => {
      if (disposed) return;

      const toolbar = document.getElementById(TOOLBAR_ID);
      if (!toolbar) return;

      toolbar.style.setProperty('opacity', '1', 'important');
      toolbar.style.setProperty('visibility', 'visible', 'important');
      toolbar.style.setProperty('pointer-events', 'auto', 'important');
      toolbar.style.setProperty('display', 'flex', 'important');
      toolbar.style.setProperty('width', `${TOOLBAR_WIDTH}px`, 'important');
      toolbar.style.setProperty('min-width', `${TOOLBAR_WIDTH}px`, 'important');
      toolbar.style.setProperty('height', `${TOOLBAR_HEIGHT}px`, 'important');
      toolbar.style.setProperty('min-height', `${TOOLBAR_HEIGHT}px`, 'important');
      toolbar.style.setProperty('padding', '0', 'important');
      toolbar.style.setProperty('margin', '0', 'important');
      toolbar.style.setProperty('gap', '0', 'important');
      toolbar.style.setProperty('transform', 'none', 'important');
      toolbar.style.setProperty('align-items', 'stretch', 'important');
      toolbar.style.setProperty('justify-content', 'flex-start', 'important');
      toolbar.style.setProperty('overflow', 'visible', 'important');

      Array.from(toolbar.children).forEach((control, index) => {
        const width = CONTROL_WIDTHS[index] || 21;
        control.style.setProperty('display', index < 4 ? 'flex' : 'none', 'important');
        control.style.setProperty('visibility', index < 4 ? 'visible' : 'hidden', 'important');
        control.style.setProperty('pointer-events', index < 4 ? 'auto' : 'none', 'important');
        control.style.setProperty('width', `${width}px`, 'important');
        control.style.setProperty('min-width', `${width}px`, 'important');
        control.style.setProperty('height', `${TOOLBAR_HEIGHT}px`, 'important');
        control.style.setProperty('min-height', `${TOOLBAR_HEIGHT}px`, 'important');
        control.style.setProperty('margin', '0', 'important');
        control.style.setProperty('padding', '0', 'important');
        control.style.setProperty('transform', 'none', 'important');
        control.style.setProperty('align-self', 'stretch', 'important');
        control.style.setProperty('box-sizing', 'border-box', 'important');
      });

      const pointerSvg = toolbar.children?.[0]?.querySelector?.('svg');
      if (pointerSvg) {
        pointerSvg.setAttribute('width', '18');
        pointerSvg.setAttribute('height', '18');
      }

      const lineSvg = toolbar.children?.[1]?.querySelector?.('svg');
      if (lineSvg) {
        lineSvg.setAttribute('width', '17');
        lineSvg.setAttribute('height', '14');
      }

      const shapeSvg = toolbar.children?.[2]?.querySelector?.('svg');
      if (shapeSvg) {
        shapeSvg.setAttribute('width', '17');
        shapeSvg.setAttribute('height', '15');
      }

      const textGlyph = toolbar.children?.[3]?.querySelector?.('span');
      if (textGlyph) {
        textGlyph.style.setProperty('font-size', '18px', 'important');
        textGlyph.style.setProperty('line-height', '1', 'important');
        textGlyph.style.setProperty('transform', 'translateY(-1px)', 'important');
      }

      window.GANNZILLA_FULL_SIZE_TOOLBAR_V213 = true;
      window.__auditGannzillaFullSizeToolbarV213 = () => ({
        ok: Math.round(toolbar.getBoundingClientRect().width) === TOOLBAR_WIDTH
          && Math.round(toolbar.getBoundingClientRect().height) === TOOLBAR_HEIGHT
          && Array.from(toolbar.children).slice(0, 4).every((item) => window.getComputedStyle(item).display !== 'none'),
        build: BUILD,
        width: Math.round(toolbar.getBoundingClientRect().width),
        height: Math.round(toolbar.getBoundingClientRect().height),
        controls: Array.from(toolbar.children).slice(0, 4).map((item) => ({
          width: Math.round(item.getBoundingClientRect().width),
          height: Math.round(item.getBoundingClientRect().height),
        })),
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setInterval(apply, 250);
    window.addEventListener('resize', apply);
    window.addEventListener('scroll', apply, true);

    return () => {
      disposed = true;
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', apply);
      window.removeEventListener('scroll', apply, true);
    };
  }, []);

  return null;
}
