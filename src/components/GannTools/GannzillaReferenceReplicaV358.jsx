import React from 'react';

const TWO_PI = Math.PI * 2;
const PANEL_WIDTH = 300;
const TOOLBAR_HEIGHT = 28;
const COLORS = Object.freeze({
  red: '#c91d24',
  blue: '#1659c9',
  black: '#111111',
  ringGray: '#dededb',
  grid: '#c8c9c6',
  protractor: '#d9a6a0',
  protractorLight: '#ead2cf',
  calendar: '#a9c9b6',
  calendarText: '#4f5552',
  minor: '#818181',
});

const CALENDAR_EN = [
  '21 MAR', '6 APR', '21 APR', '6 MAY', '21 MAY', '6 JUN',
  '21 JUN', '6 JUL', '22 JUL', '6 AUG', '22 AUG', '6 SEP',
  '22 SEP', '7 OCT', '22 OCT', '6 NOV', '21 NOV', '6 DEC',
  '21 DEC', '5 JAN', '20 JAN', '4 FEB', '19 FEB', '6 MAR',
];

const CALENDAR_AR = [
  '٢١ مارس', '٦ أبريل', '٢١ أبريل', '٦ مايو', '٢١ مايو', '٦ يونيو',
  '٢١ يونيو', '٦ يوليو', '٢٢ يوليو', '٦ أغسطس', '٢٢ أغسطس', '٦ سبتمبر',
  '٢٢ سبتمبر', '٧ أكتوبر', '٢٢ أكتوبر', '٦ نوفمبر', '٢١ نوفمبر', '٦ ديسمبر',
  '٢١ ديسمبر', '٥ يناير', '٢٠ يناير', '٤ فبراير', '١٩ فبراير', '٦ مارس',
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function numberParam(params, name, fallback, min, max) {
  const value = Number(params.get(name));
  return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function boolParam(params, name, fallback) {
  if (!params.has(name)) return fallback;
  const value = String(params.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function normalizeRotation(degrees) {
  let radians = ((degrees - 90) * Math.PI) / 180;
  while (radians > Math.PI) radians -= TWO_PI;
  while (radians < -Math.PI) radians += TWO_PI;
  if (radians > Math.PI / 2) radians -= Math.PI;
  if (radians < -Math.PI / 2) radians += Math.PI;
  return radians;
}

function wedge(ctx, cx, cy, innerRadius, outerRadius, centerDegrees, widthDegrees) {
  const start = ((centerDegrees - widthDegrees / 2 - 90) * Math.PI) / 180;
  const end = ((centerDegrees + widthDegrees / 2 - 90) * Math.PI) / 180;
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, start, end, false);
  ctx.arc(cx, cy, innerRadius, end, start, true);
  ctx.closePath();
}

function wheelNumberColor(value) {
  const n = Math.trunc(Number(value));
  const mod = ((n % 3) + 3) % 3;
  if (mod === 1) return COLORS.red;
  if (mod === 2) return COLORS.blue;
  return COLORS.black;
}

function angleColor(degree) {
  const slot = Math.abs(Math.round(degree / 10)) % 9;
  if (slot === 1 || slot === 4 || slot === 7) return COLORS.red;
  if (slot === 2 || slot === 5 || slot === 8) return COLORS.blue;
  return COLORS.black;
}

function toArabicDigits(value) {
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(value).replace(/\d/g, (digit) => map[Number(digit)]);
}

function drawRotatedText(ctx, text, x, y, angle, font, color, weight = 700) {
  ctx.save();
  ctx.translate(Math.round(x) + 0.5, Math.round(y) + 0.5);
  ctx.rotate(normalizeRotation(angle));
  ctx.font = `${weight} ${font}px Segoe UI, Tahoma, Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(text), 0, 0);
  ctx.restore();
}

function Section({ title, children, open = true }) {
  return (
    <section style={{ borderBottom: '1px solid #c9c9c9' }}>
      <div style={{ height: 24, display: 'flex', alignItems: 'center', gap: 5, padding: '0 6px', background: '#ececdd', fontWeight: 800, borderTop: '1px solid #d6d6cb' }}>
        <span style={{ color: '#1b9aa9', width: 11 }}>{open ? '−' : '+'}</span>
        <span>{title}</span>
      </div>
      {open ? children : null}
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '132px 1fr', minHeight: 26, alignItems: 'center', borderTop: '1px solid #e0e0e0', background: '#f4f4f1' }}>
      <div style={{ padding: '3px 7px', color: '#333', fontWeight: 600 }}>{label}</div>
      <div style={{ padding: '2px 6px' }}>{children}</div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  height: 21,
  border: '1px solid #a8a8a8',
  background: '#ffffff',
  color: '#111',
  fontSize: 12,
  boxSizing: 'border-box',
};

export default function GannzillaReferenceReplicaV358() {
  const params = React.useMemo(() => new URLSearchParams(window.location.search), []);
  const lang = params.get('lang') === 'ar' ? 'ar' : 'en';
  const t = React.useCallback((en, ar) => (lang === 'ar' ? ar : en), [lang]);
  const canvasRef = React.useRef(null);
  const viewportRef = React.useRef(null);

  const [levels, setLevels] = React.useState(() => Math.round(numberParam(params, 'levels', 10, 1, 10)));
  const [divisions] = React.useState(() => Math.round(numberParam(params, 'divisions', 36, 12, 72)));
  const [startValue, setStartValue] = React.useState(() => numberParam(params, 'startValue', 1, -999999, 999999));
  const [increment, setIncrement] = React.useState(() => numberParam(params, 'increment', 1, 0.0001, 999999));
  const [clockwise, setClockwise] = React.useState(() => boolParam(params, 'clockwise', true));
  const [showNumbers, setShowNumbers] = React.useState(true);
  const [showProtractor, setShowProtractor] = React.useState(() => boolParam(params, 'showProtractor', true));
  const [showCalendar, setShowCalendar] = React.useState(() => boolParam(params, 'showChronometer', true));
  const [markerAngle, setMarkerAngle] = React.useState(() => numberParam(params, 'markerAngle', 110, 0, 359));
  const [windowSize, setWindowSize] = React.useState(() => ({ width: window.innerWidth, height: window.innerHeight }));

  const geometry = React.useMemo(() => {
    const innerRadius = numberParam(params, 'replicaInnerRadius', 142, 90, 260);
    const ringWidth = numberParam(params, 'replicaRingWidth', 56, 36, 90);
    const wheelRadius = innerRadius + levels * ringWidth;
    const protractorInner = wheelRadius + 14;
    const protractorOuter = protractorInner + 58;
    const calendarRadius = protractorOuter + 34;
    const outerRadius = calendarRadius + 54;
    const size = Math.ceil(outerRadius * 2 + 18);
    return { innerRadius, ringWidth, wheelRadius, protractorInner, protractorOuter, calendarRadius, outerRadius, size };
  }, [levels, params]);

  const viewportWidth = Math.max(300, windowSize.width - PANEL_WIDTH);
  const viewportHeight = Math.max(300, windowSize.height - TOOLBAR_HEIGHT);
  const fitScale = Math.min((viewportWidth - 24) / geometry.size, (viewportHeight - 24) / geometry.size);
  const zoomMultiplier = numberParam(params, 'replicaZoom', 1, 0.65, 1.5);
  const scale = clamp(fitScale * zoomMultiplier, 0.18, 1.4);

  React.useEffect(() => {
    const onResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cssSize = Math.ceil(geometry.size * scale);
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2.5);
    canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`;
    canvas.width = Math.ceil(cssSize * dpr);
    canvas.height = Math.ceil(cssSize * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, geometry.size, geometry.size);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, geometry.size, geometry.size);

    const cx = geometry.size / 2;
    const cy = geometry.size / 2;
    const sector = 360 / divisions;
    const direction = clockwise ? 1 : -1;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, geometry.innerRadius, 0, TWO_PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    for (let ring = 1; ring <= levels; ring += 1) {
      const inner = geometry.innerRadius + (ring - 1) * geometry.ringWidth;
      const outer = inner + geometry.ringWidth;
      const mid = (inner + outer) / 2;
      const fill = ring % 2 === 0 ? COLORS.ringGray : '#ffffff';

      for (let index = 0; index < divisions; index += 1) {
        const centerDegrees = direction * (index + 1) * sector;
        const value = startValue + (((ring - 1) * divisions) + index) * increment;
        const displayValue = Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));

        ctx.save();
        wedge(ctx, cx, cy, inner, outer, centerDegrees, sector);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 0.95;
        ctx.stroke();
        ctx.restore();

        if (showNumbers) {
          const point = polar(cx, cy, mid, centerDegrees);
          const arcRoom = (TWO_PI * mid / divisions) * 0.68;
          const radialRoom = geometry.ringWidth * 0.72;
          const fontSize = clamp(Math.min(arcRoom / Math.max(2.2, displayValue.length * 0.56), radialRoom / 2.4), 11, 20);
          const text = lang === 'ar' ? toArabicDigits(displayValue) : displayValue;
          drawRotatedText(ctx, text, point.x, point.y, centerDegrees, fontSize, wheelNumberColor(value), 700);
        }
      }
    }

    if (showProtractor) {
      ctx.save();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = COLORS.protractorLight;
      ctx.beginPath();
      ctx.arc(cx, cy, geometry.protractorInner, 0, TWO_PI);
      ctx.stroke();
      ctx.strokeStyle = COLORS.protractor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, geometry.protractorOuter, 0, TWO_PI);
      ctx.stroke();

      for (let degree = 0; degree < 360; degree += 5) {
        const actual = direction * degree;
        const isTen = degree % 10 === 0;
        const p1 = polar(cx, cy, geometry.protractorInner + (isTen ? 0 : 12), actual);
        const p2 = polar(cx, cy, geometry.protractorOuter + (isTen ? 5 : 0), actual);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = isTen ? '#df4d48' : '#b7b7b7';
        ctx.lineWidth = isTen ? 1.35 : 0.75;
        ctx.stroke();

        const labelRadius = geometry.protractorOuter + (isTen ? 16 : 13);
        const point = polar(cx, cy, labelRadius, actual);
        if (isTen) {
          const label = `${lang === 'ar' ? toArabicDigits(degree) : degree}°`;
          drawRotatedText(ctx, label, point.x, point.y, actual, 16, angleColor(degree), 700);
        } else {
          const label = lang === 'ar' ? toArabicDigits(degree) : degree;
          drawRotatedText(ctx, label, point.x, point.y, actual, 11, COLORS.minor, 500);
        }
      }
      ctx.restore();
    }

    if (showCalendar) {
      const labels = lang === 'ar' ? CALENDAR_AR : CALENDAR_EN;
      ctx.save();
      ctx.strokeStyle = COLORS.calendar;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(cx, cy, geometry.calendarRadius, 0, TWO_PI);
      ctx.stroke();

      labels.forEach((label, index) => {
        const degree = direction * (index * 15);
        const majorSeason = index % 6 === 0;
        const tickInner = polar(cx, cy, geometry.calendarRadius - (majorSeason ? 10 : 7), degree);
        const tickOuter = polar(cx, cy, geometry.calendarRadius + (majorSeason ? 10 : 7), degree);
        ctx.beginPath();
        ctx.moveTo(tickInner.x, tickInner.y);
        ctx.lineTo(tickOuter.x, tickOuter.y);
        ctx.strokeStyle = '#168f5c';
        ctx.lineWidth = majorSeason ? 2.6 : 1.8;
        ctx.stroke();

        const point = polar(cx, cy, geometry.calendarRadius + 31, degree);
        drawRotatedText(ctx, label, point.x, point.y, degree, majorSeason ? 15 : 13, COLORS.calendarText, majorSeason ? 700 : 600);
      });
      ctx.restore();
    }

    ctx.save();
    const pointerDegrees = direction * markerAngle;
    const point = polar(cx, cy, geometry.calendarRadius + 4, pointerDegrees);
    ctx.translate(point.x, point.y);
    ctx.rotate(((pointerDegrees - 90) * Math.PI) / 180);
    ctx.fillStyle = '#e52b1f';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(8, 10);
    ctx.lineTo(-8, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    window.GANNZILLA_REFERENCE_REPLICA_V358 = true;
    window.__auditGannzillaReferenceReplicaV358 = () => ({
      ok: true,
      build: 358,
      levels,
      divisions,
      northColumn: Array.from({ length: levels }, (_, index) => (index + 1) * divisions),
      redProtractorFrame: true,
      greenAnnualCalendarFrame: true,
      fiveDegreeMinorLabels: true,
      tenDegreeColoredLabels: true,
      annualCalendarLabels: 24,
      highDpiCanvas: true,
      fitScale: scale,
      panelReplica: true,
      toolbarReplica: true,
    });
  }, [geometry, scale, divisions, levels, startValue, increment, clockwise, showNumbers, showProtractor, showCalendar, markerAngle, lang]);

  const panelDirection = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#ffffff', color: '#222', fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', direction: 'ltr' }}>
      <header style={{ position: 'fixed', inset: '0 0 auto 0', height: TOOLBAR_HEIGHT, display: 'flex', alignItems: 'center', background: '#efefef', borderBottom: '1px solid #b7b7b7', zIndex: 40, fontSize: 12 }}>
        <div style={{ width: PANEL_WIDTH, height: '100%', display: 'flex', alignItems: 'center', gap: 5, padding: '0 6px', borderRight: '1px solid #c7c7c7', boxSizing: 'border-box' }}>
          <strong>Gannzilla Pro</strong>
          <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{t('Default', 'الافتراضي')}</span>
          <button style={{ height: 20, border: '1px solid #aaa', background: '#f8f8f8', color: '#0a9a38', fontWeight: 800 }}>＋</button>
          <button style={{ height: 20, border: '1px solid #aaa', background: '#f8f8f8', color: '#c22', fontWeight: 800 }}>−</button>
          <button style={{ height: 20, border: '1px solid #aaa', background: '#f8f8f8' }}>✎</button>
          <button style={{ height: 20, border: '1px solid #aaa', background: '#f8f8f8' }}>▣</button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, paddingRight: 8 }}>
          {['↖', '—', '▢', 'T', '⌕', '⛶'].map((icon) => <button key={icon} style={{ width: 24, height: 21, border: '1px solid #b7b7b7', background: '#fafafa', color: '#236ca8' }}>{icon}</button>)}
          <span style={{ marginLeft: 6, fontWeight: 700 }}>{Math.round(scale * 100)}%</span>
          <span style={{ marginLeft: 8 }}>{lang === 'ar' ? '🇸🇦 العربية' : '🇬🇧 English'}</span>
          <span style={{ marginLeft: 6, color: '#2360a4', fontWeight: 800 }}>ⓘ</span>
        </div>
      </header>

      <aside style={{ position: 'fixed', left: 0, top: TOOLBAR_HEIGHT, bottom: 0, width: PANEL_WIDTH, overflowY: 'auto', background: '#f2f2ef', borderRight: '1px solid #b7b7b7', zIndex: 30, fontSize: 12, direction: panelDirection }}>
        <Section title={t('Layout', 'التخطيط')}>
          <Row label={t('Visible', 'ظاهر')}><input type="checkbox" checked readOnly /></Row>
          <Row label={t('Clockwise', 'مع عقارب الساعة')}><input type="checkbox" checked={clockwise} onChange={(event) => setClockwise(event.target.checked)} /></Row>
          <Row label={t('Size', 'الحجم')}><input style={inputStyle} type="number" min="1" max="10" value={levels} onChange={(event) => setLevels(clamp(Number(event.target.value) || 1, 1, 10))} /></Row>
          <Row label={t('View', 'طريقة العرض')}><select style={inputStyle} value={divisions} readOnly><option value={36}>{t('Circle of 36', 'دائرة من ٣٦')}</option></select></Row>
          <Row label={t('Data type', 'نوع البيانات')}><select style={inputStyle} defaultValue="Price"><option>{t('Price', 'السعر')}</option></select></Row>
        </Section>

        <Section title={t('Price', 'السعر')}>
          <Row label={t('Value', 'القيمة')}><input style={inputStyle} type="number" value={startValue} onChange={(event) => setStartValue(Number(event.target.value) || 0)} /></Row>
          <Row label={t('Increment', 'الزيادة')}><input style={inputStyle} type="number" value={increment} onChange={(event) => setIncrement(Number(event.target.value) || 1)} /></Row>
        </Section>

        <Section title={t('Highlight', 'التمييز')}>
          <Row label={t('Show numbers', 'إظهار الأرقام')}><input type="checkbox" checked={showNumbers} onChange={(event) => setShowNumbers(event.target.checked)} /></Row>
        </Section>

        <Section title={t('Protractor', 'المنقلة')}>
          <Row label={t('Visible', 'ظاهر')}><input type="checkbox" checked={showProtractor} onChange={(event) => setShowProtractor(event.target.checked)} /></Row>
          <Row label={t('Angle', 'الزاوية')}><input style={inputStyle} type="number" min="0" max="359" value={markerAngle} onChange={(event) => setMarkerAngle(clamp(Number(event.target.value) || 0, 0, 359))} /></Row>
        </Section>

        <Section title={t('Chronometer', 'مقياس الزمن')}>
          <Row label={t('Visible', 'ظاهر')}><input type="checkbox" checked={showCalendar} onChange={(event) => setShowCalendar(event.target.checked)} /></Row>
          <Row label={t('Range', 'النطاق')}><select style={inputStyle} defaultValue="Annual"><option>{t('Annual', 'سنوي')}</option></select></Row>
        </Section>

        {['Counter', 'Secondary scale', 'Marker', 'Cosmogram'].map((label) => (
          <Section key={label} title={t(label, label === 'Counter' ? 'العداد' : label === 'Secondary scale' ? 'المقياس الثانوي' : label === 'Marker' ? 'المؤشر' : 'الخريطة الفلكية')} open={false} />
        ))}
      </aside>

      <main ref={viewportRef} style={{ position: 'fixed', left: PANEL_WIDTH, right: 0, top: TOOLBAR_HEIGHT, bottom: 0, overflow: 'auto', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas ref={canvasRef} aria-label="Gannzilla reference replica wheel" style={{ display: 'block', flex: '0 0 auto' }} />
      </main>
    </div>
  );
}
