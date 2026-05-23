window.IrisGame = window.IrisGame || {};

window.IrisGame.missions = {
    chooseMission(modeName) {
        const state = window.IrisGame.state;
        const config = window.IrisGame.config;
        
        state.game.missionCompleted = false;
        state.game.rainbowStarsCollected = 0;
        state.game.noHitStarCount = 0;
        
        let poolList = Object.values(config.MISSIONS);
        if (modeName === 'practice') {
            poolList = poolList.filter(m => m.id === 'collect_stars_10' || m.id === 'pass_vines_5' || m.id === 'survive_30s');
        } else {
            poolList = poolList.filter(m => m.allowedModes.includes(modeName));
        }
        
        const rIndex = Math.floor(Math.random() * poolList.length);
        state.game.mission = poolList[rIndex];
    },
    
    trigger(type, value = 1) {
        const state = window.IrisGame.state;
        const ui = window.IrisGame.ui;
        
        if (state.game.missionCompleted || !state.game.mission) return;
        
        const m = state.game.mission;
        if (m.id === 'clean_collect_5') {
            if (type === 'hit') {
                state.game.noHitStarCount = 0;
                ui.renderHUD();
            } else if (type === 'star') {
                state.game.noHitStarCount += value;
                if (state.game.noHitStarCount >= m.target) {
                    this.complete();
                }
            }
        } else if (m.id === 'collect_rainbow_star' && type === 'rainbow') {
            state.game.rainbowStarsCollected += value;
            if (state.game.rainbowStarsCollected >= m.target) {
                this.complete();
            }
        } else {
            const currentProgress = m.getProgress(state.game);
            if (currentProgress >= m.target) {
                this.complete();
            }
        }
    },
    
    complete() {
        const state = window.IrisGame.state;
        const ui = window.IrisGame.ui;
        
        state.game.missionCompleted = true;
        ui.showMessage(state.game.mission.onCompleteMessage, 2, 2500);
        ui.renderHUD();
    },
    
    getDisplayText() {
        const state = window.IrisGame.state;
        if (state.game.missionCompleted) {
            return "挑战最高分";
        }
        return state.game.mission ? state.game.mission.title : "";
    },
    
    getDisplayProgress() {
        const state = window.IrisGame.state;
        if (state.game.missionCompleted) {
            return state.game.newHighScoreThisRun ? "✨ 新记录！" : `(目标: ${state.game.highScore})`;
        }
        if (!state.game.mission) return "";
        
        let val = 0;
        const m = state.game.mission;
        if (m.id === 'clean_collect_5') {
            val = state.game.noHitStarCount;
        } else if (m.id === 'collect_rainbow_star') {
            val = state.game.rainbowStarsCollected;
        } else {
            val = m.getProgress(state.game);
        }
        
        const suffix = m.id === 'survive_30s' ? '秒' : '';
        return `(${Math.min(val, m.target)}/${m.target}${suffix})`;
    },
    
    getMissionProgress(game, mission) {
        if (!mission) return 0;
        if (mission.id === 'clean_collect_5') {
            return game.noHitStarCount;
        }
        if (mission.id === 'collect_rainbow_star') {
            return game.rainbowStarsCollected;
        }
        return mission.getProgress(game);
    }
};
