import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/styles.css';
const FPS = 30;
const SHIP_SIZE = 30;
const TURN_SPEED = 360;

/** @type {HTMLCanvasElement} */
var canv = document.getElementById("asteroids");
var ctx = canv.getContext("2d");

var ship = {
  x: canv.width / 2,
  y: canv.width / 2,
  r: SHIP_SIZE / 2,
  a: 90 / 180 * Math.PI,
  rot: 0,
};

document.addEventListener('keydown', keyDown);
document.addEventListener('keydown', keyUp);

// game loop
setInterval(update, 1000 / FPS);

function keyDown(/** @type {KeyboardEvent}*/ ev) {
  switch (ev.keyCode) {
    case 37: // left arrow (rotate ship left)
      ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
      break;
    case 38:  // up arrow (thrust)

      break;
    case 39: // right arrow (rotate ship right)
      ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
      break;
  }
}

function keyUp(/** @type {KeyboardEvent}*/ ev) {
  switch (ev.keyCode) {
    case 37: // left arrow (stop rotate ship left)
      ship.rot = 0;
      break;
    case 38:  // up arrow (stop thrust)

      break;
    case 39: // right arrow (stop rotate ship right)
      ship.rot = 0;
      break;
  }
}

function update() {
  //draw space
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canv.width, canv.height);

  // draw ship
  ctx.strokeStyle = 'white',
  ctx.lineWidth = SHIP_SIZE / 20,
  ctx.beginPath();
  ctx.moveTo(
    ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
    ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
  );
  ctx.lineTo(
    ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
    ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
  );
  ctx.lineTo(
    ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
    ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
  );

  ctx.closePath();
  ctx.stroke();

  // rotate ship
  ship.a += ship.rot;

  //move ship

  // center dot
  ctx.fillStyle = 'red';
  ctx. fillRect(ship.x - 1, ship.y - 1, 2, 2);
}

$(document).ready(function () {
});
