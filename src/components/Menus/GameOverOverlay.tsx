import { useGameStore } from '../../store/useGameStore';

export default function GameOverOverlay() {
  const gameOver = useGameStore((s) => s.gameOver);
  const resetGame = useGameStore((s) => s.resetGame);

  if (!gameOver) return null;

  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
      <h1 className="text-5xl font-bold text-red-600 mb-4">YOU WERE CAUGHT</h1>
      <p className="text-gray-300 mb-8 text-lg">The Librarian has found you.</p>
      <button
        onClick={resetGame}
        className="px-6 py-3 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xl transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}