"use client";
import Link from"next/link";import AdminAuthGuard from"@/components/admin/AdminAuthGuard";import AdminShell from"@/components/admin/AdminShell";
export default function Page(){return <AdminAuthGuard><AdminShell current="Seasons"><div className="admin-data-state"><p className="eyebrow">Seasons</p><h2>Season management</h2><p>Season creation and archiving are planned but are not available in this release.</p><Link className="admin-back-link" href="/admin">Return to dashboard</Link></div></AdminShell></AdminAuthGuard>}
