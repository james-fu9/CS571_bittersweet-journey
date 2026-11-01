# Reader design

My Hometown is the current complete reader. The other eight chapters show an in-development screen and do not award seals.

## Components

- `Onboarding` presents six opening scenes, book selection and next/back/skip controls.
- `ChapterReader` displays five bilingual sections, section navigation, geographic scenes and source notes.
- `GeographicScene` renders the SVG map and WebGL globe. SVG remains available when WebGL fails.
- `src/data/hometown.js` holds the chapter text. Full-book files are not included.

React owns language, navigation and completion state. Effects clean up map listeners, timers, animation frames, observers and WebGL resources. Styles are scoped to the reader.

## Reading and progress

Text and maps appear side by side on desktop and mobile landscape screens. Section changes update the map. Readers earn one seal after visiting all five sections, reaching the end and choosing to complete the chapter. Repeated visits cannot add duplicate seals.

Language and completed chapters persist in localStorage; scroll position lasts only for the current visit. Direct chapter links and refreshes work through HashRouter.

## Adding a chapter

Add its authorized text and required assets, build its geographic scenes, and connect it to the shared reader and completion state. Verify both languages, navigation, mobile layout and one-time seal collection before marking it available in `src/data/chapters.js`.

See [project plan](IMPLEMENTATION_PLAN.md), [credits](../ATTRIBUTION.md) and [testing](VERIFICATION.md).
