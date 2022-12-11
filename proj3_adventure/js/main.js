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
        "images/background.png",
        "images/game_sect1.png",
        "images/game_sect2.png",
        "images/power_empty.png",
        "images/power_heal.png",
        "images/power_tri.png",
        "images/power_shield.png",
        "images/heart.png"
    ]);
//app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// Game Variables
let startScene;
let gameScene, knight, triArrowCount, powerupID;
let gameOverScene;

// Labels
let scoreLabel, gameOverScoreLabel, healthLabel, livesLabel, powerupLabel, statusLabel, triArrowLabel;

// Audio
let shootSound, hitSound, shieldHitSound, spdrDeathSound, triShotSound, shieldUpSound, healSound;

// Arrays
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

// Create game into flexbox.
let howToPlay = document.createElement("div");
let subheading = document.createElement("h2");
let text = document.createElement("p");

let subheadingText = document.createTextNode("How to Play:");
let howToPlayText = `WASD - Move Player<br />Left Click - Shoot Arrow(s)<br />
                     The player will always face the mouse.<br />Power-Ups will activate automatically.`;

subheading.appendChild(subheadingText);
text.innerHTML = howToPlayText;

howToPlay.appendChild(subheading);
howToPlay.appendChild(text);

window.onload = () => {
    document.querySelector("#game").appendChild(app.view);
    document.querySelector("#game").appendChild(howToPlay);
    document.querySelector("canvas").onselectstart = function () { return false; }
}

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

    shieldUpSound = new Howl({
        src: ['audio/power_shield.mp3']
    })

    healSound = new Howl({
        src: ['audio/power_heal.mp3']
    })

    triShotSound = new Howl({
        src: ['audio/power_tri.mp3']
    })
		
	// #7 - Start update loop
    app.ticker.add(gameLoop);
	
	// #8 - Start listening for click events on the canvas
    app.view.onclick = fireArrow;
}

function createLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xa17b1d,
        fontSize: 50,
        fontFamily: 'Hanalei Fill'
    });

    // #1 - Set up 'startScene'.
    // #1A - Add background.
    startScene.addChild(new Background());

    // #1B - Create start top label.
    let startLabel1 = new PIXI.Text("The Monster Pit");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xf5e8c9,
        fontSize: 76,
        fontFamily: 'Hanalei Fill',
        stroke: 0xd9a41e,
        strokeThickness: 6
    });

    startLabel1.x = 90;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    // #1C - Create start middle label.
    let startLabel2 = new PIXI.Text("How long will you survive?");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xf5e8c9,
        fontSize: 28,
        fontFamily: 'Hanalei Fill',
        fontStyle: "italic",
        stroke: 0xd9a41e,
        strokeThickness: 6
    });

    startLabel2.x = 182;
    startLabel2.y = 260;
    startScene.addChild(startLabel2);

    // #1D - Create start game button.
    let startButton = new PIXI.Text("Begin Journey");
    startButton.style = buttonStyle;

    startButton.x = 198;
    startButton.y = sceneHeight - 180;

    startButton.interactive = true;
    startButton.buttonMode = true;

    startButton.on("pointerup", startGame);                       // 'startGame' is a function reference.
    startButton.on('pointerover', e=>e.target.alpha = 0.7);       // Concise arrow function w/ no brackets.
    startButton.on('pointerout', e=>e.currentTarget.alpha = 1.0); // Same as above.

    startScene.addChild(startButton);


    // #2 - Set up 'gameScene'.
    let textStyle = new PIXI.TextStyle({
        fill: 0xf5e8c9,
        fontSize: 28,
        fontFamily: "Concert One",
        stroke: 0xd9a41e,
        strokeThickness: 4
    });

    // #2A - Add background.
    gameScene.addChild(new Background());

    // #2B - Add game sections.
    gameScene.addChild(new GameSection(0, 0, "game_sect1"));

    gameScene.addChild(new GameSection(0, 560, "game_sect2"));
    powerupLabel = new GameIcon(5, 600, "power_empty");
    gameScene.addChild(powerupLabel);

    // #2C - Add label for power-up status.
    statusLabel = new PIXI.Text("");
    statusLabel.style = new PIXI.TextStyle({
        fill: 0xf5e8c9,
        fontSize: 22,
        fontFamily: 'Concert One',
        stroke: 0xd9a41e,
        strokeThickness: 6
    });

    statusLabel.x = 110;
    statusLabel.y = 610;
    gameScene.addChild(statusLabel);

    // #2D - Add label for tri arrow count.
    triArrowLabel = new PIXI.Text("");
    triArrowLabel.style = new PIXI.TextStyle({
        fill: 0xf5e8c9,
        fontSize: 16,
        fontFamily: 'Concert One',
        stroke: 0xd9a41e,
        strokeThickness: 6
    });

    triArrowLabel.x = 110;
    triArrowLabel.y = 660;
    gameScene.addChild(triArrowLabel);

    // #2E - Create score label.
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;

    scoreLabel.x = 5;
    scoreLabel.y = 5;

    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    // #2F - Create health label.
    healthLabel = new PIXI.Text();
    healthLabel.style = textStyle;

    healthLabel.x = 5;
    healthLabel.y = 35;

    gameScene.addChild(healthLabel);
    decreaseHealthBy(0);

    // #2G - Create lives label.
    livesLabel = new PIXI.Text();
    livesLabel.style = textStyle;

    livesLabel.x = 5
    livesLabel.y = 65;

    gameScene.addChild(livesLabel);
    decreaseLivesBy(0);

    gameScene.addChild(new GameIcon(124, 70, "heart"))


    // #3 - Set up `gameOverScene`.
    // #3A - Add background.
    gameOverScene.addChild(new Background());

    // #3B - Make game over text.
    let gameOverText = new PIXI.Text("~You have been slain!~");
    textStyle = new PIXI.TextStyle({
	    fill: 0xf5e8c9,
	    fontSize: 56,
	    fontFamily: 'Hanalei Fill',
	    stroke: 0xd9a41e,
	    strokeThickness: 6
    });
    gameOverText.style = textStyle;

    gameOverText.x = 78;
    gameOverText.y = 120;
    gameOverScene.addChild(gameOverText);

    // #3C - Make "Final Score" label.
    gameOverScoreLabel = new PIXI.Text(`Your final score: ${score}`);
    textStyle = new PIXI.TextStyle({
	    fill: 0xf5e8c9,
	    fontSize: 32,
	    fontFamily: 'Hanalei Fill',
	    stroke: 0xd9a41e,
	    strokeThickness: 6
    });
    gameOverScoreLabel.style = textStyle;

    gameOverScoreLabel.x = 220;
    gameOverScoreLabel.y = 260;
    gameOverScene.addChild(gameOverScoreLabel);

    // #3D - Make "Play Again?" button.
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;

    playAgainButton.x = 232;
    playAgainButton.y = sceneHeight - 180;

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

    // Reset all power-up related code.
    gameScene.removeChild(powerupLabel);
    powerupLabel = new GameIcon(5, 600, "power_empty");
    gameScene.addChild(powerupLabel);
    statusLabel.text = "";
    triArrowLabel.text = "";

    shielded = false;
    triShot = false;
    triArrowCount = 0;
    powerupID = 0;

    // Reset general player stats.
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
    livesLabel.text = `Lives: ${lives} x`;
}

