class Knight extends PIXI.Sprite{
    constructor(x = 0, y = 0){
        super(app.loader.resources["images/knight.png"].texture);
        this.anchor.set(0.5, 0.5);  // Position, scaling and rotation now from center of sprite.
        this.scale.set(0.15);
        this.x = x;
        this.y = y;

        this.speed = 500;
    }

    faceMouse(mouseX, mouseY){
        let toMouseX = mouseX - this.x;
        let toMouseY = mouseY - this.y;

        if (toMouseY/toMouseX > 0){
            this.rotation = Math.atan(toMouseY/toMouseX) + Math.PI / 2;
        }

        else{
            this.rotation = Math.atan(toMouseY/toMouseX) - Math.PI / 2;
        } 
    }
}

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
