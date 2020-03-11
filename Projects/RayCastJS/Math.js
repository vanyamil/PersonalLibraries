// A custom vector class, to avoid dependency on p5.Vector
class Vector3 {
    constructor(x, y, z, saveMag) {
        if(typeof x === "undefined") {
            // Empty constructor - simple init.
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.saveMag = false;
        } else {
        	this.set(x, y, z, saveMag);
        }
    }
    
    setSaving(b) {
        if(b) {
            this._saveMags();
        } else {
            this.saveMag = false;
        }
        
        return this;
    }
    
    setV(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        this.saveMag = v.saveMag;
        if(this.saveMag) {
            this._mag = v._mag;
            this._magSq = v._magSq;
        }
        
        return this;
    }
    
    set(x, y, z, saveMag) {
        if(x instanceof Vector3) {
            return this.set(x.x, x.y, x.z, x.saveMag);
        }
        else if(x instanceof Array) {
            return this.set(x[0], x[1], x[2], false);
        }
        
        // Set the values
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        
        // Reset saveMag
        saveMag = (typeof saveMag === "boolean" ? saveMag : (this.saveMag || false));
        this.saveMag = false;
        if(saveMag) {
            this._saveMags();
        }
        
        return this;
    }
    
    _saveMags() {
        this.saveMag = false;
        this._magSq = this.magSq();
        this._mag = this.mag();
        this.saveMag = true;
    }
    
    copy() {
        return new Vector3().setV(this);
    }
    
    dot(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }
    
    magSq() {
        if(this.saveMag && typeof this._magSq !== "undefined") {
            return this._magSq;
        }
        return this.dot(this);
    }
    
    mag() {
        if(this.saveMag && typeof this._mag !== "undefined") {
            return this._mag;
        }
        return Math.sqrt(this.magSq());
    }
    
    setMag(m) {
        const mag = this.mag();
        this.saveMag = false;
        this.mult(m / mag);
        // Save mag from the given
        this.saveMag = true;
        this._mag = m;
        this._magSq = m * m;
        return this;
    }
    
    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        
        if(this.saveMag) {
            this._saveMags();
        }
        return this;
    }
    
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        
        if(this.saveMag) {
            this._saveMags();
        }
        return this;
    }
    
    mult(v) {
        this.x *= v;
        this.y *= v;
        this.z *= v;
        if(this.saveMag) {
            this._magSq *= (v * v);
            this._mag *= v;
        }
        return this;
    }
    
    multWise(other) {
        this.x *= other.x;
        this.y *= other.y;
        this.z *= other.z;
        if(this.saveMag) {
            this._saveMags();
        }
        return this;
    }
    
    div(v) {
        return this.mult(1/v);
    }
    
    normalize() {
        const mag = this.mag();
        this.saveMag = false;
        this.div(mag);
        this.saveMag = true;
        this._mag = 1;
        this._magSq = 1;
        
        return this;
    }
    
    reflect(n) {
        const dot = 2 * this.dot(n);
        return n.copy().mult(dot).sub(this);
    }
    
    cross(v) {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;
        
        return new Vector3(x, y, z);
    }
}

Vector3.sub = function(v1, v2) {
    return v1.copy().sub(v2);
}

Vector3.mult = function(v, k) {
    return v.copy().mult(k);
}

// A 4x4 matrix class for transformations in 3D space
class Matrix4 {
    // TODO
    constructor() {
        this.reset();
    }
    
    set(other) {
       if(other instanceof Matrix4) {
           this.m = other.m.slice(); // Clones the array 
       }
       else if(other instanceof Array) {
           this.m = other.slice();
       }
       else if(other instanceof Vector3) {
           this.reset();
           this.translate(other);
       }
       
       return this;
    }
    
    reset() {
        return this.set([
            1, 0, 0, 0, 
            0, 1, 0, 0, 
            0, 0, 1, 0, 
            0, 0, 0, 1
        ]);
    }
    
    copy() {
        return (new Matrix4 ()).set(this);
    }
    
    at(row, col) {
        return this.m[row*4+col];
    }
    
    _multEntry(other, row, col) {
        // Computes one entry for the multiplication of matrices
        //   by sumproduct of local column and other row
        let sum = 0;
        for(let i = 0; i < 4; i++) {
            sum += other.at(row, i) * this.at(i, col);
        }
        return sum;
    }
    
    multBy(m) {
        if(m instanceof Array) {
            return this.multBy((new Matrix4()).set(m));
        }
        const arr = [
            this._multEntry(m, 0, 0), this._multEntry(m, 0, 1), this._multEntry(m, 0, 2), this._multEntry(m, 0, 3), 
            this._multEntry(m, 1, 0), this._multEntry(m, 1, 1), this._multEntry(m, 1, 2), this._multEntry(m, 1, 3), 
            this._multEntry(m, 2, 0), this._multEntry(m, 2, 1), this._multEntry(m, 2, 2), this._multEntry(m, 2, 3), 
            this._multEntry(m, 3, 0), this._multEntry(m, 3, 1), this._multEntry(m, 3, 2), this._multEntry(m, 3, 3)
        ];
        
        this.m = arr;
        return this;
    }
    
