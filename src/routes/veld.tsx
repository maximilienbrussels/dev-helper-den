import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Inbox, MoreHorizontal, QrCode, Sprout } from "lucide-react";

import { neonSupabaseCompat as supabase } from "@/lib/neon-auth-compat";
import { checkPortalAccess } from "@/lib/portal-access.functions";
import { PortalProvider } from "@/lib/portal-store";
import { cn } from "@/lib/utils";

/**
 * Veld-app (maximilien.app): lichte schermen voor medewerkers op het terrein.
 * Dezelfde aanmelding en dezelfde databank als het beheerportaal.
 */
export const Route = createFileRoute("/veld")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    const access = await checkPortalAccess().catch(() => null);
    if (!access?.allowed) throw redirect({ to: "/auth" });
    return { user: data.user, portalRole: access.role };
  },
  component: FieldLayout,
});

const TABS = [
  { to: "/veld", label: "Vandaag", Icon: CalendarDays, exact: true },
  { to: "/veld/aanvragen", label: "Aanvragen", Icon: Inbox },
  { to: "/veld/scanner", label: "Scan", Icon: QrCode, center: true },
  { to: "/veld/diensten", label: "Diensten", Icon: Sprout },
  { to: "/veld/meer", label: "Meer", Icon: MoreHorizontal },
] as const;

function FieldLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <PortalProvider>
      <div className="flex min-h-[100dvh] w-full max-w-full flex-col overflow-x-hidden">
        <main
          className="flex-1 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-32"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <Outlet />
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur print:hidden">
          <ul className="mx-auto flex max-w-lg items-stretch justify-between">
            {TABS.map(({ to, label, Icon, ...rest }) => {
              const exact = "exact" in rest && rest.exact;
              const active = exact ? pathname === to : pathname.startsWith(to);
              const center = "center" in rest && rest.center;
              return (
                <li key={to} className="flex-1">
                  <Link
                    to={to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-[64px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center rounded-full transition-colors",
                        center
                          ? "-mt-6 h-14 w-14 bg-primary text-primary-foreground shadow-lg"
                          : "h-8 w-8",
                        !center && active && "bg-primary/10",
                      )}
                    >
                      <Icon className={center ? "h-7 w-7" : "h-5 w-5"} aria-hidden />
                    </span>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </PortalProvider>
  );
}
