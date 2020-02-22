//Author: Ivan Miloslavov

//Global variables
var canvas, ctx, centerX, centerY, scale, angle;
var playing = false;
var totalTime = 0.0, lastTime, timeScale;
var climbers = [], payloads = [];
var activeClimber, activePayload;

//The Earth object
var earth = {
	G:6.67384e-11,
	MASS:5.97219e24,
	PERIOD:86164.1,
	MU:5.97219e24 * 6.67384e-11,
	OMEGA:2*Math.PI/86164.1,
	GEO_RADIUS:42164000,
	RADIUS:6378137,
	IMAGE:document.getElementById("earthPic"),
	//Addition in v1.1: this number is used to determine whether the satellite will go onto a hyperbolic orbit
	CRITHEIGHT: Math.cbrt(2*5.97219e24 * 6.67384e-11/(2*Math.PI/86164.1*2*Math.PI/86164.1))-6378137,
	
	draw:function() {
		ctx.drawImage(this.IMAGE,-this.RADIUS*scale,-this.RADIUS*scale,2*this.RADIUS*scale,2*this.RADIUS*scale);
	}
};

//The Elevator ribbon + GEO station and counterweight
var ribbon = {
	LENGTH:100000000,
	draw:function(){
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.strokeStyle="#444444";
		ctx.moveTo(0,earth.RADIUS*scale);
		ctx.lineTo(0, (earth.RADIUS+this.LENGTH)*scale);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(0, earth.GEO_RADIUS*scale, 4,0,2*Math.PI);
		ctx.fillStyle="#4D3066";
		ctx.fill();
		ctx.beginPath();
		ctx.arc(0, (earth.RADIUS+this.LENGTH)*scale, 4,0,2*Math.PI);
		ctx.fillStyle="#22339F";
		ctx.fill();
	}
}

//The Climber class describes the climbers of the elevator
function Climber() {
	this.height = 0;
	this.payload = new Payload();
	this.active = true;
	this.speed = 0;
	this.requestHeight = 0;
	payloads.push(this.payload);
}

Climber.prototype = {
	inactiveColor:"#AAAAAA",
	activeColor:"#FF0000",
	size:3,
	constructor:Climber,
	
	//Called by the Send button, launches the climber to its destination
	send:function(launchHeight, launchDays) {
		this.requestHeight = launchHeight;
		this.speed = (launchHeight-this.height)/earth.PERIOD/launchDays;
	},
	
	//Adds the deltaHeight to current height and checks whether arrived to destination
	update:function(deltaTime, angle) {
		if(this.requestHeight<this.height) {
			this.speed=0;
			this.requestHeight=this.height;
			this.payload.release(angle);
		}
		this.height+=this.speed*deltaTime;
		if(!this.payload.released) this.payload.height = this.height;
	},
	
	//draws the rectangle on the ribbon of the elevator
	draw:function() {
		ctx.beginPath();
		if(this==climbers[activeClimber]) {ctx.fillStyle=this.activeColor;}
		else {ctx.fillStyle=this.inactiveColor;}
		ctx.fillRect(-this.size, (earth.RADIUS+this.height)*scale-this.size, 2*this.size, 2*this.size);
	},
	
	toString:function() {
		var string = "";
		if(this.speed!=0) {
			string+="Speed: " + (this.speed*3.6).toFixed(2) + " km/h <br />";
			string+="Moving towards: " + (this.requestHeight/1000).toFixed(0) + " km <br />";
			string+="Current height: " + (this.height/1000).toFixed(0) + " km";
		} else string+="Current height: " + (this.height/1000).toFixed(0) + " km <br /> <br />";
		return string;
	}
}

//The Payload class describes the payloads that climbers deliver to orbit
function Payload() {
	this.height = 0;
	this.released = false;
	this.active = true;
	this.orbit = null;
}

