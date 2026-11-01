import { defineConfig, devices } from '@playwright/test';
import { mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// macOS 27 / Firefox 157 needs isolated app metadata paths (Playwright #42768).
// These are test-only temporary directories; existing browser profiles are untouched.
let firefoxLaunchOptions = {};
if (process.platform === 'darwin') {
  const metadataRoot = mkdtempSync(join(tmpdir(), 'cs571-firefox-'));
  const app = join(metadataRoot, 'app');
  const local = join(metadataRoot, 'local');
  mkdirSync(app); mkdirSync(local);
  firefoxLaunchOptions = { env: { ...process.env, MOZ_APP_DATA: app, MOZ_LOCAL_APP_DATA: local } };
}

const remote = process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  timeout: 45000,
  expect: { timeout: 10000 },
  workers: 3,
  reporter: [['list']],
  use: {
    baseURL: remote || 'http://127.0.0.1:4173/CS571_bittersweet-journey/',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 }, launchOptions: firefoxLaunchOptions } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: remote ? undefined : {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/CS571_bittersweet-journey/',
    reuseExistingServer: !process.env.CI,
  },
});
