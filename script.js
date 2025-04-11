/**@type {HTMLCanvasElement} */

const canvas = document.getElementById("canvas1");
const context = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;

let canvasWidth = 800;
let canvasHeight = 600;

const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");
const mainMenuBtn = document.getElementById("mainMenuBtn");
const instructionsBtn = document.getElementById("instructionsBtn");
const backToMenuBtn = document.getElementById("backToMenuBtn");
const scoreDisplay = document.getElementById("scoreDisplay");
const gameOverControls = document.getElementById("gameOverControls");
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const instructionsScreen = document.getElementById("instructionsScreen");

let ravens = [];
let particles = [];
let explosions = [];
let powerUps = [];
let floatingTexts = [];

let score = 0;
let lives = 3;
let gameOver = false;
let level = 1;
let combo = 0;
let comboTimer = 0;
const comboTimeout = 2000;
let screenShake = 0;
let gameScale = 1;

let lastTime = 0;
let ravenTimer = 0;
let timeToNextRaven = 100;
let hasGameStarted = false;
let hasMusicStarted = false;
let difficultyTimer = 0;
let levelTimer = 0;
const difficultyInterval = 5000; // Increase difficulty every 5 seconds
const levelInterval = 30000; // Level up every 30 seconds
let powerUpTimer = 0;
const powerUpInterval = 15000; // Spawn power-up every 15 seconds

const lastTouch = { x: 0, y: 0 };
let isTouching = false;

const gameOverSound = new Audio("assets/audio/gameover.mp3");
let gameOverSoundPlayed = false;

const bgMusic = new Audio("assets/audio/background.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;

const stars = [];
for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    radius: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.8 + 0.2,
    speed: Math.random() * 0.05 + 0.01,
  });
}

function toggleFullScreen() {
  const doc = window.document;
  const docEl = doc.documentElement;

  const requestFullScreen =
    docEl.requestFullscreen ||
    docEl.mozRequestFullScreen ||
    docEl.webkitRequestFullScreen ||
    docEl.msRequestFullscreen;

  const exitFullScreen =
    doc.exitFullscreen ||
    doc.mozCancelFullScreen ||
    doc.webkitExitFullscreen ||
    doc.msExitFullscreen;

  if (
    !doc.fullscreenElement &&
    !doc.mozFullScreenElement &&
    !doc.webkitFullscreenElement &&
    !doc.msFullscreenElement
  ) {
    requestFullScreen.call(docEl);
    lockScreenOrientation();
  } else {
    exitFullScreen.call(doc);
  }
}

function handleFullscreenChange() {
  const isFullscreen =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;

  // Update button text based on fullscreen state
  const fullscreenBtns = document.querySelectorAll(
    "#fullscreenBtn, #fullscreenGameOverBtn"
  );
  fullscreenBtns.forEach((btn) => {
    const textSpan = btn.querySelector(".cyber-button__text");
    if (textSpan) {
      textSpan.textContent = isFullscreen ? "Exit Fullscreen" : "Fullscreen";
    }
  });

  // If entering fullscreen on mobile, try to force landscape
  if (isFullscreen && window.innerWidth < 920) {
    lockScreenOrientation();
  }

  // Resize canvas to ensure it fills the screen in fullscreen mode
  resizeCanvas();
}

// Screen navigation functions
function showScreen(screen) {
  // Hide all screens
  startScreen.style.display = "none";
  gameScreen.style.display = "none";
  instructionsScreen.style.display = "none";

  // Show the requested screen
  screen.style.display = "flex";
}

function goToMainMenu() {
  if (gameScreen.style.display !== "none") {
    resetGameState();
  }

  gameOverControls.style.display = "none";

  bgMusic.pause();
  bgMusic.currentTime = 0;

  showScreen(startScreen);
}

function resetGameState() {
  ravens = [];
  particles = [];
  explosions = [];
  powerUps = [];
  floatingTexts = [];
  score = 0;
  lives = 3;
  level = 1;
  combo = 0;
  comboTimer = 0;
  gameOver = false;
  gameOverSoundPlayed = false;
  updateScore();
}

