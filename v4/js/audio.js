window.IrisGame = window.IrisGame || {};

window.IrisGame.audio = {
    audioCtx: null,
    
    ensureAudio() {
        const state = window.IrisGame.state;
        if (!state.game.soundEnabled) return;
        if (this.audioCtx) return;
        
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        this.audioCtx = new Ctx();
    },
    
    playSound(type, x = null) {
        const state = window.IrisGame.state;
        const config = window.IrisGame.config;
        
        if (!state.game.soundEnabled) return;
        this.ensureAudio();
        if (!this.audioCtx) return;
        
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        const panner = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
        
        const width = 400; // base canvas width
        const pan = x === null ? 0 : Math.max(-1, Math.min(1, (x / width) * 2 - 1));
        
        oscillator.connect(panner || gainNode);
        if (panner) {
            panner.pan.value = pan;
            panner.connect(gainNode);
        }
        gainNode.connect(this.audioCtx.destination);
        
        // Lower sound even more if Calm Mode is active
        const volumeMultiplier = state.game.calmModeEnabled ? 0.5 : 1.0;
        
        if (type === 'collect') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(988, this.audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1318, this.audioCtx.currentTime + 0.08);
            
            const gain = config.AUDIO_SETTINGS.collectGain * volumeMultiplier;
            gainNode.gain.setValueAtTime(gain, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);
        } else if (type === 'hit') {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(180, this.audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(90, this.audioCtx.currentTime + 0.25);
            
            let gain = state.game.gentleModeEnabled ? config.AUDIO_SETTINGS.hitGainGentle : config.AUDIO_SETTINGS.hitGainNormal;
            gain = gain * volumeMultiplier;
            
            gainNode.gain.setValueAtTime(gain, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);
        } else if (type === 'click' || type === 'uiClick') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(659, this.audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(440, this.audioCtx.currentTime + 0.05);
            
            const gain = config.AUDIO_SETTINGS.clickGain * volumeMultiplier;
            gainNode.gain.setValueAtTime(gain, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
        }
        
        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + 0.3);
    },
    
    toggleMute() {
        const state = window.IrisGame.state;
        const storage = window.IrisGame.storage;
        
        state.game.soundEnabled = !state.game.soundEnabled;
        storage.setSoundEnabled(state.game.soundEnabled);
        
        const soundBtn = document.getElementById('sound-btn');
        if (soundBtn) {
            soundBtn.textContent = state.game.soundEnabled ? '🔊' : '🔇';
            soundBtn.setAttribute('aria-pressed', String(state.game.soundEnabled));
            soundBtn.setAttribute('aria-checked', String(state.game.soundEnabled));
        }
        
        const announcement = document.getElementById('sound-announcement');
        if (announcement) {
            announcement.textContent = state.game.soundEnabled ? '声音已开启' : '声音已关闭';
        }
        
        if (state.game.soundEnabled) {
            this.ensureAudio();
            this.playSound('click');
        }
    },
    
    updateMuteUI() {
        const state = window.IrisGame.state;
        const soundBtn = document.getElementById('sound-btn');
        if (soundBtn) {
            soundBtn.textContent = state.game.soundEnabled ? '🔊' : '🔇';
            soundBtn.setAttribute('aria-pressed', String(state.game.soundEnabled));
            soundBtn.setAttribute('aria-checked', String(state.game.soundEnabled));
            soundBtn.setAttribute('role', 'switch');
            soundBtn.setAttribute('aria-label', '声音开关');
        }
    }
};
