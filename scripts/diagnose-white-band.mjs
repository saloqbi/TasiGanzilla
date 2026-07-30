import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const targetUrl = process.env.TARGET_URL;
if (!targetUrl) throw new Error('TARGET_URL is required');

const outDir = path.resolve('diagnostics/white-band-robot');
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1196, height: 720 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

const consoleMessages = [];
page.on('console', (message) => {
  consoleMessages.push({ type: message.type(), text: message.text() });
});
page.on('pageerror', (error) => {
  consoleMessages.push({ type: 'pageerror', text: String(error?.stack || error) });
});

const startedAt = new Date().toISOString();
const response = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 });
await page.waitForLoadState('networkidle', { timeout: 120_000 }).catch(() => {});
await page.waitForTimeout(10_000);

const screenshotPath = path.join(outDir, 'page.png');
await page.screenshot({ path: screenshotPath, fullPage: false });

const dom = await page.evaluate(() => {
  const rect = (element) => {
    const r = element?.getBoundingClientRect?.();
    if (!r) return null;
    return {
      x: Math.round(r.x * 100) / 100,
      y: Math.round(r.y * 100) / 100,
      top: Math.round(r.top * 100) / 100,
      left: Math.round(r.left * 100) / 100,
      right: Math.round(r.right * 100) / 100,
      bottom: Math.round(r.bottom * 100) / 100,
      width: Math.round(r.width * 100) / 100,
      height: Math.round(r.height * 100) / 100,
    };
  };

  const describe = (element) => {
    if (!(element instanceof HTMLElement)) return null;
    const style = getComputedStyle(element);
    return {
      tag: element.tagName.toLowerCase(),
      id: element.id || null,
      className: typeof element.className === 'string' ? element.className : null,
      rect: rect(element),
      style: {
        position: style.position,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        overflow: style.overflow,
        overflowX: style.overflowX,
        overflowY: style.overflowY,
        backgroundColor: style.backgroundColor,
        borderTop: style.borderTop,
        borderBottom: style.borderBottom,
        boxShadow: style.boxShadow,
        transform: style.transform,
        translate: style.translate,
        zIndex: style.zIndex,
        alignItems: style.alignItems,
        justifyItems: style.justifyItems,
        placeItems: style.placeItems,
        paddingTop: style.paddingTop,
        marginTop: style.marginTop,
      },
      dataset: { ...element.dataset },
    };
  };

  const line = document.getElementById('gannzilla-thin-top-boundary-line-v642');
  const v305Viewport = document.querySelector('[data-gannzilla-asymmetric-open-pan-v305="true"]');
  const visibleCanvases = Array.from(document.querySelectorAll('canvas'))
    .filter((canvas) => {
      const style = getComputedStyle(canvas);
      const r = canvas.getBoundingClientRect();
      return !canvas.closest('aside')
        && style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || 0) > 0.01
        && r.width > 250
        && r.height > 250;
    })
    .map(describe);

  const allCanvases = Array.from(document.querySelectorAll('canvas')).map(describe);
  const images = Array.from(document.querySelectorAll('img')).map(describe);

  const topCandidates = Array.from(document.querySelectorAll('body *'))
    .filter((element) => {
      if (!(element instanceof HTMLElement)) return false;
      const r = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return r.bottom >= 0
        && r.top <= 230
        && r.width >= 300
        && r.height >= 1
        && style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || 0) > 0.01;
    })
    .map(describe)
    .sort((a, b) => (a.rect?.top || 0) - (b.rect?.top || 0));

  const sampleX = Math.round(window.innerWidth * 0.66);
  const pointStacks = [];
  for (let y = 0; y <= 220; y += 4) {
    const stack = document.elementsFromPoint(sampleX, y)
      .slice(0, 8)
      .map((element) => ({
        tag: element.tagName?.toLowerCase?.() || null,
        id: element.id || null,
        className: typeof element.className === 'string' ? element.className : null,
        rect: rect(element),
        backgroundColor: element instanceof HTMLElement ? getComputedStyle(element).backgroundColor : null,
      }));
    pointStacks.push({ y, stack });
  }

  const auditNames = [
    '__auditGannzillaWheelAsymmetricOpenPanV305',
    '__auditGannzillaThinTopBoundaryV642',
    '__auditGannzillaWheelCopperEdgeAuthorityV649',
    '__auditGannzillaSingleVisibleWheelAuthorityV535',
    '__auditGannzillaFixedPaintPreviewV512',
  ];
  const audits = {};
  for (const name of auditNames) {
    try {
      audits[name] = typeof window[name] === 'function' ? window[name]() : null;
    } catch (error) {
      audits[name] = { error: String(error) };
    }
  }

  return {
    href: location.href,
    viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
    body: describe(document.body),
    root: describe(document.getElementById('root')),
    boundaryLine: describe(line),
    v305Viewport: describe(v305Viewport),
    v305Stage: describe(v305Viewport?.querySelector('canvas')?.parentElement),
    visibleCanvases,
    allCanvases,
    images,
    topCandidates,
    pointStacks,
    audits,
  };
});

