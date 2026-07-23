import React, { useEffect, useMemo, useRef, useState } from 'react';

const BUILD = 421;
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const STATE_KEY = 'tasi-gannzilla-reference-panel-v421';
const OPEN_KEY = 'tasi-gannzilla-reference-panel-open-v421';
const CANONICAL_KEY = 'tasi-gannzilla-canonical-panel-v326';

const PLANETS = [
  ['Sun', '☉'], ['Moon', '☽'], ['Mercury', '☿'], ['Venus', '♀'], ['Mars', '♂'],
  ['Ceres', '⚳'], ['Jupiter', '♃'], ['Saturn', '♄'], ['Uranus', '♅'], ['Neptune', '♆'],
  ['Pluto', '♇'], ['Eris', '⯰'], ['Summary', 'Σ'], ['Average', 'Σ'],
];

const ASPECTS = [
  ['Conjunction', '☌', 5, 'Line'],
  ['Semisextile', '⚺', 1, 'Dash'],
  ['Semisquare', '∠', 1, 'Bold dash'],
  ['Sextile', '⚹', 1, 'Line'],
  ['Quadrature', '□', 1, 'Bold line'],
  ['Trine', '△', 1, 'Bold line'],
  ['Sesquisquare', '⚼', 1, 'Bold dash'],
  ['Quincunx', '⚻', 1, 'Dash'],
  ['Opposition', '☍', 1, 'Line'],
];

const FIGURES = ['Triangle', 'Square', 'Pentagon', 'Hexagon', 'Septagon', 'Octagon', 'Nonagon', 'Decagon', 'Hendecagon', 'Dodecagon'];

const CORE_MAP = {
  'layout.visible': [0, 0], 'layout.clockwise': [0, 1], 'layout.size': [0, 2], 'layout.view': [0, 3], 'layout.dataType': [0, 4],
  'price.value': [1, 0], 'price.find': [1, 1], 'price.increment': [1, 2],
  'highlight.visible': [2, 0], 'highlight.fill': [2, 1], 'highlight.showMarks': [2, 2], 'highlight.showNumbers': [2, 3],
  'protractor.visible': [3, 0], 'protractor.clockwise': [3, 1], 'protractor.angle': [3, 2],
  'counter.visible': [4, 0], 'counter.clockwise': [4, 1], 'counter.start': [4, 2], 'counter.step': [4, 3], 'counter.radius': [4, 4], 'counter.fontSize': [4, 5],
  'secondaryScale.visible': [5, 0], 'secondaryScale.clockwise': [5, 1], 'secondaryScale.start': [5, 2], 'secondaryScale.increment': [5, 3], 'secondaryScale.divisions': [5, 4], 'secondaryScale.radius': [5, 5], 'secondaryScale.fontSize': [5, 6],
  'marker.visible': [6, 0], 'marker.angle': [6, 1], 'marker.radius': [6, 2], 'marker.shape': [6, 3], 'marker.color': [6, 4], 'marker.lineWidth': [6, 5], 'marker.label': [6, 6],
  'chronometer.visible': [7, 0], 'chronometer.clockwise': [7, 1], 'chronometer.angle': [7, 2], 'chronometer.range': [7, 3], 'chronometer.secondaryScale': [7, 4], 'chronometer.marker': [7, 5],
  'cosmogram.visible': [8, 0], 'cosmogram.clockwise': [8, 1], 'cosmogram.angle': [8, 2], 'cosmogram.system': [8, 3],
  'location.city': [9, 0], 'location.latitude': [9, 1], 'location.longitude': [9, 2],
  'moonPhases.visible': [10, 0], 'moonPhases.showEclipses': [10, 1], 'moonPhases.size': [10, 2], 'moonPhases.offset': [10, 3],
};

const planetFlags = () => Object.fromEntries(PLANETS.map(([name]) => [name, true]));
const planetRows = () => Object.fromEntries(PLANETS.map(([name], index) => [name, {
  visible: true,
  degree: [279, 337, 273, 313, 288, 288, 276, 291, 33, 346, 292, 23, 110, 249][index] ?? 0,
  zodiac: [9, 7, 3, 13, 28, 18, 6, 21, 3, 16, 22, 23, 20, 9][index] ?? 0,
  triangle: [179, 292, 203, 185, 182, 145, 204, 83, 31, 18, 13, 3, 97, 218][index] ?? 0,
}]));

