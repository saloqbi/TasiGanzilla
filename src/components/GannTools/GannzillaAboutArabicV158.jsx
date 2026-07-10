import React from 'react';

const DIALOG_ID = 'gannzilla-about-dialog-v156';

const ARABIC_TEXT = {
  windowTitle: 'حول البرنامج',
  product: 'جانزيلا برو',
  version: 'الإصدار: 8.3',
  author: 'المؤلف: أرتيم كلاشنيكوف',
  copyright: '© 2020 أرتيم كلاشنيكوف',
  rights: 'جميع الحقوق محفوظة',
  close: 'إغلاق',
};

const ENGLISH_TEXT = {
  windowTitle: 'About',
  product: 'Gannzilla Pro',
  version: 'Version: 8.3',
  author: 'Author: Artem Kalashnikov',
  copyright: '© 2020 Artem Kalashnikov',
  rights: 'All rights reserved',
  close: 'Cancel',
};

function setText(element, value) {
  if (element && element.textContent !== value) element.textContent = value;
}

function applyAboutLanguage() {
  const dialog = document.getElementById(DIALOG_ID);
  if (!dialog) return false;

  const panel = dialog.firstElementChild;
  const header = panel?.children?.[0];
  const content = panel?.children?.[1];
  if (!panel || !header || !content) return false;

  const isArabic = document.documentElement.lang === 'ar';
  const text = isArabic ? ARABIC_TEXT : ENGLISH_TEXT;

  panel.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
  panel.style.textAlign = isArabic ? 'right' : 'left';
  content.style.textAlign = 'center';

  setText(header.querySelector('span'), text.windowTitle);
  setText(content.children?.[1], text.product);
  setText(content.children?.[2], text.version);
  setText(content.children?.[3], text.author);
  setText(content.children?.[6], text.copyright);
  setText(content.children?.[7], text.rights);

  const closeButton = content.children?.[8]?.querySelector('button');
  setText(closeButton, text.close);
  if (closeButton) closeButton.setAttribute('aria-label', text.close);

  const headerClose = header.querySelector('button');
  if (headerClose) headerClose.setAttribute('aria-label', isArabic ? 'إغلاق' : 'Close');

  dialog.setAttribute('data-gannzilla-about-language-v158', isArabic ? 'ar' : 'en');
  return true;
}

export default function GannzillaAboutArabicV158() {
  React.useEffect(() => {
    let scheduled = false;

    const apply = () => {
      scheduled = false;
      applyAboutLanguage();
    };

    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(apply);
    };

    const bodyObserver = new MutationObserver(schedule);
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    const languageObserver = new MutationObserver(schedule);
    languageObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });

    const timer = window.setInterval(apply, 250);
    apply();

    window.GANNZILLA_ABOUT_ARABIC_V158 = true;
    window.__auditGannzillaAboutArabicV158 = () => {
      const dialog = document.getElementById(DIALOG_ID);
      return {
        ok: !dialog || dialog.getAttribute('data-gannzilla-about-language-v158') === (document.documentElement.lang === 'ar' ? 'ar' : 'en'),
        build: '158',
        dialogOpen: Boolean(dialog),
        language: document.documentElement.lang === 'ar' ? 'ar' : 'en',
      };
    };

    return () => {
      bodyObserver.disconnect();
      languageObserver.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
