"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { getAdminRegularSeasonFixtures, type AdminFixture } from "@/lib/admin/results-data";
import ResultsManager from "./ResultsManager";

export default function AdminResultsPage() {
  return <AdminAuthGuard><AdminShell current="Results"><ResultsData /></AdminShell></AdminAuthGuard>;
}

function ResultsData() {
  const [fixtures, setFixtures] = useState<AdminFixture[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setState("loading"); setError("");
    try { setFixtures(await getAdminRegularSeasonFixtures()); setState("ready"); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load competition data."); setState("error"); }
  }, []);
  const refresh = useCallback(async () => {
    setFixtures(await getAdminRegularSeasonFixtures());
  }, []);
  useEffect(() => {
    let active = true;
    void getAdminRegularSeasonFixtures().then((data) => {
      if (active) { setFixtures(data); setState("ready"); }
    }).catch((caught: unknown) => {
      if (active) { setError(caught instanceof Error ? caught.message : "Unable to load competition data."); setState("error"); }
    });
    return () => { active = false; };
  }, []);
  if (state === "loading") return <div className="admin-data-state"><p className="eyebrow">Results</p><h2>Loading competition data</h2><p>Retrieving the current regular season...</p></div>;
  if (state === "error") return <div className="admin-data-state"><p className="eyebrow">Results unavailable</p><h2>Unable to load results</h2><p>{error}</p><button className="admin-submit" onClick={() => void load()}>Try Again</button></div>;
  return <ResultsManager fixtures={fixtures} onChanged={refresh} />;
}
