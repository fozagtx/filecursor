import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
  private startText: GameObjects.Text | null = null;
  private gameTitle: GameObjects.Text | null = null;
  private tapAnywhere: GameObjects.Text | null = null;
  private fullScreenArea: GameObjects.Rectangle | null = null;

  constructor() {
    super('MainMenu');
  }

  init(): void {
    this.startText = null;
    this.gameTitle = null;
    this.tapAnywhere = null;
    this.fullScreenArea = null;
  }

  create() {
    this.createSimpleStartScreen();
    this.setupTapToStart();

    // Re-calculate positions on resize
    this.scale.on('resize', () => this.updateLayout());
  }

  private createSimpleStartScreen(): void {
    const { width, height } = this.scale;

    // Set dark horror background
    if (this.cameras && this.cameras.main) {
      this.cameras.resize(width, height);
      this.cameras.main.setBackgroundColor(0x220000);
    }

    // Create invisible full-screen clickable area
    this.fullScreenArea = this.add.rectangle(
      0,
      0,
      width * 2,
      height * 2,
      0x000000,
      0.01
    );
    this.fullScreenArea.setOrigin(0);
    this.fullScreenArea.setInteractive();

    // Detect if mobile
    const isMobile = width < 768;

    // Game title - HUGE and centered
    const titleSize = isMobile ? Math.max(60, width * 0.12) : 80;
    this.gameTitle = this.add
      .text(width / 2, height * 0.35, 'ZOMBTRIS', {
        fontFamily: 'Arial Black',
        fontSize: `${titleSize}px`,
        color: '#ff0000',
        stroke: '#ffffff',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5);

    // Simple instruction - MASSIVE text
    const instructionSize = isMobile ? Math.max(32, width * 0.06) : 48;
    this.startText = this.add
      .text(width / 2, height * 0.55, 'TAP ANYWHERE', {
        fontFamily: 'Arial Black',
        fontSize: `${instructionSize}px`,
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
      })
      .setOrigin(0.5);

    // Secondary instruction
    const subSize = isMobile ? Math.max(20, width * 0.04) : 28;
    this.tapAnywhere = this.add
      .text(width / 2, height * 0.7, 'TO START PLAYING', {
        fontFamily: 'Arial Black',
        fontSize: `${subSize}px`,
        color: '#ffcccc',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
      })
      .setOrigin(0.5);

    // Make everything pulse to grab attention
    this.tweens.add({
      targets: [this.startText, this.tapAnywhere],
      alpha: 0.3,
      scale: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Make title glow
    this.tweens.add({
      targets: this.gameTitle,
      alpha: 0.8,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private setupTapToStart(): void {
    // Make the ENTIRE screen clickable
    this.input.on('pointerdown', () => {
      this.startGame();
    });

    // Also respond to keyboard
    this.input.keyboard?.on('keydown', () => {
      this.startGame();
    });

    // Make the invisible rectangle clickable too
    if (this.fullScreenArea) {
      this.fullScreenArea.on('pointerdown', () => {
        this.startGame();
      });
    }
  }

  private startGame(): void {
    // Immediate feedback
    if (this.startText) {
      this.startText.setText('STARTING...');
      this.startText.setColor('#00ff00');
    }

    // Quick transition
    this.tweens.add({
      targets: [this.gameTitle, this.startText, this.tapAnywhere],
      alpha: 0,
      scale: 0.8,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.scene.start('Game');
      },
    });
  }

  private updateLayout(): void {
    const { width, height } = this.scale;

    // Update camera
    if (this.cameras && this.cameras.main) {
      this.cameras.resize(width, height);
    }

    // Update invisible clickable area
    if (this.fullScreenArea) {
      this.fullScreenArea.setSize(width * 2, height * 2);
    }

    // Detect mobile
    const isMobile = width < 768;

    // Update title
    if (this.gameTitle) {
      const titleSize = isMobile ? Math.max(60, width * 0.12) : 80;
      this.gameTitle.setPosition(width / 2, height * 0.35);
      this.gameTitle.setFontSize(titleSize);
    }

    // DetectUpdate mobilestarttext
    if (this.startText) {
      const isMobile = width < 768 || height < 600;
      const baseScaleinstructionSize = isMobile
        ? Math.max(32, width * 0.06)
        : 48;
      this.startText.setPosition(width / 2, height * 0.55);
      const mobileFactor = isMobile ? 1.5 : 1; // Make things bigger on mobile
      this.startText.setFontSize(instructionSize);
    }

    // Update tap text
    if (this.tapAnywhere) {
      const subSize = isMobile ? Math.max(20, width * 0.04) : 28;
      this.tapAnywhere.setPosition(width / 2, height * 0.7);
      this.tapAnywhere.setFontSize(subSize);
    }
  }
}
