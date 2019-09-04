// useful
Array.prototype.pushArray = function(arr) {
    this.push.apply(this, arr);
};

var canvas, ctx, w, h, game;
window.onload = () => {
    canvas = document.querySelector("#myCanvas");
    ctx = canvas.getContext("2d");

    w = canvas.width;
    h = canvas.height;

    game = GF();
    game.start();
};

/** Different game states that will control the game */
var gameStates = {
    mainMenu: 0,
    gameRunning: 1,
    gameLevelWon: 2,
    gameOver: 3
};

/** Different entoty states that will control the entities */
var entityStates = {
    alive: 0,
    exploding: 1,
    dead: 2
};

/**
 * The GameFramework starts here
 *
 * returns a black-box'd API with only start function
 */
var GF = () => {
    var gameState = gameStates.mainMenu;
    var inputStates = {};

    /** Level related variables */
    var currentLevel = 1;
    var lasers = [];
    var obstacles = [];
    var stars = [];
    var joueur = [];
    var time_start, time_level, current_level, time_left;
    var vitesse;
    var audio;
    var ended;

    /** Only function visbile by the API */
    var start = function(timestamp) {
        /**
         * We first register the keys event that are treated
         * by the "listeners.js" file
         */
        registerEventListener();

        /**
         * Set the "current_level" to 1 for the first level
         */
        current_level = 1;

        /**
         * Create the background music
         * TODO: load asset
         */
        audio = new Audio("./assets/sound/song.mp3");

        /**
         * Request the Animation frame on the mainLoop function
         */
        requestAnimationFrame(mainLoop);
    };

    /**
     * MainLoop function
     * that will switch display between the "gameState" value
     * @param {*} timestamp
     */
    var mainLoop = timestamp => {
        // Whatever happens we clear the canvas every iteration
        ctx.clearRect(0, 0, w, h);

        switch (gameState) {
            case gameStates.mainMenu:
                drawMainMenu(timestamp);
                break;
            case gameStates.gameRunning:
                drawGameRunning(timestamp);
                break;
            case gameStates.gameLevelWon:
                drawGameLevelWon(timestamp);
                break;
            case gameStates.gameOver:
                drawGameOver(timestamp);
                break;
        }

        // Call back the mainLoop
        requestAnimationFrame(mainLoop);
    };

    /**
     * drawMainMenu function that will wait for the user
     * to press "space" to change the state
     * @param {*} timestamp
     */
    var drawMainMenu = timestamp => {
        writeTextStroked("Appuyez sur ESPACE pour commencer", canvas.width / 2, canvas.height / 2, 30, 2, "center", ctx);
        writeTextStroked("Appuyez sur les flèches directionnelles pour vous déplacer", canvas.width / 2, canvas.height - 60, 20, 1, "center", ctx);
        writeTextStroked("et sur ESPACE pour déclencher le bouclier", canvas.width / 2, canvas.height - 30, 20, 1, "center", ctx);

        if (inputStates.space) {
            // Callback function that will start the game once the player is fully loaded
            initLevel(1, function(player) {
                // Change the gameState to gameRunning
                joueur = player;
                gameState = gameStates.gameRunning;
            });

            inputStates.space = false;
        }
    };

    var drawGameRunning = timestamp => {
        // Draw the decorations first
        stars.forEach(s => {
            s.draw(ctx);
            s.move(vitesse);
        });

        // Draw and move obstacles
        /**
         * Obstacles
         */
        obstacles.forEach(o => {
            o.draw(ctx);
            o.move(vitesse);
        });

        // Draw all the time
        joueur.draw(ctx);
        switch (joueur.state) {
            case entityStates.alive:
                joueur.move(1, inputStates);
                testeCollisions(joueur, obstacles, lasers, stars);
                time_left = timeLeft();
                if (time_left <= 0) {
                    gameState = gameStates.gameLevelWon;
                }
                break;
            case entityStates.exploding:
            case entityStates.dead:
                // This modify the current game speed so multiplying it by 0.97 each iterations gives a slowing effect to 0
                vitesse *= 0.97;
                // TODO: export this to audio handler
                audio.pause();
                audio.currentTime = 0;

                if (ended == false) {
                    ended = true;
                    setTimeout(function() {
                        gameState = gameStates.gameOver;
                    }, 3500);
                }
        }

        if (inputStates.space) {
            joueur.activateShield();
            // Prevent spam
            inputStates.space = false;
        }

        writeText("Temps restant : " + parseFloat(time_left / 1000).toFixed(2) + "s", 10, 15, 10, "left", ctx);
        writeText("Niveau : " + current_level, w - 5, 15, 10, "right", ctx);
    };

    var drawGameLevelWon = timestamp => {
        stars.forEach(s => {
            s.draw(ctx);
            s.move(vitesse);
        });

        writeTextStroked("Vous avez gagné le niveau " + current_level, canvas.width / 2, canvas.height / 2, 30, 2, "center", ctx);
        writeTextStroked("Appuyez sur ESPACE pour continuer", canvas.width / 2, canvas.height / 2 + 60, 30, 2, "center", ctx);

        if (inputStates.space) {
            current_level++;
            initLevel(current_level, function(player) {
                // Change the gameState to gameRunning
                joueur = player;
                gameState = gameStates.gameRunning;
            });
            inputStates.space = false;
        }
    };

    var drawGameOver = timestamp => {
        stars.forEach(s => {
            s.draw(ctx);
            s.move(vitesse);
        });

        writeTextStroked("Vous avez perdu", canvas.width / 2, canvas.height / 2, 30, 2, "center", ctx);
        writeTextStroked("Appuyez sur ESPACE pour recommencer", canvas.width / 2, canvas.height / 2 + 60, 30, 2, "center", ctx);

        if (inputStates.space) {
            // Reinit the game to the current level
            initLevel(current_level, function(player) {
                // Change the gameState to gameRunning
                joueur = player;
                gameState = gameStates.gameRunning;
            });

            // Prevent spam
            inputStates.space = false;
        }
    };

    /**
     * Initialize a level with a level modifier (the level)
     * @param {number} n the level modifier
     */
    var initLevel = function(n, callback) {
        /**
         * Reset the level variables
         */
        time_start = performance.now();
        time_level = 15000 * n;
        time_left = timeLeft();

        vitesse = 1;
        ended = false;

        audio.pause();
        audio.currentTime = 0;
        audio.play();

        /**
         * Create the entities
         */

        stars = [];
        stars.pushArray(createStars(50, 1));
        stars.pushArray(createStars(30, 3));
        stars.pushArray(createStars(15, 6));
        stars.pushArray(createStars(1, 9));

        obstacles = [];
        let pixel_per_second = 8;
        let start_offset = w * 2;
        createAsteroids(n * 40, pixel_per_second, start_offset, start_offset + w * 10 * n, obstacles);

        createJoueur(w / 2 - 80 / 2, h / 2 - 48 / 2, 1, callback);
    };

    /**
     * RegisterEventListener function
     * calls the onKeyDown function from "listeners.js"
     * and bind the GF's inputStates array so it can be updated
     */
    var registerEventListener = function() {
        window.addEventListener(
            "keydown",
            function(event) {
                // Binding
                event.inputStates = inputStates;
                onKeydown(event);
            },
            false
        );
        window.addEventListener(
            "keyup",
            function(event) {
                // Binding
                event.inputStates = inputStates;
                onKeyup(event);
            },
            false
        );
    };

    var timeLeft = function() {
        return time_start + time_level - performance.now();
    };

    return {
        start: start
    };
};

