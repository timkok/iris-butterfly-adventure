window.IrisGame = window.IrisGame || {};

window.IrisGame.rewards = {
    renderTreasure() {
        const state = window.IrisGame.state;
        const config = window.IrisGame.config;
        const storage = window.IrisGame.storage;
        
        const stickersContainer = document.getElementById('stickers-container');
        const cosmeticsContainer = document.getElementById('cosmetics-container');
        if (!stickersContainer || !cosmeticsContainer) return;
        
        stickersContainer.innerHTML = '';
        cosmeticsContainer.innerHTML = '';
        
        const ownedCosmetics = storage.getCosmetics();
        const activeCosmetic = storage.getActiveCosmetic();
        const ownedStickers = storage.getStickers();
        
        config.UNLOCKS.forEach(item => {
            const isOwned = state.game.highScore >= item.requirementHighScore || ownedStickers.includes(item.id);
            
            if (item.type === 'sticker') {
                const stickerDiv = document.createElement('div');
                stickerDiv.className = `sticker ${isOwned ? '' : 'locked'}`;
                stickerDiv.id = `sticker-${item.id}`;
                stickerDiv.setAttribute('title', isOwned ? item.label : `需最高分 ${item.requirementHighScore} 解锁`);
                
                // ARIA accessibility & keyboard traversal for sticker cards
                stickerDiv.setAttribute('tabindex', '0');
                stickerDiv.setAttribute('role', 'img');
                const ariaLabelText = isOwned 
                    ? `贴纸：${item.label}，已解锁。` 
                    : `未解锁贴纸：${item.label}，需要最高分达到 ${item.requirementHighScore} 解锁。`;
                stickerDiv.setAttribute('aria-label', ariaLabelText);
                
                const emojiSpan = document.createElement('span');
                emojiSpan.className = 'sticker-emoji';
                emojiSpan.textContent = item.icon;
                stickerDiv.appendChild(emojiSpan);
                
                const statusSpan = document.createElement('span');
                statusSpan.className = 'sticker-status';
                statusSpan.textContent = isOwned ? '已解锁' : '未解锁';
                
                statusSpan.style.color = isOwned ? '#322b5f' : '#6c6a86';
                statusSpan.style.fontWeight = 'bold';
                
                stickerDiv.appendChild(statusSpan);
                stickersContainer.appendChild(stickerDiv);
            } else if (item.type === 'cosmetic') {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cosmetic-item';
                itemDiv.dataset.id = item.id;
                
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
                const isCosmeticOwned = ownedCosmetics.includes(item.id) || state.game.highScore >= item.requirementHighScore;
                
                button.style.minHeight = '44px';
                
                if (isCosmeticOwned) {
                    if (!ownedCosmetics.includes(item.id)) {
                        ownedCosmetics.push(item.id);
                        storage.setCosmetics(ownedCosmetics);
                    }
                    
                    if (activeCosmetic === item.id) {
                        button.textContent = '使用中';
                        button.className = 'btn-buy owned active-cosmetic';
                        button.setAttribute('aria-pressed', 'true');
                        button.setAttribute('aria-label', `外观：${item.label}，当前使用中`);
                    } else {
                        button.textContent = '使用';
                        button.className = 'btn-buy owned';
                        button.setAttribute('aria-pressed', 'false');
                        button.setAttribute('aria-label', `外观：${item.label}，已解锁，点击使用`);
                    }
                } else {
                    button.textContent = `最高分 ${item.requirementHighScore} 解锁`;
                    button.className = 'btn-buy locked-cosmetic';
                    button.setAttribute('disabled', 'true');
                    button.setAttribute('aria-pressed', 'false');
                    button.setAttribute('aria-label', `未解锁外观：${item.label}，需要最高分达到 ${item.requirementHighScore} 解锁`);
                }
                
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectCosmetic(item.id, item.requirementHighScore);
                });
                itemDiv.appendChild(button);
                cosmeticsContainer.appendChild(itemDiv);
            }
        });
    },
    
    selectCosmetic(id, cost) {
        const state = window.IrisGame.state;
        const storage = window.IrisGame.storage;
        const ui = window.IrisGame.ui;
        
        const ownedCosmetics = storage.getCosmetics();
        
        const isUnlocked = state.game.highScore >= cost || ownedCosmetics.includes(id);
        if (!isUnlocked) {
            ui.showMessage('星星还不够，继续收集吧！', 1, 1400);
            return;
        }
        
        if (!ownedCosmetics.includes(id)) {
            ownedCosmetics.push(id);
            storage.setCosmetics(ownedCosmetics);
        }
        
        storage.setActiveCosmetic(id);
        window.IrisGame.audio.playSound('click');
        
        this.renderTreasure();
        ui.renderHUD();
    },
    
    switchTab(tab) {
        const tabStickers = document.getElementById('tab-stickers');
        const tabCosmetics = document.getElementById('tab-cosmetics');
        
        if (tabStickers) {
            tabStickers.classList.toggle('active', tab === 'stickers');
            tabStickers.setAttribute('aria-selected', String(tab === 'stickers'));
        }
        if (tabCosmetics) {
            tabCosmetics.classList.toggle('active', tab === 'cosmetics');
            tabCosmetics.setAttribute('aria-selected', String(tab === 'cosmetics'));
        }
        
        const stickersContent = document.getElementById('stickers-content');
        const cosmeticsContent = document.getElementById('cosmetics-content');
        
        if (stickersContent) stickersContent.classList.toggle('active', tab === 'stickers');
        if (cosmeticsContent) cosmeticsContent.classList.toggle('active', tab === 'cosmetics');
    },
    
    isUnlocked(highScore, requirementHighScore) {
        return highScore >= requirementHighScore;
    }
};
