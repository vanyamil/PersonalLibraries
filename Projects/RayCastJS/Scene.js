class Scene {
    constructor() {
        this.materials = {};
        this.lights = [];
        this.setAmbient([0, 0, 0]);
        this.setBG([0, 0, 0]);
        this.setSamples(1);
        this.reflDepth = 0;
        
		// Special stuff for interactive loading
		this.lastX = 0;
		this.lastY = 0;

        // MULTITHREADING WARNING
        this.shadowIR = new IntersectionResult();
    }
    
    setSamples(v) {
        this.samples = [
        	[0.5, 0.5]
        ];
        while(--v > 0) {
            this.samples.push([
            	random(),
            	random()
            ]);
        }
    }
    
    setCamera(cam) {
        this.cam = cam;
    }
    
    setRootNode(root) {
        this.root = root;
    }
    
    setBG(c) {
        this.bg = new MyColor(c);
    }
    
    setAmbient(c) {
        this.ambient = new MyColor(c);
    }
    
    addLight(l) {
        this.lights.push(l);
    }
    
    addMaterial(mat) {
        this.materials[mat.name] = mat;
    }
    
    lighting(ray, IR) {
        const shadowRay = new Ray();
        // Compute reflection ray
        const reflV = ray.dir.reflect(IR.n);
        reflV.mult(-1); // Now points away from surface
        
        const lll = new MyColor([0, 0, 0]);
        
        // Reflective 
        if(IR.material.reflectEnabled && ray.depth > 0) {
            const reflRay = new Ray(IR.p, reflV);
            const reflIR = new IntersectionResult(); // Need a new here due to recursion
            reflRay.setDepth(ray.depth - 1);
            lll.add(this.getColor(reflRay, reflIR));
            lll.multWise(IR.material.reflect);
        } 
        else { // Ambient light
            lll.add(IR.material.diffuse);
            lll.multWise(this.ambient);
        }
        
        // For each light
        this.lights.forEach(function(l) {
            // TODO for each light sample
            
            // Get light vector
            const dv = l.pos.copy().sub(IR.p);
            const dvm = dv.mag();
            if(dvm != 1) {
            	dv.div(dvm);
            }
            
            // Test shadow ray
            shadowRay.set(IR.p, dv);
            shadowRay.setBounds(1e-5, dvm);
            this.shadowIR.reset();
            if(this.root.intersects(shadowRay, this.shadowIR)) {
                return;
            }
            
            // Diffuse
            let angleCoef = Math.max(0, IR.n.dot(dv));
            if(angleCoef <= 0) { return; }
            let tempLight = IR.material.diffuse.copy();
            tempLight.multWise(l.c);
            tempLight.mult(angleCoef);
            lll.add(tempLight);
            
            // Specular
            if(IR.material.specularEnabled) {
                angleCoef = Math.max(0, reflV.dot(dv));
            	if(angleCoef <= 0) { return; }
            	tempLight = IR.material.specular.copy();
            	tempLight.multWise(l.c);
            	tempLight.mult(Math.pow(angleCoef, IR.material.specExp));
            	lll.add(tempLight);
            }
        }, this);       
        
        const c = lll.getFinal();
        return c;
    }
    
    getColor(ray, IR) {
        IR.reset();
        
        if(this.root.intersects(ray, IR)) {
            // Find value for that pixel
            return new MyColor(this.lighting(ray, IR));
        }
        else {
        	// If we don't intersect, default background color
            return this.bg;
        }
    }
    
    getPixel(x, y, ray, IR) {
        const sumColor = new MyColor();
        for(let i = 0; i < this.samples.length; i++) {
            // Generate the ray for this pixel
            const dx = this.samples[i][0];
            const dy = this.samples[i][1];
            if(!this.cam.generateRay(x+dx, y+dy, ray)) {
                console.log("Problem in the code - could not generate camera ray!");
                return;
            }
            
            ray.setDepth(this.reflDepth);
            sumColor.add(this.getColor(ray, IR));
        }
        sumColor.div(this.samples.length);
        return sumColor.getFinal();
    }
    
    draw(timeLimit) {
        const ray = new Ray();
        const IR = new IntersectionResult();
        
        // Load the pixels into the back buffer
        loadPixels();
        
        // Prepare the interactive loop
        const deadline = millis() + timeLimit;
        let x = this.lastX;
        let y = this.lastY;
        
        // Interactive loop - can only go until time limit
        while(millis() < deadline) {
        	set(x, y, color(this.getPixel(x, y, ray, IR)));
        	x++;
        	if(x == this.cam.width) {
            	x = 0;
            	y++;
            	if(y == this.cam.height) {
                    // Put those pixels into main buffer/canvas
                    updatePixels();
                    // We finished drawing
                	return true;
            	}
        	}
        }
        // Put those pixels into main buffer/canvas
        updatePixels();
        // Not yet finished drawing, save state
        this.lastX = x;
        this.lastY = y;
        return false;
    }
}

