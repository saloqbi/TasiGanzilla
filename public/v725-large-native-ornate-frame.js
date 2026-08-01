(function () {
  'use strict';

  var BUILD = 725;
  var STATE_KEY = '__gannzillaLargeNativeOrnateFrameV725';
  var TAU = Math.PI * 2;
  var applyCount = 0;
  var lastApply = null;
  var raf = 0;
  var timer = 0;

  if (window[STATE_KEY]) return;

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

  function polar(cx, cy, radius, degrees) {
    var radians = ((degrees - 90) * Math.PI) / 180;
    return {
      x: cx + Math.cos(radians) * radius,
      y: cy + Math.sin(radians) * radius
    };
  }

  function fillAnnulus(ctx, cx, cy, inner, outer, fillStyle) {
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1, outer), 0, TAU);
    ctx.arc(cx, cy, Math.max(1, inner), TAU, 0, true);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  function strokeCircle(ctx, cx, cy, radius, color, width) {
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1, radius), 0, TAU);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    var r = Math.max(0, Math.min(radius, width / 2, height / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function goldGradient(ctx, x1, y1, x2, y2) {
    var gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, '#351001');
    gradient.addColorStop(0.17, '#8a3e08');
    gradient.addColorStop(0.35, '#e59a2c');
    gradient.addColorStop(0.50, '#fff0a8');
    gradient.addColorStop(0.66, '#d77f1d');
    gradient.addColorStop(0.84, '#713006');
    gradient.addColorStop(1, '#250900');
    return gradient;
  }

  function drawGem(ctx, x, y, radius, zoom) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    var gem = ctx.createRadialGradient(x - radius * 0.28, y - radius * 0.32, 0, x, y, radius);
    gem.addColorStop(0, '#ffffff');
    gem.addColorStop(0.22, '#b5efff');
    gem.addColorStop(0.48, '#42afea');
    gem.addColorStop(0.76, '#0b5ca4');
    gem.addColorStop(1, '#03284f');
    ctx.fillStyle = gem;
    ctx.fill();
    ctx.strokeStyle = '#ffe69b';
    ctx.lineWidth = Math.max(0.8, 1.15 * zoom);
    ctx.stroke();
  }

  function drawDiamond(ctx, cx, cy, radius, angle, zoom, large) {
    var point = polar(cx, cy, radius, angle);
    var size = Math.max(10, (large ? 20 : 14) * zoom);

    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate((angle * Math.PI) / 180 + Math.PI / 4);
    ctx.fillStyle = '#050608';
    ctx.strokeStyle = goldGradient(ctx, -size, -size, size, size);
    ctx.lineWidth = Math.max(1.5, 2.4 * zoom);
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.strokeRect(-size / 2, -size / 2, size, size);
    ctx.fillStyle = '#d78b27';
    ctx.fillRect(-size * 0.34, -size * 0.34, size * 0.68, size * 0.68);
    drawGem(ctx, 0, 0, size * 0.19, zoom);
    ctx.restore();
  }

  function drawFiligree(ctx, span, height, zoom) {
    var gold = goldGradient(ctx, -span, 0, span, 0);
    [-1, 1].forEach(function (side) {
      ctx.save();
      ctx.scale(side, 1);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = gold;
      ctx.lineWidth = Math.max(2.2, 3.4 * zoom);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(span * 0.20, -height * 0.78, span * 0.55, -height * 0.92, span * 0.84, -height * 0.22);
      ctx.bezierCurveTo(span * 0.62, -height * 0.14, span * 0.43, height * 0.46, span * 0.10, height * 0.35);
      ctx.stroke();

      ctx.strokeStyle = '#ffe4a1';
      ctx.lineWidth = Math.max(1.0, 1.55 * zoom);
      ctx.beginPath();
      ctx.moveTo(span * 0.18, -height * 0.05);
      ctx.bezierCurveTo(span * 0.39, -height * 0.57, span * 0.59, -height * 0.56, span * 0.70, -height * 0.17);
      ctx.stroke();

      ctx.strokeStyle = '#9f4e0b';
      ctx.beginPath();
      ctx.moveTo(span * 0.27, height * 0.14);
      ctx.bezierCurveTo(span * 0.49, height * 0.60, span * 0.69, height * 0.52, span * 0.77, height * 0.15);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawCardinal(ctx, cx, cy, radius, angle, label, frameWidth, zoom) {
    var point = polar(cx, cy, radius, angle);
    var radians = (angle * Math.PI) / 180;
    var plaqueWidth = Math.max(68, frameWidth * 0.98);
    var plaqueHeight = Math.max(30, frameWidth * 0.40);
    var span = Math.max(62, frameWidth * 0.98);
    var height = Math.max(30, frameWidth * 0.47);

    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(radians);
    drawFiligree(ctx, span, height, zoom);
    ctx.rotate(-radians);

    var x = -plaqueWidth / 2;
    var y = -plaqueHeight / 2;
    roundedRect(ctx, x, y, plaqueWidth, plaqueHeight, plaqueHeight * 0.34);
    var plaque = ctx.createLinearGradient(0, y, 0, y + plaqueHeight);
    plaque.addColorStop(0, '#4b3320');
    plaque.addColorStop(0.38, '#101013');
    plaque.addColorStop(0.63, '#020304');
    plaque.addColorStop(1, '#2c180b');
    ctx.fillStyle = plaque;
    ctx.fill();
    ctx.strokeStyle = goldGradient(ctx, x, 0, x + plaqueWidth, 0);
    ctx.lineWidth = Math.max(2.1, 3.0 * zoom);
    ctx.stroke();

    roundedRect(
      ctx,
      x + plaqueHeight * 0.12,
      y + plaqueHeight * 0.12,
      plaqueWidth - plaqueHeight * 0.24,
      plaqueHeight - plaqueHeight * 0.24,
      plaqueHeight * 0.25
    );
    ctx.strokeStyle = 'rgba(255,234,164,0.68)';
    ctx.lineWidth = Math.max(0.7, 0.95 * zoom);
    ctx.stroke();

    var crownY = y - plaqueHeight * 0.39;
    ctx.beginPath();
    ctx.moveTo(0, crownY - plaqueHeight * 0.57);
    ctx.lineTo(plaqueHeight * 0.31, crownY);
    ctx.lineTo(0, crownY + plaqueHeight * 0.22);
    ctx.lineTo(-plaqueHeight * 0.31, crownY);
    ctx.closePath();
    ctx.fillStyle = goldGradient(ctx, -plaqueHeight, crownY, plaqueHeight, crownY);
    ctx.fill();
    ctx.strokeStyle = '#491a03';
    ctx.lineWidth = Math.max(0.9, 1.3 * zoom);
    ctx.stroke();
    drawGem(ctx, 0, crownY - plaqueHeight * 0.08, plaqueHeight * 0.13, zoom);

    ctx.font = '900 ' + Math.max(20, plaqueHeight * 0.62) + 'px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff0b8';
    ctx.strokeStyle = '#1b0802';
    ctx.lineWidth = Math.max(1.2, 1.8 * zoom);
    ctx.strokeText(label, 0, zoom);
    ctx.fillText(label, 0, zoom);
    ctx.restore();
  }

  function draw(source) {
    raf = 0;
    var canvas = findWheel();
    if (!isWheelCanvas(canvas)) return false;

    var rect = canvas.getBoundingClientRect();
    var cssSize = Number(canvas.dataset.gannzillaEmptyOuterRingExpandedCssSizeV518)
      || Number(canvas.dataset.gannzillaCanvasCssSize)
      || Number.parseFloat(canvas.style.width)
      || rect.width;
    var dpr = Math.max(
      1,
      Number(canvas.dataset.gannzillaNativeDpr)
        || (cssSize > 0 ? canvas.width / cssSize : 0)
        || Number(window.devicePixelRatio)
        || 1
    );
    var zoom = Math.max(0.5, Number(canvas.dataset.gannzillaAppliedZoom) || 1);

    if (!(cssSize > 300) || canvas.width < 1 || canvas.height < 1) return false;

    var cx = cssSize / 2;
    var cy = cssSize / 2;
    var half = cssSize / 2;
    var reservedMargin = Math.min(half * 0.205, Math.max(108, 128 * zoom));
    var inner = half - reservedMargin + Math.max(2, 2.5 * zoom);
    var outer = half - Math.max(3.5, 4.5 * zoom);
    var frameWidth = outer - inner;
    if (!(frameWidth > Math.max(54, 60 * zoom))) return false;

    var ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return false;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.setLineDash([]);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    fillAnnulus(ctx, cx, cy, inner - Math.max(1, zoom), half, '#fbf4e7');

    var body = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
    body.addColorStop(0, '#4d1d04');
    body.addColorStop(0.055, '#d47d1b');
    body.addColorStop(0.11, '#ffe49d');
    body.addColorStop(0.17, '#8b430d');
    body.addColorStop(0.24, '#15100d');
    body.addColorStop(0.36, '#030405');
    body.addColorStop(0.66, '#07080a');
    body.addColorStop(0.77, '#24140b');
    body.addColorStop(0.85, '#8d450e');
    body.addColorStop(0.92, '#ffd77c');
    body.addColorStop(0.97, '#a85a15');
    body.addColorStop(1, '#321003');
    fillAnnulus(ctx, cx, cy, inner, outer, body);

    [
      [0.018, '#240700', 3.8],
      [0.065, '#d98a24', 5.4],
      [0.105, '#ffe49d', 1.8],
      [0.18, '#6d2a06', 2.6],
      [0.26, '#d27b1a', 4.0],
      [0.32, '#fff0ae', 1.2],
      [0.67, '#5a2104', 2.6],
      [0.75, '#d77e1c', 4.0],
      [0.82, '#ffe49e', 1.3],
      [0.91, '#df9027', 5.6],
      [0.975, '#220600', 3.8]
    ].forEach(function (rail) {
      strokeCircle(ctx, cx, cy, inner + frameWidth * rail[0], rail[1], Math.max(0.9, rail[2] * zoom));
    });

    var ornamentRadius = inner + frameWidth * 0.53;
    [30, 60, 120, 150, 210, 240, 300, 330].forEach(function (angle) {
      drawDiamond(ctx, cx, cy, ornamentRadius, angle, zoom, false);
    });
    [45, 135, 225, 315].forEach(function (angle) {
      drawDiamond(ctx, cx, cy, ornamentRadius, angle, zoom, true);
    });
    [[0, '360°'], [90, '90°'], [180, '180°'], [270, '270°']].forEach(function (item) {
      drawCardinal(ctx, cx, cy, ornamentRadius, item[0], item[1], frameWidth, zoom);
    });

    ctx.restore();

    canvas.dataset.gannzillaLargeNativeOrnateFrameV725 = 'true';
    canvas.dataset.gannzillaLargeNativeOrnateFrameBuild = String(BUILD);
    canvas.dataset.gannzillaLargeNativeOrnateFrameScaleIncrease = '1.45';
    canvas.dataset.gannzillaLargeNativeOrnateFrameGeometryChanged = 'false';

    applyCount += 1;
    lastApply = {
      source: source || 'draw',
      build: BUILD,
      cssSize: cssSize,
      dpr: dpr,
      zoom: zoom,
      innerRadius: inner,
      outerRadius: outer,
      frameWidth: frameWidth,
      scaleIncrease: 1.45,
      geometryChanged: false,
      at: Date.now()
    };

    window.dispatchEvent(new CustomEvent('gannzilla:large-native-ornate-frame-v725', {
      detail: lastApply
    }));
    return true;
  }

  function schedule(source, delay) {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(function () { draw(source || 'schedule'); });
    }, Math.max(0, Number(delay) || 0));
  }

  [
    'resize',
    'scroll',
    'wheel',
    'gannzilla:final-wheel-authority-v506',
    'gannzilla:wheel-ivory-champagne-final-authority-v682',
    'gannzilla:outer-empty-ring-mirror-silver-v668',
    'gannzilla:empty-outer-ring-v518',
    'gannzilla:native-dpr-zoom-v504',
    'gannzilla:wheel-input-v459'
  ].forEach(function (eventName) {
    window.addEventListener(eventName, function () { schedule(eventName, 30); }, true);
  });

  [0, 180, 480, 900, 1600, 2800, 4600, 7200].forEach(function (delay) {
    window.setTimeout(function () { schedule('boot-' + delay, 0); }, delay);
  });

  window.setInterval(function () { draw('persistent-watch'); }, 220);

  window.GANNZILLA_LARGE_NATIVE_ORNATE_FRAME_V725 = true;
  window.__auditGannzillaLargeNativeOrnateFrameV725 = function () {
    var canvas = findWheel();
    return {
      ok: canvas instanceof HTMLCanvasElement
        && canvas.dataset.gannzillaLargeNativeOrnateFrameV725 === 'true'
        && applyCount > 0,
      build: BUILD,
      wheelFound: canvas instanceof HTMLCanvasElement,
      nativeCanvasIntegration: true,
      frameScaleIncrease: 1.45,
      applyCount: applyCount,
      lastApply: lastApply
    };
  };

  window[STATE_KEY] = {
    draw: draw,
    schedule: schedule
  };

  schedule('install', 0);
}());
