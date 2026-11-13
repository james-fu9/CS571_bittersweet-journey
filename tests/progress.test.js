import test from 'node:test';
import assert from 'node:assert/strict';
import { chapters } from '../src/data/chapters.js';
import {
  STORAGE_KEY,
  createDefaultProgress,
  sanitizeProgress,
  withChapterSection,
  withHometownSection,
  completeChapter,
  loadProgress,
  saveProgress,
  creditsUnlocked,
} from '../src/state/progress.js';

const chapterIds = [
  'my-hometown', 'dujiangyan', 'taoist-tower', 'mogao-caves',
  'secret-spring', 'yangguan', 'kashgar', 'chengde', 'fish-tail-lodge',
];

function memoryStorage(initialValue = null) {
  let value = initialValue;
  return {
    getItem(key) {
      assert.equal(key, STORAGE_KEY);
      return value;
    },
    setItem(key, nextValue) {
      assert.equal(key, STORAGE_KEY);
      value = nextValue;
    },
  };
}

test('all nine readers have explicit section counts and original chapter identities', () => {
  assert.deepEqual(chapters.map(chapter => chapter.id), chapterIds);
  assert.ok(chapters.every(chapter => chapter.implemented));
  assert.equal(chapters[0].sectionCount, 5);
  assert.ok(chapters.slice(1).every(chapter => chapter.sectionCount === 3));
  assert.equal(chapters.find(chapter => chapter.id === 'chengde').folder, 'mountain-resort');
});

test('a new journey has empty, independent progress for every chapter', () => {
  assert.equal(STORAGE_KEY, 'bittersweet-journey:v1');
  const first = createDefaultProgress();
  assert.equal(first.version, 1);
  assert.equal(first.onboardingComplete, false);
  assert.deepEqual(first.completedChapterIds, []);
  assert.equal(first.lastVisitedLocation, null);
  assert.equal(first.hometownSection, null);
  assert.deepEqual(first.hometownVisitedSections, []);
  assert.equal(creditsUnlocked(first), false);
  for (const id of chapterIds) {
    assert.deepEqual(first.chapterReading[id], { section: null, visitedSections: [] });
  }
  first.completedChapterIds.push('my-hometown');
  first.chapterReading['my-hometown'].visitedSections.push(0);
  assert.deepEqual(first.hometownVisitedSections, []);
  assert.deepEqual(first.chapterReading.dujiangyan.visitedSections, []);
  assert.deepEqual(createDefaultProgress().completedChapterIds, []);
  assert.deepEqual(createDefaultProgress().chapterReading['my-hometown'].visitedSections, []);
});

test('unsupported versions and non-object storage recover to a fresh journey', () => {
  for (const invalid of [null, undefined, 12, true, 'journey', [], {},
    { version: 0 }, { version: 2 }, { version: '1' }]) {
    assert.deepEqual(sanitizeProgress(invalid), createDefaultProgress());
  }
});

test('sanitization keeps valid completions and language while deduplicating seals', () => {
  const result = sanitizeProgress({
    version: 1,
    language: 'zh',
    onboardingComplete: true,
    completedChapterIds: ['my-hometown', 'my-hometown', 'dujiangyan', 'unknown', null, 3],
    lastVisitedLocation: 'chengde',
  });
  assert.equal(result.language, 'zh');
  assert.deepEqual(result.completedChapterIds, ['my-hometown', 'dujiangyan']);
  assert.equal(result.onboardingComplete, true);
  assert.equal(result.lastVisitedLocation, 'chengde');
  assert.equal(creditsUnlocked(result), false);
});

test('an onboarding flag requires the introductory chapter and a literal boolean', () => {
  for (const completedChapterIds of [[], ['dujiangyan'], 'my-hometown', null]) {
    const result = sanitizeProgress({
      version: 1, language: 'en', onboardingComplete: true, completedChapterIds,
    });
    assert.equal(result.onboardingComplete, false);
  }
  for (const onboardingComplete of [false, 'true', 1, null, undefined]) {
    assert.equal(sanitizeProgress({
      version: 1, onboardingComplete, completedChapterIds: ['my-hometown'],
    }).onboardingComplete, false);
  }
});

test('invalid preferences fall back and atlas IDs use the original registry mapping', () => {
  for (const invalid of ['fr', '', null, 42]) {
    const result = sanitizeProgress({
      version: 1, language: invalid, lastVisitedLocation: 'mountain-resort',
    });
    assert.equal(result.language, 'en');
    assert.equal(result.lastVisitedLocation, null);
  }
  for (const id of chapterIds) {
    assert.equal(sanitizeProgress({
      ...createDefaultProgress(), lastVisitedLocation: id,
    }).lastVisitedLocation, id);
  }
});

test('finishing each valid chapter immutably earns one seal and unlocks only at nine', () => {
  let progress = createDefaultProgress();
  for (const [index, id] of chapterIds.entries()) {
    const previous = progress;
    progress = completeChapter(previous, id);
    assert.notEqual(progress, previous);
    assert.equal(previous.completedChapterIds.length, index);
    assert.equal(progress.completedChapterIds.length, index + 1);
    assert.equal(progress.onboardingComplete, true);
    assert.equal(progress.lastVisitedLocation, id);
    assert.equal(creditsUnlocked(progress), index === 8);
    assert.deepEqual(completeChapter(progress, id).completedChapterIds, progress.completedChapterIds);
  }
});

