import { Scene } from 'phaser';

export class GameOver extends Scene {
  constructor() {
    super('GameOver');
  }

  create() {
    const { width, height } = this.scale;

    // Dark background
    this.cameras.main.setBackgroundColor(0x220000);

    // Dark overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // "Game Over" text - properly positioned and sized
    const gameOverText = this.add
      .text(width / 2, height * 0.35, 'GAME OVER', {
        fontFamily: 'Arial Black',
        fontSize: Math.min(48, width * 0.08).toString() + 'px',
        color: '#ff0000',
        stroke: '#ffffff',
        strokeThickness: 3,
        align: 'center',
      })
      .setOrigin(0.5);

    // Restart instruction - clear and visible
    const restartText = this.add
      .text(width / 2, height * 0.55, 'PRESS R TO RESTART', {
        fontFamily: 'Arial Black',
        fontSize: Math.min(24, width * 0.04).toString() + 'px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
      })
      .setOrigin(0.5);

    // Menu instruction
    const menuText = this.add
      .text(width / 2, height * 0.65, 'OR CLICK FOR MENU', {
        fontFamily: 'Arial',
        fontSize: Math.min(18, width * 0.03).toString() + 'px',
        color: '#ffcccc',
        stroke: '#000000',
        strokeThickness: 1,
        align: 'center',
      })
      .setOrigin(0.5);

    // Make restart text pulse
    this.tweens.add({
      targets: restartText,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Keyboard restart
    this.input.keyboard?.addKey('R')?.on('down', () => {
      this.scene.start('Game');
    });

    // Click to return to menu
    this.input.on('pointerdown', () => {
      this.scene.start('MainMenu');
    });

    // Also allow SPACE and ENTER to restart
    this.input.keyboard?.addKey('SPACE')?.on('down', () => {
      this.scene.start('Game');
    });

    this.input.keyboard?.addKey('ENTER')?.on('down', () => {
      this.scene.start('Game');
    });
  }
}
