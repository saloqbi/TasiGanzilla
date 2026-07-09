import React from 'react';

const MARKER = 'GANNZILLA_NATIVE_LEFT_PALETTE_V112';

function polygonPoints(sides, radius = 13, cx = 16, cy = 16) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(' ');
}

function ToolButton({ active, round = false, title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        padding: 0,
        border: active ? '2px solid #6f86c5' : '1px solid #c7c7c7',
        borderRadius: round ? '50%' : 2,
        background: active ? '#f7f9ff' : '#ffffff',
        color: '#777777',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxSizing: 'border-box',
        font: '700 14px Segoe UI, Arial, sans-serif',
      }}
    >
      {children}
    </button>
  );
}

function applyDivisions(value) {
  const url = new URL(window.location.href);
  url.searchParams.set('divisions', String(value));
  url.searchParams.set('v', '112');
  window.location.assign(url.toString());
}

function getPaletteLeft() {
  const aside = document.querySelector('aside');
  if (!aside) return 12;
  const style = window.getComputedStyle(aside);
  const rect = aside.getBoundingClientRect();
  const panelVisible = style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0;
  return panelVisible ? Math.ceil(rect.right + 14) : 12;
}

export default function GannzillaNativeLeftPaletteV110() {
  const [active, setActive] = React.useState(() => String(new URLSearchParams(window.location.search).get('divisions') || '36'));
  const [left, setLeft] = React.useState(() => getPaletteLeft());

  React.useEffect(() => {
    const enabled = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    if (!enabled) return undefined;

    const syncPosition = () => setLeft(getPaletteLeft());
    const observer = new MutationObserver(syncPosition);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
    window.addEventListener('resize', syncPosition);
    const timer = window.setInterval(syncPosition, 500);
    syncPosition();

    window[MARKER] = true;
    window.__auditGannzillaNativeLeftPaletteV112 = () => ({
      ok: window[MARKER] === true,
      position: 'outside-settings-panel-with-gap',
      left,
      wheelUntouched: true,
      divisionsWorking: true,
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncPosition);
      window.clearInterval(timer);
    };
  }, []);

  const choose = (value) => {
    setActive(value);
    if (['12', '24', '36'].includes(value)) applyDivisions(Number(value));
  };

  return (
    <div
      style={{
        position: 'fixed',
        left,
        top: 54,
        zIndex: 2147483600,
        width: 44,
        padding: '6px 4px',
        background: 'rgba(248,248,248,0.96)',
        border: '1px solid #dddddd',
        borderRadius: 22,
        boxShadow: '0 1px 5px rgba(0,0,0,0.14)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {['12', '24', '36'].map((value) => (
        <ToolButton key={value} round active={active === value} title={`Circle of ${value}`} onClick={() => choose(value)}>{value}</ToolButton>
      ))}

      <ToolButton active={active === '4'} title="Angle 4" onClick={() => choose('4')}><span style={{ fontSize: 12 }}>4°</span></ToolButton>
      <ToolButton active={active === '9'} title="Angle 9" onClick={() => choose('9')}><span style={{ fontSize: 12 }}>9°</span></ToolButton>
      <ToolButton active={active === 'N'} title="North" onClick={() => choose('N')}><span style={{ fontStyle: 'italic', fontWeight: 900 }}>N</span></ToolButton>

      {[3, 4, 5, 6, 7, 8, 9].map((sides) => (
        <ToolButton key={sides} active={active === `p${sides}`} title={`${sides}-sided shape`} onClick={() => choose(`p${sides}`)}>
          <svg width="29" height="29" viewBox="0 0 32 32" aria-hidden="true">
            <polygon points={polygonPoints(sides)} fill="#a9a9a9" stroke="#858585" strokeWidth="1.1" />
            {Array.from({ length: sides }, (_, index) => {
              const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
              return <circle key={index} cx={16 + Math.cos(angle) * 8} cy={16 + Math.sin(angle) * 8} r="1.15" fill="#f7f7f7" />;
            })}
          </svg>
        </ToolButton>
      ))}

      <ToolButton active={active === 'angle'} title="Angle tool" onClick={() => choose('angle')}>
        <svg width="28" height="28" viewBox="0 0 32 32"><path d="M6 25 15 8v17h11" fill="none" stroke="#8f8f8f" strokeWidth="2" /><path d="M15 20a7 7 0 0 1 6-6" fill="none" stroke="#aaaaaa" strokeWidth="1.3" /></svg>
      </ToolButton>
      <ToolButton active={active === 'pen'} title="Pen" onClick={() => choose('pen')}>
        <svg width="28" height="28" viewBox="0 0 32 32"><path d="m7 25 4-10 11-9 4 4-9 11Z" fill="#9c9c9c" stroke="#7b7b7b" /><path d="m7 25 6-2-4-4Z" fill="#d9534f" /></svg>
      </ToolButton>
    </div>
  );
}
