const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

const storage = {
    highScore: 'iris_butterfly_highScore',
    settings: 'iris_butterfly_parentSettings',
    cosmetics: 'iris_butterfly_cosmetics',
    activeCosmetic: 'iris_butterfly_activeCosmetic',
    stickers: 'iris_butterfly_stickers',
    restReminder: 'iris_butterfly_restReminder',
    gentleMode: 'iris_butterfly_gentleMode'
};

// V3 Config-driven constants
const GAME_MODES = {
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
};

const STAGES = {
    warmup: {
        name: 'warmup',
        minScore: 0,
        label: '热身期',
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
        label: '花园期',
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
        label: '微风期',
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
        label: '彩虹挑战',
        message: '彩虹挑战开始 🌈',
        hs: 47, ss: 96, ls: 77,   // Warm Yellow HSL Start
        he: 0, se: 79, le: 73,    // Soft Red HSL End
        speedMultiplier: 1.28,
        gapReduction: 40,
        spawnRateReduction: 0.20
    }
};

const MISSIONS = {
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
};

const UNLOCKS = [
    { id: 'star', label: '魔法星星', type: 'sticker', requirementHighScore: 5, icon: '⭐' },
    { id: 'flower', label: '七彩小花', type: 'sticker', requirementHighScore: 10, icon: '🌸' },
    { id: 'butterfly', label: '梦幻蝴蝶', type: 'sticker', requirementHighScore: 15, icon: '🦋' },
    { id: 'rainbow', label: '神奇彩虹', type: 'sticker', requirementHighScore: 25, icon: '🌈' },
    { id: 'crown', label: '终极皇冠', type: 'sticker', requirementHighScore: 40, icon: '👑' },
    
    { id: 'pink-wings', label: '甜心粉', type: 'cosmetic', requirementHighScore: 20, icon: '🦋', style: 'filter: hue-rotate(300deg) saturate(1.4);' },
    { id: 'star-trail', label: '闪耀星踪', type: 'cosmetic', requirementHighScore: 35, icon: '✨', style: '' },
    { id: 'rainbow-wings', label: '梦幻彩虹', type: 'cosmetic', requirementHighScore: 50, icon: '🦋', class: 'rainbow-anim' }
];

// Central state object
const game = {
    state: 'START',
    mode: 'easy',
    score: 0,
    highScore: Number(localStorage.getItem(storage.highScore) || 0),
    lives: 5,
    passedObstacles: 0,
    flightFrames: 0,
    currentStage: 'warmup',
    
    mission: null,
    missionCompleted: false,
    rainbowStarsCollected: 0,
    noHitStarCount: 0,
    
    soundEnabled: localStorage.getItem('iris_butterfly_soundEnabled') === 'true',
    sessionStartTime: Date.now(),
    hasShownRestReminder: false,
    restReminderEnabled: localStorage.getItem(storage.restReminder) !== 'false',
    gentleModeEnabled: localStorage.getItem(storage.gentleMode) !== 'false',
    
    newHighScoreThisRun: false,
    hasReached10: localStorage.getItem('iris_butterfly_reached10') === 'true',
    hasReached15: localStorage.getItem('iris_butterfly_reached15') === 'true',
    
    lastRainbowStarScore: 0,
    resetConfirmState: false,
    resetConfirmTimer: null
};

let gameState = 'START';
let frameCount = 0;
let gameTime = 0;
let screenShake = 0;

const defaultAssistSettings = {
    speed: 'normal',
    tolerance: 'standard',
    lives: 'difficulty',
    parentMessage: 'Iris 真棒，爱你！'
};

// Check accessibility settings
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Backdrop HSL Animation trackers
let currentHStart = 195, currentSStart = 100, currentLStart = 87;
let currentHEnd = 42, currentSEnd = 100, currentLEnd = 90;

let audioCtx = null;
let currentMessageTimer = null;
let currentMessagePriority = 0;

let assistSettings = loadAssistSettings();
let currentSettings = {};

let ownedCosmetics = JSON.parse(localStorage.getItem(storage.cosmetics) || '["default"]');
let activeCosmetic = localStorage.getItem(storage.activeCosmetic) || 'default';
let ownedStickers = JSON.parse(localStorage.getItem(storage.stickers) || '[]');

const screens = {
    start: document.getElementById('start-screen'),
    howTo: document.getElementById('how-to-play-screen'),
    settings: document.getElementById('parent-settings-screen'),
    treasure: document.getElementById('treasure-screen'),
    pause: document.getElementById('pause-screen'),
    gameOver: document.getElementById('game-over-screen')
};

const ui = {
    hud: document.getElementById('hud'),
    score: document.getElementById('score'),
    lives: document.getElementById('lives'),
    finalScore: document.getElementById('final-score'),
    finalVines: document.getElementById('final-vines'),
    finalMode: document.getElementById('final-mode'),
    finalStage: document.getElementById('final-stage'),
    finalTask: document.getElementById('final-task'),
    recordScore: document.getElementById('record-score'),
    overTitle: document.getElementById('over-title'),
    overEncouragement: document.getElementById('over-encouragement'),
    taskDisplay: document.getElementById('task-display'),
    taskText: document.getElementById('task-text'),
    taskProgress: document.getElementById('task-progress'),
    message: document.getElementById('message-display'),
    easterEgg: document.getElementById('easter-egg-msg'),
    eggText: document.getElementById('egg-text'),
    sound: document.getElementById('sound-btn'),
    pause: document.getElementById('pause-btn'),
    speed: document.getElementById('setting-speed'),
    tolerance: document.getElementById('setting-tolerance'),
    livesSetting: document.getElementById('setting-lives'),
    parentMessage: document.getElementById('setting-message'),
    restReminderCheckbox: document.getElementById('setting-rest-reminder'),
    gentleModeCheckbox: document.getElementById('setting-gentle-mode')
};

const player = {
    x: 82,
    y: 300,
    radius: 12,
    gravity: 0.18,
    lift: -4.8,
    velocity: 0,
    scale: 1,
    invincibleFrames: 0,
    wingPhase: 0
};

let playerTrail = [];
let obstacles = [];
let stars = [];
let particles = [];
let windLines = [];
let bgElements = [];
const firstObstacleFrame = 120;

