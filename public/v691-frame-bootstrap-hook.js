(function () {
  'use strict';

  if (window.__gannzillaV691FrameBootstrapHook) return;
  window.__gannzillaV691FrameBootstrapHook = true;

  var nativeWrite = document.write.bind(document);
  var injected = false;

  document.write = function (html) {
    var nextHtml = html;
    if (!injected && typeof nextHtml === 'string' && nextHtml.indexOf('</body>') >= 0) {
      nextHtml = nextHtml.replace(
        '</body>',
        '<script src="/v691-exact-frame-runtime.js?v=691-exact-frame"></script></body>'
      );
      injected = true;
    }
    return nativeWrite(nextHtml);
  };
}());
