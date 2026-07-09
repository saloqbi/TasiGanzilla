import React from 'react';

const OVERLAY_ID = 'gannzilla-long-number-digital-renderer-v1';
const MARKER = 'GANNZILLA_OVERLAY_NATIVE_ZOOM_BRIDGE_V84';
const STABLE_DELAY_MS = 500;
const POLL_MS = 80;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isVisible(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 0
    && rect.height > 0
    && rect.top < 80
    && style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(style.opacity || 1) > 0;
}

function readNativeToolbarZoom() {
  const percentPattern = /^\s*(\d{1,3}(?:\.\d+)?)%\s*$/;
  const candidates = Array.from(document.querySelectorAll('span, div'))
    .map((element) => {
      const match = String(element.textContent || '').match(percentPattern);
      if (!match || !isVisible(element)) return null;
      const rect = element.getBoundingClientRect();
      const value = Number(match[1]) / 100;
      if (!Number.isFinite(value) || value < 0.05 || value > 5) return null;
      return { element, value, rect };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const topDifference = a.rect.top - b.rect.top;
      if (Math.abs(topDifference) > 2) return topDifference;
      return b.rect.left - a.rect.left;
    });

  return candidates[0]?.value ?? null;
}

function applyOverlayScale(overlay, factor) {
  if (!overlay) return;
  const safeFactor = clamp(factor, 0.25, 4);
  overlay.style.setProperty('transform-origin', 'center center', 'important');
  overlay.style.setProperty('transform', `scale(${safeFactor})`, 'important');
  overlay.dataset.gannzillaNativeZoomFactor = safeFactor.toFixed(6);
}

export default function GannzillaOverlayNativeZoomBridge() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    const enabled = !window.location.search.includes('nativeToolbarZoom=false');
    if (!isWheelMode || !enabled) return undefined;

    let baselineZoom = null;
    let lastSeenZoom = null;
    let stableSince = performance.now();
    let currentZoom = null;
    let currentFactor = 1;

    const sync = () => {
      const overlay = document.getElementById(OVERLAY_ID);
      const zoom = readNativeToolbarZoom();
      if (!overlay || !Number.isFinite(zoom)) return;

      const now = performance.now();
      currentZoom = zoom;

      if (lastSeenZoom === null || Math.abs(zoom - lastSeenZoom) > 0.0001) {
        lastSeenZoom = zoom;
        stableSince = now;
      }

      if (baselineZoom === null) {
        applyOverlayScale(overlay, 1);
        if (now - stableSince >= STABLE_DELAY_MS) baselineZoom = zoom;
      }

      if (baselineZoom !== null) {
        currentFactor = clamp(zoom / baselineZoom, 0.25, 4);
        applyOverlayScale(overlay, currentFactor);
      }

      window.__gannzillaOverlayNativeZoomBridgeV84Metrics = {
        ok: true,
        marker: window[MARKER] === true,
        baselineZoom,
        currentZoom,
        currentFactor,
        overlayFound: true,
        toolbarZoomFound: true,
      };
    };

    window[MARKER] = true;
    window.__auditGannzillaOverlayNativeZoomBridgeV84 = () => {
      const metrics = window.__gannzillaOverlayNativeZoomBridgeV84Metrics || {};
      return {
        ok: window[MARKER] === true
          && metrics.overlayFound === true
          && metrics.toolbarZoomFound === true
          && Number.isFinite(metrics.currentZoom),
        marker: window[MARKER] === true,
        baselineZoom: metrics.baselineZoom,
        currentZoom: metrics.currentZoom,
        currentFactor: metrics.currentFactor,
        overlayFound: metrics.overlayFound === true,
        toolbarZoomFound: metrics.toolbarZoomFound === true,
      };
    };

    const timer = window.setInterval(sync, POLL_MS);
    sync();

    return () => {
      window.clearInterval(timer);
      const overlay = document.getElementById(OVERLAY_ID);
      if (overlay) {
        overlay.style.removeProperty('transform');
        overlay.style.removeProperty('transform-origin');
        delete overlay.dataset.gannzillaNativeZoomFactor;
      }
    };
  }, []);

  return null;
}