/**
 *
 * @param {number} n The number of stars to be created
 * @param {number} layer The layer modificator (the lower the furtherest)
 * @returns {array} array of 'n' ParallaxStar
 */
function createStars(n, layer) {
    let stars = [];
    for (let i = 0; i < n; i++) {
        stars.push(new ParallaxStar(Math.random() * w, Math.random() * h, layer));
    }
    return stars;
}

/**
 * Does not returns an array because it requires Sprite elements
 * to draw the asteroids, so they are put into the array within a callback function
 * @param {number} n number of asteroids
 * @param {number} s the speed
 * @param {number} xStart the min x of randomized x
 * @param {number} xEnd the max x of randomized x
 * @param {array} array where the asteroids should be put
 */
function createAsteroids(n, s, xStart, xEnd, array) {
    let SPRITESHEET_URL = "./assets/img/asteroids.png";
    let SPRITE_WIDTH = 128;
    let SPRITE_HEIGHT = 128;
    let NB_POSTURES = 4;
    let NB_SPRITES_PER_ROW = 2;
    let delta = 10;

    loadAssetsFractional(SPRITESHEET_URL, SPRITE_WIDTH, SPRITE_HEIGHT, NB_POSTURES, function(sprites) {
        for (let i = 0; i < n; i++) {
            let scale = 0.25 + Math.random() * 0.75;
            let x = xStart + Math.random() * (xEnd - xStart + 1);
            let y = Math.random() * h;
            let asteroid = new Asteroid(x, y, SPRITE_WIDTH / 2 - delta, -s, sprites[Math.floor(Math.random() * NB_POSTURES)], scale);
            array.push(asteroid);
        }
    });
}

