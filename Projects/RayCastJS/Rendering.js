class MyColor {
    constructor(c) {
        this.col = createVector(0, 0, 0);
        if(typeof c !== "undefined" && c instanceof p5.Color) {
        	this.col.set(c._array);
        }
    }
    
    setRGB255(r, g, b) {
        this.setRGB(r/255.0, g/255.0, b/255.0);
    }
    
    setRGB(r, g, b) {
        this.col.set(r, g, b);
    }
    
    copy() {
        let outp = new MyColor();
        outp.setRGB(this.col.x, this.col.y, this.col.z);
        return outp;
    }
    
    multWise(other) {
        this.col.x *= other.col.x;
        this.col.y *= other.col.y;
        this.col.z *= other.col.z;
        return this;
    }
    
    mult(v) { 
        this.col.x *= v;
        this.col.y *= v;
        this.col.z *= v;
        return this;
    }
    
    add(other) {
        this.col.x += other.col.x;
        this.col.y += other.col.y;
        this.col.z += other.col.z;
        return this;
    }
    
    limit() {
        if(this.col.x > 1) {
            this.col.x = 1;
        }
        if(this.col.y > 1) {
            this.col.y = 1;
        }
        if(this.col.z > 1) {
            this.col.z = 1;
        }
    }
    
    getFinal() {
        this.limit();
        const localC = this.col.copy();
        localC.mult(255);
        return color(localC.array());
    }
}

class Material {
    constructor(c = color(0)) {
        this.setDiffuse(c);
        this.specularEnabled = false;
        this.reflectEnabled = false;
        this.refractEnabled = false;
    }
    
    setDiffuse(c) {
        this.diffuse = new MyColor(c);
    }
    
    setSpecular(exp, c = color(255)) {
        this.specularEnabled = true;
        this.specular = new MyColor(c);
        this.specExp = exp;
    }
    
    setReflect(c = color(255)) { 
        this.reflectEnabled = true;
        this.reflect = new MyColor(c);
    }
    
    setRefract(c, exp) {
        this.refractEnabled = true;
        this.refract = new MyColor(c);
        this.refrExp = exp;
    }
}

class PointLight {
    constructor(pos, c) {
        this.pos = pos;
        this.c = new MyColor(c);
    }
}
