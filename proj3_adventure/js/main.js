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
        "images/knight.png",
        "images/knight_protect.png",
        "images/arrow_smll.png",
        "images/powerup.png",
        "images/spider_smll.png",
        "images/background.png"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// Game Variables
let startScene;
let gameScene, knight, scoreLabel, gameOverScoreLabel, healthLabel, livesLabel; 
let shootSound, hitSound, shieldHitSound, spdrDeathSound;
let gameOverScene;

let monsters = [];
let arrows = [];
let powerups = [];
let score = 0;
let health = 100;
let lives = 3;
let levelNum = 1;
let paused = true;

// Powerup Variables
let triShot = false;
let shielded = false;

let keys = {};

window.addEventListener("keydown", keysDown);
window.addEventListener("keyup", keysUp);

function keysDown(e){
    keys[e.keyCode] = true;
}

function keysUp(e){
    keys[e.keyCode] = false;
}

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
	
	// #5 - Create player
    knight = new Knight();
    gameScene.addChild(knight);
	
	// #6 - Load audio
    shootSound = new Howl({
	    src: ['audio/arrow_fire.mp3']
    });

    hitSound = new Howl({
        src: ['audio/hurt.mp3']
    })

    spdrDeathSound = new Howl({
        src: ['audio/spider_death.wav']
    })

    shieldHitSound = new Howl({
        src: ['audio/shield_hit.mp3']
    })
	
	// #7 - Load sprite sheet
    
		
	// #8 - Start update loop
    app.ticker.add(gameLoop);
	
	// #9 - Start listening for click events on the canvas
    app.view.onclick = fireArrow;
	
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

    startScene.addChild(new Background());

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

    gameScene.addChild(new Background());

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


    // #3 - Set up `gameOverScene`.

    gameOverScene.addChild(new Background());

    // #3A - Make game over text.
    let gameOverText = new PIXI.Text("Game Over!\n      :-O");
    textStyle = new PIXI.TextStyle({
	    fill: 0xFFFFFF,
	    fontSize: 64,
	    fontFamily: "Verdana",
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

    playAgainButton.x = 180;
    playAgainButton.y = sceneHeight - 100;

    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;

    playAgainButton.on("pointerup",startGame);                       // 'startGame' is a function reference.
    playAgainButton.on('pointerover',e=>e.target.alpha = 0.7);       // Concise arrow function w/ no brackets.
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // Same as above.

    gameOverScene.addChild(playAgainButton);

    // #3C - Make "Final Score" label.
    gameOverScoreLabel = new PIXI.Text(`Your final score: ${score}`);
    textStyle = new PIXI.TextStyle({
	    fill: 0xFFFFFF,
	    fontSize: 32,
	    fontFamily: "Verdana",
	    stroke: 0xFF0000,
	    strokeThickness: 6
    });
    gameOverScoreLabel.style = textStyle;

    gameOverScoreLabel.x = 130;
    gameOverScoreLabel.y = 350;
    gameOverScene.addChild(gameOverScoreLabel);
}

function startGame(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;

    levelNum = 1;
    score = 0;
    health = 100;
    lives = 1;
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
    if (health <= 0 || health - value <= 0){
        decreaseLivesBy(1);
        health = 100;
    }
    
    else{
        health -= value;
    }
    
    health = parseInt(health);
    healthLabel.text = `Health:    ${health}%`;
}

function increaseHealthBy(value){
    if (health >= 100 || health + value >= 100){
        health = 100;
    }

    else{
        health += value;
    }

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
	

    if(powerups.length < 2){
        if(Math.random() * 10000 <= 10){
            createPowerUp();
        }
    }

	if (shielded){
        gameScene.removeChild(knight);
        knight = new Knight(knight.x, knight.y, true);
        gameScene.addChild(knight);
    }
    
    // #2 - Move Player.
    let mousePosition = app.renderer.plugins.interaction.mouse.global;

    let amt = dt * 6;   // At 60 FPS, would move 10% of distance per update.

    // Player Rotation
    knight.faceMouse(mousePosition.x, mousePosition.y);

    // Player Movement
    // W
    if (keys["87"]){
        knight.y -= 3;
    }

    // A
    if (keys["65"]){
        knight.x -= 3;
    }

    // S
    if (keys["83"]){
        knight.y += 3;
    }

    // D
    if (keys["68"]){
        knight.x += 3;
    }
    
    // Keep the player on screen with clamp().
    let w2 = knight.width/2;
    let h2 = knight.height/2;
    knight.x = clamp(knight.x, 0 + w2, sceneWidth - w2);
    knight.y = clamp(knight.y, 0 + h2, sceneHeight - h2);


	// #3 - Move Enemies.
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

    // #4 - Move Arrows
    for (let a of arrows){
		a.move(dt);
	}

    for (let p of powerups){
        p.move(dt);
    }

    // #5 - Check for Collisions.
    for (let m of monsters){
        for (let a of arrows){

            // #5A - Monsters and Arrows
            if (rectsIntersect(a,m)){
                spdrDeathSound.play();

                gameScene.removeChild(a);
                a.isAlive = false;

                gameScene.removeChild(m);
                m.isAlive = false;
                increaseScoreBy(10);
            }

            if(a.y < -20 || a.y > 740 || a.x < -20 || a.x > 740) a.isAlive = false;
        }

        

        // #5B - Monsters and Player
        if (m.isAlive && rectsIntersect(m, knight)){
            if(shielded){
                shieldHitSound.play();
                shielded = false;

                gameScene.removeChild(knight);
                knight = new Knight(knight.x, knight.y);
                gameScene.addChild(knight);
            }
            
            else{
                hitSound.play();
                decreaseHealthBy(20);
            }
            
            gameScene.removeChild(m);
            m.isAlive = false;
        }
    }

    // #5C - Power-Ups and Player
    for (let p of powerups){

        if (rectsIntersect(p, knight)){
            gameScene.removeChild(p);
            p.isAlive = false;
            increaseScoreBy(25);

            let effect = Math.floor(Math.random() * 3);

            
            switch(effect){
                case 0:
                    triShot = true;
                    break;

                case 1:
                    shielded = true;
                    break;

                case 2:
                    increaseHealthBy(30);
                    break;
            }
        }

        if(p.y >= 740) a.isAlive = false;
    }
	

	// #6 - Now do some clean up.
    // Remove dead arrows.
    arrows = arrows.filter(a=>a.isAlive);

    // Remove dead monsters.
    monsters = monsters.filter(m=>m.isAlive);

    // Remove dead powerups.
    powerups = powerups.filter(p=>p.isAlive);


    // #7 - Is game over?
    if (lives <= 0){
        end();
        return;     // Return here so we skip #8 below.
    }

    // #8 - Load next level
    if (monsters.length == 0){
        levelNum++;
        loadLevel();
    }
}

function end(){
    paused = true;

    // Clear out level.
    monsters.forEach(m=>gameScene.removeChild(m));
    monsters = [];

    arrows.forEach(a=>gameScene.removeChild(a));
    arrows = [];

    // Display final score.
    gameOverScoreLabel.text = `Your final score: ${score}`;

    gameOverScene.visible = true;
    gameScene.visible = false;
}

function fireArrow(e){
    if (paused) return;

    if (triShot){
        let aLeft = new Arrow(knight.x, knight.y, (knight.rotation - (Math.PI/12)));
        arrows.push(aLeft);
        gameScene.addChild(aLeft);

        let aRight = new Arrow(knight.x, knight.y, (knight.rotation + (Math.PI/12)));
        arrows.push(aRight);
        gameScene.addChild(aRight);
    }

    let b = new Arrow(knight.x, knight.y, knight.rotation);
    arrows.push(b);
    gameScene.addChild(b);
    shootSound.play();
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

function createPowerUp(){
    let p = new PowerUp((Math.random() * 689) + 16, -20);
    powerups.push(p);
    gameScene.addChild(p);
}

function loadLevel(){
	createMonsters(levelNum * 5);
	paused = false;
}
