const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🖼️ Images
const pepeImg = new Image();
pepeImg.src = "leap pepe.png";

const pepeCryImg = new Image();
pepeCryImg.src = "leap pepe-cry.png";

const bgImg = new Image();
bgImg.src = "leap cloud.png";

const obstacleImg = new Image();
obstacleImg.src = "leap-obstacle.png";

// 🔊 Sounds
const flapSound = new Audio("pepe-flap.wav");
const crashSound = new Audio("pepe-crash.wav");
const scoreSound = new Audio("pepe-score.wav");
const crySound = new Audio("pepe-cry.wav");
crySound.loop = true;

// 🎮 Game State
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem("flappyPepeHighScore") || 0;

// 📱 Responsive Canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// 🐸 Pepe
let pepeY = canvas.height * 0.25;
let pepeVelocity = 0;
const gravity = 0.5;
const jump = -8;

// 🧱 Pipes
let pipeGap = canvas.height * 0.25;
const minGap = canvas.height * 0.15;
const pipeWidth = canvas.width * 0.04;
let pipes = [];
let frames = 0;
let bgX = 0;

// 🔴 Moving Obstacles
let movingObstacles = [];

function createPipe() {
  const topHeight = Math.floor(Math.random() * canvas.height * 0.25) + canvas.height * 0.1;
  pipes.push({ x: canvas.width, top: topHeight, passed: false });
}

function updatePipes() {
  for (let i = 0; i < pipes.length; i++) {
    pipes[i].x -= 2.5;

    if (!pipes[i].passed && pipes[i].x + pipeWidth < 50) {
      score++;
      pipes[i].passed = true;
      if (!gameOver) {
        scoreSound.currentTime = 0;
        scoreSound.play();
      }
      if (score % 20 === 0 && pipeGap > minGap) {
        pipeGap -= canvas.height * 0.02;
      }
    }

    if (pipes[i].x + pipeWidth < 0) {
      pipes.splice(i, 1);
      i--;
    }
  }

  if (frames % 150 === 0) createPipe();
}

function drawPipes() {
  for (let pipe of pipes) {
    // Gradient fill
    const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
    gradient.addColorStop(0, "#2ecc71");
    gradient.addColorStop(0.5, "#27ae60");
    gradient.addColorStop(1, "#145214");

    ctx.fillStyle = gradient;
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.top + pipeGap, pipeWidth, canvas.height - pipe.top - pipeGap);

    // Pipe caps
    ctx.fillStyle = "#0e3d24";
    ctx.fillRect(pipe.x - 2, pipe.top - 10, pipeWidth + 4, 10);
    ctx.fillRect(pipe.x - 2, pipe.top + pipeGap, pipeWidth + 4, 10);

    // Highlights
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(pipe.x + 4, 0, 4, pipe.top);
    ctx.fillRect(pipe.x + 4, pipe.top + pipeGap, 4, canvas.height - pipe.top - pipeGap);
  }
}


function checkCollision() {
  for (let pipe of pipes) {
    const pepeLeft = 50;
    const pepeRight = 75;
    const pepeTop = pepeY;
    const pepeBottom = pepeY + canvas.height * 0.075;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + pipeWidth;
    const pipeTop = pipe.top;
    const pipeBottom = pipe.top + pipeGap;

    const hitTop = pepeRight > pipeLeft && pepeLeft < pipeRight && pepeTop < pipeTop;
    const hitBottom = pepeRight > pipeLeft && pepeLeft < pipeRight && pepeBottom > pipeBottom;

    if ((hitTop || hitBottom || pepeBottom >= canvas.height) && !gameOver) {
      gameOver = true;
      crashSound.currentTime = 0;
      crashSound.play();
      crySound.currentTime = 0;
      crySound.play();
      document.getElementById("gameOverText").classList.remove("hidden");
    }
  }
}

function createMovingObstacle() {
  const obstacle = {
    x: canvas.width,
    y: Math.random() * (canvas.height - canvas.height * 0.15),
    width: canvas.width * 0.05,
    height: canvas.height * 0.10,
    speedY: 1.5 + Math.random() * 2,
    direction: 1
  };
  movingObstacles.push(obstacle);
}

function updateMovingObstacles() {
  for (let obs of movingObstacles) {
    obs.y += obs.speedY * obs.direction;
    if (obs.y <= 0 || obs.y + obs.height >= canvas.height) obs.direction *= -1;
    obs.x -= 2.5;
  }
  movingObstacles = movingObstacles.filter(obs => obs.x + obs.width > 0);
}

function drawMovingObstacles() {
  for (let obs of movingObstacles) {
    ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);
  }
}

function checkObstacleCollision() {
  for (let obs of movingObstacles) {
    const hit = 50 < obs.x + obs.width &&
                75 > obs.x &&
                pepeY < obs.y + obs.height &&
                pepeY + canvas.height * 0.075 > obs.y;

    if (hit && !gameOver) {
      gameOver = true;
      crashSound.currentTime = 0;
      crashSound.play();
      crySound.currentTime = 0;
      crySound.play();
      document.getElementById("gameOverText").classList.remove("hidden");
    }
  }
}

function update() {
  pepeVelocity += gravity;
  pepeY += pepeVelocity;

  const maxY = canvas.height - canvas.height * 0.075;
  if (pepeY > maxY) {
    pepeY = maxY;
    pepeVelocity = 0;
  }
  if (pepeY < 0) {
    pepeY = 0;
    pepeVelocity = 0;
  }
}

function drawBackground() {
  bgX -= 0.2;
  if (bgX <= -canvas.width) bgX = 0;
  ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawMovingObstacles();
  const currentPepe = gameOver ? pepeCryImg : pepeImg;
  ctx.drawImage(currentPepe, 50, pepeY, canvas.height * 0.075, canvas.height * 0.075);
  drawPipes();
  document.getElementById("scoreDisplay").textContent = "Score: " + score;
  document.getElementById("highScoreDisplay").textContent = "High Score: " + highScore;
}

function loop() {
  if (!gameOver) {
    update();
    updatePipes();
    if (frames % (60 * 10) === 0) createMovingObstacle();
    updateMovingObstacles();
    checkObstacleCollision();
    checkCollision();
    draw();
    frames++;
    requestAnimationFrame(loop);
  } else {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("flappyPepeHighScore", highScore);
    }
    draw();
    document.getElementById("restartBtn").classList.remove("hidden");
  }
}

function restartGame() {
  movingObstacles = [];
  pepeY = canvas.height * 0.25;
  pepeVelocity = 0;
  pipes = [];
  frames = 0;
  score = 0;
  pipeGap = canvas.height * 0.25;
  gameOver = false;
  crySound.pause();
  crySound.currentTime = 0;
  document.getElementById("gameOverText").classList.add("hidden");
  document.getElementById("restartBtn").classList.add("hidden");
  requestAnimationFrame(loop);
}

// 🎮 Controls
document.addEventListener("keydown", () => {
  if (!gameOver) {
    pepeVelocity = jump;
    flapSound.currentTime = 0;
    flapSound.play();
  }
});

canvas.addEventListener("touchstart", () => {
  if (!gameOver) {
    pepeVelocity = jump;
    flapSound.currentTime = 0;
    flapSound.play();
  }
});

document.getElementById("restartBtn").addEventListener("click", restartGame);

// ✅ Start Game After Image Loads
pepeImg.onload = () => {
  resizeCanvas();
  requestAnimationFrame(loop);
};
