const cvs = document.getElementById("breakOut");
const ctx = cvs.getContext("2d");


const BG_IMG = new Image();
BG_IMG.src = "img/BG_IMG.jpg";

function loop() {
  ctx.drawImage( BG_IMG, 0, 0);
  draw();
  update();
  requestAnimationFrame(loop);
}
loop();

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;

const paddle = {
  x : cvs.width/2 - PADDLE_WIDTH/2,
  y : cvs.height - PADDLE_HEIGHT - PADDLE_MARGIN_BOTTOM,
  width : PADDLE_WIDTH,
  height : PADDLE_HEIGHT,
  dx : 5
}
