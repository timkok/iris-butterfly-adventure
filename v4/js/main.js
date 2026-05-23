window.IrisGame = window.IrisGame || {};

function init() {
    try {
        const state = window.IrisGame.state;
        const storage = window.IrisGame.storage;
        const ui = window.IrisGame.ui;
        const canvas = window.IrisGame.canvas;
        const audio = window.IrisGame.audio;
        const debug = window.IrisGame.debug;
        const i18n = window.IrisGame.i18n;

        // 1. Initialize language before UI labels and config-driven copy render.
        i18n.init();

        // 2. Initialize DOM elements and bindings
        ui.init();

        // 3. Load storage states
        storage.migrateOldStorage();
        storage.loadAll(state);

        // 4. Initialize background canvas
        const canvasElement = document.getElementById('gameCanvas');
        if (canvasElement) {
            canvas.initCanvas(canvasElement);
        }

        // 5. Initialize debug listeners
        debug.init();

        // 6. Initialize Sound Switch UI states
        audio.updateMuteUI();

        // 7. Visual reward locks sync
        window.IrisGame.rewards.renderTreasure();

        // 8. Bind key listeners
        setupKeyboardListeners();

        // 9. Bind touch canvas listeners
        setupCanvasInputListeners();

        // 10. Initial screen
        ui.setGameUiVisible(false);
        ui.showScreen('start');

        // 11. Start loop
        requestAnimationFrame(() => window.IrisGame.game.loop());
    } catch (e) {
        console.error('INIT ERROR:', e);
        // Show error visually for debugging
        const errDiv = document.createElement('div');
        errDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:20px;background:red;color:white;font-family:monospace;font-size:14px;z-index:99999;white-space:pre-wrap;';
        errDiv.textContent = 'INIT ERROR: ' + e.message + '\n' + e.stack;
        document.body.appendChild(errDiv);
    }
}

function setupKeyboardListeners() {
    const state = window.IrisGame.state;
    const player = window.IrisGame.player;
    const game = window.IrisGame.game;
    const ui = window.IrisGame.ui;

    window.addEventListener('keydown', (event) => {
        // Space Jump (avoid when focused on inputs or selectors)
        if (event.code === 'Space') {
            const tag = document.activeElement ? document.activeElement.tagName : '';
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) {
                return; // let standard control proceed
            }

            event.preventDefault();
            player.jump();
        }

        // P Key Pause/Resume
        if (event.code === 'KeyP') {
            const tag = document.activeElement ? document.activeElement.tagName : '';
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) {
                return;
            }

            if (state.gameState === 'PLAYING') {
                game.pauseGame();
            } else if (state.gameState === 'PAUSED') {
                game.resumeGame();
            }
        }

        // Escape exit overlay
        if (event.code === 'Escape') {
            event.preventDefault();
            if (state.gameState === 'PAUSED') {
                game.resumeGame();
            } else if (ui.screens.howTo.classList.contains('active')) {
                ui.showScreen('start');
            } else if (ui.screens.settings.classList.contains('active')) {
                ui.saveSettingsFromUI();
                ui.showScreen('start');
                ui.showMessage(window.IrisGame.i18n.t('settings.saved'), 1, 1500);
            } else if (ui.screens.treasure.classList.contains('active')) {
                ui.showScreen('start');
            } else if (ui.screens.gameOver.classList.contains('active')) {
                game.backToHome();
            }
        }
    });
}

function setupCanvasInputListeners() {
    const player = window.IrisGame.player;
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    // Mouse mousedown
    gameContainer.addEventListener('mousedown', (event) => {
        if (event.target.closest('button, select, input, textarea')) return;
        event.preventDefault();
        player.jump();
    });

    // Touch mousedown
    gameContainer.addEventListener('touchstart', (event) => {
        if (event.target.closest('button, select, input, textarea')) return;
        event.preventDefault();
        player.jump();
    }, { passive: false });

    window.addEventListener('touchstart', (event) => {
        const state = window.IrisGame.state;
        if (state.gameState === 'PLAYING') {
            if (event.target.closest('button, select, input, textarea')) return;
            event.preventDefault();
        }
    }, { passive: false });

    window.addEventListener('touchmove', (event) => {
        const state = window.IrisGame.state;
        if (state.gameState === 'PLAYING') {
            if (event.target.closest('button, select, input, textarea')) return;
            event.preventDefault();
        }
    }, { passive: false });

    window.addEventListener('dblclick', (event) => {
        event.preventDefault();
    });
}

// Bootstrap
document.addEventListener('DOMContentLoaded', init);
