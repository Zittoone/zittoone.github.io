/******************************************************************/
/*                          CLASS CIRCLE                          */
/******************************************************************/
class Cercle {
  constructor(x, y, r) {
    this.x = x || 0;
    this.y = y || 0;
    this.r = r || 20;
    this.l = r * 2;
    this.h = r * 2;
    this.couleur = "black";
    this.vitesseX = 0;
    this.vitesseY = 0;
  }

  draw(ctx) {
    ctx.save();

    ctx.fillStyle = this.couleur;
    ctx.beginPath();
    ctx.arc(this.x + this.r, this.y + this.r, this.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  move(m) {
    let modifier = m || 1;
    this.x += this.vitesseX * modifier;
    this.y += this.vitesseY * modifier;
  }
}

/******************************************************************/
/*                        CLASS ASTEROID                          */
/******************************************************************/
class Asteroid extends Cercle{
  constructor(x, y, r, v, img, scale) {
    super(x, y, r);
    this.vitesseX = v;
    this.sprite = img;
    this.current_angle = 0;
    this.state = entityStates.alive;
    this.scale = scale || 1;
    this.l *= this.scale;
    this.h *= this.scale;
    this.r *= this.scale;
    
  }

  draw(ctx) {

    // Update the angle
    if(this.current_angle == 360) {
        this.current_angle = 0;
    }
    this.sprite.draw(ctx, this.x - this.r, this.y - this.r, this.scale, this.current_angle++);
  }

  explode() {
    this.state = entityStates.dead;
  }
}

/******************************************************************/
/*                     CLASS PARALLAX STAR                        */
/******************************************************************/
class ParallaxStar extends Cercle {
  constructor(x, y, layer) {
    super(x, y, 3 + layer);
    this.layer = layer;
    this.color1 = "rgb(52, 84, 135," + layer / 10 + ")";
    this.color2 = "rgb(40, 69, 111," + layer / 10 + ")";
  }

  /**
   * Draw 2 opposed arcs
   */
  draw(ctx) {
    let angle = -45 * 180 / Math.PI;
    ctx.save();

    ctx.fillStyle = this.color1;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0 + angle, Math.PI + angle);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this.color2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, Math.PI + angle, 2 * Math.PI + angle);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  move(modifier) {
    let m = modifier || 1;
    this.x -= this.layer / 2 * m;
  }
}
