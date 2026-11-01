import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const storageKey = 'bittersweet-journey:v1';
const ids = ['my-hometown', 'dujiangyan', 'taoist-tower', 'mogao-caves', 'secret-spring', 'yangguan', 'kashgar', 'mountain-resort', 'fish-tail-lodge'];

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('requestfailed', request => { if (request.failure()?.errorText !== 'net::ERR_ABORTED' && !request.failure()?.errorText?.includes('cancelled')) errors.push(request.failure()?.errorText); });
  page.testErrors = errors;
});
test.afterEach(async ({ page }) => { expect(page.testErrors).toEqual([]); });

async function visitAllSections(page) {
  for (let i = 1; i <= 5; i++) await page.getByRole('button', { name: `Section ${i}`, exact: true }).click();
  await page.locator('.reader-scroll').evaluate(element => { element.scrollTop = element.scrollHeight; });
}

test('first visit, all six prologue scenes, real reader completion, reload and unique seal', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveURL(/#\/intro$/);
  await expect(page.getByRole('heading', { name: 'Where do you begin to know a land?' })).toBeVisible();
  await page.getByRole('button', { name: 'Or, from a book…' }).click();
  await page.locator('.book-choice.book-en').click();
  await expect(page.locator('.journey')).toHaveAttribute('data-step', '2');
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Continue', exact: false }).click();
  await expect(page.locator('.journey')).toHaveAttribute('data-step', '5');
  await page.locator('.opening-action').click();
  await expect(page).toHaveURL(/#\/read\/my-hometown$/);
  await expect(page.locator('.reading-section')).toHaveCount(5);
  await expect(page.locator('[data-paragraph]')).toHaveCount(54);
  await expect(page.locator('.finish-chapter')).toBeDisabled();
  await visitAllSections(page);
  await expect(page.locator('.finish-chapter')).toBeEnabled();
  await page.locator('.finish-chapter').click();
  await expect(page).toHaveURL(/#\/atlas$/);
  await expect(page.getByTestId('progress-count')).toHaveText('1 / 9');
  await expect(page.locator('.journey-atlas')).toHaveClass(/my-hometown-complete/);
  await expect(page.locator('.journey-fog')).toHaveAttribute('data-completed', '1');
  await page.reload();
  await expect(page.locator('.story-point')).toHaveCount(9);
  await expect(page.getByTestId('progress-count')).toHaveText('1 / 9');
  await page.goto('./#/read/my-hometown');
  await page.locator('.reader-scroll').evaluate(element => { element.scrollTop = element.scrollHeight; });
  await page.locator('.finish-chapter').click();
  await expect(page).toHaveURL(/#\/atlas$/);
  await expect(page.getByTestId('progress-count')).toHaveText('1 / 9');
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
  expect(saved.completedChapterIds).toEqual(['my-hometown']);
  await page.goto('./');
  await expect(page).toHaveURL(/#\/atlas$/);
});

test('original atlas camera, keyboard pins, all chapter routes and honest unavailable states', async ({ page }) => {
  await page.goto('./#/atlas');
  await expect(page.locator('.physical-atlas')).toHaveCount(1);
  await expect(page.locator('.journey-fog')).toHaveCount(1);
  await expect(page.locator('.story-point')).toHaveCount(9);
  const svg = page.locator('.china-map');
  const original = await svg.getAttribute('viewBox');
  await page.locator('[data-camera="in"]').click();
  await expect(svg).not.toHaveAttribute('viewBox', original);
  const zoomed = await svg.getAttribute('viewBox');
  const box = await svg.boundingBox();
  await page.mouse.move(box.x + box.width * .7, box.y + box.height * .7);
  await page.mouse.down(); await page.mouse.move(box.x + box.width * .6, box.y + box.height * .65, { steps: 8 }); await page.mouse.up();
  await expect(svg).not.toHaveAttribute('viewBox', zoomed);
  await page.locator('[data-camera="home"]').click();
  for (const id of ['my-hometown', 'dujiangyan', 'taoist-tower', 'mogao-caves', 'secret-spring', 'yangguan', 'kashgar', 'chengde', 'fish-tail-lodge']) {
    const pin = page.locator(`[data-story="${id}"]`);
    await pin.focus(); await pin.press('Enter');
    await expect(page.locator('.atlas-location-panel')).toBeVisible();
    await page.getByRole('button', { name: 'Close location details' }).click();
  }
  for (const id of ids.slice(1)) {
    await page.goto(`./#/read/${id}`);
    await expect(page.getByText('Coming in the next milestone', { exact: true })).toBeVisible();
    await expect(page.locator('.finish-chapter')).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('link', { name: 'Return to atlas', exact: true })).toBeVisible();
    await expect(page.getByTestId('progress-count')).toHaveText('0 / 9');
  }
  await page.goto('./#/seals');
  await expect(page.getByTestId('ending-locked')).toBeVisible();
  await expect(page.locator('.seal-card')).toHaveCount(9);
});

test('Chinese persists, corrupt storage recovers, reset needs confirmation', async ({ page }) => {
  await page.goto('./#/atlas');
  await page.locator('.site-header').getByRole('button', { name: '中文', exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');
  await expect(page.locator('.journey-atlas')).toHaveAttribute('data-language', 'zh');
  await page.goto('./#/read/my-hometown');
  await expect(page.getByRole('heading', { name: '我的山河', exact: true })).toBeVisible();
  await expect(page.locator('[data-paragraph]')).toHaveCount(55);
  await page.evaluate(key => localStorage.setItem(key, '{invalid json'), storageKey);
  // A full navigation already reloads storage. Do not immediately interrupt its
  // lazy CSS request with a second reload before the new page has rendered.
  await page.goto('./');
  await expect(page).toHaveURL(/#\/intro$/);
  await expect(page.getByTestId('progress-count')).toHaveText('0 / 9');
  await page.goto('./#/seals');
  await page.getByRole('button', { name: 'Reset journey' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Keep my journey' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'Reset journey' }).click();
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click();
  await expect(page).toHaveURL(/#\/intro$/);
});

test('route remounts retain one map, accessibility and no missing images', async ({ page }) => {
  for (let i = 0; i < 3; i++) {
    await page.goto('./#/atlas');
    await expect(page.locator('.physical-atlas')).toHaveCount(1);
    await expect(page.locator('.journey-fog')).toHaveCount(1);
    await page.locator('.site-header').getByRole('link', { name: /My seals/ }).click();
    await expect(page.locator('.journey-fog')).toHaveCount(0);
    await expect(page.locator('.seal-card img')).toHaveCount(9);
  }
  await page.locator('.seal-card img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  for (const route of ['intro', 'read/my-hometown', 'atlas', 'seals']) {
    await page.goto(`./#/${route}`);
    await expect(page.locator('.route-loading')).toHaveCount(0);
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(scan.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) }))).toEqual([]);
  }
});

test('unavailable storage remains usable with an honest notice', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Unavailable', 'SecurityError'); } }); });
  await page.goto('./');
  await expect(page.locator('.storage-notice')).toContainText('Browser storage is unavailable');
  await page.getByRole('button', { name: /Skip prologue/ }).click();
  await expect(page.locator('.reading-section')).toHaveCount(5);
});

test('mobile portrait guidance and landscape reading retain navigation', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(test.info().project.use.baseURL || process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173/CS571_bittersweet-journey/');
  await expect(page.locator('.rotate-gate')).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('.rotate-gate')).not.toBeVisible();
  await page.getByRole('button', { name: /Skip prologue/ }).click();
  await expect(page.locator('.section-rail')).toBeInViewport();
  await expect(page.locator('.reader-scroll')).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  // In compact landscape the heading can be above the reading anchor while
  // its first paragraph is below it. The selected section must still win.
  await page.getByRole('button', { name: 'Section 3', exact: true }).click();
  await expect(page.locator('.section-button[aria-current="step"]')).toHaveText('3');
  await expect(page.locator('.hometown-map')).toHaveAttribute('data-scene', 'lines');
  await page.getByRole('button', { name: '中文', exact: true }).click();
  await expect(page.locator('.section-button[aria-current="step"]')).toHaveText('3');
  await expect(page.locator('.hometown-map')).toHaveAttribute('data-scene', 'lines');
  await expect(page.locator('[data-section-heading="2"]')).toBeInViewport();
  await context.close();
});

test('normal-motion opening, sound, pointer travel and WebGL recovery', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./#/intro');
  await page.getByRole('button', { name: 'Or, from a book…' }).click();
  await page.locator('.book-choice.book-en').click();
  await expect(page.locator('.book-portal')).toBeVisible();
  await expect(page.locator('.journey')).toHaveAttribute('data-step', '2');
  await expect(page.locator('.book-portal')).toHaveCount(0);
  await page.getByRole('button', { name: /Skip prologue/ }).click();
  await expect(page.locator('.earth-scene')).toBeVisible();
  await page.getByRole('button', { name: 'Sound off', exact: true }).click();
  await expect(page.locator('audio')).toHaveJSProperty('paused', false);
  await page.getByRole('button', { name: 'Sound on', exact: true }).click();
  await expect(page.locator('audio')).toHaveJSProperty('paused', true);
  // A GPU reset should expose the bundled SVG world instead of a blank panel.
  await page.locator('.earth-orb canvas').evaluate(canvas => {
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
  });
  await expect(page.locator('.map-stage.geographic-art')).not.toHaveClass(/has-earth/);
  expect((await page.locator('[data-reader-globe-land]').getAttribute('d')).length).toBeGreaterThan(1000);
  await page.locator('.site-header').getByRole('link', { name: 'Atlas', exact: true }).click();
  await expect(page.locator('.story-point')).toHaveCount(9);
  // Pins deliberately pulse. Click their observed center as a user would, rather
  // than waiting for Firefox's animated SVG bounding box to become motionless.
  const pinBox = await page.locator('[data-story="my-hometown"] .point-core').boundingBox();
  await page.mouse.click(pinBox.x + pinBox.width / 2, pinBox.y + pinBox.height / 2);
  await page.getByRole('button', { name: /Follow the three lines/ }).click();
  await expect(page).toHaveURL(/#\/read\/my-hometown$/);
  await expect(page.locator('.earth-scene')).toBeVisible();
});
