(function () {
  'use strict';

  var BUILD = 726;
  var STATE_KEY = '__gannzillaDoubleThickNativeFrameLoaderV726';
  var SOURCE_URL = '/v725-large-native-ornate-frame.js?v=726-double-thick-source';

  if (window[STATE_KEY]) return;

  window[STATE_KEY] = {
    build: BUILD,
    sourceUrl: SOURCE_URL,
    status: 'loading',
    installed: false,
    error: null,
    at: Date.now()
  };

  fetch(SOURCE_URL, { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('V725_SOURCE_FETCH_FAILED_' + response.status);
      return response.text();
    })
    .then(function (source) {
      var geometryBefore = [
        '    var reservedMargin = Math.min(half * 0.205, Math.max(108, 128 * zoom));',
        '    var inner = half - reservedMargin + Math.max(2, 2.5 * zoom);',
        '    var outer = half - Math.max(3.5, 4.5 * zoom);',
        '    var frameWidth = outer - inner;',
        '    if (!(frameWidth > Math.max(54, 60 * zoom))) return false;'
      ].join('\n');

      var geometryAfter = [
        '    var baseReservedMargin = Math.min(half * 0.205, Math.max(108, 128 * zoom));',
        '    var baseInner = half - baseReservedMargin + Math.max(2, 2.5 * zoom);',
        '    var outer = half - Math.max(3.5, 4.5 * zoom);',
        '    var baseFrameWidth = outer - baseInner;',
        '    var frameWidth = Math.min(outer - Math.max(20, 24 * zoom), baseFrameWidth * 2);',
        '    var inner = outer - frameWidth;',
        '    if (!(frameWidth > Math.max(108, 120 * zoom))) return false;'
      ].join('\n');

      if (source.indexOf(geometryBefore) < 0) {
        throw new Error('V725_GEOMETRY_ANCHOR_NOT_FOUND');
      }

      source = source
        .replace("var BUILD = 725;", "var BUILD = 726;")
        .replace("__gannzillaLargeNativeOrnateFrameV725", "__gannzillaDoubleThickNativeOrnateFrameV726")
        .replace(geometryBefore, geometryAfter)
        .replace(/gannzillaLargeNativeOrnateFrameV725/g, 'gannzillaDoubleThickNativeOrnateFrameV726')
        .replace(/gannzillaLargeNativeOrnateFrameBuild/g, 'gannzillaDoubleThickNativeOrnateFrameBuild')
        .replace(/gannzillaLargeNativeOrnateFrameScaleIncrease/g, 'gannzillaDoubleThickNativeOrnateFrameThicknessMultiplier')
        .replace(/gannzillaLargeNativeOrnateFrameGeometryChanged/g, 'gannzillaDoubleThickNativeOrnateFrameGeometryChanged')
        .replace(/'1\.45'/g, "'2.00'")
        .replace(/scaleIncrease: 1\.45/g, 'thicknessMultiplier: 2.0')
        .replace(/gannzilla:large-native-ornate-frame-v725/g, 'gannzilla:double-thick-native-ornate-frame-v726')
        .replace(/GANNZILLA_LARGE_NATIVE_ORNATE_FRAME_V725/g, 'GANNZILLA_DOUBLE_THICK_NATIVE_ORNATE_FRAME_V726')
        .replace(/__auditGannzillaLargeNativeOrnateFrameV725/g, '__auditGannzillaDoubleThickNativeOrnateFrameV726')
        .replace(/frameScaleIncrease: 1\.45/g, 'frameThicknessMultiplier: 2.0');

      source += '\n//# sourceURL=/v726-double-thick-native-frame.generated.js';

      var script = document.createElement('script');
      script.id = 'gannzilla-double-thick-native-frame-generated-v726';
      script.text = source;
      (document.head || document.documentElement).appendChild(script);
      script.remove();

      window[STATE_KEY].status = 'installed';
      window[STATE_KEY].installed = true;
      window[STATE_KEY].at = Date.now();
    })
    .catch(function (error) {
      window[STATE_KEY].status = 'failed';
      window[STATE_KEY].error = String(error && error.message ? error.message : error);
      window[STATE_KEY].at = Date.now();
      console.error('[Gannzilla V726]', error);
    });

  window.__auditGannzillaDoubleThickNativeFrameLoaderV726 = function () {
    var state = window[STATE_KEY] || {};
    var runtimeAudit = typeof window.__auditGannzillaDoubleThickNativeOrnateFrameV726 === 'function'
      ? window.__auditGannzillaDoubleThickNativeOrnateFrameV726()
      : null;
    return {
      ok: state.installed === true && Boolean(runtimeAudit && runtimeAudit.ok),
      build: BUILD,
      status: state.status,
      installed: state.installed,
      error: state.error,
      sourceUrl: SOURCE_URL,
      thicknessMultiplier: 2.0,
      runtime: runtimeAudit
    };
  };
}());
