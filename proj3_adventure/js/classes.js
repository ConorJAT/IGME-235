// The main character the player controls.
class Knight extends PIXI.Sprite{
    constructor(x = 0, y = 0, shielded = false){
        if (shielded){
            super(app.loader.resources["images/knight_protect.png"].texture);
        }
        else{
            super(app.loader.resources["images/knight.png"].texture);
        }
        
        this.anchor.set(0.5, 0.5);  // Position, scaling and rotation now from center of sprite.
        this.scale.set(0.15);
        this.x = x;
        this.y = y;
    }

    // Player always faces the mouse cursor.
    faceMouse(mouseX, mouseY){
        let toMouseX = mouseX - this.x;
        let toMouseY = mouseY - this.y;

        if (toMouseY >= 0 && toMouseX >= 0){
            this.rotation = Math.atan(toMouseY/toMouseX) - (Math.PI / 2);
        }

        else if (toMouseY <= 0 && toMouseX >= 0){
            this.rotation = Math.atan(toMouseY/toMouseX) - (Math.PI / 2);
        }

        else if (toMouseY <= 0 && toMouseX <= 0){
            this.rotation = Math.atan(toMouseY/toMouseX) + (Math.PI / 2);
        }

        else{
            this.rotation = Math.atan(toMouseY/toMouseX) + (Math.PI / 2);
        }
    }
}

// Arrow projectiles shot by the player.
class Arrow extends PIXI.Sprite{
    constructor(x = 0, y = 0, rotate = 0){
        super(app.loader.resources["images/arrow_smll.png"].texture);
        this.anchor.set(0.5, 0.5);  // Position, scaling and rotation now from center of sprite.
        this.rotation = rotate;
        this.x = x;
        this.y = y;

        // Variables
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt = 1/60){
        this.x += -Math.sin(this.rotation) * this.speed * dt;
        this.y += Math.cos(this.rotation) * this.speed * dt;
    }
}

// Monster enemies the player must defeat to proceed.
class Monster extends PIXI.Sprite{
    constructor(radius, x = 0, y = 0){
        super(app.loader.resources["images/spider_smll.png"].texture);
        this.anchor.set(0.5, 0.5);  // Position, scaling and rotation now from center of sprite.
        this.x = x;
        this.y = y;
        this.radius = radius;

        // Variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
    }

    move(dt = 1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectX(){
        this.fwd.x *= -1;
    }

    reflectY(){
        this.fwd.y *= -1;
    }
}

// Power-Ups the player can collect for an in-game advantage.
class PowerUp extends PIXI.Sprite{
    constructor(x = 0, y = 0){
        super(app.loader.resources["images/powerup.png"].texture);
        this.anchor.set(0.5, 0.5);  // Position, scaling and rotation now from center of sprite.
        this.x = x;
        this.y = y;

        // Variables
        this.fwd = {x:0, y:1};
        this.speed = 80;
        this.isAlive = true;
    }

    move(dt = 1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

// Generates a background image for the game.
class Background extends PIXI.Sprite{
    constructor(x = 0, y = 0){
        super(app.loader.resources["images/background.png"].texture);
    }
}

// Creates sections for in-game content to be stored in.
class GameSection extends PIXI.Sprite{
    constructor(x = 0, y = 0, section){
        super(app.loader.resources[`images/${section}.png`].texture);

        this.x = x;
        this.y = y;
    }
}

// Used to display any other images/sprite in-game.
class GameIcon extends PIXI.Sprite{
    constructor(x = 0, y = 0, image){
        super(app.loader.resources[`images/${image}.png`].texture);

        this.x = x;
        this.y = y;
    }
}
