import { useGameStore } from '../../store/useGameStore';
import { Archive } from 'lucide-react';

export default function FragmentCounter() {
  const collected = useGameStore((s) => s.fragmentsCollected);
  const total = useGameStore((s) => s.totalFragments);

  return (
    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
      <Archive className="w-5 h-5 text-cyan-400" />
      <span className="font-mono text-sm">
        {collected} / {total}
      </span>
    </div>
  );
}