Payload.prototype = {
	inactiveColor:"#00FFFF",
	activeColor:"#FFFF00",
	constructor:Payload,
	
	//Called by the climber at arrival, releases the payload on its orbit
	release:function() {
		if(!this.released){
			this.orbit = (this.height<earth.CRITHEIGHT) ? new Orbit(this.height, angle, totalTime) : new HyperbolicOrbit(this.height, angle, totalTime);
			this.released = true;
		}
	},
	
	//Draw the payload either inside the climber or on its orbit depending on if it is released
	draw:function(time) {
		ctx.beginPath();
		if(this == payloads[activePayload]) {ctx.fillStyle=this.activeColor;}
		else {ctx.fillStyle=this.inactiveColor;}
		if(!this.released) {
			ctx.rotate(-angle);//- added to do CCW
			ctx.arc(0, (earth.RADIUS+this.height)*scale, 2,0,2*Math.PI);
			ctx.fill();
			ctx.rotate(angle);//- added to do CCW
		} else if(this.orbit.semiMajor>0 || this.orbit.outOfSOI==0) {
			var position = this.orbit.getPosition(totalTime);
			ctx.arc(-position.x*scale, position.y*scale, 2,0,2*Math.PI); //- added to do CCW
			ctx.fill();
		}
	}
}

//The Orbit class makes all calculations related to the payloads' orbits.
function Orbit(launchHeight, launchAngle, launchTime) {
	this.launchTime = launchTime;
	this.launchRadius = launchHeight + earth.RADIUS;
	this.launchAngle = launchAngle;
	this.semiMajor = 1/(2/this.launchRadius - Math.pow(this.launchRadius*earth.OMEGA, 2)/earth.MU);
	this.ecc = Math.abs(this.launchRadius*Math.pow(this.launchRadius*earth.OMEGA, 2)/earth.MU - 1);
	this.period = 2*Math.PI*Math.sqrt(Math.pow(this.semiMajor, 3)/earth.MU);
	if(this.semiMajor<this.launchRadius) this.launchTime-=this.period/2;
	this.trueAnomaly = 0;
}

Orbit.prototype = {
	epsilon:0.0001, //the eccentric anomaly will be calculated with a precision of 0.01%
	constructor:Orbit, //The constructor calculates some properties from the launch height and angle
	
	//Returns the mean motion angle depending on current time
	meanMotion:function(time) {
		return ((time-this.launchTime)/this.period)%1.0*(2*Math.PI);
	},
	
	//Calculates by Newton's Method a numerical approximation of the eccentric anomaly around Earth
	angleE:function(meanMotion) {
		var newPoint = Math.PI, currentPoint, f, der;
		do {
			currentPoint = newPoint;
			f = currentPoint - this.ecc*Math.sin(currentPoint) - meanMotion;
			der = 1 - this.ecc * Math.cos(currentPoint);
			newPoint = currentPoint - f/der;
		} while (Math.abs(newPoint-currentPoint)/newPoint >= this.epsilon);
		return newPoint;
	},
	
	//From the eccentric anomaly, returns the true anomaly
	theta:function(angleE) {
		return 2*Math.atan2(Math.sqrt(1+this.ecc)*Math.sin(angleE/2),
				Math.sqrt(1-this.ecc)*Math.cos(angleE/2));
	},
	
	//Using the 3 previous functions, returns a position relative to Earth depending on time
	getPosition:function(time) {
		var theta = this.theta(this.angleE(this.meanMotion(time)));
		var altitude = this.semiMajor*(1-this.ecc*this.ecc)/(1+this.ecc*Math.cos(theta));
		if(this.semiMajor<this.launchRadius) theta+=Math.PI;
		this.trueAnomaly = theta+this.launchAngle+Math.PI/2;
		return polar(altitude, this.trueAnomaly);
	},
	
	toString:function() {
		var string="Semi-major axis: " + (this.semiMajor/1000).toFixed(0) + " km <br />";
		string+="Eccentricity: " + this.ecc.toFixed(3) +  "<br />";
		string+="Current true anomaly: " + (this.trueAnomaly*180/Math.PI%(360)).toFixed(1) + " degrees <br />";
		string+="Orbital period: " + this.period.toFixed(1) + " s / " + (this.period/earth.PERIOD).toFixed(3) + " days";
		return string;
	}
}

//The HyperbolicOrbit class makes all calculations related to the orbits that start too high (around 46 745 km above the ground).
function HyperbolicOrbit(launchHeight, launchAngle, launchTime) {
	this.launchTime = launchTime;
	this.launchRadius = launchHeight + earth.RADIUS;
	this.launchAngle = launchAngle;
	this.semiMajor = 1/(2/this.launchRadius - Math.pow(this.launchRadius*earth.OMEGA, 2)/earth.MU);
	this.ecc = 1-this.launchRadius/this.semiMajor;
	this.trueAnomaly = 0;
}

