import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PacketRepairScene } from '../phaser-games/PacketRepair/PacketRepairScene';

interface PhaserGameContainerProps {
  onComplete: (success: boolean) => void;
}

export default function PhaserGameContainer({ onComplete }: PhaserGameContainerProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 500,
      height: 520,
      parent: containerRef.current,
      backgroundColor: '#1a1a2e',
      scene: [PacketRepairScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // 啟動場景時傳遞 callback
    game.events.once('ready', () => {
      game.scene.start('PacketRepairScene', { onComplete });
    });

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // 如果 onComplete 改變，我們需要更新場景中的 callback，但 scene 可能還沒建立，
  // 簡單處理：在 onComplete 變化時更新場景內資料。
  useEffect(() => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('PacketRepairScene') as PacketRepairScene;
      if (scene) {
        // 更新 scene 的 resultCallback
        (scene as any).resultCallback = onComplete;
      }
    }
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center bg-black/90 z-40"
    />
  );
}