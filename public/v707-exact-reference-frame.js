(function () {
  'use strict';

  var BUILD = 707;
  var STATE_KEY = '__gannzillaExactReferenceFrameV707';
  var OVERLAY_ID = 'gannzilla-exact-reference-frame-v707';
  var ASSET_URL = '/assets/tasi-ornate-frame-reference-v688.webp?v=707-exact-reference-frame';

  if (window[STATE_KEY]) return;

  var wheel = null;
  var overlay = null;
  var resizeObserver = null;
  var mutationObserver = null;
  var raf = 0;
  var timer = 0;
  var applyCount = 0;
  var lastApply = null;

  function effectiveParams() {
    try {
      var raw = window.__gannzillaV672CanonicalSearch
        || window.sessionStorage.getItem('gannzilla:v672:canonical-search')
        || window.location.search
        || '';
      return new URLSearchParams(raw);
    } catch (_) {
      return new URLSearchParams();
    }
  }

  function boolParam(name, fallback) {
    var query = effectiveParams();
    if (!query.has(name)) return fallback;
    return ['true', '1', 'yes', 'on'].indexOf(String(query.get(name) || '').toLowerCase()) >= 0;
  }

  function numberParam(name, fallback, min, max) {
    var value = Number(effectiveParams().get(name));
    return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  }

  function enabled() {
    return window.location.pathname === '/v672.html'
      && boolParam('ornateOuterFrame', true)
      && boolParam('ornateReferenceFrame', true);
  }

  function isWheelCanvas(canvas) {
    if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
    var id = String(canvas.id || '').toLowerCase();
    if (id.indexOf('overlay') >= 0 || id.indexOf('preview') >= 0 || id.indexOf('tracker') >= 0) return false;
    var rect = canvas.getBoundingClientRect();
    return rect.width > 300 && rect.height > 300;
  }

  function findWheel() {
    var preferred = document.querySelector([
      'canvas[data-gannzilla-wheel-ivory-champagne-final-authority-v682="true"]',
      'canvas[data-gannzilla-outer-empty-ring-mirror-silver-v668="true"]',
      'canvas[data-gannzilla-empty-outer-ring-v518="true"]',
      'canvas[data-gannzilla-final-wheel-authority-v506="true"]'
    ].join(','));

    if (isWheelCanvas(preferred)) return preferred;

    var candidates = Array.prototype.slice.call(document.querySelectorAll('canvas'))
      .filter(isWheelCanvas)
      .sort(function (a, b) {
        var ar = a.getBoundingClientRect();
        var br = b.getBoundingClientRect();
        return (br.width * br.height) - (ar.width * ar.height);
      });

    return candidates[0] || null;
  }

  function removeLegacyOverlays() {
    [
      'gannzilla-reference-ornate-frame-v688',
      'gannzilla-ornate-outer-frame-overlay-v687',
      'gannzilla-exact-reference-frame-v692',
      'gannzilla-direct-ornate-frame-v693'
    ].forEach(function (id) {
      var node = document.getElementById(id);
      if (node) node.remove();
    });
  }

  function createOverlay() {
    if (overlay && overlay.isConnected) return overlay;

    overlay = document.createElement('img');
    overlay.id = OVERLAY_ID;
    overlay.alt = '';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.dataset.gannzillaExactReferenceFrameV707 = 'true';
    overlay.src = ASSET_URL;
    overlay.draggable = false;
    overlay.decoding = 'async';

    var style = overlay.style;
    style.setProperty('position', 'fixed', 'important');
    style.setProperty('display', 'none', 'important');
    style.setProperty('left', '0px', 'important');
    style.setProperty('top', '0px', 'important');
    style.setProperty('width', '0px', 'important');
    style.setProperty('height', '0px', 'important');
    style.setProperty('max-width', 'none', 'important');
    style.setProperty('max-height', 'none', 'important');
    style.setProperty('object-fit', 'fill', 'important');
    style.setProperty('object-position', '50% 50%', 'important');
    style.setProperty('pointer-events', 'none', 'important');
    style.setProperty('user-select', 'none', 'important');
    style.setProperty('touch-action', 'none', 'important');
    style.setProperty('z-index', '40', 'important');
    style.setProperty('opacity', '1', 'important');
    style.setProperty('transform', 'translate3d(0,0,0)', 'important');
    style.setProperty('transform-origin', '50% 50%', 'important');
    style.setProperty('image-rendering', 'auto', 'important');
    style.setProperty('mix-blend-mode', 'normal', 'important');
    style.setProperty('filter', 'none', 'important');

    document.body.appendChild(overlay);
    return overlay;
  }

  function disconnectObservers() {
    if (resizeObserver) resizeObserver.disconnect();
    if (mutationObserver) mutationObserver.disconnect();
    resizeObserver = null;
    mutationObserver = null;
  }

  function observeWheel(canvas) {
    disconnectObservers();

    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(function () { schedule('wheel-resize', 0); });
      resizeObserver.observe(canvas);
    }

    mutationObserver = new MutationObserver(function () { schedule('wheel-mutation', 0); });
    mutationObserver.observe(canvas, {
      attributes: true,
      attributeFilter: ['style', 'class', 'width', 'height']
    });
  }

  function pixelSnap(value, dpr) {
    return Math.round(value * dpr) / dpr;
  }

  function apply(source) {
    raf = 0;
    removeLegacyOverlays();

    var img = createOverlay();
    if (!enabled()) {
      img.style.setProperty('display', 'none', 'important');
      return false;
    }

    var nextWheel = findWheel();
    if (!(nextWheel instanceof HTMLCanvasElement)) {
      img.style.setProperty('display', 'none', 'important');
      return false;
    }

    if (wheel !== nextWheel) {
      wheel = nextWheel;
      observeWheel(wheel);
    }

    var rect = wheel.getBoundingClientRect();
    if (!(rect.width > 300) || !(rect.height > 300)) return false;

    var dpr = Math.max(1, Number(window.devicePixelRatio) || 1);
    var scale = numberParam('ornateReferenceFrameScale', 1.0, 0.96, 1.06);
    var offsetX = numberParam('ornateReferenceFrameOffsetX', 0, -60, 60);
    var offsetY = numberParam('ornateReferenceFrameOffsetY', 0, -60, 60);

    var baseSize = Math.min(rect.width, rect.height);
    var size = pixelSnap(baseSize * scale, dpr);
    var centerX = pixelSnap(rect.left + rect.width / 2 + offsetX, dpr);
    var centerY = pixelSnap(rect.top + rect.height / 2 + offsetY, dpr);
    var left = pixelSnap(centerX - size / 2, dpr);
    var top = pixelSnap(centerY - size / 2, dpr);

    img.style.setProperty('display', 'block', 'important');
    img.style.setProperty('left', left + 'px', 'important');
    img.style.setProperty('top', top + 'px', 'important');
    img.style.setProperty('width', size + 'px', 'important');
    img.style.setProperty('height', size + 'px', 'important');

    applyCount += 1;
    lastApply = {
      source: source || 'apply',
      build: BUILD,
      asset: ASSET_URL,
      wheelWidth: rect.width,
      wheelHeight: rect.height,
      displayedSize: size,
      scale: scale,
      offsetX: offsetX,
      offsetY: offsetY,
      centerErrorX: centerX - (rect.left + rect.width / 2),
      centerErrorY: centerY - (rect.top + rect.height / 2),
      squareGeometry: Math.abs(size - size) < 0.001,
      transparentCenter: true,
      exactReferenceAsset: true,
      existingWheelGeometryChanged: false,
      at: Date.now()
    };

    window.dispatchEvent(new CustomEvent('gannzilla:exact-reference-frame-v707', {
      detail: lastApply
    }));
    return true;
  }

  function schedule(source, delay) {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(function () { apply(source || 'schedule'); });
    }, Math.max(0, Number(delay) || 0));
  }

  function install() {
    removeLegacyOverlays();
    createOverlay();

    [
      'resize',
      'scroll',
      'wheel',
      'gannzilla:wheel-ivory-champagne-final-authority-v682',
      'gannzilla:final-wheel-authority-v506',
      'gannzilla:outer-empty-ring-mirror-silver-v668',
      'gannzilla:empty-outer-ring-v518',
      'gannzilla:native-dpr-zoom-v504',
      'gannzilla:wheel-input-v459',
      'gannzilla:page-scrollbar-pan-v305',
      'gannzilla:layout-panel-visibility-change'
    ].forEach(function (name) {
      window.addEventListener(name, function () { schedule(name, 0); }, true);
    });

    document.addEventListener('visibilitychange', function () { schedule('visibilitychange', 0); }, false);

    [0, 80, 220, 500, 1000, 1800, 3200, 5600, 9000].forEach(function (delay) {
      window.setTimeout(function () { schedule('boot-' + delay, 0); }, delay);
    });

    window.setInterval(function () { schedule('geometry-watch', 0); }, 500);

    window.GANNZILLA_EXACT_REFERENCE_FRAME_V707 = true;
    window.__auditGannzillaExactReferenceFrameV707 = function () {
      return {
        ok: enabled()
          && wheel instanceof HTMLCanvasElement
          && overlay instanceof HTMLImageElement
          && overlay.isConnected
          && overlay.complete
          && overlay.naturalWidth > 0
          && overlay.style.display !== 'none',
        build: BUILD,
        enabled: enabled(),
        exactReferenceAsset: true,
        asset: ASSET_URL,
        assetLoaded: Boolean(overlay && overlay.complete && overlay.naturalWidth > 0),
        transparentCenter: true,
        geometryMode: 'square-center-locked-device-pixel-snapped',
        existingWheelGeometryChanged: false,
        overlayConnected: Boolean(overlay && overlay.isConnected),
        applyCount: applyCount,
        lastApply: lastApply
      };
    };

    window[STATE_KEY] = {
      apply: apply,
      schedule: schedule,
      get wheel() { return wheel; },
      get overlay() { return overlay; }
    };
  }

  install();
}());
