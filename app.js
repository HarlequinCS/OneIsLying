// Sound System
const SoundManager = {
    enabled: true,
    sounds: {
        click: null,
        reveal: null,
        win: null,
        lose: null,
        success: null
    },
    
    init() {
        // Create audio objects (using Web Audio API for better control)
        try {
            this.sounds.click = new Audio('sounds/click.mp3');
            this.sounds.reveal = new Audio('sounds/reveal.mp3');
            this.sounds.win = new Audio('sounds/win.mp3');
            this.sounds.lose = new Audio('sounds/lose.mp3');
            this.sounds.success = new Audio('sounds/success.mp3');
            
            // Set volume
            Object.values(this.sounds).forEach(sound => {
                if (sound) {
                    sound.volume = 0.5;
                }
            });
        } catch (error) {
            console.log('Sound files not found, continuing without sound');
        }
    },
    
    play(soundName) {
        if (!this.enabled) return;
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Sound play failed:', e));
        }
    },
    
    toggle() {
        this.enabled = !this.enabled;
        const toggle = document.getElementById('sound-toggle');
        if (toggle) {
            toggle.textContent = this.enabled ? '🔊' : '🔇';
            toggle.classList.toggle('muted', !this.enabled);
        }
        // Play sound on toggle if enabling
        if (this.enabled) {
            this.play('click');
        }
    }
};

// Confetti System
function createConfetti() {
    const colors = ['#B8A9E8', '#A8D5E2', '#B5E5CF', '#FFD4B3', '#FFE5A0', '#FFB3BA', '#E8D5FF'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.width = (Math.random() * 10 + 5) + 'px';
            confetti.style.height = confetti.style.width;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 20);
    }
}

// Game State
const gameState = {
    playerCount: 4,
    gameMode: null, // 'custom' or 'auto'
    wordPool: [],
    commonWord: null,
    impostorWord: null,
    players: [],
    currentRegistrationIndex: 0,
    revealedPlayers: new Set(),
    timerStart: null,
    timerInterval: null,
    selectedImpostor: null,
    impostorPlayerIndex: null
};

// DOM Elements
const phases = {
    setup: document.getElementById('setup-phase'),
    registration: document.getElementById('registration-phase'),
    wordReveal: document.getElementById('word-reveal-phase'),
    discussion: document.getElementById('discussion-phase'),
    guess: document.getElementById('guess-phase'),
    result: document.getElementById('result-phase')
};

// Modal System (Replaces alert())
function showModal(title, message) {
    const modal = document.getElementById('game-modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    modal.classList.add('active');
    SoundManager.play('click');
}

function hideModal() {
    const modal = document.getElementById('game-modal');
    modal.classList.remove('active');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    SoundManager.init();
    initializeEventListeners();
    initializeSoundToggle();
    
    // Modal confirm button
    document.getElementById('modal-confirm').addEventListener('click', () => {
        const modal = document.getElementById('game-modal');
        const onConfirm = modal.dataset.onConfirm;
        
        hideModal();
        
        // Handle special cases
        if (onConfirm === 'exit') {
            changeSettings();
        }
        
        // Clear callback
        delete modal.dataset.onConfirm;
    });
});

function initializeSoundToggle() {
    const toggle = document.getElementById('sound-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            SoundManager.toggle();
            SoundManager.play('click');
        });
    }
}

