import p5 from "p5";
import 'p5/lib/addons/p5.dom';

p5.prototype.translateV = function translateV(v) {
    return this.translate(v.x, v.y, v.z);    
}

p5.prototype.draw_wrapper = function draw_wrapper(pos, clr, fn) {
    this.push();
    
    this.translateV(pos);
    this.fill(clr);
    fn();
    
    this.pop();
}

p5.prototype.cameraV = function cameraV(eye, center, up) {
	this.camera(
		eye.x, eye.y, eye.z,
		center.x, center.y, center.z,
		up.x, up.y, up.z
	);
}

p5.Vector.prototype.rotateZ = function(rad) {
	let c = Math.cos(rad);
	let s = Math.sin(rad);
	let x_p = this.x;
	let y_p = this.y;

	this.x = c * x_p - s * y_p;
	this.y = s * x_p + c * y_p;
	return this;
}

p5.Vector.prototype.rotateX = function(rad) {
	let c = Math.cos(rad);
	let s = Math.sin(rad);
	let y_p = this.y;
	let z_p = this.z;

	this.y = c * y_p - s * z_p;
	this.z = s * y_p + c * z_p;
	return this;
}

p5.Vector.units = {
	x: new p5.Vector(1, 0, 0),
	y: new p5.Vector(0, 1, 0),
	z: new p5.Vector(0, 0, 1),
};

function sgn(v) { return v > 0 ? 1 : -1; }

// Finds a zero of f near x_0 assuming "niceness" of f
function newton(f, der, x_0, eps = 0.0001, iterations = 1000) {
	let x = x_0 ;
	let x_prev = x_0 + 2*eps;
	let idx = 0;
	while(idx < iterations && Math.abs(x_prev - x) > eps) {
		x_prev = x;
		x = x - f(x) / der(x);
		idx++;
	}
	return x;
}

// Returns a unit sphere vector corresponding to given longitude and latitude
// Lat : +90 N to -90 S, modifies y
// Lon : +180 E to -180 W, rotates in x-z plane
function lonlat_to_unit(lon, lat) {
	// Lon : angle in x-z plane
	return p5.Vector.fromAngles(lon, 90 - lat);
}

p5.Vector.prototype.addMag = function(v) {
	return this.setMag(this.mag() + v);
}

export {p5, sgn, newton};