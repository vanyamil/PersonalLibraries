import Earth from "./Earth.jsx";

export default class ImpactPosition {
	constructor(orbit) {
		// Could potentially add binary search on orbit true anomaly for precision first

		// Put in terms of Earth
		let pos = orbit.true_position.rotateZ(-Earth.rotation).setMag(Earth.RADIUS);

		this.position = pos;
	}

	get true_position() {
		return this.position.copy().rotateZ(Earth.rotation);
	}
}