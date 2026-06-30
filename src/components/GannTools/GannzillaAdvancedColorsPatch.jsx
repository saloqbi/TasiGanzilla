import React from 'react';

const planetPalette = {
  '☉': { color: '#e11b22', glow: '#b7ead7', name: '#e11b22' },
  '☽': { color: '#d52f45', glow: '#bfe8f6', name: '#d52f45' },
  '☿': { color: '#111111', glow: '#e4e4e4', name: '#111111' },
  '♀': { color: '#111111', glow: '#c9eff7', name: '#111111' },
  '♂': { color: '#111111', glow: '#cfc4f2', name: '#111111' },
  '⚳': { color: '#111111', glow: '#c9efd4', name: '#111111' },
  '♃': { color: '#111111', glow: '#bfece8', name: '#111111' },
  '♄': { color: '#111111', glow: '#cfe3f7', name: '#111111' },
  '♅': { color: '#111111', glow: '#a9e2e7', name: '#111111' },
  '♆': { color: '#111111', glow: '#c8dbf6', name: '#111111' },
  '♇': { color: '#111111', glow: '#f2bccd', name: '#111111' },
  '⚯': { color: '#111111', glow: '#e7e7e7', name: '#111111' },
  'Σ': { color: '#315fba', glow: '#e7edfb', name: '#315fba' }
};

const projectionColors = ['#ffc72d', '#d45a39', '#7d6a58', '#ffd45b', '#d45a39', '#c8cbd0', '#8a8176', '#d9b23d', '#b8e2d6', '#54a8cc', '#7b9ddd', '#c4c4c4'];
const aspectPalette = {
  '☌': '#8a8a8a', '⌒': '#8a8a8a', '∠': '#8a8a8a', '✶': '#8a8a8a', '□': '#8a8a8a',
  '△': '#8a8a8a', '▱': '#8a8a8a', '⚭': '#8a8a8a', '☍': '#8a8a8a'
};

