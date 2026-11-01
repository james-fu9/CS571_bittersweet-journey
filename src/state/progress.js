import { chapters } from '../data/chapters.js';

export const STORAGE_KEY = 'bittersweet-journey:v1';
const knownIds = new Set(chapters.map(chapter => chapter.id));
const implementedIds = new Set(chapters.filter(chapter => chapter.implemented).map(chapter => chapter.id));

export function createDefaultProgress() {
  return { version: 1, language: 'en', onboardingComplete: false, completedChapterIds: [], lastVisitedLocation: null };
}

export function sanitizeProgress(input) {
  const fallback = createDefaultProgress();
  if (!input || typeof input !== 'object' || Array.isArray(input) || input.version !== 1) return fallback;
  const completedChapterIds = Array.isArray(input.completedChapterIds)
    ? [...new Set(input.completedChapterIds.filter(id => implementedIds.has(id)))] : [];
  return {
    ...fallback,
    language: input.language === 'zh' ? 'zh' : 'en',
    completedChapterIds,
    onboardingComplete: input.onboardingComplete === true && completedChapterIds.includes('my-hometown'),
    lastVisitedLocation: knownIds.has(input.lastVisitedLocation) ? input.lastVisitedLocation : null,
  };
}

export function completeChapter(progress, id) {
  const clean = sanitizeProgress(progress);
  if (!implementedIds.has(id)) return clean;
  return {
    ...clean,
    completedChapterIds: [...new Set([...clean.completedChapterIds, id])],
    onboardingComplete: id === 'my-hometown' || clean.onboardingComplete,
    lastVisitedLocation: id,
  };
}

export function loadProgress(storage) {
  try { return sanitizeProgress(JSON.parse(storage.getItem(STORAGE_KEY))); }
  catch { return createDefaultProgress(); }
}

export function saveProgress(storage, progress) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(sanitizeProgress(progress))); return true; }
  catch { return false; }
}

export function creditsUnlocked(progress) {
  const completed = new Set(Array.isArray(progress?.completedChapterIds) ? progress.completedChapterIds : []);
  return chapters.every(chapter => completed.has(chapter.id));
}
