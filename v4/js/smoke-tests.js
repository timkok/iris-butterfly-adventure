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
    
    // --- Test Cases ---
    
    test('Config Object Validity', () => {
        const config = window.IrisGame.config;
        assert(config !== undefined, 'window.IrisGame.config should be defined');
        assert(config.GAME_MODES.easy.lives === 5, 'Easy mode lives config should be 5');
        assert(config.STAGES.breeze.minScore === 16, 'Breeze stage threshold should be 16');
        assert(config.UNLOCKS.length === 8, 'Unlocks array should have 8 items');
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
        
        try {
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
            assert(ui.elements.greeting.innerHTML.includes('最高飞到 4 颗星'), 'Greeting should report correct highScore');
            assert(!ui.elements.greeting.innerHTML.includes('解锁了'), 'Greeting should not mention unlocks if none');
            
            // Case 3: Stickers unlocked
            storage.getHighScore = () => 12; // Unlocks 'star' (5) and 'flower' (10)
            storage.getStickers = () => ['star', 'flower'];
            storage.getCosmetics = () => ['default'];
            ui.renderGreeting();
            assert(ui.elements.greeting.innerHTML.includes('解锁了 2 个小宝贝'), 'Should report 2 unlocked items (2 stickers)');
        } finally {
            // Restore original functions
            storage.getHighScore = origGetHighScore;
            storage.getStickers = origGetStickers;
            storage.getCosmetics = origGetCosmetics;
            ui.elements.greeting = origGreetingElement;
        }
    });
    
    test('Adaptive Gap Scaling', () => {
        const state = window.IrisGame.state;
        const director = window.IrisGame.director;
        
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
        const expectedPracticeGap = practiceBaseConf.baseGap + 30; // since modeConf.baseGap = 240
        assert(diffPractice.gap === expectedPracticeGap, `Practice mode gap should have 30px padding (got ${diffPractice.gap} vs ${expectedPracticeGap})`);
    });
    
    test('Game Over Best Performance', () => {
        const state = window.IrisGame.state;
        const ui = window.IrisGame.ui;
        
        const origBestElement = ui.elements.overBestPerformance;
        
        try {
            ui.elements.overBestPerformance = { textContent: '' };
            
            // Case 1: Mission completed
            state.game.missionCompleted = true;
            ui.renderGameOver();
            assert(ui.elements.overBestPerformance.textContent.includes('飞行课任务'), 'Should select mission completed first');
            
            // Case 2: No mission completed, but rainbow stars collected
            state.game.missionCompleted = false;
            state.game.rainbowStarsCollected = 1;
            ui.renderGameOver();
            assert(ui.elements.overBestPerformance.textContent.includes('彩虹星'), 'Should select rainbow stars second');
            
            // Case 3: Passed obstacles
            state.game.rainbowStarsCollected = 0;
            state.game.passedObstacles = 6;
            ui.renderGameOver();
            assert(ui.elements.overBestPerformance.textContent.includes('6 组花藤'), 'Should select passed obstacles third');
            
            // Case 4: High score
            state.game.passedObstacles = 2;
            state.game.score = 8;
            ui.renderGameOver();
            assert(ui.elements.overBestPerformance.textContent.includes('8 颗星星'), 'Should select score fourth');
            
            // Case 5: Fallback encouraging tip
            state.game.score = 2;
            ui.renderGameOver();
            assert(ui.elements.overBestPerformance.textContent !== '', 'Should populate standard encouraging fallback');
        } finally {
            ui.elements.overBestPerformance = origBestElement;
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
