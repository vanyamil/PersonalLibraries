import React, {Component} from 'react';
import ClimberPanel from "./ClimberPanel.jsx";
import PayloadPanel from "./PayloadPanel.jsx";
import SimulationPanel from "./SimulationPanel.jsx";
import {Climber} from "../Classes.jsx";

export default class OrbitSim extends Component {
	constructor(props) {
		super(props);

		this.props.register(this);

		this.state = {
			running: false,
			climbers: [],
			payloads: [],
			active_climber: null,
			active_payload: null,
			time_scale: 5.0
		};
	}

	onPlayPause() {
		this.setState((state, props) => {
			props.p5.toggleTimer();
			return {running: !state.running}; 
		});
	}

	onScaleAdjust(event) {
		let v = event.target.value;

		this.setState((state, props) => {
			props.p5.updateTimeScale(v);
			return {time_scale: v};
		});

	}

	onClimberAdd() {
		this.setState((state, props) => {
			// Create new climber
			const new_c = new Climber(0);
			// Deactivate all the activeness
			state.climbers.forEach(c => c.active = false);
			state.payloads.forEach(p => p.active = false);
			// Recreate "immutable" arrays
			const new_cl = state.climbers.concat(new_c);
			const new_pl = state.payloads.concat(new_c.payload);
			// Send them over
			props.p5.climbers = new_cl;
			props.p5.payloads = new_pl;

			return {
				climbers: new_cl,
				payloads: new_pl,
				active_climber: new_cl.length - 1,
				active_payload: new_pl.length - 1
			}
		});
	}

	onClimberDelete() {
		this.setState((state, props) => {
			let result = {};
			if(state.active_climber === null)
				return result;

			// Check if we need to delete payload
			// Still in climber, let's delete it
			if(state.climbers[state.active_climber].payload.contained) {
				state.payloads[state.active_payload].active = false;
				// Find index of the payload contained in the active climber
				const idx = state.payloads.indexOf(state.climbers[state.active_climber].payload);
				state.payloads.splice(idx, 1);
				result.payloads = state.payloads;
				// Change active payload
				result.active_payload = result.payloads.length == 0 ? null : state.active_payload == result.payloads.length ? 0 : state.active_payload;
				if(result.payloads.length > 0)
					result.payloads[result.active_payload].active = true;
				// Update p5
				props.p5.payloads = result.payloads;
			}
			// Delete active climber itself
			state.climbers.splice(state.active_climber, 1)
			result.climbers = state.climbers;
			result.active_climber = result.climbers.length == 0 ? null : state.active_climber == result.climbers.length ? 0 : state.active_climber;
			if(result.climbers.length > 0)
				result.climbers[result.active_climber].active = true;
			props.p5.climbers = result.climbers;

			return result;
		});
	}

	onClimberLeft() {
		this.setState((state, props) => {
			if(state.active_climber === null || state.active_climber === 0)
				return {};

			state.climbers[state.active_climber].active = false;
			const new_c = state.active_climber - 1;
			state.climbers[new_c].active = true;

			return {
				active_climber: new_c,
				climbers: state.climbers
			};
		});
	}

	onClimberRight() {
		this.setState((state, props) => {
			if(state.active_climber === null || state.active_climber == state.climbers.length - 1)
				return {};

			state.climbers[state.active_climber].active = false;
			const new_c = state.active_climber + 1;
			state.climbers[new_c].active = true;

			return {
				active_climber: new_c,
				climbers: state.climbers
			};
		});
	}

	onClimberLaunch(height, tta) {
		if(this.state.active_climber != null)
			this.props.p5.launch(this.state.active_climber, height, tta);
	}

	onClimberTrack() {
		if(this.state.active_climber != null)
			this.props.p5.track("c" + this.state.active_climber);
	}

	onUntrack() {
		this.props.p5.track();
	}

	onPayloadTrack() {
		if(this.state.active_payload != null)
			this.props.p5.track("p" + this.state.active_payload);
	}

	onPayloadLeft() {
		this.setState((state, props) => {
			if(state.active_payload === null || state.active_payload == 0)
				return {};

			state.payloads[state.active_payload].active = false;
			const new_c = state.active_payload - 1;
			state.payloads[new_c].active = true;

			return {
				active_payload: new_c,
				payloads: state.payloads
			};
		});
	}

	onPayloadRight() {
		this.setState((state, props) => {
			if(state.active_payload === null || state.active_payload == state.payloads.length - 1)
				return {};

			state.payloads[state.active_payload].active = false;
			const new_c = state.active_payload + 1;
			state.payloads[new_c].active = true;

			return {
				active_payload: new_c,
				payloads: state.payloads
			};
		});
	}

	render() {
		const running = this.state.running;
		return (
			<div className="container-fluid text-center">
				<div className="row">
					<div className="col text-left">
						<h1> Space Elevator Operator v4 </h1>
						<h3> Created by Ivan Miloslavov and Stephen Cohen </h3>
						<p className="desc">
						This program presents the orbits that satellites delivered by a Space Elevator would take when released from various launch altitudes along the tether. To start, press 
						the play button and adjust the rate of time lapse. You can create a new climber in the Climbers panel and send a payload to the launch altitude of your 
						choice in however many days of transit you desire. Send as many climbers as you wish.
						</p>
						<p className="desc">
						If you have questions or ideas for improvment, as well as if you have found bugs, feel free to email Ivan at MiloslavovIvan[at]gmail[dot]com .
						If you want to know more about the Space Elevator, visit the <a target="_blank" href="http://www.isec.org">International Space Elevator Consortium</a> website.
						</p>
					</div>
				</div>
				<div className="row">
					<div className="col-xl-10 vh-xl-100">
						<div className="py-2 h-100">
							<SimulationPanel 
								running={running} 
								onPlayPause={this.onPlayPause.bind(this)} 
								onScaleAdjust={this.onScaleAdjust.bind(this)}
								onUntrack={this.onUntrack.bind(this)}
								time={this.props.p5.timeInDays()}
								scale={this.state.time_scale}
								tracking={this.props.p5.getTracked()}
							/>
						</div>
					</div>
					<div className="col-xl-2 h-xl-100">
						<div className="py-2 h-xl-50">
							<ClimberPanel 
								climbers={this.state.climbers} 
								active={this.state.active_climber}
								onAdd={this.onClimberAdd.bind(this)} 
								onDelete={this.onClimberDelete.bind(this)}
								onLeft={this.onClimberLeft.bind(this)} 
								onRight={this.onClimberRight.bind(this)}
								onLaunch={this.onClimberLaunch.bind(this)}
								onTrack={this.onClimberTrack.bind(this)}
							/>
						</div>
						<div className="py-2 h-xl-50">
							<PayloadPanel 
								payloads={this.state.payloads} 
								active={this.state.active_payload}
								onLeft={this.onPayloadLeft.bind(this)} 
								onRight={this.onPayloadRight.bind(this)}
								onTrack={this.onPayloadTrack.bind(this)}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}