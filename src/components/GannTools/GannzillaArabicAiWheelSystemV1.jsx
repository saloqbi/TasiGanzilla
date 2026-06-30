import React from 'react';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const TWO_PI = Math.PI * 2;
const BRAND_NAME = 'كوكبة تاسي GOLD AI';
const BRAND_TAGLINE = 'سحر الرقم للذهب والأسواق';

function polar(cx, cy, radius, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function digitalRoot(value) {
  const digits = String(value ?? '').replace(/\D/g, '').split('').map(Number);
  if (!digits.length) return 0;
  let n = digits.reduce((a, b) => a + b, 0);
  while (n > 9) n = String(n).split('').reduce((a, b) => a + Number(b), 0);
  return n || 9;
}

function drawText(ctx, text, x, y, angle, size, color = '#111', weight = 700) {
  ctx.save();
  ctx.translate(x, y);
  let rot = ((angle - 90) * Math.PI) / 180;
  while (rot > Math.PI) rot -= TWO_PI;
  while (rot < -Math.PI) rot += TWO_PI;
  if (rot > Math.PI / 2) rot -= Math.PI;
  if (rot < -Math.PI / 2) rot += Math.PI;
  ctx.rotate(rot);
  ctx.font = `${weight} ${size}px Segoe UI, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(String(text), 0, 0);
  ctx.restore();
}

function wheelNumber(startValue, ringIndex, sectorIndex, divisions, increment) {
  return startValue + (ringIndex * divisions + sectorIndex) * increment;
}

function Field({ label, children, icon = '' }) {
  return (
    <div className="gaip-field">
      <div className="gaip-label">{label}</div>
      <div className="gaip-value">{children}</div>
      <div className="gaip-icon">{icon}</div>
    </div>
  );
}

function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="gaip-section">
      <button className="gaip-section-title" onClick={() => setOpen((v) => !v)}>
        <span className="gaip-collapse">{open ? '−' : '+'}</span>
        <span>{title}</span>
        <span className="gaip-title-icon">{icon}</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function BrandLogo({ compact = false }) {
  return (
    <div className={compact ? 'gaip-logo compact' : 'gaip-logo'} aria-label={BRAND_NAME}>
      <div className="gaip-logo-ring">
        <div className="gaip-logo-arrow" />
        <div className="gaip-logo-candle"><i /><b /></div>
      </div>
      <div className="gaip-logo-text">
        <strong>{compact ? 'TASI GOLD' : BRAND_NAME}</strong>
        {!compact && <span>{BRAND_TAGLINE}</span>}
      </div>
    </div>
  );
}

export default function GannzillaArabicAiWheelSystemV1() {
  const canvasRef = React.useRef(null);
  const [panelVisible, setPanelVisible] = React.useState(true);
  const [zoom, setZoom] = React.useState(0.92);
  const [divisions, setDivisions] = React.useState(36);
  const [levels, setLevels] = React.useState(5);
  const [startValue, setStartValue] = React.useState(1);
  const [increment, setIncrement] = React.useState(1);
  const [findValue, setFindValue] = React.useState(1);
  const [dataType, setDataType] = React.useState('السعر');
  const [clockwise, setClockwise] = React.useState(true);
  const [showNumbers, setShowNumbers] = React.useState(true);
  const [showMarks, setShowMarks] = React.useState(true);
  const [sessionStart, setSessionStart] = React.useState('09:00');
  const [sessionEnd, setSessionEnd] = React.useState('17:00');
  const [dateStart, setDateStart] = React.useState('11.05.2014');
  const [timeStart, setTimeStart] = React.useState('11.05.2014 00:00');
  const [savedAt, setSavedAt] = React.useState(null);

  const selectedRoot = React.useMemo(() => digitalRoot(findValue), [findValue]);
  const panelWidth = panelVisible ? 390 : 0;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const logicalSize = 920;
    canvas.width = logicalSize * dpr;
    canvas.height = logicalSize * dpr;
    canvas.style.width = `${logicalSize * zoom}px`;
    canvas.style.height = `${logicalSize * zoom}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, logicalSize, logicalSize);

    const cx = logicalSize / 2;
    const cy = logicalSize / 2;
    const innerR = 92;
    const ringW = 58;
    const wheelR = innerR + levels * ringW;
    const sector = 360 / divisions;

    const bg = ctx.createRadialGradient(cx, cy, 80, cx, cy, logicalSize * 0.55);
    bg.addColorStop(0, '#071427');
    bg.addColorStop(0.55, '#071427');
    bg.addColorStop(1, '#02060d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, logicalSize, logicalSize);

    for (let r = levels - 1; r >= 0; r -= 1) {
      const inner = innerR + r * ringW;
      const outer = inner + ringW;
      for (let s = 0; s < divisions; s += 1) {
        const start = s * sector;
        const end = start + sector;
        const value = wheelNumber(startValue, r, clockwise ? s : divisions - 1 - s, divisions, increment);
        const isFind = Number(value) === Number(findValue);
        const isFamily = selectedRoot > 0 && digitalRoot(value) === selectedRoot;
        const p1 = ((start - 90) * Math.PI) / 180;
        const p2 = ((end - 90) * Math.PI) / 180;
        ctx.beginPath();
        ctx.arc(cx, cy, outer, p1, p2, false);
        ctx.arc(cx, cy, inner, p2, p1, true);
        ctx.closePath();
        ctx.fillStyle = isFind
          ? 'rgba(255, 175, 32, .42)'
          : isFamily
            ? 'rgba(31, 120, 255, .20)'
            : r % 2
              ? 'rgba(255, 255, 255, .055)'
              : 'rgba(255, 255, 255, .028)';
        ctx.fill();
        ctx.strokeStyle = isFind ? 'rgba(255, 205, 73, .95)' : 'rgba(255, 210, 116, .22)';
        ctx.lineWidth = isFind ? 1.7 : 1;
        ctx.stroke();

        if (showNumbers) {
          const midR = (inner + outer) / 2;
          const midDeg = start + sector / 2;
          const p = polar(cx, cy, midR, midDeg);
          const size = clamp(ringW * 0.34, 12, 22);
          const color = isFind ? '#ffe79a' : isFamily ? '#78c5ff' : '#f4f7ff';
          drawText(ctx, value, p.x, p.y, midDeg, size, color, isFind ? 950 : 750);
        }
      }
    }

    const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR + 18);
    centerGlow.addColorStop(0, 'rgba(255, 196, 71, .22)');
    centerGlow.addColorStop(0.75, 'rgba(31, 120, 255, .16)');
    centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = centerGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR + 18, 0, TWO_PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, innerR - 2, 0, TWO_PI);
    ctx.fillStyle = 'rgba(3, 8, 18, .92)';
    ctx.fill();
    ctx.strokeStyle = '#ffc247';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = '900 28px Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd36c';
    ctx.fillText('GOLD', cx, cy - 10);
    ctx.font = '800 15px Segoe UI, Arial, sans-serif';
    ctx.fillStyle = '#79c7ff';
    ctx.fillText('AI WHEEL', cx, cy + 22);

    if (showMarks) {
      const cardinals = [
        { label: '36 / شمال', deg: 0 },
        { label: '9 / شرق', deg: 90 },
        { label: '18 / جنوب', deg: 180 },
        { label: '27 / غرب', deg: 270 }
      ];
      ctx.strokeStyle = '#ffca5b';
      ctx.fillStyle = '#ffe5a3';
      ctx.lineWidth = 2;
      cardinals.forEach((m) => {
        const a = polar(cx, cy, wheelR + 8, m.deg);
        const b = polar(cx, cy, wheelR + 34, m.deg);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        const t = polar(cx, cy, wheelR + 66, m.deg);
        drawText(ctx, m.label, t.x, t.y, m.deg, 13, '#ffe5a3', 900);
      });
    }
  }, [zoom, divisions, levels, startValue, increment, findValue, clockwise, showNumbers, showMarks, selectedRoot]);

  const saveStudy = () => {
    const payload = { divisions, levels, startValue, increment, findValue, dataType, clockwise, showNumbers, showMarks, sessionStart, sessionEnd, dateStart, timeStart };
    localStorage.setItem('gannzilla-arabic-ai-wheel-system-v1-study', JSON.stringify(payload));
    setSavedAt(new Date().toLocaleTimeString('ar-SA'));
  };

  const loadStudy = () => {
    try {
      const payload = JSON.parse(localStorage.getItem('gannzilla-arabic-ai-wheel-system-v1-study') || '{}');
      if (payload.divisions) setDivisions(payload.divisions);
      if (payload.levels) setLevels(payload.levels);
      if (payload.startValue != null) setStartValue(payload.startValue);
      if (payload.increment != null) setIncrement(payload.increment);
      if (payload.findValue != null) setFindValue(payload.findValue);
      if (payload.dataType) setDataType(payload.dataType);
      if (payload.clockwise != null) setClockwise(payload.clockwise);
      if (payload.showNumbers != null) setShowNumbers(payload.showNumbers);
      if (payload.showMarks != null) setShowMarks(payload.showMarks);
      if (payload.sessionStart) setSessionStart(payload.sessionStart);
      if (payload.sessionEnd) setSessionEnd(payload.sessionEnd);
      if (payload.dateStart) setDateStart(payload.dateStart);
      if (payload.timeStart) setTimeStart(payload.timeStart);
    } catch { /* ignore */ }
  };

  return (
    <div className="gaip-root" dir="rtl">
      <style>{`
        .gaip-root{width:100vw;height:100vh;overflow:hidden;background:#030713;color:#f7f7f7;font-family:Segoe UI,Tahoma,Arial,sans-serif;}
        .gaip-root:before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(circle at 18% 18%,rgba(0,135,255,.18),transparent 24%),radial-gradient(circle at 82% 14%,rgba(255,183,50,.18),transparent 28%),linear-gradient(135deg,rgba(0,0,0,.12),rgba(255,197,74,.04));z-index:0;}
        .gaip-top{position:fixed;left:0;right:0;top:0;height:54px;background:linear-gradient(90deg,#071224,#0b1e3d 45%,#120b02);border-bottom:1px solid rgba(255,207,92,.45);z-index:20;display:flex;align-items:center;direction:rtl;box-shadow:0 0 28px rgba(255,191,55,.18);}
        .gaip-brand{width:${panelVisible ? 390 : 0}px;transition:width .18s;overflow:hidden;height:100%;display:flex;align-items:center;border-left:1px solid rgba(255,207,92,.28);background:linear-gradient(90deg,rgba(255,194,71,.08),rgba(31,120,255,.08));}
        .gaip-toolbar{flex:1;display:flex;align-items:center;gap:6px;padding:0 10px;direction:ltr;}
        .gaip-btn{height:29px;border:1px solid rgba(255,210,105,.52);background:linear-gradient(#14233c,#091528);border-radius:4px;color:#ffd66f;font-weight:900;cursor:pointer;padding:0 10px;box-shadow:0 0 8px rgba(0,156,255,.08);}
        .gaip-btn:hover{background:linear-gradient(#1b3155,#0d1b32);box-shadow:0 0 13px rgba(255,201,75,.22);}
        .gaip-panel{position:fixed;right:0;top:54px;bottom:0;width:390px;background:#10141c;border-left:1px solid rgba(255,207,92,.34);z-index:15;overflow:auto;transition:transform .18s;box-shadow:-12px 0 36px rgba(0,0,0,.32);}
        .gaip-panel.hidden{transform:translateX(395px);}
        .gaip-project{min-height:84px;display:grid;grid-template-columns:1fr 34px 34px 34px;align-items:center;border-bottom:1px solid rgba(255,207,92,.25);background:linear-gradient(135deg,#111b2b,#080b12);padding:6px;gap:4px;}
        .gaip-project input{height:30px;border:1px solid rgba(255,207,92,.35);background:rgba(255,255,255,.06);padding:0 8px;font-weight:900;color:#ffd36c;border-radius:4px;}
        .gaip-section{border-bottom:1px solid rgba(255,255,255,.08);}
        .gaip-section-title{width:100%;height:34px;border:0;border-top:1px solid rgba(255,255,255,.06);background:linear-gradient(90deg,rgba(255,196,71,.13),rgba(0,126,255,.07));color:#f6f6f6;display:grid;grid-template-columns:30px 1fr 32px;align-items:center;font-weight:950;text-align:right;cursor:pointer;}
        .gaip-collapse{color:#4fd3ff;text-align:center;font-size:20px;}
        .gaip-title-icon{text-align:center;color:#ffd36c;}
        .gaip-field{display:grid;grid-template-columns:155px 1fr 30px;min-height:33px;align-items:center;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.035);}
        .gaip-label{padding:4px 10px;font-weight:800;color:#e8eef8;}
        .gaip-value{padding:3px 6px;border-right:1px solid rgba(255,255,255,.08);}
        .gaip-icon{text-align:center;color:#77caff;font-weight:900;}
        .gaip-value input,.gaip-value select{width:100%;height:25px;border:1px solid rgba(255,207,92,.32);background:#050b15;font-weight:800;color:#f7f7f7;box-sizing:border-box;border-radius:3px;}
        .gaip-value option{background:#050b15;color:#f7f7f7;}
        .gaip-check{width:18px!important;height:18px!important;accent-color:#ffc247;}
        .gaip-main{position:absolute;top:54px;left:0;right:${panelWidth}px;bottom:0;overflow:auto;background:radial-gradient(circle at center,rgba(0,125,255,.12),transparent 34%),#030713;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;transition:right .18s;}
        .gaip-hero{width:min(1120px,calc(100% - 40px));margin:18px 20px 8px;min-height:148px;border:1px solid rgba(255,207,92,.42);border-radius:18px;background:linear-gradient(135deg,rgba(255,184,45,.18),rgba(0,107,255,.12) 52%,rgba(0,0,0,.35));box-shadow:0 0 38px rgba(255,196,71,.16),inset 0 0 42px rgba(0,152,255,.08);display:grid;grid-template-columns:1fr auto;align-items:center;gap:18px;padding:22px;box-sizing:border-box;position:relative;overflow:hidden;}
        .gaip-hero:before{content:"";position:absolute;inset:-80px -20px auto auto;width:340px;height:340px;border:1px solid rgba(255,214,111,.22);border-radius:50%;box-shadow:0 0 60px rgba(255,196,71,.18);}
        .gaip-hero h1{position:relative;margin:0;font-size:48px;line-height:1.08;font-weight:1000;letter-spacing:-1px;background:linear-gradient(#fff7c8,#ffbf32 46%,#9d6200);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 20px rgba(255,196,71,.25);}
        .gaip-hero p{position:relative;margin:7px 0 0;color:#a9d9ff;font-size:18px;font-weight:800;}
        .gaip-hero-badges{position:relative;display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;}
        .gaip-badge{border:1px solid rgba(255,207,92,.38);background:rgba(0,0,0,.22);border-radius:999px;padding:5px 11px;color:#ffe6a0;font-weight:900;font-size:13px;}
        .gaip-stage{min-width:1100px;min-height:980px;display:flex;align-items:center;justify-content:center;}
        .gaip-stage canvas{border-radius:50%;box-shadow:0 0 45px rgba(0,126,255,.18),0 0 22px rgba(255,196,71,.16);}
        .gaip-ai{background:linear-gradient(135deg,rgba(255,196,71,.13),rgba(0,126,255,.08));border:1px solid rgba(255,207,92,.35);padding:9px 11px;font-size:13px;line-height:1.65;color:#eef7ff;}
        .gaip-pill{display:inline-block;border:1px solid rgba(255,207,92,.36);border-radius:12px;padding:1px 8px;background:rgba(0,0,0,.22);margin:2px;font-weight:900;color:#ffd66f;}
        .gaip-logo{display:flex;align-items:center;gap:10px;padding:0 10px;direction:rtl;white-space:nowrap;}
        .gaip-logo.compact{padding:0;}
        .gaip-logo-ring{width:44px;height:44px;min-width:44px;border-radius:14px;position:relative;background:radial-gradient(circle at 34% 28%,#fff2a5,#ffc247 42%,#6c4000 76%);box-shadow:0 0 22px rgba(255,196,71,.35),inset 0 0 10px rgba(255,255,255,.24);}
        .gaip-logo.compact .gaip-logo-ring{width:34px;height:34px;min-width:34px;border-radius:11px;}
        .gaip-logo-arrow{position:absolute;right:8px;top:8px;width:19px;height:19px;border-top:5px solid #071224;border-right:5px solid #071224;transform:rotate(-8deg);}
        .gaip-logo-candle{position:absolute;left:10px;bottom:8px;width:9px;height:22px;background:#071224;border-radius:2px;}
        .gaip-logo-candle i{position:absolute;left:3px;top:-8px;width:3px;height:38px;background:#071224;content:"";display:block;}
        .gaip-logo-candle b{position:absolute;left:13px;bottom:4px;width:8px;height:15px;background:#071224;border-radius:2px;content:"";display:block;}
        .gaip-logo-text{display:flex;flex-direction:column;line-height:1.12;}
        .gaip-logo-text strong{font-size:18px;color:#ffd36c;font-weight:1000;text-shadow:0 0 13px rgba(255,196,71,.32);}
        .gaip-logo.compact .gaip-logo-text strong{font-size:13px;}
        .gaip-logo-text span{font-size:11px;color:#7fcaff;font-weight:900;margin-top:2px;}
      `}</style>

      <div className="gaip-top">
        <div className="gaip-brand"><BrandLogo compact /></div>
        <div className="gaip-toolbar">
          <button className="gaip-btn" onClick={() => setPanelVisible((v) => !v)}>{panelVisible ? 'إخفاء اللوحة' : 'إظهار اللوحة'}</button>
          <button className="gaip-btn" onClick={() => setZoom((z) => clamp(z - 0.08, 0.25, 2.4))}>−</button>
          <span style={{ minWidth: 48, textAlign: 'center', fontWeight: 900, color: '#ffd66f' }}>{Math.round(zoom * 100)}%</span>
          <button className="gaip-btn" onClick={() => setZoom((z) => clamp(z + 0.08, 0.25, 2.4))}>＋</button>
          <button className="gaip-btn" onClick={() => setZoom(0.92)}>ملاءمة</button>
          <button className="gaip-btn" onClick={saveStudy}>حفظ الدراسة</button>
          <button className="gaip-btn" onClick={loadStudy}>استرجاع</button>
          <span style={{ marginLeft: 8, color: '#8fcfff', fontWeight: 800 }}>{savedAt ? `آخر حفظ ${savedAt}` : 'بوابة البداية الاحترافية'}</span>
        </div>
      </div>

      <aside className={`gaip-panel ${panelVisible ? '' : 'hidden'}`}>
        <div className="gaip-project">
          <BrandLogo />
          <button className="gaip-btn" title="تعديل">✎</button>
          <button className="gaip-btn" title="إضافة">＋</button>
          <button className="gaip-btn" title="حذف">×</button>
        </div>

        <Section title="مخطط الرسم" icon="▦">
          <Field label="تكبير / تصغير" icon="↔"><input type="number" value={Math.round(zoom * 100)} onChange={(e) => setZoom(clamp(Number(e.target.value) / 100 || zoom, 0.25, 2.4))} /></Field>
          <Field label="المظهر" icon="▾"><select value={divisions} onChange={(e) => setDivisions(Number(e.target.value))}><option value={12}>رسم دائرة الـ 12</option><option value={24}>رسم دائرة الـ 24</option><option value={36}>رسم دائرة الـ 36</option><option value={360}>رسم دائرة الـ 360</option></select></Field>
          <Field label="حجم" icon=""><input type="number" min="1" max="10" value={levels} onChange={(e) => setLevels(clamp(Number(e.target.value) || 1, 1, 10))} /></Field>
          <Field label="نوع البيانات" icon="▾"><select value={dataType} onChange={(e) => setDataType(e.target.value)}><option>السعر</option><option>التاريخ</option><option>الوقت</option><option>السعر والتاريخ</option><option>السعر والوقت</option></select></Field>
        </Section>

        <Section title="السعر" icon="▣">
          <Field label="بحث" icon="🔍"><input type="number" value={findValue} onChange={(e) => setFindValue(Number(e.target.value) || 0)} /></Field>
          <Field label="القيمة الأولية" icon="‹›"><input type="number" value={startValue} onChange={(e) => setStartValue(Number(e.target.value) || 0)} /></Field>
          <Field label="مقدار الزيادة" icon=""><input type="number" value={increment} onChange={(e) => setIncrement(Number(e.target.value) || 1)} /></Field>
        </Section>

        <Section title="التاريخ" icon="◷">
          <Field label="بحث" icon="🔍"><input value={dateStart} onChange={(e) => setDateStart(e.target.value)} /></Field>
          <Field label="القيمة الأولية" icon="‹›"><input value={dateStart} onChange={(e) => setDateStart(e.target.value)} /></Field>
          <Field label="مقدار الزيادة" icon="▾"><select defaultValue="اليوم"><option>اليوم</option><option>الأسبوع</option><option>الشهر</option></select></Field>
          <Field label="شكل" icon="▾"><select defaultValue="dd.mm"><option>dd.mm</option><option>dd-mm</option><option>mm/dd</option></select></Field>
          <Field label="وضع / رتبة" icon="▾"><select defaultValue="أعلى"><option>أعلى</option><option>أسفل</option></select></Field>
        </Section>

        <Section title="الوقت" icon="◴">
          <Field label="بحث" icon="🔍"><input value={timeStart} onChange={(e) => setTimeStart(e.target.value)} /></Field>
          <Field label="القيمة الأولية" icon="‹›"><input value={timeStart} onChange={(e) => setTimeStart(e.target.value)} /></Field>
          <Field label="مقدار الزيادة" icon="▾"><select defaultValue="30 دقيقة"><option>30 دقيقة</option><option>1 ساعة</option><option>4 ساعات</option></select></Field>
          <Field label="وضع / رتبة" icon="▾"><select defaultValue="أسفل"><option>أعلى</option><option>أسفل</option></select></Field>
        </Section>

        <Section title="جلسة" icon="▤">
          <Field label="مرئي"><input className="gaip-check" type="checkbox" defaultChecked /></Field>
          <Field label="بدء الوقت"><input value={sessionStart} onChange={(e) => setSessionStart(e.target.value)} /></Field>
          <Field label="نهاية الوقت"><input value={sessionEnd} onChange={(e) => setSessionEnd(e.target.value)} /></Field>
        </Section>

        <Section title="إضاءات" icon="✦">
          <Field label="في اتجاه عقارب الساعة"><input className="gaip-check" type="checkbox" checked={clockwise} onChange={(e) => setClockwise(e.target.checked)} /></Field>
          <Field label="عرض العلامات"><input className="gaip-check" type="checkbox" checked={showMarks} onChange={(e) => setShowMarks(e.target.checked)} /></Field>
          <Field label="عرض الأرقام"><input className="gaip-check" type="checkbox" checked={showNumbers} onChange={(e) => setShowNumbers(e.target.checked)} /></Field>
        </Section>

        <Section title="المفتش الذكي" icon="◇">
          <div className="gaip-ai">
            <div><b>قراءة أولية:</b></div>
            <div>الرقم المطلوب: <span className="gaip-pill">{findValue}</span></div>
            <div>جذر الرقم: <span className="gaip-pill">{selectedRoot}</span></div>
            <div>نوع البيانات: <span className="gaip-pill">{dataType}</span></div>
            <div>المحاور المرجعية: <span className="gaip-pill">36 شمال</span><span className="gaip-pill">9 شرق</span><span className="gaip-pill">18 جنوب</span><span className="gaip-pill">27 غرب</span></div>
            <div style={{ marginTop: 6, color: '#ffe6a0' }}>هذه بوابة البداية الاحترافية. بعد تثبيت الأساس نربطها مع السعر الحي و TradingView / MT5.</div>
          </div>
        </Section>
      </aside>

      <main className="gaip-main">
        <section className="gaip-hero">
          <div>
            <h1>{BRAND_NAME}</h1>
            <p>{BRAND_TAGLINE} — نظام عربي ذكي لإدارة العجلة السعرية والزمنية</p>
            <div className="gaip-hero-badges">
              <span className="gaip-badge">تحليل رقمي احترافي</span>
              <span className="gaip-badge">سعر + تاريخ + وقت</span>
              <span className="gaip-badge">جاهز للتطوير مع المنصات</span>
              <span className="gaip-badge">TASI / GOLD</span>
            </div>
          </div>
          <BrandLogo />
        </section>
        <div className="gaip-stage">
          <canvas ref={canvasRef} />
        </div>
      </main>
    </div>
  );
}
