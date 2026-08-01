(function () {
  'use strict';

  var BUILD = 723;
  var OVERLAY_ID = 'gannzilla-ornate-frame-direct-v723';
  var MASK_ID = 'gannzilla-ornate-frame-mask-v723';
  var ASSET_URL = '/assets/tasi-ornate-frame-exact-v691.webp?v=723-direct-authority';
  var STATE_KEY = '__gannzillaOrnateFrameDirectV723';
  var INNER_HOLE_RATIO = 0.786;
  var BASE_RESERVED_MARGIN = 90;

  if (window[STATE_KEY]) return;

  var wheel = null;
  var overlay = null;
  var raf = 0;
  var timer = 0;
  var applyCount = 0;
  var lastApply = null;

  function removeOldOverlays() {
    [
      'gannzilla-ornate-outer-frame-overlay-v687',
      'gannzilla-reference-ornate-frame-v688',
      'gannzilla-exact-reference-frame-v690',
      'gannzilla-exact-reference-frame-v691',
      'gannzilla-exact-reference-frame-v693',
      'gannzilla-exact-reference-frame-v707',
      'gannzilla-persistent-exact-frame-v712',
      'gannzilla-ornate-frame-clean-v720',
      'gannzilla-ornate-frame-clean-v721'
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
    return rect.width > 300 && rect.height > 300 && canvas.width > 300 && canvas.height > 300;
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

  function svgNode(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
  }

  function ensureOverlay() {
    if (overlay && overlay.isConnected) return overlay;

    overlay = svgNode('svg');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('viewBox', '0 0 1000 1000');
    overlay.setAttribute('preserveAspectRatio', 'none');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.dataset.gannzillaOrnateFrameDirectV723 = 'true';

    var defs = svgNode('defs');
    var mask = svgNode('mask');
    mask.id = MASK_ID;
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    mask.setAttribute('x', '0');
    mask.setAttribute('y', '0');
    mask.setAttribute('width', '1000');
    mask.setAttribute('height', '1000');

    var base = svgNode('rect');
    base.setAttribute('x', '0');
    base.setAttribute('y', '0');
    base.setAttribute('width', '1000');
    base.setAttribute('height', '1000');
    base.setAttribute('fill', 'black');

    var outer = svgNode('circle');
    outer.setAttribute('cx', '500');
    outer.setAttribute('cy', '500');
    outer.setAttribute('r', '498');
    outer.setAttribute('fill', 'white');

    var inner = svgNode('circle');
    inner.setAttribute('cx', '500');
    inner.setAttribute('cy', '500');
    inner.setAttribute('r', String(500 * INNER_HOLE_RATIO));
    inner.setAttribute('fill', 'black');

    var leftArtifact = svgNode('path');
    leftArtifact.setAttribute('d', 'M0 285 L22 355 L22 645 L0 715 Z');
    leftArtifact.setAttribute('fill', 'black');

    var rightArtifact = svgNode('path');
    rightArtifact.setAttribute('d', 'M1000 285 L978 355 L978 645 L1000 715 Z');
    rightArtifact.setAttribute('fill', 'black');

    mask.appendChild(base);
    mask.appendChild(outer);
    mask.appendChild(inner);
    mask.appendChild(leftArtifact);
    mask.appendChild(rightArtifact);
    defs.appendChild(mask);

    var image = svgNode('image');
    image.setAttribute('x', '0');
    image.setAttribute('y', '0');
    image.setAttribute('width', '1000');
    image.setAttribute('height', '1000');
    image.setAttribute('preserveAspectRatio', 'none');
    image.setAttribute('href', ASSET_URL);
    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', ASSET_URL);
    image.setAttribute('mask', 'url(#' + MASK_ID + ')');

    overlay.appendChild(defs);
    overlay.appendChild(image);

    var style = overlay.style;
    style.setProperty('position', 'fixed', 'important');
    style.setProperty('display', 'none', 'important');
    style.setProperty('left', '0px', 'important');
    style.setProperty('top', '0px', 'important');
    style.setProperty('width', '0px', 'important');
    style.setProperty('height', '0px', 'important');
    style.setProperty('max-width', 'none', 'important');
    style.setProperty('max-height', 'none', 'important');
    style.setProperty('pointer-events', 'none', 'important');
    style.setProperty('user-select', 'none', 'important');
    style.setProperty('touch-action', 'none', 'important');
    style.setProperty('overflow', 'visible', 'important');
    style.setProperty('z-index', '2147483000', 'important');
    style.setProperty('opacity', '1', 'important');
    style.setProperty('visibility', 'visible', 'important');
    style.setProperty('transform', 'translate3d(0,0,0)', 'important');
    style.setProperty('transform-origin', '50% 50%', 'important');

    (document.body || document.documentElement).appendChild(overlay);
    return overlay;
  }

  function snap(value) {
    var dpr = Math.max(1, Number(window.devicePixelRatio) || 1);
    return Math.round(value * dpr) / dpr;
  }

  function apply(source) {
    raf = 0;
    removeOldOverlays();
    var svg = ensureOverlay();
    var nextWheel = findWheel();

    if (!(nextWheel instanceof HTMLCanvasElement)) {
      svg.style.setProperty('display', 'none', 'important');
      return false;
    }

    wheel = nextWheel;
    var rect = wheel.getBoundingClientRect();
    var canvasSize = Math.min(rect.width, rect.height);
    if (!(canvasSize > 300)) return false;

    var zoom = Math.max(0.5, Number(wheel.dataset.gannzillaAppliedZoom) || 1);
    var reservedMargin = Math.min(canvasSize * 0.16, Math.max(36, BASE_RESERVED_MARGIN * zoom));
    var coreDiameter = Math.max(canvasSize * 0.68, canvasSize - (reservedMargin * 2));
    var targetHoleDiameter = coreDiameter + Math.max(2, 4 * zoom);
    var frameSize = snap(targetHoleDiameter / INNER_HOLE_RATIO);
    var centerX = snap(rect.left + rect.width / 2);
    var centerY = snap(rect.top + rect.height / 2);
    var left = snap(centerX - frameSize / 2);
    var top = snap(centerY - frameSize / 2);

    svg.style.setProperty('left', left + 'px', 'important');
    svg.style.setProperty('top', top + 'px', 'important');
    svg.style.setProperty('width', frameSize + 'px', 'important');
    svg.style.setProperty('height', frameSize + 'px', 'important');
    svg.style.setProperty('display', 'block', 'important');

    applyCount += 1;
    lastApply = {
      source: source || 'apply',
      build: BUILD,
      asset: ASSET_URL,
      canvasSize: canvasSize,
      coreDiameter: coreDiameter,
      targetHoleDiameter: targetHoleDiameter,
      frameSize: frameSize,
      left: left,
      top: top,
      centerX: centerX,
      centerY: centerY,
      zoom: zoom,
      directRuntime: true,
      maskedTransparentCenter: true,
      existingWheelGeometryChanged: false,
      at: Date.now()
    };

    window.dispatchEvent(new CustomEvent('gannzilla:ornate-frame-direct-v723', { detail: lastApply }));
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
    removeOldOverlays();
    ensureOverlay();

    [
      'load', 'resize', 'scroll', 'wheel', 'pointerdown', 'pointermove', 'pointerup',
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

    if (typeof MutationObserver === 'function') {
      new MutationObserver(function () { schedule('dom-mutation', 20); })
        .observe(document.documentElement, { childList: true, subtree: true, attributes: true });
    }

    [0, 80, 180, 360, 700, 1200, 2200, 4000, 7000].forEach(function (delay) {
      window.setTimeout(function () { schedule('boot-' + delay, 0); }, delay);
    });

    window.setInterval(function () { schedule('geometry-watch', 0); }, 350);

    window.GANNZILLA_ORNATE_FRAME_DIRECT_V723 = true;
    window.__auditGannzillaOrnateFrameDirectV723 = function () {
      return {
        ok: Boolean(overlay && overlay.isConnected && overlay.style.display !== 'none' && wheel),
        build: BUILD,
        asset: ASSET_URL,
        directRuntime: true,
        maskedTransparentCenter: true,
        overlayConnected: Boolean(overlay && overlay.isConnected),
        wheelFound: Boolean(wheel),
        applyCount: applyCount,
        lastApply: lastApply
      };
    };

    window[STATE_KEY] = { apply: apply, schedule: schedule };
  }

  install();
}());
