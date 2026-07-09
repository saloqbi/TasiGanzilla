import React from 'react';

const SOURCE_OVERLAY_ID = 'gannzilla-long-number-digital-renderer-v1';
const STABLE_HOST_ID = 'gannzilla-stable-zoom-host-v85';
const STABLE_SURFACE_ID = 'gannzilla-stable-zoom-surface-v85';
const MARKER = 'GANNZILLA_STABLE_NATIVE_ZOOM_SURFACE_V85';
const BASELINE_STABLE_MS = 900;
const RECT_STABLE_MS = 700;
const POLL_MS = 100;
const COPY_MS = 260;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function nearlyEqual(a, b, tolerance = 0.25) {
  return Math.abs(Number(a || 0) - Number(b || 0)) <= tolerance;
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
      return { value, rect };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const topDifference = a.rect.top - b.rect.top;
      if (Math.abs(topDifference) > 2) return topDifference;
      return b.rect.left - a.rect.left;
    });

  return candidates[0]?.value ?? null;
}

function readSourceRect(source) {
  const computed = window.getComputedStyle(source);
  const fallback = source.getBoundingClientRect();
  const left = Number.parseFloat(source.style.left || computed.left);
  const top = Number.parseFloat(source.style.top || computed.top);
  const width = Number.parseFloat(source.style.width || computed.width);
  const height = Number.parseFloat(source.style.height || computed.height);

  return {
    left: Number.isFinite(left) ? left : fallback.left,
    top: Number.isFinite(top) ? top : fallback.top,
    width: Number.isFinite(width) && width > 0 ? width : fallback.width,
    height: Number.isFinite(height) && height > 0 ? height : fallback.height,
  };
}

function sameRect(a, b) {
  if (!a || !b) return false;
  return nearlyEqual(a.left, b.left)
    && nearlyEqual(a.top, b.top)
    && nearlyEqual(a.width, b.width)
    && nearlyEqual(a.height, b.height);
}

function createStableSurface() {
  let host = document.getElementById(STABLE_HOST_ID);
  if (host) {
    const existingSurface = host.shadowRoot?.getElementById(STABLE_SURFACE_ID);
    if (existingSurface) return { host, surface: existingSurface };
    host.remove();
  }

  host = document.createElement('div');
  host.id = STABLE_HOST_ID;
  host.setAttribute('aria-hidden', 'true');
  host.style.position = 'fixed';
  host.style.zIndex = '2147483601';
  host.style.pointerEvents = 'none';
  host.style.background = '#ffffff';
  host.style.transformOrigin = 'center center';
  host.style.willChange = 'transform';
  host.style.backfaceVisibility = 'hidden';
  host.style.transition = 'none';
  host.style.contain = 'strict';
  host.style.overflow = 'hidden';

  const shadow = host.attachShadow({ mode: 'open' });
  const surface = document.createElement('canvas');
  surface.id = STABLE_SURFACE_ID;
  surface.style.display = 'block';
  surface.style.width = '100%';
  surface.style.height = '100%';
  surface.style.background = '#ffffff';
  shadow.appendChild(surface);
  document.body.appendChild(host);

  return { host, surface };
}

function applyLockedRect(host, rect) {
  host.style.left = `${rect.left}px`;
  host.style.top = `${rect.top}px`;
  host.style.width = `${rect.width}px`;
  host.style.height = `${rect.height}px`;
}

function copySourceToStableSurface(source, surface, buffer) {
  const sourceWidth = Math.max(1, source.width || 1);
  const sourceHeight = Math.max(1, source.height || 1);

  if (buffer.width !== sourceWidth || buffer.height !== sourceHeight) {
    buffer.width = sourceWidth;
    buffer.height = sourceHeight;
  }

  const bufferContext = buffer.getContext('2d');
  bufferContext.setTransform(1, 0, 0, 1, 0, 0);
  bufferContext.clearRect(0, 0, sourceWidth, sourceHeight);
  bufferContext.drawImage(source, 0, 0, sourceWidth, sourceHeight);

  if (surface.width !== sourceWidth || surface.height !== sourceHeight) {
    surface.width = sourceWidth;
    surface.height = sourceHeight;
  }

  const surfaceContext = surface.getContext('2d');
  surfaceContext.setTransform(1, 0, 0, 1, 0, 0);
  surfaceContext.clearRect(0, 0, sourceWidth, sourceHeight);
  surfaceContext.drawImage(buffer, 0, 0, sourceWidth, sourceHeight);
}

