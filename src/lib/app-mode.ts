/**
 * Omgevingsgebaseerde app-modus.
 *
 * Prioriteit:
 *  1. `VITE_APP_MODE` ("public" | "admin" | "field") — vaste bundel in productie.
 *  2. Hostname: `maximilien.site` → "admin", `maximilien.app` → "field".
 *  3. `?mode=admin` / `?mode=public` / `?mode=field` in de URL (preview/dev).
 *  4. localStorage-override (dev toggle), anders "public".
 *
 * SSR-veilig: op de server tellen alleen env, hostname en query (uit de request),
 * zodat de server-HTML deterministisch blijft.
 */
import { isPortalPath } from "./portal-routes";

export type AppMode = "public" | "admin" | "field";

export const APP_MODE_STORAGE_KEY = "app:mode-override";

/** Hostname van het admin-portaal (wordt ook als suffix herkend: www.maximilien.site). */
export const ADMIN_HOSTNAME = "maximilien.site";

/** Hostname van de veld-app (PWA voor medewerkers op het terrein). */
export const FIELD_HOSTNAME = "maximilien.app";

function normalize(value: string | null | undefined): AppMode | null {
  if (value === "public" || value === "admin" || value === "field") return value;
  return null;
}

/** Modus uit de build-time omgeving (undefined in Lovable preview / lokaal). */
export function getEnvAppMode(): AppMode | null {
  return normalize(import.meta.env["VITE_APP_MODE"] as string | undefined);
}

function matchesHost(hostname: string | null | undefined, base: string): boolean {
  if (!hostname) return false;
  const host = hostname.trim().toLowerCase().replace(/:\d+$/, "");
  return host === base || host.endsWith(`.${base}`);
}

/** True voor maximilien.site en alle subdomeinen ervan. */
export function isAdminHostname(hostname: string | null | undefined): boolean {
  return matchesHost(hostname, ADMIN_HOSTNAME);
}

/** True voor maximilien.app en alle subdomeinen ervan. */
export function isFieldHostname(hostname: string | null | undefined): boolean {
  return matchesHost(hostname, FIELD_HOSTNAME);
}

/**
 * Deterministische detectie op basis van env → hostname → query.
 * Wordt zowel op de server (request-URL) als in de browser gebruikt.
 */
export function detectAppMode(hostname: string | null | undefined, search = ""): AppMode {
  const envMode = getEnvAppMode();
  if (envMode) return envMode;
  if (isFieldHostname(hostname)) return "field";
  if (isAdminHostname(hostname)) return "admin";
  const fromQuery = normalize(new URLSearchParams(search).get("mode"));
  if (fromQuery) return fromQuery;
  return "public";
}

/** Deterministische modus voor SSR zonder request-context en voor de eerste client-render. */
export function getServerAppMode(): AppMode {
  return getEnvAppMode() ?? "public";
}

/** Volledige resolutie, alleen te gebruiken na hydratie. */
export function resolveAppMode(): AppMode {
  const envMode = getEnvAppMode();
  if (envMode) return envMode;
  if (typeof window === "undefined") return "public";

  if (isFieldHostname(window.location.hostname)) return "field";
  if (isAdminHostname(window.location.hostname)) return "admin";

  const fromQuery = normalize(new URLSearchParams(window.location.search).get("mode"));
  if (fromQuery) {
    try {
      window.localStorage.setItem(APP_MODE_STORAGE_KEY, fromQuery);
    } catch {
      /* private mode / quota */
    }
    return fromQuery;
  }

  try {
    const stored = normalize(window.localStorage.getItem(APP_MODE_STORAGE_KEY));
    if (stored) return stored;
  } catch {
    /* geen storage beschikbaar */
  }

  return "public";
}

/** Auth-flows moeten in élke modus kunnen renderen (mail-links, herstel …). */
const AUTH_PATH_PREFIXES = [
  "/auth",
  "/api",
  "/wachtwoord-herstellen",
  "/wachtwoord-vergeten",
  "/reset-password",
  "/inloglink",
  "/bevestigen",
];

/**
 * Paden die in admin-modus mogen renderen. Alles daarbuiten (publieke
 * marketingroutes zoals /nl, /fr, /webshop …) wordt naar /auth gestuurd.
 */
const ADMIN_PATH_PREFIXES = [
  ...AUTH_PATH_PREFIXES,
  "/portaal",
  "/vandaag",
  "/aanvragen",
  "/kalender",
  "/diensten",
  "/team",
  "/foutmeldingen",
];

/** Paden van de veld-app (maximilien.app). */
const FIELD_PATH_PREFIXES = [...AUTH_PATH_PREFIXES, "/veld"];

function isFile(path: string): boolean {
  // Bestanden (sitemap.xml, manifest.json, …) laten we met rust.
  return /\.[a-z0-9]+$/i.test(path);
}

export function isAdminPath(pathname: string): boolean {
  const path = pathname || "/";
  if (isFile(path)) return true;
  if (isPortalPath(path)) return true;
  return ADMIN_PATH_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

/** True wanneer het pad tot de veld-app hoort. */
export function isFieldPath(pathname: string): boolean {
  const path = pathname || "/";
  if (isFile(path)) return true;
  return FIELD_PATH_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

/** Startpad per modus (waar een verdwaalde bezoeker naartoe gaat). */
export function homePathFor(mode: AppMode): string {
  if (mode === "field") return "/veld";
  if (mode === "admin") return "/auth";
  return "/";
}

/** Zet de dev-override en herlaadt zodat de juiste bundel geladen wordt. */
export function setAppModeOverride(mode: AppMode) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(APP_MODE_STORAGE_KEY, mode);
  } catch {
    /* negeren */
  }
  const url = new URL(window.location.href);
  url.searchParams.set("mode", mode);
  // Publieke paden bestaan niet in admin-/veld-modus: start dan op de juiste plek.
  if (mode === "admin" && !isAdminPath(url.pathname)) url.pathname = "/auth";
  if (mode === "field" && !isFieldPath(url.pathname)) url.pathname = "/veld";
  window.location.replace(url.toString());
}

/** True wanneer de modus niet vastligt in de omgeving of hostname (preview/dev). */
export function isAppModeSwitchable(): boolean {
  if (getEnvAppMode() !== null || !import.meta.env.DEV) return false;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (isAdminHostname(host) || isFieldHostname(host)) return false;
  }
  return true;
}
