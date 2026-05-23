window.IrisGame = window.IrisGame || {};

window.IrisGame.storage = {
    KEYS: {
        highScore: 'iris_butterfly_highScore',
        settings: 'iris_butterfly_parentSettings',
        soundEnabled: 'iris_butterfly_soundEnabled',
        cosmetics: 'iris_butterfly_cosmetics',
        activeCosmetic: 'iris_butterfly_activeCosmetic',
        stickers: 'iris_butterfly_stickers',
        restReminder: 'iris_butterfly_restReminder',
        gentleMode: 'iris_butterfly_gentleMode',
        calmMode: 'iris_butterfly_calmMode',
        seenStickers: 'iris_butterfly_seenStickers'
    },
    
    migrateOldStorage() {
        if (!localStorage.getItem(this.KEYS.cosmetics)) {
            localStorage.setItem(this.KEYS.cosmetics, JSON.stringify(['default']));
        }
        if (!localStorage.getItem(this.KEYS.stickers)) {
            localStorage.setItem(this.KEYS.stickers, JSON.stringify([]));
        }
    },
    
    getHighScore() {
        return Number(localStorage.getItem(this.KEYS.highScore) || 0);
    },
    
    setHighScore(score) {
        localStorage.setItem(this.KEYS.highScore, String(score));
    },
    
    getSoundEnabled() {
        return localStorage.getItem(this.KEYS.soundEnabled) === 'true';
    },
    
    setSoundEnabled(enabled) {
        localStorage.setItem(this.KEYS.soundEnabled, String(enabled));
    },
    
    getSettings() {
        const defaults = window.IrisGame.config.defaultAssistSettings;
        try {
            return {
                ...defaults,
                ...JSON.parse(localStorage.getItem(this.KEYS.settings) || '{}')
            };
        } catch (e) {
            return { ...defaults };
        }
    },
    
    setSettings(settingsObj) {
        localStorage.setItem(this.KEYS.settings, JSON.stringify(settingsObj));
    },
    
    getRestReminderEnabled() {
        return localStorage.getItem(this.KEYS.restReminder) !== 'false';
    },
    
    setRestReminderEnabled(enabled) {
        localStorage.setItem(this.KEYS.restReminder, String(enabled));
    },
    
    getGentleModeEnabled() {
        return localStorage.getItem(this.KEYS.gentleMode) !== 'false';
    },
    
    setGentleModeEnabled(enabled) {
        localStorage.setItem(this.KEYS.gentleMode, String(enabled));
    },
    
    getCalmModeEnabled() {
        return localStorage.getItem(this.KEYS.calmMode) !== 'false';
    },
    
    setCalmModeEnabled(enabled) {
        localStorage.setItem(this.KEYS.calmMode, String(enabled));
    },
    
    getCosmetics() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.cosmetics) || '["default"]');
        } catch (e) {
            return ['default'];
        }
    },
    
    setCosmetics(cosmeticsArray) {
        localStorage.setItem(this.KEYS.cosmetics, JSON.stringify(cosmeticsArray));
    },
    
    getActiveCosmetic() {
        return localStorage.getItem(this.KEYS.activeCosmetic) || 'default';
    },
    
    setActiveCosmetic(id) {
        localStorage.setItem(this.KEYS.activeCosmetic, id);
    },
    
    getStickers() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.stickers) || '[]');
        } catch (e) {
            return [];
        }
    },
    
    setStickers(stickersArray) {
        localStorage.setItem(this.KEYS.stickers, JSON.stringify(stickersArray));
    },
    
    getSeenStickers() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.seenStickers) || '[]');
        } catch (e) {
            return [];
        }
    },
    
    setSeenStickers(seenArray) {
        localStorage.setItem(this.KEYS.seenStickers, JSON.stringify(seenArray));
    },
    
    loadAll(stateObj) {
        this.migrateOldStorage();
        stateObj.game.highScore = this.getHighScore();
        stateObj.game.soundEnabled = this.getSoundEnabled();
        stateObj.game.restReminderEnabled = this.getRestReminderEnabled();
        stateObj.game.gentleModeEnabled = this.getGentleModeEnabled();
        stateObj.game.calmModeEnabled = this.getCalmModeEnabled();
        
        const settings = this.getSettings();
        // sync back settings lives if valid
        const modeConf = window.IrisGame.config.GAME_MODES[stateObj.game.mode] || { lives: 5 };
        const livesOverride = settings.lives === 'difficulty' ? NaN : Number(settings.lives);
        stateObj.game.lives = stateObj.game.mode === 'practice' ? 99 : (Number.isFinite(livesOverride) ? livesOverride : modeConf.lives);
    }
};
