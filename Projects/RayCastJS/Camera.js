class Camera {
    constructor(pos, lookAt, up) {
        this.pos = createVector();
        this.dir = createVector();
        this.lookAt = createVector();
        this.set(pos, lookAt, up);
        
        this.dof = {};
        this.setDOF(this.lookAt.copy(), this.dir.copy(), 1, 1);
    }
    
    set(pos, lookAt, up) {
        this.lookAt.set(lookAt);
        // Camera location
        this.pos.set(pos);
        // Viewing direction
        this.dir.set(p5.Vector.sub(lookAt, pos));
        this.dir.normalize();
        // The "right" vector - the X coordinate of the screen will be along it
        this.right = p5.Vector.cross(up, this.dir);
        this.right.normalize();
        // The "up" vector - the Y coordinate of the screen will be along it
        this.up = p5.Vector.cross(this.dir, this.right);
        this.up.normalize(); // Should already be normalized, but doing for rounding errors
    }
    
    setScreen(width, height, fovy) {
        // Screen width
        this.width = width;
        this.width2 = width / 2;
        // Screen height
        this.height = height;
        this.height2 = height / 2;
        // Field-of-view angle and aspect ratio considerations
        this.fovy = fovy;
        let tanned = Math.tan(fovy * Math.PI/360); // Angle given in degrees; switch to radians and divide by 2
        // Vector from camera position to center of screen
        this.vToScreen = this.dir.copy();
        this.vToScreen.setMag(this.height2 / tanned);
    }
    
    /*
    // Returns the t for a ray to hit the focus plane
    public double DOF.distToFocus(Ray ray) {
        Vector3d temp = new Vector3d();
        temp.sub(pointOnFocusPlane, ray.eyePoint);
        
        return focusPlaneNormal.dot(temp) / focusPlaneNormal.dot(ray.viewDirection);
    }
    
    Start with the pixel sample ray
    transform using this for each camOffset (which is at most "aperture" away from the center)
    public static void dofRay(final Point2d camOffset, final Camera cam, Ray ray) {
//        System.out.println("Original ray: " + ray);
        Point3d onFocus = new Point3d();
        if(!ray.getPoint(cam.dof.distToFocus(ray), onFocus))
            return;
        ray.eyePoint.scaleAdd(camOffset.x, cam.left, ray.eyePoint);
        ray.eyePoint.scaleAdd(camOffset.y, cam.up, ray.eyePoint);
        ray.viewDirection.sub(onFocus, ray.eyePoint);
        ray.viewDirection.normalize();
//        System.out.println("Final ray: " + ray);
    }
    */
    
    setDOF(point, normal, aperture, samples) {
        if(point) {
        	this.dof.p = point;
        }
        if(normal) {
        	this.dof.n = normal;
        }
        this.dof.a = aperture;
        this.dof.samples = samples;
    }
    
    generateRay(x, y, outR) {
        if(!(outR instanceof Ray) || x < 0 || y < 0 || x > this.width || y > this.height) {
            return false;
        }
        
        x -= this.width2;
        y -= this.height2;
        y = -y;
        
        // Direction composed of vector to screen + vector along screen's X and Y
        let dir = this.vToScreen.copy();
        dir.add(p5.Vector.mult(this.right, x));
        dir.add(p5.Vector.mult(this.up, y));
        // Ray origin is camera position
        outR.set(this.pos, dir);
        outR.resetBounds();
        
        return true;
    }
}
