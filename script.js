const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

const storage = {
    highScore: 'iris_butterfly_highScore',
    settings: 'iris_butterfly_parentSettings',
    cosmetics: 'iris_butterfly_cosmetics',
    activeCosmetic: 'iris_butterfly_activeCosmetic',
    stickers: 'iris_butterfly_stickers'
};

let gameState = 'START';
let difficulty = 'practice';
let score = 0;
let highScore = Number(localStorage.getItem(storage.highScore) || 0);
let lives = 99;
let frameCount = 0;
let gameTime = 0;
let screenShake = 0;
let soundEnabled = localStorage.getItem('iris_butterfly_soundEnabled') === 'true';
let audioCtx = null;
let currentMessageTimer = null;
let newHighScoreThisRun = false;

let hasReached10 = localStorage.getItem('iris_butterfly_reached10') === 'true';
let hasReached15 = localStorage.getItem('iris_butterfly_reached15') === 'true';

let shownStage6 = false;
let shownStage16 = false;
let shownStage30 = false;

const diffSettings = {
    practice: { speed: 0.9, gap: 260, spawnRate: 185, starRate: 95, tolerance: 18, lives: 99 },
    easy: { speed: 1.32, gap: 225, spawnRate: 160, starRate: 100, tolerance: 12, lives: 5 },
    normal: { speed: 1.95, gap: 180, spawnRate: 126, starRate: 110, tolerance: 5, lives: 3 },
    hard: { speed: 2.55, gap: 145, spawnRate: 98, starRate: 122, tolerance: -1, lives: 3 }
};

const defaultAssistSettings = {
    speed: 'normal',
    tolerance: 'standard',
    lives: 'difficulty',
    parentMessage: 'Iris 真棒，爱你！'
};

let assistSettings = loadAssistSettings();
let baseSettings = buildSettings();
let currentSettings = { ...baseSettings };

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
    highScore: document.getElementById('high-score'),
    lives: document.getElementById('lives'),
    finalScore: document.getElementById('final-score'),
    recordScore: document.getElementById('record-score'),
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
    parentMessage: document.getElementById('setting-message')
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

let obstacles = [];
let stars = [];
let particles = [];
let bgElements = [];
const firstObstacleFrame = 120;

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
    const base = diffSettings[difficulty];
    const speedMult = assistSettings.speed === 'slow' ? 0.78 : assistSettings.speed === 'fast' ? 1.14 : 1;
    const toleranceAdd = assistSettings.tolerance === 'loose' ? 10 : 0;
    const livesOverride = assistSettings.lives === 'difficulty' ? NaN : Number(assistSettings.lives);

    return {
        ...base,
        speed: base.speed * speedMult,
        starSpeed: Math.max(0.8, (base.speed + 0.65) * speedMult),
        gap: base.gap + toleranceAdd,
        tolerance: base.tolerance + toleranceAdd,
        spawnRate: Math.round(base.spawnRate / Math.max(0.82, speedMult)),
        starRate: Math.round(base.starRate / Math.max(0.88, speedMult)),
        lives: difficulty === 'practice' ? 99 : Number.isFinite(livesOverride) ? livesOverride : base.lives
    };
}

function getDifficultyScale() {
    if (score <= 5) return 0;
    if (score >= 30) return 1;
    return (score - 5) / 25;
}

function updateDynamicSettings() {
    const scale = getDifficultyScale();
    let maxSpeedMult = 1.0;
    let maxGapReduce = 0;
    let maxSpawnRateReducePercent = 0.0;
    let minGap = 120;
    let minSpawnRate = 75;

    if (difficulty === 'practice') {
        maxSpeedMult = 1.05;
        maxGapReduce = 10;
        maxSpawnRateReducePercent = 0.05;
        minGap = 240;
        minSpawnRate = 160;
    } else if (difficulty === 'easy') {
        maxSpeedMult = 1.15;
        maxGapReduce = 20;
        maxSpawnRateReducePercent = 0.10;
        minGap = 200;
        minSpawnRate = 130;
    } else if (difficulty === 'normal') {
        maxSpeedMult = 1.25;
        maxGapReduce = 30;
        maxSpawnRateReducePercent = 0.18;
        minGap = 150;
        minSpawnRate = 95;
    } else if (difficulty === 'hard') {
        maxSpeedMult = 1.35;
        maxGapReduce = 40;
        maxSpawnRateReducePercent = 0.25;
        minGap = 120;
        minSpawnRate = 75;
    }

    const currentSpeedMult = 1 + (maxSpeedMult - 1) * scale;
    const currentGapReduce = maxGapReduce * scale;
    const currentSpawnRateReduce = maxSpawnRateReducePercent * scale;

    currentSettings.speed = baseSettings.speed * currentSpeedMult;
    currentSettings.starSpeed = baseSettings.starSpeed * currentSpeedMult;
    currentSettings.gap = Math.max(minGap, baseSettings.gap - currentGapReduce);
    currentSettings.spawnRate = Math.max(minSpawnRate, Math.round(baseSettings.spawnRate * (1 - currentSpawnRateReduce)));
    currentSettings.tolerance = baseSettings.tolerance;
}

