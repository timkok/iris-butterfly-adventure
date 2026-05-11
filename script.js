const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

// --- Game State & Settings ---
let gameState = 'START'; 
let difficulty = 'practice'; 
let score = 0;
let highScore = localStorage.getItem('iris_butterfly_highScore') || 0;
let maxFlightTime = localStorage.getItem('iris_butterfly_maxFlightTime') || 0;
let lives = 3;
let frameCount = 0;
let gameTime = 0; 
let stage = 1;
let screenShake = 0; 

const diffSettings = {
    practice: { speed: 1.0, gap: 200, spawnRate: 180, tolerance: 10, lives: 99 },
    easy: { speed: 1.2, gap: 180, spawnRate: 150, tolerance: 8, lives: 5 },
    normal: { speed: 1.8, gap: 150, spawnRate: 120, tolerance: 3, lives: 3 },
    hard: { speed: 2.5, gap: 130, spawnRate: 100, tolerance: -2, lives: 3 }
};

let currentSettings = diffSettings[difficulty];

let assistSettings = {
    speedMult: 1,
    toleranceAdd: 0,
    livesOverride: null,
    parentMessage: localStorage.getItem('iris_butterfly_parentMsg') || "Iris 真棒，爱你！"
};

let soundEnabled = true;

// --- Progression ---
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
const easterEggPanel = document.getElementById('easter-egg-msg');
const eggTextElement = document.getElementById('egg-text');

// Inputs
const settingSpeedSelect = document.getElementById('setting-speed');
const settingToleranceSelect = document.getElementById('setting-tolerance');
const settingLivesSelect = document.getElementById('setting-lives');
const settingMessageInput = document.getElementById('setting-message');

// --- Audio System with Spatial Logic ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type, x = null) {
    if (!soundEnabled) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const panner = audioCtx.createPanner();

    // Spatial positioning (Left/Right)
    if (x !== null) {
        const pan = (x / canvas.width) * 2 - 1; // -1 to 1
        panner.setPosition(pan, 0, 1 - Math.abs(pan));
        oscillator.connect(panner);
        panner.connect(gainNode);
    } else {
        oscillator.connect(gainNode);
    }
    
    gainNode.connect(audioCtx.destination);

    if (type === 'collect') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    } else if (type === 'hit') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    } else if (type === 'click') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    }
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
}

// --- Player ---
const player = {
    x: 80, y: 300, radius: 10,
    gravity: 0.15, lift: -4, velocity: 0,
    scale: 1, rotation: 0, wingAngle: 0,
    shield: true, shieldFlashing: false,
};

// --- Game Objects ---
let obstacles = [];
let stars = [];
let particles = [];
let bgElements = [];
let worldTime = 0; // 0 to 1 cycle for day/night

function initBackground() {
    bgElements = [];
    for (let i = 0; i < 3; i++) bgElements.push({ x: i * 200, y: 400, w: 210, h: 200, speed: 0.1, type: 'hill', color: '#2a1b40' });
    for (let i = 0; i < 5; i++) bgElements.push({ x: i * 100, y: 450, w: 40, h: 150, speed: 0.3, type: 'tree', color: '#1a2a40' });
}

// --- Immersive Environments ---
function getSkyColor() {
    const cycle = (gameTime % 60) / 60; // 60s day/night cycle
    if (cycle < 0.25) return '#a5f3fc'; // Dawn
    if (cycle < 0.5) return '#38bdf8';  // Day
    if (cycle < 0.75) return '#1e293b'; // Dusk
    return '#0f172a'; // Night
}

