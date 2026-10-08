import type { Session } from "@supabase/supabase-js";

export type AdminAccess = "loading" | "unauthenticated" | "denied" | "authorised" | "unavailable";

export async function withAdminTimeout<T>(operation: () => PromiseLike<T>, timeoutMs = 8000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve().then(operation),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Administrator access check timed out.")), timeoutMs);
      }),
    ]);
  } finally { if (timer) clearTimeout(timer); }
}

export function resolveAdminAccess(session: Session | null, isAdmin: boolean | null, rpcFailed = false): AdminAccess {
  if (!session?.user) return "unauthenticated";
  if (rpcFailed) return "unavailable";
  return isAdmin ? "authorised" : "denied";
}

export function safeAdminReturnPath(value: string | null | undefined) {
  return value?.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}
