class PowerUp {
  constructor() {
    this.width = 30 * gameScale;
    this.height = 30 * gameScale;
    this.x = Math.random() * (canvasWidth - this.width);
    this.y = Math.random() * (canvasHeight - this.height);
    this.markedForDeletion = false;
    this.timer = 0;
    this.interval = 10000; // 10 seconds before disappearing
    this.angle = 0;
    this.va = 0.05; // Velocity of angle

    // Random power-up type
    this.types = ["extraLife", "clearScreen", "slowTime"];
    this.type = this.types[Math.floor(Math.random() * this.types.length)];

    // Set color based on type
    if (this.type === "extraLife") {
      this.color = "rgba(255, 0, 85, 0.8)"; // Pink
    } else if (this.type === "clearScreen") {
      this.color = "rgba(255, 217, 0, 0.8)"; // Yellow
    } else if (this.type === "slowTime") {
      this.color = "rgba(0, 255, 255, 0.8)"; // Cyan
    }
  }

  update(deltatime) {
    this.timer += deltatime;
    if (this.timer > this.interval) {
      this.markedForDeletion = true;
    }

    this.angle += this.va;

    // Pulsate
    this.scale = 1 + Math.sin(this.timer * 0.01) * 0.1;
  }

  draw() {
    context.save();
    context.translate(this.x + this.width / 2, this.y + this.height / 2);
    context.rotate(this.angle);
    context.scale(this.scale, this.scale);

    // Draw power-up
    context.fillStyle = this.color;
    context.shadowColor = this.color;
    context.shadowBlur = 15 * gameScale;

    // Draw different shapes based on type
    if (this.type === "extraLife") {
      // Heart shape
      context.beginPath();
      context.moveTo(0, -10 * gameScale);
      context.bezierCurveTo(
        10 * gameScale,
        -20 * gameScale,
        20 * gameScale,
        -10 * gameScale,
        0,
        10 * gameScale
      );
      context.bezierCurveTo(
        -20 * gameScale,
        -10 * gameScale,
        -10 * gameScale,
        -20 * gameScale,
        0,
        -10 * gameScale
      );
      context.fill();
    } else if (this.type === "clearScreen") {
      // Star shape
      context.beginPath();
      for (let i = 0; i < 5; i++) {
        context.lineTo(
          Math.cos((i * 2 * Math.PI) / 5 - Math.PI / 2) * 15 * gameScale,
          Math.sin((i * 2 * Math.PI) / 5 - Math.PI / 2) * 15 * gameScale
        );
        context.lineTo(
          Math.cos(((i * 2 + 1) * Math.PI) / 5 - Math.PI / 2) * 7 * gameScale,
          Math.sin(((i * 2 + 1) * Math.PI) / 5 - Math.PI / 2) * 7 * gameScale
        );
      }
      context.closePath();
      context.fill();
    } else if (this.type === "slowTime") {
      // Clock shape
      context.beginPath();
      context.arc(0, 0, 15 * gameScale, 0, Math.PI * 2);
      context.fill();

      // Clock hands
      context.strokeStyle = "rgba(0, 0, 0, 0.8)";
      context.lineWidth = 2 * gameScale;
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(0, -10 * gameScale);
      context.stroke();

      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(8 * gameScale, 0);
      context.stroke();
    }

    context.restore();
  }

  activate() {
    if (this.type === "extraLife") {
      lives++;
      floatingTexts.push(
        new FloatingText(this.x, this.y, "+1 LIFE", this.color)
      );
      updateScore(); // Update the HUD
    } else if (this.type === "clearScreen") {
      // Clear all ravens and add score
      ravens.forEach((raven) => {
        score += raven.points;
        explosions.push(
          new Explosion(
            raven.x + raven.width * 0.5,
            raven.y + raven.height * 0.5,
            raven.size,
            raven.color
          )
        );
      });
      ravens = [];
      floatingTexts.push(
        new FloatingText(this.x, this.y, "CLEAR!", this.color)
      );
      updateScore(); // Update the HUD
    } else if (this.type === "slowTime") {
      // Slow down all ravens
      ravens.forEach((raven) => {
        raven.directionX *= 0.5;
      });
      floatingTexts.push(
        new FloatingText(this.x, this.y, "SLOW TIME", this.color)
      );

      // Reset speed after 5 seconds
      setTimeout(() => {
        ravens.forEach((raven) => {
          raven.directionX *= 2;
        });
      }, 5000);
    }

    this.markedForDeletion = true;
  }
}
