# Attribution and asset provenance

## Original work

- Source: https://github.com/esstherc/bittersweet-journey/tree/5e54637a490e28b41151c587d6752add62f445ea
- Original hosted experience: https://yanbingchen.site/bittersweet-journey/
- Story map: Yanbing Chen and Eugenie Huang, UW Cartography Lab, UW–Madison.
- My Hometown / 我的山河: Yu Qiuyu. English translation: CN Times Books team.
- Original source has no tracked general-purpose license. This repository does not confer an MIT license or blanket permission for downstream reuse. The project owner confirmed permission to publicly reuse the code, assets and this introductory text for the CS571 migration on November 1, 2026.

## Source-to-migration inventory

| Original path | Migrated use |
| --- | --- |
| `site/index.html` map SVG | `src/features/atlas/atlas-template.svg` |
| `site/scripts/atlas-camera.js` | `src/features/atlas/mountCamera.js` |
| `site/scripts/atlas-journey.js` | `src/features/atlas/mountJourney.js` |
| `site/scripts/atlas.js` label layout | `src/features/atlas/mountLabels.js` |
| `site/styles/atlas*.css` | Scoped atlas CSS |
| `site/data/atlas-physical.js`, `real-geography.js` | Shared atlas JSON retaining source fields |
| `site/chapters/my-hometown/index.html`, `app.js`, `styles.css` | React prologue/reader, SVG scenes and scoped original CSS |
| `site/chapters/my-hometown/globe.js` | WebGL globe adapter with cleanup/fallback |
| `site/chapters/my-hometown/chapter-data.js` | `src/data/hometown.js`, this chapter only |
| `site/data/world-land.js`, `worldclim-400mm.js`, `great-wall.js` | Reader JSON retaining source fields |
| Nine `site/chapters/*/assets/seal-*.svg` | `public/assets/atlas/seals/` |
| `site/assets/atlas-paper.svg`, `paper-grain.svg` | Atlas paper textures |
| `site/assets/sound/intro-bgm.mp3`, `mainmap-bgm.mp3` | Optional opt-in `public/assets/audio/` tracks |

Source EPUBs, full corpora, posters, unrelated chapter texts and analytics scripts are excluded. Original SVG/Canvas visual algorithms are adapted with scoped DOM and explicit React effect cleanup; no old-site iframe is used.

## Geographic sources

- [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/): public-domain physical vectors, land, rivers, lakes and regions. Original atlas projection: spherical Albers, standard parallels 25°/47°, central meridian 105°.
- [OpenStreetMap](https://www.openstreetmap.org/copyright): © OpenStreetMap contributors, ODbL. The original Great Wall geometry includes relation 318110; the packaged source metadata records the snapshot.
- [WorldClim 2.1](https://www.worldclim.org/data/worldclim21.html): BIO12 annual precipitation, 1970–2000, 10 arc-minute source resolution. The original derived 400 mm contour is a long-term climatic reference, not a fixed annual border.
- Copernicus DEM GLO-90: © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, distributed by the European Union/ESA. Original relief/hachures retain the source's geographic coverage and limitations.
- Original provenance details: [physical atlas](https://github.com/esstherc/bittersweet-journey/blob/5e54637a490e28b41151c587d6752add62f445ea/docs/atlas-physical.md) and [My Hometown](https://github.com/esstherc/bittersweet-journey/tree/5e54637a490e28b41151c587d6752add62f445ea/docs/chapters/my-hometown).

Coordinates are regional reading anchors, not survey locations. My Hometown uses an intentional literary point between rivers. Physical maps are interpretive reading aids and do not provide navigation.

## Fonts and dependencies

Caudex and Ysabeau were retrieved from the official Google Fonts distribution. Their SIL Open Font License texts are included beside the local font files. React, React DOM, React Router, Vite, Playwright, axe and ESLint retain their respective package licenses; `package-lock.json` records exact installed versions. The minimatch override uses the patched 11.0.1+ release for the lint dependency tree.
