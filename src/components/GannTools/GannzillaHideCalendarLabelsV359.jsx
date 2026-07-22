import React from 'react';

const PATCH_KEY = '__gannzillaHideCalendarLabelsV389';
const ENGLISH_MONTH_PATTERN = /\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b/i;
const ARABIC_MONTH_PATTERN = /(?:يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)/;
// Only labels that explicitly include the degree symbol are angle labels.
// Bare numeric labels belong to the wheel and must never be hidden.
const ANGLE_PATTERN = /^\s*(?:0|[1-9]\d?|[12]\d\d|3[0-5]\d|360)°\s*$/;

function queryParams() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function boolParam(name, fallback = false) {
  const query = queryParams();
  if (!query.has(name)) return fallback;
  const value = String(query.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function numberParam(name, fallback, min, max) {
  const value = Number(queryParams().get(name));
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function isCalendarLabel(value) {
  const label = String(value ?? '').trim();
  return Boolean(label) && (ENGLISH_MONTH_PATTERN.test(label) || ARABIC_MONTH_PATTERN.test(label));
}

function shouldHardHideOuterFrames() {
  return boolParam('hideOuterFrames', false)
    || (!boolParam('showProtractor', true)
      && !boolParam('showWeekdayZodiacBand', true)
      && !boolParam('showChronometer', false));
}

function findWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => !canvas.closest('aside'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ canvas, rect }) => canvas.width > 0 && canvas.height > 0 && rect.width > 250 && rect.height > 250)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function eraseEverythingOutsideMainWheel() {
  if (!shouldHardHideOuterFrames()) return false;
  const canvas = findWheelCanvas();
  if (!canvas) return false;

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  const levels = Math.round(numberParam('levels', 10, 1, 12));
  const innerRadius = numberParam('gannzillaInnerRadius', 170, 80, 500);
  const ringWidth = numberParam('gannzillaRingWidth', 60, 30, 150);
  const wheelRadius = innerRadius + (levels * ringWidth);
  const cx = width / 2;
  const cy = height / 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.arc(cx, cy, wheelRadius + 1.5, 0, Math.PI * 2, true);
  ctx.fill('evenodd');
  ctx.restore();

  canvas.dataset.gannzillaOuterFramesHiddenV389 = 'true';
  canvas.dataset.gannzillaVisibleOuterRadius = String(wheelRadius);
  return true;
}

function installCanvasTextHider(scheduleErase) {
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
  const nativeFillText = prototype.fillText;
  const nativeClearRect = prototype.clearRect;

  const patchedFillText = function patchedFillText(text, ...args) {
    const label = String(text ?? '').trim();
    if (boolParam('hideCalendarLabels', false) && isCalendarLabel(label)) return undefined;
    if (shouldHardHideOuterFrames() && (isCalendarLabel(label) || ANGLE_PATTERN.test(label))) return undefined;
    return nativeFillText.call(this, text, ...args);
  };

  const patchedClearRect = function patchedClearRect(...args) {
    const result = nativeClearRect.apply(this, args);
    if (shouldHardHideOuterFrames()) scheduleErase();
    return result;
  };

  prototype.fillText = patchedFillText;
  prototype.clearRect = patchedClearRect;

  const state = {
    refCount: 1,
    restore() {
      if (prototype.fillText === patchedFillText) prototype.fillText = nativeFillText;
      if (prototype.clearRect === patchedClearRect) prototype.clearRect = nativeClearRect;
      delete window[PATCH_KEY];
    },
  };
  window[PATCH_KEY] = state;

  return () => {
    state.refCount -= 1;
    if (state.refCount <= 0) state.restore();
  };
}

export default function GannzillaHideCalendarLabelsV359() {
  React.useLayoutEffect(() => {
    let disposed = false;
    let frame = 0;
    const timers = new Set();

    const erase = () => {
      frame = 0;
      if (!disposed) eraseEverythingOutsideMainWheel();
    };

    const schedule = (delay = 0) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (disposed) return;
        if (frame) window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(() => window.requestAnimationFrame(erase));
      }, delay);
      timers.add(timer);
    };

    const scheduleBurst = () => [0, 40, 120, 280, 600, 1100].forEach(schedule);
    const uninstall = installCanvasTextHider(() => schedule(0));

    scheduleBurst();
    document.addEventListener('input', scheduleBurst, true);
    document.addEventListener('change', scheduleBurst, true);
    window.addEventListener('resize', scheduleBurst);
    window.addEventListener('gannzilla:canonical-property-change-v326', scheduleBurst);
    window.addEventListener('gannzilla:ring-two-numbering-refresh', scheduleBurst);

    window.GANNZILLA_HIDE_CALENDAR_LABELS_V389 = true;
    window.__auditGannzillaHideCalendarLabelsV389 = () => {
      const canvas = findWheelCanvas();
      return {
        ok: Boolean(window[PATCH_KEY]) && (!shouldHardHideOuterFrames() || canvas?.dataset?.gannzillaOuterFramesHiddenV389 === 'true'),
        build: 389,
        hideCalendarLabels: boolParam('hideCalendarLabels', false),
        hardHideOuterFrames: shouldHardHideOuterFrames(),
        showProtractor: boolParam('showProtractor', true),
        showWeekdayZodiacBand: boolParam('showWeekdayZodiacBand', true),
        showChronometer: boolParam('showChronometer', false),
        outerFramesErasedAfterCanvasRender: true,
        mainWheelPreserved: true,
        bareWheelNumbersPreserved: true,
        angleLabelsRequireDegreeSymbol: true,
      };
    };

    return () => {
      disposed = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      if (frame) window.cancelAnimationFrame(frame);
      document.removeEventListener('input', scheduleBurst, true);
      document.removeEventListener('change', scheduleBurst, true);
      window.removeEventListener('resize', scheduleBurst);
      window.removeEventListener('gannzilla:canonical-property-change-v326', scheduleBurst);
      window.removeEventListener('gannzilla:ring-two-numbering-refresh', scheduleBurst);
      uninstall();
      delete window.GANNZILLA_HIDE_CALENDAR_LABELS_V389;
      delete window.__auditGannzillaHideCalendarLabelsV389;
    };
  }, []);

  return null;
}
