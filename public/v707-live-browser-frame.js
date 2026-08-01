(function () {
  'use strict';

  if (window.__gannzillaLiveBrowserFrameV707) {
    window.__gannzillaLiveBrowserFrameV707.schedule('manual-repeat');
    return;
  }

  var BUILD = 707;
  var TAU = Math.PI * 2;
  var overlay = null;
  var wheel = null;
  var raf = 0;
  var timer = 0;
  var applyCount = 0;
  var lastApply = null;

  function isWheelCanvas(canvas) {
    if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
    var id = String(canvas.id || '').toLowerCase();
    if (id.indexOf('overlay') >= 0 || id.indexOf('preview') >= 0 || id.indexOf('tracker') >= 0) return false;
    var rect = canvas.getBoundingClientRect();
    return canvas.width > 300 && canvas.height > 300 && rect.width > 300 && rect.height > 300;
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
      .sort(function (a, b) {
        var ar = a.getBoundingClientRect();
        var br = b.getBoundingClientRect();
        return br.width * br.height - ar.width * ar.height;
      })[0] || null;
  }

  function polar(cx, cy, radius, degree) {
    var angle = (degree - 90) * Math.PI / 180;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius
    };
  }

  function annulus(ctx, cx, cy, inner, outer, fill) {
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, TAU);
    ctx.arc(cx, cy, inner, TAU, 0, true);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function circle(ctx, cx, cy, radius, stroke, width) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function jewel(ctx, cx, cy, radius, degree, zoom, large) {
    var point = polar(cx, cy, radius, degree);
    var size = (large ? 25 : 15) * zoom;
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(degree * Math.PI / 180 + Math.PI / 4);

    var gold = ctx.createLinearGradient(-size, -size, size, size);
    gold.addColorStop(0, '#fff4b0');
    gold.addColorStop(0.42, '#d98a25');
    gold.addColorStop(1, '#572004');
    ctx.fillStyle = '#090a0d';
    ctx.strokeStyle = gold;
    ctx.lineWidth = 3 * zoom;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.strokeRect(-size / 2, -size / 2, size, size);

    var blue = ctx.createLinearGradient(-size * 0.2, -size * 0.2, size * 0.2, size * 0.2);
    blue.addColorStop(0, '#f5fdff');
    blue.addColorStop(0.38, '#67cfff');
    blue.addColorStop(1, '#073c79');
    ctx.fillStyle = blue;
    ctx.fillRect(-size * 0.27, -size * 0.27, size * 0.54, size * 0.54);
    ctx.restore();
  }

  function filigree(ctx, cx, cy, radius, degree, span, zoom) {
    var point = polar(cx, cy, radius, degree);
    var rad = degree * Math.PI / 180;
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(rad);

    var gold = ctx.createLinearGradient(-span, 0, span, 0);
    gold.addColorStop(0, '#642304');
    gold.addColorStop(0.28, '#e7a038');
    gold.addColorStop(0.5, '#fff1a8');
    gold.addColorStop(0.72, '#d27b1d');
    gold.addColorStop(1, '#562004');

    [-1, 1].forEach(function (side) {
      ctx.save();
      ctx.scale(side, 1);
      ctx.strokeStyle = gold;
      ctx.lineWidth = 4 * zoom;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(span * 0.22, -span * 0.30, span * 0.50, -span * 0.36, span * 0.76, -span * 0.08);
      ctx.bezierCurveTo(span * 0.50, -span * 0.02, span * 0.36, span * 0.22, span * 0.08, span * 0.18);
      ctx.stroke();

      ctx.lineWidth = 2 * zoom;
      ctx.strokeStyle = '#ffe29a';
      ctx.beginPath();
      ctx.moveTo(span * 0.15, -span * 0.04);
      ctx.bezierCurveTo(span * 0.34, -span * 0.23, span * 0.54, -span * 0.21, span * 0.65, -span * 0.06);
      ctx.stroke();
      ctx.restore();
    });

    ctx.restore();
  }

  function plaque(ctx, cx, cy, radius, degree, label, frameWidth, zoom) {
    var point = polar(cx, cy, radius, degree);
    var rad = degree * Math.PI / 180;
    var width = frameWidth * 1.42;
    var height = frameWidth * 0.52;

    filigree(ctx, cx, cy, radius, degree, frameWidth * 0.92, zoom);

    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(rad);
    ctx.rotate(-rad);

    var x = -width / 2;
    var y = -height / 2;
    roundedRect(ctx, x, y, width, height, height * 0.34);

    var background = ctx.createLinearGradient(0, y, 0, y + height);
    background.addColorStop(0, '#3b291a');
    background.addColorStop(0.46, '#050608');
    background.addColorStop(1, '#23140b');
    ctx.fillStyle = background;
    ctx.fill();

    var gold = ctx.createLinearGradient(x, 0, x + width, 0);
    gold.addColorStop(0, '#6a2704');
    gold.addColorStop(0.25, '#e6a13a');
    gold.addColorStop(0.5, '#fff1aa');
    gold.addColorStop(0.75, '#d07a1d');
    gold.addColorStop(1, '#562004');
    ctx.strokeStyle = gold;
    ctx.lineWidth = 4 * zoom;
    ctx.stroke();

    ctx.font = '900 ' + Math.max(19, height * 0.58) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#190802';
    ctx.lineWidth = 3 * zoom;
    ctx.fillStyle = '#fff1ba';
    ctx.strokeText(label, 0, zoom);
    ctx.fillText(label, 0, zoom);

    ctx.beginPath();
    ctx.arc(0, y - height * 0.46, height * 0.15, 0, TAU);
    var gem = ctx.createRadialGradient(-height * 0.04, y - height * 0.50, 0, 0, y - height * 0.46, height * 0.17);
    gem.addColorStop(0, '#f5fdff');
    gem.addColorStop(0.4, '#67ccff');
    gem.addColorStop(1, '#07376d');
    ctx.fillStyle = gem;
    ctx.fill();
    ctx.strokeStyle = '#ffe49c';
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
    ctx.restore();
  }

  function createOverlay() {
    if (overlay && overlay.isConnected) return overlay;
    ['gannzilla-comfort-ornate-frame-v704', 'gannzilla-exact-reference-ornate-frame-v705', 'gannzilla-live-browser-frame-v707'].forEach(function (id) {
      var old = document.getElementById(id);
      if (old) old.remove();
    });

    overlay = document.createElement('canvas');
    overlay.id = 'gannzilla-live-browser-frame-v707';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.setProperty('position', 'fixed', 'important');
    overlay.style.setProperty('pointer-events', 'none', 'important');
    overlay.style.setProperty('user-select', 'none', 'important');
    overlay.style.setProperty('z-index', '2147482000', 'important');
    overlay.style.setProperty('max-width', 'none', 'important');
    overlay.style.setProperty('max-height', 'none', 'important');
    overlay.style.setProperty('filter', 'drop-shadow(0 5px 10px rgba(35,14,2,.28))', 'important');
    document.body.appendChild(overlay);
    return overlay;
  }

  function draw(source) {
    wheel = findWheel();
    if (!(wheel instanceof HTMLCanvasElement)) return false;

    var rect = wheel.getBoundingClientRect();
    if (!(rect.width > 300) || !(rect.height > 300)) return false;

    var scale = 1.18;
    try {
      var requested = Number(window.localStorage.getItem('gannzilla:v707:frame-scale'));
      if (Number.isFinite(requested)) scale = Math.max(1.08, Math.min(1.32, requested));
    } catch (_) {}

    var size = Math.min(rect.width, rect.height) * scale;
    var canvas = createOverlay();
    var dpr = Math.max(1, window.devicePixelRatio || 1);
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;

    canvas.style.left = (centerX - size / 2) + 'px';
    canvas.style.top = (centerY - size / 2) + 'px';
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    var pixelWidth = Math.round(size * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelWidth) {
      canvas.width = pixelWidth;
      canvas.height = pixelWidth;
    }

    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    var cx = size / 2;
    var cy = size / 2;
    var outer = size / 2 - 3;
    var inner = size * 0.407;
    var frameWidth = outer - inner;
    var zoom = size / 1254;

    var metal = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
    metal.addColorStop(0, '#6d2906');
    metal.addColorStop(0.07, '#ffd984');
    metal.addColorStop(0.15, '#813708');
    metal.addColorStop(0.24, '#111215');
    metal.addColorStop(0.71, '#050609');
    metal.addColorStop(0.83, '#763108');
    metal.addColorStop(0.94, '#ffd77f');
    metal.addColorStop(1, '#471703');
    annulus(ctx, cx, cy, inner, outer, metal);

    circle(ctx, cx, cy, inner, '#2b0e02', 4 * zoom);
    circle(ctx, cx, cy, inner + frameWidth * 0.07, '#f0aa39', 6 * zoom);
    circle(ctx, cx, cy, inner + frameWidth * 0.16, 'rgba(255,238,177,.9)', 2 * zoom);
    circle(ctx, cx, cy, outer - frameWidth * 0.16, '#6e2d07', 2 * zoom);
    circle(ctx, cx, cy, outer - frameWidth * 0.08, '#f0a93a', 6 * zoom);
    circle(ctx, cx, cy, outer, '#230902', 4 * zoom);

    [30, 60, 120, 150, 210, 240, 300, 330].forEach(function (degree) {
      jewel(ctx, cx, cy, inner + frameWidth * 0.52, degree, zoom, false);
    });
    [45, 135, 225, 315].forEach(function (degree) {
      jewel(ctx, cx, cy, inner + frameWidth * 0.57, degree, zoom, true);
    });

    [[0, '360°'], [90, '90°'], [180, '180°'], [270, '270°']].forEach(function (entry) {
      plaque(ctx, cx, cy, inner + frameWidth * 0.56, entry[0], entry[1], frameWidth, zoom);
    });

    applyCount += 1;
    lastApply = {
      source: source || 'draw',
      build: BUILD,
      wheelWidth: rect.width,
      wheelHeight: rect.height,
      overlaySize: size,
      scale: scale,
      applyCount: applyCount,
      at: Date.now()
    };
    return true;
  }

  function schedule(source) {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(function () { draw(source || 'schedule'); });
    }, 20);
  }

  ['resize', 'scroll', 'wheel', 'pointermove', 'pointerup', 'gannzilla:wheel-ivory-champagne-final-authority-v682', 'gannzilla:outer-empty-ring-mirror-silver-v668', 'gannzilla:empty-outer-ring-v518', 'gannzilla:native-dpr-zoom-v504', 'gannzilla:wheel-input-v459', 'gannzilla:page-scrollbar-pan-v305'].forEach(function (eventName) {
    window.addEventListener(eventName, function () { schedule(eventName); }, true);
  });

  [0, 80, 180, 360, 700, 1300, 2400, 4200].forEach(function (delay) {
    window.setTimeout(function () { schedule('boot-' + delay); }, delay);
  });
  window.setInterval(function () { schedule('watch'); }, 500);

  window.__auditGannzillaLiveBrowserFrameV707 = function () {
    return {
      ok: Boolean(overlay && overlay.isConnected && wheel instanceof HTMLCanvasElement && applyCount > 0),
      build: BUILD,
      applyCount: applyCount,
      lastApply: lastApply
    };
  };

  window.__gannzillaLiveBrowserFrameV707 = {
    schedule: schedule,
    draw: draw,
    setScale: function (value) {
      var scale = Math.max(1.08, Math.min(1.32, Number(value) || 1.18));
      try { window.localStorage.setItem('gannzilla:v707:frame-scale', String(scale)); } catch (_) {}
      schedule('set-scale');
      return scale;
    },
    remove: function () {
      if (overlay) overlay.remove();
      overlay = null;
    }
  };
}());
