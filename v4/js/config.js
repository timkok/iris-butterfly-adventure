window.IrisGame = window.IrisGame || {};

window.IrisGame.config = {
    GAME_MODES: {
        practice: {
            label: '练习课',
            description: '不会失败 / 无限心',
            lives: 99,
            baseSpeed: 0.9,
            baseGap: 260,
            baseSpawnRate: 185,
            minGap: 240,
            minSpawnRate: 160,
            difficultyGrowth: 0.05,
            recommended: false
        },
        easy: {
            label: '花园课',
            description: '推荐 / 5 心',
            lives: 5,
            baseSpeed: 1.2,
            baseGap: 230,
            baseSpawnRate: 160,
            minGap: 200,
            minSpawnRate: 130,
            difficultyGrowth: 0.12,
            recommended: true
        },
        normal: {
            label: '冒险课',
            description: '标准 / 3 心',
            lives: 3,
            baseSpeed: 1.8,
            baseGap: 180,
            baseSpawnRate: 126,
            minGap: 150,
            minSpawnRate: 95,
            difficultyGrowth: 0.20,
            recommended: false
        },
        hard: {
            label: '彩虹挑战',
            description: '高手 / 3 心',
            lives: 3,
            baseSpeed: 2.5,
            baseGap: 145,
            baseSpawnRate: 98,
            minGap: 120,
            minSpawnRate: 75,
            difficultyGrowth: 0.30,
            recommended: false
        }
    },

    STAGES: {
        warmup: {
            name: 'warmup',
            minScore: 0,
            label: '热身',
            message: '轻轻飞起来 🦋',
            hs: 195, ss: 100, ls: 87, // Sky-blue HSL Start
            he: 42, se: 100, le: 90,   // Cream HSL End
            speedMultiplier: 1.0,
            gapReduction: 0,
            spawnRateReduction: 0
        },
        garden: {
            name: 'garden',
            minScore: 6,
            label: '花园',
            message: '进入花园挑战区 🌿',
            hs: 112, ss: 60, ls: 85,  // Soft Green HSL Start
            he: 49, se: 100, le: 91,   // Pale Yellow HSL End
            speedMultiplier: 1.08,
            gapReduction: 10,
            spawnRateReduction: 0.05
        },
        breeze: {
            name: 'breeze',
            minScore: 16,
            label: '微风',
            message: '风变快啦，稳稳飞 ✨',
            hs: 185, ss: 52, ls: 78,  // Turquoise HSL Start
            he: 89, se: 74, le: 85,   // Lime HSL End
            speedMultiplier: 1.18,
            gapReduction: 25,
            spawnRateReduction: 0.12
        },
        rainbow: {
            name: 'rainbow',
            minScore: 31,
            label: '彩虹',
            message: '彩虹挑战开始 🌈',
            hs: 47, ss: 96, ls: 77,   // Warm Yellow HSL Start
            he: 0, se: 79, le: 73,    // Soft Red HSL End
            speedMultiplier: 1.28,
            gapReduction: 40,
            spawnRateReduction: 0.20
        }
    },

    MISSIONS: {
        collect_stars_10: {
            id: 'collect_stars_10',
            title: '收集 10 颗星星',
            description: '在这一局中累计收集 10 颗星星',
            target: 10,
            allowedModes: ['practice', 'easy', 'normal', 'hard'],
            getProgress: (g) => g.score,
            isComplete: (g) => g.score >= 10,
            onCompleteMessage: '收集任务完成！太棒啦 ✨'
        },
        pass_vines_5: {
            id: 'pass_vines_5',
            title: '穿过 5 组花藤',
            description: '成功飞跃 5 个藤蔓障碍',
            target: 5,
            allowedModes: ['practice', 'easy', 'normal', 'hard'],
            getProgress: (g) => g.passedObstacles,
            isComplete: (g) => g.passedObstacles >= 5,
            onCompleteMessage: '飞行挑战完成！继续创造纪录吧 🌿'
        },
        survive_30s: {
            id: 'survive_30s',
            title: '坚持飞行 30 秒',
            description: '在空中持续飞翔 30 秒',
            target: 30,
            allowedModes: ['practice', 'easy', 'normal', 'hard'],
            getProgress: (g) => Math.floor(g.flightFrames / 60),
            isComplete: (g) => (g.flightFrames / 60) >= 30,
            onCompleteMessage: '生存课任务完成！非常稳健 ✨'
        },
        collect_rainbow_star: {
            id: 'collect_rainbow_star',
            title: '收集 1 颗彩虹星星',
            description: '抓住难得一见的彩虹星星',
            target: 1,
            allowedModes: ['easy', 'normal', 'hard'],
            getProgress: (g) => g.rainbowStarsCollected || 0,
            isComplete: (g) => (g.rainbowStarsCollected || 0) >= 1,
            onCompleteMessage: '彩虹飞行课完成！你太厉害了 🌈'
        },
        clean_collect_5: {
            id: 'clean_collect_5',
            title: '不碰花藤收集 5 颗星星',
            description: '在无碰撞的状态下收集 5 颗星星',
            target: 5,
            allowedModes: ['easy', 'normal', 'hard'],
            getProgress: (g) => g.noHitStarCount || 0,
            isComplete: (g) => (g.noHitStarCount || 0) >= 5,
            onCompleteMessage: '完美收集挑战完成！太厉害了 🌟'
        }
    },

    UNLOCKS: [
        { id: 'star', label: '魔法星星', type: 'sticker', requirementHighScore: 5, icon: '⭐' },
        { id: 'flower', label: '七彩小花', type: 'sticker', requirementHighScore: 10, icon: '🌸' },
        { id: 'butterfly', label: '梦幻蝴蝶', type: 'sticker', requirementHighScore: 15, icon: '🦋' },
        { id: 'rainbow', label: '神奇彩虹', type: 'sticker', requirementHighScore: 25, icon: '🌈' },
        { id: 'crown', label: '终极皇冠', type: 'sticker', requirementHighScore: 40, icon: '👑' },

        { id: 'pink-wings', label: '甜心粉', type: 'cosmetic', requirementHighScore: 20, icon: '🦋', style: 'filter: hue-rotate(300deg) saturate(1.4);' },
        { id: 'star-trail', label: '闪耀星踪', type: 'cosmetic', requirementHighScore: 35, icon: '✨', style: '' },
        { id: 'rainbow-wings', label: '梦幻彩虹', type: 'cosmetic', requirementHighScore: 50, icon: '🦋', class: 'rainbow-anim' }
    ],

    EFFECTS_POLICY: {
        maxParticles: 80,
        maxLeaves: 12,
        maxTapRipples: 4,
        stickerCelebrationMs: 2200,
        treasureStaggerEnabled: true,
        tapRippleEnabled: true,
        leavesEnabled: true,
        shieldHaloEnabled: true,
        calmModeParticleMultiplier: 0.45,
        reducedMotionDisableAmbient: true,
        reducedMotionDisableStagger: true,
        reducedMotionDisableRipple: true
    },

    FLIGHT_FEEL: {
        practice: { gravity: 0.155, lift: -4.45, maxFallSpeed: 4.2, collisionBounce: -3.2, coyoteFrames: 14 },
        easy: { gravity: 0.165, lift: -4.65, maxFallSpeed: 4.6, collisionBounce: -3.0, coyoteFrames: 12 },
        normal: { gravity: 0.18, lift: -4.85, maxFallSpeed: 5.1, collisionBounce: -2.8, coyoteFrames: 9 },
        hard: { gravity: 0.195, lift: -5.0, maxFallSpeed: 5.6, collisionBounce: -2.55, coyoteFrames: 7 }
    },

    FAIRNESS: {
        gapCenterMaxDelta: {
            practice: 70,
            easy: 90,
            normal: 130,
            hard: 170
        },
        starSafetyMargin: 24,
        recoveryForwardNudge: {
            practice: 0,
            easy: 6,
            normal: 4,
            hard: 2
        }
    },

    ADAPTIVE_FLOW: {
        assistGapCount: 2,
        assistGapBonus: 24,
        assistSpawnRateMultiplier: 1.18,
        assistStarRateMultiplier: 0.78,
        lowScoreFrameThreshold: 1800,
        lowScoreThreshold: 3,
        lowScoreSpawnRateMultiplier: 1.10,
        recentWindow: 10
    },

    defaultAssistSettings: {
        speed: 'normal',
        tolerance: 'standard',
        lives: 'difficulty',
        parentMessage: 'Iris 真棒，爱你！'
    },

    UI_TEXT: {
        title: '🦋 Iris 的蝴蝶奇遇',
        subtitle: '彩虹花园飞行课',
        restReminder: '休息一下眼睛吧，等会儿再飞也很棒 🌼',
        gentleTip: '（开启时：碰撞更轻柔、音效更轻、文案更鼓励、难度增长变慢、彩虹星星出现更频繁，不显示“失败”字样）',
        noAdCommitment: '💝 所有宝贝都靠飞行解锁，没有购买内容。',
        reducedMotionNotice: '⚙️ 检测到系统已开启减少动态效果，已自动为您优化动画体验。'
    },

    AUDIO_SETTINGS: {
        baseGain: 0.05,
        collectGain: 0.015,
        hitGainNormal: 0.02,
        hitGainGentle: 0.012,
        clickGain: 0.004
    },

    ACCESSIBILITY_SETTINGS: {
        minTouchTargetSize: 44,
        calmModeMultiplier: 0.90
    }
};

if (window.IrisGame.i18n) {
    window.IrisGame.i18n.syncConfig(window.IrisGame.config);
}
