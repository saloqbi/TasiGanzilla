import React from 'react';
import { createPortal } from 'react-dom';

const BUILD = '138';
const PALETTE_ID = 'gannzilla-left-reference-palette-v138';
const HIDE_ID = 'gannzilla-top-hide-toolbar-v138';
const LEGACY_SELECTOR = '[id^="gannzilla-left-drawing-palette-"], [id^="gannzilla-left-reference-palette-"]';
const STORAGE_KEYS = [
  'gannzillaDrawingToolsVisibleV125',
  'gannzillaDrawingToolsVisibleV124',
  'gannzillaDrawingToolsVisibleV123',
  'gannzillaDrawingToolsVisibleV122',
];

function getPaletteLeft() {
  const aside = document.querySelector('aside');
  if (!aside) return 12;
  const rect = aside.getBoundingClientRect();
  const style = window.getComputedStyle(aside);
  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0
    ? Math.ceil(rect.right + 14)
    : 12;
}

function getTopHidePosition() {
  const buttons = [...document.querySelectorAll('button')].filter((button) => {
    if (button.id === HIDE_ID || button.closest(`#${PALETTE_ID}`)) return false;
    const rect = button.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top < 70;
  });

  const addButton = buttons.find((button) => /^(Add|إضافة)$/i.test((button.textContent || '').trim()));
  if (addButton) {
    const parent = addButton.parentElement;
    const rowButtons = parent
      ? [...parent.querySelectorAll('button')].filter((button) => {
          const rect = button.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.top < 70;
        })
      : buttons;
    const rightMost = rowButtons.sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right)[0];
    const anchor = rightMost || addButton;
    const rect = anchor.getBoundingClientRect();
    return { left: Math.round(rect.right + 5), top: Math.round(rect.top) };
  }

  const rightMost = buttons.sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right)[0];
  if (rightMost) {
    const rect = rightMost.getBoundingClientRect();
    return { left: Math.round(rect.right + 5), top: Math.round(rect.top) };
  }

  return { left: 112, top: 5 };
}

function readVisible() {
  if (typeof window.__gannzillaDrawingToolsVisibleV125 === 'boolean') {
    return window.__gannzillaDrawingToolsVisibleV125;
  }
  const query = new URLSearchParams(window.location.search);
  const requested = query.get('drawingTools') || query.get('showDrawingTools');
  if (requested === 'true') return true;
  if (requested === 'false') return false;
  try {
    for (const key of STORAGE_KEYS) {
      const value = localStorage.getItem(key);
      if (value !== null) return value !== 'false';
    }
  } catch (_) {}
  return true;
}

function setToolsVisible(value) {
  window.__gannzillaDrawingToolsVisibleV125 = value;
  try {
    STORAGE_KEYS.forEach((key) => localStorage.setItem(key, String(value)));
  } catch (_) {}
  window.dispatchEvent(new CustomEvent('gannzilla:drawing-tools-visibility-v125', {
    detail: { visible: value, source: `left-palette-v${BUILD}` },
  }));
  window.dispatchEvent(new CustomEvent('gannzilla:drawing-tools-visibility', {
    detail: { visible: value, source: `left-palette-v${BUILD}` },
  }));
}

function polygonPoints(sides, radius = 30.4, cx = 40, cy = 40) {
  const rotation = sides === 4 ? -Math.PI / 4 : -Math.PI / 2;
  return Array.from({ length: sides }, (_, index) => {
    const angle = rotation + (index * Math.PI * 2) / sides;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(' ');
}

function dotPoints(sides, radius = 19.2, cx = 40, cy = 40) {
  const rotation = sides === 4 ? -Math.PI / 4 : -Math.PI / 2;
  return Array.from({ length: sides }, (_, index) => {
    const angle = rotation + (index * Math.PI * 2) / sides;
    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
  });
}

function PolygonReferenceIcon({ sides }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
      <polygon points={polygonPoints(sides)} fill="#969696" stroke="#858585" strokeWidth="2.4" strokeLinejoin="round" />
      {dotPoints(sides).map((dot, index) => (
        <circle key={index} cx={dot.x} cy={dot.y} r="3.3" fill="#f5f5f5" stroke="#e7e7e7" strokeWidth="0.5" />
      ))}
    </svg>
  );
}

function AngleReferenceIcon({ value }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
      <rect x="5" y="5" width="70" height="70" rx="3" fill="#fafafa" stroke="#bfc2c5" strokeWidth="2.4" />
      <path d="M14 22V14h8M58 14h8v8M14 58v8h8M66 58v8h-8" fill="none" stroke="#8f9498" strokeWidth="2.5" strokeLinecap="round" />
      <text x="40" y="48" textAnchor="middle" fontFamily="Segoe UI, Arial, sans-serif" fontSize="30" fontWeight="700" fill="#74787b">{value}°</text>
    </svg>
  );
}

function NorthReferenceIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
      <rect x="5" y="5" width="70" height="70" rx="3" fill="#fafafa" stroke="#bfc2c5" strokeWidth="2.4" />
      <text x="40" y="52" textAnchor="middle" fontFamily="Georgia, Times New Roman, serif" fontStyle="italic" fontSize="44" fontWeight="700" fill="#6f7478">N</text>
    </svg>
  );
}

