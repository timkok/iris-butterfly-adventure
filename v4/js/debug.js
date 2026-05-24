window.IrisGame = window.IrisGame || {};

window.IrisGame.debug = {
    dKeyPressCount: 0,
    lastDKeyTime: 0,
    fpsLastTime: performance.now(),
    fpsFrames: 0,

    init() {
        // Listen to D key press three times
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyD') {
                const now = performance.now();
                if (now - this.lastDKeyTime > 1000) {
                    this.dKeyPressCount = 0;
                }
                this.dKeyPressCount++;
                this.lastDKeyTime = now;

                if (this.dKeyPressCount >= 3) {
                    this.dKeyPressCount = 0;
                    this.toggleDebugPanel();
                }
            }
        });

        // Check URL parameter ?debug=1
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('debug') === '1') {
            this.showDebugPanel();
        }
    },

    toggleDebugPanel() {
        const state = window.IrisGame.state;
        if (state.debugActive) {
            this.hideDebugPanel();
        } else {
            this.showDebugPanel();
        }
    },

    showDebugPanel() {
        const state = window.IrisGame.state;
        state.debugActive = true;

        let panel = document.getElementById('debug-tuning-panel');
        if (!panel) {
            panel = this.createDebugPanelDOM();
            document.body.appendChild(panel);
            this.bindDebugPanelEvents();
        }
        panel.style.display = 'block';
        this.syncSlidersToUI();
    },

    hideDebugPanel() {
        const state = window.IrisGame.state;
        state.debugActive = false;
        const panel = document.getElementById('debug-tuning-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    },

    updateFPS() {
        const now = performance.now();
        this.fpsFrames++;
        if (now - this.fpsLastTime >= 1000) {
            const state = window.IrisGame.state;
            state.fps = Math.round((this.fpsFrames * 1000) / (now - this.fpsLastTime));
            this.fpsFrames = 0;
            this.fpsLastTime = now;

            if (state.debugActive) {
                this.updateRealtimeDataUI();
            }
        }
    },

    createDebugPanelDOM() {
        const panel = document.createElement('div');
        panel.id = 'debug-tuning-panel';
        panel.style.position = 'absolute';
        panel.style.top = '10px';
        panel.style.right = '10px';
        panel.style.width = '300px';
        panel.style.maxHeight = '90vh';
        panel.style.overflowY = 'auto';
        panel.style.backgroundColor = 'rgba(30, 30, 50, 0.95)';
        panel.style.color = '#00ffcc';
        panel.style.fontFamily = 'monospace';
        panel.style.fontSize = '11px';
        panel.style.padding = '12px';
        panel.style.borderRadius = '8px';
        panel.style.border = '2px solid #00ffcc';
        panel.style.zIndex = '9999';
        panel.style.boxShadow = '0 0 15px rgba(0, 255, 204, 0.4)';
        panel.style.pointerEvents = 'auto';

        const i18n = window.IrisGame.i18n;
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #00ffcc; padding-bottom: 6px; margin-bottom: 10px;">
                <span style="font-weight: bold; font-size: 13px;">🦋 IRIS DEBUG PANEL</span>
                <button id="debug-close-btn" style="background: red; border: none; color: white; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 10px; min-height:20px;">X</button>
            </div>

            <!-- Realtime Metrics -->
            <div style="margin-bottom: 12px; line-height: 1.4; border-bottom: 1px dashed rgba(0,255,204,0.3); padding-bottom: 8px;">
                <strong>[REALTIME DATA]</strong><br>
                FPS: <span id="db-fps">-</span> | Stage: <span id="db-stage">-</span><br>
                State: <span id="db-state">-</span> | Mode: <span id="db-mode">-</span><br>
                Score: <span id="db-score">0</span> | Lives: <span id="db-lives">0</span> | Max: <span id="db-record">0</span><br>
                Vines: <span id="db-vines">0</span> | Speed: <span id="db-speed">-</span> | Gap: <span id="db-gap">-</span><br>
                Objects: P:<span id="db-particles">0</span> S:<span id="db-stars">0</span> O:<span id="db-obstacles">0</span><br>
                Mute: <span id="db-mute">-</span> | Calm: <span id="db-calm">-</span> | RMotion: <span id="db-rm">-</span><br>
                FX Budget: <span id="db-fx-budget">-</span> | P:<span id="db-p-budget">0/80</span> L:<span id="db-l-budget">0/12</span> R:<span id="db-r-budget">0/4</span> | Shield: <span id="db-shield-status">-</span><br>
                Flow: <span id="db-comfort">-</span> | Coll:<span id="db-collision-rate">0%</span> Pass:<span id="db-pass-rate">0%</span> Assist:<span id="db-assist-active">NO</span>
            </div>

            <!-- Sliders -->
            <div style="margin-bottom: 12px;">
                <strong>[LIVE TUNING]</strong><br>
                <div style="margin: 6px 0;">
                    Speed Mult: <span id="v-speed-mult">1.0</span>x<br>
                    <input type="range" id="sl-speed-mult" min="0.5" max="2.0" step="0.05" value="1.0" style="width:100%;">
                </div>
                <div style="margin: 6px 0;">
                    Gap Add: <span id="v-gap-bonus">0</span>px<br>
                    <input type="range" id="sl-gap-bonus" min="-60" max="60" step="5" value="0" style="width:100%;">
                </div>
                <div style="margin: 6px 0;">
                    Spawn Rate Mult: <span id="v-spawn-mult">1.0</span>x<br>
                    <input type="range" id="sl-spawn-mult" min="0.5" max="2.0" step="0.05" value="1.0" style="width:100%;">
                </div>
                <div style="margin: 6px 0;">
                    Star Rate Mult: <span id="v-star-mult">1.0</span>x<br>
                    <input type="range" id="sl-star-mult" min="0.5" max="2.0" step="0.05" value="1.0" style="width:100%;">
                </div>
                <div style="margin: 6px 0;">
                    Rainbow Chance: <span id="v-rainbow-chance">0.35</span><br>
                    <input type="range" id="sl-rainbow-chance" min="0.05" max="0.95" step="0.05" value="0.35" style="width:100%;">
                </div>
                <div style="margin: 6px 0;">
                    Invincibility Frames: <span id="v-invincible">78</span>f<br>
                    <input type="range" id="sl-invincible" min="10" max="200" step="5" value="78" style="width:100%;">
                </div>
                <div style="margin: 6px 0;">
                    Screen Shake Mult: <span id="v-shake">1.0</span>x<br>
                    <input type="range" id="sl-shake" min="0.0" max="3.0" step="0.1" value="1.0" style="width:100%;">
                </div>
            </div>

            <!-- Actions -->
            <div style="margin-top: 10px; display: flex; gap: 4px; flex-wrap: wrap;">
                <button id="db-reset-btn" style="flex:1; min-width:80px; background:#444; border:1px solid #00ffcc; color:#00ffcc; border-radius:4px; padding:4px; cursor:pointer; min-height:28px;">${i18n.t('debug.reset')}</button>
                <button id="db-copy-btn" style="flex:1; min-width:80px; background:#444; border:1px solid #00ffcc; color:#00ffcc; border-radius:4px; padding:4px; cursor:pointer; min-height:28px;">${i18n.t('debug.copy')}</button>
                <button id="db-qa-btn" style="width:100%; margin-top:4px; background:#444; border:1px solid #ffaa00; color:#ffaa00; border-radius:4px; padding:4px; cursor:pointer; min-height:28px; font-weight:bold;">${i18n.t('debug.qa')}</button>
            </div>

            <!-- Import Area -->
            <div style="margin-top: 10px;">
                <strong>[IMPORT OVERRIDES]</strong><br>
                <textarea id="db-import-area" placeholder='{"speedMultiplier":1.1,"gapBonus":10}' style="width:100%; height:46px; background:#222; color:#fff; border:1px solid #555; font-family:monospace; font-size:10px; border-radius:4px; margin-top:4px;"></textarea>
                <button id="db-import-btn" style="width:100%; margin-top:4px; background:#444; border:1px solid #00ffcc; color:#00ffcc; border-radius:4px; padding:4px; cursor:pointer; min-height:28px;">${i18n.t('debug.import')}</button>
            </div>
        `;
        return panel;
    },

    refreshLanguage() {
        const panel = document.getElementById('debug-tuning-panel');
        if (!panel) return;
        const i18n = window.IrisGame.i18n;
        const labels = {
            'db-reset-btn': 'debug.reset',
            'db-copy-btn': 'debug.copy',
            'db-qa-btn': 'debug.qa',
            'db-import-btn': 'debug.import'
        };
        Object.keys(labels).forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.textContent = i18n.t(labels[id]);
        });
    },

    syncSlidersToUI() {
        const state = window.IrisGame.state;
        const overrides = state.tuningOverrides;

        document.getElementById('sl-speed-mult').value = overrides.speedMultiplier;
        document.getElementById('v-speed-mult').textContent = overrides.speedMultiplier.toFixed(2);

        document.getElementById('sl-gap-bonus').value = overrides.gapBonus;
        document.getElementById('v-gap-bonus').textContent = (overrides.gapBonus > 0 ? '+' : '') + overrides.gapBonus;

        document.getElementById('sl-spawn-mult').value = overrides.spawnRateMultiplier;
        document.getElementById('v-spawn-mult').textContent = overrides.spawnRateMultiplier.toFixed(2);

        document.getElementById('sl-star-mult').value = overrides.starRateMultiplier;
        document.getElementById('v-star-mult').textContent = overrides.starRateMultiplier.toFixed(2);

        document.getElementById('sl-rainbow-chance').value = overrides.rainbowStarChance;
        document.getElementById('v-rainbow-chance').textContent = overrides.rainbowStarChance.toFixed(2);

        document.getElementById('sl-invincible').value = overrides.invincibilityFrames;
        document.getElementById('v-invincible').textContent = overrides.invincibilityFrames;

        document.getElementById('sl-shake').value = overrides.screenShakeAmount;
        document.getElementById('v-shake').textContent = overrides.screenShakeAmount.toFixed(1);
    },

    bindDebugPanelEvents() {
        const state = window.IrisGame.state;
        const self = this;

        const onInput = (id, labelId, key, formatter = (v) => v) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', (e) => {
                    const val = Number(e.target.value);
                    state.tuningOverrides[key] = val;
                    document.getElementById(labelId).textContent = formatter(val);
                });
            }
        };

        onInput('sl-speed-mult', 'v-speed-mult', 'speedMultiplier', (v) => v.toFixed(2));
        onInput('sl-gap-bonus', 'v-gap-bonus', 'gapBonus', (v) => (v > 0 ? '+' : '') + v);
        onInput('sl-spawn-mult', 'v-spawn-mult', 'spawnRateMultiplier', (v) => v.toFixed(2));
        onInput('sl-star-mult', 'v-star-mult', 'starRateMultiplier', (v) => v.toFixed(2));
        onInput('sl-rainbow-chance', 'v-rainbow-chance', 'rainbowStarChance', (v) => v.toFixed(2));
        onInput('sl-invincible', 'v-invincible', 'invincibilityFrames', (v) => Math.round(v));
        onInput('sl-shake', 'v-shake', 'screenShakeAmount', (v) => v.toFixed(1));

        document.getElementById('debug-close-btn').addEventListener('click', () => {
            self.hideDebugPanel();
        });

        document.getElementById('db-reset-btn').addEventListener('click', () => {
            state.tuningOverrides = {
                speedMultiplier: 1.0,
                gapBonus: 0,
                spawnRateMultiplier: 1.0,
                starRateMultiplier: 1.0,
                rainbowStarChance: 0.35,
                invincibilityFrames: 78,
                screenShakeAmount: 1.0
            };
            self.syncSlidersToUI();
        });

        document.getElementById('db-copy-btn').addEventListener('click', () => {
            const jsonText = JSON.stringify(state.tuningOverrides);
            navigator.clipboard.writeText(jsonText).then(() => {
                alert(window.IrisGame.i18n.t('debug.copied'));
            }).catch(() => {
                const textarea = document.getElementById('db-import-area');
                textarea.value = jsonText;
                textarea.select();
                alert(window.IrisGame.i18n.t('debug.copiedFallback'));
            });
        });

        document.getElementById('db-qa-btn').addEventListener('click', () => {
            const currentDiff = window.IrisGame.director.getCurrentDifficulty();
            const qaSummary = {
                gameState: state.gameState,
                mode: state.game.mode,
                score: state.game.score,
                lives: state.game.lives,
                highScore: state.game.highScore,
                currentStage: state.game.currentStage,
                passedObstacles: state.game.passedObstacles,
                fps: state.fps,
                particlesCount: state.particles.length,
                starsCount: state.stars.length,
                obstaclesCount: state.obstacles.length,
                soundEnabled: state.game.soundEnabled,
                calmModeEnabled: state.game.calmModeEnabled,
                gentleModeEnabled: state.game.gentleModeEnabled,
                speedMultiplier: currentDiff.speed / window.IrisGame.config.GAME_MODES[state.game.mode].baseSpeed,
                gapSize: currentDiff.gap,
                starShield: state.game.starShield || false,
                adaptiveFlow: window.IrisGame.director.getAdaptiveState()
            };
            const jsonText = JSON.stringify(qaSummary, null, 2);
            navigator.clipboard.writeText(jsonText).then(() => {
                alert(window.IrisGame.i18n.t('debug.qaCopied'));
            }).catch(() => {
                const textarea = document.getElementById('db-import-area');
                textarea.value = jsonText;
                textarea.select();
                alert(window.IrisGame.i18n.t('debug.qaFallback'));
            });
        });

        document.getElementById('db-import-btn').addEventListener('click', () => {
            const areaText = document.getElementById('db-import-area').value.trim();
            if (areaText === '') return;
            try {
                const parsed = JSON.parse(areaText);
                state.tuningOverrides = {
                    speedMultiplier: parsed.speedMultiplier !== undefined ? Number(parsed.speedMultiplier) : 1.0,
                    gapBonus: parsed.gapBonus !== undefined ? Number(parsed.gapBonus) : 0,
                    spawnRateMultiplier: parsed.spawnRateMultiplier !== undefined ? Number(parsed.spawnRateMultiplier) : 1.0,
                    starRateMultiplier: parsed.starRateMultiplier !== undefined ? Number(parsed.starRateMultiplier) : 1.0,
                    rainbowStarChance: parsed.rainbowStarChance !== undefined ? Number(parsed.rainbowStarChance) : 0.35,
                    invincibilityFrames: parsed.invincibilityFrames !== undefined ? Number(parsed.invincibilityFrames) : 78,
                    screenShakeAmount: parsed.screenShakeAmount !== undefined ? Number(parsed.screenShakeAmount) : 1.0
                };
                self.syncSlidersToUI();
                alert(window.IrisGame.i18n.t('debug.imported'));
            } catch (e) {
                alert(window.IrisGame.i18n.t('debug.invalid'));
            }
        });
    },

    updateRealtimeDataUI() {
        const state = window.IrisGame.state;
        const director = window.IrisGame.director;

        const setText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        const currentDiff = director.getCurrentDifficulty();

        setText('db-fps', state.fps);
        setText('db-stage', state.game.currentStage);
        setText('db-state', state.gameState);
        setText('db-mode', state.game.mode);
        setText('db-score', state.game.score);
        setText('db-lives', state.game.lives);
        setText('db-record', state.game.highScore);
        setText('db-vines', state.game.passedObstacles);
        setText('db-speed', currentDiff.speed.toFixed(2));
        setText('db-gap', Math.round(currentDiff.gap) + 'px');
        setText('db-particles', state.particles.length);
        setText('db-stars', state.stars.length);
        setText('db-obstacles', state.obstacles.length);
        setText('db-mute', state.game.soundEnabled ? 'NO' : 'YES');
        setText('db-calm', state.game.calmModeEnabled ? 'YES' : 'NO');
        setText('db-rm', state.prefersReducedMotion ? 'YES' : 'NO');
        setText('db-shield-status', state.game.starShield ? 'YES' : 'NO');

        const adaptive = window.IrisGame.director.getAdaptiveState();
        setText('db-comfort', adaptive.comfortLevel);
        setText('db-collision-rate', Math.round(adaptive.recentCollisionRate * 100) + '%');
        setText('db-pass-rate', Math.round(adaptive.recentPassRate * 100) + '%');
        setText('db-assist-active', adaptive.assistActive ? 'YES' : 'NO');

        const config = window.IrisGame.config;
        const maxParticles = config.EFFECTS_POLICY.maxParticles;
        const maxLeavesBase = config.EFFECTS_POLICY.maxLeaves;
        const maxLeaves = state.game.calmModeEnabled ? Math.max(1, Math.round(maxLeavesBase * config.EFFECTS_POLICY.calmModeParticleMultiplier)) : maxLeavesBase;
        const maxRipples = config.EFFECTS_POLICY.maxTapRipples;

        setText('db-p-budget', `${state.particles.length}/${maxParticles}`);
        setText('db-l-budget', `${state.leaves.length}/${maxLeaves}`);
        setText('db-r-budget', `${state.tapRipples.length}/${maxRipples}`);

        const isHigh = state.particles.length > maxParticles || state.leaves.length > maxLeaves || state.tapRipples.length > maxRipples;
        const statusEl = document.getElementById('db-fx-budget');
        if (statusEl) {
            statusEl.textContent = isHigh ? 'HIGH' : 'OK';
            statusEl.style.color = isHigh ? '#ff8dbc' : '#77c987';
            statusEl.style.fontWeight = 'bold';
        }
    },

    drawOverlays(ctx) {
        const state = window.IrisGame.state;
        const player = window.IrisGame.player || { x: 82, y: 300, radius: 12 };

        if (!state.debugActive) return;

        ctx.save();

        // 1. Player collision circle
        const settings = window.IrisGame.director.getCurrentDifficulty();
        const playerRadius = Math.max(4, player.radius - settings.tolerance);

        ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, playerRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 2. Obstacle collision bounds
        ctx.strokeStyle = 'rgba(255, 128, 0, 0.7)';
        ctx.fillStyle = 'rgba(255, 128, 0, 0.15)';
        ctx.lineWidth = 1.5;

        state.obstacles.forEach(obs => {
            const topHeight = obs.gapY - obs.gap / 2;
            const bottomY = obs.gapY + obs.gap / 2;
            const width = obs.width;

            // Top box
            ctx.beginPath();
            ctx.rect(obs.x + 8, 0, width - 16, topHeight);
            ctx.fill();
            ctx.stroke();

            // Bottom box
            ctx.beginPath();
            ctx.rect(obs.x + 8, bottomY, width - 16, 600 - bottomY);
            ctx.fill();
            ctx.stroke();

            // Gap center line
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(obs.x + 8, obs.gapY);
            ctx.lineTo(obs.x + width - 8, obs.gapY);
            ctx.stroke();

            // Reset stroke
            ctx.strokeStyle = 'rgba(255, 128, 0, 0.7)';
            ctx.lineWidth = 1.5;
        });

        // 3. Star pickup radius
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
        ctx.fillStyle = 'rgba(255, 255, 0, 0.08)';
        ctx.lineWidth = 1;
        state.stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, player.radius + 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        ctx.restore();
    }
};
