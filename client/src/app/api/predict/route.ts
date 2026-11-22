// Runs a prediction on the Flask classifier, then saves it to Supabase as the signed-in user.
// Both steps happen on the server, so the browser can't fake who made a prediction or what it said.
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { serverSupabase } from "@/utils/supabaseServer";

const API = process.env.NEXT_PUBLIC_CLASSIFIER_URL;

export async function POST(req: Request) {
  const { userId, getToken } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  if (!API) return NextResponse.json({ error: "NEXT_PUBLIC_CLASSIFIER_URL is not set" }, { status: 500 });

  // Ask the model
  let res: Response;
  try {
    res = await fetch(`${API}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await req.json()),
    });
  } catch {
    return NextResponse.json({ error: "Classifier service is not reachable" }, { status: 502 });
  }
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  // Keep a history row; a failed save shouldn't hide the prediction
  const db = serverSupabase(await getToken());
  const { error } = await db.from("predictions").insert({ inputs: data.inputs, label: data.label, probs: data.probs });
  return NextResponse.json({ ...data, saved: !error, saveError: error?.message });
}
