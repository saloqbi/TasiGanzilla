import React from 'react';

export default function GannzillaProUiPatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const setImportant = (el, prop, value) => el.style.setProperty(prop, value, 'important');

    const notify = (message) => {
      let box = document.querySelector('[data-gannzilla-toast="true"]');
      if (!box) {
        box = document.createElement('div');
        box.dataset.gannzillaToast = 'true';
        document.body.appendChild(box);
      }
      Object.assign(box.style, {
        position: 'fixed', right: '18px', bottom: '18px', zIndex: '9999',
        background: '#222', color: '#fff', border: '1px solid #999', borderRadius: '8px',
        padding: '10px 14px', fontSize: '14px', fontWeight: '800',
        boxShadow: '0 8px 24px rgba(0,0,0,.25)', direction: 'rtl'
      });
      box.textContent = message;
      window.clearTimeout(box._hideTimer);
      box._hideTimer = window.setTimeout(() => { box.remove(); }, 1300);
    };

    const getPanel = () => document.querySelector('aside');
    const getWheelCanvas = () => Array.from(document.querySelectorAll('canvas'))
      .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 120 && rect.height > 120)
      .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;

    const dispatchChange = (el) => {
      if (!el) return;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const findViewSelect = () => Array.from(document.querySelectorAll('aside select')).find((select) =>
      Array.from(select.options || []).some((option) => (option.textContent || '').includes('Circle of 36'))
    );

    const ensureDivisionOptions = (select) => {
      if (!select) return;
      ['12', '24', '36', '60', '90', '360'].forEach((value) => {
        if (!Array.from(select.options || []).some((option) => option.value === value)) {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = `Circle of ${value}`;
          const before = Array.from(select.options || []).find((o) => Number(o.value) > Number(value));
          select.insertBefore(option, before || null);
        }
      });
    };

    const setSelectNativeValue = (select, value) => {
      const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(select), 'value');
      if (descriptor?.set) descriptor.set.call(select, value);
      else select.value = value;
    };

    const setCircle = (value) => {
      const text = String(value);
      localStorage.setItem('tasi-gannzilla-divisions-override-v1', text);
      const select = findViewSelect();
      if (select) {
        ensureDivisionOptions(select);
        setSelectNativeValue(select, text);
        dispatchChange(select);
      }
      window.dispatchEvent(new CustomEvent('gannzilla:division-change', { detail: { divisions: Number(value) } }));
      markCircleButtons(text);
      notify(`تم اختيار Circle of ${text}`);
    };

    const setSize = (value) => {
      const input = Array.from(document.querySelectorAll('aside input[type="number"]'))[0];
      if (!input) return notify('لم يتم العثور على Size');
      input.value = String(value);
      dispatchChange(input);
      notify(`تم ضبط Size = ${value}`);
    };

    const toggleFirstClockwise = () => {
      const rows = Array.from(document.querySelectorAll('aside div'));
      const row = rows.find((el) => (el.textContent || '').trim().startsWith('Clockwise') && el.querySelector('input[type="checkbox"]'));
      const input = row?.querySelector('input[type="checkbox"]');
      if (!input) return notify('لم يتم العثور على Clockwise');
      input.click();
      notify(input.checked ? 'الاتجاه: مع عقارب الساعة' : 'الاتجاه: عكس عقارب الساعة');
    };

    const saveSettings = () => {
      const inputs = Array.from(document.querySelectorAll('aside input, aside select'));
      const values = inputs.map((input) => ({ tag: input.tagName, type: input.type || '', value: input.type === 'checkbox' ? input.checked : input.value }));
      localStorage.setItem('tasi-gannzilla-wheel-settings-v1', JSON.stringify({ values, savedAt: new Date().toISOString() }));
      notify('تم حفظ إعدادات العجلة');
    };

    const polygonPoints = (cx, cy, r, sides, startDeg = -90) => Array.from({ length: sides }, (_, i) => {
      const rad = ((startDeg + (360 / sides) * i) * Math.PI) / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    });

    const pointsAttr = (points) => points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

    const getCanvasBox = () => {
      const canvas = getWheelCanvas();
      if (!canvas) return null;
      return { canvas, rect: canvas.getBoundingClientRect() };
    };

    const resetRightSelection = () => {
      Array.from(document.querySelectorAll('[data-gannzilla-right-shape-button="true"]')).forEach((button) => {
        const shape = button.dataset.shape || '';
        button.innerHTML = makeRightIcon(shape, false);
        Object.assign(button.style, { background: '#fbfbfb', border: '1px solid #d2d2d2', boxShadow: 'none' });
      });
    };

    const clearDrawing = () => {
      document.querySelector('[data-gannzilla-drawing-overlay="true"]')?.remove();
      document.querySelector('[data-gannzilla-true-spiral-overlay="true"]')?.remove();
      document.querySelector('[data-gannzilla-shape-guard-overlay="true"]')?.remove();
      localStorage.removeItem('tasi-gannzilla-selected-shape-v1');
      resetRightSelection();
    };

    const ensureDrawingSvg = () => {
      const box = getCanvasBox();
      if (!box) return null;
      const { rect } = box;
      let svg = document.querySelector('[data-gannzilla-drawing-overlay="true"]');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.dataset.gannzillaDrawingOverlay = 'true';
        document.body.appendChild(svg);
      }
      svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
      Object.assign(svg.style, {
        position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`,
        width: `${rect.width}px`, height: `${rect.height}px`, zIndex: '43',
        pointerEvents: 'none', overflow: 'visible'
      });
      return { svg, rect };
    };

    const spiralPath = ({ cx, cy, startR, endR, turns, phaseDeg, direction = 1, steps = 520 }) => {
      const parts = [];
      const phase = (phaseDeg * Math.PI) / 180;
      const total = Math.PI * 2 * turns;
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const theta = phase + direction * total * t;
        const r = startR + (endR - startR) * t;
        parts.push(`${i === 0 ? 'M' : 'L'} ${(cx + r * Math.cos(theta)).toFixed(2)} ${(cy + r * Math.sin(theta)).toFixed(2)}`);
      }
      return parts.join(' ');
    };

    const drawRightShape = (shape) => {
      const holder = ensureDrawingSvg();
      if (!holder) return notify('لم يتم العثور على العجلة للرسم');
      const { svg, rect } = holder;
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const base = Math.min(w, h);
      const r = base * 0.34;
      const sw = Math.max(2, base * 0.004);
      const blue = '#5e9ad3';
      const common = `fill="rgba(94,154,211,0.14)" stroke="${blue}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`;
      const line = (x1, y1, x2, y2, color = blue, width = sw) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" opacity="0.82" />`;
      const radialLines = (pts) => pts.map((p) => line(cx, cy, p.x, p.y, blue, sw * 0.7)).join('');
      let inner = '';

      if (shape === 'line') inner = line(cx - r, cy, cx + r, cy);
      else if (shape === 'text') inner = `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="#245f9b" font-size="${Math.max(18, r * 0.18)}" font-weight="800">TEXT</text>`;
      else if (shape === '◎') {
        const outer = base * 0.47;
        const start = base * 0.045;
        const green = '#55d8b1';
        const pink = '#f49ac2';
        inner = `
          ${line(cx - outer * 1.12, cy, cx + outer * 1.12, cy, 'rgba(125,125,125,.45)', sw * 0.65)}
          ${line(cx, cy - outer * 1.12, cx, cy + outer * 1.12, 'rgba(125,125,125,.45)', sw * 0.65)}
          <circle cx="${cx}" cy="${cy}" r="${outer * 0.28}" fill="none" stroke="${green}" stroke-width="${sw * 0.72}" opacity="0.72" />
          <circle cx="${cx}" cy="${cy}" r="${outer * 0.52}" fill="none" stroke="${pink}" stroke-width="${sw * 0.72}" opacity="0.72" />
          <circle cx="${cx}" cy="${cy}" r="${outer * 0.82}" fill="none" stroke="${green}" stroke-width="${sw * 0.72}" opacity="0.72" />
          <path d="${spiralPath({ cx, cy, startR: start, endR: outer * 0.96, turns: 1.78, phaseDeg: 180, direction: -1 })}" fill="none" stroke="${green}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="0.86" />
          <path d="${spiralPath({ cx, cy, startR: start * 1.18, endR: outer * 1.04, turns: 1.72, phaseDeg: -12, direction: 1 })}" fill="none" stroke="${pink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="0.86" />
        `;
      } else if (shape === '◯') inner = `<circle cx="${cx}" cy="${cy}" r="${r}" ${common} />${line(cx - r, cy, cx + r, cy)}${line(cx, cy - r, cx, cy + r)}`;
      else if (shape === '◢') inner = `<path d="M ${cx} ${cy} L ${cx + r} ${cy} L ${cx} ${cy + r} Z" ${common} />`;
      else {
        const sidesMap = { '◁': 3, '△': 3, '□': 4, '⬠': 5, '⬟': 5, '⬡': 6 };
        const startMap = { '◁': 180, '△': -90, '□': -45, '⬠': -90, '⬟': -90, '⬡': -90 };
        const pts = polygonPoints(cx, cy, r, sidesMap[shape] || 4, startMap[shape] ?? -90);
        inner = `<polygon points="${pointsAttr(pts)}" ${common} />${radialLines(pts)}`;
      }
      svg.innerHTML = inner;
      localStorage.setItem('tasi-gannzilla-selected-shape-v1', shape);
      notify(shape === '◎' ? 'تم رسم الحلزون' : `تم اختيار الشكل ${shape}`);
    };

    function makeRightIcon(shape, active) {
      const cx = 16, cy = 16;
      const stroke = active ? '#5e9ad3' : '#aeb8bd';
      const fill = active ? 'rgba(94,154,211,.12)' : 'rgba(250,250,250,.9)';
      const sw = active ? 2 : 1.5;
      if (shape === '◯') return `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="10" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></svg>`;
      if (shape === '◎') return `<svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="2" fill="${stroke}"/><path d="M16 16c8-9 13 1 4 5s-13-4-4-10s17 1 7 12" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/></svg>`;
      if (shape === '◢') return `<svg viewBox="0 0 32 32" width="24" height="24"><path d="M9 23 L23 23 L23 9 Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></svg>`;
      const sidesMap = { '◁': 3, '△': 3, '□': 4, '⬠': 5, '⬟': 5, '⬡': 6 };
      const startMap = { '◁': 180, '△': -90, '□': -45, '⬠': -90, '⬟': -90, '⬡': -90 };
      const pts = polygonPoints(cx, cy, 10.5, sidesMap[shape] || 4, startMap[shape] ?? -90);
      return `<svg viewBox="0 0 32 32" width="24" height="24"><polygon points="${pointsAttr(pts)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/></svg>`;
    }

    const makeButton = (shape) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.gannzillaRightShapeButton = 'true';
      button.dataset.shape = shape;
      button.title = `Gannzilla shape ${shape}`;
      button.innerHTML = makeRightIcon(shape, false);
      Object.assign(button.style, {
        width: '28px', height: '28px', minWidth: '28px', minHeight: '28px',
        border: '1px solid #d2d2d2', borderRadius: shape === '◎' ? '50%' : '3px',
        background: '#fbfbfb', padding: '1px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', pointerEvents: 'auto'
      });
      button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        resetRightSelection();
        button.innerHTML = makeRightIcon(shape, true);
        Object.assign(button.style, { background: '#eaf3ff', border: '1px solid #2f72bd', boxShadow: '0 0 0 2px rgba(47,114,189,.18)' });
        drawRightShape(shape);
      };
      return button;
    };

    const ensureRightShapeBar = () => {
      let bar = document.querySelector('[data-gannzilla-safe-shape-toolbar="true"]');
      if (!bar) {
        bar = document.createElement('div');
        bar.dataset.gannzillaSafeShapeToolbar = 'true';
        Object.assign(bar.style, {
          position: 'fixed', right: '18px', top: '150px', zIndex: '95',
          display: 'flex', flexDirection: 'column', gap: '8px', padding: '7px',
          width: '44px', background: 'rgba(255,255,255,.94)', border: '1px solid #e2e2e2',
          borderRadius: '18px', boxShadow: '0 2px 10px rgba(0,0,0,.12)', pointerEvents: 'auto'
        });
        ['◁', '□', '⬠', '⬡', '⬟', '◯', '△', '◢', '◎'].forEach((shape) => bar.appendChild(makeButton(shape)));
        document.body.appendChild(bar);
      }
    };

    const neutralizeBadShapePanels = () => {
      const shapeTokens = ['◁', '□', '⬠', '⬡', '⬟', '◯', '△', '◢', '◎'];
      Array.from(document.querySelectorAll('div')).forEach((div) => {
        if (div.dataset.gannzillaSafeShapeToolbar === 'true') return;
        const style = window.getComputedStyle(div);
        if (style.position !== 'fixed') return;
        const rect = div.getBoundingClientRect();
        if (rect.width < 120) return;
        const labels = Array.from(div.querySelectorAll('button')).map((b) => (b.textContent || b.dataset.shape || '').trim());
        if (!labels.some((label) => shapeTokens.includes(label))) return;
        div.style.background = 'transparent';
        div.style.border = 'none';
        div.style.boxShadow = 'none';
        div.style.borderRadius = '0';
        div.style.padding = '0';
        div.style.pointerEvents = 'none';
        Array.from(div.querySelectorAll('button')).forEach((button) => { button.style.pointerEvents = 'none'; });
      });
    };

    const makeShortcutButton = ({ label, title, action, round = true, muted = false }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.title = title;
      button.dataset.gannzillaShortcutButton = 'true';
      if (['12', '24', '36'].includes(String(label))) button.dataset.gannzillaCircleValue = String(label);
      button.onclick = (event) => { event.preventDefault(); action?.(); };
      button.dataset.muted = muted ? 'true' : 'false';
      Object.assign(button.style, {
        width: '42px', height: '42px', minWidth: '42px', minHeight: '42px',
        border: '2px solid #cfcfcf', borderRadius: round ? '50%' : '5px', background: '#fbfbfb',
        color: muted ? '#9a9a9a' : '#555', whiteSpace: 'pre-line', fontSize: '18px',
        fontWeight: '900', lineHeight: '18px', textAlign: 'center', cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,.08)'
      });
      return button;
    };

    const ensureLeftShortcutBar = () => {
      let bar = document.querySelector('[data-gannzilla-shortcut-bar="true"]');
      if (!bar) {
        bar = document.createElement('div');
        bar.dataset.gannzillaShortcutBar = 'true';
        Object.assign(bar.style, {
          position: 'fixed', top: '150px', zIndex: '80', display: 'flex', flexDirection: 'column', gap: '8px',
          padding: '9px 7px', background: 'rgba(255,255,255,.86)', border: '1px solid #e1e1e1',
          borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,.12)', direction: 'ltr', pointerEvents: 'auto'
        });
        [
          { label: '12', title: 'Circle of 12', action: () => setCircle(12), muted: true },
          { label: '24', title: 'Circle of 24', action: () => setCircle(24), muted: true },
          { label: '36', title: 'Circle of 36', action: () => setCircle(36) },
          { label: '↙\n4', title: 'Size 4', action: () => setSize(4), round: false, muted: true },
          { label: '↖\n9', title: 'Size 9', action: () => setSize(9), round: false, muted: true },
          { label: 'N', title: 'Toggle clockwise/counter', action: toggleFirstClockwise, round: false, muted: true },
          { label: '◆', title: 'Diamond frame', action: () => {}, round: false },
          { label: '⬟', title: 'Pentagon frame', action: () => {}, round: false },
          { label: '⬢', title: 'Hexagon frame', action: () => {}, round: false },
          { label: '⬣', title: 'Heptagon frame', action: () => {}, round: false },
          { label: '✺', title: 'Octagon frame', action: () => {}, round: false }
        ].forEach((item) => bar.appendChild(makeShortcutButton(item)));
        document.body.appendChild(bar);
      }
      const panelRect = getPanel()?.getBoundingClientRect();
      const panelRight = panelRect && panelRect.width > 40 ? panelRect.right : 0;
      bar.style.left = `${Math.max(14, panelRight + 10)}px`;
      markCircleButtons(localStorage.getItem('tasi-gannzilla-divisions-override-v1') || '36');
    };

    function markCircleButtons(value) {
      Array.from(document.querySelectorAll('[data-gannzilla-circle-value]')).forEach((button) => {
        const active = button.dataset.gannzillaCircleValue === String(value);
        button.style.border = active ? '2px solid #3e6ea8' : '2px solid #cfcfcf';
        button.style.background = active ? '#f1f7ff' : '#fbfbfb';
        button.style.color = active ? '#1f4f91' : '#777';
      });
    }

    const patchToolbar = () => {
      const toolbar = Array.from(document.querySelectorAll('div')).find((el) => {
        const style = window.getComputedStyle(el);
        const text = el.textContent || '';
        return style.position === 'fixed' && style.top === '0px' && text.includes('Gannzilla Pro') && text.includes('English');
      });
      if (!toolbar) return;
      setImportant(toolbar, 'height', '42px');
      setImportant(toolbar, 'min-height', '42px');
      const leftGroup = toolbar.firstElementChild;
      if (leftGroup && leftGroup.dataset.gannzillaProjectControlsReady !== 'true') {
        leftGroup.dataset.gannzillaProjectControlsReady = 'true';
        Array.from(leftGroup.querySelectorAll('button')).forEach((button) => button.remove());
        const defaultSpan = Array.from(leftGroup.querySelectorAll('span')).find((span) => (span.textContent || '').trim() === 'Default');
        if (defaultSpan) { defaultSpan.style.marginLeft = 'auto'; defaultSpan.style.marginRight = '4px'; }
        const make = (text, title, color, onClick, width = '34px') => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = text;
          button.title = title;
          button.onclick = onClick;
          Object.assign(button.style, { width, height: '34px', marginRight: '4px', border: '1px solid #9b9b9b', borderRadius: '3px', background: '#f7f7f7', color, fontWeight: '800', cursor: 'pointer' });
          return button;
        };
        leftGroup.appendChild(make('▾', 'Select project item', '#222', () => notify('قائمة المشروع جاهزة'), '28px'));
        leftGroup.appendChild(make('＋ Add', 'Add new wheel/layer', '#089b2c', () => notify('Add جاهز'), '72px'));
        leftGroup.appendChild(make('−', 'Delete selected item', '#c42020', () => { clearDrawing(); notify('تم حذف الرسم الحالي'); }));
        leftGroup.appendChild(make('✎', 'Edit selected item', '#d48b00', () => notify('وضع التعديل مفعل')));
        leftGroup.appendChild(make('▣', 'Save current wheel settings', '#333', saveSettings));
      }
    };

    const handleTopTool = (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const label = (button.textContent || '').trim();
      if (label === '↖') { clearDrawing(); notify('أداة التحديد مفعلة'); }
      if (label === '—') drawRightShape('line');
      if (label === '▢') drawRightShape('□');
      if (label === 'T') drawRightShape('text');
    };

    const handleRightClick = (event) => {
      const canvas = getWheelCanvas();
      if (!canvas || event.target.closest('button, input, select, aside')) return;
      const rect = canvas.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) return;
      event.preventDefault();
      event.stopPropagation();
      clearDrawing();
      notify('تم إخفاء ومسح الرسم بكلك يمين');
    };

    const alignDrawing = () => {
      const selected = localStorage.getItem('tasi-gannzilla-selected-shape-v1');
      if (selected) drawRightShape(selected);
    };

    const run = () => {
      neutralizeBadShapePanels();
      ensureLeftShortcutBar();
      ensureRightShapeBar();
      patchToolbar();
    };

    const timer = window.setInterval(run, 350);
    document.addEventListener('click', handleTopTool, true);
    document.addEventListener('contextmenu', handleRightClick, true);
    window.addEventListener('resize', alignDrawing);
    window.addEventListener('scroll', alignDrawing, true);
    run();

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('click', handleTopTool, true);
      document.removeEventListener('contextmenu', handleRightClick, true);
      window.removeEventListener('resize', alignDrawing);
      window.removeEventListener('scroll', alignDrawing, true);
      document.querySelector('[data-gannzilla-shortcut-bar="true"]')?.remove();
      document.querySelector('[data-gannzilla-safe-shape-toolbar="true"]')?.remove();
      document.querySelector('[data-gannzilla-drawing-overlay="true"]')?.remove();
    };
  }, []);

  return null;
}
