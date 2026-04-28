import type { PermissionString, User } from "@/types";

// All resources currently in the catalogue. Kept in sync with
// backend/database/seeders/PermissionSeeder.php. Useful for autocomplete
// at call sites; the helpers themselves accept any string so newly seeded
// resources keep working without a frontend deploy.
export type Resource =
  | "user"
  | "role"
  | "product"
  | "category"
  | "unit"
  | "supplier"
  | "purchase_order"
  | "warehouse"
  | "notification"
  | "report";

export type Action = "view" | "create" | "edit" | "delete" | "receive";

const toKey = (action: string, resource: string): PermissionString =>
  `${action}:${resource}` as PermissionString;

/**
 * Check whether the user holds (`action`, `resource`). Returns false for
 * unauthenticated users and for users whose payload predates the
 * `permissions` field (defensive: missing array === no perms).
 */
export const can = (
  user: User | null | undefined,
  action: Action | string,
  resource: Resource | string,
): boolean => {
  if (!user || !Array.isArray(user.permissions)) return false;
  return user.permissions.includes(toKey(action, resource));
};

/**
 * True if the user holds at least one of the supplied permissions. Useful
 * for "render this section if they can do anything in it" checks (e.g. the
 * Settings sidebar group).
 */
export const canAny = (
  user: User | null | undefined,
  perms: ReadonlyArray<readonly [Action | string, Resource | string]>,
): boolean => {
  if (!user || !Array.isArray(user.permissions)) return false;
  return perms.some(([action, resource]) =>
    user.permissions.includes(toKey(action, resource)),
  );
};

/**
 * True only if the user holds every supplied permission.
 */
export const canAll = (
  user: User | null | undefined,
  perms: ReadonlyArray<readonly [Action | string, Resource | string]>,
): boolean => {
  if (!user || !Array.isArray(user.permissions)) return false;
  return perms.every(([action, resource]) =>
    user.permissions.includes(toKey(action, resource)),
  );
};
