/**
 * CHAOS LAB - PHÒNG THÍ NGHIỆM VẬT LÝ VÔ TRI & GAME XẢ STRESS
 * Thuần HTML5 Canvas + Web Audio API Synthesis (Không phụ thuộc thư viện ngoài)
 */

// ==========================================
// 1. HỆ THỐNG ÂM THANH (WEB AUDIO SYNTHESIZER)
// ==========================================
class SoundSynth {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.init();
    }

    init() {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            this.ctx = new AudioCtx();
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Tiếng Vịt Quạc Quạc (Rubber Duck Squawk)
    playQuack() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        // Hiệu ứng luyến tần số đặc trưng tiếng vịt cao su
        osc.frequency.setValueAtTime(320 + Math.random() * 60, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.22);

        // Filter làm âm thanh nghe "mũi/nghẹt" như vịt
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.Q.setValueAtTime(3, now);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Tiếng Bom Nổ Uy Lực (BOOM)
    playExplosion(intensity = 1) {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const duration = 0.6 * intensity;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Sinh tiếng ồn trắng (White noise)
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Lọc thông dải thấp (Lowpass) để tạo độ rền
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700 * intensity, now);
        filter.frequency.exponentialRampToValueAtTime(40, now + duration);

        // Sub-bass oscillator tăng độ rung đáy
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(140 * intensity, now);
        sub.frequency.exponentialRampToValueAtTime(30, now + duration);

        subGain.gain.setValueAtTime(0.5 * intensity, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.7 * intensity, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        sub.connect(subGain);
        subGain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration);
        sub.start(now);
        sub.stop(now + duration);
    }

    // Tiếng Nảy Tưng Tưng (Boing / Bounce)
    playBounce(pitchMultiplier = 1) {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startFreq = 220 * pitchMultiplier;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, now + 0.1);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Tiếng Laser Cắt (Slicing Swoosh)
    playLaser() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    // Tiếng Hút Xoáy Hố Đen (Vortex Singularity)
    playBlackhole() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(350, now + 0.35);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Tiếng Tích Tắc Hẹn Giờ Bom
    playTick() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    // Tiếng Ăn Điểm / Hoàn Thành
    playScore() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C - E - G - C
        const now = this.ctx.currentTime;

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.06);

            gain.gain.setValueAtTime(0.2, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.18);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.18);
        });
    }
}

const sounds = new SoundSynth();

// ==========================================
// 2. HỆ THỐNG VẬT LÝ & HIỆU ỨNG HẠT
// ==========================================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Trạng thái toàn cục
const state = {
    gravity: 0.55,
    friction: 0.985,
    bounce: 0.72,
    timeScale: 1.0,
    currentTool: 'duck',
    isSlowMo: false,
    gameMode: false,
    score: 0,
    gameOver: false,
    mousePos: { x: 0, y: 0 },
    isMouseDown: false,
    draggedObject: null,
    dragOffset: { x: 0, y: 0 },
    laserTrail: [],
    blackholes: []
};

// Mảng chứa các đối tượng thế giới vật lý
let objects = [];
let particles = [];
let shockwaves = [];
let bossDuck = null;

// Class Hạt Hiệu Ứng (Sparkles, Smoke, Shards)
class Particle {
    constructor(x, y, vx, vy, color, size, life, decay = 0.02) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
        this.decay = decay;
    }

    update() {
        this.x += this.vx * state.timeScale;
        this.y += this.vy * state.timeScale;
        this.vy += 0.15 * state.timeScale; // Hạt rơi nhẹ
        this.life -= this.decay * state.timeScale;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.5, this.size * (this.life / this.maxLife)), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Class Vòng Sóng Xung Kích (Shockwave)
class Shockwave {
    constructor(x, y, maxRadius = 240, color = '#00f0ff') {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.maxRadius = maxRadius;
        this.color = color;
        this.alpha = 1.0;
    }

    update() {
        this.radius += 14 * state.timeScale;
        this.alpha = 1 - (this.radius / this.maxRadius);
    }

    draw(ctx) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 6 * this.alpha;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

// ==========================================
// 3. CÁC LOẠI ĐỐI TƯỢNG VẬT LÝ (ENTITIES)
// ==========================================

// --- A. Vịt Vàng Cao Su (Rubber Duck) ---
class Duck {
    constructor(x, y, radius = 28, isBoss = false) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.radius = radius;
        this.isBoss = isBoss;
        this.health = isBoss ? 100 : 1;
        this.angle = 0;
        this.va = 0;
        this.type = 'duck';
        this.mass = isBoss ? 20 : 1.5;
        this.quackCooldown = 0;
    }

