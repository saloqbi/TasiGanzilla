import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const BUILD = 326;
const HOST_ID = 'gannzilla-clean-property-panel-v325';
const STORAGE_KEY = 'tasi-gannzilla-canonical-panel-v326';
const OPEN_KEY = 'tasi-gannzilla-canonical-panel-open-v326';

const PLANETS = ['Sun', 'Earth', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ceres', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Eris'];
const PLANET_AR = {
  Sun: 'الشمس', Earth: 'الأرض', Moon: 'القمر', Mercury: 'عطارد', Venus: 'الزهرة', Mars: 'المريخ',
  Ceres: 'سيريس', Jupiter: 'المشتري', Saturn: 'زحل', Uranus: 'أورانوس', Neptune: 'نبتون', Pluto: 'بلوتو', Eris: 'إيريس',
};
const PLANET_SYMBOL = {
  Sun: '☉', Earth: '⊕', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Ceres: '⚳',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇', Eris: '⯰',
};
const ASPECTS = ['Conjunction', 'Semisextile', 'Semisquare', 'Sextile', 'Quadrature', 'Trine', 'Sesquisquare', 'Quincunx', 'Opposition'];
const ASPECT_AR = {
  Conjunction: 'الاقتران', Semisextile: 'نصف التسديس', Semisquare: 'نصف التربيع', Sextile: 'التسديس',
  Quadrature: 'التربيع', Trine: 'التثليث', Sesquisquare: 'التربيع ونصف', Quincunx: 'الكوينكونكس', Opposition: 'المقابلة',
};
const FIGURES = ['Triangle', 'Square', 'Pentagon', 'Hexagon', 'Septagon', 'Octagon', 'Nonagon', 'Decagon', 'Hendecagon', 'Dodecagon'];
const FIGURE_AR = {
  Triangle: 'المثلث', Square: 'المربع', Pentagon: 'الخماسي', Hexagon: 'السداسي', Septagon: 'السباعي',
  Octagon: 'الثماني', Nonagon: 'التساعي', Decagon: 'العشاري', Hendecagon: 'الحادي عشري', Dodecagon: 'الاثنا عشري',
};
const ZODIAC = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const ZODIAC_AR = {
  Aries: 'الحمل', Taurus: 'الثور', Gemini: 'الجوزاء', Cancer: 'السرطان', Leo: 'الأسد', Virgo: 'العذراء',
  Libra: 'الميزان', Scorpio: 'العقرب', Sagittarius: 'القوس', Capricorn: 'الجدي', Aquarius: 'الدلو', Pisces: 'الحوت',
};

const allPlanets = () => Object.fromEntries(PLANETS.map((planet) => [planet, true]));
const inspectorRows = () => Object.fromEntries(PLANETS.map((planet) => [planet, {
  sign: 'Aries', degree: 0, minute: 0, longitude: 0, motion: 'Direct', speed: 0,
}]));

const DEFAULT_STATE = {
  build: BUILD,
  layout: { visible: true, clockwise: true, size: 10, view: 36, dataType: 'Price' },
  price: { value: 79680, find: 1, increment: 1 },
  highlight: { visible: true, fill: 'Levels', showMarks: true, showNumbers: false },
  protractor: { visible: true, clockwise: true, angle: 0 },
  counter: { visible: false, clockwise: true, start: 1, step: 1, radius: 34, fontSize: 11 },
  secondaryScale: { visible: false, clockwise: true, start: 0, increment: 10, divisions: 36, radius: 60, fontSize: 10 },
  marker: { visible: false, angle: 0, radius: 0, shape: 'Triangle', color: '#e93020', lineWidth: 2, label: '' },
  chronometer: {
    visible: true, clockwise: true, angle: 0, range: 'Annual', secondaryScale: false, marker: false,
    session: { visible: false, start: '09:00', end: '18:00' },
  },
  cosmogram: {
    visible: false, clockwise: true, angle: 0, system: 'Geocentric',
    location: { country: 'United States', city: 'New York', timeZone: '-05:00', latitude: '40° 43′ North', longitude: '74° 1′ West' },
    moonPhases: { visible: true, solarEclipse: true, lunarEclipse: true, today: true, date: '31.12.2019', size: 10, offset: 28 },
    cycles: {
      tetragram: { visible: true, ruler: 'Sun', reverse: true, today: true, date: '31.12.2019' },
      pentagram: { visible: true, ruler: 'Sun', reverse: true, today: true, date: '31.12.2019' },
      hexagram: { visible: true, ruler: 'Sun', reverse: true, today: true, date: '31.12.2019' },
    },
    radix: {
      visible: false,
      price: { ticker: 'None', market: 'Closing price', mode: 'Whole number', multiplier: 1, divisor: 1, value: 0 },
      date: { today: true, value: '31.12.2019', increment: 1, period: 'Day' },
      time: { now: false, value: '00:00', increment: 1, period: 'Hour' },
      projections: allPlanets(), planets: allPlanets(), summary: { visible: true, include: allPlanets() }, average: { visible: true, include: allPlanets() },
    },
    transit: {
      visible: true,
      price: { ticker: 'None', market: 'Closing price', mode: 'Whole number', multiplier: 1, divisor: 1, value: 0 },
      date: { today: true, value: '31.12.2019', increment: 1, period: 'Day' },
      time: { now: false, value: '00:00', increment: 1, period: 'Hour' },
      projections: allPlanets(), planets: allPlanets(), summary: { visible: true, include: allPlanets() }, average: { visible: true, include: allPlanets() },
    },
    aspects: Object.fromEntries(ASPECTS.map((aspect, index) => [aspect, {
      visible: true, orb: index === 0 ? 5 : 1,
      style: ['Line', 'Dash', 'Bold dash', 'Bold line'][index % 4], include: allPlanets(),
    }])),
    inspector: { visible: true, rows: inspectorRows(), matrix: {} },
  },
  figures: {
    ...Object.fromEntries(FIGURES.map((figure) => [figure, { visible: false, showHighlight: true, angle: 0 }])),
    vectors: { visible: false, clockwise: true, angle: 0, values: { '23.6': true, '38.2': true, '50': true, '61.8': true, '100': true, '161.8': true, '261.8': true } },
    locator: { visible: false, angle: 181 },
    vortex: { visible: false, angle: 0, trend: 'Both', price: 1, date: '31.12.2019', time: '00:00', radius: 1 },
  },
  colors: {
    background: '#ffffff', grid: '#d7d7d2', marker: '#fff5d6', highlight: '#ececec', high: '#b7e4a8', low: '#fa8072', forecast: '#fff44f', error: '#555555',
    protractorCircle: '#ff0000', chronometerCircle: '#008000', fire: '#ff0000', earth: '#008000', air: '#dda0dd', water: '#0000ff',
    aspects: { Conjunction: '#6495ed', Semisextile: '#00ff00', Semisquare: '#ff7f50', Sextile: '#00ff00', Quadrature: '#ff7f50', Trine: '#00ff00', Sesquisquare: '#ff7f50', Quincunx: '#00ff00', Opposition: '#ff7f50' },
    figures: { Triangle: '#00ff00', Square: '#ff7f50', Pentagon: '#6495ed', Hexagon: '#00ffff', Septagon: '#e6e6fa', Octagon: '#df73ff', Nonagon: '#ed9121', Decagon: '#f2f27a', Hendecagon: '#c19a6b', Dodecagon: '#555555', Vectors: '#808080' },
    vortex: { bullTrend: '#50c878', bearTrend: '#ff007f', axes: '#555555' },
  },
};

