import React from 'react';

const BUILD = 383;
const CLEAN_PANEL_ID = 'gannzilla-clean-property-panel-v325';

function isLegacyRendererControl(target) {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return false;
  const aside = target.closest('aside');
  return Boolean(aside && aside.id !== CLEAN_PANEL_ID);
}

function controlSnapshot(target) {
  if (target instanceof HTMLInputElement && target.type === 'checkbox') {
    return `checked:${target.checked ? 1 : 0}`;
  }
  return `value:${String(target.value ?? '')}`;
}

export default function GannzillaEventStormGuardV383() {
  React.useLayoutEffect(() => {
    const lastInputValue = new WeakMap();
    const lastChangeValue = new WeakMap();
    const timers = new Set();
    let suppressedInputEvents = 0;
    let suppressedChangeEvents = 0;
    let allowedSyntheticEvents = 0;

    const seedControls = () => {
      document.querySelectorAll('aside input, aside select').forEach((control) => {
        const aside = control.closest('aside');
        if (!aside || aside.id === CLEAN_PANEL_ID) return;
        const snapshot = controlSnapshot(control);
        if (!lastInputValue.has(control)) lastInputValue.set(control, snapshot);
        if (!lastChangeValue.has(control)) lastChangeValue.set(control, snapshot);
      });
    };

    const scheduleSeed = (delay) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        seedControls();
      }, delay);
      timers.add(timer);
    };

    const guard = (event) => {
      const target = event.target;
      if (event.isTrusted || !isLegacyRendererControl(target)) return;

      const snapshot = controlSnapshot(target);
      const map = event.type === 'input' ? lastInputValue : lastChangeValue;
      const previous = map.get(target);

      if (previous === snapshot) {
        if (event.type === 'input') suppressedInputEvents += 1;
        else suppressedChangeEvents += 1;
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      map.set(target, snapshot);
      allowedSyntheticEvents += 1;
    };

    seedControls();
    [0, 30, 80, 160, 320].forEach(scheduleSeed);

    window.addEventListener('input', guard, true);
    window.addEventListener('change', guard, true);

    window.GANNZILLA_EVENT_STORM_GUARD_V383 = true;
    window.__auditGannzillaEventStormGuardV383 = () => ({
      ok: true,
      build: BUILD,
      visualChanges: false,
      pointerEventsBlocked: false,
      suppressedInputEvents,
      suppressedChangeEvents,
      allowedSyntheticEvents,
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener('input', guard, true);
      window.removeEventListener('change', guard, true);
      delete window.GANNZILLA_EVENT_STORM_GUARD_V383;
      delete window.__auditGannzillaEventStormGuardV383;
    };
  }, []);

  return null;
}
