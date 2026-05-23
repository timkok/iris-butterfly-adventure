window.IrisGame = window.IrisGame || {};

window.IrisGame.i18nCheck = {
    collectLeafKeys(value, prefix = '') {
        if (Array.isArray(value)) {
            return value.flatMap((item, index) => this.collectLeafKeys(item, `${prefix}[${index}]`));
        }
        if (value && typeof value === 'object') {
            return Object.keys(value).flatMap((key) => {
                const path = prefix ? `${prefix}.${key}` : key;
                return this.collectLeafKeys(value[key], path);
            });
        }
        return [prefix];
    },
    
    collectEmptyValues(value, prefix = '', out = []) {
        if (typeof value === 'string') {
            if (value.trim() === '') {
                out.push(prefix);
            }
            return out;
        }
        if (Array.isArray(value)) {
            value.forEach((item, index) => this.collectEmptyValues(item, `${prefix}[${index}]`, out));
            return out;
        }
        if (value && typeof value === 'object') {
            Object.keys(value).forEach((key) => {
                const path = prefix ? `${prefix}.${key}` : key;
                this.collectEmptyValues(value[key], path, out);
            });
        }
        return out;
    },
    
    compareNestedKeys() {
        const i18n = window.IrisGame.i18n;
        const enKeys = this.collectLeafKeys(i18n.translations.en).sort();
        const zhKeys = this.collectLeafKeys(i18n.translations.zh).sort();
        return {
            enKeys,
            zhKeys,
            missingInEn: zhKeys.filter((key) => !enKeys.includes(key)),
            missingInZh: enKeys.filter((key) => !zhKeys.includes(key)),
            extraInEn: enKeys.filter((key) => !zhKeys.includes(key)),
            extraInZh: zhKeys.filter((key) => !enKeys.includes(key))
        };
    },
    
    validateVisibleUiFallbacks() {
        const i18n = window.IrisGame.i18n;
        const ui = window.IrisGame.ui;
        const rewards = window.IrisGame.rewards;
        const state = window.IrisGame.state;
        const originalLang = i18n.currentLang;
        const missing = [];
        
        ['en', 'zh'].forEach((lang) => {
            i18n.currentLang = lang;
            i18n.missingKeyFallbacks = [];
            i18n.applyLanguageMeta();
            i18n.syncConfig(window.IrisGame.config);
            i18n.applyDom();
            if (ui && ui.cacheDOM) {
                ui.cacheDOM();
                ui.renderHUD();
                ui.renderSettings();
            }
            if (rewards && rewards.renderTreasure) {
                rewards.renderTreasure();
            }
            if (state && state.game) {
                const previousMission = state.game.mission;
                state.game.mission = window.IrisGame.config.MISSIONS.collect_stars_10;
                window.IrisGame.missions.getDisplayText();
                window.IrisGame.missions.getDisplayProgress();
                state.game.mission = previousMission;
            }
            i18n.missingKeyFallbacks.forEach((key) => missing.push(`${lang}:${key}`));
        });
        
        i18n.currentLang = originalLang;
        i18n.applyLanguageMeta();
        i18n.syncConfig(window.IrisGame.config);
        i18n.applyDom();
        
        return missing;
    },
    
    validate() {
        const i18n = window.IrisGame.i18n;
        const keyReport = this.compareNestedKeys();
        const emptyValues = [
            ...this.collectEmptyValues(i18n.translations.en, 'en'),
            ...this.collectEmptyValues(i18n.translations.zh, 'zh')
        ];
        const missingFallbacks = this.validateVisibleUiFallbacks();
        
        return {
            passed: keyReport.missingInEn.length === 0 &&
                keyReport.missingInZh.length === 0 &&
                emptyValues.length === 0 &&
                missingFallbacks.length === 0,
            missingInEn: keyReport.missingInEn,
            missingInZh: keyReport.missingInZh,
            emptyValues,
            missingFallbacks
        };
    }
};
