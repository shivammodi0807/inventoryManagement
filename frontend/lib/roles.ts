import { User } from "@/types";

// Sealed-role identity check. Use this only for the Admin badge / sealed-
// admin invariants. Every other gate should go through `can(action, resource)`
// from `@/lib/permissions`.
export const isAdmin = (user?: User) => user?.role?.name === "Admin";
