import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";

// Create a Supabase client for client-side usage
export function createBrowserClient() {
  return createSSRBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
