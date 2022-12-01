"use strict";

const app = new PIXI.Application({
    width: 720,
    height: 720
});
document.body.appendChild(app.view);

// Constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// Pre-Load Images
app.loader.
    add([
        // Images go here.
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// Aliases
let stage;