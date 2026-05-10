const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// --- Game State & Settings ---
let gameState = 'START'; // START, TUTORIAL, PLAYING, PAUSED, GAMEOVER
let difficulty = 'easy'; // easy, normal, hard
let score = 0;
let highScore = localStorage.getItem('iris_butterfly_highScore') || 0;
let lives = 3;
let frameCount = 0;
let gameTime = 0; // In seconds
let stage = 1; // 1: Dream Forest, 2: Starlight Garden, 3: Rainbow Valley

// Difficulty Parameters
const diffSettings = {
    easy: { speed: 1.5, gap: 180, spawnRate: 150, tolerance: 5 },
    normal: { speed: 2, gap: 150, spawnRate: 120, tolerance: 0 },
    hard: { speed: 2.5, gap: 130, spawnRate: 100, tolerance: -5 }
};

let currentSettings = diffSettings[difficulty];

// --- UI Elements ---
const startScreen = document.getElementById('start-screen');
const howToPlayScreen = document.getElementById('how-to-play-screen');
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
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const restartFromPauseBtn = document.getElementById('restart-from-pause-btn');
const restartBtn = document.getElementById('restart-btn');
const diffButtons = document.querySelectorAll('.btn-diff');

// --- Audio System (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
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
    radius: 12, // Smaller hitbox
    gravity: 0.2, // Lower gravity for easier control
    lift: -4.5, // Lower lift
    velocity: 0,
    rotation: 0,
    wingAngle: 0,
    shield: true, // 1 Shield per game
    shieldFlashing: false,
    featherMode: false,
    featherTimer: 0
};

// --- Game Objects ---
let obstacles = [];
let stars = [];
let particles = [];
let bgElements = []; // For parallax

// Parallax Background Setup
function initBackground() {
    bgElements = [];
    // Far layer (mountains/hills)
    for (let i = 0; i < 3; i++) {
        bgElements.push({ x: i * 200, y: 400, w: 210, h: 200, speed: 0.2, type: 'hill', color: '#3a2b5e' });
    }
    // Mid layer (trees)
    for (let i = 0; i < 5; i++) {
        bgElements.push({ x: i * 100, y: 450, w: 50, h: 150, speed: 0.5, type: 'tree', color: '#2a4b5e' });
    }
}

// --- Task System ---
const tasks = [
    { id: 1, text: "收集 5 颗星星", target: 5, current: 0, type: 'collect', completed: false },
    { id: 2, text: "飞行 20 秒", target: 20, current: 0, type: 'time', completed: false },
    { id: 3, text: "躲过 5 个障碍", target: 5, current: 0, type: 'dodge', completed: false }
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
    if (currentTask) {
        taskProgressElement.textContent = `(${currentTask.current}/${currentTask.target})`;
    }
}

function checkTaskProgress(type, amount = 1) {
    if (currentTask && currentTask.type === type) {
        currentTask.current += amount;
        updateTaskUI();
        if (currentTask.current >= currentTask.target) {
            completeTask();
        }
    }
}

function completeTask() {
    currentTask.completed = true;
    score += 50; // Bonus points
    showMessage("太棒了，Iris！完成任务！");
    playSound('collect');
    setTimeout(assignRandomTask, 3000); // Assign next task after 3s
}

function showMessage(text) {
    messageDisplay.textContent = text;
    messageDisplay.classList.remove('hidden');
    setTimeout(() => {
        messageDisplay.classList.add('hidden');
    }, 2000);
}

// --- Event Listeners ---
window.addEventListener('keydown', (e) => { if (e.code === 'Space') jump(); });
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
canvas.addEventListener('mousedown', jump);

startBtn.addEventListener('click', () => { playSound('click'); startGame(); });
howToPlayBtn.addEventListener('click', () => { playSound('click'); showPanel(howToPlayScreen); });
closeHowToBtn.addEventListener('click', () => { playSound('click'); showPanel(startScreen); });
pauseBtn.addEventListener('click', () => { playSound('click'); pauseGame(); });
resumeBtn.addEventListener('click', () => { playSound('click'); resumeGame(); });
restartFromPauseBtn.addEventListener('click', () => { playSound('click'); startGame(); });
restartBtn.addEventListener('click', () => { playSound('click'); startGame(); });

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

// --- Game Logic ---

