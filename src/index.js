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
    vx: 5,
    vy: 5,
  },
  paddle: {
    w: 400,
    h: 50,
    x: (canvas.width / 2 - 200),
    y: (canvas.height - 60),
  },
  bonus: {
    isOn: false,
    x: (canvas.width / 2),
    y: 200,
    w: 20,
    vx: 15,
    vy: 3,
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
  update(gameState.ball, gameState.bonus)
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

function drawBonus(bns) {
  const bonus = {x: bns.x, y: bns.y, w: bns.w, vx: bns.vx, vy: bns.vy}
  context.beginPath();
  context.strokeStyle = "#569142";
  context.lineWidth = 5;
  context.lineTo(bonus.x, bonus.y);
  context.lineTo(bonus.x, bonus.y - bonus.w);
  context.lineTo(bonus.x, bonus.y + bonus.w);
  context.lineTo(bonus.x, bonus.y);
  context.lineTo(bonus.x - bonus.w, bonus.y);
  context.lineTo(bonus.x + bonus.w, bonus.y);
  context.stroke();
  context.beginPath();
}

function collisionCheck(pad, ball, bonus) {
  const paddleCenter = {
    x: (pad.x + pad.w) / 2,
    y: (pad.y + pad.h) / 2
  };

  if (ball.y + ball.r + ball.r >= (pad.y) && ball.vy > 0) {
    if ((ball.x + ball.r <= pad.x + pad.w || ball.x - ball.r <= pad.x + pad.w) && (ball.x + ball.r >= pad.x || ball.x - ball.r >= pad.x)) {
      ball.vy = -1 * ball.vy;
      if (ball.x - ball.r < paddleCenter.x) {
        ball.vx = -1 * ball.vx;
      }
      ball.vx += 1;
      ball.vy += 1;

    }
  }

  if (bonus.y + bonus.w  >= (pad.y) && bonus.vy > 0) {
    if ((bonus.x + bonus.w <= pad.x + pad.w || bonus.x - bonus.w  <= pad.x + pad.w) &&
        (bonus.x + bonus.w  >= pad.x || bonus.x - bonus.w >= pad.x)) {

      if (!gameState.STOPPED && gameState.bonus.isOn) {
        gameState.player.score += 60;
        gameState.bonus.isOn = false;
        gameState.bonus.x = (canvas.width / 2);
        gameState.bonus.y = 20;
        gameState.bonus.vx = 15;
        gameState.bonus.vy = 3;
      }
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
  if(gameState.bonus.isOn) {
    drawBonus(gameState.bonus);
  };
  drawScore();
}

const BONUS_TIMER = 15;
const VELOCITY_TIMER = 30;
let timePassedSinceBonus = 0;
let timePassedSinceVelocity = 0;
let timeLeftToBonus = BONUS_TIMER;
let timeLeftToSpeedUp = VELOCITY_TIMER;
let interval = 0;

function onTimesUpVelocity() {
  gameState.ball.vx = gameState.ball.vx * 1.2;
  gameState.ball.vy = gameState.ball.vy * 1.2;
}

function onTimesUpBonus() {
  gameState.bonus.isOn = true;
}

function update(ball, bonus) {

  timePassedSinceBonus += 0.0167;
  timeLeftToBonus = BONUS_TIMER - timePassedSinceBonus;

  interval += 0.0167
  if(interval > 1 && !gameState.STOPPED) {
    interval = 0;
    gameState.player.score += 1;
  }

  timePassedSinceVelocity += 0.0167;
  timeLeftToSpeedUp = VELOCITY_TIMER - timePassedSinceVelocity;

  if (Math.floor(timeLeftToSpeedUp) === 0) {
    timeLeftToSpeedUp = VELOCITY_TIMER;
    timePassedSinceVelocity = 0;
    onTimesUpVelocity();
  }

  if (Math.floor(timeLeftToBonus) === 0) {
    timeLeftToBonus = BONUS_TIMER;
    timePassedSinceBonus = 0;
    onTimesUpBonus();
  }

  ball.x += ball.vx;
  ball.y += ball.vy;
  if (ball.y > canvas.height) {
    endGame();
    return;
  }
  if (ball.y < ball.r) {
    ball.vy = -1 * ball.vy;
  }
  if (ball.x > canvas.width - ball.r || ball.x < ball.r) {
    ball.vx = -1 * ball.vx;
  }

  if (gameState.bonus.isOn) {
    bonus.x += bonus.vx;
    bonus.y += bonus.vy;
    if (bonus.y > canvas.height) {
      if (!gameState.STOPPED && gameState.bonus.isOn) {
        gameState.bonus.isOn = false;
        gameState.bonus.x = (canvas.width / 2);
        gameState.bonus.y = 20;
        gameState.bonus.vx = 15;
        gameState.bonus.vy = 3;
      }
      return;
    }
    if (bonus.y < bonus.w) {
      bonus.vy = -1 * bonus.vy;
    }
    if (bonus.x > canvas.width - bonus.w || bonus.x < bonus.w) {
      bonus.vx = -1 * bonus.vx;
    }
  }

  collisionCheck(gameState.paddle, gameState.ball, gameState.bonus);
}

run();