    translate(v) {
        if(v instanceof Vector3) {
            this.m[3] += v.x;
            this.m[7] += v.y;
            this.m[11] += v.z;
        	return this;
        }
        else if(v instanceof Array) {
            this.m[3] += v[0];
            this.m[7] += v[1];
            this.m[11] += v[2];
            return this;
        }
    }
    
    scale(v) {
        let x, y, z;
        if(v instanceof Array) {
            x = v[0];
            y = v[1];
            z = v[2];
        }
        else {
            x = y = z = v;
        }
        // Actually scale
        this.m[0] *= x;
        this.m[1] *= x;
        this.m[2] *= x;
        this.m[3] *= x;
        this.m[4] *= y;
        this.m[5] *= y;
        this.m[6] *= y;
        this.m[7] *= y;
        this.m[8] *= z;
        this.m[9] *= z;
        this.m[10] *= z;
        this.m[11] *= z;
        return this;
    }
    
    rotateX(v) {
        const by = new Matrix4();
        v *= Math.PI / 180;
        const c = Math.cos(v);
        const s = Math.sin(v);
        by.m[5] = c;
        by.m[6] = -s;
        by.m[9] = s;
        by.m[10] = c;
        return this.multBy(by);
    }
    
    rotateY(v) {
        const by = new Matrix4();
        v *= Math.PI / 180;
        const c = cos(v);
        const s = sin(v);
        by.m[0] = c;
        by.m[2] = s;
        by.m[8] = -s;
        by.m[10] = c;
        return this.multBy(by);
    }
    
    rotateZ(v) {
        const by = new Matrix4();
        v *= Math.PI / 180;
        const c = cos(v);
        const s = sin(v);
        by.m[0] = c;
        by.m[1] = -s;
        by.m[4] = s;
        by.m[5] = c;
        return this.multBy(by);
    }
    
    rotate(v) {
        return this.rotateX(v.x).rotateY(v.y).rotateZ(v.z);
    }
    
    _swap(a, b) {
        let temp = this.m[a];
        this.m[a] = this.m[b];
        this.m[b] = temp;
    }
    
    transpose() {
        this._swap(1, 4);
        this._swap(2, 8);
        this._swap(3, 12);
        this._swap(6, 9);
        this._swap(7, 13);
        this._swap(11, 14);
        return this;
    }
    
    inverse() {
        // Invert 3x3 R/S
        const tm = this.m;
        let arr = [
        	tm[5] * tm[10] - tm[9] * tm[6], 
        	tm[2] * tm[9] - tm[1] * tm[10],
        	tm[1] * tm[6] - tm[2] * tm[5], 
        	tm[6] * tm[8] - tm[4] * tm[10], 
        	tm[0] * tm[10] - tm[2] * tm[8], 
        	tm[4] * tm[2] - tm[0] * tm[6], 
        	tm[4] * tm[9] - tm[8] * tm[5], 
        	tm[8] * tm[1] - tm[0] * tm[9], 
        	tm[0] * tm[5] - tm[4] * tm[1]
       	];
        const det = tm[0] * arr[0] + tm[1] * arr[3] + tm[2] * arr[6];
        const invdet = 1 / det;
        arr = arr.map(x => x * invdet);
        // Result has form (Inv, -Inv*t, 0, 1), where t is the translation part of the matrix
        const newT = [
        	- (arr[0] * tm[3] + arr[1] * tm[7] + arr[2] * tm[11]),
        	- (arr[3] * tm[3] + arr[4] * tm[7] + arr[5] * tm[11]),
        	- (arr[6] * tm[3] + arr[7] * tm[7] + arr[8] * tm[11]),
        ];
        
        this.m = [
        	arr[0], arr[1], arr[2], newT[0],
        	arr[3], arr[4], arr[5], newT[1],
        	arr[6], arr[7], arr[8], newT[2],
        	0, 0, 0, 1
        ];
        
        return this;
    }
    
    transP(p) {
        // Modifies p to be equal to this * p, assuming p is a point (i.e. gets translated)
        const px = this.m[0] * p.x + this.m[1] * p.y + this.m[2] * p.z + this.m[3];
        const py = this.m[4] * p.x + this.m[5] * p.y + this.m[6] * p.z + this.m[7];
        const pz = this.m[8] * p.x + this.m[9] * p.y + this.m[10] * p.z + this.m[11];
        p.x = px;
        p.y = py;
        p.z = pz;
        if(p.saveMag) {
            p._saveMags();
        }
        return p;
    }
    
    transV(v) {
        // Modifies v to be equal to this * v, assuming v is a vector (i.e. does not get translated)
        const vx = this.m[0] * v.x + this.m[1] * v.y + this.m[2] * v.z;
        const vy = this.m[4] * v.x + this.m[5] * v.y + this.m[6] * v.z;
        const vz = this.m[8] * v.x + this.m[9] * v.y + this.m[10] * v.z;
        v.x = vx;
        v.y = vy;
        v.z = vz;
        if(v.saveMag) {
            v._saveMags();
        }
        return v;
    }
}