function initializeEventListeners() {
    // Setup phase
    document.getElementById('decrease-players').addEventListener('click', () => {
        if (gameState.playerCount > 3) {
            gameState.playerCount--;
            document.getElementById('player-count').value = gameState.playerCount;
            SoundManager.play('click');
        }
    });

    document.getElementById('increase-players').addEventListener('click', () => {
        if (gameState.playerCount < 10) {
            gameState.playerCount++;
            document.getElementById('player-count').value = gameState.playerCount;
            SoundManager.play('click');
        }
    });

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            gameState.gameMode = e.target.dataset.mode;
            SoundManager.play('click');
        });
    });

    document.getElementById('start-setup').addEventListener('click', () => {
        SoundManager.play('click');
        startGameSetup();
    });

    // Word input phase - removed (words now entered during registration)

    // Registration phase
    document.getElementById('complete-registration').addEventListener('click', () => {
        SoundManager.play('success');
        handleRegistrationSubmit();
    });

    // Word reveal phase
    document.getElementById('got-it-btn').addEventListener('click', () => {
        SoundManager.play('click');
        hideWord();
    });

    // Discussion phase
    document.getElementById('start-guess').addEventListener('click', () => {
        SoundManager.play('click');
        startGuessPhase();
    });

    // Guess phase
    document.getElementById('confirm-guess').addEventListener('click', () => {
        SoundManager.play('success');
        confirmGuess();
    });

    // Result phase
    document.getElementById('play-again').addEventListener('click', () => {
        SoundManager.play('click');
        playAgain();
    });
    document.getElementById('change-words').addEventListener('click', () => {
        SoundManager.play('click');
        changeWords();
    });
    document.getElementById('change-settings').addEventListener('click', () => {
        SoundManager.play('click');
        changeSettings();
    });
    document.getElementById('exit-game').addEventListener('click', () => {
        SoundManager.play('click');
        exitGame();
    });

    // Camera
    document.getElementById('cancel-camera').addEventListener('click', () => {
        SoundManager.play('click');
        closeCamera();
    });
    document.getElementById('capture-photo').addEventListener('click', () => {
        SoundManager.play('click');
        capturePhoto();
    });
}

// Phase Management
function showPhase(phaseName) {
    Object.values(phases).forEach(phase => phase.classList.remove('active'));
    if (phases[phaseName]) {
        phases[phaseName].classList.add('active');
    }
}

// Game Setup
function startGameSetup() {
    if (!gameState.gameMode) {
        alert('Please select a game mode');
        return;
    }

    if (gameState.gameMode === 'auto') {
        generateAutoWords();
    } else {
        showRegistrationPhase();
    }
}

// Word input phase removed - words now entered during registration

// Simple Word Database - Extremely Common Words Only
const SIMPLE_WORDS = {
    objects: ['cup', 'table', 'bag', 'shoe', 'phone', 'book', 'chair', 'lamp', 'pen', 'key', 'watch', 'glasses'],
    food: ['rice', 'burger', 'milk', 'bread', 'apple', 'pizza', 'cake', 'coffee', 'tea', 'banana', 'egg', 'fish'],
    places: ['school', 'beach', 'shop', 'park', 'home', 'kitchen', 'bedroom', 'garden', 'street', 'library', 'cafe', 'store'],
    animals: ['cat', 'dog', 'bird', 'fish', 'horse', 'cow', 'pig', 'chicken', 'rabbit', 'mouse', 'sheep', 'duck'],
    actions: ['sleep', 'eat', 'walk', 'run', 'jump', 'sit', 'stand', 'talk', 'read', 'write', 'play', 'dance']
};

// Word Categories for Pairing
const WORD_CATEGORIES = Object.keys(SIMPLE_WORDS);

// Auto Generated Words - Simple Words Only
function generateAutoWords() {
    try {
        // Select a random category
        const category = WORD_CATEGORIES[Math.floor(Math.random() * WORD_CATEGORIES.length)];
        const words = SIMPLE_WORDS[category];
        
        // Get two different words from the same category
        let word1Index = Math.floor(Math.random() * words.length);
        let word2Index = Math.floor(Math.random() * words.length);
        
        // Ensure different words
        while (word2Index === word1Index) {
            word2Index = Math.floor(Math.random() * words.length);
        }
        
        gameState.commonWord = words[word1Index];
        gameState.impostorWord = words[word2Index];
        
        showRegistrationPhase();
    } catch (error) {
        console.error('Error generating words:', error);
        // Fallback to simple defaults
        gameState.commonWord = 'cup';
        gameState.impostorWord = 'glass';
        showRegistrationPhase();
    }
}

// Player Registration
function showRegistrationPhase() {
    // Initialize players array if empty
    if (gameState.players.length === 0) {
        gameState.players = [];
        for (let i = 0; i < gameState.playerCount; i++) {
            gameState.players.push({
                id: i,
                name: '',
                avatar: null,
                word: null,
                words: []
            });
        }
    }
    
    gameState.currentRegistrationIndex = 0;
    showCurrentPlayerRegistration();
}

