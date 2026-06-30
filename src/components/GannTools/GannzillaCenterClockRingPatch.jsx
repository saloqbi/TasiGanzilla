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

function textRotation(deg) {
  let rot = deg - 90;
  while (rot > 180) rot -= 360;
  while (rot < -180) rot += 360;
  if (rot > 90) rot -= 180;
  if (rot < -90) rot += 180;
  return rot;
}

function wheelColor(value) {
  const mod = ((Math.trunc(Number(value)) % 3) + 3) % 3;
  if (mod === 1) return '#e71921';
  if (mod === 2) return '#083fc2';
  return '#111111';
}

function arcPath(cx, cy, innerR, outerR, startDeg, endDeg) {
  const startOuter = polar(cx, cy, outerR, startDeg);
  const endOuter = polar(cx, cy, outerR, endDeg);
  const startInner = polar(cx, cy, innerR, startDeg);
  const endInner = polar(cx, cy, innerR, endDeg);
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return [
    `M ${startOuter.x.toFixed(2)} ${startOuter.y.toFixed(2)}`,
    `A ${outerR.toFixed(2)} ${outerR.toFixed(2)} 0 ${large} 1 ${endOuter.x.toFixed(2)} ${endOuter.y.toFixed(2)}`,
    `L ${endInner.x.toFixed(2)} ${endInner.y.toFixed(2)}`,
    `A ${innerR.toFixed(2)} ${innerR.toFixed(2)} 0 ${large} 0 ${startInner.x.toFixed(2)} ${startInner.y.toFixed(2)}`,
    'Z'
  ].join(' ');
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
  const centerR = Math.max(46, 78 * scale);
  const numbersInner = Math.max(centerR + 5, 88 * scale);
  const numbersOuter = Math.max(numbersInner + 28, 140 * scale);
  const anglesInner = numbersOuter + Math.max(4, 5 * scale);
  const anglesOuter = anglesInner + Math.max(24, 36 * scale);
  const now = getKsaParts();
  void tick;

  const numberFont = Math.max(10, 17 * scale);
  const angleFont = Math.max(12, 25 * scale);
  const timeFont = Math.max(15, 42 * scale);

  const angleSectors = Array.from({ length: 36 }, (_, i) => {
    const start = i * 10;
    const end = start + 10;
    return (
      <path
        key={`s-${i}`}
        d={arcPath(cx, cy, anglesInner, anglesOuter, start, end)}
        fill="rgba(196,196,196,.92)"
        stroke="rgba(255,255,255,.88)"
        strokeWidth={Math.max(0.7, 1.1 * scale)}
      />
    );
  });

  const angleLabels = Array.from({ length: 36 }, (_, i) => {
    const deg = (i + 1) * 10;
    const angle = deg === 360 ? 0 : deg;
    const p = polar(cx, cy, (anglesInner + anglesOuter) / 2, angle);
    return (
      <text
        key={`a-${deg}`}
        x={p.x}
        y={p.y}
        transform={`rotate(${textRotation(angle)} ${p.x} ${p.y})`}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Segoe UI, Tahoma, Arial, sans-serif"
        fontWeight="900"
        fontSize={angleFont}
        fill={wheelColor(deg / 10)}
        stroke="rgba(255,255,255,.78)"
        strokeWidth={Math.max(0.6, 0.9 * scale)}
        paintOrder="stroke fill"
      >
        {deg}
      </text>
    );
  });

  const ringNumbers = Array.from({ length: 36 }, (_, i) => {
    const n = i + 1;
    const angle = n === 36 ? 0 : n * 10;
    const p = polar(cx, cy, (numbersInner + numbersOuter) / 2, angle);
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
        fill="#e8f6ff"
        stroke="rgba(8,17,28,.44)"
        strokeWidth={Math.max(0.5, 1 * scale)}
        paintOrder="stroke fill"
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
        filter: 'drop-shadow(0 7px 18px rgba(0,0,0,.16))'
      }}
    >
      <defs>
        <radialGradient id="gzCenterClockGradV1" cx="48%" cy="42%" r="66%">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="48%" stopColor="#171717" />
          <stop offset="100%" stopColor="#4b4b4b" />
        </radialGradient>
        <radialGradient id="gzNumberRingGradV1" cx="52%" cy="42%" r="70%">
          <stop offset="0%" stopColor="#5c5c5c" />
          <stop offset="55%" stopColor="#303030" />
          <stop offset="100%" stopColor="#686868" />
        </radialGradient>
      </defs>

      {angleSectors}
      <path
        d={arcPath(cx, cy, numbersInner, numbersOuter, 0, 359.99)}
        fill="url(#gzNumberRingGradV1)"
        stroke="rgba(255,255,255,.86)"
        strokeWidth={Math.max(0.9, 1.35 * scale)}
      />
      <circle cx={cx} cy={cy} r={centerR} fill="url(#gzCenterClockGradV1)" stroke="rgba(255,255,255,.56)" strokeWidth={Math.max(0.9, 1.35 * scale)} />
      <circle cx={cx} cy={cy} r={centerR * 0.73} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth={Math.max(0.9, 1.35 * scale)} />
      <circle cx={cx} cy={cy} r={numbersOuter} fill="none" stroke="rgba(25,25,25,.28)" strokeWidth={Math.max(1, 2 * scale)} />
      <circle cx={cx} cy={cy} r={numbersInner} fill="none" stroke="rgba(255,255,255,.44)" strokeWidth={Math.max(0.9, 1.35 * scale)} />
      {angleLabels}
      {ringNumbers}

      <text x={cx} y={cy - centerR * 0.46} textAnchor="middle" fontFamily="Segoe UI, Tahoma, Arial, sans-serif" fontWeight="900" fontSize={Math.max(14, 24 * scale)} fill="#fff" stroke="rgba(0,0,0,.35)" strokeWidth="0.8" paintOrder="stroke fill">كوكبة تاسي</text>
      <text x={cx} y={cy - centerR * 0.22} textAnchor="middle" fontFamily="Segoe UI, Tahoma, Arial, sans-serif" fontWeight="950" fontSize={Math.max(11, 18 * scale)} fill="#0795ff" style={{ filter: 'drop-shadow(0 0 7px rgba(0,145,255,.92))' }}>{now.date}</text>
      <text x={cx} y={cy - centerR * 0.02} textAnchor="middle" fontFamily="Segoe UI, Tahoma, Arial, sans-serif" fontWeight="950" fontSize={Math.max(10, 17 * scale)} fill="#0795ff" style={{ filter: 'drop-shadow(0 0 7px rgba(0,145,255,.92))' }}>{now.weekday}</text>
      <text x={cx} y={cy + centerR * 0.23} textAnchor="middle" fontFamily="Segoe UI, Tahoma, Arial, sans-serif" fontWeight="950" fontSize={timeFont} fill="#0795ff" style={{ filter: 'drop-shadow(0 0 8px rgba(0,145,255,.94))' }}>{now.time}</text>
      <text x={cx} y={cy + centerR * 0.48} textAnchor="middle" fontFamily="Segoe UI, Tahoma, Arial, sans-serif" fontWeight="950" fontSize={Math.max(10, 18 * scale)} fill="#0795ff" style={{ filter: 'drop-shadow(0 0 7px rgba(0,145,255,.92))' }}>KSA</text>
      <text x={cx} y={cy + centerR * 0.75} textAnchor="middle" fontFamily="Segoe UI, Tahoma, Arial, sans-serif" fontWeight="900" fontSize={Math.max(11, 19 * scale)} fill="#f7f7f7" stroke="rgba(0,0,0,.36)" strokeWidth="0.7" paintOrder="stroke fill">سحر الرقم</text>
    </svg>
  );
}
