const TAU = Math.PI * 2;

export default class Earth {
    // Constants
    static get G() { return 6.67384e-11; }                      // Gravitational constant, units : m^3 / kg / s^2
    static get MASS() { return 5.97219e24; }                    // Mass of the Earth, units : kg
    static get PERIOD() { return 86164.1; }                     // Rotational period of the Earth, units : s
    static get MU() { return Earth.G * Earth.MASS; }            // Gravitational parameter of the Earth, units : m^3 / s^2
    static get OMEGA() { return 2 * Math.PI / Earth.PERIOD; }   // Angular velocity of Earth's rotation, units : rad / s
    static get GEO_RADIUS() { return 42164000; }                // Radius of the geostationary orbit, units : m
    static get RADIUS() { return 6378137; }                     // Radius of the Earth, units : m
    static get CRITHEIGHT() {                                   // Starting at this height, the resulting orbit will be hyperbolic, units : m 
        return Math.cbrt(2*Earth.MU/(Earth.OMEGA ** 2))-Earth.RADIUS; 
    }

    static get IMAGE() {
        return Earth._img;
    }
    static set IMAGE(img) { Earth._img = img; }

    static update(timer) {
        Earth.rotation = (Earth.OMEGA * timer.total) % TAU;
    }

    static get SOI() { // Height of the sphere of influence of Earth's gravity, units : m, pulled from Wiki
        return 0.924e9;
    }
}

Earth.rotation = 0;