function ReferenceButton({ active, round = false, title, onClick, children }) {
  return (
    <button type="button" title={title} aria-label={title} aria-pressed={active} onClick={onClick} style={{
      width: 84, minWidth: 84, height: 84, minHeight: 84, padding: 0, margin: 0,
      border: round ? (active ? '3px solid #6f82b7' : '2px solid #bfc4c8') : (active ? '2px solid #8799bc' : '1px solid transparent'),
      borderRadius: round ? '50%' : 6, background: round ? '#fbfbfb' : 'transparent', color: '#74787b',
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', cursor: 'pointer',
      font: '700 32px Segoe UI, Arial, sans-serif', lineHeight: 1, flex: '0 0 84px',
    }}>{children}</button>
  );
}

export default function GannzillaLeftReferencePaletteV129() {
  const [visible, setVisible] = React.useState(readVisible);
  const [left, setLeft] = React.useState(getPaletteLeft);
  const [hidePos, setHidePos] = React.useState(() => ({ left: 112, top: 5 }));
  const [active, setActive] = React.useState(() => String(new URLSearchParams(window.location.search).get('divisions') || '36'));

  React.useEffect(() => {
    const sync = () => {
      setVisible(readVisible());
      setLeft(getPaletteLeft());
      setHidePos(getTopHidePosition());
      document.querySelectorAll(LEGACY_SELECTOR).forEach((element) => {
        if (element.id === PALETTE_ID) return;
        element.style.setProperty('display', 'none', 'important');
        element.style.setProperty('visibility', 'hidden', 'important');
        element.style.setProperty('pointer-events', 'none', 'important');
      });
      document.querySelectorAll('button').forEach((button) => {
        if (button.id === HIDE_ID || button.closest(`#${PALETTE_ID}`)) return;
        if ((button.textContent || '').trim() === 'إخفاء') button.style.setProperty('display', 'none', 'important');
      });
    };
    sync();
    const timer = window.setInterval(sync, 250);
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    window.GANNZILLA_LEFT_REFERENCE_PALETTE_V138 = true;
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, []);

  const hideTools = () => {
    setToolsVisible(false);
    setVisible(false);
  };

  const choose = (value) => {
    setActive(value);
    if (['12', '24', '36'].includes(value)) {
      const url = new URL(window.location.href);
      url.searchParams.set('divisions', value);
      url.searchParams.set('v', BUILD);
      window.location.assign(url.toString());
      return;
    }
    window.dispatchEvent(new CustomEvent('gannzilla:left-reference-tool-v129', { detail: { tool: value } }));
  };

  if (!visible || typeof document === 'undefined') return null;

  const palette = (
    <>
      <button id={HIDE_ID} type="button" onClick={hideTools} title="إخفاء أدوات الرسم" aria-label="إخفاء أدوات الرسم" style={{
        position: 'fixed', left: hidePos.left, top: hidePos.top, zIndex: 2147483606,
        width: 48, height: 24, padding: '0 6px', margin: 0,
        border: '1px solid #aeb4ba', borderRadius: 3,
        background: '#f7f7f7', color: '#444',
        font: '700 12px Tahoma, Arial, sans-serif', lineHeight: '22px', cursor: 'pointer',
        boxSizing: 'border-box', boxShadow: '0 1px 2px rgba(0,0,0,0.10)',
      }}>إخفاء</button>

      <div id={PALETTE_ID} data-gannzilla-left-reference-palette="true" style={{
        position: 'fixed', left, top: 110, zIndex: 2147483605, width: 108,
        maxHeight: 'calc(100vh - 128px)', padding: '12px 10px 16px', background: 'rgba(250,250,250,0.96)',
        border: '1px solid #d9d9d9', borderRadius: 54, boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, boxSizing: 'border-box',
        overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'thin', pointerEvents: 'auto', transform: 'none', zoom: 1,
      }}>
        {['12', '24', '36'].map((value) => (
          <ReferenceButton key={value} round active={active === value} title={`Circle of ${value}`} onClick={() => choose(value)}>{value}</ReferenceButton>
        ))}
        <ReferenceButton active={active === '4'} title="Angle 4" onClick={() => choose('4')}><AngleReferenceIcon value="4" /></ReferenceButton>
        <ReferenceButton active={active === '9'} title="Angle 9" onClick={() => choose('9')}><AngleReferenceIcon value="9" /></ReferenceButton>
        <ReferenceButton active={active === 'N'} title="North" onClick={() => choose('N')}><NorthReferenceIcon /></ReferenceButton>
        {[4, 5, 6, 7, 8, 9].map((sides) => (
          <ReferenceButton key={sides} active={active === `p${sides}`} title={`${sides}-sided shape`} onClick={() => choose(`p${sides}`)}><PolygonReferenceIcon sides={sides} /></ReferenceButton>
        ))}
      </div>
    </>
  );

  return createPortal(palette, document.body);
}
