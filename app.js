/* Version 2.0.0 - 2025-12-30
   Game UI Redesign - Pixel-Art Party Game Style
   Changelog:
   - v2.0.0: Complete game-like UI redesign with pixel-art styling, no-scroll layout, enhanced animations
   - v1.0.2: Two-step registration process (name/photo → words)
   - v1.0.1: Accessibility fixes (aria-hidden, inert attributes)
   - v1.0.0: Production release - optimized performance, accessibility, error handling, and mobile camera support
*/

// Production error handler (silent for user-facing errors)
const handleError = (error, context = '') => {
    // In production, errors are handled gracefully without console output
    // Logging can be enabled for debugging by setting window.DEBUG = true
    if (window.DEBUG) {
        // eslint-disable-next-line no-console
        console.error(`[${context}]`, error);
    }
};

// SVG Pixel Character Generator
// Creates pixel-art style SVG characters for players without photos
function generatePixelCharacter(playerIndex, size = 100) {
    // Color palette for characters (bright pastels)
    const colors = [
        { body: '#B8A9E8', face: '#FFD4B3', hair: '#8B5CF6' },
        { body: '#A8D5E2', face: '#FFE5A0', hair: '#EC4899' },
        { body: '#B5E5CF', face: '#FFB3BA', hair: '#10B981' },
        { body: '#FFD4B3', face: '#E8D5FF', hair: '#F59E0B' },
        { body: '#FFE5A0', face: '#B8A9E8', hair: '#EF4444' },
        { body: '#FFB3BA', face: '#A8D5E2', hair: '#8B5CF6' },
        { body: '#E8D5FF', face: '#B5E5CF', hair: '#EC4899' },
        { body: '#B8A9E8', face: '#FFD4B3', hair: '#10B981' },
        { body: '#A8D5E2', face: '#FFE5A0', hair: '#F59E0B' },
        { body: '#B5E5CF', face: '#FFB3BA', hair: '#8B5CF6' }
    ];
    
    const colorSet = colors[playerIndex % colors.length];
    const pixelSize = size / 10; // 10x10 pixel grid
    
    // Simple pixel character: body, head, eyes
    const svg = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;">
            <!-- Body (rounded rectangle) -->
            <rect x="${pixelSize * 2}" y="${pixelSize * 5}" width="${pixelSize * 6}" height="${pixelSize * 4}" 
                  rx="${pixelSize * 0.5}" fill="${colorSet.body}"/>
            <!-- Head (circle) -->
            <circle cx="${size / 2}" cy="${pixelSize * 3.5}" r="${pixelSize * 2.5}" fill="${colorSet.face}"/>
            <!-- Hair (top arc) -->
            <path d="M ${pixelSize * 2} ${pixelSize * 2} Q ${size / 2} ${pixelSize * 1} ${pixelSize * 8} ${pixelSize * 2} L ${pixelSize * 7.5} ${pixelSize * 2.5} Q ${size / 2} ${pixelSize * 2} ${pixelSize * 2.5} ${pixelSize * 2.5} Z" 
                  fill="${colorSet.hair}"/>
            <!-- Eyes -->
            <circle cx="${pixelSize * 3.5}" cy="${pixelSize * 3}" r="${pixelSize * 0.8}" fill="#2D3748"/>
            <circle cx="${pixelSize * 6.5}" cy="${pixelSize * 3}" r="${pixelSize * 0.8}" fill="#2D3748"/>
            <!-- Smile -->
            <path d="M ${pixelSize * 3.5} ${pixelSize * 4} Q ${size / 2} ${pixelSize * 4.5} ${pixelSize * 6.5} ${pixelSize * 4}" 
                  stroke="#2D3748" stroke-width="${pixelSize * 0.3}" fill="none" stroke-linecap="round"/>
        </svg>
    `.trim();
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Helper function to get player avatar HTML
function getPlayerAvatarHTML(player, index) {
    if (player.avatar) {
        // Use photo if available
        return `<img src="${player.avatar}" class="player-avatar" alt="${player.name}">`;
    } else {
        // Use generated pixel character
        const svgData = generatePixelCharacter(index);
        return `<img src="${svgData}" class="player-avatar" alt="${player.name}">`;
    }
}

// Application version
const APP_VERSION = '2.0.0';

// Sound System with lazy loading
const SoundManager = {
    enabled: true,
    sounds: {},
    loaded: false,
    
    init() {
        // Lazy load sounds only when needed
        this.loadSounds();
        this.loaded = true;
    },
    
    loadSounds() {
        if (this.loaded) return;
        
        try {
            const soundFiles = ['click', 'reveal', 'win', 'lose', 'success'];
            soundFiles.forEach(name => {
                try {
                    this.sounds[name] = new Audio(`sounds/${name}.mp3`);
                    this.sounds[name].volume = 0.5;
                    this.sounds[name].preload = 'auto';
                } catch (e) {
                    handleError(e, 'SoundManager.loadSounds');
                }
            });
        } catch (error) {
            handleError(error, 'SoundManager.init');
        }
    },
    
    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        const sound = this.sounds[soundName];
        try {
            sound.currentTime = 0;
            sound.play().catch(() => {
                // Silent fail - user may have audio disabled
            });
        } catch (error) {
            handleError(error, 'SoundManager.play');
        }
    },
    
    toggle() {
        this.enabled = !this.enabled;
        const toggle = document.getElementById('sound-toggle');
        if (toggle) {
            toggle.textContent = this.enabled ? '🔊' : '🔇';
            toggle.setAttribute('aria-label', this.enabled ? 'Mute sound' : 'Unmute sound');
            toggle.classList.toggle('muted', !this.enabled);
        }
        if (this.enabled) {
            this.play('click');
        }
    }
};

// Enhanced Confetti System for Result Phase (optimized performance)
const confettiPool = {
    elements: [],
    maxElements: 350,
    
    createElement() {
        const el = document.createElement('div');
        el.style.position = 'fixed';
        el.style.pointerEvents = 'none';
        el.style.zIndex = '9999';
        return el;
    },
    
    getElement() {
        if (this.elements.length > 0) {
            return this.elements.pop();
        }
        return this.createElement();
    },
    
    recycleElement(el) {
        if (this.elements.length < this.maxElements) {
            el.style.cssText = '';
            this.elements.push(el);
        } else {
            el.remove();
        }
    }
};

function createConfetti() {
    const colors = ['#B8A9E8', '#A8D5E2', '#B5E5CF', '#FFD4B3', '#FFE5A0', '#FFB3BA', '#E8D5FF', '#8B5CF6', '#EC4899', '#10B981'];
    const confettiCount = 150;
    
    // Clear existing confetti efficiently
    document.querySelectorAll('.confetti').forEach(el => confettiPool.recycleElement(el));
    
    // Batch DOM updates using DocumentFragment
    const fragment = document.createDocumentFragment();
    const elements = [];
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = confettiPool.getElement();
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.width = (Math.random() * 12 + 6) + 'px';
            confetti.style.height = confetti.style.width;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.opacity = '1';
            fragment.appendChild(confetti);
            elements.push(confetti);
            
            if (i === confettiCount - 1 || i % 20 === 0) {
                document.body.appendChild(fragment);
            }
        }, i * 15);
    }
    
    // Cleanup after animation
    setTimeout(() => {
        elements.forEach(el => {
            el.style.opacity = '0';
            setTimeout(() => confettiPool.recycleElement(el), 500);
        });
    }, 3500);
}

// Grand confetti burst for Result phase (centered explosion effect)
function createGrandConfettiBurst() {
    const colors = ['#B8A9E8', '#A8D5E2', '#B5E5CF', '#FFD4B3', '#FFE5A0', '#FFB3BA', '#E8D5FF', '#8B5CF6', '#EC4899', '#10B981'];
    const burstCount = 200;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const fragment = document.createDocumentFragment();
    const elements = [];
    
    document.querySelectorAll('.confetti-burst').forEach(el => confettiPool.recycleElement(el));
    
    for (let i = 0; i < burstCount; i++) {
        setTimeout(() => {
            const confetti = confettiPool.getElement();
            confetti.className = 'confetti-burst';
            const angle = (Math.PI * 2 * i) / burstCount;
            const velocity = Math.random() * 300 + 200;
            const distanceX = Math.cos(angle) * velocity;
            const distanceY = Math.sin(angle) * velocity;
            
            confetti.style.left = centerX + 'px';
            confetti.style.top = centerY + 'px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = (Math.random() * 10 + 5) + 'px';
            confetti.style.height = confetti.style.width;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';
            confetti.style.setProperty('--distance-x', distanceX + 'px');
            confetti.style.setProperty('--distance-y', distanceY + 'px');
            confetti.style.setProperty('--rotation', Math.random() * 720 + 'deg');
            fragment.appendChild(confetti);
            elements.push(confetti);
            
            if (i === burstCount - 1 || i % 30 === 0) {
                document.body.appendChild(fragment);
            }
        }, i * 10);
    }
    
    setTimeout(() => {
        elements.forEach(el => {
            el.style.opacity = '0';
            setTimeout(() => confettiPool.recycleElement(el), 500);
        });
    }, 4000);
}

// Game State
const gameState = {
    playerCount: 4,
    gameMode: null,
    wordPool: [],
    commonWord: null,
    impostorWord: null,
    players: [],
    currentRegistrationIndex: 0,
    registrationStep: 'name', // 'name' or 'words' - tracks which step of registration we're on
    revealedPlayers: new Set(),
    timerStart: null,
    timerInterval: null,
    selectedImpostor: null,
    impostorPlayerIndex: null
};

// Cached DOM Elements (performance optimization)
const DOM = {
    phases: {},
    modals: {},
    buttons: {},
    inputs: {},
    containers: {},
    
    init() {
        // Cache all frequently accessed DOM elements
        this.phases = {
            setup: document.getElementById('setup-phase'),
            registration: document.getElementById('registration-phase'),
            wordReveal: document.getElementById('word-reveal-phase'),
            discussion: document.getElementById('discussion-phase'),
            guess: document.getElementById('guess-phase'),
            result: document.getElementById('result-phase')
        };
        
        this.modals = {
            game: document.getElementById('game-modal'),
            camera: document.getElementById('camera-modal'),
            wordOverlay: document.getElementById('word-overlay'),
            passOverlay: document.getElementById('pass-device-overlay')
        };
        
        this.containers = {
            registration: document.getElementById('player-registration-container'),
            reveal: document.getElementById('player-list-reveal'),
            guess: document.getElementById('player-list-guess'),
            result: document.getElementById('result-content')
        };
        
        this.inputs = {
            playerCount: document.getElementById('player-count')
        };
    }
};

// Modal System (Replaces alert())
function showModal(title, message) {
    const modal = DOM.modals.game;
    if (!modal) return;
    
    const titleEl = document.getElementById('modal-title');
    const messageEl = document.getElementById('modal-message');
    
    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    SoundManager.play('click');
    
    // Focus management for accessibility
    const confirmBtn = document.getElementById('modal-confirm');
    if (confirmBtn) {
        setTimeout(() => confirmBtn.focus(), 100);
    }
}

function hideModal() {
    const modal = DOM.modals.game;
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
}

// Initialize phase accessibility immediately (before DOMContentLoaded)
// This prevents any focus attempts from happening before aria-hidden is set correctly
(function initPhaseAccessibility() {
    const setupPhase = document.getElementById('setup-phase');
    if (setupPhase) {
        setupPhase.setAttribute('aria-hidden', 'false');
        setupPhase.removeAttribute('inert');
    }
    
    // Hide all other phases that have aria-hidden="true" in HTML
    const otherPhases = document.querySelectorAll('.phase:not(#setup-phase)');
    otherPhases.forEach(phase => {
        if (!phase.classList.contains('active')) {
            phase.setAttribute('aria-hidden', 'true');
            phase.setAttribute('inert', '');
        }
    });
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    DOM.init();
    SoundManager.init();
    setupViewportFixes();
    initializeEventListeners();
    initializeSoundToggle();
    
    // Re-initialize phase accessibility states after DOM.init() caches elements
    const setupPhase = DOM.phases.setup;
    if (setupPhase && setupPhase.classList.contains('active')) {
        setupPhase.setAttribute('aria-hidden', 'false');
        setupPhase.removeAttribute('inert');
    }
    
    // Ensure all other phases are properly hidden
    Object.entries(DOM.phases).forEach(([name, phase]) => {
        if (phase && name !== 'setup' && !phase.classList.contains('active')) {
            phase.setAttribute('aria-hidden', 'true');
            phase.setAttribute('inert', '');
        }
    });
    
    // Modal confirm button
    const modalConfirm = document.getElementById('modal-confirm');
    if (modalConfirm) {
        modalConfirm.addEventListener('click', () => {
            const modal = DOM.modals.game;
            const onConfirm = modal?.dataset?.onConfirm;
            
            hideModal();
            
            if (onConfirm === 'exit') {
                changeSettings();
            }
            
            if (modal) {
                delete modal.dataset.onConfirm;
            }
        });
    }
    
    // Set version attribute for debugging
    document.documentElement.setAttribute('data-app-version', APP_VERSION);
});

function initializeSoundToggle() {
    const toggle = document.getElementById('sound-toggle');
    if (toggle) {
        toggle.setAttribute('aria-label', 'Toggle sound');
        toggle.addEventListener('click', () => {
            SoundManager.toggle();
        });
    }
}

function initializeEventListeners() {
    // Setup phase
    const decreaseBtn = document.getElementById('decrease-players');
    const increaseBtn = document.getElementById('increase-players');
    const startBtn = document.getElementById('start-setup');
    
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            if (gameState.playerCount > 3) {
                gameState.playerCount--;
                if (DOM.inputs.playerCount) {
                    DOM.inputs.playerCount.value = gameState.playerCount;
                }
                SoundManager.play('click');
            }
        });
    }
    
    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            if (gameState.playerCount < 10) {
                gameState.playerCount++;
                if (DOM.inputs.playerCount) {
                    DOM.inputs.playerCount.value = gameState.playerCount;
                }
                SoundManager.play('click');
            }
        });
    }
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            gameState.gameMode = e.target.dataset.mode;
            e.target.setAttribute('aria-pressed', 'true');
            SoundManager.play('click');
        });
    });
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            SoundManager.play('click');
            startGameSetup();
        });
    }
    
    // Registration phase
    const completeReg = document.getElementById('complete-registration');
    if (completeReg) {
        completeReg.addEventListener('click', () => {
            SoundManager.play('success');
            handleRegistrationSubmit();
        });
    }
    
    // Word reveal phase
    const gotItBtn = document.getElementById('got-it-btn');
    if (gotItBtn) {
        gotItBtn.addEventListener('click', () => {
            SoundManager.play('click');
            hideWord();
        });
    }
    
    // Discussion phase
    const startGuess = document.getElementById('start-guess');
    if (startGuess) {
        startGuess.addEventListener('click', () => {
            SoundManager.play('click');
            startGuessPhase();
        });
    }
    
    // Guess phase
    const confirmGuess = document.getElementById('confirm-guess');
    if (confirmGuess) {
        confirmGuess.addEventListener('click', () => {
            SoundManager.play('success');
            confirmGuessFn();
        });
    }
    
    // Result phase - Use event delegation for dynamically created buttons
    const resultContainer = DOM.containers.result;
    if (resultContainer) {
        resultContainer.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            
            const id = target.id;
            SoundManager.play('click');
            
            if (id === 'play-again') {
                playAgainFn();
            } else if (id === 'change-words') {
                changeWordsFn();
            } else if (id === 'change-settings') {
                changeSettings();
            } else if (id === 'exit-game') {
                exitGameFn();
            }
        });
    }
    
    // Camera
    const cancelCamera = document.getElementById('cancel-camera');
    const capturePhoto = document.getElementById('capture-photo');
    
    if (cancelCamera) cancelCamera.addEventListener('click', () => { SoundManager.play('click'); closeCamera(); });
    if (capturePhoto) capturePhoto.addEventListener('click', () => { SoundManager.play('click'); capturePhotoFn(); });
}

// Phase Management
function showPhase(phaseName) {
    // First, activate the target phase and set aria-hidden to false BEFORE deactivating others
    // This ensures focus can be set on elements in the active phase without accessibility warnings
    const phase = DOM.phases[phaseName];
    if (phase) {
        // Remove inert and set aria-hidden to false FIRST, before any other operations
        phase.removeAttribute('inert');
        phase.setAttribute('aria-hidden', 'false');
        phase.classList.add('active');
        phase.scrollTop = 0;
    }
    
    // Then deactivate all other phases
    Object.values(DOM.phases).forEach(p => {
        if (p && p !== phase) {
            p.classList.remove('active');
            p.setAttribute('aria-hidden', 'true');
            p.setAttribute('inert', '');
        }
    });
}

// Game Setup
function startGameSetup() {
    if (!gameState.gameMode) {
        showModal('Mode Required', 'Please select a game mode');
        return;
    }
    
    if (gameState.gameMode === 'auto') {
        generateAutoWords();
    } else {
        showRegistrationPhase();
    }
}

// Simple Word Database - Extremely Common Words Only
const SIMPLE_WORDS = {
    objects: ['cup', 'table', 'bag', 'shoe', 'phone', 'book', 'chair', 'lamp', 'pen', 'key', 'watch', 'glasses'],
    food: ['rice', 'burger', 'milk', 'bread', 'apple', 'pizza', 'cake', 'coffee', 'tea', 'banana', 'egg', 'fish'],
    places: ['school', 'beach', 'shop', 'park', 'home', 'kitchen', 'bedroom', 'garden', 'street', 'library', 'cafe', 'store'],
    animals: ['cat', 'dog', 'bird', 'fish', 'horse', 'cow', 'pig', 'chicken', 'rabbit', 'mouse', 'sheep', 'duck'],
    actions: ['sleep', 'eat', 'walk', 'run', 'jump', 'sit', 'stand', 'talk', 'read', 'write', 'play', 'dance']
};

const WORD_CATEGORIES = Object.keys(SIMPLE_WORDS);

// Auto Generated Words - Simple Words Only
function generateAutoWords() {
    try {
        const category = WORD_CATEGORIES[Math.floor(Math.random() * WORD_CATEGORIES.length)];
        const words = SIMPLE_WORDS[category];
        
        let word1Index = Math.floor(Math.random() * words.length);
        let word2Index = Math.floor(Math.random() * words.length);
        
        while (word2Index === word1Index) {
            word2Index = Math.floor(Math.random() * words.length);
        }
        
        gameState.commonWord = words[word1Index];
        gameState.impostorWord = words[word2Index];
        
        showRegistrationPhase();
    } catch (error) {
        handleError(error, 'generateAutoWords');
        gameState.commonWord = 'cup';
        gameState.impostorWord = 'glass';
        showRegistrationPhase();
    }
}

// Player Registration
function showRegistrationPhase() {
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
    gameState.registrationStep = 'name'; // Start with name/photo step
    showCurrentPlayerRegistration();
}

function showCurrentPlayerRegistration() {
    const container = DOM.containers.registration;
    const instruction = document.getElementById('registration-instruction');
    const submitBtn = document.getElementById('complete-registration');
    const currentIndex = gameState.currentRegistrationIndex;
    const isCustomMode = gameState.gameMode === 'custom';
    const currentStep = gameState.registrationStep;
    const playerCount = gameState.playerCount;
    
    // Calculate progress: in custom mode, each player has 2 steps (name + words)
    let totalSteps = isCustomMode ? playerCount * 2 : playerCount;
    let currentStepNumber = isCustomMode 
        ? (currentIndex * 2 + (currentStep === 'name' ? 1 : 2))
        : (currentIndex + 1);
    const progressPercent = (currentStepNumber / totalSteps) * 100;
    
    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');
    
    if (progressText) {
        if (isCustomMode) {
            progressText.textContent = currentStep === 'name' 
                ? `Player ${currentIndex + 1} of ${playerCount} - Name & Photo`
                : `Player ${currentIndex + 1} of ${playerCount} - Words`;
        } else {
            progressText.textContent = `Player ${currentIndex + 1} of ${playerCount}`;
        }
    }
    
    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
    }
    
    if (!container) return;
    
    container.innerHTML = '';
    const player = gameState.players[currentIndex];
    
    // Show different content based on step
    if (isCustomMode && currentStep === 'words') {
        // Step 2: Words input
        if (!player.words) {
            player.words = ['', ''];
        }
        
        if (instruction) {
            instruction.textContent = `Player ${currentIndex + 1}: Enter your 2 words`;
        }
        
        if (submitBtn) {
            const isLastPlayer = currentIndex === gameState.playerCount - 1;
            submitBtn.textContent = isLastPlayer ? 'Complete Registration' : 'Next Player';
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-label', isLastPlayer ? 'Complete registration for all players' : 'Continue to next player');
        }
        
        const item = document.createElement('div');
        item.className = 'player-registration-item';
        item.innerHTML = `
            <h3>Player ${currentIndex + 1} - Enter Words</h3>
            <p class="instruction" style="margin-bottom: 20px;">Enter 2 different words</p>
            <div class="word-input-group">
                <label for="word-input-0">Word 1</label>
                <input type="text" class="player-word-input" id="word-input-0" placeholder="Enter word 1" data-word="0" value="${player.words[0] || ''}" aria-label="Enter first word" autofocus>
            </div>
            <div class="word-input-group">
                <label for="word-input-1">Word 2</label>
                <input type="text" class="player-word-input" id="word-input-1" placeholder="Enter word 2" data-word="1" value="${player.words[1] || ''}" aria-label="Enter second word">
            </div>
        `;
        container.appendChild(item);
        
        // Add event listeners for word inputs
        container.querySelectorAll('.player-word-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const wordIndex = parseInt(e.target.dataset.word);
                const word = e.target.value.trim().toLowerCase();
                player.words[wordIndex] = word;
                validateCurrentPlayerRegistration();
            });
        });
        
    } else {
        // Step 1: Name and Photo (or only name for auto mode)
        if (instruction) {
            const playerNum = currentIndex + 1;
            instruction.textContent = isCustomMode 
                ? `Player ${playerNum}: Enter your name and photo` 
                : `Player ${playerNum}: Enter your name`;
        }
        
        if (submitBtn) {
            submitBtn.textContent = 'Next';
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-label', 'Continue to next step');
        }
        
        const item = document.createElement('div');
        item.className = 'player-registration-item';
        item.innerHTML = `
            <h3>Player ${currentIndex + 1}</h3>
            <div class="avatar-container">
                <img class="avatar-preview" id="avatar-preview-current" style="display: ${player.avatar ? 'block' : 'none'};" alt="Player ${currentIndex + 1} avatar">
                <div class="avatar-placeholder" id="avatar-placeholder-current" style="display: ${player.avatar ? 'none' : 'flex'};" aria-label="Avatar placeholder">👤</div>
            </div>
            <button class="camera-btn" id="camera-btn-current" aria-label="Take photo for player ${currentIndex + 1}">📷 Take Photo</button>
            <input type="text" class="player-name-input" id="player-name-current" placeholder="Enter name" value="${player.name || ''}" aria-label="Enter player name" autocomplete="name" autofocus>
        `;
        container.appendChild(item);
        
        if (player.avatar) {
            const preview = document.getElementById('avatar-preview-current');
            if (preview) preview.src = player.avatar;
        }
        
        const cameraBtn = document.getElementById('camera-btn-current');
        if (cameraBtn) {
            cameraBtn.addEventListener('click', () => {
                SoundManager.play('click');
                openCamera(currentIndex);
            });
        }
        
        const nameInput = document.getElementById('player-name-current');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                player.name = e.target.value.trim();
                validateCurrentPlayerRegistration();
            });
        }
    }
    
    showPhase('registration');
}

function validateCurrentPlayerRegistration() {
    const submitBtn = document.getElementById('complete-registration');
    const currentIndex = gameState.currentRegistrationIndex;
    const player = gameState.players[currentIndex];
    const currentStep = gameState.registrationStep;
    const isCustomMode = gameState.gameMode === 'custom';
    
    let isValid = false;
    
    if (isCustomMode && currentStep === 'words') {
        // Validate words: need 2 non-empty, different words
        const hasWords = player.words && player.words.length === 2 && 
                        player.words[0] !== '' && player.words[1] !== '';
        const wordsDifferent = hasWords && player.words[0] !== player.words[1];
        isValid = hasWords && wordsDifferent;
    } else {
        // Validate name: just need a name
        isValid = player.name.trim() !== '';
    }
    
    if (submitBtn) {
        submitBtn.disabled = !isValid;
        submitBtn.setAttribute('aria-disabled', !isValid);
    }
}

function handleRegistrationSubmit() {
    const currentIndex = gameState.currentRegistrationIndex;
    const player = gameState.players[currentIndex];
    const currentStep = gameState.registrationStep;
    const isCustomMode = gameState.gameMode === 'custom';
    
    if (isCustomMode && currentStep === 'words') {
        // Step 2: Validate words
        if (!player.words || player.words.length !== 2 || 
            player.words[0] === '' || player.words[1] === '') {
            showModal('Missing Words', 'Please enter both words for this player.');
            return;
        }
        
        if (player.words[0] === player.words[1]) {
            showModal('Duplicate Words', 'Please enter two different words.');
            return;
        }
        
        // Move to next player or complete registration
        if (currentIndex < gameState.playerCount - 1) {
            gameState.currentRegistrationIndex++;
            gameState.registrationStep = 'name'; // Start next player with name step
            showCurrentPlayerRegistration();
        } else {
            completeRegistration();
        }
    } else {
        // Step 1: Validate name
        const hasName = player.name.trim() !== '';
        
        if (!hasName) {
            showModal('Missing Name', 'Please enter a name for this player.');
            return;
        }
        
        if (isCustomMode) {
            // Move to words step for same player
            gameState.registrationStep = 'words';
            showCurrentPlayerRegistration();
        } else {
            // Auto mode: move to next player or complete
            if (currentIndex < gameState.playerCount - 1) {
                gameState.currentRegistrationIndex++;
                showCurrentPlayerRegistration();
            } else {
                completeRegistration();
            }
        }
    }
}

// Enhanced camera function for iPhone/iOS Safari compatibility
function openCamera(playerId) {
    const modal = DOM.modals.camera;
    const video = document.getElementById('camera-video');
    
    if (!modal || !video) return;
    
    modal.dataset.playerId = playerId;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    const constraints = {
        video: {
            facingMode: { ideal: 'user' },
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            aspectRatio: { ideal: 4/3 }
        },
        audio: false
    };

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                video.srcObject = stream;
                video.setAttribute('playsinline', 'true');
                video.setAttribute('webkit-playsinline', 'true');
                video.muted = true;
                
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            modal.dataset.stream = 'active';
                        })
                        .catch(() => {
                            // iOS Safari autoplay quirk - retry after delay
                            setTimeout(() => {
                                video.play().catch(() => {
                                    // Silent fail
                                });
                            }, 100);
                        });
                }
            })
            .catch(() => {
                // Fallback: try without constraints
                navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
                    .then(stream => {
                        video.srcObject = stream;
                        video.setAttribute('playsinline', 'true');
                        video.muted = true;
                        video.play().catch(() => {
                            // Silent fail
                        });
                        modal.dataset.stream = 'active';
                    })
                    .catch(() => {
                        showModal('Camera Access', 'Could not access camera. You can continue without a photo.');
                        closeCamera();
                    });
            });
    } else {
        const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (getUserMedia) {
            getUserMedia.call(navigator, { video: true, audio: false },
                stream => {
                    video.srcObject = stream;
                    video.setAttribute('playsinline', 'true');
                    video.muted = true;
                    video.play();
                    modal.dataset.stream = 'active';
                },
                () => {
                    showModal('Camera Access', 'Could not access camera. You can continue without a photo.');
                    closeCamera();
                }
            );
        } else {
            showModal('Camera Not Supported', 'Your browser does not support camera access.');
            closeCamera();
        }
    }
}

function closeCamera() {
    const modal = DOM.modals.camera;
    const video = document.getElementById('camera-video');
    
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function capturePhotoFn() {
    const modal = DOM.modals.camera;
    const playerId = parseInt(modal?.dataset?.playerId);
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    
    if (!video || !canvas || playerId === undefined) return;
    
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

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
    if (gameState.gameMode === 'custom') {
        gameState.wordPool = [];
        gameState.players.forEach(player => {
            if (player.words && player.words.length === 2) {
                gameState.wordPool.push(player.words[0]);
                gameState.wordPool.push(player.words[1]);
            }
        });
        
        gameState.wordPool = [...new Set(gameState.wordPool)];
        
        if (gameState.wordPool.length < 2) {
            showModal('Not Enough Words', 'Please enter at least 2 different words across all players.');
            return;
        }
        
        const shuffled = [...gameState.wordPool].sort(() => Math.random() - 0.5);
        gameState.commonWord = shuffled[0];
        gameState.impostorWord = shuffled[1] || shuffled[0];
    }
    
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
}

// Word Reveal Phase
function showWordRevealPhase() {
    const container = DOM.containers.reveal;
    if (!container) return;
    
    const playerCount = gameState.players.length;
    
    let gridClass = 'player-grid-few';
    if (playerCount >= 5 && playerCount <= 6) {
        gridClass = 'player-grid-medium';
    } else if (playerCount >= 7) {
        gridClass = 'player-grid-many';
    }
    
    container.className = `player-grid player-grid-reveal ${gridClass}`;
    container.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'player-grid-item';
        item.dataset.playerId = index;
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `Reveal word for ${player.name}`);
        
        if (gameState.revealedPlayers.has(index)) {
            item.classList.add('revealed');
            item.setAttribute('aria-disabled', 'true');
        }
        
        item.innerHTML = `
            ${getPlayerAvatarHTML(player, index)}
            <span class="player-name">${player.name}</span>
        `;
        
        if (!gameState.revealedPlayers.has(index)) {
            const handleClick = () => {
                SoundManager.play('click');
                revealWord(index);
            };
            
            item.addEventListener('click', handleClick);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            });
        }
        
        container.appendChild(item);
    });

    showPhase('wordReveal');
}

function revealWord(playerIndex) {
    const player = gameState.players[playerIndex];
    const overlay = DOM.modals.wordOverlay;
    const wordDisplay = document.getElementById('word-display');
    
    if (!overlay || !wordDisplay) return;
    
    wordDisplay.textContent = player.word.toUpperCase();
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.dataset.playerId = playerIndex;
    SoundManager.play('reveal');
}

function hideWord() {
    const overlay = DOM.modals.wordOverlay;
    const passOverlay = DOM.modals.passOverlay;
    const playerIndex = parseInt(overlay?.dataset?.playerId);
    
    if (!overlay || !passOverlay) return;
    
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    passOverlay.classList.add('active');
    passOverlay.setAttribute('aria-hidden', 'false');
    
    setTimeout(() => {
        passOverlay.classList.remove('active');
        passOverlay.setAttribute('aria-hidden', 'true');
        
        gameState.revealedPlayers.add(playerIndex);
        
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
    showPhase('discussion');
}

function startTimer() {
    gameState.timerStart = Date.now();
    const timerDisplay = document.getElementById('timer');
    const timerContainer = timerDisplay?.closest('.timer-display');
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.timerStart) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        if (timerDisplay) {
            timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        
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
    const container = DOM.containers.guess;
    if (!container) return;
    
    const playerCount = gameState.players.length;
    
    let gridClass = 'player-grid-few';
    if (playerCount >= 5 && playerCount <= 6) {
        gridClass = 'player-grid-medium';
    } else if (playerCount >= 7) {
        gridClass = 'player-grid-many';
    }
    
    container.className = `player-grid player-grid-guess ${gridClass}`;
    container.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'player-grid-item';
        item.dataset.playerId = index;
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `Select ${player.name} as impostor`);
        
        item.innerHTML = `
            ${getPlayerAvatarHTML(player, index)}
            <span class="player-name">${player.name}</span>
        `;
        
        const handleClick = () => selectImpostor(index);
        item.addEventListener('click', handleClick);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
            }
        });
        
        container.appendChild(item);
    });

    gameState.selectedImpostor = null;
    const confirmBtn = document.getElementById('confirm-guess');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.setAttribute('aria-disabled', 'true');
    }
    
    showPhase('guess');
}

function selectImpostor(playerIndex) {
    gameState.selectedImpostor = playerIndex;
    SoundManager.play('click');
    
    const items = document.querySelectorAll('#player-list-guess .player-grid-item');
    items.forEach((item, index) => {
        if (index === playerIndex) {
            item.classList.add('selected');
            item.setAttribute('aria-pressed', 'true');
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        } else {
            item.classList.remove('selected');
            item.setAttribute('aria-pressed', 'false');
        }
    });
    
    const confirmBtn = document.getElementById('confirm-guess');
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.setAttribute('aria-disabled', 'false');
    }
}

function confirmGuessFn() {
    const isCorrect = gameState.selectedImpostor === gameState.impostorPlayerIndex;
    showResultPhase(isCorrect);
}

// Result Phase - Role-Based Victory Screen
function showResultPhase(isCorrect) {
    const container = DOM.containers.result;
    if (!container) return;
    
    const impostorIndex = gameState.impostorPlayerIndex;
    const playerCount = gameState.players.length;
    
    // Victory Logic:
    // isCorrect === true  → Civilians Win (multiple winners)
    // isCorrect === false → Impostor Wins (single winner)
    
    const isCivilianVictory = isCorrect;
    const isImpostorVictory = !isCorrect;
    
    // Sound and effects
    if (isCivilianVictory) {
        SoundManager.play('win');
        createGrandConfettiBurst();
        setTimeout(() => createConfetti(), 500);
        setTimeout(() => createConfetti(), 1500);
        setTimeout(() => createConfetti(), 2500);
    } else {
        SoundManager.play('lose');
        // Dark, ominous effects for impostor victory
    }
    
    // Separate winners from losers
    const winners = [];
    const losers = [];
    
    gameState.players.forEach((player, index) => {
        const isImpostor = index === impostorIndex;
        const isWinner = isCivilianVictory ? !isImpostor : isImpostor;
        
        if (isWinner) {
            winners.push({ player, index, isImpostor });
        } else {
            losers.push({ player, index, isImpostor });
        }
    });
    
    // Generate player card HTML
    function generatePlayerCard(playerData, isWinnerCard) {
        const { player, index, isImpostor } = playerData;
        
        let avatarHTML;
        if (player.avatar) {
            avatarHTML = `<img src="${player.avatar}" class="victory-player-avatar" alt="${player.name}">`;
        } else {
            const svgData = generatePixelCharacter(index);
            avatarHTML = `<img src="${svgData}" class="victory-player-avatar" alt="${player.name}">`;
        }
        
        const reactionEmoji = isWinnerCard 
            ? (isImpostor ? '😎' : '🎉')
            : (isImpostor ? '😵' : '😮');
        
        return `
            <div class="victory-player-card ${isWinnerCard ? 'victory-winner' : 'victory-loser'}" 
                 data-player-index="${index}"
                 role="article"
                 aria-label="${player.name}${isImpostor ? ' (Impostor)' : ' (Civilian)'}">
                <div class="victory-player-avatar-container">
                    ${avatarHTML}
                    <div class="victory-player-reaction">${reactionEmoji}</div>
                    ${isImpostor ? `<div class="victory-player-badge">IMPOSTOR</div>` : ''}
                </div>
                <div class="victory-player-name">${player.name}</div>
            </div>
        `;
    }
    
    // Build victory screen based on outcome
    let victoryHTML = '';
    
    if (isImpostorVictory) {
        // IMPOSTOR VICTORY - Single Winner, Dark Theme
        const impostor = winners[0];
        const civilianCount = losers.length;
        
        const impostorMessages = [
            'The deception was flawless',
            'Master of manipulation',
            'Perfect performance',
            'The impostor has prevailed'
        ];
        
        const randomMessage = impostorMessages[Math.floor(Math.random() * impostorMessages.length)];
        
        victoryHTML = `
            <div class="result-screen result-impostor-victory">
                <!-- Dark Background Effects -->
                <div class="victory-background-dark"></div>
                <div class="victory-fog-effect"></div>
                <div class="victory-glitch-overlay"></div>
                
                <!-- Title Zone -->
                <div class="victory-title-zone">
                    <h1 class="victory-main-title impostor-title">IMPOSTOR WINS</h1>
                    <p class="victory-subtitle">${randomMessage}</p>
                </div>
                
                <!-- Center Focus: Impostor -->
                <div class="victory-content-zone">
                    <div class="victory-impostor-focus">
                        ${generatePlayerCard(impostor, true)}
                        <div class="victory-impostor-stats">
                            <div class="victory-stat-item">
                                <span class="victory-stat-label">Deceived</span>
                                <span class="victory-stat-value">${civilianCount} ${civilianCount === 1 ? 'Civilian' : 'Civilians'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // CIVILIAN VICTORY - Multiple Winners, Bright Theme
        const winnerCount = winners.length;
        const impostor = losers[0]; // The caught impostor
        
        const civilianMessages = [
            'The impostor has been eliminated',
            'Justice prevails',
            'The truth was revealed',
            'Teamwork triumphs'
        ];
        
        const randomMessage = civilianMessages[Math.floor(Math.random() * civilianMessages.length)];
        
        // Determine grid layout based on winner count
        let gridClass = 'victory-grid-small';
        if (winnerCount >= 5 && winnerCount <= 6) {
            gridClass = 'victory-grid-medium';
        } else if (winnerCount >= 7) {
            gridClass = 'victory-grid-large';
        }
        
        const winnersHTML = winners.map(playerData => generatePlayerCard(playerData, true)).join('');
        
        victoryHTML = `
            <div class="result-screen result-civilian-victory">
                <!-- Bright Background Effects -->
                <div class="victory-background-bright"></div>
                <div class="victory-light-rays"></div>
                <div class="victory-particles-bright"></div>
                
                <!-- Title Zone -->
                <div class="victory-title-zone">
                    <h1 class="victory-main-title civilian-title">CIVILIANS WIN</h1>
                    <p class="victory-subtitle">${randomMessage}</p>
                </div>
                
                <!-- Winners Grid -->
                <div class="victory-content-zone">
                    <div class="victory-winners-grid ${gridClass}">
                        ${winnersHTML}
                    </div>
                    <div class="victory-caught-impostor">
                        <div class="victory-caught-label">The Impostor Was:</div>
                        ${generatePlayerCard(impostor, false)}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Common bottom zone (words and actions)
    const actionsHTML = `
        <div class="result-actions-zone">
            <div class="result-words-badge">
                <span class="result-word-badge-label">The Words Were:</span>
                <div class="result-word-badge-content">
                    <span class="result-word-badge-value">${gameState.commonWord.toUpperCase()}</span>
                    <span class="result-word-badge-divider">VS</span>
                    <span class="result-word-badge-value">${gameState.impostorWord.toUpperCase()}</span>
                </div>
            </div>
            
            <div class="result-actions">
                <button class="btn-primary result-action-primary" id="play-again">
                    <span class="btn-icon">🎮</span>
                    <span class="btn-text">Play Again</span>
                </button>
                <div class="result-actions-secondary">
                    <button class="btn-secondary result-action-btn" id="change-words">
                        <span class="btn-icon">🔄</span>
                        <span class="btn-text">New Words</span>
                    </button>
                    <button class="btn-secondary result-action-btn" id="change-settings">
                        <span class="btn-icon">⚙️</span>
                        <span class="btn-text">New Game</span>
                    </button>
                    <button class="btn-secondary result-action-btn" id="exit-game">
                        <span class="btn-icon">🚪</span>
                        <span class="btn-text">Exit</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = victoryHTML + actionsHTML;
    
    showPhase('result');
    
    // Screen shake effects
    if (isCivilianVictory) {
        document.body.classList.add('victory-screen-shake');
        setTimeout(() => document.body.classList.remove('victory-screen-shake'), 800);
    } else {
        document.body.classList.add('defeat-screen-shake');
        setTimeout(() => document.body.classList.remove('defeat-screen-shake'), 800);
    }
    
    // Staggered entrance animations
    setTimeout(() => {
        if (isImpostorVictory) {
            // Impostor victory: dramatic single character entrance
            const impostorCard = container.querySelector('.victory-impostor-focus .victory-player-card');
            if (impostorCard) {
                impostorCard.style.opacity = '0';
                impostorCard.style.transform = 'scale(0.5) translateY(50px)';
                impostorCard.style.filter = 'blur(10px)';
                setTimeout(() => {
                    impostorCard.style.transition = 'all 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                    requestAnimationFrame(() => {
                        impostorCard.style.opacity = '1';
                        impostorCard.style.transform = 'scale(1) translateY(0)';
                        impostorCard.style.filter = 'blur(0)';
                    });
                }, 200);
            }
        } else {
            // Civilian victory: staggered grid entrance
            const winnerCards = container.querySelectorAll('.victory-winners-grid .victory-player-card');
            winnerCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8) translateY(30px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                    requestAnimationFrame(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1) translateY(0)';
                    });
                }, index * 100);
            });
            
            // Caught impostor appears after winners
            const caughtImpostor = container.querySelector('.victory-caught-impostor .victory-player-card');
            if (caughtImpostor) {
                caughtImpostor.style.opacity = '0';
                caughtImpostor.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    caughtImpostor.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                    requestAnimationFrame(() => {
                        caughtImpostor.style.opacity = '1';
                        caughtImpostor.style.transform = 'scale(1)';
                    });
                }, winnerCards.length * 100 + 300);
            }
        }
        
        // Animate action buttons
        setTimeout(() => {
            const actionButtons = container.querySelectorAll('.result-actions button');
            actionButtons.forEach((btn, index) => {
                btn.style.opacity = '0';
                btn.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    btn.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                    requestAnimationFrame(() => {
                        btn.style.opacity = '1';
                        btn.style.transform = 'translateY(0)';
                    });
                }, index * 100);
            });
        }, isImpostorVictory ? 1500 : 2000);
    }, 300);
}

