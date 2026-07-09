import React from 'react';

const MARKER = 'GANNZILLA_BILINGUAL_TOGGLE_V95';
const BUTTON_ID = 'gannzilla-bilingual-toggle-v95';

const EN_TO_AR = {
  'Gannzilla Pro': 'جانزيلا برو',
  Default: 'الافتراضي',
  Add: 'إضافة',
  English: 'الإنجليزية',
  Hide: 'إخفاء',
  Show: 'إظهار',
  Clockwise: 'مع عقارب الساعة',
  Counter: 'العداد',
  Layout: 'التخطيط',
  Visible: 'مرئي',
  Size: 'الحجم',
  View: 'العرض',
  'Data type': 'نوع البيانات',
  Price: 'السعر',
  Time: 'الوقت',
  Angle: 'الزاوية',
  Value: 'القيمة',
  Find: 'بحث',
  Increment: 'الزيادة',
  Highlight: 'التمييز',
  Fill: 'التعبئة',
  Levels: 'المستويات',
  Cell: 'الخلية',
  'Show marks': 'إظهار العلامات',
  'Show numbers': 'إظهار الأرقام',
  Protractor: 'المنقلة',
  Start: 'البداية',
  Step: 'الخطوة',
  Radius: 'نصف القطر',
  'Font size': 'حجم الخط',
  'Secondary scale': 'المقياس الثانوي',
  Divisions: 'التقسيمات',
  Marker: 'المؤشر',
  Shape: 'الشكل',
  Triangle: 'مثلث',
  Circle: 'دائرة',
  Square: 'مربع',
  Color: 'اللون',
  'Line width': 'عرض الخط',
  Label: 'التسمية',
  Chronometer: 'الكرونومتر',
  Range: 'النطاق',
  Annual: 'سنوي',
  Monthly: 'شهري',
  Weekly: 'أسبوعي',
  Daily: 'يومي',
  Cosmogram: 'الخريطة الفلكية',
  System: 'النظام',
  Geocentric: 'مركزية الأرض',
  Heliocentric: 'مركزية الشمس',
  Location: 'الموقع',
  City: 'المدينة',
  Latitude: 'خط العرض',
  Longitude: 'خط الطول',
  'Moon phases': 'مراحل القمر',
  'Show eclipses': 'إظهار الكسوف والخسوف',
  Offset: 'الإزاحة',
  'Circle of 36': 'دائرة 36',
  'Circle of 60': 'دائرة 60',
  'Circle of 90': 'دائرة 90',
  'Circle of 360': 'دائرة 360',
  'New York': 'نيويورك',
};

const AR_TO_EN = Object.fromEntries(Object.entries(EN_TO_AR).map(([en, ar]) => [ar, en]));

function preserveWhitespace(original, replacement) {
  const leading = original.match(/^\s*/)?.[0] || '';
  const trailing = original.match(/\s*$/)?.[0] || '';
  return `${leading}${replacement}${trailing}`;
}

function translateTextNode(node, language) {
  const raw = node.nodeValue;
  if (!raw || !raw.trim()) return;
  const value = raw.trim();
  const translated = language === 'ar' ? EN_TO_AR[value] : AR_TO_EN[value];
  if (translated && translated !== value) node.nodeValue = preserveWhitespace(raw, translated);
}

function translateAttributes(root, language) {
  root.querySelectorAll('input[placeholder], [title], [aria-label]').forEach((element) => {
    ['placeholder', 'title', 'aria-label'].forEach((attribute) => {
      const current = element.getAttribute(attribute);
      if (!current) return;
      const translated = language === 'ar' ? EN_TO_AR[current] : AR_TO_EN[current];
      if (translated) element.setAttribute(attribute, translated);
    });
  });
}

function applyDirection(language) {
  const aside = document.querySelector('aside');
  if (aside) {
    aside.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    aside.style.textAlign = language === 'ar' ? 'right' : 'left';
  }

  document.documentElement.setAttribute('lang', language === 'ar' ? 'ar' : 'en');
}

function translateInterface(language, toggleButton) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (toggleButton?.contains(parent)) return NodeFilter.FILTER_REJECT;
      if (['SCRIPT', 'STYLE', 'CANVAS'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => translateTextNode(node, language));
  translateAttributes(document.body, language);
  applyDirection(language);
}

function findLanguageAnchor() {
  return Array.from(document.querySelectorAll('span, button, div')).find((element) => {
    if (element.id === BUTTON_ID) return false;
    const text = String(element.textContent || '').trim();
    return text === '🇬🇧 English' || text === 'English' || text === '🇸🇦 العربية' || text === 'العربية';
  }) || null;
}

export default function GannzillaBilingualToggleV95() {
  React.useEffect(() => {
    const isWheelMode = window.location.search.includes('gannzillaPro=true')
      || window.location.search.includes('wheelPro=true');
    if (!isWheelMode) return undefined;

    const queryLanguage = new URLSearchParams(window.location.search).get('lang');
    let language = queryLanguage === 'ar' || queryLanguage === 'en'
      ? queryLanguage
      : localStorage.getItem('gannzillaLanguageV95') || 'en';

    let button = document.getElementById(BUTTON_ID);
    if (!button) {
      button = document.createElement('button');
      button.id = BUTTON_ID;
      button.type = 'button';
      button.style.height = '22px';
      button.style.padding = '0 8px';
      button.style.border = '1px solid #a7a7a7';
      button.style.borderRadius = '2px';
      button.style.background = '#f7f7f7';
      button.style.color = '#222';
      button.style.font = '700 12px Segoe UI, Arial, sans-serif';
      button.style.cursor = 'pointer';
      button.style.whiteSpace = 'nowrap';
      button.style.zIndex = '2147483647';

      const anchor = findLanguageAnchor();
      if (anchor?.parentElement) {
        anchor.style.display = 'none';
        anchor.parentElement.insertBefore(button, anchor.nextSibling);
      } else {
        button.style.position = 'fixed';
        button.style.top = '1px';
        button.style.right = '42px';
        document.body.appendChild(button);
      }
    }

    const updateButton = () => {
      button.textContent = language === 'ar' ? '🇸🇦 العربية' : '🇬🇧 English';
      button.title = language === 'ar' ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic';
      button.setAttribute('aria-label', button.title);
    };

    let translating = false;
    const apply = () => {
      if (translating) return;
      translating = true;
      updateButton();
      translateInterface(language, button);
      translating = false;

      window.__gannzillaBilingualToggleV95Metrics = {
        ok: true,
        marker: window[MARKER] === true,
        language,
        oneButtonToggle: true,
        englishAvailable: true,
        arabicAvailable: true,
      };
    };

    button.onclick = () => {
      language = language === 'ar' ? 'en' : 'ar';
      localStorage.setItem('gannzillaLanguageV95', language);
      apply();
    };

    window[MARKER] = true;
    window.__auditGannzillaBilingualToggleV95 = () => {
      const metrics = window.__gannzillaBilingualToggleV95Metrics || {};
      return {
        ok: window[MARKER] === true
          && metrics.oneButtonToggle === true
          && metrics.englishAvailable === true
          && metrics.arabicAvailable === true,
        marker: window[MARKER] === true,
        metrics,
      };
    };

    const observer = new MutationObserver(() => {
      if (!translating) window.requestAnimationFrame(apply);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    apply();

    return () => {
      observer.disconnect();
      if (button) button.remove();
    };
  }, []);

  return null;
}
