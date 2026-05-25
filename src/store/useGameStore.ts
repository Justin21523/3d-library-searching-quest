import { create } from 'zustand';

interface FragmentData {
  id: number;
  position: [number, number, number];
  collected: boolean;
}

interface EnemyState {
  position: [number, number, number];
  targetPosition: [number, number, number]; // 目前移動目標
  state: 'patrol' | 'chase' | 'search' | 'return';
}

interface GameState {
  debugMode: boolean;
  toggleDebug: () => void;
  flashlightBattery: number;
  isFlashlightOn: boolean;
  toggleFlashlight: () => void;
  consumeBattery: (amount: number) => void;
  rechargeBattery: (amount: number) => void;
  fragments: FragmentData[];
  fragmentsCollected: number;
  totalFragments: number;
  collectFragment: (id: number) => void;
  gameOver: boolean;
  victory: boolean;
  setVictory: (value: boolean) => void;
  setGameOver: (value: boolean) => void;
  resetGame: () => void;
  // 敵人狀態（暫時簡單）
  enemy: EnemyState;
  setEnemyState: (state: Partial<EnemyState>) => void;
  // 玩家初始位置
  playerStartPosition: [number, number, number];
  // terminal
  terminalActive: boolean;
  setTerminalActive: (active: boolean) => void;
  showMinigame: boolean;
  startMinigame: () => void;
  endMinigame: (success: boolean) => void;
  terminalsRepaired: number;
  totalTerminals: number;
  documents: { id: number; title: string; content: string }[];
  addDocument: (doc: { id: number; title: string; content: string }) => void;
  inErrorZone: boolean;
  setInErrorZone: (val: boolean) => void;
  godMode: boolean;
  setGodMode: (val: boolean) => void;
  narrative: string | null;
  setNarrative: (text: string | null) => void;
}

const initialFragments: FragmentData[] = [
  { id: 1, position: [5, 1.2, 4], collected: false },
  { id: 2, position: [-4, 1.2, -5], collected: false },
  { id: 3, position: [6, 1.2, -6], collected: false },
];

const initialEnemy: EnemyState = {
  position: [-5, 1.5, 5],
  targetPosition: [-5, 1.5, 5],
  state: 'patrol',
};

export const useGameStore = create<GameState>((set) => ({
  debugMode: false,
  toggleDebug: () => set((s) => ({ debugMode: !s.debugMode })),
  flashlightBattery: 100,
  isFlashlightOn: false,
  toggleFlashlight: () =>
    set((s) => {
      if (s.flashlightBattery <= 0 && !s.isFlashlightOn) return s;
      return { isFlashlightOn: !s.isFlashlightOn };
    }),
  consumeBattery: (amount) =>
    set((s) => ({
      flashlightBattery: Math.max(0, s.flashlightBattery - amount),
      isFlashlightOn: s.flashlightBattery - amount <= 0 ? false : s.isFlashlightOn,
    })),
  rechargeBattery: (amount) =>
    set((s) => ({
      flashlightBattery: Math.min(100, s.flashlightBattery + amount),
    })),
  fragments: initialFragments,
  fragmentsCollected: 0,
  totalFragments: 3,
  collectFragment: (id) =>
    set((s) => {
      const fragment = s.fragments.find((f) => f.id === id);
      if (!fragment || fragment.collected) return s;
      return {
        fragments: s.fragments.map((f) =>
          f.id === id ? { ...f, collected: true } : f
        ),
        fragmentsCollected: s.fragmentsCollected + 1,
      };
    }),
  gameOver: false,
  victory: false,
  setGameOver: (value) => set({ gameOver: value }),
  setVictory: (value ) => set({ victory: value }),
  resetGame: () =>
    set({
      flashlightBattery: 100,
      isFlashlightOn: false,
      fragments: initialFragments.map((f) => ({ ...f, collected: false })),
      fragmentsCollected: 0,
      gameOver: false,
      victory: false,
      enemy: { ...initialEnemy },
      terminalsRepaired: 0,
      showMinigame: false,
      terminalActive: false,
      inErrorZone: false,
    }),
  enemy: initialEnemy,
  setEnemyState: (partial) =>
    set((s) => ({ enemy: { ...s.enemy, ...partial } })),
  playerStartPosition: [0, 0, 0],
  terminalActive: false,
  setTerminalActive: (active) => set({ terminalActive: active }),
  showMinigame: false,
  startMinigame: () => set({ showMinigame: true }),
  endMinigame: (success) =>
    set((s) => ({
      showMinigame: false,
      terminalsRepaired: success ? s.terminalsRepaired + 1 : s.terminalsRepaired,
    })),
  terminalsRepaired: 0,
  totalTerminals: 1,
  documents: [],
  addDocument: (doc) => set((s) => ({ documents: [...s.documents, doc] })),
  inErrorZone: false,
  setInErrorZone: (val) => set({ inErrorZone: val }),
  godMode: true,
  setGodMode: (val) => set({ godMode: val }),
  narrative: null,
  setNarrative: (text) => set({ narrative: text }),
}));