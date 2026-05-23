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
