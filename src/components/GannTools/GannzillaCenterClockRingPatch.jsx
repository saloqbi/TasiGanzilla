import React from 'react';

function pad2(value) {
  return String(value).padStart(2, '0');
}

function getKsaParts() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(new Date()).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: String(parts.weekday || '').toUpperCase(),
    time: `${pad2(parts.hour)}:${pad2(parts.minute)}:${pad2(parts.second)}`
  };
}

function getWheelCanvas() {
  return Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({ canvas, rect: canvas.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 140 && rect.height > 140)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.canvas || null;
}

function getLevels() {
  const input = Array.from(document.querySelectorAll('aside input[type="number"]'))[0];
  const n = Number(input?.value);
  return Number.isFinite(n) && n > 0 ? Math.max(1, Math.min(12, n)) : 5;
}

function getUnrotatedRect(canvas) {
  const visual = canvas.getBoundingClientRect();
  const width = canvas.offsetWidth || Number.parseFloat(canvas.style.width) || visual.width;
  const height = canvas.offsetHeight || Number.parseFloat(canvas.style.height) || visual.height;
  const centerX = visual.left + visual.width / 2;
  const centerY = visual.top + visual.height / 2;
  const left = centerX - width / 2;
  const top = centerY - height / 2;
  return { left, top, width, height };
}

function polar(cx, cy, radius, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

export default function GannzillaCenterClockRingPatch() {
  const [tick, setTick] = React.useState(0);
  const [box, setBox] = React.useState(null);

  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const update = () => {
      const canvas = getWheelCanvas();
      if (!canvas) {
        setBox(null);
        return;
      }
      const rect = getUnrotatedRect(canvas);
      const levels = getLevels();
      const designSize = 470 + 96 * levels;
      const scale = rect.width / designSize;
      setBox({ ...rect, scale });
      setTick((v) => v + 1);
    };

    update();
    const timer = window.setInterval(update, 1000);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, []);

  if (!box) return null;

  const cx = box.width / 2;
  const cy = box.height / 2;
  const scale = box.scale;
  const centerR = Math.max(72, 122 * scale);
  const innerCircleR = centerR * 0.58;
  const numbersR = centerR * 0.82;
  const now = getKsaParts();
  void tick;

  const numberFont = Math.max(10, 13.2 * scale);
  const timeFont = Math.max(16, 30 * scale);
  const titleFont = Math.max(11, 16.5 * scale);
  const smallFont = Math.max(8.5, 12.2 * scale);
  const ksaFont = Math.max(9, 12.4 * scale);

  const ringNumbers = Array.from({ length: 36 }, (_, i) => {
    const n = i + 1;
    const angle = n === 36 ? 0 : n * 10;
    const p = polar(cx, cy, numbersR, angle);
    return (
      <text
        key={`n-${n}`}
        x={p.x}
        y={p.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Segoe UI, Tahoma, Arial, sans-serif"
        fontWeight="950"
        fontSize={numberFont}
        fill="#d8f0ff"
        stroke="rgba(18,30,42,.42)"
        strokeWidth={Math.max(0.45, 0.82 * scale)}
        paintOrder="stroke fill"
        style={{ filter: 'drop-shadow(0 0 4px rgba(70,165,255,.48))' }}
      >
        {n}
      </text>
    );
  });

  return (
    <svg
      id="gannzilla-center-clock-ring-layer-v1"
      viewBox={`0 0 ${box.width} ${box.height}`}
      width={box.width}
      height={box.height}
      style={{
        position: 'fixed',
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        zIndex: 47,
        pointerEvents: 'none',
        overflow: 'visible',
        textRendering: 'geometricPrecision',
        shapeRendering: 'geometricPrecision',
        filter: 'drop-shadow(0 6px 16px rgba(0,0,0,.18))'
      }}
    >
      <defs>
        <radialGradient id="gzCenterClockGradV2" cx="48%" cy="42%" r="67%">
          <stop offset="0%" stopColor="#353535" />
          <stop offset="48%" stopColor="#161616" />
          <stop offset="100%" stopColor="#686868" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={centerR} fill="url(#gzCenterClockGradV2)" stroke="rgba(255,255,255,.42)" strokeWidth={Math.max(0.9, 1.2 * scale)} />
      <circle cx={cx} cy={cy} r={innerCircleR} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth={Math.max(0.8, 1.05 * scale)} />
      {ringNumbers}

      <text x={cx} y={cy - innerCircleR * 0.36} textAnchor="middle" fontFamily="Segoe UI, Tahoma, Arial, sans-serif" fontWeight="900" fontSize={titleFont} fill="#f4f4f4" stroke="rgba(0,0,0,.30)" strokeWidth="0.65" paintOrder="stroke fill">كوكبة تاسي</text>
      <text x={cx} y={cy - innerCircleR * 0.12} textAnchor="middle" fontFamily="Segoe UI, Tahoma, Arial, sans-serif" fontWeight="900" fontSize={smallFont} fill="#0795ff" style={{ filter: 'drop-shadow(0 0 6px rgba(0,145,255,.80))' }}>{now.date}</text>
      <text x={cx} y={cy + innerCircleR * 0.07} textAnchor="middle" fontFamily="Segoe UI, Tahoma, Arial, sans-serif" fontWeight="900" fontSize={smallFont * 0.92} fill="#0795ff" style={{ filter: 'drop-shadow(0 0 6px rgba(0,145,255,.80))' }}>{now.weekday}</text>
      <text x={cx} y={cy + innerCircleR * 0.29} textAnchor="middle" fontFamily="Segoe UI, Tahoma, Arial, sans-serif" fontWeight="950" fontSize={timeFont} fill="#0795ff" style={{ filter: 'drop-shadow(0 0 7px rgba(0,145,255,.88))' }}>{now.time}</text>
      <text x={cx} y={cy + innerCircleR * 0.53} textAnchor="middle" fontFamily="Segoe UI, Tahoma, Arial, sans-serif" fontWeight="900" fontSize={ksaFont} fill="#0795ff" style={{ filter: 'drop-shadow(0 0 6px rgba(0,145,255,.80))' }}>KSA</text>
    </svg>
  );
}
