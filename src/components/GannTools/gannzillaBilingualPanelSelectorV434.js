const BUILD = 434;
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const INFO_BUTTON_ID = 'gannzilla-about-info-button-v432';
const WRAP_ID = 'gannzilla-language-selector-wrap-v434';
const SELECT_ID = 'gannzilla-language-selector-v434';
const STYLE_ID = 'gannzilla-language-selector-style-v434';
const STATE_KEY = '__gannzillaBilingualPanelSelectorV434';
const LANGUAGE_KEY = 'tasi-gannzilla-ui-language-v434';

const AR = Object.freeze({
  Default: 'افتراضي',
  Layout: 'التخطيط',
  Visible: 'إظهار',
  Clockwise: 'مع عقارب الساعة',
  Size: 'عدد الحلقات',
  View: 'العرض',
  'Data type': 'نوع البيانات',
  Price: 'السعر',
  Value: 'القيمة',
  Find: 'بحث',
  Increment: 'الزيادة',
  Highlight: 'التمييز',
  Fill: 'التعبئة',
  'Show marks': 'إظهار العلامات',
  'Show numbers': 'إظهار الأرقام',
  Protractor: 'المنقلة',
  Angle: 'الزاوية',
  Counter: 'العداد',
  Start: 'البداية',
  Step: 'الخطوة',
  Radius: 'نصف القطر',
  'Font size': 'حجم الخط',
  'Secondary scale': 'المقياس الثانوي',
  Divisions: 'الأقسام',
  Marker: 'المؤشر',
  Shape: 'الشكل',
  Color: 'اللون',
  'Line width': 'عرض الخط',
  Label: 'التسمية',
  Chronometer: 'مقياس الزمن',
  Range: 'المدى',
  Cosmogram: 'الخريطة الفلكية',
  System: 'النظام',
  Location: 'الموقع',
  City: 'المدينة',
  'Time zone': 'المنطقة الزمنية',
  Latitude: 'خط العرض',
  Longitude: 'خط الطول',
  'Moon phases': 'أطوار القمر',
  'Show eclipses': 'إظهار الكسوف والخسوف',
  Today: 'اليوم',
  Date: 'التاريخ',
  Cycles: 'الدورات',
  Tetragram: 'الدورة الرباعية',
  Pentagram: 'الدورة الخماسية',
  Hexagram: 'الدورة السداسية',
  Ruler: 'الكوكب الحاكم',
  Reverse: 'عكس الاتجاه',
  Radix: 'الخريطة الأصلية',
  Transit: 'الحركة الحالية',
  Ticker: 'الرمز',
  Quote: 'السعر المرجعي',
  Period: 'الفترة',
  Time: 'الوقت',
  Now: 'الآن',
  Projections: 'الإسقاطات',
  Planets: 'الكواكب',
  Planet: 'الكوكب',
  Degree: 'الدرجة',
  Zodiac: 'البرج',
  Aspects: 'الزوايا الفلكية',
  Aspect: 'الزاوية',
  Orb: 'الهامش',
  Style: 'النمط',
  Inspector: 'المفتش',
  Figures: 'الأشكال',
  Hide: 'إخفاء',
  'Show highlight': 'إظهار التمييز',
  Vectors: 'المتجهات',
  Locator: 'محدد الموقع',
  Vortex: 'الدوامة',
  Trend: 'الاتجاه',
  Colors: 'الألوان',
  Background: 'الخلفية',
  Grid: 'الشبكة',
  High: 'القمم',
  Low: 'القيعان',
  Forecast: 'التوقع',
  Error: 'الخطأ',
  Fire: 'النار',
  Earth: 'الأرض',
  Air: 'الهواء',
  Water: 'الماء',
  'Bull trend': 'اتجاه صاعد',
  'Bear trend': 'اتجاه هابط',
  Axes: 'المحاور',
  Summary: 'المجموع',
  Average: 'المتوسط',

  Sun: 'الشمس',
  Moon: 'القمر',
  Mercury: 'عطارد',
  Venus: 'الزهرة',
  Mars: 'المريخ',
  Ceres: 'سيريس',
  Jupiter: 'المشتري',
  Saturn: 'زحل',
  Uranus: 'أورانوس',
  Neptune: 'نبتون',
  Pluto: 'بلوتو',
  Eris: 'إيريس',

  Conjunction: 'الاقتران',
  Semisextile: 'نصف التسديس',
  Semisquare: 'نصف التربيع',
  Sextile: 'التسديس',
  Quadrature: 'التربيع',
  Trine: 'التثليث',
  Sesquisquare: 'التربيع ونصف',
  Quincunx: 'الكوينكونكس',
  Opposition: 'المقابلة',

  Triangle: 'المثلث',
  Circle: 'الدائرة',
  Square: 'المربع',
  Pentagon: 'الخماسي',
  Septagon: 'السباعي',
  Octagon: 'الثماني',
  Nonagon: 'التساعي',
  Decagon: 'العشاري',
  Hendecagon: 'الحادي عشري',
  Dodecagon: 'الاثنا عشري',

  Levels: 'المستويات',
  Cell: 'الخلية',
  Cross: 'التقاطع',
  Annual: 'سنوي',
  Monthly: 'شهري',
  Weekly: 'أسبوعي',
  Daily: 'يومي',
  Geocentric: 'مركزي أرضي',
  Heliocentric: 'مركزي شمسي',
  None: 'لا شيء',
  Day: 'يوم',
  Week: 'أسبوع',
  Month: 'شهر',
  Year: 'سنة',
  Minute: 'دقيقة',
  Hour: 'ساعة',
  Both: 'كلاهما',
  Bull: 'صاعد',
  Bear: 'هابط',
  Line: 'خط',
  Dash: 'متقطع',
  'Bold line': 'خط عريض',
  'Bold dash': 'متقطع عريض',
});

