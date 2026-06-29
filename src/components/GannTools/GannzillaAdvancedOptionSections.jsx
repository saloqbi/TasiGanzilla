import React from 'react';

export default function GannzillaAdvancedOptionSections() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const hostId = 'gannzilla-advanced-option-sections-v1';
    const storeKey = 'tasi-gannzilla-advanced-options-v1';

    const defaults = {
      moonVisible: false,
      moonEclipses: true,
      moonToday: true,
      moonDate: '31.12.2019',
      cyclesVisible: false,
      tetragramRuler: 'Sun', tetragramReverse: true, tetragramToday: false, tetragramDate: '31.12.2019',
      pentagramRuler: 'Sun', pentagramReverse: true, pentagramToday: true, pentagramDate: '31.12.2019',
      hexagramRuler: 'Sun', hexagramReverse: true, hexagramToday: true, hexagramDate: '31.12.2019',
      radixTransit: 'Radix',
      priceMode: 'None', quote: '0', priceValue: '1', priceIncrement: '1',
      dateToday: false, dateValue: '31.12.2019', dateIncrement: '1', dateUnit: 'Day',
      timeNow: false, timeValue: '00:00', timeIncrement: '1', timeUnit: 'Hour'
    };

    const read = () => {
      try { return { ...defaults, ...(JSON.parse(localStorage.getItem(storeKey) || '{}') || {}) }; }
      catch { return { ...defaults }; }
    };

    const write = (patch) => {
      const next = { ...read(), ...patch };
      localStorage.setItem(storeKey, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('gannzilla:advanced-options-change', { detail: next }));
    };

    const row = (label, control, cls = '') => `
      <div class="gz-row ${cls}">
        <div class="gz-label">${label}</div>
        <div class="gz-value">${control}</div>
        <div class="gz-glyph"></div>
      </div>`;

    const section = (title, icon, body, open = true) => `
      <div class="gz-section">
        <div class="gz-header"><span class="gz-toggle">${open ? '−' : '+'}</span><b>${title}</b><span class="gz-icon">${icon || ''}</span></div>
        ${body || ''}
      </div>`;

    const select = (name, options, value) => `<select data-gz-name="${name}">${options.map((o) => `<option value="${o}" ${String(o) === String(value) ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
    const input = (name, value, type = 'text') => `<input data-gz-name="${name}" type="${type}" value="${value ?? ''}" />`;
    const check = (name, checked) => `<input data-gz-name="${name}" type="checkbox" ${checked ? 'checked' : ''} />`;

    const build = (s) => `
      <div id="${hostId}" class="gz-advanced">
        ${section('Moon phases', '○',
          row('Visible', check('moonVisible', s.moonVisible)) +
          row('Show eclipses', check('moonEclipses', s.moonEclipses)) +
          row('Today', check('moonToday', s.moonToday)) +
          row('Date', input('moonDate', s.moonDate))
        )}

        ${section('Cycles', '○', row('Visible', check('cyclesVisible', s.cyclesVisible)))}

        ${section('Tetragram', '',
          row('Ruler', select('tetragramRuler', ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'], s.tetragramRuler)) +
          row('Reverse', check('tetragramReverse', s.tetragramReverse)) +
          row('Today', check('tetragramToday', s.tetragramToday)) +
          row('Date', input('tetragramDate', s.tetragramDate))
        )}

        ${section('Pentagram', '',
          row('Ruler', select('pentagramRuler', ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'], s.pentagramRuler)) +
          row('Reverse', check('pentagramReverse', s.pentagramReverse)) +
          row('Today', check('pentagramToday', s.pentagramToday)) +
          row('Date', input('pentagramDate', s.pentagramDate))
        )}

        ${section('Hexagram', '',
          row('Ruler', select('hexagramRuler', ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'], s.hexagramRuler)) +
          row('Reverse', check('hexagramReverse', s.hexagramReverse)) +
          row('Today', check('hexagramToday', s.hexagramToday)) +
          row('Date', input('hexagramDate', s.hexagramDate))
        )}

        <div class="gz-switch-row">
          <label><input data-gz-name="radixTransit" type="radio" name="gzRadixTransit" value="Radix" ${s.radixTransit === 'Radix' ? 'checked' : ''}/> Radix</label>
          <span class="gz-slider"></span>
          <label><input data-gz-name="radixTransit" type="radio" name="gzRadixTransit" value="Transit" ${s.radixTransit === 'Transit' ? 'checked' : ''}/> Transit</label>
        </div>

        ${section('Price', 'P',
          row('', select('priceMode', ['None','Price','Date','Time','Price and date','Price and time'], s.priceMode)) +
          row('Quote', input('quote', s.quote)) +
          row('◇', input('priceValue', s.priceValue)) +
          row('÷', input('priceIncrement', s.priceIncrement))
        )}

        ${section('Date', '▣',
          row('Today', check('dateToday', s.dateToday)) +
          row('Value', input('dateValue', s.dateValue)) +
          row('Increment', `<div class="gz-inline">${input('dateIncrement', s.dateIncrement)}${select('dateUnit', ['Day','Week','Month','Year'], s.dateUnit)}</div>`)
        )}

        ${section('Time', '◷',
          row('Now', check('timeNow', s.timeNow)) +
          row('Value', input('timeValue', s.timeValue, 'time')) +
          row('Increment', `<div class="gz-inline">${input('timeIncrement', s.timeIncrement)}${select('timeUnit', ['Hour','Minute','Second'], s.timeUnit)}</div>`)
        )}

        ${section('Projections', '✈', '', false)}
      </div>`;

    const installStyle = () => {
      if (document.getElementById(`${hostId}-style`)) return;
      const style = document.createElement('style');
      style.id = `${hostId}-style`;
      style.textContent = `
        #${hostId} { font-family: "Segoe UI", Tahoma, Arial, sans-serif; font-size: 15px; color: #222; }
        #${hostId} .gz-header { display: grid; grid-template-columns: 22px 1fr 24px; align-items: center; min-height: 31px; background: linear-gradient(90deg,#f8f5dc,#f2f2f2); border-top: 1px solid #c8c8c8; border-bottom: 1px solid #d4d4d4; }
        #${hostId} .gz-toggle { color: #1680ad; font-size: 18px; font-weight: 900; text-align: center; }
        #${hostId} .gz-header b { font-size: 15px; font-weight: 900; }
        #${hostId} .gz-icon { text-align: center; color: #999; font-weight: 800; }
        #${hostId} .gz-row { display: grid; grid-template-columns: 172px 1fr 22px; min-height: 31px; border-bottom: 1px solid #d3d3d3; align-items: center; background: #f7f7f7; }
        #${hostId} .gz-label { padding-left: 30px; font-size: 15px; font-weight: 600; color: #333; }
        #${hostId} .gz-value { padding: 2px 6px; border-left: 1px solid #cfcfcf; min-height: 27px; display: flex; align-items: center; }
        #${hostId} input, #${hostId} select { width: 100%; height: 28px; font-size: 15px; font-weight: 700; border: 1px solid #9b9b9b; background: #fff; box-sizing: border-box; }
        #${hostId} input[type="checkbox"], #${hostId} input[type="radio"] { width: 16px; height: 16px; accent-color: #2c7fbd; }
        #${hostId} .gz-inline { display: grid; grid-template-columns: 1fr 80px; gap: 4px; width: 100%; }
        #${hostId} .gz-switch-row { min-height: 30px; display: flex; align-items: center; justify-content: center; gap: 16px; background: #efefef; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; font-weight: 800; }
        #${hostId} .gz-slider { width: 54px; height: 8px; border-radius: 8px; background: #c9c9c9; display: inline-block; }
      `;
      document.head.appendChild(style);
    };

    const mount = () => {
      const aside = document.querySelector('aside');
      if (!aside) return;
      installStyle();
      let host = document.getElementById(hostId);
      if (!host) {
        const wrap = document.createElement('div');
        wrap.innerHTML = build(read()).trim();
        host = wrap.firstElementChild;
        aside.appendChild(host);
      }

      Array.from(host.querySelectorAll('input, select')).forEach((control) => {
        if (control.dataset.gzBound === 'true') return;
        control.dataset.gzBound = 'true';
        control.addEventListener('change', () => {
          const name = control.dataset.gzName;
          if (!name) return;
          const value = control.type === 'checkbox' ? control.checked : control.value;
          write({ [name]: value });
        });
        control.addEventListener('input', () => {
          const name = control.dataset.gzName;
          if (!name || control.type === 'checkbox' || control.type === 'radio') return;
          write({ [name]: control.value });
        });
      });
    };

    mount();
    const timer = window.setInterval(mount, 500);
    return () => {
      window.clearInterval(timer);
      document.getElementById(hostId)?.remove();
      document.getElementById(`${hostId}-style`)?.remove();
    };
  }, []);
  return null;
}
