"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { resolveAdminAccess, withAdminTimeout, type AdminAccess } from "@/lib/admin/auth";

export default function AdminAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [access, setAccess] = useState<AdminAccess>("loading");

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    async function check() {
      try {
        const next = await withAdminTimeout(async () => {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) return "unavailable" as const;
          if (!session) return "unauthenticated" as const;
          const { data, error } = await supabase.rpc("is_fis_admin");
          return resolveAdminAccess(session, data === true, Boolean(error));
        });
        if (!active) return;
        setAccess(next);
        if (next === "denied") void supabase.auth.signOut().catch(() => {});
      } catch { if (active) setAccess("unavailable"); }
    }
    void check();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === "SIGNED_OUT") setAccess(current => current === "denied" ? "denied" : "unauthenticated");
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") void check();
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  if (access === "loading") return <AdminState title="Checking access" text="Confirming your administrator session..." />;
  if (access === "unauthenticated") return <AdminState title="Sign in required" text="Your session has expired or you are not signed in." action="Go to admin login" onAction={() => {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    router.push(`/admin/login/?returnTo=${encodeURIComponent(returnTo)}`);
  }} />;
  if (access === "denied") return <AdminState title="Access denied" text="This account is not authorised to manage FIS." action="Return to login" onAction={() => router.push("/admin/login/")} />;
  if (access === "unavailable") return <AdminState title="Admin unavailable" text="Supabase could not confirm administrator access. Check your connection and try again." action="Try again" onAction={() => window.location.reload()} />;
  return children;
}

function AdminState({ title, text, action, onAction }: { title: string; text: string; action?: string; onAction?: () => void }) {
  return <section className="admin-auth-page"><div className="admin-auth-card"><p className="eyebrow">FIS admin</p><h1>{title}</h1><p>{text}</p>{action && <button className="admin-submit" onClick={onAction}>{action}</button>}</div></section>;
}
