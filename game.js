/**
 * AccessPlay - Core Game Engine
 * Built for IIT Delhi GAMES Lab research on accessible gaming.
 */

const CONFIG = {
    SCAN_INTERVAL: 1500,
    STORAGE_KEY: 'accessplay_stats',
    SHAPES: [
        { 
            type: 'triangle', 
            color: 'Green', 
            icon: '<path d="M50 20 L85 85 L15 85 Z" stroke="currentColor" stroke-width="6" fill="currentColor" fill-opacity="0.4" stroke-linejoin="round" />',
            pattern: '<defs><pattern id="p-triangle" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" stroke-opacity="0.2" /></pattern></defs><rect width="100" height="100" fill="url(#p-triangle)" />'
        },
        { 
            type: 'circle', 
            color: 'Red', 
            icon: '<circle cx="50" cy="50" r="35" stroke="currentColor" stroke-width="8" fill="currentColor" fill-opacity="0.4" />',
            pattern: '<defs><pattern id="p-circle" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.5" fill="currentColor" fill-opacity="0.2" /></pattern></defs><rect width="100" height="100" fill="url(#p-circle)" />'
        },
        { 
            type: 'diamond', 
            color: 'Yellow', 
            icon: '<path d="M50 15 L85 50 L50 85 L15 50 Z" stroke="currentColor" stroke-width="6" fill="currentColor" fill-opacity="0.4" stroke-linejoin="round" />',
            pattern: '<defs><pattern id="p-diamond" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 5 L5 0 L10 5 L5 10 Z" fill="currentColor" fill-opacity="0.2" /></pattern></defs><rect width="100" height="100" fill="url(#p-diamond)" />'
        },
        { 
            type: 'square', 
            color: 'Blue', 
            icon: '<rect x="20" y="20" width="60" height="60" rx="12" stroke="currentColor" stroke-width="8" fill="currentColor" fill-opacity="0.4" />',
            pattern: '<defs><pattern id="p-square" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="6" height="6" fill="currentColor" fill-opacity="0.2" /></pattern></defs><rect width="100" height="100" fill="url(#p-square)" />'
        }
    ],
    LEVELS: {
        easy: { size: 3, colors: 3, label: 'Easy' },
        medium: { size: 4, colors: 4, label: 'Medium' },
        hard: { size: 4, colors: 4, label: 'Hard (Pattern)' }
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

        this.audio = {
            context: null,
            enabled: true
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
            speedVal: document.getElementById('speed-val'),
            audioToggle: document.getElementById('toggle-audio'),
            statsContainer: document.getElementById('game-stats'),
            winScreen: document.getElementById('win-screen'),
            finalMoves: document.getElementById('final-moves'),
            nextLevelBtn: document.getElementById('next-level-btn'),
            replayBtn: document.getElementById('replay-btn'),
            exitBtn: document.getElementById('exit-btn')
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStats();
        this.startNewGame();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.dom.hcToggle.addEventListener('click', () => this.toggleHighContrast());
        this.dom.scanToggle.addEventListener('click', () => this.toggleScanMode());
        this.dom.restartBtn.addEventListener('click', () => this.startNewGame());
        this.dom.audioToggle.addEventListener('change', (e) => this.audio.enabled = e.target.checked);

        this.dom.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => this.changeDifficulty(btn.dataset.level));
        });

        this.dom.speedInput.addEventListener('input', (e) => {
            const speed = e.target.value;
            this.dom.speedVal.textContent = speed;
            CONFIG.SCAN_INTERVAL = parseFloat(speed) * 1000;
            if (this.gameState.isScanMode) this.restartScan();
        });

        this.dom.nextLevelBtn.addEventListener('click', () => this.handleNextLevel());
        this.dom.replayBtn.addEventListener('click', () => this.startNewGame());
        this.dom.exitBtn.addEventListener('click', () => {
            this.closeWinScreen();
            this.changeDifficulty('easy');
        });

        this.dom.grid.addEventListener('click', (e) => {
            const tile = e.target.closest('.tile');
            if (tile && !this.gameState.isWon) this.handleTileAction(parseInt(tile.dataset.index));
        });
    }

    startNewGame() {
        this.closeWinScreen();
        const config = CONFIG.LEVELS[this.gameState.level];
        this.gameState.size = config.size;
        this.gameState.moves = 0;
        this.gameState.selectedIndex = null;
        this.gameState.focusedIndex = 0;
        this.gameState.isWon = false;
        
        this.generateGrid(config);
        this.render();
        this.announce(`New ${config.label} game started.`);
        if (this.gameState.isScanMode) this.restartScan();
    }

    generateGrid(config) {
        const { size, colors } = config;
        const total = size * size;
        const levelShapes = CONFIG.SHAPES.slice(0, colors);
        
        this.gameState.target = new Array(total);
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                this.gameState.target[r * size + c] = { ...levelShapes[c % colors] };
            }
        }
        this.gameState.grid = this.shuffle([...this.gameState.target]);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    handleKeyDown(e) {
        if (this.gameState.isWon || (this.gameState.isScanMode && ![' ', 'Enter', 's', 'S', 'h', 'H', 'r', 'R'].includes(e.key))) return;

        const { size, focusedIndex } = this.gameState;
        switch (e.key) {
            case 'ArrowUp': e.preventDefault(); this.moveFocus(focusedIndex - size); break;
            case 'ArrowDown': e.preventDefault(); this.moveFocus(focusedIndex + size); break;
            case 'ArrowLeft': e.preventDefault(); this.moveFocus(focusedIndex - 1); break;
            case 'ArrowRight': e.preventDefault(); this.moveFocus(focusedIndex + 1); break;
            case 'Enter':
            case ' ': e.preventDefault(); this.handleTileAction(focusedIndex); break;
            case 'Escape': this.deselectTile(); break;
            case 'h': case 'H': this.toggleHighContrast(); break;
            case 's': case 'S': this.toggleScanMode(); break;
            case 'r': case 'R': this.startNewGame(); break;
        }
    }

    moveFocus(newIndex) {
        const max = this.gameState.size * this.gameState.size;
        if (newIndex < 0) newIndex = max + newIndex;
        if (newIndex >= max) newIndex = newIndex % max;
        this.gameState.focusedIndex = newIndex;
        this.render();
        this.announceFocus();
        this.playSound('click', 0.1);
    }

    handleTileAction(index) {
        if (this.gameState.selectedIndex === null) {
            this.gameState.selectedIndex = index;
            const t = this.gameState.grid[index];
            this.announce(`Selected ${t.color} ${t.type}`);
            this.playSound('select', 0.2);
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
        this.playSound('success', 0.3);
        this.checkWin();
    }

    deselectTile() {
        this.gameState.selectedIndex = null;
        this.announce("Selection cleared");
        this.playSound('click', 0.1);
        this.render();
    }

    checkWin() {
        if (this.gameState.grid.every((t, i) => t.color === this.gameState.target[i].color)) {
            this.gameState.isWon = true;
            this.saveStats();
            this.announce("Sorting complete! Waiting for trophy...");
            setTimeout(() => this.showWinScreen(), 2000);
        }
    }

    showWinScreen() {
        this.playSound('win', 0.5);
        if (window.confetti) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        this.dom.finalMoves.textContent = this.gameState.moves;
        this.dom.winScreen.classList.add('is-visible');
        document.body.classList.add('is-paused');
        setTimeout(() => this.dom.nextLevelBtn.focus(), 100);
    }

    closeWinScreen() {
        this.dom.winScreen.classList.remove('is-visible');
        document.body.classList.remove('is-paused');
    }

    handleNextLevel() {
        const levels = Object.keys(CONFIG.LEVELS);
        const next = levels[(levels.indexOf(this.gameState.level) + 1) % levels.length];
        this.changeDifficulty(next);
    }

    // --- ACCESSIBILITY & AUDIO ---

    announce(msg) {
        this.dom.announcer.textContent = "";
        setTimeout(() => this.dom.announcer.textContent = msg, 50);
    }

    announceFocus() {
        const t = this.gameState.grid[this.gameState.focusedIndex];
        this.announce(`${t.color} ${t.type} at ${this.getPosText(this.gameState.focusedIndex)}`);
    }

    getPosText(idx) {
        return `Row ${Math.floor(idx / this.gameState.size) + 1}, Column ${(idx % this.gameState.size) + 1}`;
    }

    playSound(type, volume = 0.2) {
        if (!this.audio.enabled) return;
        if (!this.audio.context) this.audio.context = new (window.AudioContext || window.webkitAudioContext)();
        
        const now = this.audio.context.currentTime;
        const osc = this.audio.context.createOscillator();
        const gain = this.audio.context.createGain();
        
        osc.connect(gain); gain.connect(this.audio.context.destination);
        
        const freqs = { click: 400, select: 600, success: 800, win: 1000 };
        osc.frequency.setValueAtTime(freqs[type] || 440, now);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(); osc.stop(now + 0.2);
    }

    toggleHighContrast() {
        this.gameState.isHighContrast = !this.gameState.isHighContrast;
        document.body.classList.toggle('high-contrast');
        this.announce(`High contrast ${this.gameState.isHighContrast ? 'on' : 'off'}`);
    }

    toggleScanMode() {
        this.gameState.isScanMode = !this.gameState.isScanMode;
        if (this.gameState.isScanMode) this.restartScan();
        else clearInterval(this.gameState.scanIntervalId);
        this.announce(`Scan mode ${this.gameState.isScanMode ? 'on' : 'off'}`);
    }

    restartScan() {
        clearInterval(this.gameState.scanIntervalId);
        this.gameState.scanIntervalId = setInterval(() => {
            if (this.gameState.isWon) return;
            this.gameState.focusedIndex = (this.gameState.focusedIndex + 1) % (this.gameState.size ** 2);
            this.render();
        }, CONFIG.SCAN_INTERVAL);
    }

    // --- STATS ---

    loadStats() {
        const stats = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || { easy: 0, medium: 0, hard: 0 };
        this.dom.statsContainer.innerHTML = Object.entries(CONFIG.LEVELS).map(([key, cfg]) => `
            <div class="stat-card">
                <span class="stat-label">${cfg.label} Best</span>
                <span class="stat-value">${stats[key] || '--'}</span>
            </div>
        `).join('');
    }

    saveStats() {
        const stats = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || {};
        const currentBest = stats[this.gameState.level] || Infinity;
        if (this.gameState.moves < currentBest) {
            stats[this.gameState.level] = this.gameState.moves;
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(stats));
            this.loadStats();
        }
    }

    changeDifficulty(level) {
        this.gameState.level = level;
        this.dom.difficultyBtns.forEach(btn => btn.setAttribute('aria-checked', btn.dataset.level === level));
        this.startNewGame();
    }

    render() {
        this.dom.grid.innerHTML = '';
        this.dom.grid.setAttribute('data-size', this.gameState.size);
        this.gameState.grid.forEach((tile, i) => {
            const el = document.createElement('div');
            el.className = `tile ${i === this.gameState.focusedIndex ? 'is-focused' : ''} ${i === this.gameState.selectedIndex ? 'is-selected' : ''}`;
            el.dataset.index = i;
            el.innerHTML = `<svg viewBox="0 0 100 100" class="shape-${tile.type}">${tile.pattern}${tile.icon}</svg>`;
            this.dom.grid.appendChild(el);
        });

        this.dom.goal.innerHTML = '';
        this.gameState.target.slice(0, this.gameState.size).forEach(tile => {
            const item = document.createElement('div');
            item.className = 'goal-item';
            item.innerHTML = `<svg viewBox="0 0 100 100" class="shape-${tile.type}">${tile.icon}</svg>`;
            this.dom.goal.appendChild(item);
        });

        this.dom.moves.textContent = this.gameState.moves;
        this.dom.status.textContent = this.gameState.selectedIndex !== null ? `Selected: ${this.gameState.grid[this.gameState.selectedIndex].color}` : 'Selected: None';
    }
}

window.addEventListener('DOMContentLoaded', () => { window.game = new AccessPlay(); });
