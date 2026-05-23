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

    _isStorageAvailable: null,
    _memStorage: {},

    isAvailable() {
        if (this._isStorageAvailable !== null) return this._isStorageAvailable;
        try {
            localStorage.setItem('__test_storage__', '1');
            localStorage.removeItem('__test_storage__');
            this._isStorageAvailable = true;
        } catch (e) {
            this._isStorageAvailable = false;
        }
        return this._isStorageAvailable;
    },

    getItem(key) {
        if (this.isAvailable()) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                // Fall through to memory storage
            }
        }
        return this._memStorage[key] || null;
    },

    setItem(key, value) {
        if (this.isAvailable()) {
            try {
                localStorage.setItem(key, String(value));
                return;
            } catch (e) {
                // Fall through to memory storage
            }
        }
        this._memStorage[key] = String(value);
    },

    removeItem(key) {
        if (this.isAvailable()) {
            try {
                localStorage.removeItem(key);
                return;
            } catch (e) {
                // Fall through to memory storage
            }
        }
        delete this._memStorage[key];
    },

    migrateOldStorage() {
        if (!this.getItem(this.KEYS.cosmetics)) {
            this.setItem(this.KEYS.cosmetics, JSON.stringify(['default']));
        }
        if (!this.getItem(this.KEYS.stickers)) {
            this.setItem(this.KEYS.stickers, JSON.stringify([]));
        }
    },

    getHighScore() {
        return Number(this.getItem(this.KEYS.highScore) || 0);
    },

    setHighScore(score) {
        this.setItem(this.KEYS.highScore, String(score));
    },

    getSoundEnabled() {
        return this.getItem(this.KEYS.soundEnabled) === 'true';
    },

    setSoundEnabled(enabled) {
        this.setItem(this.KEYS.soundEnabled, String(enabled));
    },

    getSettings() {
        const defaults = window.IrisGame.config.defaultAssistSettings;
        try {
            return {
                ...defaults,
                ...JSON.parse(this.getItem(this.KEYS.settings) || '{}')
            };
        } catch (e) {
            return { ...defaults };
        }
    },

    setSettings(settingsObj) {
        this.setItem(this.KEYS.settings, JSON.stringify(settingsObj));
    },

    getRestReminderEnabled() {
        return this.getItem(this.KEYS.restReminder) !== 'false';
    },

    setRestReminderEnabled(enabled) {
        this.setItem(this.KEYS.restReminder, String(enabled));
    },

    getGentleModeEnabled() {
        return this.getItem(this.KEYS.gentleMode) !== 'false';
    },

    setGentleModeEnabled(enabled) {
        this.setItem(this.KEYS.gentleMode, String(enabled));
    },

    getCalmModeEnabled() {
        return this.getItem(this.KEYS.calmMode) !== 'false';
    },

    setCalmModeEnabled(enabled) {
        this.setItem(this.KEYS.calmMode, String(enabled));
    },

    getCosmetics() {
        try {
            return JSON.parse(this.getItem(this.KEYS.cosmetics) || '["default"]');
        } catch (e) {
            return ['default'];
        }
    },

    setCosmetics(cosmeticsArray) {
        this.setItem(this.KEYS.cosmetics, JSON.stringify(cosmeticsArray));
    },

    getActiveCosmetic() {
        return this.getItem(this.KEYS.activeCosmetic) || 'default';
    },

    setActiveCosmetic(id) {
        this.setItem(this.KEYS.activeCosmetic, id);
    },

    getStickers() {
        try {
            return JSON.parse(this.getItem(this.KEYS.stickers) || '[]');
        } catch (e) {
            return [];
        }
    },

    setStickers(stickersArray) {
        this.setItem(this.KEYS.stickers, JSON.stringify(stickersArray));
    },

    getSeenStickers() {
        try {
            return JSON.parse(this.getItem(this.KEYS.seenStickers) || '[]');
        } catch (e) {
            return [];
        }
    },

    setSeenStickers(seenArray) {
        this.setItem(this.KEYS.seenStickers, JSON.stringify(seenArray));
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
