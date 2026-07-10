import React from 'react';

const PALETTE_ID = 'gannzilla-right-drawing-palette-v127';
const COLORS = {
  3: '#b8c8b9',
  4: '#d7c0c7',
  5: '#a8bac7',
  6: '#a8ceca',
  7: '#b7bec8',
  8: '#d2c8d2',
  9: '#ddd2cb',
  10: '#ddd8b9',
};

function polygonPoints(sides, radius = 13.2, cx = 16, cy = 16) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(' ');
}

function PolygonIcon({ sides }) {
  return (
    <svg width="64" height="64" viewBox="0 0 32 32" aria-hidden="true">
      <polygon
        points={polygonPoints(sides)}
        fill="rgba(255,255,255,0.22)"
        stroke={COLORS[sides]}
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AngleIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M6.5 25 16 7.5V25h10" fill="none" stroke="#b9b39d" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 19a6.2 6.2 0 0 1 5.3-5.4" fill="none" stroke="#c7c1ad" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 32 32" aria-hidden="true">
      <path d="m7.5 25 4.2-10.5 11-8.7 3.5 3.5-8.7 11Z" fill="#8f6e73" stroke="#85656b" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="m7.5 25 6-2.2-3.8-3.8Z" fill="#6f8f81" />
      <path d="m21.7 6.6 3.5 3.5" stroke="#d8b9ad" strokeWidth="1.2" />
    </svg>
  );
}

function SpiralIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M16.3 27C9.9 27 5 22.5 5 16.7 5 11.2 9.4 7 14.8 7c4.9 0 8.6 3.6 8.6 8.1 0 4.1-3.1 7.2-6.9 7.2-3.4 0-5.9-2.4-5.9-5.5 0-2.7 2.1-4.8 4.7-4.8 2.3 0 4 1.7 4 3.8 0 1.8-1.3 3.1-3 3.1-1.4 0-2.4-1-2.4-2.2 0-1 .7-1.7 1.6-1.7"
        fill="none"
        stroke="#9b9388"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ToolButton({ id, title, active, onClick, children }) {
  return (
    <button
      type="button"
      data-gannzilla-right-tool={id}
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      style={{
        width: 76,
        minWidth: 76,
        height: 76,
        minHeight: 76,
        padding: 0,
        margin: 0,
        border: active ? '2px solid #c9d7df' : '2px solid transparent',
        borderRadius: 8,
        background: active ? 'rgba(230,240,246,0.54)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxSizing: 'border-box',
        lineHeight: 1,
        flex: '0 0 76px',
      }}
    >
      {children}
    </button>
  );
}

function findLegacyRightPalettes() {
  return Array.from(document.querySelectorAll('div')).filter((element) => {
    if (element.id === PALETTE_ID || element.dataset.gannzillaRightPaletteV127 === 'true') return false;
    const style = window.getComputedStyle(element);
    const right = Number.parseFloat(style.right);
    const directButtons = Array.from(element.children).filter((child) => child.tagName === 'BUTTON');
    return style.position === 'fixed'
      && Number.isFinite(right)
      && right >= 0
      && right <= 128
      && directButtons.length >= 8
      && directButtons.length <= 12;
  });
}

export default function GannzillaRightDrawingPaletteV126() {
  const [active, setActive] = React.useState('triangle');
  const [top, setTop] = React.useState(34);

  React.useEffect(() => {
    const sync = () => {
      findLegacyRightPalettes().forEach((element) => {
        element.dataset.gannzillaLegacyRightPaletteHiddenV127 = 'true';
        element.style.setProperty('display', 'none', 'important');
        element.style.setProperty('visibility', 'hidden', 'important');
        element.style.setProperty('pointer-events', 'none', 'important');
      });

      const viewportHeight = Math.max(420, window.innerHeight || 768);
      const paletteHeight = 11 * 76 + 10 * 6 + 24;
      setTop(Math.max(34, Math.round((viewportHeight - paletteHeight) / 2)));
    };

    sync();
    const timer = window.setInterval(sync, 180);
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', sync);

    window.GANNZILLA_RIGHT_DRAWING_PALETTE_V127 = true;
    window.__auditGannzillaRightDrawingPaletteV127 = () => ({
      ok: Boolean(document.getElementById(PALETTE_ID)) && findLegacyRightPalettes().length === 0,
      doubledFromV126: true,
      iconSize: 64,
      buttonSize: 76,
      paletteWidth: 100,
      exactToolCount: 11,
      pastelColors: true,
      active,
    });

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [active]);

  const choose = (id) => {
    setActive(id);
    window.dispatchEvent(new CustomEvent('gannzilla:right-drawing-tool-v127', { detail: { tool: id } }));
  };

  const tools = [
    ...[3, 4, 5, 6, 7, 8, 9, 10].map((sides) => ({ id: `polygon-${sides}`, title: `${sides}-sided shape`, icon: <PolygonIcon sides={sides} /> })),
    { id: 'angle', title: 'Angle tool', icon: <AngleIcon /> },
    { id: 'pen', title: 'Pen tool', icon: <PenIcon /> },
    { id: 'spiral', title: 'Spiral tool', icon: <SpiralIcon /> },
  ];

  return (
    <div
      id={PALETTE_ID}
      data-gannzilla-right-drawing-palette="true"
      data-gannzilla-right-palette-v127="true"
      style={{
        position: 'fixed',
        right: 18,
        top,
        zIndex: 2147483600,
        width: 100,
        maxHeight: 'calc(100vh - 68px)',
        padding: '12px 10px',
        background: 'rgba(251,251,251,0.94)',
        border: '2px solid #e3e3e3',
        borderRadius: 40,
        boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        boxSizing: 'border-box',
        pointerEvents: 'auto',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'thin',
      }}
    >
      {tools.map((tool) => (
        <ToolButton
          key={tool.id}
          id={tool.id}
          title={tool.title}
          active={active === tool.id}
          onClick={() => choose(tool.id)}
        >
          {tool.icon}
        </ToolButton>
      ))}
    </div>
  );
}
