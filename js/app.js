'use strict';

// These are the default size of the level 1 playing field.
var totalRows = 6;
var totalCols = 5;
var ctx;

// create an object based on the number of rows and cols.  IT will define all the
// aspects of the game board you are playing on.
var boardArea = function() {
    // The level of the current play. stats at 1.
    this.level = 1;
    /* The level up flag is set when you reach the top.  It is used to flag when to
     * change a level so things can happen.
     */
    this.levUp = 0;
    // hits tracks the number of times a bug got in on a level.
    this.hits = 0;
    // hitMessage is a flag that is set when you get hit so things can happen.
    this.hitMessage = 0;
    /* resetHit is a flag that is set when you reached the max number of hits for a
     * level so things can happen like reset the game back to the start.
     */
    this.resetHit = 0;
    // rows and cols define the board current board layout.  it gets changed
    // as you level up.
    this.rows = totalRows;
    this.cols = totalCols;
    /* row and col are the arrays that holds the positions on the borad that can be
     * occupied by a bug or person.  These positions are different than the cols and
     * rows of the graphic layout.
     */
    this.row = [];
    this.col = [];
    // maxcol and maxrow defines the maximum positions values of rows and cols
    // for the current board.  This sets the boundary for a enemy and person.
    this.maxCol = 0;
    this.maxRow = 0;
    // startcol and startrow is the position of where the person will start at the
    // begining of each level.
    this.startCol = 0;
    this.startRow = 0;
    // coladd is a function that builds all the column postions that are valid for
    // bugs and persons and puts it into the col array.  It is designed to have
    // "half steps" compared with the tile size of the images.
    this.colAdd = function(col) {
        this.col = [];
        for (var cnt = 0; cnt < (col * 2) - 1; cnt++) {
            this.col.push(cnt * 50.5);
        }
        this.maxCol = (col * 2) - 1;
        this.startCol = col - 1;
    };
    /* colrow is a function that builds all the row postions that are valid for
     * bugs and persons and puts it into the row array.  It is designed to have
     * "half steps" compared with the tile size of the images.
     */
    this.rowAdd = function(row) {
        this.row = [];
        for (var cnt = 0; cnt < (row * 2) - 1; cnt++) {
            this.row.push(cnt * 41.5 - 8);
        }
        this.maxRow = (row * 2) - 1;
        this.startRow = ((row - 1) * 2);
    };
    // This levelUp functions performs the updates when you go to the next level.
    this.levelUp = function() {
        if (this.level < 6) {
            this.colAdd(++this.cols);
            this.rowAdd(++this.rows);
        }
        this.level++;
        this.levUp = 1;
        window.setTimeout(resetEnemies, 1000);
        allEnemies = [];
        player.resetStart();
    };
    // This hit function runs when you get hit to track the number of hits and
    // reset once you get to 3 hits on a level.
    this.hit = function() {
        this.hits++;
        if (this.hits >= 3) {
            this.reset();
        } else {
            player.resetStart();
            this.hitMessage = 1;
            window.setTimeout(function() {
                ba.hitMessage = 0;
            }, 3000);
        }
    };
    // This reset function is performed when you get hit to many times on a level
    // It will cause a delay and restart the game play.
    this.reset = function() {
        this.resetHit = 1;
        window.setTimeout(resetEnemies, 2000);
        allEnemies = [];
        this.level = 1;
        this.rows = totalRows;
        this.cols = totalCols;
        this.colAdd(ba.cols);
        this.rowAdd(ba.rows);
        player.resetStart();
    };
};

// create the game board area and set the number of columns and rows to start with.
var ba = new boardArea();
ba.colAdd(totalCols);
ba.rowAdd(totalRows);


