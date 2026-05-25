import { useEffect, useCallback, useState } from 'react';
import ArchiveWorld from './scenes/ArchiveWorld';
import BatteryIndicator from './components/HUD/BatteryIndicator';
import FragmentCounter from './components/HUD/FragmentCounter';
import GameOverOverlay from './components/Menus/GameOverOverlay';
import DebugPanel from './components/DebugPanel';
import PhaserGameContainer from './phaser-games/PhaserGameContainer';
import DocumentViewer from './components/HUD/DocumentViewer';
import NarrativeOverlay from './components/HUD/NarrativeOverlay';
import { useGameStore } from './store/useGameStore';
import { useKeyboard } from './hooks/useKeyboard';

function App() {
  const keys = useKeyboard();
  const toggleFlashlight = useGameStore((s) => s.toggleFlashlight);
  const terminalActive = useGameStore((s) => s.terminalActive);
  const showMinigame = useGameStore((s) => s.showMinigame);
  const startMinigame = useGameStore((s) => s.startMinigame);
  const endMinigame = useGameStore((s) => s.endMinigame);
  const fragmentsCollected = useGameStore((s) => s.fragmentsCollected);
  const totalFragments = useGameStore((s) => s.totalFragments);
  const gameOver = useGameStore((s) => s.gameOver);
  const victory = useGameStore((s) => s.victory);
  const [canvasKey] = useState(0);
  
  //手電筒切換
  useEffect(() => {
    if (keys['KeyF']) {
      toggleFlashlight();
    }
  }, [keys['KeyF'], toggleFlashlight]);
  
  // 終端機互動（需收集全部碎片）
  useEffect(() => {
    if (keys['KeyE'] && terminalActive && !showMinigame && fragmentsCollected >= totalFragments) {
      startMinigame();
    }
  }, [keys['KeyE'], terminalActive, showMinigame, fragmentsCollected, totalFragments, startMinigame]);
  
  // ESC 離開小遊戲
  useEffect(() => {
    if (keys['Escape'] && showMinigame) {
      endMinigame(false);
    }
  }, [keys['Escape'], showMinigame, endMinigame]);

  // 小遊戲結束回調
  const handleMinigameComplete = useCallback(
    (success: boolean) => {
      endMinigame(success);
    },
    [endMinigame]
  );

  // 游標與 pointer lock 控制
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    if (showMinigame || gameOver || victory) {
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
    } else {
      // 自動嘗試鎖定（需由使用者手勢觸發，瀏覽器可能阻擋）
      // 我們新增一個事件來處理點擊鎖定
      const handleClick = () => {
        canvas.requestPointerLock();
      };
      canvas.addEventListener('click', handleClick);
      return () => canvas.removeEventListener('click', handleClick);
    }
  }, [showMinigame, gameOver, victory]);
  

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-black">
      <ArchiveWorld key={canvasKey} />
      <BatteryIndicator />
      <FragmentCounter />
      <DocumentViewer />
      <NarrativeOverlay />
      <GameOverOverlay />
      <DebugPanel />
      {showMinigame && <PhaserGameContainer onComplete={handleMinigameComplete} />}
      
      {terminalActive && !showMinigame && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-sm animate-pulse">
          {fragmentsCollected < totalFragments
            ? `Collect all fragments (${fragmentsCollected}/${totalFragments})`
            : 'Press E to access terminal'}
        </div>
      )}
      <div className="absolute bottom-4 left-4 text-white/50 text-sm font-mono">
        WASD: Move | Mouse: Look | Shift: Run | Ctrl: Crouch | Space: Jump | F: Flashlight
      </div>
    </div>
  );
}

export default App;

