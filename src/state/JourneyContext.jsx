import { useCallback, useEffect, useMemo, useState } from 'react';
import { JourneyContext } from './context.js';
import { completeChapter, createDefaultProgress, creditsUnlocked, loadProgress, sanitizeProgress, saveProgress, STORAGE_KEY } from './progress.js';

function getStorage() {
  try { return window.localStorage; } catch { return null; }
}

export function JourneyProvider({ children }) {
  const [progress, setProgress] = useState(() => loadProgress(getStorage()));
  const [storageAvailable, setStorageAvailable] = useState(() => getStorage() !== null);
  useEffect(() => {
    const saved = saveProgress(getStorage(), progress);
    // Report an actual failed write (private modes can expose storage but reject writes).
    queueMicrotask(() => setStorageAvailable(saved));
  }, [progress]);
  useEffect(() => {
    function receive(event) {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      const fresh = loadProgress(getStorage());
      setProgress(previous => JSON.stringify(previous) === JSON.stringify(fresh) ? previous : fresh);
    }
    window.addEventListener('storage', receive);
    return () => window.removeEventListener('storage', receive);
  }, []);
  const setLanguage = useCallback(language => {
    if (language === 'en' || language === 'zh') setProgress(previous => ({ ...previous, language }));
  }, []);
  const visitChapter = useCallback(id => setProgress(previous => sanitizeProgress({ ...previous, lastVisitedLocation: id })), []);
  const finishChapter = useCallback(id => setProgress(previous => completeChapter(previous, id)), []);
  const resetProgress = useCallback(() => {
    setProgress(previous => ({ ...createDefaultProgress(), language: previous.language }));
    try { sessionStorage.removeItem('bittersweet-journey:atlas-camera:v1'); } catch { /* Progress still resets without storage. */ }
  }, []);
  const value = useMemo(() => ({ ...progress, storageAvailable, setLanguage, visitChapter, finishChapter, resetProgress, creditsUnlocked: creditsUnlocked(progress) }),
    [progress, storageAvailable, setLanguage, visitChapter, finishChapter, resetProgress]);
  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}