// Enemies our player must avoid
var Enemy = function(enemyRow) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    // x is the column position of where to place the bug.
    this.x = 0;
    // y is the row position of where to place the bug.
    this.y = enemyRow;
    //    //row is the row on which the bug is places
    //    this.row = enemyRow;
    // speed is a speed value so that bug can go different speeds.
    this.speed = 0;
    //speedfactor is an adjustment to slowdown or speed up bugs
    this.speedFactor = ba.level * 1.5;
    // direction is a flag for if the bug goes left to right (0) or right
    // to left (1)
    this.direction = 0;

    // when creating an object these functions are ran to reset the random
    // speed and direction of the bug.
    this.resetSpeed();
    this.resetDirection();
};
// resetSpeed randomizes the spped for each bug.
Enemy.prototype.resetSpeed = function() {
    this.speed = (Math.random() * this.speedFactor) + ba.level;
};
// resetDirection will randomly decide which direction the bug goes.
Enemy.prototype.resetDirection = function() {
    this.direction = Math.round(Math.random());
    if (this.direction === 0) {
        this.x = 0;
        this.sprite = 'images/enemy-bug.png';
    } else {
        this.x = ba.maxCol - 1;
        this.sprite = 'images/enemy-bug_reverse.png';
    }
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks.
// when bug gets across the screen, then it resets the speed and direction
// and starts it's journey again for that row.
Enemy.prototype.update = function(dt) {
    if (this.direction === 0) {
        this.x = this.x + (this.speed * dt);
        if (this.x > ba.maxCol) {
            this.resetSpeed();
            this.resetDirection();
        }
    } else {
        this.x = this.x - (this.speed * dt);
        if (this.x < 0) {
            this.resetSpeed();
            this.resetDirection();
        }
    }
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), ba.col[Math.round(this.x)], ba.row[this.y]);
};


var Player = function() {
    // sprite holds the array value of which sprite to use.
    // An array holds all the characters and fefaults to th first one.
    this.sprite = 0;
    // x is the value of the column posistion
    this.x = ba.startCol;
    // y is the value of the row posistion
    this.y = ba.startRow;
    // spriteArray is the characters that you can choose to use.
    this.spriteArray = ['images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ];
};

// render function draws the player on the screen
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.spriteArray[this.sprite]), ba.col[this.x], ba.row[this.y]);
};
//reset_start function sets the player back to the starting position
Player.prototype.resetStart = function() {
    this.x = ba.startCol;
    this.y = ba.startRow;
};
// change the player image to the next image in the array
Player.prototype.changePlayer = function() {
    this.sprite++;
    if (this.sprite >= this.spriteArray.length) {
        this.sprite = 0;
    }
};
// handleInput function takes care of the keyboard interreations.
Player.prototype.handleInput = function(keyNumber) {
    // move player position left on left arrow if position > 0
    if (keyNumber == 'left') {
        if (this.x > 0) {
            this.x--;
        }
    }
    // move player right on right arrow if position < max col position
    if (keyNumber == 'right') {
        if (this.x < ba.maxCol - 1) {
            this.x++;
        }
    }
    // move player up on up arrow ( decreasing position)
    // level up when you get to the top position.
    if (keyNumber == 'up') {
        if (this.y > 0) {
            this.y--;
        }
        if (this.y === 0) {
            ba.levelUp();
        }
    }
    // move player down on down arrow if < max row position
    if (keyNumber == 'down') {
        if (this.y < ba.maxRow - 1) {
            this.y++;
        }
    }
    // change the player icon when pressing a c.
    // this will cycle to the next image in the character array.
    if (keyNumber == 'c') {
        this.changePlayer();
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies

var allEnemies = [];

// resetEnimies function will clear all the bugs off the screen
// and resets the bugs( creates new bugs) to the current playing board size.
// It also resets the flags that causes the time delay.
function resetEnemies() {
    ba.hits = 0;
    ba.resetHit = 0;
    ba.levUp = 0;
    for (var enemyRow = 1; enemyRow < ba.maxRow - 4; enemyRow++) {
        allEnemies.push(new Enemy(enemyRow));
    }
}

// create the enemies when starting the game
resetEnemies();

// Place the player object in a variable called player
var player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        67: 'c'
    };
    // only allow movement when you dont get hit or leveling up
    // this is because of a delay to make game play better (pause)
    // while those things happen
    if (ba.resetHit === 0 && ba.levUp === 0 && ba.hitMessage === 0) {
        player.handleInput(allowedKeys[e.keyCode]);
    }
});

// this function checks for when a bug and player collide.
function checkCollisions() {
    var playerXPos = Math.round(player.x);
    var playerYPos = Math.round(player.y);

    allEnemies.forEach(function(enemy) {
        if (Math.round(enemy.x) == playerXPos && Math.round(enemy.y) == playerYPos) {
            ba.hit();
        }
    });
}