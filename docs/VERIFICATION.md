# Testing

## Run checks

```sh
npm run lint
npm test
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
```

To test the published site:

```sh
PLAYWRIGHT_BASE_URL=https://james-fu9.github.io/CS571_bittersweet-journey/ npm run test:e2e
```

## Recorded results — November 13, 2026

- Lint, 21 unit tests and the production build passed.
- 36 production-build browser tests passed across Chromium, Firefox and WebKit.
- Coverage includes all nine readers, bilingual guide content, per-chapter bookmarks, the 9/9 ending unlock and all five ending scenes.
- A regression check confirms Collect seal saves completion before the animation, even if the reader leaves immediately.
- Other checks cover onboarding, map controls, reset, storage failures, mobile layouts, audio, WebGL fallback and accessibility.

## Current limits

My Hometown includes its authorized chapter text. Eight other chapters contain original project guides with source links and location maps. Vite reports a nonblocking size advisory for the shared geography dataset (about 2.21 MB, or 0.83 MB gzip). Results cover the tested scenarios and browser versions.