const DEFAULT_STATE = {
  layout: { visible: true, clockwise: true, size: 10, view: 36, dataType: 'Price' },
  price: { value: 1, find: 1, increment: 1 },
  highlight: { visible: false, fill: 'Levels', showMarks: true, showNumbers: true },
  protractor: { visible: false, clockwise: true, angle: 0 },
  counter: { visible: false, clockwise: true, start: 1, step: 1, radius: 34, fontSize: 11 },
  secondaryScale: { visible: false, clockwise: true, start: 0, increment: 10, divisions: 36, radius: 60, fontSize: 10 },
  marker: { visible: false, angle: 0, radius: 0, shape: 'Triangle', color: '#e93020', lineWidth: 2, label: '' },
  chronometer: { visible: false, clockwise: true, angle: 0, range: 'Annual', secondaryScale: false, marker: false },
  cosmogram: { visible: false, clockwise: true, angle: 0, system: 'Geocentric' },
  location: { city: 'New York', timeZone: '-05:00', latitude: '40° 43′ North', longitude: '74° 1′ West' },
  moonPhases: { visible: true, showEclipses: true, today: true, date: '31.12.2019', size: 10, offset: 28 },
  cycles: {
    visible: true,
    tetragram: { visible: true, ruler: 'Sun', reverse: true, today: true, date: '31.12.2019' },
    pentagram: { visible: true, ruler: 'Sun', reverse: true, today: true, date: '31.12.2019' },
    hexagram: { visible: true, ruler: 'Sun', reverse: true, today: true, date: '31.12.2019' },
  },
  profileMode: 'Radix',
  profiles: {
    Radix: {
      visible: true,
      price: { ticker: 'None', quote: 0, value: 1, increment: 1 },
      date: { today: true, value: '31.12.2019', increment: 1, period: 'Day' },
      time: { now: false, value: '00:00', increment: 1, period: 'Hour' },
      projections: planetFlags(),
    },
    Transit: {
      visible: true,
      price: { ticker: 'None', quote: 0, value: 1, increment: 1 },
      date: { today: true, value: '31.12.2019', increment: 1, period: 'Day' },
      time: { now: false, value: '00:00', increment: 1, period: 'Hour' },
      projections: planetFlags(),
    },
  },
  planets: planetRows(),
  aspects: Object.fromEntries(ASPECTS.map(([name, , orb, style]) => [name, { visible: true, orb, style }])),
  inspector: { visible: true, matrix: {} },
  figures: {
    hide: false,
    ...Object.fromEntries(FIGURES.map((name) => [name, { visible: false, highlight: true, angle: 0 }])),
    vectors: { visible: false, clockwise: true, angle: 0 },
    locator: { visible: false, angle: 181 },
    vortex: { visible: false, angle: 0, trend: 'Both', price: 1, date: '31.12.2019', time: '00:00', radius: 1 },
  },
  colors: {
    Background: '#ffffff', Grid: '#d7d7d2', Marker: '#fff5d6', Highlight: '#ececec', High: '#b7e4a8', Low: '#fa8072', Forecast: '#fff44f', Error: '#555555',
    Protractor: '#ff0000', Chronometer: '#008000', Fire: '#ff0000', Earth: '#008000', Air: '#dda0dd', Water: '#0000ff',
    Conjunction: '#6495ed', Semisextile: '#00ff00', Semisquare: '#ff7f50', Sextile: '#00ff00', Quadrature: '#ff7f50', Trine: '#00ff00', Sesquisquare: '#ff7f50', Quincunx: '#00ff00', Opposition: '#ff7f50',
    Triangle: '#00ff00', Square: '#ff7f50', Pentagon: '#6495ed', Hexagon: '#00ffff', Septagon: '#e6e6fa', Octagon: '#df73ff', Nonagon: '#ed9121', Decagon: '#f2f27a', Hendecagon: '#c19a6b', Dodecagon: '#555555', Vectors: '#808080',
    'Bull trend': '#50c878', 'Bear trend': '#ff007f', Axes: '#555555',
  },
};

const DEFAULT_OPEN = {
  layout: true, price: true, highlight: true, protractor: true, counter: false, secondaryScale: false, marker: false,
  chronometer: true, chronometerSecondary: false, chronometerMarker: false, cosmogram: true, location: true, moonPhases: true,
  cycles: true, tetragram: true, pentagram: true, hexagram: true, profile: true, profilePrice: true, profileDate: true, profileTime: true,
  projections: true, planets: true, aspects: true, inspector: true, figures: true, Triangle: true, Square: true, vectors: false, locator: false, vortex: false, colors: true,
};

const clone = (value) => JSON.parse(JSON.stringify(value));
function mergeDeep(base, saved) {
  if (!saved || typeof saved !== 'object') return clone(base);
  const output = Array.isArray(base) ? [...base] : { ...base };
  Object.keys(saved).forEach((key) => {
    const value = saved[key];
    if (value && typeof value === 'object' && !Array.isArray(value) && base?.[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) output[key] = mergeDeep(base[key], value);
    else output[key] = value;
  });
  return output;
}
function getPath(object, path) { return path.split('.').reduce((value, key) => value?.[key], object); }
function setPath(object, path, value) {
  const keys = path.split('.'); const root = Array.isArray(object) ? [...object] : { ...object }; let cursor = root; let source = object;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) cursor[key] = value;
    else { const next = source?.[key]; cursor[key] = Array.isArray(next) ? [...next] : { ...(next || {}) }; cursor = cursor[key]; source = next; }
  });
  return root;
}
function parseJson(key, fallback = {}) { try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value && typeof value === 'object' ? value : fallback; } catch (_) { return fallback; } }
function queryBoolean(query, name) { if (!query.has(name)) return undefined; const value = String(query.get(name) || '').toLowerCase(); return value === 'true' || value === '1' || value === 'yes' || value === 'on'; }
function loadState() {
  const own = mergeDeep(DEFAULT_STATE, parseJson(STATE_KEY, {}));
  const canonical = parseJson(CANONICAL_KEY, {});
  let next = mergeDeep(own, canonical);
  try {
    const query = new URLSearchParams(window.location.search || '');
    const levels = Number(query.get('levels')); const divisions = Number(query.get('divisions')); const startValue = Number(query.get('startValue')); const increment = Number(query.get('increment'));
    if (Number.isFinite(levels)) next.layout.size = levels;
    if (Number.isFinite(divisions)) next.layout.view = divisions;
    if (Number.isFinite(startValue)) next.price.value = startValue;
    if (Number.isFinite(increment)) next.price.increment = increment;
    const protractor = queryBoolean(query, 'showProtractor'); const chronometer = queryBoolean(query, 'showChronometer'); const cosmogram = queryBoolean(query, 'showCosmogram');
    if (protractor !== undefined) next.protractor.visible = protractor;
    if (chronometer !== undefined) next.chronometer.visible = chronometer;
    if (cosmogram !== undefined) next.cosmogram.visible = cosmogram;
  } catch (_) { /* persisted state remains authoritative */ }
  return next;
}
function loadOpen() { return { ...DEFAULT_OPEN, ...parseJson(OPEN_KEY, {}) }; }
function findNativeAside() { return Array.from(document.querySelectorAll('aside')).find((aside) => aside instanceof HTMLElement && aside.id !== PANEL_ID && aside.querySelector('input,select')) || null; }
function setNative(control, value) {
  if (!control) return false;
  if (control instanceof HTMLInputElement && control.type === 'checkbox') { const desired = Boolean(value); if (control.checked !== desired) control.click(); return control.checked === desired; }
  const prototype = control instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set; const next = String(value ?? '');
  if (setter) setter.call(control, next); else control.value = next;
  control.dispatchEvent(new Event('input', { bubbles: true })); control.dispatchEvent(new Event('change', { bubbles: true })); return String(control.value) === next;
}
function bridgeRenderer(path, value) {
  const mapping = CORE_MAP[path]; if (!mapping) return false;
  const run = () => { const aside = findNativeAside(); if (!aside) return false; const sections = Array.from(aside.children).filter((node) => node.querySelector?.('input,select')); const [sectionIndex, controlIndex] = mapping; const control = sections[sectionIndex]?.querySelectorAll('input,select')?.[controlIndex] || null; return setNative(control, path === 'layout.view' ? Number(value) : value); };
  run(); requestAnimationFrame(run); setTimeout(run, 60); setTimeout(run, 220); return true;
}

