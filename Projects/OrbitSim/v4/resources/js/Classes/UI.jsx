import Earth from "./Earth.jsx";
import Climber from "./Climber.jsx";


// A helper class : maintains the GUI.
export default class UI {
    static update(timer) {
        if(!timer.running)
            return;
        if(UI.timeOutput)
            UI.timeOutput.html("Current time: " + (timer.total / Earth.PERIOD).toFixed(2) + " days");
    }

    static setup(p5, timer) {
        // Set up the UI
        UI.timeOutput = p5.createSpan();
        UI.timeOutput.position(20, 20);
        UI.timeOutput.style("color", "white");

        let playButton = p5.createButton('Play');
        playButton.position(20, 50);
        playButton.mouseClicked(function() {
            timer.toggle();
            this.elt.textContent = timer.running ? "Pause" : "Play";
        });

        let launchButton = p5.createButton('Launch');
        launchButton.position(80, 50);
        launchButton.mouseClicked(() => Climber.LIST[0].release(timer.total));

        let climberPanel = p5.select("#climber-panel");

        let createClimber = p5.createButton("Add a Climber");
        createClimber.parent(climberPanel);
        createClimber.mouseClicked(() => Climber.add());
    }
}