const DEFAULT_OPEN = {
  layout: true, price: true, highlight: true, protractor: true, counter: false, secondaryScale: false, marker: false,
  chronometer: true, chronometerSession: false, cosmogram: true, location: true, moonPhases: true, cycles: true,
  radix: true, transit: true, aspects: true, inspector: true, figures: true, vectors: false, locator: false, vortex: false, colors: true,
};

const RENDERER_MAP = {
  'layout.visible': [0, 0], 'layout.clockwise': [0, 1], 'layout.size': [0, 2], 'layout.view': [0, 3], 'layout.dataType': [0, 4],
  'price.value': [1, 0], 'price.find': [1, 1], 'price.increment': [1, 2],
  'highlight.visible': [2, 0], 'highlight.fill': [2, 1], 'highlight.showMarks': [2, 2], 'highlight.showNumbers': [2, 3],
  'protractor.visible': [3, 0], 'protractor.clockwise': [3, 1], 'protractor.angle': [3, 2],
  'counter.visible': [4, 0], 'counter.clockwise': [4, 1], 'counter.start': [4, 2], 'counter.step': [4, 3], 'counter.radius': [4, 4], 'counter.fontSize': [4, 5],
  'secondaryScale.visible': [5, 0], 'secondaryScale.clockwise': [5, 1], 'secondaryScale.start': [5, 2], 'secondaryScale.increment': [5, 3], 'secondaryScale.divisions': [5, 4], 'secondaryScale.radius': [5, 5], 'secondaryScale.fontSize': [5, 6],
  'marker.visible': [6, 0], 'marker.angle': [6, 1], 'marker.radius': [6, 2], 'marker.shape': [6, 3], 'marker.color': [6, 4], 'marker.lineWidth': [6, 5], 'marker.label': [6, 6],
  'chronometer.visible': [7, 0], 'chronometer.clockwise': [7, 1], 'chronometer.angle': [7, 2], 'chronometer.range': [7, 3], 'chronometer.secondaryScale': [7, 4], 'chronometer.marker': [7, 5],
  'cosmogram.visible': [8, 0], 'cosmogram.clockwise': [8, 1], 'cosmogram.angle': [8, 2], 'cosmogram.system': [8, 3],
  'cosmogram.location.city': [9, 0], 'cosmogram.location.latitude': [9, 1], 'cosmogram.location.longitude': [9, 2],
  'cosmogram.moonPhases.visible': [10, 0], 'cosmogram.moonPhases.solarEclipse': [10, 1], 'cosmogram.moonPhases.size': [10, 2], 'cosmogram.moonPhases.offset': [10, 3],
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
function loadState() { try { return mergeDeep(DEFAULT_STATE, JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')); } catch (_) { return clone(DEFAULT_STATE); } }
function loadOpen() { try { return { ...DEFAULT_OPEN, ...JSON.parse(localStorage.getItem(OPEN_KEY) || '{}') }; } catch (_) { return { ...DEFAULT_OPEN }; } }

function findRendererAside() {
  return Array.from(document.querySelectorAll('aside')).find((aside) => aside.id !== HOST_ID && aside.querySelector('input,select')) || null;
}
function rendererControl(path) {
  const mapping = RENDERER_MAP[path]; const aside = findRendererAside(); if (!mapping || !aside) return null;
  const [sectionIndex, controlIndex] = mapping; const sections = Array.from(aside.children);
  return sections[sectionIndex]?.querySelectorAll('input,select')?.[controlIndex] || null;
}
function setNative(control, value) {
  if (!control) return false;
  if (control instanceof HTMLInputElement && control.type === 'checkbox') {
    const wanted = Boolean(value); if (control.checked !== wanted) control.click(); return control.checked === wanted;
  }
  const proto = control instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  const next = String(value ?? ''); if (setter) setter.call(control, next); else control.value = next;
  control.dispatchEvent(new Event('input', { bubbles: true })); control.dispatchEvent(new Event('change', { bubbles: true }));
  return String(control.value) === next;
}
function bridgeRenderer(path, value) {
  if (!RENDERER_MAP[path]) return false;
  const next = path === 'layout.view' ? Number(value) : value;
  const run = () => setNative(rendererControl(path), next);
  run(); requestAnimationFrame(run); setTimeout(run, 60); setTimeout(run, 220); return true;
}

const rowStyle = { display: 'grid', gridTemplateColumns: '48% 52%', minHeight: 29, alignItems: 'center', borderBottom: '1px solid #d4d4ce', background: '#f5f5f2' };
const inputStyle = { width: '100%', minHeight: 25, boxSizing: 'border-box', border: '1px solid #aaa', background: '#fff', color: '#111', font: 'inherit', padding: '2px 5px' };
function Section({ id, title, open, setOpen, children, accent = false, icon = '' }) {
  return <div data-section-id={id} style={{ borderBottom: '1px solid #c7c7bf' }}>
    <div onClick={() => setOpen(id, !open[id])} style={{ display: 'flex', gap: 5, alignItems: 'center', minHeight: 27, padding: '2px 6px', background: accent ? '#e8ead6' : '#efefe5', fontWeight: 800, cursor: 'pointer', userSelect: 'none' }}>
      <span style={{ width: 12, color: '#068b9a' }}>{open[id] ? '−' : '+'}</span><span style={{ flex: 1 }}>{title}</span><span style={{ opacity: 0.65 }}>{icon}</span>
    </div>{open[id] ? children : null}
  </div>;
}
function Row({ label, children }) { return <div style={rowStyle}><div style={{ padding: '3px 7px', fontWeight: 600 }}>{label}</div><div style={{ padding: '2px 6px' }}>{children}</div></div>; }
function Check({ label, value, onChange }) { return <Row label={label}><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} /></Row>; }
function Num({ label, value, onChange, min, max, step = 1 }) { return <Row label={label}><input style={inputStyle} type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} /></Row>; }
function Text({ label, value, onChange, type = 'text' }) { return <Row label={label}><input style={inputStyle} type={type} value={value} onChange={(event) => onChange(event.target.value)} /></Row>; }
function Select({ label, value, onChange, options }) { return <Row label={label}><select style={inputStyle} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value ?? option} value={option.value ?? option}>{option.label ?? option}</option>)}</select></Row>; }
function Color({ label, value, onChange }) { return <Row label={label}><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><input type="color" value={value} onChange={(event) => onChange(event.target.value)} /><code style={{ fontSize: 11 }}>{value}</code></div></Row>; }

