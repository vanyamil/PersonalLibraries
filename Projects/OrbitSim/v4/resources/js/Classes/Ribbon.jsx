export default class Ribbon {
    // Constants
    static get LENGTH() { return 100000000; }         // Length of the space tether, units : m
    static get WIDTH() { return 300000; }             // Width of the space tether, units : m. Not real value, instead one that is visible
    static get COLOR() { return 'lightgrey'; } 
    static get GEO_WIDTH() { return 500000; }        // Radius of the sphere indicating the geostationary station, units : m
    static get GEO_COLOR() { return '#6D5086'; } 
    static get COUNTER_WIDTH() { return 1000000; }    // Radius of the sphere indicating the counterweight, units : m
    static get COUNTER_COLOR() { return '#22339F'; }

    static get LONGITUDE() { return Math.PI * 90 / 180; }
    static get LATITUDE() { return Math.PI * 5 / 180; }
}