/**
 * AccessPlay - Core Game Engine
 * Built for IIT Delhi GAMES Lab research on accessible gaming.
 */

const CONFIG = {
    SCAN_INTERVAL: 1500, // 1.5 seconds default
    SHAPES: [
        { type: 'triangle', color: 'Green', icon: '<path d="M50 20 L85 85 L15 85 Z" stroke="currentColor" stroke-width="6" fill="currentColor" fill-opacity="0.4" stroke-linejoin="round" />' },
        { type: 'circle', color: 'Red', icon: '<circle cx="50" cy="50" r="35" stroke="currentColor" stroke-width="8" fill="currentColor" fill-opacity="0.4" />' },
        { type: 'diamond', color: 'Yellow', icon: '<path d="M50 15 L85 50 L50 85 L15 50 Z" stroke="currentColor" stroke-width="6" fill="currentColor" fill-opacity="0.4" stroke-linejoin="round" />' },
        { type: 'square', color: 'Blue', icon: '<rect x="20" y="20" width="60" height="60" rx="12" stroke="currentColor" stroke-width="8" fill="currentColor" fill-opacity="0.4" />' }
    ],
    LEVELS: {
        easy: { size: 3, colors: 3 },
        medium: { size: 4, colors: 4 },
        hard: { size: 4, colors: 4, targetPattern: true }
    }
};

