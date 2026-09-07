import { createFileRoute } from "@tanstack/react-router";
import { Check, Clock, MapPin, Users } from "lucide-react";

import { usePortal } from "@/lib/portal-store";
import { locationName, shift } from "@/lib/portal-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/veld/")({
  head: () => ({
    meta: [
      { title: "Vandaag — Maximilien veld-app" },
      { name: "description", content: "De dagplanning van de stadsboerderij voor het team op het terrein." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Vandaag — Maximilien veld-app" },
      { property: "og:description", content: "De dagplanning van de stadsboerderij voor het team op het terrein." },
    ],
  }),
  component: FieldToday,
});

function FieldToday() {
  const { bookings, toggleCheckIn, loading } = usePortal();
  const today = shift(0);

  const day = bookings
    .filter((b) => b.date === today && b.status !== "geannuleerd")
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const visitors = day
    .filter((b) => b.type !== "geblokkeerd")
    .reduce((sum, b) => sum + b.guests_count, 0);

  const dateLabel = new Date(`${today}T12:00:00`).toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-4">
      <header className="pt-1">
        <h1 className="text-2xl font-bold leading-tight">Vandaag</h1>
        <p className="text-sm capitalize text-muted-foreground">{dateLabel}</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Groepen" value={day.filter((b) => b.type !== "geblokkeerd").length} />
        <Stat label="Bezoekers" value={visitors} />
      </div>

      {loading && day.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Laden…
        </p>
      ) : day.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Geen activiteiten vandaag.
        </p>
      ) : (
        <ul className="space-y-3">
          {day.map((b) => {
            const arrived = b.day_status === "aangekomen";
            return (
              <li
                key={b.id}
                className={cn(
                  "rounded-xl border border-border bg-card p-4",
                  arrived && "border-primary/50 bg-primary/5",
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-base font-bold">
                    <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
                    {b.start_time}–{b.end_time}
                  </span>
                  <span className="text-xs text-muted-foreground">{b.status.replace(/_/g, " ")}</span>
                </div>
                <p className="mt-1 text-base font-semibold">{b.client_org || b.client_name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    {locationName(b.location_id)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    {b.guests_count}
                  </span>
                </p>
                {b.type !== "geblokkeerd" && (
                  <Button
                    type="button"
                    variant={arrived ? "secondary" : "default"}
                    className="mt-3 h-12 w-full text-base"
                    onClick={() => toggleCheckIn(b.id)}
                  >
                    <Check className="mr-2 h-5 w-5" aria-hidden />
                    {arrived ? "Aangekomen" : "Aanmelden"}
                  </Button>
                )}
                {b.client_phone && (
                  <a
                    href={`tel:${b.client_phone}`}
                    className="mt-2 flex h-11 items-center justify-center rounded-md border border-border text-sm font-semibold"
                  >
                    Bel {b.client_phone}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
