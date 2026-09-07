/**
 * Eén centrale rechtencontrole voor het volledige beheerportaal (server-only).
 *
 * Volgorde van beslissen:
 *  1. Vaste eigenaars (e-mailadressen in `superadmin.ts`) → alle rechten
 *     (en de ontbrekende databaserijen worden meteen aangemaakt).
 *  2. Rollen in `user_roles`: `owner`, `eigenaar` of `super_admin` → alle rechten.
 *  3. Actieve rij in `portal_admins` met rol `admin` → alle rechten.
 *  4. Anders: de rechtenmatrix (`role_permissions`).
 *
 * Zo krijgt een eigenaar nooit meer een onterechte "Je hebt geen rechten".
 */
import { isSuperAdminEmail } from "@/lib/superadmin";

export type PermissionContext = {
  userId: string;
  claims?: unknown;
};

/** Alle schrijfwijzen die als "volledige toegang" gelden. */
const FULL_ACCESS_ROLES = ["owner", "eigenaar", "super_admin", "superadmin", "super-admin"];

export const PERMISSION_DENIED = "Je hebt geen rechten voor deze actie.";

/** Echte rechtenweigering — alleen hierop mag een route 403 antwoorden. */
export class PermissionDeniedError extends Error {
  readonly code = "permission_denied";
  constructor(message = PERMISSION_DENIED) {
    super(message);
    this.name = "PermissionDeniedError";
  }
}

export function isPermissionDenied(error: unknown): boolean {
  if (error instanceof PermissionDeniedError) return true;
  return error instanceof Error && error.message === PERMISSION_DENIED;
}

function normalizeRole(role: string): string {
  return role.trim().toLowerCase();
}

function isFullAccessRole(role: string): boolean {
  return FULL_ACCESS_ROLES.includes(normalizeRole(role));
}

function claimEmail(claims: unknown): string | null {
  const email = (claims as { email?: string | null } | null)?.email;
  return email ? email.trim().toLowerCase() : null;
}

async function sql() {
  const { db } = await import("@/lib/neon.server");
  return db();
}

/** E-mailadres van de ingelogde gebruiker (token, anders het profiel). */
export async function resolveUserEmail(context: PermissionContext): Promise<string | null> {
  const fromToken = claimEmail(context.claims);
  if (fromToken) return fromToken;
  if (!context.userId) return null;
  try {
    const rows = (await (await sql())`
      select email from profiles where id = ${context.userId}::uuid limit 1
    `) as Array<{ email: string | null }>;
    const email = rows[0]?.email;
    return email ? email.trim().toLowerCase() : null;
  } catch {
    return null;
  }
}

/** Rollen uit `user_roles` (leeg bij databaseproblemen). */
async function loadRoles(userId: string): Promise<string[]> {
  if (!userId) return [];
  try {
    const rows = (await (await sql())`
      select role::text as role from user_roles where user_id = ${userId}::uuid
    `) as Array<{ role: string }>;
    return rows.map((r) => normalizeRole(r.role));
  } catch {
    return [];
  }
}

export type AccessSnapshot = {
  email: string | null;
  userId: string;
  roles: string[];
  isFixedOwner: boolean;
  isPortalAdmin: boolean;
  fullAccess: boolean;
};

/** Volledig beeld van de toegang van deze sessie (voor diagnose én controle). */
export async function resolveAccess(context: PermissionContext): Promise<AccessSnapshot> {
  const email = await resolveUserEmail(context);
  const isFixedOwner = isSuperAdminEmail(email);

  if (isFixedOwner && email) {
    // Zelfherstellend: maak de ontbrekende rijen aan zodat database en
    // eigenaarslijst niet uit elkaar kunnen lopen.
    try {
      const { ensureSuperAdmin } = await import("@/lib/superadmin.server");
      await ensureSuperAdmin(email, context.userId || null);
    } catch {
      /* toegang blijft gelden op basis van het e-mailadres */
    }
  }

  const roles = await loadRoles(context.userId);

  let isPortalAdmin = false;
  if (email) {
    try {
      const rows = (await (await sql())`
        select role, active from portal_admins where lower(email) = ${email} limit 1
      `) as Array<{ role: string; active: boolean }>;
      const row = rows[0];
      isPortalAdmin = Boolean(row?.active && normalizeRole(row.role) === "admin");
    } catch {
      isPortalAdmin = false;
    }
  }

  const fullAccess = isFixedOwner || isPortalAdmin || roles.some(isFullAccessRole);
  return { email, userId: context.userId, roles, isFixedOwner, isPortalAdmin, fullAccess };
}

/** True wanneer de gebruiker eigenaar/super-admin is (alle rechten). */
export async function isFullAccessUser(context: PermissionContext): Promise<boolean> {
  return (await resolveAccess(context)).fullAccess;
}

/** Alle toegekende rechten uit de matrix voor deze rollen (leeg bij fouten). */
export async function loadGrantedPermissions(roles: string[]): Promise<string[]> {
  if (roles.length === 0) return [];
  try {
    const rows = (await (await sql())`
      select distinct permission from role_permissions
      where allowed and lower(role::text) = any(${roles})
    `) as Array<{ permission: string }>;
    return rows.map((r) => r.permission);
  } catch {
    return [];
  }
}

/** Heeft deze gebruiker (minstens één van) de gevraagde rechten? */
export async function hasAnyPermission(
  context: PermissionContext,
  permissions: string[],
): Promise<boolean> {
  const access = await resolveAccess(context);
  if (access.fullAccess) return true;
  if (access.roles.length === 0 || permissions.length === 0) return false;
  try {
    const rows = (await (await sql())`
      select 1 from role_permissions
      where allowed and permission = any(${permissions}) and lower(role::text) = any(${access.roles})
      limit 1
    `) as unknown[];
    return rows.length > 0;
  } catch {
    return false;
  }
}

/** Heeft deze gebruiker het gevraagde recht? */
export async function hasPermission(
  context: PermissionContext,
  permission: string,
): Promise<boolean> {
  return hasAnyPermission(context, [permission]);
}

/** Werpt een duidelijke fout wanneer het recht ontbreekt. */
export async function assertPermission(context: PermissionContext, permission: string) {
  if (await hasPermission(context, permission)) return;
  throw new PermissionDeniedError();
}

/** Werpt wanneer géén van de opgegeven rechten aanwezig is. */
export async function assertAnyPermission(context: PermissionContext, permissions: string[]) {
  if (await hasAnyPermission(context, permissions)) return;
  throw new PermissionDeniedError();
}

/**
 * Rechten die volstaan om beelden op te laden of te kiezen. Wie inhoud,
 * producten, academie of diensten mag beheren, moet ook beelden kunnen plaatsen.
 */
export const UPLOAD_PERMISSIONS = [
  "manage_media",
  "manage_content",
  "manage_products",
  "manage_academy",
  "manage_services",
  "manage_settings",
  "manage_team",
] as const;