class AccessPlay {
    constructor() {
        this.gameState = {
            level: 'medium',
            size: 4,
            grid: [],
            target: [],
            moves: 0,
            focusedIndex: 0,
            selectedIndex: null,
            isWon: false,
            isScanMode: false,
            isHighContrast: false,
            scanIntervalId: null
        };

        this.dom = {
            grid: document.getElementById('game-grid'),
            goal: document.getElementById('goal-pattern'),
            moves: document.getElementById('move-count'),
            status: document.getElementById('selection-status'),
            announcer: document.getElementById('announcer'),
            hcToggle: document.getElementById('toggle-hc'),
            scanToggle: document.getElementById('toggle-scan'),
            restartBtn: document.getElementById('restart-btn'),
            difficultyBtns: document.querySelectorAll('.difficulty-select button'),
            speedInput: document.getElementById('scan-speed'),
            speedVal: document.getElementById('speed-val')
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startNewGame();
    }

    setupEventListeners() {
        // Keyboard Controls
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // UI Button Controls
        this.dom.hcToggle.addEventListener('click', () => this.toggleHighContrast());
        this.dom.scanToggle.addEventListener('click', () => this.toggleScanMode());
        this.dom.restartBtn.addEventListener('click', () => this.startNewGame());

        this.dom.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const level = btn.getAttribute('data-level');
                this.changeDifficulty(level);
            });
        });

        this.dom.speedInput.addEventListener('input', (e) => {
            const speed = e.target.value;
            this.dom.speedVal.textContent = speed;
            CONFIG.SCAN_INTERVAL = parseFloat(speed) * 1000;
            if (this.gameState.isScanMode) this.restartScan();
            this.announce(`Scan interval set to ${speed} seconds`);
        });

        // Click interaction
        this.dom.grid.addEventListener('click', (e) => {
            const tile = e.target.closest('.tile');
            if (tile && !this.gameState.isWon) {
                const index = parseInt(tile.dataset.index);
                this.handleTileAction(index);
            }
        });
    }

    startNewGame() {
        const config = CONFIG.LEVELS[this.gameState.level];
        this.gameState.size = config.size;
        this.gameState.moves = 0;
        this.gameState.selectedIndex = null;
        this.gameState.focusedIndex = 0;
        this.gameState.isWon = false;
        
        this.generateGrid(config);
        this.render();
        this.announce(`New ${this.gameState.level} game started. Grid size ${this.gameState.size} by ${this.gameState.size}.`);
        
        if (this.gameState.isScanMode) this.restartScan();
    }

    generateGrid(config) {
        const { size, colors } = config;
        const totalTiles = size * size;
        const tilesPerColor = Math.floor(totalTiles / colors);
        
        let pool = [];
        for (let i = 0; i < colors; i++) {
            const shape = CONFIG.SHAPES[i];
            for (let j = 0; j < tilesPerColor; j++) {
                pool.push({ ...shape });
            }
        }

        while (pool.length < totalTiles) {
            pool.push({ ...CONFIG.SHAPES[0] });
        }

        if (this.gameState.level === 'hard') {
            this.gameState.target = [...pool].sort((a, b) => a.color.localeCompare(b.color));
        } else {
            this.gameState.target = [...pool];
        }
        
        this.gameState.grid = this.shuffle([...pool]);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    handleKeyDown(e) {
        if (this.gameState.isWon) return;

        const { size, focusedIndex } = this.gameState;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.moveFocus(focusedIndex - size);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.moveFocus(focusedIndex + size);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.moveFocus(focusedIndex - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.moveFocus(focusedIndex + 1);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.handleTileAction(focusedIndex);
                break;
            case 'Escape':
                this.deselectTile();
                break;
            case 'h':
            case 'H':
                this.toggleHighContrast();
                break;
            case 's':
            case 'S':
                this.toggleScanMode();
                break;
            case 'r':
            case 'R':
                this.startNewGame();
                break;
        }
    }

    moveFocus(newIndex) {
        if (this.gameState.isScanMode) return;
        const max = this.gameState.size * this.gameState.size;
        if (newIndex < 0) newIndex = max + newIndex;
        if (newIndex >= max) newIndex = newIndex - max;
        this.gameState.focusedIndex = newIndex;
        this.render();
        this.announceFocus();
    }

    handleTileAction(index) {
        if (this.gameState.selectedIndex === null) {
            this.gameState.selectedIndex = index;
            const tile = this.gameState.grid[index];
            this.announce(`Selected ${tile.color} ${tile.type} at ${this.getPosText(index)}`);
        } else if (this.gameState.selectedIndex === index) {
            this.deselectTile();
        } else {
            this.swapTiles(this.gameState.selectedIndex, index);
        }
        this.render();
    }

    swapTiles(idx1, idx2) {
        const temp = this.gameState.grid[idx1];
        this.gameState.grid[idx1] = this.gameState.grid[idx2];
        this.gameState.grid[idx2] = temp;
        this.gameState.moves++;
        this.gameState.selectedIndex = null;
        this.checkWin();
        const t = this.gameState.grid[idx2];
        this.announce(`Swapped. Moves: ${this.gameState.moves}. Focused on ${t.color} ${t.type}.`);
    }

    deselectTile() {
        if (this.gameState.selectedIndex !== null) {
            this.gameState.selectedIndex = null;
            this.announce("Selection cleared");
            this.render();
        }
    }

    checkWin() {
        const size = this.gameState.size;
        let isWon = true;

        if (this.gameState.level === 'hard') {
            for (let i = 0; i < this.gameState.grid.length; i++) {
                if (this.gameState.grid[i].color !== this.gameState.target[i].color) {
                    isWon = false;
                    break;
                }
            }
        } else {
            for (let r = 0; r < size; r++) {
                const firstColor = this.gameState.grid[r * size].color;
                for (let c = 1; c < size; c++) {
                    if (this.gameState.grid[r * size + c].color !== firstColor) {
                        isWon = false; break;
                    }
                }
                if (!isWon) break;
            }
        }

        if (isWon) {
            this.gameState.isWon = true;
            this.announce(`Congratulations! Puzzle complete in ${this.gameState.moves} moves.`);
        }
    }

    announce(msg) {
        this.dom.announcer.textContent = "";
        setTimeout(() => { this.dom.announcer.textContent = msg; }, 50);
    }

    announceFocus() {
        const tile = this.gameState.grid[this.gameState.focusedIndex];
        this.announce(`At ${this.getPosText(this.gameState.focusedIndex)}: ${tile.color} ${tile.type}`);
    }

    getPosText(idx) {
        return `Row ${Math.floor(idx / this.gameState.size) + 1}, Column ${(idx % this.gameState.size) + 1}`;
    }

    toggleHighContrast() {
        this.gameState.isHighContrast = !this.gameState.isHighContrast;
        document.body.classList.toggle('high-contrast', this.gameState.isHighContrast);
        this.dom.hcToggle.setAttribute('aria-pressed', this.gameState.isHighContrast);
        this.announce(`High contrast ${this.gameState.isHighContrast ? 'on' : 'off'}`);
    }

    toggleScanMode() {
        this.gameState.isScanMode = !this.gameState.isScanMode;
        this.dom.scanToggle.setAttribute('aria-pressed', this.gameState.isScanMode);
        if (this.gameState.isScanMode) {
            this.announce("Scan active. Space to select.");
            this.restartScan();
        } else {
            clearInterval(this.gameState.scanIntervalId);
            this.announce("Scan inactive.");
        }
    }

    restartScan() {
        clearInterval(this.gameState.scanIntervalId);
        this.gameState.scanIntervalId = setInterval(() => {
            const max = this.gameState.size * this.gameState.size;
            this.gameState.focusedIndex = (this.gameState.focusedIndex + 1) % max;
            this.render();
        }, CONFIG.SCAN_INTERVAL);
    }

    changeDifficulty(level) {
        this.gameState.level = level;
        this.dom.difficultyBtns.forEach(btn => btn.setAttribute('aria-checked', btn.dataset.level === level));
        this.startNewGame();
    }

    render() {
        this.dom.grid.innerHTML = '';
        this.dom.grid.setAttribute('data-size', this.gameState.size);
        this.gameState.grid.forEach((tile, index) => {
            const el = document.createElement('div');
            el.className = `tile ${index === this.gameState.focusedIndex ? 'is-focused' : ''} ${index === this.gameState.selectedIndex ? 'is-selected' : ''}`;
            el.dataset.index = index;
            el.setAttribute('role', 'gridcell');
            el.setAttribute('aria-label', `${tile.color} ${tile.type} at ${this.getPosText(index)}`);
            el.innerHTML = `<svg viewBox="0 0 100 100" class="shape-${tile.type}">${tile.icon}</svg>`;
            this.dom.grid.appendChild(el);
        });

        this.dom.goal.innerHTML = '';
        [...new Set(this.gameState.grid.map(t => t.color))].forEach(color => {
            const s = CONFIG.SHAPES.find(sh => sh.color === color);
            const item = document.createElement('div');
            item.className = 'goal-item';
            item.innerHTML = `<svg viewBox="0 0 100 100" class="shape-${s.type}">${s.icon}</svg>`;
            this.dom.goal.appendChild(item);
        });

        this.dom.moves.textContent = this.gameState.moves;
        this.dom.status.textContent = this.gameState.selectedIndex !== null ? `Selected: ${this.gameState.grid[this.gameState.selectedIndex].color}` : 'Selected: None';
    }
}

window.addEventListener('DOMContentLoaded', () => { window.game = new AccessPlay(); });
