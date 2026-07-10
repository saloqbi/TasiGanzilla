import React from 'react';

const BUILD = '128';
const PALETTE_ID = 'gannzilla-left-reference-palette-v128';
const LEGACY_SELECTOR = '[id^="gannzilla-left-drawing-palette-"]';
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
  } catch (_) {
    // Default to visible when storage is unavailable.
  }

  return true;
}

function polygonPoints(sides, radius = 15.2, cx = 20, cy = 20) {
  const rotation = sides === 4 ? -Math.PI / 4 : -Math.PI / 2;
  return Array.from({ length: sides }, (_, index) => {
    const angle = rotation + (index * Math.PI * 2) / sides;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(' ');
}

function dotPoints(sides, radius = 9.6, cx = 20, cy = 20) {
  const rotation = sides === 4 ? -Math.PI / 4 : -Math.PI / 2;
  return Array.from({ length: sides }, (_, index) => {
    const angle = rotation + (index * Math.PI * 2) / sides;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  });
}

function PolygonReferenceIcon({ sides }) {
  const dots = dotPoints(sides);
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <polygon
        points={polygonPoints(sides)}
        fill="#969696"
        stroke="#858585"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {dots.map((dot, index) => (
        <circle
          key={index}
          cx={dot.x}
          cy={dot.y}
          r="1.65"
          fill="#f5f5f5"
          stroke="#e7e7e7"
          strokeWidth="0.25"
        />
      ))}
    </svg>
  );
}

function AngleReferenceIcon({ value }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <rect x="2.5" y="2.5" width="35" height="35" rx="1.5" fill="#fafafa" stroke="#bfc2c5" strokeWidth="1.2" />
      <path d="M7 11V7h4M29 7h4v4M7 29v4h4M33 29v4h-4" fill="none" stroke="#8f9498" strokeWidth="1.25" strokeLinecap="round" />
      <text x="20" y="24" textAnchor="middle" fontFamily="Segoe UI, Arial, sans-serif" fontSize="15" fontWeight="700" fill="#74787b">
        {value}°
      </text>
    </svg>
  );
}

function NorthReferenceIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <rect x="2.5" y="2.5" width="35" height="35" rx="1.5" fill="#fafafa" stroke="#bfc2c5" strokeWidth="1.2" />
      <text x="20" y="26" textAnchor="middle" fontFamily="Georgia, Times New Roman, serif" fontStyle="italic" fontSize="22" fontWeight="700" fill="#6f7478">N</text>
    </svg>
  );
}

function ReferenceButton({ active, round = false, title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      style={{
        width: 42,
        minWidth: 42,
        height: 42,
        minHeight: 42,
        padding: 0,
        margin: 0,
        border: round
          ? (active ? '2px solid #6f82b7' : '1.5px solid #bfc4c8')
          : (active ? '1.5px solid #8799bc' : '1px solid transparent'),
        borderRadius: round ? '50%' : 3,
        background: round ? '#fbfbfb' : 'transparent',
        color: '#74787b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        cursor: 'pointer',
        font: '700 16px Segoe UI, Arial, sans-serif',
        lineHeight: 1,
        flex: '0 0 42px',
      }}
    >
      {children}
    </button>
  );
}

export default function GannzillaLeftReferencePaletteV128() {
  const [visible, setVisible] = React.useState(readVisible);
  const [left, setLeft] = React.useState(getPaletteLeft);
  const [active, setActive] = React.useState(() => String(
    new URLSearchParams(window.location.search).get('divisions') || '36',
  ));

  React.useEffect(() => {
    const sync = () => {
      setVisible(readVisible());
      setLeft(getPaletteLeft());

      document.querySelectorAll(LEGACY_SELECTOR).forEach((element) => {
        if (element.id === PALETTE_ID) return;
        element.dataset.gannzillaLegacyLeftPaletteHiddenV128 = 'true';
        element.style.setProperty('display', 'none', 'important');
        element.style.setProperty('visibility', 'hidden', 'important');
        element.style.setProperty('pointer-events', 'none', 'important');
      });
    };

    sync();
    const timer = window.setInterval(sync, 120);
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);

    window.GANNZILLA_LEFT_REFERENCE_PALETTE_V128 = true;
    window.__auditGannzillaLeftReferencePaletteV128 = () => ({
      ok: Boolean(document.getElementById(PALETTE_ID)),
      build: BUILD,
      exactReferenceShapes: true,
      circleButtons: ['12', '24', '36'],
      angleButtons: ['4', '9', 'N'],
      polygonButtons: [4, 5, 6, 7, 8, 9],
      buttonSize: 42,
      iconSize: 40,
      greyFilledPolygonsWithWhiteDots: true,
      visible: readVisible(),
    });

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, []);

  const choose = (value) => {
    setActive(value);

    if (['12', '24', '36'].includes(value)) {
      const url = new URL(window.location.href);
      url.searchParams.set('divisions', value);
      url.searchParams.set('v', BUILD);
      window.location.assign(url.toString());
      return;
    }

    window.dispatchEvent(new CustomEvent('gannzilla:left-reference-tool-v128', {
      detail: { tool: value },
    }));
  };

  if (!visible) return null;

  const estimatedHeight = (12 * 42) + (11 * 4) + 16;
  const top = Math.max(34, Math.round(((window.innerHeight || 768) - estimatedHeight) / 2));

  return (
    <div
      id={PALETTE_ID}
      data-gannzilla-left-reference-palette="true"
      style={{
        position: 'fixed',
        left,
        top,
        zIndex: 2147483605,
        width: 54,
        maxHeight: 'calc(100vh - 68px)',
        padding: '8px 5px',
        background: 'rgba(250,250,250,0.96)',
        border: '1px solid #d9d9d9',
        borderRadius: 27,
        boxShadow: '0 1px 5px rgba(0,0,0,0.14)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        boxSizing: 'border-box',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'thin',
        pointerEvents: 'auto',
      }}
    >
      {['12', '24', '36'].map((value) => (
        <ReferenceButton
          key={value}
          round
          active={active === value}
          title={`Circle of ${value}`}
          onClick={() => choose(value)}
        >
          {value}
        </ReferenceButton>
      ))}

      <ReferenceButton active={active === '4'} title="Angle 4" onClick={() => choose('4')}>
        <AngleReferenceIcon value="4" />
      </ReferenceButton>
      <ReferenceButton active={active === '9'} title="Angle 9" onClick={() => choose('9')}>
        <AngleReferenceIcon value="9" />
      </ReferenceButton>
      <ReferenceButton active={active === 'N'} title="North" onClick={() => choose('N')}>
        <NorthReferenceIcon />
      </ReferenceButton>

      {[4, 5, 6, 7, 8, 9].map((sides) => (
        <ReferenceButton
          key={sides}
          active={active === `p${sides}`}
          title={`${sides}-sided shape`}
          onClick={() => choose(`p${sides}`)}
        >
          <PolygonReferenceIcon sides={sides} />
        </ReferenceButton>
      ))}
    </div>
  );
}
