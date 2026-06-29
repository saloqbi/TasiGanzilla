import React from 'react';

export default function GannzillaLeftPolygonToolFix() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const POLYGON_TOOLS = {
      '◆': { sides: 4, rotation: -45, label: 'Diamond' },
      '⬟': { sides: 5, rotation: -90, label: 'Pentagon' },
      '⬢': { sides: 6, rotation: -90, label: 'Hexagon' },
      '⬣': { sides: 7, rotation: -90, label: 'Heptagon' },
      '✺': { sides: 9, rotation: -90, label: 'Multi-point polygon' }
    };

    const notify = (message) => {
      let box = document.querySelector('[data-gannzilla-toast="true"]');
      if (!box) {
        box = document.createElement('div');
        box.dataset.gannzillaToast = 'true';
        document.body.appendChild(box);
      }
      Object.assign(box.style, {
        position: 'fixed',
        right: '18px',
        bottom: '18px',
        zIndex: '9999',
        background: '#222',
        color: '#fff',
        border: '1px solid #999',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '14px',
        fontWeight: '800',
        boxShadow: '0 8px 24px rgba(0,0,0,.25)',
        direction: 'rtl'
      });
      box.textContent = message;
      window.clearTimeout(box._hideTimer);
      box._hideTimer = window.setTimeout(() => { box.remove(); }, 1400);
    };

    const getWheelCanvas = () => Array.from(document.querySelectorAll('canvas'))
      .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 120 && rect.height > 120)
      .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;

    const polygonPoints = (cx, cy, r, sides, rotationDeg) => Array.from({ length: sides }, (_, i) => {
      const deg = rotationDeg + (360 / sides) * i;
      const rad = (deg * Math.PI) / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    });

    const pointsAttr = (points) => points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

    const makeIconSvg = (tool, active) => {
      const size = 32;
      const cx = 16;
      const cy = 16;
      const r = 12;
      const points = polygonPoints(cx, cy, r, tool.sides, tool.rotation);
      const fill = active ? '#2f3437' : '#85898c';
      const stroke = active ? '#1b1f21' : '#6f7477';
      const dotFill = '#ffffff';
      const dots = points.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="1.8" fill="${dotFill}" opacity="0.95" />`).join('') +
        `<circle cx="${cx}" cy="${cy}" r="2" fill="${dotFill}" opacity="0.95" />`;
      return `
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" style="display:block">
          <polygon points="${pointsAttr(points)}" fill="${fill}" stroke="${stroke}" stroke-width="1.15" stroke-linejoin="round" />
          ${dots}
        </svg>
      `;
    };

    const restyleLeftPolygonIcons = () => {
      Array.from(document.querySelectorAll('[data-gannzilla-shortcut-button="true"]')).forEach((button) => {
        const rawLabel = (button.dataset.gannzillaPolygonLabel || button.textContent || '').trim();
        const tool = POLYGON_TOOLS[rawLabel];
        if (!tool) return;
        button.dataset.gannzillaPolygonLabel = rawLabel;
        button.dataset.gannzillaPolygonTool = 'true';
        const active = button.dataset.gannzillaPolygonActive === 'true';
        button.innerHTML = makeIconSvg(tool, active);
        Object.assign(button.style, {
          width: '42px',
          height: '42px',
          minWidth: '42px',
          minHeight: '42px',
          padding: '4px',
          borderRadius: '9px',
          border: active ? '2px solid #3e6ea8' : '1px solid #d0d0d0',
          background: active ? '#eef6ff' : '#ffffff',
          boxShadow: active ? '0 0 0 2px rgba(62,110,168,.16)' : '0 1px 2px rgba(0,0,0,.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        });
      });
    };

    const clearOldShapeOverlays = () => {
      document.querySelector('[data-gannzilla-drawing-overlay="true"]')?.remove();
      document.querySelector('[data-gannzilla-shape-guard-overlay="true"]')?.remove();
      document.querySelector('[data-gannzilla-true-spiral-overlay="true"]')?.remove();
      document.querySelector('[data-gannzilla-polygon-tool-overlay="true"]')?.remove();
    };

    const ensureOverlay = () => {
      const canvas = getWheelCanvas();
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      let svg = document.querySelector('[data-gannzilla-polygon-tool-overlay="true"]');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.dataset.gannzillaPolygonToolOverlay = 'true';
        document.body.appendChild(svg);
      }
      svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
      Object.assign(svg.style, {
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        zIndex: '43',
        pointerEvents: 'none',
        overflow: 'visible'
      });
      return { svg, rect };
    };

    const drawPolygonInWheel = (label) => {
      const tool = POLYGON_TOOLS[label];
      const holder = ensureOverlay();
      if (!tool || !holder) return;
      const { svg, rect } = holder;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const base = Math.min(rect.width, rect.height);
      // داخل إطار العجلة، ليس تحويلًا للعجلة نفسها.
      const r = base * 0.255;
      const points = polygonPoints(cx, cy, r, tool.sides, tool.rotation);
      const strokeWidth = Math.max(2, base * 0.0034);
      const vertexDots = points.map((p) => `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${Math.max(4, strokeWidth * 1.7)}" fill="#8a8a8a" stroke="#555" stroke-width="${Math.max(1, strokeWidth * 0.35)}" />`).join('');
      const radialLines = points.map((p) => `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(2)}" y2="${p.y.toFixed(2)}" stroke="#777" stroke-width="${strokeWidth * 0.45}" opacity="0.28" />`).join('');

      clearOldShapeOverlays();
      const { svg: freshSvg } = ensureOverlay();
      freshSvg.innerHTML = `
        <polygon points="${pointsAttr(points)}" fill="rgba(80,80,80,0.035)" stroke="#6f6f6f" stroke-width="${strokeWidth}" stroke-linejoin="round" />
        ${radialLines}
        ${vertexDots}
        <circle cx="${cx}" cy="${cy}" r="${Math.max(3, strokeWidth * 1.25)}" fill="#777" opacity="0.48" />
      `;
      localStorage.setItem('tasi-gannzilla-selected-left-polygon-v1', label);
      notify(`تم رسم ${tool.label} داخل إطار العجلة`);
    };

    const setActiveButton = (label) => {
      Array.from(document.querySelectorAll('[data-gannzilla-polygon-tool="true"]')).forEach((button) => {
        button.dataset.gannzillaPolygonActive = button.dataset.gannzillaPolygonLabel === label ? 'true' : 'false';
      });
      restyleLeftPolygonIcons();
    };

    const handleClick = (event) => {
      const button = event.target.closest('[data-gannzilla-shortcut-button="true"]');
      const label = (button?.dataset.gannzillaPolygonLabel || button?.textContent || '').trim();
      if (!button || !POLYGON_TOOLS[label]) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setActiveButton(label);
      drawPolygonInWheel(label);
    };

    const handleContext = (event) => {
      const canvas = getWheelCanvas();
      if (!canvas || event.target.closest('button, input, select, aside')) return;
      const rect = canvas.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) return;
      document.querySelector('[data-gannzilla-polygon-tool-overlay="true"]')?.remove();
      Array.from(document.querySelectorAll('[data-gannzilla-polygon-tool="true"]')).forEach((button) => { button.dataset.gannzillaPolygonActive = 'false'; });
      restyleLeftPolygonIcons();
      localStorage.removeItem('tasi-gannzilla-selected-left-polygon-v1');
    };

    const align = () => {
      restyleLeftPolygonIcons();
      const selected = localStorage.getItem('tasi-gannzilla-selected-left-polygon-v1');
      if (selected && POLYGON_TOOLS[selected]) {
        setActiveButton(selected);
        drawPolygonInWheel(selected);
      }
    };

    const timer = window.setInterval(align, 400);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('contextmenu', handleContext, true);
    window.addEventListener('resize', align);
    window.addEventListener('scroll', align, true);
    align();

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('contextmenu', handleContext, true);
      window.removeEventListener('resize', align);
      window.removeEventListener('scroll', align, true);
      document.querySelector('[data-gannzilla-polygon-tool-overlay="true"]')?.remove();
    };
  }, []);

  return null;
}
