# One Is Lying 🎭

**Version 1.0.0** - Production Release

A mobile-first party game web application where players must identify the impostor based on word descriptions. Perfect for friends sharing one device!

## 🎮 Overview

**One Is Lying** is a social deduction party game where one player (the impostor) receives a different word than everyone else. Through discussion, players must figure out who is lying. The game supports 3-10 players and features two game modes: Auto-Generated words and Custom word input.

## 🚀 Quick Start

### Local Development

1. **Clone or download** this repository
2. **Open `index.html`** in a modern web browser
3. **No build process required** - works out of the box!

### HTTPS / Production Setup

**Camera features require HTTPS** (or localhost for development):

- **Option 1**: Use a local server (recommended for testing)
  ```bash
  # Python 3
  python -m http.server 8000
  
  # Node.js (http-server)
  npx http-server -p 8000
  
  # PHP
  php -S localhost:8000
  ```
  Then open: `http://localhost:8000`

- **Option 2**: Deploy to any static hosting (Netlify, Vercel, GitHub Pages, etc.)
  - All hosting services provide HTTPS by default
  - Simply upload files and access via HTTPS URL

## 🎯 How to Play

### Game Flow

```
Setup → Registration → Word Reveal → Discussion → Guess → Results
```

### Step-by-Step Instructions

1. **Setup Phase**
   - Choose number of players (3-10)
   - Select game mode:
     - **Custom Word**: Each player enters 2 words
     - **Auto Generated**: System selects words automatically

2. **Registration Phase**
   - Each player enters their name
   - Optionally take a photo (camera access required)
   - In Custom mode: Enter 2 words per player

3. **Word Reveal Phase**
   - Players take turns clicking their name to see their assigned word privately
   - Pass the device to the next player after viewing
   - One player is secretly assigned a different word (the impostor)

4. **Discussion Phase**
   - All players discuss and describe their words without revealing them
   - Timer tracks discussion time
   - Try to identify inconsistencies!

5. **Guess Phase**
   - Select who you think is the impostor
   - Confirm your guess

6. **Results Phase**
   - See if you caught the impostor!
   - View all words and celebrate with confetti animations

## 📱 Features

### Core Gameplay
- **3-10 Players**: Flexible player count
- **Two Game Modes**: Custom words or auto-generated
- **Privacy Flow**: Words revealed one-at-a-time to prevent spoilers
- **Timer System**: Track discussion time with visual urgency
- **Session-Based**: No login required, perfect for party games

### Technical Features
- **Mobile-First Design**: Optimized for phone screens, no scrolling required
- **Camera Integration**: Take photos for player avatars (iOS Safari & Chrome supported)
- **Responsive Layout**: Adapts to any screen size (320px - tablets)
- **Smooth Animations**: 60fps animations with confetti celebrations
- **Accessibility**: WCAG AA compliant, keyboard navigation, screen reader support
- **Safe-Area Support**: Works with iOS notches and Android navigation bars

### Visual Design
- **Gamified UI**: Pastel gradients, glowing effects, smooth transitions
- **Grand Celebrations**: Full-screen confetti, animated result cards
- **Adaptive Grids**: Player cards adjust based on player count
- **Fluid Typography**: Text scales smoothly on all screen sizes

## 🛠️ Technical Details

### Technology Stack
- **Pure JavaScript**: No frameworks or build tools required
- **CSS3**: Modern CSS with animations, gradients, and viewport units
- **HTML5**: Semantic markup with ARIA labels for accessibility
- **Web APIs**: Camera API (`getUserMedia`), Canvas API for image processing

### Performance Optimizations
- **DOM Caching**: Frequently accessed elements cached
- **Batch Updates**: DOM updates batched for smooth 60fps animations
- **Lazy Loading**: Sounds and images loaded on demand
- **Element Pooling**: Confetti elements reused for better performance
- **RequestAnimationFrame**: Smooth animations without jank

### Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome/Edge | 90+ | Full support, recommended |
| Safari (iOS) | 11+ | Full support, camera works |
| Safari (macOS) | 11+ | Full support |
| Firefox | 88+ | Full support |
| Samsung Internet | 14+ | Full support |

