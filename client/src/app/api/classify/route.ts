// Server-side Gemini call, so the API keys (from client/.env) never reach the browser.
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Comma-separated lists; GEMINI_API_KEY / GEMINI_MODEL still work for a single value
const list = (many?: string, one?: string) =>
  (many || one || "").split(",").map((s) => s.trim()).filter(Boolean);
const KEYS = list(process.env.GEMINI_API_KEYS, process.env.GEMINI_API_KEY);
const MODELS = list(process.env.GEMINI_MODELS, process.env.GEMINI_MODEL || "gemini-2.5-flash");

const prompt = (stats: Record<string, number>) => `
You are an astrophysicist talking to children.
The following dictionary represents approximate color percentages used in a drawing of a planet:
${JSON.stringify(stats)}

Classify the planet into one of these categories and provide a fun, engaging description:
1. Terrestrial - "Rocky Planet Explorer!" (mostly browns/greens/grays, Earth-like)
2. Super Earth - "Super Earth Discovered!" (larger rocky planets with extreme variations)
3. Neptune-like - "Ice Giant Wizard!" (dominant blues, aqua, cool tones)
4. Gas Giants - "Gas Giant Masterpiece!" (dominant yellows, oranges, reds, stripes)
5. Unknown - "Mysterious Space Object!" (doesn't match known categories)

Only respond with the exact category name from above.
`;

// Gemini sometimes adds the tagline ('Terrestrial - "Rocky Planet Explorer!"'), so map any reply
// onto one exact category; longer names first so "Super Earth" isn't mistaken for something shorter
const CATEGORIES = ["Neptune-like", "Super Earth", "Gas Giants", "Terrestrial", "Unknown"];
const toCategory = (reply: string) => {
  const text = reply.toLowerCase();
  return CATEGORIES.find((c) => text.includes(c.toLowerCase())) ?? "Unknown";
};

// Try every model with every key, so one exhausted key or retired model doesn't break the page
async function ask(text: string) {
  let lastErr: unknown;
  for (const model of MODELS) {
    for (const key of KEYS) {
      try {
        const res = await new GoogleGenerativeAI(key).getGenerativeModel({ model }).generateContent(text);
        return res.response.text().trim();
      } catch (err) {
        lastErr = err;
        console.warn(`Gemini ${model} failed with key …${key.slice(-4)}:`, (err as Error).message?.slice(0, 120));
      }
    }
  }
  throw lastErr;
}

export async function POST(req: Request) {
  // Only signed-in users may spend the Gemini quota
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  if (!KEYS.length) return NextResponse.json({ error: "GEMINI_API_KEYS is not set" }, { status: 500 });

  const { stats } = await req.json();
  try {
    return NextResponse.json({ label: toCategory(await ask(prompt(stats ?? {}))) });
  } catch (err) {
    console.error("Gemini classification error:", err);
    return NextResponse.json({ error: "Gemini request failed" }, { status: 502 });
  }
}
