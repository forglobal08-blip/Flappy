const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Set canvas size dynamically
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Scaling factor based on canvas size
const scaleX = canvas.width / 1000;
const scaleY = canvas.height / 600;

// Game variables
let bird = {
    x: 50 * scaleX,
    y: 300 * scaleY,
    width: 50 * scaleX,
    height: 30 * scaleY,
    dy: 0,
    gravity: 0.4,
    jump: -10,
    maxFallSpeed: 8
};

let fires = [];
let score = 0;
let gameRunning = true;
let gameStarted = false;
let frameCount = 0;

// Images
let birdImg = new Image();
birdImg.src = 'bird.png';

// Removed pipeImg as we're using animated fire

// Sounds
let jumpSound = new Audio('jump.wav');
let scoreSound = new Audio('score.wav');
let gameOverSound = new Audio('gameover.wav');

// Input handling
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameStarted) {
            gameStarted = true;
        }
        if (gameRunning) {
            bird.dy = bird.jump;
            jumpSound.play();
        }
    }
});

// Mouse click support
canvas.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
    }
    if (gameRunning) {
        bird.dy = bird.jump;
        jumpSound.play();
    }
});

// Touch support for tablets
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameStarted) {
        gameStarted = true;
    }
    if (gameRunning) {
        bird.dy = bird.jump;
        jumpSound.play();
    }
});

restartBtn.addEventListener('click', resetGame);

// Generate fires
function generateFire() {
    let fireHeight = Math.random() * (canvas.height - 350 * scaleY) + 100 * scaleY;
    fires.push({
        x: canvas.width,
        topHeight: fireHeight,
        bottomY: fireHeight + 250 * scaleY,
        width: 80 * scaleX,
        passed: false
    });
}

// Update game
function update() {
    if (!gameRunning || !gameStarted) return;

    // Update bird
    bird.dy += bird.gravity;
    if (bird.dy > bird.maxFallSpeed) {
        bird.dy = bird.maxFallSpeed;
    }
    bird.y += bird.dy;

    // Generate fires
    if (fires.length === 0 || fires[fires.length - 1].x < canvas.width - 200) {
        generateFire();
    }

    // Update fires
    for (let i = fires.length - 1; i >= 0; i--) {
        fires[i].x -= 2;

        // Check if bird passed fire
        if (!fires[i].passed && bird.x > fires[i].x + fires[i].width) {
            fires[i].passed = true;
            score++;
            scoreSound.play();
            scoreElement.textContent = 'Score: ' + score;
        }

        // Remove off-screen fires
        if (fires[i].x + fires[i].width < 0) {
            fires.splice(i, 1);
        }
    }

    // Collision detection
    // Ground collision
    if (bird.y + bird.height >= canvas.height) {
        gameOver();
    }

    // Ceiling collision
    if (bird.y <= 0) {
        gameOver();
    }

    // Fire collision
    for (let fire of fires) {
        if (bird.x < fire.x + fire.width &&
            bird.x + bird.width > fire.x &&
            (bird.y < fire.topHeight || bird.y + bird.height > fire.bottomY)) {
            gameOver();
        }
    }
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw fires
    for (let fire of fires) {
        // Top fire
        drawFire(fire.x, 0, fire.width, fire.topHeight, frameCount);
        // Bottom fire
        drawFire(fire.x, fire.bottomY, fire.width, canvas.height - fire.bottomY, frameCount);
    }

    // Draw bird
    if (birdImg.complete && birdImg.naturalHeight > 0) {
        ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    } else {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    }

    // Draw start message
    if (!gameStarted) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE or Click to start', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px Arial';
        ctx.fillText('Avoid the fires!', canvas.width / 2, canvas.height / 2 + 30);
        ctx.fillText('Use SPACE or mouse clicks to jump', canvas.width / 2, canvas.height / 2 + 50);
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    gameOverSound.play();
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

// Reset game
function resetGame() {
    bird.y = 300 * scaleY;
    bird.dy = 0;
    fires = [];
    score = 0;
    gameRunning = true;
    gameStarted = false;
    scoreElement.textContent = 'Score: 0';
    gameOverElement.style.display = 'none';
}

// Draw fire function
function drawFire(x, y, width, height, frame) {
    let flicker = Math.sin(frame * 0.1) * 5;
    let baseHeight = height + flicker;
    let flameCount = Math.floor(width / 10);

    for (let i = 0; i < flameCount; i++) {
        let flameX = x + i * 10;
        let flameY = y + height - baseHeight;
        let flameHeight = baseHeight + Math.random() * 20;

        // Gradient for flame
        let gradient = ctx.createLinearGradient(flameX, flameY, flameX, flameY + flameHeight);
        gradient.addColorStop(0, '#ff4500');
        gradient.addColorStop(0.5, '#ff6347');
        gradient.addColorStop(1, '#ffd700');

        ctx.fillStyle = gradient;
        ctx.fillRect(flameX, flameY, 10, flameHeight);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    frameCount++;
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();
