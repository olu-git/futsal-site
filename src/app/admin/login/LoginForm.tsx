"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const INVALID_CREDENTIALS = "The email or password is incorrect.";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(INVALID_CREDENTIALS);
        return;
      }

      const { data: isAdmin, error: accessError } = await supabase.rpc(
        "is_fis_admin",
      );

      if (accessError || !isAdmin) {
        await supabase.auth.signOut();
        setError("This account does not have FIS administrator access.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Check the local Supabase configuration.");
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
      <button className="admin-submit" type="submit" disabled={submitting}>
        {submitting ? "Signing in..." : "Submit"}
      </button>
    </form>
  );
}
