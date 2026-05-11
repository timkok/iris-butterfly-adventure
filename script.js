const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// --- Game State & Settings ---
let gameState = 'START'; // START, TUTORIAL, PLAYING, PAUSED, GAMEOVER
let difficulty = 'practice'; // practice, easy, normal, hard
let score = 0;
let highScore = localStorage.getItem('iris_butterfly_highScore') || 0;
let maxFlightTime = localStorage.getItem('iris_butterfly_maxFlightTime') || 0;
let lives = 3;
let frameCount = 0;
let gameTime = 0; // In seconds
let stage = 1;
let screenShake = 0; // Screen shake intensity

// Difficulty Parameters
const diffSettings = {
    practice: { speed: 1.0, gap: 200, spawnRate: 180, tolerance: 10, lives: 99 },
    easy: { speed: 1.2, gap: 180, spawnRate: 150, tolerance: 8, lives: 5 },
    normal: { speed: 1.8, gap: 150, spawnRate: 120, tolerance: 3, lives: 3 },
    hard: { speed: 2.5, gap: 130, spawnRate: 100, tolerance: -2, lives: 3 }
};

let currentSettings = diffSettings[difficulty];

// Parent Settings (Assist Mode)
let assistSettings = {
    speedMult: 1,
    toleranceAdd: 0,
    livesOverride: null
};

// Sound Settings
let soundEnabled = true;

// --- Cosmetics & Stickers (Progression) ---
let ownedCosmetics = JSON.parse(localStorage.getItem('iris_butterfly_cosmetics')) || ['default'];
let activeCosmetic = localStorage.getItem('iris_butterfly_activeCosmetic') || 'default';
let ownedStickers = JSON.parse(localStorage.getItem('iris_butterfly_stickers')) || [];

// --- UI Elements ---
const startScreen = document.getElementById('start-screen');
const howToPlayScreen = document.getElementById('how-to-play-screen');
const parentSettingsScreen = document.getElementById('parent-settings-screen');
const treasureScreen = document.getElementById('treasure-screen');
const pauseScreen = document.getElementById('pause-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const livesElement = document.getElementById('lives');
const finalScoreElement = document.getElementById('final-score');
const recordScoreElement = document.getElementById('record-score');
const taskDisplay = document.getElementById('task-display');
const taskTextElement = document.getElementById('task-text');
const taskProgressElement = document.getElementById('task-progress');
const messageDisplay = document.getElementById('message-display');

// Buttons
const startBtn = document.getElementById('start-btn');
const howToPlayBtn = document.getElementById('how-to-play-btn');
const closeHowToBtn = document.getElementById('close-how-to-btn');
const parentSettingsBtn = document.getElementById('parent-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const resetHighScoreBtn = document.getElementById('reset-high-score-btn');
const treasureBtn = document.getElementById('treasure-btn');
const closeTreasureBtn = document.getElementById('close-treasure-btn');
const pauseBtn = document.getElementById('pause-btn');
const soundBtn = document.getElementById('sound-btn');
const resumeBtn = document.getElementById('resume-btn');
const restartFromPauseBtn = document.getElementById('restart-from-pause-btn');
const backToHomeFromPauseBtn = document.getElementById('back-to-home-from-pause-btn');
const restartBtn = document.getElementById('restart-btn');
const backToHomeBtn = document.getElementById('back-to-home-btn');
const diffButtons = document.querySelectorAll('.btn-diff');

// Tabs
const tabStickers = document.getElementById('tab-stickers');
const tabCosmetics = document.getElementById('tab-cosmetics');
const stickersContent = document.getElementById('stickers-content');
const cosmeticsContent = document.getElementById('cosmetics-content');

// Selects
const settingSpeedSelect = document.getElementById('setting-speed');
const settingToleranceSelect = document.getElementById('setting-tolerance');
const settingLivesSelect = document.getElementById('setting-lives');

// --- Audio System ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!soundEnabled) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'collect') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'hit') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'click') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
    }
}

