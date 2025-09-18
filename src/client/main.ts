import StartGame from './game/main';

document.addEventListener('DOMContentLoaded', () => {
  // Show simple start screen
  const container = document.getElementById('game-container');
  if (container) {
    container.innerHTML = `
      <div id="start-screen" style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: #220000;
        color: #ff0000;
        font-family: Arial Black;
        text-align: center;
        cursor: pointer;
        user-select: none;
      ">
        <div style="font-size: 64px; margin-bottom: 30px; color: #ff0000; text-shadow: 2px 2px 4px #000;">ZOMBTRIS</div>
        <div style="font-size: 32px; color: #ffff00; animation: pulse 1s infinite; background: #660000; padding: 15px 30px; border-radius: 10px;">CLICK HERE TO PLAY</div>
        <div style="font-size: 18px; color: #ffcccc; margin-top: 20px;">Zombie Tetris Game</div>
      </div>
      <style>
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        #start-screen:hover {
          background: #330000;
        }
      </style>
    `;

    // Make the entire start screen clickable
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
      const startGame = () => {
        startScreen.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #220000;
            color: #00ff00;
            font-family: Arial Black;
            text-align: center;
          ">
            <div style="font-size: 36px;">STARTING ZOMBTRIS...</div>
            <div style="font-size: 18px; margin-top: 10px; color: #ffcccc;">Loading game engine...</div>
          </div>
        `;

        // Start the actual Phaser game after a brief delay
        setTimeout(() => {
          try {
            container.innerHTML = ''; // Clear the start screen
            StartGame('game-container');
          } catch (error) {
            console.error('Failed to start game:', error);
            container.innerHTML = `
              <div style="
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: #220000;
                color: #ff6666;
                font-family: Arial;
                text-align: center;
              ">
                <div style="font-size: 24px;">Game failed to load</div>
                <div style="font-size: 16px; margin-top: 10px;">Please refresh the page</div>
              </div>
            `;
          }
        }, 1000);
      };

      // Add click and touch event listeners
      startScreen.addEventListener('click', startGame);
      startScreen.addEventListener('touchstart', startGame);

      // Also listen for keyboard
      document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
          startGame();
        }
      });
    }
  }
});
