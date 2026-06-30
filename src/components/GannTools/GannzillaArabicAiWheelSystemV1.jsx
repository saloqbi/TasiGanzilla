import React from 'react';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const TWO_PI = Math.PI * 2;

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

const sections = [
  { key: 'chart', title: 'مخطط الرسم', icon: '▦' },
  { key: 'price', title: 'السعر', icon: '▣' },
  { key: 'date', title: 'التاريخ', icon: '◷' },
  { key: 'time', title: 'الوقت', icon: '◴' },
  { key: 'session', title: 'جلسة', icon: '▤' },
  { key: 'lighting', title: 'إضاءات', icon: '✦' },
  { key: 'ai', title: 'المفتش الذكي', icon: '◇' }
];

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
  const panelWidth = panelVisible ? 360 : 0;

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

    ctx.fillStyle = '#fff';
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
        ctx.fillStyle = isFind ? 'rgba(255, 85, 85, .26)' : isFamily ? 'rgba(40, 210, 90, .13)' : r % 2 ? '#f7f7f7' : '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#d9d9d9';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (showNumbers) {
          const midR = (inner + outer) / 2;
          const midDeg = start + sector / 2;
          const p = polar(cx, cy, midR, midDeg);
          const size = clamp(ringW * 0.34, 12, 22);
          drawText(ctx, value, p.x, p.y, midDeg, size, isFind ? '#d40000' : '#111', isFind ? 900 : 700);
        }
      }
    }

    ctx.beginPath();
    ctx.arc(cx, cy, innerR - 2, 0, TWO_PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#cfcfcf';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (showMarks) {
      const cardinals = [
        { label: '36 / شمال', deg: 0 },
        { label: '9 / شرق', deg: 90 },
        { label: '18 / جنوب', deg: 180 },
        { label: '27 / غرب', deg: 270 }
      ];
      ctx.strokeStyle = '#d64848';
      ctx.fillStyle = '#555';
      ctx.lineWidth = 1.5;
      cardinals.forEach((m) => {
        const a = polar(cx, cy, wheelR + 8, m.deg);
        const b = polar(cx, cy, wheelR + 28, m.deg);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        const t = polar(cx, cy, wheelR + 58, m.deg);
        drawText(ctx, m.label, t.x, t.y, m.deg, 12, '#666', 800);
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
        .gaip-root{width:100vw;height:100vh;overflow:hidden;background:#ffffff;color:#222;font-family:Segoe UI,Tahoma,Arial,sans-serif;}
        .gaip-top{position:fixed;left:0;right:0;top:0;height:34px;background:#efefef;border-bottom:1px solid #bcbcbc;z-index:20;display:flex;align-items:center;direction:rtl;}
        .gaip-brand{width:${panelVisible ? 360 : 0}px;transition:width .18s;overflow:hidden;height:100%;display:flex;align-items:center;border-left:1px solid #c9c9c9;background:#f8f8f8;}
        .gaip-brand b{padding:0 10px;color:#1e4d7e;white-space:nowrap;}
        .gaip-toolbar{flex:1;display:flex;align-items:center;gap:4px;padding:0 8px;direction:ltr;}
        .gaip-btn{height:25px;border:1px solid #9d9d9d;background:#f8f8f8;border-radius:2px;color:#1c75bc;font-weight:800;cursor:pointer;padding:0 9px;}
        .gaip-btn:hover{background:#dceeff;}
        .gaip-panel{position:fixed;right:0;top:34px;bottom:0;width:360px;background:#f2f2f2;border-left:1px solid #b9b9b9;z-index:15;overflow:auto;transition:transform .18s;}
        .gaip-panel.hidden{transform:translateX(365px);}
        .gaip-project{height:34px;display:grid;grid-template-columns:1fr 30px 30px 30px;align-items:center;border-bottom:1px solid #c9c9c9;background:#fff;}
        .gaip-project input{height:24px;border:0;background:#fff;padding:0 8px;font-weight:800;color:#154d8b;}
        .gaip-section{border-bottom:1px solid #cfcfcf;}
        .gaip-section-title{width:100%;height:28px;border:0;border-top:1px solid #d8d8d8;background:#ececdd;color:#111;display:grid;grid-template-columns:26px 1fr 28px;align-items:center;font-weight:900;text-align:right;cursor:pointer;}
        .gaip-collapse{color:#008ba6;text-align:center;font-size:18px;}
        .gaip-title-icon{text-align:center;color:#999;}
        .gaip-field{display:grid;grid-template-columns:145px 1fr 28px;min-height:28px;align-items:center;border-bottom:1px solid #d8d8d8;background:#f6f6f6;}
        .gaip-label{padding:3px 8px;font-weight:700;color:#333;}
        .gaip-value{padding:2px 5px;border-right:1px solid #d7d7d7;}
        .gaip-icon{text-align:center;color:#888;font-weight:800;}
        .gaip-value input,.gaip-value select{width:100%;height:23px;border:1px solid #aaa;background:#fff;font-weight:700;color:#111;box-sizing:border-box;}
        .gaip-check{width:18px!important;height:18px!important;accent-color:#2276bd;}
        .gaip-main{position:absolute;top:34px;left:0;right:${panelWidth}px;bottom:0;overflow:auto;background:#fff;display:flex;align-items:center;justify-content:center;transition:right .18s;}
        .gaip-stage{min-width:1100px;min-height:980px;display:flex;align-items:center;justify-content:center;}
        .gaip-ai{background:#fffdf2;border:1px solid #d9cf98;padding:8px 10px;font-size:13px;line-height:1.65;color:#333;}
        .gaip-pill{display:inline-block;border:1px solid #c9c9c9;border-radius:12px;padding:1px 8px;background:#fff;margin:2px;font-weight:800;}
      `}</style>

      <div className="gaip-top">
        <div className="gaip-brand"><b>كوكبة جنزلا الذكية V1</b></div>
        <div className="gaip-toolbar">
          <button className="gaip-btn" onClick={() => setPanelVisible((v) => !v)}>{panelVisible ? 'إخفاء اللوحة' : 'إظهار اللوحة'}</button>
          <button className="gaip-btn" onClick={() => setZoom((z) => clamp(z - 0.08, 0.25, 2.4))}>−</button>
          <span style={{ minWidth: 48, textAlign: 'center', fontWeight: 900 }}>{Math.round(zoom * 100)}%</span>
          <button className="gaip-btn" onClick={() => setZoom((z) => clamp(z + 0.08, 0.25, 2.4))}>＋</button>
          <button className="gaip-btn" onClick={() => setZoom(0.92)}>ملاءمة</button>
          <button className="gaip-btn" onClick={saveStudy}>حفظ الدراسة</button>
          <button className="gaip-btn" onClick={loadStudy}>استرجاع</button>
          <span style={{ marginLeft: 8, color: '#555', fontWeight: 700 }}>{savedAt ? `آخر حفظ ${savedAt}` : 'نسخة تأسيس احترافية'}</span>
        </div>
      </div>

      <aside className={`gaip-panel ${panelVisible ? '' : 'hidden'}`}>
        <div className="gaip-project">
          <input value="Gannzilla AI - دراسة 1" readOnly />
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
            <div style={{ marginTop: 6, color: '#6b5b00' }}>هذه نواة الذكاء التحليلي. الربط مع السعر الحي و TradingView / MT5 يأتي بعد تثبيت الأساسيات.</div>
          </div>
        </Section>
      </aside>

      <main className="gaip-main">
        <div className="gaip-stage">
          <canvas ref={canvasRef} />
        </div>
      </main>
    </div>
  );
}
