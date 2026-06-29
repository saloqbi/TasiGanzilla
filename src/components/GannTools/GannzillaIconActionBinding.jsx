import React from 'react';

export default function GannzillaIconActionBinding() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const STORE_KEY = 'tasi-gannzilla-icon-actions-v1';
    const SETTINGS_KEY = 'tasi-gannzilla-complete-settings-v1';
    const ZOOM_KEY = 'tasi-gannzilla-wheel-zoom-v1';

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

    const readActions = () => {
      try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; }
      catch { return {}; }
    };

    const writeAction = (patch) => {
      const next = { ...readActions(), ...patch, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('gannzilla:icon-action', { detail: next }));
      return next;
    };

    const getWheelCanvas = () => Array.from(document.querySelectorAll('canvas'))
      .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 120 && rect.height > 120)
      .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;

    const getWheelLayers = () => [
      getWheelCanvas(),
      document.querySelector('[data-gannzilla-frame-shape-layer="true"]'),
      document.querySelector('[data-gannzilla-drawing-overlay="true"]'),
      document.querySelector('[data-gannzilla-true-spiral-overlay="true"]')
    ].filter(Boolean);

    const allControls = () => Array.from(document.querySelectorAll('aside input, aside select, [data-gz-name], [data-gannzilla-shortcut-button], [data-gannzilla-right-shape-button]'));

    const collectSettings = () => {
      const controls = allControls();
      const values = controls.map((control, index) => {
        const name = control.dataset.gzName || control.dataset.gannzillaCircleValue || control.dataset.gannzillaFrameShapeLabel || control.dataset.shape || control.name || control.title || `control-${index}`;
        const value = control.type === 'checkbox' || control.type === 'radio' ? control.checked : (control.value ?? control.textContent ?? '');
        return { name, value, tag: control.tagName, type: control.type || '' };
      });
      const payload = { values, savedAt: new Date().toISOString() };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent('gannzilla:settings-save', { detail: payload }));
      return payload;
    };

    const clearOverlays = () => {
      [
        '[data-gannzilla-drawing-overlay="true"]',
        '[data-gannzilla-true-spiral-overlay="true"]',
        '[data-gannzilla-shape-guard-overlay="true"]',
        '[data-gannzilla-polygon-tool-overlay="true"]'
      ].forEach((selector) => document.querySelector(selector)?.remove());
      localStorage.removeItem('tasi-gannzilla-selected-shape-v1');
      window.dispatchEvent(new CustomEvent('gannzilla:clear-drawing', { detail: { at: new Date().toISOString() } }));
    };

    const textOf = (node) => (node?.textContent || '').trim();
    const buttonText = (button) => textOf(button).replace(/\s+/g, ' ');
    const isPlainPlus = (label) => ['+', '＋'].includes(label);
    const isPlainMinus = (label) => ['-', '−', '–', '—'].includes(label);

    const isPercentNode = (node) => /^\d{1,3}%$/.test(textOf(node));

    const updateZoomDisplay = (zoom) => {
      const pct = `${Math.round(zoom * 100)}%`;
      Array.from(document.querySelectorAll('span, button, div')).forEach((node) => {
        if (!isPercentNode(node)) return;
        const prev = node.previousElementSibling;
        const next = node.nextElementSibling;
        const nearMinus = prev && isPlainMinus(buttonText(prev));
        const nearPlus = next && isPlainPlus(buttonText(next));
        const hasZoomClass = (node.className || '').toString().toLowerCase().includes('zoom');
        if (nearMinus || nearPlus || hasZoomClass || textOf(node) === localStorage.getItem('tasi-gannzilla-last-zoom-label-v1')) {
          node.textContent = pct;
        }
      });
      localStorage.setItem('tasi-gannzilla-last-zoom-label-v1', pct);
    };

    const applyZoom = (zoom) => {
      const safeZoom = Math.max(0.35, Math.min(3, Number(zoom) || 1));
      localStorage.setItem(ZOOM_KEY, String(safeZoom));
      getWheelLayers().forEach((layer) => {
        layer.style.transformOrigin = 'center center';
        layer.style.transform = `scale(${safeZoom})`;
      });
      updateZoomDisplay(safeZoom);
      window.dispatchEvent(new CustomEvent('gannzilla:zoom-change', { detail: { zoom: safeZoom } }));
      window.dispatchEvent(new Event('resize'));
      return safeZoom;
    };

    const zoomWheel = (step) => {
      const canvas = getWheelCanvas();
      if (!canvas) return notify('لم يتم العثور على العجلة');
      const current = Number(localStorage.getItem(ZOOM_KEY) || '1');
      const next = applyZoom(current + step);
      notify(`التكبير ${(next * 100).toFixed(0)}%`);
    };

    const setZoomPercent = (percent) => {
      const next = applyZoom(Number(percent) / 100);
      notify(`التكبير ${(next * 100).toFixed(0)}%`);
    };

    const applyTool = (tool) => {
      document.body.dataset.gannzillaActiveTool = tool;
      writeAction({ activeTool: tool });
      notify(`تم تفعيل أداة ${tool}`);
    };

    const addLayer = () => {
      const state = readActions();
      const layers = Array.isArray(state.layers) ? state.layers : [];
      const nextLayer = { id: `layer-${Date.now()}`, name: `Layer ${layers.length + 1}`, visible: true };
      writeAction({ layers: [...layers, nextLayer], activeLayerId: nextLayer.id });
      notify('تمت إضافة طبقة جديدة');
    };

    const deleteLayerOrDrawing = () => {
      const state = readActions();
      const layers = Array.isArray(state.layers) ? state.layers : [];
      if (layers.length > 0) {
        const nextLayers = layers.slice(0, -1);
        writeAction({ layers: nextLayers, activeLayerId: nextLayers.at(-1)?.id || null });
      }
      clearOverlays();
      notify('تم حذف آخر رسم/طبقة');
    };

    const toggleLock = () => {
      const state = readActions();
      const locked = !state.locked;
      writeAction({ locked });
      document.body.dataset.gannzillaLocked = locked ? 'true' : 'false';
      notify(locked ? 'تم قفل الأدوات' : 'تم فتح قفل الأدوات');
    };

    const toggleEdit = () => {
      const state = readActions();
      const edit = !state.editMode;
      writeAction({ editMode: edit });
      document.body.dataset.gannzillaEditMode = edit ? 'true' : 'false';
      notify(edit ? 'وضع التعديل مفعل' : 'وضع التعديل متوقف');
    };

    const toggleSectionFromHeader = (target) => {
      const header = target.closest?.('.gz-header') || target.closest?.('div');
      if (!header || !header.parentElement?.classList?.contains('gz-section')) return false;
      const section = header.parentElement;
      const bodyNodes = Array.from(section.children).filter((child) => child !== header);
      const hidden = bodyNodes.some((node) => node.style.display === 'none');
      bodyNodes.forEach((node) => { node.style.display = hidden ? '' : 'none'; });
      const toggle = header.querySelector('.gz-toggle');
      if (toggle) toggle.textContent = hidden ? '−' : '+';
      notify(hidden ? 'تم فتح القسم' : 'تم إغلاق القسم');
      return true;
    };

    const toggleNativeSection = (target) => {
      const aside = target.closest?.('aside');
      if (!aside) return false;
      const row = target.closest('div');
      if (!row) return false;
      const text = (row.textContent || '').trim();
      if (!/^(\+|−|-)\s*(Layout|Price|Highlight|Protractor|Counter|Secondary scale|Marker|Chronometer|Cosmogram|Location|Moon phases|Cycles|Tetragram|Pentagram|Hexagram|Planets|Aspects|Inspector)/i.test(text)) return false;
      let node = row.nextElementSibling;
      const willShow = row.dataset.gannzillaCollapsed === 'true';
      row.dataset.gannzillaCollapsed = willShow ? 'false' : 'true';
      while (node && !(node.textContent || '').trim().match(/^(\+|−|-)\s*[A-Za-z]/)) {
        node.style.display = willShow ? '' : 'none';
        node = node.nextElementSibling;
      }
      notify(willShow ? 'تم فتح القسم' : 'تم إغلاق القسم');
      return true;
    };

    const labelOfButton = (button) => (buttonText(button) || (button?.title || button?.ariaLabel || '').trim());

    const buttonHasAdjacentPercent = (button) => {
      const prev = button.previousElementSibling;
      const next = button.nextElementSibling;
      return isPercentNode(prev) || isPercentNode(next);
    };

    const handleButton = (button, event) => {
      const label = labelOfButton(button);
      const title = (button.title || '').trim().toLowerCase();
      const html = (button.innerHTML || '').trim();
      const numericPct = label.match(/^(\d{1,3})%$/)?.[1];

      const isZoomIn = title.includes('zoom in') || (isPlainPlus(label) && buttonHasAdjacentPercent(button));
      const isZoomOut = title.includes('zoom out') || (isPlainMinus(label) && buttonHasAdjacentPercent(button));
      const isZoomPreset = numericPct && Number(numericPct) >= 25 && Number(numericPct) <= 300;

      // مهم: زر + الصغير الخاص بالتكبير ليس Add. Add فقط إذا مكتوب Add أو العنوان Add.
      const isAdd = !isZoomIn && (/\badd\b/i.test(label) || label.includes('＋ Add') || title.includes('add'));
      const isDelete = !isZoomOut && (title.includes('delete') || title.includes('remove') || label === '🗑' || label.includes('حذف'));
      const isEdit = label.includes('✎') || title.includes('edit');
      const isSave = label.includes('▣') || label.includes('💾') || title.includes('save') || (html.includes('svg') && title.includes('save'));
      const isLock = label.includes('🔒') || title.includes('lock');

      if (isAdd || isDelete || isEdit || isSave || isLock || isZoomIn || isZoomOut || isZoomPreset) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
      }

      if (isZoomIn) return zoomWheel(0.1);
      if (isZoomOut) return zoomWheel(-0.1);
      if (isZoomPreset) return setZoomPercent(Number(numericPct));
      if (isAdd) return addLayer();
      if (isDelete) return deleteLayerOrDrawing();
      if (isEdit) return toggleEdit();
      if (isSave) { collectSettings(); return notify('تم حفظ إعدادات البرنامج'); }
      if (isLock) return toggleLock();

      if (['↖', '⟵', '←'].includes(label)) return applyTool('Select');
      if (label === '—' || title.includes('line')) return applyTool('Line');
      if (label === '□' || label === '▢' || title.includes('rectangle') || title.includes('square')) return applyTool('Rectangle');
      if (label === 'T' || title.includes('text')) return applyTool('Text');
      if (label === '◎' || title.includes('spiral')) return applyTool('Spiral');
      return null;
    };

    const handleClick = (event) => {
      if (document.body.dataset.gannzillaLocked === 'true') {
        const allowed = event.target.closest?.('[data-gannzilla-toast="true"], button[title*="lock" i]');
        if (!allowed) {
          event.preventDefault();
          event.stopPropagation();
          notify('الأدوات مقفلة');
          return;
        }
      }

      const button = event.target.closest?.('button');
      if (button) handleButton(button, event);
      else if (toggleSectionFromHeader(event.target)) event.preventDefault();
      else toggleNativeSection(event.target);
    };

    const handleChange = (event) => {
      const el = event.target;
      if (!el?.matches?.('input, select')) return;
      collectSettings();
      const name = el.dataset.gzName || el.name || el.title || 'control';
      const value = el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value;
      window.dispatchEvent(new CustomEvent('gannzilla:control-change', { detail: { name, value } }));
    };

    const prepareIcons = () => {
      Array.from(document.querySelectorAll('button')).forEach((button) => {
        button.style.pointerEvents = 'auto';
        button.style.cursor = 'pointer';
        if (!button.title && (button.textContent || '').trim()) button.title = (button.textContent || '').trim();
      });
      Array.from(document.querySelectorAll('aside .gz-header, aside [class*="header"]')).forEach((header) => {
        header.style.cursor = 'pointer';
      });
      const savedZoom = Number(localStorage.getItem(ZOOM_KEY) || '1');
      applyZoom(savedZoom);
    };

    prepareIcons();
    collectSettings();
    const timer = window.setInterval(prepareIcons, 600);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('change', handleChange, true);
    document.addEventListener('input', handleChange, true);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('change', handleChange, true);
      document.removeEventListener('input', handleChange, true);
    };
  }, []);

  return null;
}
