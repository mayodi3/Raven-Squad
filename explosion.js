class Explosion {
  constructor(x, y, scale, color = "rgba(0, 255, 157, 0.8)") {
    this.image = new Image();
    this.image.src = "assets/images/boom.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.scale = scale;
    this.width = this.spriteWidth * this.scale;
    this.height = this.spriteHeight * this.scale;
    this.x = x - this.width * 0.5;
    this.y = y - this.height * 0.5;
    this.markedForDeletion = false;
    this.frame = 0;
    this.maxFrame = 5;
    this.timer = 0;
    this.interval = 100; // Faster animation
    this.audio = new Audio("assets/audio/explosion.mp3");
    this.color = color;

    // Create explosion particles
    for (let i = 0; i < 20; i++) {
      particles.push(new Particle(x, y, this.color));
    }

    // Add screen shake
    screenShake = 10 * gameScale;
  }

  update(deltatime) {
    if (this.timer > this.interval) {
      if (this.frame === 0) this.audio.play();
      if (this.frame >= this.maxFrame) {
        this.markedForDeletion = true;
      } else {
        this.frame++;
      }
      this.timer = 0;
    } else {
      this.timer += deltatime;
    }
  }

  draw() {
    context.save();
    context.globalAlpha = 1 - this.frame * 0.2; // Fade out

    // Add a colored tint to the explosion
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

    // Add glow effect
    context.shadowColor = this.color;
    context.shadowBlur = 20 * gameScale;
    context.globalAlpha = 0.4;
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

    context.restore();
  }
}
