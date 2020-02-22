// Ascending profile for a climber as suggested by Stephen's doi:10.1016/j.actaastro.2008.10.003 paper.
// Also serves as "interface" for any other profiles

export default class AstronauticaProfile {

	constructor(launchTime, timeAmount, startHeight, endHeight, timeRatio) {
		// Default arguments : climbing time/constant velocity time ratio of 1
		if(timeRatio === undefined)
			timeRatio = 1;

		// Import the values into the object
		this.launchTime = launchTime;
		this.totalTime = timeAmount;
		this.startHeight = startHeight;
		this.endHeight = endHeight;

		// Calculate the maximum velocity attained via some algebraic manipulation of the given formulas
		// Note : introducing units in altitudes and times automatically gives us correct units in velocity.
		let climbToTotal = 2 + 1/timeRatio; 
		this.climbTime = timeAmount / climbToTotal;
		this.constantTime = this.climbTime * timeRatio;
		this.maxVelocity = (endHeight - startHeight) / (timeAmount * (climbToTotal - 1) / climbToTotal) // time in seconds, height in meters = speed in m/s
//		console.log(this);
	}

	// Returns the time at which the profile will complete; can help with precise measurements of orbit
	get arrivalTime() {
		return this.launchTime + this.totalTime;
	}

	// Checks if the profile is complete
	isMoving(currentTime) {
		return currentTime < this.arrivalTime;
	}

	// Returns the current altitude
	altitude(currentTime) {
		// If we are done, we are done
		if(!this.isMoving(currentTime))
			return this.endHeight;

		// Otherwise, figure out current stage (asc/const/desc)
		// Using if-return system to avoid else stacks
		currentTime -= this.launchTime;

		// Ascending stage
		if(currentTime < this.climbTime) { 
			let sine = Math.sin(Math.PI * currentTime / this.climbTime);
			let delta = this.maxVelocity * 0.5 * (currentTime - this.climbTime / Math.PI * sine);
			return this.startHeight + delta;
		}

		// Constant stage
		if(currentTime < this.constantTime + this.climbTime) { 
			let delta = this.maxVelocity * (currentTime - this.climbTime / 2);
			return this.startHeight + delta;
		}

		// Descending stage
		let sine = Math.sin(Math.PI * (currentTime - this.constantTime) / this.climbTime);
		let delta = this.maxVelocity * 0.5 * (currentTime + this.constantTime - this.climbTime / Math.PI * sine);
		return this.startHeight + delta;
	}
}