function jump() {
    if (gameState === 'PLAYING') {
        player.velocity = player.lift;
        for (let i = 0; i < 3; i++) particles.push(new Particle(player.x, player.y, '#ff7eb3'));
    }
}

function startGame() {
    gameState = 'PLAYING';
    score = 0;
    lives = 3;
    stage = 1;
    frameCount = 0;
    gameTime = 0;
    obstacles = [];
    stars = [];
    particles = [];
    player.y = 300;
    player.velocity = 0;
    player.shield = true;
    player.shieldFlashing = false;
    player.featherMode = false;
    
    // Reset tasks
    tasks.forEach(t => t.completed = false);
    assignRandomTask();
    
    initBackground();
    showPanel(document.getElementById('dummy-panel')); // Hide all panels
    updateHUD();
}

function pauseGame() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        showPanel(pauseScreen);
    }
}

function resumeGame() {
    if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        showPanel(document.getElementById('dummy-panel'));
    }
}

function gameOver() {
    gameState = 'GAMEOVER';
    finalScoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('iris_butterfly_highScore', highScore);
    }
    recordScoreElement.textContent = highScore;
    showPanel(gameOverScreen);
}

function updateHUD() {
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
    livesElement.textContent = '❤️'.repeat(lives);
}

// --- Classes ---

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y;
        this.size = Math.random() * 4 + 1;
        this.speedX = Math.random() * 2 - 1 - 1; // Move left
        this.speedY = Math.random() * 2 - 1;
        this.color = color; this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }
    update() { this.x += this.speedX; this.y += this.speedY; this.alpha -= this.decay; }
    draw() {
        ctx.save(); ctx.globalAlpha = this.alpha; ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

class Obstacle {
    constructor() {
        this.gap = currentSettings.gap;
        this.width = 50;
        this.x = canvas.width;
        // 5s safety period: gaps are always centered and big
        if (gameTime < 5) {
            this.topHeight = (canvas.height - this.gap) / 2;
        } else {
            this.topHeight = Math.random() * (canvas.height - this.gap - 100) + 50;
        }
        this.bottomY = this.topHeight + this.gap;
        this.speed = currentSettings.speed;
        this.passed = false;
        
        // Stage colors
        if (stage === 1) this.color = '#2ecc71';
        else if (stage === 2) this.color = '#3498db';
        else this.color = '#9b59b6';
    }
    update() { this.x -= this.speed; }
    draw() {
        ctx.fillStyle = this.color;
        // Top vine
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        // Bottom vine
        ctx.fillRect(this.x, this.bottomY, this.width, canvas.height - this.bottomY);
        
        // Flowers on vines
        ctx.fillStyle = '#ff4081';
        ctx.beginPath(); ctx.arc(this.x + this.width/2, this.topHeight, 8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(this.x + this.width/2, this.bottomY, 8, 0, Math.PI * 2); ctx.fill();
    }
}

class Star {
    constructor(x, y, type = 'normal') {
        this.x = x; this.y = y;
        this.type = type; // normal, gold, heart
        this.size = type === 'normal' ? 10 : 12;
        this.speed = currentSettings.speed;
        this.angle = 0;
    }
    update() {
        this.x -= this.speed;
        this.angle += 0.05;
        this.y += Math.sin(this.angle) * 0.5;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if (this.type === 'normal') {
            ctx.font = '16px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('⭐', 0, 0);
        } else if (this.type === 'gold') {
            ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('🌟', 0, 0);
        } else if (this.type === 'heart') {
            ctx.font = '16px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('❤️', 0, 0);
        }
        
        ctx.restore();
    }
}

// --- Main Loop ---

function loop() {
    // Stage Background Colors
    let bgColor = '#1a102f';
    if (stage === 2) bgColor = '#101a2f';
    else if (stage === 3) bgColor = '#2a102f';
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Parallax Background
    bgElements.forEach(el => {
        ctx.fillStyle = el.color;
        if (el.type === 'hill') {
            ctx.beginPath();
            ctx.arc(el.x + el.w/2, el.y + el.h, el.w/2, Math.PI, 0);
            ctx.fill();
        } else if (el.type === 'tree') {
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
            
            // Progressive difficulty & Stage change
            if (gameTime === 30) { stage = 2; showMessage("进入星光花园！"); }
            if (gameTime === 60) { stage = 3; showMessage("进入彩虹山谷！"); }
            
            // Slowly increase speed
            if (gameTime % 10 === 0) currentSettings.speed += 0.1;
        }
        
        // Player Physics
        player.velocity += player.gravity;
        player.y += player.velocity;
        player.wingAngle = Math.sin(frameCount * 0.2) * 30; // Flapping effect

        // Screen boundaries
        if (player.y > canvas.height - player.radius) {
            player.y = canvas.height - player.radius;
            handleCollision();
        }
        if (player.y < player.radius) {
            player.y = player.radius;
            player.velocity = 0;
        }

        // Generate obstacles (Safe period: less obstacles)
        let rate = currentSettings.spawnRate;
        if (gameTime < 5) rate *= 1.5;
        if (frameCount % Math.floor(rate) === 0) {
            obstacles.push(new Obstacle());
        }

        // Generate stars
        if (frameCount % 100 === 0) {
            let type = 'normal';
            if (Math.random() < 0.2) type = 'gold';
            if (Math.random() < 0.05) type = 'heart';
            
            stars.push(new Star(canvas.width + 20, Math.random() * (canvas.height - 100) + 50, type));
        }

        // Update & Draw Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update();
            obstacles[i].draw();

            // Collision detection with tolerance
            const tol = currentSettings.tolerance;
            if (
                player.x + player.radius - tol > obstacles[i].x &&
                player.x - player.radius + tol < obstacles[i].x + obstacles[i].width
            ) {
                if (
                    player.y - player.radius + tol < obstacles[i].topHeight ||
                    player.y + player.radius - tol > obstacles[i].bottomY
                ) {
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

        // Update & Draw Stars
        for (let i = stars.length - 1; i >= 0; i--) {
            stars[i].update();
            stars[i].draw();

            const dist = Math.hypot(player.x - stars[i].x, player.y - stars[i].y);
            if (dist < player.radius + stars[i].size) {
                playSound('collect');
                if (stars[i].type === 'normal') { score += 10; checkTaskProgress('collect', 1); }
                else if (stars[i].type === 'gold') { score += 30; checkTaskProgress('collect', 3); }
                else if (stars[i].type === 'heart') { if (lives < 3) lives++; }
                
                updateHUD();
                // Particles
                for (let p = 0; p < 5; p++) particles.push(new Particle(player.x, player.y, '#ffd700'));
                stars.splice(i, 1);
                continue;
            }

            if (stars[i].x < -50) stars.splice(i, 1);
        }

        // Update & Draw Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].alpha <= 0) particles.splice(i, 1);
        }
    }

    // Draw Player (Butterfly)
    ctx.save();
    ctx.translate(player.x, player.y);
    
    // Shield glow
    if (player.shield && !player.shieldFlashing) {
        ctx.beginPath();
        ctx.arc(0, 0, player.radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(112, 161, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    } else if (player.shieldFlashing && frameCount % 10 < 5) {
        // Flash effect
        ctx.beginPath();
        ctx.arc(0, 0, player.radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 117, 140, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Butterfly Emoji (Rotated slightly based on velocity)
    ctx.rotate(player.velocity * 0.05);
    ctx.font = '24px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🦋', 0, 0);
    
    ctx.restore();

    requestAnimationFrame(loop);
}

function handleCollision() {
    if (player.shield) {
        player.shield = false;
        player.shieldFlashing = true;
        playSound('hit');
        showMessage("护盾保护了你！");
        setTimeout(() => { player.shieldFlashing = false; }, 2000);
    } else {
        lives--;
        updateHUD();
        playSound('hit');
        for (let i = 0; i < 15; i++) particles.push(new Particle(player.x, player.y, '#ff0000'));
        
        if (lives <= 0) {
            gameOver();
        } else {
            // Give temporary invincibility or just continue
            player.shield = true; // Give another shield or just let them flash?
            // Let's give them a 2s flashing shield again to be forgiving!
            player.shieldFlashing = true;
            setTimeout(() => { player.shieldFlashing = false; player.shield = false; }, 2000);
        }
    }
}

// Start Loop
requestAnimationFrame(loop);
highScoreElement.textContent = highScore;
updateHUD();
assignRandomTask(); // Initial task
showPanel(startScreen); // Ensure start screen is visible at start
