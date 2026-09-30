"use client";

import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

const adminSections = [{label:"Results",href:"/admin/results"},{label:"Fixtures",href:"/admin/fixtures"},{label:"Teams",href:"/admin/teams"},{label:"Standings",href:"/admin/standings"},{label:"Seasons",href:"/admin/seasons"}];

export default function AdminPage() {
  return (
    <AdminAuthGuard><AdminShell current="Dashboard">
          <p className="eyebrow">Dashboard</p>
          <h2>Competition management</h2>
          <p>The admin foundation is connected. Management screens will be added next.</p>
          <div className="admin-placeholder-grid">
            {adminSections.map((section) => (
              <article key={section.label}>
                <h3>{section.label}</h3>
                <Link href={section.href}>Open {section.label}</Link>
              </article>
            ))}
          </div>
    </AdminShell></AdminAuthGuard>
  );
}