function PlanetChecks({ path, state, update, ar }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 2, padding: 5, background: '#f3f3ef' }}>
    {PLANETS.map((planet) => <label key={planet} style={{ display: 'flex', gap: 4, alignItems: 'center', padding: 3, background: '#fff', border: '1px solid #ddd' }}><input type="checkbox" checked={Boolean(getPath(state, `${path}.${planet}`))} onChange={(event) => update(`${path}.${planet}`, event.target.checked)} /><span>{PLANET_SYMBOL[planet]} {ar ? PLANET_AR[planet] : planet}</span></label>)}
  </div>;
}

function ProfileSection({ prefix, title, state, update, open, setOpen, ar }) {
  const t = (a, e) => ar ? a : e;
  return <Section id={prefix} title={title} open={open} setOpen={setOpen} accent>
    <Check label={t('إظهار', 'Visible')} value={getPath(state, `${prefix}.visible`)} onChange={(v) => update(`${prefix}.visible`, v)} />
    <Section id={`${prefix}-price`} title={t('السعر', 'Price')} open={open} setOpen={setOpen}>
      <Select label={t('الرمز', 'Ticker')} value={getPath(state, `${prefix}.price.ticker`)} onChange={(v) => update(`${prefix}.price.ticker`, v)} options={['None', 'TASI', 'XAUUSD', 'BTCUSD']} />
      <Select label={t('السوق', 'Market')} value={getPath(state, `${prefix}.price.market`)} onChange={(v) => update(`${prefix}.price.market`, v)} options={['Closing price', 'Opening price', 'High', 'Low']} />
      <Select label={t('النمط', 'Mode')} value={getPath(state, `${prefix}.price.mode`)} onChange={(v) => update(`${prefix}.price.mode`, v)} options={['Whole number', 'Decimal', 'Digital root']} />
      <Num label={t('المضاعف', 'Multiplier')} value={getPath(state, `${prefix}.price.multiplier`)} onChange={(v) => update(`${prefix}.price.multiplier`, v)} />
      <Num label={t('القاسم', 'Divisor')} value={getPath(state, `${prefix}.price.divisor`)} onChange={(v) => update(`${prefix}.price.divisor`, v)} />
      <Num label={t('القيمة', 'Value')} value={getPath(state, `${prefix}.price.value`)} onChange={(v) => update(`${prefix}.price.value`, v)} />
    </Section>
    <Section id={`${prefix}-date`} title={t('التاريخ', 'Date')} open={open} setOpen={setOpen}>
      <Check label={t('اليوم', 'Today')} value={getPath(state, `${prefix}.date.today`)} onChange={(v) => update(`${prefix}.date.today`, v)} />
      <Text label={t('القيمة', 'Value')} value={getPath(state, `${prefix}.date.value`)} onChange={(v) => update(`${prefix}.date.value`, v)} />
      <Num label={t('الزيادة', 'Increment')} value={getPath(state, `${prefix}.date.increment`)} onChange={(v) => update(`${prefix}.date.increment`, v)} />
      <Select label={t('الفترة', 'Period')} value={getPath(state, `${prefix}.date.period`)} onChange={(v) => update(`${prefix}.date.period`, v)} options={['Day', 'Week', 'Month', 'Year']} />
    </Section>
    <Section id={`${prefix}-time`} title={t('الوقت', 'Time')} open={open} setOpen={setOpen}>
      <Check label={t('الآن', 'Now')} value={getPath(state, `${prefix}.time.now`)} onChange={(v) => update(`${prefix}.time.now`, v)} />
      <Text label={t('القيمة', 'Value')} value={getPath(state, `${prefix}.time.value`)} onChange={(v) => update(`${prefix}.time.value`, v)} />
      <Num label={t('الزيادة', 'Increment')} value={getPath(state, `${prefix}.time.increment`)} onChange={(v) => update(`${prefix}.time.increment`, v)} />
      <Select label={t('الفترة', 'Period')} value={getPath(state, `${prefix}.time.period`)} onChange={(v) => update(`${prefix}.time.period`, v)} options={['Minute', 'Hour', 'Day']} />
    </Section>
    <Section id={`${prefix}-projections`} title={t('الإسقاطات', 'Projections')} open={open} setOpen={setOpen}><PlanetChecks path={`${prefix}.projections`} state={state} update={update} ar={ar} /></Section>
    <Section id={`${prefix}-planets`} title={t('الكواكب', 'Planets')} open={open} setOpen={setOpen}><PlanetChecks path={`${prefix}.planets`} state={state} update={update} ar={ar} /></Section>
    <Section id={`${prefix}-summary`} title={t('المجموع', 'Summary')} open={open} setOpen={setOpen}><Check label={t('إظهار', 'Visible')} value={getPath(state, `${prefix}.summary.visible`)} onChange={(v) => update(`${prefix}.summary.visible`, v)} /><PlanetChecks path={`${prefix}.summary.include`} state={state} update={update} ar={ar} /></Section>
    <Section id={`${prefix}-average`} title={t('المتوسط', 'Average')} open={open} setOpen={setOpen}><Check label={t('إظهار', 'Visible')} value={getPath(state, `${prefix}.average.visible`)} onChange={(v) => update(`${prefix}.average.visible`, v)} /><PlanetChecks path={`${prefix}.average.include`} state={state} update={update} ar={ar} /></Section>
  </Section>;
}

