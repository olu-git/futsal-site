import type { Session } from "@supabase/supabase-js";

export type AdminAccess = "loading" | "unauthenticated" | "denied" | "authorised" | "unavailable";

export function resolveAdminAccess(session: Session | null, isAdmin: boolean | null, rpcFailed = false): AdminAccess {
  if (!session?.user) return "unauthenticated";
  if (rpcFailed) return "unavailable";
  return isAdmin ? "authorised" : "denied";
}

export function safeAdminReturnPath(value: string | null | undefined) {
  return value?.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}
