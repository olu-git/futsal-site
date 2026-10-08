"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { safeAdminReturnPath, withAdminTimeout } from "@/lib/admin/auth";

const INVALID_CREDENTIALS = "The email or password is incorrect.";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    async function checkExistingSession() {
      try {
        const supabase = createClient();
        const { data: { session } } = await withAdminTimeout(() => supabase.auth.getSession());
        if (!session || !active) return;
        const { data: isAdmin, error: accessError } = await withAdminTimeout(() => supabase.rpc("is_fis_admin"));
        if (accessError) throw accessError;
        if (isAdmin && active) window.location.replace(getReturnPath());
      } catch {
        if (active) setError("Unable to confirm your session. Check your connection and try again.");
      } finally {
        if (active) setChecking(false);
      }
    }
    void checkExistingSession();
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      const supabase = createClient();
      const { error: signInError } = await withAdminTimeout(() => supabase.auth.signInWithPassword({
        email,
        password,
      }), 15000);

      if (signInError) {
        setError(INVALID_CREDENTIALS);
        return;
      }

      const { data: isAdmin, error: accessError } = await withAdminTimeout(() => supabase.rpc(
        "is_fis_admin",
      ));

      if (accessError || !isAdmin) {
        await withAdminTimeout(() => supabase.auth.signOut());
        setError("This account does not have FIS administrator access.");
        return;
      }

      window.location.replace(getReturnPath());
    } catch {
      setError("Unable to sign in right now. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {error ? <p className="admin-auth-error" role="alert">{error}</p> : null}
      <button className="admin-submit" type="submit" disabled={submitting || checking}>
        {checking ? "Checking session..." : submitting ? "Signing in..." : "Submit"}
      </button>
    </form>
  );
}

function getReturnPath() {
  const params = new URLSearchParams(window.location.search);
  return safeAdminReturnPath(params.get("returnTo"));
}
