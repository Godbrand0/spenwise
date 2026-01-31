import { createServerClient as createSSRServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Create a Supabase client for server-side usage
export async function createServerClient() {
  console.log("Creating server-side Supabase client...");
  console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  const cookieStore = await cookies();

  try {
    // Use service role key for admin operations if available, otherwise fall back to anon key
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Simple log to indicate key type without exposing it
    // console.log("Using key type:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : "anon");

    const client = createSSRServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      key,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    );
    // console.log("Server-side Supabase client created successfully");
    return client;
  } catch (error) {
    console.error("Error creating server-side Supabase client:", error);
    throw error;
  }
}
