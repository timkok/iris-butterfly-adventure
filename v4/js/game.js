window.IrisGame = window.IrisGame || {};

window.IrisGame.game = {
    startGame() {
        const state = window.IrisGame.state;
        const storage = window.IrisGame.storage;
        const ui = window.IrisGame.ui;
        const canvas = window.IrisGame.canvas;
               const director = window.IrisGame.director;
        const player = window.IrisGame.player;
        const missions = window.IrisGame.missions;
        
        state.resetGameState();
        storage.loadAll(state);
        
        state.gameState = 'PLAYING';
        
        player.reset();
        
        // Let director reset stats
        director.resetRun();
        missions.chooseMission(state.game.mode);
        
        canvas.resetBackgroundHSL();
        
        ui.elements.message.classList.add('hidden');
        ui.setGameUiVisible(true);
        ui.showScreen(null);
        
        // Spawn starter stars
        this.spawnStarterStars();
        
        // Apply initial difficulty settings
        const currentDiff = director.getCurrentDifficulty();
        state.game.lives = state.game.mode === 'practice' ? 99 : currentDiff.lives;
        
        const hint = director.getHintMessage();
        if (hint) {
            ui.showMessage(hint, 1, 2500);
        }
        
        ui.renderHUD();
    },
    
    pauseGame() {
        const state = window.IrisGame.state;
        if (state.gameState !== 'PLAYING') return;
        
        state.gameState = 'PAUSED';
        
        const ui = window.IrisGame.ui;
        const config = window.IrisGame.config;
        
        const modesCN = {
            practice: '练习课',
            easy: '花园课',
            normal: '冒险课',
            hard: '彩虹挑战'
        };
        
        const pauseModeEl = document.getElementById('pause-mode');
        const pauseScoreEl = document.getElementById('pause-score');
        const pauseTaskEl = document.getElementById('pause-task');
        const pauseRestTipEl = document.getElementById('pause-rest-tip');
        
        if (pauseModeEl) pauseModeEl.textContent = modesCN[state.game.mode] || state.game.mode;
        if (pauseScoreEl) pauseScoreEl.textContent = state.game.score;
        if (pauseTaskEl) pauseTaskEl.textContent = `${window.IrisGame.missions.getDisplayText()} ${window.IrisGame.missions.getDisplayProgress()}`;
        
        if (pauseRestTipEl) {
            if (state.game.restReminderEnabled && (Date.now() - state.game.sessionStartTime > 300000) && !state.game.hasShownRestReminder) {
                pauseRestTipEl.textContent = config.UI_TEXT.restReminder;
                state.game.hasShownRestReminder = true;
            } else {
                pauseRestTipEl.textContent = "";
            }
        }
        
        ui.setGameUiVisible(true);
        ui.elements.taskDisplay.classList.add('hidden');
        ui.showScreen('pause');
    },
    
    resumeGame() {
        const state = window.IrisGame.state;
        if (state.gameState !== 'PAUSED') return;
        
        state.gameState = 'PLAYING';
        
        const ui = window.IrisGame.ui;
        ui.showScreen(null);
        ui.setGameUiVisible(true);
    },
    
    restartGame() {
        this.startGame();
    },
    
    backToHome() {
        const state = window.IrisGame.state;
        const ui = window.IrisGame.ui;
        
        state.gameState = 'START';
        state.resetGameState();
        
        ui.elements.message.classList.add('hidden');
        ui.setGameUiVisible(false);
        ui.showScreen('start');
        ui.renderHUD();
    },
    
    gameOver() {
        const state = window.IrisGame.state;
        state.gameState = 'GAMEOVER';
        
        const ui = window.IrisGame.ui;
        ui.renderGameOver();
        ui.setGameUiVisible(false);
        ui.showScreen('gameOver');
        ui.renderHUD();
    },
    
    spawnObstacle() {
        const state = window.IrisGame.state;
        const director = window.IrisGame.director;
        const currentDiff = director.getCurrentDifficulty();
        
        let gap = currentDiff.gap;
        
        // Wide first obstacle
        const isFirstObstacle = (state.obstacles.length === 0 && state.frameCount <= 300);
        if (isFirstObstacle) {
            gap += 25;
        }
        
        const margin = 76;
        const minGapCenter = margin + gap / 2;
        const maxGapCenter = 600 - 70 - gap / 2;
        
        // Obstacle pattern
        const pattern = director.chooseObstaclePattern();
        let gapY = 300;
        
        if (pattern === 'center_gap') {
            gapY = 300;
        } else if (pattern === 'high_gap') {
            gapY = minGapCenter + 40;
        } else if (pattern === 'low_gap') {
            gapY = maxGapCenter - 40;
        } else {
            // gentle_wave / star_path
            const waveOffset = Math.sin(state.frameCount * 0.01) * 80;
            gapY = 300 + waveOffset;
        }
        
        // Clamp gap center to screen bounds
        gapY = Math.max(minGapCenter, Math.min(maxGapCenter, gapY));
        
        const width = 58;
        const obsX = 400 + 12;
        
        state.obstacles.push({
            x: obsX,
            width,
            gapY,
            gap,
            passed: false,
            flowerOffset: Math.random() * 100,
            isFirst: isFirstObstacle,
            pattern
        });
        
        // Spawn star guided by director placement
        const placement = director.chooseStarPlacement(pattern);
        if (state.game.consecutivePasses >= 5) {
            // Guided path: 3 stars before, in, and after the gap
            this.spawnStar(obsX - 42, gapY);
            this.spawnStar(obsX + width / 2, gapY);
            this.spawnStar(obsX + width + 42, gapY);
        } else {
            if (placement === 'gap_center') {
                this.spawnStar(obsX + width / 2, gapY);
            } else if (placement === 'pre_gap') {
                this.spawnStar(obsX - 45, gapY);
            } else if (placement === 'post_gap') {
                this.spawnStar(obsX + width + 45, gapY);
            } else if (Math.random() < 0.5) {
                this.spawnStar();
            }
        }
    },
    
    spawnStar(x = null, y = null) {
        const state = window.IrisGame.state;
        const director = window.IrisGame.director;
        const currentDiff = director.getCurrentDifficulty();
        
        const starX = x !== null ? x : 400 + 24;
        const starY = y !== null ? y : 78 + Math.random() * (600 - 178);
        
        const isRainbow = director.shouldSpawnRainbowStar();
        if (isRainbow) {
            state.game.lastRainbowStarScore = state.game.score;
            window.IrisGame.ui.showMessage("彩虹星星出现啦 🌈", 2, 2000);
        }
        
        const starSpeed = currentDiff.starSpeed;
        state.stars.push(new window.IrisGame.entities.Star(starX, starY, starSpeed, isRainbow ? 'rainbow' : 'normal'));
    },
    
    spawnStarterStars() {
        const state = window.IrisGame.state;
        const director = window.IrisGame.director;
        const currentDiff = director.getCurrentDifficulty();
        const starSpeed = currentDiff.starSpeed;
        
        state.stars.push(new window.IrisGame.entities.Star(300, 230, starSpeed));
        state.stars.push(new window.IrisGame.entities.Star(480, 340, starSpeed));
    },
    
    handleCollision(message) {
        const state = window.IrisGame.state;
        const player = window.IrisGame.player;
        const audio = window.IrisGame.audio;
        const ui = window.IrisGame.ui;
        const director = window.IrisGame.director;
        
        if (player.invincibleFrames > 0 || state.gameState !== 'PLAYING') return;
        
        // If has Starlight Shield, absorb the hit!
        if (state.game.starShield) {
            state.game.starShield = false;
            player.invincibleFrames = Math.round(state.tuningOverrides.invincibilityFrames);
            audio.playSound('click'); // pop sound
            state.screenShake = state.game.calmModeEnabled ? 0 : (state.game.gentleModeEnabled ? 1 : 3);
            window.IrisGame.entities.createParticles(player.x, player.y, '#ffd36e', 16);
            ui.showMessage("星光护盾保护了你 ✨", 1, 1800);
            
            director.onCollision();
            state.game.consecutiveStarsNoHit = 0;
            window.IrisGame.missions.trigger('hit');
            ui.renderHUD();
            return;
        }
        
        audio.playSound('hit');
        
        // screenShake amount scales down in Calm Mode (calmModeEnabled)
        const shakeOverride = state.tuningOverrides.screenShakeAmount;
        let baseShake = state.game.mode === 'practice' ? 4 : 12;
        if (state.game.calmModeEnabled) {
            baseShake = 0.5; // extremely low screenshake
        } else if (state.game.gentleModeEnabled) {
            baseShake = state.game.mode === 'practice' ? 2 : 5;
        }
        state.screenShake = baseShake * shakeOverride;
        
        player.invincibleFrames = Math.round(state.tuningOverrides.invincibilityFrames);
        
        window.IrisGame.entities.createParticles(player.x, player.y, '#ff8dbc', 8);
        ui.showMessage(message, 1, 1200);
        
        // Notify director of collision
        director.onCollision();
        state.game.consecutiveStarsNoHit = 0;
        window.IrisGame.missions.trigger('hit');
        
        const hint = director.getHintMessage();
        if (hint) {
            ui.showMessage(hint, 1, 2500);
        }
        
        if (state.game.mode !== 'practice') {
            state.game.lives--;
            ui.renderHUD();
            if (state.game.lives <= 0) {
                this.gameOver();
            }
        }
    },
    
    collectStar(star, index) {
        const state = window.IrisGame.state;
        const audio = window.IrisGame.audio;
        const ui = window.IrisGame.ui;
        const director = window.IrisGame.director;
        const player = window.IrisGame.player;
        
        audio.playSound('collect', star.x);
        
        const points = star.type === 'rainbow' ? 3 : 1;
        state.game.score += points;
        
        player.scale = 1.45;
        state.screenShake = state.game.calmModeEnabled ? 0 : (state.game.gentleModeEnabled ? 1 : 3);
        
        window.IrisGame.entities.createParticles(star.x, star.y, star.type === 'rainbow' ? '#ff7eb3' : '#ffd36e', 12);
        state.stars.splice(index, 1);
        
        state.game.consecutiveStarsNoHit = (state.game.consecutiveStarsNoHit || 0) + 1;
        if (state.game.consecutiveStarsNoHit >= 3) {
            state.game.consecutiveStarsNoHit = 0; // reset combo counter
            if (state.game.mode !== 'practice' && !state.game.starShield) {
                state.game.starShield = true;
                ui.showMessage("✨ 获得星光护盾！", 1, 1500);
                window.IrisGame.entities.createParticles(player.x, player.y, '#ffd36e', 18);
            }
        }
        
        if (star.type === 'rainbow') {
            window.IrisGame.missions.trigger('rainbow', 1);
        }
        window.IrisGame.missions.trigger('star', points);
        
        // Update high score
        this.saveHighScoreIfNeeded();
        
        // Update Stage progression based on new score
        this.updateStageProgression();
        
        director.onScoreChanged();
        ui.renderHUD();
    },
    
    saveHighScoreIfNeeded() {
        const state = window.IrisGame.state;
        const storage = window.IrisGame.storage;
        
        if (state.game.score <= state.game.highScore) return false;
        state.game.highScore = state.game.score;
        storage.setHighScore(state.game.highScore);
        state.game.newHighScoreThisRun = true;
        
        // Check milestone sticker unlocks
        this.checkMilestones();
        return true;
    },
    
    checkMilestones() {
        const state = window.IrisGame.state;
        const ui = window.IrisGame.ui;
        const storage = window.IrisGame.storage;
        if (state.game.score === 10 && !state.game.hasReached10) {
            state.game.hasReached10 = true;
            storage.setItem('iris_butterfly_reached10', 'true');
            ui.showParentMessage();
        } else if (state.game.score === 15 && !state.game.hasReached15) {
            state.game.hasReached15 = true;
            storage.setItem('iris_butterfly_reached15', 'true');
            ui.showParentMessage();
        }
        window.IrisGame.rewards.renderTreasure();
    },
    
    updateStageProgression() {
        const state = window.IrisGame.state;
        const config = window.IrisGame.config;
        const ui = window.IrisGame.ui;
        
        let nextStage = 'warmup';
        Object.keys(config.STAGES).forEach(key => {
            if (state.game.score >= config.STAGES[key].minScore) {
                nextStage = key;
            }
        });
        
        if (nextStage !== state.game.currentStage) {
            state.game.currentStage = nextStage;
            const stageInfo = config.STAGES[state.game.currentStage];
            ui.showMessage(stageInfo.message, 2, 2200);
        }
    },
    
    updateGame() {
        const state = window.IrisGame.state;
        const director = window.IrisGame.director;
        const player = window.IrisGame.player;
        const canvas = window.IrisGame.canvas;
        const currentDiff = director.getCurrentDifficulty();
        
        state.frameCount++;
        state.gameTime++;
        state.game.flightFrames++;
        

        // Physics updates
        player.scale += (1 - player.scale) * 0.1;
        player.wingPhase += state.prefersReducedMotion ? 0.08 : (state.game.calmModeEnabled ? 0.16 : 0.28);
        player.velocity += player.gravity;
        player.y += player.velocity;
        if (player.invincibleFrames > 0) player.invincibleFrames--;
        
        // Grass boundaries check
        if (player.y > 600 - player.radius - 16) {
            player.y = 600 - player.radius - 16;
            this.handleCollision('小蝴蝶碰到草地啦，轻轻飞起来！');
        }
        if (player.y < player.radius) {
            player.y = player.radius;
            player.velocity = 0;
        }
        
        // Spawners triggers
        if (director.shouldSpawnObstacle(state.frameCount, currentDiff.spawnRate)) {
            this.spawnObstacle();
        }
        
        const starRate = Math.round(100 * state.tuningOverrides.starRateMultiplier);
        if (director.shouldSpawnStar(state.frameCount, starRate)) {
            this.spawnStar();
        }
        
        // Parallax background scroll
        canvas.parallaxBg.update(400, currentDiff.speed, state.prefersReducedMotion, state.game.calmModeEnabled);
        
        // Update wind lines (breeze stage)
        this.updateWindLines(currentDiff.speed);
        
        // Interpolate HSL backdrop background
        canvas.updateBackgroundHSL();
        
        // Update Player Trail
        this.updatePlayerTrail();
        
        // Move obstacles
        for (let i = state.obstacles.length - 1; i >= 0; i--) {
            const obs = state.obstacles[i];
            obs.x -= currentDiff.speed;
            
            if (!obs.passed && obs.x + obs.width < player.x) {
                obs.passed = true;
                state.game.passedObstacles++;
                director.onObstaclePassed();
                window.IrisGame.missions.trigger('vine', 1);
                ui.renderHUD();
            }
            
            if (window.IrisGame.entities.collidesWithObstacle(player, obs, currentDiff.tolerance)) {
                this.handleCollision(state.game.mode === 'practice' ? '练习模式，继续飞！' : '碰到花藤啦，没关系，再试一次！');
            }
            
            if (obs.x + obs.width < -40) {
                state.obstacles.splice(i, 1);
            }
        }
        
        // Move stars
        for (let i = state.stars.length - 1; i >= 0; i--) {
            const star = state.stars[i];
            star.update();
            
            if (Math.hypot(player.x - star.x, player.y - star.y) < player.radius + 16) {
                this.collectStar(star, i);
            } else if (star.x < -30) {
                state.stars.splice(i, 1);
            }
        }
        
        // Move particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
            state.particles[i].update();
            if (state.particles[i].alpha <= 0) {
                state.particles.splice(i, 1);
            }
        }
        
        // Spawn ambient leaves (garden, breeze, rainbow stages only)
        if (!state.prefersReducedMotion && ['garden', 'breeze', 'rainbow'].includes(state.game.currentStage)) {
            const maxLeaves = state.game.calmModeEnabled ? 3 : 6;
            const spawnChance = state.game.calmModeEnabled ? 0.008 : 0.02;
            if (state.leaves.length < maxLeaves && Math.random() < spawnChance) {
                state.leaves.push(new window.IrisGame.entities.Leaf(
                    400 + 20,
                    30 + Math.random() * 200
                ));
            }
        }
        
        // Update leaves
        for (let i = state.leaves.length - 1; i >= 0; i--) {
            state.leaves[i].update(state.game.calmModeEnabled);
            if (state.leaves[i].x < -30 || state.leaves[i].y > 620) {
                state.leaves.splice(i, 1);
            }
        }
        
        // Update tap ripples
        for (let i = state.tapRipples.length - 1; i >= 0; i--) {
            state.tapRipples[i].update();
            if (state.tapRipples[i].alpha <= 0) {
                state.tapRipples.splice(i, 1);
            }
        }
        
        // Time progress mission trigger
        if (state.game.flightFrames % 60 === 0) {
            window.IrisGame.missions.trigger('time', 1);
            ui.renderHUD();
        }
    },
    
    updatePlayerTrail() {
        const state = window.IrisGame.state;
        const player = window.IrisGame.player;
        if (state.prefersReducedMotion) {
            state.playerTrail = [];
            return;
        }
        
        state.playerTrail.push({ x: player.x, y: player.y });
        const activeCosmetic = window.IrisGame.storage.getActiveCosmetic();
        const maxTrailLength = activeCosmetic === 'star-trail' ? 15 : 8;
        
        while (state.playerTrail.length > maxTrailLength) {
            state.playerTrail.shift();
        }
    },
    
    updateWindLines(speed) {
        const state = window.IrisGame.state;
        if (state.game.currentStage !== 'breeze') {
            state.windLines = [];
            return;
        }
        
        const motionMult = state.prefersReducedMotion ? 0.05 : (state.game.calmModeEnabled ? 0.5 : 1.0);
        
        if (state.windLines.length < 4 && Math.random() < 0.06) {
            state.windLines.push({
                x: 400 + 20,
                y: 80 + Math.random() * (600 - 200),
                length: 40 + Math.random() * 60,
                speed: (speed + 1.2) * motionMult
            });
        }
        
        for (let i = state.windLines.length - 1; i >= 0; i--) {
            const line = state.windLines[i];
            line.x -= line.speed;
            if (line.x + line.length < 0) {
                state.windLines.splice(i, 1);
            }
        }
    },
    
    loop() {
        const state = window.IrisGame.state;
        const canvas = window.IrisGame.canvas;
        const debug = window.IrisGame.debug;
        
        // Estimate FPS
        debug.updateFPS();
        
        canvas.ctx.save();
        
        // Apply Screenshake transform
        if (state.screenShake > 0) {
            canvas.ctx.translate((Math.random() - 0.5) * state.screenShake, (Math.random() - 0.5) * state.screenShake);
            state.screenShake *= 0.88;
        }
        
        if (state.gameState === 'PLAYING') {
            this.updateGame();
        }
        
        // Draw everything
        canvas.renderAll();
        
        canvas.ctx.restore();
        
        // Only one loop callback
        requestAnimationFrame(() => this.loop());
    }
};
