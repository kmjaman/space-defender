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

function endGame() {
    gameRunning = false;
    gameOver = true;
    gameOverScreen.style.display = 'block';
}

function spawnEnemies() {
    const rows = Math.min(3 + Math.floor(level / 2), 6);
    const cols = Math.min(6 + Math.floor(level / 3), 10);
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            enemies.push({
                x: 70 + j * 60,
                y: 50 + i * 50,
                width: 40,
                height: 40,
                speed: 1 + level * 0.3,
                moveDirection: 1,
                color: i === 0 ? '#eb4d4b' : (i === 1 ? '#ff7979' : '#badc58'),
                health: i === 0 ? 3 : (i === 1 ? 2 : 1),
                shootChance: 0.001 + (level * 0.0005)
            });
        }
    }
}

function spawnPowerUp() {
    if (Math.random() < 0.005) {
        const types = ['rapidFire', 'shield', 'multiShot', 'bomb'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        powerUps.push({
            x: Math.random() * (canvas.width - 30),
            y: 0,
            width: 30,
            height: 30,
            speed: 2,
            type: type,
            color: type === 'rapidFire' ? '#f39c12' : 
                   type === 'shield' ? '#3498db' : 
                   type === 'multiShot' ? '#9b59b6' : 
                   '#e74c3c'
        });
    }
}

function movePlayer() {
    // Move with arrow keys or WASD
    if ((keys['ArrowLeft'] || keys['a']) && player.x > 0) {
        player.x -= player.speed;
    }
    if ((keys['ArrowRight'] || keys['d']) && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if ((keys['ArrowUp'] || keys['w']) && player.y > 0) {
        player.y -= player.speed;
    }
    if ((keys['ArrowDown'] || keys['s']) && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }

    // Shooting
    if (keys[' '] && player.bulletTimer <= 0) {
        if (player.powerUp === 'multiShot') {
            // Triple shot
            player.bullets.push({
                x: player.x + player.width / 2 - 2,
                y: player.y,
                width: 4,
                height: 10,
                speed: player.bulletSpeed,
                color: '#fff'
            });
            player.bullets.push({
                x: player.x + player.width / 2 - 2 - 10,
                y: player.y + 10,
                width: 4,
                height: 10,
                speed: player.bulletSpeed,
                color: '#fff'
            });
            player.bullets.push({
                x: player.x + player.width / 2 - 2 + 10,
                y: player.y + 10,
                width: 4,
                height: 10,
                speed: player.bulletSpeed,
                color: '#fff'
            });
        } else {
            // Standard shot
            player.bullets.push({
                x: player.x + player.width / 2 - 2,
                y: player.y,
                width: 4,
                height: 10,
                speed: player.bulletSpeed,
                color: '#fff'
            });
        }

        player.bulletTimer = player.powerUp === 'rapidFire' ? 
                                    player.bulletCooldown / 3 : 
                                    player.bulletCooldown;
            }
            
            if (player.bulletTimer > 0) {
                player.bulletTimer--;
            }
    }

function moveEnemies() {
    // Check if enemies need to change direction
    let hitEdge = false;
    for (const enemy of enemies) {
        if ((enemy.x <= 0 && enemy.moveDirection < 0) || 
            (enemy.x + enemy.width >= canvas.width && enemy.moveDirection > 0)) {
            hitEdge = true;
            break;
        }
    }
}
