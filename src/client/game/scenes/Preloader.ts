import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(512, 384, 'background');

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xff6666);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xff0000);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets');
    this.load.image('logo', 'logo.png');

    // Create particle textures programmatically since we don't have image files
    this.createParticleTextures();
  }

  private createParticleTextures(): void {
    // Create blood particle texture
    const bloodGraphics = this.add.graphics();
    bloodGraphics.fillStyle(0xff0000);
    bloodGraphics.fillCircle(4, 4, 4);
    bloodGraphics.generateTexture('blood', 8, 8);
    bloodGraphics.destroy();

    // Create bone particle texture
    const boneGraphics = this.add.graphics();
    boneGraphics.fillStyle(0xfffacd);
    boneGraphics.fillRect(0, 2, 6, 2);
    boneGraphics.fillRect(2, 0, 2, 6);
    boneGraphics.generateTexture('bone', 6, 6);
    boneGraphics.destroy();

    // Create zombie head texture for particles
    const headGraphics = this.add.graphics();
    headGraphics.fillStyle(0x8b4513);
    headGraphics.fillCircle(8, 8, 6);
    headGraphics.fillStyle(0xff0000);
    headGraphics.fillCircle(6, 6, 1);
    headGraphics.fillCircle(10, 6, 1);
    headGraphics.generateTexture('zombie-head', 16, 16);
    headGraphics.destroy();

    // Create meat chunk texture
    const meatGraphics = this.add.graphics();
    meatGraphics.fillStyle(0x8b0000);
    meatGraphics.fillRect(0, 0, 4, 4);
    meatGraphics.fillStyle(0xff0000);
    meatGraphics.fillRect(1, 1, 2, 2);
    meatGraphics.generateTexture('meat', 4, 4);
    meatGraphics.destroy();

    // Create basic zombie body part textures
    const zombieBodyGraphics = this.add.graphics();
    zombieBodyGraphics.fillStyle(0x654321);
    zombieBodyGraphics.fillRect(0, 0, 30, 30);
    zombieBodyGraphics.lineStyle(2, 0x000000);
    zombieBodyGraphics.strokeRect(0, 0, 30, 30);
    zombieBodyGraphics.generateTexture('zombie-body', 30, 30);
    zombieBodyGraphics.destroy();

    // Create explosion effect texture
    const explosionGraphics = this.add.graphics();
    explosionGraphics.fillStyle(0xff4444);
    explosionGraphics.fillCircle(16, 16, 12);
    explosionGraphics.fillStyle(0xffaa00);
    explosionGraphics.fillCircle(16, 16, 8);
    explosionGraphics.fillStyle(0xffffff);
    explosionGraphics.fillCircle(16, 16, 4);
    explosionGraphics.generateTexture('explosion', 32, 32);
    explosionGraphics.destroy();
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start('MainMenu');
  }
}
