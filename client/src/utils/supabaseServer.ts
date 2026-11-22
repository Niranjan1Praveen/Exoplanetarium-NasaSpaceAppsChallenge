// Server-side Supabase client acting as the user whose Clerk token is passed in (RLS still applies).
import { createClient } from "@supabase/supabase-js";

export function serverSupabase(token: string | null) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!, {
    accessToken: async () => token,
  });
}
