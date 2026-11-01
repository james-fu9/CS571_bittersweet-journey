# Verification record — November 1, 2026

Application source build: `1c12e2df299a7e2e215f584293968a16bc17ca4b`.

- [Public repository](https://github.com/james-fu9/CS571_bittersweet-journey): visibility verified as public, owner `james-fu9`.
- [Published React application](https://james-fu9.github.io/CS571_bittersweet-journey/): anonymous HTTP success; deployed index matched the locally built production index byte-for-byte.
- [Successful application deployment](https://github.com/james-fu9/CS571_bittersweet-journey/actions/runs/41328132467): npm ci, lint, state tests, build and Pages deployment succeeded on Node 24.

## Checks performed

| Check | Result |
| --- | --- |
| `npm run lint` | 0 errors, 0 warnings |
| `npm test` | 14/14 passed |
| `npm run build` | Passed |
| `npm audit` | 0 vulnerabilities |
| Local production-build Playwright suite | 21/21 passed, Chromium/Firefox/WebKit |
| Live GitHub Pages Playwright suite | 21/21 passed, Chromium/Firefox/WebKit, 33.4 seconds |
| axe WCAG A/AA checks | 0 violations on tested intro/reader/atlas/seals routes |
| Visual inspection | Desktop and 844×390 landscape screenshots reviewed |
| Original data comparison | Introductory text and both shared map datasets exactly match the source objects |
| StrictMode lifecycle audit | Five atlas remount cycles; constant observer/listener counts, zero observers after final unmount |

The browser suite includes all six opening scenes, both languages, the real five-section reader, 1/9 completion, unique seals after revisit/reload, all nine chapter routes, locked ending, reset confirmation, malformed/blocked localStorage, pan/zoom, all keyboard pins, actual pointer travel, optional audio playback/decoding, WebGL fallback, portrait guidance, and mobile section/language continuity. No application exceptions, console errors or failed HTTP resources remained in the final runs.

## Issues resolved during verification

- CLI workflow scope was unavailable: created the workflow using the existing authenticated GitHub web editor, without changing account permissions.
- Patched the lint dependency tree's minimatch advisory; audit now reports zero vulnerabilities.
- Removed nested main landmarks and corrected visible/accessibility label mismatches.
- Fixed the mobile sound button's accessible name and failed-audio retry behavior.
- Made the portrait gate remove covered controls from keyboard/screen-reader interaction.
- Fixed heading-based mobile section tracking so section three and language changes keep the correct map scene.
- Added a readable SVG fallback on WebGL context loss.
- Reserved space between landscape location details and zoom controls.
- Isolated Firefox application-metadata directories for the macOS 27 / Firefox 157 launch issue; no existing profiles or OS security settings were changed.

Test harness refinements distinguish intentional browser cancellations from failures: the normal-motion test clicks an observed pulsing pin center, avoids interrupting a lazy CSS load with an immediate duplicate reload, and recognizes Firefox's media-only `NS_ERROR_PARSED_DATA_CACHED` channel cancellation. Actual audio time advancement and a null media error are independently asserted. Mozilla documents that cancellation in [ChannelMediaResource::CloseChannel](https://github.com/mozilla-firefox/firefox/blob/main/dom/media/ChannelMediaResource.cpp).

## Scope and remaining work

Only My Hometown is a migrated complete reader. Eight remaining chapters and the five-scene final ending are planned, explicitly labeled, and cannot generate false progress. See README and READER_MIGRATION.md.

Vite reports one nonblocking bundle-size advisory for the original shared geography (~2.21 MB uncompressed, ~0.83 MB gzip). The full geography is retained intentionally and loaded by the lazy reader/atlas routes. There are no deployment blockers. Verification covers the listed scenarios and tested browser versions; it is not a guarantee against every possible device or future change.
