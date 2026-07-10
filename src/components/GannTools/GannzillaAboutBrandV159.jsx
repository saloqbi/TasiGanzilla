import React from 'react';
import BRAND_IMAGE from './gannzillaBrandImageV159';

const DIALOG_ID = 'gannzilla-about-dialog-v156';

const COPY = {
  ar: {
    title: 'حول البرنامج',
    product: 'كوكبة الأرقام السحرية',
    version: 'الإصدار: 1',
    author: 'المؤلف: محمود سمان',
    rightsOwner: '© 2026 كوكبة تاسي',
    rights: 'جميع الحقوق محفوظة',
    close: 'إغلاق',
  },
  en: {
    title: 'About',
    product: 'Magic Numbers Constellation',
    version: 'Version: 1',
    author: 'Author: Mahmood Samman',
    rightsOwner: '© 2026 TASI Constellation',
    rights: 'All rights reserved',
    close: 'Close',
  },
};

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function applyBranding() {
  const dialog = document.getElementById(DIALOG_ID);
  if (!dialog) return false;

  const panel = dialog.firstElementChild;
  const header = panel?.children?.[0];
  const content = panel?.children?.[1];
  if (!panel || !header || !content) return false;

  const lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';
  const copy = COPY[lang];

  dialog.dataset.brandV159 = 'true';
  panel.dir = lang === 'ar' ? 'rtl' : 'ltr';

  setText(header.querySelector('span'), copy.title);
  setText(content.children?.[1], copy.product);
  setText(content.children?.[2], copy.version);
  setText(content.children?.[3], copy.author);

  const email = content.children?.[4];
  if (email) {
    email.textContent = 'm.a.m.1392@gmail.com';
    email.setAttribute('href', 'mailto:m.a.m.1392@gmail.com');
  }

  const website = content.children?.[5];
  if (website) website.style.display = 'none';

  setText(content.children?.[6], copy.rightsOwner);
  setText(content.children?.[7], copy.rights);

  const closeButton = content.children?.[8]?.querySelector('button');
  setText(closeButton, copy.close);
  closeButton?.setAttribute('aria-label', copy.close);

  const logo = content.children?.[0];
  if (logo) {
    logo.innerHTML = '';
    Object.assign(logo.style, {
      width: 'min(430px, calc(100vw - 70px))',
      height: 'min(430px, calc(100vw - 70px))',
      maxHeight: '430px',
      margin: '0 auto 20px',
      backgroundImage: `url("${BRAND_IMAGE}")`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      borderRadius: '14px',
      boxShadow: '0 0 28px rgba(244,184,32,.35)',
      transform: 'none',
    });
  }

  return true;
}

export default function GannzillaAboutBrandV159() {
  React.useEffect(() => {
    const apply = () => applyBranding();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    const langObserver = new MutationObserver(apply);
    langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    const timer = window.setInterval(apply, 250);
    apply();

    window.GANNZILLA_ABOUT_BRAND_V159 = true;
    window.__auditGannzillaAboutBrandV159 = () => {
      const dialog = document.getElementById(DIALOG_ID);
      return {
        ok: !dialog || dialog.dataset.brandV159 === 'true',
        build: '159',
        dialogOpen: Boolean(dialog),
      };
    };

    return () => {
      observer.disconnect();
      langObserver.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <style>{`
      #${DIALOG_ID} {
        background: rgba(0,0,0,.70) !important;
      }
      #${DIALOG_ID} > div {
        width: min(520px, calc(100vw - 20px)) !important;
        max-height: calc(100vh - 20px) !important;
        min-height: 0 !important;
        overflow: auto !important;
        background: linear-gradient(180deg,#090909 0%,#020202 100%) !important;
        border: 2px solid #d79a18 !important;
        box-shadow: 0 0 34px rgba(235,164,18,.42) !important;
        color: #f5c44d !important;
      }
      #${DIALOG_ID} > div > div:first-child {
        height: 46px !important;
        padding: 0 14px !important;
        background: #050505 !important;
        border-bottom: 1px solid #b77d10 !important;
        color: #f5c44d !important;
        font-size: 18px !important;
        font-weight: 800 !important;
      }
      #${DIALOG_ID} > div > div:first-child button {
        width: 40px !important;
        height: 40px !important;
        color: #f5c44d !important;
        font-size: 30px !important;
      }
      #${DIALOG_ID} > div > div:nth-child(2) {
        padding: 18px 24px 20px !important;
        text-align: center !important;
      }
      #${DIALOG_ID} > div > div:nth-child(2) > div:nth-child(2) {
        color: #ffd86a !important;
        font-size: 27px !important;
        font-weight: 900 !important;
        margin-bottom: 18px !important;
      }
      #${DIALOG_ID} > div > div:nth-child(2) > div:nth-child(n+3),
      #${DIALOG_ID} > div > div:nth-child(2) > a {
        color: #f2c454 !important;
        font-size: 17px !important;
        line-height: 1.65 !important;
      }
      #${DIALOG_ID} > div > div:nth-child(2) > a {
        color: #ffd86a !important;
      }
      #${DIALOG_ID} > div > div:nth-child(2) > div:nth-child(9) {
        margin-top: 20px !important;
      }
      #${DIALOG_ID} > div > div:nth-child(2) > div:nth-child(9) button {
        min-width: 105px !important;
        height: 38px !important;
        border: 1px solid #d79a18 !important;
        background: linear-gradient(#251a05,#080808) !important;
        color: #ffd86a !important;
        font-size: 16px !important;
        font-weight: 800 !important;
        box-shadow: inset 0 0 0 1px rgba(255,216,106,.15) !important;
      }
    `}</style>
  );
}
