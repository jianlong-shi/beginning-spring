// Canvas and context setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;
const gameWidth = canvas.width;
const gameHeight = canvas.height;

// Player paddle (left)
const player = {
    x: 10,
    y: gameHeight / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6,
    score: 0
};

// Computer paddle (right)
const computer = {
    x: gameWidth - paddleWidth - 10,
    y: gameHeight / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4.5,
    score: 0
};

// Ball object
const ball = {
    x: gameWidth / 2,
    y: gameHeight / 2,
    size: ballSize,
    dx: 5,
    dy: 5,
    speed: 5,
    maxSpeed: 8
};

// Input handling
const keys = {};
let mouseY = gameHeight / 2;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player paddle position
function updatePlayer() {
    // Mouse control
    if (mouseY > 0 && mouseY < gameHeight) {
        player.y = mouseY - paddleHeight / 2;
    }

    // Arrow keys control
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y < gameHeight - paddleHeight) {
        player.y += player.speed;
    }

    // Boundary check
    if (player.y < 0) player.y = 0;
    if (player.y > gameHeight - paddleHeight) {
        player.y = gameHeight - paddleHeight;
    }
}

// Update computer AI paddle
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;

    // Simple AI: follow the ball
    if (computerCenter < ballCenter - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= computer.speed;
    }

    // Boundary check
    if (computer.y < 0) computer.y = 0;
    if (computer.y > gameHeight - paddleHeight) {
        computer.y = gameHeight - paddleHeight;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top and bottom)
    if (ball.y - ball.size < 0 || ball.y + ball.size > gameHeight) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(gameHeight - ball.size, ball.y));
    }

    // Paddle collision detection
    if (checkPaddleCollision(player)) {
        ball.dx = Math.abs(ball.dx);
        ball.x = player.x + player.width + ball.size;
        // Add spin based on where the ball hits the paddle
        ball.dy += player.dy * 0.2;
        // Increase ball speed slightly
        const currentSpeed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
        if (currentSpeed < ball.maxSpeed) {
            ball.dx = (ball.dx / currentSpeed) * (currentSpeed + 0.5);
            ball.dy = (ball.dy / currentSpeed) * (currentSpeed + 0.5);
        }
    }

    if (checkPaddleCollision(computer)) {
        ball.dx = -Math.abs(ball.dx);
        ball.x = computer.x - ball.size;
        // Add spin based on where the ball hits the paddle
        ball.dy += computer.dy * 0.2;
        // Increase ball speed slightly
        const currentSpeed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
        if (currentSpeed < ball.maxSpeed) {
            ball.dx = (ball.dx / currentSpeed) * (currentSpeed + 0.5);
            ball.dy = (ball.dy / currentSpeed) * (currentSpeed + 0.5);
        }
    }

    // Score detection
    if (ball.x - ball.size < 0) {
        computer.score++;
        resetBall();
    } else if (ball.x + ball.size > gameWidth) {
        player.score++;
        resetBall();
    }

    updateScore();
}

// Paddle collision detection
function checkPaddleCollision(paddle) {
    return (
        ball.x - ball.size < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y - ball.size < paddle.y + paddle.height &&
        ball.y + ball.size > paddle.y
    );
}

// Reset ball to center
function resetBall() {
    ball.x = gameWidth / 2;
    ball.y = gameHeight / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 5;
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = player.score;
    document.getElementById('computerScore').textContent = computer.score;
}

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = '#444';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(gameWidth / 2, 0);
    ctx.lineTo(gameWidth / 2, gameHeight);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    drawRect(0, 0, gameWidth, gameHeight, '#1a1a2e');

    // Draw center line
    drawCenterLine();

    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#00d4ff');
    drawRect(computer.x, computer.y, computer.width, computer.height, '#ff006e');

    // Draw ball
    drawCircle(ball.x, ball.y, ball.size, '#ffd60a');
}

// Game loop
function gameLoop() {
    updatePlayer();
    updateComputer();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
