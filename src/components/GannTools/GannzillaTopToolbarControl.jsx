import React from 'react';
import { createPortal } from 'react-dom';

const STORE_KEY = 'tasi-gannzilla-top-toolbar-v1';

function readState() {
  try {
    return { panX: 0, zoom: 0.7, locked: false, tool: 'select', ...(JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}) };
  } catch {
    return { panX: 0, zoom: 0.7, locked: false, tool: 'select' };
  }
}

function getWheelLayers() {
  const largeCanvas = Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 120 && rect.height > 120)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas;

  return [
    largeCanvas,
    document.querySelector('[data-gannzilla-frame-shape-layer="true"]'),
    document.querySelector('[data-gannzilla-drawing-overlay="true"]'),
    document.querySelector('[data-gannzilla-true-spiral-overlay="true"]'),
    document.querySelector('[data-gannzilla-shape-guard-overlay="true"]'),
    document.querySelector('[data-gannzilla-polygon-tool-overlay="true"]')
  ].filter(Boolean);
}

function applyWheelPan(panX) {
  getWheelLayers().forEach((layer) => {
    layer.style.setProperty('transform-origin', 'center center', 'important');
    layer.style.setProperty('translate', `${panX}px 0`, 'important');
  });
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-pan-change', { detail: { panX } }));
}

function resetWheelPan() {
  getWheelLayers().forEach((layer) => {
    layer.style.removeProperty('translate');
  });
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-pan-change', { detail: { panX: 0 } }));
}

export default function GannzillaTopToolbarControl() {
  const [host, setHost] = React.useState(null);
  const [state, setState] = React.useState(readState);

  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const style = document.createElement('style');
    style.id = 'gannzilla-top-toolbar-control-style-v1';
    style.textContent = `
      .gannzilla-top-toolbar-control{
        position:fixed;
        top:0;
        left:0;
        height:28px;
        min-width:420px;
        z-index:9997;
        display:flex;
        align-items:center;
        gap:1px;
        padding:2px 4px;
        background:linear-gradient(#f7f7f7,#dcdcdc);
        border-bottom:1px solid #a8a8a8;
        border-right:1px solid #b9b9b9;
        box-shadow:0 1px 2px rgba(0,0,0,.16);
        direction:ltr;
        font-family:"Segoe UI",Tahoma,Arial,sans-serif;
      }
      .gannzilla-top-toolbar-control button,
      .gannzilla-top-toolbar-control select,
      .gannzilla-top-toolbar-control .gz-top-zoom{
        height:24px;
        min-width:28px;
        border:1px solid #9f9f9f;
        background:linear-gradient(#ffffff,#e7e7e7);
        color:#124b83;
        font-size:15px;
        font-weight:800;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:0 6px;
        box-sizing:border-box;
        cursor:pointer;
        user-select:none;
      }
      .gannzilla-top-toolbar-control button:hover{background:linear-gradient(#eaf5ff,#cfe7ff);border-color:#5e9acc;}
      .gannzilla-top-toolbar-control button.active{background:linear-gradient(#cfe9ff,#9cccff);border-color:#3a84bd;}
      .gannzilla-top-toolbar-control .gz-top-select{width:28px;padding:0;color:#124b83;font-size:16px;}
      .gannzilla-top-toolbar-control .gz-top-line{min-width:30px;font-size:18px;}
      .gannzilla-top-toolbar-control .gz-top-square{font-size:15px;}
      .gannzilla-top-toolbar-control .gz-top-text{font-size:18px;color:#0d5a9a;}
      .gannzilla-top-toolbar-control .gz-top-lock{font-size:16px;color:#6f7f90;}
      .gannzilla-top-toolbar-control .gz-top-zoom{min-width:46px;color:#333;font-size:13px;background:linear-gradient(#ffffff,#eeeeee);}
      .gannzilla-top-toolbar-control .gz-top-fit{font-size:17px;color:#2e638f;}
      .gannzilla-top-toolbar-control .gz-top-pan{font-size:17px;color:#1e5d90;min-width:32px;}
      .gannzilla-top-toolbar-control .gz-top-separator{width:1px;height:22px;background:#aaa;margin:0 2px;}
    `;
    document.head.appendChild(style);

    let el = document.getElementById('gannzilla-top-toolbar-control-v1');
    if (!el) {
      el = document.createElement('div');
      el.id = 'gannzilla-top-toolbar-control-v1';
      document.body.appendChild(el);
    }
    setHost(el);

    applyWheelPan(readState().panX || 0);
    const timer = window.setInterval(() => applyWheelPan(readState().panX || 0), 700);
    return () => {
      window.clearInterval(timer);
      document.getElementById('gannzilla-top-toolbar-control-v1')?.remove();
      document.getElementById('gannzilla-top-toolbar-control-style-v1')?.remove();
    };
  }, []);

  const commit = (patch) => {
    const next = { ...state, ...patch };
    setState(next);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    applyWheelPan(next.panX || 0);
    window.dispatchEvent(new CustomEvent('gannzilla:top-toolbar-change', { detail: next }));
  };

  const setTool = (tool) => {
    document.body.dataset.gannzillaActiveTool = tool;
    commit({ tool });
  };

  const pan = (delta) => commit({ panX: Math.max(-600, Math.min(600, (Number(state.panX) || 0) + delta)) });
  const fit = () => {
    resetWheelPan();
    commit({ panX: 0, zoom: 0.7 });
    window.dispatchEvent(new Event('resize'));
  };

  const content = (
    <div className="gannzilla-top-toolbar-control" title="Gannzilla toolbar">
      <button className={`gz-top-select ${state.tool === 'select' ? 'active' : ''}`} title="Select" onClick={() => setTool('select')}>↖</button>
      <button className="gz-top-line" title="Line" onClick={() => setTool('line')}>—</button>
      <button className="gz-top-square" title="Rectangle" onClick={() => setTool('rectangle')}>□</button>
      <button className="gz-top-text" title="Text" onClick={() => setTool('text')}>T</button>
      <button className={`gz-top-lock ${state.locked ? 'active' : ''}`} title="Lock" onClick={() => commit({ locked: !state.locked })}>▣</button>
      <button title="Zoom out" onClick={() => commit({ zoom: Math.max(0.35, Number(state.zoom || 0.7) - 0.05) })}>⊖</button>
      <span className="gz-top-zoom">{Math.round((state.zoom || 0.7) * 100)}%</span>
      <button title="Zoom in" onClick={() => commit({ zoom: Math.min(2.5, Number(state.zoom || 0.7) + 0.05) })}>⊕</button>
      <button className="gz-top-fit" title="Fit / Center" onClick={fit}>⛶</button>
      <span className="gz-top-separator" />
      <button className="gz-top-pan" title="Move wheel left" onClick={() => pan(-40)}>◀</button>
      <button className="gz-top-pan" title="Move wheel right" onClick={() => pan(40)}>▶</button>
    </div>
  );

  return host ? createPortal(content, host) : null;
}
