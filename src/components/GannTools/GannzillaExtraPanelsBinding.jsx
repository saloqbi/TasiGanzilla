import React from 'react';
import { createPortal } from 'react-dom';

const storeKey = 'tasi-gannzilla-extra-panels-binding-v2';

const planets = [
  ['sun', '☉', 'Sun'], ['moon', '☽', 'Moon'], ['mercury', '☿', 'Mercury'], ['venus', '♀', 'Venus'],
  ['mars', '♂', 'Mars'], ['jupiter', '♃', 'Jupiter'], ['saturn', '♄', 'Saturn'], ['uranus', '♅', 'Uranus'],
  ['neptune', '♆', 'Neptune'], ['pluto', '♇', 'Pluto'], ['node', '☊', 'Node'], ['eris', '⚯', 'Eris']
];

const aspects = [
  ['conjunction', '☌', 'Conjunction'], ['semisextile', '⌒', 'Semisextile'], ['semisquare', '∠', 'Semisquare'],
  ['sextile', '✶', 'Sextile'], ['quadrature', '□', 'Quadrature'], ['trine', '△', 'Trine'],
  ['sesquisquare', '▱', 'Sesquisquare'], ['quincunx', '⚭', 'Quincunx'], ['opposition', '☍', 'Opposition']
];

const defaults = {
  counterVisible: false,
  counterClockwise: false,
  counterAngle: '0°',
  counterCount: '360',
  counterStart: '1',
  counterIncrement: '1',
  secondaryVisible: false,
  secondaryClockwise: false,
  secondaryAngle: '0°',
  secondaryRange: '360',
  markerVisible: false,
  markerAngle: '0°',
  markerColor: '#d8c847',
  markerLabel: '',
  chronometerVisible: true,
  chronometerClockwise: false,
  chronometerAngle: '30°',
  chronometerRange: 'Annual',
  cosmogramVisible: false,
  cosmogramClockwise: true,
  cosmogramAngle: '0°',
  cosmogramSystem: 'Geocentric',
  locationCity: 'New York',
  latitudeDeg: '40°',
  latitudeMin: '43′',
  latitudeDir: 'North',
  longitudeDeg: '74°',
  longitudeMin: '1′',
  longitudeDir: 'West',
  backgroundColor: 'White',
  gridColor: 'Smoke',
  markerColorName: 'Cream',
  protractorCircleColor: 'Red',
  chronometerCircleColor: 'Green',
  fireColor: 'Red',
  earthColor: 'Green',
  airColor: 'Plum',
  waterColor: 'Blue',
  figuresVisible: false,
  figureTriangle: true,
  figureSquare: true,
  figurePentagon: true,
  figureHexagon: true,
  figureCircle: true,
  inspectorVisible: true,
  inspectorDate: '31.12.2019 00:00',
  inspectorRadix: '30.06.2026 00:00'
};

const matrixValues = [
  ['75°','85°','8°','34°','114°','8°','67°','13°','104°'],
  ['177°','55°','64°','24°','99°','49°','56°','9°',''],
  ['18°','165°','157°','40°','35°','15°','△','73°','110°'],
  ['41°','142°','83°','174°','76°','25°','37°','22°','80°'],
  ['37°','140°','55°','78°','177°','50°','38°','51°','45°'],
  ['25°','152°','48°','86°','145°','12°','105°','58°','67°'],
  ['22°','161°','○','19°','15°','150°','115°','70°','116°'],
  ['68°','102°','125°','47°','✕','108°','55°','○','92°'],
  ['34°','143°','56°','6°','35°','86°','147°','47°','10°'],
  ['84°','83°','112°','57°','69°','116°','✕','18°','54°'],
  ['153°','4°','171°','166°','168°','175°','△','✕','□'],
  ['70°','85°','□','139°','43°','99°','82°','23°','']
];

function readState() {
  try { return { ...defaults, ...(JSON.parse(localStorage.getItem(storeKey) || '{}') || {}) }; }
  catch { return { ...defaults }; }
}

function Section({ title, icon, defaultOpen = false, children }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="gzx-section">
      <div className="gzx-header" onClick={() => setOpen(!open)}>
        <span className="gzx-toggle">{open ? '−' : '+'}</span>
        <b>{title}</b>
        <span className="gzx-icon">{icon}</span>
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="gzx-row">
      <div className="gzx-label">{label}</div>
      <div className="gzx-value">{children}</div>
      <div className="gzx-more">•••</div>
    </div>
  );
}

function Dot({ color }) {
  return <span className="gzx-dot" style={{ background: color }} />;
}

