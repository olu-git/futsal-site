import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "../supabase/config";
import { withAdminTimeout } from "./auth";

export class PasswordRecoveryError extends Error {}

export const INVALID_RECOVERY = "This recovery link is invalid or has expired. Request a new password recovery email.";

export function createRecoveryClient() {
  const { url, publishableKey } = getSupabaseConfig();
  return createClient(url, publishableKey, { auth: {
    storageKey: "fis-password-recovery",
    persistSession: false, autoRefreshToken: false, detectSessionInUrl: false,
  } });
}

async function verifiedAdmin(client: SupabaseClient): Promise<string> {
  const { data: { user }, error } = await withAdminTimeout(() => client.auth.getUser());
  if (error || !user) throw new PasswordRecoveryError(INVALID_RECOVERY);
  const { data: isAdmin, error: adminError } = await withAdminTimeout(() => client.rpc("is_fis_admin"));
  if (adminError) throw new PasswordRecoveryError("Unable to verify administrator access. Open a new recovery link and try again.");
  if (isAdmin !== true) throw new PasswordRecoveryError("This account does not have FIS administrator access.");
  return user.id;
}

// Never fall back to a normal, previously stored login session.
export async function beginPasswordRecovery(client: SupabaseClient, url: URL): Promise<string> {
  const hash = new URLSearchParams(url.hash.slice(1));
  const query = url.searchParams;
  if ([hash, query].some(params => params.has("error") || params.has("error_code") || params.has("error_description"))) {
    throw new PasswordRecoveryError(INVALID_RECOVERY);
  }
  const result = hash.get("type") === "recovery" && hash.get("access_token") && hash.get("refresh_token")
    ? await withAdminTimeout(() => client.auth.setSession({ access_token: hash.get("access_token")!, refresh_token: hash.get("refresh_token")! }), 15000)
    : query.get("type") === "recovery" && query.get("token_hash")
      ? await withAdminTimeout(() => client.auth.verifyOtp({ type: "recovery", token_hash: query.get("token_hash")! }), 15000)
      : null;
  if (!result || result.error || !result.data.session) throw new PasswordRecoveryError(INVALID_RECOVERY);
  return verifiedAdmin(client);
}

export async function saveRecoveredPassword(client: SupabaseClient, userId: string, password: string): Promise<void> {
  if (password.length < 8 || !password.trim()) throw new PasswordRecoveryError("Use a password of at least 8 characters.");
  if (await verifiedAdmin(client) !== userId) throw new PasswordRecoveryError(INVALID_RECOVERY);
  const { error } = await withAdminTimeout(() => client.auth.updateUser({ password }), 15000);
  if (error) throw new PasswordRecoveryError(error.code === "weak_password"
    ? "Choose a stronger password that meets the account's password requirements."
    : "Unable to update the password. Your session may have expired; open a new recovery link and try again.");
}