    update() {
        if (this === state.draggedObject) {
            return;
        }

        if (this.quackCooldown > 0) this.quackCooldown -= state.timeScale;

        // Trọng lực và chuyển động
        this.vy += state.gravity * state.timeScale;
        this.vx *= Math.pow(state.friction, state.timeScale);
        this.vy *= Math.pow(state.friction, state.timeScale);

        this.x += this.vx * state.timeScale;
        this.y += this.vy * state.timeScale;

        this.angle += (this.vx * 0.03) * state.timeScale;

        // Va chạm viền màn hình
        const b = state.bounce;
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx = -this.vx * b;
            this.onBounce();
        } else if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx = -this.vx * b;
            this.onBounce();
        }

        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy = -this.vy * b;
            this.onBounce();
        } else if (this.y + this.radius > height) {
            this.y = height - this.radius;
            this.vy = -this.vy * b;
            if (Math.abs(this.vy) > 2) this.onBounce();
        }
    }

    onBounce() {
        if (this.quackCooldown <= 0 && (Math.abs(this.vx) > 3 || Math.abs(this.vy) > 3)) {
            sounds.playQuack();
            this.quackCooldown = 25; // Giãn cách tiếng kêu
            spawnSparks(this.x, this.y, '#ffd166', 4);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        const r = this.radius;

        // Thân Vịt (Bầu dục vàng)
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cánh Vịt
        ctx.fillStyle = '#f4b400';
        ctx.beginPath();
        ctx.ellipse(-r * 0.25, 0, r * 0.45, r * 0.35, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Mỏ Vịt (Cam nhọn)
        const facing = this.vx >= 0 ? 1 : -1;
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.moveTo(facing * r * 0.7, -r * 0.1);
        ctx.lineTo(facing * (r * 1.35), 0);
        ctx.lineTo(facing * r * 0.7, r * 0.2);
        ctx.closePath();
        ctx.fill();

        // Mắt To Tròn theo dõi con trỏ chuột
        const eyeX = facing * r * 0.35;
        const eyeY = -r * 0.3;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, r * 0.24, 0, Math.PI * 2);
        ctx.fill();

        // Con ngươi liếc về chuột
        const angleToMouse = Math.atan2(state.mousePos.y - (this.y + eyeY), state.mousePos.x - (this.x + eyeX));
        const pupilDist = r * 0.08;
        const pupilX = eyeX + Math.cos(angleToMouse) * pupilDist;
        const pupilY = eyeY + Math.sin(angleToMouse) * pupilDist;

        ctx.fillStyle = '#05070f';
        ctx.beginPath();
        ctx.arc(pupilX, pupilY, r * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Ánh sáng lấp lánh trong mắt
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pupilX - 1, pupilY - 1, r * 0.04, 0, Math.PI * 2);
        ctx.fill();

        // Nếu là Boss Vịt: Đội vương miện & thanh máu
        if (this.isBoss) {
            ctx.fillStyle = '#ffd700';
            ctx.shadowColor = '#ffb703';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(-r * 0.6, -r * 0.9);
            ctx.lineTo(-r * 0.8, -r * 1.5);
            ctx.lineTo(-r * 0.2, -r * 1.15);
            ctx.lineTo(0, -r * 1.6);
            ctx.lineTo(r * 0.2, -r * 1.15);
            ctx.lineTo(r * 0.8, -r * 1.5);
            ctx.lineTo(r * 0.6, -r * 0.9);
            ctx.closePath();
            ctx.fill();

            // Vẽ thanh máu Boss
            ctx.restore();
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(-50, -r - 28, 100, 10);
            ctx.fillStyle = this.health > 40 ? '#00f0ff' : '#ff3344';
            ctx.fillRect(-49, -r - 27, Math.max(0, (this.health / 100) * 98), 8);
        }

        ctx.restore();
    }
}

// --- B. Bom Hẹn Giờ C4 Sóng Xung Kích (Bomb) ---
class Bomb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.radius = 26;
        this.mass = 2.5;
        this.timer = 150; // Khoảng 2.5 giây ở 60fps
        this.type = 'bomb';
        this.pulse = 0;
    }

    update() {
        if (this === state.draggedObject) {
            return;
        }

        this.vy += state.gravity * state.timeScale;
        this.vx *= Math.pow(state.friction, state.timeScale);
        this.vy *= Math.pow(state.friction, state.timeScale);

        this.x += this.vx * state.timeScale;
        this.y += this.vy * state.timeScale;

        // Giảm thời gian đếm ngược
        this.timer -= state.timeScale;
        this.pulse += 0.2 * state.timeScale;

        if (this.timer % 30 < 1) {
            sounds.playTick();
        }

        // Tự động nổ khi hết giờ
        if (this.timer <= 0) {
            this.explode();
        }

        // Va chạm viền
        if (this.x - this.radius < 0) { this.x = this.radius; this.vx = -this.vx * state.bounce; }
        if (this.x + this.radius > width) { this.x = width - this.radius; this.vx = -this.vx * state.bounce; }
        if (this.y - this.radius < 0) { this.y = this.radius; this.vy = -this.vy * state.bounce; }
        if (this.y + this.radius > height) { this.y = height - this.radius; this.vy = -this.vy * state.bounce; }
    }

    explode() {
        sounds.playExplosion(1.2);
        shakeScreen();

        // Tạo hiệu ứng sóng xung kích
        shockwaves.push(new Shockwave(this.x, this.y, 320, '#ff3344'));
        shockwaves.push(new Shockwave(this.x, this.y, 220, '#ffb703'));

        // Phun hạt lửa
        spawnSparks(this.x, this.y, '#ff3344', 45, 12);
        spawnSparks(this.x, this.y, '#ffb703', 35, 9);
        spawnSparks(this.x, this.y, '#ffffff', 20, 6);

        // Đẩy văng tất cả các vật thể lân cận
        const explosionRadius = 320;
        const blastPower = 28;

        objects.forEach(obj => {
            if (obj === this) return;

            let targetX = obj.x;
            let targetY = obj.y;

            // Xử lý nộm ragdoll
            if (obj.type === 'ragdoll') {
                obj.nodes.forEach(node => {
                    const dx = node.x - this.x;
                    const dy = node.y - this.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < explosionRadius && dist > 1) {
                        const force = (1 - dist / explosionRadius) * blastPower;
                        node.vx += (dx / dist) * force;
                        node.vy += (dy / dist) * force;
                    }
                });
                return;
            }

            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < explosionRadius && dist > 1) {
                const force = (1 - dist / explosionRadius) * blastPower;
                const nx = dx / dist;
                const ny = dy / dist;
                obj.vx += (nx * force) / (obj.mass || 1);
                obj.vy += (ny * force) / (obj.mass || 1);

                // Kích nổ dây chuyền (Chain Reaction) nếu bom khác ở gần
                if (obj.type === 'bomb' && !obj.destroyed && dist < 160) {
                    setTimeout(() => {
                        if (!obj.destroyed) obj.explode();
                    }, 80);
                }

                if (obj.isBoss) {
                    obj.health -= 15;
                    sounds.playQuack();
                }
            }
        });

        // Xóa bom này
        this.destroyed = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const blinkRate = Math.max(2, this.timer / 15);
        const isBlink = Math.sin(this.pulse * (30 / blinkRate)) > 0;

        // Thân bom tròn kim loại
        ctx.fillStyle = '#222634';
        ctx.shadowColor = isBlink ? '#ff3344' : 'transparent';
        ctx.shadowBlur = isBlink ? 20 : 5;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Viền cảnh báo màu đỏ
        ctx.strokeStyle = isBlink ? '#ff3344' : '#64748b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Ngòi nổ trên đầu
        ctx.fillStyle = '#ffb703';
        ctx.fillRect(-4, -this.radius - 8, 8, 8);

        // Tia lửa ngòi nổ
        ctx.fillStyle = isBlink ? '#ffffff' : '#ff0055';
        ctx.beginPath();
        ctx.arc(0, -this.radius - 10, 5, 0, Math.PI * 2);
        ctx.fill();

        // Biểu tượng sọ / cảnh báo C4
        ctx.fillStyle = isBlink ? '#ff3344' : '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('C4', 0, 1);

        ctx.restore();
    }
}

