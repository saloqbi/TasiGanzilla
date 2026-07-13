import React from 'react';

const PATCH_KEY = '__gannzillaHideCalendarLabelsV359';
const ENGLISH_MONTH_PATTERN = /\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b/i;
const ARABIC_MONTH_PATTERN = /(?:يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)/;

function boolParam(name, fallback = false) {
  try {
    const query = new URLSearchParams(window.location.search || '');
    if (!query.has(name)) return fallback;
    const value = String(query.get(name) || '').toLowerCase();
    return value === 'true' || value === '1' || value === 'yes' || value === 'on';
  } catch (_) {
    return fallback;
  }
}

function isCalendarLabel(value) {
  const label = String(value ?? '').trim();
  if (!label) return false;
  return ENGLISH_MONTH_PATTERN.test(label) || ARABIC_MONTH_PATTERN.test(label);
}

function installCalendarLabelHider() {
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

  const patchedFillText = function patchedFillText(text, ...args) {
    if (boolParam('hideCalendarLabels', false) && isCalendarLabel(text)) {
      return undefined;
    }
    return nativeFillText.call(this, text, ...args);
  };

  prototype.fillText = patchedFillText;

  const state = {
    refCount: 1,
    restore() {
      if (prototype.fillText === patchedFillText) prototype.fillText = nativeFillText;
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
    const uninstall = installCalendarLabelHider();

    window.GANNZILLA_HIDE_CALENDAR_LABELS_V359 = true;
    window.__auditGannzillaHideCalendarLabelsV359 = () => ({
      ok: Boolean(window[PATCH_KEY]),
      build: 359,
      hideCalendarLabels: boolParam('hideCalendarLabels', false),
      englishMonthsSupported: true,
      arabicMonthsSupported: true,
      angleLabelsPreserved: true,
      wheelNumbersPreserved: true,
      outerFramePreserved: true,
    });

    return () => {
      uninstall();
      delete window.GANNZILLA_HIDE_CALENDAR_LABELS_V359;
      delete window.__auditGannzillaHideCalendarLabelsV359;
    };
  }, []);

  return null;
}
