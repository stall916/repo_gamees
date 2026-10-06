const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gridSize = 32;
const tileSize = canvas.width / gridSize;

let snake;
let direction;
let nextDirection;

let food;
let goldenFood;

let score;
let goldScore;

let gameInterval;

let goldenTimer = 0;


// OBSTÁCULOS DO MAPA
const obstacles = [
    { x: 10, y: 10 },
    { x: 19, y: 10 },
    { x: 10, y: 19 },
    { x: 19, y: 19 }
];


// INICIA O JOGO
function restartGame() {

    clearInterval(gameInterval);

    snake = [
        { x: 15, y: 15 },
        { x: 14, y: 15 },
        { x: 13, y: 15 }
    ];

    direction = "right";
    nextDirection = "right";

    score = 0;
    goldScore = 0;

    goldenFood = null;
    goldenTimer = 0;

    document.getElementById("message").textContent = "";

    spawnFood();

    updateHUD();

    draw();

    gameInterval = setInterval(gameLoop, 115);
}


// LOOP PRINCIPAL
function gameLoop() {

    direction = nextDirection;

    const head = {
        x: snake[0].x,
        y: snake[0].y
    };


    // MOVIMENTO
    if (direction === "up") {
        head.y--;
    }

    if (direction === "down") {
        head.y++;
    }

    if (direction === "left") {
        head.x--;
    }

    if (direction === "right") {
        head.x++;
    }


    // PAREDES
    if (
        head.x < 0 ||
        head.x >= gridSize ||
        head.y < 0 ||
        head.y >= gridSize
    ) {
        gameOver();
        return;
    }


    // BLOQUEIA CURVA DE 180°
    if (snake.length > 1) {

        const neck = snake[1];

        if (
            head.x === neck.x &&
            head.y === neck.y
        ) {
            return;
        }
    }


    // COLISÃO COM O PRÓPRIO CORPO
    for (const part of snake) {

        if (
            head.x === part.x &&
            head.y === part.y
        ) {
            gameOver();
            return;
        }
    }


    // COLISÃO COM OBSTÁCULOS
    for (const obstacle of obstacles) {

        if (
            head.x === obstacle.x &&
            head.y === obstacle.y
        ) {
            gameOver();
            return;
        }
    }


    snake.unshift(head);

    let ateFood = false;


    // COMIDA NORMAL
    if (
        food &&
        head.x === food.x &&
        head.y === food.y
    ) {

        score += 10;

        ateFood = true;

        spawnFood();
    }


    // COMIDA DOURADA
    if (
        goldenFood &&
        head.x === goldenFood.x &&
        head.y === goldenFood.y
    ) {

        score += 30;
        goldScore += 30;

        ateFood = true;

        goldenFood = null;
        goldenTimer = 0;
    }


    // SE NÃO COMEU, REMOVE A CAUDA
    if (!ateFood) {
        snake.pop();
    }


    // TIMER DA COMIDA DOURADA
    if (goldenFood) {

        goldenTimer--;

        if (goldenTimer <= 0) {

            goldenFood = null;
            goldenTimer = 0;
        }
    }


    // CHANCE DE APARECER COMIDA DOURADA
    if (
        !goldenFood &&
        Math.random() < 0.015
    ) {
        spawnGoldenFood();
    }


    updateHUD();

    draw();
}


