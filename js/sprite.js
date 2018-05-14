class Sprite {
  constructor() {
    this.spriteArray = [];
    this.currentFrame = 0;
    this.delayBetweenFrames = 10;

    this.then = performance.now();
    this.totalTimeSinceLastRedraw = 0;
  }

  extractSprites(
    spritesheet,
    nbPostures,
    postureToExtract,
    nbFramesPerPosture,
    spriteWidth,
    spriteHeight
  ) {
    // number of sprites per row in the spritesheet
    var nbSpritesPerRow = Math.floor(spritesheet.width / spriteWidth);
    // Extract each sprite
    var startIndex = (postureToExtract - 1) * nbFramesPerPosture;
    var endIndex = startIndex + nbFramesPerPosture;
    for (var index = startIndex; index < endIndex; index++) {
      // Computation of the x and y position that corresponds to the sprite
      // index
      // x is the rest of index/nbSpritesPerRow * width of a sprite
      var x = (index % nbSpritesPerRow) * spriteWidth;
      // y is the divisor of index by nbSpritesPerRow * height of a sprite
      var y = Math.floor(index / nbSpritesPerRow) * spriteHeight;
      // build a spriteImage object
      var s = new SpriteImage(spritesheet, x, y, spriteWidth, spriteHeight);
      this.spriteArray.push(s);
    }
  }

  drawStopped(ctx, x, y, scale) {
    var currentSpriteImage = this.spriteArray[this.currentFrame];
    currentSpriteImage.draw(ctx, x, y, scale);
  }

  draw(ctx, x, y, scale) {
    // Use time based animation to draw only a few images per second
    var now = performance.now();
    var delta = now - this.then;
    // draw currentSpriteImage
    var currentSpriteImage = this.spriteArray[this.currentFrame];
    // x, y, scale. 1 = size unchanged
    currentSpriteImage.draw(ctx, x, y, scale);
    // if the delay between images is elapsed, go to the next one
    if (this.totalTimeSinceLastRedraw > this.delayBetweenFrames) {
      // Go to the next sprite image
      this.currentFrame++;
      this.currentFrame %= this.spriteArray.length;
      // reset the total time since last image has been drawn
      this.totalTimeSinceLastRedraw = 0;
    } else {
      // sum the total time since last redraw
      this.totalTimeSinceLastRedraw += delta;
    }
    this.then = now;
  }
  setNbImagesPerSecond(nb) {
    // elay in ms between images
    this.delayBetweenFrames = 1000 / nb;
  }
}

class SpriteImage {
  constructor(img, x, y, width, height) {
    this.img = img; // the whole image that contains all sprites
    this.x = x; // x, y position of the sprite image in the whole image
    this.y = y;
    this.width = width; // width and height of the sprite image
    this.height = height;
    // xPos and yPos = position where the sprite should be drawn,
    // scale = rescaling factor between 0 and 1
    this.draw = function(ctx, xPos, yPos, scale, rotation) {
    
      //ctx.translate(xPos, yPos);
      // ctx.rotate(angle * 180 / Math.PI);
      ctx.drawImage(
        this.img,
        this.x,
        this.y, // x, y, width and height of img to extract
        this.width,
        this.height,
        xPos,
        yPos, // x, y, width and height of img to draw
        this.width * scale,
        this.height * scale
      );
    };
  }
}

function loadAssetsAnimated(url, width, height, n, nfp, callback) {
  var SPRITESHEET_URL = url;
  var SPRITE_WIDTH = width;
  var SPRITE_HEIGHT = height;
  var NB_POSTURES = n;
  var NB_FRAMES_PER_POSTURE = nfp;

  // load the spritesheet
  var spritesheet = new Image();
  spritesheet.src = SPRITESHEET_URL;

  // Called when the spritesheet has been loaded
  spritesheet.onload = function() {
    // Create woman sprites
    let sprites = [];
    for (var i = 0; i < NB_POSTURES; i++) {
      var sprite = new Sprite();

      sprite.extractSprites(
        spritesheet,
        NB_POSTURES,
        i + 1,
        NB_FRAMES_PER_POSTURE,
        SPRITE_WIDTH,
        SPRITE_HEIGHT
      );
      sprite.setNbImagesPerSecond(20);
      sprites[i] = sprite;
    }
    // call the callback function passed as a parameter,
    // we're done with loading assets and building the sprites
    callback(sprites);
  };
}

function loadAssetsFractional(url, width, height, n, callback) {
  var SPRITESHEET_URL = url;
  var SPRITE_WIDTH = width;
  var SPRITE_HEIGHT = height;
  var NB_POSTURES = n;

  // load the spritesheet
  var spritesheet = new Image();
  spritesheet.src = SPRITESHEET_URL;

  // Called when the spritesheet has been loaded
  spritesheet.onload = function() {

    let sprites = [];
    for (var i = 0; i < NB_POSTURES; i++) {
    
      let spriteWidth = SPRITE_WIDTH;
      let spriteHeight = SPRITE_HEIGHT;


      var nbSpritesPerRow = Math.floor(spritesheet.width / SPRITE_WIDTH);
      // x is the rest of index/nbSpritesPerRow * width of a sprite
      let x = (i % nbSpritesPerRow) * spriteWidth;
      // y is the divisor of index by nbSpritesPerRow * height of a sprite
      let y = Math.floor(i / nbSpritesPerRow) * spriteHeight;
      sprites.push(
        new SpriteImage(
          spritesheet,
          x,
          y,
          SPRITE_WIDTH,
          SPRITE_HEIGHT
        )
      );
    }
    // call the callback function passed as a parameter,
    // we're done with loading assets and building the sprites
    callback(sprites);
  };
}

function extractSprites(
  spritesheet,
  nbPostures,
  postureToExtract,
  nbFramesPerPosture,
  spriteWidth,
  spriteHeight
) {
  var spriteArray = [];
  // number of sprites per row in the spritesheet
  var nbSpritesPerRow = Math.floor(spritesheet.width / spriteWidth);
  // Extract each sprite
  var startIndex = (postureToExtract - 1) * nbFramesPerPosture;
  var endIndex = startIndex + nbFramesPerPosture;
  for (var index = startIndex; index < endIndex; index++) {
    // Computation of the x and y position that corresponds to the sprite
    // index
    // x is the rest of index/nbSpritesPerRow * width of a sprite
    var x = (index % nbSpritesPerRow) * spriteWidth;
    // y is the divisor of index by nbSpritesPerRow * height of a sprite
    var y = Math.floor(index / nbSpritesPerRow) * spriteHeight;
    // build a spriteImage object
    var s = new SpriteImage(spritesheet, x, y, spriteWidth, spriteHeight);
    spriteArray.push(s);
  }
  return spriteArray;
}
