import React from 'react';
import { createPortal } from 'react-dom';

const storeKey = 'tasi-gannzilla-extra-panels-binding-v1';

const defaults = {
  counterVisible: false,
  counterClockwise: false,
  counterAngle: '0°',
  counterCount: '360',
  markerVisible: false,
  markerAngle: '0°',
  chronometerVisible: true,
  chronometerAngle: '30°',
  chronometerRange: 'Annual',
  cosmogramVisible: false,
  cosmogramSystem: 'Geocentric',
  locationCity: 'New York'
};

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
        <span>{icon}</span>
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
      <div />
    </div>
  );
}

export default function GannzillaExtraPanelsBinding() {
  const [host, setHost] = React.useState(null);
  const [state, setState] = React.useState(readState);

  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const style = document.createElement('style');
    style.id = 'gannzilla-extra-panels-binding-style-v1';
    style.textContent = `
      .gzx-header{display:grid;grid-template-columns:22px 1fr 24px;align-items:center;min-height:31px;background:linear-gradient(90deg,#f8f5dc,#f2f2f2);border-top:1px solid #c8c8c8;border-bottom:1px solid #d4d4d4;cursor:pointer;}
      .gzx-toggle{color:#1680ad;font-size:18px;font-weight:900;text-align:center;}
      .gzx-header b{font-size:15px;font-weight:900;}
      .gzx-row{display:grid;grid-template-columns:172px 1fr 22px;min-height:31px;border-bottom:1px solid #d3d3d3;align-items:center;background:#f7f7f7;}
      .gzx-label{padding-left:30px;font-size:15px;font-weight:600;color:#333;}
      .gzx-value{padding:2px 6px;border-left:1px solid #cfcfcf;min-height:27px;display:flex;align-items:center;}
      .gzx-value input,.gzx-value select{width:100%;height:28px;font-size:15px;font-weight:700;border:1px solid #9b9b9b;background:#fff;box-sizing:border-box;}
      .gzx-value input[type="checkbox"]{width:16px;height:16px;accent-color:#2c7fbd;}
    `;
    document.head.appendChild(style);

    const mount = () => {
      const aside = document.querySelector('aside');
      if (!aside) return;
      let el = document.getElementById('gannzilla-extra-panels-binding-v1');
      if (!el) {
        el = document.createElement('div');
        el.id = 'gannzilla-extra-panels-binding-v1';
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
      document.getElementById('gannzilla-extra-panels-binding-v1')?.remove();
      document.getElementById('gannzilla-extra-panels-binding-style-v1')?.remove();
    };
  }, []);

  const update = (key, value) => {
    const next = { ...state, [key]: value };
    setState(next);
    localStorage.setItem(storeKey, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('gannzilla:extra-panels-change', { detail: next }));
    window.dispatchEvent(new Event('resize'));
  };

  const input = (key, type = 'text') => (
    <input type={type} value={state[key] ?? ''} onChange={(e) => update(key, type === 'checkbox' ? e.target.checked : e.target.value)} checked={type === 'checkbox' ? !!state[key] : undefined} />
  );

  const select = (key, options) => (
    <select value={state[key] ?? options[0]} onChange={(e) => update(key, e.target.value)}>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );

  const content = (
    <>
      <Section title="Counter" icon="3↻">
        <Row label="Visible">{input('counterVisible', 'checkbox')}</Row>
        <Row label="Clockwise">{input('counterClockwise', 'checkbox')}</Row>
        <Row label="Angle">{input('counterAngle')}</Row>
        <Row label="Count">{select('counterCount', ['36','72','90','180','270','360','720'])}</Row>
      </Section>
      <Section title="Marker" icon="◇">
        <Row label="Visible">{input('markerVisible', 'checkbox')}</Row>
        <Row label="Angle">{input('markerAngle')}</Row>
      </Section>
      <Section title="Chronometer" icon="◷" defaultOpen>
        <Row label="Visible">{input('chronometerVisible', 'checkbox')}</Row>
        <Row label="Angle">{input('chronometerAngle')}</Row>
        <Row label="Range">{select('chronometerRange', ['Annual','Monthly','Weekly','Daily','Custom'])}</Row>
      </Section>
      <Section title="Cosmogram" icon="★" defaultOpen>
        <Row label="Visible">{input('cosmogramVisible', 'checkbox')}</Row>
        <Row label="System">{select('cosmogramSystem', ['Geocentric','Heliocentric','Topocentric'])}</Row>
        <Row label="City">{input('locationCity')}</Row>
      </Section>
    </>
  );

  return host ? createPortal(content, host) : null;
}