function showCurrentPlayerRegistration() {
    const container = document.getElementById('player-registration-container');
    const instruction = document.getElementById('registration-instruction');
    const submitBtn = document.getElementById('complete-registration');
    const currentIndex = gameState.currentRegistrationIndex;
    const isCustomMode = gameState.gameMode === 'custom';
    const isLastPlayer = currentIndex === gameState.playerCount - 1;
    const playerCount = gameState.playerCount;
    const progressPercent = ((currentIndex + 1) / playerCount) * 100;
    
    // Update progress indicator
    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');
    
    if (progressText) {
        progressText.textContent = `Player ${currentIndex + 1} of ${playerCount}`;
    }
    
    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
    }
    
    // Update instruction
    if (instruction) {
        const playerNum = currentIndex + 1;
        instruction.textContent = isCustomMode 
            ? `Player ${playerNum}: Enter your name and 2 words` 
            : `Player ${playerNum}: Enter your name`;
    }
    
    // Update button text
    if (submitBtn) {
        submitBtn.textContent = isLastPlayer ? 'Complete Registration' : 'Next Player';
        submitBtn.disabled = true;
    }
    
    container.innerHTML = '';
    
    const player = gameState.players[currentIndex];
    
    // Ensure words array exists for custom mode
    if (isCustomMode && !player.words) {
        player.words = ['', ''];
    }
    
    const wordInputsHTML = isCustomMode ? `
        <div class="word-input-group">
            <label>Word 1</label>
            <input type="text" class="player-word-input" placeholder="Enter word 1" data-word="0" value="${(player.words && player.words[0]) || ''}">
        </div>
        <div class="word-input-group">
            <label>Word 2</label>
            <input type="text" class="player-word-input" placeholder="Enter word 2" data-word="1" value="${(player.words && player.words[1]) || ''}">
        </div>
    ` : '';
    
    const item = document.createElement('div');
    item.className = 'player-registration-item';
    item.innerHTML = `
        <h3>Player ${currentIndex + 1}</h3>
        <div class="avatar-container">
            <img class="avatar-preview" id="avatar-preview-current" style="display: ${player.avatar ? 'block' : 'none'};">
            <div class="avatar-placeholder" id="avatar-placeholder-current" style="display: ${player.avatar ? 'none' : 'flex'};">👤</div>
        </div>
        <button class="camera-btn" id="camera-btn-current">📷 Take Photo</button>
        <input type="text" class="player-name-input" placeholder="Enter name" value="${player.name || ''}" id="player-name-current">
        ${wordInputsHTML}
    `;
    container.appendChild(item);
    
    // Set avatar preview if exists
    if (player.avatar) {
        const preview = document.getElementById('avatar-preview-current');
        preview.src = player.avatar;
    }
    
    // Add event listeners
    document.getElementById('camera-btn-current').addEventListener('click', () => {
        SoundManager.play('click');
        openCamera(currentIndex);
    });
    
    const nameInput = document.getElementById('player-name-current');
    nameInput.addEventListener('input', (e) => {
        player.name = e.target.value.trim();
        validateCurrentPlayerRegistration();
    });
    
    // Add word input listeners for custom mode
    if (isCustomMode) {
        if (!player.words) {
            player.words = ['', ''];
        }
        
        container.querySelectorAll('.player-word-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const wordIndex = parseInt(e.target.dataset.word);
                const word = e.target.value.trim().toLowerCase();
                player.words[wordIndex] = word;
                validateCurrentPlayerRegistration();
            });
        });
    }
    
    showPhase('registration');
}

function validateCurrentPlayerRegistration() {
    const submitBtn = document.getElementById('complete-registration');
    const currentIndex = gameState.currentRegistrationIndex;
    const player = gameState.players[currentIndex];
    
    const hasName = player.name.trim() !== '';
    let isValid = hasName;
    
    if (gameState.gameMode === 'custom') {
        const hasWords = player.words && player.words.length === 2 && 
                        player.words[0] !== '' && player.words[1] !== '';
        isValid = hasName && hasWords;
    }
    
    if (submitBtn) {
        submitBtn.disabled = !isValid;
    }
}

function handleRegistrationSubmit() {
    const currentIndex = gameState.currentRegistrationIndex;
    
    // Validate current player
    const player = gameState.players[currentIndex];
    const hasName = player.name.trim() !== '';
    
    if (!hasName) {
        showModal('Missing Name', 'Please enter a name for this player.');
        return;
    }
    
    if (gameState.gameMode === 'custom') {
        if (!player.words || player.words.length !== 2 || 
            player.words[0] === '' || player.words[1] === '') {
            showModal('Missing Words', 'Please enter both words for this player.');
            return;
        }
    }
    
    // Move to next player or complete registration
    if (currentIndex < gameState.playerCount - 1) {
        gameState.currentRegistrationIndex++;
        showCurrentPlayerRegistration();
    } else {
        // All players registered, process and assign words
        completeRegistration();
    }
}

