const canvas = document.getElementById("cnvs")
const context = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const gameState = {
  STOPPED: false,
  player: {
    score: 0,
  },
  ball: {
    r: 10,
    x: (canvas.width / 2),
    y: 100,
    vx: Math.random() * 20 + -1,
    vy: Math.random() * 20 + -1,
  },
  paddle: {
    w: 400,
    h: 50,
    x: (canvas.width / 2 - 200),
    y: (canvas.height - 60),
  },
}

//TODO: subscribe on window resize

function run() {
  canvas.addEventListener('mousemove', onMouseMove, false)

  function onMouseMove(e) {
    gameState.paddle.x = e.pageX
  }
  setInterval(gameLoop, 1000 / 60)
}

function gameLoop() {
  draw()
  update(gameState.ball)
}

function drawPaddle(pad) {
  if (pad.x > canvas.width - pad.w) {
    pad.x = canvas.width - pad.w;
  } else if (pad.x < 0) {
    pad.x = 0;
  }

  context.beginPath();
  context.fillStyle = "#454545";
  context.rect(pad.x, pad.y, pad.w, pad.h);
  context.closePath();
  context.fill();
}

function drawBall(ball) {
  context.beginPath();
  context.fillStyle = "#282828";
  context.arc(ball.x, ball.y, ball.r * 2, 0, Math.PI*2, true);
  context.closePath();
  context.fill();
}

function collisionCheck(pad, ball) {
  const paddleCenter = {
    x: (pad.x + pad.w) / 2,
    y: (pad.y + pad.h) / 2
  };
  if (ball.y + ball.r + ball.r >= (pad.y)) {
    if ((ball.x + ball.r <= pad.x + pad.w || ball.x - ball.r <= pad.x + pad.w) && (ball.x + ball.r >= pad.x || ball.x - ball.r >= pad.x)) {
      ball.vy = -1 * ball.vy;
      if (ball.x - ball.r < paddleCenter.x) {
        ball.vx = -1 * ball.vx;
      }
      ball.vx += 1;
      ball.vy += 1;
      if (!gameState.STOPPED)
        gameState.player.score += 1;
    }
  }
}

function drawScore() {
  context.font ="bold 20px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText('Score: ' + gameState.player.score, 150, 50);
}

function endGame() {
  gameState.STOPPED = true;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font="50px Arial";
  context.fillText("Game Over! Final Score: " + gameState.player.score, canvas.width / 2 , canvas.height / 2 - 100);
  context.fillText("Press F5 to Restart!", canvas.width / 2, canvas.height / 2);
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBall(gameState.ball);
  drawPaddle(gameState.paddle);
  drawScore();
}

function update(ball) {
  ball.x += ball.vx;
  ball.y += ball.vy;
  if (ball.y > canvas.height) {
    endGame();
    return;
  }
  if (ball.y < ball.r) {
    ball.vy = -1 * ball.vy;
  }
  if (ball.x > canvas.width - ball.r || ball.x < 0 + ball.r) {
    ball.vx = -1 * ball.vx;
  }

  collisionCheck(gameState.paddle, gameState.ball);
}


run();
