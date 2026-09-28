// Khởi tạo Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GAME_WIDTH = (canvas.width = window.innerWidth);
const GAME_HEIGHT = (canvas.height = window.innerHeight);
const GRAVITY = 0.45;
const FLAP_STRENGTH = -7.5;
const PIPE_WIDTH = 70;
const PIPE_GAP = 160;
const PIPE_SPEED = 2.2;
const PIPE_INTERVAL = 1500;

let bird;
let pipes = [];
let score = 0;
let bestScore = 0;
let gameStarted = false;
let gameOver = false;
let lastTime = 0;
let lastPipeSpawn = 0;
let animationId = null;

function resetGame() {
  bird = {
    x: 110,
    y: GAME_HEIGHT / 2 - 20,
    radius: 18,
    velocity: 0,
    rotation: 0,
  };

  pipes = [];
  score = 0;
  gameStarted = false;
  gameOver = false;
  lastPipeSpawn = 0;
}

function createPipe() {
  const minTopHeight = 60;
  const maxTopHeight = GAME_HEIGHT - PIPE_GAP - 120;
  const topHeight = Math.random() * (maxTopHeight - minTopHeight) + minTopHeight;

  pipes.push({
    x: GAME_WIDTH + 20,
    width: PIPE_WIDTH,
    topHeight,
    passed: false,
  });
}

function startGame() {
  if (gameOver) {
    resetGame();
  }

  gameStarted = true;
  bird.velocity = FLAP_STRENGTH;
}

function handleInput() {
  if (!gameStarted) {
    startGame();
  } else if (!gameOver) {
    bird.velocity = FLAP_STRENGTH;
  } else {
    resetGame();
    gameStarted = false;
  }
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    handleInput();
  }
});

canvas.addEventListener("pointerdown", handleInput);

function updateBird() {
  bird.velocity += GRAVITY;
  bird.y += bird.velocity;
  bird.rotation = Math.min(Math.PI / 3, Math.max(-Math.PI / 3, bird.velocity / 10));

  if (bird.y + bird.radius >= GAME_HEIGHT) {
    bird.y = GAME_HEIGHT - bird.radius;
    bird.velocity = 0;
    if (!gameOver) endGame();
  }

  if (bird.y - bird.radius <= 0) {
    bird.y = bird.radius;
    bird.velocity = 0;
    if (!gameOver) endGame();
  }
}

function updatePipes(delta) {
  if (!gameStarted || gameOver) return;

  if (performance.now() - lastPipeSpawn > PIPE_INTERVAL) {
    createPipe();
    lastPipeSpawn = performance.now();
  }

  for (let i = pipes.length - 1; i >= 0; i--) {
    const pipe = pipes[i];
    pipe.x -= PIPE_SPEED * (delta / 16.67);

    if (!pipe.passed && pipe.x + pipe.width < bird.x) {
      pipe.passed = true;
      score += 1;
      bestScore = Math.max(bestScore, score);
    }

    const birdLeft = bird.x - bird.radius;
    const birdRight = bird.x + bird.radius;
    const birdTop = bird.y - bird.radius;
    const birdBottom = bird.y + bird.radius;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + pipe.width;
    const pipeTopBottom = pipe.topHeight;
    const pipeBottomY = pipe.topHeight + PIPE_GAP;

    const hitPipeX = birdRight > pipeLeft && birdLeft < pipeRight;
    const hitTop = birdTop < pipeTopBottom;
    const hitBottom = birdBottom > pipeBottomY;

    if (hitPipeX && (hitTop || hitBottom)) {
      endGame();
    }

    if (pipe.x + pipe.width < -10) {
      pipes.splice(i, 1);
    }
  }
}

function endGame() {
  gameOver = true;
  gameStarted = false;
}

function drawBackground() {
  ctx.fillStyle = "#8ad8ff";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = "#7bdc6b";
  for (let i = 0; i < 12; i++) {
    const x = (i * 60 + (performance.now() * 0.03) % 70) % (GAME_WIDTH + 60) - 30;
    const y = 500 + (i % 3) * 16;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#7ecb5f";
  ctx.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);
  ctx.fillStyle = "#72b853";
  for (let i = 0; i < 20; i++) {
    const x = (i * 25 + (performance.now() * 0.04) % 50) % (GAME_WIDTH + 40) - 20;
    ctx.fillRect(x, GAME_HEIGHT - 50, 18, 20);
  }
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.rotation);

  ctx.fillStyle = "#ffd93f";
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff9f1c";
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(26, 4);
  ctx.lineTo(14, 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(7, -5, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.arc(8, -5, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f36";
  ctx.beginPath();
  ctx.arc(-4, 4, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPipe(pipe) {
  const x = pipe.x;
  const topHeight = pipe.topHeight;
  const bottomY = topHeight + PIPE_GAP;

  ctx.fillStyle = "#1ca754";
  ctx.fillRect(x, 0, pipe.width, topHeight);
  ctx.fillRect(x - 8, topHeight - 25, pipe.width + 16, 25);

  ctx.fillRect(x, bottomY, pipe.width, GAME_HEIGHT - bottomY);
  ctx.fillRect(x - 8, bottomY, pipe.width + 16, 25);

  ctx.strokeStyle = "#0d7c3e";
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 2, 0, pipe.width - 4, topHeight);
  ctx.strokeRect(x + 2, bottomY, pipe.width - 4, GAME_HEIGHT - bottomY);
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "bold 42px Arial";
  ctx.textAlign = "center";
  ctx.fillText(String(score), GAME_WIDTH / 2, 80);
}

function drawStartPrompt() {
  if (gameStarted || gameOver) return;

  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 46px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Flappy Bird", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);

  ctx.font = "24px Arial";
  ctx.fillText("Nhấn Space / Click để chơi", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
}

function drawGameOver() {
  if (!gameOver) return;

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "bold 52px Arial";
  ctx.fillText("Game Over", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);

  ctx.font = "28px Arial";
  ctx.fillText(`Điểm: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
  ctx.fillText(`Best: ${bestScore}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60);
  ctx.font = "22px Arial";
  ctx.fillText("Nhấn nút / Space để chơi lại", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110);
}

function draw() {
  drawBackground();

  for (const pipe of pipes) {
    drawPipe(pipe);
  }

  drawBird();
  drawScore();
  drawStartPrompt();
  drawGameOver();
}

function gameLoop(timestamp) {
  const delta = timestamp - lastTime || 16;
  lastTime = timestamp;

  if (!gameOver && gameStarted) {
    updateBird();
    updatePipes(delta);
  }

  draw();
  animationId = requestAnimationFrame(gameLoop);
}

resetGame();
requestAnimationFrame(gameLoop);