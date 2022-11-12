// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application({
    width: 700,
    height: 700
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

// pre-load the images
app.loader.
    add([
        "images/spaceship.png",
        "images/explosions.png"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// aliases
let stage;

// game variables
let startScene;
let gameScene,ship,scoreLabel,lifeLabel,shootSound,hitSound,fireballSound;
let gameOverScene;

let circles = [];
let bullets = [];
let aliens = [];
let explosions = [];
let explosionTextures;
let score = 0;
let life = 100;
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
    ship = new Ship();
    gameScene.addChild(ship);
	
	// #6 - Load Sounds
    shootSound = new Howl({
	    src: ['sounds/shoot.wav']
    });

    hitSound = new Howl({
	    src: ['sounds/hit.mp3']
    });

    fireballSound = new Howl({
	    src: ['sounds/fireball.mp3']
    });
	
	// #7 - Load sprite sheet
		
	// #8 - Start update loop
	
	// #9 - Start listening for click events on the canvas
	
	// Now our `startScene` is visible
	// Clicking the button calls startGame()
}

function createLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "Verdana"
    });

    // #1 - Set up 'startScene'.
    // #1A - Create start top label.
    let startLabel1 = new PIXI.Text("Circle Blast!");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: "Verdana",
        stroke: 0xFF0000,
        strokeThickness: 6
    });

    startLabel1.x = 50;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    // #1B - Create start middle label.
    let startLabel2 = new PIXI.Text("R U Worthy...?");
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
    let startButton = new PIXI.Text("Enter ... If You Dare!~");
    startButton.style = buttonStyle;

    startButton.x = 80;
    startButton.y = sceneHeight - 100;

    startButton.interactive = true;
    startButton.buttonMode = true;

    startButton.on("pointerup", startGame);                         // 'startGame' is a function reference.
    startButton.on('pointerover', e => e.target.alpha = 0.7);       // Concise arrow function w/ no brackets.
    startButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // Same as above.

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

    // #2B - Create life label.
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;

    lifeLabel.x = 5;
    lifeLabel.y = 26;

    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);


    // #3 - Set up `gameOverScene`.
    // #3A - Make game over text.
    let gameOverText = new PIXI.Text("Game Over!\n        :-O");
    textStyle = new PIXI.TextStyle({
	    fill: 0xFFFFFF,
	    fontSize: 64,
	    fontFamily: "Futura",
	    stroke: 0xFF0000,
	    strokeThickness: 6
    });
    gameOverText.style = textStyle;

    gameOverText.x = 100;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);

    // #3B - Make "Play Again?" button.
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;

    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;

    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;

    playAgainButton.on("pointerup",startGame);                       // 'startGame' is a function reference.
    playAgainButton.on('pointerover',e=>e.target.alpha = 0.7);       // Concise arrow function w/ no brackets.
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // Same as above.

    gameOverScene.addChild(playAgainButton);
}

function startGame(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;

}

function increaseScoreBy(value){
    score += value;
    scoreLabel.text = `Score: ${score}`;
}

function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Life:    ${life}%`;
}