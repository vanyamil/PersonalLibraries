import Earth from "./Classes/Earth.jsx";
import Ribbon from "./Classes/Ribbon.jsx";
import Climber from "./Classes/Climber.jsx";
import Payload from "./Classes/Payload.jsx";
import Orbit from "./Classes/Orbit.jsx";
import ImpactPosition from "./Classes/ImpactPosition.jsx";
import FrameTimer from "./Classes/FrameTimer.jsx";
import UI from "./Classes/UI.jsx";

/* Drawing methods implemented here so that the "business logic" is separate from "view logic" */

Earth.draw = function(p5) {
    p5.push();
    p5.scale(1, -1, 1); // Need to reinvert for the texture to be in correct direction
    p5.rotateZ(-Earth.rotation);

    // Rotate to orient the texture in correct direction
    p5.rotateZ(-p5.PI);
    p5.rotateX(-p5.PI / 2);
    
    p5.fill('lightgreen');
    p5.texture(Earth.IMAGE);

    p5.sphere(Earth.RADIUS);
//    p5.fill('red');
//    p5.box(Earth.RADIUS*2, Earth.RADIUS*0.5, Earth.RADIUS*0.5);
    
    p5.pop();
};

Ribbon.draw = function(p5, should_shorten) {
    p5.push();
    p5.rotateZ(Earth.rotation);
    p5.rotateZ(Ribbon.LONGITUDE);
    p5.rotateX(Ribbon.LATITUDE);

    let w = should_shorten ? Ribbon.WIDTH / 10 : Ribbon.WIDTH;

    p5.draw_wrapper(
        p5.createVector(0, Ribbon.LENGTH / 2 + Earth.RADIUS, 0), // Center of ribbon box
        Ribbon.COLOR,
        () => p5.box(w, Ribbon.LENGTH, w)
    );
    
    p5.draw_wrapper(
        p5.createVector(0, Earth.GEO_RADIUS, 0), // Center of GEO station sphere
        Ribbon.GEO_COLOR,
        () => p5.sphere(Ribbon.GEO_WIDTH)
    );
    
    p5.draw_wrapper(
        p5.createVector(0, Ribbon.LENGTH + Earth.RADIUS, 0), // Center of counterweight
        Ribbon.COUNTER_COLOR,
        () => p5.sphere(Ribbon.COUNTER_WIDTH)
    );

    p5.pop();
};

Climber.prototype.draw = function(p5) {
    p5.push();
    p5.rotateZ(Earth.rotation);
    p5.rotateZ(Ribbon.LONGITUDE);
    p5.rotateX(Ribbon.LATITUDE);
    
    p5.draw_wrapper(this.position, this.color, () => p5.box(Climber.SIZE));

    p5.pop();
};

Payload.prototype.draw = function(p5) {
    p5.push();
    if(this.impacted) {
        p5.rotateZ(Earth.rotation);
    } else if(this.contained) { // While in climber, same as Climber.draw
        p5.rotateZ(Earth.rotation);
        p5.rotateZ(Ribbon.LONGITUDE);
        p5.rotateX(Ribbon.LATITUDE);
    } else { // Instead,use euler angles
        p5.rotateZ(this.container.eulers.longitude);
        p5.rotateX(this.container.eulers.inclination);
        p5.rotateZ(this.container.eulers.argument);
    }

    p5.draw_wrapper(this.position, this.color, () => p5.sphere(this.impacted ? Payload.SIZE / 10 : Payload.SIZE));

    // Path on earth
/*
    let closer = this.position.setMag(Earth.RADIUS);

    p5.draw_wrapper(closer, this.color, () => p5.sphere(Payload.SIZE));
*/
    p5.pop();
/*
    // Momentum
    if(!this.contained) {
        let m = this.container.momentum.copy().setMag(Earth.RADIUS);
        p5.draw_wrapper(
            m, this.color, () => p5.sphere(Payload.SIZE)
        );
    }
*/
};

export {Earth, Ribbon, Climber, Payload, Orbit, ImpactPosition, FrameTimer, UI};