// Exoplanet types shown in the 3D viewer, each with a model from public/models.

export type PlanetType = { id: string; name: string; model: string; blurb: string };

export const PLANET_TYPES: PlanetType[] = [
  {
    id: "rocky", name: "Rocky (Terrestrial)", model: "/models/rocky.glb",
    blurb: "A small, solid world of rock and metal, like Earth or Mars.",
  },
  {
    id: "super-earth", name: "Super-Earth", model: "/models/kepler_10_c.glb",
    blurb: "Kepler-10c: a rocky planet several times Earth's mass, bigger than Earth but smaller than Neptune.",
  },
  {
    id: "habitable", name: "Earth-like (Habitable Zone)", model: "/models/kepler-186f.glb",
    blurb: "Kepler-186f: an Earth-sized planet orbiting where liquid water could exist on its surface.",
  },
  {
    id: "volcanic", name: "Volcanic / Lava World", model: "/models/lp_791-18d.glb",
    blurb: "LP 791-18d: tidal squeezing from nearby planets may cover it in active volcanoes.",
  },
  {
    id: "gas-giant", name: "Gas Giant", model: "/models/gas_giant.glb",
    blurb: "A huge planet made mostly of hydrogen and helium with no solid surface, like Jupiter.",
  },
  {
    id: "ice-giant", name: "Ice Giant (Neptune-like)", model: "/models/blueGasGiant.glb",
    blurb: "A cold giant rich in water, ammonia and methane ices, like Neptune and Uranus.",
  },
  {
    id: "ringed", name: "Ringed Gas Giant", model: "/models/ringedGasGiant.glb",
    blurb: "A gas giant circled by rings of ice and rock, like Saturn.",
  },
];
