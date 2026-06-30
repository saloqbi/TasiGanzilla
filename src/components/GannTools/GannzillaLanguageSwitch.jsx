import React from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';

const labels = {
  Layout: 'التخطيط', Visible: 'ظاهر', Clockwise: 'مع عقارب الساعة', Size: 'الحجم', View: 'العرض',
  'Data type': 'نوع البيانات', Price: 'السعر', Value: 'القيمة', Find: 'بحث', Increment: 'الزيادة',
  Highlight: 'التمييز', Fill: 'التعبئة', Levels: 'المستويات', Cell: 'خلية', 'Show marks': 'إظهار العلامات', 'Show numbers': 'إظهار الأرقام',
  Protractor: 'المنقلة', Angle: 'الزاوية', Counter: 'العداد', 'Secondary scale': 'المقياس الثانوي',
  Marker: 'المؤشر', Chronometer: 'المؤقت', Range: 'النطاق', Cosmogram: 'الخريطة الكونية',
  Location: 'الموقع', City: 'المدينة', Latitude: 'خط العرض', Longitude: 'خط الطول',
  'Moon phases': 'أطوار القمر', Cycles: 'الدورات', Tetragram: 'رباعي', Pentagram: 'خماسي', Hexagram: 'سداسي',
  Ruler: 'الحاكم', Reverse: 'عكسي', Today: 'اليوم', Date: 'التاريخ', Time: 'الوقت', Now: 'الآن',
  Projections: 'الإسقاطات', Planets: 'الكواكب', Aspects: 'الاتصالات', Inspector: 'المفتش', Figures: 'الأشكال',
  Colors: 'الألوان', Background: 'الخلفية', Grid: 'الشبكة', Circle: 'الدائرة', Zodiac: 'الأبراج', System: 'النظام',
  'Fire element': 'عنصر النار', 'Earth element': 'عنصر الأرض', 'Air element': 'عنصر الهواء', 'Water element': 'عنصر الماء',
  Sun: 'الشمس', Moon: 'القمر', Mercury: 'عطارد', Venus: 'الزهرة', Mars: 'المريخ', Ceres: 'سيريس', Jupiter: 'المشتري', Saturn: 'زحل',
  Uranus: 'أورانوس', Neptune: 'نبتون', Pluto: 'بلوتو', Eris: 'إيريس', Summary: 'المجموع', Average: 'المتوسط', Node: 'العقدة',
  Hide: 'إخفاء', Conjunction: 'اقتران', Semisextile: 'نصف تسديس', Semisquare: 'نصف تربيع', Sextile: 'تسديس', Quadrature: 'تربيع',
  Trine: 'تثليث', Sesquisquare: 'تربيع ونصف', Quincunx: 'كوينكنكس', Opposition: 'مقابلة',
  solid: 'متصل', dashed: 'متقطع', dashdot: 'شرطة ونقطة', thin: 'رفيع', Solid: 'متصل', Dashed: 'متقطع', Dashdot: 'شرطة ونقطة', Thin: 'رفيع',
  White: 'أبيض', Smoke: 'دخاني', Cream: 'كريمي', Red: 'أحمر', Green: 'أخضر', Plum: 'بنفسجي', Blue: 'أزرق', Gold: 'ذهبي', Black: 'أسود',
  Annual: 'سنوي', Monthly: 'شهري', Weekly: 'أسبوعي', Daily: 'يومي', Intraday: 'داخل اليوم', Custom: 'مخصص',
  Geocentric: 'مركز الأرض', Heliocentric: 'مركز الشمس', Topocentric: 'مركزي موضعي',
  None: 'لا يوجد', 'Price and date': 'السعر والتاريخ', 'Price and time': 'السعر والوقت',
  Radix: 'الراديكس', Transit: 'العبور', Quote: 'الاقتباس', Unit: 'الوحدة', Start: 'البداية', Step: 'الخطوة', Count: 'العدد', Label: 'التسمية', Lock: 'قفل',
  'Circle of 12': 'دائرة 12', 'Circle of 24': 'دائرة 24', 'Circle of 36': 'دائرة 36', 'Square of 4': 'مربع 4', 'Square of 9': 'مربع 9',
  'Permanent square': 'المربع الدائم', Tetragon: 'رباعي الشكل', Pentagon: 'خماسي الشكل', Hexagon: 'سداسي الشكل', Septagon: 'سباعي الشكل', Octagon: 'ثماني الشكل',
  'Options Linked': 'الخيارات مرتبطة', Default: 'افتراضي', Add: 'إضافة', English: 'English', Arabic: 'العربية'
};

