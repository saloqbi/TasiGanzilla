(function () {
  'use strict';

  var BUILD = 730;
  var STATE_KEY = '__gannzillaStableDoubleFrameLoaderV730';
  var SOURCE_URL = '/v725-large-native-ornate-frame.js?v=730-stable-double-source';
  var FRAME_THICKNESS_MULTIPLIER = 2.0;

  if (window[STATE_KEY]) return;

  window[STATE_KEY] = {
    build: BUILD,
    status: 'loading',
    installed: false,
    error: null,
    frameThicknessMultiplier: FRAME_THICKNESS_MULTIPLIER,
    silverAuthority: 'integrated-single-pass',
    competingSilverRuntimeDisabled: true,
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

      var bodyAnchor = '    fillAnnulus(ctx, cx, cy, inner, outer, body);';
      var bodyWithSilver = [
        bodyAnchor,
        '',
        '    // V730 owns the silver band in the same final canvas pass.',
        '    // This removes the V668/V729 alternating redraw that caused flicker and size jumps.',
        '    var silverInner = inner + frameWidth * 0.205;',
        '    var silverOuter = inner + frameWidth * 0.355;',
        '    var silverWidth = silverOuter - silverInner;',
        '    var silver = ctx.createRadialGradient(cx, cy, silverInner, cx, cy, silverOuter);',
        "    silver.addColorStop(0, '#26343d');",
        "    silver.addColorStop(0.08, '#778a95');",
        "    silver.addColorStop(0.18, '#eefaff');",
        "    silver.addColorStop(0.30, '#9baab2');",
        "    silver.addColorStop(0.43, '#ffffff');",
        "    silver.addColorStop(0.56, '#bcc8ce');",
        "    silver.addColorStop(0.70, '#faffff');",
        "    silver.addColorStop(0.84, '#71838d');",
        "    silver.addColorStop(1, '#33434c');",
        '    fillAnnulus(ctx, cx, cy, silverInner, silverOuter, silver);',
        "    strokeCircle(ctx, cx, cy, silverInner, 'rgba(28,39,47,0.98)', Math.max(1.2, silverWidth * 0.055));",
        "    strokeCircle(ctx, cx, cy, silverInner + silverWidth * 0.20, 'rgba(245,253,255,0.96)', Math.max(0.9, silverWidth * 0.042));",
        "    strokeCircle(ctx, cx, cy, silverInner + silverWidth * 0.52, 'rgba(255,255,255,0.78)', Math.max(0.8, silverWidth * 0.026));",
        "    strokeCircle(ctx, cx, cy, silverOuter - silverWidth * 0.16, 'rgba(240,251,255,0.94)', Math.max(0.9, silverWidth * 0.040));",
        "    strokeCircle(ctx, cx, cy, silverOuter, 'rgba(39,52,60,0.98)', Math.max(1.2, silverWidth * 0.055));"
      ].join('\n');

      if (source.indexOf(geometryBefore) < 0) throw new Error('V725_GEOMETRY_ANCHOR_NOT_FOUND');
      if (source.indexOf(plaqueBefore) < 0) throw new Error('V725_PLAQUE_ANCHOR_NOT_FOUND');
      if (source.indexOf(bodyAnchor) < 0) throw new Error('V725_BODY_ANCHOR_NOT_FOUND');

      source = source
        .replace('var BUILD = 725;', 'var BUILD = 730;')
        .replace('__gannzillaLargeNativeOrnateFrameV725', '__gannzillaStableDoubleNativeFrameV730')
        .replace(geometryBefore, geometryAfter)
        .replace(plaqueBefore, plaqueAfter)
        .replace(bodyAnchor, bodyWithSilver)
        .replace("    var size = Math.max(10, (large ? 20 : 14) * zoom);", "    var size = Math.max(14, (large ? 30 : 21) * zoom);")
        .replace("    ctx.font = '900 ' + Math.max(20, plaqueHeight * 0.62) + 'px Arial, sans-serif';", "    ctx.font = '900 ' + Math.max(22, plaqueHeight * 0.56) + 'px Arial, sans-serif';")
        .replace('    var ornamentRadius = inner + frameWidth * 0.53;', '    var ornamentRadius = inner + frameWidth * 0.60;')
        .replace("  window.setInterval(function () { draw('persistent-watch'); }, 220);", "  window.setInterval(function () { draw('stable-integrity-watch'); }, 900);")
        .replace(/gannzillaLargeNativeOrnateFrameV725/g, 'gannzillaStableDoubleNativeFrameV730')
        .replace(/gannzillaLargeNativeOrnateFrameBuild/g, 'gannzillaStableDoubleNativeFrameBuild')
        .replace(/gannzillaLargeNativeOrnateFrameScaleIncrease/g, 'gannzillaStableDoubleNativeFrameThicknessMultiplier')
        .replace(/gannzillaLargeNativeOrnateFrameGeometryChanged/g, 'gannzillaStableDoubleNativeFrameGeometryChanged')
        .replace(/'1\.45'/g, "'2.0'")
        .replace(/scaleIncrease: 1\.45/g, 'frameThicknessMultiplier: 2.0')
        .replace(/gannzilla:large-native-ornate-frame-v725/g, 'gannzilla:stable-double-native-frame-v730')
        .replace(/GANNZILLA_LARGE_NATIVE_ORNATE_FRAME_V725/g, 'GANNZILLA_STABLE_DOUBLE_NATIVE_FRAME_V730')
        .replace(/__auditGannzillaLargeNativeOrnateFrameV725/g, '__auditGannzillaStableDoubleNativeFrameV730')
        .replace(/frameScaleIncrease: 1\.45/g, 'frameThicknessMultiplier: 2.0');

      source += [
        '',
        'window.GANNZILLA_FRAME_SINGLE_RENDER_AUTHORITY_V730 = true;',
        'window.__auditGannzillaFrameSingleRenderAuthorityV730 = function () {',
        '  var audit = typeof window.__auditGannzillaStableDoubleNativeFrameV730 === "function"',
        '    ? window.__auditGannzillaStableDoubleNativeFrameV730()',
        '    : null;',
        '  return {',
        '    ok: Boolean(audit && audit.ok),',
        '    build: 730,',
        '    thicknessMultiplier: 2.0,',
        '    silverAuthority: "integrated-single-pass",',
        '    competingSilverRuntimeDisabled: Boolean(window.__gannzillaOuterEmptyRingMirrorSilverV668),',
        '    runtime: audit',
        '  };',
        '};',
        '//# sourceURL=/v730-stable-double-native-frame.generated.js'
      ].join('\n');

      var script = document.createElement('script');
      script.id = 'gannzilla-stable-double-native-frame-generated-v730';
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
      console.error('[Gannzilla V730]', error);
    });

  window.__auditGannzillaStableDoubleFrameLoaderV730 = function () {
    var state = window[STATE_KEY] || {};
    var authority = typeof window.__auditGannzillaFrameSingleRenderAuthorityV730 === 'function'
      ? window.__auditGannzillaFrameSingleRenderAuthorityV730()
      : null;
    return {
      ok: state.installed === true && Boolean(authority && authority.ok),
      build: BUILD,
      status: state.status,
      installed: state.installed,
      error: state.error,
      frameThicknessMultiplier: FRAME_THICKNESS_MULTIPLIER,
      silverAuthority: 'integrated-single-pass',
      competingSilverRuntimeDisabled: true,
      authority: authority
    };
  };
}());