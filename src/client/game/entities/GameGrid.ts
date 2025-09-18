import * as Phaser from 'phaser';
import { ZombiePiece, ZombieType } from './ZombiePiece';

export class GameGrid {
  public scene: Phaser.Scene;
  public width: number;
  public height: number;
  public cellSize: number = 32;
  public grid: (ZombiePiece | null)[][] = [];
  public gridGraphics: Phaser.GameObjects.Graphics;
  public x: number;
  public y: number;

  // Particle effects for clearing lines
  public bloodParticles: Phaser.GameObjects.Particles.ParticleEmitter | null =
    null;
  public boneParticles: Phaser.GameObjects.Particles.ParticleEmitter | null =
    null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number = 10,
    height: number = 20
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // Initialize empty grid
    this.grid = [];
    for (let row = 0; row < height; row++) {
      this.grid[row] = [];
      for (let col = 0; col < width; col++) {
        this.grid[row][col] = null;
      }
    }

    this.createGridVisuals();
    this.createParticleEffects();
  }

  private createGridVisuals(): void {
    this.gridGraphics = this.scene.add.graphics();
    this.drawGrid();
  }

  private createParticleEffects(): void {
    try {
      // Create blood splatter particles
      this.bloodParticles = this.scene.add.particles(0, 0, 'blood', {
        speed: { min: 50, max: 150 },
        lifespan: 1000,
        scale: { start: 0.8, end: 0 },
        quantity: 5,
        emitting: false,
        alpha: { start: 1, end: 0 },
      });

      // Create bone fragment particles
      this.boneParticles = this.scene.add.particles(0, 0, 'bone', {
        speed: { min: 30, max: 100 },
        lifespan: 1500,
        scale: { start: 0.6, end: 0.1 },
        quantity: 8,
        emitting: false,
        gravityY: 200,
        alpha: { start: 1, end: 0 },
      });
    } catch (error) {
      console.warn(
        'Could not create particle effects, textures may not be loaded yet'
      );
      // Create fallback particle effects without textures
      this.createFallbackParticles();
    }
  }

  private createFallbackParticles(): void {
    // Create simple colored rectangle particles as fallback
    const bloodTexture = this.scene.add.graphics();
    bloodTexture.fillStyle(0xff0000);
    bloodTexture.fillRect(0, 0, 4, 4);
    bloodTexture.generateTexture('fallback-blood', 4, 4);
    bloodTexture.destroy();

    const boneTexture = this.scene.add.graphics();
    boneTexture.fillStyle(0xfffacd);
    boneTexture.fillRect(0, 0, 3, 3);
    boneTexture.generateTexture('fallback-bone', 3, 3);
    boneTexture.destroy();

    this.bloodParticles = this.scene.add.particles(0, 0, 'fallback-blood', {
      speed: { min: 50, max: 150 },
      lifespan: 1000,
      scale: { start: 1, end: 0 },
      quantity: 5,
      emitting: false,
      alpha: { start: 1, end: 0 },
    });

    this.boneParticles = this.scene.add.particles(0, 0, 'fallback-bone', {
      speed: { min: 30, max: 100 },
      lifespan: 1500,
      scale: { start: 1, end: 0.1 },
      quantity: 8,
      emitting: false,
      gravityY: 200,
      alpha: { start: 1, end: 0 },
    });
  }

  public drawGrid(): void {
    this.gridGraphics.clear();

    // Draw grid background
    this.gridGraphics.fillStyle(0x111111, 0.8);
    this.gridGraphics.fillRect(
      this.x,
      this.y,
      this.width * this.cellSize,
      this.height * this.cellSize
    );

    // Draw grid lines
    this.gridGraphics.lineStyle(1, 0x333333, 0.5);

    // Vertical lines
    for (let col = 0; col <= this.width; col++) {
      this.gridGraphics.moveTo(this.x + col * this.cellSize, this.y);
      this.gridGraphics.lineTo(
        this.x + col * this.cellSize,
        this.y + this.height * this.cellSize
      );
    }

    // Horizontal lines
    for (let row = 0; row <= this.height; row++) {
      this.gridGraphics.moveTo(this.x, this.y + row * this.cellSize);
      this.gridGraphics.lineTo(
        this.x + this.width * this.cellSize,
        this.y + row * this.cellSize
      );
    }

    this.gridGraphics.strokePath();

    // Draw danger zone at top
    this.gridGraphics.fillStyle(0x660000, 0.3);
    this.gridGraphics.fillRect(
      this.x,
      this.y,
      this.width * this.cellSize,
      this.cellSize * 2
    );
  }

  public canPlacePiece(
    piece: ZombiePiece,
    gridX: number,
    gridY: number
  ): boolean {
    const positions = piece.getGridPositions();

    for (const pos of positions) {
      const finalX = gridX + pos.x;
      const finalY = gridY + pos.y;

      // Check boundaries
      if (
        finalX < 0 ||
        finalX >= this.width ||
        finalY < 0 ||
        finalY >= this.height
      ) {
        return false;
      }

      // Check collision with existing pieces
      if (this.grid[finalY][finalX] !== null) {
        return false;
      }
    }

    return true;
  }

  public placePiece(piece: ZombiePiece, gridX: number, gridY: number): void {
    const positions = piece.getGridPositions();

    for (const pos of positions) {
      const finalX = gridX + pos.x;
      const finalY = gridY + pos.y;

      if (
        finalX >= 0 &&
        finalX < this.width &&
        finalY >= 0 &&
        finalY < this.height
      ) {
        this.grid[finalY][finalX] = piece;
      }
    }
  }

  public checkCompleteLines(): number[] {
    const completeLines: number[] = [];

    for (let row = 0; row < this.height; row++) {
      let isComplete = true;

      for (let col = 0; col < this.width; col++) {
        if (this.grid[row][col] === null) {
          isComplete = false;
          break;
        }
      }

      if (isComplete) {
        completeLines.push(row);
      }
    }

    return completeLines;
  }

  public clearLines(lines: number[]): number {
    let score = 0;

    // Sort lines in descending order to clear from bottom up
    lines.sort((a, b) => b - a);

    for (const lineIndex of lines) {
      this.clearLine(lineIndex);
      score += this.calculateLineScore(lineIndex);
    }

    return score;
  }

  private clearLine(lineIndex: number): void {
    // Create blood and bone effects
    const lineY = this.y + lineIndex * this.cellSize;
    const lineX = this.x + (this.width * this.cellSize) / 2;

    // Emit blood particles
    if (this.bloodParticles) {
      this.bloodParticles.setPosition(lineX, lineY);
      this.bloodParticles.explode(15);
    }

    // Emit bone particles with delay
    this.scene.time.delayedCall(100, () => {
      if (this.boneParticles) {
        this.boneParticles.setPosition(lineX, lineY);
        this.boneParticles.explode(20);
      }
    });

    // Destroy zombie pieces in this line
    for (let col = 0; col < this.width; col++) {
      const piece = this.grid[lineIndex][col];
      if (piece) {
        // Don't destroy the piece object, just remove reference
        // The visual cleanup will be handled separately
        this.grid[lineIndex][col] = null;
      }
    }

    // Move all lines above down by one
    for (let row = lineIndex; row > 0; row--) {
      for (let col = 0; col < this.width; col++) {
        this.grid[row][col] = this.grid[row - 1][col];
      }
    }

    // Clear the top line
    for (let col = 0; col < this.width; col++) {
      this.grid[0][col] = null;
    }
  }

  private calculateLineScore(lineIndex: number): number {
    // Higher score for lines cleared at the bottom
    const baseScore = 100;
    const positionMultiplier = (this.height - lineIndex) / this.height;
    return Math.floor(baseScore * positionMultiplier);
  }

  public getDropDistance(
    piece: ZombiePiece,
    gridX: number,
    gridY: number
  ): number {
    let dropDistance = 0;

    while (this.canPlacePiece(piece, gridX, gridY + dropDistance + 1)) {
      dropDistance++;
    }

    return dropDistance;
  }

  public isGameOver(): boolean {
    // Check if any zombie pieces are in the danger zone (top 2 rows)
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.grid[row][col] !== null) {
          return true;
        }
      }
    }
    return false;
  }

  public getFilledCells(): Array<{ x: number; y: number; type: ZombieType }> {
    const filledCells: Array<{ x: number; y: number; type: ZombieType }> = [];

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const piece = this.grid[row][col];
        if (piece) {
          filledCells.push({
            x: col,
            y: row,
            type: piece.type,
          });
        }
      }
    }

    return filledCells;
  }

  public getHeightMap(): number[] {
    const heights: number[] = [];

    for (let col = 0; col < this.width; col++) {
      let height = 0;
      for (let row = this.height - 1; row >= 0; row--) {
        if (this.grid[row][col] !== null) {
          height = this.height - row;
          break;
        }
      }
      heights.push(height);
    }

    return heights;
  }

  public clear(): void {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        this.grid[row][col] = null;
      }
    }
  }

  public destroy(): void {
    if (this.gridGraphics) {
      this.gridGraphics.destroy();
    }
    if (this.bloodParticles) {
      this.bloodParticles.destroy();
    }
    if (this.boneParticles) {
      this.boneParticles.destroy();
    }
  }
}
