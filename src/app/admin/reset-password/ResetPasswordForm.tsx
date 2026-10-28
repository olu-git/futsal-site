"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { beginPasswordRecovery, createRecoveryClient, PasswordRecoveryError, saveRecoveredPassword } from "@/lib/admin/password-recovery";
import { withAdminTimeout } from "@/lib/admin/auth";

type Recovery = { client: ReturnType<typeof createRecoveryClient>; userId: string };

export default function ResetPasswordForm() {
  const attempt = useRef<Promise<Recovery> | null>(null);
  const recovery = useRef<Recovery | null>(null);
  const [state, setState] = useState<"checking" | "ready" | "saving" | "done" | "invalid">("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    // Retain one attempt through Strict Mode; don't redeem a one-use link twice.
    if (!attempt.current) {
      const url = new URL(window.location.href);
      window.history.replaceState(window.history.state, "", window.location.pathname);
      attempt.current = (async () => {
        const client = createRecoveryClient();
        const userId = await beginPasswordRecovery(client, url);
        return { client, userId };
      })();
    }
    void attempt.current.then(value => {
      if (active) { recovery.current = value; setState("ready"); }
    }).catch(caught => {
      if (active) { setError(caught instanceof PasswordRecoveryError
        ? caught.message : "Unable to verify this recovery link. Open a new recovery email and try again."); setState("invalid"); }
    });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state !== "ready" || !recovery.current) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const password = String(values.get("password") ?? "");
    if (password !== values.get("confirmPassword")) { setError("The passwords do not match."); return; }
    setState("saving"); setError("");
    try {
      const { client, userId } = recovery.current;
      await saveRecoveredPassword(client, userId, password);
      // Password success must not be reported as failure if logout is unavailable.
      await withAdminTimeout(() => client.auth.signOut({ scope: "local" })).catch(() => {});
      recovery.current = null;
      attempt.current = null;
      form.reset();
      setState("done");
    } catch (caught) {
      setError(caught instanceof PasswordRecoveryError ? caught.message : "Unable to update the password. Check your connection and try again.");
      setState("ready");
    }
  }

  if (state === "checking") return <p role="status">Checking your recovery link...</p>;
  if (state === "done") return <><p role="status">Your password has been updated. Sign in with your new password.</p><Link className="text-link" href="/admin/login/">Go to admin login</Link></>;
  if (state === "invalid") return <><p className="admin-auth-error" role="alert">{error}</p><Link className="text-link" href="/admin/login/">Go to admin login</Link></>;
  return <form className="admin-login-form" onSubmit={submit}>
    <div className="field"><label htmlFor="new-password">New password</label><input id="new-password" name="password" type="password" autoComplete="new-password" minLength={8} required disabled={state === "saving"} /></div>
    <div className="field"><label htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required disabled={state === "saving"} /></div>
    {error && <p className="admin-auth-error" role="alert">{error}</p>}
    <button className="admin-submit" type="submit" disabled={state === "saving"}>{state === "saving" ? "Updating password..." : "Update password"}</button>
  </form>;
}
