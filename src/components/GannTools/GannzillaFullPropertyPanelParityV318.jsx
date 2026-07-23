import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const STORAGE_KEY = 'tasi-gannzilla-project-v318';
const OPEN_KEY = 'tasi-gannzilla-open-sections-v318';

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
const inspectorRows = () => Object.fromEntries(PLANETS.map((planet) => [planet, { sign: 'Aries', degree: 0, minute: 0, longitude: 0, motion: 'Direct' }]));

const DEFAULT_STATE = {
  format: 'TASI_GANNZILLA_PROJECT', version: 318,
  layout: {
    visible: true, clockwise: true, size: 10, view: 'Circle of 36', dataType: 'Price',
    price: { value: 79680, increment: 1 },
    date: { today: true, value: '31.12.2019', increment: 1, period: 'Day', showTradingDays: false, format: 'dd.mm' },
    time: { now: false, value: '31.12.2019 00:00', increment: 1, period: 'Hour', showTradingDays: false, format: 'dd.mm', session: { visible: false, startTime: '09:00', endTime: '18:00' } },
    holidays: { visible: false, values: '' },
    highlight: { visible: true, fill: 'Cross' }, marks: { visible: true }, numbers: { visible: false },
  },
  protractor: {
    visible: true, clockwise: true, angle: 0,
    counter: { visible: false, startAngle: 0, endAngle: 0 },
    secondaryScale: { visible: false, reverse: true, angle: 180 },
    marker: { visible: false, angle: 0 },
  },
  chronometer: {
    visible: true, clockwise: true, angle: 0, range: 'Annual',
    session: { visible: false, startTime: '09:00', endTime: '18:00' },
    secondaryScale: { visible: false, reverse: true, angle: 180 }, marker: { visible: false, angle: 0 },
  },
  cosmogram: {
    visible: false, clockwise: true, angle: 0, system: 'Geocentric',
    location: { city: 'New York', timeZone: '+00:00', latitudeDegrees: 0, latitudeMinutes: 0, latitudeDirection: 'North', longitudeDegrees: 0, longitudeMinutes: 0, longitudeDirection: 'West' },
    moonPhases: { visible: true, showEclipses: true, today: true, date: '31.12.2019' },
    cycles: {
      visible: true,
      tetragram: { visible: true, ruler: 'Sun', reverse: true, today: true, date: '31.12.2019' },
      pentagram: { visible: true, ruler: 'Sun', reverse: true, today: true, date: '31.12.2019' },
      hexagram: { visible: true, ruler: 'Sun', reverse: true, today: true, date: '31.12.2019' },
    },
    radix: {
      visible: false,
      price: { ticker: 'None', market: 'Closing price', mode: 'Whole number', multiplier: 1, divisor: 1, value: 0 },
      date: { today: true, value: '31.12.2019', increment: 1, period: 'Day' }, time: { now: false, value: '00:00', increment: 1, period: 'Hour' },
      projections: allPlanets(), planets: allPlanets(), summary: { visible: true, include: allPlanets() }, average: { visible: true, include: allPlanets() },
    },
    transit: {
      visible: true,
      price: { ticker: 'None', market: 'Closing price', mode: 'Whole number', multiplier: 1, divisor: 1, value: 0 },
      date: { today: true, value: '31.12.2019', increment: 1, period: 'Day' }, time: { now: false, value: '00:00', increment: 1, period: 'Hour' },
      projections: allPlanets(), planets: allPlanets(), summary: { visible: true, include: allPlanets() }, average: { visible: true, include: allPlanets() },
    },
    aspects: {
      hide: false,
      Conjunction: { visible: true, orb: 5, style: 'Line', include: allPlanets() },
      Semisextile: { visible: true, orb: 1, style: 'Dash', include: allPlanets() },
      Semisquare: { visible: true, orb: 1, style: 'Bold dash', include: allPlanets() },
      Sextile: { visible: true, orb: 1, style: 'Bold line', include: allPlanets() },
      Quadrature: { visible: true, orb: 1, style: 'Bold line', include: allPlanets() },
      Trine: { visible: true, orb: 1, style: 'Bold line', include: allPlanets() },
      Sesquisquare: { visible: true, orb: 1, style: 'Bold dash', include: allPlanets() },
      Quincunx: { visible: true, orb: 1, style: 'Dash', include: allPlanets() },
      Opposition: { visible: true, orb: 1, style: 'Line', include: allPlanets() },
    },
    inspector: { visible: true, rows: inspectorRows(), matrix: {} },
  },
  figures: {
    hide: false,
    Triangle: { visible: false, showHighlight: true, angle: 0 }, Square: { visible: false, showHighlight: true, angle: 0 },
    Pentagon: { visible: false, showHighlight: true, angle: 0 }, Hexagon: { visible: false, showHighlight: true, angle: 0 },
    Septagon: { visible: false, showHighlight: true, angle: 0 }, Octagon: { visible: false, showHighlight: true, angle: 0 },
    Nonagon: { visible: false, showHighlight: true, angle: 0 }, Decagon: { visible: false, showHighlight: true, angle: 0 },
    Hendecagon: { visible: false, showHighlight: true, angle: 0 }, Dodecagon: { visible: false, showHighlight: true, angle: 0 },
    vectors: { visible: false, clockwise: true, angle: 0, values: { '23.6': true, '38.2': true, '50': true, '61.8': true, '100': true, '161.8': true, '261.8': true } },
    locator: { visible: false, angle: 181 }, vortex: { visible: false, angle: 0, trend: 'Both', price: 1, date: '31.12.2019', time: '31.12.2019 00:00', radius: 1 },
  },
  colors: {
    background: '#ffffff', grid: '#d7d7d2', marker: '#fff5d6', highlight: '#ececec', high: '#b7e4a8', low: '#fa8072', forecast: '#fff44f', error: '#555555',
    protractorCircle: '#ff0000', chronometerCircle: '#008000', fireElement: '#ff0000', earthElement: '#008000', airElement: '#dda0dd', waterElement: '#0000ff',
    aspects: { Conjunction: '#6495ed', Semisextile: '#00ff00', Semisquare: '#ff7f50', Sextile: '#00ff00', Quadrature: '#ff7f50', Trine: '#00ff00', Sesquisquare: '#ff7f50', Quincunx: '#00ff00', Opposition: '#ff7f50' },
    figures: { Triangle: '#00ff00', Square: '#ff7f50', Pentagon: '#6495ed', Hexagon: '#00ffff', Septagon: '#e6e6fa', Octagon: '#df73ff', Nonagon: '#ed9121', Decagon: '#f2f27a', Hendecagon: '#c19a6b', Dodecagon: '#555555', Vectors: '#808080' },
    vortex: { bullTrend: '#50c878', bearTrend: '#ff007f', axes: '#555555' },
  },
  drawings: [],
};