export default function GannzillaExtraPanelsBinding() {
  const [host, setHost] = React.useState(null);
  const [state, setState] = React.useState(readState);

  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const style = document.createElement('style');
    style.id = 'gannzilla-extra-panels-binding-style-v2';
    style.textContent = `
      .gzx-header{display:grid;grid-template-columns:22px 1fr 24px;align-items:center;min-height:31px;background:linear-gradient(90deg,#f8f5dc,#f2f2f2);border-top:1px solid #c8c8c8;border-bottom:1px solid #d4d4d4;cursor:pointer;}
      .gzx-toggle{color:#1680ad;font-size:18px;font-weight:900;text-align:center;}.gzx-header b{font-size:15px;font-weight:900;}.gzx-icon{text-align:center;color:#999;font-weight:900;}
      .gzx-row{display:grid;grid-template-columns:172px 1fr 22px;min-height:31px;border-bottom:1px solid #d3d3d3;align-items:center;background:#f7f7f7;}
      .gzx-label{padding-left:30px;font-size:15px;font-weight:600;color:#333;}.gzx-value{padding:2px 6px;border-left:1px solid #cfcfcf;min-height:27px;display:flex;align-items:center;gap:6px;}.gzx-more{color:#777;text-align:center;font-size:12px;}
      .gzx-value input,.gzx-value select{width:100%;height:28px;font-size:15px;font-weight:700;border:1px solid #9b9b9b;background:#fff;box-sizing:border-box;}.gzx-value input[type="checkbox"]{width:16px;height:16px;accent-color:#2c7fbd;}.gzx-value input[type="color"]{padding:0;width:42px;}
      .gzx-inline{display:grid;grid-template-columns:1fr 1fr;gap:4px;width:100%;}.gzx-dot{width:13px;height:13px;border:1px solid #777;display:inline-block;}.gzx-color-name{min-width:72px;font-weight:700;}
      .gzx-inspector{background:#f7f7f7;border-bottom:1px solid #cfcfcf;padding:4px 7px 7px 7px;}.gzx-inspector-title{text-align:center;font-size:13px;color:#666;padding:3px 0;}.gzx-matrix-wrap{display:grid;grid-template-columns:22px 1fr;gap:3px;align-items:start;}.gzx-side-text{writing-mode:vertical-rl;transform:rotate(180deg);font-size:12px;color:#777;text-align:center;padding-top:12px;}
      .gzx-matrix{border-collapse:collapse;background:#fff;font-size:10px;}.gzx-matrix th,.gzx-matrix td{border:1px solid #cfcfcf;text-align:center;min-width:21px;height:18px;padding:1px;color:#333;}.gzx-matrix th{font-size:14px;font-weight:500;background:#f3f3f3;}.gzx-matrix .row-head{font-size:14px;background:#f3f3f3;}.gzx-line-select{display:flex;align-items:center;gap:8px;width:100%;}.gzx-line{height:0;border-top:2px solid #555;flex:1;}.gzx-line.dashed{border-top-style:dashed;}.gzx-line.dotted{border-top-style:dotted;}
    `;
    document.head.appendChild(style);

    const mount = () => {
      const aside = document.querySelector('aside');
      if (!aside) return;
      let el = document.getElementById('gannzilla-extra-panels-binding-v2');
      if (!el) {
        el = document.createElement('div');
        el.id = 'gannzilla-extra-panels-binding-v2';
        const advanced = document.getElementById('gannzilla-advanced-option-sections-v1');
        if (advanced?.parentElement === aside) aside.insertBefore(el, advanced);
        else aside.appendChild(el);
      }
      setHost(el);
    };
    mount();
    const timer = window.setInterval(mount, 800);
    return () => {
      window.clearInterval(timer);
      document.getElementById('gannzilla-extra-panels-binding-v2')?.remove();
      document.getElementById('gannzilla-extra-panels-binding-style-v2')?.remove();
    };
  }, []);

  const update = (key, value) => {
    const next = { ...state, [key]: value };
    setState(next);
    localStorage.setItem(storeKey, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('gannzilla:extra-panels-change', { detail: next }));
    window.dispatchEvent(new Event('resize'));
  };

  const input = (key, type = 'text') => {
    if (type === 'checkbox') return <input type="checkbox" checked={!!state[key]} onChange={(e) => update(key, e.target.checked)} />;
    return <input type={type} value={state[key] ?? ''} onChange={(e) => update(key, e.target.value)} />;
  };

  const select = (key, options) => (
    <select value={state[key] ?? options[0]} onChange={(e) => update(key, e.target.value)}>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );

  const colorRow = (label, key, color) => (
    <Row label={label}><Dot color={color} /><span className="gzx-color-name">{state[key]}</span>{select(key, ['White','Smoke','Cream','Red','Green','Plum','Blue','Gold','Black'])}</Row>
  );

  const content = (
    <>
      <Section title="Counter" icon="3↻">
        <Row label="Visible">{input('counterVisible', 'checkbox')}</Row><Row label="Clockwise">{input('counterClockwise', 'checkbox')}</Row><Row label="Angle">{input('counterAngle')}</Row><Row label="Count">{select('counterCount', ['36','72','90','180','270','360','720'])}</Row><Row label="Start">{input('counterStart')}</Row><Row label="Increment">{input('counterIncrement')}</Row>
      </Section>
      <Section title="Secondary scale" icon="✥"><Row label="Visible">{input('secondaryVisible', 'checkbox')}</Row><Row label="Clockwise">{input('secondaryClockwise', 'checkbox')}</Row><Row label="Angle">{input('secondaryAngle')}</Row><Row label="Range">{input('secondaryRange')}</Row></Section>
      <Section title="Marker" icon="◇"><Row label="Visible">{input('markerVisible', 'checkbox')}</Row><Row label="Angle">{input('markerAngle')}</Row><Row label="Color">{input('markerColor', 'color')}</Row><Row label="Label">{input('markerLabel')}</Row></Section>
      <Section title="Chronometer" icon="◷" defaultOpen><Row label="Visible">{input('chronometerVisible', 'checkbox')}</Row><Row label="Clockwise">{input('chronometerClockwise', 'checkbox')}</Row><Row label="Angle">{input('chronometerAngle')}</Row><Row label="Range">{select('chronometerRange', ['Annual','Monthly','Weekly','Daily','Custom'])}</Row></Section>
      <Section title="Cosmogram" icon="★" defaultOpen><Row label="Visible">{input('cosmogramVisible', 'checkbox')}</Row><Row label="Clockwise">{input('cosmogramClockwise', 'checkbox')}</Row><Row label="Angle">{input('cosmogramAngle')}</Row><Row label="System">{select('cosmogramSystem', ['Geocentric','Heliocentric','Topocentric'])}</Row><Row label="City">{input('locationCity')}</Row><Row label="Latitude"><div className="gzx-inline">{input('latitudeDeg')}{input('latitudeMin')}</div></Row><Row label="Latitude direction">{select('latitudeDir', ['North','South'])}</Row><Row label="Longitude"><div className="gzx-inline">{input('longitudeDeg')}{input('longitudeMin')}</div></Row><Row label="Longitude direction">{select('longitudeDir', ['East','West'])}</Row></Section>

      <Section title="Inspector" icon="⌘" defaultOpen>
        <div className="gzx-inspector"><div className="gzx-inspector-title">Transit: {state.inspectorDate}</div><div className="gzx-matrix-wrap"><div className="gzx-side-text">Radix: {state.inspectorRadix}</div><table className="gzx-matrix"><thead><tr><th>☉</th>{planets.slice(1, 10).map((p) => <th key={p[0]}>{p[1]}</th>)}</tr></thead><tbody>{matrixValues.map((row, i) => <tr key={i}><th className="row-head">{planets[i]?.[1] || '○'}</th>{row.map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody></table></div></div>
      </Section>

      <Section title="Figures" icon="■"><Row label="Visible">{input('figuresVisible', 'checkbox')}</Row><Row label="Triangle">{input('figureTriangle', 'checkbox')}</Row><Row label="Square">{input('figureSquare', 'checkbox')}</Row><Row label="Pentagon">{input('figurePentagon', 'checkbox')}</Row><Row label="Hexagon">{input('figureHexagon', 'checkbox')}</Row><Row label="Circle">{input('figureCircle', 'checkbox')}</Row></Section>
      <Section title="Colors" icon="🌈" defaultOpen>{colorRow('Background', 'backgroundColor', '#ffffff')}{colorRow('Grid', 'gridColor', '#999999')}{colorRow('Marker', 'markerColorName', '#f4edc6')}</Section>
      <Section title="Layout" icon="▦"><Row label="Background">{select('backgroundColor', ['White','Smoke','Cream','Black'])}</Row><Row label="Grid">{select('gridColor', ['Smoke','White','Black','Cream'])}</Row></Section>
      <Section title="Protractor" icon="◴"><Row label="Circle"><Dot color="red" />{select('protractorCircleColor', ['Red','Green','Blue','Plum','Gold'])}</Row></Section>
      <Section title="Chronometer" icon="◷"><Row label="Circle"><Dot color="green" />{select('chronometerCircleColor', ['Green','Red','Blue','Plum','Gold'])}</Row></Section>
      <Section title="Cosmogram" icon="★"><Row label="Zodiac">{select('cosmogramSystem', ['Geocentric','Heliocentric','Topocentric'])}</Row></Section>
      <Section title="Zodiac" icon="♈" defaultOpen>{colorRow('Fire element', 'fireColor', 'red')}{colorRow('Earth element', 'earthColor', 'green')}{colorRow('Air element', 'airColor', 'purple')}{colorRow('Water element', 'waterColor', 'blue')}</Section>
      <Section title="Aspects" icon="A">{aspects.map((a, idx) => <Row key={a[0]} label={a[2]}><span>{a[1]}</span><div className="gzx-line-select"><span className={`gzx-line ${idx % 3 === 1 ? 'dashed' : idx % 3 === 2 ? 'dotted' : ''}`} />{select(`${a[0]}Line`, ['solid','dashed','dotted'])}</div></Row>)}</Section>
      <Section title="Figures" icon="■"><Row label="Triangle color">{select('triangleColor', ['Red','Green','Blue','Gold'])}</Row><Row label="Square color">{select('squareColor', ['Red','Green','Blue','Gold'])}</Row></Section>
    </>
  );

  return host ? createPortal(content, host) : null;
}
