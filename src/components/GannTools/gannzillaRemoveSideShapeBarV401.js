const STATE_KEY = '__gannzillaRemoveSideShapeBarV401';
const SIGNATURE = ['◁', '□', '⬠', '⬡', '⬟', '◯', '△', '◢', '◎'].join('');

function isLegacySideShapeBar(node) {
  if (!(node instanceof HTMLElement) || node.tagName !== 'DIV') return false;

  const children = Array.from(node.children);
  if (children.length !== 9 || children.some((child) => !(child instanceof HTMLButtonElement))) return false;

  const signature = children.map((button) => String(button.textContent || '').trim()).join('');
  if (signature !== SIGNATURE) return false;

  const style = window.getComputedStyle(node);
  const rect = node.getBoundingClientRect();
  const fixed = style.position === 'fixed' || node.style.position === 'fixed';
  const rightSide = rect.left >= Math.max(0, window.innerWidth - 140);
  const vertical = rect.height > rect.width * 2;

  return fixed && rightSide && vertical;
}

function removeLegacySideShapeBars(root = document) {
  const candidates = root instanceof HTMLElement && root.tagName === 'DIV'
    ? [root, ...root.querySelectorAll('div')]
    : Array.from(document.querySelectorAll('div'));

  let removed = 0;
  candidates.forEach((node) => {
    if (!isLegacySideShapeBar(node)) return;
    node.remove();
    removed += 1;
  });

  if (removed > 0) {
    window.__gannzillaRemovedSideShapeBarCountV401 =
      (window.__gannzillaRemovedSideShapeBarCountV401 || 0) + removed;
  }

  return removed;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window[STATE_KEY]) return;

  const run = () => removeLegacySideShapeBars(document);
  [0, 20, 60, 120, 260, 600, 1200].forEach((delay) => window.setTimeout(run, delay));

  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) removeLegacySideShapeBars(node);
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', run);

  window.GANNZILLA_REMOVE_SIDE_SHAPE_BAR_V401 = true;
  window.__auditGannzillaRemoveSideShapeBarV401 = () => ({
    ok: !Array.from(document.querySelectorAll('div')).some(isLegacySideShapeBar),
    build: 401,
    removedCount: window.__gannzillaRemovedSideShapeBarCountV401 || 0,
    rightSideShapeToolbarPresent: Array.from(document.querySelectorAll('div')).some(isLegacySideShapeBar),
  });

  window[STATE_KEY] = { observer };
}

install();
