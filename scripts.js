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