const png = PNG.sync.read(await fs.readFile(screenshotPath));
const centralStartX = Math.floor(png.width * 0.22);
const centralEndX = Math.floor(png.width * 0.98);
const rowStats = [];
for (let y = 0; y < Math.min(png.height, 260); y += 1) {
  let nonWhite = 0;
  let dark = 0;
  let copperLike = 0;
  let samples = 0;
  for (let x = centralStartX; x < centralEndX; x += 2) {
    const index = (y * png.width + x) * 4;
    const red = png.data[index];
    const green = png.data[index + 1];
    const blue = png.data[index + 2];
    const alpha = png.data[index + 3];
    if (alpha < 8) continue;
    samples += 1;
    if (red < 247 || green < 247 || blue < 247) nonWhite += 1;
    if (red < 210 || green < 210 || blue < 210) dark += 1;
    const copper = red >= 44 && red > green + 12 && red > blue + 20 && green >= blue - 18;
    if (copper) copperLike += 1;
  }
  rowStats.push({
    y,
    samples,
    nonWhiteRatio: samples ? nonWhite / samples : 0,
    darkRatio: samples ? dark / samples : 0,
    copperRatio: samples ? copperLike / samples : 0,
  });
}

const boundaryBottom = Math.round(dom.boundaryLine?.rect?.bottom || 0);
const firstMaterialRow = rowStats.find((row) => row.y > boundaryBottom && row.nonWhiteRatio > 0.015)?.y ?? null;
const firstCopperRow = rowStats.find((row) => row.y > boundaryBottom && row.copperRatio > 0.003)?.y ?? null;
const inferredGapPx = firstCopperRow == null ? null : firstCopperRow - boundaryBottom;

const report = {
  startedAt,
  completedAt: new Date().toISOString(),
  httpStatus: response?.status?.() ?? null,
  title: await page.title(),
  diagnosis: {
    boundaryBottom,
    firstMaterialRow,
    firstCopperRow,
    inferredGapPx,
    statement: inferredGapPx == null
      ? 'The robot could not identify the copper edge in the screenshot.'
      : inferredGapPx > 3
        ? `A ${inferredGapPx}px visible gap remains between the toolbar boundary and the copper wheel edge.`
        : 'The copper edge is aligned to the toolbar boundary within tolerance.',
  },
  dom,
  rowStats,
  consoleMessages,
};

await fs.writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outDir, 'summary.txt'), [
  `HTTP status: ${report.httpStatus}`,
  `Boundary bottom: ${boundaryBottom}`,
  `First material row: ${firstMaterialRow}`,
  `First copper row: ${firstCopperRow}`,
  `Inferred gap: ${inferredGapPx}px`,
  report.diagnosis.statement,
].join('\n') + '\n');

console.log(JSON.stringify(report.diagnosis, null, 2));
await browser.close();
