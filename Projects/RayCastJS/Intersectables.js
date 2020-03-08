class IntersectionResult {
    constructor() {
        this.material = null;
        this.p = createVector();
        this.n = createVector();
        this.reset();
    }
    
    setIntersection(t, p, n, m) {
        this.connects = true;
        this.t = t;
        this.p.set(p);
        this.n.set(n);
        this.n.normalize();
        this.material = m;
    }
    
    setOther(other) {
        this.setIntersection(other.t, other.p, other.n, other.material);
    }
    
    reset() {
        this.connects = false;
        this.t = Infinity;
    }
}

class Intersectable {
    constructor(mat = new Material()) {
        this.setMaterial(mat);
    }
    
    intersects(ray, outIR) {
        console.log("You did not implement the Intersects method for this object!");
        return false;
    }
    
    setMaterial(mat) {
        this.material = mat;
    }
}

class SceneNode extends Intersectable {
    constructor(children) {
        super();
        this.children = children;
        // MULTITHREADING WARNING
        this.localIR = new IntersectionResult();
    }
    
    setBounds(obj) {
        this.bounds = obj;
    }
    
    // Returns closest intersection across all children
    intersects(ray, outIR) {
        // Are we intersecting bounds, if any?
        if(typeof this.bounds !== "undefined") {
            this.localIR.reset();
            if(!this.bounds.intersects(ray, this.localIR)) {
                return false;
            }
        }
        
        // Actual test inside
        const rayMax = ray.max;
        for(let i = 0; i < this.children.length; i++) {
            this.localIR.reset();
            if(this.children[i].intersects(ray, this.localIR)) {
                outIR.setOther(this.localIR);
                ray.setMax(outIR.t);
            }
        }
        ray.setMax(rayMax);
        return outIR.connects;
    }
}

class MatrixTransform extends Intersectable {
    constructor(child, t, r, s) {
        super();
        this.child = child;
        this.setMatrix(t, r, s);
        // MULTITHREADING WARNING
        this.localRay = new Ray([0,0,0], [0,0,0]);
    }
    
    setMatrix(t, r, s) {
        this.m = new Matrix4();
        // Order of operations : S * Rz * Ry * Rx * T * v?
        this.m.scale(s).rotate(r).translate(t);
        // Saving two other matrices too : inverse, and inv transpose
        this.mInv = this.m.copy().inverse();
        this.mIt = this.mInv.copy().transpose();
    }
    
    intersects(ray, outIR) {
        this.localRay.setOther(ray);
        // M transforms the object
        // We need to transform ray with inverse to send to object
        this.mInv.transP(this.localRay.src);
        this.mInv.transV(this.localRay.dir);
        // If the matrix scales direction, need to modify bounds and t values!
        let scale = this.localRay.dir.mag();
        this.localRay.min *= scale;
        this.localRay.max *= scale;
        // Note the division here to make next two operations multiplications
        scale = 1/scale;
        this.localRay.dir.mult(scale); 
        
        if(!this.child.intersects(this.localRay, outIR)) {
            return false;
        }
        // Then pass the resulting point through M
        this.m.transP(outIR.p);
        // Resulting normal through inverse transpose
        this.mIt.transV(outIR.n);
        // Scale t by the proper direction value
        outIR.t *= scale;
        return true;
    }
    
}

class Sphere extends Intersectable {
    constructor(pos, rad) {
        super();
        this.c = pos;
        this.r = rad;
    }
    
    intersects(ray, outIR) {
        // Follows the equation (ray.p - c + t * ray.d)^2 = r^2, solves the quadratic for t
        
        // Couple of constants
        // const dd = ray.dir.dot(ray.dir); // ray dir is normalized, so just no need of this variable
        const p = ray.src.copy();
        p.sub(this.c);
        const qC = p.dot(p) - this.r * this.r;
        const dp = ray.dir.dot(p);
        
        // Determinant check - if this is below 0, no intersection
        const det = dp * dp - qC;
        if(det < 0) {
            return false;
        }
        const sqrtDet = sqrt(det);
        // Check lower value against ray bounds
        let t = -dp - sqrtDet;
        if(ray.at(t, outIR.p)) {
            outIR.setIntersection(t, outIR.p, p5.Vector.sub(outIR.p, this.c), this.material);
            return true;
        }
        // Check upper value against ray bounds
        t += 2 * sqrtDet;
        if(ray.at(t, outIR.p)) {
            outIR.setIntersection(t, outIR.p, p5.Vector.sub(outIR.p, this.c), this.material);
            return true;
        }
        
        // Neither t matches
        return false;
    }
}