// --- C. Hình Nộm Khớp Vải (Verlet Ragdoll Dummy) ---
class Ragdoll {
    constructor(x, y) {
        this.type = 'ragdoll';
        this.nodes = [];
        this.sticks = [];

        // Tạo các khớp xương
        // 0: Đầu, 1: Cổ, 2: Ngực, 3: Hông
        // 4: Khuỷu Trái, 5: Tay Trái
        // 6: Khuỷu Phải, 7: Tay Phải
        // 8: Gối Trái, 9: Chân Trái
        // 10: Gối Phải, 11: Chân Phải
        this.addNode(x, y - 60, 14);      // 0 Đầu
        this.addNode(x, y - 40, 6);       // 1 Cổ
        this.addNode(x, y - 20, 8);       // 2 Ngực
        this.addNode(x, y + 10, 8);       // 3 Hông

        this.addNode(x - 24, y - 20, 6);  // 4 Khuỷu tay T
        this.addNode(x - 42, y - 10, 6);  // 5 Bàn tay T

        this.addNode(x + 24, y - 20, 6);  // 6 Khuỷu tay P
        this.addNode(x + 42, y - 10, 6);  // 7 Bàn tay P

        this.addNode(x - 14, y + 40, 7);  // 8 Gối T
        this.addNode(x - 18, y + 70, 7);  // 9 Bàn chân T

        this.addNode(x + 14, y + 40, 7);  // 10 Gối P
        this.addNode(x + 18, y + 70, 7);  // 11 Bàn chân P

        // Tạo thanh xương nối các khớp
        this.addStick(0, 1);
        this.addStick(1, 2);
        this.addStick(2, 3);
        // Tay T
        this.addStick(2, 4);
        this.addStick(4, 5);
        // Tay P
        this.addStick(2, 6);
        this.addStick(6, 7);
        // Chân T
        this.addStick(3, 8);
        this.addStick(8, 9);
        // Chân P
        this.addStick(3, 10);
        this.addStick(10, 11);
    }

    addNode(x, y, radius) {
        this.nodes.push({
            x: x,
            y: y,
            oldx: x - (Math.random() - 0.5) * 3,
            oldy: y,
            vx: 0,
            vy: 0,
            radius: radius,
            mass: 1
        });
    }

    addStick(i1, i2) {
        const n1 = this.nodes[i1];
        const n2 = this.nodes[i2];
        const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
        this.sticks.push({ p1: n1, p2: n2, length: dist });
    }

