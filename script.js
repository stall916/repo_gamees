const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// x, y - Posicionar o obejeto
// w, h - Definir o tamanho do personagem
// vx - Define a velocidade Horizontal

const player = {x: 40, y: 160, w: 128, h: 128, vx: 120};

let last = 0; //Marca a posição do quadro anterior.

function update(dt){
    player.x += player.vx * dt;
    // Bater na parede esquerda ou direita? Inverte o sinal do vx
    if (player.x < 0 || player.x + player.w > canvas.width){
        player.vx *= -1;
}
}
const pcIcon = new Image();
pcIcon.src = "Untitled design.png";
function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.drawImage(pcIcon, player.x, player.y, player.w, player.h);
    ctx.fillText("O DeltaTime - dt independe da taxa de quadros", 12, 20);
}

function loop(ts){
    if (!last) last = ts;

    const dt = (ts - last) / 1000; // DeltaTime em segundos
    update(dt);
    draw();
    last = ts;
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop); // Inicia o loop do jogo