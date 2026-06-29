import React from 'react';

export default function GannzillaSpiralDrawingFix() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

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

    const ensureSpiralSvg = () => {
      const canvas = getWheelCanvas();
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      let svg = document.querySelector('[data-gannzilla-true-spiral-overlay="true"]');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.dataset.gannzillaTrueSpiralOverlay = 'true';
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

    const spiralPath = ({ cx, cy, startR, endR, turns, phaseDeg, direction = 1, steps = 520 }) => {
      const points = [];
      const total = Math.PI * 2 * turns;
      const phase = (phaseDeg * Math.PI) / 180;
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const theta = phase + direction * total * t;
        const r = startR + (endR - startR) * t;
        const x = cx + r * Math.cos(theta);
        const y = cy + r * Math.sin(theta);
        points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
      }
      return points.join(' ');
    };

    const circle = (cx, cy, r, color, sw, dash = '') =>
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" ${dash ? `stroke-dasharray="${dash}"` : ''} opacity="0.78" />`;

    const drawTrueSpiral = () => {
      const holder = ensureSpiralSvg();
      if (!holder) return notify('لم يتم العثور على العجلة للرسم');
      const { svg, rect } = holder;
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const base = Math.min(w, h);
      const outer = base * 0.47;
      const inner = base * 0.045;
      const sw = Math.max(2, base * 0.0042);
      const green = '#55d8b1';
      const pink = '#f49ac2';
      const axis = 'rgba(120,120,120,0.48)';

      const greenMain = spiralPath({ cx, cy, startR: inner, endR: outer * 0.97, turns: 1.78, phaseDeg: 180, direction: -1 });
      const pinkMain = spiralPath({ cx, cy, startR: inner * 1.18, endR: outer * 1.05, turns: 1.72, phaseDeg: -12, direction: 1 });
      const greenInner = spiralPath({ cx, cy, startR: inner * 0.8, endR: outer * 0.42, turns: 1.25, phaseDeg: 18, direction: 1, steps: 300 });
      const pinkInner = spiralPath({ cx, cy, startR: inner * 0.85, endR: outer * 0.34, turns: 1.18, phaseDeg: 202, direction: -1, steps: 300 });

      svg.innerHTML = `
        <line x1="${cx - outer * 1.12}" y1="${cy}" x2="${cx + outer * 1.12}" y2="${cy}" stroke="${axis}" stroke-width="${Math.max(1, sw * 0.75)}" />
        <line x1="${cx}" y1="${cy - outer * 1.12}" x2="${cx}" y2="${cy + outer * 1.12}" stroke="${axis}" stroke-width="${Math.max(1, sw * 0.75)}" />
        ${circle(cx, cy, outer * 0.28, green, sw * 0.8)}
        ${circle(cx, cy, outer * 0.52, pink, sw * 0.8)}
        ${circle(cx, cy, outer * 0.82, green, sw * 0.8)}
        <path d="${greenMain}" fill="none" stroke="${green}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="0.86" />
        <path d="${pinkMain}" fill="none" stroke="${pink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="0.86" />
        <path d="${greenInner}" fill="none" stroke="${green}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="0.82" />
        <path d="${pinkInner}" fill="none" stroke="${pink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="0.82" />
      `;
      localStorage.setItem('tasi-gannzilla-selected-shape-v1', 'true-spiral');
      notify('تم رسم الحلزون مثل Gannzilla');
    };

    const clearSpiral = () => {
      document.querySelector('[data-gannzilla-true-spiral-overlay="true"]')?.remove();
    };

    const handleClick = (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const label = (button.textContent || '').trim();
      const title = (button.title || '').toLowerCase();
      if (label !== '◎' && !title.includes('spiral') && !title.includes('حلزون')) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      drawTrueSpiral();
    };

    const handleContext = (event) => {
      const canvas = getWheelCanvas();
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside || event.target.closest('button, input, select, aside')) return;
      clearSpiral();
    };

    const align = () => {
      if (localStorage.getItem('tasi-gannzilla-selected-shape-v1') === 'true-spiral') drawTrueSpiral();
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('contextmenu', handleContext, true);
    window.addEventListener('resize', align);
    window.addEventListener('scroll', align, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('contextmenu', handleContext, true);
      window.removeEventListener('resize', align);
      window.removeEventListener('scroll', align, true);
      clearSpiral();
    };
  }, []);

  return null;
}
