# Readers and saved progress

All nine locations are open. My Hometown contains the five-section bilingual chapter. The other eight locations each have three sections of original bilingual project writing, a location map, reading prompts and cited background sources.

## Components

- `Onboarding` presents the opening scenes and a Continue reading entry.
- `ChapterReader` displays My Hometown and its paragraph-driven geography.
- `GuideReader` renders the other eight guides with `GuideMap`.
- `GuideMap` uses Natural Earth land outlines and the chapter's geographic anchor. Section changes move between overview and closer scales. Its controls allow zoom and reset.
- `EndingPage` presents five original concluding scenes after nine seals are collected.

React Context owns language, navigation and completion. Effects clean up map listeners, animation frames, observers and WebGL resources.

## Reading and completion

Every chapter saves its current section and visited sections in this browser. Returning restores the section heading. Switching language keeps the same section. Older v1 My Hometown bookmarks remain compatible.

A seal requires visiting every section, reaching the end and choosing Collect seal. Completion saves immediately before its animation, so leaving the reader cannot cancel the award. Repeated visits keep one seal per chapter.

Reset clears all bookmarks and seals while retaining language. Blocked storage keeps the interface usable for the current visit. My seals links to the ending after nine unique completions.

The eight project guides are original contextual writing. Their linked sources support the historical and geographic background. Credits are in [ATTRIBUTION.md](../ATTRIBUTION.md).