// Parallax background controller
const parallaxBg = {
    clouds: [],
    hills: [],
    flowers: [],
    
    init() {
        this.clouds = [];
        this.hills = [];
        this.flowers = [];
        
        for (let i = 0; i < 3; i++) {
            this.clouds.push({ x: i * 160 + Math.random() * 40, y: 50 + Math.random() * 40, w: 80, speedFactor: 0.12 });
        }
        for (let i = 0; i < 3; i++) {
            this.hills.push({ x: i * 180, y: 430 + (i % 2) * 16, w: 190, h: 120, color: '#9bd98e', speedFactor: 0.32 });
        }
        for (let i = 0; i < 5; i++) {
            this.flowers.push({ x: i * 90 + 20, y: 500 + (i % 3) * 10, w: 26, h: 80, color: ['#ff8dbc', '#ffd36e', '#77c987'][i % 3], speedFactor: 0.65 });
        }
    },
    
    update() {
        const speed = currentSettings.speed || 1.0;
        const speedMultiplier = prefersReducedMotion ? 0.05 : 1.0;
        
        this.clouds.forEach(c => {
            if (gameState === 'PLAYING') {
                c.x -= speed * c.speedFactor * speedMultiplier;
            }
            if (c.x + c.w < -40) c.x = canvas.width + 40;
        });
        
        this.hills.forEach(h => {
            if (gameState === 'PLAYING') {
                h.x -= speed * h.speedFactor * speedMultiplier;
            }
            if (h.x + h.w < -40) h.x = canvas.width + h.w;
        });
        
        this.flowers.forEach(f => {
            if (gameState === 'PLAYING') {
                f.x -= speed * f.speedFactor * speedMultiplier;
            }
            if (f.x + f.w < -40) f.x = canvas.width + 40;
        });
    },
    
    drawHills() {
        this.hills.forEach(h => {
            ctx.fillStyle = h.color;
            ctx.beginPath();
            ctx.arc(h.x + h.w / 2, h.y + h.h, h.w / 2, Math.PI, 0);
            ctx.fill();
        });
    },
    
    drawClouds() {
        this.clouds.forEach(c => {
            drawCloud(c.x, c.y, c.w, '#ffffff');
        });
    },
    
    drawFlowers() {
        this.flowers.forEach(f => {
            ctx.strokeStyle = '#66a95c';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(f.x + 12, f.y + 45);
            ctx.lineTo(f.x + 12, f.y + f.h);
            ctx.stroke();
            drawFlower(f.x + 12, f.y + 42, 8, f.color);
        });
    }
};

function loadAssistSettings() {
    try {
        const stored = { ...defaultAssistSettings, ...JSON.parse(localStorage.getItem(storage.settings) || '{}') };
        if (stored.lives === '99') stored.lives = 'difficulty';
        return stored;
    } catch {
        return { ...defaultAssistSettings };
    }
}

function saveAssistSettings() {
    localStorage.setItem(storage.settings, JSON.stringify(assistSettings));
}

function buildSettings() {
    const modeConf = GAME_MODES[game.mode];
    const speedMult = assistSettings.speed === 'slow' ? 0.78 : assistSettings.speed === 'fast' ? 1.14 : 1;
    const toleranceAdd = assistSettings.tolerance === 'loose' ? 10 : 0;
    const livesOverride = assistSettings.lives === 'difficulty' ? NaN : Number(assistSettings.lives);

    return {
        speed: modeConf.baseSpeed * speedMult,
        starSpeed: Math.max(0.8, (modeConf.baseSpeed + 0.65) * speedMult),
        gap: modeConf.baseGap + toleranceAdd,
        tolerance: modeConf.tolerance + toleranceAdd,
        spawnRate: Math.round(modeConf.baseSpawnRate / Math.max(0.82, speedMult)),
        starRate: 100,
        lives: game.mode === 'practice' ? 99 : Number.isFinite(livesOverride) ? livesOverride : modeConf.lives
    };
}

function getStageForScore(scoreValue) {
    let result = 'warmup';
    Object.keys(STAGES).forEach(key => {
        if (scoreValue >= STAGES[key].minScore) {
            result = key;
        }
    });
    return result;
}

function updateStage() {
    const nextStage = getStageForScore(game.score);
    if (nextStage !== game.currentStage) {
        game.currentStage = nextStage;
        const stageInfo = STAGES[game.currentStage];
        showMessage(stageInfo.message, 2, 2200);
    }
}

function applyStageDifficulty() {
    const modeConf = GAME_MODES[game.mode];
    const stageConf = STAGES[game.currentStage];
    
    const speedMult = assistSettings.speed === 'slow' ? 0.78 : assistSettings.speed === 'fast' ? 1.14 : 1;
    const toleranceAdd = assistSettings.tolerance === 'loose' ? 10 : 0;
    
    // Slower growth if gentle mode enabled
    const growthFactor = game.gentleModeEnabled ? 0.6 : 1.0;
    
    const stageSpeedMult = 1 + (stageConf.speedMultiplier - 1) * growthFactor;
    const stageGapReduce = stageConf.gapReduction * growthFactor;
    const stageSpawnRateReduce = stageConf.spawnRateReduction * growthFactor;
    
    currentSettings.speed = modeConf.baseSpeed * speedMult * stageSpeedMult;
    currentSettings.starSpeed = Math.max(0.8, (modeConf.baseSpeed + 0.65) * speedMult * stageSpeedMult);
    
    currentSettings.gap = Math.max(modeConf.minGap, modeConf.baseGap + toleranceAdd - stageGapReduce);
    currentSettings.spawnRate = Math.max(modeConf.minSpawnRate, Math.round((modeConf.baseSpawnRate / Math.max(0.82, speedMult)) * (1 - stageSpawnRateReduce)));
    currentSettings.tolerance = modeConf.tolerance + toleranceAdd;
}

