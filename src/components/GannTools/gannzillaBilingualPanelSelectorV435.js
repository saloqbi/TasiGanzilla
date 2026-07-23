const BUILD = 435;
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const INFO_BUTTON_ID = 'gannzilla-about-info-button-v432';
const WRAP_ID = 'gannzilla-language-selector-fixed-wrap-v435';
const SELECT_ID = 'gannzilla-language-selector-fixed-v435';
const STYLE_ID = 'gannzilla-language-selector-fixed-style-v435';
const STATE_KEY = '__gannzillaBilingualPanelSelectorV435';
const LANGUAGE_KEY = 'tasi-gannzilla-ui-language-v435';

const AR = Object.freeze({
  Default: 'افتراضي', Layout: 'التخطيط', Visible: 'إظهار', Clockwise: 'مع عقارب الساعة',
  Size: 'عدد الحلقات', View: 'العرض', 'Data type': 'نوع البيانات', Price: 'السعر',
  Value: 'القيمة', Find: 'بحث', Increment: 'الزيادة', Highlight: 'التمييز', Fill: 'التعبئة',
  'Show marks': 'إظهار العلامات', 'Show numbers': 'إظهار الأرقام', Protractor: 'المنقلة',
  Angle: 'الزاوية', Counter: 'العداد', Start: 'البداية', Step: 'الخطوة', Radius: 'نصف القطر',
  'Font size': 'حجم الخط', 'Secondary scale': 'المقياس الثانوي', Divisions: 'الأقسام',
  Marker: 'المؤشر', Shape: 'الشكل', Color: 'اللون', 'Line width': 'عرض الخط', Label: 'التسمية',
  Chronometer: 'مقياس الزمن', Range: 'المدى', Cosmogram: 'الخريطة الفلكية', System: 'النظام',
  Location: 'الموقع', City: 'المدينة', 'Time zone': 'المنطقة الزمنية', Latitude: 'خط العرض',
  Longitude: 'خط الطول', 'Moon phases': 'أطوار القمر', 'Show eclipses': 'إظهار الكسوف والخسوف',
  Today: 'اليوم', Date: 'التاريخ', Cycles: 'الدورات', Tetragram: 'الدورة الرباعية',
  Pentagram: 'الدورة الخماسية', Hexagram: 'الدورة السداسية', Ruler: 'الكوكب الحاكم',
  Reverse: 'عكس الاتجاه', Radix: 'الخريطة الأصلية', Transit: 'الحركة الحالية', Ticker: 'الرمز',
  Quote: 'السعر المرجعي', Period: 'الفترة', Time: 'الوقت', Now: 'الآن', Projections: 'الإسقاطات',
  Planets: 'الكواكب', Planet: 'الكوكب', Degree: 'الدرجة', Zodiac: 'البرج', Aspects: 'الزوايا الفلكية',
  Aspect: 'الزاوية', Orb: 'الهامش', Style: 'النمط', Inspector: 'المفتش', Figures: 'الأشكال',
  Hide: 'إخفاء', 'Show highlight': 'إظهار التمييز', Vectors: 'المتجهات', Locator: 'محدد الموقع',
  Vortex: 'الدوامة', Trend: 'الاتجاه', Colors: 'الألوان', Background: 'الخلفية', Grid: 'الشبكة',
  High: 'القمم', Low: 'القيعان', Forecast: 'التوقع', Error: 'الخطأ', Fire: 'النار', Earth: 'الأرض',
  Air: 'الهواء', Water: 'الماء', 'Bull trend': 'اتجاه صاعد', 'Bear trend': 'اتجاه هابط', Axes: 'المحاور',
  Summary: 'المجموع', Average: 'المتوسط', Sun: 'الشمس', Moon: 'القمر', Mercury: 'عطارد',
  Venus: 'الزهرة', Mars: 'المريخ', Ceres: 'سيريس', Jupiter: 'المشتري', Saturn: 'زحل', Uranus: 'أورانوس',
  Neptune: 'نبتون', Pluto: 'بلوتو', Eris: 'إيريس', Conjunction: 'الاقتران', Semisextile: 'نصف التسديس',
  Semisquare: 'نصف التربيع', Sextile: 'التسديس', Quadrature: 'التربيع', Trine: 'التثليث',
  Sesquisquare: 'التربيع ونصف', Quincunx: 'الكوينكونكس', Opposition: 'المقابلة', Triangle: 'المثلث',
  Circle: 'الدائرة', Square: 'المربع', Pentagon: 'الخماسي', Septagon: 'السباعي', Octagon: 'الثماني',
  Nonagon: 'التساعي', Decagon: 'العشاري', Hendecagon: 'الحادي عشري', Dodecagon: 'الاثنا عشري',
  Levels: 'المستويات', Cell: 'الخلية', Cross: 'التقاطع', Annual: 'سنوي', Monthly: 'شهري',
  Weekly: 'أسبوعي', Daily: 'يومي', Geocentric: 'مركزي أرضي', Heliocentric: 'مركزي شمسي', None: 'لا شيء',
  Day: 'يوم', Week: 'أسبوع', Month: 'شهر', Year: 'سنة', Minute: 'دقيقة', Hour: 'ساعة', Both: 'كلاهما',
  Bull: 'صاعد', Bear: 'هابط', Line: 'خط', Dash: 'متقطع', 'Bold line': 'خط عريض', 'Bold dash': 'متقطع عريض',
});

