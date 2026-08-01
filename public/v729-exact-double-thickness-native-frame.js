(function () {
  'use strict';

  var BUILD = 729;
  var STATE_KEY = '__gannzillaExactDoubleThicknessNativeFrameLoaderV729';
  var SOURCE_URL = '/v725-large-native-ornate-frame.js?v=729-exact-double-thickness-source';
  var FRAME_THICKNESS_MULTIPLIER = 2.0;
  var CARDINAL_PLAQUE_MULTIPLIER = 2.15;
  var FILIGREE_MULTIPLIER = 2.70;

  if (window[STATE_KEY]) return;

  window[STATE_KEY] = {
    build: BUILD,
    sourceUrl: SOURCE_URL,
    status: 'loading',
    installed: false,
    error: null,
    frameThicknessMultiplier: FRAME_THICKNESS_MULTIPLIER,
    cardinalPlaqueMultiplier: CARDINAL_PLAQUE_MULTIPLIER,
    filigreeMultiplier: FILIGREE_MULTIPLIER,
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
        '    var frameWidth = Math.min(outer - Math.max(34, 38 * zoom), baseFrameWidth * 2.0);',
        '    var inner = outer - frameWidth;',
        '    if (!(frameWidth > Math.max(108, 118 * zoom))) return false;'
      ].join('\n');

      var plaqueBefore = [
        '    var plaqueWidth = Math.max(68, frameWidth * 0.98);',
        '    var plaqueHeight = Math.max(30, frameWidth * 0.40);',
        '    var span = Math.max(62, frameWidth * 0.98);',
        '    var height = Math.max(30, frameWidth * 0.47);'
      ].join('\n');

      var plaqueAfter = [
        '    var plaqueWidth = Math.max(92, Math.min(205 * zoom, frameWidth * 1.60));',
        '    var plaqueHeight = Math.max(40, Math.min(74 * zoom, frameWidth * 0.50));',
        '    var span = Math.max(108, Math.min(250 * zoom, frameWidth * 2.00));',
        '    var height = Math.max(52, Math.min(112 * zoom, frameWidth * 0.82));'
      ].join('\n');

      if (source.indexOf(geometryBefore) < 0) {
        throw new Error('V725_GEOMETRY_ANCHOR_NOT_FOUND');
      }
      if (source.indexOf(plaqueBefore) < 0) {
        throw new Error('V725_PLAQUE_ANCHOR_NOT_FOUND');
      }

      source = source
        .replace('var BUILD = 725;', 'var BUILD = 729;')
        .replace('__gannzillaLargeNativeOrnateFrameV725', '__gannzillaExactDoubleThicknessNativeOrnateFrameV729')
        .replace(geometryBefore, geometryAfter)
        .replace(plaqueBefore, plaqueAfter)
        .replace("    var size = Math.max(10, (large ? 20 : 14) * zoom);", "    var size = Math.max(14, (large ? 30 : 21) * zoom);")
        .replace("    ctx.font = '900 ' + Math.max(20, plaqueHeight * 0.62) + 'px Arial, sans-serif';", "    ctx.font = '900 ' + Math.max(22, plaqueHeight * 0.56) + 'px Arial, sans-serif';")
        .replace('    var ornamentRadius = inner + frameWidth * 0.53;', '    var ornamentRadius = inner + frameWidth * 0.60;')
        .replace(/gannzillaLargeNativeOrnateFrameV725/g, 'gannzillaExactDoubleThicknessNativeOrnateFrameV729')
        .replace(/gannzillaLargeNativeOrnateFrameBuild/g, 'gannzillaExactDoubleThicknessNativeOrnateFrameBuild')
        .replace(/gannzillaLargeNativeOrnateFrameScaleIncrease/g, 'gannzillaExactDoubleThicknessNativeOrnateFrameThicknessMultiplier')
        .replace(/gannzillaLargeNativeOrnateFrameGeometryChanged/g, 'gannzillaExactDoubleThicknessNativeOrnateFrameGeometryChanged')
        .replace(/'1\.45'/g, "'2.0'")
        .replace(/scaleIncrease: 1\.45/g, 'frameThicknessMultiplier: 2.0')
        .replace(/gannzilla:large-native-ornate-frame-v725/g, 'gannzilla:exact-double-thickness-native-frame-v729')
        .replace(/GANNZILLA_LARGE_NATIVE_ORNATE_FRAME_V725/g, 'GANNZILLA_EXACT_DOUBLE_THICKNESS_NATIVE_FRAME_V729')
        .replace(/__auditGannzillaLargeNativeOrnateFrameV725/g, '__auditGannzillaExactDoubleThicknessNativeFrameV729')
        .replace(/frameScaleIncrease: 1\.45/g, 'frameThicknessMultiplier: 2.0');

      source += '\n//# sourceURL=/v729-exact-double-thickness-native-frame.generated.js';

      var script = document.createElement('script');
      script.id = 'gannzilla-exact-double-thickness-native-frame-generated-v729';
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
      console.error('[Gannzilla V729]', error);
    });

  window.__auditGannzillaExactDoubleThicknessNativeFrameLoaderV729 = function () {
    var state = window[STATE_KEY] || {};
    var runtimeAudit = typeof window.__auditGannzillaExactDoubleThicknessNativeFrameV729 === 'function'
      ? window.__auditGannzillaExactDoubleThicknessNativeFrameV729()
      : null;
    return {
      ok: state.installed === true && Boolean(runtimeAudit && runtimeAudit.ok),
      build: BUILD,
      status: state.status,
      installed: state.installed,
      error: state.error,
      sourceUrl: SOURCE_URL,
      frameThicknessMultiplier: FRAME_THICKNESS_MULTIPLIER,
      cardinalPlaqueMultiplier: CARDINAL_PLAQUE_MULTIPLIER,
      filigreeMultiplier: FILIGREE_MULTIPLIER,
      runtime: runtimeAudit
    };
  };
}());