// Centralized mission system
const missionSystem = {
    chooseMission(modeName) {
        game.missionCompleted = false;
        game.rainbowStarsCollected = 0;
        game.noHitStarCount = 0;
        
        let poolList = Object.values(MISSIONS);
        // Practice mode restricts to easy missions only
        if (modeName === 'practice') {
            poolList = poolList.filter(m => m.id === 'collect_stars_10' || m.id === 'pass_vines_5' || m.id === 'survive_30s');
        } else {
            poolList = poolList.filter(m => m.allowedModes.includes(modeName));
        }
        
        const rIndex = Math.floor(Math.random() * poolList.length);
        game.mission = poolList[rIndex];
    },
    
    trigger(type, value = 1) {
        if (game.missionCompleted || !game.mission) return;
        
        if (game.mission.id === 'clean_collect_5') {
            if (type === 'hit') {
                game.noHitStarCount = 0;
                updateHUD();
            } else if (type === 'star') {
                game.noHitStarCount += value;
                if (game.noHitStarCount >= game.mission.target) {
                    this.complete();
                }
            }
        } else if (game.mission.id === 'collect_rainbow_star' && type === 'rainbow') {
            game.rainbowStarsCollected += value;
            if (game.rainbowStarsCollected >= game.mission.target) {
                this.complete();
            }
        } else {
            const currentProgress = game.mission.getProgress(game);
            if (currentProgress >= game.mission.target) {
                this.complete();
            }
        }
    },
    
    complete() {
        game.missionCompleted = true;
        showMessage(game.mission.onCompleteMessage, 2, 2500);
        updateHUD();
    },
    
    getDisplayText() {
        if (game.missionCompleted) {
            return "挑战最高分";
        }
        return game.mission ? game.mission.title : "";
    },
    
    getDisplayProgress() {
        if (game.missionCompleted) {
            return game.newHighScoreThisRun ? "✨ 新记录！" : `(目标: ${game.highScore})`;
        }
        if (!game.mission) return "";
        
        let val = 0;
        if (game.mission.id === 'clean_collect_5') {
            val = game.noHitStarCount;
        } else if (game.mission.id === 'collect_rainbow_star') {
            val = game.rainbowStarsCollected;
        } else {
            val = game.mission.getProgress(game);
        }
        
        const suffix = game.mission.id === 'survive_30s' ? '秒' : '';
        return `(${Math.min(val, game.mission.target)}/${game.mission.target}${suffix})`;
    }
};

function showScreen(screen) {
    Object.values(screens).forEach(panel => panel.classList.remove('active'));
    if (screen) screen.classList.add('active');
}

function setGameUiVisible(visible) {
    ui.hud.classList.toggle('hidden', !visible);
    ui.taskDisplay.classList.toggle('hidden', !visible || gameState !== 'PLAYING');
}

function updateBackgroundColors() {
    const stageConf = STAGES[game.currentStage];
    currentHStart += (stageConf.hs - currentHStart) * 0.015;
    currentSStart += (stageConf.ss - currentSStart) * 0.015;
    currentLStart += (stageConf.ls - currentLStart) * 0.015;
    
    currentHEnd += (stageConf.he - currentHEnd) * 0.015;
    currentSEnd += (stageConf.se - currentSEnd) * 0.015;
    currentLEnd += (stageConf.le - currentLEnd) * 0.015;
}

function updateWindLines() {
    if (game.currentStage !== 'breeze') {
        windLines = [];
        return;
    }
    
    if (windLines.length < 4 && Math.random() < 0.06) {
        windLines.push({
            x: canvas.width + 20,
            y: 80 + Math.random() * (canvas.height - 200),
            length: 40 + Math.random() * 60,
            speed: (currentSettings.speed + 1.2) * (prefersReducedMotion ? 0.05 : 1.0)
        });
    }
    
    for (let i = windLines.length - 1; i >= 0; i--) {
        const line = windLines[i];
        line.x -= line.speed;
        if (line.x + line.length < 0) {
            windLines.splice(i, 1);
        }
    }
}

function drawWindLines() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    windLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x + line.length, line.y);
        ctx.stroke();
    });
    ctx.restore();
}