const reverseLabels = Object.fromEntries(Object.entries(labels).map(([en, ar]) => [ar, en]));
const STORAGE_KEY = 'tasi-gannzilla-language-v1';

function translateRaw(text, lang) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return text;
  if (lang === 'ar') {
    if (labels[clean]) return labels[clean];
    return clean.replace(/\b(Layout|Visible|Clockwise|Size|View|Data type|Price|Value|Find|Increment|Highlight|Fill|Levels|Show marks|Show numbers|Protractor|Angle|Counter|Secondary scale|Marker|Chronometer|Range|Cosmogram|Location|Moon phases|Cycles|Tetragram|Pentagram|Hexagram|Projections|Planets|Aspects|Inspector|Figures|Colors|Background|Grid|Circle|Zodiac|System|City|Latitude|Longitude|Now|Date|Time|Today|Reverse|Ruler|Quote|Start|Step|Count|Label|Lock|Hide|Sun|Moon|Mercury|Venus|Mars|Ceres|Jupiter|Saturn|Uranus|Neptune|Pluto|Eris|Summary|Average|White|Smoke|Cream|Red|Green|Plum|Blue|Gold|Black|Annual|Monthly|Weekly|Daily|Custom|Geocentric|Heliocentric|Topocentric|None|Radix|Transit|Default|Add|solid|dashed|dashdot|thin|Solid|Dashed|Dashdot|Thin)\b/g, (m) => labels[m] || m);
  }
  if (reverseLabels[clean]) return reverseLabels[clean];
  return clean.replace(/التخطيط|ظاهر|مع عقارب الساعة|الحجم|العرض|نوع البيانات|السعر|القيمة|بحث|الزيادة|التمييز|التعبئة|المستويات|إظهار العلامات|إظهار الأرقام|المنقلة|الزاوية|العداد|المقياس الثانوي|المؤشر|المؤقت|النطاق|الخريطة الكونية|الموقع|أطوار القمر|الدورات|رباعي|خماسي|سداسي|الإسقاطات|الكواكب|الاتصالات|المفتش|الأشكال|الألوان|الخلفية|الشبكة|الدائرة|الأبراج|النظام|المدينة|خط العرض|خط الطول|الآن|التاريخ|الوقت|اليوم|عكسي|الحاكم|الاقتباس|البداية|الخطوة|العدد|التسمية|قفل|إخفاء|الشمس|القمر|عطارد|الزهرة|المريخ|سيريس|المشتري|زحل|أورانوس|نبتون|بلوتو|إيريس|المجموع|المتوسط|أبيض|دخاني|كريمي|أحمر|أخضر|بنفسجي|أزرق|ذهبي|أسود|سنوي|شهري|أسبوعي|يومي|مخصص|مركز الأرض|مركز الشمس|مركزي موضعي|لا يوجد|الراديكس|العبور|افتراضي|إضافة|متصل|متقطع|شرطة ونقطة|رفيع/g, (m) => reverseLabels[m] || m);
}

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.dataset.gannzillaLanguage = lang;

  const root = document.querySelector('aside');
  if (root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (['SCRIPT', 'STYLE', 'TEXTAREA'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        const text = (node.nodeValue || '').trim();
        if (!text || /^[\d\s°′'".:/\\|<>+\-–—△□○●◷★⌘↻]+$/.test(text)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const before = node.nodeValue;
      const after = translateRaw(before, lang);
      if (after !== before) node.nodeValue = before.replace(before.trim(), after);
    });
  }

  document.querySelectorAll('aside option, aside input, aside select, aside button, [data-gannzilla-options-status="true"]').forEach((el) => {
    if (el.tagName === 'INPUT') {
      if (el.placeholder) el.placeholder = translateRaw(el.placeholder, lang);
      if (el.title) el.title = translateRaw(el.title, lang);
      return;
    }
    if (el.title) el.title = translateRaw(el.title, lang);
    const text = (el.textContent || '').trim();
    const translated = translateRaw(text, lang);
    if (text && translated !== text) el.textContent = translated;
  });

  window.dispatchEvent(new CustomEvent('gannzilla:language-apply', { detail: { lang } }));
}

export default function GannzillaLanguageSwitch() {
  const context = useLanguage?.();
  const [host, setHost] = React.useState(null);
  const [lang, setLocalLang] = React.useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || context?.lang || 'en'; }
    catch { return context?.lang || 'en'; }
  });

  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true') || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const style = document.createElement('style');
    style.id = 'gannzilla-language-switch-style-v3';
    style.textContent = `
      .gannzilla-lang-switch{position:fixed;top:6px;left:78px;z-index:9998;display:flex;align-items:center;gap:6px;background:#ececec;border:1px solid #9d9d9d;border-radius:2px;padding:3px 6px;box-shadow:0 1px 3px rgba(0,0,0,.18);}
      .gannzilla-lang-flag{font-size:30px;line-height:1;transform:scale(1.15);transform-origin:center;}
      .gannzilla-lang-select{height:32px;min-width:142px;font-size:18px;font-weight:800;border:1px solid #777;background:#fff;color:#111;padding:2px 6px;}
      body[data-gannzilla-language="ar"] aside{direction:rtl;}
      body[data-gannzilla-language="ar"] aside .gz-label,body[data-gannzilla-language="ar"] aside .gzx-label{padding-left:0!important;padding-right:30px!important;text-align:right;}
      body[data-gannzilla-language="ar"] aside .gz-value,body[data-gannzilla-language="ar"] aside .gzx-value{border-left:0!important;border-right:1px solid #cfcfcf!important;}
      body[data-gannzilla-language="ar"] aside .gz-aspect-row{grid-template-columns:1fr 70px 34px 172px!important;direction:ltr!important;}
      body[data-gannzilla-language="ar"] aside .gz-aspect-name{direction:rtl!important;text-align:right!important;justify-content:flex-end!important;padding-left:0!important;padding-right:32px!important;}
      body[data-gannzilla-language="ar"] aside .gz-aspect-style{direction:rtl!important;}
    `;
    document.getElementById('gannzilla-language-switch-style-v1')?.remove();
    document.getElementById('gannzilla-language-switch-style-v2')?.remove();
    document.head.appendChild(style);

    let el = document.getElementById('gannzilla-language-switch-v1');
    if (!el) {
      el = document.createElement('div');
      el.id = 'gannzilla-language-switch-v1';
      document.body.appendChild(el);
    }
    setHost(el);

    const timer = window.setInterval(() => applyLanguage(lang), 250);
    window.setTimeout(() => applyLanguage(lang), 50);
    window.setTimeout(() => applyLanguage(lang), 300);
    window.setTimeout(() => applyLanguage(lang), 900);

    return () => {
      window.clearInterval(timer);
      document.getElementById('gannzilla-language-switch-v1')?.remove();
      document.getElementById('gannzilla-language-switch-style-v3')?.remove();
    };
  }, [lang]);

  const changeLanguage = (nextLang) => {
    setLocalLang(nextLang);
    try { localStorage.setItem(STORAGE_KEY, nextLang); } catch { /* ignore */ }
    context?.setLang?.(nextLang);
    applyLanguage(nextLang);
  };

  const flag = lang === 'ar' ? '🇸🇦' : '🇬🇧';

  const content = (
    <div className="gannzilla-lang-switch">
      <span className="gannzilla-lang-flag">{flag}</span>
      <select className="gannzilla-lang-select" value={lang} onChange={(e) => changeLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  );

  return host ? createPortal(content, host) : null;
}
