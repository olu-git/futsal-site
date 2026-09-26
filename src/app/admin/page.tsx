import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Admin" };

const adminSections = ["Dashboard", "Results", "Fixtures", "Teams", "Seasons"];

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: isAdmin, error } = await supabase.rpc("is_fis_admin");
  if (error || !isAdmin) {
    return (
      <section className="admin-auth-page">
        <div className="admin-auth-card">
          <p className="eyebrow">Access denied</p>
          <h1>Administrator access required</h1>
          <p>This signed-in account is not authorised to manage FIS.</p>
          <form action={signOut}>
            <button className="admin-submit" type="submit">Sign out</button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="fis-container admin-shell">
        <aside className="admin-sidebar">
          <div>
            <p className="eyebrow">FIS operations</p>
            <h1>Admin</h1>
          </div>
          <nav aria-label="Admin navigation">
            {adminSections.map((section, index) => (
              <span aria-current={index === 0 ? "page" : undefined} key={section}>
                {section}
              </span>
            ))}
          </nav>
          <form action={signOut}>
            <button type="submit">Sign Out</button>
          </form>
        </aside>
        <div className="admin-workspace">
          <p className="eyebrow">Dashboard</p>
          <h2>Competition management</h2>
          <p>The admin foundation is connected. Management screens will be added next.</p>
          <div className="admin-placeholder-grid">
            {adminSections.slice(1).map((section) => (
              <article key={section}>
                <h3>{section}</h3>
                <p>Coming in the next admin implementation stage.</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
