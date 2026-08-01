(function () {
  'use strict';

  if (window.__gannzillaExactReferenceFrameRuntimeV693) return;
  window.__gannzillaExactReferenceFrameRuntimeV693 = true;

  var BUILD = 693;
  var OVERLAY_ID = 'gannzilla-exact-reference-frame-v693';
  var ASSET_URL = '/assets/tasi-ornate-frame-exact-v691.webp?v=693-direct-frame';
  var ASSET_HOLE_DIAMETER_RATIO = 0.7444444444;
  var TARGET_HOLE_TO_WHEEL_RATIO = 0.985;

  var wheel = null;
  var overlay = null;
  var resizeObserver = null;
  var mutationObserver = null;
  var raf = 0;
  var applyCount = 0;
  var lastApply = null;

  function removePreviousAttempts() {
    [
      'gannzilla-ornate-outer-frame-overlay-v687',
      'gannzilla-reference-ornate-frame-v688',
      'gannzilla-exact-reference-frame-v690',
      'gannzilla-exact-reference-frame-v691'
    ].forEach(function (id) {
      var node = document.getElementById(id);
      if (node) node.remove();
    });
  }

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

  function createOverlay() {
    if (overlay && overlay.isConnected) return overlay;

    overlay = document.createElement('img');
    overlay.id = OVERLAY_ID;
    overlay.alt = '';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.draggable = false;
    overlay.src = ASSET_URL;
    overlay.dataset.gannzillaExactReferenceFrameV693 = 'true';

    overlay.style.setProperty('position', 'fixed', 'important');
    overlay.style.setProperty('pointer-events', 'none', 'important');
    overlay.style.setProperty('user-select', 'none', 'important');
    overlay.style.setProperty('max-width', 'none', 'important');
    overlay.style.setProperty('max-height', 'none', 'important');
    overlay.style.setProperty('object-fit', 'fill', 'important');
    overlay.style.setProperty('transform', 'translateZ(0)', 'important');
    overlay.style.setProperty('transform-origin', 'center center', 'important');
    overlay.style.setProperty('z-index', '2147483000', 'important');
    overlay.style.setProperty('image-rendering', 'auto', 'important');
    overlay.style.setProperty('display', 'none', 'important');

    (document.body || document.documentElement).appendChild(overlay);
    return overlay;
  }

  function disconnectWheelObservers() {
    if (resizeObserver) resizeObserver.disconnect();
    resizeObserver = null;
  }

  function observeWheel(canvas) {
    disconnectWheelObservers();
    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(function () { schedule('wheel-resize'); });
      resizeObserver.observe(canvas);
    }
  }

  function apply(source) {
    raf = 0;
    removePreviousAttempts();

    var nextWheel = findWheel();
    if (!(nextWheel instanceof HTMLCanvasElement)) return false;

    if (wheel !== nextWheel) {
      wheel = nextWheel;
      observeWheel(wheel);
    }

    var rect = wheel.getBoundingClientRect();
    var wheelSize = Math.min(rect.width, rect.height);
    if (!(wheelSize > 250)) return false;

    var targetHoleDiameter = wheelSize * TARGET_HOLE_TO_WHEEL_RATIO;
    var overlaySize = targetHoleDiameter / ASSET_HOLE_DIAMETER_RATIO;
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;
    var img = createOverlay();

    img.style.setProperty('display', 'block', 'important');
    img.style.setProperty('left', (centerX - overlaySize / 2) + 'px', 'important');
    img.style.setProperty('top', (centerY - overlaySize / 2) + 'px', 'important');
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
      assetLoaded: Boolean(img.complete && img.naturalWidth > 0),
      at: Date.now()
    };
    return true;
  }

  function schedule(source) {
    if (raf) window.cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(function () { apply(source || 'schedule'); });
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
      window.addEventListener(name, function () { schedule(name); }, true);
    });

    if (typeof MutationObserver === 'function') {
      mutationObserver = new MutationObserver(function () { schedule('dom-mutation'); });
      mutationObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
    }

    [0, 60, 140, 280, 500, 900, 1500, 2500, 4000, 6500].forEach(function (delay) {
      window.setTimeout(function () { schedule('boot-' + delay); }, delay);
    });
    window.setInterval(function () { schedule('frame-watch'); }, 300);

    window.__auditGannzillaExactReferenceFrameV693 = function () {
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
        runtimeInstalled: true,
        overlayConnected: Boolean(overlay && overlay.isConnected),
        assetLoaded: Boolean(overlay && overlay.complete && overlay.naturalWidth > 0),
        applyCount: applyCount,
        lastApply: lastApply
      };
    };
  }

  install();
}());
