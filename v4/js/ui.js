window.IrisGame = window.IrisGame || {};

window.IrisGame.ui = {
    screens: {},
    elements: {},
    messageTimer: null,
    messagePriority: 0,
    
    init() {
        this.cacheDOM();
        this.bindEvents();
    },
    
    cacheDOM() {
        this.screens = {
            start: document.getElementById('start-screen'),
            howTo: document.getElementById('how-to-play-screen'),
            settings: document.getElementById('parent-settings-screen'),
            treasure: document.getElementById('treasure-screen'),
            pause: document.getElementById('pause-screen'),
            gameOver: document.getElementById('game-over-screen')
        };
        
        this.elements = {
            hud: document.getElementById('hud'),
            score: document.getElementById('score'),
            lives: document.getElementById('lives'),
            shield: document.getElementById('hud-shield'),
            finalScore: document.getElementById('final-score'),
            finalVines: document.getElementById('final-vines'),
            finalMode: document.getElementById('final-mode'),
            finalStage: document.getElementById('final-stage'),
            finalTask: document.getElementById('final-task'),
            recordScore: document.getElementById('record-score'),
            overTitle: document.getElementById('over-title'),
            overEncouragement: document.getElementById('over-encouragement'),
            overBestPerformance: document.getElementById('over-best-performance'),
            overRestTip: document.getElementById('over-rest-tip'),
            taskDisplay: document.getElementById('task-display'),
            taskText: document.getElementById('task-text'),
            taskProgress: document.getElementById('task-progress'),
            message: document.getElementById('message-display'),
            easterEgg: document.getElementById('easter-egg-msg'),
            eggText: document.getElementById('egg-text'),
            sound: document.getElementById('sound-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            speed: document.getElementById('setting-speed'),
            tolerance: document.getElementById('setting-tolerance'),
            livesSetting: document.getElementById('setting-lives'),
            parentMessage: document.getElementById('setting-message'),
            restReminderCheckbox: document.getElementById('setting-rest-reminder'),
            gentleModeCheckbox: document.getElementById('setting-gentle-mode'),
            calmModeCheckbox: document.getElementById('setting-calm-mode'),
            reducedMotionNotice: document.getElementById('reduced-motion-notice')
        };
    },
    
    showScreen(screenKey) {
        Object.values(this.screens).forEach(panel => {
            if (panel) panel.classList.remove('active');
        });
        const activePanel = this.screens[screenKey];
        if (activePanel) {
            activePanel.classList.add('active');
            
            // W3C ARIA focus target redirection
            const mainBtn = activePanel.querySelector('.btn-main');
            if (mainBtn) mainBtn.focus();
        }
    },
    
    setGameUiVisible(visible) {
        const state = window.IrisGame.state;
        if (this.elements.hud) {
            this.elements.hud.classList.toggle('hidden', !visible);
        }
        if (this.elements.taskDisplay) {
            this.elements.taskDisplay.classList.toggle('hidden', !visible || state.gameState !== 'PLAYING');
        }
    },
    
    showMessage(text, priority = 1, ms = null) {
        if (this.messagePriority > priority && this.elements.message && this.elements.message.classList.contains('active')) {
            return;
        }
        
        const state = window.IrisGame.state;
        const duration = ms || (priority >= 2 ? 2000 : 1200);
        clearTimeout(this.messageTimer);
        this.messagePriority = priority;
        
        if (this.elements.message) {
            this.elements.message.textContent = text;
            this.elements.message.classList.remove('hidden');
            this.elements.message.classList.add('active');
            
            // Reduced motion triggers simplified layout animations
            const isReduced = (state.prefersReducedMotion || state.game.calmModeEnabled);
            if (isReduced) {
                this.elements.message.style.animation = 'none';
            } else {
                this.elements.message.style.animation = 'bounceIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }
            
            const onboardingMsg = window.IrisGame.config.UI_TEXT.message || "轻轻点击，让小蝴蝶飞起来 🦋";
            if (text === onboardingMsg && !isReduced) {
                this.elements.message.classList.add('pulse-active');
            } else {
                this.elements.message.classList.remove('pulse-active');
            }
            
            if (text.includes("任务完成") || text.includes("飞行课完成")) {
                this.elements.message.classList.add('ribbon-style');
            } else {
                this.elements.message.classList.remove('ribbon-style');
            }
            
            this.messageTimer = setTimeout(() => {
                this.elements.message.classList.add('hidden');
                this.elements.message.classList.remove('active', 'ribbon-style', 'pulse-active');
                this.messagePriority = 0;
            }, duration);
        }
    },
    
    showParentMessage() {
        const settings = window.IrisGame.storage.getSettings();
        if (this.elements.eggText && this.elements.easterEgg) {
            this.elements.eggText.textContent = settings.parentMessage;
            this.elements.easterEgg.classList.remove('hidden');
            setTimeout(() => {
                if (this.elements.easterEgg) this.elements.easterEgg.classList.add('hidden');
            }, 3600);
        }
    },
    
    renderHUD() {
        const state = window.IrisGame.state;
        const missions = window.IrisGame.missions;
        
        if (this.elements.score) {
            this.elements.score.textContent = state.game.score;
        }
        
        if (this.elements.lives) {
            this.elements.lives.textContent = state.game.mode === 'practice' || state.game.lives >= 99 ? '∞ 💖' : '❤️'.repeat(Math.max(0, state.game.lives));
            
            const isLowLives = (state.game.lives === 1 && state.game.mode !== 'practice');
            const isReduced = (state.prefersReducedMotion || state.game.calmModeEnabled);
            if (isLowLives && !isReduced) {
                this.elements.lives.classList.add('low-lives');
            } else {
                this.elements.lives.classList.remove('low-lives');
            }
        }
        
        if (this.elements.shield) {
            this.elements.shield.textContent = state.game.starShield ? '✨🛡' : '';
        }
        
        if (this.elements.taskText && this.elements.taskProgress) {
            this.elements.taskText.textContent = missions.getDisplayText();
            this.elements.taskProgress.textContent = missions.getDisplayProgress();
        }
        
        // Sync sound button state
        window.IrisGame.audio.updateMuteUI();
    },
    
    renderGameOver() {
        const state = window.IrisGame.state;
        const storage = window.IrisGame.storage;
        const config = window.IrisGame.config;
        
        const modesCN = {
            practice: '练习课',
            easy: '花园课',
            normal: '冒险课',
            hard: '彩虹挑战'
        };
        
        const stageCN = {
            warmup: '热身',
            garden: '花园',
            breeze: '微风',
            rainbow: '彩虹'
        };
        
        if (this.elements.overTitle) {
            if (state.game.gentleModeEnabled) {
                const gentleTitles = ["小蝴蝶休息啦 🦋", "今天飞得很棒！🌼", "很棒的飞行体验 ✨", "好开心的冒险之旅 💖"];
                this.elements.overTitle.textContent = gentleTitles[state.game.score % gentleTitles.length];
            } else {
                this.elements.overTitle.textContent = Math.random() < 0.5 ? "游戏结束" : "今天飞得很棒！";
            }
        }
        
        if (this.elements.overBestPerformance) {
            let bestText = "每一次轻轻飞起，都是很棒的尝试 💖";
            if (state.game.missionCompleted) {
                bestText = "你完成了飞行课任务！🍀";
            } else if (state.game.rainbowStarsCollected > 0) {
                bestText = "你收集到彩虹星啦！🌈";
            } else if (state.game.passedObstacles >= 5) {
                bestText = `你穿过了 ${state.game.passedObstacles} 组花藤！🌿`;
            } else if (state.game.score >= 5) {
                bestText = `你收集了 ${state.game.score} 颗星星！⭐`;
            }
            this.elements.overBestPerformance.textContent = bestText;
        }
        
        if (this.elements.overRestTip) {
            if (state.game.restReminderEnabled && (Date.now() - state.game.sessionStartTime > 300000) && !state.game.hasShownRestReminder) {
                this.elements.overRestTip.textContent = config.UI_TEXT.restReminder;
                this.elements.overRestTip.style.display = 'block';
                state.game.hasShownRestReminder = true;
            } else {
                this.elements.overRestTip.style.display = 'none';
            }
        }
        
        if (this.elements.overEncouragement) {
            if (state.game.newHighScoreThisRun) {
                this.showParentMessage();
                this.elements.overEncouragement.textContent = "新纪录！Iris 太棒啦 🌟";
            } else {
                const settings = storage.getSettings();
                let parentMsg = '';
                try {
                    const parsed = JSON.parse(localStorage.getItem(storage.KEYS.settings) || '{}');
                    if (parsed.parentMessage && parsed.parentMessage.trim() !== '') {
                        parentMsg = parsed.parentMessage.trim();
                    }
                } catch(e) {}
                
                if (parentMsg !== '') {
                    this.elements.overEncouragement.textContent = parentMsg;
                } else {
                    if (state.game.gentleModeEnabled) {
                        const gentleTips = [
                            "你和小蝴蝶一样温柔又勇敢 🌸",
                            "快乐飞行，明天再来玩吧 🌼",
                            "每一次轻轻飞起，都是很棒的尝试 💖",
                            "今天飞得很开心，小蝴蝶也很感谢你 ✨"
                        ];
                        this.elements.overEncouragement.textContent = gentleTips[state.game.score % gentleTips.length];
                    } else {
                        const standardTips = [
                            "今天飞得很棒！",
                            "每一次练习都会更厉害！",
                            "小蝴蝶休息一下也很棒！",
                            "和爸爸妈妈分享你的新纪录吧！"
                        ];
                        this.elements.overEncouragement.textContent = standardTips[state.game.score % standardTips.length];
                    }
                }
            }
        }
        
        if (this.elements.finalMode) this.elements.finalMode.textContent = modesCN[state.game.mode] || state.game.mode;
        if (this.elements.finalStage) this.elements.finalStage.textContent = stageCN[state.game.currentStage] || state.game.currentStage;
        if (this.elements.finalScore) this.elements.finalScore.textContent = state.game.score;
        if (this.elements.finalVines) this.elements.finalVines.textContent = state.game.passedObstacles;
        if (this.elements.recordScore) this.elements.recordScore.textContent = state.game.highScore;
        if (this.elements.finalTask) this.elements.finalTask.textContent = state.game.missionCompleted ? "是" : "否";
    },
    
    renderSettings() {
        const state = window.IrisGame.state;
        const storage = window.IrisGame.storage;
        const config = window.IrisGame.config;
        
        const settings = storage.getSettings();
        
        if (this.elements.speed) this.elements.speed.value = settings.speed;
        if (this.elements.tolerance) this.elements.tolerance.value = settings.tolerance;
        if (this.elements.livesSetting) this.elements.livesSetting.value = settings.lives;
        if (this.elements.parentMessage) this.elements.parentMessage.value = settings.parentMessage;
        
        if (this.elements.restReminderCheckbox) this.elements.restReminderCheckbox.checked = state.game.restReminderEnabled;
        if (this.elements.gentleModeCheckbox) this.elements.gentleModeCheckbox.checked = state.game.gentleModeEnabled;
        if (this.elements.calmModeCheckbox) this.elements.calmModeCheckbox.checked = state.game.calmModeEnabled;
        
        if (this.elements.reducedMotionNotice) {
            if (state.prefersReducedMotion) {
                this.elements.reducedMotionNotice.textContent = config.UI_TEXT.reducedMotionNotice;
                this.elements.reducedMotionNotice.classList.remove('hidden');
            } else {
                this.elements.reducedMotionNotice.classList.add('hidden');
            }
        }
    },
    
    saveSettingsFromUI() {
        const state = window.IrisGame.state;
        const storage = window.IrisGame.storage;
        const config = window.IrisGame.config;
        
        const settingsObj = {
            speed: this.elements.speed.value,
            tolerance: this.elements.tolerance.value,
            lives: this.elements.livesSetting.value,
            parentMessage: this.elements.parentMessage.value.trim() || config.defaultAssistSettings.parentMessage
        };
        
        storage.setSettings(settingsObj);
        
        state.game.restReminderEnabled = this.elements.restReminderCheckbox.checked;
        state.game.gentleModeEnabled = this.elements.gentleModeCheckbox.checked;
        state.game.calmModeEnabled = this.elements.calmModeCheckbox.checked;
        
        storage.setRestReminderEnabled(state.game.restReminderEnabled);
        storage.setGentleModeEnabled(state.game.gentleModeEnabled);
        storage.setCalmModeEnabled(state.game.calmModeEnabled);
    },
    
    bindEvents() {
        const state = window.IrisGame.state;
        const audio = window.IrisGame.audio;
        const game = window.IrisGame.game;
        const rewards = window.IrisGame.rewards;
        const self = this;
        
        // Start Game
        const startBtn = document.getElementById('start-btn');
        if (startBtn) startBtn.addEventListener('click', () => {
            audio.playSound('click');
            game.startGame();
        });
        
        // Difficulty radiogroup selection
        document.querySelectorAll('.btn-diff').forEach(button => {
            button.setAttribute('role', 'radio');
            const isSelected = button.dataset.diff === state.game.mode;
            button.setAttribute('aria-checked', String(isSelected));
            
            button.addEventListener('click', () => {
                state.game.mode = button.dataset.diff;
                document.querySelectorAll('.btn-diff').forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-checked', 'false');
                });
                button.classList.add('active');
                button.setAttribute('aria-checked', 'true');
                audio.playSound('click');
            });
        });
        
        const on = (id, handler) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', handler);
        };
        
        on('how-to-play-btn', () => { audio.playSound('click'); self.showScreen('howTo'); });
        on('close-how-to-btn', () => { audio.playSound('click'); self.showScreen('start'); });
        
        on('parent-settings-btn', () => {
            if (state.gameState === 'PLAYING' || state.gameState === 'PAUSED') {
                self.showMessage('请先返回首页再调整设置', 1, 1500);
                return;
            }
            audio.playSound('click');
            self.renderSettings();
            self.showScreen('settings');
        });
        
        on('close-settings-btn', () => {
            audio.playSound('click');
            self.saveSettingsFromUI();
            self.showScreen('start');
            self.showMessage('设置已保存，下一局生效。', 1, 1500);
        });
        
        on('reset-high-score-btn', () => {
            audio.playSound('click');
            const resetBtn = document.getElementById('reset-high-score-btn');
            if (!state.game.resetConfirmState) {
                state.game.resetConfirmState = true;
                resetBtn.textContent = "再点一次确认重置";
                resetBtn.classList.add('confirm-state');
                
                state.game.resetConfirmTimer = setTimeout(() => {
                    state.game.resetConfirmState = false;
                    resetBtn.textContent = "重置最高分";
                    resetBtn.classList.remove('confirm-state');
                }, 3000);
            } else {
                clearTimeout(state.game.resetConfirmTimer);
                state.game.resetConfirmState = false;
                resetBtn.textContent = "重置最高分";
                resetBtn.classList.remove('confirm-state');
                
                state.game.highScore = 0;
                window.IrisGame.storage.setHighScore(0);
                localStorage.removeItem('iris_butterfly_reached10');
                localStorage.removeItem('iris_butterfly_reached15');
                state.game.hasReached10 = false;
                state.game.hasReached15 = false;
                
                self.renderHUD();
                self.showMessage('最高分已重置。', 1, 1200);
            }
        });
        
        on('treasure-btn', () => {
            audio.playSound('click');
            rewards.renderTreasure();
            rewards.switchTab('stickers');
            self.showScreen('treasure');
        });
        
        on('close-treasure-btn', () => { audio.playSound('click'); self.showScreen('start'); });
        
        const tabStickers = document.getElementById('tab-stickers');
        const tabCosmetics = document.getElementById('tab-cosmetics');
        
        if (tabStickers) {
            tabStickers.setAttribute('role', 'tab');
            tabStickers.setAttribute('aria-controls', 'stickers-content');
            tabStickers.addEventListener('click', () => {
                audio.playSound('click');
                rewards.switchTab('stickers');
            });
        }
        if (tabCosmetics) {
            tabCosmetics.setAttribute('role', 'tab');
            tabCosmetics.setAttribute('aria-controls', 'cosmetics-content');
            tabCosmetics.addEventListener('click', () => {
                audio.playSound('click');
                rewards.switchTab('cosmetics');
            });
        }
        
        on('pause-btn', () => game.pauseGame());
        on('resume-btn', () => { audio.playSound('click'); game.resumeGame(); });
        on('restart-btn', () => { audio.playSound('click'); game.restartGame(); });
        on('restart-from-pause-btn', () => { audio.playSound('click'); game.restartGame(); });
        on('back-to-home-btn', () => { audio.playSound('click'); game.backToHome(); });
        on('back-to-home-from-pause-btn', () => { audio.playSound('click'); game.backToHome(); });
        
        on('sound-btn', () => audio.toggleMute());
    }
};
