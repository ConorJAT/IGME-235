class Knight extends PIXI.Graphics{
    constructor(color = 0xFFFFFF, x = 0, y = 0){
        super();
        this.beginFill(color);
        this.drawRect(-16, -16, 32, 32);
        this.endFill();
        this.x = x;
        this.y = y;

        this.speed = 400;
        this.fwd = {x:0, y:-1}
    }

    faceMouse(mouseX, mouseY){
        let toMouseX = mouseX - this.x;
        let toMouseY = mouseY - this.y;

        this.rotation += Math.atan(toMouseY/toMouseX) * (1/60);
    }
}

class Monster extends PIXI.Graphics{
    constructor(radius, color = 0xFF0000, x = 0, y = 0){
        super();
        this.beginFill(color);
        this.drawCircle(0, 0, radius);
        this.endFill();
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

/*class Knight extends PIXI.Sprite{

}*/