// --- Game Loop ---
function loop() {
    ctx.save();
    if (screenShake > 0) {
        ctx.translate((Math.random()-0.5)*screenShake, (Math.random()-0.5)*screenShake);
        screenShake *= 0.9;
    }

    const skyColor = getSkyColor();
    const isNight = (gameTime % 60) / 60 > 0.6;

    ctx.fillStyle = skyColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Background Elements
    bgElements.forEach(el => {
        ctx.fillStyle = isNight ? '#0a0a20' : el.color;
        if (el.type === 'hill') {
            ctx.beginPath(); ctx.arc(el.x + el.w/2, el.y + el.h, el.w/2, Math.PI, 0); ctx.fill();
        } else {
            ctx.fillRect(el.x, el.y, el.w, el.h);
        }
        if (gameState === 'PLAYING') el.x -= el.speed;
        if (el.x + el.w < 0) el.x = canvas.width;
    });

    if (gameState === 'PLAYING') {
        frameCount++;
        if (frameCount % 60 === 0) gameTime++;

        player.scale += (1 - player.scale) * 0.1;
        player.velocity += player.gravity;
        player.y += player.velocity;

        if (player.y > canvas.height - player.radius) { player.y = canvas.height - player.radius; handleCollision(); }
        if (player.y < player.radius) { player.y = player.radius; player.velocity = 0; }

        // Spawn Stars with Spatial Sound preparation
        if (frameCount % 120 === 0) {
            stars.push(new Star(canvas.width + 20, Math.random() * (canvas.height - 100) + 50));
        }

        // Update Objects
        updateObjects(isNight);
    }

    drawPlayer(isNight);
    ctx.restore();
    requestAnimationFrame(loop);
}

function updateObjects(isNight) {
    // Stars
    for (let i = stars.length - 1; i >= 0; i--) {
        stars[i].update();
        stars[i].draw(isNight);
        if (Math.hypot(player.x - stars[i].x, player.y - stars[i].y) < 25) {
            playSound('collect', stars[i].x);
            score++; player.scale = 1.5; screenShake = 5;
            checkMilestones();
            stars.splice(i, 1);
        } else if (stars[i].x < -20) stars.splice(i, 1);
    }
    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(); particles[i].draw();
        if (particles[i].alpha <= 0) particles.splice(i, 1);
    }
}

function drawPlayer(isNight) {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(player.scale, player.scale);
    
    if (isNight) {
        ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    }

    ctx.rotate(player.velocity * 0.05);
    ctx.font = '24px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🦋', 0, 0);
    ctx.restore();
}

function checkMilestones() {
    scoreElement.textContent = score;
    if (score === 15) {
        eggTextElement.textContent = assistSettings.parentMessage;
        easterEggPanel.classList.remove('hidden');
        setTimeout(() => easterEggPanel.classList.add('hidden'), 4000);
    }
}

// --- Classes ---
class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.alpha = 1; this.size = Math.random()*3+1;
        this.vx = Math.random()*2-1; this.vy = Math.random()*2-1;
    }
    update() { this.x += this.vx; this.y += this.vy; this.alpha -= 0.02; }
    draw() { ctx.globalAlpha = this.alpha; ctx.fillStyle = this.color; ctx.fillRect(this.x, this.y, this.size, this.size); }
}

class Star {
    constructor(x, y) { this.x = x; this.y = y; this.angle = 0; }
    update() { this.x -= 2; this.angle += 0.1; this.y += Math.sin(this.angle)*0.5; }
    draw(isNight) {
        ctx.font = '20px serif';
        ctx.fillText(isNight ? '💡' : '⭐', this.x, this.y);
    }
}

// --- Input Handling ---
function jump() {
    if (gameState === 'PLAYING') {
        player.velocity = player.lift;
        for(let i=0; i<3; i++) particles.push(new Particle(player.x, player.y, '#fff'));
    }
}

function handleCollision() {
    playSound('hit'); screenShake = 15;
    if (difficulty !== 'practice') lives--;
    if (lives <= 0) gameOver();
}

function startGame() {
    gameState = 'PLAYING'; score = 0; gameTime = 0;
    player.y = 300; player.velocity = 0;
    initBackground();
    document.getElementById('start-screen').classList.remove('active');
}

function gameOver() {
    gameState = 'GAMEOVER';
    finalScoreElement.textContent = score;
    document.getElementById('game-over-screen').classList.add('active');
}

// --- Boilerplate Listeners ---
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('close-settings-btn').addEventListener('click', () => {
    assistSettings.parentMessage = settingMessageInput.value;
    localStorage.setItem('iris_butterfly_parentMsg', assistSettings.parentMessage);
    document.getElementById('parent-settings-screen').classList.remove('active');
    document.getElementById('start-screen').classList.add('active');
});
document.getElementById('parent-settings-btn').addEventListener('click', () => {
    settingMessageInput.value = assistSettings.parentMessage;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('parent-settings-screen').classList.add('active');
});
window.addEventListener('mousedown', jump);
window.addEventListener('keydown', e => { if(e.code==='Space') jump(); });

requestAnimationFrame(loop);
