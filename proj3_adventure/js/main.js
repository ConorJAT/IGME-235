"use strict";

const app = new PIXI.Application({
    width: 720,
    height: 720
});
document.body.appendChild(app.view);

// Constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// Aliases
let stage;

// Pre-Load Images
app.loader.
    add([
        // Images go here.
        "images/"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// Game Variables
let startScene;
let gameScene, knight, scoreLabel, gameOverScoreLabel, healthLabel, livesLabel;
let gameOverScene;

let monsters = [];
let score = 0;
let health = 100;
let lives = 3;
let levelNum = 1;
let paused = true;

function setup() {
	stage = app.stage;

	// #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);
	
	// #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

	// #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
	
	// #4 - Create labels for all 3 scenes
    createLabelsAndButtons();
	
	// #5 - Create ship
    knight = new Knight();
    gameScene.addChild(knight);
	
	// #6 - Load Sounds
    
	
	// #7 - Load sprite sheet
    
		
	// #8 - Start update loop
    app.ticker.add(gameLoop);
	
	// #9 - Start listening for click events on the canvas
    
	
	// Now our `startScene` is visible
	// Clicking the button calls startGame()
}

function createLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 38,
        fontFamily: "Verdana"
    });

    // #1 - Set up 'startScene'.
    // #1A - Create start top label.
    let startLabel1 = new PIXI.Text("The Monster Pit");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 82,
        fontFamily: "Verdana",
        stroke: 0xFF0000,
        strokeThickness: 6
    });

    startLabel1.x = 50;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    // #1B - Create start middle label.
    let startLabel2 = new PIXI.Text("How long will you last?");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Verdana",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });

    startLabel2.x = 185;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    // #1C - Create start game button.
    let startButton = new PIXI.Text("Begin Journey");
    startButton.style = buttonStyle;

    startButton.x = 80;
    startButton.y = sceneHeight - 100;

    startButton.interactive = true;
    startButton.buttonMode = true;

    startButton.on("pointerup", startGame);                       // 'startGame' is a function reference.
    startButton.on('pointerover', e=>e.target.alpha = 0.7);       // Concise arrow function w/ no brackets.
    startButton.on('pointerout', e=>e.currentTarget.alpha = 1.0); // Same as above.

    startScene.addChild(startButton);


    // #2 - Set up 'gameScene'.
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Verdana",
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    // #2A - Create score label.
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;

    scoreLabel.x = 5;
    scoreLabel.y = 5;

    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    // #2B - Create health label.
    healthLabel = new PIXI.Text();
    healthLabel.style = textStyle;

    healthLabel.x = 5;
    healthLabel.y = 26;

    gameScene.addChild(healthLabel);
    decreaseHealthBy(0);

    // #2C - Create lives label.
    livesLabel = new PIXI.Text();
    livesLabel.style = textStyle;

    livesLabel.x = 5
    livesLabel.y = 47;

    gameScene.addChild(livesLabel);
    decreaseLivesBy(0);
}

function startGame(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;

    levelNum = 1;
    score = 0;
    health = 100;
    lives = 3;
    increaseScoreBy(0);
    decreaseHealthBy(0);
    decreaseLivesBy(0);
    knight.x = 350;
    knight.y = 550;
    loadLevel();
}

function increaseScoreBy(value){
    score += value;
    scoreLabel.text = `Score: ${score}`;
}

function decreaseHealthBy(value){
    health -= value;
    health = parseInt(health);
    healthLabel.text = `Health:    ${health}%`;
}

function decreaseLivesBy(value){
    lives -= value;
    lives = parseInt(lives);
    livesLabel.text = `Lives: ${lives}`;
}

function gameLoop(){
	if (paused) return; // Keep this commented out for now.
	
	// #1 - Calculate "delta time".
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;
	

	// #2 - Move Ship.
    let mousePosition = app.renderer.plugins.interaction.mouse.global;
    //ship.position = mousePosition;

    let amt = dt * 6;   // At 60 FPS, would move 10% of distance per update.

    // Lerp (linear interpolate) the x and y values with lerp().
    // let newX = lerp(knight.x, mousePosition.x, amt);
    // let newY = lerp(knight.y, mousePosition.y, amt);
    // knight.movePlayer();
    knight.faceMouse(mousePosition.x, mousePosition.y);


    // Keep the ship on screen with clamp().
    let w2 = knight.width/2;
    let h2 = knight.height/2;
    knight.x = clamp(knight.x, 0 + w2, sceneWidth - w2);
    knight.y = clamp(knight.y, 0 + h2, sceneHeight - h2);
	

	// #3 - Move Circles.
	for (let c of monsters){
        c.move(dt);
        if (c.x <= c.radius || c.x >= sceneWidth - c.radius){
            c.reflectX();
            c.move(dt);
        }

        if (c.y <= c.radius || c.y >= sceneHeight - c.radius){
            c.reflectY();
            c.move(dt);
        }
    }
}

function createMonsters(numMonsters){
    for (let i = 0; i < numMonsters; i++){
        let c = new Monster(10, 0xFFFF00);
        c.x = Math.random() * (sceneWidth - 150) + 25;
        c.y = Math.random() * (sceneHeight - 500) + 25;
        monsters.push(c);
        gameScene.addChild(c);
    }
}

function loadLevel(){
	createMonsters(levelNum * 5);
	paused = false;
}

document.addEventListener('keydown', (event) => {
    if (event.key == "w"){
        knight.y -= knight.speed * (1/60);
    }

    if (event.key == "a"){
        knight.x -= knight.speed * (1/60);
    }

    if (event.key == "s"){
        knight.y += knight.speed * (1/60);
    }

    if (event.key == "d"){
        knight.x += knight.speed * (1/60);
    }
});