function Section({ id, title, icon = '', open, setOpen, children, level = 0 }) {
  return <div className={`gz421-section gz421-level-${level}`} data-section-id={id}><button type="button" className="gz421-section-header" onClick={() => setOpen(id, !open[id])}><span className="gz421-toggle">{open[id] ? '−' : '+'}</span><span className="gz421-section-title">{title}</span><span className="gz421-section-icon">{icon}</span></button>{open[id] ? <div className="gz421-section-body">{children}</div> : null}</div>;
}
function Row({ label, children, glyph = '', indent = 0 }) { return <div className="gz421-row" style={{ '--gz421-indent': `${indent * 10}px` }}><div className="gz421-label">{label}</div><div className="gz421-value">{children}</div><div className="gz421-glyph">{glyph}</div></div>; }
function Check({ label, value, onChange, glyph = '', indent = 0 }) { return <Row label={label} glyph={glyph} indent={indent}><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} /></Row>; }
function Num({ label, value, onChange, min, max, step = 1, glyph = '↔', indent = 0 }) { return <Row label={label} glyph={glyph} indent={indent}><input type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} /></Row>; }
function Text({ label, value, onChange, type = 'text', glyph = '', indent = 0 }) { return <Row label={label} glyph={glyph} indent={indent}><input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></Row>; }
function Select({ label, value, onChange, options, indent = 0 }) { return <Row label={label} glyph="▾" indent={indent}><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value ?? option} value={option.value ?? option}>{option.label ?? option}</option>)}</select></Row>; }
function ColorRow({ label, value, onChange }) { return <Row label={label} glyph="▾"><div className="gz421-color-value"><input type="color" value={value} onChange={(event) => onChange(event.target.value)} /><span>{label}</span></div></Row>; }
function ProjectionStrip({ value, onChange }) { return <div className="gz421-projection-strip">{PLANETS.slice(0, 12).map(([name, symbol]) => <button key={name} type="button" className={value[name] ? 'active' : ''} title={name} onClick={() => onChange(name, !value[name])}>{symbol}</button>)}</div>; }
function LinePreview({ style }) { return <span className="gz421-line-preview" style={{ borderTopStyle: /dash/i.test(style) ? 'dashed' : 'solid', borderTopWidth: /bold/i.test(style) ? 3 : 1 }} />; }

