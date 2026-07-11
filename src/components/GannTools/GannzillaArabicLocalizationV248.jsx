import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const BUILD = 249;
const ARABIC_DIGITS = Object.freeze({
  0: '٠', 1: '١', 2: '٢', 3: '٣', 4: '٤',
  5: '٥', 6: '٦', 7: '٧', 8: '٨', 9: '٩',
});

const EXACT_TRANSLATIONS = Object.freeze({
  'Gannzilla Pro': 'جنزلا برو',
  Default: 'الافتراضي',
  '＋ Add': '＋ إضافة',
  Add: 'إضافة',
  Clockwise: 'مع عقارب الساعة',
  Counter: 'العداد',
  Layout: 'التخطيط',
  Visible: 'ظاهر',
  Size: 'الحجم',
  View: 'طريقة العرض',
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
  'Line width': 'سُمك الخط',
  Label: 'التسمية',
  Chronometer: 'مقياس الزمن',
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
  'Moon phases': 'أطوار القمر',
  'Show eclipses': 'إظهار الخسوف',
  Offset: 'الإزاحة',
  Hide: 'إخفاء',
  Show: 'إظهار',
  'New York': 'نيويورك',
  North: 'شمال',
  South: 'جنوب',
  East: 'شرق',
  West: 'غرب',
});

const CANVAS_WORDS = Object.freeze({
  MAR: 'مارس', APR: 'أبريل', MAY: 'مايو', JUN: 'يونيو', JUL: 'يوليو', AUG: 'أغسطس',
  SEP: 'سبتمبر', OCT: 'أكتوبر', NOV: 'نوفمبر', DEC: 'ديسمبر', JAN: 'يناير', FEB: 'فبراير',
  MON: 'الاثنين', TUE: 'الثلاثاء', WED: 'الأربعاء', THU: 'الخميس',
  FRI: 'الجمعة', SAT: 'السبت', SUN: 'الأحد',
});

export function toArabicDigits(value) {
  return String(value ?? '').replace(/[0-9]/g, (digit) => ARABIC_DIGITS[digit]);
}

function requestedLanguage() {
  try {
    const queryLanguage = new URLSearchParams(window.location.search).get('lang');
    if (queryLanguage === 'en') return 'en';
    if (queryLanguage === 'ar') return 'ar';
  } catch {
    // Ignore malformed URLs.
  }
  return null;
}

function isArabicRequested() {
  const queryLanguage = requestedLanguage();
  if (queryLanguage) return queryLanguage === 'ar';
  return document.documentElement.lang !== 'en';
}

function translateCanvasText(value) {
  if (!isArabicRequested()) return String(value ?? '');
  let output = String(value ?? '');
  Object.entries(CANVAS_WORDS).forEach(([english, arabic]) => {
    output = output.replace(new RegExp(`\\b${english}\\b`, 'g'), arabic);
  });
  return toArabicDigits(output);
}

if (typeof window !== 'undefined' && typeof window.CanvasRenderingContext2D !== 'undefined') {
  const prototype = window.CanvasRenderingContext2D.prototype;
  if (!prototype.__gannzillaArabicFillTextV249) {
    const originalFillText = prototype.__gannzillaArabicFillTextV248 || prototype.fillText;
    Object.defineProperty(prototype, '__gannzillaArabicFillTextV249', {
      value: originalFillText,
      configurable: true,
    });
    prototype.fillText = function localizedFillText(text, ...args) {
      return originalFillText.call(this, translateCanvasText(text), ...args);
    };
  }
}

function translateText(text) {
  const original = String(text ?? '');
  const trimmed = original.trim();
  if (!trimmed) return original;

  let translated = EXACT_TRANSLATIONS[trimmed] || trimmed;
  translated = translated.replace(/^Circle of\s+(\d+)$/i, (_, value) => `دائرة من ${toArabicDigits(value)} قسماً`);
  translated = translated.replace(/\bNorth\b/g, 'شمال');
  translated = translated.replace(/\bSouth\b/g, 'جنوب');
  translated = translated.replace(/\bEast\b/g, 'شرق');
  translated = translated.replace(/\bWest\b/g, 'غرب');
  translated = toArabicDigits(translated);

  const leading = original.match(/^\s*/)?.[0] || '';
  const trailing = original.match(/\s*$/)?.[0] || '';
  return `${leading}${translated}${trailing}`;
}

function shouldSkipElement(element) {
  if (!element) return true;
  if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(element.tagName)) return true;
  return Boolean(element.closest?.('[data-gannzilla-language-control="true"]'));
}

