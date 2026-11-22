"""Constants shared by the classifier app: inputs, sliders and class names."""

# The four values the user actually types in
INPUTS = ["orbital_period", "transit_depth", "planet_radius", "stellar_radius"]

# Raw physical columns the model saw unscaled during training
PHYSICAL = [
    "orbital_period", "transit_duration", "transit_depth", "impact_parameter",
    "eccentricity", "planet_radius", "semi_major_axis", "eq_temperature",
    "stellar_radius", "stellar_mass", "stellar_temp", "stellar_logg", "stellar_metallicity",
]

# Values we can't ask for in the UI, so we plug in sun-like/typical defaults
DEFAULTS = {
    "transit_duration": 1.0, "eccentricity": 0.0, "impact_parameter": 0.5,
    "eq_temperature": 1.0, "semi_major_axis": 1.0, "stellar_mass": 1.0,
    "stellar_temp": 5800.0, "stellar_logg": 4.44, "stellar_metallicity": 0.0,
}

CLASSES = {0: "False Positive", 1: "Candidate", 2: "Confirmed"}

# Slider ranges (with units) shown on the input form
SLIDERS = {
    "orbital_period": {"min": 0.5, "max": 50, "default": 15, "step": 0.00000000001, "unit": "days"},
    "transit_depth": {"min": 100, "max": 10000, "default": 3269, "step": 0.01, "unit": "ppm"},
    "planet_radius": {"min": 0.5, "max": 20, "default": 6, "step": 0.00001, "unit": "R⊕"},
    "stellar_radius": {"min": 0.5, "max": 2, "default": 1.05, "step": 0.00001, "unit": "R☉"},
}
