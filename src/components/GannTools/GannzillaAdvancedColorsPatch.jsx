import React from 'react';

const planetPalette = {
  '☉': { key: 'sun', color: '#d71920', glow: '#ffe18f' },
  '☽': { key: 'moon', color: '#d24b5a', glow: '#d9edf7' },
  '☿': { key: 'mercury', color: '#111111', glow: '#e8e8e8' },
  '♀': { key: 'venus', color: '#111111', glow: '#c8e8f2' },
  '♂': { key: 'mars', color: '#111111', glow: '#d6c4f0' },
  '⚳': { key: 'ceres', color: '#111111', glow: '#ccebd7' },
  '♃': { key: 'jupiter', color: '#111111', glow: '#c5e9e7' },
  '♄': { key: 'saturn', color: '#111111', glow: '#d8e9f6' },
  '♅': { key: 'uranus', color: '#111111', glow: '#9fdce2' },
  '♆': { key: 'neptune', color: '#111111', glow: '#c9dcf8' },
  '♇': { key: 'pluto', color: '#111111', glow: '#f1b8c8' },
  '⚯': { key: 'eris', color: '#111111', glow: '#e4e4e4' },
  'Σ': { key: 'summary', color: '#315fba', glow: '#e9eefb' }
};

const projectionColors = ['#ffcc40', '#d65a3b', '#836d5a', '#f7cd52', '#d85b3d', '#c7c9cf', '#8c8074', '#d9b23d', '#b6dfd3', '#51a6c8', '#7d99d7', '#b8b8b8'];
const aspectPalette = {
  '☌': '#8a8a8a',
  '⌒': '#8a8a8a',
  '∠': '#8a8a8a',
  '✶': '#8a8a8a',
  '□': '#8a8a8a',
  '△': '#8a8a8a',
  '▱': '#8a8a8a',
  '⚭': '#8a8a8a',
  '☍': '#8a8a8a'
};

function styleOnce() {
  const styleId = 'gannzilla-advanced-colors-patch-v1';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    #gannzilla-advanced-option-sections-v1 .gz-projection-icons{
      min-height:42px!important;padding:5px 24px!important;gap:8px!important;background:#eef6fb!important;border-top:1px solid #c5d8e4!important;border-bottom:1px solid #b9c9d4!important;
    }
    #gannzilla-advanced-option-sections-v1 .gz-proj-dot{
      width:28px!important;height:28px!important;border-radius:50%!important;border:1px solid #9aa5ac!important;box-shadow:inset 0 1px 3px rgba(255,255,255,.85),0 1px 2px rgba(0,0,0,.16)!important;color:transparent!important;font-size:0!important;position:relative!important;
    }
    #gannzilla-advanced-option-sections-v1 .gz-proj-dot::after{
      content:attr(data-planet-symbol);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#575757;font-size:15px;font-weight:900;text-shadow:0 1px 0 rgba(255,255,255,.7);
    }
    #gannzilla-advanced-option-sections-v1 .gz-proj-dot.active{outline:2px solid #3184bd!important;box-shadow:0 0 0 3px rgba(49,132,189,.18),inset 0 1px 3px rgba(255,255,255,.9)!important;}
    #gannzilla-advanced-option-sections-v1 .gz-planets-table{background:#f4f4f4!important;border-top:1px solid #c9c9c9!important;border-bottom:1px solid #c8c8c8!important;}
    #gannzilla-advanced-option-sections-v1 .gz-planet-row{
      grid-template-columns:172px 34px 78px 56px 1fr!important;min-height:31px!important;background:#f7f7f7!important;border-bottom:1px solid #d0d0d0!important;
    }
    #gannzilla-advanced-option-sections-v1 .gz-planet-row:nth-child(even){background:#fbfbfb!important;}
    #gannzilla-advanced-option-sections-v1 .gz-planet-name{font-weight:780!important;color:#222!important;gap:7px!important;}
    #gannzilla-advanced-option-sections-v1 .gz-planet-icon{font-size:21px!important;font-weight:900!important;text-align:center!important;}
    #gannzilla-advanced-option-sections-v1 .gz-planet-check{display:flex!important;justify-content:center!important;align-items:center!important;}
    #gannzilla-advanced-option-sections-v1 .gz-planet-check input{width:16px!important;height:16px!important;accent-color:#2c7fbd!important;}
    #gannzilla-advanced-option-sections-v1 .gz-planet-degree,
    #gannzilla-advanced-option-sections-v1 .gz-planet-zodiac,
    #gannzilla-advanced-option-sections-v1 .gz-planet-triangle{font-weight:780!important;color:#333!important;display:flex!important;align-items:center!important;gap:5px!important;}
    #gannzilla-advanced-option-sections-v1 .gz-zodiac-orb{width:23px;height:23px;border-radius:50%;display:inline-block;border:1px solid rgba(0,0,0,.14);box-shadow:inset 0 1px 3px rgba(255,255,255,.8);vertical-align:middle;}
    #gannzilla-advanced-option-sections-v1 .gz-triangle-mark{font-size:17px;font-weight:900;color:#676767;}
    #gannzilla-advanced-option-sections-v1 .gz-side-label{background:#eeeeee!important;color:#555!important;font-size:12px!important;font-weight:750!important;border-right:1px solid #c5c5c5!important;}
    #gannzilla-advanced-option-sections-v1 .gz-aspects-table{background:#f5f5f5!important;border-top:1px solid #c8c8c8!important;}
    #gannzilla-advanced-option-sections-v1 .gz-aspect-row{grid-template-columns:172px 34px 70px 1fr!important;min-height:31px!important;background:#f8f8f8!important;border-bottom:1px solid #d0d0d0!important;}
    #gannzilla-advanced-option-sections-v1 .gz-aspect-row:nth-child(even){background:#fcfcfc!important;}
    #gannzilla-advanced-option-sections-v1 .gz-aspect-name{font-weight:740!important;color:#333!important;}
    #gannzilla-advanced-option-sections-v1 .gz-aspect-icon{font-size:20px!important;color:#777!important;font-weight:900!important;}
    #gannzilla-advanced-option-sections-v1 .gz-aspect-orb{font-weight:780!important;color:#444!important;}
    #gannzilla-advanced-option-sections-v1 .gz-aspect-style select{height:26px!important;font-size:13px!important;background:linear-gradient(#fff,#f2f2f2)!important;border:1px solid #a5a5a5!important;}
  `;
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
    const palette = planetPalette[symbol] || { color: '#333', glow: '#e5e5e5' };
    row.dataset.planetColorized = 'true';
    iconEl.style.setProperty('color', palette.color, 'important');

    const zodiac = row.querySelector('.gz-planet-zodiac');
    if (zodiac && !zodiac.querySelector('.gz-zodiac-orb')) {
      const orb = document.createElement('span');
      orb.className = 'gz-zodiac-orb';
      orb.style.background = `radial-gradient(circle at 30% 30%, #fff, ${palette.glow} 55%, #9ab0bf)`;
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
    const timer = window.setInterval(patchAdvancedColors, 400);
    return () => {
      window.clearInterval(timer);
      document.getElementById('gannzilla-advanced-colors-patch-v1')?.remove();
    };
  }, []);
  return null;
}