// Resize canvas and game elements based on window size
function resizeCanvas() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  canvas.style.width = `${windowWidth}px`;
  canvas.style.height = `${windowHeight}px`;

  canvas.width = windowWidth * dpr;
  canvas.height = windowHeight * dpr;

  context.scale(dpr, dpr);

  const scaleX = windowWidth / 800;
  const scaleY = windowHeight / 600;
  gameScale = Math.min(scaleX, scaleY);

  canvasWidth = windowWidth;
  canvasHeight = windowHeight;

  context.font = `${28 * gameScale}px Orbitron`;

  // Reposition stars
  stars.forEach((star) => {
    star.x = Math.random() * canvasWidth;
    star.y = Math.random() * canvasHeight;
  });
}

function drawStars() {
  context.save();
  stars.forEach((star) => {
    context.beginPath();
    context.arc(star.x, star.y, star.radius * gameScale, 0, Math.PI * 2);
    context.fillStyle = `rgba(0, 255, 157, ${star.opacity})`;
    context.shadowColor = "rgba(0, 255, 157, 1)";
    context.shadowBlur = 10 * gameScale;
    context.fill();

    // Move stars
    star.y += star.speed * gameScale;
    if (star.y > canvasHeight) {
      star.y = 0;
      star.x = Math.random() * canvasWidth;
    }
  });
  context.restore();
}

// Enhanced lockScreenOrientation function
function lockScreenOrientation() {
  try {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock("landscape").catch((error) => {
        console.log("Orientation lock failed: " + error);
      });
    } else if (screen.lockOrientation) {
      screen.lockOrientation("landscape");
    } else if (screen.mozLockOrientation) {
      screen.mozLockOrientation("landscape");
    } else if (screen.msLockOrientation) {
      screen.msLockOrientation("landscape");
    }
  } catch (e) {
    console.log("Screen orientation API not supported");
  }
}

// Raven types
const ravenTypes = [
  {
    name: "standard",
    speedMultiplier: 1,
    healthMultiplier: 1,
    sizeMultiplier: 1,
    color: "rgba(0, 255, 157, 0.8)",
    points: 1,
  },
  {
    name: "speedy",
    speedMultiplier: 1.8,
    healthMultiplier: 0.7,
    sizeMultiplier: 0.8,
    color: "rgba(255, 217, 0, 0.8)",
    points: 2,
  },
  {
    name: "tank",
    speedMultiplier: 0.6,
    healthMultiplier: 3,
    sizeMultiplier: 1.3,
    color: "rgba(255, 0, 85, 0.8)",
    points: 3,
  },
];

function loseLife() {
  lives--;
  screenShake = 20 * gameScale;

  // Create red flash effect
  context.save();
  context.fillStyle = "rgba(255, 0, 0, 0.3)";
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  context.restore();

  updateScore(); // Update the HUD

  if (lives <= 0) {
    gameOver = true;
  }
}

// Handle mouse clicks
function handleClick(x, y) {
  // Add click effect
  for (let i = 0; i < 5; i++) {
    particles.push(new Particle(x, y, "rgba(255, 255, 255, 0.8)"));
  }

  // Check for power-up collision
  powerUps.forEach((powerUp) => {
    if (
      x >= powerUp.x &&
      x <= powerUp.x + powerUp.width &&
      y >= powerUp.y &&
      y <= powerUp.y + powerUp.height
    ) {
      powerUp.activate();
    }
  });

  // Check for raven collision
  let ravenHit = false;
  ravens.forEach((raven) => {
    if (
      x >= raven.x &&
      x <= raven.x + raven.width &&
      y >= raven.y &&
      y <= raven.y + raven.height
    ) {
      ravenHit = true;
      const ravenDied = raven.hit();

      if (ravenDied) {
        // Update combo
        combo++;
        comboTimer = 0;

        // Add score with combo multiplier
        const pointsEarned = raven.points * (1 + Math.min(combo - 1, 4) * 0.5);
        score += pointsEarned;

        // Show floating score text
        floatingTexts.push(
          new FloatingText(
            raven.x + raven.width * 0.5,
            raven.y,
            `+${pointsEarned.toFixed(1)}`,
            raven.color
          )
        );

        // Show combo text if combo > 1
        if (combo > 1) {
          floatingTexts.push(
            new FloatingText(
              raven.x + raven.width * 0.5,
              raven.y - 30 * gameScale,
              `COMBO x${combo}`,
              "rgba(255, 255, 255, 0.8)"
            )
          );
        }

        explosions.push(
          new Explosion(
            raven.x + raven.width * 0.5,
            raven.y + raven.height * 0.5,
            raven.size * 1.5,
            raven.color
          )
        );

        updateScore(); // Update the HUD
      } else {
        // Raven was hit but not killed
        floatingTexts.push(
          new FloatingText(
            raven.x + raven.width * 0.5,
            raven.y,
            "HIT!",
            raven.color
          )
        );
      }
    }
  });

  // Reset combo if no raven was hit
  if (!ravenHit) {
    combo = 0;
  }
}

