"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/browser";
import { resolveAdminAccess, type AdminAccess } from "@/lib/admin/auth";

export default function AdminAuthGuard({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<AdminAccess>("loading");

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    async function check() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionError) { setAccess("unavailable"); return; }
      if (!session) { setAccess("unauthenticated"); return; }
      const { data, error } = await supabase.rpc("is_fis_admin");
      if (!active) return;
      const next = resolveAdminAccess(session, data === true, Boolean(error));
      if (next === "denied") await supabase.auth.signOut();
      if (active) setAccess(next);
    }
    void check();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setAccess("unauthenticated");
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") void check();
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  if (access === "loading") return <AdminState title="Checking access" text="Confirming your administrator session..." />;
  if (access === "unauthenticated") return <AdminState title="Sign in required" text="Your session has expired or you are not signed in." action="Go to admin login" onAction={() => {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/admin/login/?returnTo=${encodeURIComponent(returnTo)}`);
  }} />;
  if (access === "denied") return <AdminState title="Access denied" text="This account is not authorised to manage FIS and has been signed out." action="Return to login" onAction={() => window.location.assign("/admin/login/")} />;
  if (access === "unavailable") return <AdminState title="Admin unavailable" text="Supabase could not confirm administrator access. Check your connection and try again." action="Try again" onAction={() => window.location.reload()} />;
  return children;
}

function AdminState({ title, text, action, onAction }: { title: string; text: string; action?: string; onAction?: () => void }) {
  return <section className="admin-auth-page"><div className="admin-auth-card"><p className="eyebrow">FIS admin</p><h1>{title}</h1><p>{text}</p>{action && <button className="admin-submit" onClick={onAction}>{action}</button>}</div></section>;
}
