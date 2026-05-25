import { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

export default function DebugPanel() {
  const [visible, setVisible] = useState(false);

  const godMode = useGameStore((s) => s.godMode);
  const setGodMode = useGameStore((s) => s.setGodMode);
  const gameOver = useGameStore((s) => s.gameOver);
  const setGameOver = useGameStore((s) => s.setGameOver);
  const resetGame = useGameStore((s) => s.resetGame);
  const fragmentsCollected = useGameStore((s) => s.fragmentsCollected);
  const totalFragments = useGameStore((s) => s.totalFragments);
  const flashlightBattery = useGameStore((s) => s.flashlightBattery);
  const terminalsRepaired = useGameStore((s) => s.terminalsRepaired);
  const inErrorZone = useGameStore((s) => s.inErrorZone);
  const enemy = useGameStore((s) => s.enemy);

  // 按下 ` (backtick) 鍵切換 debug panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Backquote') setVisible((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!visible) {
    return (
      <div className="absolute bottom-4 right-4 text-white/30 text-xs font-mono select-none pointer-events-none">
        ` → DEBUG
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 w-64 bg-black/85 border border-green-500/40 text-green-400 font-mono text-xs rounded-lg p-3 z-50 space-y-2">
      <div className="flex justify-between items-center border-b border-green-500/30 pb-1 mb-2">
        <span className="text-green-300 font-bold text-sm">[ DEBUG PANEL ]</span>
        <button
          onClick={() => setVisible(false)}
          className="text-green-600 hover:text-green-300"
        >
          ✕
        </button>
      </div>

      {/* God Mode 開關 */}
      <div className="flex items-center justify-between">
        <span>God Mode</span>
        <button
          onClick={() => setGodMode(!godMode)}
          className={`px-3 py-0.5 rounded text-xs font-bold transition-colors ${
            godMode
              ? 'bg-green-500 text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {godMode ? 'ON ✓' : 'OFF'}
        </button>
      </div>

      {/* 遊戲狀態 */}
      <div className="border-t border-green-500/20 pt-2 space-y-1">
        <div className="text-green-600 uppercase text-xs mb-1">狀態</div>
        <div className="flex justify-between">
          <span className="text-green-600">GameOver</span>
          <span className={gameOver ? 'text-red-400' : 'text-green-400'}>{gameOver ? 'TRUE' : 'false'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-600">ErrorZone</span>
          <span className={inErrorZone ? 'text-yellow-400' : 'text-green-400'}>{inErrorZone ? 'TRUE' : 'false'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-600">Battery</span>
          <span>{Math.round(flashlightBattery)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-600">Fragments</span>
          <span>{fragmentsCollected} / {totalFragments}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-600">Terminals</span>
          <span>{terminalsRepaired}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-600">Enemy</span>
          <span className={enemy.state === 'chase' ? 'text-red-400' : 'text-green-400'}>{enemy.state}</span>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="border-t border-green-500/20 pt-2 space-y-1">
        <div className="text-green-600 uppercase text-xs mb-1">快捷操作</div>
        <button
          onClick={resetGame}
          className="w-full text-left px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-yellow-400"
        >
          重置遊戲
        </button>
        {gameOver && (
          <button
            onClick={() => setGameOver(false)}
            className="w-full text-left px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-cyan-400"
          >
            強制解除 GameOver
          </button>
        )}
      </div>

      <div className="text-green-800 text-xs pt-1">按 ` 關閉</div>
    </div>
  );
}
