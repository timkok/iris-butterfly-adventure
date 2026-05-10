const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// Game State
let gameState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;
let lives = 3;
let frameCount = 0;

// UI Elements
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const finalScoreElement = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Player (Butterfly)
const player = {
    x: 80,
    y: 300,
    radius: 15,
    gravity: 0.25,
    lift: -5,
    velocity: 0,
    rotation: 0
};

// Arrays for game objects
let obstacles = [];
let stars = [];
let particles = [];

// Background stars
let bgStars = [];
for (let i = 0; i < 50; i++) {
    bgStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1
    });
}

// Event Listeners
window.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        jump();
    }
});

canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    jump();
});

canvas.addEventListener('mousedown', function(e) {
    jump();
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function jump() {
    if (gameState === 'PLAYING') {
        player.velocity = player.lift;
        // Create flap particles
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(player.x, player.y, '#ff7eb3'));
        }
    }
}

function startGame() {
    gameState = 'PLAYING';
    score = 0;
    lives = 3;
    obstacles = [];
    stars = [];
    particles = [];
    player.y = 300;
    player.velocity = 0;
    
    startScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    updateHUD();
}

function gameOver() {
    gameState = 'GAMEOVER';
    finalScoreElement.textContent = score;
    gameOverScreen.classList.add('active');
}

function updateHUD() {
    scoreElement.textContent = score;
    livesElement.textContent = '❤️'.repeat(lives);
}

// Particle Class
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 3 - 1.5 - 2; // Move left
        this.speedY = Math.random() * 3 - 1.5;
        this.color = color;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Obstacle (Vines)
class Obstacle {
    constructor() {
        this.gap = 150;
        this.width = 60;
        this.minHeight = 50;
        this.maxHeight = canvas.height - this.gap - this.minHeight;
        this.topHeight = Math.random() * (this.maxHeight - this.minHeight) + this.minHeight;
        this.bottomY = this.topHeight + this.gap;
        this.bottomHeight = canvas.height - this.bottomY;
        this.x = canvas.width;
        this.speed = 2;
        this.passed = false;
        
        // Random vine color
        this.color = `hsl(${120 + Math.random() * 40}, 60%, 40%)`;
    }
    update() {
        this.x -= this.speed;
    }
    draw() {
        ctx.fillStyle = this.color;
        
        // Top vine
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        // Bottom vine
        ctx.fillRect(this.x, this.bottomY, this.width, this.bottomHeight);
        
        // Draw leaves/flowers on vines
        this.drawDetails(this.x, 0, this.width, this.topHeight, true);
        this.drawDetails(this.x, this.bottomY, this.width, this.bottomHeight, false);
    }
    drawDetails(x, y, w, h, isTop) {
        ctx.fillStyle = '#ff4081'; // Flower color
        if (isTop) {
            // Draw a flower at the bottom edge of top vine
            ctx.beginPath();
            ctx.arc(x + w/2, y + h, 8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw a flower at the top edge of bottom vine
            ctx.beginPath();
            ctx.arc(x + w/2, y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Star Class
class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 12;
        this.speed = 2;
        this.angle = 0;
    }
    update() {
        this.x -= this.speed;
        this.angle += 0.05;
        this.y += Math.sin(this.angle) * 0.5; // Slight floating effect
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw actual star (emoji works well or polygon)
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', 0, 0);
        
        ctx.restore();
    }
}

// Main Game Loop
function loop() {
    // Clear canvas with a very transparent fill for motion blur effect
    ctx.fillStyle = 'rgba(26, 16, 47, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    bgStars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        if (gameState === 'PLAYING') {
            star.x -= star.speed;
            if (star.x < 0) star.x = canvas.width;
        }
    });

    if (gameState === 'PLAYING') {
        frameCount++;
        
        // Player Physics
        player.velocity += player.gravity;
        player.y += player.velocity;
        
        // Rotation based on velocity
        player.rotation = Math.min(Math.PI/4, Math.max(-Math.PI/4, player.velocity * 0.05));

        // Screen boundaries
        if (player.y > canvas.height - player.radius) {
            player.y = canvas.height - player.radius;
            player.velocity = 0;
            loseLife();
        }
        if (player.y < player.radius) {
            player.y = player.radius;
            player.velocity = 0;
        }

        // Generate obstacles
        if (frameCount % 120 === 0) {
            obstacles.push(new Obstacle());
        }

        // Generate stars
        if (frameCount % 150 === 0) {
            const obstacle = obstacles[obstacles.length - 1];
            if (obstacle) {
                // Place star in the gap
                const starY = obstacle.topHeight + obstacle.gap / 2;
                stars.push(new Star(canvas.width + 100, starY));
            }
        }

        // Update & Draw Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update();
            obstacles[i].draw();

            // Collision detection (vines)
            if (
                player.x + player.radius > obstacles[i].x &&
                player.x - player.radius < obstacles[i].x + obstacles[i].width
            ) {
                if (
                    player.y - player.radius < obstacles[i].topHeight ||
                    player.y + player.radius > obstacles[i].bottomY
                ) {
                    obstacles.splice(i, 1);
                    loseLife();
                    continue;
                }
            }

            // Score point when passing
            if (!obstacles[i].passed && obstacles[i].x + obstacles[i].width < player.x) {
                obstacles[i].passed = true;
                // We don't increase score here, score is increased by collecting stars!
                // This makes it more about collection than just survival.
            }

            // Remove off-screen obstacles
            if (obstacles[i].x + obstacles[i].width < 0) {
                obstacles.splice(i, 1);
            }
        }

        // Update & Draw Stars
        for (let i = stars.length - 1; i >= 0; i--) {
            stars[i].update();
            stars[i].draw();

            // Collision with player
            const dist = Math.hypot(player.x - stars[i].x, player.y - stars[i].y);
            if (dist < player.radius + stars[i].size) {
                stars.splice(i, 1);
                score += 10;
                updateHUD();
                // Spawn score particles
                for (let p = 0; p < 10; p++) {
                    particles.push(new Particle(player.x, player.y, '#ffd700'));
                }
                continue;
            }

            // Remove off-screen stars
            if (stars[i].x < -50) {
                stars.splice(i, 1);
            }
        }

        // Update & Draw Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    // Draw Player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);
    
    // Draw trail
    if (gameState === 'PLAYING' && frameCount % 3 === 0) {
        particles.push(new Particle(player.x, player.y, 'rgba(255, 117, 140, 0.5)'));
    }

    // Draw butterfly emoji
    ctx.font = '30px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🦋', 0, 0);
    
    // Debug hitbox
    // ctx.beginPath();
    // ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    // ctx.strokeStyle = 'white';
    // ctx.stroke();
    
    ctx.restore();

    requestAnimationFrame(loop);
}

function loseLife() {
    lives--;
    updateHUD();
    
    // Screen shake or flash effect could be added here
    
    // Spawn damage particles
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(player.x, player.y, '#ff0000'));
    }

    if (lives <= 0) {
        gameOver();
    }
}

// Start Loop
requestAnimationFrame(loop);
updateHUD();
