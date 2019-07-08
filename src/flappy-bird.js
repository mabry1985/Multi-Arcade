import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/flappy-bird.css';



$(document).ready(function () {
  var cvs = document.getElementById('flappyBird');
  var ctx = cvs.getContext('2d');
  var kirby = new Image();
  var bg = new Image();
  var pipeNorth = new Image();
  var pipeSouth = new Image();
  kirby.src = "./../assets/images/kirby.gif";
  bg.src = "./../assets/images/bg.png";
  pipeNorth.src = "./../assets/images/pipeNorth.png";
  pipeSouth.src = "./../assets/images/pipeSouth.png";

  // var audioName = new Audio();
  // audioName.src = "audio/audio.png";

On keyDown Event : bY -=20;

function draw() {
  ctx.drawImage(bg,0,-200);
  ctx.drawImage(kirby,100,150,50,50);
  ctx.drawImage(pipeNorth,80,0,50,120);
  ctx.drawImage(pipeSouth,pX,pY+Const);
  ctx.drawImage(kirby,bX,bY);

  by += gravity;
  requestAnimationFrame(draw);

}

draw();




});
