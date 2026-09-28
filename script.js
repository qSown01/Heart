// Khởi tạo Canvas
const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// Hàm toán học vẽ hình trái tim
function getHeartPoint(t, scale) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x: x * scale, y: y * scale };
}

// Lớp đối tượng hạt phát sáng
class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.t = Math.random() * Math.PI * 2;
    const pos = getHeartPoint(this.t, 10);
    this.x = width / 2 + pos.x;
    this.y = height / 2 + pos.y;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.alpha = Math.random() * 0.8 + 0.2;
    this.size = Math.random() * 2 + 1;
    this.decay = Math.random() * 0.015 + 0.005;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    if (this.alpha <= 0) this.reset();
  }
  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 75, 110, ${this.alpha})`;
    ctx.shadowColor = "#ff2a5f";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }
}

const particles = [];
for (let i = 0; i < 150; i++) {
  particles.push(new Particle());
}

let step = 0;

function render() {
  ctx.fillStyle = "rgba(5, 5, 10, 0.25)";
  ctx.fillRect(0, 0, width, height);

  step += 0.05;
  const beatScale = 10.5 + Math.sin(step) * 1.0;

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.beginPath();
  for (let t = 0; t <= Math.PI * 2; t += 0.05) {
    const point = getHeartPoint(t, beatScale);
    if (t === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.closePath();

  ctx.shadowColor = "#ff1744";
  ctx.shadowBlur = 25;
  ctx.strokeStyle = "#ff4081";
  ctx.lineWidth = 3;
  ctx.stroke();

  const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, beatScale * 18);
  gradient.addColorStop(0, "rgba(255, 23, 68, 0.85)");
  gradient.addColorStop(0.7, "rgba(255, 64, 129, 0.35)");
  gradient.addColorStop(1, "rgba(255, 64, 129, 0)");
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }

  requestAnimationFrame(render);
}

render();