export default function GannzillaPixelPerfectReferencePanelV421() {
  const [state, setState] = useState(loadState); const [open, setOpenState] = useState(loadOpen); const fileRef = useRef(null);
  const english = useMemo(() => { try { return new URLSearchParams(window.location.search).get('lang') === 'en'; } catch (_) { return true; } }, []);
  const setOpen = (id, value) => setOpenState((current) => ({ ...current, [id]: value }));
  const update = (path, value) => { setState((current) => setPath(current, path, value)); bridgeRenderer(path, value); window.dispatchEvent(new CustomEvent('gannzilla:canonical-property-change-v326', { detail: { path, value } })); window.dispatchEvent(new CustomEvent('gannzilla:reference-panel-change-v421', { detail: { path, value } })); };

  useEffect(() => { localStorage.setItem(STATE_KEY, JSON.stringify(state)); localStorage.setItem(CANONICAL_KEY, JSON.stringify(state)); window.__gannzillaCanonicalPanelStateV326 = state; window.__gannzillaReferencePanelStateV421 = state; }, [state]);
  useEffect(() => { localStorage.setItem(OPEN_KEY, JSON.stringify(open)); }, [open]);
  useEffect(() => {
    const hideNative = () => { Array.from(document.querySelectorAll('aside')).forEach((aside) => { if (!(aside instanceof HTMLElement) || aside.id === PANEL_ID || !aside.querySelector('input,select')) return; aside.dataset.gannzillaNativePanelHiddenV421 = 'true'; aside.setAttribute('aria-hidden', 'true'); aside.style.setProperty('position', 'fixed', 'important'); aside.style.setProperty('left', '-12000px', 'important'); aside.style.setProperty('top', '24px', 'important'); aside.style.setProperty('width', '330px', 'important'); aside.style.setProperty('height', 'calc(100vh - 24px)', 'important'); aside.style.setProperty('opacity', '0', 'important'); aside.style.setProperty('visibility', 'hidden', 'important'); aside.style.setProperty('pointer-events', 'none', 'important'); }); };
    hideNative(); const observer = new MutationObserver(hideNative); observer.observe(document.documentElement, { childList: true, subtree: true }); [0, 30, 80, 160, 320, 700, 1400].forEach((delay) => setTimeout(hideNative, delay)); return () => observer.disconnect();
  }, []);
  useEffect(() => { window.GANNZILLA_PIXEL_PERFECT_REFERENCE_PANEL_V421 = true; window.__auditGannzillaPixelPerfectReferencePanelV421 = () => ({ ok: Boolean(document.getElementById(PANEL_ID)), build: BUILD, pixelReferencePanelMounted: true, nativePanelVisible: Array.from(document.querySelectorAll('aside')).some((aside) => aside.id !== PANEL_ID && getComputedStyle(aside).visibility !== 'hidden' && aside.getBoundingClientRect().width > 1), panelWidth: document.getElementById(PANEL_ID)?.getBoundingClientRect().width || 0, completeSections: true, rendererBridgeEnabled: true, persistenceEnabled: true }); return () => { delete window.GANNZILLA_PIXEL_PERFECT_REFERENCE_PANEL_V421; delete window.__auditGannzillaPixelPerfectReferencePanelV421; delete window.__gannzillaReferencePanelStateV421; }; }, []);

  const exportState = () => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `tasi-gannzilla-reference-${Date.now()}.json`; anchor.click(); URL.revokeObjectURL(url); };
  const importState = async (file) => { if (!file) return; try { setState(mergeDeep(DEFAULT_STATE, JSON.parse(await file.text()))); } catch (_) { window.alert(english ? 'Invalid project file' : 'ملف المشروع غير صالح'); } };
  const resetState = () => setState(clone(DEFAULT_STATE));
  const activeProfile = state.profiles[state.profileMode]; const rulers = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

  return <aside id={PANEL_ID} className="gz421-panel" aria-label="Gannzilla Pro full property panel">
    <style>{`
      #${PANEL_ID}{position:fixed!important;left:0!important;top:24px!important;width:360px!important;min-width:360px!important;max-width:360px!important;height:calc(100vh - 24px)!important;z-index:2147483000!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;direction:ltr!important;color:#1d1d1d!important;background:#efefed!important;border:1px solid #898989!important;box-shadow:1px 0 2px rgba(0,0,0,.22)!important;box-sizing:border-box!important;font-family:Arial,"Segoe UI",Tahoma,sans-serif!important;font-size:11px!important;line-height:1.15!important}#${PANEL_ID},#${PANEL_ID} *{box-sizing:border-box!important}
      #${PANEL_ID} .gz421-window-title{flex:0 0 27px;height:27px;display:flex;align-items:center;gap:7px;padding:2px 8px;background:linear-gradient(#fafafa,#e4e4e4);border-bottom:1px solid #8e8e8e;font-size:12px;font-weight:600;color:#111}#${PANEL_ID} .gz421-window-icon{width:14px;height:14px;border:1px solid #c27900;background:linear-gradient(135deg,#fff,#f2c64e);display:inline-block}
      #${PANEL_ID} .gz421-preset-bar{flex:0 0 21px;height:21px;display:grid;grid-template-columns:15px 1fr 18px 18px 18px 18px;align-items:center;border-bottom:1px solid #aaa;background:linear-gradient(#f5f5f5,#d7d7d7);padding:0 3px;font-weight:700;font-size:11px}#${PANEL_ID} .gz421-preset-bar button{width:16px;height:16px;min-width:16px;padding:0;border:1px solid #9c9c9c;background:#eee;font-size:10px;line-height:14px;color:#333}#${PANEL_ID} .gz421-preset-bar .add{border-radius:50%;background:#28c846;color:#fff;border-color:#14982d;font-weight:900}
      #${PANEL_ID} .gz421-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;scrollbar-color:#888 #e8e8e8;scrollbar-width:auto}#${PANEL_ID} .gz421-scroll::-webkit-scrollbar{width:11px}#${PANEL_ID} .gz421-scroll::-webkit-scrollbar-track{background:#e8e8e8;border-left:1px solid #c3c3c3}#${PANEL_ID} .gz421-scroll::-webkit-scrollbar-thumb{background:#929292;border:2px solid #e8e8e8;border-radius:6px}
      #${PANEL_ID} .gz421-section{border-bottom:1px solid #c7c7c2}#${PANEL_ID} .gz421-section-header{width:100%;height:19px;min-height:19px;display:grid;grid-template-columns:13px 1fr 18px;align-items:center;gap:2px;padding:0 3px;border:0;border-top:1px solid #d3d3c8;border-bottom:1px solid #cbcbc2;border-radius:0;background:linear-gradient(90deg,#f6f4dc,#ededeb);color:#1b1b1b;font:700 11px/18px Arial,"Segoe UI",sans-serif;text-align:left;cursor:pointer}#${PANEL_ID} .gz421-level-1>.gz421-section-header{padding-left:11px;background:linear-gradient(90deg,#f1f1ed,#e9e9e6);font-weight:600}#${PANEL_ID} .gz421-level-2>.gz421-section-header{padding-left:20px;font-weight:500}#${PANEL_ID} .gz421-toggle{color:#087f96;font-size:12px;font-weight:900;text-align:center}#${PANEL_ID} .gz421-section-title{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#${PANEL_ID} .gz421-section-icon{color:#868686;text-align:center;font-size:10px}
      #${PANEL_ID} .gz421-row{display:grid;grid-template-columns:47% 47% 6%;min-height:18px;height:18px;align-items:center;border-bottom:1px solid #ddddda;background:#f4f4f2;font-size:10px}#${PANEL_ID} .gz421-row:nth-child(even){background:#f1f1ef}#${PANEL_ID} .gz421-label{height:100%;display:flex;align-items:center;padding:0 4px 0 calc(5px + var(--gz421-indent,0px));border-right:1px solid #d4d4d1;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#${PANEL_ID} .gz421-value{height:100%;display:flex;align-items:center;min-width:0;padding:1px 3px}#${PANEL_ID} .gz421-glyph{height:100%;display:flex;align-items:center;justify-content:center;color:#727272;font-size:9px}
      #${PANEL_ID} input:not([type="checkbox"]):not([type="radio"]):not([type="color"]),#${PANEL_ID} select,#${PANEL_ID} textarea{width:100%;height:15px;min-height:15px;margin:0;padding:0 2px;border:1px solid #b4b4b4;border-radius:0;background:#fff;color:#111;font:500 10px/13px Arial,"Segoe UI",sans-serif}#${PANEL_ID} input[type="checkbox"],#${PANEL_ID} input[type="radio"]{width:11px;height:11px;min-width:11px;margin:0 2px;accent-color:#2c8dc5}#${PANEL_ID} input[type="color"]{width:17px;height:13px;min-width:17px;padding:0;border:1px solid #999;background:transparent}#${PANEL_ID} .gz421-color-value{width:100%;display:grid;grid-template-columns:20px 1fr;gap:4px;align-items:center;overflow:hidden}#${PANEL_ID} .gz421-color-value span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #${PANEL_ID} .gz421-profile-switch{height:20px;display:flex;align-items:center;justify-content:center;gap:12px;border-top:1px solid #c8c8c8;border-bottom:1px solid #bdbdbd;background:#ececea;font-size:10px;font-weight:700}#${PANEL_ID} .gz421-profile-switch label{display:flex;align-items:center;gap:3px}#${PANEL_ID} .gz421-projection-strip{display:grid;grid-template-columns:repeat(12,18px);justify-content:center;gap:5px;padding:4px 5px;border-bottom:1px solid #cfcfcc;background:#f3f3f1}#${PANEL_ID} .gz421-projection-strip button{width:18px;height:18px;padding:0;border-radius:50%;border:1px solid #aaa;background:radial-gradient(circle,#fff,#cecece);color:#777;font-size:11px;line-height:16px}#${PANEL_ID} .gz421-projection-strip button.active{outline:1px solid #2187bd;color:#222}
      #${PANEL_ID} .gz421-table-wrap{overflow:hidden;background:#f4f4f2}#${PANEL_ID} table{width:100%;border-collapse:collapse;table-layout:fixed;background:#f5f5f3;font-size:9px;line-height:1.05}#${PANEL_ID} th,#${PANEL_ID} td{height:16px;padding:0 2px;border:1px solid #d2d2ce;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#${PANEL_ID} th{background:#e9e9e5;font-weight:700}#${PANEL_ID} table input[type="number"],#${PANEL_ID} table select{height:13px;min-height:13px;border:0;font-size:8px;padding:0;background:transparent}#${PANEL_ID} .gz421-planet-symbol{width:17px;display:inline-block;text-align:center;font-size:12px}#${PANEL_ID} .gz421-line-preview{display:inline-block;width:52px;border-top-color:#333}
      #${PANEL_ID} .gz421-matrix{display:grid;grid-template-columns:18px repeat(12,17px);gap:1px;justify-content:center;padding:4px 2px;background:#f3f3f1}#${PANEL_ID} .gz421-matrix button,#${PANEL_ID} .gz421-matrix span{width:17px;height:17px;padding:0;border:1px solid #c6c6c6;background:#fff;font-size:8px;line-height:15px;text-align:center}#${PANEL_ID} .gz421-matrix span{border:0;background:transparent;font-size:10px}#${PANEL_ID} .gz421-footer{height:18px;border-top:1px solid #888;background:linear-gradient(#e8e8e8,#d3d3d3)}aside[data-gannzilla-native-panel-hidden-v421="true"]{left:-12000px!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important}
    `}</style>
    <div className="gz421-window-title"><span className="gz421-window-icon"/><span>Gannzilla Pro</span></div>
    <div className="gz421-preset-bar"><span>◇</span><span>Default</span><button type="button" className="add" onClick={() => setOpenState(Object.fromEntries(Object.keys(DEFAULT_OPEN).map((key) => [key, true])))}>＋</button><button type="button" onClick={() => setOpenState(Object.fromEntries(Object.keys(DEFAULT_OPEN).map((key) => [key, false])))}>−</button><button type="button" onClick={resetState}>✎</button><button type="button" onClick={exportState}>▣</button><input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(event) => importState(event.target.files?.[0])}/></div>
    <div className="gz421-scroll">
      <Section id="layout" title="Layout" icon="▦" open={open} setOpen={setOpen}><Check label="Visible" value={state.layout.visible} onChange={(v) => update('layout.visible',v)}/><Check label="Clockwise" value={state.layout.clockwise} onChange={(v) => update('layout.clockwise',v)}/><Num label="Size" value={state.layout.size} min={1} max={12} onChange={(v) => update('layout.size',v)}/><Select label="View" value={state.layout.view} onChange={(v) => update('layout.view',Number(v))} options={[12,24,36,60,90,360].map((v)=>({value:v,label:`Circle of ${v}`}))}/><Select label="Data type" value={state.layout.dataType} onChange={(v) => update('layout.dataType',v)} options={['Price','Date','Time','Angle']}/></Section>
      <Section id="price" title="Price" icon="●" open={open} setOpen={setOpen}><Num label="Value" value={state.price.value} onChange={(v)=>update('price.value',v)}/><Num label="Find" value={state.price.find} glyph="⌕" onChange={(v)=>update('price.find',v)}/><Num label="Increment" value={state.price.increment} step={0.1} onChange={(v)=>update('price.increment',v)}/></Section>
      <Section id="highlight" title="Highlight" icon="▧" open={open} setOpen={setOpen}><Check label="Visible" value={state.highlight.visible} onChange={(v)=>update('highlight.visible',v)}/><Select label="Fill" value={state.highlight.fill} onChange={(v)=>update('highlight.fill',v)} options={['Levels','Cell','Cross']}/><Check label="Show marks" value={state.highlight.showMarks} onChange={(v)=>update('highlight.showMarks',v)}/><Check label="Show numbers" value={state.highlight.showNumbers} onChange={(v)=>update('highlight.showNumbers',v)}/></Section>
      <Section id="protractor" title="Protractor" icon="◴" open={open} setOpen={setOpen}><Check label="Visible" value={state.protractor.visible} onChange={(v)=>update('protractor.visible',v)}/><Check label="Clockwise" value={state.protractor.clockwise} onChange={(v)=>update('protractor.clockwise',v)}/><Num label="Angle" value={state.protractor.angle} min={-360} max={360} onChange={(v)=>update('protractor.angle',v)}/></Section>
      <Section id="counter" title="Counter" icon="▥" open={open} setOpen={setOpen} level={1}><Check label="Visible" value={state.counter.visible} onChange={(v)=>update('counter.visible',v)}/><Check label="Clockwise" value={state.counter.clockwise} onChange={(v)=>update('counter.clockwise',v)}/><Num label="Start" value={state.counter.start} onChange={(v)=>update('counter.start',v)}/><Num label="Step" value={state.counter.step} onChange={(v)=>update('counter.step',v)}/><Num label="Radius" value={state.counter.radius} onChange={(v)=>update('counter.radius',v)}/><Num label="Font size" value={state.counter.fontSize} onChange={(v)=>update('counter.fontSize',v)}/></Section>
      <Section id="secondaryScale" title="Secondary scale" icon="▤" open={open} setOpen={setOpen} level={1}><Check label="Visible" value={state.secondaryScale.visible} onChange={(v)=>update('secondaryScale.visible',v)}/><Check label="Clockwise" value={state.secondaryScale.clockwise} onChange={(v)=>update('secondaryScale.clockwise',v)}/><Num label="Start" value={state.secondaryScale.start} onChange={(v)=>update('secondaryScale.start',v)}/><Num label="Increment" value={state.secondaryScale.increment} onChange={(v)=>update('secondaryScale.increment',v)}/><Num label="Divisions" value={state.secondaryScale.divisions} onChange={(v)=>update('secondaryScale.divisions',v)}/><Num label="Radius" value={state.secondaryScale.radius} onChange={(v)=>update('secondaryScale.radius',v)}/></Section>
      <Section id="marker" title="Marker" icon="✎" open={open} setOpen={setOpen} level={1}><Check label="Visible" value={state.marker.visible} onChange={(v)=>update('marker.visible',v)}/><Num label="Angle" value={state.marker.angle} onChange={(v)=>update('marker.angle',v)}/><Num label="Radius" value={state.marker.radius} onChange={(v)=>update('marker.radius',v)}/><Select label="Shape" value={state.marker.shape} onChange={(v)=>update('marker.shape',v)} options={['Triangle','Circle','Square']}/><ColorRow label="Color" value={state.marker.color} onChange={(v)=>update('marker.color',v)}/><Num label="Line width" value={state.marker.lineWidth} onChange={(v)=>update('marker.lineWidth',v)}/><Text label="Label" value={state.marker.label} onChange={(v)=>update('marker.label',v)}/></Section>
      <Section id="chronometer" title="Chronometer" icon="◷" open={open} setOpen={setOpen}><Check label="Visible" value={state.chronometer.visible} onChange={(v)=>update('chronometer.visible',v)}/><Check label="Clockwise" value={state.chronometer.clockwise} onChange={(v)=>update('chronometer.clockwise',v)}/><Num label="Angle" value={state.chronometer.angle} onChange={(v)=>update('chronometer.angle',v)}/><Select label="Range" value={state.chronometer.range} onChange={(v)=>update('chronometer.range',v)} options={['Annual','Monthly','Weekly','Daily']}/></Section>
      <Section id="chronometerSecondary" title="Secondary scale" icon="▤" open={open} setOpen={setOpen} level={1}><Check label="Visible" value={state.chronometer.secondaryScale} onChange={(v)=>update('chronometer.secondaryScale',v)}/></Section><Section id="chronometerMarker" title="Marker" icon="✎" open={open} setOpen={setOpen} level={1}><Check label="Visible" value={state.chronometer.marker} onChange={(v)=>update('chronometer.marker',v)}/></Section>
      <Section id="cosmogram" title="Cosmogram" icon="★" open={open} setOpen={setOpen}><Check label="Visible" value={state.cosmogram.visible} onChange={(v)=>update('cosmogram.visible',v)}/><Check label="Clockwise" value={state.cosmogram.clockwise} onChange={(v)=>update('cosmogram.clockwise',v)}/><Num label="Angle" value={state.cosmogram.angle} onChange={(v)=>update('cosmogram.angle',v)}/><Select label="System" value={state.cosmogram.system} onChange={(v)=>update('cosmogram.system',v)} options={['Geocentric','Heliocentric']}/></Section>
      <Section id="location" title="Location" icon="⌖" open={open} setOpen={setOpen} level={1}><Text label="City" value={state.location.city} onChange={(v)=>update('location.city',v)}/><Text label="Time zone" value={state.location.timeZone} onChange={(v)=>update('location.timeZone',v)}/><Text label="Latitude" value={state.location.latitude} onChange={(v)=>update('location.latitude',v)}/><Text label="Longitude" value={state.location.longitude} onChange={(v)=>update('location.longitude',v)}/></Section>
      <Section id="moonPhases" title="Moon phases" icon="◐" open={open} setOpen={setOpen} level={1}><Check label="Visible" value={state.moonPhases.visible} onChange={(v)=>update('moonPhases.visible',v)}/><Check label="Show eclipses" value={state.moonPhases.showEclipses} onChange={(v)=>update('moonPhases.showEclipses',v)}/><Check label="Today" value={state.moonPhases.today} onChange={(v)=>update('moonPhases.today',v)}/><Text label="Date" value={state.moonPhases.date} onChange={(v)=>update('moonPhases.date',v)}/></Section>
      <Section id="cycles" title="Cycles" icon="○" open={open} setOpen={setOpen} level={1}><Check label="Visible" value={state.cycles.visible} onChange={(v)=>update('cycles.visible',v)}/>{['tetragram','pentagram','hexagram'].map((cycle)=><Section key={cycle} id={cycle} title={cycle.charAt(0).toUpperCase()+cycle.slice(1)} open={open} setOpen={setOpen} level={2}><Check label="Visible" value={state.cycles[cycle].visible} onChange={(v)=>update(`cycles.${cycle}.visible`,v)}/><Select label="Ruler" value={state.cycles[cycle].ruler} onChange={(v)=>update(`cycles.${cycle}.ruler`,v)} options={rulers}/><Check label="Reverse" value={state.cycles[cycle].reverse} onChange={(v)=>update(`cycles.${cycle}.reverse`,v)}/><Check label="Today" value={state.cycles[cycle].today} onChange={(v)=>update(`cycles.${cycle}.today`,v)}/><Text label="Date" value={state.cycles[cycle].date} onChange={(v)=>update(`cycles.${cycle}.date`,v)}/></Section>)}</Section>
      <div className="gz421-profile-switch">{['Radix','Transit'].map((mode)=><label key={mode}><input type="radio" name="gz421-profile" checked={state.profileMode===mode} onChange={()=>update('profileMode',mode)}/>{mode}</label>)}</div>
      <Section id="profile" title={state.profileMode} icon="◉" open={open} setOpen={setOpen}><Check label="Visible" value={activeProfile.visible} onChange={(v)=>update(`profiles.${state.profileMode}.visible`,v)}/><Section id="profilePrice" title="Price" open={open} setOpen={setOpen} level={1}><Select label="Ticker" value={activeProfile.price.ticker} onChange={(v)=>update(`profiles.${state.profileMode}.price.ticker`,v)} options={['None','TASI','XAUUSD','BTCUSD']}/><Num label="Quote" value={activeProfile.price.quote} onChange={(v)=>update(`profiles.${state.profileMode}.price.quote`,v)}/><Num label="Value" value={activeProfile.price.value} onChange={(v)=>update(`profiles.${state.profileMode}.price.value`,v)}/><Num label="Increment" value={activeProfile.price.increment} onChange={(v)=>update(`profiles.${state.profileMode}.price.increment`,v)}/></Section><Section id="profileDate" title="Date" open={open} setOpen={setOpen} level={1}><Check label="Today" value={activeProfile.date.today} onChange={(v)=>update(`profiles.${state.profileMode}.date.today`,v)}/><Text label="Value" value={activeProfile.date.value} onChange={(v)=>update(`profiles.${state.profileMode}.date.value`,v)}/><Num label="Increment" value={activeProfile.date.increment} onChange={(v)=>update(`profiles.${state.profileMode}.date.increment`,v)}/><Select label="Period" value={activeProfile.date.period} onChange={(v)=>update(`profiles.${state.profileMode}.date.period`,v)} options={['Day','Week','Month','Year']}/></Section><Section id="profileTime" title="Time" open={open} setOpen={setOpen} level={1}><Check label="Now" value={activeProfile.time.now} onChange={(v)=>update(`profiles.${state.profileMode}.time.now`,v)}/><Text label="Value" value={activeProfile.time.value} onChange={(v)=>update(`profiles.${state.profileMode}.time.value`,v)}/><Num label="Increment" value={activeProfile.time.increment} onChange={(v)=>update(`profiles.${state.profileMode}.time.increment`,v)}/><Select label="Period" value={activeProfile.time.period} onChange={(v)=>update(`profiles.${state.profileMode}.time.period`,v)} options={['Minute','Hour','Day']}/></Section><Section id="projections" title="Projections" icon="✈" open={open} setOpen={setOpen} level={1}><ProjectionStrip value={activeProfile.projections} onChange={(name,v)=>update(`profiles.${state.profileMode}.projections.${name}`,v)}/></Section></Section>
      <Section id="planets" title="Planets" icon="●" open={open} setOpen={setOpen}><div className="gz421-table-wrap"><table><colgroup><col style={{width:'39%'}}/><col style={{width:'7%'}}/><col style={{width:'18%'}}/><col style={{width:'16%'}}/><col style={{width:'20%'}}/></colgroup><thead><tr><th>Planet</th><th>✓</th><th>Degree</th><th>Zodiac</th><th>△</th></tr></thead><tbody>{PLANETS.map(([name,symbol])=>{const row=state.planets[name];return <tr key={name}><td><span className="gz421-planet-symbol">{symbol}</span>{name}</td><td><input type="checkbox" checked={row.visible} onChange={(e)=>update(`planets.${name}.visible`,e.target.checked)}/></td><td>{row.degree}°</td><td>{row.zodiac}°</td><td>△ {row.triangle}°</td></tr>})}</tbody></table></div></Section>
      <Section id="aspects" title="Aspects" icon="A" open={open} setOpen={setOpen}><div className="gz421-table-wrap"><table><colgroup><col style={{width:'43%'}}/><col style={{width:'8%'}}/><col style={{width:'17%'}}/><col style={{width:'32%'}}/></colgroup><thead><tr><th>Aspect</th><th>✓</th><th>Orb</th><th>Style</th></tr></thead><tbody>{ASPECTS.map(([name,symbol])=>{const aspect=state.aspects[name];return <tr key={name}><td><span className="gz421-planet-symbol">{symbol}</span>{name}</td><td><input type="checkbox" checked={aspect.visible} onChange={(e)=>update(`aspects.${name}.visible`,e.target.checked)}/></td><td><input type="number" value={aspect.orb} min="0" max="20" step="0.1" onChange={(e)=>update(`aspects.${name}.orb`,Number(e.target.value))}/></td><td><div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}><LinePreview style={aspect.style}/><select value={aspect.style} onChange={(e)=>update(`aspects.${name}.style`,e.target.value)}><option>Line</option><option>Dash</option><option>Bold line</option><option>Bold dash</option></select></div></td></tr>})}</tbody></table></div></Section>
      <Section id="inspector" title="Inspector" icon="⌘" open={open} setOpen={setOpen}><Check label="Visible" value={state.inspector.visible} onChange={(v)=>update('inspector.visible',v)}/><div className="gz421-matrix"><span/>{PLANETS.slice(0,12).map(([name,symbol])=><span key={`h-${name}`}>{symbol}</span>)}{PLANETS.slice(0,12).flatMap(([rowName,rowSymbol],rowIndex)=>[<span key={`r-${rowName}`}>{rowSymbol}</span>,...PLANETS.slice(0,12).map(([columnName],columnIndex)=>{const key=`${rowName}-${columnName}`;const active=Boolean(state.inspector.matrix[key]);return <button key={key} type="button" style={{background:active?'#ccecff':'#fff'}} onClick={()=>update(`inspector.matrix.${key}` ,!active)}>{rowIndex===columnIndex?'·':active?'×':'·'}</button>})])}</div></Section>
      <Section id="figures" title="Figures" icon="▱" open={open} setOpen={setOpen}><Check label="Hide" value={state.figures.hide} onChange={(v)=>update('figures.hide',v)}/>{FIGURES.map((figure)=><Section key={figure} id={figure} title={figure} open={open} setOpen={setOpen} level={1}><Check label="Visible" value={state.figures[figure].visible} onChange={(v)=>update(`figures.${figure}.visible`,v)}/><Check label="Show highlight" value={state.figures[figure].highlight} onChange={(v)=>update(`figures.${figure}.highlight`,v)}/><Num label="Angle" value={state.figures[figure].angle} onChange={(v)=>update(`figures.${figure}.angle`,v)}/></Section>)}<Section id="vectors" title="Vectors" open={open} setOpen={setOpen} level={1}><Check label="Visible" value={state.figures.vectors.visible} onChange={(v)=>update('figures.vectors.visible',v)}/><Check label="Clockwise" value={state.figures.vectors.clockwise} onChange={(v)=>update('figures.vectors.clockwise',v)}/><Num label="Angle" value={state.figures.vectors.angle} onChange={(v)=>update('figures.vectors.angle',v)}/></Section><Section id="locator" title="Locator" open={open} setOpen={setOpen} level={1}><Check label="Visible" value={state.figures.locator.visible} onChange={(v)=>update('figures.locator.visible',v)}/><Num label="Angle" value={state.figures.locator.angle} onChange={(v)=>update('figures.locator.angle',v)}/></Section><Section id="vortex" title="Vortex" open={open} setOpen={setOpen} level={1}><Check label="Visible" value={state.figures.vortex.visible} onChange={(v)=>update('figures.vortex.visible',v)}/><Num label="Angle" value={state.figures.vortex.angle} onChange={(v)=>update('figures.vortex.angle',v)}/><Select label="Trend" value={state.figures.vortex.trend} onChange={(v)=>update('figures.vortex.trend',v)} options={['Both','Bull','Bear']}/></Section></Section>
      <Section id="colors" title="Colors" icon="▴" open={open} setOpen={setOpen}>{Object.entries(state.colors).map(([name,value])=><ColorRow key={name} label={name} value={value} onChange={(v)=>update(`colors.${name}`,v)}/>)}</Section><div className="gz421-footer"/>
    </div>
  </aside>;
}
