const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const wavesEl = document.getElementById("wave");

const KEYS = {};

let player, bullets, enemies, particles, score, lives, waves;
let last = 0;
let gameOver = false;
let pause = false;
let spawnTimer = 0;

window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    KEYS[key] = true;

    if ([" ", "arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key)) {
        e.preventDefault();
    }

    // Evita alternar a pausa várias vezes enquanto P está pressionado.
    if (key === "p" && !e.repeat && !gameOver) {
        pause = !pause;
        last = 0; // Ao voltar, o próximo frame começa com dt zero.
    }

    if (key === "r" && gameOver) startGame();
});

window.addEventListener("keyup", (e) => {
    KEYS[e.key.toLowerCase()] = false;
});

// Colisão retangular (Axis-Aligned Bounding Box).
function aabb(a, b) {
    return a.x < b.x + b.w
        && a.x + a.w > b.x
        && a.y < b.y + b.h
        && a.y + a.h > b.y;
}

class Player {
    constructor() {
        this.w = 42;
        this.h = 42;
        this.x = canvas.width / 2 - this.w / 2;
        this.y = canvas.height - 66;
        this.speed = 280;
        this.cooldown = 0;
    }

    update(dt) {
        const left = KEYS["arrowleft"] || KEYS["a"];
        const right = KEYS["arrowright"] || KEYS["d"];

        if (left) this.x -= this.speed * dt;
        if (right) this.x += this.speed * dt;

        this.x = Math.max(8, Math.min(canvas.width - this.w - 8, this.x));
        this.cooldown = Math.max(0, this.cooldown - dt);

        if ((KEYS[" "] || KEYS["arrowup"] || KEYS["w"]) && this.cooldown <= 0) {
            bullets.push(new Bullet(this.x + this.w / 2 - 3, this.y - 8));
            this.cooldown = 0.22;
        }
    }

    // Nave desenhada no Canvas: casco, cabine, asas e chama do motor.
    draw() {
        const cx = this.x + this.w / 2;

        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = "#38bdf8";

        // Chama do motor.
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.moveTo(cx - 6, this.y + 30);
        ctx.lineTo(cx, this.y + 43 + Math.random() * 5);
        ctx.lineTo(cx + 6, this.y + 30);
        ctx.closePath();
        ctx.fill();

        // Asas.
        ctx.fillStyle = "#0e7490";
        ctx.beginPath();
        ctx.moveTo(cx, this.y + 4);
        ctx.lineTo(this.x + this.w, this.y + 36);
        ctx.lineTo(cx + 8, this.y + 31);
        ctx.lineTo(cx - 8, this.y + 31);
        ctx.lineTo(this.x, this.y + 36);
        ctx.closePath();
        ctx.fill();

        // Corpo principal.
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(cx, this.y);
        ctx.quadraticCurveTo(cx + 13, this.y + 17, cx + 10, this.y + 37);
        ctx.lineTo(cx - 10, this.y + 37);
        ctx.quadraticCurveTo(cx - 13, this.y + 17, cx, this.y);
        ctx.fill();

        // Cabine.
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#e0f2fe";
        ctx.beginPath();
        ctx.ellipse(cx, this.y + 19, 4, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.h = 14;
        this.w = 6;
        this.speed = 420;
        this.dead = false;
    }

    update(dt) {
        this.y -= this.speed * dt;
        if (this.y + this.h < 0) this.dead = true;
    }

    draw() {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#fde047";
        ctx.fillStyle = "#fde047";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.restore();
    }
}

class Enemy {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.dead = false;
        this.h = 28;
        this.w = 28;
    }

    update(dt) {
        this.y += this.speed * dt;

        // Escapar pela base custa uma vida: a defesa da nave foi rompida.
        if (this.y > canvas.height) {
            this.dead = true;
            lives--;
            if (lives <= 0) gameOver = true;
        }
    }

    draw() {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#fb7185";
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = "#ffe4e6";
        ctx.fillRect(this.x + 6, this.y + 7, 5, 5);
        ctx.fillRect(this.x + 17, this.y + 7, 5, 5);
        ctx.restore();
    }
}