// DESENHA O JOGO
function draw() {

    // FUNDO
    ctx.fillStyle = "#0d1120";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // GRADE
    ctx.strokeStyle = "#151b2e";
    ctx.lineWidth = 1;

    for (let x = 0; x <= gridSize; x++) {

        ctx.beginPath();

        ctx.moveTo(
            x * tileSize,
            0
        );

        ctx.lineTo(
            x * tileSize,
            canvas.height
        );

        ctx.stroke();
    }

    for (let y = 0; y <= gridSize; y++) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y * tileSize
        );

        ctx.lineTo(
            canvas.width,
            y * tileSize
        );

        ctx.stroke();
    }


    // OBSTÁCULOS
    for (const obstacle of obstacles) {

        ctx.fillStyle = "#ff4655";

        ctx.fillRect(
            obstacle.x * tileSize + 2,
            obstacle.y * tileSize + 2,
            tileSize - 4,
            tileSize - 4
        );
    }


    // COMIDA NORMAL
    if (food) {

        ctx.fillStyle = "#00e5ff";

        ctx.beginPath();

        ctx.arc(
            food.x * tileSize + tileSize / 2,
            food.y * tileSize + tileSize / 2,
            tileSize * 0.35,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    // COMIDA DOURADA
    if (goldenFood) {

        ctx.fillStyle = "#ffd43b";

        ctx.beginPath();

        ctx.arc(
            goldenFood.x * tileSize + tileSize / 2,
            goldenFood.y * tileSize + tileSize / 2,
            tileSize * 0.42,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // TEMPO RESTANTE
        ctx.fillStyle = "#111";

        ctx.font = "bold 11px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            Math.ceil(goldenTimer / 9),
            goldenFood.x * tileSize + tileSize / 2,
            goldenFood.y * tileSize + tileSize / 2 + 4
        );
    }


    // COBRA
    snake.forEach((part, index) => {

        if (index === 0) {
            ctx.fillStyle = "#6ff2ff";
        } else {
            ctx.fillStyle = "#00b8d4";
        }

        ctx.fillRect(
            part.x * tileSize + 2,
            part.y * tileSize + 2,
            tileSize - 4,
            tileSize - 4
        );
    });


    // OLHOS
    drawSnakeEyes();
}


// OLHOS DA COBRA
function drawSnakeEyes() {

    const head = snake[0];

    const baseX = head.x * tileSize;
    const baseY = head.y * tileSize;

    ctx.fillStyle = "#061018";

    let eye1;
    let eye2;


    if (direction === "right") {

        eye1 = [baseX + 21, baseY + 9];
        eye2 = [baseX + 21, baseY + 21];
    }


    if (direction === "left") {

        eye1 = [baseX + 9, baseY + 9];
        eye2 = [baseX + 9, baseY + 21];
    }


    if (direction === "up") {

        eye1 = [baseX + 9, baseY + 9];
        eye2 = [baseX + 21, baseY + 9];
    }


    if (direction === "down") {

        eye1 = [baseX + 9, baseY + 21];
        eye2 = [baseX + 21, baseY + 21];
    }


    ctx.fillRect(
        eye1[0],
        eye1[1],
        4,
        4
    );

    ctx.fillRect(
        eye2[0],
        eye2[1],
        4,
        4
    );
}


// VERIFICA SE UMA POSIÇÃO ESTÁ OCUPADA
function isOccupied(x, y) {

    // Cobra
    for (const part of snake) {

        if (
            part.x === x &&
            part.y === y
        ) {
            return true;
        }
    }


    // Obstáculos
    for (const obstacle of obstacles) {

        if (
            obstacle.x === x &&
            obstacle.y === y
        ) {
            return true;
        }
    }


    // Comida dourada
    if (
        goldenFood &&
        goldenFood.x === x &&
        goldenFood.y === y
    ) {
        return true;
    }


    return false;
}


// GERA UMA POSIÇÃO VÁLIDA
function getRandomPosition() {

    let position;

    do {

        position = {
            x: Math.floor(
                Math.random() * gridSize
            ),

            y: Math.floor(
                Math.random() * gridSize
            )
        };

    } while (
        isOccupied(
            position.x,
            position.y
        )
    );

    return position;
}


// CRIA COMIDA NORMAL
function spawnFood() {

    food = getRandomPosition();
}


// CRIA COMIDA DOURADA
function spawnGoldenFood() {

    goldenFood = getRandomPosition();

    // Aproximadamente 6 segundos
    goldenTimer = Math.ceil(6000 / 115);
}


// MUDA A DIREÇÃO
function changeDirection(newDirection) {

    // BLOQUEIA 180°
    if (
        direction === "up" &&
        newDirection === "down"
    ) return;

    if (
        direction === "down" &&
        newDirection === "up"
    ) return;

    if (
        direction === "left" &&
        newDirection === "right"
    ) return;

    if (
        direction === "right" &&
        newDirection === "left"
    ) return;


    nextDirection = newDirection;
}


// TECLADO
document.addEventListener(
    "keydown",
    function(event) {

        const key = event.key.toLowerCase();


        if (
            key === "arrowup" ||
            key === "w"
        ) {
            changeDirection("up");
        }


        if (
            key === "arrowdown" ||
            key === "s"
        ) {
            changeDirection("down");
        }


        if (
            key === "arrowleft" ||
            key === "a"
        ) {
            changeDirection("left");
        }


        if (
            key === "arrowright" ||
            key === "d"
        ) {
            changeDirection("right");
        }

    }
);


// ATUALIZA PONTUAÇÃO
function updateHUD() {

    document.getElementById("score").textContent = score;

    document.getElementById("goldScore").textContent = goldScore;
}


// GAME OVER
function gameOver() {

    clearInterval(gameInterval);

    document.getElementById("message").textContent =
        "GAME OVER — Pontuação: " + score;

    saveScore(score);

    updateLeaderboard();
}


// SALVA RECORDES
function saveScore(value) {

    let name = prompt(
        "GAME OVER!\nDigite suas iniciais (3 letras):"
    );


    if (!name) {
        return;
    }


    name = name
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .substring(0, 3);


    if (name.length !== 3) {
        name = "AAA";
    }


    let scores = JSON.parse(
        localStorage.getItem(
            "neonSnakeScores"
        )
    ) || [];


    scores.push({
        name: name,
        score: value
    });


    scores.sort(
        (a, b) => b.score - a.score
    );


    scores = scores.slice(0, 5);


    localStorage.setItem(
        "neonSnakeScores",
        JSON.stringify(scores)
    );
}


// MOSTRA RECORDES
function updateLeaderboard() {

    const list =
        document.getElementById("scores");

    list.innerHTML = "";


    let scores = JSON.parse(
        localStorage.getItem(
            "neonSnakeScores"
        )
    ) || [];


    scores.forEach(function(entry) {

        const li =
            document.createElement("li");

        li.textContent =
            entry.name + " — " + entry.score;

        list.appendChild(li);
    });
}


// INICIA
restartGame();

updateLeaderboard();    