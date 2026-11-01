# Bittersweet Journey · 山河显影

A bilingual literary atlas for CS571: Building User Interfaces, Fall 2026 at UW–Madison. Follow the landscapes in Yu Qiuyu’s *A Bittersweet Journey Through Culture*, read in English or Chinese, and collect a seal when a chapter is complete.

**Code Repository:** https://github.com/james-fu9/CS571_bittersweet-journey

**Published Website:** https://james-fu9.github.io/CS571_bittersweet-journey/

This is an independent React migration of [the original group project by Yanbing Chen and Eugenie Huang](https://github.com/esstherc/bittersweet-journey), based on source commit `5e54637a490e28b41151c587d6752add62f445ea`. It runs its own local assets and rendering engines; it does not embed or redirect to the original hosted website.

## Current milestone

- Six-scene opening, bilingual book selection, page-turn animation, optional autoplay, explicit next/back/skip controls, and reduced-motion support.
- Complete **My Hometown / 我的山河** reader: five original sections, original Chinese and English text, paragraph-driven geographic scenes, interactive terrain, rivers, precipitation boundary, Great Wall, and WebGL globe with SVG fallback.
- Original SVG physical atlas, original Albers projection and terrain data, clustered chapter-label layout, Canvas lantern and traveler, drag/pinch/wheel/button/keyboard camera controls, all nine locations, and completed-location illumination.
- React-managed language, routing, chapter completion, seals, reset confirmation, and browser-local progress. Completing My Hometown awards exactly one seal; revisiting cannot duplicate it.
- All nine chapter routes exist. **The other eight full readers are not yet migrated** and show an intentional next-milestone screen. They cannot award seals. The final five-scene ending is planned and remains locked.
- Desktop and mobile landscape layouts, localized portrait rotation guidance, optional original background music, keyboard controls, and local fonts.

The map rendering internals remain imperative adapters to preserve the original work. The application shell, onboarding, reader UI, selection panels, state, and navigation are React components. This is an incremental migration, not a claim that all original chapter experiences are finished.

## Technology and course alignment

Vite, React 19, JavaScript/JSX, React Router in declarative mode, CSS, SVG, Canvas and WebGL. Functional components, props/callbacks, immutable state, `useState`, `useEffect`, `useRef`, Context, localStorage, and `HashRouter` follow the course’s Web Development lectures. [Course alignment](docs/COURSE_ALIGNMENT.md) records the lecture pages. No backend, authentication, API keys, map SDK, tile service, or paid hosting is required.

## Run locally

Use Node.js 24 LTS or a compatible newer version.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite, with `/CS571_bittersweet-journey/` appended. The application uses a hash route, for example `/CS571_bittersweet-journey/#/atlas`.

```sh
npm run lint
npm test
npm run build
npm run preview
```

The production build goes into `dist/`; source and assets are tracked, while generated builds and test artifacts are ignored.

## Browser tests

```sh
npx playwright install chromium firefox webkit
npm run build
npm run test:e2e
```

On macOS, the test configuration creates isolated temporary Firefox application-metadata directories to avoid the Firefox 157 / macOS 27 launch issue (Playwright #42768); it does not change your browser profiles or security settings.

Tests exercise the real production build under the repository subpath, full first-visit completion, all nine routes, saved/unique progress, unavailable chapters, Chinese persistence, corrupt/blocked storage, reset, camera gestures, keyboard pins, repeated route changes, desktop/mobile layouts, image loading, and axe accessibility scans. Runtime exceptions, console errors and failing HTTP responses fail the tests. Run one browser with `npm run test:e2e -- --project=chromium`.

To test the published application:

```sh
PLAYWRIGHT_BASE_URL=https://james-fu9.github.io/CS571_bittersweet-journey/ npm run test:e2e -- --project=chromium
```

These tests establish the listed scenarios, not a guarantee that every possible device or interaction has been tested.

## Deployment

GitHub Pages is configured to use GitHub Actions. Every push to `main` runs `npm ci`, ESLint, state tests and the Vite production build, then uploads `dist/` and deploys it. See [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

`vite.config.js` sets the exact repository base path. HashRouter keeps deep-route refreshes safe on static hosting. Public assets use Vite’s base path; original CSS URLs are rewritten by Vite during the build. Fonts and optional audio are local, and the geography is bundled for offline rendering after load. The large shared geography chunk is the original terrain dataset, loaded by the atlas/reader routes.

For changes, test locally, commit and push to `main`, then verify the successful Actions run and live URL. Updating a workflow through GitHub CLI requires `workflow` permission; ordinary source changes use the existing repository permission. The initial workflow was added through the authenticated GitHub web editor.

## Structure

```text
src/app/                  React shell, lazy routes and recovery screens
src/components/           Shared language, sound, error and orientation UI
src/state/                Context and validated, versioned persistence
src/data/                 Nine-chapter registry and authorized intro text
src/features/onboarding/  React prologue and book selection
src/features/reader/      Shared reader, source geography and globe adapters
src/features/atlas/       Original map, camera, labels, lantern and cleanup
src/features/seals/       Collection and reset interface
public/assets/            Only required artwork, seals, fonts and audio
```

The atlas contract is `mountAtlas(container) → { update, select, travelTo, destroy }`. `AtlasPage` accepts `{ language, completedChapterIds, onSelectChapter }`. The reader accepts `{ language, completed, onComplete, onBack }`. The shell resolves atlas IDs through the chapter registry; **`chengde` maps to `mountain-resort`**. My Hometown deliberately uses a literary map anchor, not a fabricated longitude/latitude.

Progress uses `bittersweet-journey:v1`. Only implemented chapter IDs are accepted, duplicates are removed, and invalid storage falls back safely. Old per-chapter keys from the original website are not imported: they do not prove completion in this migration. Current progress stays local to this browser; there is no account or cloud sync. Disabled browser storage produces a clear notice while in-session reading remains available.

## Next milestone: four to five additional readers

1. Migrate Dujiangyan, The Taoist Priest’s Tower, Mogao Caves, and A Secret Spring in the Sand; add Snow on the Southern Pass if scope allows.
2. Keep each chapter’s original text, translation, geography and provenance together; copy only its necessary authorized assets.
3. Share reader navigation, section/progress UI and completion callbacks, while giving specialized terrain/visuals their own effect-owned adapters.
4. Verify each bilingual reader, map lifecycle and completion flow before changing its registry `implemented` flag. Add progress and browser coverage for each new chapter.
5. After the remaining Kashgar, The Villa from Behind and Fish Tail Lodge readers are complete, implement and test the illuminated atlas and five-scene ending with exactly nine unique completions. Do not add a production completion override.

## Attribution and reuse

Original literary text: **Yu Qiuyu**. English translation: **CN Times Books team**. Original story map and interactive artwork: **Yanbing Chen and Eugenie Huang, UW Cartography Lab, UW–Madison**. React migration maintained in this CS571 repository.

The project owner confirmed permission on November 1, 2026 to publicly reuse the original code, assets and My Hometown text for this migration. The original repository has no blanket open-source license; no MIT or other umbrella license is asserted here. Literary text, translation, artwork and audio retain their respective owners’ rights. Original EPUB files and the full bilingual corpus are **not** included.

Geographic data retain their original metadata and attribution: Natural Earth public-domain vectors; © OpenStreetMap contributors under ODbL; Copernicus DEM © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, distributed by EU/ESA; WorldClim 2.1 BIO12 annual precipitation (1970–2000). Fonts Caudex and Ysabeau are distributed under the SIL Open Font License, with notices in `public/assets/fonts/`. See [ATTRIBUTION.md](ATTRIBUTION.md).