HyperbolicOrbit.prototype = {
	epsilon:0.0001, //the eccentric anomaly will be calculated with a precision of 0.01%
	constructor:HyperbolicOrbit, //The constructor calculates some properties from the launch height and angle
	altitude:0,
	outOfSOI:0,
	
	//Returns the mean motion angle depending on current time
	meanMotion:function(time) {
		return (time-this.launchTime)*Math.sqrt(-earth.MU/Math.pow(this.semiMajor, 3));
	},
	
	//Calculates by Newton's Method a numerical approximation of the eccentric anomaly around Earth
	angleF:function(meanMotion) {
		var newPoint = Math.PI/2, currentPoint, f, der;
		do {
			currentPoint = newPoint;
			f = this.ecc*Math.sinh(currentPoint) - currentPoint - meanMotion;
			der = this.ecc*Math.cosh(currentPoint) - 1;
			newPoint = currentPoint - f/der;
		} while (Math.abs(newPoint-currentPoint)/newPoint >= this.epsilon);
		return newPoint;
	},
	
	//From the eccentric anomaly, returns the true anomaly
	theta:function(angleF) {
		return 2*Math.atan2(Math.sqrt(this.ecc+1)*Math.sinh(angleF/2),
				Math.sqrt(this.ecc-1)*Math.cosh(angleF/2));
	},
	
	//Using the 3 previous functions, returns a position relative to Earth depending on time
	getPosition:function(time) {
		var theta = this.theta(this.angleF(this.meanMotion(time)));
		this.altitude = this.semiMajor*(1-this.ecc*this.ecc)/(1+this.ecc*Math.cos(theta));
		if(this.altitude>=0.924e9) this.outOfSOI = (time-this.launchTime)/earth.PERIOD;
		this.trueAnomaly = theta+this.launchAngle+Math.PI/2;
		return polar(this.altitude, this.trueAnomaly);
	},
	
	toString:function() {
		var string="Semi-major axis: " + (this.semiMajor/1000).toFixed(0) + " km <br />";
		string+="Eccentricity: " + this.ecc.toFixed(3) +  "<br />";
		string+=((this.outOfSOI!=0)
			? "The satellite left Earth's sphere of influence <br /> after " + this.outOfSOI.toFixed(2) + " days"
			: "Current height: " + (this.altitude/1000).toFixed(0) + " km <br />");
		return string;
	}
}

//Initializes some variables and calls the update function
function start() {
	canvas = document.getElementById("animPane");
	ctx = canvas.getContext("2d");
	centerX = canvas.width/2;
	centerY = canvas.height/2;
	scale = Math.min(centerX, centerY)/150000000.0;
	lastTime = Date.now();
	timeScale = earth.PERIOD/4800;
	angle = 0;
	ctx.fillStyle = "#D51313";
	ctx.fillRect(0, 0, 2*centerX, 2*centerY);
	ctx.drawImage(document.getElementById("splash"), 0, centerY/2, 2*centerX, centerY); //optional, this is current acknowledgment of the development of this program
	update();
}

//Called at every frame, this function updates all the locations and calls for redraw
function update() {
	var currTime = Date.now();
	angle = (totalTime/earth.PERIOD)%1.0*Math.PI*2;
	if(playing) {
		totalTime += (currTime-lastTime)*timeScale;
		for(var i = 0; i<climbers.length; i++) {
			climbers[i].update((currTime-lastTime)*timeScale);
		}
		draw();
		document.getElementById("simTotalTime").innerHTML = (totalTime/earth.PERIOD).toFixed(2);
	}
	updateStatuses(document.getElementById("climberStatus"), document.getElementById("payloadStatus"));
	lastTime = currTime;
	window.requestAnimationFrame(update);
}

//Called by update(), redraws the scene at every frame
function draw() {
	ctx.drawImage(document.getElementById("bgPic"), 0, 0, 2*centerX, 2*centerY);
	ctx.translate(centerX, centerY);
	ctx.rotate(-angle);//- added to do CCW
	earth.draw();
	ribbon.draw();
	for(var i = 0; i<climbers.length; i++) {
		climbers[i].draw();
	}
	ctx.rotate(angle);//- added to do CCW
	for(var i = 0; i<payloads.length; i++) {
		payloads[i].draw();
	}
	ctx.translate(-centerX, -centerY);
}

//Called by the New Climber button, creates a new Climber with a Payload inside
function createClimber() {
	climbers.push(new Climber());
	document.getElementById("deleteClimber").disabled = false;
	activeClimber = climbers.length-1;
	activePayload = payloads.length-1;
	if(activeClimber>0) document.getElementById("prevClimber").disabled = false;
	changePayload(0);
	document.getElementById("climberInput").hidden = false;
	document.getElementById("sendClimber").disabled = false;
	draw();
}

