# One Is Lying - Game Logic Documentation

## Table of Contents
1. [Game Overview](#game-overview)
2. [Game Modes](#game-modes)
3. [Player Registration Flow](#player-registration-flow)
4. [Word Generation & Assignment](#word-generation--assignment)
5. [Game Phases](#game-phases)
6. [Impostor System](#impostor-system)
7. [Winning Conditions](#winning-conditions)
8. [State Management](#state-management)
9. [Technical Implementation](#technical-implementation)

---

## Game Overview

**One Is Lying** is a social deduction party game where players must identify the impostor among them. The game is designed for 3-10 players sharing a single mobile device.

### Core Concept
- All players receive the same word (the "common word"), except for one player who receives a different word (the "impostor word")
- Players take turns describing their word without revealing it
- After discussion, players vote on who they think is the impostor
- If the majority correctly identifies the impostor, the group wins; otherwise, the impostor wins

### Game Flow Summary
```
Setup → Registration → Word Reveal → Discussion → Guess → Results
```

---

## Game Modes

The game supports two distinct modes:

### 1. Auto Generated Mode
- **Purpose**: Quick setup with no word preparation needed
- **Word Source**: Pre-defined word database organized by categories
- **Categories Available**:
  - Objects: cup, table, bag, shoe, phone, book, chair, lamp, pen, key, watch, glasses
  - Food: rice, burger, milk, bread, apple, pizza, cake, coffee, tea, banana, egg, fish
  - Places: school, beach, shop, park, home, kitchen, bedroom, garden, street, library, cafe, store
  - Animals: cat, dog, bird, fish, horse, cow, pig, chicken, rabbit, mouse, sheep, duck
  - Actions: sleep, eat, walk, run, jump, sit, stand, talk, read, write, play, dance

**Word Selection Process:**
1. Randomly selects one category
2. Randomly selects two different words from that category
3. One becomes the `commonWord`, the other becomes the `impostorWord`
4. Ensures words are related but distinct (same category, different words)

### 2. Custom Word Mode
- **Purpose**: Players create their own word pool
- **Word Source**: Players input words during registration
- **Requirements**:
  - Each player must provide exactly 2 words
  - Words must be different from each other
  - Minimum of 2 unique words across all players required
  - Duplicate words across players are allowed but removed from the pool

**Word Selection Process:**
1. Collect all words from all players into `wordPool`
2. Remove duplicates using `Set`
3. Shuffle the unique words
4. Select first word as `commonWord`, second as `impostorWord`
5. If only one unique word exists, it becomes both words (edge case)

---

## Player Registration Flow

The registration process uses a **two-step approach** for better user experience, especially in Custom Word mode.

### Registration State Tracking
- `currentRegistrationIndex`: Current player being registered (0-based)
- `registrationStep`: Current step for the player ('name' or 'words')

### Step 1: Name & Photo
**For All Modes:**
- Player enters their name (required)
- Optional: Take a photo using device camera
- Button: "Next"

**Validation:**
- Name must not be empty (trimmed)

**Progress Calculation:**
- Auto Mode: `(currentIndex + 1) / playerCount * 100`
- Custom Mode: `(currentIndex * 2 + 1) / (playerCount * 2) * 100`

### Step 2: Words (Custom Mode Only)
**Only in Custom Mode:**
- Player enters 2 words (both required)
- Words must be different from each other
- Button: "Next Player" or "Complete Registration" (for last player)

**Validation:**
- Both words must be non-empty
- Words must be different (case-insensitive comparison)

**Progress Calculation:**
- Custom Mode: `(currentIndex * 2 + 2) / (playerCount * 2) * 100`

### Registration Flow Diagram

```
Auto Mode:
Player 1: Name → Next → Player 2: Name → Next → ... → Complete

Custom Mode:
Player 1: Name → Next → Words → Next Player
Player 2: Name → Next → Words → Next Player
...
Player N: Name → Next → Words → Complete Registration
```

### Player Data Structure
```javascript
{
    id: number,              // Player index (0-based)
    name: string,            // Player's name
    avatar: string | null,   // Base64 image data or null
    word: string | null,     // Assigned word (set after registration)
    words: string[] | null   // Custom words [word1, word2] (Custom mode only)
}
```

---

## Word Generation & Assignment

### Word Generation

#### Auto Mode
```javascript
function generateAutoWords() {
    // 1. Select random category
    const category = WORD_CATEGORIES[Math.floor(Math.random() * WORD_CATEGORIES.length)];
    const words = SIMPLE_WORDS[category];
    
    // 2. Select two different words
    let word1Index = Math.floor(Math.random() * words.length);
    let word2Index = Math.floor(Math.random() * words.length);
    
    // 3. Ensure words are different
    while (word2Index === word1Index) {
        word2Index = Math.floor(Math.random() * words.length);
    }
    
    // 4. Assign
    gameState.commonWord = words[word1Index];
    gameState.impostorWord = words[word2Index];
}
```

#### Custom Mode
```javascript
function completeRegistration() {
    // 1. Collect all words
    gameState.wordPool = [];
    gameState.players.forEach(player => {
        if (player.words && player.words.length === 2) {
            gameState.wordPool.push(player.words[0]);
            gameState.wordPool.push(player.words[1]);
        }
    });
    
    // 2. Remove duplicates
    gameState.wordPool = [...new Set(gameState.wordPool)];
    
    // 3. Validate minimum words
    if (gameState.wordPool.length < 2) {
        showModal('Not Enough Words', 'Please enter at least 2 different words across all players.');
        return;
    }
    
    // 4. Shuffle and select
    const shuffled = [...gameState.wordPool].sort(() => Math.random() - 0.5);
    gameState.commonWord = shuffled[0];
    gameState.impostorWord = shuffled[1] || shuffled[0];
}
```

### Word Assignment

After word generation, words are assigned to players:

```javascript
// 1. Randomly select impostor
const impostorIndex = Math.floor(Math.random() * gameState.playerCount);
gameState.impostorPlayerIndex = impostorIndex;

// 2. Assign words
gameState.players.forEach((player, index) => {
    if (index === impostorIndex) {
        player.word = gameState.impostorWord;  // Impostor gets different word
    } else {
        player.word = gameState.commonWord;    // Others get same word
    }
});
```

**Key Points:**
- Impostor selection is uniformly random
- Exactly one player receives the impostor word
- All other players receive the common word
- Assignment happens after all players are registered
- Players don't know who the impostor is until results

---

## Game Phases

The game progresses through 6 distinct phases:

### Phase 1: Setup
**Purpose**: Initial game configuration

**Actions:**
- Select number of players (3-10)
- Choose game mode (Auto Generated or Custom Word)
- Click "Start Game"

**State Changes:**
- Sets `gameState.playerCount`
- Sets `gameState.gameMode`
- If Auto mode: Generates words immediately
- If Custom mode: Proceeds to registration

### Phase 2: Registration
**Purpose**: Collect player information

**Actions:**
- Enter name and photo (Step 1)
- Enter words if Custom mode (Step 2)
- Progress through all players

**State Changes:**
- Creates player objects in `gameState.players[]`
- Tracks `currentRegistrationIndex` and `registrationStep`
- Collects words into `wordPool` (Custom mode)

**Completion:**
- All players registered
- Words generated and assigned
- Impostor randomly selected
- Proceeds to Word Reveal phase

### Phase 3: Word Reveal
**Purpose**: Players privately view their assigned word

**Actions:**
- Each player clicks their name/avatar
- Word is displayed in full-screen overlay
- Player confirms they've seen their word
- "Pass device" message shown briefly
- Device passed to next player

**State Tracking:**
- `revealedPlayers`: Set of player indices who have seen their word
- Prevents re-viewing (button becomes disabled)

**Completion:**
- All players have viewed their words (`revealedPlayers.size === playerCount`)
- Automatically proceeds to Discussion phase

**UI Features:**
- Grid layout adapts to player count
- Revealed players are visually marked
- Smooth overlay transitions

### Phase 4: Discussion
**Purpose**: Players describe their words without revealing them

**Actions:**
- Timer starts automatically (unlimited, but shows elapsed time)
- Players take turns describing their word
- No input required - discussion happens verbally
- Click "Guess Who Is Lying" when ready

**Timer System:**
- Starts when phase begins
- Updates every second
- Displays as MM:SS format
- Visual warning after 2 minutes (red color)
- Stops when moving to Guess phase

**State:**
- `timerStart`: Timestamp when timer started
- `timerInterval`: Interval ID for updates

### Phase 5: Guess
**Purpose**: Players vote on who they think is the impostor

**Actions:**
- View all players in grid
- Select one player as suspected impostor
- Confirm selection
- Selection is stored in `gameState.selectedImpostor`

**Validation:**
- Must select a player before confirming
- Confirm button disabled until selection made

**State:**
- `selectedImpostor`: Index of selected player (null initially)

### Phase 6: Results
**Purpose**: Reveal the outcome and show game summary

**Actions:**
- Display win/lose message
- Show all players with their roles
- Reveal impostor's word
- Show both common and impostor words
- Options: Play Again, Change Words, New Game, Exit Game

**Win Condition:**
```javascript
const isCorrect = gameState.selectedImpostor === gameState.impostorPlayerIndex;
```

**Visual Feedback:**
- Confetti animations (more for wins)
- Color-coded player cards:
  - Impostor (if guessed correctly): Red/Loser styling
  - Impostor (if not guessed): Green/Winner styling
  - Other players: Neutral styling

---

## Impostor System

### Impostor Selection
- **Method**: Uniform random selection
- **Timing**: After all players are registered
- **Storage**: `gameState.impostorPlayerIndex` (0-based index)
- **Secrecy**: Hidden from all players until Results phase

### Word Distribution
```
Example with 4 players:
Player 0: commonWord
Player 1: commonWord
Player 2: impostorWord  ← Impostor (randomly selected)
Player 3: commonWord
```

### Impostor's Challenge
- Receives a different word than everyone else
- Must describe it in a way that matches others' descriptions
- Goal: Avoid detection during discussion
- Wins if: Not correctly identified in Guess phase

### Other Players' Challenge
- All receive the same word
- Must identify who is describing something different
- Goal: Detect inconsistencies in descriptions
- Win if: Correctly identify the impostor

---

## Winning Conditions

### Group Wins (Impostor Loses)
**Condition:**
```javascript
gameState.selectedImpostor === gameState.impostorPlayerIndex
```

**Result:**
- "You Found the Impostor!" message
- Impostor card styled as loser (red)
- Grand confetti celebration
- Success sound effect

### Impostor Wins (Group Loses)
**Condition:**
```javascript
gameState.selectedImpostor !== gameState.impostorPlayerIndex
```

**Result:**
- "The Impostor Won!" message
- Impostor card styled as winner (green)
- Standard confetti
- Lose sound effect

**Edge Cases:**
- If `selectedImpostor` is `null` (shouldn't happen due to validation)
- Treated as incorrect guess

---

## State Management

### Game State Object
```javascript
const gameState = {
    // Configuration
    playerCount: 4,                    // Number of players (3-10)
    gameMode: null,                   // 'auto' or 'custom'
    
    // Words
    wordPool: [],                      // All words collected (Custom mode)
    commonWord: null,                  // Word assigned to non-impostors
    impostorWord: null,               // Word assigned to impostor
    
    // Players
    players: [],                       // Array of player objects
    currentRegistrationIndex: 0,      // Current player being registered
    registrationStep: 'name',          // 'name' or 'words'
    impostorPlayerIndex: null,         // Index of impostor player
    
    // Game Progress
    revealedPlayers: new Set(),        // Indices of players who saw their word
    selectedImpostor: null,           // Index of selected impostor (Guess phase)
    
    // Timer
    timerStart: null,                  // Timestamp when discussion started
    timerInterval: null               // Interval ID for timer updates
};
```

### State Transitions

#### Initialization
```
playerCount: 4
gameMode: null
players: []
→ User selects mode and count
```

#### Registration
```
gameMode: 'custom'
players: [] (empty)
currentRegistrationIndex: 0
registrationStep: 'name'
→ Player 1 enters name
→ registrationStep: 'words'
→ Player 1 enters words
→ currentRegistrationIndex: 1
→ ... (repeat)
```

#### Word Assignment
```
players: [all registered]
commonWord: null
impostorWord: null
→ completeRegistration()
→ commonWord: "cup"
impostorWord: "glass"
impostorPlayerIndex: 2 (random)
→ All players assigned words
```

#### Word Reveal
```
revealedPlayers: Set()
→ Player clicks name
→ revealedPlayers: Set([0])
→ ... (all players)
→ revealedPlayers.size === playerCount
→ Proceed to Discussion
```

#### Discussion
```
timerStart: null
→ startDiscussionPhase()
→ timerStart: Date.now()
→ Timer updates every second
```

#### Guess
```
selectedImpostor: null
→ Player selects impostor
→ selectedImpostor: 2
→ confirmGuessFn()
→ Check: selectedImpostor === impostorPlayerIndex
```

#### Results
```
→ Show win/lose based on comparison
→ Display all information
→ Reset options available
```

### State Reset Functions

#### `changeSettings()`
Resets to initial setup:
- Clears all game data
- Resets player count to 4
- Clears game mode
- Returns to Setup phase

#### `playAgainFn()`
Starts new round with same players:
- Keeps players and words
- Reshuffles word assignment
- Reselects impostor
- Returns to Word Reveal phase

#### `changeWordsFn()`
Keeps players, changes words:
- Clears word assignments
- Returns to Registration (Custom mode) or generates new words (Auto mode)

---

## Technical Implementation

### Phase Management

**Function: `showPhase(phaseName)`**
- Manages visibility of game phases
- Sets `aria-hidden` for accessibility
- Uses `inert` attribute for inactive phases
- Ensures active phase is accessible before deactivating others

**Phases:**
- `setup`: Initial configuration
- `registration`: Player registration
- `wordReveal`: Word viewing
- `discussion`: Discussion phase
- `guess`: Impostor selection
- `result`: Results display

### Validation System

**Registration Validation:**
```javascript
// Step 1: Name validation
isValid = player.name.trim() !== '';

// Step 2: Words validation (Custom mode)
hasWords = player.words.length === 2 && 
           player.words[0] !== '' && 
           player.words[1] !== '';
wordsDifferent = player.words[0] !== player.words[1];
isValid = hasWords && wordsDifferent;
```

**Guess Validation:**
- Must select a player before confirming
- Button disabled until selection made

### Error Handling

**Word Generation Errors:**
- Fallback to default words if generation fails
- Validation ensures minimum word requirements

**Camera Errors:**
- Graceful degradation if camera unavailable
- Game continues without photos

**Sound Errors:**
- Silent failures
- Game continues without sound

### Accessibility Features

- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Proper `aria-hidden` usage
- `inert` attribute for inactive content

### Performance Optimizations

- DOM element caching
- Efficient state updates
- Minimal re-renders
- Lazy sound loading
- Confetti element pooling

---

## Game Flow Diagram

```
┌─────────┐
│ Setup  │
└───┬─────┘
    │
    ├─ Auto Mode ──────────────┐
    │                           │
    └─ Custom Mode              │
        │                       │
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│ Registration │        │ Word Reveal   │
│  (2 steps)   │───────▶│  (per player) │
└──────────────┘        └───────┬───────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │ Discussion   │
                          │   (Timer)    │
                          └───────┬───────┘
                                  │
                                  ▼
                           ┌──────────────┐
                           │    Guess     │
                           │  (Select)    │
                           └───────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │   Results    │
                            │ (Win/Lose)   │
                            └──────────────┘
```

---

## Edge Cases & Special Scenarios

### Minimum Players (3)
- Works normally
- Impostor has 2 players to fool

### Maximum Players (10)
- All phases adapt layout
- Grid systems adjust columns
- Progress tracking handles large groups

### Duplicate Words (Custom Mode)
- Duplicates removed from word pool
- If all words are duplicates, validation fails
- Minimum 2 unique words required

### Single Unique Word (Custom Mode)
- Edge case: Only 1 unique word after deduplication
- Both `commonWord` and `impostorWord` set to same word
- Game still playable but less interesting

### Camera Unavailable
- Game continues without photos
- Placeholder avatar shown
- No impact on gameplay

### Timer Overflow
- Timer continues indefinitely
- Visual warning after 2 minutes
- No maximum limit

### All Players Revealed
- Automatic transition to Discussion
- No manual trigger needed

---

## Future Enhancements (Potential)

1. **Multiple Impostors**: Support for 2+ impostors in larger games
2. **Word Categories**: Let players choose category in Auto mode
3. **Custom Categories**: Allow custom word categories
4. **Timer Limits**: Optional time limits for discussion
5. **Score Tracking**: Track wins/losses across multiple rounds
6. **Player Profiles**: Save player data between games
7. **Word History**: Remember previously used words
8. **Difficulty Levels**: Adjust word complexity

---

## Version History

- **v1.0.2**: Two-step registration process (name/photo → words)
- **v1.0.1**: Accessibility fixes (aria-hidden, inert attributes)
- **v1.0.0**: Production release with full game logic

---

*Last Updated: 2025-12-30*

