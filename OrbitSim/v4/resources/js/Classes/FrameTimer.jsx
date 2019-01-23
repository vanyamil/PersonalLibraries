
// A helper class : keeps track of frame timings, since default time methods only give you current time
export default class FrameTimer {
    constructor() {
        this.totalTime = 0;
        this.previousTime = 0;
        this.lastFrame = undefined;
        this.running = false;
        this.scale = 1;
    }

    get total() { return this.totalTime; }
    get frame() { return this.lastFrame; }
    get scaledFrame() { return this.scale * this.lastFrame; }

    update(current) {
        this.lastFrame = current - this.previousTime;
        if(this.running) {
            this.totalTime += this.scaledFrame;
        }
        this.previousTime = current;
    } 

    toggle() { this.running = !this.running; }
}