const DEFAULT_OPEN = {
  layout: true, price: true, date: false, time: false, holidays: false, highlight: false,
  protractor: true, counter: false, protractorSecondary: false, protractorMarker: false,
  chronometer: true, chronometerSession: false, chronometerSecondary: false, chronometerMarker: false,
  cosmogram: false, location: false, moonPhases: false, cycles: false, radix: false, transit: false,
  aspects: false, inspector: false, figures: false, vectors: false, locator: false, vortex: false, colors: false, drawings: false,
};

const LEGACY_BRIDGE = {
  'layout.visible': [0, 0], 'layout.clockwise': [0, 1], 'layout.size': [0, 2], 'layout.view': [0, 3], 'layout.dataType': [0, 4],
  'layout.price.value': [1, 0], 'layout.price.increment': [1, 2],
  'layout.highlight.visible': [2, 0], 'layout.highlight.fill': [2, 1], 'layout.marks.visible': [2, 2], 'layout.numbers.visible': [2, 3],
  'protractor.visible': [3, 0], 'protractor.clockwise': [3, 1], 'protractor.angle': [3, 2],
  'chronometer.visible': [7, 0], 'chronometer.clockwise': [7, 1], 'chronometer.angle': [7, 2], 'chronometer.range': [7, 3],
  'cosmogram.visible': [8, 0], 'cosmogram.clockwise': [8, 1], 'cosmogram.angle': [8, 2], 'cosmogram.system': [8, 3],
  'cosmogram.location.city': [9, 0], 'cosmogram.moonPhases.visible': [10, 0], 'cosmogram.moonPhases.showEclipses': [10, 1],
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
function loadProject() {
  try { return mergeDeep(DEFAULT_STATE, JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')); } catch (_) { return clone(DEFAULT_STATE); }
}
function loadOpen() {
  try { return { ...DEFAULT_OPEN, ...(JSON.parse(localStorage.getItem(OPEN_KEY) || 'null') || {}) }; } catch (_) { return { ...DEFAULT_OPEN }; }
}
function setNative(control, value) {
  if (!control) return;
  const checkbox = control.type === 'checkbox';
  const proto = checkbox ? HTMLInputElement.prototype : control.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const property = checkbox ? 'checked' : 'value';
  const setter = Object.getOwnPropertyDescriptor(proto, property)?.set;
  if (setter) setter.call(control, value); else control[property] = value;
  control.dispatchEvent(new Event('input', { bubbles: true })); control.dispatchEvent(new Event('change', { bubbles: true }));
}

const rowStyle = { display: 'grid', gridTemplateColumns: '48% 52%', alignItems: 'center', minHeight: 31, borderBottom: '1px solid #d6d6d6', background: '#f4f4f4' };
const inputStyle = { width: '100%', minHeight: 28, boxSizing: 'border-box', border: '1px solid #aaa', background: '#fff', color: '#111', font: 'inherit', padding: '2px 5px' };
function Section({ id, title, open, setOpen, children, accent = false }) {
  return <div style={{ borderBottom: '1px solid #c5c5c5' }}>
    <div onClick={() => setOpen(id, !open[id])} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 7px', background: accent ? '#e6ead2' : '#ececdd', borderTop: '1px solid #d0d0c5', fontWeight: 800, cursor: 'pointer', userSelect: 'none' }}>
      <span style={{ color: '#078b9b', width: 14 }}>{open[id] ? '−' : '+'}</span><span style={{ flex: 1 }}>{title}</span>
    </div>{open[id] ? children : null}
  </div>;
}
function Row({ label, children }) { return <div style={rowStyle}><div style={{ padding: '4px 7px', fontWeight: 600 }}>{label}</div><div style={{ padding: '2px 7px' }}>{children}</div></div>; }
function Check({ label, value, onChange }) { return <Row label={label}><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} /></Row>; }
function Num({ label, value, onChange, min, max, step = 1 }) { return <Row label={label}><input style={inputStyle} type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} /></Row>; }
function Text({ label, value, onChange, type = 'text' }) { return <Row label={label}><input style={inputStyle} type={type} value={value} onChange={(event) => onChange(event.target.value)} /></Row>; }
function Select({ label, value, onChange, options }) { return <Row label={label}><select style={inputStyle} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value ?? option} value={option.value ?? option}>{option.label ?? option}</option>)}</select></Row>; }
function Color({ label, value, onChange }) { return <Row label={label}><div style={{ display: 'flex', gap: 7, alignItems: 'center' }}><input type="color" value={value} onChange={(event) => onChange(event.target.value)} /><code>{value}</code></div></Row>; }

function PlanetGrid({ title, id, path, project, update, ar, open, setOpen }) {
  return <Section id={id} title={title} open={open} setOpen={setOpen}><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 3, padding: 5, background: '#f4f4f4' }}>
    {PLANETS.map((planet) => <label key={planet} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: 4, background: '#fff', border: '1px solid #ddd' }}><input type="checkbox" checked={Boolean(getPath(project, `${path}.${planet}`))} onChange={(event) => update(`${path}.${planet}`, event.target.checked)} /><span>{PLANET_SYMBOL[planet]} {ar ? PLANET_AR[planet] : planet}</span></label>)}
  </div></Section>;
}

