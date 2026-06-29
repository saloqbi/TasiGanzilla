import React from 'react';

export default function GannzillaCellHighlightFix() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const highlights = new Map();
    let clickTimer = null;

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
      box._hideTimer = window.setTimeout(() => { box.remove(); }, 1200);
    };

    const getWheelCanvas = () => Array.from(document.querySelectorAll('canvas'))
      .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 120 && rect.height > 120)
      .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;

    const getViewSelect = () => Array.from(document.querySelectorAll('aside select')).find((select) =>
      Array.from(select.options || []).some((option) => (option.textContent || '').includes('Circle of 36'))
    );

    const getSizeValue = () => {
      const firstNumber = Array.from(document.querySelectorAll('aside input[type="number"]'))[0];
      const n = Number(firstNumber?.value);
      return Number.isFinite(n) && n > 0 ? n : 5;
    };

    const getDivisionsValue = () => {
      const select = getViewSelect();
      const n = Number(select?.value);
      return Number.isFinite(n) && n > 0 ? n : 36;
    };

    const getGeometry = () => {
      const canvas = getWheelCanvas();
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const levels = getSizeValue();
      const divisions = getDivisionsValue();
      const designSize = 470 + 96 * levels;
      const scale = rect.width / designSize;
      return {
        canvas,
        rect,
        w: rect.width,
        h: rect.height,
        cx: rect.width / 2,
        cy: rect.height / 2,
        innerR: 92 * scale,
        ringW: 48 * scale,
        levels,
        divisions
      };
    };

    const polar = (cx, cy, r, deg) => {
      const rad = ((deg - 90) * Math.PI) / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };

    const getCellFromEvent = (event) => {
      const g = getGeometry();
      if (!g) return null;
      const x = event.clientX - g.rect.left;
      const y = event.clientY - g.rect.top;
      const dx = x - g.cx;
      const dy = y - g.cy;
      const radius = Math.sqrt(dx * dx + dy * dy);
      if (radius < g.innerR || radius > g.innerR + g.ringW * g.levels) return null;
      const ring = Math.floor((radius - g.innerR) / g.ringW) + 1;
      if (ring < 1 || ring > g.levels) return null;
      const deg = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360;
      const sectorSize = 360 / g.divisions;
      const sector = Math.floor(deg / sectorSize);
      return { ...g, ring, sector, sectorSize, key: `${ring}|${sector}|${g.divisions}` };
    };

    const nextState = (state) => {
      if (!state) return 'green';
      if (state === 'green') return 'red';
      if (state === 'red') return 'yellow';
      if (state === 'yellow') return 'gray';
      return 'green';
    };

    const colorForState = (state) => ({
      green: 'rgba(40, 210, 90, 0.24)',
      red: 'rgba(255, 70, 90, 0.22)',
      yellow: 'rgba(255, 235, 0, 0.34)',
      gray: 'rgba(80, 80, 80, 0.20)'
    }[state] || 'transparent');

    const arabicColorName = (state) => ({
      green: 'أخضر شفاف',
      red: 'أحمر شفاف',
      yellow: 'أصفر شفاف',
      gray: 'رمادي شفاف'
    }[state] || '');

    const wedgePath = (cell) => {
      const gap = Math.max(0.18, cell.sectorSize * 0.03);
      const inner = cell.innerR + (cell.ring - 1) * cell.ringW + 1;
      const outer = inner + cell.ringW - 2;
      const start = cell.sector * cell.sectorSize + gap;
      const end = (cell.sector + 1) * cell.sectorSize - gap;
      const p1 = polar(cell.cx, cell.cy, outer, start);
      const p2 = polar(cell.cx, cell.cy, outer, end);
      const p3 = polar(cell.cx, cell.cy, inner, end);
      const p4 = polar(cell.cx, cell.cy, inner, start);
      const large = end - start > 180 ? 1 : 0;
      return `M ${p1.x} ${p1.y} A ${outer} ${outer} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${inner} ${inner} 0 ${large} 0 ${p4.x} ${p4.y} Z`;
    };

    const ensureSvg = () => {
      const g = getGeometry();
      if (!g) return null;
      let svg = document.querySelector('[data-gannzilla-cell-color-layer="true"]');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.dataset.gannzillaCellColorLayer = 'true';
        document.body.appendChild(svg);
      }
      svg.setAttribute('viewBox', `0 0 ${g.w} ${g.h}`);
      Object.assign(svg.style, {
        position: 'fixed',
        left: `${g.rect.left}px`,
        top: `${g.rect.top}px`,
        width: `${g.w}px`,
        height: `${g.h}px`,
        zIndex: '42',
        pointerEvents: 'none',
        overflow: 'visible',
        mixBlendMode: 'multiply'
      });
      return { svg, g };
    };

    const render = () => {
      const holder = ensureSvg();
      if (!holder) return;
      const { svg, g } = holder;
      const parts = [];
      highlights.forEach((state, key) => {
        const [ringText, sectorText, divText] = key.split('|');
        const ring = Number(ringText);
        const sector = Number(sectorText);
        const divisions = Number(divText);
        if (!state || divisions !== g.divisions || ring > g.levels) return;
        const cell = { ...g, ring, sector, sectorSize: 360 / divisions };
        parts.push(`<path d="${wedgePath(cell)}" fill="${colorForState(state)}" stroke="none" shape-rendering="geometricPrecision" />`);
      });
      svg.innerHTML = parts.join('');
    };

    const shouldIgnore = (event) => event.target.closest('button, input, select, aside, [data-gannzilla-shortcut-bar="true"]');

    const handleClick = (event) => {
      if (event.button !== 0 || shouldIgnore(event)) return;
      const cell = getCellFromEvent(event);
      if (!cell) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.clearTimeout(clickTimer);
      clickTimer = window.setTimeout(() => {
        const state = nextState(highlights.get(cell.key));
        highlights.set(cell.key, state);
        render();
        notify(`تم تلوين الخلية: ${arabicColorName(state)}`);
      }, 170);
    };

    const handleDoubleClick = (event) => {
      if (event.button !== 0 || shouldIgnore(event)) return;
      const cell = getCellFromEvent(event);
      if (!cell) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.clearTimeout(clickTimer);
      highlights.delete(cell.key);
      render();
      notify('تم مسح لون الخلية بدبل كلك');
    };

    const handleRightClick = (event) => {
      const canvas = getWheelCanvas();
      if (!canvas || shouldIgnore(event)) return;
      const rect = canvas.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) return;
      document.querySelector('[data-gannzilla-drawing-overlay="true"]')?.remove();
      notify('تم إخفاء ومسح الرسم بكلك يمين');
    };

    const align = () => render();
    document.addEventListener('click', handleClick, true);
    document.addEventListener('dblclick', handleDoubleClick, true);
    document.addEventListener('contextmenu', handleRightClick, true);
    window.addEventListener('resize', align);
    window.addEventListener('scroll', align, true);
    const timer = window.setInterval(align, 500);
    render();

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(clickTimer);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('dblclick', handleDoubleClick, true);
      document.removeEventListener('contextmenu', handleRightClick, true);
      window.removeEventListener('resize', align);
      window.removeEventListener('scroll', align, true);
      document.querySelector('[data-gannzilla-cell-color-layer="true"]')?.remove();
    };
  }, []);

  return null;
}
