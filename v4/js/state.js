window.IrisGame = window.IrisGame || {};

window.IrisGame.state = {
    // Game Lifecycle State
    gameState: 'START',
    
    // Core Game State
    game: {
        mode: 'easy',
        score: 0,
        highScore: 0,
        lives: 5,
        passedObstacles: 0,
        flightFrames: 0,
        currentStage: 'warmup',
        
        mission: null,
        missionCompleted: false,
        rainbowStarsCollected: 0,
        noHitStarCount: 0,
        
        soundEnabled: false,
        sessionStartTime: Date.now(),
        hasShownRestReminder: false,
        restReminderEnabled: true,
        gentleModeEnabled: true,
        calmModeEnabled: true, // Calm Mode is default ON
        
        newHighScoreThisRun: false,
        hasReached10: false,
        hasReached15: false,
        
        lastRainbowStarScore: 0,
        resetConfirmState: false,
        resetConfirmTimer: null,
        
        // Level Director Stats
        collisionsThisRun: 0,
        consecutiveCollisions: 0,
        consecutivePasses: 0,
        starsCollectedSinceLastRainbow: 0,
        consecutiveStarsNoHit: 0,
        speedBoostFrames: 0,
        hintFlags: {}
    },
    
    // Render loop and physical entities lists
    frameCount: 0,
    gameTime: 0,
    screenShake: 0,
    
    playerTrail: [],
    obstacles: [],
    stars: [],
    particles: [],
    windLines: [],
    bgElements: [],
    
    // Accessibility
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    
    // Tuning Overrides (Debug Panel)
    debugActive: false,
    fps: 60,
    tuningOverrides: {
        speedMultiplier: 1.0,
        gapBonus: 0,
        spawnRateMultiplier: 1.0,
        starRateMultiplier: 1.0,
        rainbowStarChance: 0.35,
        invincibilityFrames: 78,
        screenShakeAmount: 1.0
    },
    
    // Reset function
    resetGameState() {
        this.game.score = 0;
        this.game.passedObstacles = 0;
        this.game.flightFrames = 0;
        this.game.currentStage = 'warmup';
        this.game.missionCompleted = false;
        this.game.rainbowStarsCollected = 0;
        this.game.noHitStarCount = 0;
        this.game.newHighScoreThisRun = false;
        this.game.lastRainbowStarScore = 0;
        
        this.game.collisionsThisRun = 0;
        this.game.consecutiveCollisions = 0;
        this.game.consecutivePasses = 0;
        this.game.starsCollectedSinceLastRainbow = 0;
        this.game.consecutiveStarsNoHit = 0;
        this.game.speedBoostFrames = 0;
        this.game.hintFlags = {};
        
        this.frameCount = 0;
        this.gameTime = 0;
        this.screenShake = 0;
        this.playerTrail = [];
        this.obstacles = [];
        this.stars = [];
        this.particles = [];
        this.windLines = [];
    }
};
