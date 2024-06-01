// Game variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const levelNotification = document.getElementById('level-notification');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

let gameRunning = false;
let gameOver = false;
let score = 0;
let level = 1;
let lives = 3;
let powerUpType = "None";
let powerUpTime = 0;

// Game objects
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 40,
    height: 40,
    speed: 5,
    color: '#6c5ce7',
    bullets: [],
    bulletSpeed: 7,
    bulletCooldown: 20,
    bulletTimer: 0,
    powerUp: null,
    powerUpDuration: 0
};

const enemies = [];
const enemyBullets = [];
const particles = [];
const powerUps = [];

const keys = {};

// Event listeners
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

// Game functions
function startGame() {
    startScreen.style.display = 'none';
    gameRunning = true;
    gameOver = false;
    score = 0;
    level = 1;
    lives = 3;
    enemies.length = 0;
    player.bullets.length = 0;
    enemyBullets.length = 0;
    particles.length = 0;
    powerUps.length = 0;
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
    player.powerUp = null;
    player.powerUpDuration = 0;
    
    spawnEnemies();
    gameLoop();
    updateUI();
}

function restartGame() {
    gameOverScreen.style.display = 'none';
    startGame();
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lives').textContent = lives;
    document.getElementById('final-score').textContent = score;
    document.getElementById('power-up-type').textContent = powerUpType;
    document.getElementById('power-up-time').textContent = Math.ceil(powerUpTime / 60);
}

function showLevelNotification() {
    document.getElementById('new-level').textContent = level;
    levelNotification.style.display = 'block';
    setTimeout(() => {
        levelNotification.style.display = 'none';
    }, 2000);
}