class Plane extends Intersectable {
    constructor(mat2 = null) {
        super();
        this.setAltMaterial(mat2);
    }
    
    setAltMaterial(mat2) {
        this.mat2 = mat2;
    }
    
    intersects(ray, outIR) {
        if(ray.dir.y * ray.src.y >= 0) {
            // Going away from y = 0
            return false;
        }
        let t = -ray.src.y / ray.dir.y;
        if(ray.at(t, outIR.p)) {
            let b = floor(outIR.p.x) + floor(outIR.p.z);
            let m = this.mat2 == null || ((b % 2) + 2) % 2 < 1 ? this.material : this.mat2;
            let n = ray.src.y > 0 ? createVector(0, 1, 0) : createVector(0, -1, 0);
            outIR.setIntersection(t, outIR.p, n, m);
            return true;
        }
        return false;
    }
}

class Box extends Intersectable {
    constructor(min, max) {
        super();
        this.min = min;
        this.max = max;
    }
    
    intersects(ray, outIR) {
        const interval = [ray.min, ray.max];
        const normals = [null, null];
        // For each of the 3 slabs - if putting in a loop, need to use reduce so that the interval test can follow each coord
        
        // Comments given as if for X - equivalent for other dims
        let d = ray.dir.x;
        let s = ray.src.x;
        if(d == 0) { // in the YZ plane
            if(s <= this.min.x || s >= this.max.x) { // Out of X-slab
                return false;
            } // Else, fully in x-slab, keep interval as is
        } else {
            const n = createVector();
            n.x = 1;
            d = 1 / d;
            const tMin = (this.min.x - s) * d;
            const tMax = (this.max.x - s) * d;
            let tLow, tHigh;
            if(tMin < tMax) {
                tLow = tMin;
                tHigh = tMax;
                n.x *= -1;
            } else {
                tLow = tMax;
                tHigh = tMin;
            }
            // Update interval and normals
            if(interval[0] < tLow) {
                interval[0] = tLow;
                normals[0] = n;
            }
            if(interval[1] > tHigh) {
                interval[1] = tHigh;
                normals[1] = n.copy().mult(-1);
            }
        }
        // Have we gone inside out
        if(interval[0] >= interval[1]) {
            return false;
        }
        d = ray.dir.y;
        s = ray.src.y;
        if(d == 0) { // in the YZ plane
            if(s <= this.min.y || s >= this.max.y) { // Out of X-slab
                return false;
            } // Else, fully in x-slab, keep interval as is
        } else {
            const n = createVector();
            n.y = 1;
            d = 1 / d;
            const tMin = (this.min.y - s) * d;
            const tMax = (this.max.y - s) * d;
            let tLow, tHigh;
            if(tMin < tMax) {
                tLow = tMin;
                tHigh = tMax;
                n.y *= -1;
            } else {
                tLow = tMax;
                tHigh = tMin;
            }
            // Update interval and normals
            if(interval[0] < tLow) {
                interval[0] = tLow;
                normals[0] = n;
            }
            if(interval[1] > tHigh) {
                interval[1] = tHigh;
                normals[1] = n.copy().mult(-1);
            }
        }
        // Have we gone inside out
        if(interval[0] >= interval[1]) {
            return false;
        }
        d = ray.dir.z;
        s = ray.src.z;
        if(d == 0) { // in the YZ plane
            if(s <= this.min.z || s >= this.max.z) { // Out of X-slab
                return false;
            } // Else, fully in x-slab, keep interval as is
        } else {
            const n = createVector();
            n.z = 1;
            d = 1 / d;
            const tMin = (this.min.z - s) * d;
            const tMax = (this.max.z - s) * d;
            let tLow, tHigh;
            if(tMin < tMax) {
                tLow = tMin;
                tHigh = tMax;
                n.z *= -1;
            } else {
                tLow = tMax;
                tHigh = tMin;
            }
            // Update interval and normals
            if(interval[0] < tLow) {
                interval[0] = tLow;
                normals[0] = n;
            }
            if(interval[1] > tHigh) {
                interval[1] = tHigh;
                normals[1] = n.copy().mult(-1);
            }
        }
        // Have we gone inside out
        if(interval[0] >= interval[1]) {
            return false;
        }
        
        // Setup the ray
        if(ray.at(interval[0], outIR.p)) {
            outIR.setIntersection(interval[0], outIR.p, normals[0], this.material);
            return true;
        }
        if(ray.at(interval[1], outIR.p)) {
            outIR.setIntersection(interval[1], outIR.p, normals[1], this.material);
            return true;
        }
        
        return false;
    }
}