// Mouse event listeners
window.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX =
    (event.clientX - rect.left) * (canvas.width / rect.width / dpr);
  const mouseY =
    (event.clientY - rect.top) * (canvas.height / rect.height / dpr);

  handleClick(mouseX, mouseY);
});

// Touch event listeners for mobile
canvas.addEventListener("touchstart", (event) => {
  event.preventDefault(); // Prevent default touch behavior

  const rect = canvas.getBoundingClientRect();
  const touch = event.touches[0];

  lastTouch.x = (touch.clientX - rect.left) * (canvas.width / rect.width / dpr);
  lastTouch.y =
    (touch.clientY - rect.top) * (canvas.height / rect.height / dpr);

  isTouching = true;

  handleClick(lastTouch.x, lastTouch.y);
});

canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();

  if (isTouching) {
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];

    lastTouch.x =
      (touch.clientX - rect.left) * (canvas.width / rect.width / dpr);
    lastTouch.y =
      (touch.clientY - rect.top) * (canvas.height / rect.height / dpr);
  }
});

canvas.addEventListener("touchend", () => {
  isTouching = false;
});

// Handle screen orientation
function handleOrientation() {
  if (
    window.innerHeight > window.innerWidth &&
    window.matchMedia("(max-width: 920px)").matches
  ) {
    // Portrait mode on mobile - pause the game if it's running
    if (hasGameStarted && !gameOver) {
      // We could pause the game here if needed
    }
  } else {
    // Landscape mode or desktop - resume if needed
    resizeCanvas();
  }
}

// Listen for orientation changes
window.addEventListener("orientationchange", () => {
  setTimeout(handleOrientation, 200); // Small delay to allow the browser to update dimensions
});

window.addEventListener("resize", handleOrientation);

// Initial check
handleOrientation();

function updateScore() {
  // Update the HUD with hearts for lives
  scoreDisplay.innerHTML = `
    <span class="score">Score: ${Math.floor(score)}</span>
    <span class="level">Level: ${level}</span>
    <span class="lives">${"❤️".repeat(lives)}</span>
    ${combo > 1 ? `<span class="combo">Combo x${combo}</span>` : ""}
  `;
}

function drawGameOverText() {
  context.save();

  // Background overlay
  context.fillStyle = "rgba(0, 0, 0, 0.7)";
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  // Game Over text
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `${60 * gameScale}px Orbitron`;
  context.fillStyle = "rgba(0, 255, 157, 1)";
  context.shadowColor = "rgba(0, 255, 157, 1)";
  context.shadowBlur = 15 * gameScale;
  context.fillText("GAME OVER", canvasWidth * 0.5, canvasHeight * 0.4);

  // Final score
  context.font = `${30 * gameScale}px Orbitron`;
  context.fillText(
    `Final Score: ${Math.floor(score)}`,
    canvasWidth * 0.5,
    canvasHeight * 0.5
  );
  context.fillText(
    `Level Reached: ${level}`,
    canvasWidth * 0.5,
    canvasHeight * 0.6
  );

  context.restore();

  // Show game over controls
  gameOverControls.style.display = "flex";
}

function fadeOutAudio(audio, duration = 1000) {
  const startVol = audio.volume;
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    audio.volume = Math.max(0, startVol * (1 - elapsed / duration));
    if (elapsed < duration) {
      requestAnimationFrame(step);
    } else {
      audio.pause();
      audio.volume = startVol;
    }
  }
  requestAnimationFrame(step);
}

function restartGame() {
  ravens = [];
  particles = [];
  explosions = [];
  powerUps = [];
  floatingTexts = [];
  score = 0;
  lives = 3;
  level = 1;
  combo = 0;
  comboTimer = 0;
  gameOver = false;
  gameOverSoundPlayed = false;
  hasMusicStarted = true;
  hasGameStarted = true;

  bgMusic.currentTime = 0;
  bgMusic.volume = 0.4;
  bgMusic.play().catch(() => {});

  gameOverControls.style.display = "none";
  updateScore();

  animate(0);
}

// Button event listeners
restartBtn.addEventListener("click", () => {
  restartGame();
});

mainMenuBtn.addEventListener("click", () => {
  goToMainMenu();
});

