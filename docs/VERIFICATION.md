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

## Recorded results — November 1, 2026

For application build `1c12e2df299a7e2e215f584293968a16bc17ca4b`:

- Lint and production build passed; dependency audit reported 0 vulnerabilities.
- 14 unit tests and 21 browser tests passed locally; 21 browser tests also passed on GitHub Pages across Chromium, Firefox and WebKit.
- Tested routes had no application exceptions, console errors, failed HTTP resources or axe accessibility violations.
- [Deployment succeeded](https://github.com/james-fu9/CS571_bittersweet-journey/actions/runs/41328132467).

Coverage includes onboarding, bilingual reading, map controls, chapter routes, saved progress, unique seals, reset, storage failures, mobile layouts, audio and WebGL fallback.

## Current limits

My Hometown is complete; eight additional readers and the final ending are in development. Vite reports a nonblocking size advisory for the shared geography dataset (about 2.21 MB, or 0.83 MB gzip). Results cover the tested scenarios and browser versions.
