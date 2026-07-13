/**
 * Client Supabase pour les Server Components et Server Actions.
 *
 * Utilise les cookies de la requête Next.js pour maintenir la session.
 * À appeler UNIQUEMENT côté serveur (Server Components, Server Actions, Route Handlers).
 *
 * Le client est mis en cache via React `cache()` pour n'être créé qu'une seule fois
 * par requête, même si `createServerClient()` est appelé plusieurs fois.
 *
 * @module lib/supabase/server
 */

import { cache } from "react";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

/**
 * Crée un client Supabase côté serveur avec gestion des cookies.
 * Utilise React `cache()` pour réutiliser la même instance dans le scope d'une requête.
 *
 * @example
 * ```ts
 * // Dans un Server Component
 * const supabase = await createServerClient();
 * const { data } = await supabase.from('events').select();
 * ```
 */
export const createServerClient = cache(async () => {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Record<string, unknown>)
            );
          } catch {
            // Ignoré si appelé depuis un Server Component.
            // Le middleware rafraîchira la session.
          }
        },
      },
    }
  );
});