// --- Player (Butterfly) ---
const player = {
    x: 80,
    y: 300,
    radius: 10,
    gravity: 0.15,
    lift: -4,
    velocity: 0,
    rotation: 0,
    wingAngle: 0,
    scale: 1, // Visual juice scale
    shield: true,
    shieldFlashing: false,
    featherMode: false,
    featherTimer: 0,
    rainbowMode: false,
    rainbowTimer: 0
};

// --- Game Objects ---
let obstacles = [];
let stars = [];
let particles = [];
let bgElements = [];

function initBackground() {
    bgElements = [];
    for (let i = 0; i < 3; i++) bgElements.push({ x: i * 200, y: 400, w: 210, h: 200, speed: 0.1, type: 'hill', color: '#2a1b40' });
    for (let i = 0; i < 5; i++) bgElements.push({ x: i * 100, y: 450, w: 40, h: 150, speed: 0.3, type: 'tree', color: '#1a2a40' });
    for (let i = 0; i < 10; i++) bgElements.push({ x: i * 50, y: 550, w: 10, h: 50, speed: 0.6, type: 'flower', color: '#ff758c' });
}

// --- Task System ---
const tasks = [
    { id: 1, text: "收集 10 颗星星", target: 10, current: 0, type: 'collect', completed: false },
    { id: 2, text: "连续飞行 30 秒", target: 30, current: 0, type: 'time', completed: false },
    { id: 3, text: "躲过 5 个藤蔓", target: 5, current: 0, type: 'dodge', completed: false }
];
let currentTask = null;

function assignRandomTask() {
    const uncompleted = tasks.filter(t => !t.completed);
    if (uncompleted.length > 0) {
        currentTask = uncompleted[Math.floor(Math.random() * uncompleted.length)];
        currentTask.current = 0;
        taskTextElement.textContent = currentTask.text;
        updateTaskUI();
        taskDisplay.classList.remove('hidden');
    } else {
        currentTask = null;
        taskDisplay.classList.add('hidden');
    }
}

function updateTaskUI() {
    if (currentTask) taskProgressElement.textContent = `(${currentTask.current}/${currentTask.target})`;
}

function checkTaskProgress(type, amount = 1) {
    if (currentTask && currentTask.type === type) {
        currentTask.current += amount;
        updateTaskUI();
        if (currentTask.current >= currentTask.target) completeTask();
    }
}

function completeTask() {
    currentTask.completed = true;
    score += 10;
    showMessage("太棒了，Iris！完成了一个任务！");
    playSound('collect');
    triggerJuice(5); // Juice up on task completion
    unlockSticker('star'); // Award star sticker for completing a task
    setTimeout(assignRandomTask, 3000);
}

function showMessage(text) {
    messageDisplay.textContent = text;
    messageDisplay.classList.remove('hidden');
    setTimeout(() => { messageDisplay.classList.add('hidden'); }, 2000);
}

// --- Progression Logic (Stickers & Cosmetics) ---
function unlockSticker(id) {
    if (!ownedStickers.includes(id)) {
        ownedStickers.push(id);
        localStorage.setItem('iris_butterfly_stickers', JSON.stringify(ownedStickers));
        const el = document.getElementById(`sticker-${id}`);
        if (el) el.classList.remove('locked');
        showMessage(`获得了新贴纸：${id}！`);
    }
}

function updateTreasureUI() {
    ownedStickers.forEach(id => {
        const el = document.getElementById(`sticker-${id}`);
        if (el) el.classList.remove('locked');
    });
    
    document.querySelectorAll('.cosmetic-item').forEach(item => {
        const id = item.dataset.id;
        const btn = item.querySelector('.btn-buy');
        if (ownedCosmetics.includes(id)) {
            btn.textContent = '已拥有';
            btn.classList.add('owned');
        }
    });
}

// --- Stage Goals ---
let stageMilestones = {
    5: { message: "遇到了一只可爱的小兔子！🐰", sticker: 'bunny' },
    10: { message: "开启了彩虹之门！🌈", sticker: 'rainbow' },
    15: { message: "森林里的小动物都在为你鼓掌！", sticker: 'flower' },
    20: { message: "完成了这次冒险！太棒了，Iris！", sticker: 'butterfly', end: true }
};

