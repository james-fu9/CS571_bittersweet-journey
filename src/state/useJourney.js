import { useContext } from 'react';
import { JourneyContext } from './context.js';

export function useJourney() {
  const journey = useContext(JourneyContext);
  if (!journey) throw new Error('useJourney must be used within JourneyProvider.');
  return journey;
}
