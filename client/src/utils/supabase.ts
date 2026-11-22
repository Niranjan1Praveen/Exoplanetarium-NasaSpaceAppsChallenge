"use client";
// Supabase client that signs requests with the user's Clerk session token, so RLS knows who they are.
import { useMemo } from "react";
import { useSession } from "@clerk/nextjs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

export function useSupabase(): SupabaseClient {
  const { session } = useSession();
  // A fresh Clerk token is fetched for every request, so expiry is handled for us
  return useMemo(
    () => createClient(URL, KEY, { accessToken: async () => (await session?.getToken()) ?? null }),
    [session]
  );
}

// Saving history should never break the page, so failures are only logged
export async function saveRow(db: SupabaseClient, table: string, row: Record<string, unknown>) {
  const { error } = await db.from(table).insert(row);
  if (error) console.warn(`Could not save to ${table}:`, error.message);
}
