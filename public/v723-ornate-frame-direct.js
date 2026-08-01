(function () {
  'use strict';

  [
    'gannzilla-ornate-frame-direct-v723',
    'gannzilla-exact-reference-frame-v707',
    'gannzilla-persistent-exact-frame-v712',
    'gannzilla-ornate-frame-clean-v720',
    'gannzilla-ornate-frame-clean-v721'
  ].forEach(function (id) {
    var node = document.getElementById(id);
    if (node) node.remove();
  });

  window.GANNZILLA_ORNATE_FRAME_DIRECT_V723_DISABLED_BY_V724 = true;
  window.__auditGannzillaOrnateFrameDirectV723 = function () {
    return {
      ok: true,
      build: 724,
      disabled: true,
      replacement: 'native-wheel-canvas-v724'
    };
  };
}());
