import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, Mail, Phone, Users } from "lucide-react";

import { usePortal } from "@/lib/portal-store";
import { locationName } from "@/lib/portal-data";
import type { BookingStatus } from "@/lib/portal-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/veld/aanvragen")({
  head: () => ({
    meta: [
      { title: "Aanvragen — Maximilien veld-app" },
      { name: "description", content: "Openstaande aanvragen en boekingen van de stadsboerderij." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Aanvragen — Maximilien veld-app" },
      { property: "og:description", content: "Openstaande aanvragen en boekingen van de stadsboerderij." },
    ],
  }),
  component: FieldRequests,
});

const FILTERS: { value: "open" | BookingStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "nieuw", label: "Nieuw" },
  { value: "gereserveerd", label: "Bevestigd" },
  { value: "afgerond", label: "Afgerond" },
];

const OPEN_STATUSES: BookingStatus[] = ["nieuw", "in_behandeling", "offerte_verzonden", "gereserveerd"];

function FieldRequests() {
  const { bookings, setStatus } = usePortal();
  const [filter, setFilter] = useState<"open" | BookingStatus>("open");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings
      .filter((b) => b.type !== "geblokkeerd")
      .filter((b) => (filter === "open" ? OPEN_STATUSES.includes(b.status) : b.status === filter))
      .filter(
        (b) =>
          !q ||
          b.client_name.toLowerCase().includes(q) ||
          (b.client_org ?? "").toLowerCase().includes(q) ||
          b.client_email.toLowerCase().includes(q),
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [bookings, filter, query]);

  return (
    <div className="space-y-4">
      <h1 className="pt-1 text-2xl font-bold">Aanvragen</h1>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Zoek op naam of e-mail"
        className="h-12 text-base"
        inputMode="search"
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold",
              filter === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Geen aanvragen in deze lijst.
        </p>
      ) : (
        <ul className="space-y-3">
          {list.map((b) => (
            <li key={b.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-base font-semibold">{b.client_org || b.client_name}</p>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold uppercase">
                  {b.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  {b.date} · {b.start_time}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  {b.guests_count}
                </span>
                <span>{locationName(b.location_id)}</span>
              </p>

              <div className="mt-3 flex gap-2">
                {b.client_phone && (
                  <a
                    href={`tel:${b.client_phone}`}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md border border-border text-sm font-semibold"
                  >
                    <Phone className="h-4 w-4" aria-hidden /> Bellen
                  </a>
                )}
                <a
                  href={`mailto:${b.client_email}`}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md border border-border text-sm font-semibold"
                >
                  <Mail className="h-4 w-4" aria-hidden /> Mailen
                </a>
              </div>

              {OPEN_STATUSES.includes(b.status) && b.status !== "gereserveerd" && (
                <Button
                  type="button"
                  className="mt-2 h-12 w-full text-base"
                  onClick={() => setStatus(b.id, "gereserveerd")}
                >
                  Bevestigen
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
