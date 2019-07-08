const FPS = 30;
const FRICTION = 0.7;
const SHIP_SIZE = 30;
const SHIP_THRUST = 5;
const TURN_SPEED = 360;


/** @type {HTMLCanvasElement} */
var canv = document.getElementById('asteroids');
var ctx = canv.getContext('2d');

var ship = {
  x: canv.width / 2,
  y: canv.width / 2,
  r: SHIP_SIZE / 2,
  a: 90 / 180 * Math.PI,
  rot: 0,
  thrusting: false,
  thrust: {
    x: 0,
    y: 0,
  },
};

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// game loop
setInterval(update, 1000 / FPS);

function keyDown(/** @type {KeyboardEvent} */ ev) {
  switch (ev.keyCode) {
    case 37: // left arrow (rotate ship left)
      ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
      break;
    case 38:  // up arrow (thrust)
      ship.thrusting = true;
      break;
    case 39: // right arrow (rotate ship right)
      ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
      break;
  }
}

function keyUp(/** @type {KeyboardEvent} */ ev) {
  switch (ev.keyCode) {
    case 37: // left arrow (stop rotate ship left)
      ship.rot = 0;
      break;
    case 38:  // up arrow (stop thrust)
      ship.thrusting = false;
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

  if (ship.thrusting) {
    ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
    ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

    //draw thrust
    ctx.fillStyle = 'red',
    ctx.strokeStyle = 'orange',
    ctx.lineWidth = SHIP_SIZE / 10,
    ctx.beginPath();

    ctx.moveTo(
      ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
      ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
    );

    ctx.lineTo(
      ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
      ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
    );

    ctx.lineTo(
      ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
      ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
    );

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  } else {
    ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
    ship.thrust.y -= FRICTION * ship.thrust.y / FPS;

  }

  // draw ship
  ctx.strokeStyle = 'lightblue',
  ctx.lineWidth = SHIP_SIZE / 15,
  ctx.beginPath();

  ctx.moveTo(
    ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
    ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
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
  ship.x += ship.thrust.x;
  ship.y += ship.thrust.y;

  //handle edge of screen
  if (ship.x < 0 - ship.r) {
    ship.x = canv.width + ship.r;
  } else if (ship.x > canv.width + ship.r) {
    ship.x = 0 - ship.r;
  }

  if (ship.y < 0 - ship.r) {
    ship.y = canv.height + ship.r;
  } else if (ship.y > canv.width + ship.r) {
    ship.y = 0 - ship.r;
  }

  // center dot
  ctx.fillStyle = 'red';
  ctx. fillRect(ship.x - 1, ship.y - 1, 2, 2);
}

// $(document).ready(function () {
// });
