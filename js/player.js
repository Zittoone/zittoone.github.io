class Joueur {
    constructor(x, y, l, h, sprites, scale) {
        this.x = x;
        this.y = y;
        this.scale = scale || 1;
        this.l = l * this.scale;
        this.h = h * this.scale;

        /**
         * Acceleration and
         */
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.r = 0;
        this.sprites = sprites;
        this.explosion = [];
        this.state = entityStates.alive;
    }

    explode() {
        this.state = entityStates.exploding;
    }

    applyFriction() {
        let friction = 0.01;
        var speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy),
            angle = Math.atan2(this.vy, this.vx);
        if (speed > friction) {
            speed -= friction;
        } else {
            speed = 0;
        }
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }

    move(delta, inputStates) {
        if (this.state != entityStates.alive) return;

        this.vx += this.ax;
        this.vy += this.ay;

        this.applyFriction();

        this.x += this.vx;
        this.y += this.vy;

        if (inputStates.right) {
            this.r = 0;
            this.ax = Math.cos(this.r) * 0.2;
        } else if (inputStates.left) {
            this.r = Math.PI;
            this.ax = Math.cos(this.r) * 0.2;
        } else {
            this.ax = 0;
        }

        if (inputStates.up) {
            this.r = Math.PI + Math.PI / 2;
            this.ay = Math.sin(this.r) * 0.2;
        } else if (inputStates.down) {
            this.r = Math.PI / 2;
            this.ay = Math.sin(this.r) * 0.2;
        } else {
            this.ay = 0;
        }
    }

    draw(ctx) {
        ctx.save();

        if (this.state == entityStates.alive) {
            // Draw the ship
            this.sprites[0].draw(ctx, this.x, this.y, this.scale, 0);

            // Draw the shield if it is activated
            if (this.shield.isActivated()) {
                this.shield.draw(ctx, this.x - this.l / 5, this.y - this.h * 1.2, 0.4);
            }

            // Draw the cooldown if it is on cooldown
            if (this.shield.getCooldown() > 0) {
                let offset = this.l * 0.4;
                ctx.fillRect(this.x + offset / 2, this.y - this.h / 2, this.l - offset / 2, 5);
                ctx.fillStyle = "green";
                ctx.fillRect(this.x + offset / 2, this.y - this.h / 2, (this.l - offset / 2) * ((this.shield.getTotalCooldown() - this.shield.getCooldown()) / this.shield.getTotalCooldown()), 5);
            }
        }

        if (this.state == entityStates.exploding) {
            this.explosion[0].draw(ctx, this.x - this.l / 2, this.y - this.h, this.scale, 0);
            if (this.explosion[0].spriteArray.length - 1 == this.explosion[0].currentFrame) this.state = entityStates.dead;
        }

        ctx.restore();
    }

    activateShield() {
        this.shield.activateShield();
    }

    resetSpeed() {
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
    }
}

var Shield = function(sprite) {
    var shield_activated = false;
    var shield_cooldown = 12000;
    var shield_time = shield_cooldown / 3;
    var shield_last_ativated = performance.now() - shield_cooldown;
    var shield_sprite = sprite;

    var draw = function (ctx, x, y, r, scale) {
        shield_sprite[0].draw(ctx, x - r / 5, y - r * 1.2, 0.4);
    };

    var activateShield = function() {
        let now = performance.now();

        if (!shield_activated && cooldown() == 0) {
            shield_last_ativated = now;
            shield_activated = true;
            
            setTimeout(function() {
                shield_activated = false;
            }, shield_time);
        }
    };

    /**
     * When the cooldown < 0 it is available so we return 0 instead
     */
    var cooldown = function() {
        let time_elapsed = performance.now() - shield_last_ativated;

        if(time_elapsed > shield_cooldown) {
            return 0;
        } 
        return shield_cooldown - time_elapsed;
    
    };

    var isActivated = function() {
        return shield_activated;
    };

    var getTotalCooldown = function() {
        return shield_cooldown;
    };

    return {
        draw: draw,
        isActivated: isActivated,
        activateShield: activateShield,
        getCooldown: cooldown,
        getTotalCooldown: getTotalCooldown
    };
};
