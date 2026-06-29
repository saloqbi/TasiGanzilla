import React from 'react';

export default function GannzillaProUiPatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const setImportant = (el, prop, value) => el.style.setProperty(prop, value, 'important');
    const cellHighlights = new Map();
    let locked = false;
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
      box._hideTimer = window.setTimeout(() => { box.remove(); }, 1600);
    };

    const dispatchNativeChange = (el) => {
      if (!el) return;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const getPanel = () => document.querySelector('aside');
    const getWheelCanvas = () => Array.from(document.querySelectorAll('canvas'))
      .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 120 && rect.height > 120)
      .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;

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

    const getViewSelect = () => Array.from(document.querySelectorAll('aside select')).find((select) =>
      Array.from(select.options || []).some((option) => (option.textContent || '').includes('Circle of 36'))
    );

    const setCircle = (value) => {
      const select = getViewSelect();
      if (!select) return notify('لم يتم العثور على خيار Circle');
      const text = `Circle of ${value}`;
      if (!Array.from(select.options).some((option) => option.value === String(value))) {
        const option = document.createElement('option');
        option.value = String(value);
        option.textContent = text;
        select.appendChild(option);
      }
      select.value = String(value);
      dispatchNativeChange(select);
      notify(`تم اختيار ${text}`);
    };

    const setSize = (value) => {
      const numberInputs = Array.from(document.querySelectorAll('aside input[type="number"]'));
      const sizeInput = numberInputs[0];
      if (!sizeInput) return notify('لم يتم العثور على Size');
      sizeInput.value = String(value);
      dispatchNativeChange(sizeInput);
      notify(`تم ضبط Size = ${value}`);
      window.setTimeout(renderCellHighlights, 120);
    };

    const toggleFirstClockwise = () => {
      const rows = Array.from(document.querySelectorAll('aside div'));
      const row = rows.find((el) => (el.textContent || '').trim().startsWith('Clockwise') && el.querySelector('input[type="checkbox"]'));
      const input = row?.querySelector('input[type="checkbox"]');
      if (!input) return notify('لم يتم العثور على Clockwise');
      input.click();
      notify(input.checked ? 'الاتجاه: مع عقارب الساعة' : 'الاتجاه: عكس عقارب الساعة');
      window.setTimeout(renderCellHighlights, 120);
    };

    const captureWheelSettings = () => {
      const inputs = Array.from(document.querySelectorAll('aside input, aside select'));
      const values = inputs.map((input) => ({
        tag: input.tagName,
        type: input.type || '',
        value: input.type === 'checkbox' ? input.checked : input.value
      }));
      localStorage.setItem('tasi-gannzilla-wheel-settings-v1', JSON.stringify({ values, savedAt: new Date().toISOString() }));
      notify('تم حفظ إعدادات العجلة');
    };

    const clearOverlay = () => {
      document.querySelector('[data-gannzilla-drawing-overlay="true"]')?.remove();
      localStorage.removeItem('tasi-gannzilla-selected-shape-v1');
    };

    const resetSelectedTools = () => {
      Array.from(document.querySelectorAll('[data-gannzilla-right-shape-ready="true"]')).forEach((b) => {
        b.dataset.selected = 'false';
        b.style.background = '#fbfbfb';
        b.style.color = '#7c8b91';
        b.style.border = '1px solid #d2d2d2';
        b.style.boxShadow = 'none';
      });
      Array.from(document.querySelectorAll('[data-gannzilla-shortcut-button="true"]')).forEach((b) => {
        b.style.background = '#fbfbfb';
        b.style.borderColor = '#cfcfcf';
        b.style.color = b.dataset.muted === 'true' ? '#9a9a9a' : '#555';
      });
    };

    const polygonPoints = (cx, cy, r, sides, startDeg = -90) => Array.from({ length: sides }, (_, i) => {
      const rad = ((startDeg + (360 / sides) * i) * Math.PI) / 180;
      return `${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)}`;
    }).join(' ');

    const polarPoint = (cx, cy, radius, deg) => {
      const rad = ((deg - 90) * Math.PI) / 180;
      return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
    };

    const getWheelGeometry = () => {
      const canvas = getWheelCanvas();
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const levels = getSizeValue();
      const divisions = getDivisionsValue();
      const designSize = 470 + 96 * levels; // matches compact wheel geometry approximately
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

    const getCellFromEvent = (event) => {
      const g = getWheelGeometry();
      if (!g) return null;
      const x = event.clientX - g.rect.left;
      const y = event.clientY - g.rect.top;
      const dx = x - g.cx;
      const dy = y - g.cy;
      const r = Math.sqrt(dx * dx + dy * dy);
      if (r < g.innerR || r > g.innerR + g.ringW * g.levels) return null;
      const ring = Math.floor((r - g.innerR) / g.ringW) + 1;
      if (ring < 1 || ring > g.levels) return null;
      const deg = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360;
      const sectorSize = 360 / g.divisions;
      const sector = Math.floor(deg / sectorSize);
      return { ...g, ring, sector, deg, sectorSize, key: `${ring}|${sector}|${g.divisions}` };
    };

    const colorForState = (state) => ({
      green: 'rgba(94, 223, 125, 0.70)',
      red: 'rgba(255, 154, 165, 0.72)',
      yellow: 'rgba(255, 238, 0, 0.78)'
    }[state] || 'transparent');

    const nextColorState = (current) => {
      if (!current) return 'green';
      if (current === 'green') return 'red';
      if (current === 'red') return 'yellow';
      return null;
    };

    const wedgePath = (cell) => {
      const gap = Math.max(0.25, cell.sectorSize * 0.035);
      const inner = cell.innerR + (cell.ring - 1) * cell.ringW + 1;
      const outer = inner + cell.ringW - 2;
      const start = cell.sector * cell.sectorSize + gap;
      const end = (cell.sector + 1) * cell.sectorSize - gap;
      const p1 = polarPoint(cell.cx, cell.cy, outer, start);
      const p2 = polarPoint(cell.cx, cell.cy, outer, end);
      const p3 = polarPoint(cell.cx, cell.cy, inner, end);
      const p4 = polarPoint(cell.cx, cell.cy, inner, start);
      const large = end - start > 180 ? 1 : 0;
      return `M ${p1.x} ${p1.y} A ${outer} ${outer} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${inner} ${inner} 0 ${large} 0 ${p4.x} ${p4.y} Z`;
    };

    const ensureHighlightSvg = () => {
      const g = getWheelGeometry();
      if (!g) return null;
      let svg = document.querySelector('[data-gannzilla-cell-highlight-overlay="true"]');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.dataset.gannzillaCellHighlightOverlay = 'true';
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
        overflow: 'visible'
      });
      return { svg, g };
    };

    function renderCellHighlights() {
      const holder = ensureHighlightSvg();
      if (!holder) return;
      const { svg, g } = holder;
      const inner = [];
      cellHighlights.forEach((state, key) => {
        const [ringText, sectorText, divText] = key.split('|');
        const ring = Number(ringText);
        const sector = Number(sectorText);
        const divisions = Number(divText);
        if (!state || divisions !== g.divisions || ring > g.levels) return;
        const cell = { ...g, ring, sector, sectorSize: 360 / divisions };
        inner.push(`<path d="${wedgePath(cell)}" fill="${colorForState(state)}" stroke="rgba(0,0,0,.08)" stroke-width="1" />`);
      });
      svg.innerHTML = inner.join('');
    }

    const handleWheelClick = (event) => {
      if (event.button !== 0 || locked) return;
      if (event.target.closest('button, input, select, aside, [data-gannzilla-shortcut-bar="true"]')) return;
      const cell = getCellFromEvent(event);
      if (!cell) return;
      window.clearTimeout(clickTimer);
      clickTimer = window.setTimeout(() => {
        const current = cellHighlights.get(cell.key);
        const next = nextColorState(current);
        if (!next) cellHighlights.delete(cell.key);
        else cellHighlights.set(cell.key, next);
        renderCellHighlights();
        notify(next ? `تم تلوين الخلية: ${next === 'green' ? 'أخضر' : next === 'red' ? 'أحمر' : 'أصفر'}` : 'تم إزالة لون الخلية');
      }, 170);
    };

    const handleWheelDoubleClick = (event) => {
      if (event.button !== 0) return;
      if (event.target.closest('button, input, select, aside, [data-gannzilla-shortcut-bar="true"]')) return;
      const cell = getCellFromEvent(event);
      if (!cell) return;
      window.clearTimeout(clickTimer);
      cellHighlights.delete(cell.key);
      renderCellHighlights();
      notify('تم مسح لون الخلية بدبل كلك');
    };

    const handleRightClickClear = (event) => {
      const canvas = getWheelCanvas();
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const insideCanvas = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      const clickedOnToolbar = event.target.closest('button, input, select, aside, [data-gannzilla-shortcut-bar="true"]');
      if (!insideCanvas || clickedOnToolbar) return;
      event.preventDefault();
      event.stopPropagation();
      clearOverlay();
      resetSelectedTools();
      notify('تم إخفاء ومسح الرسم بكلك يمين');
    };

    const drawOverlay = (shape) => {
      if (locked) return notify('الأدوات مقفلة — اضغط القفل لفتح التعديل');
      const canvas = getWheelCanvas();
      if (!canvas) return notify('لم يتم العثور على العجلة للرسم');
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.36;
      const sr = Math.max(2, Math.min(w, h) * 0.0045);

      let svg = document.querySelector('[data-gannzilla-drawing-overlay="true"]');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.dataset.gannzillaDrawingOverlay = 'true';
        document.body.appendChild(svg);
      }
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      Object.assign(svg.style, {
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${w}px`,
        height: `${h}px`,
        zIndex: '43',
        pointerEvents: 'none',
        overflow: 'visible'
      });

      const common = 'fill="rgba(94, 154, 211, 0.18)" stroke="#5e9ad3" stroke-width="' + sr + '" stroke-linejoin="round"';
      const line = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#5e9ad3" stroke-width="${sr}" opacity="0.85" />`;
      let inner = '';
      if (shape === 'line') inner = line(cx - r, cy, cx + r, cy);
      else if (shape === 'text') inner = `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="#245f9b" font-size="${Math.max(18, r * 0.18)}" font-weight="800">TEXT</text>`;
      else if (shape === '◯') inner = `<circle cx="${cx}" cy="${cy}" r="${r}" ${common} />${line(cx - r, cy, cx + r, cy)}${line(cx, cy - r, cx, cy + r)}`;
      else if (shape === '◎') inner = `<circle cx="${cx}" cy="${cy}" r="${r}" ${common} /><circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="none" stroke="#5e9ad3" stroke-width="${sr}" /><circle cx="${cx}" cy="${cy}" r="${r * 0.26}" fill="none" stroke="#5e9ad3" stroke-width="${sr}" />`;
      else if (shape === '◢') inner = `<path d="M ${cx} ${cy} L ${cx + r} ${cy} L ${cx} ${cy + r} Z" ${common} />`;
      else {
        const sidesMap = { '◁': 3, '△': 3, '□': 4, '▢': 4, '⬠': 5, '⬟': 5, '⬡': 6, '⬢': 6, '⬣': 7, '◆': 4 };
        const sides = sidesMap[shape] || 4;
        const start = shape === '◁' ? 180 : shape === '◆' ? -45 : -90;
        const points = polygonPoints(cx, cy, r, sides, start);
        const vertices = points.split(' ').map((p) => p.split(',').map(Number));
        inner = `<polygon points="${points}" ${common} />` + vertices.map(([x, y]) => line(cx, cy, x, y)).join('');
      }
      svg.innerHTML = inner;
      localStorage.setItem('tasi-gannzilla-selected-shape-v1', shape);
      notify(shape === 'line' ? 'تم تفعيل أداة الخط' : shape === 'text' ? 'تم تفعيل أداة النص' : `تم رسم/اختيار الأداة ${shape}`);
    };

    const makeProjectButton = ({ text, title, color, bg = '#f7f7f7', width = '38px', onClick }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = text;
      button.title = title;
      button.dataset.gannzillaProjectControl = 'true';
      button.onclick = onClick || (() => notify('الأداة جاهزة بصريًا'));
      setImportant(button, 'width', width);
      setImportant(button, 'height', '34px');
      setImportant(button, 'min-width', width);
      setImportant(button, 'min-height', '34px');
      setImportant(button, 'padding', '0 6px');
      setImportant(button, 'margin-right', '4px');
      setImportant(button, 'border', '1px solid #9b9b9b');
      setImportant(button, 'border-radius', '3px');
      setImportant(button, 'background', bg);
      setImportant(button, 'color', color || '#222');
      setImportant(button, 'font-size', text.includes('Add') ? '15px' : '19px');
      setImportant(button, 'font-weight', '800');
      setImportant(button, 'line-height', '28px');
      setImportant(button, 'cursor', 'pointer');
      setImportant(button, 'display', 'inline-flex');
      setImportant(button, 'align-items', 'center');
      setImportant(button, 'justify-content', 'center');
      return button;
    };

    const makeShortcutButton = ({ label, title, action, round = true, muted = false }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.title = title;
      button.dataset.gannzillaShortcutButton = 'true';
      button.onclick = () => {
        Array.from(document.querySelectorAll('[data-gannzilla-shortcut-button="true"]')).forEach((b) => {
          b.style.background = '#fbfbfb';
          b.style.borderColor = '#cfcfcf';
          b.style.color = b.dataset.muted === 'true' ? '#9a9a9a' : '#555';
        });
        button.style.background = '#f1f7ff';
        button.style.borderColor = '#4d7fbd';
        button.style.color = '#1f4f91';
        action?.();
      };
      button.dataset.muted = muted ? 'true' : 'false';
      Object.assign(button.style, {
        width: '42px',
        height: '42px',
        minWidth: '42px',
        minHeight: '42px',
        border: '2px solid #cfcfcf',
        borderRadius: round ? '50%' : '5px',
        background: '#fbfbfb',
        color: muted ? '#9a9a9a' : '#555',
        whiteSpace: 'pre-line',
        fontSize: '18px',
        fontWeight: '900',
        lineHeight: '18px',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,.08)'
      });
      return button;
    };

    const ensureLeftShortcutBar = () => {
      let bar = document.querySelector('[data-gannzilla-shortcut-bar="true"]');
      if (!bar) {
        bar = document.createElement('div');
        bar.dataset.gannzillaShortcutBar = 'true';
        Object.assign(bar.style, { position: 'fixed', top: '150px', zIndex: '80', display: 'flex', flexDirection: 'column', gap: '8px', padding: '9px 7px', background: 'rgba(255,255,255,.86)', border: '1px solid #e1e1e1', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,.12)', direction: 'ltr', pointerEvents: 'auto' });
        [
          { label: '12', title: 'Circle of 12', action: () => setCircle(12), muted: true },
          { label: '24', title: 'Circle of 24', action: () => setCircle(24), muted: true },
          { label: '36', title: 'Circle of 36', action: () => setCircle(36) },
          { label: '↙\n4', title: 'Size 4', action: () => setSize(4), round: false, muted: true },
          { label: '↖\n9', title: 'Size 9', action: () => setSize(9), round: false, muted: true },
          { label: 'N', title: 'Toggle clockwise/counter', action: toggleFirstClockwise, round: false, muted: true },
          { label: '◆', title: 'Diamond marker', action: () => drawOverlay('◆') },
          { label: '⬟', title: 'Pentagon marker', action: () => drawOverlay('⬟') },
          { label: '⬢', title: 'Hexagon marker', action: () => drawOverlay('⬢') },
          { label: '⬣', title: 'Heptagon marker', action: () => drawOverlay('⬣') },
          { label: '✺', title: 'Circle/Star marker', action: () => drawOverlay('◎') }
        ].forEach((item) => bar.appendChild(makeShortcutButton(item)));
        document.body.appendChild(bar);
      }
      const panelRect = getPanel()?.getBoundingClientRect();
      const panelRight = panelRect && panelRect.width > 40 ? panelRect.right : 0;
      bar.style.left = `${Math.max(14, panelRight + 10)}px`;
    };

    const ensureRightShapeBarWorks = () => {
      const shapeLabels = ['◁', '□', '⬠', '⬡', '⬟', '◯', '△', '◢', '◎'];
      const bars = Array.from(document.querySelectorAll('div')).filter((div) => {
        const style = window.getComputedStyle(div);
        const buttons = Array.from(div.querySelectorAll(':scope > button'));
        const labels = buttons.map((button) => (button.textContent || '').trim());
        return style.position === 'fixed' && buttons.length >= 5 && labels.some((label) => shapeLabels.includes(label));
      });
      bars.forEach((bar) => {
        Object.assign(bar.style, { zIndex: '90', pointerEvents: 'auto', background: 'rgba(255,255,255,.94)', boxShadow: '0 2px 10px rgba(0,0,0,.12)' });
        Array.from(bar.querySelectorAll('button')).forEach((button) => {
          const label = (button.textContent || '').trim();
          if (!shapeLabels.includes(label) || button.dataset.gannzillaRightShapeReady === 'true') return;
          button.dataset.gannzillaRightShapeReady = 'true';
          button.title = `اختيار/رسم الشكل ${label}`;
          Object.assign(button.style, { cursor: 'pointer', pointerEvents: 'auto', color: '#7c8b91', background: '#fbfbfb', border: '1px solid #d2d2d2', transition: 'all .12s ease' });
          button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            Array.from(document.querySelectorAll('[data-gannzilla-right-shape-ready="true"]')).forEach((b) => { b.dataset.selected = 'false'; b.style.background = '#fbfbfb'; b.style.color = '#7c8b91'; b.style.border = '1px solid #d2d2d2'; b.style.boxShadow = 'none'; });
            button.dataset.selected = 'true';
            button.style.background = '#eaf3ff';
            button.style.color = '#174f94';
            button.style.border = '1px solid #2f72bd';
            button.style.boxShadow = '0 0 0 2px rgba(47,114,189,.18)';
            drawOverlay(label);
          }, true);
        });
      });
    };

    const cleanToolbar = () => {
      const toolbar = Array.from(document.querySelectorAll('div')).find((el) => {
        const style = window.getComputedStyle(el);
        const text = el.textContent || '';
        return style.position === 'fixed' && style.top === '0px' && text.includes('Gannzilla Pro') && text.includes('English');
      });
      if (!toolbar) return;
      const extraLabels = new Set(['50%', '90%', '110%', '125%', '200%', 'Pro Small', 'Clockwise', 'Counter']);
      Array.from(toolbar.querySelectorAll('button')).forEach((button) => { if (extraLabels.has((button.textContent || '').trim())) button.remove(); });
      setImportant(toolbar, 'height', '42px');
      setImportant(toolbar, 'min-height', '42px');
      setImportant(toolbar, 'font-size', '15px');
      toolbar.style.alignItems = 'center';
      toolbar.style.padding = '0 8px 0 0';
      const leftGroup = toolbar.firstElementChild;
      if (leftGroup && leftGroup.dataset.gannzillaProjectControlsReady !== 'true') {
        leftGroup.dataset.gannzillaProjectControlsReady = 'true';
        Array.from(leftGroup.querySelectorAll('button')).forEach((button) => button.remove());
        const defaultSpan = Array.from(leftGroup.querySelectorAll('span')).find((span) => (span.textContent || '').trim() === 'Default');
        if (defaultSpan) { defaultSpan.style.marginLeft = 'auto'; defaultSpan.style.marginRight = '4px'; }
        leftGroup.appendChild(makeProjectButton({ text: '▾', title: 'Select project item', width: '28px' }));
        leftGroup.appendChild(makeProjectButton({ text: '＋ Add', title: 'Add new wheel/layer', color: '#089b2c', width: '72px', onClick: () => notify('Add جاهز لإضافة عجلة/طبقة جديدة') }));
        leftGroup.appendChild(makeProjectButton({ text: '−', title: 'Delete selected item', color: '#c42020', width: '34px', onClick: () => { clearOverlay(); notify('تم حذف الرسم/التحديد الحالي'); } }));
        leftGroup.appendChild(makeProjectButton({ text: '✎', title: 'Edit selected item', color: '#d48b00', width: '34px', onClick: () => notify('وضع التعديل مفعل') }));
        leftGroup.appendChild(makeProjectButton({ text: '▣', title: 'Save current wheel settings', color: '#333', width: '34px', onClick: captureWheelSettings }));
      }
      Array.from(toolbar.querySelectorAll('button')).forEach((button) => {
        if (button.dataset.gannzillaProjectControl === 'true') return;
        const label = (button.textContent || '').trim();
        const isIconButton = label.length <= 2 || ['↖', '—', '▢', 'T', '🔒', '⌕', '⛶', '＋', '−'].includes(label);
        if (isIconButton) { setImportant(button, 'width', '36px'); setImportant(button, 'height', '36px'); setImportant(button, 'min-width', '36px'); setImportant(button, 'min-height', '36px'); setImportant(button, 'padding', '0'); setImportant(button, 'margin-right', '4px'); setImportant(button, 'font-size', '22px'); setImportant(button, 'line-height', '32px'); setImportant(button, 'border-radius', '3px'); }
        if (button.dataset.gannzillaTopToolReady === 'true') return;
        button.dataset.gannzillaTopToolReady = 'true';
        button.addEventListener('click', () => {
          if (label === '↖') { clearOverlay(); notify('أداة التحديد مفعلة'); }
          if (label === '—') drawOverlay('line');
          if (label === '▢') drawOverlay('□');
          if (label === 'T') drawOverlay('text');
          if (label === '🔒') { locked = !locked; notify(locked ? 'تم قفل الأدوات' : 'تم فتح الأدوات'); }
          if (label === '⌕') notify('أداة التكبير مفعلة — استخدم + و - من الشريط');
        }, true);
      });
      const zoomText = Array.from(toolbar.querySelectorAll('span')).find((span) => /^\d+%$/.test((span.textContent || '').trim()));
      if (zoomText) { setImportant(zoomText, 'min-width', '58px'); setImportant(zoomText, 'font-size', '16px'); zoomText.style.fontWeight = '900'; zoomText.style.textAlign = 'center'; }
    };

    const keepOverlayAligned = () => {
      const selected = localStorage.getItem('tasi-gannzilla-selected-shape-v1');
      const overlay = document.querySelector('[data-gannzilla-drawing-overlay="true"]');
      if (selected && overlay) drawOverlay(selected);
      renderCellHighlights();
    };
    const run = () => { cleanToolbar(); ensureLeftShortcutBar(); ensureRightShapeBarWorks(); keepOverlayAligned(); };
    const timer = window.setInterval(run, 350);
    const resize = () => keepOverlayAligned();
    document.addEventListener('click', handleWheelClick, true);
    document.addEventListener('dblclick', handleWheelDoubleClick, true);
    document.addEventListener('contextmenu', handleRightClickClear, true);
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', resize, true);
    run();
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(clickTimer);
      document.removeEventListener('click', handleWheelClick, true);
      document.removeEventListener('dblclick', handleWheelDoubleClick, true);
      document.removeEventListener('contextmenu', handleRightClickClear, true);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', resize, true);
      document.querySelector('[data-gannzilla-drawing-overlay="true"]')?.remove();
      document.querySelector('[data-gannzilla-cell-highlight-overlay="true"]')?.remove();
      document.querySelector('[data-gannzilla-shortcut-bar="true"]')?.remove();
    };
  }, []);
  return null;
}
