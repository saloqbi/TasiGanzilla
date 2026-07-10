import React from 'react';
import { createPortal } from 'react-dom';

const TOOLBAR_ID = 'gannzilla-exact-drawing-toolbar-v208';
const LINE_MENU_ID = 'gannzilla-exact-line-menu-v208';
const SHAPE_MENU_ID = 'gannzilla-exact-shape-menu-v208';
const REPLICA_ID = 'gannzilla-pixel-toolbar-v212';
const IMAGE_WIDTH = 38;
const IMAGE_HEIGHT = 13;
const TOOLBAR_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAANCAIAAABKNIsMAAAEQUlEQVR42pWOy2tdVRhHf9/e++zzuDe5edwmabRNDU1DsYo6KCpWrW8QRXDuyImIY/E/8C8oguJAZw5tBamgSAciCPVBEbVSad5Jk9zcc8+55+zH9zkoOnDmmq3RWvT+h5/Mzp/c3Nme7WTEvhkdkdGsU47ILW2v3Tq3uuycGwdKs1xCVCIAABBYgZUwwJlNXIhZ3vn91vrxk6e90k60wLTB+2ZcWJOq2J/M6uHg2aeeML2pqfOPPbq/v78411+Ytk0TA8NDk0Zs/bWvr7762svMMZC2hATQd4skJCAwwABA2oXIJolXr1184cL2EDf+2A6RU6s1wvLisRNz1tfhmy8vi4jxzmmtb69vDO7smvtXjVJRpAVlifKi1nf2BSClBaiBFNB3i0wKIOi7BzEGgeKIra0tAm7f3v388pWDwZFzzex096WnL9z7/CN5ZloXsjQ1HAI4GkVLS0s//3JjemryzNkzMWBQwhqd5N1aUJb+i6++NWnh2hhCEI4J8dLi3AtPPtQ6bTW0EmNMiGLC2AoePzd3bvXNjz+9srF38N67b2SAAojgvRcRY41JtDHG9Hq95eXlqhxd/+nX2cXlrJuC4BgBqNqQFhMPPnw+zUkERmFrbXd/e+NojFzD+ZAZVZZlpzsxPT0VA5zAEBSxRO8cWMBARyExJkkS472v65p9ANSpe2YG1dTgt5traxv3rSwbCxaCYFRWwnRqgRxDETJCXSQbo0FTNzOzmURz6YNLnU7n4jPPKVuMAlhDJ2Bl0sRahUxDBwhDgm/bVnEUpU23N1WW5UHJh4dHZVmub27s7R3UNSuQIigiSBw1QIQfo27RNnVqDcAMDKtqZ2enqipmFokayC0kwtUjXw/rIzGCREFLMFprkIlkg6jI6uaffxW5revRnYPDldNnexPdwqrCaj+G+LYtj77/7keIYglEFNpmsuiqxDQOgLzz9lscfL/fv/5Dqd0IktZl3UvCxGJf+To2hZIgvlUQAAbaugDHGAxLY3oxitY6SZLh4IiCFe8R3YmFfnjgbBCKMYqChAjqHJuZTrUe10MDThMTEKvRUVMNE8Wk4rGZ7uuvvFhWbmGmE53j0Ma2TjRBohFtTZbOL57sZNl0L9/b2Syc7+R527aWSCvmps7T7MR8P0IUooIIQURSayjU4lulEaLXWqVpZtM8MKrhCDrJ83yy24vO+aZKiBG8TXRRFMY1o2ZUFUWuJ4v+9JTicHx+gYl1aibyPDM6OD8Onsl0isLVY+GQZimA6JoQIpF4Fk3KRR/rZjiqWu+sTUOUcVWzbtpmbLVKMjt27bhpWhfoo88u7x4cFkW3aRpmztPMe0/aAEgIWnFCoglKGSIBe8J/YABK/hH61wiQxKjovNJgZom8sDC3srJKNze3lU46nYm6ccySmDSEICJEpMCKoCBEookAhjD+B0wsgmitFZG6rokoz/O/Aa1hiUXBSHNDAAAAAElFTkSuQmCC';

function press(control, buttonIndex = null) {
  if (!control) return;
  const target = buttonIndex === null
    ? (control.matches?.('button') ? control : control.querySelector?.('button'))
    : control.querySelectorAll?.('button')?.[buttonIndex];
  target?.click?.();
}