export default function GannzillaOverlayNativeZoomBridge() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    const enabled = !window.location.search.includes('nativeToolbarZoom=false');
    if (!isWheelMode || !enabled) return undefined;

    const { host, surface } = createStableSurface();
    const buffer = document.createElement('canvas');

    let baselineZoom = null;
    let lastSeenZoom = null;
    let zoomStableSince = performance.now();
    let currentZoom = null;
    let currentFactor = 1;
    let lastAppliedFactor = null;

    let candidateRect = null;
    let rectStableSince = performance.now();
    let lockedRect = null;
    let rectUnlockRequested = true;
    let lastCopyAt = 0;

    const requestRectUnlock = () => {
      rectUnlockRequested = true;
      candidateRect = null;
      lockedRect = null;
      rectStableSince = performance.now();
      host.style.visibility = 'hidden';
    };

    const sync = () => {
      const source = document.getElementById(SOURCE_OVERLAY_ID);
      const zoom = readNativeToolbarZoom();
      if (!source || !Number.isFinite(zoom)) return;

      source.style.setProperty('transform', 'none', 'important');
      source.style.setProperty('transform-origin', 'center center', 'important');
      source.style.setProperty('opacity', '0.001', 'important');

      const now = performance.now();
      currentZoom = zoom;

      if (lastSeenZoom === null || Math.abs(zoom - lastSeenZoom) > 0.0001) {
        lastSeenZoom = zoom;
        zoomStableSince = now;
      }

      if (baselineZoom === null && now - zoomStableSince >= BASELINE_STABLE_MS) {
        baselineZoom = zoom;
      }

      currentFactor = baselineZoom === null
        ? 1
        : clamp(Number((zoom / baselineZoom).toFixed(4)), 0.25, 4);

      if (lastAppliedFactor === null || Math.abs(currentFactor - lastAppliedFactor) >= 0.001) {
        host.style.transform = `scale(${currentFactor})`;
        lastAppliedFactor = currentFactor;
      }

      const sourceRect = readSourceRect(source);
      if (rectUnlockRequested || !lockedRect) {
        if (!candidateRect || !sameRect(candidateRect, sourceRect)) {
          candidateRect = sourceRect;
          rectStableSince = now;
        } else if (now - rectStableSince >= RECT_STABLE_MS) {
          lockedRect = { ...candidateRect };
          rectUnlockRequested = false;
          applyLockedRect(host, lockedRect);
          copySourceToStableSurface(source, surface, buffer);
          lastCopyAt = now;
        }
      }

      if (lockedRect && now - lastCopyAt >= COPY_MS) {
        copySourceToStableSurface(source, surface, buffer);
        lastCopyAt = now;
      }

      host.style.visibility = lockedRect ? 'visible' : 'hidden';

      window.__gannzillaOverlayNativeZoomBridgeV84Metrics = {
        ok: true,
        marker: window[MARKER] === true,
        baselineZoom,
        currentZoom,
        currentFactor,
        sourceFound: true,
        stableSurfaceFound: true,
        stableSurfaceIsShadowIsolated: true,
        rectLocked: Boolean(lockedRect),
        lockedRect,
        sourceTransformDisabled: true,
        sourceHidden: true,
      };
    };

    window[MARKER] = true;
    window.GANNZILLA_OVERLAY_NATIVE_ZOOM_BRIDGE_V84 = false;
    window.GANNZILLA_STABLE_NATIVE_ZOOM_SURFACE_V85 = true;
    window.__auditGannzillaOverlayNativeZoomBridgeV84 = () => {
      const metrics = window.__gannzillaOverlayNativeZoomBridgeV84Metrics || {};
      return {
        ok: window[MARKER] === true
          && metrics.sourceFound === true
          && metrics.stableSurfaceFound === true
          && metrics.stableSurfaceIsShadowIsolated === true
          && metrics.rectLocked === true
          && Number.isFinite(metrics.currentZoom),
        markerV85: window[MARKER] === true,
        baselineZoom: metrics.baselineZoom,
        currentZoom: metrics.currentZoom,
        currentFactor: metrics.currentFactor,
        rectLocked: metrics.rectLocked === true,
        lockedRect: metrics.lockedRect,
        shadowIsolated: metrics.stableSurfaceIsShadowIsolated === true,
        sourceTransformDisabled: metrics.sourceTransformDisabled === true,
        sourceHidden: metrics.sourceHidden === true,
      };
    };
    window.__auditGannzillaStableNativeZoomSurfaceV85 = window.__auditGannzillaOverlayNativeZoomBridgeV84;

    const timer = window.setInterval(sync, POLL_MS);
    const onResize = () => {
      window.clearTimeout(onResize.timeoutId);
      onResize.timeoutId = window.setTimeout(requestRectUnlock, 180);
    };
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener?.('resize', onResize);

    sync();

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(onResize.timeoutId);
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener?.('resize', onResize);
      document.getElementById(STABLE_HOST_ID)?.remove();
      const source = document.getElementById(SOURCE_OVERLAY_ID);
      if (source) {
        source.style.removeProperty('transform');
        source.style.removeProperty('transform-origin');
        source.style.removeProperty('opacity');
      }
    };
  }, []);

  return null;
}
