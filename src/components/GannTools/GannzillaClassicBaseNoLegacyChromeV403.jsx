import React from 'react';
import GannzillaClassicFullOptionsV94 from './GannzillaClassicFullOptionsV94';

const BUILD = 404;
const TOOLBAR_MARKER = 'data-gannzilla-core-legacy-toolbar-removed-v404';
const TOGGLE_MARKER = 'data-gannzilla-core-hide-button-removed-v404';

function normalizedText(node) {
  return String(node?.textContent || '').replace(/\s+/g, ' ').trim();
}

function isLegacyCoreToolbar(node) {
  if (!(node instanceof HTMLElement) || node.tagName !== 'DIV') return false;
  if (node.closest('aside')) return false;
  if (node.closest('.gannzilla-chart-toolbar-v328')) return false;
  if (node.closest('[data-gannzilla-toolbar="true"]')) return false;

  const rect = node.getBoundingClientRect();
  if (rect.width < 300 || rect.height < 12 || rect.height > 52) return false;
  if (rect.top < -6 || rect.top > 120) return false;

  const text = normalizedText(node);
  const buttons = node.querySelectorAll('button').length;
  const hasPercent = /(?:^|\s)\d{1,3}%\b/.test(text)
    || Array.from(node.querySelectorAll('span')).some((span) => /^\d{1,3}%$/.test(normalizedText(span)));
  const hasDirection = /Clockwise|Counter|مع عقارب الساعة|عكس عقارب الساعة/i.test(text);
  const hasLanguage = /English|العربية/i.test(text);
  const hasClassicIcons = /100%/.test(text) || buttons >= 8;

  return buttons >= 5 && hasPercent && hasDirection && hasLanguage && hasClassicIcons;
}

function isLegacyHideButton(node) {
  if (!(node instanceof HTMLButtonElement)) return false;
  if (node.closest('aside')) return false;
  if (node.closest('.gannzilla-chart-toolbar-v328')) return false;
  if (node.closest('[data-gannzilla-toolbar="true"]')) return false;

  const label = normalizedText(node);
  if (!/^(Hide|Show|إخفاء|إظهار)$/i.test(label)) return false;

  const rect = node.getBoundingClientRect();
  return rect.width > 0 && rect.width <= 140 && rect.height > 0 && rect.height <= 50;
}

function removeElement(node, marker) {
  if (!(node instanceof HTMLElement) || !node.isConnected) return false;
  node.setAttribute(marker, 'true');
  node.setAttribute('aria-hidden', 'true');
  node.style.setProperty('display', 'none', 'important');
  node.style.setProperty('visibility', 'hidden', 'important');
  node.style.setProperty('opacity', '0', 'important');
  node.style.setProperty('pointer-events', 'none', 'important');
  node.remove();
  return true;
}

function removeLegacyChrome(root = document) {
  const scope = root instanceof HTMLElement ? root : document;
  const nodes = root instanceof HTMLElement
    ? [root, ...root.querySelectorAll('div,button')]
    : Array.from(document.querySelectorAll('div,button'));

  let toolbarCount = 0;
  let toggleCount = 0;

  nodes.forEach((node) => {
    if (!node.isConnected && node !== scope) return;

    if (isLegacyCoreToolbar(node)) {
      if (removeElement(node, TOOLBAR_MARKER)) toolbarCount += 1;
      return;
    }

    if (isLegacyHideButton(node)) {
      if (removeElement(node, TOGGLE_MARKER)) toggleCount += 1;
    }
  });

  if (toolbarCount > 0) {
    window.__gannzillaCoreLegacyToolbarRemovedCountV404 =
      (window.__gannzillaCoreLegacyToolbarRemovedCountV404 || 0) + toolbarCount;
  }
  if (toggleCount > 0) {
    window.__gannzillaCoreHideButtonRemovedCountV404 =
      (window.__gannzillaCoreHideButtonRemovedCountV404 || 0) + toggleCount;
  }

  return { toolbarCount, toggleCount };
}

export default function GannzillaClassicBaseNoLegacyChromeV403(props) {
  React.useLayoutEffect(() => {
    let disposed = false;

    const apply = () => {
      if (!disposed) removeLegacyChrome(document);
    };

    apply();
    const timers = [0, 20, 50, 100, 180, 320, 600, 1000, 1600, 2600]
      .map((delay) => window.setTimeout(apply, delay));

    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) removeLegacyChrome(node);
        });
      });
      apply();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    window.addEventListener('resize', apply);
    document.addEventListener('fullscreenchange', apply);

    window.GANNZILLA_CLASSIC_BASE_NO_LEGACY_CHROME_V404 = true;
    window.__auditGannzillaClassicBaseNoLegacyChromeV404 = () => ({
      ok: !Array.from(document.querySelectorAll('div')).some(isLegacyCoreToolbar)
        && !Array.from(document.querySelectorAll('button')).some(isLegacyHideButton),
      build: BUILD,
      legacyTopToolbarVisible: Array.from(document.querySelectorAll('div')).some(isLegacyCoreToolbar),
      legacyHideButtonVisible: Array.from(document.querySelectorAll('button')).some(isLegacyHideButton),
      removedToolbarCount: window.__gannzillaCoreLegacyToolbarRemovedCountV404 || 0,
      removedHideButtonCount: window.__gannzillaCoreHideButtonRemovedCountV404 || 0,
      directDomRemoval: true,
      mutationObserverProtection: true,
      baseRendererPreserved: true,
    });

    return () => {
      disposed = true;
      timers.forEach(window.clearTimeout);
      observer.disconnect();
      window.removeEventListener('resize', apply);
      document.removeEventListener('fullscreenchange', apply);
      delete window.GANNZILLA_CLASSIC_BASE_NO_LEGACY_CHROME_V404;
      delete window.__auditGannzillaClassicBaseNoLegacyChromeV404;
      delete window.__gannzillaCoreLegacyToolbarRemovedCountV404;
      delete window.__gannzillaCoreHideButtonRemovedCountV404;
    };
  }, []);

  return <GannzillaClassicFullOptionsV94 {...props} />;
}
