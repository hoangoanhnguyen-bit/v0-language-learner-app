import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

/**
 * Creates a Supabase server client for use in Server Components and Route Handlers.
 * Always create a new client within each function - don't use global variables.
 */
export async function createClient() {
  const cookieStore = await cookies()

  // Get the auth token from cookies
  const authToken = cookieStore.get("sb-access-token")?.value

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    },
  })
}
