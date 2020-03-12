var json;
var scene = null;
var startTime;

let s = new p5((sketch) => {
    sketch.preload = () => {
        sketch.json = sketch.loadJSON("scenes/boxStacks.json");
    };
    
    sketch.setup = () => {
        sketch.scene = (new SceneLoader(sketch.json)).scene;
        console.log(sketch.scene);
        
        // P5 settings
        sketch.startTime = sketch.millis();
        sketch.createCanvas(sketch.scene.cam.width, sketch.scene.cam.height);
        sketch.frameRate(30);
            
        // Load the pixels into the back buffer
        sketch.loadPixels();
    };
    
    sketch.draw = () => {
    	if(sketch.scene.draw(1000/40, sketch)) { // Roughly 40 FPS limit on ray-tracing, around 30 with overheads
        	console.log("Completed drawing in " + (sketch.millis() - sketch.startTime) + " ms.");
        	sketch.noLoop();
    	}
    };
    
    sketch.drawFrom = (json) => {
        sketch.noLoop();
        sketch.scene = (new SceneLoader(json)).scene;
        sketch.startTime = sketch.millis();
        sketch.resizeCanvas(sketch.scene.cam.width, sketch.scene.cam.height);
        sketch.loop();
    };
    
    sketch.loadAndDraw = (jsonURL) => {
        sketch.loadJSON(jsonURL, sketch.drawFrom);
    };
});
