// One entry per car system. The 3D car, the hover panel and the scroll tour all read
// from here. A system with a `url` has a live simulator; the rest are still to come.

export const ENGINE_SIMULATOR_URL = 'https://gigachad-suryansh.github.io/Pieces/'

export const SYSTEMS = {
  engine: {
    id: 'engine', name: 'Engine', action: 'Explore Engine', url: ENGINE_SIMULATOR_URL,
    blurb: 'Burns fuel and air to push pistons, turning heat into rotation.',
    anchor: [1.7, 1.12, 0],
    parts: [
      ['Cylinder block', 'Holds the cylinders and the crankshaft.'],
      ['Pistons', 'Pushed down by burning gas, they drive the crankshaft.'],
      ['Valves', 'Let air in and exhaust out at exactly the right moments.'],
    ],
  },
  cooling: {
    id: 'cooling', name: 'Cooling system', action: 'Explore Cooling System',
    blurb: 'Moves coolant between the engine and a radiator to shed heat.',
    anchor: [2.25, 0.98, 0],
    parts: [
      ['Radiator', 'Passes heat from the coolant to the air.'],
      ['Water pump', 'Circulates coolant around the engine.'],
      ['Thermostat', 'Keeps coolant in the engine until it is warm.'],
    ],
  },
  transmission: {
    id: 'transmission', name: 'Transmission', action: 'Explore Transmission',
    blurb: 'Trades engine speed for wheel torque through selectable gear ratios.',
    anchor: [0.85, 0.95, 0],
    parts: [
      ['Gears', 'Pairs of different sizes set the speed and torque ratio.'],
      ['Clutch', 'Connects and disconnects the engine from the gearbox.'],
      ['Differential', 'Lets the wheels turn at different speeds in a corner.'],
    ],
  },
  steering: {
    id: 'steering', name: 'Steering', action: 'Explore Steering',
    blurb: 'Turns the wheel’s rotation into the front wheels’ angle.',
    anchor: [0.45, 1.3, 0.35],
    parts: [
      ['Steering column', 'Carries your input from the wheel to the rack.'],
      ['Rack and pinion', 'Converts rotation into side-to-side motion.'],
      ['Tie rods', 'Push and pull the wheels to set their angle.'],
    ],
  },
  brakes: {
    id: 'brakes', name: 'Braking system', action: 'Explore Braking System',
    blurb: 'Clamps pads onto spinning discs to turn motion into heat.',
    anchor: [1.45, 0.72, 0.72],
    parts: [
      ['Brake discs', 'Spin with the wheel and absorb heat.'],
      ['Calipers and pads', 'Squeeze the disc using hydraulic pressure.'],
      ['ABS', 'Releases and reapplies pressure so wheels do not lock.'],
    ],
  },
  suspension: {
    id: 'suspension', name: 'Suspension', action: 'Explore Suspension',
    blurb: 'Springs and dampers keep the tyres on the road and the cabin calm.',
    anchor: [-1.15, 1.1, 0.55],
    parts: [
      ['Springs', 'Support the car and absorb bumps.'],
      ['Dampers', 'Control how quickly the springs settle.'],
      ['Control arms', 'Guide wheel travel and keep the geometry stable.'],
    ],
  },
  'electric-motor': {
    id: 'electric-motor', name: 'Electric motor', action: 'Explore Electric Motor',
    blurb: 'Battery power becomes torque with no gearbox in between.',
    anchor: [-1.45, 1.0, 0],
    parts: [
      ['Battery pack', 'Stores energy in the floor of the car.'],
      ['Inverter', 'Turns battery DC into three-phase AC for the motor.'],
      ['Motor and reduction gear', 'Make torque and step the speed down for the wheels.'],
    ],
  },
  'electrical-system': {
    id: 'electrical-system', name: 'Electrical system', action: 'Explore Electrical System',
    blurb: 'The 12-volt network that starts the car and powers everything else.',
    anchor: [1.2, 1.1, -0.45],
    parts: [
      ['Battery', 'Stores power for starting and the electronics.'],
      ['Alternator', 'Recharges the battery while the engine runs.'],
      ['Fuses and relays', 'Protect circuits and switch heavy loads.'],
    ],
  },
}

// Order of the scroll tour: front of the car to the back.
export const TOUR = ['engine', 'cooling', 'transmission', 'steering', 'brakes', 'suspension', 'electric-motor', 'electrical-system']
