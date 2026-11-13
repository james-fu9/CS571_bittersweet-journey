import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const storageKey = 'bittersweet-journey:v1';
const ids = ['my-hometown', 'dujiangyan', 'taoist-tower', 'mogao-caves', 'secret-spring', 'yangguan', 'kashgar', 'mountain-resort', 'fish-tail-lodge'];

function observeErrors(page, errors) {
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('requestfailed', request => {
    const reason = request.failure()?.errorText;
    // Firefox intentionally cancels a redundant media channel when its parsed
    // data is already cached (Mozilla ChannelMediaResource::CloseChannel).
    // Playback/decoding is asserted separately; genuine media failures still fail.
    const cachedMedia = request.resourceType() === 'media' && reason === 'NS_ERROR_PARSED_DATA_CACHED';
    if (!cachedMedia && reason !== 'net::ERR_ABORTED' && !reason?.includes('cancelled')) errors.push(reason);
  });
}
test.beforeEach(async ({ page }) => {
  page.testErrors = [];
  observeErrors(page, page.testErrors);
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

test('atlas camera, keyboard pins and all nine available chapter routes', async ({ page }) => {
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
    await expect(page.locator('.guide-reader')).toBeVisible();
    await expect(page.locator('.guide-kind')).toHaveText('Original project guide');
    await expect(page.locator('.reading-section')).toHaveCount(3);
    await expect(page.locator('.guide-sources a').first()).toHaveAttribute('href', /^https:\/\//);
    await expect(page.locator('.finish-chapter')).toBeDisabled();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Back to atlas', exact: false })).toBeVisible();
    await expect(page.getByTestId('progress-count')).toHaveText('0 / 9');
  }
  await page.goto('./#/seals');
  await expect(page.getByTestId('ending-locked')).toBeVisible();
  await expect(page.locator('.seal-card')).toHaveCount(9);
});

test('collecting a seal saves immediately even when leaving during the animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./#/read/my-hometown');
  await visitAllSections(page);
  await page.locator('.finish-chapter').click();
  await page.locator('.site-header').getByRole('link', { name: /My seals/ }).click();
  await expect(page.getByTestId('progress-count')).toHaveText('1 / 9');
  await page.reload();
  await expect(page.locator('.seal-card.earned')).toHaveCount(1);
});

test('read all nine chapters to earn unique seals and unlock the complete bilingual ending', async ({ page }) => {
  await page.goto('./#/ending');
  await expect(page.getByRole('heading', { name: 'Your journey is still unfolding' })).toBeVisible();
  for (const [index, id] of ids.entries()) {
    await page.goto(`./#/read/${id}`);
    const count = id === 'my-hometown' ? 5 : 3;
    for (let section = 1; section <= count; section++) {
      await page.getByRole('button', { name: `Section ${section}`, exact: true }).click();
    }
    await page.locator('.reader-scroll').evaluate(pane => { pane.scrollTop = pane.scrollHeight; });
    await page.locator('.finish-chapter').click();
    await expect(page.getByTestId('progress-count')).toHaveText(`${index + 1} / 9`);
    await expect(page).toHaveURL(/#\/atlas$/);
  }
  await page.locator('.site-header').getByRole('link', { name: /My seals/ }).click();
  await expect(page.locator('.seal-card.earned')).toHaveCount(9);
  await page.getByRole('link', { name: 'Open the ending', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A map made of reading' })).toBeVisible();
  await expect(page.locator('.ending-seals img')).toHaveCount(9);
  for (let scene = 1; scene < 5; scene++) await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Take the next step' })).toBeVisible();
  await page.locator('.site-header').getByRole('button', { name: '中文', exact: true }).click();
  await expect(page.getByRole('heading', { name: '继续走下去', exact: true })).toBeVisible();
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(result.violations.map(item => item.id)).toEqual([]);
  await page.reload();
  await expect(page.getByTestId('progress-count')).toHaveText('9 / 9');
});

test('guide mobile resume, language, map controls, immediate completion and accessibility', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('./#/read/dujiangyan');
  await page.getByRole('button', { name: 'Section 2', exact: true }).click();
  await page.locator('.site-header').getByRole('link', { name: 'Atlas', exact: true }).click();
  await page.locator('[data-story="dujiangyan"]').press('Enter');
  await page.getByRole('button', { name: /Continue reading.*Section 2/ }).click();
  await expect(page.locator('.section-button[aria-current="step"]')).toHaveText('2');
  await expect(page.locator('[data-section-heading="1"]')).toBeInViewport();
  const map = page.locator('.guide-map svg');
  const view = await map.getAttribute('viewBox');
  await page.getByRole('button', { name: 'Zoom in on location map' }).click();
  await expect(map).not.toHaveAttribute('viewBox', view);
  await page.locator('.site-header').getByRole('button', { name: '中文', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: '第 2 节', exact: true })).toHaveAttribute('aria-current', 'step');
  await expect(page.locator('[data-section-heading="1"]')).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(result.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })) ).toEqual([]);
  await page.getByRole('button', { name: '第 3 节', exact: true }).click();
  await page.locator('.reader-scroll').evaluate(pane => { pane.scrollTop = pane.scrollHeight; });
  await page.locator('.finish-chapter').click();
  await page.locator('.site-header').getByRole('link', { name: /我的图章/ }).click();
  await expect(page.getByTestId('progress-count')).toHaveText('1 / 9');
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
  await expect.poll(() => page.locator('audio').evaluate(audio => audio.currentTime)).toBeGreaterThan(0);
  await expect(page.locator('audio')).toHaveJSProperty('error', null);
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
  await page.getByRole('button', { name: /Continue reading.*Section 1/ }).click();
  await expect(page).toHaveURL(/#\/read\/my-hometown$/);
  await expect(page.locator('.earth-scene')).toBeVisible();
});