export default function GannzillaCanonicalPropertyPanelV326() {
  const [host, setHost] = useState(null);
  const [state, setState] = useState(loadState);
  const [open, setOpenState] = useState(loadOpen);
  const fileRef = useRef(null);
  const ar = useMemo(() => { try { return new URLSearchParams(location.search).get('lang') !== 'en'; } catch (_) { return true; } }, []);
  const t = (a, e) => ar ? a : e;

  useEffect(() => { let cancelled = false; const find = () => { if (cancelled) return; const node = document.getElementById(HOST_ID); if (node) setHost(node); else setTimeout(find, 50); }; find(); return () => { cancelled = true; }; }, []);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); window.__gannzillaCanonicalPanelStateV326 = state; }, [state]);
  useEffect(() => { localStorage.setItem(OPEN_KEY, JSON.stringify(open)); }, [open]);
  const setOpen = (id, value) => setOpenState((current) => ({ ...current, [id]: value }));
  const update = (path, value) => { setState((current) => setPath(current, path, value)); bridgeRenderer(path, value); window.dispatchEvent(new CustomEvent('gannzilla:canonical-property-change-v326', { detail: { path, value } })); };

  useEffect(() => {
    const sync = () => Object.keys(RENDERER_MAP).forEach((path) => bridgeRenderer(path, getPath(state, path)));
    const timers = [120, 400, 900].map((delay) => setTimeout(sync, delay));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    window.GANNZILLA_CANONICAL_PROPERTY_PANEL_V326 = true;
    window.__auditGannzillaFullPropertyPanelV326 = () => {
      const panel = document.querySelector('.gannzilla-canonical-property-panel-v326');
      const sectionIds = panel ? Array.from(panel.querySelectorAll('[data-section-id]')).map((node) => node.dataset.sectionId) : [];
      return {
        ok: Boolean(panel) && new Set(sectionIds).size === sectionIds.length,
        build: BUILD,
        cleanPanelOnly: true,
        legacyPanelVisibleCount: Array.from(document.querySelectorAll('aside')).filter((aside) => aside.id !== HOST_ID && getComputedStyle(aside).display !== 'none').length,
        sectionsRendered: sectionIds.length,
        duplicateSections: sectionIds.length - new Set(sectionIds).size,
        stateBackedSections: ['Layout', 'Price', 'Highlight', 'Protractor', 'Counter', 'Secondary scale', 'Marker', 'Chronometer', 'Cosmogram', 'Cycles', 'Radix', 'Transit', 'Aspects', 'Inspector', 'Figures', 'Colors'],
        rendererWiredSections: ['Layout', 'Price', 'Highlight', 'Protractor', 'Counter', 'Secondary scale', 'Marker', 'Chronometer', 'Cosmogram', 'Location', 'Moon phases'],
        persistenceEnabled: true,
        singleVisiblePanelAuthority: true,
      };
    };
    return () => { delete window.GANNZILLA_CANONICAL_PROPERTY_PANEL_V326; delete window.__auditGannzillaFullPropertyPanelV326; delete window.__gannzillaCanonicalPanelStateV326; };
  }, []);

  if (!host) return null;

  const reset = () => { const next = clone(DEFAULT_STATE); setState(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };
  const exportState = () => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `tasi-gannzilla-v326-${Date.now()}.json`; anchor.click(); URL.revokeObjectURL(url); };
  const importState = async (file) => { if (!file) return; try { setState(mergeDeep(DEFAULT_STATE, JSON.parse(await file.text()))); } catch (_) { alert(t('ملف غير صالح', 'Invalid file')); } };

  return createPortal(<div className="gannzilla-canonical-property-panel-v326" dir={ar ? 'rtl' : 'ltr'} style={{ width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden', background: '#f2f2ee', color: '#222', fontFamily: 'Tahoma, Segoe UI, Arial, sans-serif', fontSize: 13, lineHeight: 1.35 }}>
    <div style={{ position: 'sticky', top: 0, zIndex: 5, display: 'flex', alignItems: 'center', gap: 4, minHeight: 30, padding: '2px 6px', background: '#e6ead5', borderBottom: '1px solid #b9bda8', fontWeight: 900 }}>
      <span style={{ flex: 1 }}>{t('افتراضي', 'Default')}</span>
      <button type="button" onClick={exportState} title={t('تصدير', 'Export')}>💾</button>
      <button type="button" onClick={() => fileRef.current?.click()} title={t('استيراد', 'Import')}>📂</button>
      <button type="button" onClick={reset} title={t('إعادة ضبط', 'Reset')}>↺</button>
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={(event) => importState(event.target.files?.[0])} />
    </div>

    <Section id="layout" title={t('التخطيط', 'Layout')} open={open} setOpen={setOpen} accent>
      <Check label={t('إظهار', 'Visible')} value={state.layout.visible} onChange={(v) => update('layout.visible', v)} />
      <Check label={t('مع عقارب الساعة', 'Clockwise')} value={state.layout.clockwise} onChange={(v) => update('layout.clockwise', v)} />
      <Num label={t('الحجم', 'Size')} value={state.layout.size} min={1} max={12} onChange={(v) => update('layout.size', v)} />
      <Select label={t('العرض', 'View')} value={state.layout.view} onChange={(v) => update('layout.view', Number(v))} options={[12, 24, 36, 60, 90, 360].map((value) => ({ value, label: t(`دائرة من ${value} قسمًا`, `Circle of ${value}`) }))} />
      <Select label={t('نوع البيانات', 'Data type')} value={state.layout.dataType} onChange={(v) => update('layout.dataType', v)} options={['Price', 'Date', 'Time', 'Angle']} />
    </Section>

    <Section id="price" title={t('السعر', 'Price')} open={open} setOpen={setOpen} icon="●">
      <Num label={t('القيمة', 'Value')} value={state.price.value} onChange={(v) => update('price.value', v)} />
      <Num label={t('بحث', 'Find')} value={state.price.find} onChange={(v) => update('price.find', v)} />
      <Num label={t('الزيادة', 'Increment')} value={state.price.increment} step={0.1} onChange={(v) => update('price.increment', v)} />
    </Section>

    <Section id="highlight" title={t('التمييز', 'Highlight')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={state.highlight.visible} onChange={(v) => update('highlight.visible', v)} />
      <Select label={t('التعبئة', 'Fill')} value={state.highlight.fill} onChange={(v) => update('highlight.fill', v)} options={['Levels', 'Cell']} />
      <Check label={t('إظهار العلامات', 'Show marks')} value={state.highlight.showMarks} onChange={(v) => update('highlight.showMarks', v)} />
      <Check label={t('إظهار الأرقام', 'Show numbers')} value={state.highlight.showNumbers} onChange={(v) => update('highlight.showNumbers', v)} />
    </Section>

    <Section id="protractor" title={t('المنقلة', 'Protractor')} open={open} setOpen={setOpen} accent>
      <Check label={t('إظهار', 'Visible')} value={state.protractor.visible} onChange={(v) => update('protractor.visible', v)} />
      <Check label={t('مع عقارب الساعة', 'Clockwise')} value={state.protractor.clockwise} onChange={(v) => update('protractor.clockwise', v)} />
      <Num label={t('الزاوية', 'Angle')} value={state.protractor.angle} min={-360} max={360} onChange={(v) => update('protractor.angle', v)} />
    </Section>

    <Section id="counter" title={t('العداد', 'Counter')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={state.counter.visible} onChange={(v) => update('counter.visible', v)} />
      <Check label={t('مع عقارب الساعة', 'Clockwise')} value={state.counter.clockwise} onChange={(v) => update('counter.clockwise', v)} />
      <Num label={t('البداية', 'Start')} value={state.counter.start} onChange={(v) => update('counter.start', v)} />
      <Num label={t('الخطوة', 'Step')} value={state.counter.step} onChange={(v) => update('counter.step', v)} />
      <Num label={t('نصف القطر', 'Radius')} value={state.counter.radius} min={0} max={180} onChange={(v) => update('counter.radius', v)} />
      <Num label={t('حجم الخط', 'Font size')} value={state.counter.fontSize} min={7} max={24} onChange={(v) => update('counter.fontSize', v)} />
    </Section>

    <Section id="secondaryScale" title={t('المقياس الثانوي', 'Secondary scale')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={state.secondaryScale.visible} onChange={(v) => update('secondaryScale.visible', v)} />
      <Check label={t('مع عقارب الساعة', 'Clockwise')} value={state.secondaryScale.clockwise} onChange={(v) => update('secondaryScale.clockwise', v)} />
      <Num label={t('البداية', 'Start')} value={state.secondaryScale.start} onChange={(v) => update('secondaryScale.start', v)} />
      <Num label={t('الزيادة', 'Increment')} value={state.secondaryScale.increment} onChange={(v) => update('secondaryScale.increment', v)} />
      <Num label={t('الأقسام', 'Divisions')} value={state.secondaryScale.divisions} min={3} max={360} onChange={(v) => update('secondaryScale.divisions', v)} />
      <Num label={t('نصف القطر', 'Radius')} value={state.secondaryScale.radius} min={0} max={220} onChange={(v) => update('secondaryScale.radius', v)} />
      <Num label={t('حجم الخط', 'Font size')} value={state.secondaryScale.fontSize} min={7} max={24} onChange={(v) => update('secondaryScale.fontSize', v)} />
    </Section>

    <Section id="marker" title={t('المؤشر', 'Marker')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={state.marker.visible} onChange={(v) => update('marker.visible', v)} />
      <Num label={t('الزاوية', 'Angle')} value={state.marker.angle} min={-360} max={360} onChange={(v) => update('marker.angle', v)} />
      <Num label={t('نصف القطر', 'Radius')} value={state.marker.radius} min={0} max={1600} onChange={(v) => update('marker.radius', v)} />
      <Select label={t('الشكل', 'Shape')} value={state.marker.shape} onChange={(v) => update('marker.shape', v)} options={['Triangle', 'Circle', 'Square']} />
      <Color label={t('اللون', 'Color')} value={state.marker.color} onChange={(v) => update('marker.color', v)} />
      <Num label={t('عرض الخط', 'Line width')} value={state.marker.lineWidth} min={1} max={10} onChange={(v) => update('marker.lineWidth', v)} />
      <Text label={t('التسمية', 'Label')} value={state.marker.label} onChange={(v) => update('marker.label', v)} />
    </Section>

    <Section id="chronometer" title={t('مقياس الزمن', 'Chronometer')} open={open} setOpen={setOpen} accent>
      <Check label={t('إظهار', 'Visible')} value={state.chronometer.visible} onChange={(v) => update('chronometer.visible', v)} />
      <Check label={t('مع عقارب الساعة', 'Clockwise')} value={state.chronometer.clockwise} onChange={(v) => update('chronometer.clockwise', v)} />
      <Num label={t('الزاوية', 'Angle')} value={state.chronometer.angle} min={-360} max={360} onChange={(v) => update('chronometer.angle', v)} />
      <Select label={t('المدى', 'Range')} value={state.chronometer.range} onChange={(v) => update('chronometer.range', v)} options={['Annual', 'Monthly', 'Weekly', 'Daily']} />
      <Check label={t('المقياس الثانوي', 'Secondary scale')} value={state.chronometer.secondaryScale} onChange={(v) => update('chronometer.secondaryScale', v)} />
      <Check label={t('المؤشر', 'Marker')} value={state.chronometer.marker} onChange={(v) => update('chronometer.marker', v)} />
    </Section>
    <Section id="chronometerSession" title={t('جلسة التداول', 'Trading session')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={state.chronometer.session.visible} onChange={(v) => update('chronometer.session.visible', v)} />
      <Text label={t('البداية', 'Start')} type="time" value={state.chronometer.session.start} onChange={(v) => update('chronometer.session.start', v)} />
      <Text label={t('النهاية', 'End')} type="time" value={state.chronometer.session.end} onChange={(v) => update('chronometer.session.end', v)} />
    </Section>

    <Section id="cosmogram" title={t('الخريطة الفلكية', 'Cosmogram')} open={open} setOpen={setOpen} accent>
      <Check label={t('إظهار', 'Visible')} value={state.cosmogram.visible} onChange={(v) => update('cosmogram.visible', v)} />
      <Check label={t('مع عقارب الساعة', 'Clockwise')} value={state.cosmogram.clockwise} onChange={(v) => update('cosmogram.clockwise', v)} />
      <Num label={t('الزاوية', 'Angle')} value={state.cosmogram.angle} min={-360} max={360} onChange={(v) => update('cosmogram.angle', v)} />
      <Select label={t('النظام', 'System')} value={state.cosmogram.system} onChange={(v) => update('cosmogram.system', v)} options={['Geocentric', 'Heliocentric']} />
    </Section>
    <Section id="location" title={t('الموقع', 'Location')} open={open} setOpen={setOpen}>
      <Text label={t('الدولة', 'Country')} value={state.cosmogram.location.country} onChange={(v) => update('cosmogram.location.country', v)} />
      <Text label={t('المدينة', 'City')} value={state.cosmogram.location.city} onChange={(v) => update('cosmogram.location.city', v)} />
      <Text label={t('المنطقة الزمنية', 'Time zone')} value={state.cosmogram.location.timeZone} onChange={(v) => update('cosmogram.location.timeZone', v)} />
      <Text label={t('خط العرض', 'Latitude')} value={state.cosmogram.location.latitude} onChange={(v) => update('cosmogram.location.latitude', v)} />
      <Text label={t('خط الطول', 'Longitude')} value={state.cosmogram.location.longitude} onChange={(v) => update('cosmogram.location.longitude', v)} />
    </Section>
    <Section id="moonPhases" title={t('أطوار القمر', 'Moon phases')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={state.cosmogram.moonPhases.visible} onChange={(v) => update('cosmogram.moonPhases.visible', v)} />
      <Check label={t('كسوف الشمس', 'Solar eclipse')} value={state.cosmogram.moonPhases.solarEclipse} onChange={(v) => update('cosmogram.moonPhases.solarEclipse', v)} />
      <Check label={t('خسوف القمر', 'Lunar eclipse')} value={state.cosmogram.moonPhases.lunarEclipse} onChange={(v) => update('cosmogram.moonPhases.lunarEclipse', v)} />
      <Check label={t('اليوم', 'Today')} value={state.cosmogram.moonPhases.today} onChange={(v) => update('cosmogram.moonPhases.today', v)} />
      <Text label={t('التاريخ', 'Date')} value={state.cosmogram.moonPhases.date} onChange={(v) => update('cosmogram.moonPhases.date', v)} />
      <Num label={t('الحجم', 'Size')} value={state.cosmogram.moonPhases.size} min={6} max={30} onChange={(v) => update('cosmogram.moonPhases.size', v)} />
      <Num label={t('الإزاحة', 'Offset')} value={state.cosmogram.moonPhases.offset} min={0} max={180} onChange={(v) => update('cosmogram.moonPhases.offset', v)} />
    </Section>

    <Section id="cycles" title={t('الدورات', 'Cycles')} open={open} setOpen={setOpen} accent>
      {['tetragram', 'pentagram', 'hexagram'].map((cycle) => <Section key={cycle} id={`cycle-${cycle}`} title={t(cycle === 'tetragram' ? 'الرباعي' : cycle === 'pentagram' ? 'الخماسي' : 'السداسي', cycle)} open={open} setOpen={setOpen}>
        <Check label={t('إظهار', 'Visible')} value={state.cosmogram.cycles[cycle].visible} onChange={(v) => update(`cosmogram.cycles.${cycle}.visible`, v)} />
        <Select label={t('الكوكب الحاكم', 'Ruler')} value={state.cosmogram.cycles[cycle].ruler} onChange={(v) => update(`cosmogram.cycles.${cycle}.ruler`, v)} options={PLANETS} />
        <Check label={t('عكس الاتجاه', 'Reverse')} value={state.cosmogram.cycles[cycle].reverse} onChange={(v) => update(`cosmogram.cycles.${cycle}.reverse`, v)} />
        <Check label={t('اليوم', 'Today')} value={state.cosmogram.cycles[cycle].today} onChange={(v) => update(`cosmogram.cycles.${cycle}.today`, v)} />
        <Text label={t('التاريخ', 'Date')} value={state.cosmogram.cycles[cycle].date} onChange={(v) => update(`cosmogram.cycles.${cycle}.date`, v)} />
      </Section>)}
    </Section>

    <ProfileSection prefix="cosmogram.radix" title={t('الخريطة الأصلية', 'Radix')} state={state} update={update} open={open} setOpen={setOpen} ar={ar} />
    <ProfileSection prefix="cosmogram.transit" title={t('الحركة الحالية', 'Transit')} state={state} update={update} open={open} setOpen={setOpen} ar={ar} />

    <Section id="aspects" title={t('الزوايا الفلكية', 'Aspects')} open={open} setOpen={setOpen} accent>
      {ASPECTS.map((aspect) => <Section key={aspect} id={`aspect-${aspect}`} title={ar ? ASPECT_AR[aspect] : aspect} open={open} setOpen={setOpen}>
        <Check label={t('إظهار', 'Visible')} value={state.cosmogram.aspects[aspect].visible} onChange={(v) => update(`cosmogram.aspects.${aspect}.visible`, v)} />
        <Num label={t('هامش الزاوية', 'Orb')} value={state.cosmogram.aspects[aspect].orb} min={0} max={15} step={0.1} onChange={(v) => update(`cosmogram.aspects.${aspect}.orb`, v)} />
        <Select label={t('نمط الخط', 'Line style')} value={state.cosmogram.aspects[aspect].style} onChange={(v) => update(`cosmogram.aspects.${aspect}.style`, v)} options={['Line', 'Dash', 'Bold line', 'Bold dash']} />
        <PlanetChecks path={`cosmogram.aspects.${aspect}.include`} state={state} update={update} ar={ar} />
      </Section>)}
    </Section>

    <Section id="inspector" title={t('المفتش', 'Inspector')} open={open} setOpen={setOpen} accent>
      <Check label={t('إظهار', 'Visible')} value={state.cosmogram.inspector.visible} onChange={(v) => update('cosmogram.inspector.visible', v)} />
      <div style={{ overflowX: 'auto', background: '#fff' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}><thead><tr>{[t('الكوكب', 'Planet'), t('البرج', 'Sign'), t('الدرجة', 'Degree'), t('الدقيقة', 'Minute'), t('الطول', 'Longitude'), t('الحركة', 'Motion')].map((head) => <th key={head} style={{ border: '1px solid #ccc', padding: 3 }}>{head}</th>)}</tr></thead><tbody>{PLANETS.map((planet) => { const row = state.cosmogram.inspector.rows[planet]; return <tr key={planet}><td style={{ border: '1px solid #ddd', padding: 3 }}>{PLANET_SYMBOL[planet]} {ar ? PLANET_AR[planet] : planet}</td><td><select value={row.sign} onChange={(e) => update(`cosmogram.inspector.rows.${planet}.sign`, e.target.value)}>{ZODIAC.map((sign) => <option key={sign} value={sign}>{ar ? ZODIAC_AR[sign] : sign}</option>)}</select></td><td><input style={{ width: 42 }} type="number" value={row.degree} onChange={(e) => update(`cosmogram.inspector.rows.${planet}.degree`, Number(e.target.value))} /></td><td><input style={{ width: 42 }} type="number" value={row.minute} onChange={(e) => update(`cosmogram.inspector.rows.${planet}.minute`, Number(e.target.value))} /></td><td><input style={{ width: 55 }} type="number" value={row.longitude} onChange={(e) => update(`cosmogram.inspector.rows.${planet}.longitude`, Number(e.target.value))} /></td><td><select value={row.motion} onChange={(e) => update(`cosmogram.inspector.rows.${planet}.motion`, e.target.value)}><option>Direct</option><option>Retrograde</option><option>Stationary</option></select></td></tr>; })}</tbody></table></div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${PLANETS.length}, 18px)`, gap: 1, padding: 5, justifyContent: 'center', background: '#f5f5f0' }}>{PLANETS.flatMap((rowPlanet) => PLANETS.map((columnPlanet) => { const key = `${rowPlanet}-${columnPlanet}`; return <button key={key} type="button" title={key} onClick={() => update(`cosmogram.inspector.matrix.${key}`, !state.cosmogram.inspector.matrix[key])} style={{ width: 18, height: 18, padding: 0, border: '1px solid #ccc', background: state.cosmogram.inspector.matrix[key] ? '#c8e6ff' : '#fff', fontSize: 9 }}>{rowPlanet === columnPlanet ? PLANET_SYMBOL[rowPlanet] : '·'}</button>; }))}</div>
    </Section>

    <Section id="figures" title={t('الأشكال', 'Figures')} open={open} setOpen={setOpen} accent>
      {FIGURES.map((figure) => <Section key={figure} id={`figure-${figure}`} title={ar ? FIGURE_AR[figure] : figure} open={open} setOpen={setOpen}>
        <Check label={t('إظهار', 'Visible')} value={state.figures[figure].visible} onChange={(v) => update(`figures.${figure}.visible`, v)} />
        <Check label={t('إظهار التمييز', 'Show highlight')} value={state.figures[figure].showHighlight} onChange={(v) => update(`figures.${figure}.showHighlight`, v)} />
        <Num label={t('زاوية الدوران', 'Rotation angle')} value={state.figures[figure].angle} min={-360} max={360} onChange={(v) => update(`figures.${figure}.angle`, v)} />
      </Section>)}
    </Section>
    <Section id="vectors" title={t('المتجهات', 'Vectors')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={state.figures.vectors.visible} onChange={(v) => update('figures.vectors.visible', v)} />
      <Check label={t('مع عقارب الساعة', 'Clockwise')} value={state.figures.vectors.clockwise} onChange={(v) => update('figures.vectors.clockwise', v)} />
      <Num label={t('الزاوية', 'Angle')} value={state.figures.vectors.angle} onChange={(v) => update('figures.vectors.angle', v)} />
      {Object.keys(state.figures.vectors.values).map((ratio) => <Check key={ratio} label={ratio} value={state.figures.vectors.values[ratio]} onChange={(v) => update(`figures.vectors.values.${ratio}`, v)} />)}
    </Section>
    <Section id="locator" title={t('محدد الموقع', 'Locator')} open={open} setOpen={setOpen}><Check label={t('إظهار', 'Visible')} value={state.figures.locator.visible} onChange={(v) => update('figures.locator.visible', v)} /><Num label={t('الزاوية', 'Angle')} value={state.figures.locator.angle} onChange={(v) => update('figures.locator.angle', v)} /></Section>
    <Section id="vortex" title={t('الدوامة', 'Vortex')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={state.figures.vortex.visible} onChange={(v) => update('figures.vortex.visible', v)} />
      <Num label={t('الزاوية', 'Angle')} value={state.figures.vortex.angle} onChange={(v) => update('figures.vortex.angle', v)} />
      <Select label={t('الاتجاه', 'Trend')} value={state.figures.vortex.trend} onChange={(v) => update('figures.vortex.trend', v)} options={['Both', 'Bull', 'Bear']} />
      <Num label={t('السعر', 'Price')} value={state.figures.vortex.price} onChange={(v) => update('figures.vortex.price', v)} />
      <Text label={t('التاريخ', 'Date')} value={state.figures.vortex.date} onChange={(v) => update('figures.vortex.date', v)} />
      <Text label={t('الوقت', 'Time')} value={state.figures.vortex.time} onChange={(v) => update('figures.vortex.time', v)} />
      <Num label={t('نصف القطر', 'Radius')} value={state.figures.vortex.radius} onChange={(v) => update('figures.vortex.radius', v)} />
    </Section>

    <Section id="colors" title={t('الألوان', 'Colors')} open={open} setOpen={setOpen} accent>
      {['background', 'grid', 'marker', 'highlight', 'high', 'low', 'forecast', 'error', 'protractorCircle', 'chronometerCircle', 'fire', 'earth', 'air', 'water'].map((key) => <Color key={key} label={key} value={state.colors[key]} onChange={(v) => update(`colors.${key}`, v)} />)}
      <Section id="colors-aspects" title={t('ألوان الزوايا', 'Aspect colors')} open={open} setOpen={setOpen}>{ASPECTS.map((aspect) => <Color key={aspect} label={ar ? ASPECT_AR[aspect] : aspect} value={state.colors.aspects[aspect]} onChange={(v) => update(`colors.aspects.${aspect}`, v)} />)}</Section>
      <Section id="colors-figures" title={t('ألوان الأشكال', 'Figure colors')} open={open} setOpen={setOpen}>{[...FIGURES, 'Vectors'].map((figure) => <Color key={figure} label={ar ? FIGURE_AR[figure] || 'المتجهات' : figure} value={state.colors.figures[figure]} onChange={(v) => update(`colors.figures.${figure}`, v)} />)}</Section>
      <Section id="colors-vortex" title={t('ألوان الدوامة', 'Vortex colors')} open={open} setOpen={setOpen}><Color label={t('الاتجاه الصاعد', 'Bull trend')} value={state.colors.vortex.bullTrend} onChange={(v) => update('colors.vortex.bullTrend', v)} /><Color label={t('الاتجاه الهابط', 'Bear trend')} value={state.colors.vortex.bearTrend} onChange={(v) => update('colors.vortex.bearTrend', v)} /><Color label={t('المحاور', 'Axes')} value={state.colors.vortex.axes} onChange={(v) => update('colors.vortex.axes', v)} /></Section>
    </Section>
  </div>, host);
}
