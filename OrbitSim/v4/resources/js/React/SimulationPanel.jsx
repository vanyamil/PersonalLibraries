import React, {Component} from 'react';

export default class SimulatorPanel extends Component {
	render() {
		const button_style = {
			position: "absolute",
			left: "50%",
			top: "10px",
			marginLeft: "-20px"
		};
		const time_style = {
			position: "absolute",
			left: "15px",
			top: "15px",
			color: "white",
			textAlign: "left"
		};
		const untrack_style = {
			position: "absolute",
			right: "15px",
			top: "10px"
		}
		const running = this.props.running;

		const tracking = this.props.tracking === null 
			? "Nothing" 
			: this.props.tracking[0] == 'c' 
				? "Climber " + this.props.tracking.substr(1) 
				: "Payload " + this.props.tracking.substr(1);

		return (
			<div className="card h-100" id="sim_card">
				<div className="card-header">
					<a href="#sim_card">
						Simulation
					</a>
				</div>
				<div className="card-body" id="sketch-holder" style={{position: "relative", padding: 0, height: "calc(100% - 50px)"}}>
					<div style={time_style} >
						Elapsed time: {this.props.time} days
						<br />
						Time scale : 
						<input type="number" min="1" max="10" step="0.1" value={this.props.scale} style={({marginLeft: "5px", marginRight: "5px"})} onChange={this.props.onScaleAdjust} />
						hours/s
						<br />
						Currently tracking {tracking}
					</div>
					<button className="btn btn-primary" style={button_style} onClick={this.props.onPlayPause} >
						<i className={"fas " + (running ? "fa-pause" : "fa-play")}></i>
					</button>
					<button className="btn btn-primary" style={untrack_style} onClick={this.props.onUntrack} >
						<i className="fas fa-camera"></i>
					</button>
				</div>
			</div>
		);
	}
}