function styleOnce() {
  const styleId = 'gannzilla-advanced-colors-patch-v2';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    #gannzilla-advanced-option-sections-v1 .gz-projection-icons,
    #gannzilla-advanced-option-sections-v1 .gz-planets-table,
    #gannzilla-advanced-option-sections-v1 .gz-aspects-table{
      direction:ltr!important;text-align:left!important;
    }

    #gannzilla-advanced-option-sections-v1 .gz-projection-icons{
      min-height:36px!important;padding:4px 18px!important;gap:7px!important;background:#eef6fb!important;border-top:1px solid #c5d8e4!important;border-bottom:1px solid #b9c9d4!important;display:flex!important;align-items:center!important;overflow:hidden!important;
    }
    #gannzilla-advanced-option-sections-v1 .gz-proj-dot{
      width:23px!important;height:23px!important;min-width:23px!important;border-radius:50%!important;border:1px solid #95a0a7!important;box-shadow:inset 0 1px 3px rgba(255,255,255,.85),0 1px 2px rgba(0,0,0,.16)!important;color:transparent!important;font-size:0!important;line-height:1!important;padding:0!important;position:relative!important;
    }
    #gannzilla-advanced-option-sections-v1 .gz-proj-dot::after{
      content:attr(data-planet-symbol);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#575757;font-size:13px;font-weight:900;text-shadow:0 1px 0 rgba(255,255,255,.7);
    }
    #gannzilla-advanced-option-sections-v1 .gz-proj-dot.active{outline:2px solid #3184bd!important;box-shadow:0 0 0 3px rgba(49,132,189,.16),inset 0 1px 3px rgba(255,255,255,.9)!important;}

    #gannzilla-advanced-option-sections-v1 .gz-planets-table{
      position:relative!important;background:#f3f3f3!important;border-top:1px solid #c9c9c9!important;border-bottom:1px solid #c8c8c8!important;overflow:hidden!important;
    }
    #gannzilla-advanced-option-sections-v1 .gz-planet-row{
      display:grid!important;grid-template-columns:172px 34px 78px 56px 1fr!important;min-height:29px!important;height:29px!important;align-items:center!important;background:#f7f7f7!important;border-bottom:1px solid #d0d0d0!important;direction:ltr!important;text-align:left!important;
    }
    #gannzilla-advanced-option-sections-v1 .gz-planet-row:nth-child(even){background:#fbfbfb!important;}
    #gannzilla-advanced-option-sections-v1 .gz-planet-name{
      padding-left:32px!important;padding-right:0!important;font-weight:740!important;color:#222!important;gap:6px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;text-align:left!important;direction:ltr!important;font-size:14px!important;line-height:1!important;white-space:nowrap!important;
    }
    #gannzilla-advanced-option-sections-v1 .gz-planet-icon{width:22px!important;font-size:20px!important;font-weight:900!important;text-align:center!important;line-height:1!important;}
    #gannzilla-advanced-option-sections-v1 .gz-planet-check{display:flex!important;justify-content:center!important;align-items:center!important;}
    #gannzilla-advanced-option-sections-v1 .gz-planet-check input{width:15px!important;height:15px!important;min-height:15px!important;accent-color:#2c7fbd!important;margin:0!important;}
    #gannzilla-advanced-option-sections-v1 .gz-planet-degree,
    #gannzilla-advanced-option-sections-v1 .gz-planet-zodiac,
    #gannzilla-advanced-option-sections-v1 .gz-planet-triangle{font-size:14px!important;font-weight:740!important;color:#333!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:5px!important;white-space:nowrap!important;direction:ltr!important;}
    #gannzilla-advanced-option-sections-v1 .gz-zodiac-orb{width:22px!important;height:22px!important;min-width:22px!important;border-radius:50%!important;display:inline-block!important;border:1px solid rgba(0,0,0,.14)!important;box-shadow:inset 0 1px 3px rgba(255,255,255,.82)!important;vertical-align:middle!important;}
    #gannzilla-advanced-option-sections-v1 .gz-triangle-mark{font-size:16px!important;font-weight:900!important;color:#626262!important;line-height:1!important;}
    #gannzilla-advanced-option-sections-v1 .gz-side-label{position:absolute!important;left:2px!important;width:28px!important;writing-mode:vertical-rl!important;transform:rotate(180deg)!important;text-align:center!important;background:#eeeeee!important;color:#555!important;font-size:12px!important;font-weight:750!important;border-right:1px solid #c5c5c5!important;z-index:2!important;}
    #gannzilla-advanced-option-sections-v1 .gz-zodiac{top:35px!important;height:92px!important;} 
    #gannzilla-advanced-option-sections-v1 .gz-mirror{top:127px!important;height:91px!important;} 
    #gannzilla-advanced-option-sections-v1 .gz-market{top:218px!important;height:58px!important;} 
    #gannzilla-advanced-option-sections-v1 .gz-total{top:276px!important;height:52px!important;}

    #gannzilla-advanced-option-sections-v1 .gz-aspects-table{background:#f5f5f5!important;border-top:1px solid #c8c8c8!important;}
    #gannzilla-advanced-option-sections-v1 .gz-aspect-row{display:grid!important;grid-template-columns:172px 34px 70px 1fr!important;min-height:28px!important;height:28px!important;align-items:center!important;background:#f8f8f8!important;border-bottom:1px solid #d0d0d0!important;direction:ltr!important;text-align:left!important;}
    #gannzilla-advanced-option-sections-v1 .gz-aspect-row:nth-child(even){background:#fcfcfc!important;}
    #gannzilla-advanced-option-sections-v1 .gz-aspect-name{padding-left:32px!important;padding-right:0!important;display:flex!important;gap:7px!important;align-items:center!important;font-weight:720!important;color:#333!important;direction:ltr!important;text-align:left!important;justify-content:flex-start!important;font-size:14px!important;white-space:nowrap!important;}
    #gannzilla-advanced-option-sections-v1 .gz-aspect-icon{width:24px!important;text-align:center!important;font-size:18px!important;color:#777!important;font-weight:900!important;}
    #gannzilla-advanced-option-sections-v1 .gz-aspect-orb{font-weight:740!important;color:#444!important;font-size:14px!important;}
    #gannzilla-advanced-option-sections-v1 .gz-aspect-style select{height:24px!important;font-size:12px!important;background:linear-gradient(#fff,#f2f2f2)!important;border:1px solid #a5a5a5!important;}

    body[data-gannzilla-language="ar"] #gannzilla-advanced-option-sections-v1 .gz-planets-table,
    body[data-gannzilla-language="ar"] #gannzilla-advanced-option-sections-v1 .gz-projection-icons,
    body[data-gannzilla-language="ar"] #gannzilla-advanced-option-sections-v1 .gz-aspects-table{direction:ltr!important;text-align:left!important;}
    body[data-gannzilla-language="ar"] #gannzilla-advanced-option-sections-v1 .gz-planet-row{grid-template-columns:172px 34px 78px 56px 1fr!important;direction:ltr!important;height:29px!important;min-height:29px!important;}
    body[data-gannzilla-language="ar"] #gannzilla-advanced-option-sections-v1 .gz-planet-name{direction:ltr!important;text-align:left!important;justify-content:flex-start!important;padding-left:32px!important;padding-right:0!important;font-size:14px!important;}
    body[data-gannzilla-language="ar"] #gannzilla-advanced-option-sections-v1 .gz-planet-degree,
    body[data-gannzilla-language="ar"] #gannzilla-advanced-option-sections-v1 .gz-planet-zodiac,
    body[data-gannzilla-language="ar"] #gannzilla-advanced-option-sections-v1 .gz-planet-triangle{font-size:14px!important;direction:ltr!important;}
  `;
  document.getElementById('gannzilla-advanced-colors-patch-v1')?.remove();
  document.head.appendChild(style);
}

function patchAdvancedColors() {
  styleOnce();
  const host = document.getElementById('gannzilla-advanced-option-sections-v1');
  if (!host) return;

  Array.from(host.querySelectorAll('.gz-proj-dot')).forEach((button, index) => {
    const color = projectionColors[index % projectionColors.length];
    button.dataset.planetSymbol = (button.textContent || '').trim();
    button.style.setProperty('background', `radial-gradient(circle at 32% 28%, #ffffff 0%, ${color} 48%, #84909b 100%)`, 'important');
  });

  Array.from(host.querySelectorAll('.gz-planet-row')).forEach((row) => {
    const iconEl = row.querySelector('.gz-planet-icon');
    if (!iconEl) return;
    const symbol = (iconEl.textContent || '').trim();
    const palette = planetPalette[symbol] || { color: '#333', glow: '#e5e5e5', name: '#222' };
    iconEl.style.setProperty('color', palette.color, 'important');
    const nameEl = row.querySelector('.gz-planet-name');
    if (nameEl) nameEl.style.setProperty('color', palette.name || '#222', 'important');

    const zodiac = row.querySelector('.gz-planet-zodiac');
    if (zodiac && !zodiac.querySelector('.gz-zodiac-orb')) {
      const orb = document.createElement('span');
      orb.className = 'gz-zodiac-orb';
      orb.style.background = `radial-gradient(circle at 30% 30%, #fff 0%, ${palette.glow} 55%, #91a9b8 100%)`;
      zodiac.appendChild(orb);
    }

    const tri = row.querySelector('.gz-planet-triangle');
    if (tri && !tri.querySelector('.gz-triangle-mark')) {
      const text = tri.textContent.trim();
      const match = text.match(/△\s*([0-9]+°)/);
      tri.textContent = '';
      const glyph = document.createElement('span');
      glyph.className = 'gz-triangle-mark';
      glyph.textContent = '△';
      const value = document.createElement('span');
      value.textContent = match?.[1] || text.replace('△', '').trim();
      tri.appendChild(glyph);
      tri.appendChild(value);
    }
  });

  Array.from(host.querySelectorAll('.gz-aspect-row')).forEach((row) => {
    const iconEl = row.querySelector('.gz-aspect-icon');
    if (!iconEl) return;
    const symbol = (iconEl.textContent || '').trim();
    iconEl.style.setProperty('color', aspectPalette[symbol] || '#777', 'important');
  });
}

export default function GannzillaAdvancedColorsPatch() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;
    patchAdvancedColors();
    const timer = window.setInterval(patchAdvancedColors, 300);
    return () => {
      window.clearInterval(timer);
      document.getElementById('gannzilla-advanced-colors-patch-v2')?.remove();
    };
  }, []);
  return null;
}