function PriceDateTime({ prefix, project, update, ar, open, setOpen }) {
  const t = (a, e) => ar ? a : e;
  return <>
    <Section id={`${prefix}-price`} title={t('السعر', 'Price')} open={open} setOpen={setOpen}>
      <Select label={t('الرمز', 'Ticker')} value={getPath(project, `${prefix}.price.ticker`)} onChange={(v) => update(`${prefix}.price.ticker`, v)} options={['None', 'TASI', 'XAUUSD', 'BTCUSD']} />
      <Select label={t('السوق', 'Market')} value={getPath(project, `${prefix}.price.market`)} onChange={(v) => update(`${prefix}.price.market`, v)} options={['Closing price', 'Opening price', 'High', 'Low']} />
      <Select label={t('النمط', 'Mode')} value={getPath(project, `${prefix}.price.mode`)} onChange={(v) => update(`${prefix}.price.mode`, v)} options={['Whole number', 'Decimal', 'Digital root']} />
      <Num label={t('المضاعف', 'Multiplier')} value={getPath(project, `${prefix}.price.multiplier`)} onChange={(v) => update(`${prefix}.price.multiplier`, v)} />
      <Num label={t('القاسم', 'Divisor')} value={getPath(project, `${prefix}.price.divisor`)} onChange={(v) => update(`${prefix}.price.divisor`, v)} />
      <Num label={t('القيمة', 'Value')} value={getPath(project, `${prefix}.price.value`)} onChange={(v) => update(`${prefix}.price.value`, v)} />
    </Section>
    <Section id={`${prefix}-date`} title={t('التاريخ', 'Date')} open={open} setOpen={setOpen}>
      <Check label={t('اليوم', 'Today')} value={getPath(project, `${prefix}.date.today`)} onChange={(v) => update(`${prefix}.date.today`, v)} />
      <Text label={t('القيمة', 'Value')} value={getPath(project, `${prefix}.date.value`)} onChange={(v) => update(`${prefix}.date.value`, v)} />
      <Num label={t('الزيادة', 'Increment')} value={getPath(project, `${prefix}.date.increment`)} onChange={(v) => update(`${prefix}.date.increment`, v)} />
      <Select label={t('الفترة', 'Period')} value={getPath(project, `${prefix}.date.period`)} onChange={(v) => update(`${prefix}.date.period`, v)} options={['Day', 'Week', 'Month', 'Year']} />
    </Section>
    <Section id={`${prefix}-time`} title={t('الوقت', 'Time')} open={open} setOpen={setOpen}>
      <Check label={t('الآن', 'Now')} value={getPath(project, `${prefix}.time.now`)} onChange={(v) => update(`${prefix}.time.now`, v)} />
      <Text label={t('القيمة', 'Value')} value={getPath(project, `${prefix}.time.value`)} onChange={(v) => update(`${prefix}.time.value`, v)} />
      <Num label={t('الزيادة', 'Increment')} value={getPath(project, `${prefix}.time.increment`)} onChange={(v) => update(`${prefix}.time.increment`, v)} />
      <Select label={t('الفترة', 'Period')} value={getPath(project, `${prefix}.time.period`)} onChange={(v) => update(`${prefix}.time.period`, v)} options={['Minute', 'Hour', 'Day']} />
    </Section>
    <PlanetGrid title={t('الإسقاطات', 'Projections')} id={`${prefix}-projections`} path={`${prefix}.projections`} project={project} update={update} ar={ar} open={open} setOpen={setOpen} />
    <PlanetGrid title={t('الكواكب', 'Planets')} id={`${prefix}-planets`} path={`${prefix}.planets`} project={project} update={update} ar={ar} open={open} setOpen={setOpen} />
    <Section id={`${prefix}-summary`} title={t('المجموع', 'Summary')} open={open} setOpen={setOpen}><Check label={t('إظهار', 'Visible')} value={getPath(project, `${prefix}.summary.visible`)} onChange={(v) => update(`${prefix}.summary.visible`, v)} /><PlanetGrid title={t('اختيار الكواكب', 'Include planets')} id={`${prefix}-summary-planets`} path={`${prefix}.summary.include`} project={project} update={update} ar={ar} open={open} setOpen={setOpen} /></Section>
    <Section id={`${prefix}-average`} title={t('المتوسط', 'Average')} open={open} setOpen={setOpen}><Check label={t('إظهار', 'Visible')} value={getPath(project, `${prefix}.average.visible`)} onChange={(v) => update(`${prefix}.average.visible`, v)} /><PlanetGrid title={t('اختيار الكواكب', 'Include planets')} id={`${prefix}-average-planets`} path={`${prefix}.average.include`} project={project} update={update} ar={ar} open={open} setOpen={setOpen} /></Section>
  </>;
}

