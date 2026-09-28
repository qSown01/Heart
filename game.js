// --- BƯỚC 1: CẤU HÌNH HỆ THỐNG GAME ---
const config = {
    type: Phaser.AUTO,              // Tự chọn WebGL hoặc Canvas tùy theo máy
    width: 400,                     // Chiều rộng khung game (pixels)
    height: 560,                    // Chiều cao khung game (pixels)
    parent: 'game-container',       // Gắn canvas vào thẻ div có id là game-container
    physics: {
        default: 'arcade',          // Sử dụng Arcade Physics 2D
        arcade: {
            gravity: { y: 900 },    // Trọng lực kéo xuống theo trục Y (900 px/s²)
            debug: false            // Đặt true nếu muốn hiện khung va chạm xanh lá
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Khởi tạo instance của game
const game = new Phaser.Game(config);

// --- BƯỚC 2: KHAI BÁO CÁC BIẾN TOÀN CỤC CỦA MÀN CHƠI ---
let bird;
let pipes;
let score = 0;
let scoreText;
let isGameOver = false;

// --- BƯỚC 3: CHUẨN BỊ TÀI NGUYÊN (PRELOAD) ---
function preload() {
    // 1. Tạo texture hình con chim: một hình vuông vàng kích thước 30x30
    let birdGfx = this.make.graphics({ x: 0, y: 0, add: false });
    birdGfx.fillStyle(0xf1c40f);
    birdGfx.fillRect(0, 0, 30, 30);
    birdGfx.generateTexture('bird', 30, 30);

    // 2. Tạo texture ống nước: thanh hình chữ nhật xanh lá kích thước 60x400
    let pipeGfx = this.make.graphics({ x: 0, y: 0, add: false });
    pipeGfx.fillStyle(0x2ecc71);
    pipeGfx.fillRect(0, 0, 60, 400);
    pipeGfx.generateTexture('pipe', 60, 400);
}

// --- BƯỚC 4: KHỞI TẠO ĐỐI TƯỢNG VÀ SỰ KIỆN (CREATE) ---
function create() {
    // Đặt lại các biến cờ khi khởi động hoặc chơi lại
    isGameOver = false;
    score = 0;

    // 1. Tạo đối tượng chim có tương tác vật lý
    bird = this.physics.add.sprite(100, 240, 'bird');
    bird.setCollideWorldBounds(true); // Ngăn không cho chim bay vượt trần trên

    // 2. Tạo nhóm quản lý các ống nước
    pipes = this.physics.add.group();

    // 3. Đặt bộ đếm thời gian: cứ 1.5 giây sinh ra 1 cặp ống nước mới
    this.time.addEvent({
        delay: 1500,
        callback: addPipeColumn,
        callbackScope: this,
        loop: true
    });

    // 4. Lắng nghe phím Space và click chuột để nhảy
    this.input.keyboard.on('keydown-SPACE', flap, this);
    this.input.on('pointerdown', flap, this);

    // 5. Kiểm tra va chạm vật lý giữa chim và nhóm ống
    this.physics.add.collider(bird, pipes, hitPipe, null, this);

    // 6. Hiển thị điểm số ở góc trên bên trái
    scoreText = this.add.text(20, 20, 'Score: 0', {
        fontSize: '24px',
        fill: '#ffffff',
        fontStyle: 'bold'
    });
}

// --- BƯỚC 5: VÒNG LẶP CẬP NHẬT TRẠNG THÁI (UPDATE - ~60 FPS) ---
function update() {
    // Nếu chim rơi chạm đáy sàn -> Xử lý thua cuộc
    if (bird.y >= 530 && !isGameOver) {
        triggerGameOver(this);
    }

    // Tự động xoay chúc đầu xuống khi đang rơi tự do
    if (bird.body.velocity.y > 0) {
        bird.angle = Math.min(60, bird.angle + 2);
    } else {
        bird.angle = -20; // Ngẩng đầu khi vừa bay lên
    }

    // Thu hồi và xóa các ống nước đã trôi qua hết mép trái để giải phóng RAM
    pipes.getChildren().forEach(function(pipe) {
        if (pipe.x < -70) {
            pipes.remove(pipe, true, true);
        }
    });
}

// --- BƯỚC 6: CÁC HÀM XỬ LÝ HÀNH VI (HELPERS) ---

// Hành vi vỗ cánh bay lên
function flap() {
    if (isGameOver) return;
    bird.setVelocityY(-350); // Đẩy vận tốc âm theo trục Y để nâng chim lên
    bird.angle = -20;
}

// Sinh một cặp cột trên và cột dưới
function addPipeColumn() {
    if (isGameOver) return;

    const gap = 130; // Khoảng hở cho chim lọt qua
    const minTopHeight = 60;
    const maxTopHeight = 240;
    const topPipeHeight = Phaser.Math.Between(minTopHeight, maxTopHeight);

    // Tạo ống trên
    let topPipe = pipes.create(420, topPipeHeight - 400, 'pipe');
    topPipe.setOrigin(0, 0);
    topPipe.body.allowGravity = false; // Tắt trọng lực để ống không bị rơi
    topPipe.setVelocityX(-200);        // Đẩy ống chạy sang trái với vận tốc 200px/s

    // Tạo ống dưới
    let bottomPipe = pipes.create(420, topPipeHeight + gap, 'pipe');
    bottomPipe.setOrigin(0, 0);
    bottomPipe.body.allowGravity = false;
    bottomPipe.setVelocityX(-200);

    // Tăng điểm
    score += 1;
    scoreText.setText('Score: ' + score);
}

// Xử lý khi va quệt vào ống
function hitPipe(bird, pipe) {
    if (isGameOver) return;
    triggerGameOver(this);
}

// Đóng băng trò chơi và tải lại cảnh
function triggerGameOver(scene) {
    isGameOver = true;
    scene.physics.pause();
    bird.setTint(0xe74c3c); // Đổi chim sang màu đỏ

    // Đợi 1.2 giây rồi khởi động lại màn chơi
    scene.time.delayedCall(1200, function() {
        scene.scene.restart();
    });
}