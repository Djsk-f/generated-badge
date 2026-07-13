/**
 * Proxy Next.js pour l'authentification Supabase.
 *
 * @module proxy
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // No-op dans le proxy - les cookies sont gérés par les Server Actions
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicPage =
    pathname === "/" ||
    pathname.startsWith("/collect") ||
    pathname.startsWith("/api/collect");

  // Routes publiques → pas d'auth requise
  if (isPublicPage) {
    // Connecté sur / → rediriger vers /dashboard
    if (user && pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Non connecté → rediriger vers / (landing page)
  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