// Old validateRegistration removed - using validateCurrentPlayerRegistration instead

function openCamera(playerId) {
    const modal = document.getElementById('camera-modal');
    modal.dataset.playerId = playerId;
    modal.classList.add('active');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
            const video = document.getElementById('camera-video');
            video.srcObject = stream;
            video.play();
            modal.dataset.stream = 'active';
        })
        .catch(error => {
            console.error('Camera error:', error);
            alert('Could not access camera. You can continue without a photo.');
            closeCamera();
        });
}

function closeCamera() {
    const modal = document.getElementById('camera-modal');
    const video = document.getElementById('camera-video');
    
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    modal.classList.remove('active');
}

function capturePhoto() {
    const modal = document.getElementById('camera-modal');
    const playerId = parseInt(modal.dataset.playerId);
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    // Convert to circular avatar
    const img = new Image();
    img.onload = () => {
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        
        canvas.width = 200;
        canvas.height = 200;
        context.clearRect(0, 0, 200, 200);
        
        context.beginPath();
        context.arc(100, 100, 100, 0, 2 * Math.PI);
        context.clip();
        
        context.drawImage(img, x, y, size, size, 0, 0, 200, 200);
        
        const avatarData = canvas.toDataURL('image/png');
        gameState.players[playerId].avatar = avatarData;
        
        // Update preview (check if it's the current registration view)
        const preview = document.getElementById('avatar-preview-current');
        const placeholder = document.getElementById('avatar-placeholder-current');
        if (preview && placeholder) {
            preview.src = avatarData;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        }
    };
    
    img.src = canvas.toDataURL('image/png');
    closeCamera();
}

function completeRegistration() {
    // Process words for custom mode
    if (gameState.gameMode === 'custom') {
        // Collect all words from players
        gameState.wordPool = [];
        gameState.players.forEach(player => {
            if (player.words && player.words.length === 2) {
                gameState.wordPool.push(player.words[0]);
                gameState.wordPool.push(player.words[1]);
            }
        });
        
        // Remove duplicates
        gameState.wordPool = [...new Set(gameState.wordPool)];
        
        if (gameState.wordPool.length < 2) {
            showModal('Not Enough Words', 'Please enter at least 2 different words across all players.');
            return;
        }
        
        // Randomly select common and impostor words
        const shuffled = [...gameState.wordPool].sort(() => Math.random() - 0.5);
        gameState.commonWord = shuffled[0];
        gameState.impostorWord = shuffled[1] || shuffled[0];
    }
    
    // Assign words randomly
    const impostorIndex = Math.floor(Math.random() * gameState.playerCount);
    gameState.impostorPlayerIndex = impostorIndex;
    
    gameState.players.forEach((player, index) => {
        if (index === impostorIndex) {
            player.word = gameState.impostorWord;
        } else {
            player.word = gameState.commonWord;
        }
    });

    // Reset reveal tracking
    gameState.revealedPlayers.clear();
    
    showWordRevealPhase();
}

// Word Reveal Phase
function showWordRevealPhase() {
    const container = document.getElementById('player-list-reveal');
    const playerCount = gameState.players.length;
    
    // Determine grid layout class based on player count
    let gridClass = 'player-grid-few'; // 3-4 players
    if (playerCount >= 5 && playerCount <= 6) {
        gridClass = 'player-grid-medium';
    } else if (playerCount >= 7) {
        gridClass = 'player-grid-many';
    }
    
    // Apply grid classes
    container.className = `player-grid player-grid-reveal ${gridClass}`;
    container.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'player-grid-item';
        item.dataset.playerId = index;
        
        // Add revealed class if already seen
        if (gameState.revealedPlayers.has(index)) {
            item.classList.add('revealed');
        }
        
        item.innerHTML = `
            ${player.avatar 
                ? `<img src="${player.avatar}" class="player-avatar" alt="${player.name}">`
                : `<div class="player-avatar-placeholder">👤</div>`
            }
            <span class="player-name">${player.name}</span>
        `;
        
        // Only add click listener if not revealed
        if (!gameState.revealedPlayers.has(index)) {
            item.addEventListener('click', () => {
                SoundManager.play('click');
                revealWord(index);
            });
        }
        
        container.appendChild(item);
    });

    showPhase('wordReveal');
}

