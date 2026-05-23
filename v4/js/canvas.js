window.IrisGame = window.IrisGame || {};

window.IrisGame.canvas = {
    canvas: null,
    ctx: null,
    
    currentHStart: 195, currentSStart: 100, currentLStart: 87,
    currentHEnd: 42, currentSEnd: 100, currentLEnd: 90,
    
    parallaxBg: {
        clouds: [],
        hills: [],
        flowers: [],
        
        init(canvasWidth) {
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
        
        update(canvasWidth, speed, prefersReducedMotion, calmMode) {
            const speedMultiplier = prefersReducedMotion ? 0.05 : (calmMode ? 0.5 : 1.0);
            
            this.clouds.forEach(c => {
                c.x -= speed * c.speedFactor * speedMultiplier;
                if (c.x + c.w < -40) c.x = canvasWidth + 40;
            });
            this.hills.forEach(h => {
                h.x -= speed * h.speedFactor * speedMultiplier;
                if (h.x + h.w < -40) h.x = canvasWidth + h.w;
            });
            this.flowers.forEach(f => {
                f.x -= speed * f.speedFactor * speedMultiplier;
                if (f.x + f.w < -40) f.x = canvasWidth + 40;
            });
        }
    },
    
    initCanvas(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 600;
        
        this.parallaxBg.init(this.canvas.width);
        this.resetBackgroundHSL();
    },
    
    resetBackgroundHSL() {
        const stage = window.IrisGame.config.STAGES.warmup;
        this.currentHStart = stage.hs;
        this.currentSStart = stage.ss;
        this.currentLStart = stage.ls;
        this.currentHEnd = stage.he;
        this.currentSEnd = stage.se;
        this.currentLEnd = stage.le;
    },
    
    updateBackgroundHSL() {
        const state = window.IrisGame.state;
        const stageConf = window.IrisGame.config.STAGES[state.game.currentStage];
        if (!stageConf) return;
        
        this.currentHStart += (stageConf.hs - this.currentHStart) * 0.015;
        this.currentSStart += (stageConf.ss - this.currentSStart) * 0.015;
        this.currentLStart += (stageConf.ls - this.currentLStart) * 0.015;
        
        this.currentHEnd += (stageConf.he - this.currentHEnd) * 0.015;
        this.currentSEnd += (stageConf.se - this.currentSEnd) * 0.015;
        this.currentLEnd += (stageConf.le - this.currentLEnd) * 0.015;
    },
    
    drawBackground() {
        const state = window.IrisGame.state;
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, `hsl(${Math.round(this.currentHStart)}, ${Math.round(this.currentSStart)}%, ${Math.round(this.currentLStart)}%)`);
        gradient.addColorStop(1, `hsl(${Math.round(this.currentHEnd)}, ${Math.round(this.currentSEnd)}%, ${Math.round(this.currentLEnd)}%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        if (state.game.currentStage !== 'rainbow') {
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
        
        this.parallaxBg.clouds.forEach(c => {
            this.drawCloud(c.x, c.y, c.w, '#ffffff');
        });
        
        this.drawWindLines();
        
        this.parallaxBg.hills.forEach(h => {
            ctx.fillStyle = h.color;
            ctx.beginPath();
            ctx.arc(h.x + h.w / 2, h.y + h.h, h.w / 2, Math.PI, 0);
            ctx.fill();
        });
        
        this.parallaxBg.flowers.forEach(f => {
            ctx.strokeStyle = '#66a95c';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(f.x + 12, f.y + 45);
            ctx.lineTo(f.x + 12, f.y + f.h);
            ctx.stroke();
            this.drawFlower(f.x + 12, f.y + 42, 8, f.color);
        });
        
        ctx.fillStyle = '#8bd080';
        ctx.fillRect(0, height - 16, width, 16);
        
        ctx.strokeStyle = '#6bb060';
        ctx.lineWidth = 2;
        const speedMultiplier = state.prefersReducedMotion ? 0.05 : (state.game.calmModeEnabled ? 0.5 : 1.0);
        const speed = window.IrisGame.director.getCurrentDifficulty().speed || 1.2;
        
        ctx.save();
        for (let x = (state.frameCount * -speed * speedMultiplier) % 40; x < width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, height - 16);
            ctx.lineTo(x - 4, height - 24);
            ctx.stroke();
        }
        ctx.restore();
    },
    
    drawCloud(x, y, w, color) {
        const ctx = this.ctx;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + w * 0.25, y + 16, 16, 0, Math.PI * 2);
        ctx.arc(x + w * 0.5, y + 9, 22, 0, Math.PI * 2);
        ctx.arc(x + w * 0.75, y + 17, 15, 0, Math.PI * 2);
        ctx.rect(x + 12, y + 16, w - 24, 18);
        ctx.fill();
    },
    
    drawFlower(x, y, size, color) {
        const ctx = this.ctx;
        ctx.fillStyle = color;
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            ctx.beginPath();
            ctx.arc(x + Math.cos(angle) * size, y + Math.sin(angle) * size, size * 0.75, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#fff7aa';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.72, 0, Math.PI * 2);
        ctx.fill();
    },
    
    drawLeaf(x, y, dir) {
        const ctx = this.ctx;
        ctx.fillStyle = '#3f9a50';
        ctx.beginPath();
        ctx.ellipse(x + dir * 13, y, 13, 6, dir * 0.45, 0, Math.PI * 2);
        ctx.fill();
    },
    
    drawWindLines() {
        const state = window.IrisGame.state;
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 2;
        state.windLines.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(line.x, line.y);
            ctx.lineTo(line.x + line.length, line.y);
            ctx.stroke();
        });
        ctx.restore();
    },
    
    drawPlayerTrail() {
        const state = window.IrisGame.state;
        if (state.prefersReducedMotion) return;
        
        const ctx = this.ctx;
        const activeCosmetic = window.IrisGame.storage.getActiveCosmetic();
        
        ctx.save();
        state.playerTrail.forEach((pt, idx) => {
            const alpha = ((idx + 1) / state.playerTrail.length) * 0.45;
            ctx.globalAlpha = alpha;
            
            if (activeCosmetic === 'star-trail') {
                ctx.fillStyle = '#ffd36e';
                ctx.font = `${10 + idx * 0.8}px serif`;
                ctx.fillText('✨', pt.x - 12 - (state.playerTrail.length - idx) * 1.5, pt.y + Math.sin(idx + state.frameCount * 0.1) * 3);
            } else if (activeCosmetic === 'rainbow-wings') {
                const hueOffset = state.game.calmModeEnabled ? (state.frameCount * 2) : (state.frameCount * 4);
                ctx.filter = `hue-rotate(${(hueOffset + idx * 10) % 360}deg)`;
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
    },
    
    drawPlayer() {
        const state = window.IrisGame.state;
        const player = window.IrisGame.player;
        const ctx = this.ctx;
        
        const isFlickerDisabled = state.prefersReducedMotion || state.game.calmModeEnabled;
        if (player.invincibleFrames > 0 && !isFlickerDisabled && Math.floor(player.invincibleFrames / 6) % 2 === 0) return;
        
        this.drawPlayerTrail();
        
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.scale(player.scale, player.scale);
        
        const rotateFactor = state.prefersReducedMotion ? 0 : (state.game.calmModeEnabled ? 0.02 : 0.045);
        ctx.rotate(player.velocity * rotateFactor);
        
        const flap = Math.sin(player.wingPhase) * 0.18;
        ctx.globalAlpha = player.invincibleFrames > 0 ? (isFlickerDisabled ? 0.45 : 0.72) : 1;
        ctx.font = '28px serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        
        const activeCosmetic = window.IrisGame.storage.getActiveCosmetic();
        if (activeCosmetic === 'star-trail') {
            ctx.fillText('✨', -20, 10);
        }
        
        if (!state.prefersReducedMotion) {
            if (activeCosmetic === 'rainbow-wings') {
                const spinRate = state.game.calmModeEnabled ? 3 : 6;
                ctx.filter = `hue-rotate(${(state.frameCount * spinRate) % 360}deg)`;
            } else if (activeCosmetic === 'pink-wings') {
                ctx.filter = 'hue-rotate(300deg) saturate(1.4)';
            }
        }
        
        // Draw starlight shield if active
        if (state.game.starShield) {
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 210, 110, 0.6)';
            ctx.lineWidth = 2;
            if (!state.prefersReducedMotion && !state.game.calmModeEnabled) {
                ctx.shadowColor = '#ffd36e';
                ctx.shadowBlur = 8;
            }
            ctx.arc(0, 0, 22, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw small stars around shield
            ctx.font = '10px serif';
            ctx.fillText('✨', 18, -12);
            ctx.restore();
        }
        
        ctx.scale(1, 1 + flap);
        ctx.fillText('🦋', 0, 0);
        ctx.restore();
    },
    
    drawObstacle(obs) {
        const ctx = this.ctx;
        const topHeight = obs.gapY - obs.gap / 2;
        const bottomY = obs.gapY + obs.gap / 2;
        const bottomHeight = this.canvas.height - bottomY;
        
        this.drawVineSegment(obs.x, 0, obs.width, topHeight, true, obs.flowerOffset);
        this.drawVineSegment(obs.x, bottomY, obs.width, bottomHeight, false, obs.flowerOffset + 30);
    },
    
    drawVineSegment(x, y, width, height, top, offset) {
        if (height <= 0) return;
        const ctx = this.ctx;
        const radius = 18;
        
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, '#7bc981');
        gradient.addColorStop(0.5, '#9ee5a3');
        gradient.addColorStop(1, '#6bb872');
        
        ctx.fillStyle = gradient;
        this.roundRect(x + 8, y - (top ? radius : 0), width - 16, height + radius, radius);
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
        this.roundRect(x, capY - 10, width, 20, 10);
        ctx.fill();
        
        for (let i = 0; i < Math.max(1, Math.floor(height / 92)); i++) {
            const flowerY = y + 28 + ((i * 84 + offset) % Math.max(40, height - 40));
            this.drawFlower(x + (i % 2 ? width - 10 : 10), flowerY, 5, i % 2 ? '#ff9bb5' : '#ffe38f');
            this.drawLeaf(x + width / 2, flowerY + 10, i % 2 ? -1 : 1);
        }
        
        const tipY = top ? y + height - 2 : y + 2;
        this.drawFlower(x + 14, tipY, 4, '#ff9bb5');
        this.drawFlower(x + width - 14, tipY, 4, '#ffe38f');
    },
    
    roundRect(x, y, w, h, r) {
        const ctx = this.ctx;
        const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + w, y, x + w, y + h, radius);
        ctx.arcTo(x + w, y + h, x, y + h, radius);
        ctx.arcTo(x, y + h, x, y, radius);
        ctx.arcTo(x, y, x + w, y, radius);
        ctx.closePath();
    },
    
    renderAll() {
        const state = window.IrisGame.state;
        const ctx = this.ctx;
        if (!ctx) return;
        
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        
        state.obstacles.forEach(obs => this.drawObstacle(obs));
        state.stars.forEach(star => star.draw(ctx));
        state.particles.forEach(p => p.draw(ctx));
        
        this.drawPlayer();
        
        window.IrisGame.debug.drawOverlays(ctx);
    }
};
