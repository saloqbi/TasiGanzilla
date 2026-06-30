import React from 'react';

const STORE_KEY = 'tasi-gannzilla-top-toolbar-v2';

function readState() {
  try {
    return { panX: 0, zoom: 0.7, locked: false, tool: 'select', ...(JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}) };
  } catch {
    return { panX: 0, zoom: 0.7, locked: false, tool: 'select' };
  }
}

function writeState(patch) {
  const next = { ...readState(), ...patch };
  localStorage.setItem(STORE_KEY, JSON.stringify(next));
  return next;
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

function updateToolbarUi(toolbar, state) {
  if (!toolbar) return;
  toolbar.querySelector('[data-gz-top-zoom]')?.replaceChildren(document.createTextNode(`${Math.round((state.zoom || 0.7) * 100)}%`));
  toolbar.querySelectorAll('[data-gz-tool]').forEach((button) => {
    button.classList.toggle('active', button.dataset.gzTool === state.tool);
  });
  toolbar.querySelector('[data-gz-lock]')?.classList.toggle('active', !!state.locked);
}

function installStyle() {
  const styleId = 'gannzilla-top-toolbar-control-style-v2';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    #gannzilla-top-toolbar-control-v2{
      position:fixed!important;
      top:2px!important;
      left:4px!important;
      height:28px!important;
      min-width:430px!important;
      z-index:2147483647!important;
      display:flex!important;
      align-items:center!important;
      gap:1px!important;
      padding:2px 4px!important;
      background:linear-gradient(#f7f7f7,#dcdcdc)!important;
      border:1px solid #aaa!important;
      box-shadow:0 1px 4px rgba(0,0,0,.28)!important;
      direction:ltr!important;
      font-family:"Segoe UI",Tahoma,Arial,sans-serif!important;
      opacity:1!important;
      visibility:visible!important;
      pointer-events:auto!important;
      box-sizing:border-box!important;
    }
    #gannzilla-top-toolbar-control-v2 button,
    #gannzilla-top-toolbar-control-v2 .gz-top-zoom{
      height:23px!important;
      min-width:28px!important;
      border:1px solid #989898!important;
      background:linear-gradient(#ffffff,#e7e7e7)!important;
      color:#124b83!important;
      font-size:15px!important;
      font-weight:900!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      padding:0 6px!important;
      margin:0!important;
      box-sizing:border-box!important;
      cursor:pointer!important;
      user-select:none!important;
      visibility:visible!important;
      opacity:1!important;
      line-height:1!important;
    }
    #gannzilla-top-toolbar-control-v2 button:hover{background:linear-gradient(#eaf5ff,#cfe7ff)!important;border-color:#5e9acc!important;}
    #gannzilla-top-toolbar-control-v2 button.active{background:linear-gradient(#cfe9ff,#9cccff)!important;border-color:#3a84bd!important;}
    #gannzilla-top-toolbar-control-v2 .gz-top-select{width:28px!important;padding:0!important;color:#124b83!important;font-size:16px!important;}
    #gannzilla-top-toolbar-control-v2 .gz-top-line{min-width:30px!important;font-size:18px!important;}
    #gannzilla-top-toolbar-control-v2 .gz-top-square{font-size:15px!important;}
    #gannzilla-top-toolbar-control-v2 .gz-top-text{font-size:18px!important;color:#0d5a9a!important;}
    #gannzilla-top-toolbar-control-v2 .gz-top-lock{font-size:15px!important;color:#6f7f90!important;}
    #gannzilla-top-toolbar-control-v2 .gz-top-zoom{min-width:46px!important;color:#333!important;font-size:13px!important;background:linear-gradient(#ffffff,#eeeeee)!important;}
    #gannzilla-top-toolbar-control-v2 .gz-top-fit{font-size:16px!important;color:#2e638f!important;}
    #gannzilla-top-toolbar-control-v2 .gz-top-pan{font-size:16px!important;color:#1e5d90!important;min-width:32px!important;}
    #gannzilla-top-toolbar-control-v2 .gz-top-separator{width:1px!important;height:22px!important;background:#aaa!important;margin:0 2px!important;display:block!important;}
  `;
  document.head.appendChild(style);
}

export default function GannzillaTopToolbarControl() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    installStyle();

    const mount = () => {
      installStyle();
      let toolbar = document.getElementById('gannzilla-top-toolbar-control-v2');
      if (!toolbar) {
        document.getElementById('gannzilla-top-toolbar-control-v1')?.remove();
        toolbar = document.createElement('div');
        toolbar.id = 'gannzilla-top-toolbar-control-v2';
        toolbar.setAttribute('data-gannzilla-real-top-toolbar', 'true');
        toolbar.innerHTML = `
          <button class="gz-top-select" data-gz-tool="select" title="Select">↖</button>
          <button class="gz-top-line" data-gz-tool="line" title="Line">—</button>
          <button class="gz-top-square" data-gz-tool="rectangle" title="Rectangle">□</button>
          <button class="gz-top-text" data-gz-tool="text" title="Text">T</button>
          <button class="gz-top-lock" data-gz-lock="true" title="Lock">▣</button>
          <button data-gz-zoom-out="true" title="Zoom out">⊖</button>
          <span class="gz-top-zoom" data-gz-top-zoom="true">70%</span>
          <button data-gz-zoom-in="true" title="Zoom in">⊕</button>
          <button class="gz-top-fit" data-gz-fit="true" title="Fit / Center">⛶</button>
          <span class="gz-top-separator"></span>
          <button class="gz-top-pan" data-gz-pan-left="true" title="Move wheel left">◀</button>
          <button class="gz-top-pan" data-gz-pan-right="true" title="Move wheel right">▶</button>
        `;
        document.body.appendChild(toolbar);

        toolbar.addEventListener('click', (event) => {
          const button = event.target.closest('button');
          if (!button) return;
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation?.();

          const current = readState();
          let next = current;
          if (button.dataset.gzTool) {
            document.body.dataset.gannzillaActiveTool = button.dataset.gzTool;
            next = writeState({ tool: button.dataset.gzTool });
          } else if (button.dataset.gzLock) {
            next = writeState({ locked: !current.locked });
            document.body.dataset.gannzillaLocked = next.locked ? 'true' : 'false';
          } else if (button.dataset.gzZoomOut) {
            next = writeState({ zoom: Math.max(0.35, Number(current.zoom || 0.7) - 0.05) });
          } else if (button.dataset.gzZoomIn) {
            next = writeState({ zoom: Math.min(2.5, Number(current.zoom || 0.7) + 0.05) });
          } else if (button.dataset.gzFit) {
            next = writeState({ panX: 0, zoom: 0.7 });
            window.dispatchEvent(new Event('resize'));
          } else if (button.dataset.gzPanLeft) {
            next = writeState({ panX: Math.max(-700, Math.min(700, Number(current.panX || 0) - 40)) });
          } else if (button.dataset.gzPanRight) {
            next = writeState({ panX: Math.max(-700, Math.min(700, Number(current.panX || 0) + 40)) });
          }
          applyWheelPan(next.panX || 0);
          updateToolbarUi(toolbar, next);
          window.dispatchEvent(new CustomEvent('gannzilla:top-toolbar-change', { detail: next }));
        }, true);
      }
      toolbar.style.setProperty('display', 'flex', 'important');
      toolbar.style.setProperty('visibility', 'visible', 'important');
      toolbar.style.setProperty('opacity', '1', 'important');
      toolbar.style.setProperty('z-index', '2147483647', 'important');
      updateToolbarUi(toolbar, readState());
      applyWheelPan(readState().panX || 0);
    };

    mount();
    const timer = window.setInterval(mount, 250);
    return () => {
      window.clearInterval(timer);
      document.getElementById('gannzilla-top-toolbar-control-v2')?.remove();
      document.getElementById('gannzilla-top-toolbar-control-style-v2')?.remove();
    };
  }, []);

  return null;
}
