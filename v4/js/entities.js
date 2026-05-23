window.IrisGame = window.IrisGame || {};

window.IrisGame.player = {
    x: 82,
    y: 300,
    radius: 12,
    gravity: 0.18,
    lift: -4.8,
    velocity: 0,
    scale: 1,
    invincibleFrames: 0,
    wingPhase: 0,
    
    reset() {
        this.y = 300;
        this.velocity = 0;
        this.scale = 1;
        this.invincibleFrames = 70;
        this.wingPhase = 0;
    },
    
    jump() {
        const state = window.IrisGame.state;
        const config = window.IrisGame.config;
        if (state.gameState === 'START') return;
        if (state.gameState === 'PLAYING') {
            this.velocity = this.lift;
            this.scale = 1.15;
            window.IrisGame.entities.createParticles(this.x - 6, this.y + 8, '#ffffff', 3);
            window.IrisGame.audio.playSound('click');
            
            // Tap ripple effect (suppressed under reduced motion policy)
            const disableRipple = state.prefersReducedMotion && config.EFFECTS_POLICY.reducedMotionDisableAmbient;
            if (config.EFFECTS_POLICY.tapRippleEnabled && !disableRipple) {
                if (state.tapRipples.length < config.EFFECTS_POLICY.maxTapRipples) {
                    state.tapRipples.push(new window.IrisGame.entities.TapRipple(this.x, this.y));
                }
            }
        }
    }
};

window.IrisGame.entities = {
    createParticles(x, y, color, count = 6) {
        const state = window.IrisGame.state;
        const config = window.IrisGame.config;
        if (state.prefersReducedMotion) return;
        
        // Scale particles in Calm Mode using EFFECTS_POLICY multiplier
        const finalCount = state.game.calmModeEnabled ? Math.max(1, Math.round(count * config.EFFECTS_POLICY.calmModeParticleMultiplier)) : count;
        
        for (let i = 0; i < finalCount; i++) {
            if (state.particles.length >= config.EFFECTS_POLICY.maxParticles) {
                state.particles.shift();
            }
            state.particles.push(new this.Particle(x, y, color));
        }
    },
    
    collidesWithObstacle(player, obstacle, tolerance) {
        if (player.invincibleFrames > 0) return false;
        
        const px = player.x;
        const py = player.y;
        const radius = Math.max(4, player.radius - tolerance);
        
        const topBottom = obstacle.gapY - obstacle.gap / 2;
        const bottomTop = obstacle.gapY + obstacle.gap / 2;
        
        const inX = px + radius > obstacle.x + 8 && px - radius < obstacle.x + obstacle.width - 8;
        if (!inX) return false;
        
        return py - radius < topBottom || py + radius > bottomTop;
    },
    
    Star: class {
        constructor(x, y, speed, type = 'normal') {
            this.x = x;
            this.y = y;
            this.speed = speed;
            this.angle = Math.random() * Math.PI * 2;
            this.type = type;
        }
        update() {
            const state = window.IrisGame.state;
            this.x -= this.speed;
            
            // Reduced float speed in prefersReducedMotion
            const animSpeed = state.prefersReducedMotion ? 0.01 : (state.game.calmModeEnabled ? 0.04 : 0.08);
            this.angle += animSpeed;
            this.y += Math.sin(this.angle) * 0.35;
        }
        draw(ctx) {
            const state = window.IrisGame.state;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            
            if (this.type === 'rainbow') {
                if (!state.prefersReducedMotion) {
                    const spinSpeed = state.game.calmModeEnabled ? 3 : 8;
                    ctx.filter = `hue-rotate(${(state.frameCount * spinSpeed) % 360}deg) saturate(2)`;
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
    },
    
    Particle: class {
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
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    },
    
    Leaf: class {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = -(0.3 + Math.random() * 0.5);
            this.vy = 0.2 + Math.random() * 0.4;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.04;
            this.alpha = 0.7 + Math.random() * 0.3;
            this.emoji = Math.random() < 0.5 ? '🍃' : '🌿';
            this.size = 10 + Math.random() * 6;
            this.swayPhase = Math.random() * Math.PI * 2;
        }
        update(calmMode) {
            const speedMult = calmMode ? 0.4 : 1.0;
            this.x += this.vx * speedMult;
            this.y += this.vy * speedMult;
            this.rotation += this.rotationSpeed * speedMult;
            this.swayPhase += 0.02 * speedMult;
            this.x += Math.sin(this.swayPhase) * 0.3 * speedMult;
        }
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.font = `${this.size}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.emoji, 0, 0);
            ctx.restore();
        }
    },
    
    TapRipple: class {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 4;
            this.maxRadius = 22;
            this.alpha = 0.5;
            this.expandSpeed = 1.5;
        }
        update() {
            this.radius += this.expandSpeed;
            this.alpha -= 0.035;
        }
        draw(ctx) {
            if (this.alpha <= 0) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }
};
