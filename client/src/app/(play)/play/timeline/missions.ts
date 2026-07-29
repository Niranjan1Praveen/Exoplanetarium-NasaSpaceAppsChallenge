/**
 * Mission profiles for the exoplanet discovery timeline.
 *
 * Figures are drawn from well-established public mission facts and kept
 * deliberately conservative — planet counts in particular are given as
 * approximate, because confirmed totals move as candidates are validated.
 */

export interface MissionSpec {
  label: string;
  value: string;
}

export interface Mission {
  /** Stable id, also used as the React key. */
  id: string;
  title: string;
  /** Drives timeline ordering and the year marker. */
  date: string;
  agency: string;
  status: "Operating" | "Retired" | "Planned";
  /** One-line summary shown on the timeline itself. */
  body: string;
  modelPath: string;
  specs: MissionSpec[];
  /** Longer prose for the modal. */
  overview: string;
  discoveries: string[];
}

export const missions: Mission[] = [
  {
    id: "hubble",
    title: "Hubble",
    date: "1990-04-24",
    agency: "NASA / ESA",
    status: "Operating",
    body: "Probing the composition of exoplanet atmospheres.",
    modelPath: "/models/hubble.glb",
    specs: [
      { label: "Launched", value: "24 April 1990 (STS-31)" },
      { label: "Orbit", value: "Low Earth orbit, ~540 km" },
      { label: "Primary mirror", value: "2.4 m" },
      { label: "Wavelengths", value: "Ultraviolet, visible, near-infrared" },
      { label: "Method", value: "Transmission spectroscopy" },
    ],
    overview:
      "Hubble was never designed as a planet hunter, but it became the instrument that turned exoplanets from points of light into places with chemistry. By observing a star while a planet crosses in front of it, Hubble measures the fraction of starlight filtering through the planet's atmosphere, and the wavelengths that go missing reveal which molecules are present.",
    discoveries: [
      "Made the first detection of an exoplanet atmosphere, finding sodium at HD 209458 b in 2001.",
      "Detected water vapour in the atmospheres of a range of hot Jupiters.",
      "Observed an escaping, comet-like atmospheric tail streaming from a closely orbiting planet.",
      "Still operating after more than three decades, and regularly used for atmospheric follow-up.",
    ],
  },
  {
    id: "spitzer",
    title: "Spitzer",
    date: "2003-08-25",
    agency: "NASA",
    status: "Retired",
    body: "Studying exoplanet signatures in infrared light.",
    modelPath: "/models/spitzer.glb",
    specs: [
      { label: "Launched", value: "25 August 2003" },
      { label: "Retired", value: "30 January 2020" },
      { label: "Orbit", value: "Earth-trailing, heliocentric" },
      { label: "Primary mirror", value: "0.85 m" },
      { label: "Wavelengths", value: "Infrared" },
    ],
    overview:
      "Working in the infrared, Spitzer could see the planet's own heat rather than only its silhouette. That made it possible to measure secondary eclipses — the dip when a planet passes behind its star — and so to take a planet's temperature and map how heat moves around it.",
    discoveries: [
      "Made the first direct detection of light emitted by an exoplanet in 2005.",
      "Produced the first temperature map of an exoplanet's surface.",
      "Confirmed that the TRAPPIST-1 system hosts seven roughly Earth-sized planets in 2017.",
      "Operated for over sixteen years, far beyond its cryogenic design life.",
    ],
  },
  {
    id: "corot",
    title: "CoRoT",
    date: "2006-12-27",
    agency: "CNES / ESA",
    status: "Retired",
    body: "Pioneering stellar seismology and exoplanet hunting mission.",
    modelPath: "/models/corot.glb",
    specs: [
      { label: "Launched", value: "27 December 2006" },
      { label: "Retired", value: "2013" },
      { label: "Orbit", value: "Polar low Earth orbit" },
      { label: "Telescope", value: "27 cm aperture" },
      { label: "Method", value: "Transit photometry, asteroseismology" },
    ],
    overview:
      "CoRoT was the first spacecraft built specifically to hunt for transiting planets, proving that the technique worked from orbit and paving the way for Kepler. It split its time between planet hunting and asteroseismology — reading the internal oscillations of stars, which in turn sharpens the measurement of any planets around them.",
    discoveries: [
      "Detected CoRoT-7b in 2009, among the first confirmed rocky exoplanets with a measured radius and mass.",
      "Demonstrated that space-based transit photometry could reach the precision needed for small planets.",
      "Contributed roughly thirty confirmed planets alongside its stellar physics results.",
    ],
  },
  {
    id: "kepler",
    title: "Kepler / K2",
    date: "2009-03-07",
    agency: "NASA",
    status: "Retired",
    body: "A targeted search for terrestrial planets near the habitable zones of other stars.",
    modelPath: "/models/kepler.glb",
    specs: [
      { label: "Launched", value: "7 March 2009" },
      { label: "K2 mission", value: "2014 – 2018" },
      { label: "Retired", value: "30 October 2018" },
      { label: "Orbit", value: "Earth-trailing, heliocentric" },
      { label: "Aperture", value: "0.95 m" },
      { label: "Method", value: "Transit photometry" },
    ],
    overview:
      "Kepler stared at a single patch of sky near Cygnus and Lyra, monitoring the brightness of roughly 150,000 stars continuously for years. After two of its four reaction wheels failed, the mission was reinvented as K2, using pressure from sunlight to help hold the spacecraft steady while it surveyed fields along the ecliptic.",
    discoveries: [
      "Confirmed more than 2,700 planets, over half of all exoplanets known at the time of its retirement.",
      "Showed that small planets are common, and that most stars host planetary systems.",
      "Identified the first Earth-sized planets found in a star's habitable zone.",
      "Revealed abundant super-Earths and mini-Neptunes, planet sizes absent from our own solar system.",
    ],
  },
  {
    id: "tess",
    title: "TESS",
    date: "2018-04-18",
    agency: "NASA",
    status: "Operating",
    body: "First all-sky transit survey satellite.",
    modelPath: "/models/tess.glb",
    specs: [
      { label: "Launched", value: "18 April 2018" },
      { label: "Orbit", value: "Elliptical, in 2:1 resonance with the Moon" },
      { label: "Cameras", value: "Four wide-field cameras" },
      { label: "Coverage", value: "Nearly the whole sky, in sectors" },
      { label: "Method", value: "Transit photometry" },
    ],
    overview:
      "Where Kepler went deep on one small field, TESS goes wide. It surveys the sky in overlapping sectors, concentrating on stars that are bright and nearby — precisely the targets whose planets are easiest to weigh and to follow up with spectroscopy from the ground or from Webb.",
    discoveries: [
      "Generated thousands of candidate signals, with hundreds confirmed as planets and the count still rising.",
      "Found planets around stars bright enough for detailed atmospheric follow-up.",
      "Detected its first Earth-sized habitable-zone candidate around a nearby cool star.",
      "Doubles as a general-purpose survey, catching supernovae and stellar flares.",
    ],
  },
  {
    id: "cheops",
    title: "CHEOPS",
    date: "2019-12-18",
    agency: "ESA",
    status: "Operating",
    body: "Precise size measurements of known Earth-to-Neptune sized exoplanets.",
    modelPath: "/models/cheops.glb",
    specs: [
      { label: "Launched", value: "18 December 2019" },
      { label: "Orbit", value: "Sun-synchronous, ~700 km" },
      { label: "Telescope", value: "32 cm aperture" },
      { label: "Role", value: "Follow-up characterisation, not a survey" },
    ],
    overview:
      "CHEOPS does not look for new planets. It revisits stars already known to host them and measures their transits with very high precision, pinning down planetary radii. Combined with a mass from radial velocity, an accurate radius gives density — and density is what distinguishes a rocky world from a gas-rich one.",
    discoveries: [
      "Delivered high-precision radii that turned known planets into planets with known compositions.",
      "Characterised unusually hot worlds and probed how they reradiate heat.",
      "Helped identify systems whose orbits are locked in resonant chains.",
    ],
  },
  {
    id: "plato",
    title: "PLATO",
    date: "2026-01-01",
    agency: "ESA",
    status: "Planned",
    body: "Searching for terrestrial planets in the habitable zones of Sun-like stars.",
    modelPath: "/models/plato.glb",
    specs: [
      { label: "Planned launch", value: "2026" },
      { label: "Orbit", value: "Sun-Earth L2" },
      { label: "Cameras", value: "26 cameras working together" },
      { label: "Method", value: "Transit photometry, asteroseismology" },
    ],
    overview:
      "PLATO's goal is the one target that has stayed out of reach: an Earth-sized planet in the habitable zone of a Sun-like star, seen well enough to be believed. Rather than one large telescope it carries an array of cameras whose overlapping fields deliver both a wide view and the photometric precision such a shallow, infrequent transit demands.",
    discoveries: [
      "Designed to detect and characterise rocky planets in habitable zones around bright Sun-like stars.",
      "Will use asteroseismology to measure host star ages, and so the ages of their planets.",
      "Intended to supply well-vetted targets for later atmospheric study.",
    ],
  },
  {
    id: "ariel",
    title: "Ariel",
    date: "2029-01-01",
    agency: "ESA",
    status: "Planned",
    body: "A chemical census of a large and diverse sample of exoplanet atmospheres.",
    modelPath: "/models/ariel.glb",
    specs: [
      { label: "Planned launch", value: "2029" },
      { label: "Orbit", value: "Sun-Earth L2" },
      { label: "Telescope", value: "Elliptical, roughly 1.1 × 0.7 m" },
      { label: "Method", value: "Transit and eclipse spectroscopy" },
    ],
    overview:
      "Ariel shifts the question from how many planets exist to what they are made of. It is designed to survey the atmospheres of around a thousand known exoplanets in a consistent way, so that composition can be compared across a large population rather than inferred from a handful of well-studied individuals.",
    discoveries: [
      "Will conduct the first large-scale, uniform survey of exoplanet atmospheric chemistry.",
      "Aims to connect atmospheric composition to how and where planets formed.",
      "Targets a broad range, from hot Jupiters to warm super-Earths.",
    ],
  },
];