function checkMilestones() {
    if (stageMilestones[score]) {
        const m = stageMilestones[score];
        showMessage(m.message);
        if (m.sticker) unlockSticker(m.sticker);
        if (m.end && difficulty !== 'practice') {
            setTimeout(gameOver, 2000);
        }
    }
}

// --- Event Listeners ---
window.addEventListener('keydown', (e) => { if (e.code === 'Space') jump(); });
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
canvas.addEventListener('mousedown', jump);

startBtn.addEventListener('click', () => { playSound('click'); startGame(); });
howToPlayBtn.addEventListener('click', () => { playSound('click'); showPanel(howToPlayScreen); });
closeHowToBtn.addEventListener('click', () => { playSound('click'); showPanel(startScreen); });
parentSettingsBtn.addEventListener('click', () => { playSound('click'); showPanel(parentSettingsScreen); });
closeSettingsBtn.addEventListener('click', () => { playSound('click'); applyParentSettings(); showPanel(startScreen); });
treasureBtn.addEventListener('click', () => { playSound('click'); updateTreasureUI(); showPanel(treasureScreen); });
closeTreasureBtn.addEventListener('click', () => { playSound('click'); showPanel(startScreen); });

tabStickers.addEventListener('click', () => {
    tabStickers.classList.add('active'); tabCosmetics.classList.remove('active');
    stickersContent.classList.add('active'); cosmeticsContent.classList.remove('active');
});
tabCosmetics.addEventListener('click', () => {
    tabCosmetics.classList.add('active'); tabStickers.classList.remove('active');
    cosmeticsContent.classList.add('active'); stickersContent.classList.remove('active');
});

document.querySelectorAll('.cosmetic-item .btn-buy').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const item = e.target.closest('.cosmetic-item');
        const id = item.dataset.id;
        const cost = parseInt(item.dataset.cost);
        
        if (ownedCosmetics.includes(id)) {
            activeCosmetic = id;
            localStorage.setItem('iris_butterfly_activeCosmetic', id);
            showMessage("已应用该外观！");
            return;
        }
        
        if (highScore >= cost) { // Use high score as currency for simplicity
            ownedCosmetics.push(id);
            localStorage.setItem('iris_butterfly_cosmetics', JSON.stringify(ownedCosmetics));
            e.target.textContent = '已拥有';
            e.target.classList.add('owned');
            playSound('collect');
            showMessage("解锁成功！");
        } else {
            showMessage("星星不够哦，继续加油！");
        }
    });
});

resetHighScoreBtn.addEventListener('click', () => {
    playSound('click');
    localStorage.setItem('iris_butterfly_highScore', 0);
    highScore = 0;
    highScoreElement.textContent = 0;
    alert("最高分已重置！");
});

pauseBtn.addEventListener('click', () => { playSound('click'); pauseGame(); });
soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    playSound('click');
});
resumeBtn.addEventListener('click', () => { playSound('click'); resumeGame(); });
restartFromPauseBtn.addEventListener('click', () => { playSound('click'); startGame(); });
backToHomeFromPauseBtn.addEventListener('click', () => { playSound('click'); goHome(); });
restartBtn.addEventListener('click', () => { playSound('click'); startGame(); });
backToHomeBtn.addEventListener('click', () => { playSound('click'); goHome(); });

diffButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        playSound('click');
        diffButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        difficulty = e.target.dataset.diff;
        currentSettings = diffSettings[difficulty];
    });
});

function showPanel(panel) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    panel.classList.add('active');
}

function applyParentSettings() {
    const speedVal = settingSpeedSelect.value;
    if (speedVal === 'slow') assistSettings.speedMult = 0.7;
    else if (speedVal === 'normal') assistSettings.speedMult = 1;
    else if (speedVal === 'fast') assistSettings.speedMult = 1.3;

    const tolVal = settingToleranceSelect.value;
    if (tolVal === 'loose') assistSettings.toleranceAdd = 5;
    else if (tolVal === 'standard') assistSettings.toleranceAdd = 0;

    const livesVal = settingLivesSelect.value;
    if (livesVal === '99') assistSettings.livesOverride = 99;
    else assistSettings.livesOverride = parseInt(livesVal);
}

