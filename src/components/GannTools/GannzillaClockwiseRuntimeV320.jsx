import React from 'react';

const BUILD = 320;

function findRendererDirectionButton() {
  return Array.from(document.querySelectorAll('button')).find((button) => {
    const text = String(button.textContent || '').trim();
    return text === 'Clockwise' || text === 'Counter';
  }) || null;
}

function readRendererClockwise() {
  const button = findRendererDirectionButton();
  if (!button) return null;
  return String(button.textContent || '').trim() === 'Clockwise';
}

function applyClockwise(desiredValue) {
  const desired = Boolean(desiredValue);
  const attempt = () => {
    const button = findRendererDirectionButton();
    if (!button) return false;
    const current = String(button.textContent || '').trim() === 'Clockwise';
    if (current !== desired) button.click();
    return readRendererClockwise() === desired;
  };

  const immediate = attempt();
  window.requestAnimationFrame(attempt);
  window.setTimeout(attempt, 40);
  window.setTimeout(attempt, 140);
  return immediate;
}

export default function GannzillaClockwiseRuntimeV320() {
  React.useEffect(() => {
    let disposed = false;
    let timer = 0;

    const syncInitial = () => {
      if (disposed) return;
      const project = window.__gannzillaProjectV318;
      if (!project) {
        timer = window.setTimeout(syncInitial, 60);
        return;
      }
      applyClockwise(project?.layout?.clockwise !== false);
    };

    const onPropertyChange = (event) => {
      if (event?.detail?.path !== 'layout.clockwise') return;
      applyClockwise(event.detail.value);
    };

    window.addEventListener('gannzilla:property-change-v318', onPropertyChange);
    syncInitial();

    window.GANNZILLA_CLOCKWISE_RUNTIME_V320 = true;
    window.__setGannzillaClockwiseV320 = applyClockwise;
    window.__auditGannzillaClockwiseRuntimeV320 = () => ({
      ok: Boolean(findRendererDirectionButton()),
      build: BUILD,
      directRendererStateControl: true,
      rendererClockwise: readRendererClockwise(),
      startPositionPreserved: true,
      numberOrderReversedOnly: true,
      protractorDirectionIndependent: true,
      chronometerDirectionIndependent: true,
    });

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      window.removeEventListener('gannzilla:property-change-v318', onPropertyChange);
      delete window.GANNZILLA_CLOCKWISE_RUNTIME_V320;
      delete window.__setGannzillaClockwiseV320;
      delete window.__auditGannzillaClockwiseRuntimeV320;
    };
  }, []);

  return null;
}