function showScreen(screen) {
    Object.values(screens).forEach(panel => panel.classList.remove('active'));
    if (screen) screen.classList.add('active');
}

function setGameUiVisible(visible) {
    ui.hud.classList.toggle('hidden', !visible);
    ui.taskDisplay.classList.toggle('hidden', !visible || gameState !== 'PLAYING');
}

function initBackground() {
    bgElements = [];
    for (let i = 0; i < 4; i++) {
        bgElements.push({ x: i * 150, y: 430 + (i % 2) * 16, w: 190, h: 120, speed: 0.18, type: 'hill', color: '#9bd98e' });
    }
    for (let i = 0; i < 7; i++) {
        bgElements.push({ x: i * 78 + 20, y: 500 + (i % 3) * 10, w: 26, h: 80, speed: 0.42, type: 'flower', color: ['#ff8dbc', '#ffd36e', '#77c987'][i % 3] });
    }
    for (let i = 0; i < 5; i++) {
        bgElements.push({ x: i * 110 + 30, y: 70 + (i % 2) * 42, w: 80, h: 28, speed: 0.12, type: 'cloud', color: '#ffffff' });
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#bfefff');
    gradient.addColorStop(0.58, '#e9fbff');
    gradient.addColorStop(1, '#fff0cd');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    bgElements.forEach(el => {
        if (el.type === 'hill') {
            ctx.fillStyle = el.color;
            ctx.beginPath();
            ctx.arc(el.x + el.w / 2, el.y + el.h, el.w / 2, Math.PI, 0);
            ctx.fill();
        } else if (el.type === 'flower') {
            ctx.strokeStyle = '#66a95c';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(el.x + 12, el.y + 45);
            ctx.lineTo(el.x + 12, el.y + el.h);
            ctx.stroke();
            drawFlower(el.x + 12, el.y + 42, 8, el.color);
        } else {
            drawCloud(el.x, el.y, el.w, el.color);
        }

        if (gameState === 'PLAYING') el.x -= el.speed * currentSettings.speed;
        if (el.x + el.w < -30) el.x = canvas.width + 30;
    });

    ctx.fillStyle = '#8bd080';
    ctx.fillRect(0, canvas.height - 16, canvas.width, 16);
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

    drawObjects();
    drawPlayer();
    ctx.restore();
    requestAnimationFrame(loop);
}

function updateGame() {
    frameCount++;
    gameTime++;
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
    obstacles.push({
        x: canvas.width + 12,
        width,
        gapY,
        gap,
        passed: false,
        flowerOffset: Math.random() * 100,
        isFirst: isFirstObstacle
    });
}

function spawnStar() {
    const y = 78 + Math.random() * (canvas.height - 178);
    stars.push(new Star(canvas.width + 24, y, currentSettings.starSpeed));
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
        }
        if (collidesWithObstacle(obstacle)) {
            handleCollision(difficulty === 'practice' ? '练习模式，继续飞！' : '碰到花藤啦，没关系，再试一次！');
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
            score++;
            player.scale = 1.45;
            screenShake = 3;
            createParticles(star.x, star.y, '#ffd36e', 9);
            stars.splice(i, 1);
            saveHighScoreIfNeeded();
            updateDynamicSettings();
            checkMilestones();
            updateHUD();
        } else if (star.x < -24) {
            stars.splice(i, 1);
        }
    }
}