// --- Game Logic ---

function triggerJuice(intensity = 5) {
    screenShake = intensity;
    player.scale = 1.5; // Quick pop
}

function jump() {
    if (gameState === 'PLAYING') {
        player.velocity = player.lift;
        const color = activeCosmetic === 'pink-wings' ? '#ff758c' : '#ff7eb3';
        for (let i = 0; i < 3; i++) particles.push(new Particle(player.x, player.y, color, 'magical'));
    }
}

function startGame() {
    gameState = 'PLAYING';
    score = 0;
    stage = 1;
    frameCount = 0;
    gameTime = 0;
    obstacles = [];
    stars = [];
    particles = [];
    player.y = 300;
    player.velocity = 0;
    player.scale = 1;
    player.shield = true;
    player.shieldFlashing = false;
    player.featherMode = false;
    player.rainbowMode = false;
    
    currentSettings = {...diffSettings[difficulty]};
    currentSettings.speed *= assistSettings.speedMult;
    currentSettings.tolerance += assistSettings.toleranceAdd;
    
    lives = assistSettings.livesOverride !== null ? assistSettings.livesOverride : currentSettings.lives;
    
    tasks.forEach(t => t.completed = false);
    assignRandomTask();
    
    initBackground();
    showPanel(document.getElementById('dummy-panel'));
    updateHUD();
    
    if (difficulty === 'practice') {
        showMessage("练习模式：没有失败，尽情飞翔吧！");
    }
}

function pauseGame() { if (gameState === 'PLAYING') { gameState = 'PAUSED'; showPanel(pauseScreen); } }
function resumeGame() { if (gameState === 'PAUSED') { gameState = 'PLAYING'; showPanel(document.getElementById('dummy-panel')); } }
function goHome() { gameState = 'START'; showPanel(startScreen); }

function gameOver() {
    gameState = 'GAMEOVER';
    finalScoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('iris_butterfly_highScore', highScore);
    }
    if (gameTime > maxFlightTime) {
        maxFlightTime = gameTime;
        localStorage.setItem('iris_butterfly_maxFlightTime', maxFlightTime);
    }
    recordScoreElement.textContent = highScore;
    showPanel(gameOverScreen);
}

function updateHUD() {
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
    livesElement.textContent = difficulty === 'practice' || lives === 99 ? '♾️' : '❤️'.repeat(lives);
}

// --- Classes ---

