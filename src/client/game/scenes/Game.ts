import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { ZombiePiece, ZombieType } from '../entities/ZombiePiece';
import { GameGrid } from '../entities/GameGrid';
import { ZombieSpawner } from '../systems/ZombieSpawner';

export class Game extends Scene {
  // Core game systems
  private gameGrid: GameGrid;
  private zombieSpawner: ZombieSpawner;
  private currentPiece: ZombiePiece | null = null;
  private nextPiece: ZombiePiece | null = null;

  // Game state
  private score: number = 0;
  private lines: number = 0;
  private level: number = 1;
  private survivors: number = 100; // Health/lives system
  private gameState: 'playing' | 'paused' | 'gameover' = 'playing';

  // Timing and controls
  private dropTimer: number = 0;
  private dropInterval: number = 500; // ms between auto-drops
  private fastDrop: boolean = false;
  private lastMoveTime: number = 0;
  private moveDelay: number = 100; // ms between moves

  // Input
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA: Phaser.Input.Keyboard.Key;
  private keyS: Phaser.Input.Keyboard.Key;
  private keyD: Phaser.Input.Keyboard.Key;
  private keySpace: Phaser.Input.Keyboard.Key;
  private keyP: Phaser.Input.Keyboard.Key;

  // UI Elements
  private scoreText: Phaser.GameObjects.Text;
  private linesText: Phaser.GameObjects.Text;
  private levelText: Phaser.GameObjects.Text;
  private survivorsText: Phaser.GameObjects.Text;
  private waveText: Phaser.GameObjects.Text;
  private nextPieceDisplay: Phaser.GameObjects.Container;
  private gameOverText: Phaser.GameObjects.Text;
  private pauseText: Phaser.GameObjects.Text;

  // Visual effects
  private bloodSplatter: Phaser.GameObjects.Particles.ParticleEmitter;
  private screenShake: boolean = false;

  // Audio (placeholders for now)
  private bgMusic: Phaser.Sound.BaseSound;
  private dropSound: Phaser.Sound.BaseSound;
  private clearSound: Phaser.Sound.BaseSound;
  private gameOverSound: Phaser.Sound.BaseSound;

  constructor() {
    super('Game');
  }

  create() {
    // Setup camera and background
    this.cameras.main.setBackgroundColor(0x1a0000); // Dark red background

    // Create game grid
    const gridX = (this.scale.width - 320) / 2; // Center the 10x20 grid (320px wide)
    const gridY = 50;
    this.gameGrid = new GameGrid(this, gridX, gridY, 10, 20);

    // Initialize zombie spawner
    this.zombieSpawner = new ZombieSpawner(this);

    // Setup input
    this.setupInput();

    // Create UI
    this.createUI();

    // Setup game events
    this.setupGameEvents();

    // Create initial pieces
    this.spawnNewPiece();
    this.nextPiece = this.zombieSpawner.createRandomZombie();

    // Setup responsive layout
    this.updateLayout();
    this.scale.on('resize', () => this.updateLayout());

    // Start background music (placeholder)
    // this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.3 });
    // this.bgMusic.play();
  }

