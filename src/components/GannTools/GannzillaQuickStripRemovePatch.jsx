import React from 'react';

export default function GannzillaQuickStripRemovePatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const styleId = 'gannzilla-quick-strip-remove-patch-v1';
    const removableTexts = new Set(['90%', '125%', 'Pro Small', 'Clockwise', 'English']);

    const installStyle = () => {
      if (document.getElementById(styleId)) return;
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        [data-gannzilla-quick-strip-removed="true"]{
          display:none!important;
          visibility:hidden!important;
          width:0!important;
          height:0!important;
          min-width:0!important;
          min-height:0!important;
          padding:0!important;
          margin:0!important;
          border:0!important;
          overflow:hidden!important;
          pointer-events:none!important;
        }
      `;
      document.head.appendChild(style);
    };

    const textOf = (node) => (node?.textContent || '').replace(/\s+/g, ' ').trim();

    const isSmallQuickControl = (node) => {
      if (!node || node.closest?.('.gannzilla-lang-switch')) return false;
      const rect = node.getBoundingClientRect?.();
      if (!rect) return false;
      const text = textOf(node);
      if (!removableTexts.has(text)) return false;
      return rect.height <= 42 && rect.width <= 140;
    };

    const shouldRemoveInfoIcon = (node) => {
      if (!node || node.closest?.('.gannzilla-lang-switch')) return false;
      const rect = node.getBoundingClientRect?.();
      if (!rect || rect.height > 42 || rect.width > 48) return false;
      const text = textOf(node);
      const title = (node.title || node.getAttribute?.('aria-label') || '').toLowerCase();
      return ['i', 'ⓘ', 'ℹ', 'ℹ️'].includes(text) || title.includes('info') || title.includes('help');
    };

    const removeQuickStripItems = () => {
      installStyle();
      const candidates = Array.from(document.querySelectorAll('button, select, span, div, input'));
      candidates.forEach((node) => {
        if (node.dataset?.gannzillaQuickStripRemoved === 'true') return;

        if (node.tagName === 'SELECT') {
          const selectedText = node.options?.[node.selectedIndex]?.textContent?.trim();
          if (selectedText === 'English' && !node.closest?.('.gannzilla-lang-switch')) {
            const rect = node.getBoundingClientRect();
            if (rect.height <= 42 && rect.width <= 140) node.dataset.gannzillaQuickStripRemoved = 'true';
          }
          return;
        }

        if (isSmallQuickControl(node) || shouldRemoveInfoIcon(node)) {
          node.dataset.gannzillaQuickStripRemoved = 'true';
        }
      });

      Array.from(document.querySelectorAll('div, span')).forEach((node) => {
        if (node.closest?.('.gannzilla-lang-switch')) return;
        const children = Array.from(node.children || []);
        if (children.length === 0) return;
        const removedChildren = children.filter((child) => child.dataset?.gannzillaQuickStripRemoved === 'true');
        const text = textOf(node);
        const looksLikeQuickStrip = removedChildren.length >= 3 && /90%|125%|Pro Small|Clockwise|English/.test(text);
        const rect = node.getBoundingClientRect?.();
        if (looksLikeQuickStrip && rect && rect.height <= 54) node.dataset.gannzillaQuickStripRemoved = 'true';
      });
    };

    removeQuickStripItems();
    const timer = window.setInterval(removeQuickStripItems, 350);
    return () => {
      window.clearInterval(timer);
      document.getElementById(styleId)?.remove();
      document.querySelectorAll('[data-gannzilla-quick-strip-removed="true"]').forEach((node) => {
        delete node.dataset.gannzillaQuickStripRemoved;
      });
    };
  }, []);

  return null;
}
