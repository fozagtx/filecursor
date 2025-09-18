import * as Phaser from 'phaser';

export interface ZombiePartData {
  x: number;
  y: number;
  type: 'head' | 'torso' | 'arm' | 'leg';
  color: number;
}

export enum ZombieType {
  BASIC = 'basic',
  RUNNER = 'runner',
  TANK = 'tank',
  CRAWLER = 'crawler',
  BOMBER = 'bomber',
}

export class ZombiePiece {
  public parts: Phaser.GameObjects.Rectangle[] = [];
  public bodyParts: ZombiePartData[] = [];
  public type: ZombieType;
  public scene: Phaser.Scene;
  public x: number = 0;
  public y: number = 0;
  public rotation: number = 0;

  // Physics properties for ragdoll effect
  public velocity: { x: number; y: number } = { x: 0, y: 0 };
  public angularVelocity: number = 0;
  public mass: number = 1;
  public friction: number = 0.95;

  constructor(scene: Phaser.Scene, type: ZombieType = ZombieType.BASIC) {
    this.scene = scene;
    this.type = type;
    this.generateZombieShape();
    this.createVisuals();
  }

  private generateZombieShape(): void {
    // Generate different zombie formations based on type
    switch (this.type) {
      case ZombieType.BASIC:
        this.bodyParts = [
          { x: 0, y: 0, type: 'head', color: 0x8b4513 },
          { x: 0, y: 1, type: 'torso', color: 0x654321 },
          { x: -1, y: 1, type: 'arm', color: 0x8b4513 },
          { x: 1, y: 1, type: 'arm', color: 0x8b4513 },
          { x: 0, y: 2, type: 'leg', color: 0x654321 },
        ];
        break;

      case ZombieType.RUNNER:
        // Longer, stretched zombie
        this.bodyParts = [
          { x: 0, y: 0, type: 'head', color: 0x9b4513 },
          { x: 1, y: 0, type: 'torso', color: 0x754321 },
          { x: 2, y: 0, type: 'leg', color: 0x654321 },
          { x: 3, y: 0, type: 'leg', color: 0x654321 },
        ];
        break;

      case ZombieType.TANK:
        // Wide, bulky zombie
        this.bodyParts = [
          { x: 0, y: 0, type: 'head', color: 0x7b4513 },
          { x: 1, y: 0, type: 'head', color: 0x7b4513 },
          { x: 0, y: 1, type: 'torso', color: 0x554321 },
          { x: 1, y: 1, type: 'torso', color: 0x554321 },
        ];
        break;

      case ZombieType.CRAWLER:
        // Horizontal sprawling zombie
        this.bodyParts = [
          { x: 0, y: 0, type: 'head', color: 0xab4513 },
          { x: 1, y: 0, type: 'arm', color: 0x9b4513 },
          { x: 2, y: 0, type: 'torso', color: 0x854321 },
          { x: 0, y: 1, type: 'leg', color: 0x754321 },
        ];
        break;

      case ZombieType.BOMBER:
        // Compact but dangerous
        this.bodyParts = [
          { x: 0, y: 0, type: 'head', color: 0xff4444 },
          { x: 0, y: 1, type: 'torso', color: 0xdd3333 },
        ];
        break;
    }
  }

  private createVisuals(): void {
    this.parts = [];
    const cellSize = 32; // Size of each zombie part cell

    this.bodyParts.forEach((part) => {
      const rect = this.scene.add.rectangle(
        part.x * cellSize,
        part.y * cellSize,
        cellSize - 2,
        cellSize - 2,
        part.color
      );

      // Add some visual variation based on part type
      rect.setStrokeStyle(2, 0x000000);

      // Add texture-like effects
      if (part.type === 'head') {
        // Add eyes
        const eye1 = this.scene.add.rectangle(
          part.x * cellSize - 6,
          part.y * cellSize - 4,
          4,
          4,
          0xff0000
        );
        const eye2 = this.scene.add.rectangle(
          part.x * cellSize + 6,
          part.y * cellSize - 4,
          4,
          4,
          0xff0000
        );
        this.parts.push(eye1, eye2);
      }

      this.parts.push(rect);
    });
  }

  public setPosition(x: number, y: number): void {
    const deltaX = x - this.x;
    const deltaY = y - this.y;

    this.x = x;
    this.y = y;

    this.parts.forEach((part) => {
      part.x += deltaX;
      part.y += deltaY;
    });
  }

  public rotate(): void {
    this.rotation = (this.rotation + 90) % 360;

    // Rotate each body part around the center
    const centerX =
      this.bodyParts.reduce((sum, part) => sum + part.x, 0) /
      this.bodyParts.length;
    const centerY =
      this.bodyParts.reduce((sum, part) => sum + part.y, 0) /
      this.bodyParts.length;

    this.bodyParts.forEach((part, index) => {
      const relX = part.x - centerX;
      const relY = part.y - centerY;

      // 90-degree rotation
      part.x = centerX - relY;
      part.y = centerY + relX;

      // Update visual position
      if (this.parts[index]) {
        this.parts[index].x = this.x + part.x * 32;
        this.parts[index].y = this.y + part.y * 32;
      }
    });
  }

  public getGridPositions(): Array<{ x: number; y: number }> {
    const cellSize = 32;
    return this.bodyParts.map((part) => ({
      x: Math.floor((this.x + part.x * cellSize) / cellSize),
      y: Math.floor((this.y + part.y * cellSize) / cellSize),
    }));
  }

  public applyRagdollPhysics(deltaTime: number): void {
    // Apply gravity
    this.velocity.y += 300 * deltaTime;

    // Apply friction
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.angularVelocity *= this.friction;

    // Update position
    this.setPosition(
      this.x + this.velocity.x * deltaTime,
      this.y + this.velocity.y * deltaTime
    );

    // Apply rotation for ragdoll effect
    if (Math.abs(this.angularVelocity) > 0.1) {
      this.rotation += this.angularVelocity * deltaTime;
    }
  }

  public destroy(): void {
    this.parts.forEach((part) => {
      if (part.scene) {
        part.destroy();
      }
    });
    this.parts = [];
  }

  public clone(): ZombiePiece {
    const newPiece = new ZombiePiece(this.scene, this.type);
    return newPiece;
  }

  // Special abilities based on zombie type
  public getSpecialAbility(): string {
    switch (this.type) {
      case ZombieType.RUNNER:
        return 'Falls 2x faster';
      case ZombieType.TANK:
        return 'Blocks line clears temporarily';
      case ZombieType.CRAWLER:
        return 'Can shift one cell after landing';
      case ZombieType.BOMBER:
        return 'Explodes and clears surrounding cells';
      default:
        return 'Standard zombie behavior';
    }
  }
}