/**
 *
 * @param {number} xPos the x of the player
 * @param {number} yPos the y of the player
 * @param {number} scale the scale
 */
function createJoueur(xPos, yPos, scale, callback) {
    let SPRITESHEET_URL = "./assets/img/joueur.png";
    let SPRITE_WIDTH = 64;
    let SPRITE_HEIGHT = 29;
    let NB_POSTURES = 1;
    let NB_SPRITES_PER_ROW = 1;

    loadAssetsAnimated(SPRITESHEET_URL, SPRITE_WIDTH, SPRITE_HEIGHT, NB_POSTURES, 4, function(s1) {
        let player = new Joueur(xPos, yPos, SPRITE_WIDTH, SPRITE_HEIGHT, s1, scale);

        createExplosionSprite(scale, function(s2) {
            player.explosion = s2;
            createShieldSprite(0.5, function(s3) {
                player.shield = s3;
                callback(player);
            });
        });
    });
}

function createExplosionSprite(scale, callback) {
    let SPRITESHEET_URL = "./assets/img/explosion.png";
    let SPRITE_WIDTH = 128;
    let SPRITE_HEIGHT = 128;
    let NB_POSTURES = 1;
    let NB_SPRITES_PER_ROW = 4;
    loadAssetsAnimated(SPRITESHEET_URL, SPRITE_WIDTH, SPRITE_HEIGHT, NB_POSTURES, 14, function(sprites) {
        sprites[0].setNbImagesPerSecond(7);
        callback(sprites);
    });
}

function createShieldSprite(scale, callback) {
    let SPRITESHEET_URL = "./assets/img/ring.png";
    let SPRITE_WIDTH = 256;
    let SPRITE_HEIGHT = 256;
    let NB_POSTURES = 1;
    let NB_SPRITES_PER_ROW = 1;
    loadAssetsAnimated(SPRITESHEET_URL, SPRITE_WIDTH, SPRITE_HEIGHT, NB_POSTURES, 1, function(sprites) {
        sprites[0].setNbImagesPerSecond(7);
        // Shield framework here, see in "player.js"
        callback(new Shield(sprites));
    });
}

function writeText(text, x, y, size, al, ctx) {
    let align = al || "right";
    ctx.save();
    ctx.font = size + "pt SThings";
    ctx.fillStyle = "white";
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    ctx.restore();
}

function writeTextStroked(text, x, y, size, width, al, ctx) {
    let align = al || "right";
    ctx.save();
    writeText(text, x, y, size, align, ctx);
    ctx.font = size + "pt SThings";
    ctx.strokeStyle = "black";
    ctx.textAlign = align;
    ctx.lineWidth = width;
    ctx.strokeText(text, x, y);
    ctx.restore();
}
