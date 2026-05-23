window.IrisGame = window.IrisGame || {};

window.IrisGame.director = {
    resetRun() {
        const state = window.IrisGame.state;
        state.game.collisionsThisRun = 0;
        state.game.consecutiveCollisions = 0;
        state.game.consecutivePasses = 0;
        state.game.starsCollectedSinceLastRainbow = 0;
        state.game.hintFlags = {
            onboardingHint: false,
            safePracticeHint: false,
            slowDownHint: false
        };
    },
    
    getPhase() {
        const state = window.IrisGame.state;
        const score = state.game.score;
        const frames = state.game.flightFrames;
        
        if (frames < 120) {
            return 'onboarding';
        }
        if (score <= 5) {
            return 'safe_practice';
        }
        if (score <= 15) {
            return 'garden_flow';
        }
        if (score <= 30) {
            return 'breeze_challenge';
        }
        return 'rainbow_mastery';
    },
    
    shouldSpawnObstacle(frameCount, spawnRate) {
        const phase = this.getPhase();
        if (phase === 'onboarding') return false;
        
        const obstacleFrames = frameCount - 120;
        return (obstacleFrames === 0 || (obstacleFrames > 0 && obstacleFrames % spawnRate === 0));
    },
    
    shouldSpawnStar(frameCount, starRate) {
        const phase = this.getPhase();
        if (phase === 'onboarding') {
            return frameCount === 40 || frameCount === 90;
        }
        return frameCount % starRate === 0;
    },
    
    shouldSpawnRainbowStar() {
        const state = window.IrisGame.state;
        if (state.game.mode === 'practice') return false;
        
        const phase = this.getPhase();
        if (phase === 'onboarding' || phase === 'safe_practice') return false;
        
        const targetGap = state.game.gentleModeEnabled ? 12 : 15;
        const baseChance = state.game.consecutivePasses >= 5 ? 0.50 : 0.35;
        const chance = state.game.calmModeEnabled ? (baseChance * 0.9) : baseChance;
        
        if (state.game.score - state.game.lastRainbowStarScore >= targetGap) {
            return Math.random() < chance;
        }
        return false;
    },
    
    chooseObstaclePattern() {
        const phase = this.getPhase();
        if (phase === 'safe_practice') {
            return 'center_gap';
        }
        if (phase === 'garden_flow') {
            return Math.random() < 0.6 ? 'center_gap' : (Math.random() < 0.5 ? 'high_gap' : 'low_gap');
        }
        if (phase === 'breeze_challenge') {
            return Math.random() < 0.4 ? 'gentle_wave' : (Math.random() < 0.5 ? 'high_gap' : 'low_gap');
        }
        return Math.random() < 0.3 ? 'star_path' : (Math.random() < 0.4 ? 'gentle_wave' : 'high_gap');
    },
    
    chooseStarPlacement(pattern) {
        const phase = this.getPhase();
        if (phase === 'onboarding') {
            return 'gap_center';
        }
        if (phase === 'safe_practice') {
            return 'gap_center';
        }
        if (pattern === 'center_gap') {
            return 'pre_gap';
        }
        if (pattern === 'gentle_wave') {
            return 'post_gap';
        }
        return Math.random() < 0.5 ? 'gap_center' : 'random_safe';
    },
    
    getCurrentDifficulty() {
        const state = window.IrisGame.state;
        const modeConf = window.IrisGame.config.GAME_MODES[state.game.mode];
        const stageConf = window.IrisGame.config.STAGES[state.game.currentStage];
        
        const settings = window.IrisGame.storage.getSettings();
        const speedMult = settings.speed === 'slow' ? 0.78 : settings.speed === 'fast' ? 1.14 : 1.0;
        const toleranceAdd = settings.tolerance === 'loose' ? 10 : 0;
        
        // Base growth factor
        let growthFactor = state.game.gentleModeEnabled ? 0.6 : 1.0;
        if (state.game.calmModeEnabled) {
            growthFactor *= window.IrisGame.config.ACCESSIBILITY_SETTINGS.calmModeMultiplier;
        }
        
        const stageSpeedMult = 1 + (stageConf.speedMultiplier - 1) * growthFactor;
        const stageGapReduce = stageConf.gapReduction * growthFactor;
        const stageSpawnRateReduce = stageConf.spawnRateReduction * growthFactor;
        
        let targetSpeed = modeConf.baseSpeed * speedMult * stageSpeedMult;
        let targetStarSpeed = Math.max(0.8, (modeConf.baseSpeed + 0.65) * speedMult * stageSpeedMult);
        
        // Adaptive gap adjustment
        let adaptiveGapPadding = 0;
        if (state.game.mode === 'practice') {
            adaptiveGapPadding = 30;
        } else if (state.game.mode === 'easy') {
            if (state.game.consecutiveCollisions >= 2) {
                adaptiveGapPadding = 20;
            }
            if (state.game.lives === 1) {
                adaptiveGapPadding = Math.max(adaptiveGapPadding, 30);
            }
        } else if (state.game.mode === 'normal') {
            if (state.game.consecutiveCollisions >= 2) {
                adaptiveGapPadding = 12;
            }
            if (state.game.lives === 1) {
                adaptiveGapPadding = Math.max(adaptiveGapPadding, 20);
            }
        }
        
        let targetGap = Math.max(modeConf.minGap, modeConf.baseGap + toleranceAdd - stageGapReduce) + adaptiveGapPadding;
        let targetSpawnRate = Math.max(modeConf.minSpawnRate, Math.round((modeConf.baseSpawnRate / Math.max(0.82, speedMult)) * (1 - stageSpawnRateReduce)));
        
        // Apply debug tuning overrides if active
        if (state.debugActive) {
            const overrides = state.tuningOverrides;
            targetSpeed *= overrides.speedMultiplier;
            targetStarSpeed *= overrides.speedMultiplier;
            targetGap += overrides.gapBonus;
            targetSpawnRate = Math.max(20, Math.round(targetSpawnRate * overrides.spawnRateMultiplier));
        }
        
        return {
            speed: targetSpeed,
            starSpeed: targetStarSpeed,
            gap: targetGap,
            spawnRate: targetSpawnRate,
            tolerance: (modeConf.tolerance || 0) + toleranceAdd
        };
    },
    
    getHintMessage() {
        const state = window.IrisGame.state;
        const phase = this.getPhase();
        
        if (phase === 'onboarding' && !state.game.hintFlags.onboardingHint) {
            state.game.hintFlags.onboardingHint = true;
            return window.IrisGame.config.UI_TEXT.message || "轻轻点击，让小蝴蝶飞起来 🦋";
        }
        if (state.game.consecutiveCollisions >= 3 && !state.game.hintFlags.slowDownHint) {
            state.game.hintFlags.slowDownHint = true;
            return "慢一点也没关系，稳稳飞 🦋";
        }
        return null;
    },
    
    onScoreChanged() {
        const state = window.IrisGame.state;
        state.game.consecutivePasses++;
        state.game.consecutiveCollisions = 0;
    },
    
    onObstaclePassed() {
        const state = window.IrisGame.state;
        state.game.consecutivePasses++;
    },
    
    onCollision() {
        const state = window.IrisGame.state;
        state.game.collisionsThisRun++;
        state.game.consecutiveCollisions++;
        state.game.consecutivePasses = 0;
    },
    
    onMissionCompleted() {
        // Trigger mission completed events
    },
    
    getStageForScore(score) {
        const config = window.IrisGame.config;
        let result = 'warmup';
        Object.keys(config.STAGES).forEach(key => {
            if (score >= config.STAGES[key].minScore) {
                result = key;
            }
        });
        return result;
    }
};