test('unknown IDs and folder aliases cannot earn a seal', () => {
  for (const id of ['mountain-resort', 'unknown', '', null, '__proto__', 'constructor']) {
    const progress = completeChapter(createDefaultProgress(), 'my-hometown');
    assert.deepEqual(completeChapter(progress, id), progress);
  }
});

test('missing or corrupted JSON and malformed structures do not crash loading', () => {
  for (const raw of [null, '', '{broken', 'null', '[]', 'false', '"text"',
    '{"version":2,"completedChapterIds":["my-hometown"]}']) {
    assert.deepEqual(loadProgress(memoryStorage(raw)), createDefaultProgress());
  }
});

test('blocked storage preserves in-memory bookmarks and fails safely', () => {
  const blocked = {
    getItem() { throw new Error('Storage is blocked'); },
    setItem() { throw new Error('Quota exceeded'); },
  };
  assert.deepEqual(loadProgress(blocked), createDefaultProgress());
  const progress = withChapterSection(createDefaultProgress(), 'dujiangyan', 2);
  assert.equal(saveProgress(blocked, progress), false);
  assert.deepEqual(progress.chapterReading.dujiangyan, { section: 2, visitedSections: [2] });
  assert.equal(saveProgress(null, progress), false);
});

test('all nine completed chapters and Chinese preference survive storage', () => {
  const storage = memoryStorage();
  const progress = chapterIds.reduce(completeChapter, {
    ...createDefaultProgress(), language: 'zh',
  });
  assert.equal(saveProgress(storage, progress), true);
  assert.deepEqual(loadProgress(storage), progress);
  assert.equal(creditsUnlocked(loadProgress(storage)), true);
});

test('ending unlock counts only distinct valid completions in supported storage', () => {
  const completed = { ...createDefaultProgress(), completedChapterIds: chapterIds };
  assert.equal(creditsUnlocked(completed), true);
  assert.equal(creditsUnlocked({ ...completed, completedChapterIds: [...chapterIds, 'unknown'] }), true);
  assert.equal(creditsUnlocked({ ...completed, completedChapterIds: chapterIds.slice(0, 8) }), false);
  assert.equal(creditsUnlocked({ ...completed, completedChapterIds: Array(9).fill('my-hometown') }), false);
  assert.equal(creditsUnlocked({
    ...completed, completedChapterIds: [...chapterIds.slice(0, 8), 'unknown'],
  }), false);
  for (const invalid of [null, {}, { ...completed, version: 2 }]) {
    assert.equal(creditsUnlocked(invalid), false);
  }
});

test('early v1 saves keep progress with empty bookmarks for the new readers', () => {
  const legacy = {
    version: 1, language: 'zh', onboardingComplete: true,
    completedChapterIds: ['my-hometown'], lastVisitedLocation: 'chengde',
  };
  assert.deepEqual(loadProgress(memoryStorage(JSON.stringify(legacy))), {
    ...createDefaultProgress(), ...legacy,
  });
});

test('legacy hometown bookmarks migrate to the per-chapter shape', () => {
  const legacy = {
    version: 1, language: 'zh', hometownSection: 2,
    hometownVisitedSections: [0, 1, 2, 2, -1, '3', 5],
  };
  const progress = loadProgress(memoryStorage(JSON.stringify(legacy)));
  assert.deepEqual(progress.chapterReading['my-hometown'], { section: 2, visitedSections: [0, 1, 2] });
  assert.equal(progress.hometownSection, 2);
  assert.deepEqual(progress.hometownVisitedSections, [0, 1, 2]);
  assert.notEqual(progress.hometownVisitedSections, progress.chapterReading['my-hometown'].visitedSections);
  assert.deepEqual(progress.completedChapterIds, []);
});

test('canonical hometown data wins when both saved shapes exist', () => {
  const progress = sanitizeProgress({
    version: 1, hometownSection: 4, hometownVisitedSections: [0, 1, 2, 3, 4],
    chapterReading: { 'my-hometown': { section: 1, visitedSections: [0, 1] } },
  });
  assert.equal(progress.hometownSection, 1);
  assert.deepEqual(progress.hometownVisitedSections, [0, 1]);
  const cleared = sanitizeProgress({
    ...progress, chapterReading: { 'my-hometown': { section: null, visitedSections: [] } },
  });
  assert.equal(cleared.hometownSection, null);
  assert.deepEqual(cleared.hometownVisitedSections, []);
});

