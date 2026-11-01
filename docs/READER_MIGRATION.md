# Reader migration

Only **My Hometown** is implemented as a React chapter reader in this milestone. The other eight locations remain visible in the atlas and route to their unavailable-state screens. The complete ending remains planned and cannot be unlocked through unavailable chapters.

## Components and ownership

- `Onboarding({ language, onLanguageChange, onBegin })` owns the six original prologue scenes, book selection animation, previous/continue/skip controls, and optional autoplay. `onBegin` enters the My Hometown route. Reduced motion skips the book animation.
- `ChapterReader({ language, completed, onComplete, onBack })` renders the bilingual five-section text, section navigation, paragraph-driven geography, source notes, and the completion animation. `onComplete` is called after the user visits all five sections, reaches the end, and chooses to collect the seal. The application owns persistent completion state, deduplication, language and routing; the reader does not write storage.
- `GeographicScene({ language, scene, prologue })` mounts the original SVG geography and optional WebGL globe in a React-owned container. It shares the unchanged physical/river datasets with the atlas, adds wheel/pointer/button controls, and updates map labels and accessible descriptions with the selected language.
- `mountGlobe(stage, worldLand)` returns `{ set(scene, language), destroy() }`. It retains the original globe shader and coastline texture, with the original SVG coastline fallback when WebGL is unavailable or a GPU context is lost. A restored GPU keeps the readable fallback for the current visit; revisiting creates fresh resources.
- `src/data/hometown.js` contains only the authorized chapter selection. The original EPUB files and full-book corpora are not part of this project.

Effects release timers, animation frames, pointer/wheel/visibility listeners, ResizeObservers and WebGL resources on unmount. Original CSS is scoped to `.hometown-experience`; the components do not mutate global body classes or legacy storage keys. Hash-based application routes support direct navigation and page refresh on GitHub Pages. App progress persists across refreshes; the current paragraph/scroll offset is intentionally session-local.

## Retained experience

The opening preserves the six-scene sequence, original bilingual lines, book cover/page-turn design, and physical map. The reader retains all five original bilingual sections, the rotating globe, the original land/terrain/water geometry, and the Yellow River, Yangtze, Pearl River, rainfall contour and Great Wall layers. Reading and section changes select the geographic scenes. This implementation uses direct camera updates rather than the original paragraph-interpolated camera animation. Autoplay is optional, so readers can advance at their own pace.

The text and map remain side by side on desktop and compact landscape screens. The application provides its mobile portrait orientation prompt. Completion is explicit; opening a route or visiting an unavailable chapter never awards a seal.

## Next reader milestone

Suggested next sources, pending chapter-specific implementation and verification:

- [ ] `dujiangyan`: reuse its original chapter text, terrain and water-system interactions.
- [ ] `taoist-tower`: retain its world-map/history interactions and provenance.
- [ ] `mogao-caves`: integrate its original terrain and cave-related scenes.
- [ ] `secret-spring`: preserve its terrain, rainfall and spring interactions.
- [ ] `yangguan`: preserve the original pass/desert map and chapter scenes.

For each chapter, extract an authorized chapter-only data module, preserve its original visual engine through an adapter with cleanup, reuse the reader shell/section controls, add a verified completion action, and then change its registry status from unavailable. Test both languages, refresh, repeated visits, mobile landscape, and one-time seal collection before declaring it implemented. `kashgar`, `mountain-resort` (atlas ID `chengde`) and `fish-tail-lodge` remain later work. All nine verified completions are required before implementing the final illuminated atlas and five-scene ending.

## Attribution and observed checks

CS571 project authors: **Yanbing Chen and Ganrong(James) Fu**. Source implementation: [esstherc/bittersweet-journey](https://github.com/esstherc/bittersweet-journey). My Hometown: Yu Qiuyu; English translation: CN Times Books team. Geographic data includes Natural Earth, WorldClim 2.1 BIO12 (1970–2000 average), and © OpenStreetMap contributors under ODbL. User permission to reuse the project and chapter text was explicitly confirmed for this migration; no blanket open-source license is inferred from the public source repository.

Observed local Chromium checks covered the six-scene reduced-motion flow, normal book transition, five sections, map zoom, language switching, repeated navigation, end-of-chapter completion, and 844×390 landscape without horizontal overflow. No page errors appeared in those checks. An explicit `WEBGL_lose_context` test confirmed that losing and restoring the GPU context keeps the SVG fallback visible and the reader usable. Reader, book-choice and final prologue-map screens each passed the scoped axe scan after accessibility fixes. These checks do not establish that every browser/device combination is error-free; repository-level test results and live deployment status are documented separately.
