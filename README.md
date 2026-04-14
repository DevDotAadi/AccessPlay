# AccessPlay: Accessible Game Design Research

## Project Context
AccessPlay is a research artifact demonstrating accessible-first game design for persons with motor impairments. Developed as a showcase for inclusive digital environments.

## Research Question
Can a compelling, replayable game experience be designed from the ground up using only minimal-input interaction models (keyboard/single-switch), without retrofitting accessibility as an afterthought?

## Target User
Adults and teenagers with motor impairments (cerebral palsy, Parkinson's, SCI, ALS) who:
- **Can** press individual keys, operate single-switch input, use eye-gaze
- **Cannot** operate mouse with precision, perform rapid multi-key input, react to time pressure < 2 seconds

## Core Design Constraints (Non-negotiable)
✅ **Zero mouse dependency** — 100% playable keyboard-only.
✅ **Single-switch compatible** — scan mode with one-button confirmation.
✅ **No time pressure** — all turn-based mechanics.
✅ **WCAG 2.1 AA compliant** — 4.5:1 contrast ratios.
✅ **Screen reader compatible** — ARIA live regions for every action.
✅ **Zero Flashing** — photosensitive-safe.
✅ **Large targets** — minimum 80x80px interactive zones.
✅ **Persistent focus visibility** — distinct, high-contrast outlines.

## Game Mechanics
**Colour Sort Puzzle:** A scalable grid of coloured tiles. Players must swap tiles to sort them into columns matching the target pattern.

**Why this mechanic for accessibility?**
- No speed requirement or "Game Over" based on time.
- Spatial reasoning is accessible across varying cognitive profiles.
- Minimal input overhead (Select A -> Select B).
- Difficulty scales logically (grid size and color count).

## Interaction Models

### Standard Keyboard Mode
- **Arrow Keys**: Navigate focus between tiles.
- **Enter/Space**: Select a tile or swap with the currently selected one.
- **Escape**: Deselect the current tile.
- **R**: Restart game.
- **H**: Toggle High Contrast mode.
- **S**: Toggle Single-Switch Scan Mode.

### Single-Switch Scan Mode
- Focus auto-cycles through tiles at a customizable interval (default 1.5s).
- **Space Bar / Switch**: Press once to select, press again on a different tile to swap.
- **On-screen Speed Control**: Adjust the rhythm to match user comfort.

## Accessibility Features

| Feature | Implementation |
|---------|-----------------|
| Keyboard Navigation | Full focus traversal, no mouse required. |
| Screen Reader Support | ARIA live regions announce tile color, shape, and position. |
| High Contrast Mode | Pure black/white/yellow palette for maximum visibility. |
| Focus Indicators | 3px solid outlines with high-contrast offsets. |
| Font Scaling | All sizes in `rem` units, respects browser zoom settings. |
| Colour-Blind Safe | Tiles use color + shape + internal patterns. |
| Large Targets | 7rem tiles (approx 112px) exceed minimum requirements. |

## Technical Stack
- **Frontend**: Vanilla HTML/CSS/JS (Zero dependencies for max compatibility).
- **Audio**: Web Audio API for synthesized feedback.
- **Persistence**: LocalStorage for best scores and player stats.

## File Structure
- `index.html`: Semantic structure and ARIA landmarks.
- `style.css`: Apple-Style Monochrome design system and responsive grid.
- `game.js`: Core engine, accessibility handlers, and win-state logic.

## References
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Accessible Games Resource](https://accessible.games/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---
*Created for research purposes in Accessible Digital Environments.*
