window.IrisGame = window.IrisGame || {};

window.IrisGame.i18n = {
    STORAGE_KEY: 'iris_butterfly_language',
    currentLang: 'en',
    missingKeyFallbacks: [],

    translations: {
        en: {
            meta: {
                htmlLang: 'en',
                title: "Iris's Butterfly Adventure - V4"
            },
            language: {
                button: '中文',
                aria: 'Switch language to Chinese',
                title: 'Switch language',
                switched: 'Language switched to English.'
            },
            home: {
                title: "🦋 Iris's Butterfly Adventure",
                subtitle: 'Rainbow Garden Flying Lesson',
                difficultyAria: 'Choose game difficulty',
                start: 'Start Flying',
                howTo: '❓ How to Play',
                treasure: '🎁 Treasures',
                settings: '⚙️ Grown-ups',
                v3: '🔙 V3 Lab',
                v2: '🔙 V2 Stable',
                v3Aria: 'Go back to V3 lab version',
                v2Aria: 'Go back to V2 stable version'
            },
            modes: {
                practice: { label: 'Practice Lesson', description: 'No game over / endless hearts', aria: 'Choose Practice Lesson' },
                easy: { label: 'Garden Lesson', description: 'Recommended / 5 hearts', aria: 'Choose Garden Lesson' },
                normal: { label: 'Adventure Lesson', description: 'Classic / 3 hearts', aria: 'Choose Adventure Lesson' },
                hard: { label: 'Rainbow Challenge', description: 'Challenge / 3 hearts', aria: 'Choose Rainbow Challenge' }
            },
            hud: {
                sound: 'Sound toggle',
                soundOn: 'Sound on',
                soundOff: 'Sound off',
                pause: 'Pause game',
                taskDefault: 'Collect 10 stars'
            },
            howTo: {
                title: '❓ How to Play',
                body: 'Tap the screen or press Space to help the butterfly fly up! Glide through the flower-vine gaps, avoid obstacles, and collect shiny stars.',
                close: 'Got it',
                closeAria: 'Close how-to-play help'
            },
            settings: {
                title: '⚙️ Grown-up Settings',
                desc: 'These settings take effect at the start of the next round.',
                info: '✨ This game starts muted, has no ads, no purchases, and is best for short play sessions together.',
                speed: 'Flying speed',
                speedSlow: 'Slow (easier)',
                speedNormal: 'Normal',
                speedFast: 'Fast (more challenge)',
                tolerance: 'Collision kindness',
                toleranceLoose: 'Gentle (easier to pass)',
                toleranceStandard: 'Standard',
                lives: 'Starting hearts',
                livesDifficulty: 'Automatic by lesson',
                lives3: '3 hearts',
                lives5: '5 hearts',
                livesTip: 'Note: Practice Lesson always has endless hearts.',
                parentMessage: 'Family encouragement note (shown on Game Over or new records)',
                parentPlaceholder: 'Example: Iris, you flew so well!',
                restReminder: 'Eye-break reminder',
                gentleMode: 'Gentle Mode',
                calmMode: 'Calm Mode',
                calmTip: '(When on: softer bumps, quieter feedback, slower rainbow shimmer, fewer particles and background motion.)',
                close: 'Save and Return',
                reset: 'Reset High Score',
                resetConfirm: 'Tap again to confirm reset',
                resetDone: 'High score reset.',
                saved: 'Settings saved for the next round.',
                homeOnly: 'Please return home before changing settings.',
                reducedMotionNotice: '⚙️ Reduced Motion is on in your system, so animations are softened automatically.',
                ariaClose: 'Save settings and return home',
                ariaReset: 'Reset high score'
            },
            treasure: {
                title: '🎁 My Treasure Garden',
                desc: 'Fly farther to unlock gentle little treasures ✨',
                tabs: 'Treasure categories',
                stickers: 'Magic Stickers',
                cosmetics: 'Wing Styles',
                stickersAria: 'View magic stickers',
                cosmeticsAria: 'View wing styles',
                close: 'Return Home',
                closeAria: 'Return home',
                footer: '💝 All treasures unlock through flying. No purchases.',
                unlocked: 'Unlocked',
                locked: 'Locked',
                newly: 'New!',
                use: 'Use',
                using: 'Using',
                unlockAt: 'Unlocks at high score {score}',
                stickerOwnedAria: 'Sticker: {label}, unlocked.',
                stickerNewAria: 'New sticker unlocked: {label}. Great flying!',
                stickerLockedAria: 'Locked sticker: {label}. Reach high score {score} to unlock.',
                cosmeticUsingAria: 'Wing style: {label}, currently using.',
                cosmeticUseAria: 'Wing style: {label}, unlocked, tap to use.',
                cosmeticLockedAria: 'Locked wing style: {label}. Reach high score {score} to unlock.',
                notEnough: 'Not enough stars yet. Keep collecting!'
            },
            pause: {
                title: '⏸ Take a Break',
                mode: 'Current lesson:',
                score: 'Stars now:',
                task: 'Mission progress:',
                resume: 'Keep Flying',
                restart: 'Restart',
                home: 'Return Home',
                resumeAria: 'Resume flying',
                restartAria: 'Restart from pause menu',
                homeAria: 'Return home from pause menu'
            },
            over: {
                title: 'Great flying today!',
                report: '📋 Little Flight Report',
                mode: 'Current lesson:',
                stage: 'Current garden:',
                score: 'Stars this round:',
                vines: 'Flower vines passed:',
                task: 'Mission complete:',
                record: 'Best record:',
                restart: 'Fly Again',
                home: 'Return Home',
                restartAria: 'Fly again',
                homeAria: 'Return home from Game Over',
                yes: 'Yes',
                no: 'No',
                gentleTitles: ['Little butterfly is resting 🦋', 'Great flying today! 🌼', 'That was a lovely flight ✨', 'What a happy garden adventure 💖'],
                standardTitles: ['Great flying today!', 'Time for a soft landing!'],
                bestFallback: 'Every gentle takeoff is a wonderful try 💖',
                bestMission: 'You completed the flying mission! 🍀',
                bestRainbow: 'You collected a rainbow star! 🌈',
                bestVines: 'You flew through {count} flower vines! 🌿',
                bestStars: 'You collected {count} stars! ⭐',
                fallbackTips: [
                    'Every gentle takeoff is a wonderful try 💖',
                    'Take your time. Little wings learn step by step ✨',
                    'Happy flying matters most 🦋',
                    'You flew with care today 🌸',
                    'A tiny lift is still a beautiful flight 🌼'
                ],
                newRecord: 'New record! Great flying, Iris 🌟',
                gentleTips: [
                    'You were gentle and brave like a butterfly 🌸',
                    'Take an eye break — you can fly again later 🌼',
                    'Every gentle takeoff is a wonderful try 💖',
                    'The butterfly loved flying with you today ✨'
                ],
                standardTips: [
                    'Great flying today!',
                    'Practice makes your wings steadier!',
                    'Resting little wings is great too!',
                    'Share your new record with a grown-up!'
                ]
            },
            stages: {
                warmup: { label: 'Warmup', message: 'Lift off gently 🦋' },
                garden: { label: 'Garden', message: 'Welcome to the garden path 🌿' },
                breeze: { label: 'Breeze', message: 'The breeze is quicker. Fly steady ✨' },
                rainbow: { label: 'Rainbow', message: 'Rainbow Challenge begins 🌈' }
            },
            missions: {
                collect_stars_10: {
                    title: 'Collect 10 stars',
                    description: 'Collect 10 stars in this round',
                    complete: 'Mission complete! Keep going for a higher score ✨'
                },
                pass_vines_5: {
                    title: 'Fly through 5 flower vines',
                    description: 'Glide safely through 5 vine obstacles',
                    complete: 'Vine mission complete! Keep flying gently 🌿'
                },
                survive_30s: {
                    title: 'Fly for 30 seconds',
                    description: 'Stay in the air for 30 seconds',
                    complete: 'Practice Lesson complete! Very steady flying ✨'
                },
                collect_rainbow_star: {
                    title: 'Collect 1 rainbow star',
                    description: 'Catch a rare rainbow star',
                    complete: 'Rainbow Challenge complete! Wonderful flying 🌈'
                },
                clean_collect_5: {
                    title: 'Collect 5 stars without touching vines',
                    description: 'Collect 5 stars before touching a vine',
                    complete: 'Careful collecting complete! Beautiful flying 🌟'
                },
                completedTitle: 'Chase your best score',
                newRecord: '✨ New record!',
                goal: '(Goal: {score})',
                seconds: 's'
            },
            unlocks: {
                star: 'Magic Star',
                flower: 'Rainbow Flower',
                butterfly: 'Dream Butterfly',
                rainbow: 'Wonder Rainbow',
                crown: 'Garden Crown',
                'pink-wings': 'Sweet Pink Wings',
                'star-trail': 'Starlight Trail',
                'rainbow-wings': 'Rainbow Wings'
            },
            messages: {
                onboarding: 'Tap gently to help the butterfly fly 🦋',
                slow: 'Slow and steady is wonderful 🦋',
                rainbowStar: 'A rainbow star appeared 🌈',
                shieldProtected: 'The Starlight Shield protected you ✨',
                shieldGained: '✨ Starlight Shield ready!',
                ground: 'The butterfly touched the grass. Lift gently!',
                practiceCollision: 'Practice Lesson — keep flying!',
                vineCollision: 'You touched a flower vine. That is okay, try again!',
                restReminder: 'Take an eye break — you can fly again later 🌼',
                parentDefault: 'Iris, you flew so well!',
                missionRibbonWords: ['Mission complete', 'Lesson complete', 'Challenge complete']
            },
            debug: {
                reset: 'Reset tuning',
                copy: 'Copy JSON',
                qa: 'Copy QA summary',
                import: 'Import JSON',
                copied: 'Tuning overrides JSON copied to clipboard!',
                copiedFallback: 'Copied to the bottom text area. Please copy manually.',
                qaCopied: 'QA summary JSON copied to clipboard!',
                qaFallback: 'Copied QA summary to the bottom text area. Please copy manually.',
                imported: 'Tuning overrides imported successfully!',
                invalid: 'Invalid JSON structure. Please check details.'
            },
            test: {
                back: '🔙 Back to Game Home',
                passed: 'Test passed ✓'
            }
        },
        zh: {
            meta: {
                htmlLang: 'zh-CN',
                title: "Iris's Butterfly Adventure - V4"
            },
            language: {
                button: 'English',
                aria: '切换语言到英文',
                title: '切换语言',
                switched: '已切换到中文。'
            },
            home: {
                title: '🦋 Iris 的蝴蝶奇遇',
                subtitle: '彩虹花园飞行课',
                difficultyAria: '选择游戏难度',
                start: '开始飞行',
                howTo: '❓ 怎么玩',
                treasure: '🎁 宝贝',
                settings: '⚙️ 家长',
                v3: '🔙 实验版 V3',
                v2: '🔙 稳定版 V2',
                v3Aria: '返回 V3 实验版',
                v2Aria: '返回 V2 稳定版'
            },
            modes: {
                practice: { label: '练习课', description: '不会结束 / 无限心', aria: '选择练习课' },
                easy: { label: '花园课', description: '推荐 / 5 心', aria: '选择花园课' },
                normal: { label: '冒险课', description: '标准 / 3 心', aria: '选择冒险课' },
                hard: { label: '彩虹挑战', description: '挑战 / 3 心', aria: '选择彩虹挑战' }
            },
            hud: {
                sound: '声音开关',
                soundOn: '声音已开启',
                soundOff: '声音已关闭',
                pause: '暂停游戏',
                taskDefault: '收集 10 颗星星'
            },
            howTo: {
                title: '❓ 怎么玩',
                body: '点击屏幕或者按空格键让蝴蝶向上飞！穿过花藤之间的空隙，躲开障碍物，收集闪亮的星星。',
                close: '明白了',
                closeAria: '关闭玩法说明'
            },
            settings: {
                title: '⚙️ 家长辅助设置',
                desc: '这些设置会在下一局开始时生效。',
                info: '✨ 这个游戏默认静音，没有广告，没有购买，适合短时间陪伴游玩。',
                speed: '飞行速度',
                speedSlow: '慢速 (更简单)',
                speedNormal: '正常',
                speedFast: '快速 (更有挑战)',
                tolerance: '碰撞容差',
                toleranceLoose: '宽松 (不容易撞到)',
                toleranceStandard: '标准',
                lives: '初始生命值',
                livesDifficulty: '按难度自动',
                lives3: '3 颗心',
                lives5: '5 颗心',
                livesTip: '注：练习模式始终为无限心。',
                parentMessage: '亲子鼓励寄语 (在游戏结束/高分时弹出)',
                parentPlaceholder: '例如：Iris 你真棒，爱你！',
                restReminder: '休息提醒',
                gentleMode: '温柔模式',
                calmMode: '低刺激模式',
                calmTip: '（开启时：降低震动、减慢彩虹闪烁、减少粒子和背景移动，提供更宁静的游玩环境）',
                close: '保存并返回',
                reset: '重置最高分',
                resetConfirm: '再点一次确认重置',
                resetDone: '最高分已重置。',
                saved: '设置已保存，下一局生效。',
                homeOnly: '请先返回首页再调整设置',
                reducedMotionNotice: '⚙️ 检测到系统已开启减少动态效果，已自动为您优化动画体验。',
                ariaClose: '保存设置并返回首页',
                ariaReset: '重置最高分'
            },
            treasure: {
                title: '🎁 我的宝贝仓库',
                desc: '飞得越远，解锁越多小宝贝 ✨',
                tabs: '宝贝分类',
                stickers: '魔法贴纸',
                cosmetics: '翅膀外观',
                stickersAria: '查看魔法贴纸',
                cosmeticsAria: '查看翅膀外观',
                close: '返回首页',
                closeAria: '返回首页',
                footer: '💝 所有宝贝都靠飞行解锁，没有购买内容。',
                unlocked: '已解锁',
                locked: '未解锁',
                newly: '新!',
                use: '使用',
                using: '使用中',
                unlockAt: '最高分 {score} 解锁',
                stickerOwnedAria: '贴纸：{label}，已解锁。',
                stickerNewAria: '新解锁贴纸：{label}！恭喜！',
                stickerLockedAria: '未解锁贴纸：{label}，需要最高分达到 {score} 解锁。',
                cosmeticUsingAria: '外观：{label}，当前使用中',
                cosmeticUseAria: '外观：{label}，已解锁，点击使用',
                cosmeticLockedAria: '未解锁外观：{label}，需要最高分达到 {score} 解锁',
                notEnough: '星星还不够，继续收集吧！'
            },
            pause: {
                title: '⏸ 休息一下',
                mode: '当前模式:',
                score: '当前星星:',
                task: '任务进度:',
                resume: '继续飞行',
                restart: '重新开始',
                home: '回到首页',
                resumeAria: '继续飞行',
                restartAria: '从暂停菜单重新开始',
                homeAria: '从暂停菜单回到首页'
            },
            over: {
                title: '今天飞得很棒！',
                report: '📋 小小飞行报告',
                mode: '当前模式:',
                stage: '当前阶段:',
                score: '本次星星:',
                vines: '飞过花藤:',
                task: '完成任务:',
                record: '最高记录:',
                restart: '再飞一次',
                home: '回到首页',
                restartAria: '再飞一次',
                homeAria: '从游戏结束页回到首页',
                yes: '是',
                no: '否',
                gentleTitles: ['小蝴蝶休息啦 🦋', '今天飞得很棒！🌼', '很棒的飞行体验 ✨', '好开心的冒险之旅 💖'],
                standardTitles: ['今天飞得很棒！', '小蝴蝶轻轻落地啦！'],
                bestFallback: '每一次轻轻飞起，都是很棒的尝试 💖',
                bestMission: '你完成了飞行课任务！🍀',
                bestRainbow: '你收集到彩虹星啦！🌈',
                bestVines: '你穿过了 {count} 组花藤！🌿',
                bestStars: '你收集了 {count} 颗星星！⭐',
                fallbackTips: [
                    '每一次轻轻飞起，都是很棒的尝试 💖',
                    '慢慢来，小蝴蝶正在一点点进步哦 ✨',
                    '飞得开心最重要，小蝴蝶很喜欢和你一起玩 🦋',
                    '今天也是非常努力的一天，抱抱自己吧 🌸',
                    '只要轻轻起飞，就是最美的小蝴蝶 🌼'
                ],
                newRecord: '新纪录！Iris 太棒啦 🌟',
                gentleTips: [
                    '你和小蝴蝶一样温柔又勇敢 🌸',
                    '休息一下眼睛吧，等会儿再飞也很棒 🌼',
                    '每一次轻轻飞起，都是很棒的尝试 💖',
                    '今天飞得很开心，小蝴蝶也很感谢你 ✨'
                ],
                standardTips: [
                    '今天飞得很棒！',
                    '每一次练习都会更厉害！',
                    '小蝴蝶休息一下也很棒！',
                    '和爸爸妈妈分享你的新纪录吧！'
                ]
            },
            stages: {
                warmup: { label: '热身', message: '轻轻飞起来 🦋' },
                garden: { label: '花园', message: '进入花园挑战区 🌿' },
                breeze: { label: '微风', message: '风变快啦，稳稳飞 ✨' },
                rainbow: { label: '彩虹', message: '彩虹挑战开始 🌈' }
            },
            missions: {
                collect_stars_10: {
                    title: '收集 10 颗星星',
                    description: '在这一局中累计收集 10 颗星星',
                    complete: '任务完成！继续挑战更高分吧 ✨'
                },
                pass_vines_5: {
                    title: '穿过 5 组花藤',
                    description: '成功飞跃 5 个藤蔓障碍',
                    complete: '飞行挑战完成！继续稳稳飞吧 🌿'
                },
                survive_30s: {
                    title: '坚持飞行 30 秒',
                    description: '在空中持续飞翔 30 秒',
                    complete: '练习课任务完成！非常稳健 ✨'
                },
                collect_rainbow_star: {
                    title: '收集 1 颗彩虹星星',
                    description: '抓住难得一见的彩虹星星',
                    complete: '彩虹挑战完成！你太厉害了 🌈'
                },
                clean_collect_5: {
                    title: '不碰花藤收集 5 颗星星',
                    description: '在无碰撞的状态下收集 5 颗星星',
                    complete: '完美收集挑战完成！太厉害了 🌟'
                },
                completedTitle: '挑战最高分',
                newRecord: '✨ 新记录！',
                goal: '(目标: {score})',
                seconds: '秒'
            },
            unlocks: {
                star: '魔法星星',
                flower: '七彩小花',
                butterfly: '梦幻蝴蝶',
                rainbow: '神奇彩虹',
                crown: '终极皇冠',
                'pink-wings': '甜心粉',
                'star-trail': '闪耀星踪',
                'rainbow-wings': '梦幻彩虹'
            },
            messages: {
                onboarding: '轻轻点击，让小蝴蝶飞起来 🦋',
                slow: '慢一点也没关系，稳稳飞 🦋',
                rainbowStar: '彩虹星星出现啦 🌈',
                shieldProtected: '星光护盾保护了你 ✨',
                shieldGained: '✨ 获得星光护盾！',
                ground: '小蝴蝶碰到草地啦，轻轻飞起来！',
                practiceCollision: '练习模式，继续飞！',
                vineCollision: '碰到花藤啦，没关系，再试一次！',
                restReminder: '休息一下眼睛吧，等会儿再飞也很棒 🌼',
                parentDefault: 'Iris 真棒，爱你！',
                missionRibbonWords: ['任务完成', '飞行课完成', '挑战完成']
            },
            debug: {
                reset: '重置参数',
                copy: '复制 JSON',
                qa: '复制 QA 摘要',
                import: '导入 JSON',
                copied: 'Tuning overrides JSON copied to clipboard!',
                copiedFallback: 'Copied to bottom textarea! Please copy manually.',
                qaCopied: 'QA Summary JSON copied to clipboard!',
                qaFallback: 'Copied QA summary to bottom textarea! Please copy manually.',
                imported: 'Tuning overrides imported successfully!',
                invalid: 'Invalid JSON structure! Please check details.'
            },
            test: {
                back: '🔙 返回游戏首页',
                passed: '测试通过 ✓'
            }
        }
    },

    getLanguage() {
        const saved = this.readStoredLanguage();
        return saved || this.currentLang || 'en';
    },

    readStoredLanguage() {
        try {
            const value = localStorage.getItem(this.STORAGE_KEY);
            return value === 'zh' || value === 'en' ? value : null;
        } catch (e) {
            return null;
        }
    },

    writeStoredLanguage(lang) {
        try {
            localStorage.setItem(this.STORAGE_KEY, lang);
        } catch (e) {
            // Storage can be unavailable in private contexts; the in-memory language still applies.
        }
    },

    init() {
        this.currentLang = this.readStoredLanguage() || 'en';
        this.applyLanguageMeta();
        this.syncConfig(window.IrisGame.config);
        this.applyDom();
    },

    t(key, params = {}) {
        const parts = key.split('.');
        let value = this.translations[this.currentLang] || this.translations.en;
        let exact = true;
        for (const part of parts) {
            if (value && Object.prototype.hasOwnProperty.call(value, part)) {
                value = value[part];
            } else {
                exact = false;
                value = null;
                break;
            }
        }
        if (value === null || value === undefined) {
            if (!this.missingKeyFallbacks.includes(key)) {
                this.missingKeyFallbacks.push(key);
            }
            value = parts.reduce((obj, part) => obj && obj[part], this.translations.en);
        }
        if (!exact && (value === null || value === undefined)) {
            return `[missing:${key}]`;
        }
        if (typeof value !== 'string') return value;
        return value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ''));
    },

    hasKey(lang, key) {
        const parts = key.split('.');
        let value = this.translations[lang];
        for (const part of parts) {
            if (value && Object.prototype.hasOwnProperty.call(value, part)) {
                value = value[part];
            } else {
                return false;
            }
        }
        return value !== undefined;
    },

    setLanguage(lang, announce = true) {
        if (!this.translations[lang]) return;
        this.currentLang = lang;
        this.writeStoredLanguage(lang);
        this.applyLanguageMeta();
        this.syncConfig(window.IrisGame.config);
        this.applyDom();

        if (window.IrisGame.ui) {
            window.IrisGame.ui.renderHUD();
            window.IrisGame.ui.renderSettings();
            window.IrisGame.ui.renderGreeting();
            const state = window.IrisGame.state;
            if (state && state.gameState === 'PAUSED' && window.IrisGame.game) {
                window.IrisGame.game.renderPauseSummary();
            }
            if (state && state.gameState === 'GAMEOVER') {
                window.IrisGame.ui.renderGameOver();
            }
        }
        if (window.IrisGame.rewards) {
            window.IrisGame.rewards.renderTreasure();
        }
        if (window.IrisGame.audio) {
            window.IrisGame.audio.updateMuteUI();
        }
        if (window.IrisGame.debug && window.IrisGame.state && window.IrisGame.state.debugActive) {
            window.IrisGame.debug.refreshLanguage();
        }
        if (announce) {
            this.announce(this.t('language.switched'));
        }
    },

    toggleLanguage() {
        this.setLanguage(this.currentLang === 'en' ? 'zh' : 'en');
    },

    announce(text) {
        const el = document.getElementById('language-status');
        if (el) el.textContent = text;
    },

    applyLanguageMeta() {
        const meta = this.t('meta');
        document.documentElement.lang = meta.htmlLang;
        document.title = meta.title;
    },

    applyDom() {
        const setText = (selector, key) => {
            const el = document.querySelector(selector);
            if (el) el.textContent = this.t(key);
        };
        const setAttr = (selector, attr, key) => {
            const el = document.querySelector(selector);
            if (el) el.setAttribute(attr, this.t(key));
        };
        const setLabel = (selector, key) => {
            const el = document.querySelector(selector);
            if (!el) return;
            const labelText = this.t(key) + ' ';
            if (el.tagName === 'INPUT') {
                const label = el.closest('label');
                if (!label) return;
                const textNode = Array.from(label.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
                if (textNode) {
                    textNode.textContent = ' ' + this.t(key);
                }
                return;
            }
            if (el.tagName === 'SPAN' && el.parentElement) {
                const textNode = Array.from(el.parentElement.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
                if (textNode) textNode.textContent = labelText;
                return;
            }
            if (el.firstChild) el.firstChild.textContent = labelText;
        };
        const setOption = (selector, value, key) => {
            const option = document.querySelector(`${selector} option[value="${value}"]`);
            if (option) option.textContent = this.t(key);
        };

        setText('#language-toggle-btn', 'language.button');
        setAttr('#language-toggle-btn', 'aria-label', 'language.aria');
        setAttr('#language-toggle-btn', 'title', 'language.title');
        setText('.glow-text', 'home.title');
        setText('.start-subtitle', 'home.subtitle');
        setAttr('.diff-selector', 'aria-label', 'home.difficultyAria');
        setText('#start-btn', 'home.start');
        setAttr('#start-btn', 'aria-label', 'home.start');
        setText('#how-to-play-btn', 'home.howTo');
        setAttr('#how-to-play-btn', 'aria-label', 'home.howTo');
        setText('#treasure-btn', 'home.treasure');
        setAttr('#treasure-btn', 'aria-label', 'home.treasure');
        setText('#parent-settings-btn', 'home.settings');
        setAttr('#parent-settings-btn', 'aria-label', 'home.settings');
        setText('#back-to-v3-btn', 'home.v3');
        setAttr('#back-to-v3-btn', 'aria-label', 'home.v3Aria');
        setText('#back-to-v2-btn', 'home.v2');
        setAttr('#back-to-v2-btn', 'aria-label', 'home.v2Aria');
        setText('#task-text', 'hud.taskDefault');
        setAttr('#sound-btn', 'aria-label', 'hud.sound');
        setAttr('#sound-btn', 'title', 'hud.sound');
        setAttr('#pause-btn', 'aria-label', 'hud.pause');
        setAttr('#pause-btn', 'title', 'hud.pause');

        document.querySelectorAll('.btn-diff').forEach((button) => {
            const mode = button.dataset.diff;
            const label = button.querySelector('.diff-title');
            const desc = button.querySelector('.diff-desc');
            if (label) label.textContent = this.t(`modes.${mode}.label`);
            if (desc) desc.textContent = this.t(`modes.${mode}.description`);
            button.setAttribute('aria-label', this.t(`modes.${mode}.aria`));
        });

        setText('#how-to-play-screen h2', 'howTo.title');
        setText('#how-to-play-screen p', 'howTo.body');
        setText('#close-how-to-btn', 'howTo.close');
        setAttr('#close-how-to-btn', 'aria-label', 'howTo.closeAria');

        setText('#parent-settings-screen h2', 'settings.title');
        setText('#parent-settings-screen .settings-desc', 'settings.desc');
        setText('#parent-settings-screen .parent-info-note:not(#reduced-motion-notice)', 'settings.info');
        setLabel('label[for="setting-speed"]', 'settings.speed');
        setAttr('#setting-speed', 'aria-label', 'settings.speed');
        setOption('#setting-speed', 'slow', 'settings.speedSlow');
        setOption('#setting-speed', 'normal', 'settings.speedNormal');
        setOption('#setting-speed', 'fast', 'settings.speedFast');
        setLabel('label[for="setting-tolerance"]', 'settings.tolerance');
        setAttr('#setting-tolerance', 'aria-label', 'settings.tolerance');
        setOption('#setting-tolerance', 'loose', 'settings.toleranceLoose');
        setOption('#setting-tolerance', 'standard', 'settings.toleranceStandard');
        setLabel('label[for="setting-lives"]', 'settings.lives');
        setAttr('#setting-lives', 'aria-label', 'settings.lives');
        setOption('#setting-lives', 'difficulty', 'settings.livesDifficulty');
        setOption('#setting-lives', '3', 'settings.lives3');
        setOption('#setting-lives', '5', 'settings.lives5');
        setText('#setting-lives + .setting-tip', 'settings.livesTip');
        setLabel('label[for="setting-message"]', 'settings.parentMessage');
        setAttr('#setting-message', 'aria-label', 'settings.parentMessage');
        setAttr('#setting-message', 'placeholder', 'settings.parentPlaceholder');
        setLabel('#setting-rest-reminder', 'settings.restReminder');
        setLabel('#setting-gentle-mode', 'settings.gentleMode');
        setLabel('#setting-calm-mode', 'settings.calmMode');
        const calmTip = document.getElementById('calm-mode-tip');
        if (calmTip) calmTip.textContent = this.t('settings.calmTip');
        setText('#close-settings-btn', 'settings.close');
        setAttr('#close-settings-btn', 'aria-label', 'settings.ariaClose');
        setText('#reset-high-score-btn', 'settings.reset');
        setAttr('#reset-high-score-btn', 'aria-label', 'settings.ariaReset');

        setText('#treasure-screen h2', 'treasure.title');
        setText('.treasure-desc', 'treasure.desc');
        setAttr('.tabs', 'aria-label', 'treasure.tabs');
        setText('#tab-stickers', 'treasure.stickers');
        setAttr('#tab-stickers', 'aria-label', 'treasure.stickersAria');
        setText('#tab-cosmetics', 'treasure.cosmetics');
        setAttr('#tab-cosmetics', 'aria-label', 'treasure.cosmeticsAria');
        setText('#close-treasure-btn', 'treasure.close');
        setAttr('#close-treasure-btn', 'aria-label', 'treasure.closeAria');
        setText('.treasure-footer-note', 'treasure.footer');

        setText('#pause-screen h2', 'pause.title');
        setLabel('#pause-mode', 'pause.mode');
        setLabel('#pause-score', 'pause.score');
        setLabel('#pause-task', 'pause.task');
        setText('#resume-btn', 'pause.resume');
        setAttr('#resume-btn', 'aria-label', 'pause.resumeAria');
        setText('#restart-from-pause-btn', 'pause.restart');
        setAttr('#restart-from-pause-btn', 'aria-label', 'pause.restartAria');
        setText('#back-to-home-from-pause-btn', 'pause.home');
        setAttr('#back-to-home-from-pause-btn', 'aria-label', 'pause.homeAria');

        setText('#over-title', 'over.title');
        setText('#game-over-screen .final-stats h3', 'over.report');
        setLabel('#final-mode', 'over.mode');
        setLabel('#final-stage', 'over.stage');
        setLabel('#final-score', 'over.score');
        setLabel('#final-vines', 'over.vines');
        setLabel('#final-task', 'over.task');
        setLabel('#record-score', 'over.record');
        setText('#restart-btn', 'over.restart');
        setAttr('#restart-btn', 'aria-label', 'over.restartAria');
        setText('#back-to-home-btn', 'over.home');
        setAttr('#back-to-home-btn', 'aria-label', 'over.homeAria');

        const testBack = document.querySelector('.back-link');
        if (testBack) testBack.textContent = this.t('test.back');
    },

    syncConfig(config) {
        if (!config) return;
        Object.keys(config.GAME_MODES || {}).forEach((mode) => {
            config.GAME_MODES[mode].label = this.t(`modes.${mode}.label`);
            config.GAME_MODES[mode].description = this.t(`modes.${mode}.description`);
        });
        Object.keys(config.STAGES || {}).forEach((stage) => {
            config.STAGES[stage].label = this.t(`stages.${stage}.label`);
            config.STAGES[stage].message = this.t(`stages.${stage}.message`);
        });
        Object.keys(config.MISSIONS || {}).forEach((id) => {
            config.MISSIONS[id].title = this.t(`missions.${id}.title`);
            config.MISSIONS[id].description = this.t(`missions.${id}.description`);
            config.MISSIONS[id].onCompleteMessage = this.t(`missions.${id}.complete`);
        });
        (config.UNLOCKS || []).forEach((item) => {
            item.label = this.t(`unlocks.${item.id}`);
        });
        if (config.defaultAssistSettings) {
            config.defaultAssistSettings.parentMessage = this.t('messages.parentDefault');
        }
        if (config.UI_TEXT) {
            config.UI_TEXT.title = this.t('home.title');
            config.UI_TEXT.subtitle = this.t('home.subtitle');
            config.UI_TEXT.message = this.t('messages.onboarding');
            config.UI_TEXT.restReminder = this.t('messages.restReminder');
            config.UI_TEXT.noAdCommitment = this.t('treasure.footer');
            config.UI_TEXT.reducedMotionNotice = this.t('settings.reducedMotionNotice');
        }
    },

    format(key, params = {}) {
        return this.t(key, params);
    },

    modeLabel(mode) {
        return this.t(`modes.${mode}.label`) || mode;
    },

    stageLabel(stage) {
        return this.t(`stages.${stage}.label`) || stage;
    },

    missionCompleteWords() {
        return this.t('messages.missionRibbonWords') || [];
    },

    validateKeys() {
        const collect = (obj, prefix = '') => Object.keys(obj).flatMap((key) => {
            const value = obj[key];
            const path = prefix ? `${prefix}.${key}` : key;
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                return collect(value, path);
            }
            return [path];
        });
        const enKeys = collect(this.translations.en).sort();
        const zhKeys = collect(this.translations.zh).sort();
        const missingInZh = enKeys.filter((key) => !zhKeys.includes(key));
        const missingInEn = zhKeys.filter((key) => !enKeys.includes(key));
        return { missingInZh, missingInEn };
    }
};
