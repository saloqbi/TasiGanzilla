import React from 'react';

export default function GannzillaShapeGuard() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const SHAPE_LABELS = new Set(['◁', '□', '▢', '⬠', '⬡', '⬟', '⬢', '⬣', '◯', '△', '◢', '◎', '◆', '✺']);

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

    const ensureSvg = () => {
      const canvas = getWheelCanvas();
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      let svg = document.querySelector('[data-gannzilla-shape-guard-overlay="true"]');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.dataset.gannzillaShapeGuardOverlay = 'true';
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

    const polygonPoints = (cx, cy, r, sides, startDeg = -90) => Array.from({ length: sides }, (_, i) => {
      const rad = ((startDeg + (360 / sides) * i) * Math.PI) / 180;
      return `${(cx + r * Math.cos(rad)).toFixed(2)},${(cy + r * Math.sin(rad)).toFixed(2)}`;
    }).join(' ');

    const spiralPath = ({ cx, cy, startR, endR, turns, phaseDeg, direction = 1, steps = 520 }) => {
      const parts = [];
      const phase = (phaseDeg * Math.PI) / 180;
      const total = Math.PI * 2 * turns;
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const theta = phase + direction * total * t;
        const r = startR + (endR - startR) * t;
        const x = cx + r * Math.cos(theta);
        const y = cy + r * Math.sin(theta);
        parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
      }
      return parts.join(' ');
    };

    const drawShape = (label) => {
      const holder = ensureSvg();
      if (!holder) return notify('لم يتم العثور على العجلة');
      const { svg, rect } = holder;
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const base = Math.min(w, h);
      const r = base * 0.36;
      const sw = Math.max(2, base * 0.0042);
      const blue = '#5e9ad3';
      const green = '#55d8b1';
      const pink = '#f49ac2';
      const axis = 'rgba(125,125,125,0.45)';
      const common = `fill="rgba(94,154,211,0.15)" stroke="${blue}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`;
      const radialLines = (points) => points.map(([x, y]) => `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${blue}" stroke-width="${sw * 0.78}" opacity="0.78" />`).join('');

      document.querySelector('[data-gannzilla-drawing-overlay="true"]')?.remove();
      document.querySelector('[data-gannzilla-true-spiral-overlay="true"]')?.remove();

      let inner = '';
      if (label === '◎' || label === '✺') {
        const outer = base * 0.47;
        const innerR = base * 0.045;
        inner = `
          <line x1="${cx - outer * 1.12}" y1="${cy}" x2="${cx + outer * 1.12}" y2="${cy}" stroke="${axis}" stroke-width="${Math.max(1, sw * 0.65)}" />
          <line x1="${cx}" y1="${cy - outer * 1.12}" x2="${cx}" y2="${cy + outer * 1.12}" stroke="${axis}" stroke-width="${Math.max(1, sw * 0.65)}" />
          <circle cx="${cx}" cy="${cy}" r="${outer * 0.28}" fill="none" stroke="${green}" stroke-width="${sw * 0.72}" opacity="0.72" />
          <circle cx="${cx}" cy="${cy}" r="${outer * 0.52}" fill="none" stroke="${pink}" stroke-width="${sw * 0.72}" opacity="0.72" />
          <circle cx="${cx}" cy="${cy}" r="${outer * 0.82}" fill="none" stroke="${green}" stroke-width="${sw * 0.72}" opacity="0.72" />
          <path d="${spiralPath({ cx, cy, startR: innerR, endR: outer * 0.96, turns: 1.78, phaseDeg: 180, direction: -1 })}" fill="none" stroke="${green}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="0.86" />
          <path d="${spiralPath({ cx, cy, startR: innerR * 1.18, endR: outer * 1.04, turns: 1.72, phaseDeg: -12, direction: 1 })}" fill="none" stroke="${pink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="0.86" />
        `;
      } else if (label === '◯') {
        inner = `<circle cx="${cx}" cy="${cy}" r="${r}" ${common} /><line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="${blue}" stroke-width="${sw * 0.78}" opacity="0.72" /><line x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy + r}" stroke="${blue}" stroke-width="${sw * 0.78}" opacity="0.72" />`;
      } else if (label === '◢') {
        inner = `<path d="M ${cx} ${cy} L ${cx + r} ${cy} L ${cx} ${cy + r} Z" ${common} />`;
      } else {
        const sidesMap = { '◁': 3, '△': 3, '□': 4, '▢': 4, '◆': 4, '⬠': 5, '⬟': 5, '⬡': 6, '⬢': 6, '⬣': 7 };
        const sides = sidesMap[label] || 4;
        const start = label === '◁' ? 180 : label === '◆' ? -45 : -90;
        const points = polygonPoints(cx, cy, r, sides, start);
        const vertices = points.split(' ').map((p) => p.split(',').map(Number));
        inner = `<polygon points="${points}" ${common} />${radialLines(vertices)}`;
      }

      svg.innerHTML = inner;
      localStorage.setItem('tasi-gannzilla-selected-shape-v1', label === '◎' || label === '✺' ? 'true-spiral' : label);
      notify(label === '◎' || label === '✺' ? 'تم رسم الحلزون الصحيح' : `تم اختيار الشكل ${label}`);
    };

    const markSelected = (button) => {
      Array.from(document.querySelectorAll('[data-gannzilla-shape-guard-ready="true"]')).forEach((b) => {
        b.style.background = '#fbfbfb';
        b.style.border = '1px solid #d2d2d2';
        b.style.boxShadow = 'none';
        b.style.color = '#7c8b91';
      });
      button.style.background = '#eaf3ff';
      button.style.border = '1px solid #2f72bd';
      button.style.boxShadow = '0 0 0 2px rgba(47,114,189,.18)';
      button.style.color = '#174f94';
    };

    const handleClick = (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const label = (button.textContent || '').trim();
      if (!SHAPE_LABELS.has(label)) return;

      // يمنع أي كود آخر من تحويل العجلة إلى شبكة هندسية داخلية.
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      button.dataset.gannzillaShapeGuardReady = 'true';
      markSelected(button);
      drawShape(label);
    };

    const handleContext = (event) => {
      const canvas = getWheelCanvas();
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside || event.target.closest('button, input, select, aside')) return;
      document.querySelector('[data-gannzilla-shape-guard-overlay="true"]')?.remove();
      localStorage.removeItem('tasi-gannzilla-selected-shape-v1');
    };

    const align = () => {
      const selected = localStorage.getItem('tasi-gannzilla-selected-shape-v1');
      if (selected && selected !== 'true-spiral') drawShape(selected);
      if (selected === 'true-spiral') drawShape('◎');
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
      document.querySelector('[data-gannzilla-shape-guard-overlay="true"]')?.remove();
    };
  }, []);

  return null;
}