function revealWord(playerIndex) {
    const player = gameState.players[playerIndex];
    const overlay = document.getElementById('word-overlay');
    const wordDisplay = document.getElementById('word-display');
    
    wordDisplay.textContent = player.word.toUpperCase();
    overlay.classList.add('active');
    overlay.dataset.playerId = playerIndex;
    SoundManager.play('reveal');
}

function hideWord() {
    const overlay = document.getElementById('word-overlay');
    const passOverlay = document.getElementById('pass-device-overlay');
    const playerIndex = parseInt(overlay.dataset.playerId);
    
    overlay.classList.remove('active');
    passOverlay.classList.add('active');
    
    setTimeout(() => {
        passOverlay.classList.remove('active');
        
        // Mark player as revealed
        gameState.revealedPlayers.add(playerIndex);
        
        // Check if all players have seen their words
        if (gameState.revealedPlayers.size === gameState.playerCount) {
            startDiscussionPhase();
        } else {
            showWordRevealPhase();
        }
    }, 2000);
}

// Discussion Phase
function startDiscussionPhase() {
    showDiscussionPhase();
    startTimer();
}

function showDiscussionPhase() {
    // Player list removed - not needed during discussion
    showPhase('discussion');
}

function startTimer() {
    gameState.timerStart = Date.now();
    const timerDisplay = document.getElementById('timer');
    const timerContainer = timerDisplay.closest('.timer-display');
    
    gameState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.timerStart) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Add visual urgency after 2 minutes (optional)
        if (elapsed > 120 && timerContainer) {
            timerContainer.classList.add('timer-urgent');
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// Guess Phase
function startGuessPhase() {
    stopTimer();
    showGuessPhase();
}

function showGuessPhase() {
    const container = document.getElementById('player-list-guess');
    const playerCount = gameState.players.length;
    
    // Determine grid layout class
    let gridClass = 'player-grid-few';
    if (playerCount >= 5 && playerCount <= 6) {
        gridClass = 'player-grid-medium';
    } else if (playerCount >= 7) {
        gridClass = 'player-grid-many';
    }
    
    // Apply grid classes
    container.className = `player-grid player-grid-guess ${gridClass}`;
    container.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'player-grid-item';
        item.dataset.playerId = index;
        
        item.innerHTML = `
            ${player.avatar 
                ? `<img src="${player.avatar}" class="player-avatar" alt="${player.name}">`
                : `<div class="player-avatar-placeholder">👤</div>`
            }
            <span class="player-name">${player.name}</span>
        `;
        
        item.addEventListener('click', () => selectImpostor(index));
        container.appendChild(item);
    });

    // Reset selection
    gameState.selectedImpostor = null;
    document.getElementById('confirm-guess').disabled = true;
    
    showPhase('guess');
}

function selectImpostor(playerIndex) {
    gameState.selectedImpostor = playerIndex;
    SoundManager.play('click');
    
    // Update UI - remove all selected classes, add to clicked item
    const items = document.querySelectorAll('#player-list-guess .player-grid-item');
    items.forEach((item, index) => {
        if (index === playerIndex) {
            item.classList.add('selected');
            // Add haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        } else {
            item.classList.remove('selected');
        }
    });
    
    // Enable confirm button
    document.getElementById('confirm-guess').disabled = false;
}

function confirmGuess() {
    const isCorrect = gameState.selectedImpostor === gameState.impostorPlayerIndex;
    showResultPhase(isCorrect);
}

