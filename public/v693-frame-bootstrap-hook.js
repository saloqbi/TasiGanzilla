(function () {
  'use strict';

  if (window.__gannzillaV693FrameBootstrapHook) return;
  window.__gannzillaV693FrameBootstrapHook = true;

  var nativeWrite = document.write.bind(document);
  var runtimeTag = '<script src="/v693-exact-frame-runtime.js?v=693-direct-frame"></script>';
  var injected = false;

  document.write = function (html) {
    var nextHtml = html;

    if (!injected && typeof nextHtml === 'string') {
      if (/<\/body\s*>/i.test(nextHtml)) {
        nextHtml = nextHtml.replace(/<\/body\s*>/i, runtimeTag + '</body>');
      } else {
        nextHtml += runtimeTag;
      }
      injected = true;
    }

    return nativeWrite(nextHtml);
  };

  window.__auditGannzillaV693FrameBootstrapHook = function () {
    return {
      ok: injected,
      build: 693,
      injected: injected,
      runtimePath: '/v693-exact-frame-runtime.js'
    };
  };
}());
