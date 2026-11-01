import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEY,
  createDefaultProgress,
  sanitizeProgress,
  completeChapter,
  loadProgress,
  saveProgress,
  creditsUnlocked,
} from '../src/state/progress.js';

// Acceptance specification: storage is untrusted, and only shipped readers
// may earn seals. The pure ending predicate still models the final nine-stop journey.
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

test('a new journey has independent, versioned, incomplete progress', () => {
  assert.equal(STORAGE_KEY, 'bittersweet-journey:v1');
  const first = createDefaultProgress();
  assert.equal(first.version, 1);
  assert.ok(['en', 'zh'].includes(first.language));
  assert.equal(first.onboardingComplete, false);
  assert.deepEqual(first.completedChapterIds, []);
  assert.equal(first.lastVisitedLocation, null);
  assert.equal(creditsUnlocked(first), false);
  first.completedChapterIds.push('my-hometown');
  assert.deepEqual(createDefaultProgress().completedChapterIds, []);
});

test('unsupported versions and non-object storage recover to a fresh journey', () => {
  for (const invalid of [null, undefined, 12, true, 'journey', [], {},
    { version: 0 }, { version: 2 }, { version: '1' }]) {
    assert.deepEqual(sanitizeProgress(invalid), createDefaultProgress());
  }
});

test('sanitization keeps Chinese, removes invalid completions, and deduplicates seals', () => {
  const result = sanitizeProgress({
    version: 1,
    language: 'zh',
    onboardingComplete: true,
    completedChapterIds: ['my-hometown', 'my-hometown', 'dujiangyan', 'unknown', null, 3],
    lastVisitedLocation: 'chengde',
  });
  assert.equal(result.language, 'zh');
  assert.deepEqual(result.completedChapterIds, ['my-hometown']);
  assert.equal(result.onboardingComplete, true);
  assert.equal(result.lastVisitedLocation, 'chengde');
  assert.equal(result.completedChapterIds.length, 1);
  assert.equal(creditsUnlocked(result), false);
});

test('an onboarding flag cannot skip the introduction without its completed chapter', () => {
  for (const completedChapterIds of [[], ['dujiangyan'], 'my-hometown', null]) {
    const result = sanitizeProgress({
      version: 1, language: 'en', onboardingComplete: true, completedChapterIds,
    });
    assert.equal(result.onboardingComplete, false);
    assert.deepEqual(result.completedChapterIds, []);
  }
});

test('onboarding state requires a literal stored boolean', () => {
  for (const onboardingComplete of [false, 'true', 1, null, undefined]) {
    const result = sanitizeProgress({
      version: 1, language: 'en', onboardingComplete,
      completedChapterIds: ['my-hometown'],
    });
    assert.equal(result.onboardingComplete, false);
  }
});

test('invalid preference values fall back and atlas IDs use the real registry mapping', () => {
  for (const invalid of ['fr', '', null, 42]) {
    const result = sanitizeProgress({
      version: 1, language: invalid, lastVisitedLocation: 'mountain-resort',
      completedChapterIds: [], onboardingComplete: false,
    });
    assert.equal(result.language, createDefaultProgress().language);
    assert.equal(result.lastVisitedLocation, null);
  }
  for (const id of chapterIds) {
    assert.equal(sanitizeProgress({
      ...createDefaultProgress(), lastVisitedLocation: id,
    }).lastVisitedLocation, id);
  }
});

test('completing My Hometown immutably earns exactly one seal and finishes onboarding', () => {
  const original = Object.freeze({
    ...createDefaultProgress(), language: 'zh', completedChapterIds: Object.freeze([]),
  });
  const completed = completeChapter(original, 'my-hometown');
  assert.notEqual(completed, original);
  assert.deepEqual(original.completedChapterIds, []);
  assert.deepEqual(completed.completedChapterIds, ['my-hometown']);
  assert.equal(completed.onboardingComplete, true);
  assert.equal(completed.language, 'zh');
  assert.equal(completed.completedChapterIds.length, 1);
  assert.equal(creditsUnlocked(completed), false);
});

test('revisiting a completed chapter cannot duplicate its seal', () => {
  let result = completeChapter(createDefaultProgress(), 'my-hometown');
  for (let visit = 0; visit < 12; visit += 1) {
    result = completeChapter(result, 'my-hometown');
  }
  assert.deepEqual(result.completedChapterIds, ['my-hometown']);
  assert.equal(result.onboardingComplete, true);
});

test('unavailable and unknown chapters cannot award progress', () => {
  for (const id of [...chapterIds.slice(1), 'mountain-resort', 'unknown', '', null]) {
    const fresh = createDefaultProgress();
    assert.deepEqual(completeChapter(fresh, id), fresh);
    const completed = completeChapter(fresh, 'my-hometown');
    assert.deepEqual(completeChapter(completed, id), completed);
  }
});

test('missing or corrupted JSON and malformed stored structures do not crash loading', () => {
  for (const raw of [null, '', '{broken', 'null', '[]', 'false', '"text"',
    '{"version":2,"completedChapterIds":["my-hometown"]}']) {
    assert.deepEqual(loadProgress(memoryStorage(raw)), createDefaultProgress());
  }
});

test('blocked storage reads and writes degrade without throwing', () => {
  const blocked = {
    getItem() { throw new Error('Storage is blocked'); },
    setItem() { throw new Error('Quota exceeded'); },
  };
  assert.deepEqual(loadProgress(blocked), createDefaultProgress());
  assert.equal(saveProgress(blocked, createDefaultProgress()), false);
});

test('a persisted Chinese journey restores exactly 1/9 and its selected location', () => {
  const storage = memoryStorage();
  const state = completeChapter({
    ...createDefaultProgress(), language: 'zh', lastVisitedLocation: 'my-hometown',
  }, 'my-hometown');
  assert.equal(saveProgress(storage, state), true);
  const restored = loadProgress(storage);
  assert.deepEqual(restored, state);
  assert.equal(restored.language, 'zh');
  assert.equal(restored.onboardingComplete, true);
  assert.equal(restored.completedChapterIds.length, 1);
  assert.equal(creditsUnlocked(restored), false);
});

test('ending unlock needs all nine distinct, known chapter IDs', () => {
  assert.equal(creditsUnlocked({ ...createDefaultProgress(), completedChapterIds: chapterIds }), true);
  assert.equal(creditsUnlocked({ ...createDefaultProgress(), completedChapterIds: chapterIds.slice(0, 8) }), false);
  assert.equal(creditsUnlocked({ ...createDefaultProgress(), completedChapterIds: Array(9).fill('my-hometown') }), false);
  assert.equal(creditsUnlocked({
    ...createDefaultProgress(), completedChapterIds: [...chapterIds.slice(0, 8), 'unknown'],
  }), false);
});

test('injected nine-chapter storage cannot unlock unimplemented readers in this milestone', () => {
  const restored = loadProgress(memoryStorage(JSON.stringify({
    ...createDefaultProgress(), onboardingComplete: true, completedChapterIds: chapterIds,
  })));
  assert.deepEqual(restored.completedChapterIds, ['my-hometown']);
  assert.equal(creditsUnlocked(restored), false);
});
