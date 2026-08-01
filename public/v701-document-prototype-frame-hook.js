(function () {
  'use strict';

  if (window.__gannzillaV701DocumentPrototypeFrameHook) return;
  window.__gannzillaV701DocumentPrototypeFrameHook = true;

  var BUILD = 701;
  var RUNTIME_PATH = '/v685-ornate-frame.js?v=701-native-ornate-frame';
  var runtimeTag = '<script src="' + RUNTIME_PATH + '"></' + 'script>';
  var injected = false;
  var writeCount = 0;
  var lastWrite = null;
  var patched = [];

  function injectRuntime(markup, source) {
    if (injected || typeof markup !== 'string' || markup.length === 0) return markup;

    var nextMarkup = markup;
    if (/<\/body\s*>/i.test(nextMarkup)) {
      nextMarkup = nextMarkup.replace(/<\/body\s*>/i, runtimeTag + '</body>');
      injected = true;
    } else if (/<html(?:\s|>)/i.test(nextMarkup)) {
      nextMarkup += runtimeTag;
      injected = true;
    }

    if (injected) {
      lastWrite = {
        source: source,
        runtimePath: RUNTIME_PATH,
        at: Date.now()
      };
    }
    return nextMarkup;
  }

  function installMethod(proto, methodName) {
    if (!proto || typeof proto[methodName] !== 'function') return;
    if (proto[methodName].__gannzillaV701Patched) return;

    var nativeMethod = proto[methodName];
    var replacement = function () {
      var args = Array.prototype.slice.call(arguments);
      writeCount += 1;

      if (this === document && !injected) {
        for (var i = 0; i < args.length; i += 1) {
          if (typeof args[i] === 'string') {
            args[i] = injectRuntime(args[i], methodName);
            if (injected) break;
          }
        }
      }

      return nativeMethod.apply(this, args);
    };

    replacement.__gannzillaV701Patched = true;
    replacement.__gannzillaV701Native = nativeMethod;

    try {
      Object.defineProperty(proto, methodName, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: replacement
      });
      patched.push(methodName);
    } catch (_) {
      try {
        proto[methodName] = replacement;
        patched.push(methodName);
      } catch (_) {}
    }
  }

  var prototypes = [];
  if (typeof Document !== 'undefined' && Document.prototype) prototypes.push(Document.prototype);
  if (typeof HTMLDocument !== 'undefined' && HTMLDocument.prototype && prototypes.indexOf(HTMLDocument.prototype) < 0) {
    prototypes.push(HTMLDocument.prototype);
  }

  prototypes.forEach(function (proto) {
    installMethod(proto, 'write');
    installMethod(proto, 'writeln');
  });

  window.__auditGannzillaV701DocumentPrototypeFrameHook = function () {
    return {
      ok: injected,
      build: BUILD,
      injected: injected,
      runtimePath: RUNTIME_PATH,
      writeCount: writeCount,
      patchedMethods: patched.slice(),
      lastWrite: lastWrite
    };
  };
}());
