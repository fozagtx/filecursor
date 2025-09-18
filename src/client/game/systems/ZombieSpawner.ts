import * as Phaser from 'phaser';
import { ZombiePiece, ZombieType } from '../entities/ZombiePiece';

export interface WaveConfig {
  waveNumber: number;
  zombieCount: number;
  spawnRate: number; // zombies per second
  difficulty: number; // 0-1 scale
  specialZombieChance: number; // 0-1 chance for special zombies
  availableTypes: ZombieType[];
}

export class ZombieSpawner {
  private scene: Phaser.Scene;
  private currentWave: number = 1;
  private zombiesSpawned: number = 0;
  private zombiesRemaining: number = 0;
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private waveConfig: WaveConfig;

  // Drop mechanics
  private fallSpeed: number = 1; // cells per second
  private speedIncrement: number = 0.1;

  // Formation patterns for zombie groups
  private formations: Array<Array<{ x: number; y: number; type: ZombieType }>> =
    [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupFormations();
    this.initializeWave();
  }

  private setupFormations(): void {
    // Basic formations
    this.formations.push([{ x: 0, y: 0, type: ZombieType.BASIC }]);

    // Horde formation
    this.formations.push([
      { x: 0, y: 0, type: ZombieType.BASIC },
      { x: 1, y: 0, type: ZombieType.BASIC },
      { x: 2, y: 0, type: ZombieType.BASIC },
    ]);

    // Mixed threat formation
    this.formations.push([
      { x: 0, y: 0, type: ZombieType.TANK },
      { x: 1, y: 0, type: ZombieType.RUNNER },
      { x: 0, y: 1, type: ZombieType.CRAWLER },
    ]);

    // Explosive formation
    this.formations.push([
      { x: 0, y: 0, type: ZombieType.BOMBER },
      { x: 1, y: 0, type: ZombieType.BASIC },
      { x: -1, y: 0, type: ZombieType.BASIC },
    ]);

    // Runner pack
    this.formations.push([
      { x: 0, y: 0, type: ZombieType.RUNNER },
      { x: 0, y: 1, type: ZombieType.RUNNER },
    ]);
  }

  private initializeWave(): void {
    this.waveConfig = this.generateWaveConfig(this.currentWave);
    this.zombiesSpawned = 0;
    this.zombiesRemaining = this.waveConfig.zombieCount;
    this.startSpawning();
  }

  private generateWaveConfig(waveNumber: number): WaveConfig {
    // Scale difficulty over waves
    const baseDifficulty = Math.min(waveNumber / 20, 1); // Max difficulty at wave 20
    const zombieCount = Math.floor(5 + waveNumber * 1.5);
    const spawnRate = Math.min(0.5 + waveNumber * 0.1, 3); // Max 3 zombies per second
    const specialChance = Math.min(waveNumber * 0.05, 0.8); // Max 80% special zombies

    // Unlock zombie types progressively
    let availableTypes = [ZombieType.BASIC];
    if (waveNumber >= 3) availableTypes.push(ZombieType.RUNNER);
    if (waveNumber >= 5) availableTypes.push(ZombieType.CRAWLER);
    if (waveNumber >= 8) availableTypes.push(ZombieType.TANK);
    if (waveNumber >= 12) availableTypes.push(ZombieType.BOMBER);

    return {
      waveNumber,
      zombieCount,
      spawnRate,
      difficulty: baseDifficulty,
      specialZombieChance: specialChance,
      availableTypes,
    };
  }

  private startSpawning(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }

    const spawnInterval = 1000 / this.waveConfig.spawnRate; // Convert to milliseconds