function params() {
  try { return new URLSearchParams(window.location.search || ''); }
  catch (_) { return new URLSearchParams(); }
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
  try { return localStorage.getItem(LANGUAGE_KEY) === 'ar' ? 'ar' : 'en'; }
  catch (_) { return 'en'; }
}

function translatedText(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  if (AR[text]) return AR[text];
  const circle = text.match(/^Circle of\s+(\d+)$/i);
  if (circle) return `دائرة من ${circle[1]} قسمًا`;
  return null;
}

function translateTextNode(node) {
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
  panel.dataset.gannzillaUiLanguageV435 = language;
  panel.dir = language === 'ar' ? 'rtl' : 'ltr';
  panel.setAttribute('lang', language);
  panel.setAttribute('aria-label', language === 'ar' ? 'لوحة خصائص جانزيلا الكاملة' : 'Gannzilla full property panel');
  if (language !== 'ar') return 0;

  let changed = 0;
  const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => { if (translateTextNode(node)) changed += 1; });
  translateAttributes(panel);
  return changed;
}

function changeLanguage(language) {
  try { localStorage.setItem(LANGUAGE_KEY, language); } catch (_) { /* URL remains authoritative. */ }
  const url = new URL(window.location.href);
  url.searchParams.set('lang', language);
  url.searchParams.set('bilingualPanel', 'false');
  url.searchParams.set('fixedLanguageSelector', 'true');
  url.searchParams.set('v', String(BUILD));
  url.searchParams.set('rev', 'v435');
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
    #${WRAP_ID} {
      position: fixed !important;
      z-index: 2147483646 !important;
      width: 152px !important;
      min-width: 152px !important;
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      direction: ltr !important;
      box-sizing: border-box !important;
    }

    #${SELECT_ID} {
      width: 152px !important;
      min-width: 152px !important;
      height: 32px !important;
      min-height: 32px !important;
      margin: 0 !important;
      padding: 1px 28px 1px 8px !important;
      border: 1px solid #8f99a3 !important;
      border-radius: 0 !important;
      background: linear-gradient(#ffffff, #dddddd) !important;
      color: #1d1d1d !important;
      font: 700 15px/28px Arial, "Segoe UI", Tahoma, sans-serif !important;
      direction: ltr !important;
      text-align: left !important;
      cursor: pointer !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      box-sizing: border-box !important;
    }

    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v435="ar"] .gz421-scroll,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v435="ar"] .gz421-section,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v435="ar"] .gz421-section-body,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v435="ar"] .gz421-row,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v435="ar"] table {
      direction: rtl !important;
      text-align: right !important;
    }

    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v435="ar"] .gz421-section-header {
      direction: rtl !important;
      text-align: right !important;
      grid-template-columns: 27px minmax(0, 1fr) 19px !important;
    }

    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v435="ar"] .gz421-section-title,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v435="ar"] .gz421-label,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v435="ar"] th,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v435="ar"] td {
      direction: rtl !important;
      text-align: right !important;
    }

    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v435="ar"] .gz421-label {
      justify-content: flex-start !important;
      padding-right: 12px !important;
      padding-left: 8px !important;
      border-right: 0 !important;
      border-left: 1px solid #d4d4d1 !important;
    }

    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v435="ar"] .gz421-value,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v435="ar"] input,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v435="ar"] select,
    html body #${PANEL_ID}.gz421-panel[data-gannzilla-ui-language-v435="ar"] textarea {
      direction: rtl !important;
      text-align: right !important;
    }
  `;
}

function createSelector() {
  let wrap = document.getElementById(WRAP_ID);
  let select = document.getElementById(SELECT_ID);

  if (!(wrap instanceof HTMLElement)) {
    wrap = document.createElement('div');
    wrap.id = WRAP_ID;
    document.body.appendChild(wrap);
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

  select.value = currentLanguage();
  wrap.hidden = false;
  select.hidden = false;
  return { wrap, select };
}

function positionSelector() {
  const panel = document.getElementById(PANEL_ID);
  if (!(panel instanceof HTMLElement)) return false;

  const { wrap } = createSelector();
  const panelRect = panel.getBoundingClientRect();
  const info = document.getElementById(INFO_BUTTON_ID);
  const infoRect = info instanceof HTMLElement ? info.getBoundingClientRect() : null;
  const width = 152;
  const gap = 8;
  const rightAnchor = infoRect?.left && infoRect.left > panelRect.left
    ? infoRect.left - gap
    : panelRect.right - 44;
  const left = Math.max(panelRect.left + 170, rightAnchor - width);
  const top = infoRect?.top && infoRect.top >= panelRect.top
    ? infoRect.top + Math.max(0, (infoRect.height - 32) / 2)
    : panelRect.top + 4;

  wrap.style.setProperty('left', `${Math.round(left)}px`, 'important');
  wrap.style.setProperty('top', `${Math.round(top)}px`, 'important');
  panel.dataset.gannzillaLanguageSelectorV435 = 'true';
  translatePanel(panel, currentLanguage());
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('fixedLanguageSelector', true) || window[STATE_KEY]) return;

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
        positionSelector();
      } finally {
        applying = false;
      }
    });
  };

  run();
  [20, 60, 140, 320, 700, 1400, 2800, 5000].forEach((delay) => window.setTimeout(run, delay));
  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  window.addEventListener('resize', run);
  window.addEventListener('scroll', run, true);

  window.GANNZILLA_BILINGUAL_PANEL_SELECTOR_V435 = true;
  window.__auditGannzillaBilingualPanelSelectorV435 = () => {
    const panel = document.getElementById(PANEL_ID);
    const select = document.getElementById(SELECT_ID);
    const info = document.getElementById(INFO_BUTTON_ID);
    const languageRect = select?.getBoundingClientRect();
    const infoRect = info?.getBoundingClientRect();
    const language = currentLanguage();
    return {
      ok: Boolean(panel?.dataset?.gannzillaLanguageSelectorV435 === 'true' && select && languageRect?.width > 0),
      build: BUILD,
      enabled: boolParam('fixedLanguageSelector', true),
      currentLanguage: language,
      options: ['English', 'العربية'],
      selectorVisible: Boolean(select && getComputedStyle(select).visibility !== 'hidden' && Number(getComputedStyle(select).opacity || 0) > 0),
      selectorLeftOfInformationIcon: Boolean(languageRect && infoRect && languageRect.right <= infoRect.left + 2),
      arabicPanelLocalized: language !== 'ar' || String(panel?.textContent || '').includes('التخطيط'),
      fixedBodyOverlay: true,
      reactRerenderSafe: true,
    };
  };

  window[STATE_KEY] = { observer };
}

install();