class Camera {
    constructor(pos, lookAt, up) {
        this.pos = new Vector3();
        this.dir = new Vector3();
        this.lookAt = new Vector3();
        this.set(pos, lookAt, up);
        
        this.dof = {};
        this.setDOF(this.lookAt.copy(), this.dir.copy(), 1, 1);
    }
    
    set(pos, lookAt, up) {
        this.lookAt.set(...lookAt);
        // Camera location
        this.pos.set(...pos);
        // Viewing direction
        this.dir.set(this.lookAt).sub(this.pos).normalize();
        // The "right" vector - the X coordinate of the screen will be along it
        this.right = new Vector3(up).cross(this.dir).normalize();
        // The "up" vector - the Y coordinate of the screen will be along it
        this.up = this.dir.cross(this.right).normalize(); // Should already be normalized, but doing for rounding errors
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
        this.vToScreen = this.dir.copy().setMag(this.height2 / tanned);
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
        	this.dof.p = new Vector3(point);
        }
        if(normal) {
        	this.dof.n = new Vector3(normal);
        }
        this.dof.a = aperture;
        this.dof.samples = samples;
    }
    
    generateRay(x, y, outR) {
        if(x < 0 || y < 0 || x > this.width || y > this.height) { // Removed testing || !(outR instanceof Ray)
            return false;
        }
        
        x -= this.width2;
        y -= this.height2;
        y = -y;
        
        // Direction composed of vector to screen + vector along screen's X and Y
        let dir = this.vToScreen.copy();
        dir.add(Vector3.mult(this.right, x));
        dir.add(Vector3.mult(this.up, y));
        // Ray origin is camera position
        outR.set(this.pos, dir);
        outR.resetBounds();
        
        return true;
    }
}
