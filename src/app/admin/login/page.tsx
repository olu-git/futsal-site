import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin Login" };

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: isAdmin } = await supabase.rpc("is_fis_admin");
    if (isAdmin) redirect("/admin");
  }

  return (
    <section className="admin-auth-page">
      <div className="admin-auth-card">
        <p className="eyebrow">Restricted access</p>
        <h1>FIS Admin</h1>
        <p>Sign in with your authorised administrator account.</p>
        <LoginForm />
      </div>
    </section>
  );
}
