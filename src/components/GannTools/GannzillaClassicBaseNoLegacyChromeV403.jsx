import React from 'react';
import GannzillaClassicFullOptionsV94 from './GannzillaClassicFullOptionsV94';

const BUILD = 403;
const TOOLBAR_MARKER = 'gannzillaCoreLegacyToolbarRemovedV403';
const TOGGLE_MARKER = 'gannzillaCoreHideButtonRemovedV403';

function isLegacyCoreToolbar(node) {
  if (!(node instanceof HTMLElement) || node.tagName !== 'DIV') return false;
  if (node.closest('aside')) return false;
  if (node.closest('.gannzilla-chart-toolbar-v328')) return false;
  if (node.closest('[data-gannzilla-toolbar="true"]')) return false;

  const rect = node.getBoundingClientRect();
  if (rect.width < Math.max(520, window.innerWidth * 0.55)) return false;
  if (rect.height < 18 || rect.height > 36) return false;
  if (rect.top < -2 || rect.top > 4) return false;

  const style = window.getComputedStyle(node);
  if (style.position !== 'fixed' && node.style.position !== 'fixed') return false;

  const text = String(node.textContent || '');
  const buttons = node.querySelectorAll('button').length;
  const hasPercent = Array.from(node.querySelectorAll('span')).some((span) => /^\d{1,3}%$/.test(String(span.textContent || '').trim()));
  const hasDirection = /Clockwise|Counter|مع عقارب الساعة|عكس عقارب الساعة/i.test(text);
  const hasLanguage = /English|العربية/i.test(text);

  return buttons >= 6 && hasPercent && hasDirection && hasLanguage;
}

function isLegacyHideButton(node) {
  if (!(node instanceof HTMLButtonElement)) return false;
  if (node.closest('aside')) return false;
  if (node.closest('.gannzilla-chart-toolbar-v328')) return false;
  if (node.closest('[data-gannzilla-toolbar="true"]')) return false;

  const label = String(node.textContent || '').trim();
  if (!/^(Hide|Show|إخفاء|إظهار)$/i.test(label)) return false;

  const rect = node.getBoundingClientRect();
  const style = window.getComputedStyle(node);
  const positioned = style.position === 'fixed' || style.position === 'absolute'
    || node.style.position === 'fixed' || node.style.position === 'absolute';

  return positioned
    && rect.top >= 18
    && rect.top <= 90
    && rect.width > 0
    && rect.width <= 120
    && rect.height > 0
    && rect.height <= 44;
}

function markLegacyChrome(root = document) {
  const nodes = root instanceof HTMLElement
    ? [root, ...root.querySelectorAll('div,button')]
    : Array.from(document.querySelectorAll('div,button'));

  let toolbarCount = 0;
  let toggleCount = 0;

  nodes.forEach((node) => {
    if (isLegacyCoreToolbar(node)) {
      node.dataset[TOOLBAR_MARKER] = 'true';
      node.setAttribute('aria-hidden', 'true');
      toolbarCount += 1;
      return;
    }

    if (isLegacyHideButton(node)) {
      node.dataset[TOGGLE_MARKER] = 'true';
      node.setAttribute('aria-hidden', 'true');
      node.tabIndex = -1;
      toggleCount += 1;
    }
  });

  window.__gannzillaCoreLegacyToolbarRemovedCountV403 = toolbarCount;
  window.__gannzillaCoreHideButtonRemovedCountV403 = toggleCount;
  return { toolbarCount, toggleCount };
}

export default function GannzillaClassicBaseNoLegacyChromeV403(props) {
  React.useLayoutEffect(() => {
    let disposed = false;

    const apply = () => {
      if (!disposed) markLegacyChrome(document);
    };

    apply();
    const timers = [0, 30, 80, 160, 320, 700, 1400].map((delay) => window.setTimeout(apply, delay));
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) markLegacyChrome(node);
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('resize', apply);

    window.GANNZILLA_CLASSIC_BASE_NO_LEGACY_CHROME_V403 = true;
    window.__auditGannzillaClassicBaseNoLegacyChromeV403 = () => ({
      ok: !Array.from(document.querySelectorAll('div')).some((node) => isLegacyCoreToolbar(node) && node.dataset[TOOLBAR_MARKER] !== 'true')
        && !Array.from(document.querySelectorAll('button')).some((node) => isLegacyHideButton(node) && node.dataset[TOGGLE_MARKER] !== 'true'),
      build: BUILD,
      legacyTopToolbarVisible: Array.from(document.querySelectorAll('div')).some((node) => isLegacyCoreToolbar(node) && window.getComputedStyle(node).display !== 'none'),
      legacyHideButtonVisible: Array.from(document.querySelectorAll('button')).some((node) => isLegacyHideButton(node) && window.getComputedStyle(node).display !== 'none'),
      legacyTopToolbarMarked: document.querySelectorAll('[data-gannzilla-core-legacy-toolbar-removed-v403="true"]').length,
      legacyHideButtonMarked: document.querySelectorAll('[data-gannzilla-core-hide-button-removed-v403="true"]').length,
      baseRendererPreserved: true,
    });

    return () => {
      disposed = true;
      timers.forEach(window.clearTimeout);
      observer.disconnect();
      window.removeEventListener('resize', apply);
      delete window.GANNZILLA_CLASSIC_BASE_NO_LEGACY_CHROME_V403;
      delete window.__auditGannzillaClassicBaseNoLegacyChromeV403;
      delete window.__gannzillaCoreLegacyToolbarRemovedCountV403;
      delete window.__gannzillaCoreHideButtonRemovedCountV403;
    };
  }, []);

  return (
    <>
      <style>{`
        [data-gannzilla-core-legacy-toolbar-removed-v403="true"],
        [data-gannzilla-core-hide-button-removed-v403="true"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
      <GannzillaClassicFullOptionsV94 {...props} />
    </>
  );
}
