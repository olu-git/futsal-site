"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

const adminSections = ["Results", "Fixtures", "Teams", "Seasons"];

export default function AdminPage() {
  return (
    <AdminAuthGuard><AdminShell current="Dashboard">
          <p className="eyebrow">Dashboard</p>
          <h2>Competition management</h2>
          <p>The admin foundation is connected. Management screens will be added next.</p>
          <div className="admin-placeholder-grid">
            {adminSections.map((section) => (
              <article key={section}>
                <h3>{section}</h3>
                <p>Coming in the next admin implementation stage.</p>
              </article>
            ))}
          </div>
    </AdminShell></AdminAuthGuard>
  );
}
