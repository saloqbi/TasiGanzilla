(function () {
  'use strict';

  if (window.__gannzillaExactReferenceOrnateFrameV705) return;
  window.__gannzillaExactReferenceOrnateFrameV705 = true;

  var BUILD = 705;
  var OVERLAY_ID = 'gannzilla-exact-reference-ornate-frame-v705';
  var ASSET_URL = '/assets/tasi-ornate-frame-reference-v688.webp?v=705-exact-large-reference';
  var LEGACY_IDS = [
    'gannzilla-ornate-outer-frame-overlay-v687',
    'gannzilla-reference-ornate-frame-v688',
    'gannzilla-reference-ornate-overlay-v703',
    'gannzilla-comfort-ornate-frame-v704'
  ];

  var wheel = null;
  var overlay = null;
  var resizeObserver = null;
  var mutationObserver = null;
  var raf = 0;
  var timer = 0;
  var applyCount = 0;
  var lastApply = null;

  function params() {
    try {
      return new URLSearchParams(
        window.__gannzillaV672CanonicalSearch ||
        window.sessionStorage.getItem('gannzilla:v672:canonical-search') ||
        window.location.search ||
        ''
      );
    } catch (_) {
      return new URLSearchParams();
    }
  }

  function boolParam(name, fallback) {
    var query = params();
    if (!query.has(name)) return fallback;
    return ['true', '1', 'yes', 'on'].indexOf(String(query.get(name) || '').toLowerCase()) >= 0;
  }

  function numberParam(name, fallback, min, max) {
    var value = Number(params().get(name));
    if (!Number.isFinite(value)) return fallback;
    return Math.max(min, Math.min(max, value));
  }

  function enabled() {
    var query = params();
    var wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
    return wheelMode &&
      boolParam('ornateOuterFrame', true) &&
      boolParam('ornateExactReferenceFrame', true);
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

    return Array.from(document.querySelectorAll('canvas'))
      .filter(isWheelCanvas)
      .sort(function (a, b) { return b.width * b.height - a.width * a.height; })[0] || null;
  }

  function removeLegacyOverlays() {
    LEGACY_IDS.forEach(function (id) {
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
    overlay.dataset.gannzillaExactReferenceOrnateFrameV705 = 'true';
    overlay.src = ASSET_URL;
    overlay.draggable = false;

    overlay.style.setProperty('position', 'fixed', 'important');
    overlay.style.setProperty('pointer-events', 'none', 'important');
    overlay.style.setProperty('user-select', 'none', 'important');
    overlay.style.setProperty('z-index', '2147483000', 'important');
    overlay.style.setProperty('object-fit', 'fill', 'important');
    overlay.style.setProperty('transform', 'translateZ(0)', 'important');
    overlay.style.setProperty('transform-origin', 'center center', 'important');
    overlay.style.setProperty('image-rendering', 'auto', 'important');
    overlay.style.setProperty('max-width', 'none', 'important');
    overlay.style.setProperty('max-height', 'none', 'important');
    overlay.style.setProperty('filter', 'contrast(1.04) saturate(1.05) drop-shadow(0 5px 10px rgba(36, 14, 2, 0.28))', 'important');
    overlay.style.setProperty('will-change', 'left, top, width, height', 'important');

    overlay.addEventListener('load', function () { schedule('asset-load'); }, { once: true });
    overlay.addEventListener('error', function () {
      lastApply = {
        source: 'asset-error',
        build: BUILD,
        assetUrl: ASSET_URL,
        at: Date.now()
      };
    }, { once: true });

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
      resizeObserver = new ResizeObserver(function () { schedule('wheel-resize'); });
      resizeObserver.observe(canvas);
    }

    mutationObserver = new MutationObserver(function () { schedule('wheel-mutation'); });
    mutationObserver.observe(canvas, {
      attributes: true,
      attributeFilter: ['style', 'class', 'width', 'height']
    });
  }

  function hideOverlay() {
    if (overlay) overlay.style.setProperty('display', 'none', 'important');
  }

  function apply(source) {
    raf = 0;
    removeLegacyOverlays();

    if (!enabled()) {
      hideOverlay();
      return false;
    }

    var nextWheel = findWheel();
    if (!(nextWheel instanceof HTMLCanvasElement)) {
      hideOverlay();
      return false;
    }

    if (wheel !== nextWheel) {
      wheel = nextWheel;
      observeWheel(wheel);
    }

    var rect = wheel.getBoundingClientRect();
    var style = window.getComputedStyle(wheel);
    if (style.display === 'none' || style.visibility === 'hidden' || !(rect.width > 250) || !(rect.height > 250)) {
      hideOverlay();
      return false;
    }

    var scale = numberParam('ornateExactReferenceFrameScale', 1.18, 1.05, 1.32);
    var xOffset = numberParam('ornateExactReferenceFrameOffsetX', 0, -120, 120);
    var yOffset = numberParam('ornateExactReferenceFrameOffsetY', 0, -120, 120);
    var dpr = Math.max(1, window.devicePixelRatio || 1);
    var rawSize = Math.min(rect.width, rect.height) * scale;
    var size = Math.round(rawSize * dpr) / dpr;
    var centerX = rect.left + rect.width / 2 + xOffset;
    var centerY = rect.top + rect.height / 2 + yOffset;
    var img = createOverlay();

    img.style.setProperty('display', 'block', 'important');
    img.style.setProperty('visibility', 'visible', 'important');
    img.style.setProperty('opacity', '1', 'important');
    img.style.setProperty('left', (centerX - size / 2) + 'px', 'important');
    img.style.setProperty('top', (centerY - size / 2) + 'px', 'important');
    img.style.setProperty('width', size + 'px', 'important');
    img.style.setProperty('height', size + 'px', 'important');

    applyCount += 1;
    lastApply = {
      source: source || 'apply',
      build: BUILD,
      exactReferenceAsset: true,
      transparentCenter: true,
      ornamentation: 'large-clear-cardinal-filigree-blue-gems',
      assetUrl: ASSET_URL,
      assetLoaded: Boolean(img.complete && img.naturalWidth > 0),
      naturalWidth: img.naturalWidth || 0,
      naturalHeight: img.naturalHeight || 0,
      wheelWidth: rect.width,
      wheelHeight: rect.height,
      overlaySize: size,
      scale: scale,
      xOffset: xOffset,
      yOffset: yOffset,
      at: Date.now()
    };

    return true;
  }

  function schedule(source, delay) {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(function () { apply(source || 'schedule'); });
    }, delay || 0);
  }

  function install() {
    var refresh = function (event) { schedule(event && event.type ? event.type : 'refresh'); };

    [
      'resize',
      'scroll',
      'wheel',
      'pointermove',
      'gannzilla:wheel-ivory-champagne-final-authority-v682',
      'gannzilla:final-wheel-authority-v506',
      'gannzilla:outer-empty-ring-mirror-silver-v668',
      'gannzilla:empty-outer-ring-v518',
      'gannzilla:native-dpr-zoom-v504',
      'gannzilla:wheel-input-v459',
      'gannzilla:page-scrollbar-pan-v305',
      'gannzilla:layout-panel-visibility-change'
    ].forEach(function (name) {
      window.addEventListener(name, refresh, true);
    });

    document.addEventListener('visibilitychange', refresh, false);

    [0, 80, 180, 360, 700, 1300, 2400, 4200, 7000].forEach(function (delay) {
      window.setTimeout(function () { schedule('boot-' + delay); }, delay);
    });

    window.setInterval(function () { schedule('watch'); }, 650);

    window.__auditGannzillaExactReferenceOrnateFrameV705 = function () {
      return {
        ok: enabled() &&
          wheel instanceof HTMLCanvasElement &&
          overlay instanceof HTMLImageElement &&
          overlay.isConnected &&
          overlay.complete &&
          overlay.naturalWidth > 0 &&
          overlay.style.display !== 'none',
        build: BUILD,
        enabled: enabled(),
        exactReferenceAsset: true,
        transparentCenter: true,
        assetUrl: ASSET_URL,
        assetLoaded: Boolean(overlay && overlay.complete && overlay.naturalWidth > 0),
        overlayConnected: Boolean(overlay && overlay.isConnected),
        applyCount: applyCount,
        lastApply: lastApply
      };
    };
  }

  install();
}());
