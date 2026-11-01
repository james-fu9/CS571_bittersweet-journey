import { useSyncExternalStore } from 'react';
const query = '(pointer: coarse) and (orientation: portrait) and (max-width: 900px)';
const subscribe = callback => {
  const media = window.matchMedia(query);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};
export function usePortraitGate() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
