import { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';

export default function NarrativeOverlay() {
  const narrative = useGameStore((s) => s.narrative);
  const setNarrative = useGameStore((s) => s.setNarrative);

  useEffect(() => {
    if (narrative) {
      const timer = setTimeout(() => setNarrative(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [narrative, setNarrative]);

  if (!narrative) return null;

  return (
    <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 bg-black/70 text-green-400 p-4 rounded-lg font-mono text-sm max-w-md text-center animate-pulse">
      {narrative}
    </div>
  );
}