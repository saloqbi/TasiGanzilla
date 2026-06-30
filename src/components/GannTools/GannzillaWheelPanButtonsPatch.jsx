import React from 'react';

const STORE_KEY = 'tasi-gannzilla-wheel-pan-buttons-v1';

function readPan() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {};
    return Number(saved.panX || 0);
  } catch {
    return 0;
  }
}

function writePan(panX) {
  localStorage.setItem(STORE_KEY, JSON.stringify({ panX, updatedAt: new Date().toISOString() }));
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

function applyPan(panX) {
  getWheelLayers().forEach((layer) => {
    layer.style.setProperty('transform-origin', 'center center', 'important');
    layer.style.setProperty('translate', `${panX}px 0`, 'important');
  });
  window.dispatchEvent(new CustomEvent('gannzilla:wheel-pan-change', { detail: { panX } }));
}

function installStyle() {
  const styleId = 'gannzilla-wheel-pan-buttons-patch-style-v1';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .gannzilla-wheel-pan-btn{
      height:23px!important;
      min-width:25px!important;
      width:25px!important;
      border:1px solid #98a8b5!important;
      background:linear-gradient(#ffffff,#dfe8ef)!important;
      color:#1d5f95!important;
      font-size:14px!important;
      font-weight:900!important;
      line-height:1!important;
      padding:0!important;
      margin:0 1px 0 0!important;
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      cursor:pointer!important;
      box-sizing:border-box!important;
      vertical-align:middle!important;
      direction:ltr!important;
      visibility:visible!important;
      opacity:1!important;
    }
    .gannzilla-wheel-pan-btn:hover{
      background:linear-gradient(#eaf5ff,#cfe7ff)!important;
      border-color:#5e9acc!important;
    }
  `;
  document.head.appendChild(style);
}

function textOf(node) {
  return (node?.textContent || '').replace(/\s+/g, ' ').trim();
}

function findExistingToolbar() {
  const nodes = Array.from(document.querySelectorAll('div, span'));
  const candidates = nodes
    .map((node) => ({ node, rect: node.getBoundingClientRect?.(), text: textOf(node) }))
    .filter(({ node, rect, text }) => {
      if (!rect || rect.height < 18 || rect.height > 48 || rect.width < 120 || rect.width > 900) return false;
      if (node.id === 'gannzilla-wheel-pan-buttons-host-v1') return false;
      if (node.closest?.('#gannzilla-wheel-pan-buttons-host-v1')) return false;
      const hasToolbarText = /70%|90%|125%|Clockwise|Pro Small|English/.test(text);
      const hasToolIcons = /↖|—|□|T|⊖|⊕|⛶/.test(text);
      return hasToolbarText || hasToolIcons;
    })
    .sort((a, b) => {
      const ay = a.rect.top;
      const by = b.rect.top;
      if (Math.abs(ay - by) > 5) return ay - by;
      return a.rect.left - b.rect.left;
    });

  return candidates[0]?.node || null;
}

function mountPanButtons() {
  installStyle();

  const toolbar = findExistingToolbar();
  if (!toolbar) return;
  if (toolbar.querySelector?.('[data-gannzilla-pan-buttons="true"]')) return;

  const host = document.createElement('span');
  host.id = 'gannzilla-wheel-pan-buttons-host-v1';
  host.dataset.gannzillaPanButtons = 'true';
  host.style.display = 'inline-flex';
  host.style.alignItems = 'center';
  host.style.direction = 'ltr';
  host.style.marginRight = '2px';

  const left = document.createElement('button');
  left.type = 'button';
  left.className = 'gannzilla-wheel-pan-btn';
  left.title = 'تحريك العجلة يسار';
  left.textContent = '◀';

  const right = document.createElement('button');
  right.type = 'button';
  right.className = 'gannzilla-wheel-pan-btn';
  right.title = 'تحريك العجلة يمين';
  right.textContent = '▶';

  const move = (delta, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    event?.stopImmediatePropagation?.();
    const next = Math.max(-700, Math.min(700, readPan() + delta));
    writePan(next);
    applyPan(next);
  };

  left.addEventListener('click', (event) => move(-40, event), true);
  right.addEventListener('click', (event) => move(40, event), true);

  host.appendChild(left);
  host.appendChild(right);
  toolbar.insertBefore(host, toolbar.firstChild);
}

export default function GannzillaWheelPanButtonsPatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    mountPanButtons();
    applyPan(readPan());
    const timer = window.setInterval(() => {
      mountPanButtons();
      applyPan(readPan());
    }, 350);

    return () => {
      window.clearInterval(timer);
      document.getElementById('gannzilla-wheel-pan-buttons-host-v1')?.remove();
      document.getElementById('gannzilla-wheel-pan-buttons-patch-style-v1')?.remove();
    };
  }, []);

  return null;
}
