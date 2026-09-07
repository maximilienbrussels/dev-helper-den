import { createFileRoute } from "@tanstack/react-router";

import { usePortal } from "@/lib/portal-store";
import { locationName } from "@/lib/portal-data";

export const Route = createFileRoute("/veld/diensten")({
  head: () => ({
    meta: [
      { title: "Diensten — Maximilien veld-app" },
      { name: "description", content: "Actieve diensten en tarieven van de stadsboerderij." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Diensten — Maximilien veld-app" },
      { property: "og:description", content: "Actieve diensten en tarieven van de stadsboerderij." },
    ],
  }),
  component: FieldServices,
});

function FieldServices() {
  const { services, lang } = usePortal();
  const active = services.filter((s) => s.active);

  const title = (s: (typeof services)[number]) =>
    lang === "fr" ? s.title_fr : lang === "en" ? s.title_en : s.title_nl;
  const desc = (s: (typeof services)[number]) =>
    lang === "fr" ? s.desc_fr : lang === "en" ? s.desc_en : s.desc_nl;

  return (
    <div className="space-y-4">
      <h1 className="pt-1 text-2xl font-bold">Diensten</h1>
      {active.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Geen actieve diensten.
        </p>
      ) : (
        <ul className="space-y-3">
          {active.map((s) => (
            <li key={s.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-base font-semibold">{title(s)}</p>
                <span className="shrink-0 text-base font-bold">€ {s.price}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{locationName(s.location_id)}</p>
              {desc(s) && <p className="mt-2 text-sm leading-relaxed">{desc(s)}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
