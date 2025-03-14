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

    // Move enemies
    for (const enemy of enemies) {
        if (hitEdge) {
            enemy.moveDirection *= -1;
            enemy.y += 20;
        }
        enemy.x += enemy.moveDirection * enemy.speed;

        // Enemy shooting
        if (Math.random() < enemy.shootChance) {
            enemyBullets.push({
                x: enemy.x + enemy.width / 2 - 2,
                y: enemy.y + enemy.height,
                width: 4,
                height: 10,
                speed: 5,
                color: '#eb4d4b'
            });
        }

        // Check if enemy reached the bottom
        if (enemy.y + enemy.height > player.y) {
            lives = 0;
            endGame();
        }
    }
}

function moveBullets() {
    // Move player bullets
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        const bullet = player.bullets[i];
        bullet.y -= bullet.speed;
        
        // Remove bullets that are off-screen
        if (bullet.y + bullet.height < 0) {
            player.bullets.splice(i, 1);
        }
    }

     // Move enemy bullets
     for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        bullet.y += bullet.speed;
        
        // Remove bullets that are off-screen
        if (bullet.y > canvas.height) {
            enemyBullets.splice(i, 1);
        }
    }
}

function movePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.y += powerUp.speed;
        
        // Remove power-ups that are off-screen
        if (powerUp.y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }
}

function updatePowerUpStatus() {
    if (player.powerUp) {
        player.powerUpDuration--;
        powerUpTime = player.powerUpDuration;
        
        if (player.powerUpDuration <= 0) {
            player.powerUp = null;
            powerUpType = "None";
        }
    } else {
        powerUpTime = 0;
    }
}

function checkCollisions() {
    // Check player bullet collisions with enemies
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        const bullet = player.bullets[i];
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            
            if (detectCollision(bullet, enemy)) {
                // Bullet hit enemy
                player.bullets.splice(i, 1);
                enemy.health--;
                
                // Create hit particles
                createParticles(bullet.x, bullet.y, 5, enemy.color);
                
                if (enemy.health <= 0) {
                    // Enemy destroyed
                    enemies.splice(j, 1);
                    score += 100 * (level * 0.5);
                    
                    // Create explosion particles
                    createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 20, enemy.color);
                }
                
                break;
            }
        }
    }

    // Check enemy bullet collisions with player
    if (player.powerUp !== 'shield') {
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            const bullet = enemyBullets[i];
            
            if (detectCollision(bullet, player)) {
                // Bullet hit player
                enemyBullets.splice(i, 1);
                lives--;
                
                // Create hit particles
                createParticles(player.x + player.width/2, player.y + player.height/2, 10, player.color);
                
                if (lives <= 0) {
                    endGame();
                }
                
                break;
            }
        }
    }

    // Check power-up collisions with player
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        
        if (detectCollision(powerUp, player)) {
            // Player got power-up
            powerUps.splice(i, 1);
            player.powerUp = powerUp.type;
            player.powerUpDuration = 600; // 10 seconds
            powerUpType = powerUp.type === 'rapidFire' ? 'Rapid Fire' : 
                         powerUp.type === 'shield' ? 'Shield' : 
                         powerUp.type === 'multiShot' ? 'Multi Shot' : 
                         'Screen Bomb';
            // Activate screen bomb immediately
            if (powerUp.type === 'bomb') {
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const enemy = enemies[j];
                    createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 20, enemy.color);
                    score += 50 * (level * 0.5);
                }
                enemies.length = 0;
                enemyBullets.length = 0;
                player.powerUp = null;
                powerUpType = "None";
            }
            
            break;
        }
    }

    // Check if all enemies are defeated
    if (enemies.length === 0) {
        level++;
        showLevelNotification();
        spawnEnemies();
    }
}

function detectCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 3 + 1,
            speedX: Math.random() * 6 - 3,
            speedY: Math.random() * 6 - 3,
            color: color,
            life: 30
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life--;
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // Draw shield if active
    if (player.powerUp === 'shield') {
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2 + 10, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2 + 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function drawEnemies() {
    for (const enemy of enemies) {
        ctx.fillStyle = enemy.color;
        
        // Draw different enemy shapes based on type
        if (enemy.color === '#eb4d4b') { // Top row - boss enemy
            // Draw boss enemy
            ctx.beginPath();
            ctx.moveTo(enemy.x + enemy.width / 2, enemy.y);
            ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height / 3);
            ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
            ctx.lineTo(enemy.x, enemy.y + enemy.height);
            ctx.lineTo(enemy.x, enemy.y + enemy.height / 3);
            ctx.closePath();
            ctx.fill();

            // Draw health bar
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 5);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(enemy.x, enemy.y - 10, (enemy.health / 3) * enemy.width, 5);
        } else if (enemy.color === '#ff7979') { // Middle row
            // Draw standard enemy
            ctx.beginPath();
            ctx.moveTo(enemy.x + enemy.width / 2, enemy.y);
            ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height / 2);
            ctx.lineTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
            ctx.lineTo(enemy.x, enemy.y + enemy.height / 2);
            ctx.closePath();
            ctx.fill();
            
            // Draw health bar
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 5);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(enemy.x, enemy.y - 10, (enemy.health / 2) * enemy.width, 5);
        } else { // Bottom row
            // Draw simple enemy
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawBullets() {
    // Draw player bullets
    for (const bullet of player.bullets) {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    // Draw enemy bullets
    for (const bullet of enemyBullets) {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

function drawParticles() {
    for (const particle of particles) {
        ctx.globalAlpha = particle.life / 30;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawPowerUps() {
    for (const powerUp of powerUps) {
        ctx.fillStyle = powerUp.color;
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw power-up symbol
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (powerUp.type === 'rapidFire') {
            ctx.fillText('F', powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
        } else if (powerUp.type === 'shield') {
            ctx.fillText('S', powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
        } else if (powerUp.type === 'multiShot') {
            ctx.fillText('M', powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
        } else if (powerUp.type === 'bomb') {
            ctx.fillText('B', powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
        }
    }
}

function drawStars() {
    // Draw star background
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 100; i++) {
        const x = Math.sin(i * 567 + Date.now() / 2000) * canvas.width / 2 + canvas.width / 2;
        const y = Math.cos(i * 345 + Date.now() / 3000) * canvas.height / 2 + canvas.height / 2;
        
        const size = Math.sin(i * 789 + Date.now() / 1000) * 1.5 + 1.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function update() {
    if (!gameRunning) return;
    
    movePlayer();
    moveEnemies();
    moveBullets();
    movePowerUps();
    updateParticles();
    updatePowerUpStatus();
    checkCollisions();
    spawnPowerUp();
    updateUI();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawStars();
    drawPowerUps();
    drawBullets();
    drawEnemies();
    drawPlayer();
    drawParticles();
}

function gameLoop() {
    update();
    draw();
    
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Start the game when the page loads
window.onload = function() {
    // Game is waiting for player to press start
    drawStars();
};

// Start the star animation
(function animateStars() {
    if (!gameRunning) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawStars();
        requestAnimationFrame(animateStars);
    }
})();
