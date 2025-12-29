# One Is Lying

A mobile-first web app game where players must figure out who is lying based on word descriptions. Perfect for friends sharing one device!

## 🎮 How to Play

1. **Setup**: Choose the number of players (3-10) and game mode (Custom Word or Auto Generated)
2. **Word Input** (Custom mode): Each player enters 2 words
3. **Registration**: Each player enters their name and optionally takes a photo
4. **Word Reveal**: Players take turns clicking their name to see their assigned word privately
5. **Discussion**: Players describe their words without revealing them
6. **Guess**: The group selects who they think is the impostor
7. **Results**: See if you caught the impostor!

## 🚀 Quick Start

1. Open `index.html` in a modern web browser
2. No installation or build process required
3. Works best on mobile devices (iOS Safari, Chrome Mobile)
4. For camera features, ensure HTTPS or localhost

## 📱 Features

- **Mobile-First Design**: Optimized for phone screens
- **Camera Integration**: Take photos for player avatars
- **Privacy Flow**: Words revealed one at a time to prevent spoilers
- **Auto Word Generation**: Uses Random Word API for automatic word selection
- **Custom Words**: Enter your own word pool
- **Session-Based**: No login required, state resets on refresh
- **Smooth Animations**: Celebrations and shake effects for results

## 🛠️ Technical Details

- **Pure JavaScript**: No frameworks or build tools
- **CSS Animations**: Lightweight, performant animations
- **Camera API**: Uses `getUserMedia` for photo capture
- **Local Storage**: Session-based state (cleared on refresh)
- **Responsive Design**: Works on desktop and mobile

## 🌐 Browser Support

- Chrome/Edge (recommended)
- Safari (iOS 11+)
- Firefox
- Requires camera permissions for photo feature

## 📝 Game Modes

### Custom Word Mode
- Each player enters 2 words
- System randomly selects 1 common word and 1 impostor word
- One player gets the impostor word, others get the common word

### Auto Generated Mode
- System fetches random words from API
- Automatically assigns common and impostor words
- No input required

## 🎯 Game Flow

```
Setup → Word Input/Generation → Registration → Word Reveal → Discussion → Guess → Results
```

## 🔧 Troubleshooting

- **Camera not working**: Ensure HTTPS or use localhost. Grant camera permissions when prompted.
- **Words not generating**: Check internet connection for Auto Generated mode
- **Game resets**: This is by design - state is session-based and clears on refresh

## 📄 License

See LICENSE file for details.

---

Enjoy playing **One Is Lying**! 🎭