// Restart Functions
function playAgainFn() {
    gameState.revealedPlayers.clear();
    gameState.selectedImpostor = null;
    gameState.timerStart = null;
    gameState.currentRegistrationIndex = 0;
    gameState.registrationStep = 'name';
    stopTimer();
    
    gameState.players.forEach(player => {
        player.word = null;
    });
    
    if (gameState.gameMode === 'custom') {
        if (gameState.wordPool.length >= 2) {
            const shuffled = [...gameState.wordPool].sort(() => Math.random() - 0.5);
            gameState.commonWord = shuffled[0];
            gameState.impostorWord = shuffled[1] || shuffled[0];
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
            showRegistrationPhase();
        }
    } else {
        generateAutoWords();
    }
}

function changeWordsFn() {
    gameState.wordPool = [];
    gameState.revealedPlayers.clear();
    gameState.selectedImpostor = null;
    gameState.currentRegistrationIndex = 0;
    gameState.registrationStep = 'name';
    stopTimer();
    
    gameState.players.forEach(player => {
        player.word = null;
        if (player.words) {
            player.words = ['', ''];
        }
    });
    
    if (gameState.gameMode === 'custom') {
        gameState.players = [];
        showRegistrationPhase();
    } else {
        generateAutoWords();
    }
}

function changeSettings() {
    gameState.playerCount = 4;
    gameState.gameMode = null;
    gameState.wordPool = [];
    gameState.commonWord = null;
    gameState.impostorWord = null;
    gameState.players = [];
    gameState.currentRegistrationIndex = 0;
    gameState.registrationStep = 'name';
    gameState.revealedPlayers.clear();
    gameState.selectedImpostor = null;
    gameState.impostorPlayerIndex = null;
    stopTimer();
    
    if (DOM.inputs.playerCount) {
        DOM.inputs.playerCount.value = 4;
    }
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    
    showPhase('setup');
}

function exitGameFn() {
    showModal('Exit Game', 'Are you sure you want to exit? This will start a new game.');
    const modal = DOM.modals.game;
    if (modal) {
        modal.dataset.onConfirm = 'exit';
    }
}

/* ============================================
   Viewport + Safe-Area Helpers (Mobile optimization)
   ============================================ */
function setupViewportFixes() {
    const setHeights = () => {
        const viewport = window.visualViewport;
        const height = viewport ? viewport.height : window.innerHeight;
        const bottomInset = viewport
            ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
            : 0;

        document.documentElement.style.setProperty('--app-height', `${height}px`);
        document.documentElement.style.setProperty('--safe-bottom-js', `${bottomInset}px`);
    };

    setHeights();

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', setHeights);
    }
    window.addEventListener('orientationchange', setHeights);
    window.addEventListener('resize', setHeights);
}
