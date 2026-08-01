(function () {
  'use strict';

  var BUILD = 727;
  var STATE_KEY = '__gannzillaBalancedThickNativeFrameLoaderV727';
  var SOURCE_URL = '/v725-large-native-ornate-frame.js?v=727-balanced-thick-source';
  var THICKNESS_MULTIPLIER = 1.72;

  if (window[STATE_KEY]) return;

  window[STATE_KEY] = {
    build: BUILD,
    sourceUrl: SOURCE_URL,
    status: 'loading',
    installed: false,
    error: null,
    thicknessMultiplier: THICKNESS_MULTIPLIER,
    angleLabelMode: 'balanced-cardinal-badges',
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
        '    var frameWidth = Math.min(outer - Math.max(34, 38 * zoom), baseFrameWidth * 1.72);',
        '    var inner = outer - frameWidth;',
        '    if (!(frameWidth > Math.max(92, 100 * zoom))) return false;'
      ].join('\n');

      var plaqueBefore = [
        '    var plaqueWidth = Math.max(68, frameWidth * 0.98);',
        '    var plaqueHeight = Math.max(30, frameWidth * 0.40);',
        '    var span = Math.max(62, frameWidth * 0.98);',
        '    var height = Math.max(30, frameWidth * 0.47);'
      ].join('\n');

      var plaqueAfter = [
        '    var plaqueWidth = Math.max(74, Math.min(132 * zoom, frameWidth * 0.76));',
        '    var plaqueHeight = Math.max(32, Math.min(48 * zoom, frameWidth * 0.29));',
        '    var span = Math.max(68, Math.min(150 * zoom, frameWidth * 0.86));',
        '    var height = Math.max(32, Math.min(66 * zoom, frameWidth * 0.38));'
      ].join('\n');

      if (source.indexOf(geometryBefore) < 0) {
        throw new Error('V725_GEOMETRY_ANCHOR_NOT_FOUND');
      }
      if (source.indexOf(plaqueBefore) < 0) {
        throw new Error('V725_PLAQUE_ANCHOR_NOT_FOUND');
      }

      source = source
        .replace('var BUILD = 725;', 'var BUILD = 727;')
        .replace('__gannzillaLargeNativeOrnateFrameV725', '__gannzillaBalancedThickNativeOrnateFrameV727')
        .replace(geometryBefore, geometryAfter)
        .replace(plaqueBefore, plaqueAfter)
        .replace("    ctx.font = '900 ' + Math.max(20, plaqueHeight * 0.62) + 'px Arial, sans-serif';", "    ctx.font = '900 ' + Math.max(18, plaqueHeight * 0.56) + 'px Arial, sans-serif';")
        .replace('    var ornamentRadius = inner + frameWidth * 0.53;', '    var ornamentRadius = inner + frameWidth * 0.57;')
        .replace(/gannzillaLargeNativeOrnateFrameV725/g, 'gannzillaBalancedThickNativeOrnateFrameV727')
        .replace(/gannzillaLargeNativeOrnateFrameBuild/g, 'gannzillaBalancedThickNativeOrnateFrameBuild')
        .replace(/gannzillaLargeNativeOrnateFrameScaleIncrease/g, 'gannzillaBalancedThickNativeOrnateFrameThicknessMultiplier')
        .replace(/gannzillaLargeNativeOrnateFrameGeometryChanged/g, 'gannzillaBalancedThickNativeOrnateFrameGeometryChanged')
        .replace(/'1\.45'/g, "'1.72'")
        .replace(/scaleIncrease: 1\.45/g, 'thicknessMultiplier: 1.72')
        .replace(/gannzilla:large-native-ornate-frame-v725/g, 'gannzilla:balanced-thick-native-frame-v727')
        .replace(/GANNZILLA_LARGE_NATIVE_ORNATE_FRAME_V725/g, 'GANNZILLA_BALANCED_THICK_NATIVE_FRAME_V727')
        .replace(/__auditGannzillaLargeNativeOrnateFrameV725/g, '__auditGannzillaBalancedThickNativeFrameV727')
        .replace(/frameScaleIncrease: 1\.45/g, 'frameThicknessMultiplier: 1.72');

      source += '\n//# sourceURL=/v727-balanced-thick-native-frame.generated.js';

      var script = document.createElement('script');
      script.id = 'gannzilla-balanced-thick-native-frame-generated-v727';
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
      console.error('[Gannzilla V727]', error);
    });

  window.__auditGannzillaBalancedThickNativeFrameLoaderV727 = function () {
    var state = window[STATE_KEY] || {};
    var runtimeAudit = typeof window.__auditGannzillaBalancedThickNativeFrameV727 === 'function'
      ? window.__auditGannzillaBalancedThickNativeFrameV727()
      : null;
    return {
      ok: state.installed === true && Boolean(runtimeAudit && runtimeAudit.ok),
      build: BUILD,
      status: state.status,
      installed: state.installed,
      error: state.error,
      sourceUrl: SOURCE_URL,
      thicknessMultiplier: THICKNESS_MULTIPLIER,
      angleLabelMode: 'balanced-cardinal-badges',
      runtime: runtimeAudit
    };
  };
}());
