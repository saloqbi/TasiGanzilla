(function () {
  'use strict';

  if (window.__gannzillaV702DocumentPrototypeFrameHook) return;
  window.__gannzillaV702DocumentPrototypeFrameHook = true;

  var BUILD = 702;
  var RUNTIME_PATH = '/v702-large-ornate-frame.js?v=702-large-ornate-frame';
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
    if (injected) lastWrite = { source: source, runtimePath: RUNTIME_PATH, at: Date.now() };
    return nextMarkup;
  }

  function installMethod(proto, methodName) {
    if (!proto || typeof proto[methodName] !== 'function') return;
    if (proto[methodName].__gannzillaV702Patched) return;
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
    replacement.__gannzillaV702Patched = true;
    replacement.__gannzillaV702Native = nativeMethod;
    try {
      Object.defineProperty(proto, methodName, { configurable: true, enumerable: false, writable: true, value: replacement });
      patched.push(methodName);
    } catch (_) {
      try { proto[methodName] = replacement; patched.push(methodName); } catch (_) {}
    }
  }

  var prototypes = [];
  if (typeof Document !== 'undefined' && Document.prototype) prototypes.push(Document.prototype);
  if (typeof HTMLDocument !== 'undefined' && HTMLDocument.prototype && prototypes.indexOf(HTMLDocument.prototype) < 0) prototypes.push(HTMLDocument.prototype);
  prototypes.forEach(function (proto) { installMethod(proto, 'write'); installMethod(proto, 'writeln'); });

  window.__auditGannzillaV702DocumentPrototypeFrameHook = function () {
    return { ok: injected, build: BUILD, injected: injected, runtimePath: RUNTIME_PATH, writeCount: writeCount, patchedMethods: patched.slice(), lastWrite: lastWrite };
  };
}());
