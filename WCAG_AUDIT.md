# AccessPlay: WCAG 2.1 AA Compliance Audit

## Executive Summary
AccessPlay achieves WCAG 2.1 Level AA compliance across all criteria relevant to web-based games. This audit documents testing methodology and results.

## 1. Perceivable

### 1.4 Distinguishable

**1.4.3 Contrast (Minimum) — Level AA**
✅ **PASS**
- All foreground/background pairs meet 4.5:1 ratio minimum.
- High Contrast Mode provides a 21:1 ratio (White on Black).
- Interactive shapes use high-chroma colors with specific brightness levels.

**1.4.11 Non-Text Contrast — Level AA**
✅ **PASS**
- Focus indicators (outlined borders) exceed 3:1 contrast requirements.
- Tile shapes are distinguishable by form + color + internal pattern.

## 2. Operable

### 2.1 Keyboard Accessible — Level A
✅ **PASS**
- 100% of game functionality is accessible via keyboard.
- Logical focus order from top-left to bottom-right.
- "Scan Mode" allows full operation with a single key (Space).

**Keyboard Mapping:**
| Key | Action |
|-----|--------|
| Arrows | Navigate |
| Space/Enter | Select/Swap |
| Escape | Deselect |
| S | Toggle Scan |
| H | Toggle High Contrast |
| R | Restart |

### 2.4 Navigable — Level AA
✅ **PASS**
- **2.4.7 Focus Visible**: 3px solid white/yellow focus ring is always present.
- **2.4.3 Focus Order**: Linear and predictable.

## 3. Understandable

### 3.3 Input Assistance — Level A
✅ **PASS**
- ARIA live regions announce every movement and state change.
- No "Game Over" or time-loss conditions prevent user understanding.

## 4. Robust

### 4.1.3 Status Messages — Level AA
✅ **PASS**
- Win stats, move counts, and selection states are piped to an assertive ARIA live region.

## 5. Screen Reader Testing
- **NVDA/VoiceOver**: Tested. Title, instructions, and grid interactions are announced clearly.
- **Announcement Example**: "At Row 2, Column 1: Red Circle."

## 6. Colour-Blind Safety
- **Method**: Tested with Protanopia/Deuteranopia simulations.
- **Result**: Shapes (Triangle, Circle, Diamond, Square) provide redundant identification alongside color.

---
**Audit Date:** April 15, 2026
**Compliance Level:** WCAG 2.1 AA
