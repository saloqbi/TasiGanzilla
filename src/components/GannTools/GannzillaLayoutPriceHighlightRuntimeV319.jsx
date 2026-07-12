import React from 'react';

const BUILD = 321;

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

function dispatchReactValue(control) {
  control.dispatchEvent(new Event('input', { bubbles: true }));
  control.dispatchEvent(new Event('change', { bubbles: true }));
}

function setNativeValue(control, value) {
  const prototype = control instanceof HTMLSelectElement
    ? HTMLSelectElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  if (setter) setter.call(control, String(value ?? ''));
  else control.value = String(value ?? '');
  dispatchReactValue(control);
}

function commitCheckbox(control, desired) {
  const wanted = Boolean(desired);

  // V318 may have changed the DOM property without changing the React state.
  // A two-click pulse forces React to process the value even when DOM already
  // appears to equal the requested value.
  if (control.checked === wanted) {
    control.click();
    control.click();
  } else {
    control.click();
  }

  return control.checked === wanted;
}

function alternateValue(control, desired) {
  if (control instanceof HTMLSelectElement) {
    const alternative = Array.from(control.options).find((option) => String(option.value) !== String(desired));
    return alternative?.value ?? desired;
  }

  if (control instanceof HTMLInputElement && control.type === 'number') {
    const number = Number(desired);
    const step = Number(control.step);
    const delta = Number.isFinite(step) && step > 0 ? step : 1;
    const maximum = Number(control.max);
    const minimum = Number(control.min);
    if (!Number.isFinite(maximum) || number + delta <= maximum) return number + delta;
    if (!Number.isFinite(minimum) || number - delta >= minimum) return number - delta;
  }

  return `${desired ?? ''}__react_sync__`;
}

function commitNativeValue(control, value) {
  if (!control) return false;

  if (control instanceof HTMLInputElement && control.type === 'checkbox') {
    return commitCheckbox(control, value);
  }

  const desired = String(value ?? '');
  const temporary = alternateValue(control, desired);

  // Pulse through a different value first. This defeats stale React value
  // trackers left behind by the old DOM bridge, then commits the real value.
  if (String(temporary) !== desired) setNativeValue(control, temporary);
  setNativeValue(control, desired);

  return String(control.value) === desired;
}

function activate(path, value) {
  if (!CONTROL_MAP[path]) return false;
  const normalized = normalizeValue(path, value);
  const attempt = () => commitNativeValue(getLegacyControl(path), normalized);

  const immediate = attempt();
  window.requestAnimationFrame(attempt);
  window.setTimeout(attempt, 40);
  window.setTimeout(attempt, 140);
  window.setTimeout(attempt, 320);
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
      window.__gannzillaLastActivatedPropertyV321 = {
        path,
        value: event.detail.value,
        at: Date.now(),
      };
    };

    window.addEventListener('gannzilla:property-change-v318', onPropertyChange);
    syncWhenReady();

    window.GANNZILLA_LAYOUT_PRICE_HIGHLIGHT_RUNTIME_V319 = true;
    window.GANNZILLA_LAYOUT_PRICE_HIGHLIGHT_RUNTIME_V321 = true;
    window.__activateGannzillaPropertyV319 = (path, value) => activate(path, value);
    window.__activateGannzillaPropertyV321 = (path, value) => activate(path, value);
    window.__auditGannzillaLayoutPriceHighlightRuntimeV319 = () => window.__auditGannzillaLayoutPriceHighlightRuntimeV321?.();
    window.__auditGannzillaLayoutPriceHighlightRuntimeV321 = () => ({
      ok: Boolean(findLegacyAside())
        && Object.keys(CONTROL_MAP).every((path) => Boolean(getLegacyControl(path))),
      build: BUILD,
      activePaths: Object.keys(CONTROL_MAP),
      directReactControlActivation: true,
      checkboxDoubleClickPulse: true,
      inputAndSelectAlternateValuePulse: true,
      staleDomBridgeRecovery: true,
      retryActivationEnabled: true,
      initialProjectSyncEnabled: true,
      lastActivatedProperty: window.__gannzillaLastActivatedPropertyV321 || null,
    });

    return () => {
      disposed = true;
      window.clearTimeout(syncTimer);
      window.removeEventListener('gannzilla:property-change-v318', onPropertyChange);
      delete window.GANNZILLA_LAYOUT_PRICE_HIGHLIGHT_RUNTIME_V319;
      delete window.GANNZILLA_LAYOUT_PRICE_HIGHLIGHT_RUNTIME_V321;
      delete window.__activateGannzillaPropertyV319;
      delete window.__activateGannzillaPropertyV321;
      delete window.__auditGannzillaLayoutPriceHighlightRuntimeV319;
      delete window.__auditGannzillaLayoutPriceHighlightRuntimeV321;
      delete window.__gannzillaLastActivatedPropertyV321;
    };
  }, []);

  return null;
}
