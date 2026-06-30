import React from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';

const labels = {
  Layout: 'التخطيط', Visible: 'ظاهر', Clockwise: 'مع عقارب الساعة', Size: 'الحجم', View: 'العرض',
  'Data type': 'نوع البيانات', Price: 'السعر', Value: 'القيمة', Find: 'بحث', Increment: 'الزيادة',
  Highlight: 'تمييز', Fill: 'التعبئة', 'Show marks': 'إظهار العلامات', 'Show numbers': 'إظهار الأرقام',
  Protractor: 'المنقلة', Angle: 'الزاوية', Counter: 'العداد', 'Secondary scale': 'المقياس الثانوي',
  Marker: 'المؤشر', Chronometer: 'المؤقت', Range: 'النطاق', Cosmogram: 'الخريطة الكونية',
  Location: 'الموقع', City: 'المدينة', Latitude: 'خط العرض', Longitude: 'خط الطول',
  'Moon phases': 'أطوار القمر', Cycles: 'الدورات', Tetragram: 'رباعي', Pentagram: 'خماسي', Hexagram: 'سداسي',
  Ruler: 'الحاكم', Reverse: 'عكسي', Today: 'اليوم', Date: 'التاريخ', Time: 'الوقت', Now: 'الآن',
  Projections: 'الإسقاطات', Planets: 'الكواكب', Aspects: 'الاتصالات', Inspector: 'المفتش', Figures: 'الأشكال',
  Colors: 'الألوان', Background: 'الخلفية', Grid: 'الشبكة', Circle: 'الدائرة', Zodiac: 'الأبراج',
  'Fire element': 'عنصر النار', 'Earth element': 'عنصر الأرض', 'Air element': 'عنصر الهواء', 'Water element': 'عنصر الماء',
  Sun: 'الشمس', Moon: 'القمر', Mercury: 'عطارد', Venus: 'الزهرة', Mars: 'المريخ', Jupiter: 'المشتري', Saturn: 'زحل',
  Uranus: 'أورانوس', Neptune: 'نبتون', Pluto: 'بلوتو', Eris: 'إيريس', Summary: 'المجموع', Average: 'المتوسط',
  Conjunction: 'اقتران', Semisextile: 'نصف تسديس', Semisquare: 'نصف تربيع', Sextile: 'تسديس', Quadrature: 'تربيع',
  Trine: 'تثليث', Sesquisquare: 'تربيع ونصف', Quincunx: 'كوينكنكس', Opposition: 'مقابلة',
  White: 'أبيض', Smoke: 'دخاني', Cream: 'كريمي', Red: 'أحمر', Green: 'أخضر', Plum: 'بنفسجي', Blue: 'أزرق', Gold: 'ذهبي', Black: 'أسود',
  Annual: 'سنوي', Monthly: 'شهري', Weekly: 'أسبوعي', Daily: 'يومي', Custom: 'مخصص',
  Geocentric: 'مركز الأرض', Heliocentric: 'مركز الشمس', Topocentric: 'مركزي موضعي', English: 'English', Arabic: 'العربية', Default: 'افتراضي'
};

const reverseLabels = Object.fromEntries(Object.entries(labels).map(([en, ar]) => [ar, en]));
const STORAGE_KEY = 'tasi-gannzilla-language-v1';

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.dataset.gannzillaLanguage = lang;

  const translateText = (node) => {
    const text = (node.textContent || '').trim();
    if (!text) return;
    if (lang === 'ar' && labels[text]) node.textContent = labels[text];
    if (lang === 'en' && reverseLabels[text]) node.textContent = reverseLabels[text];
  };

  const selectors = [
    'aside .gz-label', 'aside .gzx-label', 'aside .gz-header b', 'aside .gzx-header b',
    'aside .gz-planet-name', 'aside .gz-aspect-name', 'aside option', '[data-gannzilla-options-status="true"]'
  ];
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach(translateText);
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
    style.id = 'gannzilla-language-switch-style-v1';
    style.textContent = `
      .gannzilla-lang-switch{position:fixed;top:6px;left:78px;z-index:9998;display:flex;align-items:center;gap:6px;background:#ececec;border:1px solid #9d9d9d;border-radius:2px;padding:3px 6px;box-shadow:0 1px 3px rgba(0,0,0,.18);}
      .gannzilla-lang-flag{font-size:30px;line-height:1;transform:scale(1.15);transform-origin:center;}
      .gannzilla-lang-select{height:32px;min-width:142px;font-size:18px;font-weight:800;border:1px solid #777;background:#fff;color:#111;padding:2px 6px;}
      body[data-gannzilla-language="ar"] aside{direction:rtl;}
      body[data-gannzilla-language="ar"] aside .gz-label,body[data-gannzilla-language="ar"] aside .gzx-label{padding-left:0!important;padding-right:30px!important;text-align:right;}
      body[data-gannzilla-language="ar"] aside .gz-value,body[data-gannzilla-language="ar"] aside .gzx-value{border-left:0!important;border-right:1px solid #cfcfcf!important;}
    `;
    document.head.appendChild(style);

    let el = document.getElementById('gannzilla-language-switch-v1');
    if (!el) {
      el = document.createElement('div');
      el.id = 'gannzilla-language-switch-v1';
      document.body.appendChild(el);
    }
    setHost(el);

    const timer = window.setInterval(() => applyLanguage(lang), 600);
    window.setTimeout(() => applyLanguage(lang), 100);
    window.setTimeout(() => applyLanguage(lang), 900);

    return () => {
      window.clearInterval(timer);
      document.getElementById('gannzilla-language-switch-v1')?.remove();
      document.getElementById('gannzilla-language-switch-style-v1')?.remove();
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
