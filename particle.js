class Particle {
  constructor(x, y, color = "rgba(0, 255, 157, 0.8)") {
    this.x = x;
    this.y = y;
    this.speedY = (Math.random() * 2 - 1) * gameScale;
    this.speedX = (Math.random() * 2 - 1) * gameScale;
    this.size = (Math.random() * 5 + 3) * gameScale;
    this.markedForDeletion = false;
    this.color = color;
    this.angle = Math.random() * Math.PI * 2;
    this.va = Math.random() * 0.2 - 0.1; // Velocity of angle
    this.bounced = false;
    this.gravity = Math.random() * 0.1 * gameScale;
    this.friction = 0.98;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity;
    this.speedX *= this.friction;
    this.speedY *= this.friction;
    this.angle += this.va;

    // Bounce off the bottom
    if (this.y > canvasHeight - this.size && !this.bounced) {
      this.speedY = -this.speedY * 0.5;
      this.bounced = true;
    }

    if (this.size <= 0.5) this.markedForDeletion = true;
    this.size -= 0.1 * gameScale;
  }

  draw() {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.angle);

    context.fillStyle = this.color;
    context.shadowColor = this.color;
    context.shadowBlur = 10 * gameScale;

    // Draw a more interesting particle shape
    context.beginPath();
    context.moveTo(0, -this.size);
    context.lineTo(this.size * 0.7, this.size * 0.7);
    context.lineTo(-this.size * 0.7, this.size * 0.7);
    context.closePath();
    context.fill();

    context.restore();
  }
}
