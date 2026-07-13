/**
 * Sidebar de navigation avec sous-menu contextuel événement.
 * Responsive : fixe sur desktop, overlay sur mobile.
 *
 * @module components/layout/sidebar
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Calendar,
  LayoutGrid,
  LogOut,
  Users,
  BadgeCheck,
  Settings,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Événements", href: "/events", icon: Calendar },
  { name: "Templates", href: "/templates", icon: LayoutGrid },
];

const eventNavigation = [
  { name: "Résumé", suffix: "", icon: Settings },
  { name: "Participants", suffix: "/participants", icon: Users },
  { name: "Badges", suffix: "/badges", icon: BadgeCheck },
];

interface SidebarProps {
  userEmail?: string;
}

function extractEventId(pathname: string): string | null {
  const match = pathname.match(/^\/events\/([a-f0-9-]+)/);
  return match ? match[1] : null;
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const eventId = extractEventId(pathname);
  const isInEvent = !!eventId;

  // Fermer le menu mobile quand on navigue
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-gray-100" style={{ background: "var(--gradient-subtle)" }}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md"
            style={{ background: "var(--gradient-primary)" }}
          >
            <span className="text-white font-bold text-sm">BG</span>
          </div>
          <span className="font-bold text-lg text-gray-900">BadgeGen</span>
        </Link>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${
                  isActive
                    ? "text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
              style={isActive ? { background: "var(--gradient-primary)" } : undefined}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}

        {/* Sous-menu contextuel événement */}
        {isInEvent && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Événement
            </p>
            {eventNavigation.map((item) => {
              const href = `/events/${eventId}${item.suffix}`;
              const isActive = item.suffix === ""
                ? pathname === `/events/${eventId}`
                : pathname.startsWith(href);

              return (
                <Link
                  key={item.suffix}
                  href={href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-150
                    ${
                      isActive
                        ? "text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                  style={isActive ? { background: "var(--gradient-cool)" } : undefined}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        {userEmail && (
          <p className="text-xs text-gray-500 truncate mb-3">{userEmail}</p>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-gray-600 hover:bg-red-50 hover:text-red-600
                     transition-colors duration-150 w-full"
          aria-label="Se déconnecter"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-lg bg-white shadow-md border border-gray-200
                   flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50
                   transition-all duration-200"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex-col z-40">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />

          {/* Sidebar */}
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col animate-slide-in-left">
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center
                         text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>

            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