function gameLoop(){
	if (paused) return; // Keep this commented out for now.
	
	// #1 - Calculate "delta time".
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;
	

    // #2 - Generate power-ups (RNG).
    if(powerups.length < 2){
        if(Math.random() * 10000 <= 10){
            createPowerUp();
        }
    }


    // #3 - Change player sprite if shielded.
	if (shielded){
        gameScene.removeChild(knight);
        knight = new Knight(knight.x, knight.y, true);
        gameScene.addChild(knight);
    }
    

    // #4 - Move player.
    let mousePosition = app.renderer.plugins.interaction.mouse.global;

    let amt = dt * 6;   // At 60 FPS, would move 10% of distance per update.

    // Player Rotation
    knight.faceMouse(mousePosition.x, mousePosition.y);

    // Player Movement
    // W Key
    if (keys["87"]){
        knight.y -= 3;
    }

    // A Key
    if (keys["65"]){
        knight.x -= 3;
    }

    // S Key
    if (keys["83"]){
        knight.y += 3;
    }

    // D Key
    if (keys["68"]){
        knight.x += 3;
    }
    
    // Keep the player on screen with clamp().
    let w2 = knight.width/2;
    let h2 = knight.height/2;
    knight.x = clamp(knight.x, 0 + w2, sceneWidth - w2);
    knight.y = clamp(knight.y, 0 + h2, sceneHeight - h2);


	// #5 - Move monsters.
	for (let m of monsters){
        m.move(dt);
        if (m.x <= m.radius || m.x >= sceneWidth - m.radius){
            m.reflectX();
            m.move(dt);
        }

        if (m.y <= m.radius || m.y >= sceneHeight - m.radius){
            m.reflectY();
            m.move(dt);
        }
    }


    // #6 - Move arrows.
    for (let a of arrows){
		a.move(dt);
	}


    // #7 - Move power-ups.
    for (let p of powerups){
        p.move(dt);
    }


    // #8 - Check for collisions.
    for (let m of monsters){
        for (let a of arrows){

            // #8A - Monsters and Arrows
            if (rectsIntersect(a,m)){
                spdrDeathSound.play();

                gameScene.removeChild(a);
                a.isAlive = false;

                gameScene.removeChild(m);
                m.isAlive = false;
                increaseScoreBy(10);
            }

            // Remove arrows that are out of bounds.
            if(a.y < -20 || a.y > 740 || a.x < -20 || a.x > 740) a.isAlive = false;
        }

        // #8B - Monsters and Player.
        if (m.isAlive && rectsIntersect(m, knight)){
            if(shielded){       // Checks if player is shielded.
                if(powerupID == 2){     // Used to swap power-up icon when necessary.
                    powerupID = 0;

                    gameScene.removeChild(powerupLabel);
                    powerupLabel = new GameIcon(5, 600, "power_empty");
                    gameScene.addChild(powerupLabel);

                    statusLabel.text = "";
                }
                
                shieldHitSound.play();
                shielded = false;

                // Revert player back to original sprite.
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

    // #8C - Power-Ups and Player.
    for (let p of powerups){

        if (rectsIntersect(p, knight)){
            gameScene.removeChild(p);
            p.isAlive = false;
            increaseScoreBy(25);

            // Effect of eah power-up is randomized.
            let effect = Math.floor(Math.random() * 3);

            switch(effect){
                case 0:     // Tri Arrow Effect
                    powerupID = 1;
                    triShot = true;
                    triArrowCount = 20;
                    triShotSound.play();

                    statusLabel.text = "Triple Shot!";
                    triArrowLabel.text = "Remaining: 20 Shot(s)"

                    gameScene.removeChild(powerupLabel);
                    powerupLabel = new GameIcon(5, 600, "power_tri");
                    gameScene.addChild(powerupLabel);
                    break;

                case 1:     // Shield Effect
                    powerupID = 2;    
                    shielded = true;
                    shieldUpSound.play();

                    statusLabel.text = "Shielded!";
                    gameScene.removeChild(powerupLabel);
                    powerupLabel = new GameIcon(5, 600, "power_shield");
                    gameScene.addChild(powerupLabel);
                    break;

                case 2:     // Healing Effect
                    powerupID = 3;
                    increaseHealthBy(30);
                    healSound.play();

                    statusLabel.text = "Healing!";

                    gameScene.removeChild(powerupLabel);
                    powerupLabel = new GameIcon(5, 600, "power_heal");
                    gameScene.addChild(powerupLabel);
                    break;
            }
        }

        // Remove power-ups that are out of bounds.
        if(p.y >= 740) p.isAlive = false;
    }
	

	// #9 - Now do some clean up.
    // Remove dead arrows.
    arrows = arrows.filter(a=>a.isAlive);

    // Remove dead monsters.
    monsters = monsters.filter(m=>m.isAlive);

    // Remove dead powerups.
    powerups = powerups.filter(p=>p.isAlive);


    // #10 - Is game over?
    if (lives <= 0){
        end();
        return;     // Return here so we skip #8 below.
    }

    // #11 - Load next level
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

    if (triShot){       // Checks if the player currently has tri shot active.
        let aLeft = new Arrow(knight.x, knight.y, (knight.rotation - (Math.PI/12)));
        arrows.push(aLeft);
        gameScene.addChild(aLeft);

        let aRight = new Arrow(knight.x, knight.y, (knight.rotation + (Math.PI/12)));
        arrows.push(aRight);
        gameScene.addChild(aRight);

        triArrowCount--;

        // Using tri shot, print how many shots are left.
        triArrowLabel.text = `Remaining: ${triArrowCount} Shot(s)`;

        if(triArrowCount == 0){
            if(powerupID == 1){     // Used to swap power-up icon when necessary.
                powerupID = 0;

                gameScene.removeChild(powerupLabel);
                powerupLabel = new GameIcon(5, 600, "power_empty");
                gameScene.addChild(powerupLabel);

                statusLabel.text = "";
            }
            
            triShot = false;
            triArrowLabel.text = "";
        }
    }

    let b = new Arrow(knight.x, knight.y, knight.rotation);
    arrows.push(b);
    gameScene.addChild(b);
    shootSound.play();
}

function createMonsters(numMonsters){
    for (let i = 0; i < numMonsters; i++){
        let m = new Monster(10, 0xFFFF00);
        m.x = Math.random() * (sceneWidth - 150) + 25;
        m.y = Math.random() * (sceneHeight - 500) + 25;
        monsters.push(m);
        gameScene.addChild(m);
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
