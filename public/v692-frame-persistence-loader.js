(function () {
  'use strict';

  if (window.__gannzillaV692FramePersistenceLoader) return;
  window.__gannzillaV692FramePersistenceLoader = true;

  var SCRIPT_ID = 'gannzilla-v692-exact-frame-runtime-loader';
  var SCRIPT_SRC = '/v691-exact-frame-runtime.js?v=692-persistence-loader';
  var injectCount = 0;
  var lastInject = null;

  function inject(source) {
    if (window.__gannzillaExactReferenceFrameRuntimeV691) return true;
    if (document.getElementById(SCRIPT_ID)) return true;

    var parent = document.body || document.head || document.documentElement;
    if (!parent) return false;

    var script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = false;
    script.dataset.gannzillaV692FramePersistenceLoader = 'true';
    script.onload = function () {
      injectCount += 1;
      lastInject = {
        source: source || 'inject',
        loaded: true,
        at: Date.now()
      };
    };
    script.onerror = function () {
      script.remove();
      lastInject = {
        source: source || 'inject',
        loaded: false,
        at: Date.now()
      };
    };
    parent.appendChild(script);
    return true;
  }

  [0, 80, 180, 350, 700, 1200, 2200, 4000, 7000].forEach(function (delay) {
    window.setTimeout(function () { inject('boot-' + delay); }, delay);
  });

  window.setInterval(function () { inject('persistence-watch'); }, 600);
  window.addEventListener('load', function () { inject('window-load'); }, false);
  window.addEventListener('pageshow', function () { inject('page-show'); }, false);
  document.addEventListener('readystatechange', function () { inject('ready-state'); }, false);

  window.__auditGannzillaV692FramePersistenceLoader = function () {
    return {
      ok: Boolean(window.__gannzillaExactReferenceFrameRuntimeV691),
      build: 692,
      runtimeRequested: Boolean(document.getElementById(SCRIPT_ID)),
      runtimeInstalled: Boolean(window.__gannzillaExactReferenceFrameRuntimeV691),
      injectCount: injectCount,
      lastInject: lastInject
    };
  };
}());
