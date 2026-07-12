import React from 'react';

const BUILD = 319;

const CONTROL_MAP = {
  'layout.visible': [0, 0],
  'layout.clockwise': [0, 1],
  'layout.size': [0, 2],
  'layout.view': [0, 3],
  'layout.dataType': [0, 4],
  'layout.price.value': [1, 0],
  'layout.price.increment': [1, 2],
  'layout.highlight.visible': [2, 0],
  'layout.highlight.fill': [2, 1],
  'layout.marks.visible': [2, 2],
  'layout.numbers.visible': [2, 3],
};

function getProjectValue(project, path) {
  return path.split('.').reduce((value, key) => value?.[key], project);
}

function findLegacyAside() {
  return Array.from(document.querySelectorAll('aside')).find((aside) => {
    const legacyChildren = Array.from(aside.children).filter(
      (child) => !child.classList.contains('gannzilla-full-property-panel-v318'),
    );
    return legacyChildren.length >= 3
      && legacyChildren.some((child) => child.querySelector('input,select'));
  }) || null;
}

function getLegacyControl(path) {
  const mapping = CONTROL_MAP[path];
  const aside = findLegacyAside();
  if (!mapping || !aside) return null;

  const [sectionIndex, controlIndex] = mapping;
  const legacySections = Array.from(aside.children).filter(
    (child) => !child.classList.contains('gannzilla-full-property-panel-v318'),
  );
  return legacySections[sectionIndex]?.querySelectorAll('input,select')?.[controlIndex] || null;
}

function normalizeValue(path, value) {
  if (path === 'layout.view') {
    return String(Number(String(value).replace(/\D/g, '')) || 36);
  }
  return value;
}

function commitNativeValue(control, value) {
  if (!control) return false;

  if (control instanceof HTMLInputElement && control.type === 'checkbox') {
    const desired = Boolean(value);
    if (control.checked !== desired) {
      control.click();
    } else {
      control.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return control.checked === desired;
  }

  const desired = String(value ?? '');
  const prototype = control instanceof HTMLSelectElement
    ? HTMLSelectElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  if (setter) setter.call(control, desired);
  else control.value = desired;

  control.dispatchEvent(new Event('input', { bubbles: true }));
  control.dispatchEvent(new Event('change', { bubbles: true }));
  return String(control.value) === desired;
}

function activate(path, value) {
  if (!CONTROL_MAP[path]) return false;
  const normalized = normalizeValue(path, value);
  const attempt = () => commitNativeValue(getLegacyControl(path), normalized);

  const immediate = attempt();
  window.requestAnimationFrame(attempt);
  window.setTimeout(attempt, 35);
  window.setTimeout(attempt, 120);
  return immediate;
}

function syncInitialProject() {
  const project = window.__gannzillaProjectV318;
  if (!project) return false;
  Object.keys(CONTROL_MAP).forEach((path) => {
    const value = getProjectValue(project, path);
    if (value !== undefined) activate(path, value);
  });
  return true;
}

export default function GannzillaLayoutPriceHighlightRuntimeV319() {
  React.useEffect(() => {
    let disposed = false;
    let syncTimer = 0;

    const syncWhenReady = () => {
      if (disposed) return;
      if (!syncInitialProject()) syncTimer = window.setTimeout(syncWhenReady, 50);
    };

    const onPropertyChange = (event) => {
      const path = event?.detail?.path;
      if (!path || !CONTROL_MAP[path]) return;
      activate(path, event.detail.value);
    };

    window.addEventListener('gannzilla:property-change-v318', onPropertyChange);
    syncWhenReady();

    window.GANNZILLA_LAYOUT_PRICE_HIGHLIGHT_RUNTIME_V319 = true;
    window.__activateGannzillaPropertyV319 = (path, value) => activate(path, value);
    window.__auditGannzillaLayoutPriceHighlightRuntimeV319 = () => ({
      ok: Boolean(findLegacyAside())
        && Object.keys(CONTROL_MAP).every((path) => Boolean(getLegacyControl(path))),
      build: BUILD,
      activePaths: Object.keys(CONTROL_MAP),
      directReactControlActivation: true,
      checkboxClickActivation: true,
      inputAndSelectNativeSetterActivation: true,
      retryActivationEnabled: true,
      initialProjectSyncEnabled: true,
    });

    return () => {
      disposed = true;
      window.clearTimeout(syncTimer);
      window.removeEventListener('gannzilla:property-change-v318', onPropertyChange);
      delete window.GANNZILLA_LAYOUT_PRICE_HIGHLIGHT_RUNTIME_V319;
      delete window.__activateGannzillaPropertyV319;
      delete window.__auditGannzillaLayoutPriceHighlightRuntimeV319;
    };
  }, []);

  return null;
}
