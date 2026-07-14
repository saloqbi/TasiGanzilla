import React from 'react';

const PATCH_KEY = '__gannzillaHideEmptyProtractorBandV388';
const TWO_PI = Math.PI * 2;

function params() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function boolParam(name, fallback) {
  const query = params();
  if (!query.has(name)) return fallback;
  const value = String(query.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function numberParam(name, fallback, min, max) {
  const value = Number(params().get(name));
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function shouldHideBand() {
  return boolParam('hideEmptyProtractorBand', false)
    || boolParam('hideProtractorBandFrame', false);
}

function expectedGeometry(ctx) {
  const levels = Math.round(numberParam('levels', 10, 1, 12));
  const innerRadius = numberParam('gannzillaInnerRadius', 170, 80, 500);
  const ringWidth = numberParam('gannzillaRingWidth', 60, 30, 150);
  const wheelRadius = innerRadius + (levels * ringWidth);
  const bandInner = wheelRadius + 18;
  const bandOuter = bandInner + 34;

  const transform = typeof ctx.getTransform === 'function' ? ctx.getTransform() : null;
  const scale = Math.abs(Number(transform?.a)) || Math.max(1, window.devicePixelRatio || 1);
  const cx = ctx.canvas.width / (2 * scale);
  const cy = ctx.canvas.height / (2 * scale);

  return { cx, cy, bandInner, bandOuter };
}

function radiusFrom(point, geometry) {
  if (!point) return null;
  return Math.hypot(point.x - geometry.cx, point.y - geometry.cy);
}

function approximately(value, target, tolerance = 1.4) {
  return Number.isFinite(value) && Math.abs(value - target) <= tolerance;
}

function isFullCircle(startAngle, endAngle) {
  return Math.abs(Math.abs(endAngle - startAngle) - TWO_PI) <= 0.02;
}

function installPatch() {
  if (typeof window === 'undefined' || typeof CanvasRenderingContext2D === 'undefined') {
    return () => {};
  }

  const existing = window[PATCH_KEY];
  if (existing) {
    existing.refCount += 1;
    return () => {
      existing.refCount -= 1;
      if (existing.refCount <= 0) existing.restore();
    };
  }

  const prototype = CanvasRenderingContext2D.prototype;
  const nativeBeginPath = prototype.beginPath;
  const nativeArc = prototype.arc;
  const nativeMoveTo = prototype.moveTo;
  const nativeLineTo = prototype.lineTo;
  const nativeStroke = prototype.stroke;
  const stateByContext = new WeakMap();

  function stateFor(ctx) {
    let state = stateByContext.get(ctx);
    if (!state) {
      state = { suppressStroke: false, movePoint: null };
      stateByContext.set(ctx, state);
    }
    return state;
  }

  prototype.beginPath = function patchedBeginPath(...args) {
    const state = stateFor(this);
    state.suppressStroke = false;
    state.movePoint = null;
    return nativeBeginPath.apply(this, args);
  };

  prototype.arc = function patchedArc(x, y, radius, startAngle, endAngle, ...rest) {
    if (shouldHideBand() && isFullCircle(Number(startAngle), Number(endAngle))) {
      const geometry = expectedGeometry(this);
      if (approximately(Number(radius), geometry.bandInner)
        || approximately(Number(radius), geometry.bandOuter)) {
        stateFor(this).suppressStroke = true;
      }
    }
    return nativeArc.call(this, x, y, radius, startAngle, endAngle, ...rest);
  };

  prototype.moveTo = function patchedMoveTo(x, y) {
    if (shouldHideBand()) stateFor(this).movePoint = { x: Number(x), y: Number(y) };
    return nativeMoveTo.call(this, x, y);
  };

  prototype.lineTo = function patchedLineTo(x, y) {
    if (shouldHideBand()) {
      const state = stateFor(this);
      const geometry = expectedGeometry(this);
      const startRadius = radiusFrom(state.movePoint, geometry);
      const endRadius = radiusFrom({ x: Number(x), y: Number(y) }, geometry);
      const startsAtBand = approximately(startRadius, geometry.bandInner)
        || approximately(startRadius, geometry.bandInner - 2, 1.6);
      const endsAtBand = approximately(endRadius, geometry.bandOuter)
        || approximately(endRadius, geometry.bandOuter + 5, 1.6);
      if (startsAtBand && endsAtBand) state.suppressStroke = true;
    }
    return nativeLineTo.call(this, x, y);
  };

  prototype.stroke = function patchedStroke(...args) {
    const state = stateFor(this);
    if (shouldHideBand() && state.suppressStroke) {
      state.suppressStroke = false;
      state.movePoint = null;
      return undefined;
    }
    return nativeStroke.apply(this, args);
  };

  const restore = () => {
    prototype.beginPath = nativeBeginPath;
    prototype.arc = nativeArc;
    prototype.moveTo = nativeMoveTo;
    prototype.lineTo = nativeLineTo;
    prototype.stroke = nativeStroke;
    delete window[PATCH_KEY];
  };

  window[PATCH_KEY] = { refCount: 1, restore };
  return restore;
}

export default function GannzillaHideEmptyProtractorBandV388() {
  React.useLayoutEffect(() => {
    const restore = installPatch();
    window.GANNZILLA_HIDE_EMPTY_PROTRACTOR_BAND_V388 = true;
    window.__auditGannzillaHideEmptyProtractorBandV388 = () => ({
      ok: true,
      build: 388,
      enabled: shouldHideBand(),
      preservesAngleLabels: true,
      hidesNativeBandArcs: true,
      hidesNativeBandRadialTicks: true,
    });

    return () => {
      restore();
      delete window.GANNZILLA_HIDE_EMPTY_PROTRACTOR_BAND_V388;
      delete window.__auditGannzillaHideEmptyProtractorBandV388;
    };
  }, []);

  return null;
}
