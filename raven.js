class Raven {
  constructor() {
    this.image = new Image();
    this.image.src = "assets/images/raven.png";
    this.spriteWidth = 271;
    this.spriteHeight = 194;

    // Determine raven type
    this.type = ravenTypes[Math.floor(Math.random() * ravenTypes.length)];

    this.size =
      (Math.random() * 0.2 + 0.3) * this.type.sizeMultiplier * gameScale;
    this.width = this.spriteWidth * this.size;
    this.height = this.spriteHeight * this.size;
    this.x = canvasWidth;
    this.y = Math.random() * (canvasHeight - this.height);
    this.markedForDeletion = false;
    this.directionX =
      (Math.random() * 2 + 2) * this.type.speedMultiplier * gameScale;
    this.directionY = Math.random() * 4 - 2;
    this.frame = 0;
    this.maxFrame = 4;
    this.timer = 0;
    this.interval = Math.floor(Math.random() * 100 + 100);
    this.health = Math.ceil(this.type.healthMultiplier);
    this.trailTimer = 0;
    this.trailInterval = 5;
    this.randomColors = [
      Math.floor(Math.random() * 100),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 100),
    ];
    this.color = this.type.color;
    this.points = this.type.points;

    // Add unique movement patterns based on type
    if (this.type.name === "speedy") {
      this.zigzag = true;
      this.zigzagTimer = 0;
      this.zigzagInterval = Math.random() * 50 + 50;
    } else if (this.type.name === "tank") {
      this.zigzag = false;
      this.chargeTimer = 0;
      this.chargeInterval = Math.random() * 200 + 300;
      this.charging = false;
    }
  }

  update(deltatime) {
    // Special movement patterns
    if (this.type.name === "speedy" && this.zigzag) {
      this.zigzagTimer += deltatime;
      if (this.zigzagTimer > this.zigzagInterval) {
        this.directionY = -this.directionY;
        this.zigzagTimer = 0;
      }
    } else if (this.type.name === "tank") {
      this.chargeTimer += deltatime;
      if (this.chargeTimer > this.chargeInterval && !this.charging) {
        this.charging = true;
        this.directionX *= 2;
        setTimeout(() => {
          if (!this.markedForDeletion) {
            this.directionX /= 2;
            this.charging = false;
            this.chargeTimer = 0;
          }
        }, 1000);
      }
    }

    this.x -= this.directionX;
    this.y += this.directionY;

    // Create trail particles
    this.trailTimer++;
    if (this.trailTimer >= this.trailInterval) {
      particles.push(
        new Particle(
          this.x + this.width * 0.7,
          this.y + this.height * 0.4,
          this.color
        )
      );
      this.trailTimer = 0;
    }

    if (this.x < -this.width) {
      this.markedForDeletion = true;
      if (!gameOver) {
        loseLife();
      }
    }

    if (this.y < 0 || this.y + this.height > canvasHeight) {
      this.directionY *= -1;
    }

    if (this.timer > this.interval) {
      if (this.frame >= this.maxFrame) this.frame = 0;
      else this.frame++;
      this.timer = 0;
    } else {
      this.timer += deltatime;
    }
  }

  draw() {
    context.save();

    // Draw glow effect based on raven type
    if (this.type.name === "speedy") {
      context.shadowColor = "rgba(255, 217, 0, 0.8)";
    } else if (this.type.name === "tank") {
      context.shadowColor = "rgba(255, 0, 85, 0.8)";
    } else {
      context.shadowColor = "rgba(0, 255, 157, 0.8)";
    }

    context.shadowBlur = 15 * gameScale;

    // Draw charging effect for tank ravens
    if (this.type.name === "tank" && this.charging) {
      context.shadowBlur = 25 * gameScale;
      context.shadowColor = "rgba(255, 0, 0, 0.8)";
    }

    context.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );

    // Health bar for ravens with more than 1 health
    if (this.health > 1) {
      const healthBarWidth = this.width;
      const healthBarHeight = 5 * gameScale;
      const healthPercentage = this.health / this.type.healthMultiplier;

      context.fillStyle = "rgba(0, 0, 0, 0.5)";
      context.fillRect(
        this.x,
        this.y - 10 * gameScale,
        healthBarWidth,
        healthBarHeight
      );

      context.fillStyle = this.color;
      context.fillRect(
        this.x,
        this.y - 10 * gameScale,
        healthBarWidth * healthPercentage,
        healthBarHeight
      );
    }

    context.restore();
  }

  hit() {
    this.health--;
    if (this.health <= 0) {
      this.markedForDeletion = true;
      return true; // Raven died
    }
    return false; // Raven still alive
  }
}
