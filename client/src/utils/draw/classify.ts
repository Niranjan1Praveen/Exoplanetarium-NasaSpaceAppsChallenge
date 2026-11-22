// Asks our /api/classify route (which talks to Gemini) for the planet type, and holds the kid-friendly replies.
import type { ColorStats } from "./colors";

export const ERROR_LABEL = "Error classifying planet.";

// Returns the category name, or ERROR_LABEL if anything goes wrong
export async function classifyPlanet(stats: ColorStats): Promise<string> {
  try {
    const res = await fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stats }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? res.statusText);
    return data.label;
  } catch (err) {
    console.error("Gemini classification error:", err);
    return ERROR_LABEL;
  }
}

type Msg = { title: string; message: string };

const MESSAGES: Record<string, Msg> = {
  Terrestrial: {
    title: "🌍 Rocky Planet Explorer!",
    message: "Wow! You've created a rocky planet just like Earth! This could be home to alien mountains, valleys, and maybe even space creatures! Perfect for future space explorers to visit!",
  },
  "Super Earth": {
    title: "🪐 Super Earth Discovered!",
    message: "Amazing! You've discovered a Super Earth - a giant rocky planet with super cool landscapes! It might have enormous canyons and mega volcanoes. What an incredible find!",
  },
  "Neptune-like": {
    title: "🔮 Ice Giant Wizard!",
    message: "Brilliant! You've painted a beautiful ice giant with swirling blue magic! This planet has super winds and mysterious deep oceans. You're a cosmic artist!",
  },
  "Gas Giants": {
    title: "🎨 Gas Giant Masterpiece!",
    message: "Spectacular! You've created a majestic gas giant with colorful swirling storms! This giant planet has no solid ground - it's like a giant space cloud painting!",
  },
  Unknown: {
    title: "🚀 Mysterious Space Object!",
    message: "Whoa! You've discovered something completely new and mysterious! Even our smartest space scientists haven't seen anything like this before. You're a true space pioneer! Want to try creating a different kind of planet?",
  },
  [ERROR_LABEL]: {
    title: "🛰️ Signal Lost!",
    message: "Oops! Our space scanners are having trouble reading your amazing creation. The cosmic dust might be interfering! Please try again, space artist!",
  },
};

const FALLBACK: Msg = {
  title: "🌌 Cosmic Creation!",
  message: "You've made something truly special in space! Keep exploring and creating amazing planets!",
};

export const messageFor = (label: string) => MESSAGES[label] ?? FALLBACK;
