(function () {
  var SHORT_PATH = '/v672.html';
  var nativeReplaceState = window.history.replaceState.bind(window.history);
  var nativePushState = window.history.pushState.bind(window.history);

  function normalizeUrl(url) {
    if (url === undefined || url === null || url === '') return url;

    try {
      var parsed = new URL(String(url), window.location.origin);
      if (parsed.origin === window.location.origin && parsed.pathname === SHORT_PATH) {
        return SHORT_PATH + (parsed.hash || '');
      }
    } catch (_) {
      if (String(url).indexOf(SHORT_PATH + '?') === 0) return SHORT_PATH;
    }

    return url;
  }

  window.history.replaceState = function (state, title, url) {
    return nativeReplaceState(state, title, normalizeUrl(url));
  };

  window.history.pushState = function (state, title, url) {
    return nativePushState(state, title, normalizeUrl(url));
  };

  nativeReplaceState(window.history.state, document.title, SHORT_PATH);

  window.addEventListener('popstate', function () {
    if (window.location.pathname === SHORT_PATH && window.location.search) {
      nativeReplaceState(window.history.state, document.title, SHORT_PATH + window.location.hash);
    }
  });

  window.__auditGannzillaV672PermanentShortLink = function () {
    return {
      ok: window.location.pathname === SHORT_PATH && window.location.search === '',
      path: window.location.pathname,
      search: window.location.search,
      replaceStateLocked: window.history.replaceState !== nativeReplaceState,
      pushStateLocked: window.history.pushState !== nativePushState
    };
  };
}());
