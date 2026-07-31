const BUILD = 680;
const STATE_KEY = '__gannzillaNativeWheelIvoryChampagneV680';
const ENABLE_PARAM = 'wheelIvoryChampagneNative';

let fillReplacementCount = 0;
let strokeReplacementCount = 0;
let installed = false;
let lastReplacement = null;

function effectiveSearch() {
  return window.__gannzillaV672CanonicalSearch || window.location.search || '';
}

function params() {
  try { return new URLSearchParams(effectiveSearch()); }
  catch (_) { return new URLSearchParams(); }
}

function boolParam(name, fallback = false) {
  const query = params();
  if (!query.has(name)) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(query.get(name) || '').toLowerCase());
}

function enabled() {
  if (typeof window === 'undefined') return false;
  const query = params();
  const wheelMode = query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
  const shortLinkAuthority = window.location.pathname === '/v672.html';
  return wheelMode && (shortLinkAuthority || boolParam(ENABLE_PARAM, false));
}

function normalizedColor(value) {
  if (typeof value !== 'string') return '';
  return value.toLowerCase().replace(/\s+/g, '');
}

function targetCanvas(canvas) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.closest('aside')) return false;
  const id = String(canvas.id || '').toLowerCase();
  if (id.includes('overlay') || id.includes('preview') || id.includes('tracker')) return false;
  return canvas.width > 300 && canvas.height > 300;
}

function translateFill(value) {
  const color = normalizedColor(value);
  if (color === '#fff'
    || color === '#ffffff'
    || color === 'rgb(255,255,255)'
    || color === 'rgba(255,255,255,1)') {
    return '#fffdf7';
  }
  return value;
}

function translateStroke(value) {
  const color = normalizedColor(value);
  if (color === '#b5b5b5'
    || color === 'rgb(181,181,181)'
    || color === 'rgba(181,181,181,1)') {
    return '#d4b16c';
  }
  if (color === '#7a7a7a'
    || color === 'rgb(122,122,122)'
    || color === 'rgba(122,122,122,1)') {
    return '#98620b';
  }
  return value;
}

function installAccessor(property, translator, counterName) {
  const prototype = window.CanvasRenderingContext2D?.prototype;
  const descriptor = prototype && Object.getOwnPropertyDescriptor(prototype, property);
  if (!prototype || !descriptor?.get || !descriptor?.set || descriptor.configurable === false) return false;

  Object.defineProperty(prototype, property, {
    configurable: true,
    enumerable: descriptor.enumerable,
    get() {
      return descriptor.get.call(this);
    },
    set(value) {
      let nextValue = value;
      if (enabled() && targetCanvas(this.canvas)) {
        nextValue = translator(value);
        if (nextValue !== value) {
          if (counterName === 'fill') fillReplacementCount += 1;
          else strokeReplacementCount += 1;
          this.canvas.dataset.gannzillaNativeIvoryChampagneV680 = 'true';
          this.canvas.dataset.gannzillaNativeIvoryFillV680 = '#fffdf7';
          this.canvas.dataset.gannzillaNativeChampagneGridV680 = '#d4b16c';
          this.canvas.dataset.gannzillaNativeCardinalFrameV680 = '#98620b';
          lastReplacement = {
            property,
            source: String(value),
            target: String(nextValue),
            at: Date.now(),
          };
        }
      }
      return descriptor.set.call(this, nextValue);
    },
  });
  return true;
}

function install() {
  if (typeof window === 'undefined'
    || typeof document === 'undefined'
    || window[STATE_KEY]) return;

  const fillInstalled = installAccessor('fillStyle', translateFill, 'fill');
  const strokeInstalled = installAccessor('strokeStyle', translateStroke, 'stroke');
  installed = fillInstalled && strokeInstalled;

  window.GANNZILLA_NATIVE_WHEEL_IVORY_CHAMPAGNE_V680 = installed;
  window.__auditGannzillaNativeWheelIvoryChampagneV680 = () => {
    const wheel = Array.from(document.querySelectorAll('canvas')).find((canvas) =>
      targetCanvas(canvas) && canvas.dataset.gannzillaNativeIvoryChampagneV680 === 'true');
    return {
      ok: installed
        && enabled()
        && wheel instanceof HTMLCanvasElement
        && fillReplacementCount > 0
        && strokeReplacementCount > 0,
      build: BUILD,
      enabled: enabled(),
      installed,
      wheelFound: wheel instanceof HTMLCanvasElement,
      fillReplacementCount,
      strokeReplacementCount,
      ivoryFill: '#fffdf7',
      champagneGrid: '#d4b16c',
      darkChampagneFrame: '#98620b',
      geometryChanged: false,
      numberLayoutChanged: false,
      lastReplacement,
    };
  };

  window[STATE_KEY] = { installed, translateFill, translateStroke };
}

install();