class SceneLoader {
    constructor(json) {
        this.scene = new Scene();
        this.refMap = {}; // Object names to objects
        this.loadScene(json);
    }
    
    loadCamera(json) {
        const cam = new Camera(
            json.pos, 
            json.lookAt, 
            json.up 
        );
        cam.setScreen(json.screen.w, json.screen.h, json.fovy);
        return cam;
    }
    
    loadMaterial(json) {
        // If material is just a reference, try and get it
        if(typeof json === "string") {
            if(this.scene.materials[json] === "undefined") {
                throw "Material reference to non-existent material!";
            } else {
                return this.scene.materials[json];
            }
        }       
        
        // Load material from scratch
        const mat = new Material(json.diffuse);
        if(typeof json.name !== "undefined") {
            mat.name = json.name;
        }        
        if(typeof json.specExp !== "undefined") {
            mat.setSpecular(json.specExp, json.specular);
        }
        if(typeof json.reflect !== "undefined") {
            if(json.reflect === true) {
                mat.setReflect();
            } else {
            	mat.setReflect(json.reflect);
            }
        }
        
        return mat;
    }
    
    loadLight(json) {
        const c = json.color;
        return new PointLight(json.pos, c);
    }
    
    loadInter(json) {
        // If we just state a reference, check the map.
        if(typeof json === "string") {
            if(this.refMap[json] === "undefined") {
                throw "Object reference to non-existent object!";
            } else {
                return this.refMap[json];
            }
        }  
        
        let outp = null;
        switch(json.type.toLowerCase()) {
            case "plane": outp = this.loadPlane(json); break;
            case "node": outp = this.loadNode(json); break;
            case "sphere": outp = this.loadSphere(json); break;
            case "box": outp = this.loadBox(json); break;
            case "transform": outp = this.loadTransform(json); break;
            default: throw "You did not implement a loader for this object";
        }
        // Default material
        if(outp !== null && typeof json.material !== "undefined") {
        	outp.setMaterial(this.loadMaterial(json.material));
        }
        // Name?
        if(outp !== null && typeof json.name !== "undefined") {
            outp.name = json.name;
            this.refMap[outp.name] = outp;
        }
        
        return outp;
    }
    
    loadNode(json) {
        const children = [];
        for(const i in json.children) {
            children.push(this.loadInter(json.children[i]));
        }
        
        const node = new SceneNode(children);
        if(typeof json.bounds !== "undefined") {
            node.setBounds(this.loadInter(json.bounds));
        }
        return node;
    }
    
    loadPlane(json) {
        let mat2 = null;
        if(typeof json.mat2 !== "undefined") {
            mat2 = this.loadMaterial(json.mat2);
        }
        
        return new Plane(mat2);
    }
    
    loadSphere(json) {
        return new Sphere(json.pos || [0, 0, 0], json.radius || 1);
    }
    
    loadBox(json) {
        return new Box(json.min, json.max);
    }
    
    loadTransform(json) {
        const child = this.loadInter(json.child);
        const t = json.translate;
        const r = (typeof json.rotate === "undefined" ? [0, 0, 0] : json.rotate);
        const s = (typeof json.scale === "undefined" ? 1 : json.scale);
        
        return new MatrixTransform(child, t, r, s);
    }
    
    loadScene(json) {    
        // Simple properties        
        if(typeof json.samples !== "undefined") {
            this.scene.setSamples(json.samples);
        }
        if(typeof json.reflDepth !== "undefined") {
            this.scene.reflDepth = json.reflDepth;
        }
        if(typeof json.ambient !== "undefined") {
            this.scene.setAmbient(json.ambient);
        }
        if(typeof json.bg !== "undefined") {
            this.scene.setBG(json.bg);
        }
        
        // Harder properties
        if(typeof json.lights !== "undefined") {
            for(let i in json.lights) {
                this.scene.addLight(this.loadLight(json.lights[i]));
            }
        }
        if(typeof json.materials !== "undefined") {
            for(let i in json.materials) {
                this.scene.addMaterial(this.loadMaterial(json.materials[i]));
            }
        }
        this.scene.setCamera(this.loadCamera(json.camera));
        
        // Scene graph
        this.scene.setRootNode(this.loadInter(json.root));
    }
}