    update() {
        // Cập nhật vị trí Verlet cho từng khớp
        for (let i = 0; i < this.nodes.length; i++) {
            const p = this.nodes[i];
            const vx = (p.x - p.oldx) * state.friction + p.vx;
            const vy = (p.y - p.oldy) * state.friction + p.vy + state.gravity;

            p.vx = 0;
            p.vy = 0;
            p.oldx = p.x;
            p.oldy = p.y;

            p.x += vx * state.timeScale;
            p.y += vy * state.timeScale;

            // Va chạm sàn và tường
            if (p.y + p.radius > height) {
                p.y = height - p.radius;
                p.oldy = p.y + vy * state.bounce;
            } else if (p.y - p.radius < 0) {
                p.y = p.radius;
                p.oldy = p.y + vy * state.bounce;
            }

            if (p.x + p.radius > width) {
                p.x = width - p.radius;
                p.oldx = p.x + vx * state.bounce;
            } else if (p.x - p.radius < 0) {
                p.x = p.radius;
                p.oldx = p.x + vx * state.bounce;
            }
        }

        // Giải phương trình ràng buộc độ dài xương (Relaxation 4 lần)
        for (let r = 0; r < 4; r++) {
            for (let i = 0; i < this.sticks.length; i++) {
                const s = this.sticks[i];
                const dx = s.p2.x - s.p1.x;
                const dy = s.p2.y - s.p1.y;
                const dist = Math.hypot(dx, dy);
                const diff = (s.length - dist) / (dist || 1);
                const offsetX = dx * diff * 0.5;
                const offsetY = dy * diff * 0.5;

                s.p1.x -= offsetX;
                s.p1.y -= offsetY;
                s.p2.x += offsetX;
                s.p2.y += offsetY;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        // Vẽ xương nối
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.lineCap = 'round';

        ctx.beginPath();
        for (let i = 0; i < this.sticks.length; i++) {
            const s = this.sticks[i];
            ctx.moveTo(s.p1.x, s.p1.y);
            ctx.lineTo(s.p2.x, s.p2.y);
        }
        ctx.stroke();

        // Vẽ các khớp
        ctx.fillStyle = '#ffffff';
        for (let i = 1; i < this.nodes.length; i++) {
            const p = this.nodes[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Vẽ đầu hình nộm (khớp số 0)
        const head = this.nodes[0];
        ctx.fillStyle = '#ff007f';
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(head.x, head.y, head.radius, 0, Math.PI * 2);
        ctx.fill();

        // Mặt ngơ ngác vui nhộn
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(head.x - 4, head.y - 2, 2.5, 0, Math.PI * 2);
        ctx.arc(head.x + 4, head.y - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// --- D. Khối Thùng Gỗ Domino (Crate / Domino) ---
class Crate {
    constructor(x, y, w = 46, h = 46) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.radius = Math.hypot(w, h) * 0.5;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;
        this.angle = 0;
        this.va = 0;
        this.mass = 3.5;
        this.type = 'crate';
    }

    update() {
        if (this === state.draggedObject) return;

        this.vy += state.gravity * state.timeScale;
        this.vx *= Math.pow(state.friction, state.timeScale);
        this.vy *= Math.pow(state.friction, state.timeScale);

        this.x += this.vx * state.timeScale;
        this.y += this.vy * state.timeScale;
        this.angle += this.va * state.timeScale;
        this.va *= 0.96;

        // Va chạm viền
        const halfW = this.w / 2;
        const halfH = this.h / 2;

        if (this.x - halfW < 0) { this.x = halfW; this.vx = -this.vx * state.bounce; }
        if (this.x + halfW > width) { this.x = width - halfW; this.vx = -this.vx * state.bounce; }
        if (this.y - halfH < 0) { this.y = halfH; this.vy = -this.vy * state.bounce; }
        if (this.y + halfH > height) {
            this.y = height - halfH;
            this.vy = -this.vy * (state.bounce * 0.6);
            this.va = this.vx * 0.04;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Thùng gỗ hiện đại
        ctx.fillStyle = '#8b5a2b';
        ctx.strokeStyle = '#d4a373';
        ctx.lineWidth = 3;
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.strokeRect(-this.w / 2, -this.h / 2, this.w, this.h);

        // Chữ X gia cố thùng
        ctx.beginPath();
        ctx.moveTo(-this.w / 2, -this.h / 2);
        ctx.lineTo(this.w / 2, this.h / 2);
        ctx.moveTo(this.w / 2, -this.h / 2);
        ctx.lineTo(-this.w / 2, this.h / 2);
        ctx.stroke();

        ctx.restore();
    }
}

// --- E. Bóng Siêu Nảy Cầu Vồng (Rainbow Bouncy Ball) ---
class BouncyBall {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 12;
        this.vy = (Math.random() - 0.5) * 12;
        this.radius = 20;
        this.hue = Math.random() * 360;
        this.mass = 1;
        this.type = 'ball';
    }

    update() {
        if (this === state.draggedObject) return;

        this.vy += state.gravity * state.timeScale;
        this.hue = (this.hue + 2 * state.timeScale) % 360;

        this.x += this.vx * state.timeScale;
        this.y += this.vy * state.timeScale;

        // Siêu đàn hồi (nảy 0.95)
        const b = 0.95;
        let bounced = false;

        if (this.x - this.radius < 0) { this.x = this.radius; this.vx = -this.vx * b; bounced = true; }
        if (this.x + this.radius > width) { this.x = width - this.radius; this.vx = -this.vx * b; bounced = true; }
        if (this.y - this.radius < 0) { this.y = this.radius; this.vy = -this.vy * b; bounced = true; }
        if (this.y + this.radius > height) { this.y = height - this.radius; this.vy = -this.vy * b; bounced = true; }

        if (bounced) {
            sounds.playBounce(0.8 + Math.random() * 0.8);
            spawnSparks(this.x, this.y, `hsl(${this.hue}, 100%, 60%)`, 6);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = `hsl(${this.hue}, 100%, 55%)`;
        ctx.shadowColor = `hsl(${this.hue}, 100%, 65%)`;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Ánh bóng 3D
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.35, this.y - this.radius * 0.35, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// --- F. Hố Đen Xoắn Ốc (Black Hole) ---
class BlackHole {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 45;
        this.life = 240; // Tồn tại 4 giây
        this.maxLife = 240;
        this.rot = 0;
        sounds.playBlackhole();
    }

    update() {
        this.life -= state.timeScale;
        this.rot += 0.08 * state.timeScale;

        // Lực hút vạn vật vào tâm hố đen
        const pullRadius = 450;
        const pullPower = 18;

        objects.forEach(obj => {
            if (obj.type === 'ragdoll') {
                obj.nodes.forEach(node => {
                    const dx = this.x - node.x;
                    const dy = this.y - node.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < pullRadius && dist > 10) {
                        const force = (1 - dist / pullRadius) * pullPower;
                        // Gia tốc hút + xoáy tròn xoắn ốc
                        node.vx += ((dx / dist) * force + (-dy / dist) * (force * 0.4)) * state.timeScale;
                        node.vy += ((dy / dist) * force + (dx / dist) * (force * 0.4)) * state.timeScale;
                    }
                });
                return;
            }

            const dx = this.x - obj.x;
            const dy = this.y - obj.y;
            const dist = Math.hypot(dx, dy);

            if (dist < pullRadius && dist > 15) {
                const force = ((1 - dist / pullRadius) * pullPower) / (obj.mass || 1);
                obj.vx += ((dx / dist) * force + (-dy / dist) * (force * 0.5)) * state.timeScale;
                obj.vy += ((dy / dist) * force + (dx / dist) * (force * 0.5)) * state.timeScale;
            }
        });

        // Hút các hạt ánh sáng xung quanh
        if (Math.random() < 0.4) {
            const angle = Math.random() * Math.PI * 2;
            const d = 120 + Math.random() * 60;
            particles.push(new Particle(
                this.x + Math.cos(angle) * d,
                this.y + Math.sin(angle) * d,
                -Math.cos(angle) * 4,
                -Math.sin(angle) * 4,
                '#9b5de5',
                3,
                25
            ));
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);

        const currentR = this.radius * Math.min(1, this.life / 30);

        // Vòng đĩa bồi tụ ngoài (Accretion disk)
        const gradient = ctx.createRadialGradient(0, 0, currentR * 0.2, 0, 0, currentR * 2.2);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.4, '#7209b7');
        gradient.addColorStop(0.8, '#4361ee');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, currentR * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Xoáy ánh sáng
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 2;
            ctx.moveTo(Math.cos(a) * currentR * 0.4, Math.sin(a) * currentR * 0.4);
            ctx.quadraticCurveTo(
                Math.cos(a + 0.8) * currentR * 1.4,
                Math.sin(a + 0.8) * currentR * 1.4,
                Math.cos(a + 1.6) * currentR * 2,
                Math.sin(a + 1.6) * currentR * 2
            );
        }
        ctx.stroke();

        // Tâm đen tuyệt đối
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, 0, currentR * 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// --- G. Thiên Thạch Trong Mini-Game (Meteor Danger) ---
class Meteor {
    constructor() {
        this.x = Math.random() * width;
        this.y = -40;
        this.radius = 24 + Math.random() * 16;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = 4 + Math.random() * 5;
        this.mass = 4;
        this.type = 'meteor';
    }

    update() {
        this.x += this.vx * state.timeScale;
        this.y += this.vy * state.timeScale;

        // Vệt lửa đuôi
        if (Math.random() < 0.7) {
            particles.push(new Particle(
                this.x + (Math.random() - 0.5) * 10,
                this.y - this.radius * 0.6,
                (Math.random() - 0.5) * 2,
                -2,
                '#ff5400',
                4,
                20
            ));
        }

        // Chạm đất nổ
        if (this.y + this.radius >= height) {
            sounds.playExplosion(0.7);
            shockwaves.push(new Shockwave(this.x, height, 160, '#ff5400'));
            spawnSparks(this.x, height, '#ff5400', 20);
            this.destroyed = true;
        }

        // Va vào Boss Vịt
        if (bossDuck && !bossDuck.destroyed) {
            const dist = Math.hypot(this.x - bossDuck.x, this.y - bossDuck.y);
            if (dist < this.radius + bossDuck.radius) {
                bossDuck.health -= 25;
                sounds.playQuack();
                sounds.playExplosion(0.9);
                shockwaves.push(new Shockwave(this.x, this.y, 180, '#ff0055'));
                spawnSparks(this.x, this.y, '#ff0055', 30);
                this.destroyed = true;

                if (bossDuck.health <= 0) {
                    triggerGameOver();
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#3a0ca3';
        ctx.strokeStyle = '#f72585';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#f72585';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

// ==========================================
// 4. HÀM TẠO HIỆU ỨNG & VA CHẠM
// ==========================================

function spawnSparks(x, y, color, count = 15, maxSpeed = 8) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * maxSpeed;
        particles.push(new Particle(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color,
            2 + Math.random() * 4,
            25 + Math.random() * 20
        ));
    }
}

function spawnFireworks(x, y) {
    sounds.playExplosion(0.8);
    const colors = ['#00f0ff', '#ff007f', '#ffd166', '#06d6a0', '#9b5de5'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];
    shockwaves.push(new Shockwave(x, y, 200, chosenColor));

    for (let i = 0; i < 70; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 11;
        particles.push(new Particle(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            chosenColor,
            3 + Math.random() * 3,
            45 + Math.random() * 25,
            0.015
        ));
    }
}

function shakeScreen() {
    document.body.classList.remove('shake-screen');
    void document.body.offsetWidth; // Trigger reflow
    document.body.classList.add('shake-screen');
    setTimeout(() => {
        document.body.classList.remove('shake-screen');
    }, 280);
}

// Xử lý va chạm giữa các vật thể hình tròn (Elastic Circle Collision)
function resolveCircleCollisions() {
    for (let i = 0; i < objects.length; i++) {
        const a = objects[i];
        if (a.type === 'ragdoll') continue;

        for (let j = i + 1; j < objects.length; j++) {
            const b = objects[j];
            if (b.type === 'ragdoll') continue;

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy);
            const minDist = (a.radius || 20) + (b.radius || 20);

            if (dist < minDist && dist > 0) {
                // Tách vật thể khỏi bị chồng chéo
                const overlap = (minDist - dist) * 0.5;
                const nx = dx / dist;
                const ny = dy / dist;

                a.x -= nx * overlap;
                a.y -= ny * overlap;
                b.x += nx * overlap;
                b.y += ny * overlap;

                // Tính toán vận tốc sau va chạm đàn hồi
                const kx = a.vx - b.vx;
                const ky = a.vy - b.vy;
                const p = 2 * (nx * kx + ny * ky) / ((a.mass || 1) + (b.mass || 1));

                a.vx -= p * (b.mass || 1) * nx;
                a.vy -= p * (b.mass || 1) * ny;
                b.vx += p * (a.mass || 1) * nx;
                b.vy += p * (a.mass || 1) * ny;

                if (Math.abs(kx) > 4 || Math.abs(ky) > 4) {
                    if (a.type === 'duck') a.onBounce();
                    if (b.type === 'duck') b.onBounce();
                }
            }
        }
    }
}

// Cắt chém bằng Kiếm Laser (Slicer)
function processLaserCut(x1, y1, x2, y2) {
    sounds.playLaser();
    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (obj.type === 'crate') {
            const dist = Math.hypot(obj.x - x2, obj.y - y2);
            if (dist < obj.radius + 20) {
                // Tách thùng gỗ thành các mảnh vụn
                sounds.playExplosion(0.5);
                spawnSparks(obj.x, obj.y, '#d4a373', 20);
                objects.splice(i, 1);
                // Sinh 2 thùng con
                objects.push(new Crate(obj.x - 12, obj.y, 22, 22));
                objects.push(new Crate(obj.x + 12, obj.y, 22, 22));
            }
        } else if (obj.type === 'meteor') {
            const dist = Math.hypot(obj.x - x2, obj.y - y2);
            if (dist < obj.radius + 25) {
                sounds.playExplosion(0.7);
                spawnSparks(obj.x, obj.y, '#f72585', 25);
                shockwaves.push(new Shockwave(obj.x, obj.y, 120, '#00f0ff'));
                objects.splice(i, 1);
                state.score += 50;
                sounds.playScore();
            }
        }
    }
}

// ==========================================
// 5. MINI-GAME LOGIC (BẢO VỆ VỊT VÀNG)
// ==========================================
let gameSpawnTimer = 0;

function startMiniGame() {
    state.gameMode = true;
    state.gameOver = false;
    state.score = 0;
    objects = [];
    particles = [];
    shockwaves = [];
    state.blackholes = [];

    // Tạo Boss Vịt ở giữa sàn
    bossDuck = new Duck(width / 2, height - 90, 48, true);
    objects.push(bossDuck);

    // Cung cấp 2 thùng gỗ bảo vệ 2 bên
    objects.push(new Crate(width / 2 - 80, height - 30, 48, 48));
    objects.push(new Crate(width / 2 + 80, height - 30, 48, 48));

    document.getElementById('score-box').style.display = 'flex';
    document.getElementById('gameover-modal').style.display = 'none';
    document.getElementById('btn-game-mode').classList.add('active');
    sounds.playScore();
}

function stopMiniGame() {
    state.gameMode = false;
    bossDuck = null;
    document.getElementById('score-box').style.display = 'none';
    document.getElementById('gameover-modal').style.display = 'none';
    document.getElementById('btn-game-mode').classList.remove('active');
}

function triggerGameOver() {
    state.gameOver = true;
    sounds.playExplosion(1.5);
    shakeScreen();
    document.getElementById('final-score').innerText = `${state.score} Điểm`;
    document.getElementById('gameover-modal').style.display = 'flex';
}

// ==========================================
// 6. XỬ LÝ SỰ KIỆN CHUỘT & BÀN PHÍM
// ==========================================

function spawnToyAt(x, y, tool = state.currentTool) {
    switch (tool) {
        case 'duck':
            objects.push(new Duck(x, y));
            sounds.playQuack();
            break;
        case 'ragdoll':
            objects.push(new Ragdoll(x, y));
            sounds.playBounce();
            break;
        case 'bomb':
            objects.push(new Bomb(x, y));
            sounds.playTick();
            break;
        case 'blackhole':
            state.blackholes.push(new BlackHole(x, y));
            break;
        case 'crate':
            objects.push(new Crate(x, y));
            sounds.playBounce(0.6);
            break;
        case 'ball':
            objects.push(new BouncyBall(x, y));
            sounds.playBounce(1.2);
            break;
        case 'firework':
            spawnFireworks(x, y);
            break;
    }
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    state.isMouseDown = true;
    state.mousePos = { x: e.clientX, y: e.clientY };

    if (state.currentTool === 'blade') {
        state.laserTrail = [{ x: e.clientX, y: e.clientY }];
        return;
    }

    // Kiểm tra xem người dùng có bấm vào để nhấc một vật thể lên quăng quật không
    let picked = null;
    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (obj.type === 'ragdoll') {
            for (let node of obj.nodes) {
                if (Math.hypot(node.x - e.clientX, node.y - e.clientY) < node.radius + 15) {
                    picked = node;
                    break;
                }
            }
            if (picked) break;
        } else {
            const r = obj.radius || 25;
            if (Math.hypot(obj.x - e.clientX, obj.y - e.clientY) < r) {
                picked = obj;
                break;
            }
        }
    }

    if (picked) {
        state.draggedObject = picked;
        state.dragOffset = { x: picked.x - e.clientX, y: picked.y - e.clientY };
    } else {
        // Nếu click vào khoảng trống -> Tạo đồ chơi
        spawnToyAt(e.clientX, e.clientY);
    }
});

window.addEventListener('mousemove', (e) => {
    state.mousePos = { x: e.clientX, y: e.clientY };

    if (state.draggedObject) {
        // Quăng ném vật thể theo tốc độ chuột
        const targetX = e.clientX + state.dragOffset.x;
        const targetY = e.clientY + state.dragOffset.y;
        state.draggedObject.vx = (targetX - state.draggedObject.x) * 0.45;
        state.draggedObject.vy = (targetY - state.draggedObject.y) * 0.45;
        state.draggedObject.x = targetX;
        state.draggedObject.y = targetY;
        if (state.draggedObject.oldx !== undefined) {
            state.draggedObject.oldx = targetX - state.draggedObject.vx;
            state.draggedObject.oldy = targetY - state.draggedObject.vy;
        }
    } else if (state.isMouseDown && state.currentTool === 'blade') {
        const prev = state.laserTrail[state.laserTrail.length - 1];
        if (prev) {
            processLaserCut(prev.x, prev.y, e.clientX, e.clientY);
        }
        state.laserTrail.push({ x: e.clientX, y: e.clientY });
        if (state.laserTrail.length > 14) state.laserTrail.shift();
    }
});

window.addEventListener('mouseup', () => {
    state.isMouseDown = false;
    state.draggedObject = null;
    state.laserTrail = [];
});

// Touch support cho điện thoại/màn hình cảm ứng
canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    window.dispatchEvent(mouseEvent);
}, { passive: false });

window.addEventListener('touchend', () => {
    window.dispatchEvent(new MouseEvent('mouseup', {}));
});

// Phím tắt bàn phím
window.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();

    // 1-8: Đổi công cụ
    const toolMap = {
        '1': 'duck',
        '2': 'ragdoll',
        '3': 'bomb',
        '4': 'blackhole',
        '5': 'blade',
        '6': 'crate',
        '7': 'ball',
        '8': 'firework'
    };

    if (toolMap[key]) {
        selectTool(toolMap[key]);
    }

    // Space: Kích nổ tức thì toàn bộ bom
    if (e.code === 'Space') {
        e.preventDefault();
        let explodedAny = false;
        objects.forEach(obj => {
            if (obj.type === 'bomb') {
                obj.explode();
                explodedAny = true;
            }
        });
        if (!explodedAny) {
            // Nếu không có bom thì thả 1 quả nổ ngay
            const b = new Bomb(state.mousePos.x || width / 2, state.mousePos.y || height / 2);
            objects.push(b);
            b.explode();
        }
    }

    // G: Chuyển đổi trọng lực
    if (key === 'G') {
        cycleGravity();
    }

    // Z: Bật/Tắt Slow-Mo
    if (key === 'Z') {
        toggleSlowMo();
    }

    // C: Dọn sạch
    if (key === 'C') {
        clearScreen();
    }

    // N: Nuke
    if (key === 'N') {
        triggerNuke();
    }

    // M: Bật/Tắt Âm thanh
    if (key === 'M') {
        toggleSound();
    }
});

// ==========================================
// 7. GIAO DIỆN & NÚT BẤM (UI CONTROLS)
// ==========================================

function selectTool(toolName) {
    state.currentTool = toolName;
    document.querySelectorAll('.tool-btn').forEach(btn => {
        if (btn.dataset.tool === toolName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
        selectTool(btn.dataset.tool);
    });
});

function toggleSlowMo() {
    state.isSlowMo = !state.isSlowMo;
    state.timeScale = state.isSlowMo ? 0.25 : 1.0;
    const btn = document.getElementById('btn-slowmo');
    if (state.isSlowMo) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
}
document.getElementById('btn-slowmo').addEventListener('click', toggleSlowMo);

function clearScreen() {
    objects = [];
    particles = [];
    shockwaves = [];
    state.blackholes = [];
    sounds.playBounce(0.5);
}
document.getElementById('btn-clear').addEventListener('click', clearScreen);

function triggerNuke() {
    sounds.playExplosion(2.5);
    shakeScreen();
    shockwaves.push(new Shockwave(width / 2, height / 2, Math.max(width, height) * 0.9, '#ffffff'));
    shockwaves.push(new Shockwave(width / 2, height / 2, Math.max(width, height) * 0.7, '#ff007f'));

    for (let i = 0; i < 180; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 5 + Math.random() * 20;
        particles.push(new Particle(
            width / 2,
            height / 2,
            Math.cos(angle) * spd,
            Math.sin(angle) * spd,
            i % 2 === 0 ? '#ff007f' : '#00f0ff',
            4 + Math.random() * 5,
            60,
            0.015
        ));
    }

    // Thổi bay hoặc xóa sạch
    setTimeout(() => {
        clearScreen();
    }, 200);
}
document.getElementById('btn-nuke').addEventListener('click', triggerNuke);

function toggleSound() {
    sounds.isMuted = !sounds.isMuted;
    document.getElementById('sound-icon').innerText = sounds.isMuted ? '🔇' : '🔊';
}
document.getElementById('btn-sound').addEventListener('click', toggleSound);

// Đổi trọng lực
const gravityPresets = {
    normal: 0.55,
    moon: 0.14,
    zero: 0.0,
    inverted: -0.55
};

function setGravity(mode) {
    state.gravity = gravityPresets[mode] !== undefined ? gravityPresets[mode] : 0.55;
    document.querySelectorAll('.env-btn').forEach(btn => {
        if (btn.dataset.gravity === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function cycleGravity() {
    const modes = ['normal', 'moon', 'zero', 'inverted'];
    const currentMode = Object.keys(gravityPresets).find(k => gravityPresets[k] === state.gravity) || 'normal';
    const nextIdx = (modes.indexOf(currentMode) + 1) % modes.length;
    setGravity(modes[nextIdx]);
}

document.querySelectorAll('.env-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        setGravity(btn.dataset.gravity);
    });
});

// Mini-game buttons
document.getElementById('btn-game-mode').addEventListener('click', () => {
    if (state.gameMode) {
        stopMiniGame();
    } else {
        startMiniGame();
    }
});

document.getElementById('btn-retry-game').addEventListener('click', () => {
    startMiniGame();
});

document.getElementById('btn-exit-game').addEventListener('click', () => {
    stopMiniGame();
});

document.getElementById('btn-close-tips').addEventListener('click', () => {
    document.getElementById('tips-card').style.display = 'none';
});

// ==========================================
// 8. VÒNG LẶP CHÍNH (MAIN ANIMATION LOOP 60 FPS)
// ==========================================
let lastTime = performance.now();
let frameCount = 0;
let fpsTimer = 0;

function loop(currentTime) {
    requestAnimationFrame(loop);

    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Đếm FPS
    frameCount++;
    fpsTimer += dt;
    if (fpsTimer >= 0.5) {
        const fps = Math.round(frameCount / fpsTimer);
        document.getElementById('fps-count').innerText = fps;
        frameCount = 0;
        fpsTimer = 0;
    }

    // Đếm tổng vật thể
    document.getElementById('obj-count').innerText = objects.length;

    // Cập nhật điểm mini-game
    if (state.gameMode && !state.gameOver) {
        state.score += 1;
        document.getElementById('game-score').innerText = state.score;

        // Sinh thiên thạch rơi
        gameSpawnTimer += dt;
        if (gameSpawnTimer >= Math.max(0.6, 2.0 - state.score * 0.001)) {
            gameSpawnTimer = 0;
            objects.push(new Meteor());
        }
    }

    // Xóa nền với hiệu ứng làm mờ nhẹ (motion blur / trail)
    ctx.fillStyle = 'rgba(9, 10, 16, 0.45)';
    ctx.fillRect(0, 0, width, height);

    // 1. Cập nhật và vẽ Hố Đen
    for (let i = state.blackholes.length - 1; i >= 0; i--) {
        const bh = state.blackholes[i];
        bh.update();
        bh.draw(ctx);
        if (bh.life <= 0) {
            shockwaves.push(new Shockwave(bh.x, bh.y, 260, '#9b5de5'));
            spawnSparks(bh.x, bh.y, '#9b5de5', 30);
            sounds.playExplosion(0.6);
            state.blackholes.splice(i, 1);
        }
    }

    // 2. Cập nhật và giải quyết va chạm vật thể
    resolveCircleCollisions();

    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        obj.update();
        obj.draw(ctx);

        if (obj.destroyed) {
            objects.splice(i, 1);
        }
    }

    // 3. Cập nhật và vẽ Sóng xung kích (Shockwaves)
    for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.update();
        sw.draw(ctx);
        if (sw.alpha <= 0) {
            shockwaves.splice(i, 1);
        }
    }

    // 4. Cập nhật và vẽ Hạt (Particles)
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // 5. Vẽ vệt Laser Cắt Chém nếu đang rê chuột
    if (state.laserTrail.length > 1) {
        ctx.save();
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 6;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 18;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(state.laserTrail[0].x, state.laserTrail[0].y);
        for (let i = 1; i < state.laserTrail.length; i++) {
            ctx.lineTo(state.laserTrail[i].x, state.laserTrail[i].y);
        }
        ctx.stroke();

        // Đường chỉ trắng ở giữa
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
}

// Khởi chạy vòng lặp
requestAnimationFrame(loop);

// Tự động thả vài món đồ chơi mẫu đầu tiên để người dùng vào là thấy vui ngay
setTimeout(() => {
    // 3 con vịt
    objects.push(new Duck(width * 0.35, 120));
    objects.push(new Duck(width * 0.5, 80));
    objects.push(new Duck(width * 0.65, 120));

    // 1 hình nộm ragdoll
    objects.push(new Ragdoll(width * 0.5, 240));

    // 1 quả bóng cầu vồng
    objects.push(new BouncyBall(width * 0.3, 180));

    // 1 tháp domino 3 thùng gỗ
    objects.push(new Crate(width * 0.75, height - 25, 44, 44));
    objects.push(new Crate(width * 0.75, height - 70, 44, 44));
    objects.push(new Crate(width * 0.75, height - 115, 44, 44));
}, 300);