function saveHighScoreIfNeeded() {
    if (score <= highScore) return false;
    highScore = score;
    localStorage.setItem(storage.highScore, String(highScore));
    newHighScoreThisRun = true;
    return true;
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
    gradient.addColorStop(0, '#5fb86a');
    gradient.addColorStop(0.5, '#89d484');
    gradient.addColorStop(1, '#4f9d5b');

    ctx.fillStyle = gradient;
    roundRect(x + 8, y - (top ? radius : 0), width - 16, height + radius, radius);
    ctx.fill();

    ctx.strokeStyle = 'rgba(48, 126, 60, 0.45)';
    ctx.lineWidth = 3;
    for (let yy = y + 14; yy < y + height; yy += 26) {
        ctx.beginPath();
        ctx.moveTo(x + 15, yy);
        ctx.quadraticCurveTo(x + width / 2, yy + 14, x + width - 15, yy + 4);
        ctx.stroke();
    }

    const capY = top ? y + height - 7 : y + 7;
    ctx.fillStyle = '#77c987';
    roundRect(x, capY - 10, width, 20, 10);
    ctx.fill();

    for (let i = 0; i < Math.max(1, Math.floor(height / 92)); i++) {
        const flowerY = y + 28 + ((i * 84 + offset) % Math.max(40, height - 40));
        drawFlower(x + (i % 2 ? width - 10 : 10), flowerY, 5, i % 2 ? '#ff8dbc' : '#ffd36e');
        drawLeaf(x + width / 2, flowerY + 10, i % 2 ? -1 : 1);
    }
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
    if (activeCosmetic === 'rainbow-wings') {
        ctx.filter = `hue-rotate(${(frameCount * 6) % 360}deg)`;
    } else if (activeCosmetic === 'pink-wings') {
        ctx.filter = 'hue-rotate(300deg) saturate(1.4)';
    }

    ctx.scale(1, 1 + flap);
    ctx.fillText('🦋', 0, 0);
    ctx.restore();
}

function createParticles(x, y, color, count = 6) {
    for (let i = 0; i < count; i++) particles.push(new Particle(x, y, color));
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
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.angle = Math.random() * Math.PI * 2;
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
        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', 0, 0);
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
    screenShake = difficulty === 'practice' ? 4 : 12;
    player.invincibleFrames = 78;
    createParticles(player.x, player.y, '#ff8dbc', 8);
    showMessage(message);

    if (difficulty !== 'practice') {
        lives--;
        updateHUD();
        if (lives <= 0) {
            gameOver();
        }
    }
}

function startGame() {
    baseSettings = buildSettings();
    currentSettings = { ...baseSettings };
    gameState = 'PLAYING';
    score = 0;
    frameCount = 0;
    gameTime = 0;
    lives = difficulty === 'practice' ? 99 : currentSettings.lives;
    player.y = 300;
    player.velocity = 0;
    player.invincibleFrames = 70;
    obstacles = [];
    stars = [];
    particles = [];
    screenShake = 0;
    newHighScoreThisRun = false;
    shownStage6 = false;
    shownStage16 = false;
    shownStage30 = false;
    ui.message.classList.add('hidden');
    initBackground();
    spawnStarterStars();
    showScreen(null);
    setGameUiVisible(true);
    updateDynamicSettings();
    showMessage('穿过花藤空隙，收集星星吧！', 1700);
    updateHUD();
}

function pauseGame() {
    if (gameState !== 'PLAYING') return;
    gameState = 'PAUSED';
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
    if (newHighScoreThisRun) {
        showParentMessage();
    }
    ui.finalScore.textContent = score;
    ui.recordScore.textContent = highScore;
    ui.message.classList.add('hidden');
    setGameUiVisible(false);
    showScreen(screens.gameOver);
    updateHUD();
}

function checkMilestones() {
    if (score === 10 && !hasReached10) {
        hasReached10 = true;
        localStorage.setItem('iris_butterfly_reached10', 'true');
        showParentMessage();
    } else if (score === 15 && !hasReached15) {
        hasReached15 = true;
        localStorage.setItem('iris_butterfly_reached15', 'true');
        showParentMessage();
    }

    if (score >= 6 && score < 16 && !shownStage6) {
        shownStage6 = true;
        showMessage("进入花园挑战区 🌿", 2200);
    } else if (score >= 16 && score < 30 && !shownStage16) {
        shownStage16 = true;
        showMessage("风变快啦，稳稳飞 ✨", 2200);
    } else if (score >= 30 && !shownStage30) {
        shownStage30 = true;
        showMessage("最高挑战开始！你太棒了 🌈", 2200);
    } else if (score === 5 || score === 10 || score === 15) {
        const text = score === 10 ? '任务完成！继续挑战更高分吧 ✨' : `太棒了，已经收集 ${score} 颗星星！`;
        showMessage(text, 2200);
    }
    updateUnlocks();
}

function showMessage(text, ms = 1500) {
    clearTimeout(currentMessageTimer);
    ui.message.textContent = text;
    ui.message.classList.remove('hidden');
    currentMessageTimer = setTimeout(() => ui.message.classList.add('hidden'), ms);
}

function showParentMessage() {
    ui.eggText.textContent = assistSettings.parentMessage || defaultAssistSettings.parentMessage;
    ui.easterEgg.classList.remove('hidden');
    setTimeout(() => ui.easterEgg.classList.add('hidden'), 3600);
}

function updateHUD() {
    ui.score.textContent = score;
    ui.highScore.textContent = highScore;
    ui.lives.textContent = difficulty === 'practice' || lives >= 99 ? '∞ 💖' : '❤️'.repeat(Math.max(0, lives));
    ui.taskProgress.textContent = `(${Math.min(score, 10)}/10)`;
}