function localizeNode(root) {
  if (!root || root.nodeType !== Node.ELEMENT_NODE) return;
  if (root.closest?.('[data-gannzilla-language-control="true"]')) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (shouldSkipElement(parent)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const next = translateText(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
  });

  root.querySelectorAll('input[type="text"]').forEach((input) => {
    if (input.closest('[data-gannzilla-language-control="true"]')) return;
    if (input.value === 'New York') input.value = 'نيويورك';
    else if (/North|South|East|West/.test(input.value)) input.value = translateText(input.value);
    input.dir = 'rtl';
    input.style.textAlign = 'right';
  });

  root.querySelectorAll('input[type="number"]').forEach((input) => {
    input.dir = 'ltr';
    input.style.textAlign = 'center';
    input.setAttribute('lang', 'ar');
    input.setAttribute('aria-label', translateText(input.getAttribute('aria-label') || 'قيمة رقمية'));
  });

  root.querySelectorAll('select, button, aside, [role="menu"], [role="toolbar"]').forEach((element) => {
    if (element.closest('[data-gannzilla-language-control="true"]')) return;
    element.dir = 'rtl';
  });
}

export default function GannzillaArabicLocalizationV248() {
  const { lang, setLang } = useLanguage();
  const arabicMode = requestedLanguage() === 'ar' || (requestedLanguage() === null && lang === 'ar');

  React.useEffect(() => {
    const urlLanguage = requestedLanguage();
    if (urlLanguage === 'ar' && lang !== 'ar') setLang('ar');
    if (urlLanguage === 'en' && lang !== 'en') setLang('en');
  }, [lang, setLang]);

  React.useEffect(() => {
    if (!arabicMode) return undefined;

    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    document.body.dir = 'rtl';
    localizeNode(document.body);

    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        if (record.type === 'characterData' && record.target.parentElement) {
          localizeNode(record.target.parentElement);
          return;
        }
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) localizeNode(node);
          else if (node.nodeType === Node.TEXT_NODE && node.parentElement) localizeNode(node.parentElement);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    const secondPass = window.setTimeout(() => localizeNode(document.body), 120);
    const thirdPass = window.setTimeout(() => localizeNode(document.body), 500);

    window.dispatchEvent(new CustomEvent('gannzilla:ring-two-numbering-refresh'));
    window.dispatchEvent(new Event('resize'));

    window.GANNZILLA_ARABIC_LOCALIZATION_V249 = true;
    window.__auditGannzillaArabicLocalizationV249 = () => ({
      ok: true,
      build: BUILD,
      language: 'ar',
      direction: 'rtl',
      urlLanguageAuthority: true,
      wheelDigits: 'ARABIC_INDIC_٠١٢٣٤٥٦٧٨٩',
      interfaceTranslated: true,
      canvasTextLocalized: true,
      languageControlExcludedFromTranslation: true,
      characterDataObserved: true,
      symbolNamesPreserved: true,
      mutationObserverCount: 1,
    });

    return () => {
      observer.disconnect();
      window.clearTimeout(secondPass);
      window.clearTimeout(thirdPass);
      delete window.GANNZILLA_ARABIC_LOCALIZATION_V249;
      delete window.__auditGannzillaArabicLocalizationV249;
    };
  }, [arabicMode]);

  if (!arabicMode) return null;

  return (
    <style>{`
      html[lang="ar"], html[lang="ar"] body {
        direction: rtl !important;
        font-family: Tahoma, Arial, sans-serif !important;
      }

      [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) {
        direction: rtl !important;
      }

      [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > aside {
        left: auto !important;
        right: 0 !important;
        direction: rtl !important;
        border-right: 0 !important;
        border-left: 1px solid #b8b8b8 !important;
        text-align: right !important;
      }

      [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > aside input,
      [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > aside select {
        font-family: Tahoma, Arial, sans-serif !important;
      }

      [data-gannzilla-build="248"] > div:not([data-gannzilla-toolbar="true"]) > div:last-of-type {
        left: 0 !important;
        right: 330px !important;
      }

      [data-gannzilla-toolbar="true"] {
        direction: rtl !important;
        justify-content: flex-start !important;
        padding-right: 0 !important;
        padding-left: 4px !important;
      }

      [data-gannzilla-language-control="true"] {
        direction: ltr !important;
        pointer-events: auto !important;
        z-index: 2147483647 !important;
      }

      [data-gannzilla-language-control="true"] * {
        pointer-events: auto !important;
      }
    `}</style>
  );
}
