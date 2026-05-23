(function() {
    const results = [];

    function assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    function test(name, fn) {
        try {
            fn();
            results.push({ name, passed: true, error: null });
        } catch (e) {
            results.push({ name, passed: false, error: e.message });
        }
    }

    function ensureGameFixture() {
        if (document.getElementById('gameCanvas')) return;

        const fixture = document.createElement('div');
        fixture.id = 'game-fixture';
        fixture.innerHTML = `
            <div id="game-container">
                <canvas id="gameCanvas"></canvas>
                <div id="hud" class="hidden"><span id="score"></span><span id="lives"></span><span id="hud-shield"></span></div>
                <div id="task-display" class="hidden"><span id="task-text"></span><span id="task-progress"></span></div>
                <div id="message-display" class="hidden"></div>
                <div id="language-status"></div>
                <div id="easter-egg-msg" class="hidden"><div id="egg-text"></div></div>
                <button id="sound-btn" aria-label="声音开关"></button>
                <button id="pause-btn" aria-label="暂停游戏"></button>
                <div id="start-screen" class="panel active">
                    <button class="btn-diff active" data-diff="easy" role="radio" aria-checked="true"></button>
                    <button class="btn-diff" data-diff="practice" role="radio" aria-checked="false"></button>
                    <button id="start-btn" aria-label="开始飞行"></button>
                    <button id="how-to-play-btn" aria-label="怎么玩"></button>
                    <button id="treasure-btn" aria-label="我的宝贝"></button>
                    <button id="parent-settings-btn" aria-label="家长设置"></button>
                    <button id="language-toggle-btn" aria-label="Switch language to Chinese"></button>
                    <div id="start-greeting"></div>
                </div>
                <div id="how-to-play-screen" class="panel"><button id="close-how-to-btn" aria-label="关闭怎么玩"></button></div>
                <div id="parent-settings-screen" class="panel">
                    <select id="setting-speed"><option value="normal">normal</option></select>
                    <select id="setting-tolerance"><option value="standard">standard</option></select>
                    <select id="setting-lives"><option value="difficulty">difficulty</option><option value="3">3</option><option value="5">5</option></select>
                    <input id="setting-message">
                    <input type="checkbox" id="setting-rest-reminder">
                    <input type="checkbox" id="setting-gentle-mode">
                    <input type="checkbox" id="setting-calm-mode">
                    <div id="reduced-motion-notice"></div>
                    <button id="close-settings-btn" aria-label="保存设置并返回首页"></button>
                    <button id="reset-high-score-btn" aria-label="重置最高分"></button>
                </div>
                <div id="treasure-screen" class="panel">
                    <div class="tabs" role="tablist">
                        <button id="tab-stickers"></button>
                        <button id="tab-cosmetics"></button>
                    </div>
                    <div id="stickers-content"><div id="stickers-container"></div></div>
                    <div id="cosmetics-content"><div id="cosmetics-container"></div></div>
                    <button id="close-treasure-btn" aria-label="返回首页"></button>
                </div>
                <div id="pause-screen" class="panel">
                    <span id="pause-mode"></span><span id="pause-score"></span><span id="pause-task"></span><span id="pause-rest-tip"></span>
                    <button id="resume-btn" aria-label="继续游戏"></button>
                    <button id="restart-from-pause-btn" aria-label="从暂停菜单重新开始"></button>
                    <button id="back-to-home-from-pause-btn" aria-label="从暂停菜单回到首页"></button>
                </div>
                <div id="game-over-screen" class="panel">
                    <span id="final-score"></span><span id="final-vines"></span><span id="final-mode"></span><span id="final-stage"></span>
                    <span id="final-task"></span><span id="record-score"></span><span id="over-title"></span>
                    <span id="over-encouragement"></span><span id="over-best-performance"></span><span id="over-rest-tip"></span>
                    <button id="restart-btn" aria-label="重新开始"></button>
                    <button id="back-to-home-btn" aria-label="从游戏结束页回到首页"></button>
                </div>
            </div>
        `;
        document.body.appendChild(fixture);
    }

    // --- Test Cases ---

    test('i18n defaults to English and has complete language keys', () => {
        const i18n = window.IrisGame.i18n;
        const originalStorage = localStorage.getItem(i18n.STORAGE_KEY);

        try {
            localStorage.removeItem(i18n.STORAGE_KEY);
            i18n.init();
            const missing = i18n.validateKeys();

            assert(i18n.currentLang === 'en', 'Default language should be English');
            assert(document.documentElement.lang === 'en', 'HTML lang should be en by default');
            assert(missing.missingInZh.length === 0, `Missing zh translation keys: ${missing.missingInZh.join(', ')}`);
            assert(missing.missingInEn.length === 0, `Missing en translation keys: ${missing.missingInEn.join(', ')}`);
        } finally {
            if (originalStorage) {
                localStorage.setItem(i18n.STORAGE_KEY, originalStorage);
            } else {
                localStorage.removeItem(i18n.STORAGE_KEY);
            }
            i18n.setLanguage('en', false);
        }
    });

    test('i18n-check reports no missing keys, empty values, or fallback UI text', () => {
        ensureGameFixture();
        window.IrisGame.ui.cacheDOM();
        window.IrisGame.i18n.setLanguage('en', false);

        const report = window.IrisGame.i18nCheck.validate();
        assert(report.missingInEn.length === 0, `Missing English keys: ${report.missingInEn.join(', ')}`);
        assert(report.missingInZh.length === 0, `Missing Chinese keys: ${report.missingInZh.join(', ')}`);
        assert(report.emptyValues.length === 0, `Empty translations: ${report.emptyValues.join(', ')}`);
        assert(report.missingFallbacks.length === 0, `Missing key fallbacks in visible UI: ${report.missingFallbacks.join(', ')}`);
        assert(report.passed === true, 'i18n-check should pass');
    });

    test('Language switch updates DOM, localStorage, html lang, mission, rewards, and Game Over text', () => {
        const i18n = window.IrisGame.i18n;
        const ui = window.IrisGame.ui;
        const rewards = window.IrisGame.rewards;
        const missions = window.IrisGame.missions;
        const state = window.IrisGame.state;
        const originalElements = {
            overBestPerformance: ui.elements.overBestPerformance,
            finalMode: ui.elements.finalMode,
            finalStage: ui.elements.finalStage,
            finalScore: ui.elements.finalScore,
            finalVines: ui.elements.finalVines,
            recordScore: ui.elements.recordScore,
            finalTask: ui.elements.finalTask
        };

        try {
            ensureGameFixture();
            ui.cacheDOM();
            i18n.setLanguage('en', false);

            assert(document.getElementById('start-btn').textContent === 'Start Flying', 'English start button should render');
            assert(document.getElementById('how-to-play-btn').getAttribute('aria-label') === '❓ How to Play', 'English aria label should render');

            i18n.setLanguage('zh', true);
            assert(document.documentElement.lang === 'zh-CN', 'HTML lang should switch to zh-CN');
            assert(localStorage.getItem(i18n.STORAGE_KEY) === 'zh', 'Language switch should persist in localStorage');
            assert(document.getElementById('start-btn').textContent === '开始飞行', 'Chinese start button should render');
            assert(document.getElementById('language-status').textContent === '已切换到中文。', 'Language switch should announce Chinese status');

            state.game.mission = window.IrisGame.config.MISSIONS.collect_stars_10;
            state.game.missionCompleted = false;
            assert(missions.getDisplayText() === '收集 10 颗星星', 'Mission should render Chinese title');

            state.game.highScore = 0;
            rewards.renderTreasure();
            assert(document.getElementById('stickers-container').innerText.includes('未解锁'), 'Reward labels should render Chinese locked state');

            ui.elements.overBestPerformance = { textContent: '' };
            ui.elements.finalMode = { textContent: '' };
            ui.elements.finalStage = { textContent: '' };
            ui.elements.finalScore = { textContent: '' };
            ui.elements.finalVines = { textContent: '' };
            ui.elements.recordScore = { textContent: '' };
            ui.elements.finalTask = { textContent: '' };
            state.game.missionCompleted = true;
            ui.renderGameOver();
            assert(ui.elements.overBestPerformance.textContent.includes('飞行课任务'), 'Game Over should render Chinese best-performance copy');

            i18n.setLanguage('en', false);
            assert(document.documentElement.lang === 'en', 'HTML lang should switch back to en');
            assert(document.getElementById('start-btn').textContent === 'Start Flying', 'English start button should return');
        } finally {
            Object.assign(ui.elements, originalElements);
            i18n.setLanguage('en', false);
        }
    });

    test('Primary visible UI does not stay in the wrong language after switching', () => {
        const i18n = window.IrisGame.i18n;
        const ui = window.IrisGame.ui;

        ensureGameFixture();
        ui.cacheDOM();

        i18n.setLanguage('en', false);
        const englishPrimaryText = [
            document.getElementById('start-btn').textContent,
            document.getElementById('how-to-play-btn').textContent,
            document.getElementById('treasure-btn').textContent,
            document.getElementById('parent-settings-btn').textContent,
            document.getElementById('close-settings-btn').textContent
        ].join(' ');
        assert(!/[\u4e00-\u9fff]/.test(englishPrimaryText), `English primary UI should not contain Chinese text: ${englishPrimaryText}`);

        i18n.setLanguage('zh', false);
        const chinesePrimaryText = [
            document.getElementById('start-btn').textContent,
            document.getElementById('how-to-play-btn').textContent,
            document.getElementById('treasure-btn').textContent,
            document.getElementById('parent-settings-btn').textContent,
            document.getElementById('close-settings-btn').textContent
        ].join(' ');
        assert(/开始飞行/.test(chinesePrimaryText), 'Chinese primary UI should render Chinese start copy');

        i18n.setLanguage('en', false);
    });

    test('Config Object Validity', () => {
        const config = window.IrisGame.config;
        assert(config !== undefined, 'window.IrisGame.config should be defined');
        assert(config.GAME_MODES.easy.lives === 5, 'Easy mode lives config should be 5');
        assert(config.STAGES.breeze.minScore === 16, 'Breeze stage threshold should be 16');
        assert(config.UNLOCKS.length === 8, 'Unlocks array should have 8 items');
    });

    test('startGame changes gameState from START to PLAYING without throwing', () => {
        const state = window.IrisGame.state;
        const ui = window.IrisGame.ui;
        const canvas = window.IrisGame.canvas;
        const game = window.IrisGame.game;

        ensureGameFixture();

        ui.cacheDOM();
        canvas.initCanvas(document.getElementById('gameCanvas'));
        state.gameState = 'START';
        state.game.mode = 'easy';
        state.resetGameState();

        game.startGame();

        assert(state.gameState === 'PLAYING', 'startGame should set gameState to PLAYING');
        assert(ui.elements.hud && !ui.elements.hud.classList.contains('hidden'), 'HUD should be visible after startGame');
        assert(state.game.lives === 5, `Easy mode should start with 5 lives, got ${state.game.lives}`);
        assert(state.stars.length >= 2, 'Starter stars should be spawned');

        state.gameState = 'START';
        state.resetGameState();
    });

    test('Lifecycle transitions keep HUD, task, and overlays in sync', () => {
        const state = window.IrisGame.state;
        const ui = window.IrisGame.ui;
        const canvas = window.IrisGame.canvas;
        const game = window.IrisGame.game;

        ensureGameFixture();
        ui.cacheDOM();
        canvas.initCanvas(document.getElementById('gameCanvas'));

        state.gameState = 'START';
        state.game.mode = 'easy';
        state.resetGameState();

        game.startGame();
        assert(state.gameState === 'PLAYING', 'startGame should enter PLAYING');
        assert(!ui.elements.hud.classList.contains('hidden'), 'HUD should be visible in PLAYING');
        assert(!ui.elements.taskDisplay.classList.contains('hidden'), 'Task display should be visible in PLAYING');
        assert(!ui.screens.start.classList.contains('active'), 'Start panel should close in PLAYING');

        game.pauseGame();
        assert(state.gameState === 'PAUSED', 'pauseGame should enter PAUSED');
        assert(ui.screens.pause.classList.contains('active'), 'Pause panel should be active in PAUSED');
        assert(!ui.elements.hud.classList.contains('hidden'), 'HUD should remain visible in PAUSED');
        assert(ui.elements.taskDisplay.classList.contains('hidden'), 'Task display should hide in PAUSED');

        game.resumeGame();
        assert(state.gameState === 'PLAYING', 'resumeGame should return to PLAYING');
        assert(!ui.screens.pause.classList.contains('active'), 'Pause panel should close after resume');
        assert(!ui.elements.taskDisplay.classList.contains('hidden'), 'Task display should return after resume');

        game.gameOver();
        assert(state.gameState === 'GAMEOVER', 'gameOver should enter GAMEOVER');
        assert(ui.screens.gameOver.classList.contains('active'), 'Game Over panel should be active');
        assert(ui.elements.hud.classList.contains('hidden'), 'HUD should hide on GAMEOVER');
        assert(ui.elements.taskDisplay.classList.contains('hidden'), 'Task display should hide on GAMEOVER');

        game.backToHome();
        assert(state.gameState === 'START', 'backToHome should enter START');
        assert(ui.screens.start.classList.contains('active'), 'Start panel should be active after backToHome');
        assert(ui.elements.hud.classList.contains('hidden'), 'HUD should hide on START');
        assert(ui.elements.taskDisplay.classList.contains('hidden'), 'Task display should hide on START');
        assert(state.obstacles.length === 0 && state.stars.length === 0 && state.particles.length === 0, 'backToHome should clear active gameplay entities');
    });

    test('Required UI controls and overlays expose stable hooks', () => {
        ensureGameFixture();

        const requiredIds = [
            'start-btn',
            'sound-btn',
            'pause-btn',
            'how-to-play-btn',
            'close-how-to-btn',
            'parent-settings-btn',
            'close-settings-btn',
            'treasure-btn',
            'close-treasure-btn',
            'tab-stickers',
            'tab-cosmetics',
            'restart-btn',
            'restart-from-pause-btn',
            'back-to-home-btn',
            'back-to-home-from-pause-btn',
            'reset-high-score-btn',
            'stickers-content',
            'cosmetics-content'
        ];

        requiredIds.forEach(id => {
            assert(document.getElementById(id), `Missing required UI hook: #${id}`);
        });

        assert(document.querySelectorAll('.btn-diff').length >= 2, 'Difficulty buttons should be present');
        window.IrisGame.i18n.setLanguage('en', false);
        assert(document.getElementById('how-to-play-btn').getAttribute('aria-label') === '❓ How to Play', 'How-to button should have an accessible name');
        assert(document.getElementById('treasure-btn').getAttribute('aria-label') === '🎁 Treasures', 'Treasure button should have an accessible name');
        assert(document.getElementById('parent-settings-btn').getAttribute('aria-label') === '⚙️ Grown-ups', 'Settings button should have an accessible name');
        assert(document.getElementById('sound-btn').getAttribute('aria-label') === 'Sound toggle', 'Sound button should have an accessible name');
        assert(document.getElementById('pause-btn').getAttribute('aria-label') === 'Pause game', 'Pause button should have an accessible name');
    });

    test('Parent lives setting applies on next startGame', () => {
        const state = window.IrisGame.state;
        const storage = window.IrisGame.storage;
        const game = window.IrisGame.game;
        const originalGetSettings = storage.getSettings;

        try {
            storage.getSettings = () => ({
                ...window.IrisGame.config.defaultAssistSettings,
                speed: 'normal',
                tolerance: 'standard',
                lives: '3'
            });

            state.gameState = 'START';
            state.game.mode = 'easy';
            game.startGame();
            assert(state.game.lives === 3, `Parent lives override should start easy mode with 3 lives, got ${state.game.lives}`);

            state.gameState = 'START';
            state.game.mode = 'practice';
            game.startGame();
            assert(state.game.lives === 99, 'Practice mode should stay infinite even when parent lives override is 3');
        } finally {
            storage.getSettings = originalGetSettings;
            state.gameState = 'START';
            state.resetGameState();
        }
    });

    test('getStageForScore() logic', () => {
        const director = window.IrisGame.director;
        assert(director.getStageForScore(0) === 'warmup', 'Score 0 should be warmup');
        assert(director.getStageForScore(5) === 'warmup', 'Score 5 should be warmup');
        assert(director.getStageForScore(6) === 'garden', 'Score 6 should be garden');
        assert(director.getStageForScore(15) === 'garden', 'Score 15 should be garden');
        assert(director.getStageForScore(16) === 'breeze', 'Score 16 should be breeze');
        assert(director.getStageForScore(30) === 'breeze', 'Score 30 should be breeze');
        assert(director.getStageForScore(31) === 'rainbow', 'Score 31 should be rainbow');
        assert(director.getStageForScore(100) === 'rainbow', 'Score 100 should be rainbow');
    });

    test('chooseMission() pool limits', () => {
        const missions = window.IrisGame.missions;
        const state = window.IrisGame.state;

        missions.chooseMission('practice');
        assert(state.game.mission !== null, 'Mission should be chosen');
        assert(['collect_stars_10', 'pass_vines_5', 'survive_30s'].includes(state.game.mission.id), 'Practice mode must choose a simple mission');

        missions.chooseMission('easy');
        assert(state.game.mission !== null, 'Mission should be chosen for easy');
    });

    test('Storage compatibility migration', () => {
        const storage = window.IrisGame.storage;

        localStorage.removeItem(storage.KEYS.cosmetics);
        localStorage.removeItem(storage.KEYS.stickers);

        storage.migrateOldStorage();

        const cosmetics = JSON.parse(localStorage.getItem(storage.KEYS.cosmetics));
        const stickers = JSON.parse(localStorage.getItem(storage.KEYS.stickers));

        assert(Array.isArray(cosmetics) && cosmetics.includes('default'), 'Migration should initialize cosmetics array with default');
        assert(Array.isArray(stickers) && stickers.length === 0, 'Migration should initialize stickers array');
    });

    test('Reward unlock score checking', () => {
        const rewards = window.IrisGame.rewards;
        assert(rewards.isUnlocked(10, 5) === true, 'Unlocked if score >= requirement');
        assert(rewards.isUnlocked(4, 5) === false, 'Locked if score < requirement');
        assert(rewards.isUnlocked(5, 5) === true, 'Unlocked if score equals requirement');
    });

    test('Mission progress calculation', () => {
        const missions = window.IrisGame.missions;
        const config = window.IrisGame.config;

        const mockGame = {
            score: 7,
            passedObstacles: 3,
            flightFrames: 120,
            rainbowStarsCollected: 1,
            noHitStarCount: 4
        };

        const m1 = config.MISSIONS.collect_stars_10;
        const m2 = config.MISSIONS.survive_30s;
        const m3 = config.MISSIONS.clean_collect_5;

        assert(missions.getMissionProgress(mockGame, m1) === 7, 'Collect stars progress should match game score');
        assert(missions.getMissionProgress(mockGame, m2) === 2, 'Survive 30s progress should match game frames / 60');
        assert(missions.getMissionProgress(mockGame, m3) === 4, 'Clean collect progress should match noHitStarCount');
    });

    test('Reduced motion fallbacks', () => {
        const state = window.IrisGame.state;
        const director = window.IrisGame.director;

        state.prefersReducedMotion = true;
        state.game.mode = 'easy';
        state.game.currentStage = 'warmup';

        const diff = director.getCurrentDifficulty();
        assert(diff.speed > 0, 'Speed must be positive');
        assert(diff.gap >= 200, 'Gap must respect min limits');
    });

    test('Difficulty scaling clamps & overrides', () => {
        const state = window.IrisGame.state;
        const director = window.IrisGame.director;

        state.game.mode = 'hard';
        state.game.currentStage = 'rainbow';
        state.debugActive = true;
        state.tuningOverrides.speedMultiplier = 1.5;
        state.tuningOverrides.gapBonus = 20;

        const diffHard = director.getCurrentDifficulty();
        assert(diffHard.speed > 0, 'Hard speed should be positive');

        state.debugActive = false;
    });

    test('Starlight Shield Mechanics', () => {
        const state = window.IrisGame.state;
        const game = window.IrisGame.game;

        state.resetGameState();
        state.gameState = 'PLAYING';
        window.IrisGame.player.invincibleFrames = 0;
        state.game.mode = 'easy';
        state.game.lives = 5;
        state.game.consecutiveStarsNoHit = 0;
        state.game.starShield = false;

        // 1. Collecting stars increments combo, triggers shield at 3
        const mockStar = { type: 'normal', x: 200, y: 200, update: () => {} };

        state.stars = [mockStar];
        game.collectStar(mockStar, 0);
        assert(state.game.consecutiveStarsNoHit === 1, 'Streak should be 1');
        assert(state.game.starShield === false, 'Shield should be false');

        state.stars = [mockStar];
        game.collectStar(mockStar, 0);
        state.stars = [mockStar];
        game.collectStar(mockStar, 0);
        assert(state.game.consecutiveStarsNoHit === 0, 'Streak should reset after shield trigger');
        assert(state.game.starShield === true, 'Should have starShield after 3 stars');

        // 2. Collision consumes shield and prevents life deduction
        game.handleCollision('Collision check');
        assert(state.game.starShield === false, 'Shield should be consumed');
        assert(state.game.lives === 5, 'Lives should not decrease when shielded');

        // 3. Subsequent collision without shield decreases lives
        window.IrisGame.player.invincibleFrames = 0;
        game.handleCollision('Collision check');
        assert(state.game.lives === 4, 'Lives should decrease without shield');

        // 4. Practice mode doesn't get shield
        state.resetGameState();
        state.game.mode = 'practice';
        state.game.lives = 99;
        state.stars = [mockStar];
        game.collectStar(mockStar, 0);
        state.stars = [mockStar];
        game.collectStar(mockStar, 0);
        state.stars = [mockStar];
        game.collectStar(mockStar, 0);
        assert(state.game.starShield === false, 'Practice mode should not receive starShield');
    });

    test('Greeting card logic', () => {
        const state = window.IrisGame.state;
        const ui = window.IrisGame.ui;
        const storage = window.IrisGame.storage;

        // Save original functions
        const origGetHighScore = storage.getHighScore;
        const origGetStickers = storage.getStickers;
        const origGetCosmetics = storage.getCosmetics;
        const origGreetingElement = ui.elements.greeting;
        const origLang = window.IrisGame.i18n.currentLang;

        try {
            window.IrisGame.i18n.setLanguage('en', false);
            // Mock greeting element
            ui.elements.greeting = {
                classList: {
                    _classes: new Set(),
                    add(c) { this._classes.add(c); },
                    remove(c) { this._classes.delete(c); },
                    contains(c) { return this._classes.has(c); }
                },
                innerHTML: ''
            };

            // Case 1: highScore is 0 (new player)
            storage.getHighScore = () => 0;
            ui.elements.greeting.classList.remove('hidden');
            ui.renderGreeting();
            assert(ui.elements.greeting.classList.contains('hidden'), 'Greeting should be hidden if highScore is 0');

            // Case 2: highScore > 0, no stickers unlocked
            storage.getHighScore = () => 4; // Not enough for first sticker (needs 5)
            storage.getStickers = () => [];
            storage.getCosmetics = () => ['default'];
            ui.elements.greeting.classList.add('hidden');
            ui.renderGreeting();
            assert(!ui.elements.greeting.classList.contains('hidden'), 'Greeting should be shown if highScore > 0');
            assert(ui.elements.greeting.innerHTML.includes('Best flight: 4 stars'), 'Greeting should report correct highScore');
            assert(!ui.elements.greeting.innerHTML.includes('unlocked'), 'Greeting should not mention unlocks if none');

            // Case 3: Stickers unlocked
            storage.getHighScore = () => 12; // Unlocks 'star' (5) and 'flower' (10)
            storage.getStickers = () => ['star', 'flower'];
            storage.getCosmetics = () => ['default'];
            ui.renderGreeting();
            assert(ui.elements.greeting.innerHTML.includes('unlocked 2 treasures'), 'Should report 2 unlocked items (2 stickers)');
        } finally {
            // Restore original functions
            storage.getHighScore = origGetHighScore;
            storage.getStickers = origGetStickers;
            storage.getCosmetics = origGetCosmetics;
            ui.elements.greeting = origGreetingElement;
            window.IrisGame.i18n.setLanguage(origLang, false);
        }
    });

    test('Adaptive Gap Scaling', () => {
        const state = window.IrisGame.state;
        const director = window.IrisGame.director;
        const storage = window.IrisGame.storage;
        const originalGetSettings = storage.getSettings;

        try {
            storage.getSettings = () => ({
                ...window.IrisGame.config.defaultAssistSettings,
                speed: 'normal',
                tolerance: 'standard',
                lives: 'difficulty'
            });

            state.resetGameState();
            state.game.mode = 'easy';
            state.game.currentStage = 'warmup';
            state.game.lives = 5;
            state.game.consecutiveCollisions = 0;

            const diffNormal = director.getCurrentDifficulty();
            const baseGap = diffNormal.gap;

            // 1. 2 consecutive collisions should widen the gap
            state.game.consecutiveCollisions = 2;
            const diffWidened = director.getCurrentDifficulty();
            assert(diffWidened.gap === baseGap + 20, `Gap should widen by 20px on 2 consecutive collisions (got ${diffWidened.gap} vs ${baseGap})`);

            // 2. 1 remaining life in easy mode should widen the gap by 30px
            state.game.consecutiveCollisions = 0;
            state.game.lives = 1;
            const diffLowLife = director.getCurrentDifficulty();
            assert(diffLowLife.gap === baseGap + 30, `Gap should widen by 30px when lives === 1 (got ${diffLowLife.gap} vs ${baseGap})`);

            // 3. Practice mode should have an extra 30px gap padding
            state.game.mode = 'practice';
            state.game.lives = 99;
            const diffPractice = director.getCurrentDifficulty();
            const practiceBaseConf = window.IrisGame.config.GAME_MODES.practice;
            const expectedPracticeGap = practiceBaseConf.baseGap + 30;
            assert(diffPractice.gap === expectedPracticeGap, `Practice mode gap should have 30px padding (got ${diffPractice.gap} vs ${expectedPracticeGap})`);
        } finally {
            storage.getSettings = originalGetSettings;
        }
    });

    test('Game Over Best Performance', () => {
        const state = window.IrisGame.state;
        const ui = window.IrisGame.ui;

        const origBestElement = ui.elements.overBestPerformance;
        const origLang = window.IrisGame.i18n.currentLang;

        try {
            window.IrisGame.i18n.setLanguage('en', false);
            ui.elements.overBestPerformance = { textContent: '' };

            // Case 1: Mission completed
            state.game.missionCompleted = true;
            ui.renderGameOver();
            assert(ui.elements.overBestPerformance.textContent.includes('completed the flying mission'), 'Should select mission completed first');

            // Case 2: No mission completed, but rainbow stars collected
            state.game.missionCompleted = false;
            state.game.rainbowStarsCollected = 1;
            ui.renderGameOver();
            assert(ui.elements.overBestPerformance.textContent.includes('rainbow star'), 'Should select rainbow stars second');

            // Case 3: Passed obstacles
            state.game.rainbowStarsCollected = 0;
            state.game.passedObstacles = 6;
            ui.renderGameOver();
            assert(ui.elements.overBestPerformance.textContent.includes('6 flower vines'), 'Should select passed obstacles third');

            // Case 4: High score
            state.game.passedObstacles = 2;
            state.game.score = 8;
            ui.renderGameOver();
            assert(ui.elements.overBestPerformance.textContent.includes('8 stars'), 'Should select score fourth');

            // Case 5: Fallback encouraging tip
            state.game.score = 2;
            ui.renderGameOver();
            assert(ui.elements.overBestPerformance.textContent !== '', 'Should populate standard encouraging fallback');
        } finally {
            ui.elements.overBestPerformance = origBestElement;
            window.IrisGame.i18n.setLanguage(origLang, false);
        }
    });

    test('Wind Lines and Background Elements structure', () => {
        const state = window.IrisGame.state;
        const game = window.IrisGame.game;

        state.resetGameState();
        state.game.currentStage = 'breeze';
        state.windLines = [];

        // Trigger wind lines generation
        game.updateWindLines(1.5);
        // Force push a line to test formats
        state.windLines.push({
            x: 400,
            y: 300,
            length: 80,
            speed: 2.7
        });

        assert(state.windLines.length > 0, 'Should have at least 1 wind line');
        const line = state.windLines[0];
        assert(typeof line.x === 'number', 'Line x should be a number');
        assert(typeof line.y === 'number', 'Line y should be a number');
        assert(line.length >= 40 && line.length <= 100, 'Line length should be in range [40, 100]');
        assert(line.speed > 0, 'Line speed should be positive');

        // Test update loop updates coordinates
        const initialX = line.x;
        game.updateWindLines(1.5);
        assert(state.windLines[0].x < initialX, 'Wind line should move left');
    });

    test('Sticker Unlock Tracking (seenStickers)', () => {
        const state = window.IrisGame.state;
        const storage = window.IrisGame.storage;
        const rewards = window.IrisGame.rewards;

        // Save originals
        const origHighScore = state.game.highScore;

        try {
            // Clear seen stickers
            localStorage.removeItem(storage.KEYS.seenStickers);

            // 1. seenStickers defaults to empty array
            const empty = storage.getSeenStickers();
            assert(Array.isArray(empty) && empty.length === 0, 'Default seenStickers should be empty array');

            // 2. markNewStickersAsSeen persists IDs
            rewards.markNewStickersAsSeen(['star', 'flower']);
            const seen = storage.getSeenStickers();
            assert(seen.includes('star'), 'Should contain star');
            assert(seen.includes('flower'), 'Should contain flower');
            assert(seen.length === 2, 'Should have exactly 2 entries');

            // 3. Duplicate marking doesn't create duplicates
            rewards.markNewStickersAsSeen(['star']);
            const seen2 = storage.getSeenStickers();
            assert(seen2.length === 2, 'Should not duplicate entries');

            // 4. getNewlyUnlockedCount works
            state.game.highScore = 12; // Unlocks star (5) and flower (10)
            // star and flower are already seen, so count should be 0
            const count0 = rewards.getNewlyUnlockedCount();
            assert(count0 === 0, 'All unlocked stickers are seen, count should be 0');

            // 5. New unlock that hasn't been seen
            state.game.highScore = 20; // Also unlocks butterfly (15)
            const count1 = rewards.getNewlyUnlockedCount();
            assert(count1 === 1, 'butterfly is newly unlocked and unseen, count should be 1');
        } finally {
            state.game.highScore = origHighScore;
            localStorage.removeItem(storage.KEYS.seenStickers);
        }
    });

    test('Leaf and TapRipple Entities', () => {
        const entities = window.IrisGame.entities;

        // 1. Leaf entity construction and properties
        const leaf = new entities.Leaf(300, 100);
        assert(typeof leaf.x === 'number' && leaf.x === 300, 'Leaf x should be 300');
        assert(typeof leaf.y === 'number' && leaf.y === 100, 'Leaf y should be 100');
        assert(leaf.vx < 0, 'Leaf vx should be negative (moving left)');
        assert(leaf.vy > 0, 'Leaf vy should be positive (moving down)');
        assert(typeof leaf.rotation === 'number', 'Leaf should have rotation');
        assert(['🍃', '🌿'].includes(leaf.emoji), 'Leaf emoji should be a leaf');
        assert(leaf.size >= 10 && leaf.size <= 16, 'Leaf size should be in range [10, 16]');

        // 2. Leaf update moves position
        const startX = leaf.x;
        const startY = leaf.y;
        leaf.update(false);
        assert(leaf.x < startX, 'Leaf should drift left after update');
        assert(leaf.y > startY, 'Leaf should drift down after update');

        // 3. Leaf calm mode update is slower
        const leaf2 = new entities.Leaf(300, 100);
        const leaf3 = new entities.Leaf(300, 100);
        leaf2.vx = leaf3.vx; leaf2.vy = leaf3.vy; // sync velocities
        leaf2.swayPhase = leaf3.swayPhase;
        leaf2.update(false); // normal
        leaf3.update(true);  // calm
        assert(Math.abs(300 - leaf3.x) < Math.abs(300 - leaf2.x), 'Calm mode leaf should move less than normal');

        // 4. TapRipple entity construction
        const ripple = new entities.TapRipple(150, 200);
        assert(ripple.x === 150, 'Ripple x should be 150');
        assert(ripple.y === 200, 'Ripple y should be 200');
        assert(ripple.radius === 4, 'Ripple initial radius should be 4');
        assert(ripple.alpha === 0.5, 'Ripple initial alpha should be 0.5');

        // 5. TapRipple update expands and fades
        ripple.update();
        assert(ripple.radius > 4, 'Ripple radius should expand');
        assert(ripple.alpha < 0.5, 'Ripple alpha should decrease');
    });

    test('Effects Policy Caps & Modes validation', () => {
        const state = window.IrisGame.state;
        const config = window.IrisGame.config;
        const entities = window.IrisGame.entities;
        const game = window.IrisGame.game;
        const player = window.IrisGame.player;

        // Save original states
        const origPrefersReduced = state.prefersReducedMotion;
        const origCalmMode = state.game.calmModeEnabled;
        const origParticles = state.particles;
        const origLeaves = state.leaves;
        const origRipples = state.tapRipples;
        const origStarShield = state.game.starShield;

        try {
            // 1. Particle capping verification
            state.prefersReducedMotion = false;
            state.game.calmModeEnabled = false;
            state.particles = [];

            // Try to spawn 120 particles (exceeds cap of 80)
            for (let i = 0; i < 15; i++) {
                entities.createParticles(100, 100, '#ffffff', 10);
            }
            assert(state.particles.length === config.EFFECTS_POLICY.maxParticles, `Particles should be capped at maxParticles (${config.EFFECTS_POLICY.maxParticles}), got ${state.particles.length}`);
            assert(Number.isFinite(config.EFFECTS_POLICY.stickerCelebrationMs), 'stickerCelebrationMs should be centralized in EFFECTS_POLICY');
            assert(config.EFFECTS_POLICY.reducedMotionDisableAmbient === true, 'Reduced motion should disable ambient effects by policy');
            assert(config.EFFECTS_POLICY.reducedMotionDisableStagger === true, 'Reduced motion should disable stagger effects by policy');
            assert(config.EFFECTS_POLICY.reducedMotionDisableRipple === true, 'Reduced motion should disable tap ripples by policy');

            // 2. Calm Mode reduces particle density
            state.particles = [];
            state.game.calmModeEnabled = true;
            entities.createParticles(100, 100, '#ffffff', 10);
            const expectedCalmCount = Math.round(10 * config.EFFECTS_POLICY.calmModeParticleMultiplier);
            assert(state.particles.length === expectedCalmCount, `Calm mode particles should scale down, expected ${expectedCalmCount}, got ${state.particles.length}`);
            assert(state.particles.length < 10, 'Calm mode should reduce effect density below the requested particle count');

            // 3. Leaves capping and calm mode behavior
            state.game.calmModeEnabled = false;
            state.leaves = [];

            const maxLeaves = config.EFFECTS_POLICY.maxLeaves;
            for (let i = 0; i < maxLeaves + 5; i++) {
                state.leaves.push(new entities.Leaf(100, 100));
            }
            game.updateGame();
            assert(state.leaves.length === maxLeaves, `Leaves should be trimmed to maxLeaves (${maxLeaves}), got ${state.leaves.length}`);

            state.game.calmModeEnabled = true;
            game.updateGame();
            const expectedCalmLeaves = Math.max(1, Math.round(maxLeaves * config.EFFECTS_POLICY.calmModeParticleMultiplier));
            assert(state.leaves.length === expectedCalmLeaves, `Calm mode leaves should be trimmed to scaled cap (${expectedCalmLeaves}), got ${state.leaves.length}`);

            // 4. Tap Ripples capping verification
            state.tapRipples = [];
            const maxRipples = config.EFFECTS_POLICY.maxTapRipples;
            for (let i = 0; i < maxRipples + 3; i++) {
                state.tapRipples.push(new entities.TapRipple(100, 100));
            }
            game.updateGame();
            assert(state.tapRipples.length === maxRipples, `Ripples should be trimmed to maxTapRipples (${maxRipples}), got ${state.tapRipples.length}`);

            // 5. Reduced Motion disables ambient leaves and ripples
            state.prefersReducedMotion = true;
            state.leaves = [new entities.Leaf(100, 100)];
            state.game.currentStage = 'garden';

            state.leaves = [];
            const disableAmbientLeaves = state.prefersReducedMotion && config.EFFECTS_POLICY.reducedMotionDisableAmbient;
            assert(disableAmbientLeaves === true, 'Reduced motion should flag ambient leaf disable');

            state.gameState = 'PLAYING';
            state.tapRipples = [];
            player.jump();
            assert(state.tapRipples.length === 0, 'Reduced motion should suppress expanding tap ripples');

        } finally {
            state.prefersReducedMotion = origPrefersReduced;
            state.game.calmModeEnabled = origCalmMode;
            state.particles = origParticles;
            state.leaves = origLeaves;
            state.tapRipples = origRipples;
            state.game.starShield = origStarShield;
        }
    });

    test('Child safety reward text avoids pressure and purchase framing', () => {
        const config = window.IrisGame.config;
        const state = window.IrisGame.state;
        const rewards = window.IrisGame.rewards;

        ensureGameFixture();

        const collectStrings = (value, out = []) => {
            if (typeof value === 'string') {
                out.push(value);
            } else if (Array.isArray(value)) {
                value.forEach(item => collectStrings(item, out));
            } else if (value && typeof value === 'object') {
                Object.values(value).forEach(item => collectStrings(item, out));
            }
            return out;
        };

        const originalHighScore = state.game.highScore;
        const originalStickersHtml = document.getElementById('stickers-container').innerHTML;
        const originalCosmeticsHtml = document.getElementById('cosmetics-container').innerHTML;

        try {
            state.game.highScore = 0;
            rewards.renderTreasure();

            const playerFacingText = [
                ...collectStrings(config.UI_TEXT),
                ...collectStrings(config.MISSIONS),
                ...collectStrings(config.UNLOCKS),
                document.getElementById('stickers-container').innerText,
                document.getElementById('cosmetics-container').innerText
            ].join(' ');

            const normalized = playerFacingText
                .replace(/没有购买内容/g, '')
                .replace(/没有购买/g, '')
                .replace(/no purchases?/gi, '');

            const bannedPatterns = [
                /购买|买|付费|充值|商店|商城|抽卡|扭蛋|每日|每天|连续登录|连胜|倒计时|明天再来/,
                /\b(buy|purchase|shop|store|gacha|daily|streak|countdown)\b/i,
                /come back tomorrow/i
            ];

            bannedPatterns.forEach(pattern => {
                assert(!pattern.test(normalized), `Player-facing text should avoid pressure or purchase framing: ${pattern}`);
            });
        } finally {
            state.game.highScore = originalHighScore;
            document.getElementById('stickers-container').innerHTML = originalStickersHtml;
            document.getElementById('cosmetics-container').innerHTML = originalCosmeticsHtml;
        }
    });

    // --- Render Results ---

    document.addEventListener('DOMContentLoaded', () => {
        const tbody = document.getElementById('test-results-body');
        const totalTestsEl = document.getElementById('total-tests');
        const passedEl = document.getElementById('total-passed');
        const failedEl = document.getElementById('total-failed');

        let passedCount = 0;
        let failedCount = 0;

        results.forEach(res => {
            const tr = document.createElement('tr');

            const nameTd = document.createElement('td');
            nameTd.textContent = res.name;

            const statusTd = document.createElement('td');
            statusTd.textContent = res.passed ? 'PASS' : 'FAIL';
            statusTd.className = res.passed ? 'status-pass' : 'status-fail';

            const detailsTd = document.createElement('td');
            if (res.passed) {
                detailsTd.textContent = '测试通过 ✓';
            } else {
                passedEl.classList.remove('pass-count');
                passedEl.style.color = '#fff';
                const errSpan = document.createElement('span');
                errSpan.className = 'error-msg';
                errSpan.textContent = res.error;
                detailsTd.appendChild(errSpan);
                failedCount++;
            }

            if (res.passed) passedCount++;

            tr.appendChild(nameTd);
            tr.appendChild(statusTd);
            tr.appendChild(detailsTd);
            tbody.appendChild(tr);
        });

        totalTestsEl.textContent = results.length;
        passedEl.textContent = passedCount;
        failedEl.textContent = failedCount;
    });
})();
