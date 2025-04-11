class FloatingText {
  constructor(x, y, text, color = "rgba(0, 255, 157, 1)") {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.opacity = 1;
    this.markedForDeletion = false;
    this.speed = 1 * gameScale;
    this.size = 20 * gameScale;
  }

  update() {
    this.y -= this.speed;
    this.opacity -= 0.02;
    this.size += 0.3 * gameScale;
    if (this.opacity <= 0) this.markedForDeletion = true;
  }

  draw() {
    context.save();
    context.globalAlpha = this.opacity;
    context.fillStyle = this.color;
    context.font = `${this.size}px Orbitron`;
    context.textAlign = "center";
    context.shadowColor = this.color;
    context.shadowBlur = 10 * gameScale;
    context.fillText(this.text, this.x, this.y);
    context.restore();
  }
}
