(function () {
  'use strict';

  var BUILD = 712;
  var STATE_KEY = '__gannzillaPersistentExactFrameV712';
  var OVERLAY_ID = 'gannzilla-persistent-exact-frame-v712';
  var ASSET_URL = '/assets/tasi-ornate-frame-exact-v691.webp?v=712-persistent-exact-frame';
  var ASSET_HOLE_DIAMETER_RATIO = 0.7444444444;
  var TARGET_HOLE_TO_WHEEL_RATIO = 1.018;

  if (window[STATE_KEY]) return;

  var wheel = null;
  var overlay = null;
  var resizeObserver = null;
  var mutationObserver = null;
  var raf = 0;
  var timer = 0;
  var applyCount = 0;
  var lastApply = null;

  function isWheelCanvas(canvas) {
    if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
    var id = String(canvas.id || '').toLowerCase();
    if (id.indexOf('overlay') >= 0 || id.indexOf('preview') >= 0 || id.indexOf('tracker') >= 0) return false;
    var rect = canvas.getBoundingClientRect();
    return canvas.width > 300 && canvas.height > 300 && rect.width > 250 && rect.height > 250;
  }

  function findWheel() {
    var preferred = document.querySelector([
      'canvas[data-gannzilla-wheel-ivory-champagne-final-authority-v682="true"]',
      'canvas[data-gannzilla-outer-empty-ring-mirror-silver-v668="true"]',
      'canvas[data-gannzilla-empty-outer-ring-v518="true"]',
      'canvas[data-gannzilla-final-wheel-authority-v506="true"]'
    ].join(','));

    if (isWheelCanvas(preferred)) return preferred;

    return Array.prototype.slice.call(document.querySelectorAll('canvas'))
      .filter(isWheelCanvas)
      .sort(function (a, b) {
        var ar = a.getBoundingClientRect();
        var br = b.getBoundingClientRect();
        return (br.width * br.height) - (ar.width * ar.height);
      })[0] || null;
  }

  function removePreviousAttempts() {
    [
      'gannzilla-ornate-outer-frame-overlay-v687',
      'gannzilla-reference-ornate-frame-v688',
      'gannzilla-exact-reference-frame-v690',
      'gannzilla-exact-reference-frame-v691',
      'gannzilla-exact-reference-frame-v693',
      'gannzilla-exact-reference-frame-v707'
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
    overlay.draggable = false;
    overlay.decoding = 'async';
    overlay.src = ASSET_URL;
    overlay.dataset.gannzillaPersistentExactFrameV712 = 'true';

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
    style.setProperty('z-index', '2147483000', 'important');
    style.setProperty('opacity', '1', 'important');
    style.setProperty('visibility', 'visible', 'important');
    style.setProperty('transform', 'translate3d(0,0,0)', 'important');
    style.setProperty('transform-origin', '50% 50%', 'important');
    style.setProperty('image-rendering', 'auto', 'important');
    style.setProperty('mix-blend-mode', 'normal', 'important');
    style.setProperty('filter', 'none', 'important');

    (document.body || document.documentElement).appendChild(overlay);
    overlay.addEventListener('load', function () { schedule('asset-load', 0); }, { once: true });
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

    if (typeof MutationObserver === 'function') {
      mutationObserver = new MutationObserver(function () {
        if (!wheel || !wheel.isConnected || !overlay || !overlay.isConnected) {
          schedule('dom-replacement', 0);
        }
      });
      mutationObserver.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  function snap(value, dpr) {
    return Math.round(value * dpr) / dpr;
  }

  function apply(source) {
    raf = 0;
    removePreviousAttempts();

    var nextWheel = findWheel();
    if (!(nextWheel instanceof HTMLCanvasElement)) {
      if (overlay) overlay.style.setProperty('display', 'none', 'important');
      return false;
    }

    if (wheel !== nextWheel) {
      wheel = nextWheel;
      observeWheel(wheel);
    }

    var rect = wheel.getBoundingClientRect();
    var wheelSize = Math.min(rect.width, rect.height);
    if (!(wheelSize > 250)) return false;

    var dpr = Math.max(1, Number(window.devicePixelRatio) || 1);
    var targetHoleDiameter = wheelSize * TARGET_HOLE_TO_WHEEL_RATIO;
    var overlaySize = snap(targetHoleDiameter / ASSET_HOLE_DIAMETER_RATIO, dpr);
    var centerX = snap(rect.left + rect.width / 2, dpr);
    var centerY = snap(rect.top + rect.height / 2, dpr);
    var left = snap(centerX - overlaySize / 2, dpr);
    var top = snap(centerY - overlaySize / 2, dpr);
    var img = createOverlay();

    img.style.setProperty('display', 'block', 'important');
    img.style.setProperty('left', left + 'px', 'important');
    img.style.setProperty('top', top + 'px', 'important');
    img.style.setProperty('width', overlaySize + 'px', 'important');
    img.style.setProperty('height', overlaySize + 'px', 'important');
    img.style.setProperty('opacity', '1', 'important');
    img.style.setProperty('visibility', 'visible', 'important');

    applyCount += 1;
    lastApply = {
      source: source || 'apply',
      build: BUILD,
      wheelSize: wheelSize,
      targetHoleDiameter: targetHoleDiameter,
      overlaySize: overlaySize,
      centerX: centerX,
      centerY: centerY,
      exactReferenceAsset: true,
      persistentAfterDocumentRewrite: true,
      existingWheelGeometryChanged: false,
      assetLoaded: Boolean(img.complete && img.naturalWidth > 0),
      at: Date.now()
    };

    window.dispatchEvent(new CustomEvent('gannzilla:persistent-exact-frame-v712', {
      detail: lastApply
    }));
    return true;
  }

  function schedule(source, delay) {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(function () { apply(source || 'schedule'); });
    }, Math.max(0, Number(delay) || 0));
  }

  function install() {
    removePreviousAttempts();
    createOverlay();

    [
      'pointerdown', 'pointermove', 'pointerup', 'pointercancel',
      'wheel', 'resize', 'scroll',
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

    [0, 60, 140, 280, 500, 900, 1500, 2500, 4000, 6500, 10000].forEach(function (delay) {
      window.setTimeout(function () { schedule('boot-' + delay, 0); }, delay);
    });

    window.setInterval(function () { schedule('persistent-watch', 0); }, 350);

    window.GANNZILLA_PERSISTENT_EXACT_FRAME_V712 = true;
    window.__auditGannzillaPersistentExactFrameV712 = function () {
      return {
        ok: Boolean(
          wheel instanceof HTMLCanvasElement &&
          overlay instanceof HTMLImageElement &&
          overlay.isConnected &&
          overlay.complete &&
          overlay.naturalWidth > 0 &&
          overlay.style.display !== 'none'
        ),
        build: BUILD,
        exactReferenceAsset: true,
        persistentAfterDocumentRewrite: true,
        existingWheelGeometryChanged: false,
        overlayConnected: Boolean(overlay && overlay.isConnected),
        assetLoaded: Boolean(overlay && overlay.complete && overlay.naturalWidth > 0),
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
