import Earth from "./Earth.jsx";
import {p5, sgn, newton} from "../helpers.js";

export default class Orbit {
    // Constants
    static get EPSILON() { return 0.0001; }
    
    // Constructor
    constructor(pos, vel, time) {
        this.epoch = {pos, vel, time} // System at time zero/epoch : position and velocity at launch and time of launch
        this._position = pos.copy();
        this.setup();
    }
    
    get e() { return this.eccentricity.mag(); }

    get elliptical() { return this.semi_major > 0; }

    get left_earth() { return this.position.mag() > Earth.SOI; }
    
    setup() {
        // Eccentricity and SemiMajor define shape of ellipse
        this.momentum = p5.Vector.cross(this.epoch.pos, this.epoch.vel);    // CCW axis
        this.eccentricity = p5.Vector.cross(this.epoch.vel, this.momentum).div(Earth.MU).sub(this.epoch.pos.copy().normalize()); // parallel to pos
        this.semi_latus = this.momentum.magSq() / Earth.MU;
        this.semi_major = this.semi_latus / (1 - (this.e ** 2));
        this.period = p5.prototype.TAU * Math.sqrt(sgn(this.semi_major) * this.semi_major ** 3 / Earth.MU); // Period does not exactly make sense for hyperbolic but result still needed in calculations
        
        // The euler angles determine the position of the orbit.
        let asc_node = p5.Vector.units.z.cross(this.momentum).normalize(); // unit sphere vector pointing to asc node
        let longitude = asc_node.heading(); // Angle in x-y plane of the ascending node vector, i.e. longitude!
        let inclination = p5.Vector.units.z.angleBetween(this.momentum); 
        
        let argument = undefined;
        if(asc_node.equals(p5.prototype.createVector())) // i.e. if momentum is parallel to z axis
            argument = sgn(this.momentum.z) * this.eccentricity.heading();
        else
            argument = sgn(this.eccentricity.z) * asc_node.angleBetween(this.eccentricity);
            
        this.eulers = {longitude, inclination, argument};

        // Let's also create a p5.matrix for multiplications
        let matrix = p5.Matrix.identity();
        matrix.rotateZ(-this.eulers.argument);
        matrix.rotateX(-this.eulers.inclination);
        matrix.rotateZ(-this.eulers.longitude);
        this.matrix = matrix.mat4;
        
        // Mean anomaly at epoch places the object along the orbit (kinda like a constant of integration)
        if(this.elliptical) {
            let true_at_epoch = sgn(this.epoch.pos.dot(this.epoch.vel)) * this.eccentricity.angleBetween(this.epoch.pos); // WRT the periapsis
            let ecc_at_epoch = Math.atan2(Math.sqrt(1 - (this.e ** 2)) * Math.sin(true_at_epoch), this.e + Math.cos(true_at_epoch));
            this.mean_at_epoch = ecc_at_epoch - this.e * Math.sin(ecc_at_epoch);
        } else {
            this.mean_at_epoch = 0; // We start at periapsis for any hyperbolic orbit
        }

        this.flight_time = 0;

        // Setup argument; gets recalculated from this position henceforth
        this.last_true_anomaly = Math.PI;
    }

    update(timer) {
        // Orbits that left SOI no longer update, even if not hyperbolic (i.e. close to parabolic ellipticals)
        if(this.left_earth || !timer.running)
            return;

        this.flight_time = timer.total - this.epoch.time;

        // Mean anomaly - "fraction" of orbit passed
        let mean_anomaly = (this.mean_at_epoch + this.flight_time * p5.prototype.TAU / this.period) % p5.prototype.TAU; // Tau / period is the mean motion
        // Eccentric anomaly - using Newton-Ralphson
        let true_anomaly;
        if(this.elliptical) {
            let fun_of_eccentric = E => E - this.e * Math.sin(E) - mean_anomaly;
            let derivative = E => 1 - this.e * Math.cos(E);
            let ecc_anomaly = newton(fun_of_eccentric, derivative, this.last_true_anomaly, Orbit.EPSILON);
            // True anomaly - angle between periapsis and current position as polar in f.o.r. of orbit
            true_anomaly = 2 * Math.atan2(
                Math.sqrt(1 + this.e) * Math.sin(ecc_anomaly / 2),
                Math.sqrt(1 - this.e) * Math.cos(ecc_anomaly / 2)
            );
        } else {
            // Similar to above, but with hyperbolic trig
            let fun_of_eccentric = E => this.e * Math.sinh(E) - E - mean_anomaly;
            let derivative = E => this.e * Math.cosh(E) - 1;
            let ecc_anomaly = newton(fun_of_eccentric, derivative, this.last_true_anomaly, Orbit.EPSILON);
            // True anomaly - angle between periapsis and current position as polar in f.o.r. of orbit
            true_anomaly = 2 * Math.atan2(
                Math.sqrt(this.e + 1) * Math.sinh(ecc_anomaly / 2),
                Math.sqrt(this.e - 1) * Math.cosh(ecc_anomaly / 2)
            );
        }
        this.last_true_anomaly = true_anomaly;

        // Get the altitude from SLR and true
        let altitude = this.semi_latus / (1 + this.e * Math.cos(true_anomaly));
        // For now, draw in x direction on its own - need to rotate with eulers
        this._position = p5.prototype.createVector(altitude, 0, 0).rotateZ(true_anomaly);
    }

    get position() {
        return this._position.copy();
    }

    get true_position() {
        let pos = this.position;
        let vector = p5.prototype.createVector(
            this.matrix[0] * pos.x + this.matrix[1] * pos.y + this.matrix[2] * pos.z,
            this.matrix[4] * pos.x + this.matrix[5] * pos.y + this.matrix[6] * pos.z,
            this.matrix[8] * pos.x + this.matrix[9] * pos.y + this.matrix[10] * pos.z
        );

        return vector;
    }

    get altitude() {
        return this.position.mag() - Earth.RADIUS;
    }

    get dayPeriod() {
        return this.period / Earth.PERIOD;
    }
}