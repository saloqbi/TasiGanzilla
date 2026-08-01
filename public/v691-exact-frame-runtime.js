(function () {
  'use strict';

  var BUILD = 691;
  var OVERLAY_ID = 'gannzilla-exact-reference-frame-v691';
  var ASSET_URL = '/assets/tasi-ornate-frame-exact-v691.webp?v=691-exact-frame';
  var ASSET_HOLE_DIAMETER_RATIO = 0.7444444444;

  var wheel = null;
  var overlay = null;
  var resizeObserver = null;
  var mutationObserver = null;
  var raf = 0;
  var applyCount = 0;
  var lastApply = null;

  function numberValue(value, fallback) {
    var result = Number(value);
    return Number.isFinite(result) ? result : fallback;
  }

  function isWheelCanvas(canvas) {
    if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
    var id = String(canvas.id || '').toLowerCase();
    if (id.indexOf('overlay') >= 0 || id.indexOf('preview') >= 0 || id.indexOf('tracker') >= 0) return false;
    return canvas.width > 300 && canvas.height > 300;
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
      .sort(function (a, b) { return (b.width * b.height) - (a.width * a.height); })[0] || null;
  }

  function removePreviousAttempts() {
    [
      'gannzilla-ornate-outer-frame-overlay-v687',
      'gannzilla-reference-ornate-frame-v688',
      'gannzilla-exact-reference-frame-v690'
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
    overlay.src = ASSET_URL;
    overlay.dataset.gannzillaExactReferenceFrameV691 = 'true';

    overlay.style.setProperty('position', 'fixed', 'important');
    overlay.style.setProperty('pointer-events', 'none', 'important');
    overlay.style.setProperty('user-select', 'none', 'important');
    overlay.style.setProperty('max-width', 'none', 'important');
    overlay.style.setProperty('max-height', 'none', 'important');
    overlay.style.setProperty('object-fit', 'fill', 'important');
    overlay.style.setProperty('transform', 'translateZ(0)', 'important');
    overlay.style.setProperty('transform-origin', 'center center', 'important');
    overlay.style.setProperty('z-index', '20', 'important');
    overlay.style.setProperty('image-rendering', 'auto', 'important');

    document.body.appendChild(overlay);
    return overlay;
  }

  function disconnectObservers() {
    if (resizeObserver) resizeObserver.disconnect();
    if (mutationObserver) mutationObserver.disconnect();
    resizeObserver = null;
    mutationObserver = null;
  }

  function schedule(source) {
    if (raf) return;
    raf = window.requestAnimationFrame(function () {
      apply(source || 'schedule');
    });
  }

  function observeWheel(canvas) {
    disconnectObservers();

    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(function () { schedule('wheel-resize'); });
      resizeObserver.observe(canvas);
    }

    mutationObserver = new MutationObserver(function () { schedule('wheel-mutation'); });
    mutationObserver.observe(canvas, {
      attributes: true,
      attributeFilter: ['style', 'width', 'height', 'class']
    });
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
    if (!(rect.width > 250 && rect.height > 250)) return false;

    var expandedCssSize = numberValue(
      wheel.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518 || wheel.dataset.gannzillaCanvasCssSize,
      Math.min(rect.width, rect.height)
    );
    var baseCssSize = numberValue(
      wheel.dataset.gannzillaEmptyOuterRingBaseCssSizeV518,
      expandedCssSize
    );
    var ringWidth = numberValue(
      wheel.dataset.gannzillaEmptyOuterRingWidthV518,
      numberValue(wheel.dataset.gannzillaRingWidths && String(wheel.dataset.gannzillaRingWidths).split(',').pop(), 60)
    );
    var zoom = Math.max(0.5, numberValue(wheel.dataset.gannzillaAppliedZoom, 1));
    var displayScale = Math.min(rect.width, rect.height) / expandedCssSize;

    // This is the exact inner boundary of the current angle frame.
    var baseOuterRadius = Math.max(1, (baseCssSize - (180 * zoom)) / 2);
    var angleInnerRadius = baseOuterRadius + (ringWidth * 2);
    var targetHoleDiameter = angleInnerRadius * 2 * displayScale;
    var overlaySize = targetHoleDiameter / ASSET_HOLE_DIAMETER_RATIO;

    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;
    var img = createOverlay();

    img.style.display = 'block';
    img.style.left = (centerX - overlaySize / 2) + 'px';
    img.style.top = (centerY - overlaySize / 2) + 'px';
    img.style.width = overlaySize + 'px';
    img.style.height = overlaySize + 'px';

    applyCount += 1;
    lastApply = {
      source: source || 'apply',
      build: BUILD,
      exactReferenceAsset: true,
      singleFrameAuthority: true,
      expandedCssSize: expandedCssSize,
      baseCssSize: baseCssSize,
      ringWidth: ringWidth,
      zoom: zoom,
      displayScale: displayScale,
      angleInnerRadius: angleInnerRadius,
      targetHoleDiameter: targetHoleDiameter,
      assetHoleDiameterRatio: ASSET_HOLE_DIAMETER_RATIO,
      overlaySize: overlaySize,
      at: Date.now()
    };
    return true;
  }

  function install() {
    if (window.__gannzillaExactReferenceFrameRuntimeV691) return;
    window.__gannzillaExactReferenceFrameRuntimeV691 = true;

    [
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel',
      'wheel',
      'resize',
      'scroll',
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

    [0, 80, 220, 500, 1000, 1800, 3200, 5600].forEach(function (delay) {
      window.setTimeout(function () { schedule('boot-' + delay); }, delay);
    });

    window.setInterval(function () { schedule('frame-watch'); }, 250);

    window.__auditGannzillaExactReferenceFrameV691 = function () {
      return {
        ok: Boolean(
          wheel instanceof HTMLCanvasElement
          && overlay instanceof HTMLImageElement
          && overlay.isConnected
          && overlay.complete
          && overlay.naturalWidth > 0
          && overlay.style.display !== 'none'
        ),
        build: BUILD,
        exactReferenceAsset: true,
        singleFrameAuthority: true,
        assetLoaded: Boolean(overlay && overlay.complete && overlay.naturalWidth > 0),
        overlayConnected: Boolean(overlay && overlay.isConnected),
        applyCount: applyCount,
        lastApply: lastApply
      };
    };
  }

  install();
}());
