// Educational content for the engine simulator. Colours are the part's base colour in 3D.
export const ENGINE_PARTS = [
  {
    id: 'block', name: 'Cylinder block', color: '#7c8794',
    role: 'The engine’s main casting. It holds the four cylinders and supports the crankshaft.',
    how: 'The pistons slide inside the cylinder bores. Coolant passages around the bores carry heat away.',
    facts: ['Usually cast iron or aluminium', 'Bore and stroke set the engine’s displacement'],
  },
  {
    id: 'head', name: 'Cylinder head', color: '#6b7683',
    role: 'Seals the top of the cylinders and houses the valves, spark plugs and the combustion chambers.',
    how: 'Intake and exhaust ports run through the head. A gasket between head and block keeps combustion pressure in.',
    facts: ['Where the roof of each combustion chamber is shaped', 'Held on by head bolts under very high load'],
  },
  {
    id: 'pistons', name: 'Pistons', color: '#cfd6de',
    role: 'Turn combustion pressure into force. Gas pushes the piston down on the power stroke.',
    how: 'Each piston moves up and down inside its cylinder. Rings seal the gap against the wall.',
    facts: ['Travel from top dead centre to bottom dead centre is the stroke', 'They stop and reverse twice every crank turn'],
  },
  {
    id: 'rods', name: 'Connecting rods', color: '#9aa4b0',
    role: 'Link each piston to the crankshaft and carry the push between them.',
    how: 'The small end swings on the piston pin; the big end rides on the crank pin. The rod tilts as the crank turns.',
    facts: ['Rod length compared with crank radius changes how the piston moves', 'They are loaded in compression and tension'],
  },
  {
    id: 'crank', name: 'Crankshaft', color: '#b9c1cb',
    role: 'Converts the pistons’ up-and-down motion into rotation that drives the transmission.',
    how: 'Offset crank pins make a lever. In this four-cylinder, pins 1 and 4 move together while 2 and 3 move opposite, so one cylinder fires every 180°.',
    facts: ['Turns twice per four-stroke cycle', 'Counterweights balance the moving mass'],
  },
  {
    id: 'cam', name: 'Camshaft', color: '#d8a24a',
    role: 'Opens the valves at the right time using egg-shaped lobes.',
    how: 'Driven by a belt or chain at half the crank speed. Each lobe pushes a valve open and a spring closes it.',
    facts: ['Turns once per 720° of crank rotation', 'Lobe shape sets valve lift and duration'],
  },
  {
    id: 'valves', name: 'Valves', color: '#e6ebf0',
    role: 'Control what enters and leaves the cylinder: air in through the intake valve, exhaust out through the exhaust valve.',
    how: 'Both stay closed during compression and power so the cylinder is sealed. They overlap briefly near the end of exhaust.',
    facts: ['Two valves per cylinder here (one intake, one exhaust)', 'Exhaust valves run much hotter'],
  },
  {
    id: 'plugs', name: 'Spark plugs', color: '#f2efe7',
    role: 'Ignite the compressed air-fuel mixture a little before top dead centre.',
    how: 'A high-voltage pulse jumps the electrode gap. The flame front then spreads through the chamber.',
    facts: ['Fire once every two crank turns per cylinder', 'Timing advances with engine speed'],
  },
  {
    id: 'turbo', name: 'Turbocharger', color: '#c4584a',
    role: 'Uses exhaust gas to spin a compressor, forcing more air into the cylinders for more power.',
    how: 'Exhaust drives the turbine; the shaft turns the compressor on the intake side. Boost builds as exhaust flow grows.',
    facts: ['Turn it on in Controls to see extra torque', 'Spools up with engine speed and throttle'],
  },
]

export const STROKES = {
  Intake: 'The intake valve is open and the piston moves down, drawing air in.',
  Compression: 'Both valves are closed. The piston rises and squeezes the mixture.',
  Power: 'The spark ignites the mixture and expanding gas pushes the piston down.',
  Exhaust: 'The exhaust valve opens and the rising piston pushes burnt gas out.',
}
