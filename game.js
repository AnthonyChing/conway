// Game state
let grid = [];
let rows = 100;
let cols = 100;
let cellSize = 6;
let isPlaying = false;
let generation = 0;
let speed = 10; // FPS
let lastFrameTime = 0;
let isDrawing = false;

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Colors - blue/green theme
const DEAD_COLOR = '#0a1929';
const ALIVE_COLOR = '#00ff88';
const GRID_COLOR = '#1a2f3f';

// UI Elements
const playPauseBtn = document.getElementById('playPauseBtn');
const stepBtn = document.getElementById('stepBtn');
const clearBtn = document.getElementById('clearBtn');
const randomBtn = document.getElementById('randomBtn');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const gridSizeInput = document.getElementById('gridSizeInput');
const resizeBtn = document.getElementById('resizeBtn');
const patternSelect = document.getElementById('patternSelect');
const loadPatternBtn = document.getElementById('loadPatternBtn');
const generationDisplay = document.getElementById('generation');
const populationDisplay = document.getElementById('population');

// Initialize the game
function init() {
    resizeCanvas();
    createGrid();
    render();
}

// Create the grid
function createGrid() {
    grid = [];
    for (let i = 0; i < rows; i++) {
        grid[i] = [];
        for (let j = 0; j < cols; j++) {
            grid[i][j] = 0;
        }
    }
    generation = 0;
    updateStats();
}

// Resize canvas based on grid size
function resizeCanvas() {
    const maxCanvasSize = Math.min(window.innerWidth - 40, 800);
    cellSize = Math.floor(maxCanvasSize / cols);
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;
}

// Render the grid
function render() {
    ctx.fillStyle = DEAD_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }
    
    for (let j = 0; j <= cols; j++) {
        ctx.beginPath();
        ctx.moveTo(j * cellSize, 0);
        ctx.lineTo(j * cellSize, canvas.height);
        ctx.stroke();
    }
    
    // Draw alive cells
    ctx.fillStyle = ALIVE_COLOR;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 1) {
                ctx.fillRect(j * cellSize + 1, i * cellSize + 1, cellSize - 2, cellSize - 2);
            }
        }
    }
}

// Count neighbors
function countNeighbors(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newRow = (row + i + rows) % rows;
            const newCol = (col + j + cols) % cols;
            count += grid[newRow][newCol];
        }
    }
    return count;
}

// Update grid according to Conway's rules
function updateGrid() {
    const newGrid = [];
    for (let i = 0; i < rows; i++) {
        newGrid[i] = [];
        for (let j = 0; j < cols; j++) {
            const neighbors = countNeighbors(i, j);
            if (grid[i][j] === 1) {
                // Cell is alive
                newGrid[i][j] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
            } else {
                // Cell is dead
                newGrid[i][j] = (neighbors === 3) ? 1 : 0;
            }
        }
    }
    grid = newGrid;
    generation++;
    updateStats();
}

// Update statistics
function updateStats() {
    let population = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            population += grid[i][j];
        }
    }
    generationDisplay.textContent = generation;
    populationDisplay.textContent = population;
}

// Animation loop
function animate(timestamp) {
    if (isPlaying) {
        const elapsed = timestamp - lastFrameTime;
        const frameDelay = 1000 / speed;
        
        if (elapsed > frameDelay) {
            updateGrid();
            render();
            lastFrameTime = timestamp;
        }
    }
    requestAnimationFrame(animate);
}

// Toggle play/pause
playPauseBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
    if (isPlaying) {
        playPauseBtn.classList.add('btn-primary');
        lastFrameTime = performance.now();
    } else {
        playPauseBtn.classList.remove('btn-primary');
    }
});

// Step one generation
stepBtn.addEventListener('click', () => {
    updateGrid();
    render();
});

// Clear the grid
clearBtn.addEventListener('click', () => {
    createGrid();
    render();
});

// Randomize the grid
randomBtn.addEventListener('click', () => {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            grid[i][j] = Math.random() > 0.7 ? 1 : 0;
        }
    }
    generation = 0;
    updateStats();
    render();
});

// Speed control
speedSlider.addEventListener('input', (e) => {
    speed = parseInt(e.target.value);
    speedValue.textContent = `${speed} FPS`;
});

// Grid size control
resizeBtn.addEventListener('click', () => {
    const newSize = parseInt(gridSizeInput.value);
    if (newSize >= 10 && newSize <= 200) {
        rows = newSize;
        cols = newSize;
        resizeCanvas();
        createGrid();
        render();
    }
});

// Mouse interaction
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    toggleCell(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        toggleCell(e);
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

function toggleCell(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
        grid[row][col] = grid[row][col] === 1 ? 0 : 1;
        updateStats();
        render();
    }
}

// Pre-loaded patterns
const patterns = {
    glider: [
        [0, 1, 0],
        [0, 0, 1],
        [1, 1, 1]
    ],
    blinker: [
        [1, 1, 1]
    ],
    toad: [
        [0, 1, 1, 1],
        [1, 1, 1, 0]
    ],
    beacon: [
        [1, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 1, 1],
        [0, 0, 1, 1]
    ],
    pulsar: [
        [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0]
    ],
    gliderGun: [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    lwss: [
        [0,1,0,0,1],
        [1,0,0,0,0],
        [1,0,0,0,1],
        [1,1,1,1,0]
    ],
    pentadecathlon: [
        [0,0,1,0,0,0,0,1,0,0],
        [1,1,0,1,1,1,1,0,1,1],
        [0,0,1,0,0,0,0,1,0,0]
    ]
};

// Load pattern
loadPatternBtn.addEventListener('click', () => {
    const selectedPattern = patternSelect.value;
    if (selectedPattern && patterns[selectedPattern]) {
        clearBtn.click();
        const pattern = patterns[selectedPattern];
        const startRow = Math.floor(rows / 2 - pattern.length / 2);
        const startCol = Math.floor(cols / 2 - pattern[0].length / 2);
        
        for (let i = 0; i < pattern.length; i++) {
            for (let j = 0; j < pattern[i].length; j++) {
                if (startRow + i < rows && startCol + j < cols) {
                    grid[startRow + i][startCol + j] = pattern[i][j];
                }
            }
        }
        updateStats();
        render();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        playPauseBtn.click();
    } else if (e.code === 'KeyS') {
        e.preventDefault();
        stepBtn.click();
    } else if (e.code === 'KeyC') {
        e.preventDefault();
        clearBtn.click();
    } else if (e.code === 'KeyR') {
        e.preventDefault();
        randomBtn.click();
    }
});

// Start the game
init();
requestAnimationFrame(animate);