export default function GannzillaCenteredToolbarV211() {
  const [rect, setRect] = React.useState(null);

  React.useEffect(() => {
    let disposed = false;

    const apply = () => {
      if (disposed) return;

      const toolbar = document.getElementById(TOOLBAR_ID);
      if (!toolbar) {
        setRect(null);
        return;
      }

      const sourceRect = toolbar.getBoundingClientRect();
      if (sourceRect.width > 0 && sourceRect.height > 0) {
        const next = {
          left: Math.round(sourceRect.right - IMAGE_WIDTH),
          top: Math.round(sourceRect.top + (sourceRect.height - IMAGE_HEIGHT) / 2),
        };
        setRect((current) => current
          && current.left === next.left
          && current.top === next.top
          ? current
          : next);
      }

      toolbar.style.setProperty('opacity', '0', 'important');
      toolbar.style.setProperty('visibility', 'hidden', 'important');
      toolbar.style.setProperty('pointer-events', 'none', 'important');

      const lineMenu = document.getElementById(LINE_MENU_ID);
      if (lineMenu) {
        lineMenu.style.setProperty('display', 'none', 'important');
        lineMenu.style.setProperty('visibility', 'hidden', 'important');
        lineMenu.style.setProperty('pointer-events', 'none', 'important');
      }

      const shapeMenu = document.getElementById(SHAPE_MENU_ID);
      if (shapeMenu && rect) {
        shapeMenu.style.setProperty('left', `${rect.left + 11}px`, 'important');
        shapeMenu.style.setProperty('top', `${rect.top + IMAGE_HEIGHT + 2}px`, 'important');
      }

      window.GANNZILLA_PIXEL_TOOLBAR_V212 = true;
      window.__auditGannzillaPixelToolbarV212 = () => ({
        ok: Boolean(document.getElementById(REPLICA_ID))
          && window.getComputedStyle(toolbar).opacity === '0',
        build: 212,
        imageWidth: IMAGE_WIDTH,
        imageHeight: IMAGE_HEIGHT,
        source: 'user-supplied-toolbar-crop',
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setInterval(apply, 200);
    window.addEventListener('resize', apply);
    window.addEventListener('scroll', apply, true);

    return () => {
      disposed = true;
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', apply);
      window.removeEventListener('scroll', apply, true);
    };
  }, [rect]);

  if (!rect) return null;

  const stop = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const trigger = (kind) => {
    const toolbar = document.getElementById(TOOLBAR_ID);
    if (!toolbar) return;

    if (kind === 'pointer') press(toolbar.children?.[0]);
    if (kind === 'shape') press(toolbar.children?.[2], 0);
    if (kind === 'shapeMenu') press(toolbar.children?.[2], 1);
    if (kind === 'text') press(toolbar.children?.[3]);
  };

  const hitbox = (left, width, title, onClick) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      onPointerDown={stop}
      onClick={(event) => {
        stop(event);
        onClick();
      }}
      style={{
        position: 'absolute',
        left,
        top: 0,
        width,
        height: IMAGE_HEIGHT,
        padding: 0,
        margin: 0,
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
    />
  );

  return createPortal(
    <div
      id={REPLICA_ID}
      role="toolbar"
      aria-label="أدوات الرسم المطابقة لصورة جانزيلا"
      style={{
        position: 'fixed',
        left: rect.left,
        top: rect.top,
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        zIndex: 2147483647,
        padding: 0,
        margin: 0,
        border: 0,
        background: 'transparent',
        pointerEvents: 'auto',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      <img
        src={TOOLBAR_IMAGE}
        alt=""
        draggable="false"
        width={IMAGE_WIDTH}
        height={IMAGE_HEIGHT}
        style={{
          position: 'absolute',
          inset: 0,
          width: IMAGE_WIDTH,
          height: IMAGE_HEIGHT,
          display: 'block',
          border: 0,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      {hitbox(0, 11, 'أداة التحديد', () => trigger('pointer'))}
      {hitbox(11, 14, 'أداة الأشكال', () => trigger('shape'))}
      {hitbox(25, 4, 'خيارات الأشكال', () => trigger('shapeMenu'))}
      {hitbox(29, 9, 'أداة النص', () => trigger('text'))}
    </div>,
    document.body,
  );
}