// Result Phase
function showResultPhase(isCorrect) {
    const container = document.getElementById('result-content');
    const impostor = gameState.players[gameState.impostorPlayerIndex];
    const playerCount = gameState.players.length;
    
    // Play sound and create confetti for wins
    if (isCorrect) {
        SoundManager.play('win');
        createConfetti();
    } else {
        SoundManager.play('lose');
    }
    
    // Determine layout class based on player count
    let layoutClass = 'result-few'; // 3-4 players
    if (playerCount >= 5 && playerCount <= 6) {
        layoutClass = 'result-medium';
    } else if (playerCount >= 7) {
        layoutClass = 'result-many';
    }
    
    // Build all players grid
    let playersGrid = '';
    gameState.players.forEach((player, index) => {
        const isImpostor = index === gameState.impostorPlayerIndex;
        const playerClass = isImpostor 
            ? (isCorrect ? 'result-player-loser' : 'result-player-winner')
            : 'result-player-other';
        
        playersGrid += `
            <div class="result-player-card ${playerClass}" data-player-index="${index}">
                ${player.avatar 
                    ? `<img src="${player.avatar}" class="result-player-avatar" alt="${player.name}">`
                    : `<div class="result-player-avatar-placeholder">👤</div>`
                }
                <div class="result-player-name">${player.name}</div>
                ${isImpostor ? `<div class="result-player-word">${player.word.toUpperCase()}</div>` : ''}
            </div>
        `;
    });
    
    container.innerHTML = `
        <div class="result-header">
            <h2 class="result-title">${isCorrect ? 'You Found the Impostor!' : 'The Impostor Won!'}</h2>
            <p class="result-message">${isCorrect 
                ? 'Great detective work!' 
                : 'The impostor fooled everyone!'
            }</p>
        </div>
        <div class="result-players-grid ${layoutClass}">
            ${playersGrid}
        </div>
        <div class="result-words-info">
            <div class="result-word-item">
                <span class="result-word-label">Common Word:</span>
                <span class="result-word-value">${gameState.commonWord.toUpperCase()}</span>
            </div>
            <div class="result-word-item">
                <span class="result-word-label">Impostor Word:</span>
                <span class="result-word-value">${gameState.impostorWord.toUpperCase()}</span>
            </div>
        </div>
    `;

    showPhase('result');
}

// Restart Functions
function playAgain() {
    // OPTION A: Play Again (Same Players)
    // Preserve: Player names, Avatars
    // Reset: Words, Impostor, Timer, Votes
    
    gameState.revealedPlayers.clear();
    gameState.selectedImpostor = null;
    gameState.timerStart = null;
    gameState.currentRegistrationIndex = 0;
    stopTimer();
    
    // Clear player words but keep names/avatars
    gameState.players.forEach(player => {
        player.word = null;
        // Keep words array for custom mode to reuse
    });
    
    if (gameState.gameMode === 'custom') {
        // Custom mode: reuse same word dataset
        if (gameState.wordPool.length >= 2) {
            const shuffled = [...gameState.wordPool].sort(() => Math.random() - 0.5);
            gameState.commonWord = shuffled[0];
            gameState.impostorWord = shuffled[1] || shuffled[0];
            // Go directly to word assignment (skip registration)
            const impostorIndex = Math.floor(Math.random() * gameState.playerCount);
            gameState.impostorPlayerIndex = impostorIndex;
            gameState.players.forEach((player, index) => {
                if (index === impostorIndex) {
                    player.word = gameState.impostorWord;
                } else {
                    player.word = gameState.commonWord;
                }
            });
            gameState.revealedPlayers.clear();
            showWordRevealPhase();
        } else {
            // Word pool lost, need to re-register
            showRegistrationPhase();
        }
    } else {
        // Auto mode: regenerate words
        generateAutoWords();
    }
}

function changeWords() {
    // Reset to registration/auto generation
    gameState.wordPool = [];
    gameState.revealedPlayers.clear();
    gameState.selectedImpostor = null;
    gameState.currentRegistrationIndex = 0;
    stopTimer();
    
    // Clear player words
    gameState.players.forEach(player => {
        player.word = null;
        if (player.words) {
            player.words = ['', ''];
        }
    });
    
    if (gameState.gameMode === 'custom') {
        gameState.players = []; // Reset players to start fresh registration
        showRegistrationPhase();
    } else {
        generateAutoWords();
    }
}

function changeSettings() {
    // OPTION B: New Game (New Players)
    // Full reset - redirect to Initial Setup Screen
    
    gameState.playerCount = 4;
    gameState.gameMode = null;
    gameState.wordPool = [];
    gameState.commonWord = null;
    gameState.impostorWord = null;
    gameState.players = [];
    gameState.currentRegistrationIndex = 0;
    gameState.revealedPlayers.clear();
    gameState.selectedImpostor = null;
    gameState.impostorPlayerIndex = null;
    stopTimer();
    
    // Reset UI
    document.getElementById('player-count').value = 4;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    
    showPhase('setup');
}

function exitGame() {
    // Use modal with callback
    showModal('Exit Game', 'Are you sure you want to exit? This will start a new game.');
    // Store callback on modal element
    const modal = document.getElementById('game-modal');
    modal.dataset.onConfirm = 'exit';
}