class Particle {
    constructor(x, y, color, type = 'normal') {
        this.x = x; this.y = y;
        this.type = type;
        this.size = type === 'magical' ? Math.random() * 5 + 2 : Math.random() * 4 + 1;
        this.speedX = Math.random() * 2 - 1 - (type === 'trail' ? 2 : 1);
        this.speedY = Math.random() * 2 - 1;
        this.color = color; this.alpha = 1;
        this.decay = type === 'trail' ? 0.03 : Math.random() * 0.02 + 0.01;
    }
    update() { 
        this.x += this.speedX; 
        this.y += this.speedY; 
        this.alpha -= this.decay; 
        if (this.type === 'magical') this.size *= 0.95;
    }
    draw() {
        ctx.save(); 
        ctx.globalAlpha = this.alpha; 
        ctx.fillStyle = this.color;
        if (this.type === 'magical') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

class Obstacle {
    constructor() {
        this.gap = currentSettings.gap;
        this.width = 50;
        this.x = canvas.width;
        if (gameTime < 8) this.topHeight = (canvas.height - this.gap) / 2;
        else this.topHeight = Math.random() * (canvas.height - this.gap - 100) + 50;
        this.bottomY = this.topHeight + this.gap;
        this.speed = currentSettings.speed;
        this.passed = false;
        this.color = '#ff758c';
    }
    update() { this.x -= this.speed; }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        ctx.fillRect(this.x, this.bottomY, this.width, canvas.height - this.bottomY);
    }
}

class Star {
    constructor(x, y, type = 'normal') {
        this.x = x; this.y = y;
        this.type = type;
        this.size = 12;
        this.speed = currentSettings.speed;
        this.angle = 0;
    }
    update() {
        this.x -= this.speed;
        this.angle += 0.05;
        this.y += Math.sin(this.angle) * 0.5;
    }
    draw() {
        ctx.save(); ctx.translate(this.x, this.y);
        ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (this.type === 'normal') ctx.fillText('⭐', 0, 0);
        else if (this.type === 'gold') ctx.fillText('🌟', 0, 0);
        else if (this.type === 'heart') ctx.fillText('❤️', 0, 0);
        ctx.restore();
    }
}

// --- Main Loop ---

function loop() {
    // Apply Screen Shake
    ctx.save();
    if (screenShake > 0) {
        const dx = (Math.random() - 0.5) * screenShake;
        const dy = (Math.random() - 0.5) * screenShake;
        ctx.translate(dx, dy);
        screenShake *= 0.9;
        if (screenShake < 0.1) screenShake = 0;
    }

    ctx.fillStyle = '#120c1f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Background
    bgElements.forEach(el => {
        ctx.fillStyle = el.color;
        if (el.type === 'hill') {
            ctx.beginPath(); ctx.arc(el.x + el.w/2, el.y + el.h, el.w/2, Math.PI, 0); ctx.fill();
        } else if (el.type === 'tree' || el.type === 'flower') {
            ctx.fillRect(el.x, el.y, el.w, el.h);
        }
        if (gameState === 'PLAYING') {
            el.x -= el.speed;
            if (el.x + el.w < 0) el.x = canvas.width;
        }
    });

    if (gameState === 'PLAYING') {
        frameCount++;
        if (frameCount % 60 === 0) {
            gameTime++;
            checkTaskProgress('time', 1);
        }
        
        // Visual Juice: Scale Decay
        if (player.scale > 1) player.scale -= 0.05;
        if (player.scale < 1) player.scale = 1;

        if (player.featherMode) {
            player.gravity = 0.05;
            player.featherTimer--;
            if (player.featherTimer <= 0) { player.featherMode = false; player.gravity = 0.15; }
        }

        player.velocity += player.gravity;
        player.y += player.velocity;
        player.wingAngle = Math.sin(frameCount * 0.2) * 30;

        if (player.y > canvas.height - player.radius) { player.y = canvas.height - player.radius; handleCollision(); }
        if (player.y < player.radius) { player.y = player.radius; player.velocity = 0; }

        let rate = currentSettings.spawnRate;
        if (gameTime < 8) rate *= 1.5;
        if (frameCount % Math.floor(rate) === 0) obstacles.push(new Obstacle());

        if (frameCount % 100 === 0) {
            let type = 'normal';
            const r = Math.random();
            if (r < 0.1) type = 'gold';
            else if (r < 0.15) type = 'heart';
            stars.push(new Star(canvas.width + 20, Math.random() * (canvas.height - 100) + 50, type));
        }

        // Update Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update();
            obstacles[i].draw();

            const tol = currentSettings.tolerance;
            if (
                player.x + player.radius - tol > obstacles[i].x &&
                player.x - player.radius + tol < obstacles[i].x + obstacles[i].width
            ) {
                if (player.y - player.radius + tol < obstacles[i].topHeight || player.y + player.radius - tol > obstacles[i].bottomY) {
                    obstacles.splice(i, 1);
                    handleCollision();
                    continue;
                }
            }

            if (!obstacles[i].passed && obstacles[i].x + obstacles[i].width < player.x) {
                obstacles[i].passed = true;
                checkTaskProgress('dodge', 1);
            }

            if (obstacles[i].x + obstacles[i].width < 0) obstacles.splice(i, 1);
        }

        // Update Stars
        for (let i = stars.length - 1; i >= 0; i--) {
            stars[i].update();
            stars[i].draw();

            const dist = Math.hypot(player.x - stars[i].x, player.y - stars[i].y);
            if (dist < (player.radius + stars[i].size) * 1.5) {
                playSound('collect');
                triggerJuice(4); // Feedback for collection
                if (stars[i].type === 'normal') { score += 1; checkTaskProgress('collect', 1); }
                else if (stars[i].type === 'gold') { score += 3; checkTaskProgress('collect', 3); }
                else if (stars[i].type === 'heart') { if (lives < 5) lives++; checkTaskProgress('collect', 1); }
                
                updateHUD();
                checkMilestones();

                for (let p = 0; p < 8; p++) particles.push(new Particle(player.x, player.y, '#ffd700', 'magical'));
                stars.splice(i, 1);
                continue;
            }

            if (stars[i].x < -50) stars.splice(i, 1);
        }

        // --- NEW: Magical Trail Effect ---
        if (frameCount % 4 === 0) {
            let trailColor = '#ffffff';
            if (activeCosmetic === 'pink-wings') trailColor = '#ff758c';
            else if (activeCosmetic === 'rainbow-wings') trailColor = `hsl(${frameCount % 360}, 100%, 70%)`;
            else trailColor = 'rgba(255, 255, 255, 0.5)';
            
            particles.push(new Particle(player.x - 5, player.y, trailColor, 'trail'));
        }

        // Cosmetics: Star Trail
        if (activeCosmetic === 'star-trail' && frameCount % 5 === 0) {
            particles.push(new Particle(player.x - 10, player.y, '#ffd700', 'magical'));
        }

        // Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].alpha <= 0) particles.splice(i, 1);
        }
    }

    // Draw Player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(player.scale, player.scale); // Apply visual juice scale
    
    if (player.shield && !player.shieldFlashing) {
        ctx.beginPath(); ctx.arc(0, 0, player.radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(112, 161, 255, 0.8)'; ctx.lineWidth = 2; ctx.stroke();
    } else if (player.shieldFlashing && frameCount % 10 < 5) {
        ctx.beginPath(); ctx.arc(0, 0, player.radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 117, 140, 0.8)'; ctx.lineWidth = 2; ctx.stroke();
    }

    ctx.rotate(player.velocity * 0.05);
    ctx.font = '24px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    
    // Apply Cosmetic: Wings Color
    if (activeCosmetic === 'pink-wings') {
        ctx.fillStyle = '#ff758c';
        ctx.fillText('🦋', 0, 0); 
    } else if (activeCosmetic === 'rainbow-wings') {
        ctx.fillStyle = `hsl(${frameCount % 360}, 100%, 50%)`;
        ctx.fillText('🦋', 0, 0);
    } else {
        ctx.fillText('🦋', 0, 0);
    }
    
    ctx.restore(); // Restore Player Transform
    ctx.restore(); // Restore Screen Shake Transform

    requestAnimationFrame(loop);
}

