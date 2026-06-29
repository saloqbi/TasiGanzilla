import React from 'react';

export default function GannzillaAdvancedOptionSections() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const hostId = 'gannzilla-advanced-option-sections-v1';
    const storeKey = 'tasi-gannzilla-advanced-options-v1';

    const planetRows = [
      ['sun', '☉', 'Sun', '279°', '9°', '△ 179°'],
      ['moon', '☽', 'Moon', '337°', '7°', '△ 292°'],
      ['mercury', '☿', 'Mercury', '273°', '3°', '△ 203°'],
      ['venus', '♀', 'Venus', '313°', '13°', '△ 185°'],
      ['mars', '♂', 'Mars', '288°', '28°', '△ 182°'],
      ['ceres', '⚳', 'Ceres', '288°', '18°', '△ 145°'],
      ['jupiter', '♃', 'Jupiter', '276°', '6°', '△ 204°'],
      ['saturn', '♄', 'Saturn', '291°', '21°', '△ 83°'],
      ['uranus', '♅', 'Uranus', '33°', '3°', '△ 31°'],
      ['neptune', '♆', 'Neptune', '346°', '16°', '△ 18°'],
      ['pluto', '♇', 'Pluto', '292°', '22°', '△ 13°'],
      ['eris', '⚯', 'Eris', '23°', '23°', '△ 3°'],
      ['summary', 'Σ', 'Summary', '110°', '20°', '△ 97°'],
      ['average', 'Σ', 'Average', '249°', '9°', '△ 218°']
    ];

    const aspectRows = [
      ['conjunction', '☌', 'Conjunction', '△ 5°', 'solid'],
      ['semisextile', '⌒', 'Semisextile', '△ 1°', 'dashed'],
      ['semisquare', '∠', 'Semisquare', '△ 1°', 'dashdot'],
      ['sextile', '✶', 'Sextile', '△ 1°', 'solid'],
      ['quadrature', '□', 'Quadrature', '△ 1°', 'solid'],
      ['trine', '△', 'Trine', '△ 1°', 'solid'],
      ['sesquisquare', '▱', 'Sesquisquare', '△ 1°', 'dashed'],
      ['quincunx', '⚭', 'Quincunx', '△ 1°', 'solid'],
      ['opposition', '☍', 'Opposition', '△ 1°', 'solid']
    ];

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
      timeNow: false, timeValue: '00:00', timeIncrement: '1', timeUnit: 'Hour',
      projectionSet: 'default',
      planetVisible: Object.fromEntries(planetRows.map(([key]) => [key, true])),
      aspectVisible: Object.fromEntries(aspectRows.map(([key]) => [key, true])),
      aspectStyle: Object.fromEntries(aspectRows.map(([key, , , , style]) => [key, style]))
    };

    const read = () => {
      try { return { ...defaults, ...(JSON.parse(localStorage.getItem(storeKey) || '{}') || {}) }; }
      catch { return { ...defaults }; }
    };

    const write = (patch) => {
      const next = { ...read(), ...patch };
      localStorage.setItem(storeKey, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('gannzilla:advanced-options-change', { detail: next }));
      window.dispatchEvent(new Event('resize'));
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

    const projectionIcons = (s) => `
      <div class="gz-projection-icons">
        ${['☉','☽','☿','♀','♂','♃','♄','♅','♆','♇','○','●'].map((icon, index) =>
          `<button type="button" class="gz-proj-dot ${s.projectionSet === String(index) ? 'active' : ''}" data-gz-name="projectionSet" data-gz-value="${index}">${icon}</button>`
        ).join('')}
      </div>`;

    const planetsTable = (s) => `
      <div class="gz-planets-table">
        <div class="gz-side-label gz-zodiac">Zodiac term</div>
        <div class="gz-side-label gz-mirror">Mirror term</div>
        <div class="gz-side-label gz-market">Market</div>
        <div class="gz-side-label gz-total">Total</div>
        ${planetRows.map(([key, icon, name, degree, zodiac, triangle]) => `
          <div class="gz-planet-row">
            <div class="gz-planet-name"><span class="gz-planet-icon">${icon}</span>${name}</div>
            <div class="gz-planet-check">${check(`planetVisible.${key}`, s.planetVisible?.[key] !== false)}</div>
            <div class="gz-planet-degree">${degree}</div>
            <div class="gz-planet-zodiac">${zodiac}</div>
            <div class="gz-planet-triangle">${triangle}</div>
          </div>
        `).join('')}
      </div>`;

    const aspectsTable = (s) => `
      <div class="gz-aspects-table">
        ${row('Hide', check('aspectsHide', s.aspectsHide === true))}
        ${aspectRows.map(([key, icon, name, orb, style]) => `
          <div class="gz-aspect-row">
            <div class="gz-aspect-name"><span class="gz-aspect-icon">${icon}</span>${name}</div>
            <div class="gz-aspect-check">${check(`aspectVisible.${key}`, s.aspectVisible?.[key] !== false)}</div>
            <div class="gz-aspect-orb">${orb}</div>
            <div class="gz-aspect-style"><select data-gz-name="aspectStyle.${key}">
              ${['solid','dashed','dashdot','thin'].map((o) => `<option value="${o}" ${String(s.aspectStyle?.[key] || style) === o ? 'selected' : ''}>${o}</option>`).join('')}
            </select></div>
          </div>
        `).join('')}
      </div>`;

    const build = (s) => `
      <div id="${hostId}" class="gz-advanced">
        ${section('Moon phases', '○', row('Visible', check('moonVisible', s.moonVisible)) + row('Show eclipses', check('moonEclipses', s.moonEclipses)) + row('Today', check('moonToday', s.moonToday)) + row('Date', input('moonDate', s.moonDate)))}
        ${section('Cycles', '○', row('Visible', check('cyclesVisible', s.cyclesVisible)))}
        ${section('Tetragram', '', row('Ruler', select('tetragramRuler', ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'], s.tetragramRuler)) + row('Reverse', check('tetragramReverse', s.tetragramReverse)) + row('Today', check('tetragramToday', s.tetragramToday)) + row('Date', input('tetragramDate', s.tetragramDate)))}
        ${section('Pentagram', '', row('Ruler', select('pentagramRuler', ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'], s.pentagramRuler)) + row('Reverse', check('pentagramReverse', s.pentagramReverse)) + row('Today', check('pentagramToday', s.pentagramToday)) + row('Date', input('pentagramDate', s.pentagramDate)))}
        ${section('Hexagram', '', row('Ruler', select('hexagramRuler', ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'], s.hexagramRuler)) + row('Reverse', check('hexagramReverse', s.hexagramReverse)) + row('Today', check('hexagramToday', s.hexagramToday)) + row('Date', input('hexagramDate', s.hexagramDate)))}
        <div class="gz-switch-row"><label><input data-gz-name="radixTransit" type="radio" name="gzRadixTransit" value="Radix" ${s.radixTransit === 'Radix' ? 'checked' : ''}/> Radix</label><span class="gz-slider"></span><label><input data-gz-name="radixTransit" type="radio" name="gzRadixTransit" value="Transit" ${s.radixTransit === 'Transit' ? 'checked' : ''}/> Transit</label></div>
        ${section('Price', 'P', row('', select('priceMode', ['None','Price','Date','Time','Price and date','Price and time'], s.priceMode)) + row('Quote', input('quote', s.quote)) + row('◇', input('priceValue', s.priceValue)) + row('÷', input('priceIncrement', s.priceIncrement)))}
        ${section('Date', '▣', row('Today', check('dateToday', s.dateToday)) + row('Value', input('dateValue', s.dateValue)) + row('Increment', `<div class="gz-inline">${input('dateIncrement', s.dateIncrement)}${select('dateUnit', ['Day','Week','Month','Year'], s.dateUnit)}</div>`))}
        ${section('Time', '◷', row('Now', check('timeNow', s.timeNow)) + row('Value', input('timeValue', s.timeValue, 'time')) + row('Increment', `<div class="gz-inline">${input('timeIncrement', s.timeIncrement)}${select('timeUnit', ['Hour','Minute','Second'], s.timeUnit)}</div>`))}
        ${section('Projections', '✈', projectionIcons(s))}
        ${section('Planets', '●', planetsTable(s))}
        ${section('Aspects', 'A', aspectsTable(s))}
        ${section('Inspector', '⌘', '', false)}
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
        #${hostId} .gz-projection-icons { min-height: 34px; display: flex; align-items: center; gap: 9px; padding: 4px 26px; border-bottom: 1px solid #d3d3d3; background: #f7f7f7; }
        #${hostId} .gz-proj-dot { width: 22px; height: 22px; border-radius: 50%; border: 1px solid #aaa; background: radial-gradient(circle,#fff,#c9c9c9); font-size: 13px; line-height: 18px; padding: 0; cursor: pointer; color: #777; }
        #${hostId} .gz-proj-dot.active { outline: 2px solid #2c7fbd; }
        #${hostId} .gz-planets-table { position: relative; background: #f7f7f7; border-bottom: 1px solid #d3d3d3; }
        #${hostId} .gz-planet-row { display: grid; grid-template-columns: 172px 34px 78px 56px 1fr; min-height: 28px; align-items: center; border-bottom: 1px solid #d8d8d8; }
        #${hostId} .gz-planet-name { padding-left: 32px; font-weight: 650; display: flex; gap: 6px; align-items: center; }
        #${hostId} .gz-planet-icon { width: 22px; text-align: center; font-size: 18px; color: #666; }
        #${hostId} .gz-planet-degree, #${hostId} .gz-planet-zodiac, #${hostId} .gz-planet-triangle { font-weight: 700; color: #444; }
        #${hostId} .gz-side-label { position: absolute; left: 2px; width: 28px; writing-mode: vertical-rl; transform: rotate(180deg); text-align: center; color: #666; font-size: 12px; border-right: 1px solid #ccc; }
        #${hostId} .gz-zodiac { top: 36px; height: 95px; } #${hostId} .gz-mirror { top: 132px; height: 96px; } #${hostId} .gz-market { top: 228px; height: 64px; } #${hostId} .gz-total { top: 292px; height: 52px; }
        #${hostId} .gz-aspect-row { display: grid; grid-template-columns: 172px 34px 70px 1fr; min-height: 29px; align-items: center; background: #f7f7f7; border-bottom: 1px solid #d8d8d8; }
        #${hostId} .gz-aspect-name { padding-left: 32px; display: flex; gap: 7px; align-items: center; font-weight: 650; }
        #${hostId} .gz-aspect-icon { width: 24px; text-align: center; font-size: 18px; color: #666; }
        #${hostId} .gz-aspect-orb { font-weight: 700; color: #444; }
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

      Array.from(host.querySelectorAll('input, select, button[data-gz-name]')).forEach((control) => {
        if (control.dataset.gzBound === 'true') return;
        control.dataset.gzBound = 'true';
        const handler = () => {
          const name = control.dataset.gzName;
          if (!name) return;
          const current = read();
          if (name.includes('.')) {
            const [group, key] = name.split('.');
            const value = control.type === 'checkbox' ? control.checked : control.value;
            write({ [group]: { ...(current[group] || {}), [key]: value } });
            return;
          }
          if (control.tagName === 'BUTTON') {
            write({ [name]: control.dataset.gzValue });
            Array.from(host.querySelectorAll('.gz-proj-dot')).forEach((b) => b.classList.toggle('active', b === control));
            return;
          }
          const value = control.type === 'checkbox' ? control.checked : control.value;
          write({ [name]: value });
        };
        control.addEventListener('change', handler);
        control.addEventListener('input', () => {
          if (control.type !== 'checkbox' && control.type !== 'radio' && control.tagName !== 'BUTTON') handler();
        });
        control.addEventListener('click', () => { if (control.tagName === 'BUTTON') handler(); });
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