//Deletes the currently selected climber, updates pointers and list, hides the panel if necessary
function deleteClimber() {
	var pInActiveC = climbers[activeClimber].payload;
	
	if(activeClimber==0) {  //If the first climber created is selected
		if(climbers.length==1) {  //If it is the only one of the list, block almost all buttons and inputs
			activeClimber = null;
			document.getElementById("deleteClimber").disabled = true;
			document.getElementById("climberInput").hidden = true;
			climbers.splice(0, 1);
		} else { //Else, delete it and then reselect the "new first" climber on the list
			climbers.splice(0, 1);
			changeClimber(0);
		}
	} else { //If it is not the first, delete it from the list and select the previous one
		climbers.splice(activeClimber, 1);
		changeClimber(-1);
	}
	
	//Deletes the payload if it is still inside the active climber
	if(!pInActiveC.released) {
		payloads.splice(payloads.indexOf(pInActiveC), 1);
		//reselect the payload
		if(payloads.length == 0) activePayload = null;
		else {
			if(activeClimber == null) activePayload = 0;
			else {
				activePayload = payloads.indexOf(climbers[activeClimber].payload);
			}
			changePayload(0);
		}
	}
	
	draw();
}

//Sends a climber to requested height in requested time
function sendClimber() {
	correctHeight(document.getElementById("launchHeight"));
	climbers[activeClimber].send(document.getElementById("launchHeight").value*1000, document.getElementById("launchDays").value);
	document.getElementById("sendClimber").disabled = true;
}

//Called by the Play/Pause button, toggles the button and the running of the simulation
function playPause(button) {
	if(button.innerHTML == "Play") {
		button.innerHTML = "Pause";
		playing = true;
	} else {
		button.innerHTML = "Play";
		playing = false;
	}
}

//Called by the simSpeed field, changes the speed of the simulation
function updateTimeScale(simSpeedInput) {
	simSpeedInput.value = Math.min(Math.max(simSpeedInput.value, 1), 15);
	timeScale = earth.PERIOD/24000*simSpeedInput.value;
}

//Called by << or >> climber buttons, changes the selection of climbers
function changeClimber(modifier) {
	activeClimber+=modifier;
	if(activeClimber == climbers.length-1) document.getElementById("nextClimber").disabled = true;
	else document.getElementById("nextClimber").disabled = false;
	if(activeClimber == 0) document.getElementById("prevClimber").disabled = true;
	else document.getElementById("prevClimber").disabled = false;
	if(climbers[activeClimber].height!=0) document.getElementById("sendClimber").disabled = true;
	else document.getElementById("sendClimber").disabled = false;
}

//Called by << or >> payload buttons, changes the selection of payloads
function changePayload(modifier) {
	activePayload+=modifier;
	if(activePayload == payloads.length-1) document.getElementById("nextPayload").disabled = true;
	else document.getElementById("nextPayload").disabled = false;
	if(activePayload == 0) document.getElementById("prevPayload").disabled = true;
	else document.getElementById("prevPayload").disabled = false;
}

//Corrects the launch height if it goes out of the limits
function correctHeight(input) {
	input.value = Math.min(Math.max(input.value, 23500), /*46750*/99000);
}

//Corrects the number of days if it goes too high or too low
function correctDays(input) {
	input.value = Math.min(Math.max(input.value, 4), 50);
}

//Updates the text statuses of active payload and climber
function updateStatuses(climberSpan, payloadSpan) {
	//Update the climber span depending on whether there is an active climber and if its payload is released	
	climberSpan.innerHTML = (activeClimber == null) ? "No climbers, create a new one! <br /> <br />" : climbers[activeClimber].toString();
	
	//Updates the payload span depending on whether there is an active payload and if it is orbiting	
	payloadSpan.innerHTML = ((activePayload == null) ? "No payloads, send a new one! <br /> <br /> <br />" 
		: ((payloads[activePayload].released) ? payloads[activePayload].orbit.toString() : "Current height: " + (payloads[activePayload].height/1000).toFixed(0) + " km  <br /> <br /> <br />"));
}

//Gives a component-based vector object
function polar(mag, theta) {
	return {x:mag*Math.cos(theta), y:mag*Math.sin(theta)};
}

//Start the whole program once every element is loaded
$(window).load(start());