test('resume from the atlas after scrolling and finish a chapter across two visits', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /Skip prologue/ }).click();
  await page.getByRole('button', { name: 'Section 2', exact: true }).click();
  await expect(page.locator('.section-button[aria-current="step"]')).toHaveText('2');
  // Exercise the reading pane's scroll listener separately from the section buttons.
  await page.locator('[data-section-heading="2"]').evaluate(heading => {
    const pane = heading.closest('.reader-scroll');
    pane.scrollTop += heading.getBoundingClientRect().top - pane.getBoundingClientRect().top;
  });
  await expect(page.locator('.section-button[aria-current="step"]')).toHaveText('3');
  await page.locator('.site-header').getByRole('link', { name: 'Atlas', exact: true }).click();
  await page.locator('[data-story="my-hometown"]').press('Enter');
  await page.getByRole('button', { name: /Continue reading.*Section 3/ }).click();
  await expect(page.locator('.section-button[aria-current="step"]')).toHaveText('3');
  await expect(page.locator('[data-section-heading="2"]')).toBeInViewport();
  await expect(page.locator('.hometown-map')).toHaveAttribute('data-scene', 'lines');
  await expect(page.getByTestId('progress-count')).toHaveText('0 / 9');
  await expect(page.locator('.finish-chapter')).toBeDisabled();

  await page.locator('.site-header').getByRole('button', { name: '中文', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: '第 3 节', exact: true })).toHaveAttribute('aria-current', 'step');
  for (const number of [4, 5]) {
    await page.getByRole('button', { name: `第 ${number} 节`, exact: true }).click();
  }
  await page.locator('.reader-scroll').evaluate(pane => { pane.scrollTop = pane.scrollHeight; });
  await page.locator('.finish-chapter').click();
  await expect(page.getByTestId('progress-count')).toHaveText('1 / 9');
});

test.describe('Continue reading on a phone', () => {
  test.use({ viewport: { width: 844, height: 390 }, hasTouch: true });

  test('reopen from the homepage in Chinese, rotate, switch to English and reset', async ({ page, context }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /Skip prologue/ }).tap();
    await page.locator('.site-header').getByRole('button', { name: '中文', exact: true }).tap();
    await page.getByRole('button', { name: '第 4 节', exact: true }).tap();
    await expect(page.locator('.section-button[aria-current="step"]')).toHaveText('4');
    const reopened = await context.newPage();
    observeErrors(reopened, page.testErrors);
    await page.close();
    await reopened.goto('./');
    const resume = reopened.getByRole('button', { name: /继续阅读.*第 4 节/ });
    await expect(resume).toBeInViewport();
    await resume.tap();
    const activeSection = reopened.locator('.section-button[aria-current="step"]');
    await expect(activeSection).toHaveText('4');
    await expect(reopened.locator('[data-section-heading="3"]')).toBeInViewport();
    await expect(reopened.locator('.hometown-map')).toHaveAttribute('data-scene', 'borderlands');

    await reopened.setViewportSize({ width: 390, height: 844 });
    await expect(reopened.locator('.rotate-gate')).toBeVisible();
    await reopened.reload();
    await expect(reopened.locator('.reading-section')).toHaveCount(5);
    await reopened.setViewportSize({ width: 844, height: 390 });
    await expect(reopened.locator('.rotate-gate')).not.toBeVisible();
    await expect(activeSection).toHaveText('4');
    await expect(reopened.locator('[data-section-heading="3"]')).toBeInViewport();
    await reopened.locator('.site-header').getByRole('button', { name: 'EN', exact: true }).tap();
    await expect(reopened.getByRole('button', { name: 'Section 4', exact: true })).toHaveAttribute('aria-current', 'step');
    await reopened.locator('.site-wordmark').tap();
    await reopened.getByRole('button', { name: /Continue reading.*Section 4/ }).tap();
    await expect(activeSection).toHaveText('4');
    await reopened.getByRole('button', { name: 'Section 5', exact: true }).tap();
    await reopened.locator('.reader-scroll').evaluate(pane => { pane.scrollTop = pane.scrollHeight; });
    await expect(reopened.locator('.finish-chapter')).toBeDisabled();
    await expect(reopened.getByTestId('progress-count')).toHaveText('0 / 9');
    await reopened.locator('.site-header').getByRole('link', { name: /My seals/ }).tap();
    await reopened.getByRole('button', { name: 'Reset journey' }).tap();
    await reopened.getByRole('button', { name: 'Reset progress', exact: true }).tap();
    await reopened.getByRole('button', { name: /Skip prologue/ }).tap();
    await expect(activeSection).toHaveText('1');
    await expect(reopened.locator('[data-section-heading="0"]')).toBeInViewport();
  });
});
