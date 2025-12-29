# Design Documentation - One Is Lying

## Design Philosophy

This game has been redesigned to feel like a **premium party game** - polished, playful, and visually stunning. The design prioritizes:

1. **Mobile-First**: Every interaction is optimized for touch
2. **Bright & Cheerful**: Pastel color palette creates a fun, social atmosphere
3. **Premium Polish**: Smooth animations, sound effects, and visual feedback
4. **Zero Learning Curve**: Intuitive UI that anyone can understand instantly

## Color Palette

### Primary Colors
- **Soft Purple** (#B8A9E8) - Primary accent, buttons, borders
- **Sky Blue** (#A8D5E2) - Secondary elements, inputs
- **Mint Green** (#B5E5CF) - Success states, cards
- **Peach** (#FFD4B3) - Warm accents, inputs
- **Warm Yellow** (#FFE5A0) - Highlights, timer
- **Coral** (#FFB3BA) - Accent elements
- **Lavender** (#E8D5FF) - Soft backgrounds

### Gradients
- **Background Gradient 1**: Yellow → Peach → Purple (warm, inviting)
- **Background Gradient 2**: Blue → Green → Lavender (cool, calm)
- **Background Gradient 3**: Coral → Peach → Yellow (energetic)

### Text Colors
- **Dark** (#2D3748) - Primary text (high contrast on light backgrounds)
- **Medium** (#4A5568) - Secondary text
- **Light** (#718096) - Tertiary text

## Typography

- **Font Family**: System fonts with Nunito as fallback
- **Headings**: Bold (700-800 weight), rounded feel
- **Body**: Medium weight (500-600), highly readable
- **Sizes**: Large for mobile (1.1rem+ for body, 2rem+ for headings)

## Key Design Elements

### 1. Animated Background
- Floating gradient shapes that slowly animate
- Creates depth without distraction
- Subtle parallax effect

### 2. Button Design
- **Primary Buttons**: Gradient backgrounds (purple to pink)
- **Ripple Effect**: Expanding circle on hover/click
- **Bounce Animation**: Slight scale on interaction
- **Shadow**: Layered shadows for depth

### 3. Cards & Containers
- White backgrounds with colored borders
- Soft shadows for elevation
- Hover effects (lift and glow)
- Smooth transitions

### 4. Logo Integration
- Logo appears on key screens (setup, discussion, results)
- Floating animation for attention
- Consistent sizing and placement

### 5. Sound System
- Toggle button in top-right corner
- Sound effects for:
  - Button clicks
  - Word reveals
  - Win/lose states
  - Success confirmations
- Graceful fallback if files missing

### 6. Animations

#### Entrance Animations
- **fadeInUp**: Smooth slide-in from bottom
- **slideIn**: Cards slide in from left
- **wordReveal**: Bounce and rotate for word display

#### Interaction Animations
- **pulse**: Subtle breathing effect for avatars
- **timerPulse**: Timer scale animation
- **celebrate**: Win state celebration
- **shake**: Lose state shake effect

#### Confetti System
- 50 colored particles
- Random colors from palette
- Falls from top with rotation
- Auto-cleanup after animation

## Screen-Specific Design

### Setup Screen
- Large logo with floating animation
- Gradient title text
- Number input with large, friendly buttons
- Mode selector with ripple effects
- "Start Game" button with gradient

### Registration Screen
- One player at a time (clean, focused)
- Avatar with pulse animation
- Camera button with gradient
- Word inputs (custom mode) with focus glow
- "Next Player" / "Complete Registration" button

### Word Reveal Screen
- Full-screen gradient overlay
- Large, bold word display
- Bounce-in animation
- "OK, I Got It" button

### Discussion Screen
- Floating timer with pulse
- Player cards with hover effects
- Logo for branding
- Clear instruction text

### Guess Screen
- Selectable player cards
- Visual feedback on selection (gradient fill)
- "Confirm Guess" button

### Result Screen
- Large logo
- Win/lose animations (celebrate/shake)
- Confetti for wins
- Highlighted impostor card
- Word summary card

## Responsive Design

### Mobile (< 768px)
- Full-width containers
- Large tap targets (min 44px)
- Stacked layouts
- Optimized font sizes

### Tablet/Desktop (≥ 768px)
- Max-width containers (600px)
- Side-by-side mode buttons
- Larger logos
- More spacing

## Accessibility

- High contrast text on light backgrounds
- Large touch targets
- Clear visual feedback
- Sound toggle for audio-sensitive users
- Semantic HTML structure

## Performance

- CSS animations (hardware-accelerated)
- Lightweight sound system
- Efficient DOM updates
- No heavy libraries

## Browser Support

- Modern browsers (Chrome, Safari, Firefox, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation for older browsers

## Future Enhancements (Optional)

- Haptic feedback on mobile
- More sound effect variations
- Custom themes
- Player statistics
- Achievement system

---

**Design Goal Achieved**: This game now feels like a **premium party game** - not a student project, but a polished, professional experience that players will want to share with friends.