test('both bookmark APIs synchronize the hometown compatibility fields', () => {
  let progress = withHometownSection(createDefaultProgress(), 2);
  assert.deepEqual(progress.chapterReading['my-hometown'], { section: 2, visitedSections: [2] });
  progress = withChapterSection(progress, 'my-hometown', 4);
  assert.equal(progress.hometownSection, 4);
  assert.deepEqual(progress.hometownVisitedSections, [2, 4]);
  progress = withHometownSection(progress, 2);
  assert.equal(progress.chapterReading['my-hometown'].section, 2);
  assert.deepEqual(progress.chapterReading['my-hometown'].visitedSections, [2, 4]);
  assert.equal(withHometownSection(progress, 2), progress);
});

test('every section boundary is stored, unique, and independent across chapters', () => {
  const storage = memoryStorage();
  let progress = createDefaultProgress();
  for (const chapter of chapters) {
    for (let index = 0; index < chapter.sectionCount; index += 1) {
      progress = withChapterSection(progress, chapter.id, index);
      assert.equal(saveProgress(storage, progress), true);
      progress = loadProgress(storage);
      assert.equal(progress.chapterReading[chapter.id].section, index);
      assert.equal(withChapterSection(progress, chapter.id, index), progress);
    }
    assert.deepEqual(progress.chapterReading[chapter.id].visitedSections,
      Array.from({ length: chapter.sectionCount }, (_, index) => index));
  }
  assert.deepEqual(progress.completedChapterIds, []);
  assert.equal(progress.onboardingComplete, false);
  assert.equal(creditsUnlocked(progress), false);
});

test('unknown chapter bookmarks are dropped and invalid section updates are ignored', () => {
  const progress = withChapterSection(createDefaultProgress(), 'dujiangyan', 1);
  const stored = sanitizeProgress({
    ...progress,
    chapterReading: { ...progress.chapterReading, unknown: { section: 1, visitedSections: [0, 1] } },
  });
  assert.deepEqual(Object.keys(stored.chapterReading), chapterIds);
  for (const id of ['unknown', 'mountain-resort', '', null, '__proto__']) {
    assert.equal(withChapterSection(progress, id, 0), progress);
  }
  for (const index of [null, undefined, -1, 3, 4, 1.5, '2', true, [], {}, NaN, Infinity]) {
    assert.equal(withChapterSection(progress, 'dujiangyan', index), progress);
  }
  assert.equal(withHometownSection(progress, 5), progress);
  assert.equal(withHometownSection(progress, 4).hometownSection, 4);
});

test('malformed per-chapter records sanitize with each chapter’s section count', () => {
  for (const invalid of [null, undefined, true, 3, '0,1,2', [], {}]) {
    const progress = sanitizeProgress({ version: 1, chapterReading: { dujiangyan: invalid } });
    assert.deepEqual(progress.chapterReading.dujiangyan, { section: null, visitedSections: [] });
  }
  const progress = sanitizeProgress({
    version: 1,
    chapterReading: {
      dujiangyan: { section: 4, visitedSections: ['0', 0, 0, 1, 2, 3, 4, 2.5, -1, null, false] },
      'my-hometown': { section: 4, visitedSections: [0, 2, 3, 4, 5] },
    },
  });
  assert.deepEqual(progress.chapterReading.dujiangyan, { section: null, visitedSections: [0, 1, 2] });
  assert.deepEqual(progress.chapterReading['my-hometown'], { section: 4, visitedSections: [0, 2, 3, 4] });
  assert.deepEqual(progress.hometownVisitedSections, [0, 2, 3, 4]);
});

test('separate reading sessions keep visited sections without awarding completion early', () => {
  const storage = memoryStorage();
  let first = withChapterSection(createDefaultProgress(), 'kashgar', 0);
  first = withChapterSection(first, 'kashgar', 1);
  saveProgress(storage, first);
  let second = loadProgress(storage);
  assert.equal(second.chapterReading.kashgar.section, 1);
  second = withChapterSection(second, 'kashgar', 2);
  assert.deepEqual(second.chapterReading.kashgar.visitedSections, [0, 1, 2]);
  assert.deepEqual(second.completedChapterIds, []);
  assert.deepEqual(completeChapter(second, 'kashgar').completedChapterIds, ['kashgar']);
});

test('bookmark updates preserve prior snapshots and reset creates independent empty records', () => {
  const previous = withHometownSection(createDefaultProgress(), 1);
  Object.freeze(previous.chapterReading['my-hometown'].visitedSections);
  Object.freeze(previous.hometownVisitedSections);
  Object.freeze(previous.chapterReading['my-hometown']);
  Object.freeze(previous.chapterReading);
  Object.freeze(previous);
  const next = withHometownSection(previous, 2);
  assert.deepEqual(previous.chapterReading['my-hometown'].visitedSections, [1]);
  assert.deepEqual(next.chapterReading['my-hometown'].visitedSections, [1, 2]);
  const reset = createDefaultProgress();
  assert.equal(reset.hometownSection, null);
  assert.deepEqual(reset.hometownVisitedSections, []);
  for (const id of chapterIds) {
    assert.deepEqual(reset.chapterReading[id], { section: null, visitedSections: [] });
    assert.notEqual(reset.chapterReading[id], next.chapterReading[id]);
    assert.notEqual(reset.chapterReading[id].visitedSections, next.chapterReading[id].visitedSections);
  }
});
