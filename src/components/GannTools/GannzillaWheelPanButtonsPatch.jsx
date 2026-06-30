import React from 'react';

const STORE_KEY = 'tasi-gannzilla-wheel-pan-buttons-v4';

function readState() {
  try {
    return { panX: 0, toolsHidden: false, ...(JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}) };
  } catch {
    return { panX: 0, toolsHidden: false };
  }
}

function writeState(patch) {
  const next = { ...readState(), ...patch, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORE_KEY, JSON.stringify(next));
  return next;
}

function readPan() {
  return Number(readState().panX || 0);
}

function writePan(panX) {
  writeState({ panX });
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
  const styleId = 'gannzilla-wheel-pan-buttons-patch-style-v4';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .gannzilla-wheel-pan-host{
      display:inline-flex!important;
      align-items:center!important;
      direction:ltr!important;
      margin-left:5px!important;
      margin-right:3px!important;
      gap:2px!important;
      vertical-align:middle!important;
    }
    .gannzilla-wheel-pan-btn{
      height:22px!important;
      min-width:26px!important;
      width:26px!important;
      border:1px solid #9b9b9b!important;
      border-radius:2px!important;
      background:#f7f7f7!important;
      color:#1c75bc!important;
      font-size:14px!important;
      font-weight:900!important;
      line-height:1!important;
      padding:0!important;
      margin:0!important;
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      cursor:pointer!important;
      box-sizing:border-box!important;
      vertical-align:middle!important;
      direction:ltr!important;
      visibility:visible!important;
      opacity:1!important;
      pointer-events:auto!important;
    }
    .gannzilla-wheel-pan-btn:hover{
      background:#dceeff!important;
      border-color:#6fa4ca!important;
    }
    .gannzilla-wheel-pan-btn.tools-hidden{
      color:#8a8a8a!important;
      background:#eeeeee!important;
    }
    [data-gannzilla-hide-old-quick-control="true"],
    [data-gannzilla-tools-toggle-hidden="true"]{
      display:none!important;
      visibility:hidden!important;
      width:0!important;
      min-width:0!important;
      height:0!important;
      min-height:0!important;
      padding:0!important;
      margin:0!important;
      border:0!important;
      overflow:hidden!important;
      pointer-events:none!important;
    }
  `;
  document.head.appendChild(style);
}

function textOf(node) {
  return (node?.textContent || '').replace(/\s+/g, ' ').trim();
}

function hideNode(node) {
  if (!node || node.closest?.('#gannzilla-wheel-pan-buttons-host-v2')) return;
  node.dataset.gannzillaHideOldQuickControl = 'true';
}

function hideOldQuickControls() {
  const buttons = Array.from(document.querySelectorAll('button'));
  buttons.forEach((button) => {
    const text = textOf(button);
    if (text === '90%' || text === '125%' || text === 'Pro Small' || text === 'Clockwise' || text === 'Counter') {
      hideNode(button);
    }
  });

  Array.from(document.querySelectorAll('span, div')).forEach((node) => {
    if (node.id === 'gannzilla-wheel-pan-buttons-host-v2' || node.closest?.('#gannzilla-wheel-pan-buttons-host-v2')) return;
    const text = textOf(node);
    const rect = node.getBoundingClientRect?.();
    if (!rect || rect.top > 36 || rect.height > 36) return;

    if (/^(🇬🇧\s*)?English$/.test(text) || /^GB\s*English$/i.test(text) || text === 'ⓘ' || text === 'ℹ' || text === 'ℹ️') {
      hideNode(node);
    }
  });
}

function findExactToolbarAnchor() {
  const buttons = Array.from(document.querySelectorAll('button'));
  const button90 = buttons.find((button) => textOf(button) === '90%');
  if (button90?.parentElement) return { parent: button90.parentElement, anchor: button90 };

  const button125 = buttons.find((button) => textOf(button) === '125%');
  if (button125?.parentElement) return { parent: button125.parentElement, anchor: button125 };

  const proSmall = buttons.find((button) => textOf(button) === 'Pro Small');
  if (proSmall?.parentElement) return { parent: proSmall.parentElement, anchor: proSmall };

  const toolbar = Array.from(document.querySelectorAll('div'))
    .map((node) => ({ node, text: textOf(node), rect: node.getBoundingClientRect?.() }))
    .filter(({ text, rect }) => rect && rect.top <= 28 && rect.height >= 18 && rect.height <= 40 && /90%|125%|Pro Small|Clockwise/.test(text))
    .sort((a, b) => b.text.length - a.text.length)[0]?.node;

  return toolbar ? { parent: toolbar, anchor: null } : null;
}

function makePanButton(label, title, delta) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'gannzilla-wheel-pan-btn';
  button.title = title;
  button.textContent = label;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    const next = Math.max(-700, Math.min(700, readPan() + delta));
    writePan(next);
    applyPan(next);
  }, true);
  return button;
}

function findToolBars() {
  const direct = [
    document.querySelector('[data-gannzilla-shortcut-bar="true"]'),
    document.querySelector('[data-gannzilla-safe-shape-toolbar="true"]')
  ].filter(Boolean);

  const heuristic = Array.from(document.querySelectorAll('div'))
    .filter((node) => {
      if (node.id === 'gannzilla-wheel-pan-buttons-host-v2' || node.closest?.('#gannzilla-wheel-pan-buttons-host-v2')) return false;
      if (direct.includes(node)) return false;
      const rect = node.getBoundingClientRect?.();
      if (!rect || rect.height < 120 || rect.width > 90 || rect.width < 18) return false;
      const text = textOf(node);
      const nearLeftWheel = rect.left > 220 && rect.left < 430 && /12|24|36|4|9|N/.test(text);
      const nearRightShapes = rect.right > window.innerWidth - 95 && /◁|□|⬠|⬡|⬟|◯|△|◎|◢/.test(text);
      return nearLeftWheel || nearRightShapes;
    });

  return Array.from(new Set([...direct, ...heuristic]));
}

function applyToolsVisibility() {
  const hidden = !!readState().toolsHidden;
  findToolBars().forEach((node) => {
    if (hidden) node.dataset.gannzillaToolsToggleHidden = 'true';
    else delete node.dataset.gannzillaToolsToggleHidden;
  });

  const toggleButton = document.querySelector('[data-gannzilla-tools-toggle-button="true"]');
  if (toggleButton) {
    toggleButton.classList.toggle('tools-hidden', hidden);
    toggleButton.textContent = hidden ? '☷' : '☰';
    toggleButton.title = hidden ? 'إظهار أدوات الصفحة الجانبية' : 'إخفاء أدوات الصفحة الجانبية';
  }
}

function makeToolsToggleButton() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'gannzilla-wheel-pan-btn';
  button.dataset.gannzillaToolsToggleButton = 'true';
  button.textContent = readState().toolsHidden ? '☷' : '☰';
  button.title = readState().toolsHidden ? 'إظهار أدوات الصفحة الجانبية' : 'إخفاء أدوات الصفحة الجانبية';
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    writeState({ toolsHidden: !readState().toolsHidden });
    applyToolsVisibility();
  }, true);
  return button;
}

function mountPanButtons() {
  installStyle();
  const found = findExactToolbarAnchor();
  if (!found?.parent) {
    hideOldQuickControls();
    applyToolsVisibility();
    return;
  }

  let host = document.getElementById('gannzilla-wheel-pan-buttons-host-v2');
  if (!host) {
    host = document.createElement('span');
    host.id = 'gannzilla-wheel-pan-buttons-host-v2';
    host.className = 'gannzilla-wheel-pan-host';
    host.dataset.gannzillaPanButtons = 'true';
    host.appendChild(makeToolsToggleButton());
    host.appendChild(makePanButton('◀', 'تحريك العجلة يسار', -40));
    host.appendChild(makePanButton('▶', 'تحريك العجلة يمين', 40));
  }

  if (host.parentElement !== found.parent || host.nextSibling !== found.anchor) {
    found.parent.insertBefore(host, found.anchor || found.parent.firstChild);
  }

  hideOldQuickControls();
  applyToolsVisibility();
}

export default function GannzillaWheelPanButtonsPatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    document.getElementById('gannzilla-wheel-pan-buttons-host-v1')?.remove();
    document.getElementById('gannzilla-wheel-pan-buttons-patch-style-v1')?.remove();
    document.getElementById('gannzilla-wheel-pan-buttons-patch-style-v2')?.remove();
    document.getElementById('gannzilla-wheel-pan-buttons-patch-style-v3')?.remove();

    mountPanButtons();
    applyPan(readPan());
    const timer = window.setInterval(() => {
      mountPanButtons();
      applyPan(readPan());
    }, 250);

    return () => {
      window.clearInterval(timer);
      document.getElementById('gannzilla-wheel-pan-buttons-host-v2')?.remove();
      document.getElementById('gannzilla-wheel-pan-buttons-patch-style-v4')?.remove();
      document.querySelectorAll('[data-gannzilla-hide-old-quick-control="true"]').forEach((node) => {
        delete node.dataset.gannzillaHideOldQuickControl;
      });
      document.querySelectorAll('[data-gannzilla-tools-toggle-hidden="true"]').forEach((node) => {
        delete node.dataset.gannzillaToolsToggleHidden;
      });
    };
  }, []);

  return null;
}
