import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Monitor, RefreshCw } from "lucide-react";

import { neonSupabaseCompat as supabase } from "@/lib/neon-auth-compat";
import { usePortal } from "@/lib/portal-store";
import { getAdminUrl } from "@/lib/urls";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/veld/meer")({
  head: () => ({
    meta: [
      { title: "Meer — Maximilien veld-app" },
      { name: "description", content: "Profiel, taal en afmelden in de veld-app van de stadsboerderij." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Meer — Maximilien veld-app" },
      { property: "og:description", content: "Profiel, taal en afmelden in de veld-app van de stadsboerderij." },
    ],
  }),
  component: FieldMore,
});

function FieldMore() {
  const { currentUser } = usePortal();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-4">
      <h1 className="pt-1 text-2xl font-bold">Meer</h1>

      <section className="rounded-xl border border-border bg-card p-4">
        <p className="text-base font-semibold">{currentUser.name}</p>
        <p className="text-sm text-muted-foreground">{currentUser.email}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
          {currentUser.role === "admin" ? "Beheerder" : "Team"}
        </p>
      </section>

      <a
        href={getAdminUrl("/portaal")}
        className="flex h-14 items-center justify-center gap-2 rounded-xl border border-border bg-card text-base font-semibold"
      >
        <Monitor className="h-5 w-5" aria-hidden /> Volledig beheer openen
      </a>

      <Button
        type="button"
        variant="secondary"
        className="h-14 w-full text-base"
        onClick={() => window.location.reload()}
      >
        <RefreshCw className="mr-2 h-5 w-5" aria-hidden /> Gegevens vernieuwen
      </Button>

      <Button type="button" variant="destructive" className="h-14 w-full text-base" onClick={signOut}>
        <LogOut className="mr-2 h-5 w-5" aria-hidden /> Afmelden
      </Button>
    </div>
  );
}