function params() {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch (_) {
    return new URLSearchParams();
  }
}

function boolParam(name, fallback = true) {
  const query = params();
  if (!query.has(name)) return fallback;
  const value = String(query.get(name) || '').toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function wheelMode() {
  const query = params();
  return query.get('gannzillaPro') === 'true' || query.get('wheelPro') === 'true';
}

function currentLanguage() {
  const queryLanguage = params().get('lang');
  if (queryLanguage === 'ar' || queryLanguage === 'en') return queryLanguage;
  try {
    return localStorage.getItem(LANGUAGE_KEY) === 'ar' ? 'ar' : 'en';
  } catch (_) {
    return 'en';
  }
}

function translatedText(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  if (AR[text]) return AR[text];
  const circle = text.match(/^Circle of\s+(\d+)$/i);
  if (circle) return `دائرة من ${circle[1]} قسمًا`;
  return null;
}

function replaceTextNode(node) {
  if (!(node instanceof Text)) return false;
  const parent = node.parentElement;
  if (!parent || parent.closest(`#${WRAP_ID}`) || /^(SCRIPT|STYLE|TEXTAREA)$/i.test(parent.tagName)) return false;
  const raw = node.nodeValue || '';
  const trimmed = raw.trim();
  const translated = translatedText(trimmed);
  if (!translated || translated === trimmed) return false;
  const start = raw.match(/^\s*/)?.[0] || '';
  const end = raw.match(/\s*$/)?.[0] || '';
  node.nodeValue = `${start}${translated}${end}`;
  return true;
}

function translateAttributes(panel) {
  panel.querySelectorAll('[title]').forEach((element) => {
    if (!(element instanceof HTMLElement) || element.closest(`#${WRAP_ID}`)) return;
    const translated = translatedText(element.title);
    if (translated) element.title = translated;
  });
}

function translatePanel(panel, language) {
  panel.dataset.gannzillaUiLanguageV434 = language;
  panel.dir = language === 'ar' ? 'rtl' : 'ltr';
  panel.setAttribute('lang', language);
  panel.setAttribute('aria-label', language === 'ar' ? 'لوحة خصائص جانزيلا الكاملة' : 'Gannzilla full property panel');

  if (language !== 'ar') return 0;

  let changed = 0;
  const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => { if (replaceTextNode(node)) changed += 1; });
  translateAttributes(panel);
  return changed;
}

function changeLanguage(language) {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch (_) {
    // URL remains the language authority when storage is unavailable.
  }

  const url = new URL(window.location.href);
  url.searchParams.set('lang', language);
  url.searchParams.set('bilingualPanel', 'true');
  url.searchParams.set('v', String(BUILD));
  window.location.assign(`${url.pathname}${url.search}${url.hash}`);
}

function installStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar {
      grid-template-columns: 21px minmax(0, 1fr) 27px 27px 27px 48px 142px 38px !important;
      gap: 4px !important;
      direction: ltr !important;
      overflow: visible !important;
      padding-right: 6px !important;
    }

    #${WRAP_ID} {
      grid-column: 7 !important;
      width: 136px !important;
      min-width: 136px !important;
      height: 30px !important;
      display: flex !important;
      align-items: center !important;
      direction: ltr !important;
      visibility: visible !important;
      opacity: 1 !important;
      overflow: visible !important;
    }

    #${SELECT_ID} {
      width: 136px !important;
      min-width: 136px !important;
      height: 30px !important;
      min-height: 30px !important;
      margin: 0 !important;
      padding: 1px 27px 1px 7px !important;
      border: 1px solid #949ca4 !important;
      border-radius: 0 !important;
      background: linear-gradient(#fafafa, #dedede) !important;
      color: #1e1e1e !important;
      font: 600 15px/26px Arial, "Segoe UI", Tahoma, sans-serif !important;
      direction: ltr !important;
      text-align: left !important;
      cursor: pointer !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    html body #${PANEL_ID}.gz421-panel .gz421-preset-bar #${INFO_BUTTON_ID} {
      grid-column: 8 !important;
      margin: 0 auto !important;
    }

    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] .gz421-scroll,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] .gz421-section,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] .gz421-section-body,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] .gz421-row,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] table {
      direction: rtl !important;
      text-align: right !important;
    }

    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] .gz421-section-header {
      direction: rtl !important;
      text-align: right !important;
      grid-template-columns: 27px minmax(0, 1fr) 19px !important;
    }

    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] .gz421-section-title,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] .gz421-label,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] th,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] td {
      direction: rtl !important;
      text-align: right !important;
    }

    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] .gz421-label {
      justify-content: flex-start !important;
      padding-right: 12px !important;
      padding-left: 8px !important;
      border-right: 0 !important;
      border-left: 1px solid #d4d4d1 !important;
    }

    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] .gz421-value,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] input,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] select:not(#${SELECT_ID}),
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] textarea {
      direction: rtl !important;
      text-align: right !important;
    }

    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v434="ar"] .gz421-profile-switch {
      direction: rtl !important;
      justify-content: flex-start !important;
      padding-right: 14px !important;
    }
  `;
}

function mountLanguageSelector() {
  const panel = document.getElementById(PANEL_ID);
  const bar = panel?.querySelector('.gz421-preset-bar');
  if (!(panel instanceof HTMLElement) || !(bar instanceof HTMLElement)) return false;

  let wrap = document.getElementById(WRAP_ID);
  let select = document.getElementById(SELECT_ID);

  if (!(wrap instanceof HTMLElement)) {
    wrap = document.createElement('div');
    wrap.id = WRAP_ID;
  }

  if (!(select instanceof HTMLSelectElement)) {
    select = document.createElement('select');
    select.id = SELECT_ID;
    select.title = 'Language / اللغة';
    select.setAttribute('aria-label', 'Language / اللغة');

    const english = document.createElement('option');
    english.value = 'en';
    english.textContent = '🇬🇧 English';

    const arabic = document.createElement('option');
    arabic.value = 'ar';
    arabic.textContent = '🇸🇦 العربية';

    select.append(english, arabic);
    select.addEventListener('change', () => changeLanguage(select.value === 'ar' ? 'ar' : 'en'));
    wrap.appendChild(select);
  } else if (select.parentElement !== wrap) {
    wrap.appendChild(select);
  }

  const infoButton = document.getElementById(INFO_BUTTON_ID);
  if (infoButton instanceof HTMLElement && infoButton.parentElement === bar) {
    if (wrap.parentElement !== bar || wrap.nextElementSibling !== infoButton) bar.insertBefore(wrap, infoButton);
  } else if (wrap.parentElement !== bar) {
    bar.appendChild(wrap);
  }

  const language = currentLanguage();
  select.value = language;
  select.hidden = false;
  wrap.hidden = false;
  panel.dataset.gannzillaLanguageSelectorV434 = 'true';
  translatePanel(panel, language);
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('bilingualPanel', true) || window[STATE_KEY]) return;

  installStyle();
  let frame = 0;
  let applying = false;

  const run = () => {
    if (applying) return;
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      applying = true;
      try {
        installStyle();
        mountLanguageSelector();
      } finally {
        applying = false;
      }
    });
  };

  run();
  [20, 60, 140, 320, 700, 1400, 2800, 5000].forEach((delay) => window.setTimeout(run, delay));
  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', run);

  window.GANNZILLA_BILINGUAL_PANEL_SELECTOR_V434 = true;
  window.__auditGannzillaBilingualPanelSelectorV434 = () => {
    const panel = document.getElementById(PANEL_ID);
    const select = document.getElementById(SELECT_ID);
    const info = document.getElementById(INFO_BUTTON_ID);
    const languageRect = select?.getBoundingClientRect();
    const infoRect = info?.getBoundingClientRect();
    const language = currentLanguage();
    return {
      ok: Boolean(panel?.dataset?.gannzillaLanguageSelectorV434 === 'true' && select),
      build: BUILD,
      enabled: boolParam('bilingualPanel', true),
      currentLanguage: language,
      options: ['English', 'العربية'],
      selectorLeftOfInformationIcon: Boolean(languageRect && infoRect && languageRect.right <= infoRect.left + 2),
      panelDirection: panel ? window.getComputedStyle(panel).direction : null,
      arabicPanelLocalized: language !== 'ar' || String(panel?.textContent || '').includes('التخطيط'),
      wheelLanguageParameterConnected: true,
      existingPanelControlsPreserved: true,
    };
  };

  window[STATE_KEY] = { observer };
}

install();
