/**
 * Client Supabase pour les Client Components (navigateur).
 *
 * Utilise createBrowserClient de @supabase/ssr.
 * À appeler UNIQUEMENT côté client (composants React avec "use client").
 *
 * @module lib/supabase/client
 */

import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Retourne une instance singleton du client Supabase côté navigateur.
 *
 * @example
 * ```ts
 * "use client";
 * import { createClient } from "@/lib/supabase/client";
 *
 * const supabase = createClient();
 * const { data } = await supabase.from('events').select();
 * ```
 */
export function createClient() {
  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  return client;
}
