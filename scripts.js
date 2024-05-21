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
