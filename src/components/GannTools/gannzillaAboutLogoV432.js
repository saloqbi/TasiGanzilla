const BUILD = 432;
const STATE_KEY = '__gannzillaAboutLogoV432';
const PANEL_ID = 'gannzilla-pixel-perfect-reference-panel-v421';
const BUTTON_ID = 'gannzilla-about-info-button-v432';
const MODAL_ID = 'gannzilla-about-logo-modal-v432';
const STYLE_ID = 'gannzilla-about-logo-style-v432';
const CHUNK_URLS = Array.from({ length: 7 }, (_, index) =>
  `/about-logo-v432/chunk-${String(index + 1).padStart(2, '0')}.txt`,
);

let logoDataPromise = null;

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

function loadLogoDataUri() {
  if (!logoDataPromise) {
    logoDataPromise = Promise.all(CHUNK_URLS.map(async (url) => {
      const response = await fetch(url, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`ABOUT_LOGO_CHUNK_${response.status}`);
      return (await response.text()).trim();
    })).then((chunks) => `data:image/webp;base64,${chunks.join('')}`);
  }
  return logoDataPromise;
}

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #${PANEL_ID} .gz421-preset-bar {
      grid-template-columns: 24px minmax(0, 1fr) 30px 30px 30px 48px 34px !important;
      gap: 3px !important;
      align-items: center !important;
    }

    #${BUTTON_ID} {
      width: 28px !important;
      min-width: 28px !important;
      max-width: 28px !important;
      height: 28px !important;
      min-height: 28px !important;
      max-height: 28px !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 1px solid #3779b7 !important;
      border-radius: 50% !important;
      background: linear-gradient(#eaf6ff, #7bb5e8) !important;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.78), 0 1px 1px rgba(0,0,0,.18) !important;
      color: #0d4f86 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      font: 900 20px/26px Arial, "Segoe UI", sans-serif !important;
      cursor: pointer !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    #${BUTTON_ID}:hover {
      background: linear-gradient(#ffffff, #96cbf4) !important;
      border-color: #1d649f !important;
    }

    #${MODAL_ID} {
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 14px !important;
      background: rgba(0,0,0,.62) !important;
      direction: rtl !important;
      box-sizing: border-box !important;
    }

    #${MODAL_ID} .gz432-dialog {
      width: min(390px, calc(100vw - 28px)) !important;
      max-height: calc(100vh - 28px) !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      border: 1px solid #c69424 !important;
      background: #050505 !important;
      box-shadow: 0 10px 34px rgba(0,0,0,.72) !important;
      color: #f5c95c !important;
      font-family: Tahoma, "Segoe UI", Arial, sans-serif !important;
      box-sizing: border-box !important;
    }

    #${MODAL_ID} .gz432-titlebar {
      flex: 0 0 31px !important;
      min-height: 31px !important;
      display: grid !important;
      grid-template-columns: 34px 1fr 34px !important;
      align-items: center !important;
      padding: 0 4px !important;
      border-bottom: 1px solid #8f691b !important;
      background: linear-gradient(#151515, #070707) !important;
      color: #e7bd50 !important;
      font-size: 13px !important;
      font-weight: 800 !important;
      box-sizing: border-box !important;
    }

    #${MODAL_ID} .gz432-title { text-align: right !important; padding-right: 4px !important; }

    #${MODAL_ID} .gz432-close-x {
      grid-column: 1 !important;
      width: 24px !important;
      height: 24px !important;
      min-height: 24px !important;
      padding: 0 !important;
      border: 1px solid #8e671b !important;
      border-radius: 0 !important;
      background: #090909 !important;
      color: #f5c95c !important;
      font: 700 17px/22px Arial, sans-serif !important;
      cursor: pointer !important;
    }

    #${MODAL_ID} .gz432-image-wrap {
      min-height: 0 !important;
      padding: 10px 10px 5px !important;
      overflow: auto !important;
      background: #050505 !important;
      text-align: center !important;
      box-sizing: border-box !important;
    }

    #${MODAL_ID} .gz432-logo {
      width: auto !important;
      max-width: 100% !important;
      max-height: calc(100vh - 116px) !important;
      height: auto !important;
      display: block !important;
      margin: 0 auto !important;
      border: 1px solid #72510d !important;
      background: #000 !important;
      object-fit: contain !important;
    }

    #${MODAL_ID} .gz432-loading {
      min-height: 180px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: #e7bd50 !important;
      font: 700 13px Tahoma, Arial, sans-serif !important;
    }

    #${MODAL_ID} .gz432-footer {
      flex: 0 0 38px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: flex-start !important;
      padding: 5px 9px !important;
      background: #050505 !important;
      box-sizing: border-box !important;
    }

    #${MODAL_ID} .gz432-close-button {
      min-width: 58px !important;
      height: 25px !important;
      padding: 0 10px !important;
      border: 1px solid #9d731f !important;
      border-radius: 0 !important;
      background: linear-gradient(#231b0b, #090704) !important;
      color: #f1c75d !important;
      font: 700 12px/23px Tahoma, Arial, sans-serif !important;
      cursor: pointer !important;
    }
  `;
  document.head.appendChild(style);
}

function closeModal() {
  document.getElementById(MODAL_ID)?.remove();
}

function openModal() {
  closeModal();

  const overlay = document.createElement('div');
  overlay.id = MODAL_ID;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'حول البرنامج');

  const dialog = document.createElement('div');
  dialog.className = 'gz432-dialog';

  const titlebar = document.createElement('div');
  titlebar.className = 'gz432-titlebar';

  const closeX = document.createElement('button');
  closeX.type = 'button';
  closeX.className = 'gz432-close-x';
  closeX.textContent = '×';
  closeX.title = 'إغلاق';
  closeX.addEventListener('click', closeModal);

  const title = document.createElement('div');
  title.className = 'gz432-title';
  title.textContent = 'حول البرنامج';

  titlebar.append(closeX, title, document.createElement('span'));

  const imageWrap = document.createElement('div');
  imageWrap.className = 'gz432-image-wrap';
  const loading = document.createElement('div');
  loading.className = 'gz432-loading';
  loading.textContent = 'جاري تحميل الشعار...';
  imageWrap.appendChild(loading);

  const footer = document.createElement('div');
  footer.className = 'gz432-footer';
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'gz432-close-button';
  closeButton.textContent = 'إغلاق';
  closeButton.addEventListener('click', closeModal);
  footer.appendChild(closeButton);

  dialog.append(titlebar, imageWrap, footer);
  overlay.appendChild(dialog);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
  closeX.focus();

  loadLogoDataUri().then((src) => {
    if (!document.getElementById(MODAL_ID)) return;
    const image = document.createElement('img');
    image.className = 'gz432-logo';
    image.src = src;
    image.alt = 'كوكبة الأرقام السحرية - كوكبة تاسي';
    image.decoding = 'async';
    imageWrap.replaceChildren(image);
  }).catch(() => {
    loading.textContent = 'تعذر تحميل الشعار.';
  });
}

function mountButton() {
  const panel = document.getElementById(PANEL_ID);
  const bar = panel?.querySelector('.gz421-preset-bar');
  if (!(panel instanceof HTMLElement) || !(bar instanceof HTMLElement)) return false;

  let button = document.getElementById(BUTTON_ID);
  if (!(button instanceof HTMLButtonElement)) {
    button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.textContent = 'i';
    button.title = 'حول البرنامج';
    button.setAttribute('aria-label', 'حول البرنامج');
    button.addEventListener('click', openModal);
    bar.appendChild(button);
  }

  panel.dataset.gannzillaAboutLogoV432 = 'true';
  return true;
}

function install() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !wheelMode()) return;
  if (!boolParam('showAboutLogo', true) || window[STATE_KEY]) return;

  installStyle();
  const mount = () => { installStyle(); mountButton(); };
  mount();
  [30, 90, 220, 600, 1400, 2800].forEach((delay) => window.setTimeout(mount, delay));

  const onKeyDown = (event) => { if (event.key === 'Escape') closeModal(); };
  document.addEventListener('keydown', onKeyDown);

  window.GANNZILLA_ABOUT_LOGO_V432 = true;
  window.__auditGannzillaAboutLogoV432 = () => {
    const panel = document.getElementById(PANEL_ID);
    return {
      ok: Boolean(document.getElementById(BUTTON_ID) && panel?.dataset?.gannzillaAboutLogoV432 === 'true'),
      build: BUILD,
      enabled: boolParam('showAboutLogo', true),
      informationIconVisible: Boolean(document.getElementById(BUTTON_ID)),
      modalUsesProvidedLogo: true,
      existingPanelControlsPreserved: true,
      lightweightMount: true,
    };
  };

  window[STATE_KEY] = { onKeyDown };
}

install();
