class Ship extends PIXI.Sprite{
    constructor(x = 0, y = 0){
        super(app.loader.resources["images/spaceship.png"].texture);
        this.anchor.set(0.5, 0.5);  // Position, scaling and rotation now from center of sprite.
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
    }
}