    this.spawnTimer = this.scene.time.addEvent({
      delay: spawnInterval,
      callback: this.spawnZombie,
      callbackScope: this,
      loop: true,
    });
  }

  private spawnZombie(): ZombiePiece | null {
    if (this.zombiesRemaining <= 0) {
      this.endWave();
      return null;
    }

    const zombie = this.createRandomZombie();
    this.zombiesSpawned++;
    this.zombiesRemaining--;

    // Emit spawn event for game to handle
    this.scene.events.emit('zombie-spawned', zombie);

    return zombie;
  }

  public createRandomZombie(): ZombiePiece {
    let zombieType = ZombieType.BASIC;

    // Determine if this should be a special zombie
    if (Math.random() < this.waveConfig.specialZombieChance) {
      const availableSpecial = this.waveConfig.availableTypes.filter(
        (type) => type !== ZombieType.BASIC
      );
      if (availableSpecial.length > 0) {
        const selectedType =
          availableSpecial[Math.floor(Math.random() * availableSpecial.length)];
        if (selectedType) {
          zombieType = selectedType;
        }
      }
    }

    const zombie = new ZombiePiece(this.scene, zombieType);

    // Apply wave-based modifications
    this.applyWaveModifications(zombie);

    return zombie;
  }

  private applyWaveModifications(zombie: ZombiePiece): void {
    // Increase fall speed with waves
    const speedMultiplier = 1 + (this.currentWave - 1) * this.speedIncrement;
    zombie.velocity.y *= speedMultiplier;

    // Add some randomness to zombie behavior
    if (Math.random() < 0.3) {
      zombie.velocity.x = (Math.random() - 0.5) * 50; // Slight horizontal drift
    }

    // Special wave effects
    if (this.currentWave >= 10) {
      // Add slight rotation to pieces for more chaos
      zombie.angularVelocity = (Math.random() - 0.5) * 90;
    }
  }

  public spawnFormation(): ZombiePiece[] {
    if (this.formations.length === 0) return [];

    const formation =
      this.formations[Math.floor(Math.random() * this.formations.length)];
    if (!formation) return [];

    const zombies: ZombiePiece[] = [];

    formation.forEach((zombieData) => {
      const zombie = new ZombiePiece(this.scene, zombieData.type);
      // Set relative position within formation
      zombie.setPosition(zombieData.x * 32, zombieData.y * 32);
      this.applyWaveModifications(zombie);
      zombies.push(zombie);
    });

    // Update counters
    this.zombiesSpawned += zombies.length;
    this.zombiesRemaining = Math.max(0, this.zombiesRemaining - zombies.length);

    return zombies;
  }

  private endWave(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }

    // Emit wave complete event
    this.scene.events.emit('wave-complete', {
      waveNumber: this.currentWave,
      zombiesSpawned: this.zombiesSpawned,
    });
  }

  public startNextWave(): void {
    this.currentWave++;
    this.initializeWave();

    // Emit wave start event
    this.scene.events.emit('wave-started', {
      waveNumber: this.currentWave,
      config: this.waveConfig,
    });
  }

  public getCurrentWave(): number {
    return this.currentWave;
  }

  public getWaveProgress(): number {
    if (this.waveConfig.zombieCount === 0) return 1;
    return this.zombiesSpawned / this.waveConfig.zombieCount;
  }

  public getZombiesRemaining(): number {
    return this.zombiesRemaining;
  }

  public getFallSpeed(): number {
    return this.fallSpeed * (1 + (this.currentWave - 1) * this.speedIncrement);
  }

  public pause(): void {
    if (this.spawnTimer) {
      this.spawnTimer.paused = true;
    }
  }

  public resume(): void {
    if (this.spawnTimer) {
      this.spawnTimer.paused = false;
    }
  }

  public stop(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }
  }

  public getWaveConfig(): WaveConfig {
    return { ...this.waveConfig };
  }

  // Get preview of next zombie type for UI
  public getNextZombiePreview(): ZombieType {
    if (this.zombiesRemaining <= 0) return ZombieType.BASIC;

    if (Math.random() < this.waveConfig.specialZombieChance) {
      const availableSpecial = this.waveConfig.availableTypes.filter(
        (type) => type !== ZombieType.BASIC
      );
      if (availableSpecial.length > 0) {
        const selectedType =
          availableSpecial[Math.floor(Math.random() * availableSpecial.length)];
        if (selectedType) {
          return selectedType;
        }
      }
    }

    return ZombieType.BASIC;
  }
}
