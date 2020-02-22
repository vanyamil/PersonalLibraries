class Earth {
	// Constants
	static get G() { return 6.67384e-11; } // m^3 / kg / s^2
	static get MASS() { return 5.97219e24; } // kg
	static get PERIOD() { return 86164.1; } // s
	static get MU() { return Earth.G * Earth.MASS; } // m^3 / s^2
	static get OMEGA() { return 2 * Math.PI / EARTH.PERIOD; } // rad / s
	static get GEO_RADIUS() { return 42164000; } // m
	static get RADIUS() { return 6378137; } // m
	static get CRITHEIGHT() { // m - starting at this height, the resulting orbit will be hyperbolic.
		return Math.cbrt(2*Earth.MU/(Earth.OMEGA ** 2))-Earth.RADIUS; 
	}

	static get IMAGE() {
		if(Earth.img === undefined)
			Earth.img = loadImage("earth.png");
		return Earth.img;
	}

	// Draw the image : requires the preexisting context.
	static draw() {
		imageMode(CENTER);
		image(Earth.IMAGE, 0, 0, Earth.RADIUS*2, Earth.RADIUS*2);
	}
}

class Ribbon {
	// Constants
	static get LENGTH() { return 100000000; } // m

	// Draw the ribbon
	static draw() {
		// Ribbon : thick line
		strokeWeight(4);
		stroke('#DDD');
		line(0, Earth.RADIUS, 0, Earth.RADIUS + Ribbon.LENGTH);

		noStroke();
		ellipseMode(CENTER);
		
		// GEO station circle
		fill('#4D3066');
		ellipse(0, Earth.GEO_RADIUS, 4)
		
		// Counterweight circle
		fill('#22339F');
		ellipse(0, Earth.RADIUS + Ribbon.LENGTH, 10)
	}
}

class Orbit {
	static get EPSILON() { return 0.0001; }

	constructor(launchHeight, launchAngle, launchTime) {
		this.launchTime = launchTime;
		this.launchRadius = launchHeight + Earth.RADIUS;
		this.launchAngle = launchAngle;
		this.semiMajor = 1/(2/this.launchRadius - Math.pow(this.launchRadius*Earth.OMEGA, 2)/Earth.MU);
		this.trueAnomaly = 0;
	}
}

class EllipticOrbit extends Orbit {
	constructor(launchHeight, launchAngle, launchTime) {
		super(launchHeight, launchAngle, launchTime);

		this.ecc = Math.abs(this.launchRadius*Math.pow(this.launchRadius*Earth.OMEGA, 2)/Earth.MU - 1);
		this.period = 2*Math.PI*Math.sqrt(Math.pow(this.semiMajor, 3)/Earth.MU);
		if(this.semiMajor<this.launchRadius) 
			this.launchTime-=this.period/2;
	}

	//Returns the mean motion angle depending on current time
	meanMotion(time) {
		return ((time-this.launchTime)/this.period)%1.0*(2*Math.PI);
	}

	//Calculates by Newton's Method a numerical approximation of the eccentric anomaly around Earth
	angleE(meanMotion) {
		let newPoint = Math.PI, currentPoint;
		do {
			currentPoint = newPoint;
			let f = currentPoint - this.ecc*Math.sin(currentPoint) - meanMotion;
			let der = 1 - this.ecc * Math.cos(currentPoint);
			newPoint = currentPoint - f/der;
		} while (Math.abs(newPoint-currentPoint)/newPoint >= this.epsilon);
		return newPoint;
	}
	
	//From the eccentric anomaly, returns the true anomaly
	theta(angleE) {
		return 2*Math.atan2(Math.sqrt(1+this.ecc)*Math.sin(angleE/2),
				Math.sqrt(1-this.ecc)*Math.cos(angleE/2));
	}
	
	//Using the 3 previous functions, returns a position relative to Earth depending on time
	getPosition(time) {
		let theta = this.theta(this.angleE(this.meanMotion(time)));
		let altitude = this.semiMajor*(1-this.ecc*this.ecc)/(1+this.ecc*Math.cos(theta));
		if(this.semiMajor<this.launchRadius) 
			theta+=Math.PI;
		this.trueAnomaly = theta+this.launchAngle+Math.PI/2;
		return polar(altitude, this.trueAnomaly);
	}
}

class HyperbolicOrbit extends Orbit {
	constructor(launchHeight, launchAngle, launchTime) {
		super(launchHeight, launchAngle, launchTime);
		
		this.ecc = 1-this.launchRadius/this.semiMajor;
	}
}