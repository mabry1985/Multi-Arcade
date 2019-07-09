var Frogger = (function(){
  var canvas - document.getElementById("canvas"),
    drawingSurface = canvas.getContext("2d"),
    backgroundCanvas = document.getElementById("background-canvas"),
    backgroundDrawingSurface = backgroundCanvas.getContext("2d"),
    drawingSurfaceWidth = canvas.width,
    drawingSurfaceHeight = canvas.height;
  return {
    canvas: canvas,
    drawingSurface: drawingSurface,
    drawingSurfaceWidth: drawingSurfaceWidth,
    drawingSurfaceHeight: drawingSurfaceHeight,
    backgroundDrawingSurface: backgroundDrawingSurface,
    direction: {
      UP: "up",
      DOWN: "down",
      LEFT: "left",
      RIGHT: "right"
    },
    observer: (function() {
      var events = {};
      return {
        subscribe: function(eventName, callback) {
          if (!events.hasOwnProperty(eventName)) {
            events[evenName] = [];
          }
          events[eventName].push(callback);
        },
        publish: function(eventName) {
          var data = Array.prototype.slice.call(arguments, 1),
            index = 0,
            length = 0;
          if (events.hasOwnProperty(eventName)) {
            length = events[eventName].length;
            for (; index < length; index++) {
              events[eventName][index].apply(this, data);
            }
          }
        }
      };
    }()),
    intersects: function(position1, position2) {
      var doesIntersect = false;
      if ((position1.left > position2.left && position1.left < position2.right) ||
       (position1.right > position2.left &&  position1.left < position2.right)) {
        doesIntersect = true;
      }
      return doesIntersect;
    }
  };
}());
window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000/60);
    };
})();
    (function(Frogger) {
      var _score = 0,
        _highScore = 1000,
        _lives = 5,
        _timeTotal = 60000,
        _timeRemaining = _timeTotal,
        _refreshRate = 33.333,
        _timeAtGoal = 0,
        _maxTimesAtGoal = 5,
        _isPlayerFrozen = false,
        _lastTimeGameLoopRan = (new Date()).getTime();
    function countDown() {
      if (_timeRemaining > 0) {
        _timeRemaining -= _refreshRate;
        Frogger.observer.publish("time-remaining-change", _timeRemaining / _timeTotal);
      } else {
        loseLife();
      }
    }
    function gameOver() {
      freezePlayer();
      Frogger.observer.publish("game-over");
    }
    function gameWon() {
      Frogger.observer.pubish("game-won");
    }
    function loseLife() {
        _lives--;
        freezePlayer();
        Frogger.observer.publish("player-lost-life");
        if (_lives === 0) {
          gameOver();
        } else {
          setTimeout(reset, 2000);
        }
      }
    function freezePlayer() {
      _isPlayerFrozen = true;
      Frogger.observer.publish("player-freeze");
    }
    function unfreezePlayer() {
        _isPlayerFrozen = false;
        Frogger.observer.publish("player-unfreeze");
    }
    function increaseScore(increaseBy) {
        _score += increaseBy || 0;
        Frogger.observer.publish("score-change", _score);
        if (_score > _highScore) {
            _highScore = _score;
            Frogger.observer.publish("high-score-change", _highScore);
        }
    }
    function playerAtGoal() {
        increaseScore(1000);
        _timesAtGoal++;
        freezePlayer();
        if (_timesAtGoal < _maxTimesAtGoal) {
            setTimeout(reset, 2000);
        } else {
            gameWon();
        }
    }
    function playerMoved() {
        increaseScore(20);
    }
    function reset() {
      _timeRemaining = _timeTotal;
        unfreezePlayer();
        Frogger.observer.publish("reset");
    }
    function gameLoop() {
        var currentTime = (new Date()).getTime(),
            timeDifference = currentTime - _lastTimeGameLoopRan;
        window.requestAnimationFrame(gameLoop);
        if (timeDifference >= _refreshRate) {
            Frogger.drawingSurface.clearRect(0, 0, Frogger.drawingSurfaceWidth, Frogger.drawingSurfaceHeight);
            if (!_isPlayerFrozen) {
                countDown();
                Frogger.observer.publish("check-collisions");
            }
            Frogger.observer.publish("render-base-layer");
            Frogger.observer.publish("render-character");
            _lastTimeGameLoopRan = currentTime;
        }
    }
    function start() {
        Frogger.observer.publish("high-score-change", _highScore);
        gameLoop();
    }
    Frogger.observer.subscribe("game-load", start);
    Frogger.observer.subscribe("player-at-goal", playerAtGoal);
    Frogger.observer.subscribe("player-moved", playerMoved);
    Frogger.observer.subscribe("collision", loseLife);
}(Frogger));
Frogger.ImageSprite = function(startPositionLeft, startPositionTop) {
    this.startLeft = startPositionLeft || 0;
    this.startTop = startPositionTop || 0;
    this.animations = {};
    this.reset();
};
Frogger.Animation = function(options) {
    options = options || {};
    this.rate = options.rate || 150;
    this.loop = options.loop || false;
    this.spriteLeft = options.spriteLeft || 0;
    this.sequence = options.sequence || [];
};
Frogger.Animation.prototype = {
    frame: 0,
    playing: false,
    timer: null,
    play: function() {
        var that = this;
        if (!this.playing) {
            this.reset();
            this.playing = true;
        }
        this.timer = setInterval(function() {
            that.incrementFrame();
        }, this.rate);
    },
    reset: function() {
        this.frame = 0;
    },
    incrementFrame: function() {
        if (this.playing) {
            this.frame++;
            if (this.frame === this.sequence.length - 1) {
                if (!this.loop) {
                    this.stop();
                } else {
                    this.reset();
                }
            }
        }
    },
    getSequenceValue: function() {
        return this.sequence[this.frame];
    },
    getSpriteLeft: function() {
        return this.spriteLeft;
    },
    stop: function() {
        clearInterval(this.timer);
        this.playing = false;
    }
};
Frogger.ImageSprite.prototype = {
    top: 0,
    left: 0,
    startLeft: 0,
    startTop: 0,
    sprite: (function() {
        var img = document.createElement("img");
        img.src = "images/spritemap.png";
        return img;
    }()),
    width: 80,
    height: 80,
    spriteTop: 0,
    spriteLeft: 0,
    animations: null,
    currentAnimation: "",
    isHidden: false,
    reset: function() {
        this.left = this.startLeft;
        this.top = this.startTop;
        this.resetAnimation();
        this.isHidden = false;
    },
    registerAnimation: function(animations) {
        var key,
            animation;
        for (key in animations) {
            animation = animations[key];
            this.animations[key] = new Frogger.Animation(animation);
        }
    },
    resetAnimation: function() {
        if (this.animations[this.currentAnimation]) {
            this.animations[this.currentAnimation].reset();
        }
        this.currentAnimation = "";
    },
    playAnimation: function(name) {
      this.currentAnimation = name;
        if (this.animations[this.currentAnimation]) {
            this.animations[this.currentAnimation].play();
        }
    },
    renderAt: function(left, top) {
        var animation = this.animations[this.currentAnimation],
            sequenceValue = animation ? animation.getSequenceValue() : 0,
            animationSpriteLeft = animation ? animation.getSpriteLeft() : 0,
            spriteLeft = this.spriteLeft + animationSpriteLeft + (this.width * sequenceValue);
        if (!this.isHidden) {
            Frogger.drawingSurface.drawImage(this.sprite, spriteLeft, this.spriteTop, this.width, this.height, left, top, this.width, this.height);
        }
    },
    moveTo: function(left, top) {
        this.left = left || 0;
        if (typeof top !== "undefined") {
            this.top = top || 0;
        }
    },
    getWidth: function() {
        return this.width;
    },
    getPosition: function() {
        return {
            left: this.left,
            right: this.left + this.width
        };
    },
    hide: function() {
        this.isHidden = true;
    }
};
(function(Frogger) {
    var _grid = {
            width: 80,
            height: 80
        },
        _numRows = 16,
        _numColumns = 11,
        _characterBounds = {
            left: 0,
            right: _numColumns * _grid.width,
            top: 2 * _grid.height,
            bottom: (_numRows - 2) * _grid.height
        },
        _rows = (function() {
            var output = [],
                index = 0,
                length = _numRows;
            for (; index < length; index++) {
                output.push(index * _grid.width);
            }
            return output;
        }()),
        _columns = (function() {
            var output = [],
                index = 0,
                length = _numColumns;
            for (; index < length; index++) {
                output.push(index * _grid.height);
            }
            return output;
        }());
    Frogger.observer.subscribe("game-load", function() {
        Frogger.observer.publish("game-board-initialize", {
            numRows: _numRows,
            numColumns: _numColumns,
            rows: _rows,
            columns: _columns,
            grid: {
                width: _grid.width,
                height: _grid.height
            },
            characterBounds: _characterBounds
        });
    });
  }(Frogger));
  (function(Frogger) {
      var _font = "67px Arcade Classic",
          _score = 0,
          _highScore = 0,
          _gameWon = false,
          _gameOver = false,
          _gameBoard = {};
      function renderScore() {
          Frogger.drawingSurface.font = _font;
          Frogger.drawingSurface.textAlign = "end";
          Frogger.drawingSurface.fillStyle = "#FFF";
          Frogger.drawingSurface.fillText("1-UP", _gameBoard.columns[3], _gameBoard.grid.height / 2);
          Frogger.drawingSurface.fillStyle = "#F00";
          Frogger.drawingSurface.fillText(_score, _gameBoard.columns[3], _gameBoard.grid.height);
          Frogger.drawingSurface.fillStyle = "#FFF";
          Frogger.drawingSurface.fillText("HI-SCORE", _gameBoard.columns[8], _gameBoard.grid.height / 2);
          Frogger.drawingSurface.fillStyle = "#F00";
          Frogger.drawingSurface.fillText(_highScore, _gameBoard.columns[8], _gameBoard.grid.height);
      }
      function renderGameOver() {
          Frogger.drawingSurface.font = _font;
          Frogger.drawingSurface.textAlign = "center";
          Frogger.drawingSurface.fillStyle = "#FFF";
          Frogger.drawingSurface.fillText("GAME OVER", Frogger.drawingSurfaceWidth / 2, _gameBoard.rows[9]);
      }
      function renderGameWon() {
          Frogger.drawingSurface.font = _font;
          Frogger.drawingSurface.textAlign = "center";
          Frogger.drawingSurface.fillStyle = "#FF0";
          Frogger.drawingSurface.fillText("YOU WIN!", Frogger.drawingSurfaceWidth / 2, _gameBoard.rows[9]);
      }
      function renderTimeLabel() {
          Frogger.drawingSurface.font = _font;
          Frogger.drawingSurface.textAlign = "end";
          Frogger.drawingSurface.fillStyle = "#FF0";
          Frogger.drawingSurface.fillText("TIME", Frogger.drawingSurfaceWidth, Frogger.drawingSurfaceHeight);
      }
      function render() {
          renderScore();
          renderTimeLabel();
          if (_gameOver) {
              renderGameOver();
          }
          if (_gameWon) {
              renderGameWon();
          }
      }
      Frogger.observer.subscribe("game-won", function() {
          _gameWon = true;
      });
      Frogger.observer.subscribe("game-over", function() {
          _gameOver = true;
      });
      Frogger.observer.subscribe("reset", function() {
          _gameOver = false;
          _gameWon = false;
      });
      Frogger.observer.subscribe("score-change", function(newScore) {
          _score = newScore;
      });
      Frogger.observer.subscribe("high-score-change", function(newHighScore) {
          _highScore = newHighScore;
      });
      Frogger.observer.subscribe("game-board-initialize", function(gameBoard) {
          _gameBoard = gameBoard;
          Frogger.observer.subscribe("render-base-layer", render);
      });
  }(Frogger));
  (function(Frogger) {
      var _background = document.createElement("img");
      _background.addEventListener("load", function() {
          Frogger.backgroundDrawingSurface.drawImage(_background, 0, 0, Frogger.drawingSurfaceWidth, Frogger.drawingSurfaceHeight);
      }, false);

      _background.src = "images/gameboard.gif";
  }(Frogger));
  (function(Frogger) {
      var _lives = [],
          _timeRemainingAsPercentage = 100,
          _gameBoard;
      function Life(left, top) {
          Frogger.ImageSprite.call(this, left, top);
      }
      Life.prototype = new Frogger.ImageSprite();
      Life.prototype.constructor = Life;
      Life.prototype.spriteLeft = 720;
      Life.prototype.spriteTop = 80;
      Life.prototype.width = 40;
      Life.prototype.height = 40;
      function initialize(gameBoard) {
          var lifePositionTop;
          _gameBoard = gameBoard;
          lifePositionTop = (_gameBoard.numRows - 1) * _gameBoard.grid.height;
          _lives = [
              new Life(0, lifePositionTop),
              new Life(1 * Life.prototype.width, lifePositionTop),
              new Life(2 * Life.prototype.width, lifePositionTop),
              new Life(3 * Life.prototype.width, lifePositionTop),
              new Life(4 * Life.prototype.width, lifePositionTop)
          ];
          Frogger.observer.subscribe("render-base-layer", render);
      }
      function renderLives() {
          var index = 0,
              length = _lives.length,
              life;
          for (; index < length; index++) {
              life = _lives[index];
              life.renderAt(life.left, life.top);
          }
      }
      function renderTimeRemaining() {
          var rectangleWidth = _timeRemainingAsPercentage * _gameBoard.rows[10],
              rectangleHeight = _gameBoard.grid.height / 2,
              rectangleLeft = (1 - _timeRemainingAsPercentage) * _gameBoard.rows[10],
              rectangleTop = Frogger.drawingSurfaceHeight - rectangleHeight;
          Frogger.drawingSurface.fillStyle = "#0F0";
          Frogger.drawingSurface.fillRect(rectangleLeft, rectangleTop, rectangleWidth, rectangleHeight);
      }
      function render() {
          renderLives();
          renderTimeRemaining();
      }
      Frogger.observer.subscribe("player-lost-life", function() {
          _lives.pop();
      });
      Frogger.observer.subscribe("time-remaining-change", function(newTimeRemainingPercentage) {
          _timeRemainingAsPercentage = newTimeRemainingPercentage;
      });
      Frogger.observer.subscribe("game-board-initialize", initialize);
  }(Frogger));
  Frogger.Image = (function(Frogger) {
      function RaceCar(left) {
          Frogger.ImageSprite.call(this, left);
      }
      RaceCar.prototype = new Frogger.ImageSprite();
      RaceCar.prototype.constructor = RaceCar;
      RaceCar.prototype.spriteLeft = 0;
      RaceCar.prototype.spriteTop = 80;
      function Bulldozer(left) {
          Frogger.ImageSprite.call(this, left);
      }
      Bulldozer.prototype = new Frogger.ImageSprite();
      Bulldozer.prototype.constructor = Bulldozer;
      Bulldozer.prototype.spriteLeft = 80;
      Bulldozer.prototype.spriteTop = 80;
      function TurboRaceCar(left) {
          Frogger.ImageSprite.call(this, left);
      }
      TurboRaceCar.prototype = new Frogger.ImageSprite();
      TurboRaceCar.prototype.constructor = TurboRaceCar;
      TurboRaceCar.prototype.spriteLeft = 160;
      TurboRaceCar.prototype.spriteTop = 80;
      function RoadCar(left) {
          Frogger.ImageSprite.call(this, left);
      }
      RoadCar.prototype = new Frogger.ImageSprite();
      RoadCar.prototype.constructor = RoadCar;
      RoadCar.prototype.spriteLeft = 240;
      RoadCar.prototype.spriteTop = 80;
      function Truck(left) {
          Frogger.ImageSprite.call(this, left);
      }
      Truck.prototype = new Frogger.ImageSprite();
      Truck.prototype.constructor = Truck;
      Truck.prototype.spriteLeft = 320;
      Truck.prototype.spriteTop = 80;
      Truck.prototype.width = 122;
      function ShortLog(left) {
          Frogger.ImageSprite.call(this, left);
      }
      ShortLog.prototype = new Frogger.ImageSprite();
      ShortLog.prototype.constructor = ShortLog;
      ShortLog.prototype.spriteLeft = 0;
      ShortLog.prototype.spriteTop = 160;
      ShortLog.prototype.width = 190;
      function MediumLog(left) {
          Frogger.ImageSprite.call(this, left);
      }
      MediumLog.prototype = new Frogger.ImageSprite();
      MediumLog.prototype.constructor = MediumLog;
      MediumLog.prototype.spriteLeft = 0;
      MediumLog.prototype.spriteTop = 240;
      MediumLog.prototype.width = 254;
      function LongLog(left) {
          Frogger.ImageSprite.call(this, left);
      }
      LongLog.prototype = new Frogger.ImageSprite();
      LongLog.prototype.constructor = LongLog;
      LongLog.prototype.spriteLeft = 240;
      LongLog.prototype.spriteTop = 160;
      LongLog.prototype.width = 392;
      function Turtle(left) {
          Frogger.ImageSprite.call(this, left);
      }

      Turtle.prototype = new Frogger.ImageSprite();
      Turtle.prototype.constructor = Turtle;
      Turtle.prototype.isUnderwater = function() {
          var isUnderwater = false,
              animation = this.animations[this.currentAnimation];
          if (animation.getSequenceValue() === Math.max.apply(Math, animation.sequence)) {
              isUnderwater = true;
          }
          return isUnderwater;
      };
      function TwoTurtles(left) {
          Turtle.call(this, left);
      }
      TwoTurtles.prototype = new Turtle();
      TwoTurtles.prototype.constructor = TwoTurtles;
      TwoTurtles.prototype.spriteLeft = 320;
      TwoTurtles.prototype.spriteTop = 240;
      TwoTurtles.prototype.width = 130;
      TwoTurtles.prototype.reset = function() {
          Turtle.prototype.reset.call(this);
          this.registerAnimation({
              "diveAndSurface": {
                  sequence: [0, 1, 2, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  loop: true,
                  rate: 200
              }
          });
          this.playAnimation("diveAndSurface");
      };
      function ThreeTurtles(left) {
          Turtle.call(this, left);
      }
      ThreeTurtles.prototype = new Turtle();
      ThreeTurtles.prototype.constructor = ThreeTurtles;
      ThreeTurtles.prototype.spriteLeft = 0;
      ThreeTurtles.prototype.spriteTop = 320;
      ThreeTurtles.prototype.width = 200;
      ThreeTurtles.prototype.reset = function() {
          Turtle.prototype.reset.call(this);
          this.registerAnimation({
              "diveAndSurface": {
                  sequence: [0, 1, 2, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  loop: true,
                  rate: 300
              }
          });
          this.playAnimation("diveAndSurface");
      };
      function GoalFrog(left) {
      Frogger.ImageSprite.call(this, left);
  }
  GoalFrog.prototype = new Frogger.ImageSprite();
  GoalFrog.prototype.constructor = GoalFrog;
  GoalFrog.prototype.spriteLeft = 640;
  GoalFrog.prototype.spriteTop = 80;
  GoalFrog.prototype.moveTo = function() {};
  function Goal(left) {
      Frogger.ImageSprite.call(this, left);
  }
  Goal.prototype = new Frogger.ImageSprite();
  Goal.prototype.constructor = Goal;
  Goal.prototype.spriteLeft = 800;
  Goal.prototype.spriteTop = 320;
  Goal.prototype.moveTo = function() {};
  Goal.prototype.isMet = false;
  return {
      RaceCar: RaceCar,
      Bulldozer: Bulldozer,
      RoadCar: RoadCar,
      TurboRaceCar: TurboRaceCar,
      Truck: Truck,
      ShortLog: ShortLog,
      MediumLog: MediumLog,
      LongLog: LongLog,
      TwoTurtles: TwoTurtles,
      ThreeTurtles: ThreeTurtles,
      GoalFrog: GoalFrog,
      Goal: Goal
  };
}(Frogger));
Frogger.Character = (function(Frogger) {
  var _character,
      _gameBoard = {},
      _startRow = 14,
      _startColumn = 6,
      _currentRow = _startRow,
      _isFrozen = false;
  function Character(left, top) {
      Frogger.ImageSprite.call(this, left, top);
      this.registerAnimation({
          "lose-life": {
              spriteLeft: 640,
              sequence: [0, 1, 2],
              rate: 350
          },
          "move-up": {
              spriteLeft: 0,
              sequence: [1, 0]
          },
          "move-right": {
              spriteLeft: 160,
              sequence: [1, 0]
          },
          "move-down": {
              spriteLeft: 320,
              sequence: [1, 0]
          },
          "move-left": {
              spriteLeft: 480,
              sequence: [1, 0]
          }
      });
  }
  Character.prototype = new Frogger.ImageSprite();
  Character.prototype.constructor = Character;
  Character.prototype.spriteLeft = 0;
  Character.prototype.spriteTop = 0;
  Character.prototype.moveUp = function() {
      this.top -= _gameBoard.grid.height;
      if (this.top < _gameBoard.characterBounds.top) {
          this.top = _gameBoard.characterBounds.top;
      }
      this.playAnimation("move-up");
      _currentRow--;
  };
  Character.prototype.moveDown = function() {
      this.top += _gameBoard.grid.height;
      if (this.top > _gameBoard.characterBounds.bottom) {
          this.top = _gameBoard.characterBounds.bottom;
      } else _currentRow++;
      this.playAnimation("move-down");
  };
  Character.prototype.moveLeft = function() {
      this.left -= _gameBoard.grid.width;
      if (this.left < _gameBoard.characterBounds.left) {
          this.left = _gameBoard.characterBounds.left;
      }
      this.playAnimation("move-left");
  };
  Character.prototype.moveRight = function() {
      this.left += _gameBoard.grid.width;
      if (this.left > _gameBoard.characterBounds.right) {
          this.left = _gameBoard.characterBounds.right;
      }
      this.playAnimation("move-right");
  };
  function getTop() {
      return _gameBoard.rows[_currentRow];
  }
  function hide() {
      _character.hide();
  }
  function move(characterDirection) {
      if (!_isFrozen) {
          if (characterDirection === Frogger.direction.LEFT) {
              _character.moveLeft();
          } else if (characterDirection === Frogger.direction.RIGHT) {
              _character.moveRight();
          } else if (characterDirection === Frogger.direction.UP) {
              _character.moveUp();
          } else if (characterDirection === Frogger.direction.DOWN) {
              _character.moveDown();
          }
          Frogger.observer.publish("player-moved");
      }
  }
  function render() {
      _character.renderAt(_character.left, _character.top);
  }
  function loseLife() {
      _character.playAnimation("lose-life");
  }
  function setPosition(left) {
      if (left > _gameBoard.characterBounds.right) {
          left = _gameBoard.characterBounds.right;
      } else if (left < _gameBoard.characterBounds.left) {
          left = _gameBoard.characterBounds.left;
      }
      _character.moveTo(left);
  }
  function reset() {
      _character.reset();
      _currentRow = _startRow;
  }
  function getPosition() {
      return _character.getPosition();
  }
  function freeze() {
      _isFrozen = true;
  }
  function unfreeze() {
      _isFrozen = false;
  }
  function initialize(gameBoard) {
      _gameBoard = gameBoard;
      _character = new Character(_gameBoard.columns[_startColumn], _gameBoard.rows[_startRow]);
      Frogger.observer.subscribe("render-character", render);
  }
  Frogger.observer.subscribe("player-lost-life", loseLife);
  Frogger.observer.subscribe("reset", reset);
  Frogger.observer.subscribe("player-at-goal", hide);
  Frogger.observer.subscribe("player-freeze", freeze);
  Frogger.observer.subscribe("player-unfreeze", unfreeze);
  Frogger.observer.subscribe("game-board-initialize", initialize);
  window.addEventListener("keydown", function(event) {
      var LEFT_ARROW = 37,
          UP_ARROW = 38,
          RIGHT_ARROW = 39,
          DOWN_ARROW = 40;
      if (event.keyCode === LEFT_ARROW) {
          move(Frogger.direction.LEFT);
      } else if (event.keyCode === RIGHT_ARROW) {
          move(Frogger.direction.RIGHT);
      } else if (event.keyCode === UP_ARROW) {
          move(Frogger.direction.UP);
      } else if (event.keyCode === DOWN_ARROW) {
          move(Frogger.direction.DOWN);
      }
  }, false);
  Frogger.canvas.addEventListener("touchstart", function(event) {
      var touchLeft = event.targetTouches[0].clientX,
          touchTop = event.targetTouches[0].clientY;
      if (touchLeft < (Frogger.drawingSurfaceWidth / 8)) {
          move(Frogger.direction.LEFT);
      } else if (touchLeft > (3 * Frogger.drawingSurfaceWidth / 8)) {
          move(Frogger.direction.RIGHT);
      } else if (touchTop < (Frogger.drawingSurfaceHeight / 8)) {
          move(Frogger.direction.UP);
      } else if (touchTop > (3 * Frogger.drawingSurfaceHeight / 8)) {
          move(Frogger.direction.DOWN);
      }
  }, false);
  return {
      getTop: getTop,
      getPosition: getPosition,
      setPosition: setPosition
  };
}(Frogger));
Frogger.Row = (function() {
  function Row(options) {
      options = options || {};
      this.direction = options.direction || Frogger.direction.LEFT;
      this.obstacles = options.obstacles || [];
      this.top = options.top || 0;
      this.speed = options.speed || 1;
  }
  Row.prototype = {
      render: function() {
          var index = 0,
              length = this.obstacles.length,
              left,
              obstaclesItem;
          for (; index < length; index++) {
              obstaclesItem = this.obstacles[index];
              left = obstaclesItem.getPosition().left + ((this.direction === Frogger.direction.RIGHT ? 1 : -1) * this.speed);
              if (left < -obstaclesItem.getWidth()) {
                  left = Frogger.drawingSurfaceWidth;
              } else if (left >= Frogger.drawingSurfaceWidth) {
                  left = -obstaclesItem.getWidth();
              }
              obstaclesItem.moveTo(left);
              obstaclesItem.renderAt(left, this.top);
          }
      },
      getTop: function() {
          return this.top;
      },
      isCollision: function(characterPosition) {
          var index = 0,
              length = this.obstacles.length,
              obstaclesItem,
              isCollision = false;
          for (; index < length; index++) {
              obstaclesItem = this.obstacles[index];
              if (Frogger.intersects(obstaclesItem.getPosition(), characterPosition)) {
                  isCollision = true;
              }
          }
          return isCollision;
      },
      reset: function() {
          var index = 0,
              length = this.obstacles.length;
          for (; index < length; index++) {
              this.obstacles[index].reset();
          }
      }
  };
  function Road(options) {
      Row.call(this, options);
  }
  Road.prototype = new Row();
  Road.prototype.constructor = Road;
  function Log(options) {
      Row.call(this, options);
  }
  Log.prototype = new Row();
  Log.prototype.constructor = Log;
  Log.prototype.isCollision = function(characterPosition) {
      return !Row.prototype.isCollision.call(this, characterPosition);
  };
  Log.prototype.render = function() {
      if (Frogger.Character.getTop() === this.getTop()) {
          Frogger.Character.setPosition(Frogger.Character.getPosition().left + ((this.direction === Frogger.direction.RIGHT ? 1 : -1) * this.speed));
      }
      Row.prototype.render.call(this);
  };
  function Turtle(options) {
      Log.call(this, options);
  }
  Turtle.prototype = new Log();
  Turtle.prototype.constructor = Turtle;
  Turtle.prototype.isCollision = function(characterPosition) {
      var isCollision = Log.prototype.isCollision.call(this, characterPosition);
      return this.obstacles[0].isUnderwater() || isCollision;
  };
  function Goal(options) {
      options.speed = 0;
      Row.call(this, options);
  }
  Goal.prototype = new Row();
  Goal.prototype.constructor = Goal;
  Goal.prototype.isCollision = function(characterPosition) {
      var index = 0,
          length = this.obstacles.length,
          obstaclesItem,
          isCollision = true;
      for (; index < length; index++) {
          obstaclesItem = this.obstacles[index];
          if (! ('isMet' in obstaclesItem)) break;
          if (Frogger.intersects(obstaclesItem.getPosition(), characterPosition)) {
              if (!obstaclesItem.isMet) {
                  this.obstacles[index].isMet = true;
                  Frogger.observer.publish("player-at-goal");
                  isCollision = false;
                  this.obstacles.push(new Frogger.Image.GoalFrog(obstaclesItem.getPosition().left));
              }
              break;
          }
      }
      return isCollision;
  };
  return {
      Road: Road,
      Log: Log,
      Turtle: Turtle,
      Goal: Goal
  };
}(Frogger));
(function(Frogger) {
  var _rows = [],
      _gameBoard = {};
  function initialize(gameBoard) {
      _gameBoard = gameBoard;
      _rows = [
          new Frogger.Row.Goal({
              top: _gameBoard.rows[2],
              obstacles: [new Frogger.Image.Goal(33, 111), new Frogger.Image.Goal(237, 315), new Frogger.Image.Goal(441, 519), new Frogger.Image.Goal(645, 723), new Frogger.Image.Goal(849, 927)]
          }),
          new Frogger.Row.Log({
              top: _gameBoard.rows[3],
              direction: Frogger.direction.RIGHT,
              speed: 5,
              obstacles: [new Frogger.Image.MediumLog(_gameBoard.columns[1]), new Frogger.Image.MediumLog(_gameBoard.columns[6]), new Frogger.Image.MediumLog(_gameBoard.columns[10])]
          }),
          new Frogger.Row.Turtle({
              top: _gameBoard.rows[4],
              speed: 6,
              obstacles: [new Frogger.Image.TwoTurtles(_gameBoard.columns[0]), new Frogger.Image.TwoTurtles(_gameBoard.columns[3]), new Frogger.Image.TwoTurtles(_gameBoard.columns[6]), new Frogger.Image.TwoTurtles(_gameBoard.columns[9])]
          }),
          new Frogger.Row.Log({
              top: _gameBoard.rows[5],
              direction: Frogger.direction.RIGHT,
              speed: 7,
              obstacles: [new Frogger.Image.LongLog(_gameBoard.columns[1]), new Frogger.Image.LongLog(_gameBoard.columns[10])]
          }),
          new Frogger.Row.Log({
              top: _gameBoard.rows[6],
              direction: Frogger.direction.RIGHT,
              speed: 3,
              obstacles: [new Frogger.Image.ShortLog(_gameBoard.columns[1]), new Frogger.Image.ShortLog(_gameBoard.columns[6]), new Frogger.Image.ShortLog(_gameBoard.columns[10])]
          }),
          new Frogger.Row.Turtle({
              top: _gameBoard.rows[7],
              speed: 5,
              obstacles: [new Frogger.Image.ThreeTurtles(_gameBoard.columns[0]), new Frogger.Image.ThreeTurtles(_gameBoard.columns[3]), new Frogger.Image.ThreeTurtles(_gameBoard.columns[7]), new Frogger.Image.ThreeTurtles(_gameBoard.columns[10])]
          }),
          new Frogger.Row.Road({
              top: _gameBoard.rows[9],
              speed: 3,
              obstacles: [new Frogger.Image.Truck(_gameBoard.columns[1]), new Frogger.Image.Truck(_gameBoard.columns[7])]
          }),
          new Frogger.Row.Road({
              top: _gameBoard.rows[10],
              direction: Frogger.direction.RIGHT,
              speed: 12,
              obstacles: [new Frogger.Image.TurboRaceCar(_gameBoard.columns[1]), new Frogger.Image.TurboRaceCar(_gameBoard.columns[7])]
          }),
          new Frogger.Row.Road({
              top: _gameBoard.rows[11],
              speed: 4,
              obstacles: [new Frogger.Image.RoadCar(_gameBoard.columns[1]), new Frogger.Image.RoadCar(_gameBoard.columns[7])]
          }),
          new Frogger.Row.Road({
              top: _gameBoard.rows[12],
              direction: Frogger.direction.RIGHT,
              speed: 3,
              obstacles: [new Frogger.Image.Bulldozer(_gameBoard.columns[1]), new Frogger.Image.Bulldozer(_gameBoard.columns[7])]
          }),
          new Frogger.Row.Road({
              top: _gameBoard.rows[13],
              speed: 4,
              obstacles: [new Frogger.Image.RaceCar(_gameBoard.columns[2]), new Frogger.Image.RaceCar(_gameBoard.columns[6])]
          })
      ];
      Frogger.observer.subscribe("render-base-layer", render);
  }
  function render() {
      var row,
          index = 0,
          length = _rows.length;
      for (; index < length; index++) {
          row = _rows[index];
          row.render();
      }
  }
  function isCollision() {
      var collided = false,
          row,
          index = 0,
          length = _rows.length;
      for (; index < length; index++) {
          row = _rows[index];
          if (Frogger.Character.getTop() === row.getTop()) {
              collided = row.isCollision(Frogger.Character.getPosition());
              if (collided) {
                  break;
              }
          }
      }
      if (collided) {
          Frogger.observer.publish("collision");
      }
      return collided;
  }
  function reset() {
      var row;
      for (var index = 0, length = _rows.length; index < length; index++) {
          row = _rows[index];
          row.reset();
      }
  }
  Frogger.observer.subscribe("reset", reset);
  Frogger.observer.subscribe("check-collisions", isCollision);
  Frogger.observer.subscribe("game-board-initialize", initialize);
}(Frogger));
Frogger.observer.publish("game-load"); 