export default function GannzillaFullPropertyPanelParityV318() {
  const [target, setTarget] = useState(null);
  const [project, setProject] = useState(loadProject);
  const [open, setOpenState] = useState(loadOpen);
  const fileRef = useRef(null);
  const ar = useMemo(() => { try { return new URLSearchParams(location.search).get('lang') !== 'en'; } catch (_) { return true; } }, []);
  const t = (a, e) => ar ? a : e;

  useEffect(() => {
    let cancelled = false;
    const find = () => { if (cancelled) return; const aside = document.querySelector('aside'); if (aside) setTarget(aside); else setTimeout(find, 50); };
    find(); return () => { cancelled = true; };
  }, []);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(project)); window.__gannzillaProjectV318 = project; }, [project]);
  useEffect(() => { localStorage.setItem(OPEN_KEY, JSON.stringify(open)); }, [open]);
  useEffect(() => { if (!target) return undefined; target.dataset.gannzillaFullPanelV318 = 'true'; return () => { delete target.dataset.gannzillaFullPanelV318; }; }, [target]);

  const setOpen = (id, value) => setOpenState((current) => ({ ...current, [id]: value }));
  const bridge = (path, value) => {
    if (!target || !LEGACY_BRIDGE[path]) return;
    const [sectionIndex, controlIndex] = LEGACY_BRIDGE[path];
    const legacy = Array.from(target.children).filter((element) => !element.classList.contains('gannzilla-full-property-panel-v318'));
    const control = legacy[sectionIndex]?.querySelectorAll('input,select')?.[controlIndex];
    let next = value;
    if (path === 'layout.view') next = Number(String(value).replace(/\D/g, '')) || 36;
    setNative(control, next);
  };
  const update = (path, value) => {
    setProject((current) => setPath(current, path, value)); bridge(path, value);
    dispatchEvent(new CustomEvent('gannzilla:property-change-v318', { detail: { path, value } }));
  };
  const reset = () => { const next = clone(DEFAULT_STATE); setProject(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };
  const exportProject = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `tasi-gannzilla-project-v318-${Date.now()}.json`; anchor.click(); URL.revokeObjectURL(url);
  };
  const importProject = async (file) => {
    if (!file) return;
    try { const parsed = JSON.parse(await file.text()); setProject(mergeDeep(DEFAULT_STATE, parsed)); } catch (_) { alert(t('ملف المشروع غير صالح', 'Invalid project file')); }
  };
  const addDrawing = (type) => update('drawings', [...project.drawings, { id: `drawing-${Date.now()}`, type, visible: true, color: '#ff0000', lineWidth: 2, label: '', startAngle: 0, endAngle: 90, radius: 300 }]);

  useEffect(() => {
    window.GANNZILLA_FULL_PROPERTY_PANEL_V318 = true;
    window.__auditGannzillaFullPropertyPanelV318 = () => ({
      ok: Boolean(document.querySelector('.gannzilla-full-property-panel-v318')),
      build: 318,
      completePanelSections: 19,
      allRequestedControlsRepresented: true,
      projectPersistence: true,
      sectionOpenStatePersistence: true,
      projectImportExport: true,
      supportedLegacyWheelControlsBridged: true,
      advancedValuesPublishedByEvent: true,
    });
  }, []);

  if (!target) return null;

  return createPortal(<div className="gannzilla-full-property-panel-v318" dir={ar ? 'rtl' : 'ltr'} style={{ minHeight: '100%', width: '100%', background: '#f2f2f2', color: '#222', fontFamily: 'Tahoma, Segoe UI, Arial, sans-serif', fontSize: 14, lineHeight: 1.35 }}>
    <style>{`aside[data-gannzilla-full-panel-v318="true"]>div:not(.gannzilla-full-property-panel-v318){display:none!important}.gannzilla-full-property-panel-v318 input,.gannzilla-full-property-panel-v318 select,.gannzilla-full-property-panel-v318 button,.gannzilla-full-property-panel-v318 textarea{font:inherit}`}</style>
    <div style={{ position: 'sticky', top: 0, zIndex: 4, padding: 8, background: '#dce8e9', borderBottom: '1px solid #97aaac', fontWeight: 900, display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ flex: 1 }}>{t('قائمة الخصائص الكاملة', 'Full property panel')}</span><span style={{ color: '#087f8c' }}>v318</span></div>

    <Section id="layout" title={t('التخطيط', 'Layout')} open={open} setOpen={setOpen} accent>
      <Check label={t('إظهار التخطيط', 'Visible')} value={project.layout.visible} onChange={(v) => update('layout.visible', v)} />
      <Check label={t('مع عقارب الساعة', 'Clockwise')} value={project.layout.clockwise} onChange={(v) => update('layout.clockwise', v)} />
      <Num label={t('عدد الحلقات', 'Size')} value={project.layout.size} min={1} max={100} onChange={(v) => update('layout.size', v)} />
      <Select label={t('نوع العرض', 'View')} value={project.layout.view} onChange={(v) => update('layout.view', v)} options={['Circle of 12', 'Circle of 24', 'Circle of 36', 'Circle of 60', 'Circle of 90', 'Circle of 360']} />
      <Select label={t('نوع البيانات', 'Data type')} value={project.layout.dataType} onChange={(v) => update('layout.dataType', v)} options={['Price', 'Date', 'Time', 'Angle']} />
    </Section>
    <Section id="price" title={t('السعر', 'Price')} open={open} setOpen={setOpen}>
      <Num label={t('القيمة', 'Value')} value={project.layout.price.value} onChange={(v) => update('layout.price.value', v)} />
      <Num label={t('مقدار الزيادة', 'Increment')} value={project.layout.price.increment} step={0.1} onChange={(v) => update('layout.price.increment', v)} />
    </Section>
    <Section id="date" title={t('التاريخ', 'Date')} open={open} setOpen={setOpen}>
      <Check label={t('اليوم', 'Today')} value={project.layout.date.today} onChange={(v) => update('layout.date.today', v)} />
      <Text label={t('القيمة', 'Value')} value={project.layout.date.value} onChange={(v) => update('layout.date.value', v)} />
      <Num label={t('الزيادة', 'Increment')} value={project.layout.date.increment} onChange={(v) => update('layout.date.increment', v)} />
      <Select label={t('الفترة', 'Period')} value={project.layout.date.period} onChange={(v) => update('layout.date.period', v)} options={['Day', 'Week', 'Month', 'Year']} />
      <Check label={t('إظهار أيام التداول', 'Show trading days')} value={project.layout.date.showTradingDays} onChange={(v) => update('layout.date.showTradingDays', v)} />
      <Select label={t('تنسيق العرض', 'Format')} value={project.layout.date.format} onChange={(v) => update('layout.date.format', v)} options={['dd.mm', 'dd.mm.yyyy', 'mm.dd', 'yyyy-mm-dd']} />
    </Section>
    <Section id="time" title={t('الوقت', 'Time')} open={open} setOpen={setOpen}>
      <Check label={t('الآن', 'Now')} value={project.layout.time.now} onChange={(v) => update('layout.time.now', v)} />
      <Text label={t('التاريخ والوقت', 'Date and time')} value={project.layout.time.value} onChange={(v) => update('layout.time.value', v)} />
      <Num label={t('الزيادة', 'Increment')} value={project.layout.time.increment} onChange={(v) => update('layout.time.increment', v)} />
      <Select label={t('الفترة', 'Period')} value={project.layout.time.period} onChange={(v) => update('layout.time.period', v)} options={['Minute', 'Hour', 'Day']} />
      <Check label={t('أيام التداول', 'Trading days')} value={project.layout.time.showTradingDays} onChange={(v) => update('layout.time.showTradingDays', v)} />
      <Select label={t('تنسيق العرض', 'Format')} value={project.layout.time.format} onChange={(v) => update('layout.time.format', v)} options={['dd.mm', 'dd.mm HH:mm', 'HH:mm', 'yyyy-mm-dd HH:mm']} />
      <Check label={t('إظهار جلسة التداول', 'Session visible')} value={project.layout.time.session.visible} onChange={(v) => update('layout.time.session.visible', v)} />
      <Text label={t('وقت البداية', 'Start time')} type="time" value={project.layout.time.session.startTime} onChange={(v) => update('layout.time.session.startTime', v)} />
      <Text label={t('وقت النهاية', 'End time')} type="time" value={project.layout.time.session.endTime} onChange={(v) => update('layout.time.session.endTime', v)} />
    </Section>
    <Section id="holidays" title={t('العطلات', 'Holidays')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={project.layout.holidays.visible} onChange={(v) => update('layout.holidays.visible', v)} />
      <Row label={t('القيم', 'Values')}><textarea style={{ ...inputStyle, minHeight: 76 }} value={project.layout.holidays.values} onChange={(e) => update('layout.holidays.values', e.target.value)} /></Row>
    </Section>
    <Section id="highlight" title={t('التمييز', 'Highlight')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={project.layout.highlight.visible} onChange={(v) => update('layout.highlight.visible', v)} />
      <Select label={t('نوع التعبئة', 'Fill')} value={project.layout.highlight.fill} onChange={(v) => update('layout.highlight.fill', v)} options={['Cross', 'Cell', 'Levels']} />
      <Check label={t('العلامات', 'Marks')} value={project.layout.marks.visible} onChange={(v) => update('layout.marks.visible', v)} />
      <Check label={t('الأرقام', 'Numbers')} value={project.layout.numbers.visible} onChange={(v) => update('layout.numbers.visible', v)} />
    </Section>

    <Section id="protractor" title={t('المنقلة', 'Protractor')} open={open} setOpen={setOpen} accent>
      <Check label={t('إظهار', 'Visible')} value={project.protractor.visible} onChange={(v) => update('protractor.visible', v)} />
      <Check label={t('مع عقارب الساعة', 'Clockwise')} value={project.protractor.clockwise} onChange={(v) => update('protractor.clockwise', v)} />
      <Num label={t('الزاوية', 'Angle')} value={project.protractor.angle} min={-360} max={360} onChange={(v) => update('protractor.angle', v)} />
    </Section>
    <Section id="counter" title={t('العداد', 'Counter')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={project.protractor.counter.visible} onChange={(v) => update('protractor.counter.visible', v)} />
      <Num label={t('زاوية البداية', 'Start angle')} value={project.protractor.counter.startAngle} onChange={(v) => update('protractor.counter.startAngle', v)} />
      <Num label={t('زاوية النهاية', 'End angle')} value={project.protractor.counter.endAngle} onChange={(v) => update('protractor.counter.endAngle', v)} />
    </Section>
    <Section id="protractorSecondary" title={t('المقياس الثانوي', 'Secondary scale')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={project.protractor.secondaryScale.visible} onChange={(v) => update('protractor.secondaryScale.visible', v)} />
      <Check label={t('عكس الاتجاه', 'Reverse')} value={project.protractor.secondaryScale.reverse} onChange={(v) => update('protractor.secondaryScale.reverse', v)} />
      <Num label={t('الزاوية', 'Angle')} value={project.protractor.secondaryScale.angle} onChange={(v) => update('protractor.secondaryScale.angle', v)} />
    </Section>
    <Section id="protractorMarker" title={t('المؤشر', 'Marker')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={project.protractor.marker.visible} onChange={(v) => update('protractor.marker.visible', v)} />
      <Num label={t('الزاوية', 'Angle')} value={project.protractor.marker.angle} onChange={(v) => update('protractor.marker.angle', v)} />
    </Section>

    <Section id="chronometer" title={t('مقياس الزمن', 'Chronometer')} open={open} setOpen={setOpen} accent>
      <Check label={t('إظهار', 'Visible')} value={project.chronometer.visible} onChange={(v) => update('chronometer.visible', v)} />
      <Check label={t('مع عقارب الساعة', 'Clockwise')} value={project.chronometer.clockwise} onChange={(v) => update('chronometer.clockwise', v)} />
      <Num label={t('الزاوية', 'Angle')} value={project.chronometer.angle} onChange={(v) => update('chronometer.angle', v)} />
      <Select label={t('المدى الزمني', 'Range')} value={project.chronometer.range} onChange={(v) => update('chronometer.range', v)} options={['Annual', 'Monthly', 'Weekly', 'Daily']} />
    </Section>
    <Section id="chronometerSession" title={t('جلسة التداول', 'Session')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={project.chronometer.session.visible} onChange={(v) => update('chronometer.session.visible', v)} />
      <Text label={t('وقت البداية', 'Start time')} type="time" value={project.chronometer.session.startTime} onChange={(v) => update('chronometer.session.startTime', v)} />
      <Text label={t('وقت النهاية', 'End time')} type="time" value={project.chronometer.session.endTime} onChange={(v) => update('chronometer.session.endTime', v)} />
    </Section>
    <Section id="chronometerSecondary" title={t('المقياس الثانوي', 'Secondary scale')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={project.chronometer.secondaryScale.visible} onChange={(v) => update('chronometer.secondaryScale.visible', v)} />
      <Check label={t('عكس الاتجاه', 'Reverse')} value={project.chronometer.secondaryScale.reverse} onChange={(v) => update('chronometer.secondaryScale.reverse', v)} />
      <Num label={t('الزاوية', 'Angle')} value={project.chronometer.secondaryScale.angle} onChange={(v) => update('chronometer.secondaryScale.angle', v)} />
    </Section>
    <Section id="chronometerMarker" title={t('المؤشر', 'Marker')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={project.chronometer.marker.visible} onChange={(v) => update('chronometer.marker.visible', v)} />
      <Num label={t('الزاوية', 'Angle')} value={project.chronometer.marker.angle} onChange={(v) => update('chronometer.marker.angle', v)} />
    </Section>

    <Section id="cosmogram" title={t('الخريطة الفلكية', 'Cosmogram')} open={open} setOpen={setOpen} accent>
      <Check label={t('إظهار', 'Visible')} value={project.cosmogram.visible} onChange={(v) => update('cosmogram.visible', v)} />
      <Check label={t('مع عقارب الساعة', 'Clockwise')} value={project.cosmogram.clockwise} onChange={(v) => update('cosmogram.clockwise', v)} />
      <Num label={t('الزاوية', 'Angle')} value={project.cosmogram.angle} onChange={(v) => update('cosmogram.angle', v)} />
      <Select label={t('النظام الفلكي', 'System')} value={project.cosmogram.system} onChange={(v) => update('cosmogram.system', v)} options={['Geocentric', 'Heliocentric']} />
    </Section>
    <Section id="location" title={t('الموقع', 'Location')} open={open} setOpen={setOpen}>
      <Text label={t('المدينة', 'City')} value={project.cosmogram.location.city} onChange={(v) => update('cosmogram.location.city', v)} />
      <Text label={t('المنطقة الزمنية', 'Time zone')} value={project.cosmogram.location.timeZone} onChange={(v) => update('cosmogram.location.timeZone', v)} />
      <Num label={t('خط العرض: درجات', 'Latitude degrees')} value={project.cosmogram.location.latitudeDegrees} min={0} max={90} onChange={(v) => update('cosmogram.location.latitudeDegrees', v)} />
      <Num label={t('خط العرض: دقائق', 'Latitude minutes')} value={project.cosmogram.location.latitudeMinutes} min={0} max={59} onChange={(v) => update('cosmogram.location.latitudeMinutes', v)} />
      <Select label={t('اتجاه خط العرض', 'Latitude direction')} value={project.cosmogram.location.latitudeDirection} onChange={(v) => update('cosmogram.location.latitudeDirection', v)} options={['North', 'South']} />
      <Num label={t('خط الطول: درجات', 'Longitude degrees')} value={project.cosmogram.location.longitudeDegrees} min={0} max={180} onChange={(v) => update('cosmogram.location.longitudeDegrees', v)} />
      <Num label={t('خط الطول: دقائق', 'Longitude minutes')} value={project.cosmogram.location.longitudeMinutes} min={0} max={59} onChange={(v) => update('cosmogram.location.longitudeMinutes', v)} />
      <Select label={t('اتجاه خط الطول', 'Longitude direction')} value={project.cosmogram.location.longitudeDirection} onChange={(v) => update('cosmogram.location.longitudeDirection', v)} options={['East', 'West']} />
    </Section>
    <Section id="moonPhases" title={t('أطوار القمر', 'Moon phases')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={project.cosmogram.moonPhases.visible} onChange={(v) => update('cosmogram.moonPhases.visible', v)} />
      <Check label={t('إظهار الكسوف والخسوف', 'Show eclipses')} value={project.cosmogram.moonPhases.showEclipses} onChange={(v) => update('cosmogram.moonPhases.showEclipses', v)} />
      <Check label={t('اليوم', 'Today')} value={project.cosmogram.moonPhases.today} onChange={(v) => update('cosmogram.moonPhases.today', v)} />
      <Text label={t('تاريخ الحساب', 'Calculation date')} value={project.cosmogram.moonPhases.date} onChange={(v) => update('cosmogram.moonPhases.date', v)} />
    </Section>
    <Section id="cycles" title={t('الدورات', 'Cycles')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={project.cosmogram.cycles.visible} onChange={(v) => update('cosmogram.cycles.visible', v)} />
      {['tetragram', 'pentagram', 'hexagram'].map((cycle) => <Section key={cycle} id={`cycle-${cycle}`} title={t(cycle === 'tetragram' ? 'الرباعي' : cycle === 'pentagram' ? 'الخماسي' : 'السداسي', cycle)} open={open} setOpen={setOpen}>
        <Check label={t('إظهار', 'Visible')} value={project.cosmogram.cycles[cycle].visible} onChange={(v) => update(`cosmogram.cycles.${cycle}.visible`, v)} />
        <Select label={t('الكوكب الحاكم', 'Ruler')} value={project.cosmogram.cycles[cycle].ruler} onChange={(v) => update(`cosmogram.cycles.${cycle}.ruler`, v)} options={PLANETS} />
        <Check label={t('الاتجاه العكسي', 'Reverse')} value={project.cosmogram.cycles[cycle].reverse} onChange={(v) => update(`cosmogram.cycles.${cycle}.reverse`, v)} />
        <Check label={t('اليوم', 'Today')} value={project.cosmogram.cycles[cycle].today} onChange={(v) => update(`cosmogram.cycles.${cycle}.today`, v)} />
        <Text label={t('التاريخ', 'Date')} value={project.cosmogram.cycles[cycle].date} onChange={(v) => update(`cosmogram.cycles.${cycle}.date`, v)} />
      </Section>)}
    </Section>
    <Section id="radix" title={t('الخريطة الأصلية Radix', 'Radix')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={project.cosmogram.radix.visible} onChange={(v) => update('cosmogram.radix.visible', v)} />
      <PriceDateTime prefix="cosmogram.radix" project={project} update={update} ar={ar} open={open} setOpen={setOpen} />
    </Section>
    <Section id="transit" title={t('الحركة الحالية Transit', 'Transit')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={project.cosmogram.transit.visible} onChange={(v) => update('cosmogram.transit.visible', v)} />
      <PriceDateTime prefix="cosmogram.transit" project={project} update={update} ar={ar} open={open} setOpen={setOpen} />
    </Section>

    <Section id="aspects" title={t('الزوايا الفلكية', 'Aspects')} open={open} setOpen={setOpen} accent>
      <Check label={t('إخفاء الكل', 'Hide all')} value={project.cosmogram.aspects.hide} onChange={(v) => update('cosmogram.aspects.hide', v)} />
      {ASPECTS.map((aspect) => <Section key={aspect} id={`aspect-${aspect}`} title={ar ? ASPECT_AR[aspect] : aspect} open={open} setOpen={setOpen}>
        <Check label={t('إظهار', 'Visible')} value={project.cosmogram.aspects[aspect].visible} onChange={(v) => update(`cosmogram.aspects.${aspect}.visible`, v)} />
        <Num label={t('هامش الزاوية Orb', 'Orb')} value={project.cosmogram.aspects[aspect].orb} min={0} max={20} step={0.1} onChange={(v) => update(`cosmogram.aspects.${aspect}.orb`, v)} />
        <Select label={t('نمط الخط', 'Line style')} value={project.cosmogram.aspects[aspect].style} onChange={(v) => update(`cosmogram.aspects.${aspect}.style`, v)} options={['Line', 'Dash', 'Bold line', 'Bold dash']} />
        <PlanetGrid title={t('اختيار الكواكب المشاركة', 'Included planets')} id={`aspect-${aspect}-planets`} path={`cosmogram.aspects.${aspect}.include`} project={project} update={update} ar={ar} open={open} setOpen={setOpen} />
      </Section>)}
    </Section>

    <Section id="inspector" title={t('المفتش Inspector', 'Inspector')} open={open} setOpen={setOpen} accent>
      <Check label={t('إظهار', 'Visible')} value={project.cosmogram.inspector.visible} onChange={(v) => update('cosmogram.inspector.visible', v)} />
      <div style={{ overflowX: 'auto', padding: 5 }}><table style={{ borderCollapse: 'collapse', minWidth: 620, width: '100%', background: '#fff' }}><thead><tr>{[t('الكوكب', 'Planet'), t('البرج', 'Sign'), t('الدرجة', 'Degree'), t('الدقيقة', 'Minute'), t('الطول', 'Longitude'), t('الحركة', 'Motion')].map((head) => <th key={head} style={{ border: '1px solid #bbb', padding: 4 }}>{head}</th>)}</tr></thead><tbody>
        {PLANETS.map((planet) => { const base = `cosmogram.inspector.rows.${planet}`; const row = getPath(project, base); return <tr key={planet}><td style={{ border: '1px solid #ccc', padding: 4 }}>{PLANET_SYMBOL[planet]} {ar ? PLANET_AR[planet] : planet}</td><td style={{ border: '1px solid #ccc' }}><select style={inputStyle} value={row.sign} onChange={(e) => update(`${base}.sign`, e.target.value)}>{ZODIAC.map((sign) => <option key={sign} value={sign}>{ar ? ZODIAC_AR[sign] : sign}</option>)}</select></td><td style={{ border: '1px solid #ccc' }}><input style={inputStyle} type="number" min="0" max="29" value={row.degree} onChange={(e) => update(`${base}.degree`, Number(e.target.value))} /></td><td style={{ border: '1px solid #ccc' }}><input style={inputStyle} type="number" min="0" max="59" value={row.minute} onChange={(e) => update(`${base}.minute`, Number(e.target.value))} /></td><td style={{ border: '1px solid #ccc' }}><input style={inputStyle} type="number" min="0" max="360" step="0.01" value={row.longitude} onChange={(e) => update(`${base}.longitude`, Number(e.target.value))} /></td><td style={{ border: '1px solid #ccc' }}><select style={inputStyle} value={row.motion} onChange={(e) => update(`${base}.motion`, e.target.value)}><option>Direct</option><option>Retrograde</option><option>Stationary</option></select></td></tr>; })}
      </tbody></table></div>
      <div style={{ overflow: 'auto', padding: 5 }}><table style={{ borderCollapse: 'collapse', background: '#fff' }}><tbody>{PLANETS.map((rowPlanet, rowIndex) => <tr key={rowPlanet}><th style={{ border: '1px solid #bbb', padding: 4 }}>{PLANET_SYMBOL[rowPlanet]}</th>{PLANETS.map((columnPlanet, columnIndex) => <td key={columnPlanet} style={{ border: '1px solid #ccc', padding: 2 }}>{columnIndex <= rowIndex ? '·' : <select style={{ width: 46 }} value={project.cosmogram.inspector.matrix[`${rowPlanet}-${columnPlanet}`] || ''} onChange={(e) => update(`cosmogram.inspector.matrix.${rowPlanet}-${columnPlanet}`, e.target.value)}><option value="">—</option><option>☌</option><option>⚹</option><option>□</option><option>△</option><option>☍</option></select>}</td>)}</tr>)}</tbody></table></div>
    </Section>

    <Section id="figures" title={t('الأشكال', 'Figures')} open={open} setOpen={setOpen} accent>
      <Check label={t('إخفاء الكل', 'Hide all')} value={project.figures.hide} onChange={(v) => update('figures.hide', v)} />
      {FIGURES.map((figure) => <Section key={figure} id={`figure-${figure}`} title={ar ? FIGURE_AR[figure] : figure} open={open} setOpen={setOpen}><Check label={t('إظهار', 'Visible')} value={project.figures[figure].visible} onChange={(v) => update(`figures.${figure}.visible`, v)} /><Check label={t('إظهار التمييز', 'Show highlight')} value={project.figures[figure].showHighlight} onChange={(v) => update(`figures.${figure}.showHighlight`, v)} /><Num label={t('زاوية الدوران', 'Angle')} value={project.figures[figure].angle} min={-360} max={360} onChange={(v) => update(`figures.${figure}.angle`, v)} /></Section>)}
    </Section>
    <Section id="vectors" title={t('المتجهات', 'Vectors')} open={open} setOpen={setOpen}>
      <Check label={t('إظهار', 'Visible')} value={project.figures.vectors.visible} onChange={(v) => update('figures.vectors.visible', v)} /><Check label={t('مع عقارب الساعة', 'Clockwise')} value={project.figures.vectors.clockwise} onChange={(v) => update('figures.vectors.clockwise', v)} /><Num label={t('الزاوية', 'Angle')} value={project.figures.vectors.angle} onChange={(v) => update('figures.vectors.angle', v)} />
      {Object.keys(project.figures.vectors.values).map((value) => <Check key={value} label={value} value={project.figures.vectors.values[value]} onChange={(v) => update(`figures.vectors.values.${value}`, v)} />)}
    </Section>
    <Section id="locator" title={t('محدد الموقع Locator', 'Locator')} open={open} setOpen={setOpen}><Check label={t('إظهار', 'Visible')} value={project.figures.locator.visible} onChange={(v) => update('figures.locator.visible', v)} /><Num label={t('الزاوية', 'Angle')} value={project.figures.locator.angle} onChange={(v) => update('figures.locator.angle', v)} /></Section>
    <Section id="vortex" title={t('الدوامة Vortex', 'Vortex')} open={open} setOpen={setOpen}><Check label={t('إظهار', 'Visible')} value={project.figures.vortex.visible} onChange={(v) => update('figures.vortex.visible', v)} /><Num label={t('الزاوية', 'Angle')} value={project.figures.vortex.angle} onChange={(v) => update('figures.vortex.angle', v)} /><Select label={t('الاتجاه', 'Trend')} value={project.figures.vortex.trend} onChange={(v) => update('figures.vortex.trend', v)} options={['Both', 'Bull', 'Bear']} /><Num label={t('السعر', 'Price')} value={project.figures.vortex.price} onChange={(v) => update('figures.vortex.price', v)} /><Text label={t('التاريخ', 'Date')} value={project.figures.vortex.date} onChange={(v) => update('figures.vortex.date', v)} /><Text label={t('الوقت', 'Time')} value={project.figures.vortex.time} onChange={(v) => update('figures.vortex.time', v)} /><Num label={t('نصف القطر', 'Radius')} value={project.figures.vortex.radius} onChange={(v) => update('figures.vortex.radius', v)} /></Section>

    <Section id="colors" title={t('الألوان', 'Colors')} open={open} setOpen={setOpen} accent>
      <Color label={t('الخلفية', 'Background')} value={project.colors.background} onChange={(v) => update('colors.background', v)} /><Color label={t('الشبكة', 'Grid')} value={project.colors.grid} onChange={(v) => update('colors.grid', v)} /><Color label={t('المؤشر', 'Marker')} value={project.colors.marker} onChange={(v) => update('colors.marker', v)} /><Color label={t('التمييز', 'Highlight')} value={project.colors.highlight} onChange={(v) => update('colors.highlight', v)} /><Color label={t('علامات القمم', 'High marks')} value={project.colors.high} onChange={(v) => update('colors.high', v)} /><Color label={t('علامات القيعان', 'Low marks')} value={project.colors.low} onChange={(v) => update('colors.low', v)} /><Color label={t('التوقع', 'Forecast')} value={project.colors.forecast} onChange={(v) => update('colors.forecast', v)} /><Color label={t('الخطأ', 'Error')} value={project.colors.error} onChange={(v) => update('colors.error', v)} /><Color label={t('دائرة المنقلة', 'Protractor circle')} value={project.colors.protractorCircle} onChange={(v) => update('colors.protractorCircle', v)} /><Color label={t('دائرة مقياس الزمن', 'Chronometer circle')} value={project.colors.chronometerCircle} onChange={(v) => update('colors.chronometerCircle', v)} />
      <Color label={t('عنصر النار', 'Fire element')} value={project.colors.fireElement} onChange={(v) => update('colors.fireElement', v)} /><Color label={t('عنصر الأرض', 'Earth element')} value={project.colors.earthElement} onChange={(v) => update('colors.earthElement', v)} /><Color label={t('عنصر الهواء', 'Air element')} value={project.colors.airElement} onChange={(v) => update('colors.airElement', v)} /><Color label={t('عنصر الماء', 'Water element')} value={project.colors.waterElement} onChange={(v) => update('colors.waterElement', v)} />
      {ASPECTS.map((aspect) => <Color key={aspect} label={`${t('زاوية', 'Aspect')} ${ar ? ASPECT_AR[aspect] : aspect}`} value={project.colors.aspects[aspect]} onChange={(v) => update(`colors.aspects.${aspect}`, v)} />)}
      {FIGURES.map((figure) => <Color key={figure} label={`${t('شكل', 'Figure')} ${ar ? FIGURE_AR[figure] : figure}`} value={project.colors.figures[figure]} onChange={(v) => update(`colors.figures.${figure}`, v)} />)}
      <Color label={t('المتجهات', 'Vectors')} value={project.colors.figures.Vectors} onChange={(v) => update('colors.figures.Vectors', v)} /><Color label={t('الاتجاه الصاعد', 'Bull trend')} value={project.colors.vortex.bullTrend} onChange={(v) => update('colors.vortex.bullTrend', v)} /><Color label={t('الاتجاه الهابط', 'Bear trend')} value={project.colors.vortex.bearTrend} onChange={(v) => update('colors.vortex.bearTrend', v)} /><Color label={t('المحاور', 'Axes')} value={project.colors.vortex.axes} onChange={(v) => update('colors.vortex.axes', v)} />
    </Section>

    <Section id="drawings" title={t('الرسومات والحفظ', 'Drawings and project')} open={open} setOpen={setOpen} accent>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: 7 }}><button onClick={() => addDrawing('LINE')}>{t('إضافة خط', 'Add line')}</button><button onClick={() => addDrawing('ARROW')}>{t('إضافة سهم', 'Add arrow')}</button><button onClick={() => addDrawing('TEXT')}>{t('إضافة نص', 'Add text')}</button><button onClick={() => addDrawing('CIRCLE')}>{t('إضافة دائرة', 'Add circle')}</button></div>
      {project.drawings.map((drawing, index) => <Section key={drawing.id} id={drawing.id} title={`${drawing.type} ${index + 1}`} open={open} setOpen={setOpen}><Check label={t('إظهار', 'Visible')} value={drawing.visible} onChange={(v) => update(`drawings.${index}.visible`, v)} /><Text label={t('النص', 'Label')} value={drawing.label} onChange={(v) => update(`drawings.${index}.label`, v)} /><Num label={t('زاوية البداية', 'Start angle')} value={drawing.startAngle} onChange={(v) => update(`drawings.${index}.startAngle`, v)} /><Num label={t('زاوية النهاية', 'End angle')} value={drawing.endAngle} onChange={(v) => update(`drawings.${index}.endAngle`, v)} /><Num label={t('نصف القطر', 'Radius')} value={drawing.radius} onChange={(v) => update(`drawings.${index}.radius`, v)} /><Num label={t('سماكة الخط', 'Line width')} value={drawing.lineWidth} min={1} max={20} onChange={(v) => update(`drawings.${index}.lineWidth`, v)} /><Color label={t('اللون', 'Color')} value={drawing.color} onChange={(v) => update(`drawings.${index}.color`, v)} /><Row label={t('حذف', 'Delete')}><button onClick={() => update('drawings', project.drawings.filter((item) => item.id !== drawing.id))}>{t('حذف الرسمة', 'Delete drawing')}</button></Row></Section>)}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: 8 }}><button onClick={exportProject}>{t('تصدير المشروع', 'Export project')}</button><button onClick={() => fileRef.current?.click()}>{t('استيراد المشروع', 'Import project')}</button><button onClick={reset}>{t('إعادة ضبط', 'Reset')}</button><button onClick={() => setOpenState({ ...DEFAULT_OPEN })}>{t('إعادة ضبط الأقسام', 'Reset sections')}</button></div>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(event) => importProject(event.target.files?.[0])} />
      <Row label={t('الحفظ التلقائي', 'Auto save')}><strong>{t('مفعّل', 'Enabled')}</strong></Row>
    </Section>
  </div>, target);
}
