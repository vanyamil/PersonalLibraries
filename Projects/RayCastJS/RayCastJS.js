var json;
var scene = null;
var startTime;

function preload() {
    json = loadJSON("scenes/boxStacks.json");
}

function setup() {
    scene = (new SceneLoader(json)).scene;
    console.log(scene);
    
    // P5 settings
    startTime = millis();
    createCanvas(scene.cam.width, scene.cam.height);
    frameRate(30);
}

function draw() {
	if(scene.draw(1000/40)) { // Roughly 40 FPS limit on ray-tracing, around 30 with overheads
    	console.log("Completed drawing in " + (millis() - startTime) + " ms.");
    	noLoop();
	}
}

function drawFrom(json) {
    noLoop();
    scene = (new SceneLoader(json)).scene;
    startTime = millis();
    resizeCanvas(scene.cam.width, scene.cam.height);
    loop();
}

function loadAndDraw(jsonURL) {
    loadJSON(jsonURL, drawFrom);
}