  private setupInput(): void {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keySpace = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
      this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    }
  }

  private createUI(): void {
    const uiStyle = {
      fontFamily: 'Creepster, Arial Black',
      fontSize: '24px',
      color: '#ff6666',
      stroke: '#000000',
      strokeThickness: 2,
    };

    const smallStyle = {
      fontFamily: 'Creepster, Arial Black',
      fontSize: '18px',
      color: '#ffaaaa',
      stroke: '#000000',
      strokeThickness: 1,
    };

    // Left side UI
    this.scoreText = this.add.text(20, 50, `CORPSES: ${this.score}`, uiStyle);
    this.linesText = this.add.text(20, 90, `CLEARED: ${this.lines}`, uiStyle);
    this.levelText = this.add.text(20, 130, `WAVE: ${this.level}`, uiStyle);
    this.survivorsText = this.add.text(
      20,
      170,
      `SURVIVORS: ${this.survivors}`,
      uiStyle
    );

    // Right side UI
    const rightX = this.scale.width - 200;
    this.waveText = this.add.text(rightX, 50, 'NEXT HORDE:', smallStyle);

    // Next piece display area
    this.nextPieceDisplay = this.add.container(rightX, 100);

    // Controls info
    this.add.text(rightX, 300, 'CONTROLS:', smallStyle);
    this.add.text(rightX, 330, 'A/D - Move', {
      ...smallStyle,
      fontSize: '14px',
    });
    this.add.text(rightX, 350, 'S - Rotate', {
      ...smallStyle,
      fontSize: '14px',
    });
    this.add.text(rightX, 370, 'SPACE - Drop', {
      ...smallStyle,
      fontSize: '14px',
    });
    this.add.text(rightX, 390, 'P - Pause', {
      ...smallStyle,
      fontSize: '14px',
    });

    // Game over text (hidden initially)
    this.gameOverText = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        'ZOMBIE APOCALYPSE!\\nPress R to Restart',
        {
          fontFamily: 'Creepster, Arial Black',
          fontSize: '48px',
          color: '#ff0000',
          stroke: '#000000',
          strokeThickness: 4,
          align: 'center',
        }
      )
      .setOrigin(0.5)
      .setVisible(false);

    // Pause text (hidden initially)
    this.pauseText = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        'PAUSED\\nPress P to Resume',
        {
          fontFamily: 'Creepster, Arial Black',
          fontSize: '36px',
          color: '#ffff00',
          stroke: '#000000',
          strokeThickness: 3,
          align: 'center',
        }
      )
      .setOrigin(0.5)
      .setVisible(false);
  }

  private setupGameEvents(): void {
    // Listen for zombie spawner events
    this.events.on('zombie-spawned', (_zombie: ZombiePiece) => {
      // Handle individual zombie spawning if needed
    });

    this.events.on('wave-complete', (data: any) => {
      this.level = data.waveNumber + 1;
      this.updateUI();

      // Bonus for surviving a wave
      this.score += 500 * data.waveNumber;
      this.survivors = Math.min(100, this.survivors + 10);
    });

    this.events.on('wave-started', (data: any) => {
      this.dropInterval = Math.max(100, 500 - data.waveNumber * 20); // Increase speed
      this.updateUI();
    });
  }

  private spawnNewPiece(): void {
    if (this.nextPiece) {
      this.currentPiece = this.nextPiece;
      this.nextPiece = this.zombieSpawner.createRandomZombie();
    } else {
      this.currentPiece = this.zombieSpawner.createRandomZombie();
      this.nextPiece = this.zombieSpawner.createRandomZombie();
    }

    if (this.currentPiece) {
      // Position piece at top center of grid
      const startX = Math.floor(this.gameGrid.width / 2);
      const startY = 0;

      const worldX = this.gameGrid.x + startX * this.gameGrid.cellSize;
      const worldY = this.gameGrid.y + startY * this.gameGrid.cellSize;

      this.currentPiece.setPosition(worldX, worldY);

      // Check for game over
      if (!this.gameGrid.canPlacePiece(this.currentPiece, startX, startY)) {
        this.gameOver();
      }
    }

    this.updateNextPieceDisplay();
  }

  private updateNextPieceDisplay(): void {
    // Clear previous display
    this.nextPieceDisplay.removeAll(true);

    if (this.nextPiece) {
      // Create a small preview of the next piece
      const previewPiece = this.nextPiece.clone();
      previewPiece.setPosition(0, 0);

      // Scale down for preview
      previewPiece.parts.forEach((part) => {
        part.setScale(0.6);
        this.nextPieceDisplay.add(part);
      });
    }
  }

  override update(time: number, delta: number): void {
    if (this.gameState !== 'playing') return;

    this.handleInput(time);
    this.updateFallingPiece(delta);
    this.updateGameLogic(delta);
  }

  private handleInput(time: number): void {
    if (!this.currentPiece || time - this.lastMoveTime < this.moveDelay) return;

    const gridX = Math.floor(
      (this.currentPiece.x - this.gameGrid.x) / this.gameGrid.cellSize
    );
    const gridY = Math.floor(
      (this.currentPiece.y - this.gameGrid.y) / this.gameGrid.cellSize
    );

    // Movement
    if (this.keyA.isDown || this.cursors.left.isDown) {
      if (this.gameGrid.canPlacePiece(this.currentPiece, gridX - 1, gridY)) {
        this.currentPiece.setPosition(
          this.currentPiece.x - this.gameGrid.cellSize,
          this.currentPiece.y
        );
        this.lastMoveTime = time;
      }
    } else if (this.keyD.isDown || this.cursors.right.isDown) {
      if (this.gameGrid.canPlacePiece(this.currentPiece, gridX + 1, gridY)) {
        this.currentPiece.setPosition(
          this.currentPiece.x + this.gameGrid.cellSize,
          this.currentPiece.y
        );
        this.lastMoveTime = time;
      }
    }

    // Rotation
    if (
      Phaser.Input.Keyboard.JustDown(this.keyS) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up)
    ) {
      const originalRotation = this.currentPiece.rotation;
      this.currentPiece.rotate();

      // Check if rotation is valid
      if (!this.gameGrid.canPlacePiece(this.currentPiece, gridX, gridY)) {
        // Try wall kicks
        let canRotate = false;
        for (let kickX = -1; kickX <= 1 && !canRotate; kickX++) {
          if (
            this.gameGrid.canPlacePiece(this.currentPiece, gridX + kickX, gridY)
          ) {
            this.currentPiece.setPosition(
              this.currentPiece.x + kickX * this.gameGrid.cellSize,
              this.currentPiece.y
            );
            canRotate = true;
          }
        }

        // If no valid rotation, revert
        if (!canRotate) {
          // Rotate back to original position
          while (this.currentPiece.rotation !== originalRotation) {
            this.currentPiece.rotate();
          }
        }
      }
    }

    // Fast drop
    this.fastDrop = this.cursors.down.isDown;

    // Hard drop
    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      this.hardDrop();
    }

    // Pause
    if (Phaser.Input.Keyboard.JustDown(this.keyP)) {
      this.togglePause();
    }
  }

  private updateFallingPiece(delta: number): void {
    if (!this.currentPiece) return;

    this.dropTimer += delta;
    const currentDropInterval = this.fastDrop
      ? this.dropInterval / 8
      : this.dropInterval;

    if (this.dropTimer >= currentDropInterval) {
      this.dropTimer = 0;
      this.dropPiece();
    }
  }

  private dropPiece(): void {
    if (!this.currentPiece) return;

    const gridX = Math.floor(
      (this.currentPiece.x - this.gameGrid.x) / this.gameGrid.cellSize
    );
    const gridY = Math.floor(
      (this.currentPiece.y - this.gameGrid.y) / this.gameGrid.cellSize
    );

    if (this.gameGrid.canPlacePiece(this.currentPiece, gridX, gridY + 1)) {
      this.currentPiece.setPosition(
        this.currentPiece.x,
        this.currentPiece.y + this.gameGrid.cellSize
      );
    } else {
      this.landPiece();
    }
  }

  private hardDrop(): void {
    if (!this.currentPiece) return;

    const gridX = Math.floor(
      (this.currentPiece.x - this.gameGrid.x) / this.gameGrid.cellSize
    );
    const gridY = Math.floor(
      (this.currentPiece.y - this.gameGrid.y) / this.gameGrid.cellSize
    );

    const dropDistance = this.gameGrid.getDropDistance(
      this.currentPiece,
      gridX,
      gridY
    );

    if (dropDistance > 0) {
      this.currentPiece.setPosition(
        this.currentPiece.x,
        this.currentPiece.y + dropDistance * this.gameGrid.cellSize
      );
      this.score += dropDistance * 2; // Bonus for hard drops
    }

    this.landPiece();
  }

  private landPiece(): void {
    if (!this.currentPiece) return;

    const gridX = Math.floor(
      (this.currentPiece.x - this.gameGrid.x) / this.gameGrid.cellSize
    );
    const gridY = Math.floor(
      (this.currentPiece.y - this.gameGrid.y) / this.gameGrid.cellSize
    );

    // Place piece on grid
    this.gameGrid.placePiece(this.currentPiece, gridX, gridY);

    // Apply special zombie abilities
    this.handleSpecialAbilities(this.currentPiece, gridX, gridY);

    // Check for completed lines
    const completedLines = this.gameGrid.checkCompleteLines();
    if (completedLines.length > 0) {
      this.clearLines(completedLines);
    }

    // Update score for piece placement
    this.score += 10;

    // Reduce survivors based on zombie type
    this.survivors -= this.getZombieThreat(this.currentPiece.type);

    this.currentPiece = null;
    this.spawnNewPiece();

    this.updateUI();

    // Check win/lose conditions
    if (this.survivors <= 0 || this.gameGrid.isGameOver()) {
      this.gameOver();
    }
  }

  private handleSpecialAbilities(
    piece: ZombiePiece,
    gridX: number,
    gridY: number
  ): void {
    switch (piece.type) {
      case ZombieType.BOMBER:
        // Explode and clear surrounding cells
        this.explodeArea(gridX, gridY, 1);
        break;
      case ZombieType.CRAWLER:
        // Can shift after landing if there's space
        setTimeout(() => {
          if (this.gameGrid.canPlacePiece(piece, gridX + 1, gridY)) {
            // Shift right logic would go here
          }
        }, 500);
        break;
    }
  }

  private explodeArea(centerX: number, centerY: number, radius: number): void {
    for (let y = centerY - radius; y <= centerY + radius; y++) {
      for (let x = centerX - radius; x <= centerX + radius; x++) {
        if (
          x >= 0 &&
          x < this.gameGrid.width &&
          y >= 0 &&
          y < this.gameGrid.height &&
          this.gameGrid.grid[y]
        ) {
          this.gameGrid.grid[y][x] = null;
        }
      }
    }

    // Add explosion effect
    this.cameras.main.shake(200, 0.02);
    this.score += 50; // Bonus for explosion
  }

  private clearLines(lines: number[]): void {
    const scoreGained = this.gameGrid.clearLines(lines);
    this.score += scoreGained;
    this.lines += lines.length;

    // Bonus survivors saved
    this.survivors = Math.min(100, this.survivors + lines.length * 5);

    // Screen effect for line clears
    this.cameras.main.flash(200, 100, 0, 0);

    // Level progression
    if (this.lines >= this.level * 10) {
      this.level++;
      this.zombieSpawner.startNextWave();
    }
  }

  private getZombieThreat(type: ZombieType): number {
    switch (type) {
      case ZombieType.BASIC:
        return 1;
      case ZombieType.RUNNER:
        return 2;
      case ZombieType.CRAWLER:
        return 1;
      case ZombieType.TANK:
        return 3;
      case ZombieType.BOMBER:
        return 2;
      default:
        return 1;
    }
  }

  private updateGameLogic(_delta: number): void {
    // Update zombie spawner
    // Additional game logic updates would go here
  }

  private updateUI(): void {
    this.scoreText.setText(`CORPSES: ${this.score}`);
    this.linesText.setText(`CLEARED: ${this.lines}`);
    this.levelText.setText(`WAVE: ${this.level}`);
    this.survivorsText.setText(`SURVIVORS: ${this.survivors}`);
    this.waveText.setText(
      `WAVE ${this.zombieSpawner.getCurrentWave()}: ${this.zombieSpawner.getZombiesRemaining()} LEFT`
    );
  }

  private togglePause(): void {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.pauseText.setVisible(true);
      this.zombieSpawner.pause();
    } else if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.pauseText.setVisible(false);
      this.zombieSpawner.resume();
    }
  }

  private gameOver(): void {
    this.gameState = 'gameover';
    this.gameOverText.setVisible(true);
    this.zombieSpawner.stop();

    // Add restart input
    if (this.input.keyboard) {
      this.input.keyboard
        .addKey(Phaser.Input.Keyboard.KeyCodes.R)
        .on('down', () => {
          this.scene.restart();
        });
    }

    // Post score to server (if needed)
    this.postScore();
  }

  private async postScore(): Promise<void> {
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: this.score,
          lines: this.lines,
          level: this.level,
          survivors: this.survivors,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to post score');
      }
    } catch (error) {
      console.error('Error posting score:', error);
    }
  }

  private updateLayout(): void {
    const { width, height } = this.scale;

    // Update camera
    if (this.cameras && this.cameras.main) {
      this.cameras.resize(width, height);
    }

    // Reposition UI elements
    if (this.gameOverText) {
      this.gameOverText.setPosition(width / 2, height / 2);
    }

    if (this.pauseText) {
      this.pauseText.setPosition(width / 2, height / 2);
    }

    // Update grid position to stay centered
    if (this.gameGrid) {
      this.gameGrid.x = (width - 320) / 2;
      this.gameGrid.drawGrid();
    }
  }
}
