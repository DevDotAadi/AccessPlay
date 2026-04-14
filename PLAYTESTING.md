# AccessPlay: Playtesting & Iteration Log

## Test Session 1: Standard Keyboard Navigation
**Observation**: Users found the "selected" state very clear, but needed a way to clear selection.
**Iteration**: Added the `Escape` key to deselect and clear focus.

## Test Session 2: Scan Mode Timing
**Observation**: 1.5 seconds per tile was too fast for some motor profiles but too slow for others.
**Iteration**: Added a range slider and keyboard shortcuts (+/-) to dynamically adjust scan speed.

## Test Session 3: Screen Reader Interaction
**Observation**: Redundant announcements were slowing down gameplay.
**Iteration**: Shortened aria-labels to focus on vital info (Color + Shape) rather than full sentences on every move.

## Test Session 4: Visual Contrast
**Observation**: Liquid glass panels were beautiful but hard to distinguish from the dark void in pure dark mode.
**Iteration**: Added 0.5px solid borders and inner glows to distinctify active panels.

## Test Session 5: Hard Mode Complexity
**Observation**: Hard mode was just a larger grid, not necessarily more "difficult" in logic.
**Iteration**: Implemented a "Target Pattern" requirement for Hard Mode, requiring spatial planning rather than simple color grouping.

---
**Latest Version**: 1.2 (Apple Monochrome Pop)
