# Bittersweet Journey implementation and acceptance plan

**Goal:** Publish an independent React application from `Publish` to the public `james-fu9/CS571_bittersweet-journey` repository and GitHub Pages.

**Architecture:** React functional JSX components, props, Hooks and Context own navigation, language, progress and reading state. HashRouter supports refresh on static hosting. Effect-owned adapters preserve original SVG/Canvas/WebGL renderers and clean up their resources. Use original source commit `5e54637a490e28b41151c587d6752add62f445ea`.

**Constraints:** Preserve nine locations and the original atlas. Only My Hometown can complete at this milestone. No fake completion, redirects or remote iframes. No EPUB/corpus publication. User confirmed public reuse of original code, assets and My Hometown text on November 1, 2026; this is not a general open-source license.

- [x] Publish Vite/React foundation with GitHub Actions and correct repository base path.
- [x] Implement versioned, validated Context/localStorage progress with unique completion and blocked-storage fallback; verify with `npm test`.
- [x] Migrate original onboarding, bilingual My Hometown reader and interactive geography through React components.
- [x] Adapt original physical atlas, clustered labels, lantern/traveler, keyboard/pointer controls and progress illumination; clean up listeners, observers and animation frames.
- [x] Add nine chapter routes, honest unavailable screens, seals, reset confirmation and locked ending.
- [x] Run `npm run lint`, `npm test`, `npm run build`, dependency audit and desktop/mobile Playwright user-journey tests.
- [x] Verify public repository, successful Actions deployment, real live route refresh, assets, console/network errors and saved progress.
- [x] Document attribution, current limitations, maintenance and migration checklist for the next 4–5 chapters.

## Acceptance scenarios

Fresh visit → onboarding → bilingual reader → visit all five sections → explicit completion → atlas shows 1/9. Reload and revisit retain one seal. All nine locations select correctly; unfinished readers cannot award seals. Language survives refresh. Corrupt or unavailable storage cannot crash the app. Map drag, wheel/pinch/buttons and keyboard work after repeated route changes under StrictMode. Deep hashes load on Pages. Coarse-pointer portrait presents a localized rotate prompt and landscape restores the page. The final ending remains locked.