**Requirements:**
- Modern browser with ES6+ support
- Camera permissions for photo feature
- HTTPS or localhost for camera access

## 📁 Project Structure

```
OneIsLying/
├── index.html          # Main HTML file
├── app.js              # Game logic and state management
├── styles.css          # All styles and animations
├── images/             # Game logo and icons
│   └── gamelogo.svg
├── sounds/             # Sound effects (optional)
│   ├── click.mp3
│   ├── reveal.mp3
│   ├── win.mp3
│   ├── lose.mp3
│   └── success.mp3
├── documentation/      # Design docs and analysis
└── README.md          # This file
```

## 🎨 Game Modes Explained

### Custom Word Mode
- Each player enters 2 words during registration
- System collects all words into a pool
- Randomly selects 1 common word and 1 impostor word from the pool
- One player gets the impostor word, others get the common word

### Auto Generated Mode
- System automatically selects words from predefined categories:
  - Objects, Food, Places, Animals, Actions
- Randomly picks 2 words from the same category
- Assigns words to players automatically

## 🎯 Game Rules & Strategy

### Objective
Identify the player who has a different word (the impostor).

### How It Works
1. All players except one receive the same word
2. One player (randomly selected) receives a different word
3. Players describe their words without revealing them
4. The group tries to identify who has the different word

### Tips
- Listen carefully to descriptions
- Watch for inconsistencies or hesitations
- The impostor must blend in while having different information
- Discussion phase is crucial - ask questions!

## 🔧 Troubleshooting

### Camera Not Working
- **Ensure HTTPS or localhost**: Camera API requires secure context
- **Grant permissions**: Allow camera access when prompted
- **Check browser support**: Use Chrome, Safari, or Firefox
- **iOS Safari**: Camera works best in full-screen mode (add to home screen)

### Game Not Loading
- Check browser console for errors
- Ensure all files are in the same directory
- Verify `index.html`, `app.js`, and `styles.css` are present

### Words Not Generating (Auto Mode)
- Auto mode uses a built-in word database (no internet required)
- If words don't appear, refresh the page

### Performance Issues
- Close other browser tabs
- Use a modern browser (Chrome 90+, Safari 11+)
- Clear browser cache if animations stutter

## 🌐 Deployment

### Static Hosting (Recommended)
Simply upload all files to:
- **Netlify**: Drag and drop, instant HTTPS
- **Vercel**: Connect GitHub repo for auto-deploy
- **GitHub Pages**: Push to `gh-pages` branch
- **Any static host**: Upload via FTP/SFTP

### Requirements
- All files must be in the same directory
- HTTPS enabled (automatic on modern hosting)
- No server-side code needed

## 🔒 Privacy & Security

- **No Data Collection**: All game state is client-side only
- **No External APIs**: Word generation uses local database
- **Camera Privacy**: Photos stored locally, never uploaded
- **Session-Based**: State clears on page refresh
- **No Tracking**: No analytics or tracking scripts

## ♿ Accessibility

### WCAG AA Compliant
- **Color Contrast**: All text meets WCAG AA standards
- **Keyboard Navigation**: Full keyboard support for all actions
- **Screen Readers**: ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators
- **Text Alternatives**: Images have alt text

### Keyboard Shortcuts
- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and cards
- **Escape**: Close modals (where applicable)

## 📝 Version History

- **v1.0.0** (2025-12-30): Production release
  - Optimized performance and accessibility
  - Enhanced mobile camera support
  - Grand celebratory result animations
  - WCAG AA compliance
  - Production-ready error handling

## 🤝 Contributing

This is a production release. For bug reports or feature requests, please open an issue in the repository.

## 📄 License

See LICENSE file for details.

## 👤 Author & Credits

**One Is Lying** - Mobile Party Game Web Application

Built with modern web technologies, optimized for mobile devices, and designed for fun party gameplay.

---

**Enjoy playing One Is Lying!** 🎭✨

For the best experience, play on a mobile device with friends!
