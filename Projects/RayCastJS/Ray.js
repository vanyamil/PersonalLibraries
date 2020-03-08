class Ray {
	constructor(src, dir) {
    	this.src = createVector();
    	this.dir = createVector();
    	this.set(src, dir);
    	this.resetBounds();
	}

	set(src, dir) {
        this.src.set(src);
        this.dir.set(dir);
        this.dir.normalize();
    }
    
    setOther(other) {
        this.set(other.src, other.dir);
        this.setBounds(other.min, other.max);
    }
    
    copy() {
        const outp = new Ray(this.src, this.dir);
        outp.setBounds(this.min, this.max);
        return outp;
    }
    
    setMin(min) { this.min = Math.max(0, min); }
    setMax(max) { this.max = Math.max(this.min, max); }
    setBounds(min, max) {
        this.setMin(min);
        this.setMax(max);        
    }
    
    setDepth(depth) {
        this.depth = depth;
    }
    
    resetBounds() {
        this.setBounds(1e-5, Infinity);
    }
    
    at(t, outV) {
        if(!(outV instanceof p5.Vector) || t < this.min || t > this.max) {
        	return false;
        }
        
        outV.set(this.dir);
        outV.mult(t);
        outV.add(this.src);
        return true;
    }
    
    toString() {
        return src.toString() + " " + dir.toString();
    }
}
