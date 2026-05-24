window.IrisGame = window.IrisGame || {};

window.IrisGame.director = {
    resetRun() {
        const state = window.IrisGame.state;
        state.game.collisionsThisRun = 0;
        state.game.consecutiveCollisions = 0;
        state.game.consecutivePasses = 0;
        state.game.starsCollectedSinceLastRainbow = 0;
        state.game.assistGapsRemaining = 0;
        state.game.recentFlowEvents = [];
        state.game.comfortLevel = 'steady';
        state.game.assistActive = false;
        state.game.lowScoreHintShown = false;
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
        const baseChance = state.game.consecutivePasses >= 5 ? 0.46 : 0.35;
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
        const state = window.IrisGame.state;
        if (phase === 'onboarding') {
            return 'gap_center';
        }
        if (phase === 'safe_practice') {
            return 'gap_center';
        }
        if ((state.game.mode === 'practice' || state.game.mode === 'easy') && state.game.assistActive) {
            return Math.random() < 0.72 ? 'gap_center' : 'star_path';
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

        const adaptiveState = this.getAdaptiveState();

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
        if (adaptiveState.assistActive) {
            adaptiveGapPadding += window.IrisGame.config.ADAPTIVE_FLOW.assistGapBonus;
        }

        let targetGap = Math.max(modeConf.minGap, modeConf.baseGap + toleranceAdd - stageGapReduce) + adaptiveGapPadding;
        let targetSpawnRate = Math.max(modeConf.minSpawnRate, Math.round((modeConf.baseSpawnRate / Math.max(0.82, speedMult)) * (1 - stageSpawnRateReduce)));

        if (adaptiveState.assistActive) {
            targetSpawnRate = Math.round(targetSpawnRate * window.IrisGame.config.ADAPTIVE_FLOW.assistSpawnRateMultiplier);
        }
        if (adaptiveState.lowScoreAssist && (state.game.mode === 'practice' || state.game.mode === 'easy')) {
            targetSpawnRate = Math.round(targetSpawnRate * window.IrisGame.config.ADAPTIVE_FLOW.lowScoreSpawnRateMultiplier);
        }

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
            tolerance: (modeConf.tolerance || 0) + toleranceAdd,
            lives: modeConf.lives
        };
    },

    smoothGapY(rawGapY, minGapCenter, maxGapCenter) {
        const state = window.IrisGame.state;
        const fairness = window.IrisGame.config.FAIRNESS;
        const previous = state.game.lastGapY;
        let smoothed = Math.max(minGapCenter, Math.min(maxGapCenter, rawGapY));

        if (Number.isFinite(previous)) {
            const maxDelta = fairness.gapCenterMaxDelta[state.game.mode] || fairness.gapCenterMaxDelta.normal;
            smoothed = Math.max(previous - maxDelta, Math.min(previous + maxDelta, smoothed));
        }

        smoothed = Math.max(minGapCenter, Math.min(maxGapCenter, smoothed));
        state.game.lastGapY = smoothed;
        return smoothed;
    },

    clampStarToSafeCorridor(y, gapY, gap, isRainbow = false) {
        const margin = window.IrisGame.config.FAIRNESS.starSafetyMargin + (isRainbow ? 10 : 0);
        const minY = gapY - gap / 2 + margin;
        const maxY = gapY + gap / 2 - margin;
        return Math.max(minY, Math.min(maxY, y));
    },

    getAdaptiveState() {
        const state = window.IrisGame.state;
        const recent = this.getRecentRates();
        const assistActive = state.game.assistGapsRemaining > 0 || state.game.consecutiveCollisions >= 2;
        const lowScoreAssist = state.game.flightFrames >= window.IrisGame.config.ADAPTIVE_FLOW.lowScoreFrameThreshold &&
            state.game.score <= window.IrisGame.config.ADAPTIVE_FLOW.lowScoreThreshold;
        let comfortLevel = 'steady';
        if (assistActive || recent.recentCollisionRate >= 0.34 || lowScoreAssist) {
            comfortLevel = 'support';
        } else if (recent.recentPassRate >= 0.7 && state.game.consecutivePasses >= 5) {
            comfortLevel = 'confident';
        }
        state.game.comfortLevel = comfortLevel;
        state.game.assistActive = assistActive || lowScoreAssist;
        return {
            comfortLevel,
            assistActive: state.game.assistActive,
            lowScoreAssist,
            recentCollisionRate: recent.recentCollisionRate,
            recentPassRate: recent.recentPassRate
        };
    },

    recordFlowEvent(type) {
        const state = window.IrisGame.state;
        const events = state.game.recentFlowEvents;
        events.push(type);
        const max = window.IrisGame.config.ADAPTIVE_FLOW.recentWindow;
        while (events.length > max) events.shift();
        this.getAdaptiveState();
    },

    getRecentRates() {
        const events = window.IrisGame.state.game.recentFlowEvents || [];
        if (events.length === 0) {
            return { recentCollisionRate: 0, recentPassRate: 0 };
        }
        const collisions = events.filter(type => type === 'collision').length;
        const passes = events.filter(type => type === 'pass').length;
        return {
            recentCollisionRate: collisions / events.length,
            recentPassRate: passes / events.length
        };
    },

    getHintMessage() {
        const state = window.IrisGame.state;
        const phase = this.getPhase();

        if (phase === 'onboarding' && !state.game.hintFlags.onboardingHint) {
            state.game.hintFlags.onboardingHint = true;
            return window.IrisGame.config.UI_TEXT.message || window.IrisGame.i18n.t('messages.onboarding');
        }
        if (state.game.consecutiveCollisions >= 3 && !state.game.hintFlags.slowDownHint) {
            state.game.hintFlags.slowDownHint = true;
            return window.IrisGame.i18n.t('messages.slow');
        }
        if ((state.game.mode === 'practice' || state.game.mode === 'easy') &&
            state.game.flightFrames >= window.IrisGame.config.ADAPTIVE_FLOW.lowScoreFrameThreshold &&
            state.game.score <= window.IrisGame.config.ADAPTIVE_FLOW.lowScoreThreshold &&
            !state.game.lowScoreHintShown) {
            state.game.lowScoreHintShown = true;
            return window.IrisGame.i18n.t('messages.lowScoreHint');
        }
        return null;
    },

    onScoreChanged() {
        const state = window.IrisGame.state;
        state.game.consecutiveCollisions = 0;
    },

    onObstaclePassed() {
        const state = window.IrisGame.state;
        state.game.consecutivePasses++;
        if (state.game.assistGapsRemaining > 0) {
            state.game.assistGapsRemaining--;
        }
        this.recordFlowEvent('pass');
    },

    onCollision() {
        const state = window.IrisGame.state;
        state.game.collisionsThisRun++;
        state.game.consecutiveCollisions++;
        state.game.consecutivePasses = 0;
        if (state.game.consecutiveCollisions >= 2) {
            state.game.assistGapsRemaining = Math.max(state.game.assistGapsRemaining, window.IrisGame.config.ADAPTIVE_FLOW.assistGapCount);
        }
        this.recordFlowEvent('collision');
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