function updateUnlocks() {
    if (score >= 5 && !ownedStickers.includes('star')) ownedStickers.push('star');
    if (score >= 10 && !ownedStickers.includes('flower')) ownedStickers.push('flower');
    if (score >= 15 && !ownedStickers.includes('butterfly')) ownedStickers.push('butterfly');
    localStorage.setItem(storage.stickers, JSON.stringify(ownedStickers));
    renderTreasure();
}

function renderTreasure() {
    document.querySelectorAll('.sticker').forEach(sticker => {
        const id = sticker.id.replace('sticker-', '');
        const isOwned = ownedStickers.includes(id);
        sticker.classList.toggle('locked', !isOwned);
        const status = sticker.querySelector('.sticker-status');
        if (status) status.textContent = isOwned ? '已解锁' : '未解锁';
    });

    document.querySelectorAll('.cosmetic-item').forEach(item => {
        const id = item.dataset.id;
        const button = item.querySelector('.btn-buy');
        const cost = Number(item.dataset.cost || 0);
        if (ownedCosmetics.includes(id)) {
            if (activeCosmetic === id) {
                button.textContent = '使用中';
                button.className = 'btn-buy owned active-cosmetic';
            } else {
                button.textContent = '使用';
                button.className = 'btn-buy owned';
            }
        } else {
            button.textContent = `最高分达 ${cost} 解锁`;
            button.className = 'btn-buy locked-cosmetic';
        }
    });
}

function ensureAudio() {
    if (!soundEnabled) return;
    if (audioCtx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();
}

function playSound(type, x = null) {
    if (!soundEnabled) return;
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
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
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
}

function saveSettingsFromUI() {
    assistSettings = {
        speed: ui.speed.value,
        tolerance: ui.tolerance.value,
        lives: ui.livesSetting.value,
        parentMessage: ui.parentMessage.value.trim() || defaultAssistSettings.parentMessage
    };
    saveAssistSettings();
}

function setupListeners() {
    const on = (id, event, handler, options) => {
        const element = document.getElementById(id);
        if (element) element.addEventListener(event, handler, options);
    };

    on('start-btn', 'click', startGame);

    document.querySelectorAll('.btn-diff').forEach(button => {
        button.addEventListener('click', () => {
            difficulty = button.dataset.diff;
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
        soundEnabled = !soundEnabled;
        localStorage.setItem('iris_butterfly_soundEnabled', String(soundEnabled));
        ui.sound.textContent = soundEnabled ? '🔊' : '🔇';
        ui.sound.setAttribute('aria-pressed', String(soundEnabled));
        ui.sound.setAttribute('aria-checked', String(soundEnabled));
        if (soundEnabled) {
            ensureAudio();
            playSound('click');
        }
    });

    on('parent-settings-btn', 'click', () => {
        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
            showMessage('请先返回首页再调整设置', 1500);
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
        showMessage('设置已保存，下一局生效。', 1500);
    });

    on('reset-high-score-btn', 'click', () => {
        highScore = 0;
        localStorage.setItem(storage.highScore, '0');
        localStorage.removeItem('iris_butterfly_reached10');
        localStorage.removeItem('iris_butterfly_reached15');
        hasReached10 = false;
        hasReached15 = false;
        updateHUD();
        showMessage('最高分已重置。', 1200);
    });

    on('treasure-btn', 'click', () => {
        renderTreasure();
        switchTab('stickers');
        showScreen(screens.treasure);
    });
    on('close-treasure-btn', 'click', () => showScreen(screens.start));

    on('tab-stickers', 'click', () => switchTab('stickers'));
    on('tab-cosmetics', 'click', () => switchTab('cosmetics'));

    document.querySelectorAll('.cosmetic-item').forEach(item => {
        item.addEventListener('click', () => selectCosmetic(item));
    });

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
                showMessage('设置已保存，下一局生效。', 1500);
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

function selectCosmetic(item) {
    const id = item.dataset.id;
    const cost = Number(item.dataset.cost || 0);
    if (!ownedCosmetics.includes(id)) {
        if (highScore < cost) {
            showMessage('星星还不够，继续收集吧！', 1400);
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
    initBackground();
    setupListeners();
    renderTreasure();
    updateHUD();
    setGameUiVisible(false);
    ui.sound.textContent = soundEnabled ? '🔊' : '🔇';
    ui.sound.setAttribute('aria-pressed', String(soundEnabled));
    ui.sound.setAttribute('role', 'switch');
    ui.sound.setAttribute('aria-checked', String(soundEnabled));
    ui.sound.setAttribute('aria-label', '声音开关');
    showScreen(screens.start);
    requestAnimationFrame(loop);
}

init();
