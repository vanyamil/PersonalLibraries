class MyColor extends Vector3 {
    constructor(arr) {
        super();
        if(arr instanceof Array) {
            this.setRGB255(...arr);
        } else {
            this.setRGB255(arr, arr, arr);
        }
    }
    
    setRGB255(r, g, b) {
        return this.setRGB(r/255.0, g/255.0, b/255.0);
    }
    
    setRGB(r, g, b) {
        return this.set(r, g, b, false);
    }
    
    limit() {
        if(this.x > 1) {
            this.x = 1;
        }
        if(this.y > 1) {
            this.y = 1;
        }
        if(this.z > 1) {
            this.z = 1;
        }
    }
    
    getFinal() {
        this.limit();
        return [this.x * 255, this.y * 255, this.z * 255];
    }
}

class Material {
    constructor(c) {
        this.setDiffuse(c);
        this.specularEnabled = false;
        this.reflectEnabled = false;
        this.refractEnabled = false;
    }
    
    setDiffuse(c) {
        this.diffuse = new MyColor(c);
    }
    
    setSpecular(exp, c = 255) {
        this.specularEnabled = true;
        this.specular = new MyColor(c);
        this.specExp = exp;
    }
    
    setReflect(c = 255) { 
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
        this.pos = new Vector3(pos);
        this.c = new MyColor(c);
    }
}
