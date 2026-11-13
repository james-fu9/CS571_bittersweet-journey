import { chapters } from '../data/chapters.js';

export const STORAGE_KEY = 'bittersweet-journey:v1';
const knownIds = new Set(chapters.map(chapter => chapter.id));
const implementedIds = new Set(chapters.filter(chapter => chapter.implemented).map(chapter => chapter.id));
const sectionCounts = new Map(chapters.map(chapter => [chapter.id, chapter.sectionCount]));

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isChapterSection(id, index) {
  return Number.isInteger(index) && index >= 0 && index < sectionCounts.get(id);
}

function sanitizeReading(id, input) {
  const reading = isObject(input) ? input : {};
  return {
    section: isChapterSection(id, reading.section) ? reading.section : null,
    visitedSections: Array.isArray(reading.visitedSections)
      ? [...new Set(reading.visitedSections.filter(index => isChapterSection(id, index)))]
      : [],
  };
}

export function createDefaultProgress() {
  return {
    version: 1,
    language: 'en',
    onboardingComplete: false,
    completedChapterIds: [],
    lastVisitedLocation: null,
    chapterReading: Object.fromEntries(chapters.map(chapter => [chapter.id, {
      section: null,
      visitedSections: [],
    }])),
    hometownSection: null,
    hometownVisitedSections: [],
  };
}

export function sanitizeProgress(input) {
  if (!isObject(input) || input.version !== 1) return createDefaultProgress();
  const completedChapterIds = Array.isArray(input.completedChapterIds)
    ? [...new Set(input.completedChapterIds.filter(id => implementedIds.has(id)))] : [];
  const storedReading = isObject(input.chapterReading) ? input.chapterReading : {};
  const chapterReading = Object.fromEntries(chapters.map(chapter => {
    // A stored per-chapter entry is authoritative. Older v1 saves only have the
    // two hometown fields, so migrate those when the new entry is absent.
    const legacy = chapter.id === 'my-hometown' ? {
      section: input.hometownSection,
      visitedSections: input.hometownVisitedSections,
    } : null;
    const reading = Object.hasOwn(storedReading, chapter.id) ? storedReading[chapter.id] : legacy;
    return [chapter.id, sanitizeReading(chapter.id, reading)];
  }));
  const hometown = chapterReading['my-hometown'];
  return {
    version: 1,
    language: input.language === 'zh' ? 'zh' : 'en',
    completedChapterIds,
    onboardingComplete: input.onboardingComplete === true && completedChapterIds.includes('my-hometown'),
    lastVisitedLocation: knownIds.has(input.lastVisitedLocation) ? input.lastVisitedLocation : null,
    chapterReading,
    hometownSection: hometown.section,
    hometownVisitedSections: [...hometown.visitedSections],
  };
}

export function withChapterSection(progress, id, index) {
  if (!isChapterSection(id, index)) return progress;
  const clean = sanitizeProgress(progress);
  const previous = clean.chapterReading[id];
  const alreadyVisited = previous.visitedSections.includes(index);
  if (alreadyVisited && previous.section === index && JSON.stringify(clean) === JSON.stringify(progress)) return progress;
  const reading = {
    section: index,
    visitedSections: alreadyVisited ? previous.visitedSections : [...previous.visitedSections, index],
  };
  const next = {
    ...clean,
    chapterReading: { ...clean.chapterReading, [id]: reading },
  };
  if (id === 'my-hometown') {
    next.hometownSection = reading.section;
    next.hometownVisitedSections = [...reading.visitedSections];
  }
  return next;
}

export function withHometownSection(progress, index) {
  return withChapterSection(progress, 'my-hometown', index);
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
  return sanitizeProgress(progress).completedChapterIds.length === chapters.length;
}