function handleCollision() {
    if (difficulty === 'practice') {
        playSound('hit');
        triggerJuice(10); // Big shake even in practice
        if (score > 0) score--;
        updateHUD();
        showMessage("没关系，继续加油！");
        // Temporarily slow down
        currentSettings.speed = 0.5;
        setTimeout(() => { currentSettings.speed = diffSettings.practice.speed; }, 1000);
        return;
    }

    if (player.shield) {
        player.shield = false;
        player.shieldFlashing = true;
        playSound('hit');
        triggerJuice(8);
        showMessage("魔法护盾保护了 Iris！");
        setTimeout(() => { player.shieldFlashing = false; }, 2000);
    } else if (lives !== 99) {
        lives--;
        updateHUD();
        playSound('hit');
        triggerJuice(15); // Maximum shake on life loss
        for (let i = 0; i < 20; i++) particles.push(new Particle(player.x, player.y, '#ff4757', 'magical'));
        
        if (lives <= 0) {
            gameOver();
        } else {
            player.shield = true;
            player.shieldFlashing = true;
            setTimeout(() => { player.shieldFlashing = false; player.shield = false; }, 2000);
        }
    }
}

requestAnimationFrame(loop);
updateHUD();
assignRandomTask();
showPanel(startScreen);
updateTreasureUI();