startBtn.addEventListener("click", () => {
  showScreen(gameScreen);
  hasMusicStarted = true;
  hasGameStarted = true;
  resizeCanvas(); // Make sure canvas is properly sized
  bgMusic.play().catch(() => {});
  lockScreenOrientation(); // Try to lock orientation
  animate(0);
});

instructionsBtn.addEventListener("click", () => {
  showScreen(instructionsScreen);
});

backToMenuBtn.addEventListener("click", () => {
  showScreen(startScreen);
});

function applyScreenShake() {
  if (screenShake > 0) {
    const shakeX = Math.random() * screenShake - screenShake / 2;
    const shakeY = Math.random() * screenShake - screenShake / 2;
    context.translate(shakeX, shakeY);
    screenShake *= 0.9; // Reduce shake over time
    if (screenShake < 0.5) screenShake = 0;
  }
}

function animate(timeStamp) {
  if (!hasMusicStarted) {
    bgMusic.play().catch(() => {});
    hasMusicStarted = true;
  }

  context.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw stars background
  drawStars();

  // Apply screen shake
  context.save();
  applyScreenShake();

  const deltatime = timeStamp - lastTime;
  lastTime = timeStamp;

  // Update combo timer
  if (combo > 1) {
    comboTimer += deltatime;
    if (comboTimer > comboTimeout) {
      combo = 0;
      updateScore(); // Update the HUD when combo expires
    }
  }

  // Increase difficulty over time
  difficultyTimer += deltatime;
  if (difficultyTimer > difficultyInterval && !gameOver) {
    timeToNextRaven = Math.max(50, timeToNextRaven * 0.95);
    difficultyTimer = 0;
  }

  // Level up over time
  levelTimer += deltatime;
  if (levelTimer > levelInterval && !gameOver) {
    level++;
    levelTimer = 0;
    floatingTexts.push(
      new FloatingText(
        canvasWidth * 0.5,
        canvasHeight * 0.5,
        `LEVEL ${level}!`,
        "rgba(255, 255, 255, 0.9)"
      )
    );
    updateScore();
  }

  powerUpTimer += deltatime;
  if (powerUpTimer > powerUpInterval && !gameOver) {
    powerUps.push(new PowerUp());
    powerUpTimer = 0;
  }

  if (ravenTimer > timeToNextRaven) {
    ravens.push(new Raven());
    ravenTimer = 0;
    ravens.sort((a, b) => a.width - b.width);
  } else {
    ravenTimer++;
  }
  [
    ...particles,
    ...ravens,
    ...explosions,
    ...powerUps,
    ...floatingTexts,
  ].forEach((object) => object.update(deltatime));
  [
    ...particles,
    ...ravens,
    ...explosions,
    ...powerUps,
    ...floatingTexts,
  ].forEach((object) => object.draw());

  ravens = ravens.filter((raven) => !raven.markedForDeletion);
  explosions = explosions.filter((explosion) => !explosion.markedForDeletion);
  particles = particles.filter((particle) => !particle.markedForDeletion);
  powerUps = powerUps.filter((powerUp) => !powerUp.markedForDeletion);
  floatingTexts = floatingTexts.filter((text) => !text.markedForDeletion);

  // Restore context after screen shake
  context.restore();

  if (gameOver) {
    drawGameOverText();
    if (!gameOverSoundPlayed) {
      gameOverSound.play();
      gameOverSoundPlayed = true;
      fadeOutAudio(bgMusic, 1500);
    }

    return;
  } else {
    // Restart bg music if needed
    if (bgMusic.paused && !gameOverSoundPlayed) {
      bgMusic.currentTime = 0;
      bgMusic.play().catch(() => {});
    }
  }

  if (!gameOver && hasGameStarted) requestAnimationFrame(animate);
}

// Initialize the game
document.addEventListener("DOMContentLoaded", () => {
  const clickSound = new Audio("assets/audio/click.mp3");
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    if (button.id !== "startBtn" && button.id !== "restartBtn") {
      button.addEventListener("click", () => {
        clickSound.play();
      });
    }
  });
  // Auto-enter fullscreen when starting the game
  const startBtn = document.getElementById("startBtn");
  if (startBtn) {
    const originalClickHandler = startBtn.onclick;
    startBtn.onclick = function (e) {
      if (originalClickHandler) originalClickHandler.call(this, e);
      setTimeout(toggleFullScreen, 100);
    };
  }
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
updateScore();
