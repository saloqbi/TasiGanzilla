import React from 'react';

export default function GannzillaFrameShapeMode() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const TOOL_MAP = {
      '◆': { sides: 4, rotation: -45, name: 'Diamond' },
      '⬟': { sides: 5, rotation: -90, name: 'Pentagon' },
      '⬢': { sides: 6, rotation: -90, name: 'Hexagon' },
      '⬣': { sides: 7, rotation: -90, name: 'Heptagon' },
      '✺': { sides: 8, rotation: -90, name: 'Octagon' }
    };

    let currentTool = null;
    let renderTimer = null;

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
      .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0] || null;

    const getSizeValue = () => {
      const firstNumber = Array.from(document.querySelectorAll('aside input[type="number"]'))[0];
      const n = Number(firstNumber?.value);
      return Number.isFinite(n) && n > 0 ? Math.max(1, Math.min(12, Math.round(n))) : 5;
    };

    const getDivisionsValue = () => {
      const select = Array.from(document.querySelectorAll('aside select')).find((s) =>
        Array.from(s.options || []).some((o) => (o.textContent || '').includes('Circle of 36'))
      );
      const n = Number(select?.value);
      return Number.isFinite(n) && n > 0 ? n : 36;
    };

    const getStartValue = () => {
      const numbers = Array.from(document.querySelectorAll('aside input[type="number"]'));
      const n = Number(numbers[1]?.value);
      return Number.isFinite(n) ? n : 1;
    };

    const getIncrement = () => {
      const numbers = Array.from(document.querySelectorAll('aside input[type="number"]'));
      const n = Number(numbers[3]?.value);
      return Number.isFinite(n) && n !== 0 ? n : 1;
    };

    const clearShapeLayers = () => {
      document.querySelector('[data-gannzilla-frame-shape-layer="true"]')?.remove();
      document.querySelector('[data-gannzilla-polygon-tool-overlay="true"]')?.remove();
      document.querySelector('[data-gannzilla-shape-guard-overlay="true"]')?.remove();
      document.querySelector('[data-gannzilla-drawing-overlay="true"]')?.remove();
      document.querySelector('[data-gannzilla-true-spiral-overlay="true"]')?.remove();
    };

    const polygonPoints = (cx, cy, r, sides, rotationDeg) => Array.from({ length: sides }, (_, i) => {
      const rad = ((rotationDeg + (360 / sides) * i) * Math.PI) / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad), deg: rotationDeg + (360 / sides) * i };
    });

    const interpolate = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

    const pointOnPolygon = (cx, cy, r, sides, rotationDeg, sectorIndex, sectors) => {
      const sidesPoints = polygonPoints(cx, cy, r, sides, rotationDeg);
      const u = (sectorIndex / sectors) * sides;
      const side = Math.floor(u) % sides;
      const t = u - Math.floor(u);
      return interpolate(sidesPoints[side], sidesPoints[(side + 1) % sides], t);
    };

    const polygonPath = (cx, cy, r, sides, rotationDeg) => {
      const pts = polygonPoints(cx, cy, r, sides, rotationDeg);
      return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + ' Z';
    };

    const iconSvg = (tool, active) => {
      const cx = 16;
      const cy = 16;
      const pts = polygonPoints(cx, cy, 12, tool.sides, tool.rotation);
      const fill = active ? '#2f3437' : '#85898c';
      const stroke = active ? '#1b1f21' : '#707579';
      const dots = pts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="1.8" fill="#fff" />`).join('') +
        `<circle cx="${cx}" cy="${cy}" r="2" fill="#fff" />`;
      return `<svg width="32" height="32" viewBox="0 0 32 32" style="display:block"><path d="${polygonPath(cx, cy, 12, tool.sides, tool.rotation)}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round" />${dots}</svg>`;
    };

    const restyleIcons = () => {
      Array.from(document.querySelectorAll('[data-gannzilla-shortcut-button="true"]')).forEach((button) => {
        const label = (button.dataset.gannzillaFrameShapeLabel || button.dataset.gannzillaPolygonLabel || button.textContent || '').trim();
        const tool = TOOL_MAP[label];
        if (!tool) return;
        button.dataset.gannzillaFrameShapeLabel = label;
        button.innerHTML = iconSvg(tool, currentTool === label);
        Object.assign(button.style, {
          width: '42px',
          height: '42px',
          minWidth: '42px',
          minHeight: '42px',
          padding: '4px',
          borderRadius: '9px',
          border: currentTool === label ? '2px solid #3e6ea8' : '1px solid #d0d0d0',
          background: currentTool === label ? '#eef6ff' : '#fff',
          boxShadow: currentTool === label ? '0 0 0 2px rgba(62,110,168,.16)' : '0 1px 2px rgba(0,0,0,.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        });
      });
    };

    const drawFrameShape = () => {
      if (!currentTool) return;
      const tool = TOOL_MAP[currentTool];
      const found = getWheelCanvas();
      if (!tool || !found) return;

      const { canvas, rect } = found;
      const w = rect.width;
      const h = rect.height;
      const dpr = window.devicePixelRatio || 1;
      let layer = document.querySelector('[data-gannzilla-frame-shape-layer="true"]');
      if (!layer) {
        layer = document.createElement('canvas');
        layer.dataset.gannzillaFrameShapeLayer = 'true';
        document.body.appendChild(layer);
      }

      Object.assign(layer.style, {
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${w}px`,
        height: `${h}px`,
        zIndex: '44',
        pointerEvents: 'none',
        background: '#fff'
      });
      layer.width = Math.ceil(w * dpr);
      layer.height = Math.ceil(h * dpr);

      // نخفي العجلة الدائرية فقط بصريًا عند اختيار شكل، حتى يكون التغيير للشكل نفسه.
      canvas.style.opacity = '0.001';

      const ctx = layer.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;

      const levels = getSizeValue();
      const divisions = getDivisionsValue();
      const startValue = getStartValue();
      const increment = getIncrement();
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) * 0.43;
      const innerR = Math.max(24, maxR * 0.10);
      const step = (maxR - innerR) / levels;
      const sides = tool.sides;
      const rotation = tool.rotation;

      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `800 ${Math.max(10, Math.min(16, step * 0.34))}px Segoe UI, Arial, sans-serif`;

      // حلقات الشكل الحقيقي.
      for (let ring = 0; ring <= levels; ring += 1) {
        const r = innerR + ring * step;
        ctx.beginPath();
        const pts = polygonPoints(cx, cy, r, sides, rotation);
        pts.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.strokeStyle = ring === levels ? '#bdbdbd' : '#dedede';
        ctx.lineWidth = ring === levels ? Math.max(2, step * 0.05) : 1;
        ctx.stroke();
      }

      // خطوط القطاعات داخل نفس إطار الشكل.
      ctx.strokeStyle = '#ededed';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < divisions; i += 1) {
        const a = pointOnPolygon(cx, cy, innerR, sides, rotation, i, divisions);
        const b = pointOnPolygon(cx, cy, maxR, sides, rotation, i, divisions);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // الأرقام داخل خلايا نفس الشكل، وليس overlay فوق العجلة.
      ctx.fillStyle = '#111';
      for (let ring = 1; ring <= levels; ring += 1) {
        const r = innerR + (ring - 0.5) * step;
        for (let i = 0; i < divisions; i += 1) {
          const p = pointOnPolygon(cx, cy, r, sides, rotation, i + 0.5, divisions);
          const value = startValue + ((ring - 1) * divisions + i) * increment;
          const text = Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
          ctx.fillText(text, p.x, p.y);
        }
      }

      // مركز الشكل.
      ctx.beginPath();
      const centerPts = polygonPoints(cx, cy, Math.max(9, innerR * 0.34), sides, rotation);
      centerPts.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
      ctx.closePath();
      ctx.strokeStyle = '#d0d0d0';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const selectTool = (label) => {
      currentTool = label;
      localStorage.setItem('tasi-gannzilla-frame-shape-v1', label);
      clearShapeLayers();
      restyleIcons();
      drawFrameShape();
      notify(`تم تغيير إطار العجلة إلى ${TOOL_MAP[label].name}`);
    };

    const restoreCircle = () => {
      currentTool = null;
      localStorage.removeItem('tasi-gannzilla-frame-shape-v1');
      clearShapeLayers();
      const found = getWheelCanvas();
      if (found?.canvas) found.canvas.style.opacity = '1';
      restyleIcons();
      notify('تم الرجوع إلى إطار الدائرة');
    };

    const handleClick = (event) => {
      const button = event.target.closest('[data-gannzilla-shortcut-button="true"]');
      const label = (button?.dataset.gannzillaFrameShapeLabel || button?.dataset.gannzillaPolygonLabel || button?.textContent || '').trim();
      if (!button || !TOOL_MAP[label]) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      selectTool(label);
    };

    const handleContext = (event) => {
      const found = getWheelCanvas();
      if (!found || event.target.closest('button, input, select, aside')) return;
      const { rect } = found;
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) return;
      event.preventDefault();
      event.stopPropagation();
      restoreCircle();
    };

    const align = () => {
      const saved = localStorage.getItem('tasi-gannzilla-frame-shape-v1');
      if (saved && TOOL_MAP[saved]) currentTool = saved;
      restyleIcons();
      if (currentTool) drawFrameShape();
      else {
        const found = getWheelCanvas();
        if (found?.canvas) found.canvas.style.opacity = '1';
      }
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('contextmenu', handleContext, true);
    window.addEventListener('resize', align);
    window.addEventListener('scroll', align, true);
    const timer = window.setInterval(align, 500);
    align();

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('contextmenu', handleContext, true);
      window.removeEventListener('resize', align);
      window.removeEventListener('scroll', align, true);
      const found = getWheelCanvas();
      if (found?.canvas) found.canvas.style.opacity = '1';
      clearShapeLayers();
    };
  }, []);

  return null;
}
