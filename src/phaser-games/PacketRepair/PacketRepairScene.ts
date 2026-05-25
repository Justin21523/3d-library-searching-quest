import Phaser from 'phaser';

export class PacketRepairScene extends Phaser.Scene {
  private gridSize = 5;
  private tileSize = 80;
  private nodes: Phaser.GameObjects.Arc[] = [];
  private sequence: number[] = [];
  private currentStep = 0;
  private resultCallback?: (success: boolean) => void;

  constructor() {
    super({ key: 'PacketRepairScene' });
  }

  init(data: { onComplete: (success: boolean) => void }) {
    this.resultCallback = data.onComplete;
  }

  create() {
    const width = this.gridSize * this.tileSize;
    const height = this.gridSize * this.tileSize;
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 繪製網格背景
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333355);
    for (let i = 0; i <= this.gridSize; i++) {
      graphics.moveTo(i * this.tileSize, 0);
      graphics.lineTo(i * this.tileSize, height);
      graphics.moveTo(0, i * this.tileSize);
      graphics.lineTo(width, i * this.tileSize);
    }
    graphics.strokePath();

    // 生成節點
    this.nodes = [];
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const node = this.add.circle(
          x * this.tileSize + this.tileSize / 2,
          y * this.tileSize + this.tileSize / 2,
          10,
          0x6666ff
        );
        node.setInteractive();
        node.setData('gridX', x);
        node.setData('gridY', y);
        this.nodes.push(node);
      }
    }

    // 隨機選一條路徑（序列），要求玩家依序點擊
    this.sequence = this.generateSequence();
    this.currentStep = 0;
    this.highlightNode(this.sequence[0]);

    // 提示文字
    this.add.text(width / 2, height + 20, 'Repair the circuit: Click the glowing nodes in order', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // 事件綁定
    this.nodes.forEach((node, index) => {
      node.on('pointerdown', () => {
        if (index === this.sequence[this.currentStep]) {
          this.currentStep++;
          if (this.currentStep >= this.sequence.length) {
            this.resultCallback?.(true);
            this.scene.stop();
          } else {
            this.highlightNode(this.sequence[this.currentStep]);
          }
        } else {
          this.resultCallback?.(false);
          this.scene.stop();
        }
      });
    });
  }
  
  generateSequence(): number[] {
    const totalNodes = this.gridSize * this.gridSize;
    const seq: number[] = [];
    const count = Phaser.Math.Between(4, 7);
    const used = new Set<number>();
    while (seq.length < count) {
      const rand = Phaser.Math.Between(0, totalNodes - 1);
      if (!used.has(rand)) {
        used.add(rand);
        seq.push(rand);
      }
    }
    return seq;
  }

  highlightNode(index: number) {
    this.nodes.forEach((n, i) => {
      if (i === index) {
        n.setFillStyle(0x00ffcc);
        n.setScale(1.5);
      } else {
        n.setFillStyle(0x6666ff);
        n.setScale(1);
      }
    });
  }

  update() {
    // 點擊處理在 create 用事件
  }

  // 在 create 中設定節點點擊事件
  // 但我們需要在 create 裡加事件
  // 修改 create：加入事件監聽
  // 這裡用箭頭函數
  initEvents() {
    this.nodes.forEach((node, index) => {
      node.on('pointerdown', () => {
        if (index === this.sequence[this.currentStep]) {
          this.currentStep++;
          if (this.currentStep >= this.sequence.length) {
            // 成功
            this.resultCallback?.(true);
            this.scene.stop();
          } else {
            this.highlightNode(this.sequence[this.currentStep]);
          }
        } else {
          // 錯誤：重置或失敗？我們設計為失敗直接結束
          this.resultCallback?.(false);
          this.scene.stop();
        }
      });
    });
  }

  // 覆蓋 create 以呼叫 initEvents
  // 實際寫在 create 尾端
}

// 重新定義 create 包含 initEvents
// 方便起見，直接整合