class Particle {
    constructor(x, y) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 55 + Math.random() * 150;
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 0.35 + Math.random() * 0.35;
        this.maxLife = this.life;
        this.size = 2 + Math.random() * 3;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.fillStyle = "#fbbf24";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#fb923c";
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

function createExplosion(enemy) {
    const centerX = enemy.x + enemy.w / 2;
    const centerY = enemy.y + enemy.h / 2;

    // Burst de 10 faíscas por inimigo destruído.
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(centerX, centerY));
    }
}

function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#c4b4b4";

    for (let i = 0; i < 40; i++) {
        const x = (i * 97) % canvas.width;
        const y = (i * 53) % canvas.height;
        ctx.fillRect(x, y, 2, 2);
    }

    // Linha de defesa: deixa clara a base que não pode ser ultrapassada.
    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 8);
    ctx.lineTo(canvas.width, canvas.height - 8);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    drawBackground();

    player.draw();
    enemies.forEach((enemy) => enemy.draw());
    bullets.forEach((bullet) => bullet.draw());
    particles.forEach((particle) => particle.draw());

    if (pause) {
        drawOverlay("PAUSADO", "Pressione P para continuar");
    }

    if (gameOver) {
        drawOverlay("FIM DE JOGO", "Pressione R para reiniciar");
    }
}

function startGame() {
    player = new Player();
    bullets = [];
    enemies = [];
    particles = [];
    score = 0;
    lives = 3;
    waves = 1;
    spawnTimer = 0;
    pause = false;
    gameOver = false;
    last = 0;
    syncHud();
}

function update(dt) {
    if (pause || gameOver) return;

    player.update(dt);

    bullets.forEach((bullet) => bullet.update(dt));
    enemies.forEach((enemy) => enemy.update(dt));
    particles.forEach((particle) => particle.update(dt));

    spawnWave(dt);

    bullets.forEach((bullet) => {
        enemies.forEach((enemy) => {
            if (!bullet.dead && !enemy.dead && aabb(bullet, enemy)) {
                bullet.dead = true;
                enemy.dead = true;
                score += 15;
                createExplosion(enemy);
            }
        });
    });

    enemies.forEach((enemy) => {
        if (!enemy.dead && aabb(enemy, player)) {
            enemy.dead = true;
            lives--;
            if (lives <= 0) gameOver = true;
        }
    });

    // Objetos mortos são removidos depois dos loops; nunca usamos splice no forEach.
    bullets = bullets.filter((bullet) => !bullet.dead);
    enemies = enemies.filter((enemy) => !enemy.dead);
    particles = particles.filter((particle) => particle.life > 0);

    if (score >= waves * 100) waves++;

    syncHud();
}

function syncHud() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    wavesEl.textContent = waves;
}

// Balanceamento da onda (3 eixos):
// Quantidade: 2 + waves, limitada a 6 inimigos por grupo para manter leitura da tela.
// Velocidade: 45 + waves * 8, limitada a 115 px/s para a dificuldade crescer sem ficar injusta.
// Intervalo: 2.4 - waves * 0.12 segundos, nunca menor que 0.9 s para dar tempo de reagir.
function spawnWave(dt) {
    spawnTimer -= dt;

    if (spawnTimer <= 0) {
        const count = Math.min(6, 2 + waves);
        const speed = Math.min(115, 45 + waves * 8);

        for (let i = 0; i < count; i++) {
            const x = 20 + Math.random() * (canvas.width - 60);
            enemies.push(new Enemy(x, -30 - i * 28, speed + Math.random() * 12));
        }

        spawnTimer = Math.max(0.9, 2.4 - waves * 0.12);
    }
}

function drawOverlay(title, subtitle) {
    ctx.fillStyle = "rgba(2, 6, 23, 0.78)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f8fafc";
    ctx.textAlign = "center";
    ctx.font = "bold 32px Segoe UI";
    ctx.fillText(title, canvas.width / 2, canvas.height / 2);

    ctx.font = "16px Segoe UI";
    ctx.fillStyle = "#bae6fd";
    ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 32);
}

function loop(ts) {
    if (!last) last = ts;
    const dt = Math.min(0.033, (ts - last) / 1000);
    last = ts;

    update(dt);
    draw();
    requestAnimationFrame(loop);
}

startGame();
requestAnimationFrame(loop);