function drawParallaxFar() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `hsl(${Math.round(currentHStart)}, ${Math.round(currentSStart)}%, ${Math.round(currentLStart)}%)`);
    gradient.addColorStop(1, `hsl(${Math.round(currentHEnd)}, ${Math.round(currentSEnd)}%, ${Math.round(currentLEnd)}%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (game.currentStage !== 'rainbow') {
        ctx.save();
        ctx.beginPath();
        const grad = ctx.createRadialGradient(300, 80, 5, 300, 80, 30);
        grad.addColorStop(0, 'rgba(255, 245, 200, 0.9)');
        grad.addColorStop(0.3, 'rgba(255, 220, 110, 0.7)');
        grad.addColorStop(1, 'rgba(255, 220, 110, 0)');
        ctx.fillStyle = grad;
        ctx.arc(300, 80, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    } else {
        ctx.save();
        ctx.globalAlpha = 0.20;
        ctx.lineWidth = 6;
        const rainbowColors = ['#ff7eb3', '#ffba5c', '#ffd36e', '#77c987', '#7dc8ff', '#9b8cff'];
        rainbowColors.forEach((color, idx) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.arc(200, 360, 220 - idx * 6, Math.PI, 0);
            ctx.stroke();
        });
        ctx.restore();
    }
}

function drawBackground() {
    drawParallaxFar();
    
    parallaxBg.drawClouds();
    drawWindLines();
    parallaxBg.drawHills();
    parallaxBg.drawFlowers();
    
    ctx.fillStyle = '#8bd080';
    ctx.fillRect(0, canvas.height - 16, canvas.width, 16);
    
    ctx.strokeStyle = '#6bb060';
    ctx.lineWidth = 2;
    const speedMultiplier = prefersReducedMotion ? 0.05 : 1.0;
    const speed = currentSettings.speed || 1.0;
    
    ctx.save();
    for (let x = (frameCount * -speed * speedMultiplier) % 40; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 16);
        ctx.lineTo(x - 4, canvas.height - 24);
        ctx.stroke();
    }
    ctx.restore();
}

function drawCloud(x, y, w, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + w * 0.25, y + 16, 16, 0, Math.PI * 2);
    ctx.arc(x + w * 0.5, y + 9, 22, 0, Math.PI * 2);
    ctx.arc(x + w * 0.75, y + 17, 15, 0, Math.PI * 2);
    ctx.rect(x + 12, y + 16, w - 24, 18);
    ctx.fill();
}

function drawFlower(x, y, size, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
        const angle = i * Math.PI * 2 / 5;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * size, y + Math.sin(angle) * size, size * 0.75, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = '#fff7aa';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.72, 0, Math.PI * 2);
    ctx.fill();
}

function drawLeaf(x, y, dir) {
    ctx.fillStyle = '#3f9a50';
    ctx.beginPath();
    ctx.ellipse(x + dir * 13, y, 13, 6, dir * 0.45, 0, Math.PI * 2);
    ctx.fill();
}

function loop() {
    ctx.save();
    if (screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
        screenShake *= 0.88;
    }

    drawBackground();

    if (gameState === 'PLAYING') {
        updateGame();
    }

    // Check playtime for Game Over or Pause trigger
    if (game.restReminderEnabled && (Date.now() - game.sessionStartTime > 300000) && !game.hasShownRestReminder) {
        // Just flag it. It will pop up when game over or paused.
    }

    drawObjects();
    drawPlayer();
    ctx.restore();
    requestAnimationFrame(loop);
}

function updateGame() {
    frameCount++;
    gameTime++;
    game.flightFrames++;
    player.scale += (1 - player.scale) * 0.1;
    player.wingPhase += 0.28;
    player.velocity += player.gravity;
    player.y += player.velocity;
    if (player.invincibleFrames > 0) player.invincibleFrames--;

    if (player.y > canvas.height - player.radius - 16) {
        player.y = canvas.height - player.radius - 16;
        handleCollision('小蝴蝶碰到草地啦，轻轻飞起来！');
    }

    if (player.y < player.radius) {
        player.y = player.radius;
        player.velocity = 0;
    }

    if (frameCount >= 120) {
        const obstacleFrames = frameCount - 120;
        if (obstacleFrames === 0 || (obstacleFrames > 0 && obstacleFrames % currentSettings.spawnRate === 0)) {
            spawnObstacle();
        }
    }
    if (frameCount % currentSettings.starRate === 0) spawnStar();

    updateObstacles();
    updateStars();
    updateParticles();
    
    // Parallax update
    parallaxBg.update();
    updateWindLines();
    updateBackgroundColors();
    updatePlayerTrail();
    
    // Time progress mission trigger
    if (game.flightFrames % 60 === 0) {
        missionSystem.trigger('time', 1);
        updateHUD();
    }
}

function updatePlayerTrail() {
    if (prefersReducedMotion) {
        playerTrail = [];
        return;
    }
    playerTrail.push({ x: player.x, y: player.y });
    const maxTrailLength = activeCosmetic === 'star-trail' ? 15 : 8;
    while (playerTrail.length > maxTrailLength) {
        playerTrail.shift();
    }
}

function drawPlayerTrail() {
    if (prefersReducedMotion) return;
    
    ctx.save();
    playerTrail.forEach((pt, idx) => {
        const alpha = (idx + 1) / playerTrail.length * 0.45;
        ctx.globalAlpha = alpha;
        
        if (activeCosmetic === 'star-trail') {
            ctx.fillStyle = '#ffd36e';
            ctx.font = `${10 + idx * 0.8}px serif`;
            ctx.fillText('✨', pt.x - 12 - (playerTrail.length - idx) * 1.5, pt.y + (Math.sin(idx + frameCount * 0.1) * 3));
        } else if (activeCosmetic === 'rainbow-wings') {
            ctx.filter = `hue-rotate(${(frameCount * 4 + idx * 10) % 360}deg)`;
            ctx.fillStyle = '#ff7eb3';
            ctx.beginPath();
            ctx.arc(pt.x - 12, pt.y, 4 + idx * 0.3, 0, Math.PI * 2);
            ctx.fill();
        } else if (activeCosmetic === 'pink-wings') {
            ctx.fillStyle = '#ff9bb5';
            ctx.beginPath();
            ctx.arc(pt.x - 12, pt.y, 4 + idx * 0.3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(pt.x - 12, pt.y, 3 + idx * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    ctx.restore();
}

function spawnObstacle() {
    const margin = 76;
    let gap = currentSettings.gap;
    const isFirstObstacle = (obstacles.length === 0 && frameCount <= 300);
    if (isFirstObstacle) {
        gap += 25;
    }

    const minGapCenter = margin + gap / 2;
    const maxGapCenter = canvas.height - 70 - gap / 2;
    const gapY = minGapCenter + Math.random() * (maxGapCenter - minGapCenter);
    const width = 58;
    const obsX = canvas.width + 12;
    
    obstacles.push({
        x: obsX,
        width,
        gapY,
        gap,
        passed: false,
        flowerOffset: Math.random() * 100,
        isFirst: isFirstObstacle
    });

    if (Math.random() < 0.5) {
        spawnStar(obsX + width / 2, gapY);
    }
}

function spawnStar(x = null, y = null) {
    const starX = x !== null ? x : canvas.width + 24;
    const starY = y !== null ? y : 78 + Math.random() * (canvas.height - 178);
    
    let isRainbow = false;
    const targetGap = game.gentleModeEnabled ? 12 : 15;
    
    if (game.score - game.lastRainbowStarScore >= targetGap && Math.random() < 0.35) {
        isRainbow = true;
        game.lastRainbowStarScore = game.score;
        showMessage("彩虹星星出现啦 🌈", 2, 2000);
    }
    
    stars.push(new Star(starX, starY, currentSettings.starSpeed, isRainbow ? 'rainbow' : 'normal'));
}

function spawnStarterStars() {
    stars.push(new Star(canvas.width * 0.72, 230, currentSettings.starSpeed));
    stars.push(new Star(canvas.width + 80, 340, currentSettings.starSpeed));
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= currentSettings.speed;
        if (!obstacle.passed && obstacle.x + obstacle.width < player.x) {
            obstacle.passed = true;
            game.passedObstacles++;
            missionSystem.trigger('vine', 1);
            updateHUD();
        }
        if (collidesWithObstacle(obstacle)) {
            handleCollision(game.mode === 'practice' ? '练习模式，继续飞！' : '碰到花藤啦，没关系，再试一次！');
        }
        if (obstacle.x + obstacle.width < -30) obstacles.splice(i, 1);
    }
}

function updateStars() {
    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        star.update();
        if (Math.hypot(player.x - star.x, player.y - star.y) < player.radius + 16) {
            playSound('collect', star.x);
            const points = star.type === 'rainbow' ? 3 : 1;
            game.score += points;
            
            player.scale = 1.45;
            screenShake = game.gentleModeEnabled ? 1 : 3;
            createParticles(star.x, star.y, star.type === 'rainbow' ? '#ff7eb3' : '#ffd36e', 12);
            stars.splice(i, 1);
            
            if (star.type === 'rainbow') {
                missionSystem.trigger('rainbow', 1);
            }
            missionSystem.trigger('star', 1);
            
            saveHighScoreIfNeeded();
            updateStage();
            applyStageDifficulty();
            updateHUD();
        } else if (star.x < -24) {
            stars.splice(i, 1);
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].alpha <= 0) particles.splice(i, 1);
    }
}

function drawObjects() {
    obstacles.forEach(drawObstacle);
    stars.forEach(star => star.draw());
    particles.forEach(particle => particle.draw());
}

function drawObstacle(obstacle) {
    const topHeight = obstacle.gapY - obstacle.gap / 2;
    const bottomY = obstacle.gapY + obstacle.gap / 2;
    const bottomHeight = canvas.height - bottomY;

    drawVineSegment(obstacle.x, 0, obstacle.width, topHeight, true, obstacle.flowerOffset);
    drawVineSegment(obstacle.x, bottomY, obstacle.width, bottomHeight, false, obstacle.flowerOffset + 30);
}

function drawVineSegment(x, y, width, height, top, offset) {
    if (height <= 0) return;
    const radius = 18;
    const gradient = ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, '#7bc981');
    gradient.addColorStop(0.5, '#9ee5a3');
    gradient.addColorStop(1, '#6bb872');

    ctx.fillStyle = gradient;
    roundRect(x + 8, y - (top ? radius : 0), width - 16, height + radius, radius);
    ctx.fill();

    ctx.strokeStyle = 'rgba(48, 126, 60, 0.35)';
    ctx.lineWidth = 3;
    for (let yy = y + 14; yy < y + height; yy += 26) {
        ctx.beginPath();
        ctx.moveTo(x + 15, yy);
        ctx.quadraticCurveTo(x + width / 2, yy + 14, x + width - 15, yy + 4);
        ctx.stroke();
    }

    const capY = top ? y + height - 7 : y + 7;
    ctx.fillStyle = '#8ce098';
    roundRect(x, capY - 10, width, 20, 10);
    ctx.fill();

    for (let i = 0; i < Math.max(1, Math.floor(height / 92)); i++) {
        const flowerY = y + 28 + ((i * 84 + offset) % Math.max(40, height - 40));
        drawFlower(x + (i % 2 ? width - 10 : 10), flowerY, 5, i % 2 ? '#ff9bb5' : '#ffe38f');
        drawLeaf(x + width / 2, flowerY + 10, i % 2 ? -1 : 1);
    }
    
    const tipY = top ? y + height - 2 : y + 2;
    drawFlower(x + 14, tipY, 4, '#ff9bb5');
    drawFlower(x + width - 14, tipY, 4, '#ffe38f');
}

function roundRect(x, y, w, h, r) {
    const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

function collidesWithObstacle(obstacle) {
    if (player.invincibleFrames > 0) return false;
    const tolerance = currentSettings.tolerance;
    const px = player.x;
    const py = player.y;
    const radius = Math.max(4, player.radius - tolerance);
    const topBottom = obstacle.gapY - obstacle.gap / 2;
    const bottomTop = obstacle.gapY + obstacle.gap / 2;
    const inX = px + radius > obstacle.x + 8 && px - radius < obstacle.x + obstacle.width - 8;
    if (!inX) return false;
    return py - radius < topBottom || py + radius > bottomTop;
}

function drawPlayer() {
    if (player.invincibleFrames > 0 && Math.floor(player.invincibleFrames / 6) % 2 === 0) return;

    // Draw particle trail
    drawPlayerTrail();

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(player.scale, player.scale);
    ctx.rotate(player.velocity * 0.045);

    const flap = Math.sin(player.wingPhase) * 0.18;
    ctx.globalAlpha = player.invincibleFrames > 0 ? 0.72 : 1;
    ctx.font = '28px serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    if (activeCosmetic === 'star-trail') {
        ctx.fillText('✨', -20, 10);
    }
    
    if (!prefersReducedMotion) {
        if (activeCosmetic === 'rainbow-wings') {
            ctx.filter = `hue-rotate(${(frameCount * 6) % 360}deg)`;
        } else if (activeCosmetic === 'pink-wings') {
            ctx.filter = 'hue-rotate(300deg) saturate(1.4)';
        }
    }

    ctx.scale(1, 1 + flap);
    ctx.fillText('🦋', 0, 0);
    ctx.restore();
}

function createParticles(x, y, color, count = 6) {
    if (prefersReducedMotion) return;
    for (let i = 0; i < count; i++) {
        if (particles.length >= 80) {
            particles.shift();
        }
        particles.push(new Particle(x, y, color));
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.alpha = 1;
        this.size = Math.random() * 4 + 2;
        this.vx = Math.random() * 3 - 1.5;
        this.vy = Math.random() * 3 - 1.5;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.02;
        this.alpha -= 0.025;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Star {
    constructor(x, y, speed, type = 'normal') {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.angle = Math.random() * Math.PI * 2;
        this.type = type;
    }
    update() {
        this.x -= this.speed;
        this.angle += 0.08;
        this.y += Math.sin(this.angle) * 0.35;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        if (this.type === 'rainbow') {
            if (!prefersReducedMotion) {
                ctx.filter = `hue-rotate(${(frameCount * 8) % 360}deg) saturate(2)`;
            }
            ctx.shadowColor = '#ff7eb3';
            ctx.shadowBlur = 10;
            ctx.font = '28px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🌟', 0, 0);
        } else {
            ctx.shadowColor = '#ffd36e';
            ctx.shadowBlur = 8;
            ctx.font = '22px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⭐', 0, 0);
        }
        ctx.restore();
    }
}

function jump() {
    if (gameState === 'START') return;
    if (gameState === 'PLAYING') {
        player.velocity = player.lift;
        player.scale = 1.15;
        createParticles(player.x - 6, player.y + 8, '#ffffff', 3);
        playSound('click');
    }
}

function handleCollision(message) {
    if (player.invincibleFrames > 0 || gameState !== 'PLAYING') return;

    playSound('hit');
    screenShake = game.gentleModeEnabled ? (game.mode === 'practice' ? 2 : 5) : (game.mode === 'practice' ? 4 : 12);
    player.invincibleFrames = 78;
    createParticles(player.x, player.y, '#ff8dbc', 8);
    showMessage(message, 1, 1200);

    missionSystem.trigger('hit');

    if (game.mode !== 'practice') {
        game.lives--;
        updateHUD();
        if (game.lives <= 0) {
            gameOver();
        }
    }
}

function startGame() {
    baseSettings = buildSettings();
    currentSettings = { ...baseSettings };
    gameState = 'PLAYING';
    game.score = 0;
    frameCount = 0;
    gameTime = 0;
    game.flightFrames = 0;
    game.lives = game.mode === 'practice' ? 99 : currentSettings.lives;
    player.y = 300;
    player.velocity = 0;
    player.invincibleFrames = 70;
    playerTrail = [];
    obstacles = [];
    stars = [];
    particles = [];
    screenShake = 0;
    game.newHighScoreThisRun = false;
    game.lastRainbowStarScore = 0;
    game.passedObstacles = 0;
    
    stagesConfig.init();
    missionSystem.chooseMission(game.mode);
    
    ui.message.classList.add('hidden');
    parallaxBg.init();
    spawnStarterStars();
    showScreen(null);
    setGameUiVisible(true);
    applyStageDifficulty();
    
    if (game.mode === 'practice') {
        showMessage("练习模式不会失败，放心试试。", 2, 3000);
    } else {
        showMessage('轻轻点击，让小蝴蝶飞起来 🦋', 1, 2500);
    }
    
    updateHUD();
}

function pauseGame() {
    if (gameState !== 'PLAYING') return;
    gameState = 'PAUSED';
    
    const modesCN = {
        practice: '练习课',
        easy: '花园课',
        normal: '冒险课',
        hard: '彩虹挑战'
    };
    
    document.getElementById('pause-mode').textContent = modesCN[game.mode] || game.mode;
    document.getElementById('pause-score').textContent = game.score;
    document.getElementById('pause-task').textContent = `${missionSystem.getDisplayText()} ${missionSystem.getDisplayProgress()}`;
    
    const pauseRestTip = document.getElementById('pause-rest-tip');
    if (game.restReminderEnabled && (Date.now() - game.sessionStartTime > 300000) && !game.hasShownRestReminder) {
        pauseRestTip.textContent = "休息一下眼睛吧，等会儿再飞也很棒 🌼";
        game.hasShownRestReminder = true;
    } else {
        pauseRestTip.textContent = "";
    }
    
    setGameUiVisible(true);
    ui.taskDisplay.classList.add('hidden');
    screens.pause.classList.add('active');
}

function resumeGame() {
    if (gameState !== 'PAUSED') return;
    gameState = 'PLAYING';
    screens.pause.classList.remove('active');
    setGameUiVisible(true);
}

function restartGame() {
    showScreen(null);
    startGame();
}

function backToHome() {
    gameState = 'START';
    obstacles = [];
    stars = [];
    particles = [];
    ui.message.classList.add('hidden');
    setGameUiVisible(false);
    showScreen(screens.start);
    updateHUD();
}

function gameOver() {
    gameState = 'GAMEOVER';
    
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
    
    // Choose Over Title based on Gentle Mode
    const overTitleEl = document.getElementById('over-title');
    if (game.gentleModeEnabled) {
        const gentleTitles = [
            "小蝴蝶休息啦 🦋",
            "今天飞得很棒！🌼",
            "很棒的飞行体验 ✨",
            "好开心的冒险之旅 💖"
        ];
        overTitleEl.textContent = gentleTitles[Math.floor(Math.random() * gentleTitles.length)];
    } else {
        const standardTitles = [
            "游戏结束",
            "今天飞得很棒！"
        ];
        overTitleEl.textContent = standardTitles[Math.floor(Math.random() * standardTitles.length)];
    }
    
    // Check and show Rest Reminder (dedicated paragraph on Game Over)
    const overRestTip = document.getElementById('over-rest-tip');
    if (game.restReminderEnabled && (Date.now() - game.sessionStartTime > 300000) && !game.hasShownRestReminder) {
        overRestTip.textContent = "休息一下眼睛吧，等会儿再飞也很棒 🌼";
        overRestTip.style.display = 'block';
        game.hasShownRestReminder = true;
    } else {
        overRestTip.textContent = "";
        overRestTip.style.display = 'none';
    }
    
    // Choose GameOver encourage tip
    if (game.newHighScoreThisRun) {
        showParentMessage();
        ui.overEncouragement.textContent = "新纪录！Iris 太棒啦 🌟";
    } else {
        // Read custom parentMessage from settings in localStorage
        let parentMsg = '';
        try {
            const parsed = JSON.parse(localStorage.getItem(storage.settings) || '{}');
            if (parsed.parentMessage && parsed.parentMessage.trim() !== '') {
                parentMsg = parsed.parentMessage.trim();
            }
        } catch (e) {}
        
        if (parentMsg !== '') {
            ui.overEncouragement.textContent = parentMsg;
        } else {
            if (game.gentleModeEnabled) {
                const gentleTips = [
                    "你和小蝴蝶一样温柔又勇敢 🌸",
                    "快乐飞行，明天再来玩吧 🌼",
                    "每一次轻轻飞起，都是很棒的尝试 💖",
                    "今天飞得很开心，小蝴蝶也很感谢你 ✨"
                ];
                ui.overEncouragement.textContent = gentleTips[Math.floor(Math.random() * gentleTips.length)];
            } else {
                const standardTips = [
                    "今天飞得很棒！",
                    "每一次练习都会更厉害！",
                    "小蝴蝶休息一下也很棒！",
                    "和爸爸妈妈分享你的新纪录吧！"
                ];
                ui.overEncouragement.textContent = standardTips[Math.floor(Math.random() * standardTips.length)];
            }
        }
    }
    
    ui.finalMode.textContent = modesCN[game.mode] || game.mode;
    ui.finalStage.textContent = stageCN[game.currentStage] || game.currentStage;
    ui.finalScore.textContent = game.score;
    ui.finalVines.textContent = game.passedObstacles;
    ui.recordScore.textContent = game.highScore;
    ui.finalTask.textContent = game.missionCompleted ? "是" : "否";
    
    ui.message.classList.add('hidden');
    setGameUiVisible(false);
    showScreen(screens.gameOver);
    updateHUD();
}

function saveHighScoreIfNeeded() {
    if (game.score <= game.highScore) return false;
    game.highScore = game.score;
    localStorage.setItem(storage.highScore, String(game.highScore));
    game.newHighScoreThisRun = true;
    checkMilestones();
    return true;
}

function checkMilestones() {
    if (game.score === 10 && !game.hasReached10) {
        game.hasReached10 = true;
        localStorage.setItem('iris_butterfly_reached10', 'true');
        showParentMessage();
    } else if (game.score === 15 && !game.hasReached15) {
        game.hasReached15 = true;
        localStorage.setItem('iris_butterfly_reached15', 'true');
        showParentMessage();
    }
    updateUnlocks();
}

function showMessage(text, priority = 1, ms = null) {
    if (currentMessagePriority > priority && ui.message.classList.contains('active')) {
        return; 
    }
    
    const duration = ms || (priority >= 2 ? 2000 : 1200);
    clearTimeout(currentMessageTimer);
    currentMessagePriority = priority;
    
    ui.message.textContent = text;
    ui.message.classList.remove('hidden');
    ui.message.classList.add('active');
    
    if (text.includes("任务完成") || text.includes("飞行课完成")) {
        ui.message.classList.add('ribbon-style');
    } else {
        ui.message.classList.remove('ribbon-style');
    }
    
    currentMessageTimer = setTimeout(() => {
        ui.message.classList.add('hidden');
        ui.message.classList.remove('active', 'ribbon-style');
        currentMessagePriority = 0;
    }, duration);
}

function showParentMessage() {
    ui.eggText.textContent = assistSettings.parentMessage || defaultAssistSettings.parentMessage;
    ui.easterEgg.classList.remove('hidden');
    setTimeout(() => ui.easterEgg.classList.add('hidden'), 3600);
}

function updateHUD() {
    ui.score.textContent = game.score;
    ui.lives.textContent = game.mode === 'practice' || game.lives >= 99 ? '∞ 💖' : '❤️'.repeat(Math.max(0, game.lives));
    
    ui.taskText.textContent = missionSystem.getDisplayText();
    ui.taskProgress.textContent = missionSystem.getDisplayProgress();
}

function updateUnlocks() {
    // Unlocks are triggered by high score. 
    // Just sync rendering
    renderTreasure();
}

function renderTreasure() {
    const stickersContainer = document.getElementById('stickers-container');
    const cosmeticsContainer = document.getElementById('cosmetics-container');
    
    stickersContainer.innerHTML = '';
    cosmeticsContainer.innerHTML = '';
    
    UNLOCKS.forEach(item => {
        // High score or stored arrays
        const isOwned = game.highScore >= item.requirementHighScore || ownedStickers.includes(item.id);
        
        if (item.type === 'sticker') {
            const stickerDiv = document.createElement('div');
            stickerDiv.className = `sticker ${isOwned ? '' : 'locked'}`;
            stickerDiv.id = `sticker-${item.id}`;
            
            const emojiSpan = document.createElement('span');
            emojiSpan.className = 'sticker-emoji';
            emojiSpan.textContent = item.icon;
            stickerDiv.appendChild(emojiSpan);
            
            const statusSpan = document.createElement('span');
            statusSpan.className = 'sticker-status';
            statusSpan.textContent = isOwned ? '已解锁' : '未解锁';
            stickerDiv.appendChild(statusSpan);
            
            stickersContainer.appendChild(stickerDiv);
        } else if (item.type === 'cosmetic') {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cosmetic-item';
            itemDiv.dataset.id = item.id;
            itemDiv.dataset.cost = item.requirementHighScore;
            
            const previewDiv = document.createElement('div');
            previewDiv.className = `cosmetic-preview ${item.class || ''}`;
            if (item.style) {
                previewDiv.setAttribute('style', item.style);
            }
            previewDiv.textContent = item.icon;
            itemDiv.appendChild(previewDiv);
            
            const nameP = document.createElement('p');
            nameP.textContent = item.label;
            itemDiv.appendChild(nameP);
            
            const button = document.createElement('button');
            const isCosmeticOwned = ownedCosmetics.includes(item.id);
            if (isCosmeticOwned) {
                if (activeCosmetic === item.id) {
                    button.textContent = '使用中';
                    button.className = 'btn-buy owned active-cosmetic';
                } else {
                    button.textContent = '使用';
                    button.className = 'btn-buy owned';
                }
            } else {
                button.textContent = `最高分 ${item.requirementHighScore} 解锁`;
                button.className = 'btn-buy locked-cosmetic';
            }
            
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                selectCosmetic(item.id, item.requirementHighScore);
            });
            itemDiv.appendChild(button);
            
            cosmeticsContainer.appendChild(itemDiv);
        }
    });
}

function ensureAudio() {
    if (!game.soundEnabled) return;
    if (audioCtx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();
}

function playSound(type, x = null) {
    if (!game.soundEnabled) return;
    ensureAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const panner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
    const pan = x === null ? 0 : Math.max(-1, Math.min(1, (x / canvas.width) * 2 - 1));

    oscillator.connect(panner || gainNode);
    if (panner) {
        panner.pan.value = pan;
        panner.connect(gainNode);
    }
    gainNode.connect(audioCtx.destination);

    if (type === 'collect') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(988, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1318, audioCtx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    } else if (type === 'hit') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(180, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(90, audioCtx.currentTime + 0.25);
        
        // Gentle hit sound in V3 gentle mode
        const hitGain = game.gentleModeEnabled ? 0.012 : 0.02;
        gainNode.gain.setValueAtTime(hitGain, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    } else if (type === 'click') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(659, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.004, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    }

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
}

function syncSettingsUI() {
    ui.speed.value = assistSettings.speed;
    ui.tolerance.value = assistSettings.tolerance;
    ui.livesSetting.value = assistSettings.lives;
    ui.parentMessage.value = assistSettings.parentMessage;
    
    // V3 checkboxes sync
    ui.restReminderCheckbox.checked = game.restReminderEnabled;
    ui.gentleModeCheckbox.checked = game.gentleModeEnabled;
}

function saveSettingsFromUI() {
    assistSettings = {
        speed: ui.speed.value,
        tolerance: ui.tolerance.value,
        lives: ui.livesSetting.value,
        parentMessage: ui.parentMessage.value.trim() || defaultAssistSettings.parentMessage
    };
    saveAssistSettings();
    
    // Save checkboxes
    game.restReminderEnabled = ui.restReminderCheckbox.checked;
    game.gentleModeEnabled = ui.gentleModeCheckbox.checked;
    localStorage.setItem(storage.restReminder, String(game.restReminderEnabled));
    localStorage.setItem(storage.gentleMode, String(game.gentleModeEnabled));
}

// Config stage background interpolation controller
const stagesConfig = {
    init() {
        game.currentStage = 'warmup';
        const s = STAGES.warmup;
        currentHStart = s.hs; currentSStart = s.ss; currentLStart = s.ls;
        currentHEnd = s.he; currentSEnd = s.se; currentLEnd = s.le;
    }
};

function setupListeners() {
    const on = (id, event, handler, options) => {
        const element = document.getElementById(id);
        if (element) element.addEventListener(event, handler, options);
    };

    on('start-btn', 'click', startGame);

    document.querySelectorAll('.btn-diff').forEach(button => {
        button.addEventListener('click', () => {
            game.mode = button.dataset.diff;
            document.querySelectorAll('.btn-diff').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            baseSettings = buildSettings();
            currentSettings = { ...baseSettings };
            playSound('click');
        });
    });

    on('how-to-play-btn', 'click', () => showScreen(screens.howTo));
    on('close-how-to-btn', 'click', () => showScreen(screens.start));
    on('pause-btn', 'click', pauseGame);
    on('resume-btn', 'click', resumeGame);
    on('restart-btn', 'click', restartGame);
    on('restart-from-pause-btn', 'click', restartGame);
    on('back-to-home-btn', 'click', backToHome);
    on('back-to-home-from-pause-btn', 'click', backToHome);

    on('sound-btn', 'click', () => {
        game.soundEnabled = !game.soundEnabled;
        localStorage.setItem('iris_butterfly_soundEnabled', String(game.soundEnabled));
        ui.sound.textContent = game.soundEnabled ? '🔊' : '🔇';
        ui.sound.setAttribute('aria-pressed', String(game.soundEnabled));
        ui.sound.setAttribute('aria-checked', String(game.soundEnabled));
        if (game.soundEnabled) {
            ensureAudio();
            playSound('click');
        }
    });

    on('parent-settings-btn', 'click', () => {
        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
            showMessage('请先返回首页再调整设置', 1, 1500);
            return;
        }
        syncSettingsUI();
        showScreen(screens.settings);
    });

    on('close-settings-btn', 'click', () => {
        saveSettingsFromUI();
        baseSettings = buildSettings();
        currentSettings = { ...baseSettings };
        showScreen(screens.start);
        showMessage('设置已保存，下一局生效。', 1, 1500);
    });

    on('reset-high-score-btn', 'click', () => {
        const resetBtn = document.getElementById('reset-high-score-btn');
        if (!game.resetConfirmState) {
            game.resetConfirmState = true;
            resetBtn.textContent = "再点一次确认重置";
            resetBtn.classList.add('confirm-state');
            
            game.resetConfirmTimer = setTimeout(() => {
                game.resetConfirmState = false;
                resetBtn.textContent = "重置最高分";
                resetBtn.classList.remove('confirm-state');
            }, 3000);
        } else {
            clearTimeout(game.resetConfirmTimer);
            game.resetConfirmState = false;
            resetBtn.textContent = "重置最高分";
            resetBtn.classList.remove('confirm-state');
            
            game.highScore = 0;
            localStorage.setItem(storage.highScore, '0');
            localStorage.removeItem('iris_butterfly_reached10');
            localStorage.removeItem('iris_butterfly_reached15');
            game.hasReached10 = false;
            game.hasReached15 = false;
            updateHUD();
            showMessage('最高分已重置。', 1, 1200);
        }
    });

    on('treasure-btn', 'click', () => {
        renderTreasure();
        switchTab('stickers');
        showScreen(screens.treasure);
    });
    on('close-treasure-btn', 'click', () => showScreen(screens.start));

    on('tab-stickers', 'click', () => switchTab('stickers'));
    on('tab-cosmetics', 'click', () => switchTab('cosmetics'));

    const gameContainer = document.getElementById('game-container');
    gameContainer.addEventListener('mousedown', event => {
        if (event.target.closest('button, select, input')) return;
        event.preventDefault();
        jump();
    });
    gameContainer.addEventListener('touchstart', event => {
        if (event.target.closest('button, select, input')) return;
        event.preventDefault();
        jump();
    }, { passive: false });
    window.addEventListener('touchstart', event => {
        if (gameState === 'PLAYING') {
            if (event.target.closest('button, select, input')) return;
            event.preventDefault();
        }
    }, { passive: false });
    window.addEventListener('touchmove', event => {
        if (gameState === 'PLAYING') {
            if (event.target.closest('button, select, input')) return;
            event.preventDefault();
        }
    }, { passive: false });
    window.addEventListener('dblclick', event => {
        event.preventDefault();
    });
    window.addEventListener('keydown', event => {
        if (event.code === 'Space') {
            event.preventDefault();
            jump();
        }
        if (event.code === 'KeyP') {
            if (gameState === 'PLAYING') {
                pauseGame();
            } else if (gameState === 'PAUSED') {
                resumeGame();
            }
        }
        if (event.code === 'Escape') {
            event.preventDefault();
            if (gameState === 'PAUSED') {
                resumeGame();
            } else if (screens.howTo.classList.contains('active')) {
                showScreen(screens.start);
            } else if (screens.settings.classList.contains('active')) {
                saveSettingsFromUI();
                baseSettings = buildSettings();
                currentSettings = { ...baseSettings };
                showScreen(screens.start);
                showMessage('设置已保存，下一局生效。', 1, 1500);
            } else if (screens.treasure.classList.contains('active')) {
                showScreen(screens.start);
            } else if (screens.gameOver.classList.contains('active')) {
                backToHome();
            }
        }
    });
}

function switchTab(tab) {
    document.getElementById('tab-stickers').classList.toggle('active', tab === 'stickers');
    document.getElementById('tab-cosmetics').classList.toggle('active', tab === 'cosmetics');
    document.getElementById('stickers-content').classList.toggle('active', tab === 'stickers');
    document.getElementById('cosmetics-content').classList.toggle('active', tab === 'cosmetics');
}

function selectCosmetic(id, cost) {
    if (!ownedCosmetics.includes(id)) {
        if (game.highScore < cost) {
            showMessage('星星还不够，继续收集吧！', 1, 1400);
            return;
        }
        ownedCosmetics.push(id);
        localStorage.setItem(storage.cosmetics, JSON.stringify(ownedCosmetics));
        playSound('click');
    }
    activeCosmetic = id;
    localStorage.setItem(storage.activeCosmetic, activeCosmetic);
    renderTreasure();
}

function init() {
    syncSettingsUI();
    parallaxBg.init();
    setupListeners();
    renderTreasure();
    updateHUD();
    setGameUiVisible(false);
    ui.sound.textContent = game.soundEnabled ? '🔊' : '🔇';
    ui.sound.setAttribute('aria-pressed', String(game.soundEnabled));
    ui.sound.setAttribute('role', 'switch');
    ui.sound.setAttribute('aria-checked', String(game.soundEnabled));
    ui.sound.setAttribute('aria-label', '声音开关');
    showScreen(screens.start);
    requestAnimationFrame(loop);
}

init();
