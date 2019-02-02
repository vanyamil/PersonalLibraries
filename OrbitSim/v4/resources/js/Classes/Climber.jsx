import Earth from "./Earth.jsx";
import Ribbon from "./Ribbon.jsx";
import Payload from "./Payload.jsx";
import Orbit from "./Orbit.jsx";
import Profile from "./AstronauticaProfile.jsx";
import {p5} from "../helpers.js";

export default class Climber {    
    // Constants
    static get ACTIVE_COLOR() { return [255, 0, 0, 200]; }        // Color of the selected climber
    static get INACTIVE_COLOR() { return [128, 128, 128, 100]; }  // Color of any unselected climbers
    static get SIZE() { return 2000000; }                         // Size of the visible box of the climbers, units : m, not real value
    
    // Constructor
    constructor(height) {
        this.height = height || 0;           // The height at which this climber is, units : m
        this.active = true;                  // Whether this climber is selected
        this.payload = new Payload(this);    // The carried payload, starting off inside the climber
        this.profile = null;                 // The climbing profile
    }
    
    // Return a 3D vector relative to the ribbon's frame of reference
    get position() { return p5.prototype.createVector(0, this.height + Earth.RADIUS, 0); }
    // Return the vector relative to standard coordinates, i.e. with rotations TODO
    get true_position() { return this.position.copy().rotateX(Ribbon.LATITUDE).rotateZ(Earth.rotation).rotateZ(Ribbon.LONGITUDE); }
    // The current color of the climber, depending on selected status
    get color() { return this.active ? Climber.ACTIVE_COLOR : Climber.INACTIVE_COLOR; }
    // Checks if the climber still contains the payload or has it been released.
    get has_payload() { return this.payload.contained; }

    // Launch the climber towards a destination
    launch(launchTime, timeAmount, startHeight, endHeight) {
        this.profile = new Profile(launchTime, timeAmount, startHeight, endHeight);
    }

    update(timer) {
        // If we have a setting of where to go
        if(this.profile != null) {
            // And we haven't reached, go there
            if(this.profile.isMoving(timer.total)) {
                this.height = this.profile.altitude(timer.total);
            }
            // If we reached, one-time release
            else if(this.payload.contained) {
                console.log("Payload released!");
                this.release(this.profile.arrivalTime);
                this.profile = null;
            }
        }
    }

    // Release the contained payload
    release(releaseTime) {
        // Velocity : tangential to future orbit, in direction of rotation
        let vel = p5.Vector.cross(p5.prototype.createVector(0, 0, 1), this.true_position).setMag(Earth.OMEGA * this.position.y); // Same as true_position.mag()
        this.payload.container = new Orbit(this.true_position, vel, releaseTime);
        this.payload.contained = false;
    }
}