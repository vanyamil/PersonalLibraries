import React, {Component} from 'react';

export default class PayloadPanel extends Component {
	render() {
		const isActive = this.props.active !== null;
		const active = isActive ? this.props.payloads[this.props.active] : null;
		const contained = isActive && active.contained;
		const impacted = isActive && active.impacted;

		return (
			<div className="card h-xl-100" id="payload-panel">
				<div className="card-header">
					Payloads
				</div>
				<div className="card-body">
					<div className="row">
						<div className="col-3 px-0">
							<button id="prev-payload" className="btn btn-secondary" onClick={this.props.onLeft}>
								<i className="fas fa-arrow-left"></i>
							</button>
						</div>
						<div className="col-6 px-0">
							<button id="track-climber" className="btn btn-info w-100" onClick={this.props.onTrack}> Track </button> 
						</div>
						<div className="col-3 px-0">
							<button id="next-payload" className="btn btn-secondary" onClick={this.props.onRight}>
								<i className="fas fa-arrow-right"></i>
							</button>
						</div>
					</div>
					{ active ? (impacted 
						? 
						<div className="row py-2 px-1">
							<div className="col-12 px-0">
								Payload destroyed
							</div>
						</div>
						: (contained 
							? 
							<div className="row py-2 px-1">
								<div className="col-6 px-0 text-left small">
									Height (km): 
								</div>
								<div className="col-6 px-0 text-right">
									{Math.round(active.container.height / 1000)}
								</div>
							</div>
							:
							<div><div className="row py-2 px-1">
								<div className="col-6 px-0 text-left small">
									Semi-major (km): 
								</div>
								<div className="col-6 px-0 text-right">
									{Math.round(active.container.semi_major / 1000)}
								</div>
							</div>
							<div className="row py-2 px-1">
								<div className="col-6 px-0 text-left small">
									Eccentricity: 
								</div>
								<div className="col-6 px-0 text-right">
									{active.container.e.toFixed(4)}
								</div>
							</div>
							<div className="row py-2 px-1">
								<div className="col-6 px-0 text-left small">
									Period (days): 
								</div>
								<div className="col-6 px-0 text-right">
									{(active.container.dayPeriod).toFixed(2)}
								</div>
							</div>
							<div className="row py-2 px-1">
								<div className="col-6 px-0 text-left small">
									Altitude (km): 
								</div>
								<div className="col-6 px-0 text-right">
									{(active.container.altitude / 1000).toFixed(2)}
								</div>
							</div></div>)
						)
						: null
					}
				</div>
			</div>
		);
	}
}